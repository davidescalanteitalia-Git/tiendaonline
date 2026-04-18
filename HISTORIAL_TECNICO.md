# HISTORIAL TÉCNICO — TIENDAONLINE SaaS
> Documento de referencia técnica. Para que cualquier desarrollador entienda el sistema completo sin leer el código.
> **Tareas pendientes → ver `PENDIENTES.md`**

---

## 1. VISIÓN Y ESTRATEGIA DEL PRODUCTO

TIENDAONLINE es una plataforma **SaaS multi-inquilino** de e-commerce + punto de venta (POS) para micronegocios. Modelo tipo Kyte / Shopify Lite orientado a Italia y Latinoamérica.

**Tres pilares:**
1. **Fricción cero en ventas** — POS ultrarrápido en móvil + catálogo web con checkout por WhatsApp.
2. **Empoderamiento financiero** — Reportes de utilidad neta real (ventas − costos de mercancía).
3. **Multi-tenant seguro** — Cada comercio aislado por `tienda_id` con RLS en Supabase.

**Stack técnico:**
- **Frontend + Backend:** Next.js 14 App Router (Server + Client Components)
- **Base de datos + Auth + Storage + Realtime:** Supabase (PostgreSQL)
- **Estilos:** Tailwind CSS 3 + glassmorphism
- **Íconos:** Lucide React
- **Internacionalización:** 3 idiomas manuales vía `lib/dictionaries.js` (ES / IT / EN)
- **Pagos SaaS:** Stripe (suscripciones B2B — cobro a los comercios por usar la plataforma)
- **Pagos en tienda:** Cada comercio conecta su propia cuenta Stripe. TIENDAONLINE no interviene en el flujo de dinero.
- **Monitoreo:** Sentry + PostHog
- **Deploy:** Coolify (VPS propio) + Cloudflare Worker para subdominios wildcard `*.tiendaonline.it`

---

## 2. INFRAESTRUCTURA Y CONFIGURACIÓN

### Variables de entorno (configuradas en Coolify)
```
NEXT_PUBLIC_SUPABASE_URL=https://bripfrfkwahsxtegmils.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-role-key]           # solo server/API
STRIPE_SECRET_KEY=sk_test_...                     # modo TEST — cambiar a live al lanzar
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_R7JygyubX9mrcDjkfg7zwwq4Asu6u0yt
NEXT_PUBLIC_APP_URL=https://tiendaonline.it
NEXT_PUBLIC_POSTHOG_KEY=phc_BiKU9NPq9aQjxs9EZoVM7DLb6EWuFLwxeZhmU6UNniLF
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984
ADMIN_EMAIL=davidescalanteitalia@gmail.com
NEXT_PUBLIC_ADMIN_EMAIL=davidescalanteitalia@gmail.com
```

### Proyecto Supabase
- **ID:** `bripfrfkwahsxtegmils` | **Región:** `eu-west-2` (Irlanda) | **Estado:** `ACTIVE_HEALTHY`

### Tailwind config
```js
colors: { primary: '#2563EB', secondary: '#3B82F6', cta: '#F97316', background: '#F8FAFC', textDark: '#1E293B' }
fontFamily: { sans: ['Fira Sans'], mono: ['Fira Code'] }
```

### PWA (`public/manifest.json`)
- `start_url: /dashboard`, `display: standalone`, `theme_color: #0f172a`
- Shortcuts a POS y Pedidos (Android)
- Meta tags iOS en `app/layout.js`: `apple-mobile-web-app-capable`, `viewport-fit=cover`

### Middleware (`middleware.js`)
Detecta subdominios y redirige a `/store/[subdominio]`:
```
mitienda.tiendaonline.it  →  rewrite → /store/mitienda
tiendaonline.it           →  pasa normal (home, login, register, etc.)
localhost:3000            →  pasa normal (dev)
```
Excluye: `api`, `_next/static`, `_next/image`, `favicon`, `.png`, `.jpg`

### Storage Supabase
- **Bucket:** `productos` — imágenes de productos Y logos de tiendas (misma bucket por simplicidad)
- Path logos: `logos/logo-{timestamp}.jpg`
- Path productos: `images/{timestamp}.jpg`
- Compresión automática en cliente (canvas, max 400px logos / max 800px productos)

### Sentry
- **Organización:** `deibys-david-escalante-rodrigu` | **Dashboard:** https://deibys-david-escalante-rodrigu.sentry.io
- `enabled` solo en producción. `replaysOnErrorSampleRate: 1.0`. `maskAllInputs: true`.
- Utilidades en `lib/sentry.js`: `capturarError(err, { modulo, tiendaId, userId })` y `capturarAviso(msg, ctx)`

---

## 3. ARQUITECTURA MULTI-TENANT

Cada recurso tiene `tienda_id`. RLS en Supabase filtra automáticamente. **Nunca hay lecturas cruzadas entre comercios.**

### Patrón de autenticación en APIs
```
Cliente → getSession() → access_token JWT
       → fetch('/api/ruta', { headers: { Authorization: 'Bearer {token}' } })
       → API Server → getSupabaseAdmin().auth.getUser(token) → user.id
       → SELECT tiendas WHERE user_id = user.id → tienda_id
       → Todas las queries filtran por tienda_id
```

### Singleton Supabase Admin (`lib/supabase-admin.js`)
```js
let _client = null
export function getSupabaseAdmin() {
  if (!_client) _client = createClient(URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  return _client
}
```

### Verificación de administrador
El email del superadmin se lee de `process.env.ADMIN_EMAIL`. Está referenciado en:
- `lib/supabase-admin.js` (función `verifyAdmin`)
- `app/administrador/layout.js`
- `app/login/page.js` (redirección al panel admin)

---

## 4. ESQUEMA DE BASE DE DATOS

### Tabla: `tiendas`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users` |
| `subdominio` | text NOT NULL UNIQUE | URL del catálogo |
| `nombre` | text NOT NULL | |
| `descripcion` | text | Bio pública |
| `whatsapp` | text | Con código de país |
| `instagram` | text | Handle sin @ |
| `email` | text | Contacto público |
| `direccion` | text | |
| `horario` | text | Ej: "Lun-Vie 9:00-18:00" |
| `logo_url` | text | URL Supabase Storage |
| `emoji` | text | Default '🏪' |
| `config_diseno` | jsonb | Ver estructura abajo |
| `aceptar_pedidos` | boolean | Default true |
| `enviar_whatsapp` | boolean | Default true |
| `mensaje_post_pedido` | text | |
| `link_resena_google` | text | URL perfil Google Reviews |
| `estado` | text | `'activo'` \| `'suspendido'` |
| `plan_suscripcion` | text | `'trial'` \| `'gratis'` \| `'basico'` \| `'pro'` \| `'grow'` |
| `trial_fin` | date | Vencimiento del mes gratuito |
| `trial_usado` | boolean | Evita dobles trials |
| `stripe_customer_id` | text | |
| `stripe_subscription_id` | text | |
| `stripe_price_id` | text | |

**`config_diseno` (JSONB):**
```json
{
  "publicado": true,
  "color_principal": "#2563EB",
  "modo_exhibicion": "cuadricula",
  "mostrar_sin_stock": "normal",
  "banner_url": null,
  "logo_url": null,
  "pagos": {
    "efectivo":      { "habilitado": true,  "instrucciones": "" },
    "transferencia": { "habilitado": false, "cbu": "", "titular": "", "banco": "" },
    "mercado_pago":  { "habilitado": false, "link": "" }
  },
  "envios": {
    "retiro":    { "habilitado": true, "tipo": "coordinar", "direccion": "" },
    "domicilio": { "habilitado": false, "zonas": [] }
  }
}
```

---

### Tabla: `productos`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `nombre` | text | |
| `descripcion` | text | |
| `precio` | numeric | Precio de venta público |
| `costo` | numeric | Costo real — OCULTO al público |
| `stock` | integer | |
| `emoji` | text | |
| `imagen_url` | text | Imagen principal |
| `imagen_2` | text | Solo plan Básico+ |
| `imagen_3` | text | Solo plan Pro/Grow |
| `imagen_4` | text | Solo plan Pro/Grow |
| `categoria_id` | uuid FK | Nullable |
| `codigo_barras` | text | Para escáner POS (BarcodeDetector API) |
| `estado` | text | `'activo'` / `'inactivo'` |
| `fecha_vencimiento` | date | Para perecederos |
| `orden` | integer | Para reordenar (drag-drop) |

> ⚠️ Existen columnas huérfanas en inglés (`barcode`, `description`, `is_active`) — NO usar, mantenidas por retrocompatibilidad.

**Imágenes por plan:**
- Gratis: 1 imagen (`imagen_url`)
- Básico: 2 imágenes
- Pro / Grow: 4 imágenes

---

### Tabla: `categorias`
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `tienda_id` | uuid FK |
| `nombre` | text |
| `emoji` | text |
| `orden` | integer |

---

### Tabla: `pedidos`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `codigo` | text | Ej: `#POS-102` o `#WEB-844` |
| `cliente_nombre` | text | |
| `cliente_telefono` | text | |
| `items` | jsonb | Array de ítems del carrito |
| `total` | numeric | |
| `estado` | text | `'pendiente'` / `'confirmado'` / `'enviado'` / `'cancelado'` |
| `tipo_venta` | text | `'POS'` o `'Online'` |
| `metodo_pago` | text | `'efectivo'`, `'tarjeta'`, `'transferencia'`, `'fiado'` |
| `metodo_envio` | text | `'retiro'` o `'domicilio'` |

**Estructura `items` (JSONB array):**
```json
[{ "id": "uuid", "nombre": "Producto X", "precio": 10.00, "costo": 5.00, "quantity": 2 }]
```
> El `costo` se guarda en el momento de la venta para preservar el histórico correcto aunque cambie el precio del producto.

---

### Tabla: `clientes` (CRM + Fiados + Portal)
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `nombre` | text | |
| `telefono` | text | |
| `email` | text | |
| `deuda_actual` | numeric | Saldo de fiado pendiente |
| `total_gastado` | numeric | Historial de compras totales |
| `user_id` | uuid | FK → `auth.users` — vincula con cuenta del portal del cliente |
| `fecha_nacimiento` | date | Opcional — descuentos de cumpleaños (pendiente implementar) |

> Al vincular `user_id`: buscar primero si ya existe cliente con el mismo email (compras previas como invitado) para preservar el historial.

---

### Tabla: `compras` (Restock de inventario)
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `producto_id` | uuid FK | |
| `cantidad` | integer | |
| `costo` | numeric | Costo unitario de esta compra |
| `fecha_vencimiento` | date | Actualiza la fecha en el producto |

Al registrar una compra: el `stock` del producto se incrementa automáticamente.

---

### Políticas RLS
| Tabla | Políticas |
|-------|-----------|
| `tiendas` | Dueño: ALL donde `user_id = auth.uid()` · Público: SELECT |
| `productos` | Dueño: ALL por `tienda_id` · Público: SELECT |
| `categorias` | Dueño: ALL por `tienda_id` · Público: SELECT |
| `pedidos` | Dueño: ALL por `tienda_id` · Anónimo: INSERT (checkout web) |
| `clientes` | Dueño: ALL por `tienda_id` |
| `compras` | Dueño: ALL por `tienda_id` |

> Todas usan `(select auth.uid())` con paréntesis — optimización para evitar re-evaluación por fila.

### Índices
```sql
idx_tiendas_user_id        ON tiendas(user_id)
idx_productos_tienda_id    ON productos(tienda_id)
idx_productos_categoria_id ON productos(categoria_id)
idx_pedidos_tienda_id      ON pedidos(tienda_id)
idx_pedidos_created_at     ON pedidos(created_at DESC)
idx_clientes_tienda_id     ON clientes(tienda_id)
idx_clientes_user_id       ON clientes(user_id)
```

---

## 5. MAPA DE RUTAS Y RESPONSABILIDADES

### Rutas públicas (sin auth)
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.js` | Landing page de TIENDAONLINE |
| `/login` | `app/login/page.js` | Login con Supabase Auth |
| `/register` | `app/register/page.js` | Registro de nuevos comercios |
| `/store/[domain]` | `app/store/[domain]/page.js` | Catálogo público (Server Component) |
| `/store/[domain]/cuenta` | `…/cuenta/page.js` | Registro y login del cliente |
| `/store/[domain]/mis-pedidos` | `…/mis-pedidos/page.js` | Portal del cliente autenticado |
| `/privacy` | `app/privacy/page.js` | Política de privacidad |
| `/terms` | `app/terms/page.js` | Términos de uso |
| `/cookie-policy` | `app/cookie-policy/page.js` | Política de cookies |
| `/contatti` | `app/contatti/page.js` | Contacto |

### Rutas del dashboard (requieren auth)
| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Centro de mando: KPIs, actividad reciente, checklist |
| `/dashboard/pos` | Terminal POS táctil |
| `/dashboard/productos` | CRUD inventario |
| `/dashboard/compras` | Registro de restock e insumos |
| `/dashboard/categorias` | CRUD categorías |
| `/dashboard/pedidos` | Gestión de pedidos + Realtime |
| `/dashboard/clientes` | CRM + gestión de fiados |
| `/dashboard/reportes` | Analítica financiera |
| `/dashboard/diseno` | Personalización de la tienda |
| `/dashboard/ajustes` | Perfil, métodos de pago, envíos |
| `/dashboard/cuenta` | Cambiar email y contraseña |
| `/dashboard/planes` | Selección de plan + web corporativa |

### Rutas de superadmin (solo `ADMIN_EMAIL`)
| Ruta | Descripción |
|------|-------------|
| `/administrador` | Stats globales de la plataforma |
| `/administrador/tiendas` | Ver/suspender/eliminar tiendas |
| `/administrador/usuarios` | Ver/bloquear/eliminar usuarios |

### API Routes (`app/api/`)
| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/me` | GET | Tienda del usuario autenticado |
| `/api/tienda` | GET, PATCH | Perfil de tienda |
| `/api/productos` | GET, POST, PATCH, DELETE | CRUD inventario |
| `/api/categorias` | GET, POST, PATCH, DELETE | CRUD categorías |
| `/api/pedidos` | GET, POST | Listar / crear pedido |
| `/api/pedidos/[id]` | PATCH | Actualizar estado de pedido |
| `/api/pos` | POST | Procesar cobro POS (descuenta stock, crea pedido, maneja fiado) |
| `/api/clientes` | GET, POST | Listar clientes / crear o registrar abono |
| `/api/compras` | GET, POST | Listar / registrar restock |
| `/api/reportes` | GET | KPIs financieros |
| `/api/stats` | GET | Stats del dashboard |
| `/api/register` | POST | Crear usuario Auth + tienda |
| `/api/auth/cliente` | POST, PUT, DELETE | Registro cliente, perfil, eliminar cuenta |
| `/api/store/[domain]/producto/[id]` | GET | Producto público con relacionados |
| `/api/stripe/checkout` | POST | Crear sesión de checkout Stripe |
| `/api/stripe/webhook` | POST | Procesar eventos Stripe (activar plan) |
| `/api/admin/stats` | GET | Stats globales (solo admin) |
| `/api/admin/tiendas` | GET, PATCH, DELETE | Gestión tiendas (solo admin) |
| `/api/admin/usuarios` | GET, PATCH, DELETE | Gestión usuarios (solo admin) |

> Todas las API routes tienen `export const dynamic = 'force-dynamic'` para evitar caché.

---

## 6. COMPONENTES CLAVE

### `components/StoreClient.js`
Client Component del catálogo público.
- Carrito de compras (estado local)
- Checkout 2 pasos: datos del cliente → método de envío
- Envío del pedido a `/api/pedidos` + redirección a WhatsApp si `enviar_whatsapp = true`
- Sidebar con: logo, descripción, horario + badge Abierto/Cerrado, contacto, categorías
- Footer viral "Desarrollado con TIENDAONLINE"

### `components/OnboardingWizard.js`
Wizard modal 3 pasos para nuevos usuarios sobre el dashboard.
1. Subdominio — 2. Método de pago — 3. Primer producto
- El X solo aparece cuando al menos 1 paso está completo
- Persiste dismissal en `sessionStorage` (reaparece si el navegador se cierra)

### `components/LanguageProvider.js`
Context que provee `lang` (ES/IT/EN) a toda la app. Persiste en `localStorage`.

### `lib/dictionaries.js`
Todas las cadenas de texto en 3 idiomas. Uso: `const dict = DICTIONARY[lang] || DICTIONARY['es']`

---

## 7. SUPABASE REALTIME

### Canal 1 — Badge de pedidos pendientes (sidebar)
`app/dashboard/layout.js` — escucha INSERT y UPDATE en `pedidos` filtrado por `tienda_id`. Muestra badge verde `animate-pulse`.

### Canal 2 — Notificación de nuevo pedido
`app/dashboard/pedidos/page.js` — solo INSERT. Inserta pedido al estado local sin recargar. Dispara sonido via Web Audio API (oscilador 3 notas, sin npm). Muestra toast verde 6 segundos.

---

## 8. FLUJOS CRÍTICOS DEL NEGOCIO

### Registro de un nuevo comercio
```
/register → POST /api/register
  1. Sanitiza subdominio (minúsculas, a-z0-9-)
  2. Verifica subdominio único + WhatsApp único
  3. supabaseAdmin.auth.createUser()
  4. INSERT tiendas(...)
→ /login → auto-login → /dashboard
```

### Cobro en POS
```
/dashboard/pos → POST /api/pos
  1. Por cada item: decrementa stock (Math.max(0, stock - qty))
  2. INSERT pedidos({ tipo_venta: 'POS', estado: 'confirmado' })
  3. Si método = 'fiado': busca o crea cliente → acumula deuda_actual
→ Modal de éxito → "Compartir recibo por WhatsApp"
```

### Checkout catálogo público (online)
```
StoreClient → POST /api/pedidos (RLS permite INSERT público anónimo)
  → INSERT pedidos (estado: 'pendiente')
  → Si enviar_whatsapp: abre wa.me/{tienda.whatsapp}?text=...
  → El dueño confirma manualmente desde /dashboard/pedidos
```

### Abono en fiado
```
POST /api/clientes { id, abono }
  → nueva_deuda = Math.max(0, deuda_actual - abono)
  → UPDATE clientes SET deuda_actual = nueva_deuda
```

### Restock de producto
```
POST /api/compras { producto_id, cantidad, costo, fecha_vencimiento }
  → INSERT compras(...)
  → UPDATE productos SET stock = stock + cantidad
```

---

## 9. MODELO DE SUSCRIPCIÓN (Stripe B2B)

Los comercios pagan a TIENDAONLINE por usar la plataforma. **TIENDAONLINE no interviene en los cobros entre los comercios y sus compradores.**

| Plan | Precio mensual | Precio anual |
|------|---------------|--------------|
| Gratis | €0 | €0 |
| Básico | €15/mes | €144/año (€12/mes) |
| Pro | €25/mes | €240/año (€20/mes) |
| Grow | €40/mes | €384/año (€32/mes) |

- Trial gratuito de 30 días al registrarse (`trial_fin`, `trial_usado`)
- Stripe en modo TEST. Cambiar a live al lanzar.
- Webhook en `/api/stripe/webhook` — mapea `price_id → plan` y actualiza `tiendas.plan_suscripcion`
- Cada comercio en planes pagos conecta su **propia cuenta Stripe** directamente (Stripe Connect). TIENDAONLINE no toca el dinero de las ventas.

---

## 10. MÓDULO DE REPORTES FINANCIEROS

**Endpoint:** `GET /api/reportes`

```
1. Fetch todos los pedidos confirmados + POS de la tienda
2. Por cada pedido → por cada ítem del JSONB:
   - ventasTotales += item.precio * item.quantity
   - costoTotal   += item.costo  * item.quantity
3. utilidadNeta = ventasTotales - costoTotal
4. margen = (utilidadNeta / ventasTotales) * 100
5. topProductos = top 5 por unidades vendidas
```

**KPIs:** `ventasTotales`, `costoTotal`, `utilidadNeta`, `margen`, `totalPedidos`, `topProductos[]`, `fiadoTotal`

Filtros de fecha disponibles: Hoy / Esta semana / Este mes / Este año / Todo

---

## 11. PANEL DE SUPERADMIN

Acceso solo para `process.env.ADMIN_EMAIL` (verificado via JWT + email comparison).
- Stats globales: total tiendas, pedidos, usuarios
- Listar, suspender, activar, eliminar tiendas y usuarios

---

## 12. INTERNACIONALIZACIÓN

- **Idiomas:** ES / IT / EN
- **Método:** Manual. `lib/dictionaries.js` exporta `DICTIONARY`.
- **Selector:** `components/LanguageSelector.js` — persiste en `localStorage`
- **Uso:** `const dict = DICTIONARY[lang] || DICTIONARY['es']`
- No usa `next-intl` ni `i18next`. Considerar migración si escala el volumen de texto.

---

## 13. DECISIONES DE ARQUITECTURA

| Decisión | Razón |
|----------|-------|
| OG image via `@vercel/og` (Edge Function) | Genera PNG real 1200×630 por tienda con nombre y logo |
| Web Audio API para sonido en pedidos | Sin dependencias externas |
| `sessionStorage` para dismissal del Onboarding | Reaparece al reiniciar el browser hasta completar setup |
| Costo guardado en el ítem del pedido (JSONB) | Reportes históricos correctos aunque cambie el costo del producto |
| Mismo bucket `productos` para logos y fotos | Simplicidad — evita múltiples buckets |
| `getSupabaseAdmin()` singleton lazy | Una sola instancia por proceso, evita memory leaks |
| `(select auth.uid())` en RLS | Evaluado una vez por query, no por fila |
| Checkout sin pago online (WhatsApp) | Elimina barrera de adopción. El pago se coordina humanamente. |
| `export const dynamic = 'force-dynamic'` en todas las APIs | Evita respuestas cacheadas |

---

## 14. DEUDA TÉCNICA ACTIVA

| Riesgo | Estado |
|--------|--------|
| Sin emails transaccionales | ⚠️ Pendiente — integrar Resend |
| Horario detectado en TZ del cliente | ⚠️ Pendiente — añadir campo TZ en ajustes |
| `items` como JSONB | Aceptable por ahora. Migrar si escala. |
| Columnas huérfanas en inglés en `productos` | Mantener por retrocompatibilidad, no usar |
| Sin verificación de email al registrarse | ⚠️ Pendiente — requiere Resend configurado primero |
| Stripe en modo TEST | ⚠️ Cambiar a live antes del lanzamiento |
