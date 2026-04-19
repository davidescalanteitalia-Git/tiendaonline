#!/usr/bin/env node
/**
 * Linter de diccionarios i18n + voz de marca TIENDAONLINE
 * ------------------------------------------------------------------
 * Detecta:
 *   1. Contaminación de idioma (palabras IT/ES/EN dentro del bloque que no les corresponde)
 *   2. Paridad de claves (keys presentes en un idioma pero ausentes en otro)
 *   3. Claves no usadas en el código (`app/` + `components/`)
 *   4. Frases prohibidas por la guía de marca (ver REVISION_MARCA.md)
 *
 * Uso:
 *   node lib/validate-i18n.js              # reporte legible
 *   node lib/validate-i18n.js --ci         # exit code 1 si hay errores (CI/pre-commit)
 *   node lib/validate-i18n.js --strict     # incluye WARN como error
 *
 * Requiere: Node 18+. Sin dependencias externas.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const { DICTIONARY } = require('./dictionaries.js')

// ── Configuración ────────────────────────────────────────────────────────────
const CI = process.argv.includes('--ci')
const STRICT = process.argv.includes('--strict')
const VERBOSE = process.argv.includes('--verbose')

// Palabras marcadoras exclusivas de cada idioma.
// Si aparecen dentro de un bloque que no es el suyo = contaminación.
const MARKERS = {
  it: [
    /\bcosa\s+succede\b/i, /\bscade\b/i, /\bscadenza\b/i, /\bgiorno\b/i, /\bgiorni\b/i,
    /\bnegozio\b/i, /\bnegozi\b/i, /\bvetrina\b/i, /\bbottega\b/i,
    /\bsenza\b/i, /\bgratis\s+per\s+sempre\b/i, /\bnessun[aoi]?\b/i,
    /\bprodott[oi]\b/i, /\bordin[ei]\b/i, /\bsubito\b/i,
    /\bpronto\b/i, /\bpronta\b/i, /\bsei\b/i, /\bpoi\b/i, /\btuo\b/i, /\btua\b/i, /\bcresci\b/i,
    /\bgià\b/i, /\btieni\b/i, /\bcollega\b/i, /\btariffe\b/i,
  ],
  es: [
    /\b¿[^?]+\?/, /\bpasa\b/i, /\bahora\b/i, /\baquí\b/i, /\búnete\b/i,
    /\btienda[s]?\b/i, /\bcliente[s]?\s+compran\b/i, /\bempieza\b/i,
    /\bcaduca\b/i, /\bcancel(ar|as|a)\b/i, /\bestás\b/i,
    /\bsiempre\b/i, /\bmuchos\b/i, /\bgracias\b/i, /\bnegocio[s]?\b/i,
    /\btú\b/i, /\bcrea\s+tu\b/i, /\bpedido[s]?\b/i, /\bdías?\b/i,
    /\bgratuito\s+no\s+caduca\b/i, /\bpenalización\b/i,
  ],
  en: [
    /\byou['’]re\b/i, /\bdoesn['’]t\b/i, /\bwon['’]t\b/i, /\bcan['’]t\b/i,
    /\balready\b/i, /\bfree\s+forever\b/i, /\bready\s+in\b/i, /\bstart\s+free\b/i,
    /\bshop\b/i, /\bshops\b/i, /\bcustomers?\s+order\b/i, /\bmonth\b/i, /\bdays?\b/i,
    /\bcheck\s+out\b/i, /\beverything\b/i,
  ],
}

// Frases prohibidas por la guía de voz (REVISION_MARCA.md §6.1)
const BANNED_PHRASES = [
  { pattern: /\bispira\s+fiducia\b/i, reason: 'Cliché corporativo IT. Usa un beneficio concreto.' },
  { pattern: /\binspira\s+confianza\b/i, reason: 'Cliché corporativo ES. Usa un beneficio concreto.' },
  { pattern: /\bbuilds?\s+trust\b/i, reason: 'Corporate cliché EN. Use a concrete benefit.' },
  { pattern: /\brevoluciona\b/i, reason: 'Verbo agresivo. Fuera de la voz de TIENDAONLINE.' },
  { pattern: /\brivoluziona\b/i, reason: 'Verbo agresivo. Fuera de la voz de TIENDAONLINE.' },
  { pattern: /\brevolution(ize|ise)?\b/i, reason: 'Aggressive verb. Off-brand.' },
  { pattern: /\bsoluci(one|ones)\s+integrales?\b/i, reason: 'Jerga corporativa.' },
  { pattern: /\bsoluzion[ei]\s+integr[ae]l[ei]\b/i, reason: 'Gergo aziendale.' },
  { pattern: /\btransforma\s+tu\s+negocio\b/i, reason: 'Cliché vacío. Mejor prometer algo medible.' },
  { pattern: /\btrasforma\s+la\s+tua\s+attività\b/i, reason: 'Cliché vuoto.' },
  { pattern: /\bFiati\b/, reason: '`Fiati` en italiano = "respiros". Usa "conti in sospeso" o "credito cliente".' },
]

// Claves que sabemos que son válidas aunque no aparezcan directamente con `t('key')` (ej. interpolación)
// o que se conservan deliberadamente para features planificadas.
// Revisar esta lista cada 3-6 meses: si una clave sigue aquí y no ha aparecido la feature, puede eliminarse.
const WHITELIST_UNUSED = new Set([
  // ── Navegación / marca (usadas dinámicamente o reservadas) ────────────────
  'home', 'prodotti', 'ordini', 'bienvenido', 'tiendaOnline', 'derechosReservados',
  'bannerText', 'demoCta', 'ctaFinalSocial', 'limpiarFiltrosTxt',

  // ── Flujo de registro legacy (reemplazado pero conservamos traducciones) ──
  'apriBottega', 'creaLaTuaBottega', 'iniziaAVendere', 'creaNegozioBtn',
  'nomeNegozioLabel', 'placeholderEjemploNegozio', 'placeholderSubdominio',
  'sottodominioUnico', 'whatsappPlaceholder', 'clientiInvianoOrdini',
  'vaiAlLogin', 'haiGiaAccount', 'creandoBottega', 'caricandoNegozi',
  'sottodominioPreso', 'whatsappPreso', 'emailPresa', 'erroreInaspettato',
  'minimo6Caratteri', 'passwordTroppoCorta', 'passwordMedia', 'passwordForte',
  'erroreValidazioneNome', 'erroreValidazioneSub', 'erroreValidazioneSubCorto',
  'erroreValidazioneWhatsapp', 'erroreValidazioneWhatsappFormato',
  'erroreValidazioneEmail', 'erroreValidazioneEmailFormato',
  'erroreValidazionePass', 'erroreValidazionePassCorto',

  // ── Tabs de ejemplo del landing (features planeadas) ──────────────────────
  'tabPanetteria', 'tabFruttivendolo', 'tabBar', 'tabNegozioLocale',

  // ── Dashboard: sección resumen/overview (usadas dinámicamente) ────────────
  'resumenGeneral', 'visitasHoy', 'pedidosNuevos', 'productosActivos',
  'proximosPasos', 'creatuCuenta', 'cuentaRegistrada',

  // ── Onboarding / primeros pasos ───────────────────────────────────────────
  'añadePrimerProducto', 'añadePrimerProductoDesc', 'nuevoProducto',
  'comparteTienda', 'comparteTiendaDesc', 'enviarMensaje', 'ordenarEnMiTienda',
  'gestionaCatalogo', 'añadirProducto', 'buscarProductos',

  // ── Catálogo / producto (campos reservados para editor futuro) ────────────
  'producto', 'productoNuevo', 'seleccionaProducto', 'nombreProducto',
  'descripcionProducto', 'precioProducto', 'emojiProducto', 'categoriaProducto',
  'estado', 'acciones', 'sinProductos', 'sinProductosDesc', 'estadoActivo',
  'estadoPausado', 'eliminar', 'confirmarEliminarDesc', 'completaDetalles',
  'costoProducto', 'crearProductoYCompra', 'codigoBarras',

  // ── Inventario / stock (módulo futuro) ────────────────────────────────────
  'stock', 'cantidad', 'costo', 'fechaVencimiento', 'stockBasso', 'inventario',
  'sinStock', 'añadirStock', 'articulosRegistrados', 'cantidadComprada',
  'exportar',

  // ── Galería de fotos del producto (módulo futuro) ─────────────────────────
  'fotos', 'galeria', 'camara', 'fotoProducto', 'fotoBanner', 'cambiarFoto',

  // ── Pedidos / flujo de venta ──────────────────────────────────────────────
  'cliente', 'clienti', 'vendedor', 'items', 'valor', 'obs', 'fecha',
  'buscarPedido', 'nPedido', 'sinPedidos', 'sinPedidosDesc',
  'pedidosHoy', 'pedidosPendientes', 'pedidosRealizados', 'pedidosCancelados',
  'totalPedidos', 'confirmaPedido', 'cancelaPedido', 'visualizaYProcesa',

  // ── Checkout del comprador (variante planeada) ────────────────────────────
  'nombreCliente', 'dinosTuNombre', 'introducirNombreDesc', 'continuarWA',

  // ── Diseño / personalización de tienda ────────────────────────────────────
  'previsualizar', 'coloresMarca', 'cambiarColores', 'tipografia',
  'estiloModerno', 'estiloElegante', 'copiarEnlace', 'catalogoNuevo',
  'catalogoClasico',

  // ── Ajustes de tienda ─────────────────────────────────────────────────────
  'datosTienda', 'canalesVenta', 'costoEnvio', 'tuCuenta', 'notificaciones',
  'privacidadLegal', 'perfilDeLaTienda',
])

// ── Utilidades ───────────────────────────────────────────────────────────────
const COLORS = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
}

const issues = { errors: [], warnings: [], info: [] }

function report(level, msg, detail) {
  const bucket = level === 'info' ? 'info' : level + 's'
  issues[bucket].push({ msg, detail })
}

// ── Check 1 — Paridad de claves entre idiomas ────────────────────────────────
function checkKeyParity() {
  const langs = Object.keys(DICTIONARY)
  const allKeys = new Set()
  langs.forEach((lang) => Object.keys(DICTIONARY[lang]).forEach((k) => allKeys.add(k)))

  const missing = {}
  for (const lang of langs) {
    const langKeys = new Set(Object.keys(DICTIONARY[lang]))
    for (const k of allKeys) {
      if (!langKeys.has(k)) {
        if (!missing[lang]) missing[lang] = []
        missing[lang].push(k)
      }
    }
  }

  for (const [lang, keys] of Object.entries(missing)) {
    if (keys.length > 0) {
      report('error', `Claves faltantes en idioma [${lang}]`, keys.slice(0, 10).join(', ') + (keys.length > 10 ? `, +${keys.length - 10} más` : ''))
    }
  }
}

// ── Check 2 — Contaminación de idioma ────────────────────────────────────────
function checkLanguageContamination() {
  for (const lang of Object.keys(DICTIONARY)) {
    // Para cada idioma, chequeamos que los marcadores de OTROS idiomas no aparezcan
    const foreignMarkers = Object.entries(MARKERS)
      .filter(([l]) => l !== lang)
      .flatMap(([l, patterns]) => patterns.map((p) => ({ lang: l, pattern: p })))

    for (const [key, value] of Object.entries(DICTIONARY[lang])) {
      if (typeof value !== 'string') continue
      for (const { lang: foreignLang, pattern } of foreignMarkers) {
        if (pattern.test(value)) {
          // Filtro: si el idioma extranjero es EN y el texto contiene "WhatsApp", "TIENDAONLINE", "GDPR", "POS" etc. → ignorar
          // (son anglicismos aceptados en IT/ES)
          if (foreignLang === 'en' && /\b(WhatsApp|TIENDAONLINE|GDPR|POS|CRM|CSV|PDF|SSL|SEO|UI|UX|HTTPS|Stripe|Google|Instagram|Facebook|TikTok|QR|MB|GB)\b/.test(value)) {
            // Re-check excluyendo términos de marca
            const cleaned = value.replace(/\b(WhatsApp|TIENDAONLINE|GDPR|POS|CRM|CSV|PDF|SSL|SEO|UI|UX|HTTPS|Stripe|Google|Instagram|Facebook|TikTok|QR|MB|GB)\b/g, '')
            if (!pattern.test(cleaned)) continue
          }
          report(
            'error',
            `Contaminación de idioma en [${lang}] → clave "${key}"`,
            `Marcador de idioma "${foreignLang}" detectado: ${pattern}. Valor: "${value.slice(0, 120)}${value.length > 120 ? '…' : ''}"`
          )
          break // un match por clave es suficiente
        }
      }
    }
  }
}

// ── Check 3 — Frases prohibidas ──────────────────────────────────────────────
function checkBannedPhrases() {
  for (const lang of Object.keys(DICTIONARY)) {
    for (const [key, value] of Object.entries(DICTIONARY[lang])) {
      if (typeof value !== 'string') continue
      for (const { pattern, reason } of BANNED_PHRASES) {
        if (pattern.test(value)) {
          report(
            'warning',
            `Frase prohibida en [${lang}] → clave "${key}"`,
            `${reason} Valor: "${value.slice(0, 120)}${value.length > 120 ? '…' : ''}"`
          )
        }
      }
    }
  }
}

// ── Check 4 — Claves huérfanas (no usadas en el código) ─────────────────────
function findCodeFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'scratch', 'public'].includes(entry.name)) continue
      findCodeFiles(full, out)
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name) && entry.name !== 'dictionaries.js' && entry.name !== 'validate-i18n.js') {
      out.push(full)
    }
  }
  return out
}

function checkUnusedKeys() {
  const codeFiles = findCodeFiles(ROOT)
  let bigCorpus = ''
  for (const f of codeFiles) {
    try { bigCorpus += '\n' + fs.readFileSync(f, 'utf8') } catch {}
  }

  // Usamos el set de claves del italiano (es el más completo por convención)
  const keys = Object.keys(DICTIONARY.it)
  const unused = []
  for (const k of keys) {
    if (WHITELIST_UNUSED.has(k)) continue
    // Buscamos `t('key')`, `t("key")`, `dict.key`, `dict['key']`, `dict["key"]`
    const patterns = [
      new RegExp(`\\bt\\(['"\`]${k}['"\`]\\)`),
      new RegExp(`\\bdict\\.${k}\\b`),
      new RegExp(`\\bdict\\[['"\`]${k}['"\`]\\]`),
    ]
    if (!patterns.some((p) => p.test(bigCorpus))) {
      unused.push(k)
    }
  }

  if (unused.length > 0) {
    report(
      'info',
      `Claves del diccionario no referenciadas en el código (${unused.length})`,
      VERBOSE ? unused.join(', ') : unused.slice(0, 15).join(', ') + (unused.length > 15 ? `, +${unused.length - 15} más (usa --verbose para ver todas)` : '')
    )
  }
}

// ── Ejecución ────────────────────────────────────────────────────────────────
console.log(COLORS.bold('\n🔍 TIENDAONLINE — Linter de i18n + voz de marca\n'))

checkKeyParity()
checkLanguageContamination()
checkBannedPhrases()
checkUnusedKeys()

// Resumen
const { errors, warnings, info } = issues
const hasErrors = errors.length > 0
const hasWarnings = warnings.length > 0

if (errors.length) {
  console.log(COLORS.bold(COLORS.red(`\n❌ ${errors.length} error(es):\n`)))
  errors.forEach((e, i) => {
    console.log(`  ${COLORS.red(`${i + 1}.`)} ${e.msg}`)
    if (e.detail) console.log(`     ${COLORS.gray(e.detail)}`)
  })
}

if (warnings.length) {
  console.log(COLORS.bold(COLORS.yellow(`\n⚠️  ${warnings.length} advertencia(s):\n`)))
  warnings.forEach((w, i) => {
    console.log(`  ${COLORS.yellow(`${i + 1}.`)} ${w.msg}`)
    if (w.detail) console.log(`     ${COLORS.gray(w.detail)}`)
  })
}

if (info.length) {
  console.log(COLORS.bold(`\nℹ️  ${info.length} info:\n`))
  info.forEach((msg, i) => {
    console.log(`  ${i + 1}. ${msg.msg}`)
    if (msg.detail) console.log(`     ${COLORS.gray(msg.detail)}`)
  })
}

if (!hasErrors && !hasWarnings && info.length === 0) {
  console.log(COLORS.bold(COLORS.green('\n✅ Diccionario limpio. Ningún problema detectado.\n')))
}

console.log('')

const exitCode = CI && (hasErrors || (STRICT && hasWarnings)) ? 1 : 0
process.exit(exitCode)
