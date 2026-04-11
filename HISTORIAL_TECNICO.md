# HISTORIAL TÉCNICO - TIENDAONLINE

Este documento centraliza la evolución técnica, auditorías y cambios realizados en la plataforma TIENDAONLINE para asegurar coherencia y escalabilidad.

---

## 📅 11 de Abril 2026 — Rediseño Catálogo Público (Estilo Kyte)

### Archivo modificado: `components/StoreClient.js`

**Objetivo**: Adaptar la página de tienda pública (`/store/[domain]`) al layout de Kyte, añadiendo una sidebar izquierda con información contextual y mejorando la presentación de productos.

**Cambios realizados:**

| Elemento | Antes | Después |
|---|---|---|
| Layout | 1 columna (categ. como tabs top) | 2 columnas: sidebar + contenido principal |
| Sidebar | Solo categorías horizontales | Info tienda + Contacto + Entrega + Categorías |
| Tabs categorías | Siempre visibles (sticky) | Solo en móvil (< 768px), en desktop usa sidebar |
| Tarjetas producto | Grid 2-3-4 col básico | Cards con hover + botón + precio en color primario |
| Vista lista | Card horizontal básica | Nuevo componente `ProductCardList` mejorado |

**Sidebar izquierda — Secciones:**
- **CONÓCENOS**: Logo/emoji, nombre y descripción de la tienda
- **ENTRA EN CONTACTO**: WhatsApp (link directo), Instagram, Email, Dirección
- **ENTREGA**: Retiro / Domicilio según configuración `config.envios`
- **CATEGORÍAS**: Lista vertical, activa en color primario, scroll suave al click

**Comportamiento responsive:**
- `>= 768px`: Sidebar fija de 265px + área principal con tabs ocultos
- `< 768px`: Sidebar oculta + tabs horizontales (comportamiento previo)

**Componentes nuevos:**
- `ProductCard` → kyte-card con hover animation + botón "+" flotante
- `ProductCardList` → fila compacta para modo lista

---

## 🔍 AUDITORÍA TÉCNICA (Abril 2026)

### 1. Arquitectura Base
- **Framework**: Next.js 14 (App Router).
- **Base de Datos**: Supabase (PostgreSQL).
- **Estilos**: Tailwind CSS (Estrategia Pro Max / Glassmorphism).
- **Autenticación**: Supabase Auth (JWT via LocalStorage).
- **Traducciones**: Sistema basado en diccionarios estáticos (`lib/dictionaries.js`).

### 2. Estado de Módulos (Core)
- **Inventario (`/dashboard/compras`)**: 
    - [x] Refactorizado a Pro Max. 
    - [x] Gestión de stock y fotos con compresión automática.
- **Pedidos (`/dashboard/pedidos`)**: 
    - [x] Refactorizado a Pro Max. 
    - [x] Panel lateral (Slide-over) para detalles. 
    - [x] KPIs superiores dinámicos.
- **Ajustes de Tienda (`/dashboard/diseno`)**:
    - [x] Módulo de Pagos (Transferencias/Efectivo).
    - [x] Módulo de Envíos (Zonas con costos dinámicos).
    - [x] Branding (Logo/Banner).
- **Home (`/dashboard/page.js`)**:
    - [x] Centro de Comando Pro Max.
    - [x] Checklist operativo de configuración.
- **Gestión de Productos (`/dashboard/productos`)**:
    - [x] Refactorizado a Pro Max.
    - [x] Vista Dual (Grid/Lista) implementada.
    - [x] Selector de Emojis e Imágenes integrado.
    - [x] Panel lateral de edición (Slide-over).

### 3. Estrategia de Persistencia (Custom)
- **Configuración Operativa**: Se almacena en la tabla `tiendas` columna `config_diseno` (JSONB).
- **Metadata de Pedidos**: Debido a restricciones de esquema, los campos de `metodo_envio`, `metodo_pago` y `whatsapp` se guardan como un ítem especial con ID `ORDER_META` dentro del array `items` de la orden.

---

## 📝 REGISTRO DE CAMBIOS (LOG)

### [2026-04-09] - Fase de Modernización Pro Max
- **Inventario**: Rediseño completo con estética Glassmorphism y mejor flujo de carga de productos.
- **Operativa**: Implementación de lógica de pagos y envíos. Integración en el checkout.
- **Checkout**: Refactorización del flujo de compra a 2 pasos (Datos -> Pago/Envío). Cálculo automático de envío según zona.
- **Órdenes**: Modernización del panel de pedidos. Implementación de Slide-over y captura de WhatsApp del cliente.
- **Home**: Transformación de la página de inicio en un Centro de Comando con checklist de bienvenida.
- **Productos**: Refactorización Pro Max del Panel de Productos. Se añadió vista de galería (Grid) y panel lateral de edición rápida.
- **API**: Actualización de endpoints para soportar metadata operativa sin alterar esquema de DB.
- **Documentación**: Creación del archivo maestro `HISTORIAL_TECNICO.md` y auditoría inicial.

### [2026-04-09] - Auditoría Landing Page + Correcciones Bug Session

**Correcciones aplicadas:**
- **CookieBanner mobile**: Los 3 botones se desbordaban en pantallas ≤480px (necesitaban 346px mínimo, disponibles ~311px). Fix: se añadió media query CSS que apila los botones en columna vertical en móvil. Padding del banner reducido a 16px. `lineHeight` añadido al texto Garante.
- **Banner "en construcción" eliminado**: Eliminado el bloque `BANNER — EN CONSTRUCCIÓN` de `app/page.js`. Era el primer ítem crítico pendiente del checklist del proyecto.
- **Bug links tienda (subdominio)**: Los botones "Ver Tienda" en `dashboard/layout.js`, `dashboard/page.js` y `dashboard/diseno/page.js` usaban `https://${subdominio}.tiendaonline.it` que falla sin DNS wildcard `*.tiendaonline.it` configurado. Fix: los botones de visitar ahora usan `/store/${subdominio}` (ruta interna via middleware). Las funciones `copyLink` mantienen la URL con subdominio para compartir con clientes.

**Checklist Landing (estado actual):**
- [x] Banner "en construcción" eliminado
- [x] Sección Problema añadida
- [x] Sección Pricing añadida
- [x] CTA final añadido
- [x] Footer con links legales (Privacy, Terms, Contacto)
- [x] Selector de idioma en el header
- [x] Demo interactiva (4 tabs)
- [x] FAQ con acordeón (7 preguntas)
- [x] Meta tags OG en layout.js — **pendiente de verificar**
- [ ] /privacy y /terms — verificar que tienen contenido real

---

### [2026-04-10] - Auditoría Supabase + Migraciones de Seguridad y Rendimiento

**Proyecto:** `bripfrfkwahsxtegmils` · Región: `eu-west-2` · Estado: `ACTIVE_HEALTHY`

**Problemas encontrados y resueltos:**

🔴 **ERROR crítico resuelto — RLS en `compras` deshabilitado**
- La tabla `public.compras` estaba completamente expuesta sin Row Level Security.
- Cualquier usuario podía leer/escribir datos de compras de todas las tiendas.
- Fix: `ALTER TABLE compras ENABLE ROW LEVEL SECURITY` + nueva política `Dueño gestiona sus compras`.

🟡 **6 políticas duplicadas eliminadas en `pedidos`**
- `Clientes pueden crear pedidos` era duplicado exacto de `Public can insert orders` → eliminada.
- `Sellers can see their own orders` (SELECT) era redundante con `Dueño gestiona sus pedidos` (ALL) → eliminada.
- `Sellers can update their own orders` (UPDATE) ídem → eliminada.

🟡 **1 política redundante eliminada en `tiendas`**
- `Dueño puede ver su tienda` (SELECT) era redundante con `Dueño puede editar su tienda` (ALL).
- Ambas fusionadas en una sola: `Dueño gestiona su tienda` (ALL).

🟡 **Fix rendimiento RLS — `auth.uid()` → `(select auth.uid())`**
- Afectaba: `tiendas`, `categorias`, `productos`, `pedidos`.
- Sin este fix, Postgres re-evalúa `auth.uid()` en cada fila del resultado → lento a escala.
- Aplicado en todas las políticas que usaban `auth.uid()` directamente.

ℹ️ **5 índices en foreign keys añadidos (PERFORMANCE)**
- `idx_tiendas_user_id`, `idx_categorias_tienda_id`, `idx_productos_tienda_id`, `idx_productos_categoria_id`, `idx_pedidos_tienda_id`.
- Sin estos índices, los JOINs con la tabla `tiendas` hacían full scan.

**Estado final de RLS (todas las tablas protegidas):**
| Tabla | RLS | Políticas |
|-------|-----|-----------|
| tiendas | ✅ | Dueño gestiona su tienda (ALL) |
| categorias | ✅ | Dueño gestiona (ALL) + Lectura pública (SELECT) |
| productos | ✅ | Dueño gestiona (ALL) + Lectura pública activos (SELECT) |
| pedidos | ✅ | Dueño gestiona (ALL) + Public insert (INSERT) |
| compras | ✅ | Dueño gestiona (ALL) ← **nuevo** |

**Pendiente manual (no se puede hacer por SQL):**
- [ ] Activar "Leaked Password Protection" en Supabase → Auth → Attack Protection (requiere SMTP propio configurado primero).

---

### [2026-04-10] - Configuración Resend (Email Transaccional)

**Objetivo:** Configurar proveedor SMTP propio para activar "Leaked Password Protection" en Supabase y enviar emails desde `@tiendaonline.it`.

**Progreso:**
- [x] Cuenta Resend creada (`davidescalanteitalia@gmail.com`).
- [x] API Key generada (guardada en portapapeles — **copiarla a `.env.local` como `RESEND_API_KEY`**).
- [x] Dominio `tiendaonline.it` añadido en Resend (región: Ireland eu-west-1).
- [ ] Registros DNS añadidos en el proveedor del dominio.
- [ ] Dominio verificado en Resend (click "Verify records").
- [ ] SMTP configurado en Supabase → Auth → Sign In/Providers → Email.
- [ ] "Leaked Password Protection" activado en Supabase → Auth → Attack Protection.

**Registros DNS a añadir en el proveedor de `tiendaonline.it`:**

| Tipo | Nombre | Contenido | TTL | Prioridad |
|------|--------|-----------|-----|-----------|
| TXT | `resend._domainkey` | clave DKIM larga — copiar desde Resend → Domains → tiendaonline.it | Auto | — |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | Auto | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Auto | — |

**Configuración SMTP para Supabase (una vez verificado el dominio):**
- Host: `smtp.resend.com`
- Puerto: `465`
- Usuario: `resend`
- Contraseña: API Key de Resend
- Remitente: `noreply@tiendaonline.it`

---

---

### [2026-04-10] - Auditoría y Correcciones Dashboard (Todas las Páginas)

**Referencia visual:** `app/dashboard/diseno/page.js` (estética Pro Max / Glassmorphism).
Revisión completa de todas las páginas del dashboard para unificar funcionalidad y estética.

---

#### 🔴 BUGS CRÍTICOS resueltos

**`pedidos/page.js` — Auth con `localStorage` (roto)**
- `fetchPedidos` y `updateStatus` usaban `localStorage.getItem('supabase_token')` → siempre devuelve `null` porque Supabase JWT no se almacena en localStorage con esa clave.
- Fix: reemplazado por `supabase.auth.getSession()` en ambas funciones.
- También: `Loader2` de lucide-react reemplaza el spinner CSS manual para consistencia.

**`compras/page.js` — Función `handleCreateCat` inexistente (roto)**
- El botón "Guardar" dentro del modal de "nueva categoría" llamaba a `handleCreateCat` que nunca fue definida → error en runtime al crear categorías inline.
- Fix: función `handleCreateCat` implementada correctamente con llamada a `/api/categorias` POST, actualización de estado local y selección automática de la nueva categoría.

---

#### 🟡 INCONSISTENCIAS DE SISTEMA corregidas

**`compras/page.js` — Sistema de idioma diferente al resto**
- Usaba `getDictionary(session?.user?.id)` (función async, resultado guardado en estado local) en lugar del hook `useLang()` + `DICTIONARY[lang]` que usan todas las demás páginas.
- Fix: migrado a `useLang()` + `DICTIONARY[lang]` para sincronización global.
- Además: `CheckCircle2` estaba duplicado como componente SVG manual al final del archivo (conflicto con el import de lucide-react). Eliminado el duplicado.

---

#### 🎨 CORRECCIONES VISUALES (alineación con diseno/page.js)

**`categorias/page.js` — Redesign completo al esquema Pro Max**
- `h1`: `text-3xl font-bold` → `text-4xl font-black` + icono `text-blue-500` + `tracking-tight`
- Cards: `rounded-2xl` → `rounded-[32px]` + padding `p-8`
- Header spacing: `mb-8` → `mb-12`
- Botón CTA principal: `rounded-xl font-medium` → `rounded-2xl font-bold shadow-xl active:scale-95`
- Empty state: `rounded-2xl border-2 dashed` → `rounded-[32px] p-16` + botón Pro Max
- Modal: `rounded-3xl p-8` → `rounded-[40px] p-10` + botón guardar `bg-slate-900`
- Labels: `text-sm font-bold text-slate-700` → `text-xs font-black text-slate-400 uppercase tracking-widest`
- Inputs: `border-slate-200 focus:ring-primary/10 focus:border-primary` → `bg-slate-50 focus:ring-blue-500/10 focus:border-blue-500`
- Spinner: `text-primary` → `text-blue-500`

**`ajustes/page.js` — Mejoras de header y UX**
- `h1`: `text-3xl font-bold` → `text-4xl font-black` + icono `Settings` en `text-blue-500` + gap Pro Max
- `copyLink()`: `alert()` reemplazado por estado `copiedLink` con feedback visual en botón (verde `CheckCircle2` por 2 segundos).
- Nuevo estado `copiedLink` añadido al componente.

---

#### Estado Visual Final del Dashboard

| Página | Visual Consistente | Bugs Funcionales |
|--------|-------------------|-----------------|
| `/dashboard` (Home) | ✅ Pro Max | ✅ OK |
| `/dashboard/productos` | ✅ Pro Max | ✅ OK |
| `/dashboard/compras` | ✅ Pro Max | ✅ Corregido (handleCreateCat + lang) |
| `/dashboard/categorias` | ✅ Pro Max | ✅ OK |
| `/dashboard/pedidos` | ✅ Pro Max | ✅ Corregido (auth localStorage) |
| `/dashboard/ajustes` | ✅ Pro Max | ✅ Corregido (copyLink UX) |
| `/dashboard/diseno` | ✅ Referencia | ✅ OK |

---

---

### [2026-04-11] - Correcciones Landing + UX + Internacionalización

**13 cambios aplicados:**

#### 🏗️ Landing Page (`app/page.js`)
- **Banner "en construcción"** re-añadido (fondo amarillo `#fef3c7`, usa key `bannerText` del diccionario).
- **Pricing — Plan Gratuito**: €0 ampliado a `4.5rem`, card completa clickable con hover lift, añadida nota GDPR explicativa con cifrado/derecho al olvido.
- **Pricing — Plan Avanzato**: Rediseñado de "prossimamente" (gris) a activo (verde, mismo estilo que Plan Gratuito), precio €0.50/giorno, features con ✓ en verde, botón habilitado → `/register`.

#### 📖 Diccionario (`lib/dictionaries.js`)
- `planAdv3`: "Dominio proprio" → "Modifica design e configurazione" (IT/ES/EN).
- `planAvanzatoLabel`: "Prossimamente" → "Piano Avanzato" (IT/ES/EN).
- `planAvanzatoPrice`: "Presto disponibile" → "€0,50 / giorno" (IT/ES/EN).
- `planAvanzatoCta`: "In arrivo" → "Inizia gratis" (IT/ES/EN).
- `faq1A`: Actualizada para mencionar plan base gratuito + plan avanzado + contacto profesional (IT/ES/EN).

#### 🍪 Cookie Banner (`components/CookieBanner.js`)
- **Fix mobile definitivo**: Eliminado el enfoque CSS class + `!important` que fallaba en estilos inline. Reemplazado por estado `isMobile` (JS) con `useEffect` + `resize` listener al breakpoint 520px. Los botones ahora reciben estilos inline correctos según el dispositivo.

#### 🔗 PageShell (`components/PageShell.js`)
- Botón header context-aware via `usePathname()`: muestra "Accedi → /login" en la página `/register`, y "Inizia gratis → /register" en todas las demás.

#### 🔐 Login (`app/login/page.js`)
- Selector de idioma IT/ES/EN añadido en la parte superior del card.
- Sección inferior con links a Privacy Policy, Términos y Contacto.
- Copyright `© 2026 TIENDAONLINE`.

#### 🌍 Páginas estáticas (internacionalización)
- **`app/privacy/page.js`**: Convertida a `'use client'`, eliminado `export const metadata`, título/subtítulo responsivo al idioma, nota para ES/EN indicando que el texto legal vinculante está en italiano.
- **`app/terms/page.js`**: Ídem.
- **`app/cookie-policy/page.js`**: Ídem.
- **`app/contatti/page.js`**: Convertida a `'use client'`, **completamente traducida** (título, subtítulo, cards Email/Teléfono, horarios) en IT/ES/EN.

#### ✅ Verificado
- Dashboard store link ya usa `/store/[subdominio]` (fix de sesión anterior confirmado).

---

### [2026-04-11] - Plan Profesional: Tercer Nivel de Pricing

**Objetivo:** Añadir un tercer plan en la Landing Page orientado a clientes que quieren un e-commerce más personalizado y de mayor nivel, sin tecnicismos de tipo empresarial.

#### 🆕 Cambios aplicados

**`app/page.js` — Nueva tarjeta "Plan Profesional" en Pricing**
- Añadida una tercera tarjeta junto a "Plan Gratuito" y "Plan Avanzado".
- Precio: **"A medida"** (precio personalizado tras contacto).
- Botón **"Contáctanos"** con enlace directo a `/contatti`.
- Diseño diferenciado: borde oscuro (no verde) y botón outline con hover invertido.
- Lista de features: `proFeatures[]` conectado al diccionario global.

**`lib/dictionaries.js` — Features del Plan Profesional actualizadas (IT / ES / EN)**

| Antes (demasiado técnico) | Ahora (práctico y vendible) |
|---|---|
| App nativa iOS/Android | E-commerce con dominio propio |
| Multi-tienda | Diseño personalizado para tu marca |
| Integraciones ERP/POS | Pagos online (tarjeta, PayPal, etc.) |
| Servidor dedicado | Envíos configurados para tu negocio |
| Account manager | Configuración y puesta en marcha incluida |
| Soporte 24/7 | Soporte directo y personalizado |

**`lib/dictionaries.js` — `faq1A` actualizado (IT / ES / EN)**
- El texto de la FAQ "¿Cuánto cuesta?" ahora explica los 3 planes de forma progresiva:
  1. Plan gratuito → siempre gratis.
  2. Plan Avanzado → €0,50/día para crecer.
  3. Plan Profesional → e-commerce a medida, contactar por email.

---

### [2026-04-11] - Fase Operativa: Módulo Punto de Venta (POS)

**Objetivo:** Implementar un sistema de caja rápida (Terminal POS) para ventas físicas en mostrador, emulando la fluidez de herramientas como AppKyte, logrando un control de inventario en tiempo real independiente de los pedidos "online".

#### 🆕 Cambios Aplicados

**`app/dashboard/pos/page.js` — Nueva Interfaz de Caja (POS)**
- Interfaz dividida en dos paneles:
  1. **Catálogo (Izquierda):** Grid de productos estilo tablet con emojis, stock real y filtrado por categorías. Los productos sin stock se inhabilitan automáticamente.
  2. **Ticket (Derecha):** Sumariza los ítems (ajuste +, -), nombre del comprador y cálculo total inmediato.
- Botones rápidos de pago: "Efectivo", "Tarjeta" y "Transferencia".
- Interacción responsiva optimizada para tablets y pantallas táctiles (sin barras de scroll innecesarias).

**`app/api/pos/route.js` — Nuevo endpoint protegido**
- API de consumo interno para ventas físicas.
- Lee el JWT session y cruza la capa de seguridad usando el Admin Role transitorio pero atado a `auth.uid()`.
- Descuenta automáticamente la cantidad `quantity` del stock (`productos`).
- Guarda un nuevo pedido confirmado (`pedidos`), marcándolo con meta-data *POS* en lugar de delivery.

**`app/dashboard/layout.js` — Integración en la Navegación**
- Nuevo ítem `Calculator` ("Caja (POS)") añadido debajo de "Inicio" para acceso rápido permanente.

---

### [2026-04-11] - Fase 3: Operaciones Avanzadas e Inteligencia de Negocio (SaaS)

**Objetivo:** Elevar la plataforma a un SaaS completo con paridad total frente a AppKyte. Integración modular de reportería financiera real, seguimiento de costos y gestión avanzada de cuentas corrientes (fiados).

#### 🆕 Cambios Aplicados

**`app/dashboard/productos/page.js` — Control de Costos y Margen**
- Añadido nuevo campo numérico `costo` (Costo Neto).
- Feedback visual instantáneo para el "Margen de Utilidad (%)" calculado matemáticamente. Reestructuración de la base de datos `productos` añadiendo la columna.

**`app/dashboard/pos/page.js` y `api/pos/route.js` — Caja Avanzada**
- **Soporte de Descuentos:** Entrada nativa para descontar montos fijos del subtotal.
- **Botón Fiado:** Integración del método de pago "Fiado" conectado directamente a la base de datos de Clientes.
- **Generador de Recibos:** Modal tras procesar el pago con visualización del ticket impreso en pantalla y botón para *Compartir por WhatsApp*.

**`app/dashboard/clientes/page.js` y `api/clientes/route.js` — Módulo CRM y Fiados**
- Lista integral de clientes.
- Control de **Deuda Actual** (Fiado en calle).
- Modal para gestión activa de "Abonos", logrando transaccionalidad de cuentas corrientes (ej. si el cliente abona su fiado disminuye deuda).

**`app/dashboard/reportes/page.js` y `api/reportes/route.js` — Finanzas**
- Dashboards analíticos hiper-optimizados (diseño Glassmorphism Pro Max).
- Cálculo en tiempo real de **Utilidad Neta**, restando los costos incurridos sobre los totales de ventas de pedidos finalizados.
- Top 5 Productos más rotativos.
- Resumen Operativo de Volumen de Venta y ticket emitidos.

---

## 🚀 PRÓXIMOS PASOS
- [x] Gestión Contable y Márgenes (Completado).
- [x] Módulo de Clientes (CRM) y Fiados (Completado).
- [ ] Módulo Pasarela de Pagos SaaS (Stripe) para facturación y cobro de planes Premium/Avanzados.
- [ ] Completar verificación DNS de Resend y configurar SMTP en Supabase.
- [ ] Integración de Catálogos Automáticos (IG/FB).
