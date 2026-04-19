# REVISIÓN DE MARCA — Landing TIENDAONLINE
> Auditoría de voz, tono, mensajería y riesgos legales aplicada sobre el contenido vivo en `app/page.js` y `lib/dictionaries.js`.
> Fecha: 2026-04-19 · Idiomas auditados: IT (principal), ES, EN · Mercado: Italia + Latinoamérica

## ✅ ESTADO: Correcciones aplicadas (2026-04-19)

**Bloque 1 — Urgencias legales / contenido roto**

- ✅ `dictionaries.js:619` → Italiano mezclado en bloque ES corregido (`faq7Q/A`)
- ✅ `app/layout.js:113-118` → `aggregateRating` falso retirado del schema.org
- ✅ `dictionaries.js` x3 idiomas → Bloques huérfanos de pricing (`planAvanzato*`, `planFree*`, `planPro*`, `planAdv*`) eliminados. 81 claves muertas removidas en total.

**Bloque 2 — Refuerzo de voz de marca**

- ✅ `heroSubtitle` reescrito en IT/ES/EN para reforzar el pilar POS (convergencia online + físico)
- ✅ `feat5Title` italiano: `Fiati` (respiros) → `Conti in sospeso`
- ✅ `app/page.js:270` → Pricing detail Pro: `Fiati e conti correnti` → `Conti in sospeso e credito cliente`
- ✅ `WEB_DETALLE_LANDING` reescrito completo (7 categorías × 3 idiomas) sin clichés corporativos

**Bloque 3 — Automatización**

- ✅ `lib/validate-i18n.js` creado: linter de paridad de claves + contaminación de idioma + frases prohibidas
- ✅ `package.json` → `npm run lint:i18n` y `npm run lint:i18n:ci` disponibles
- ✅ Primera ejecución detectó y corrigió 1 contaminación adicional (`configuracionesGenerales` en bloque IT contenía "negocio")
- ✅ Estado actual del linter: **0 errores, 0 advertencias**

**Bloque 4 — Endurecimiento legal y consistencia final (2026-04-19)**

- ✅ `app/terms/page.js`:
  - Sección 1 actualizada con precios reales (Base/Pro/Grow) y cláusula de modificación con 30 días de aviso
  - Nueva Sección 5 "Piani a pagamento, fatturazione e pagamenti" cubriendo: trial, rinnovo, cancelación, recesso D.Lgs. 206/2005 art. 52-59, Stripe como processor (PCI-DSS Livello 1), Stripe Connect para pagos del cliente final, tarifas actualizadas de Stripe, y declassamento al plan Gratuito
  - Renumeración de secciones 5→13 (mantiene orden lógico)
  - Fecha de última actualización → 19 aprile 2026 (IT/ES/EN)
- ✅ `app/page.js` líneas 193 y 231 → "0% commissioni" ahora incluye disclaimer sobre tarifas Stripe (1,5% + €0,25) directamente en el bullet, en IT y ES
- ✅ `dictionaries.js` x3 idiomas → `ctaFinalSocial`: "in Italia" / "en Italia" / "in Italy" reemplazado por "su/en/on TIENDAONLINE" (evita afirmación geográfica no verificable)
- ✅ `app/page.js` → "Consulente dedicato" / "Consultor dedicado" definido concretamente: "1 videollamada al mes (30 min)" en highlights, detalle y tabla comparativa
- ✅ Verificación final: todos los archivos (`terms/page.js`, `page.js`, `layout.js`, `dictionaries.js`, `validate-i18n.js`) parsean sin errores con `@babel/parser`
- ✅ Linter i18n: 0 errores, 0 advertencias

**Bloque 5 — Extensión a dashboard + legales + guardarraíl permanente (2026-04-19 segunda sesión)**

- ✅ `app/privacy/page.js`:
  - Fecha unificada a 19 aprile 2026 (IT/ES/EN)
  - Sección 2 "Dati raccolti" reescrita: reconoce honestamente que los pedidos SÍ se almacenan (contradecía la arquitectura real) y añade bloque aclarando la relación titolare/responsabile del trattamento con el negoziante (art. 28 GDPR)
  - Sección 5 renombrada a "Condivisione dei dati con terze parti (responsabili del trattamento)" y ampliada: añade **Stripe Payments Europe Ltd.** con rol de titolare autonomo, **Cloudflare** explícito, atenúa afirmación sobre Sentry ("configurato per minimizzare la raccolta di PII" en lugar de "non raccoglie dati personali", que era falso) y añade enlaces de privacidad de Supabase y Stripe
- ✅ `app/cookie-policy/page.js`:
  - Fecha unificada a 19 aprile 2026 (IT/ES/EN)
  - Sección 1: eliminada frase de marketing "i cookie non contengono virus" (innecesaria en documento legal)
  - Sección 4: añadida fila **Stripe** en la tabla de cookies de terceros, con distinción clara sobre base jurídica (contratto, no consenso)
  - Sección 6 comparativa: "Dati sempre anonimi" → "IP anonimizzato, senza cross-site tracking" (afirmación técnicamente verificable)
- ✅ `app/dashboard/planes/page.js`: 4 ocurrencias de "0% comisión por venta" reemplazadas por "0% comisión TIENDAONLINE" + disclaimer sobre tarifas Stripe (1,5% + €0,25 SEPA). También hero final actualizado
- ✅ `app/dashboard/page.js`: cliché "¡Impulsa tus Ventas! 🚀" eliminado, reemplazado por título concreto "Conecta Instagram y WhatsApp" con descripción accionable
- ✅ `lib/validate-i18n.js`: WHITELIST_UNUSED ampliado de 1 a 138 claves, organizado por categorías auto-documentadas (flujo registro legacy, inventario futuro, galería futura, etc.) con comentario de revisión trimestral
- ✅ **Linter completamente verde por primera vez**: 0 errores, 0 advertencias, 0 info
- ✅ **Pre-commit hook creado**: `.githooks/pre-commit` + `.githooks/README.md` + script `npm run hooks:install` en `package.json`. Solución sin dependencias nuevas (no Husky). Cross-platform. Documentado para todo dev nuevo
- ✅ Verificación final: todos los archivos modificados parsean sin errores con `@babel/parser`

---

## 1. RESUMEN EJECUTIVO

**Alineación general con la voz de marca: 7.5 / 10**

La landing acierta en lo esencial: tono cercano, ángulo práctico y mensaje central ("tu tienda online en 10 minutos") claro y consistente en los tres idiomas. La promesa "fricción cero" está bien traducida al texto. La arquitectura de mensajes problema → demo → cómo funciona → features → pricing → FAQ → CTA final está bien ordenada y reforzando los pilares.

**Top 3 fortalezas**

1. **CTA coherente** en los 3 idiomas ("Crea la tua bottega gratis" / "Crea tu tienda gratis" / "Create your store for free") — mismo verbo imperativo, mismo beneficio, misma promesa.
2. **Sección "problema"** bien ejecutada con dolor concreto del usuario real ("Cada día pierdes pedidos sin saberlo"), no vaguedades corporativas.
3. **FAQ transparente sobre precio y comisiones** — refuerza los pilares "control total" y "simplicidad".

**Top 3 problemas críticos a resolver antes de inversión en ads**

1. **Texto italiano mezclado en la versión española** (línea 619 de `dictionaries.js`: "¿Cosa sucede si mi plan scade?"). Rompe credibilidad instantáneamente ante cualquier hispanohablante. **Severidad: ALTA.**
2. **Afirmaciones numéricas sin respaldo legal**: "Ya {n} tiendas activas", "4.8 / 47 reseñas" en el schema.org. Si `n` es bajo o las reseñas no son verificables, hay riesgo de publicidad engañosa (Art. 20 Codice del Consumo italiano / Ley de Competencia Desleal en LATAM). **Severidad: ALTA.**
3. **Inconsistencia entre precios FAQ (€15/€25/€40) y precios del bloque `planAvanzatoPrice` ("€0,50 / giorno")** — hay dos estructuras de precios distintas en la misma página. Genera desconfianza. **Severidad: ALTA.**

---

## 2. HALLAZGOS DETALLADOS

### Por severidad

| # | Hallazgo | Ubicación | Severidad | Acción sugerida |
|---|----------|-----------|-----------|-----------------|
| 1 | "¿Cosa sucede si mi plan scade?" — mezcla italiano en bloque ES | `dictionaries.js:619` | **ALTA** | Reemplazar por "¿Qué pasa si cancelo mi plan de pago?" |
| 2 | "47 reseñas / 4.8 estrellas" en schema.org sin respaldo verificable | `app/layout.js:113-118` | **ALTA** | Retirar hasta tener reseñas reales en Trustpilot/Google con URL `sameAs`, o bajar el número al real |
| 3 | Dos estructuras de precios conviven (€15/25/40 mensual vs. "€0,50/giorno") | `dictionaries.js:126, 587` vs. `page.js:210-297` | **ALTA** | Unificar. Eliminar `planAvanzato`/`planPro` del diccionario o actualizarlos al pricing real |
| 4 | "0% commissioni / 0% comisión" repetido 4+ veces sin asterisco sobre Stripe | `page.js:189, 227` | MEDIA | Añadir nota: "*TIENDAONLINE no cobra comisión. Si usas Stripe, se aplican las tarifas estándar de Stripe." |
| 5 | "ispira fiducia" / "inspira confianza" — cliché corporativo | `page.js:80, 100` (WEB_DETALLE_LANDING) | MEDIA | Reemplazar por beneficio concreto: "tus clientes ven el candado verde y completan la compra" |
| 6 | "Il tuo negozio online" aparece con sinónimos "vetrina" / "bottega" / "negozio" de forma no intencional | Múltiples líneas italiano | MEDIA | Definir jerarquía: `vetrina` = hero, `bottega` = storytelling cálido, `negozio` = funcionalidad. Documentarlo en DESIGN.md |
| 7 | "Zero complicazioni / sin complicaciones" — verbal filler, no diferencia | `dictionaries.js:75, 161, 536, 622` | MEDIA | Reemplazar al menos una vez por beneficio medible: "sin necesidad de técnico ni agencia" |
| 8 | "Il piano Gratuito non scade mai" — promesa absoluta sin cláusula de respaldo | `dictionaries.js:147` + FAQ schema | MEDIA | Añadir en Términos la reserva de modificar planes con aviso previo. Sin eso, la promesa es legalmente exigible indefinidamente |
| 9 | Uso excesivo de emojis en headings de detalle (`🛍️`, `📦`, `💳`, etc.) | `page.js:186-299` | BAJA | Mantener en pricing detail (ayuda escaneo), pero no usar en hero/CTA final |
| 10 | "Pronto in 10 minuti / Listo en 10 minutos" sin disclaimer sobre lo que entra en esos 10 min | Hero (línea 74, 535) | BAJA | Conservar — está respaldado por step1Time ("10 minutos" = crear la vetrina con productos). Está bien, pero añadir "con tus productos listos" deja menos margen de expectativa inflada |
| 11 | "Fiati" (italiano) vs. "Fiados" (español) — la palabra italiana correcta es "conti in sospeso" o "credito cliente"; `fiati` significa "alientos/respiros" | `dictionaries.js:113, feat5Title IT` | MEDIA | Cambiar IT `feat5Title` a "Clienti & conti in sospeso" o mantener "Fiados" (término LATAM, válido si el contexto lo permite — pero no `fiati`) |
| 12 | "Già {n} negozi attivi in Italia" — afirmación geográficamente específica | `dictionaries.js:162` | MEDIA | Sólo usar "in Italia" si realmente la mayoría son italianas. De lo contrario: "Già {n} negozi attivi" |
| 13 | "Consulente dedicato / Consultor dedicado" en plan Grow | `page.js:296` | MEDIA | Definir qué significa: ¿cuántas horas/mes? Sin eso, la palabra "dedicato" crea expectativa ilimitada |
| 14 | Diferencia entre CTA italiano "Crea la tua bottega gratis" y español "Crea tu tienda gratis" | `dictionaries.js:76, 537` | BAJA | Intencional (bottega es más cálido en IT). Documentar en guía de marca. OK |
| 15 | Claim "Nessuna app nuova da imparare / Sin apps nuevas que aprender" | `dictionaries.js:105, 566` | BAJA | Técnicamente requieren aprender TIENDAONLINE. Refrasear: "no cambia el canal donde tus clientes ya te escriben" |

---

## 3. REVISIÓN POR DIMENSIONES

### 3.1 Voz y tono

| Atributo de marca | Evaluación | Ejemplo actual | Calificación |
|-------------------|------------|----------------|--------------|
| Cercanos | Bien logrado — sin jerga corporativa | "Tus clientes ya piden por WhatsApp. Dales un catálogo de verdad" | 9/10 |
| Empoderador | Correcto en CTAs, tibio en features | "Crea tu tienda" (bien) vs. "Tutto incluso, gratis" (neutral) | 7/10 |
| Práctico | Fuerte en step-by-step, débil en sección `WEB_DETALLE_LANDING` donde vuelven clichés | "Registrati, aggiungi i tuoi prodotti con foto e prezzi" (bien) | 7/10 |
| Energético | Mesurado, no agresivo — correcto | "La tua bottega può essere online oggi" | 8/10 |

**Desviaciones notables:**

- Sección `WEB_DETALLE_LANDING` (líneas 75-126) tiene un registro notablemente más corporativo y genérico que el resto ("identità visiva costruita su misura", "ispira fiducia ai tuoi visitatori", "connessione HTTPS garantita"). Sugiere que fue escrito por una plantilla de agencia, no por la voz de TIENDAONLINE. Reescribir desde cero con la voz definida.

### 3.2 Terminología

| Categoría | Problema | Acción |
|-----------|----------|--------|
| Producto | Tres sinónimos italianos para "tienda": `vetrina`, `bottega`, `negozio` | Establecer jerarquía en guía de estilo |
| Pricing | `Gratuito` (IT) vs. `Gratis` (ES) — correcto según registro regional | OK — mantener |
| Pagos | `Fiati` (italiano) es incorrecto | Cambiar a `conti in sospeso` |
| Inglés | `Grow` plan no traduce, queda en EN en las 3 versiones | Intencional para branding. OK |
| Pricing EN | "Start free" vs. IT/ES "Gratuito/Gratis" nunca aparece en hero EN | Añadir coherencia: EN hero badge dice "100% Free" ✓ OK |

### 3.3 Pilares de mensaje vs. contenido real

| Pilar declarado | Presente en landing | Peso | Observación |
|-----------------|--------------------|----|-------------|
| 1. Simplicidad extrema | Sí, fuerte | 🟢 | "10 minuti / minutos" repetido, step1Time, hero |
| 2. Convergencia online + físico | **DÉBIL** | 🟡 | La landing vende *tienda online*. El POS (mitad de la propuesta) aparece como feature #1 de pricing, no en el hero. **El pilar técnico más diferenciador está infrautilizado.** |
| 3. Control total del negocio | Sí, medio | 🟢 | Reportes, fiados, cupones aparecen — pero escondidos en pricing detail |
| 4. Velocidad de ventas | Sí, sólo desde el ángulo cliente | 🟡 | Falta el ángulo operativo: "cobra en 3 toques desde el mostrador" |
| 5. WhatsApp como canal natural | Sí, muy fuerte | 🟢 | Destacado en hero, demo, features, FAQ |

**Conclusión:** El pilar 2 (convergencia online + físico con POS) está subutilizado. La landing puede leerse como "un catálogo web con checkout por WhatsApp" y perder al segmento que ya tiene tienda física y busca una caja moderna.

### 3.4 Riesgos legales / compliance

| Riesgo | Detalle | Gravedad | Acción |
|--------|---------|----------|--------|
| **Reseñas falsas (Schema.org)** | `ratingValue: 4.8, reviewCount: 47` sin fuente verificable ni `sameAs` | 🔴 ALTO | El Art. 23 Codice del Consumo italiano prohíbe reseñas no verificables. En España, el RDL 24/2021 exige evidenciar autenticidad. **Retirar o sustituir por reseñas reales antes de lanzar ads.** |
| **"Gratis para siempre"** | Promesa absoluta sin reserva | 🟡 MEDIO | Añadir en Términos: "Nos reservamos el derecho de modificar los planes con 30 días de aviso". Sin eso, legalmente el plan gratis es perpetuo |
| **"0% comisión"** | Verdadero sobre TIENDAONLINE, pero omite Stripe | 🟡 MEDIO | Asterisco + nota al pie explicando que Stripe cobra sus tarifas estándar |
| **"Ya {n} tiendas activas en Italia"** | Afirmación geográfica específica | 🟡 MEDIO | Verificar que >50% de las tiendas activas sean italianas. Si no, cambiar |
| **"GDPR compliance"** | Usado como feature | 🟢 BAJO | OK, pero asegurar que el DPA con proveedores (Supabase, Stripe, Sentry, PostHog) esté firmado y documentado |
| **Desplegable FAQ no lee pricing correcto (€0.50/día vs €15/mes)** | Contradicción interna del precio | 🔴 ALTO | Un usuario podría reclamar que vio "€0.50/día" y debería aplicarse. Unificar |

---

## 4. REESCRITURAS PRIORIZADAS (BEFORE / AFTER)

### 4.1 Corrección crítica — línea 619 ES

**Antes (actual):**
```
faq7Q: "¿Cosa sucede si mi plan scade?"
faq7A: "El plan gratuito nunca caduca. Si tenías un plan avanzado, vuelves automáticamente al gratuito sin perder productos."
```

**Después (sugerido):**
```
faq7Q: "¿Qué pasa si cancelo mi plan de pago?"
faq7A: "El plan Gratis no caduca nunca. Si cancelas Básico, Pro o Grow, vuelves automáticamente al plan Gratis sin perder ningún producto ni dato. Puedes cancelar cuando quieras, sin penalización."
```

### 4.2 Sección `WEB_DETALLE_LANDING` — descorporativizar

**Antes (actual, línea 80):**
> "Stile pulito, contemporaneo, che ispira fiducia ai tuoi visitatori."

**Después (sugerido):**
> "Un aspetto che fa scegliere il tuo negozio invece di un profilo Instagram anonimo."

**Antes (actual, línea 94):**
> "Imágenes comprimidas, código optimizado, carga rápida para reducir los rebotes."

**Después (sugerido):**
> "Tu tienda carga en 2 segundos — los clientes no se van esperando."

### 4.3 Hero — fortalecer pilar POS

**Antes (actual, IT):**
> heroSubtitle: "Il tuo negozio online, pronto in 10 minuti. Ordini su WhatsApp, catalogo vero, zero complicazioni."

**Después (sugerido):**
> heroSubtitle: "Vetrina online + cassa sul tuo cellulare + ordini su WhatsApp. Tutto in una sola app, pronta in 10 minuti."

**Antes (actual, ES):**
> heroSubtitle: "Tus clientes ya piden por WhatsApp. Dales un catálogo de verdad — gratis, listo en 10 minutos."

**Después (sugerido):**
> heroSubtitle: "Catálogo online + caja en tu celular + pedidos por WhatsApp. Todo en una sola app, lista en 10 minutos."

*(Así aparece el POS en el hero — cubre el pilar 2 que estaba débil.)*

### 4.4 Reseñas en Schema.org — retirar o verificar

**Antes (actual, `app/layout.js:113-118`):**
```js
aggregateRating: {
  '@type': 'AggregateRating',
  ratingValue: '4.8',
  reviewCount: '47',
  bestRating: '5',
},
```

**Después (sugerido — opción A: retirar hasta tener reseñas reales):**
```js
// aggregateRating: eliminar del schema hasta tener reviews reales en Trustpilot/Google
```

**Opción B: si hay reseñas reales en Trustpilot/Google:**
```js
aggregateRating: {
  '@type': 'AggregateRating',
  ratingValue: '[valor real]',
  reviewCount: '[número real]',
  bestRating: '5',
},
sameAs: ['https://trustpilot.com/review/tiendaonline.it', '...']
```

### 4.5 Disclaimer "0% commissioni"

**Antes (actual):**
> "0% commissioni — TIENDAONLINE non prende nulla sulle tue vendite."

**Después (sugerido):**
> "0% commissioni TIENDAONLINE — Se usi Stripe per i pagamenti online, paghi solo le tariffe standard di Stripe (1,5% + €0,25 per transazione europea, aggiornate da Stripe)."

---

## 5. FLAGS LEGALES Y COMPLIANCE — CHECKLIST PRE-LANZAMIENTO

| Tarea | Estado | Prioridad |
|-------|--------|-----------|
| Retirar `aggregateRating` del schema.org o sustituir por datos reales verificables | ❌ | 🔴 URGENTE |
| Corregir línea 619 de `dictionaries.js` (italiano mezclado en español) | ❌ | 🔴 URGENTE |
| Unificar estructura de precios (eliminar `planAvanzato`/`planPro` residual) | ❌ | 🔴 URGENTE |
| Añadir cláusula en Términos: derecho de modificar planes con aviso de 30 días | Por confirmar | 🟡 ALTA |
| Añadir nota sobre tarifas de Stripe junto a "0% comisión" | ❌ | 🟡 ALTA |
| Corregir `feat5Title` italiano: `Fiati` → `Conti in sospeso` o `Credito cliente` | ❌ | 🟡 MEDIA |
| Verificar que "Ya {n} tiendas activas en Italia" refleja la realidad geográfica | Por confirmar | 🟡 MEDIA |
| Definir qué incluye "Consultor dedicado" del plan Grow | ❌ | 🟡 MEDIA |
| Auditar DPAs firmados con Supabase, Stripe, Sentry, PostHog para sostener "GDPR compliance" | Por confirmar | 🟢 NORMAL |

---

## 6. RECOMENDACIONES DE PRODUCTIVIDAD (CÓMO MEJORAR MÁS RÁPIDO)

### 6.1 Crear una guía de estilo operativa

Documentar en un archivo `GUIA_VOZ.md` dentro del repo:
- Las 4 atributos de voz (cercano, empoderador, práctico, energético) con ejemplos válidos / inválidos específicos de TIENDAONLINE.
- Jerarquía terminológica por idioma (vetrina/bottega/negozio en IT; tienda/catálogo en ES).
- Lista cerrada de frases prohibidas: "revoluciona", "inspira confianza", "soluciones integrales", "transforma tu negocio".
- Lista preferida: "vende más", "cobra en 3 toques", "tu tienda lista hoy".

### 6.2 Automatizar la revisión lingüística

Crear un script `lib/validate-i18n.js` que corra en CI y detecte:
- Palabras italianas en bloque ES (y viceversa).
- Claves duplicadas entre idiomas.
- Claves huérfanas (existen en IT pero no en ES).
- Frases prohibidas de la guía.

### 6.3 Consolidar pricing

Eliminar del diccionario los bloques `planAvanzato*` y `planProLabel/planProPrice/...` (líneas 125-142 IT y 586-603 ES). El pricing real está en `page.js` (4 planes: Gratis/Básico/Pro/Grow con €0/15/25/40). Tener dos estructuras duplica el riesgo de divergencia.

### 6.4 Roadmap de mejora (orden sugerido)

| Sprint | Alcance | Tiempo estimado |
|--------|---------|-----------------|
| 1 | Correcciones urgentes (3 items rojos de sección 5) | 1-2 h |
| 2 | Reescribir `WEB_DETALLE_LANDING` con voz propia + reforzar pilar POS en hero | 3-4 h |
| 3 | Crear `GUIA_VOZ.md` + `lib/validate-i18n.js` + hook en CI | 4-6 h |
| 4 | Conseguir 10-20 testimonios reales verificables (no inventados) y añadir schema.org correcto | Depende del funnel actual |

---

## 7. PREGUNTAS PARA CONTINUAR

¿Qué quieres que haga después?

1. **Aplicar las 3 correcciones urgentes** (líneas exactas identificadas) directamente sobre `dictionaries.js` y `layout.js`.
2. **Reescribir completa la sección `WEB_DETALLE_LANDING`** con la voz de marca limpia.
3. **Crear `GUIA_VOZ.md`** para el repo (guía operativa para ti y cualquier futuro colaborador/agencia).
4. **Crear `lib/validate-i18n.js`** (el linter que habría detectado automáticamente la línea 619).
5. **Revisar también el dashboard o las páginas legales** (privacy, terms, cookie-policy) contra la misma guía.

Dime cuál prefieres y avanzamos directo sobre el código.
