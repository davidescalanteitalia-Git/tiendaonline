# HISTORIAL TÉCNICO — TIENDAONLINE SaaS
> Documento vivo. Actualizar al final de cada sesión de trabajo.  
> Propósito: que cualquier desarrollador (o Claude en una nueva sesión) pueda entender el sistema completo sin leer el código.

---

## 1. VISIÓN Y ESTRATEGIA DEL PRODUCTO

TIENDAONLINE es una plataforma **SaaS multi-inquilino** de e-commerce + punto de venta (POS) para micronegocios. Modelo tipo Kyte / Shopify Lite pero orientado a Italia y Latinoamérica.

**Tres pilares:**
1. **Fricción cero en ventas** — POS ultrarrápido en móvil + catálogo web con checkout por WhatsApp.
2. **Empoderamiento financiero** — Reportes de utilidad neta real (ventas − costos de mercancía).
3. **Multi-tenant seguro** — Cada comercio aislado por `tienda_id` con RLS en Supabase.

**Stack técnico:**
- **Frontend + Backend:** Next.js 14 App Router (Server + Client Components)
- **Base de datos + Auth + Storage + Realtime:** Supabase (PostgreSQL)
- **Estilos:** Tailwind CSS 3 + glassmorphism + `animate-in` de Tailwind
- **Íconos:** Lucide React
- **Internacionalización:** 3 idiomas manuales vía `lib/dictionaries.js` (ES / IT / EN)
- **Deploy:** Vercel (subdominios wildcard `*.tiendaonline.it`)

---

## 2. INFRAESTRUCTURA Y CONFIGURACIÓN

### Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL=https://bripfrfkwahsxtegmils.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]        # usada en el cliente (lib/supabase.js)
SUPABASE_SERVICE_KEY=[service-role-key]           # usada solo en server/API (lib/supabase-admin.js)
```
> ⚠️ El `.env.local` está vacío. Las vars están configuradas en Vercel directamente.

### Proyecto Supabase
- **ID:** `bripfrfkwahsxtegmils`
- **Región:** `eu-west-2` (Irlanda)
- **Estado:** `ACTIVE_HEALTHY`

### Next.js config (`next.config.mjs`)
- `remotePatterns` configurado para: `picsum.photos`, `bripfrfkwahsxtegmils.supabase.co`, `*.tiendaonline.it`
- (migrado desde `domains` deprecado)

### Tailwind config (`tailwind.config.js`)
```js
colors: {
  primary:    '#2563EB',   // azul principal del dashboard
  secondary:  '#3B82F6',
  cta:        '#F97316',   // naranja CTA
  background: '#F8FAFC',
  textDark:   '#1E293B',
}
fontFamily: { sans: ['Fira Sans'], mono: ['Fira Code'] }
```

### PWA (`public/manifest.json`)
- `start_url: /dashboard`, `display: standalone`
- `theme_color: #0f172a` (barra de estado oscura)
- Shortcuts a POS y Pedidos (Android)
- Meta tags iOS en `app/layout.js`: `apple-mobile-web-app-capable`, `viewport-fit=cover`, `apple-touch-icon`

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
- Path productos: `images/{timestamp}.jpg` (o similar)
- Compresión automática antes de subir (canvas en cliente, max 400px logos / max 800px productos)

---

## 3. ARQUITECTURA MULTI-TENANT

### Principio fundamental
Cada recurso tiene `tienda_id`. RLS en Supabase filtra automáticamente por `tienda_id` del usuario autenticado. **Nunca hay lecturas cruzadas entre comercios.**

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
  if (!_client) {
    _client = createClient(URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  }
  return _client
}
```
- `autoRefreshToken: false` y `persistSession: false` porque es server-side, sin sesión de usuario.
- Toda API route que necesite permisos admin usa esta función.

### Verificación de administrador
```js
// lib/supabase-admin.js
export async function verifyAdmin(req) {
  // Verifica JWT + compara email con ADMIN_EMAIL hardcodeado
  return user.email === 'davidescalanteitalia@gmail.com'
}
```
> ⚠️ El email del superadmin está hardcodeado. Si cambia el propietario hay que actualizarlo en:
> - `lib/supabase-admin.js` (función `verifyAdmin`)
> - `app/administrador/layout.js` (constante `ADMIN_EMAIL`)
> - `app/login/page.js` (redirección al panel admin)

---

## 4. ESQUEMA DE BASE DE DATOS

### Tabla: `tiendas`
El perfil del comercio. Una por usuario.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users` |
| `subdominio` | text NOT NULL UNIQUE | URL del catálogo |
| `nombre` | text NOT NULL | Nombre del negocio |
| `descripcion` | text | Bio pública |
| `whatsapp` | text | Número con código de país |
| `instagram` | text | Handle sin @ |
| `email` | text | Email de contacto público |
| `direccion` | text | Dirección física |
| `horario` | text | Texto libre, ej: "Lun-Vie 9:00-18:00" |
| `logo_url` | text | URL de Supabase Storage |
| `emoji` | text | Default '🏪' |
| `config_diseno` | jsonb | Ver estructura abajo |
| `aceptar_pedidos` | boolean | Default true |
| `enviar_whatsapp` | boolean | Default true |
| `mensaje_post_pedido` | text | Mensaje al comprador al finalizar |
| `link_resena_google` | text | URL del perfil de Google Reviews — visible en portal del cliente |
| `estado` | text | 'activo' o 'suspendido' |
| `plan_suscripcion` | text | `'trial'` \| `'gratis'` \| `'basico'` \| `'pro'` \| `'grow'` |
| `trial_fin` | date | Fecha de vencimiento del mes gratuito (30 días desde registro) |
| `trial_usado` | boolean | Marca que el trial ya fue utilizado (evita dobles trials) |
| `stripe_customer_id` | text | ID de cliente en Stripe — pendiente integración |
| `stripe_subscription_id` | text | ID de suscripción activa en Stripe — pendiente integración |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Estructura de `config_diseno` (JSONB):**
```json
{
  "publicado": true,
  "color_principal": "#2563EB",
  "modo_exhibicion": "cuadricula",
  "mostrar_sin_stock": "normal",
  "banner_url": null,
  "logo_url": null,
  "pagos": {
    "efectivo":     { "habilitado": true,  "instrucciones": "" },
    "transferencia":{ "habilitado": false, "cbu": "", "titular": "", "banco": "" },
    "mercado_pago": { "habilitado": false, "link": "" }
  },
  "envios": {
    "retiro":    { "habilitado": true, "tipo": "coordinar", "direccion": "" },
    "domicilio": { "habilitado": false, "zonas": [] }
  }
}
```

---

### Tabla: `productos`
Inventario del comercio.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid | FK → tiendas |
| `nombre` | text | |
| `descripcion` | text | |
| `precio` | numeric | Precio de venta público |
| `costo` | numeric | Costo real, OCULTO al público |
| `stock` | integer | |
| `emoji` | text | |
| `imagen_url` | text | |
| `categoria_id` | uuid | FK → categorias (nullable) |
| `codigo_barras` | text | Para escáner en POS |
| `estado` | text | 'activo' / 'inactivo' |
| `fecha_vencimiento` | date | Para perecederos |
| `orden` | integer | Para reordenar (drag-drop futuro) |

> ⚠️ Columnas huérfanas en inglés (`barcode`, `description`, `is_active`) — mantenidas por retrocompatibilidad pero NO se usan. Usar las columnas en español.

---

### Tabla: `categorias`

| Columna | Tipo | |
|---------|------|-|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `nombre` | text | |
| `emoji` | text | |
| `orden` | integer | |

---

### Tabla: `pedidos`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `codigo` | text | Ej: `#POS-102` o `#WEB-844` |
| `cliente_nombre` | text | |
| `cliente_telefono` | text | WhatsApp del comprador |
| `items` | jsonb | Array de ítems del carrito |
| `total` | numeric | |
| `estado` | text | 'pendiente' / 'confirmado' / 'enviado' / 'cancelado' |
| `tipo_venta` | text | 'POS' o 'Online' |
| `metodo_pago` | text | 'efectivo', 'tarjeta', 'transferencia', 'fiado' |
| `metodo_envio` | text | 'retiro' o 'domicilio' |
| `created_at` | timestamptz | |

**Estructura de `items` (JSONB array):**
```json
[
  { "id": "uuid", "nombre": "Producto X", "precio": 10.00, "costo": 5.00, "quantity": 2 }
]
```
> ⚠️ El `costo` se guarda en el momento de la venta. Si el dueño cambia el costo del producto después, el histórico refleja el costo original correcto.

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
| `fecha_nacimiento` | date | Opcional — para descuentos de cumpleaños |
| `full_name` | text | Columna legacy (NOT NULL removido) — usar `nombre` |
| `phone` | text | Columna legacy — usar `telefono` |
| `updated_at` | timestamptz | |

> ⚠️ Al vincular `user_id`, buscamos primero si ya existe un cliente con el mismo email en la tienda (compras anteriores como invitado). Si existe, actualizamos `user_id` en el registro existente para preservar el historial.

---

### Tabla: `compras` (Registro de insumos/restock)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `producto_id` | uuid FK → productos | |
| `cantidad` | integer | Unidades compradas |
| `costo` | numeric | Costo unitario de esta compra |
| `fecha_vencimiento` | date | Actualiza la fecha en el producto |
| `created_at` | timestamptz | |

Al registrar una compra: el `stock` del producto se incrementa automáticamente.

---

### Políticas RLS activas (todas las tablas)

| Tabla | RLS | Políticas |
|-------|-----|-----------|
| `tiendas` | ✅ | Dueño: ALL donde `user_id = auth.uid()` · Público: SELECT |
| `productos` | ✅ | Dueño: ALL por `tienda_id` · Público: SELECT |
| `categorias` | ✅ | Dueño: ALL por `tienda_id` · Público: SELECT |
| `pedidos` | ✅ | Dueño: ALL por `tienda_id` · Anónimo/Público: INSERT (checkout web) |
| `clientes` | ✅ | Dueño: ALL por `tienda_id` |
| `compras` | ✅ | Dueño: ALL por `tienda_id` |

> ✅ Todas usan `(select auth.uid())` con paréntesis (optimización: evita re-evaluación por fila).

### Índices de rendimiento
```sql
idx_tiendas_user_id          ON tiendas(user_id)
idx_productos_tienda_id      ON productos(tienda_id)
idx_productos_categoria_id   ON productos(categoria_id)
idx_pedidos_tienda_id        ON pedidos(tienda_id)
idx_pedidos_created_at       ON pedidos(created_at DESC)
idx_clientes_tienda_id       ON clientes(tienda_id)
idx_clientes_user_id         ON clientes(user_id)         -- Portal del cliente (Sesión 12)
```

---

## 5. MAPA DE RUTAS Y RESPONSABILIDADES

### Rutas públicas (sin auth)
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.js` | Landing page de TIENDAONLINE |
| `/login` | `app/login/page.js` | Login con Supabase Auth |
| `/register` | `app/register/page.js` | Registro de nuevos comercios |
| `/store/[domain]` | `app/store/[domain]/page.js` | Catálogo público del comercio (Server Component) |
| `/store/[domain]/cuenta` | `app/store/[domain]/cuenta/page.js` | Registro y login del cliente (3 vistas: bienvenida, registro, login) |
| `/store/[domain]/mis-pedidos` | `app/store/[domain]/mis-pedidos/page.js` | Portal del cliente autenticado (pedidos, perfil, cuenta) |
| `/privacy` | `app/privacy/page.js` | Política de privacidad |
| `/terms` | `app/terms/page.js` | Términos de uso |
| `/cookie-policy` | `app/cookie-policy/page.js` | Política de cookies |
| `/contatti` | `app/contatti/page.js` | Contacto |
| `/not-found` | `app/not-found.js` | 404 personalizada |

### Rutas del dashboard (requieren auth)
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/dashboard` | `page.js` | Centro de mando: KPIs, actividad reciente, checklist |
| `/dashboard/pos` | `pos/page.js` | Terminal POS táctil |
| `/dashboard/productos` | `productos/page.js` | CRUD inventario |
| `/dashboard/compras` | `compras/page.js` | Registro de restock e insumos |
| `/dashboard/categorias` | `categorias/page.js` | CRUD categorías |
| `/dashboard/pedidos` | `pedidos/page.js` | Gestión de pedidos + Realtime |
| `/dashboard/clientes` | `clientes/page.js` | CRM + gestión de fiados |
| `/dashboard/reportes` | `reportes/page.js` | Analítica financiera |
| `/dashboard/diseno` | `diseno/page.js` | Personalización de la tienda |
| `/dashboard/ajustes` | `ajustes/page.js` | Perfil: nombre, WhatsApp, Instagram, horario |
| `/dashboard/ajustes/pagos` | `ajustes/pagos/page.js` | Métodos de pago del catálogo |
| `/dashboard/ajustes/envios` | `ajustes/envios/page.js` | Zonas de envío |
| `/dashboard/cuenta` | `cuenta/page.js` | Cambiar email y contraseña |
| `/dashboard/planes` | `planes/page.js` | Selección de plan con precios, toggle mensual/anual, estado del trial |

### Rutas de superadmin (solo `davidescalanteitalia@gmail.com`)
| Ruta | Archivo | |
|------|---------|--|
| `/administrador` | `page.js` | Stats globales de la plataforma |
| `/administrador/tiendas` | `tiendas/page.js` | Ver/suspender/eliminar tiendas |
| `/administrador/usuarios` | `usuarios/page.js` | Ver/bloquear/eliminar usuarios |

### API Routes (`app/api/`)
| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/me` | GET | Devuelve la tienda del usuario autenticado |
| `/api/tienda` | GET, PATCH | Leer y actualizar perfil de tienda |
| `/api/productos` | GET, POST, PATCH, DELETE | CRUD completo de productos |
| `/api/categorias` | GET, POST, PATCH, DELETE | CRUD de categorías |
| `/api/pedidos` | GET, POST | Listar pedidos / crear pedido (checkout) |
| `/api/pedidos/[id]` | PATCH | Actualizar estado de un pedido |
| `/api/pos` | POST | Procesar cobro del POS (descuenta stock, crea pedido, maneja fiado) |
| `/api/clientes` | GET, POST | Listar clientes / crear cliente o registrar abono |
| `/api/compras` | GET, POST | Listar compras / registrar restock |
| `/api/reportes` | GET | KPIs financieros (ventas, costos, utilidad, top productos) |
| `/api/stats` | GET | Stats simples del dashboard |
| `/api/register` | POST | Crear usuario Auth + tienda en la misma transacción |
| `/api/auth/cliente` | POST, PUT, DELETE | Registro de cliente, actualizar perfil, eliminar cuenta (GDPR) |
| `/api/store/[domain]/producto/[id]` | GET | API pública: devuelve producto + tienda + categoría + relacionados |
| `/api/admin/stats` | GET | Stats globales (solo admin) |
| `/api/admin/tiendas` | GET, PATCH, DELETE | Gestión de tiendas (solo admin) |
| `/api/admin/usuarios` | GET, PATCH, DELETE | Gestión de usuarios (solo admin) |

> Todas las API routes tienen `export const dynamic = 'force-dynamic'` para evitar respuestas cacheadas en Vercel.

---

## 6. COMPONENTES CLAVE

### `components/StoreClient.js`
Client Component del catálogo público. Recibe props del Server Component (`store/[domain]/page.js`).

**Responsabilidades:**
- Carrito de compras (estado local)
- Checkout 2 pasos: datos del cliente → método de envío + pago
- Detección de método de envío (retiro / domicilio) y cálculo de costo
- Envío del pedido a `/api/pedidos` (POST)
- Redirección a WhatsApp con pedido formateado si `enviar_whatsapp = true`
- Sidebar con: logo/emoji, descripción, **horario + badge Abierto/Cerrado**, contacto (WhatsApp/Instagram/email/dirección), zonas de entrega, categorías
- Footer "Desarrollado con TIENDAONLINE" → `https://tiendaonline.it` (viral marketing)

**Lógica de horario:**
```js
// Parsea "HH:MM – HH:MM" del texto de horario y compara con hora local del cliente
getEstadoTienda() → { abierto: boolean | null, texto: string }
```

### `components/OnboardingWizard.js`
Wizard modal de 3 pasos para nuevos usuarios. Se muestra encima del dashboard.

**Pasos:**
1. Subdominio (siempre completado si el usuario tiene tienda)
2. Método de pago (detecta `config_diseno.pagos.*.habilitado`)
3. Primer producto (detecta `productos.length > 0`)

**Comportamiento:**
- El X de cerrar solo aparece cuando `completedCount >= 1`
- Al descartar: `sessionStorage.setItem('onboarding_dismissed', '1')`
- Si todos los pasos están completos: botón "Ir al Dashboard" en lugar del X
- Se muestra si: NO descartado en sesión Y (sin pago habilitado O sin productos)

> ⚠️ Bug corregido: antes `some(k => cfg.pagos[k])` era siempre true. Correcto: `some(k => cfg.pagos[k]?.habilitado)`.

### `components/LanguageProvider.js`
Context que provee `lang` (ES/IT/EN) a toda la app. Persiste en `localStorage`.

### `lib/dictionaries.js`
Objeto con todas las cadenas de texto en los 3 idiomas. Estructura: `DICTIONARY.es`, `DICTIONARY.it`, `DICTIONARY.en`. Se importa en cada página con `const dict = DICTIONARY[lang] || DICTIONARY['es']`.

---

## 7. SUPABASE REALTIME

### Canal 1 — Badge de pedidos pendientes (sidebar)
**Archivo:** `app/dashboard/layout.js`
```js
supabase.channel(`layout-pedidos-${tienda.id}`)
  .on('postgres_changes', { event: '*', table: 'pedidos', filter: `tienda_id=eq.${tienda.id}` }, callback)
  .subscribe()
```
- Escucha INSERT y UPDATE
- En cada cambio: re-fetchea `/api/pedidos` y recontabiliza pendientes
- Badge verde `animate-pulse` sobre el ítem "Pedidos" del sidebar

### Canal 2 — Notificación de nuevo pedido
**Archivo:** `app/dashboard/pedidos/page.js`
```js
supabase.channel(`pedidos-realtime-${tienda.id}`)
  .on('postgres_changes', { event: 'INSERT', table: 'pedidos', filter: `tienda_id=eq.${tienda.id}` }, callback)
  .subscribe()
```
- Solo INSERT
- Inserta el nuevo pedido al estado local sin recargar
- Dispara sonido via **Web Audio API** (oscilador 3 notas, 880→660→880 Hz, sin npm)
- Muestra toast verde 6 segundos con código y nombre del cliente
- Cleanup correcto: `supabase.removeChannel(channelRef.current)` en `useEffect` return

---

## 8. FLUJOS CRÍTICOS DEL NEGOCIO

### Flujo 1: Registro de un nuevo comercio
```
/register → POST /api/register
  1. Sanitiza subdominio (minúsculas, a-z0-9-)
  2. Verifica subdominio único en tiendas
  3. Verifica WhatsApp único en tiendas
  4. supabaseAdmin.auth.createUser({ email, password, email_confirm: true })
  5. INSERT tiendas({ user_id, nombre, subdominio, whatsapp })
  6. Responde con success
→ /login → auto-login → /dashboard
```

### Flujo 2: Cobro en POS
```
/dashboard/pos → POST /api/pos
  1. Por cada item: SELECT stock, decrementa stock (Math.max(0, stock - qty))
  2. INSERT pedidos({ tipo_venta: 'POS', estado: 'confirmado', ... })
  3. Si método = 'fiado':
     - Busca cliente por nombre en clientes
     - Si no existe: INSERT clientes({ nombre, deuda_actual: total })
     - Si existe: UPDATE clientes SET deuda_actual = deuda_actual + total
  4. Responde con pedido creado
→ Modal de éxito → botón "Compartir recibo por WhatsApp"
```

### Flujo 3: Checkout del catálogo público (online)
```
StoreClient → POST /api/pedidos (anónimo — RLS permite INSERT público)
  { cliente_nombre, cliente_telefono, items, total, metodo_envio, zona, metodo_pago, tipo_venta: 'Online' }
  → INSERT pedidos (estado: 'pendiente')
  → Si enviar_whatsapp: window.open(wa.me/{tienda.whatsapp}?text=...)
  → El dueño recibe el pedido en el dashboard (Realtime) y lo confirma manualmente
```

### Flujo 4: Registro de abono en fiado
```
/dashboard/clientes → POST /api/clientes { id: clienteId, abono: monto }
  → SELECT deuda_actual del cliente
  → nueva_deuda = Math.max(0, deuda_actual - abono)
  → UPDATE clientes SET deuda_actual = nueva_deuda
```

### Flujo 5: Restock de producto
```
/dashboard/compras → POST /api/compras { producto_id, cantidad, costo, fecha_vencimiento }
  → INSERT compras(...)
  → SELECT stock actual del producto
  → UPDATE productos SET stock = stock + cantidad, fecha_vencimiento = nueva_fecha
```

---

## 9. MÓDULO DE REPORTES FINANCIEROS

**Endpoint:** `GET /api/reportes`

**Lógica de cálculo:**
```
1. Fetch todos los pedidos confirmados y POS de la tienda
2. Por cada pedido → por cada ítem del JSONB:
   - ventasTotales += item.precio * item.quantity
   - costoTotal   += item.costo  * item.quantity   (costo guardado en el momento de la venta)
3. utilidadNeta = ventasTotales - costoTotal
4. margen = (utilidadNeta / ventasTotales) * 100
5. topProductos = top 5 por unidades vendidas (rank por rotación)
```

**KPIs que devuelve:** `ventasTotales`, `costoTotal`, `utilidadNeta`, `margen`, `totalPedidos`, `topProductos[]`, `fiadoTotal`

> ⚠️ **Limitación conocida:** No hay filtro por fecha. Muestra todo el historial. Pendiente: selector de rango temporal.

---

## 10. OG IMAGE Y SEO

- **`public/og-image.svg`** — SVG 1200×630px. Funciona en Telegram, Twitter, WhatsApp. Puede fallar en Facebook/LinkedIn.
- **`app/layout.js`** — Metadata con `og:image`, `og:title`, `og:description`, `manifest`, apple meta tags.
- > Alternativa futura: `@vercel/og` (Edge Function) para generar PNG real e incluso OG image dinámica por tienda con nombre y logo del comercio.

---

## 11. PANEL DE SUPERADMIN (`/administrador`)

Acceso solo para `davidescalanteitalia@gmail.com` (verificado via JWT + email comparison).

**Capacidades:**
- Ver stats globales: total tiendas, total pedidos de toda la plataforma, usuarios registrados
- Listar todas las tiendas con su estado y usuario dueño
- Suspender / activar / eliminar tiendas
- Listar todos los usuarios con su tienda asociada
- Bloquear / desbloquear / eliminar usuarios

> ⚠️ El email admin está hardcodeado en 3 lugares. Si cambia el propietario: `lib/supabase-admin.js`, `app/administrador/layout.js`, `app/login/page.js`.

---

## 12. INTERNACIONALIZACIÓN (i18n)

- **Idiomas:** Español (ES), Italiano (IT), Inglés (EN)
- **Método:** Manual. `lib/dictionaries.js` exporta `DICTIONARY` con las 3 claves.
- **Selector:** `components/LanguageSelector.js` guarda en `localStorage`.
- **Provider:** `components/LanguageProvider.js` (Context) envuelve toda la app.
- **Uso en páginas:** `const dict = DICTIONARY[lang] || DICTIONARY['es']`
- > ⚠️ No usa `next-intl` ni `i18next`. Si el proyecto escala mucho en texto, considerar migración.

---

## 13. DECISIONES DE ARQUITECTURA DOCUMENTADAS

| Decisión | Razón | Alternativa descartada |
|----------|-------|----------------------|
| SVG para OG image | `canvas` npm requiere compilación nativa (gyp error) | PNG con `canvas` |
| Web Audio API para sonido en pedidos | Sin dependencias externas, 3 líneas | `howler.js`, `tone.js` |
| `sessionStorage` para dismissal del OnboardingWizard | Reaparece al reiniciar el browser hasta completar setup | `localStorage` (nunca volvería) |
| Costo guardado en el ítem del pedido (JSONB) | Reportes históricos correctos aunque cambie el costo del producto | JOIN a productos (costo actual, no histórico) |
| Mismo bucket `productos` para logos y fotos | Simplicidad, evitar configurar múltiples buckets | Bucket separado `tienda-assets` |
| `getSupabaseAdmin()` singleton lazy | Una sola instancia por proceso, evita memory leaks en serverless | Nueva instancia por request |
| `(select auth.uid())` en RLS | Optimización: evaluado una vez por query, no por fila | `auth.uid()` directo (más lento a escala) |
| Checkout sin pago online (WhatsApp) | Elimina barrera de adopción en micronegocios. Acepta pedido → pago se coordina humanamente | Integración Stripe en checkout público |
| Hardcode email admin | Simplicidad — un solo superadmin | Tabla `admins` en DB con roles |

---

## 14. RIESGOS Y DEUDA TÉCNICA CONOCIDA

| Riesgo | Impacto | Mitigación actual |
|--------|---------|-------------------|
| Email admin hardcodeado | Si cambia propietario → rompe acceso admin | Documentado arriba. Cambiar en 3 archivos. |
| OG image en SVG | ~~No renderiza en Facebook/LinkedIn~~ | ✅ Resuelto en Sesión 11 — migrado a `@vercel/og` Edge Function |
| Horario detectado en TZ del cliente | El dueño en Madrid, cliente en NY → estado incorrecto | Pendiente campo TZ en ajustes |
| Sin filtro de fechas en reportes | ~~No puedes ver ventas de esta semana vs. el mes~~ | ✅ Resuelto en Sesión 11 — selector de 5 rangos |
| `items` como JSONB | Dificulta queries SQL avanzadas en reportes | Aceptable por ahora. Migrar si escala. |
| Columnas huérfanas en inglés | Confunden el esquema DB | Mantener para retrocompatibilidad |
| Sin emails transaccionales | Ningún email sale del sistema | Pendiente Resend integration |
| Sin lector de barras activo | ~~`codigo_barras` existe en DB pero cámara no se activa~~ | ✅ Resuelto en Sesión 9 — BarcodeDetector API nativa |
| Stripe no integrado | Sin modelo de negocio activo | Pendiente Sprint 5 |
| Bug Rollup (Windows) | Servidor local no carga | Borrar node_modules y re-instalar |
| Portal del cliente sin email de bienvenida | Al registrarse no recibe ningún email | Pendiente cuando se integre Resend |
| `fecha_nacimiento` sin uso activo | Columna existe en clientes pero no hay lógica de descuento por cumpleaños | Pendiente — feature futuro |

---

## 15. ROADMAP — SPRINTS PENDIENTES

| Prioridad | Feature | Descripción |
|-----------|---------|-------------|
| 🔴 Alta | **Stripe B2B** | Cobro mensual a comercios. Planes: Free / Pro (€9/mes) / Grow (€19/mes). Desbloquea: subdominios propios, analítica avanzada, catálogos automáticos IG. |
| 🔴 Alta | **Resend (emails transaccionales)** | Confirmación de registro, resumen de pedido al comprador, notificación al vendedor, recibo de abono de fiado. |
| ✅ Hecho | **`@vercel/og` — OG Image PNG** | ~~Edge Function que genera imagen 1200×630 con el nombre y logo de cada tienda dinámicamente.~~ Implementado en Sesión 11. |
| ✅ Hecho | **Lector código de barras** | ~~Activar cámara en POS con `BarcodeDetector` API nativa.~~ Implementado en Sesión 9. |
| ✅ Hecho | **Filtro de fechas en Reportes** | ~~Selector de rangos predefinidos.~~ Implementado en Sesión 11. |
| ✅ Hecho | **Drag-and-drop para orden** | ~~Falta UI con `@dnd-kit`.~~ Implementado en Sesión 11 (grid) y 12 (lista también). |
| ✅ Hecho | **Portal del Cliente** | Registro email+contraseña, historial de pedidos, seguimiento realtime, saldo fiado, reseña Google, eliminar cuenta. Implementado en Sesión 12. |
| 🟢 Baja | **Export CSV/PDF de reportes** | Para contabilidad e impuestos del comerciante. |
| 🟢 Baja | **Feed para Instagram Shopping / Facebook** | Exportar catálogo en formato compatible. |
| 🟢 Baja | **TZ del dueño en ajustes** | Para que el badge Abierto/Cerrado use la zona horaria del negocio, no del cliente. |
| 🟢 Baja | **Auditoría y mejora de landing** | Conversión de `/` (home) — la página que convierte visitantes en comercios registrados. |
| 📌 Pendiente | **Correo corporativo `@tiendaonline.it`** | Configurar buzones corporativos. Opciones evaluadas: **Zoho Mail** (gratis, hasta 5 usuarios — recomendado para arrancar) o **Google Workspace** (~€6/mes/buzón — mejor cuando haya ingresos). Requiere añadir registros MX en Cloudflare DNS (proxy desactivado, nube gris). Buzones mínimos: `hola@`, `soporte@`, `admin@tiendaonline.it`. |
| 🔴 Alta | **Rediseño UX del Wizard de Registro** | Transformar `app/register/page.js` de formulario largo (5 campos juntos) a wizard **campo a campo** (6 mini-pasos). Cada paso muestra UNA sola pregunta con: emoji ilustrativo, explicación en lenguaje cotidiano, ejemplo visual, tip tranquilizador ("puedes cambiarlo después") y validación amigable. Pasos: (1) Nombre del negocio, (2) Dirección web / subdominio con preview en vivo, (3) WhatsApp con explicación de para qué sirve, (4) Correo electrónico, (5) Contraseña con barra de fortaleza visual, (6) Sector / tipo de vendedor. Navegación con Enter para avanzar y barra de progreso lineal. Orientado especialmente a usuarios no técnicos que usan el teléfono. |
| 📌 Pendiente | **Verificación de email al registrarse** | Al crear la cuenta, enviar email de confirmación para verificar que el correo existe. Supabase ya soporta `email_confirm: true` en `createUser()`. **Bloqueador:** el plan gratuito de Supabase solo envía 3 emails/hora. Requiere configurar **Resend** como proveedor SMTP en Supabase primero (Panel Supabase → Auth → SMTP Settings). Una vez activo: quitar el auto-login del Paso 3 y mostrar pantalla "Revisa tu correo 📬" con instrucciones claras. Hacer esto JUNTO con la tarea de Resend (emails transaccionales). |

---

## 17. MONITOREO DE ERRORES — SENTRY

### Proyecto Sentry
- **Organización:** `deibys-david-escalante-rodrigu`
- **Proyecto:** `tiendaonline` (slug: `tiendaonline`)
- **Plataforma:** `javascript-nextjs`
- **Región:** `de.sentry.io` (Europa)
- **Dashboard:** https://deibys-david-escalante-rodrigu.sentry.io
- **DSN:** `https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984`

> ⚠️ El DSN está hardcodeado en los archivos de config (no en `.env`). Si se rota el DSN, actualizar en `sentry.client.config.js`, `sentry.server.config.js`, `sentry.edge.config.js` y `next.config.mjs`.

### Versión instalada
- `@sentry/nextjs` v10.48.0

### Archivos de configuración
| Archivo | Propósito |
|---------|-----------|
| `sentry.client.config.js` | Errores del navegador (React, carrito, checkout). Incluye Session Replay |
| `sentry.server.config.js` | Errores de API routes (Node.js server-side) |
| `sentry.edge.config.js` | Errores del middleware (Edge runtime — routing de subdominios) |
| `next.config.mjs` | Envuelto con `withSentryConfig()` — habilita source maps en builds de Vercel |
| `lib/sentry.js` | Utilidades para capturar errores con contexto de negocio |

### Utilidades (`lib/sentry.js`)
```js
// Captura error con contexto del comercio afectado
capturarError(err, { modulo: 'POS', tiendaId, userId, extra: { ... } })

// Captura aviso (warning, no error)
capturarAviso('mensaje', { modulo: 'Checkout', tiendaId, extra: { ... } })
```

### APIs instrumentadas con `capturarError`
| API | Módulo Sentry | Contexto capturado |
|-----|--------------|-------------------|
| `POST /api/pos` | `POS` | `tienda_id`, `user_id` |
| `GET /api/pedidos` | `Pedidos` | — |
| `POST /api/pedidos` | `Checkout` | `tienda_id`, `cliente_nombre`, `total` |
| `GET/POST/PATCH/DELETE /api/productos` | `Productos` | — |
| `GET /api/reportes` | `Reportes` | — |

### Configuración de Session Replay (cliente)
- `replaysOnErrorSampleRate: 1.0` — Graba el 100% de sesiones que terminan en error
- `replaysSessionSampleRate: 0.05` — Graba el 5% de sesiones normales (para UX insights)
- `maskAllInputs: true` — Oculta campos de texto en las grabaciones (protege datos de clientes)

### Errores ignorados (ruido del navegador)
- `ResizeObserver loop limit exceeded`
- `Non-Error promise rejection captured`
- Errores de red (`Network Error`)
- `ChunkLoadError` (fallos de carga de JS — típico en deploy)

### Source Maps
- Sentry sube source maps automáticamente al hacer `npm run build` en Vercel
- `deleteSourcemapsAfterUpload: true` — Los source maps no quedan expuestos en producción
- Esto permite ver el stack trace con código real (no minificado) en el dashboard de Sentry

### Comportamiento por entorno
- `enabled: process.env.NODE_ENV === 'production'` — Sentry NO captura errores en desarrollo local, solo en producción (Vercel)

---

## 16. HISTORIAL DE SESIONES DE TRABAJO

### [2026-04-12] Sesión 1 — Auditoría global de Supabase + correcciones críticas
- Conectado MCP de Supabase directo. Proyecto correcto: `bripfrfkwahsxtegmils` (no `bpkeqkfbotmbombpubqb`)
- Descubierta desincronización total entre esquema DB y código → añadidas columnas faltantes en `productos`, `clientes`, `pedidos`, `tiendas`
- Corregidas políticas RLS incompletas: INSERT público en pedidos, compras sin política, categorías sin policy de dueño
- Optimizadas policies a `(select auth.uid())`
- Añadidos 6 índices de rendimiento
- Corregido `clientes.full_name NOT NULL` → bloqueaba inserts desde POS
- Añadidas columnas `codigo_barras` y `descripcion` a `productos`
- Corregidos 6 archivos con URLs de subdominio incorrectas para producción
- Migrado `next.config.mjs` de `domains` a `remotePatterns`
- Footer de StoreClient ahora es link viral a tiendaonline.it

### [2026-04-12] Sesión 2 — PWA + Realtime + OG + 404 + OnboardingWizard
- Creado `public/manifest.json` → PWA instalable en iOS/Android
- Creado `public/og-image.svg` → preview social (SVG, no PNG)
- Creado `app/not-found.js` → 404 personalizada con branding
- Activado Supabase Realtime en `pedidos/page.js` → sonido + toast + insert local
- Activado badge de pendientes en `layout.js` → Realtime en sidebar
- Activado OnboardingWizard en `dashboard/page.js`
- Corregido bug en wizard: `some(k => cfg.pagos[k])` → `some(k => cfg.pagos[k]?.habilitado)`

### [2026-04-12] Sesión 4 — Sentry: monitoreo de errores en producción
- Creado team y proyecto `tiendaonline` en Sentry (org: `deibys-david-escalante-rodrigu`, región Europa)
- Instalado `@sentry/nextjs` v10.48.0
- Creados `sentry.client.config.js`, `sentry.server.config.js`, `sentry.edge.config.js`
- `next.config.mjs` envuelto con `withSentryConfig()` — source maps automáticos en Vercel
- Creado `lib/sentry.js` — utilidades `capturarError()` y `capturarAviso()` con contexto de `tienda_id`
- Instrumentadas 5 APIs críticas: POS, Pedidos (GET+POST), Productos, Reportes
- Session Replay activado: 100% en errores, 5% en sesiones normales, inputs enmascarados
- Sentry desactivado en desarrollo local (`enabled: NODE_ENV === 'production'`)

### [2026-04-12] Sesión 3 — Campos faltantes + Catálogo + Cuenta
- Migración DB: `ALTER TABLE tiendas ADD COLUMN horario TEXT`
- `ajustes/page.js` → añadidos campos Instagram (con @ automático) y Horario
- `StoreClient.js` → sidebar del catálogo ahora muestra badge Abierto/Cerrado detectado por hora local
- Creada `dashboard/cuenta/page.js` → cambio de email, cambio de contraseña con re-auth, indicador fortaleza, zona de peligro
- Sidebar del dashboard → añadido link "Mi Cuenta" con icono `UserCircle`
- Actualizado `HISTORIAL_TECNICO.md` con documentación completa del sistema

### [2026-04-13] Sesión 5 — Subdominios Wildcard: `prueba.tiendaonline.it` → Tienda pública

**Objetivo:** Hacer que cada tienda sea accesible por su subdominio propio (`[nombre].tiendaonline.it`) en lugar de la ruta interna (`/store/[nombre]`), para una experiencia SaaS profesional.

**Diagnóstico del problema:**
- El middleware Next.js (`middleware.js`) ya estaba correctamente programado para detectar subdominios.
- El problema estaba en la infraestructura: DNS wildcard no configurado + Coolify (Traefik) no aceptaba rutas wildcard.
- **DNS confirmado:** `nslookup prueba.tiendaonline.it` devolvió IPs de Cloudflare ✅ (wildcard `*` ya estaba en GoDaddy apuntando al proxy de Cloudflare).
- **Error de Coolify:** Al agregar `*.tiendaonline.it` en el campo "Domains", el deploy fallaba con `bash: line 1: https//www.tiendaonline.it: No such file or directory` — bug de bash globbing con el carácter `*` en variables de entorno de Docker exec.
- **Coolify Advanced:** No tiene sección de "Custom Labels" editable manualmente en esta versión.

**Solución implementada — Cloudflare Worker como proxy de subdominios:**

| Componente | Cambio |
|---|---|
| `middleware.js` | Añadido soporte para header `X-Forwarded-Host` (enviado por el Worker) |
| Cloudflare Worker | Nuevo Worker `tiendaonline-subdominios` que intercepta `*.tiendaonline.it/*` |
| Cloudflare Route | `*.tiendaonline.it/*` → Worker (Zone: `tiendaonline.it`) |

**Flujo final:**
```
Usuario → prueba.tiendaonline.it
  ↓ Cloudflare Worker intercepta (Route: *.tiendaonline.it/*)
  ↓ Reenvía a https://tiendaonline.it con headers:
      host: tiendaonline.it
      x-forwarded-host: prueba.tiendaonline.it
  ↓ Next.js middleware lee x-forwarded-host → extrae "prueba"
  ↓ Rewrite interno → /store/prueba
  ↓ ✅ Muestra la tienda "prueba" con URL limpia
```

**Código del Worker (`tiendaonline-subdominios`):**
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const originalHost = request.headers.get('host');
    const targetUrl = 'https://tiendaonline.it' + url.pathname + url.search;
    const newHeaders = new Headers(request.headers);
    newHeaders.set('host', 'tiendaonline.it');
    newHeaders.set('x-forwarded-host', originalHost);
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'manual',
    });
    return fetch(newRequest);
  }
}
```

**Archivos modificados:**
- `middleware.js` → Lee `x-forwarded-host` primero: `req.headers.get('x-forwarded-host') || req.headers.get('host')`
- Cloudflare → Worker + Route configurados externamente (no en el repositorio)

**Resultado:** ✅ Verificado en preview del Worker: `prueba.tiendaonline.it` carga correctamente la tienda con productos, sidebar, categorías y branding.

**Límite del plan Free de Cloudflare Workers:** 100,000 peticiones/día — suficiente para el volumen actual de clientes en la plataforma.

### [2026-04-13] Sesión 6 — Gamificación, Onboarding UX y Refactor de Registro

**Objetivo:** Reducir la fricción al momento de adquirir usuarios y mejorar la retención inicial mediante incentivos visuales gamificados (inspirado en análisis UX competitivo).

**Implementación técnica:**
1. **Wizard de Registro en 3 pasos:** Se reescribió `app/register/page.js` transformándolo de un formulario largo a un asistente interactivo por pantallas. Captura `sector` y `tipo_vendedor` en el paso 2 y los persiste en el JSONB `config_diseno`.
2. **Validación en vivo (API):** Creado el endpoint `GET /api/check-subdominio`. En el paso 1, mientras el usuario escribe, el frontend hace un fetch (con *debounce* de 500ms) devolviendo de inmediato si el subdominio está libre (check verde) o tomado. 
   - **Fix Crítico (Sesión 6.1):** Se detectó que `new URL(req.url)` lanzaba un Error 500 en entornos de producción/Coolify. Se corrigió migrando a `req.nextUrl.searchParams`, lo que estabilizó el flujo de registro.
3. **Gamificación y Checklist:** Modificado `app/dashboard/layout.js` incorporando una barra de progreso lateral fija (0-100%). Evalúa dinámicamente si el usurio ya tiene productos (haciendo un fetch liviano a `/api/productos`) y si activó métodos de pago, sumando porcentaje con diseño estilo gamificado.
4. **Welcome Video Modal:** El componente `components/OnboardingWizard.js` fue convertido en un Modal de Bienvenida en primer plano con un `iframe` de YouTube para un tutorial introductorio por parte del fundador. El estado de cierre se controla vía `sessionStorage`.

### [2026-04-13] Sesión 6.2 — Debugging de Entorno Local (Windows)
- **Problema:** El servidor local mostraba páginas en blanco o errores 500 persistentes incluso tras arreglar el código.
- **Causa:** Bug conocido de NPM/Rollup en Windows (`Cannot find module @rollup/rollup-win32-x64-msvc`). Los archivos de `node_modules` se bloquean y corrompen el build de Next.js.
- **Solución documentada:** Es necesario detener todos los procesos de Node, borrar `node_modules` y `package-lock.json` manualmente y ejecutar `npm install` de nuevo. El código en GitHub/Producción está limpio de este error ya que solo afecta al sistema de archivos local de Windows.

### [2026-04-14] Sesión 7 — Fix crítico: bucle de redirecciones en producción (`ERR_TOO_MANY_REDIRECTS`)

**Síntoma:** `tiendaonline.it` mostraba `ERR_TOO_MANY_REDIRECTS` en todos los navegadores. El sitio era completamente inaccesible.

**Diagnóstico:**
- El bucle era un `302` infinito: `tiendaonline.it → 302 → tiendaonline.it`
- Confirmado con `read_url_content`: "stopped after 10 redirects"
- El middleware Next.js usa `NextResponse.rewrite()` (transparente, sin 302) — **no era la causa**
- La causa real estaba en la capa de infraestructura: **Cloudflare SSL/TLS en modo Flexible**

**Causa raíz:**
```
Cloudflare SSL = Flexible → habla HTTP con el servidor origen (Coolify/Traefik)
Traefik recibe HTTP → redirige a HTTPS (302)
Cloudflare recibe HTTPS del browser → vuelve a enviar HTTP a Traefik
→ LOOP INFINITO
```

**Solución aplicada:**
- Cloudflare → `tiendaonline.it` → SSL/TLS → cambiar de **Flexible** → **Full**
- Con modo Full: Cloudflare habla HTTPS con Traefik → sin redirecciones → resuelto ✅

**Cambios de código también aplicados en esta sesión:**

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `middleware.js` | Eliminado `/api/:path*` del matcher | Era un residuo de debug de Sesión 6 que nunca se limpió |
| `middleware.js` | Restaurado orden de headers: `x-tenant-host` → `x-forwarded-host` → `host` | El Cloudflare Worker envía `x-tenant-host` (no `x-forwarded-host` como estaba en el historial) |
| `next.config.mjs` | Sentry ahora es opcional según `SENTRY_AUTH_TOKEN` | Sin el token, el build podría fallar silenciosamente en Coolify |
| `next.config.mjs` | Añadido `images.unsplash.com` a `remotePatterns` | Necesario para thumbnail del OnboardingWizard |

> ⚠️ **IMPORTANTE — Cloudflare SSL:** Mantener siempre en modo **Full** (nunca Flexible). El modo Flexible es incompatible con Traefik/Coolify que redirige HTTP→HTTPS internamente.

> ⚠️ **Header del Cloudflare Worker:** El Worker `tiendaonline-subdominios` envía `x-tenant-host` (NO `x-forwarded-host`). El middleware lee primero `x-tenant-host`. Si se modifica el Worker, actualizar también el middleware.

### [2026-04-14] Sesión 8 — Landing Page Pro Max + Estandarización Visual + Rediseño Super Admin

#### Parte A — Landing Page y páginas secundarias (sesiones previas del día)

**Objetivo:** Elevar la landing page a un nivel "Pro Max" con tabla de precios completa, toggle mensual/anual y tabla comparativa de features. Estandarizar visualmente todas las páginas públicas bajo un mismo sistema de diseño.

**Cambios implementados:**
- `app/page.js` → Rediseño completo de la landing: sección de precios con 4 niveles (Free, Starter €9/mes, Pro €19/mes, Business €39/mes), toggle de facturación mensual/anual, tabla de comparativa de features colapsable.
- `app/privacy/page.js` → Migrada al sistema de diseño Tailwind unificado (fondo oscuro slate-950, tipografía Inter, glassmorphism cards).
- `app/cookie-policy/page.js` → Ídem, mismo sistema visual.
- `app/contatti/page.js` → Migrada al nuevo sistema de diseño.
- Correcciones de responsividad móvil en el header de la landing (nombre de tienda, menú, etc.)

#### Parte B — Rediseño completo del Panel Super Admin

**Objetivo:** Transformar el panel de administración de un diseño básico blanco/claro a un **dark premium SaaS dashboard** coherente con el branding de la plataforma.

**Tema de diseño aplicado:**
- Fondo principal: `bg-slate-950` con grid de puntos sutil (transparencia 3%)
- Sidebar/Topbar: `bg-slate-900/95 backdrop-blur-xl` con bordes `border-slate-800`
- Cards y paneles: glassmorphism `bg-slate-800/60 backdrop-blur border-slate-700/50`
- Acento principal: `emerald-500` / `emerald-400` con glow effects (`shadow-[0_0_8px_rgba(52,211,153,0.5)]`)
- Animaciones: Framer Motion con stagger delay por tarjeta

**Archivos refactorizados:**

| Archivo | Cambios clave |
|---------|---------------|
| `app/administrador/layout.js` | Sidebar oscuro colapsible con nav items que tienen barra lateral de acento verde con glow; topbar glassmorphism; indicador "Online" pulsante; avatar con gradiente; mobile drawer con X button; grid background; eliminado `UniversalFooter` redundante visualmente pero mantenido en el contenido |
| `app/administrador/page.js` | 6 StatCards en grid con glow blob hover, accentClass por color temático; gráfica de barras animada (height motion animado individualmente por barra); barra de progreso tiendas con glow; tabla de actividad reciente con hover states; badge "Live" animado en el título |
| `app/administrador/tiendas/page.js` | Eliminados todos los inline styles → clases Tailwind; search input con icono embebido; filtros pill con glow del color activo; grid de cards con hover lift (-translate-y-0.5 + shadow); badge de estado con dot pulsante para activos; modal de confirmación con backdrop blur, spring animation y iconos contextuales (ShieldAlert/ShieldCheck/Trash2) |
| `app/administrador/usuarios/page.js` | Tabla desktop con header sticky oscuro y filas con hover; responsive: en móvil se convierte en cards; filtros pill igual que tiendas; badge "sin-tienda" con icono UserX; modal idéntico al de tiendas; columnas adaptadas a `grid-cols-[2fr_1.8fr_1.4fr_1fr_1fr_1.4fr]` |

**Patrones de código establecidos en el panel admin:**
```jsx
// StatCard con glow y accentClass dinámico
<div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl hover:border-slate-600/60 hover:-translate-y-0.5 transition-all">
  <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 ${glowClass}`} />
  <div className={`text-4xl font-black ${accentClass}`}>{value}</div>
</div>

// Badge de estado activo con dot pulsante
<span className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 rounded-full">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
  {dict.adminAttivo}
</span>

// Modal animado con spring
<motion.div initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}>
```

**Dependencias utilizadas (ya existentes):** Framer Motion, Lucide React, Tailwind CSS 3.

> ℹ️ No se modificó ninguna API route ni lógica de negocio. Solo cambios de UI/UX.


### Fase 5: Gamificación del Onboarding Checkout
**Fecha:** 2026-04-15
**Objetivo:** Rediseñar la experiencia de onboarding de nuevas tiendas para guiar al propietario mediante un checklist automático de 16 pasos gamificado, asegurando una configuración completa (dominio, productos, banner, métodos de cobro, etc.) que incentiva el uso de la plataforma.

**Cambios Implementados:**
- `components/DashboardChecklist.js`: Creación de un widget premium tipo acordeón para el sidebar con 16 misiones. Implementación de comprobación híbrida (verificación en base de datos en tiempo real vs checks manuales vía `localStorage`). Animación de barra de progreso.
- `app/dashboard/layout.js`: Refactorización de las consultas (pedidos, productos, clientes) con `Promise.all` para optimizar la carga del estado global del sidebar, removiendo el antiguo widget de validación manual.
- `app/dashboard/page.js`: Eliminación del widget grande del checklist central para liberar espacio de lectura rápida de analíticas.
- **UX/UI:** Uso de `AtSign` en lugar del icono de Instagram (incompatible en versión local), validación de estilos comprimidos para un sidebar de 256px y condicionales visuales de victoria ("Felicidades, eres un experto").

### [2026-04-15] Sesión 9 — Lector POS Nativo y Motor de Cupones

**Objetivo:** Agilizar el terminal Punto de Venta (POS) habilitando escaneo rápido mediante la cámara trasera del dispositivo móvil o webcam. Además, cerrar los flecos del Checklist implementando un panel completo de Cupones en el diseño y vinculando automáticamente las misiones de Banner y Cupón en la base de datos.

**Archivos refactorizados:**

| Archivo | Cambios clave |
|---------|---------------|
| `app/dashboard/pos/page.js` | Incorporación de [API Nativa `BarcodeDetector`](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API) usando la cámara del dispositivo (`facingMode: "environment"`). Implementado loop asíncrono con timeout protector para detectar el producto por el campo `codigo_barras` de forma ultrasónica. Auto-inserción al carrito de compras con notificación toast y oscilador de frecuencia (BEEP) 100% libre de bibliotecas externas. |
| `app/dashboard/diseno/page.js` | Nuevo UI de gestión de cupones mediante un estado transaccional embebido en el campo JSON `config_diseno` de Supabase (`cupones: []`). Opción de descuento por porcentaje o suma fija. |
| `components/DashboardChecklist.js` | Automatización final de gamificación de onboarding. Los checks "Añadir banner" y "Crear cupón" ya no son manuales; reaccionan reactivamente a `tienda.config_diseno.banner_url` y `config_diseno.cupones.length > 0`. |
| `components/StoreClient.js` | Inyección del input para Código Promocional just antes de confirmar la orden de WhatsApp. Calcula descuentos transparentemente informando de cuánto ahorró el cliente (+ info adjunta al mensaje WA). |

> ℹ️ El uso progresivo de API web nativas (como BarcodeDetector y Web Audio API) posiciona estratégicamente al ecosistema para que no dependamos de ZXing y Quagga mejorando considerablemente la métrica First Contentful Paint.

### [2026-04-15] Sesión 10 — Rediseño Premium y Multicanal Social
**Objetivo:** Elevar la estética del panel y el sitio público, eliminando el "ruido visual" mediante la agrupación de navegación y expandiendo la presencia social de las tiendas con un sistema de activadores individuales para redes sociales.

**Implementaciones clave:**

1. **Agrupación de Sidebar (Dashboard):**
   - Refactorización de `app/dashboard/layout.js` para pasar de una lista plana de 11 ítems a 3 grupos colapsables: **Ventas**, **Catálogo** y **Configuración**.
   - Íconos añadidos a las cabeceras de grupo y "Clientes" movido dentro de Catálogo para una jerarquía más lógica.

2. **Footer Universal Premium:**
   - Rediseño de `components/UniversalFooter.js` con estética **Slate-950 Dark**.
   - Efectos de glow esmeralda, bordes gradientes, links estilo "píldora" con glassmorphism y un badge de estado operativo animado para transmitir confianza técnica.

3. **Sistema Multicanal de Redes Sociales:**
   - **Dashboard:** Nueva sección en `Ajustes` con inputs para Facebook, TikTok, Instagram, YouTube, X/Twitter y WhatsApp Business, cada uno con su propio **Master Toggle** de visibilidad.
   - **API:** Mejora del endpoint `/api/tienda` para soportar `config_diseno_patch`, permitiendo fusiones de metadatos JSON sin pérdida de integridad.
   - **Storefront:** Actualización de `StoreClient.js` para renderizar dinámicamente los iconos sociales configurados en la barra lateral del catálogo.

4. **UX Onboarding:**
   - Configuración del Checklist de inicio para que aparezca **contraído por defecto**, evitando saturar al usuario al entrar al dashboard mientras mantiene el acceso rápido a las misiones.

---

### [2026-04-15] Sesión 11 — OG Image Dinámica + Filtro de Fechas en Reportes + Drag-and-Drop de Productos

**Objetivo:** Implementar las 3 mejoras pendientes de mayor impacto en UX y marketing: imagen de previsualización social personalizada por tienda, analítica filtrable por período, y reordenación visual de inventario.

#### 1. OG Image dinámica por tienda (`@vercel/og`)

**Archivo creado:** `app/api/og/[domain]/route.js`

- Runtime: `edge` (sin Node.js, máximo rendimiento en Vercel Edge Network)
- Genera imagen PNG 1200×630px única por tienda usando `ImageResponse` de `next/og`
- Incluye: logo o emoji de la tienda, nombre en tipografía grande, descripción truncada, badge "tiendaonline.it", gradiente de fondo basado en el `color_principal` del comercio
- Fallback genérico si el dominio no existe

**Archivo modificado:** `app/store/[domain]/page.js`
- Añadida función `generateMetadata()` (Server Component) que inyecta `og:image`, `og:title`, `og:description` y `twitter:card` usando la URL `https://tiendaonline.it/api/og/{domain}`
- Ahora cada tienda tiene su propia imagen al compartirse en WhatsApp, Telegram, Twitter y LinkedIn

#### 2. Filtro de fechas en Reportes

**Archivo modificado:** `app/api/reportes/route.js`
- Acepta query params `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
- Filtra pedidos con `.gte('created_at', ...)` y `.lte('created_at', fin_del_dia)`
- Nuevo campo en la respuesta: `graficoDias` — array `[{ fecha: "YYYY-MM-DD", total: number }]` ordenado cronológicamente para el gráfico

**Archivo modificado:** `app/dashboard/reportes/page.js`
- Selector de 5 rangos predefinidos: Hoy / Esta semana / Este mes / Este año / Todo
- Recarga automática al cambiar de rango (sin botón de "aplicar")
- Gráfico de barras de ventas por día: componente `GraficoBarras` puro (solo Tailwind, sin Chart.js ni Recharts). Tooltips al hover. Labels adaptados (muestra 1 de cada N días si hay muchos datos)
- Nueva métrica visible: **Ticket Promedio** (ventas / pedidos)
- Indicador de margen con flecha ArrowUpRight/ArrowDownRight según si es positivo o negativo

#### 3. Drag-and-drop de productos (`@dnd-kit`)

**Paquetes instalados:** `@dnd-kit/core ^6.3.1`, `@dnd-kit/sortable ^10.0.0`, `@dnd-kit/utilities ^3.2.2`

**Archivo creado:** `app/api/productos/reorder/route.js`
- `PATCH /api/productos/reorder`
- Body: `{ items: [{ id, orden }] }`
- Verifica ownership: solo actualiza productos de la tienda del usuario autenticado
- Ejecuta los UPDATEs en paralelo con `Promise.all`

**Archivo modificado:** `app/dashboard/productos/page.js`
- Nuevo componente `SortableProductCard` (useSortable de @dnd-kit)
- Botón "Reordenar" en el header: activa/desactiva el modo drag-and-drop
- En modo reordenar: el grid se envuelve en `DndContext` + `SortableContext` con estrategia `rectSortingStrategy`
- Sensores: `PointerSensor` (mouse, distancia mínima 8px) + `TouchSensor` (touch, delay 200ms) — compatible con móvil
- `DragOverlay`: muestra la tarjeta siendo arrastrada con rotación y borde violeta
- Al soltar: actualiza el estado local con `arrayMove` inmediatamente (optimistic update) y persiste en DB en background
- Banner informativo morado mientras el modo está activo
- El modo drag solo funciona en vista Grid (no Lista) para mantener coherencia visual

> ⚠️ **Nota de deploy:** El campo `orden` ya existía en la tabla `productos`. No se requiere migración de DB.
> ⚠️ **Límite Free de `@vercel/og`:** El runtime `edge` en Vercel Free tiene un límite de 1MB por respuesta y 30s timeout — más que suficiente para estas imágenes OG.

---

### [2026-04-16] Sesión 12 — Correcciones de bugs post-deploy + Portal del Cliente completo

#### Parte A — Correcciones de bugs (arrastradas de Sesión 11)

| Bug | Síntoma | Causa | Fix |
|-----|---------|-------|-----|
| Crash `/dashboard/ajustes` | React Error #130 — pantalla blanca | lucide-react v1.7.0 no incluye iconos de marcas: `Facebook`, `Instagram`, `Youtube`, `Twitter` | Reemplazados con iconos disponibles: `Link`, `AtSign`, `PlayCircle`, `Bird` |
| URL duplicada en Diseño | El subdominio `*.tiendaonline.it` aparecía en la card de Diseño Y en Ajustes | Campo de subdominio estaba en ambas páginas | Eliminado de `diseno/page.js`; botón "Ver Tienda" reajustado (`shrink-0`, icono antes de texto) |
| Botón "Nueva categoría" roto | Al hacer clic aparecía el input pero no se podía guardar | Función `handleCreateCategory()` era un placeholder vacío en el código | Implementada la función completa con `POST /api/categorias` y limpieza del estado |
| Drag-and-drop solo en Grid | En modo Lista, activar "Reordenar" no mostraba handles de arrastre | Condición `isDragMode && viewMode === 'grid'` bloqueaba la vista lista | Eliminada la restricción de viewMode; implementado `SortableListRow` con handle lateral para vista Lista |
| Mensaje WhatsApp de pedidos | Al notificar al cliente por WhatsApp solo salía "PEDIDO CONFIRMADO" con un carácter corrupto (✅ → □) | Emoji incompatible + mensaje sin información de contexto | Reescrita la función `sendWhatsappReminder()` con saludo, número de pedido, lista de productos, info de envío, método de pago y total |

**Formato nuevo del mensaje WhatsApp de notificación:**
```
🛍️ *Hola {nombre}!*

Gracias por tu pedido. Aquí tienes el resumen:

📋 *Pedido {codigo}*
━━━━━━━━━━━━━━━━━━━━━━━
🛒 *Productos:*
  • 2x Producto A — €10.00
  • 1x Producto B — €5.00

🚚 *Envío a domicilio*
  Dirección: Calle Ejemplo 123

💳 *Transferencia bancaria*
  Por favor envíanos el comprobante por este chat.

━━━━━━━━━━━━━━━━━━━━━━━
💰 *Total a pagar: €25.00*

Nos ponemos en contacto contigo para coordinar los detalles. Cualquier duda, escríbenos por aquí. 😊
```

---

#### Parte B — Portal del Cliente (Feature completo)

**Motivación:** Los clientes que compran en el catálogo público pueden ahora registrarse para tener un panel donde ver sus pedidos en tiempo real, consultar su saldo de fiado, editar sus datos y dejar reseñas en Google.

##### Migración de base de datos

```sql
-- Nuevas columnas
ALTER TABLE public.clientes
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN fecha_nacimiento DATE;

ALTER TABLE public.tiendas
  ADD COLUMN link_resena_google TEXT;

CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
```

> ✅ Ejecutado directamente vía Supabase MCP (`execute_sql`) en el proyecto `bripfrfkwahsxtegmils`.

##### Nuevas tablas / columnas

| Tabla | Columna nueva | Descripción |
|-------|--------------|-------------|
| `clientes` | `user_id` | Vincula el CRM con una cuenta de Supabase Auth |
| `clientes` | `fecha_nacimiento` | Opcional — para descuentos de cumpleaños |
| `tiendas` | `link_resena_google` | URL del perfil de Google Reviews del negocio |

##### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `app/api/auth/cliente/route.js` | API completa: `POST` registro, `PUT` actualizar perfil, `DELETE` eliminar cuenta (GDPR) |
| `app/store/[domain]/cuenta/page.js` | Página de registro/login del cliente con 3 vistas: bienvenida con beneficios, formulario de registro, formulario de login |
| `app/store/[domain]/mis-pedidos/page.js` | Portal del cliente con 3 pestañas: Pedidos, Perfil, Cuenta |

##### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `app/dashboard/ajustes/page.js` | Nueva sección "Google Reviews" con campo URL + preview link; campo `linkResenaGoogle` en estado y `handleSave` |
| `components/StoreClient.js` | Modal de éxito tras pedido ahora muestra bloque violeta invitando al cliente a crear su cuenta |

##### Flujo de registro del cliente

```
Cliente llega al catálogo → /store/{domain}/cuenta
  → Pantalla de bienvenida: 4 beneficios visuales + badge privacidad
  → Botón "Crear mi cuenta gratis" → Formulario de registro:
      • Email (obligatorio)
      • Contraseña (obligatorio, mín. 6 caracteres)
      • Nombre (opcional)
      • Teléfono (opcional)
      • Fecha de nacimiento (opcional — "para recibir sorpresas 🎂")
  → POST /api/auth/cliente (registro con supabaseAdmin.auth.admin.createUser)
      • email_confirm: true (acceso inmediato, sin email de verificación)
      • Busca si ya existe un cliente con ese email en la tienda
      • Si existe: vincula user_id al registro existente (historial de compras preservado)
      • Si no existe: INSERT en clientes
  → Login automático con supabase.auth.signInWithPassword
  → Redirige a /store/{domain}/mis-pedidos
```

##### Portal del cliente (`/store/[domain]/mis-pedidos`)

**Requiere sesión activa** — si no hay sesión, redirige a `/cuenta?modo=login`

**Tab: Mis Pedidos**
- Lista todos los pedidos que coinciden con el email del cliente
- Card expandible: estado con badge de color + ícono, fecha, resumen de productos, total
- Seguimiento en **tiempo real** vía `supabase.channel` — canal `UPDATE` en `pedidos`

**Tab: Mi Perfil**
- Ver/editar nombre, teléfono, fecha de nacimiento (inline con toggle editar/guardar)
- Email del usuario (readonly — es la cuenta de Supabase Auth)
- Botón "¿Cómo fue tu experiencia?" → abre `link_resena_google` en nueva pestaña (solo si el dueño lo configuró en Ajustes)

**Tab: Cuenta**
- Saldo de fiado: banner verde (sin deuda) o rojo (deuda pendiente) + total gastado acumulado
- Total gastado en la tienda
- Botón "Cerrar sesión" → `supabase.auth.signOut()` + redirect a catálogo
- Botón "Eliminar cuenta" → confirmación en 2 pasos → `DELETE /api/auth/cliente`:
  - Anonimiza el registro en `clientes` (nombre → "Cliente eliminado", email/tel → null, user_id → null)
  - Borra el usuario de `supabase.auth.admin.deleteUser(userId)`
  - Los pedidos históricos quedan preservados (con cliente anónimo — cumplimiento GDPR)

##### API `POST /api/auth/cliente`

```
Campos requeridos: email, password, domain
Campos opcionales: nombre, telefono, fecha_nacimiento

Validaciones:
- password.length >= 6
- Verifica existencia de tienda por subdominio
- Si email ya registrado → 409 "Email ya tiene una cuenta, inicia sesión"
- Si cliente ya existe en la tienda con ese email → vincula user_id sin crear duplicado
```

##### API `PUT /api/auth/cliente`

```
Header: Authorization: Bearer {token}
Body: { nombre, telefono, fecha_nacimiento }
Actualiza el registro en clientes donde user_id = auth.uid
```

##### API `DELETE /api/auth/cliente`

```
Header: Authorization: Bearer {token}
1. Anonimiza clientes WHERE user_id = auth.uid
2. supabaseAdmin.auth.admin.deleteUser(user.id)
```

##### Google Reviews en Ajustes del dueño

- Nueva sección en `/dashboard/ajustes` entre "Redes Sociales" y "Dirección Web"
- Campo URL con botón "Ver" que abre el link en nueva pestaña
- Tip integrado: cómo obtener el link desde Google Maps
- Se guarda automáticamente junto al resto de ajustes vía `PATCH /api/tienda`
- El campo `link_resena_google` pasa directo al `UPDATE` de Supabase (la API hace `update(updates)` genérico)

##### Actualizaciones del mapa de rutas

| Ruta nueva | Archivo | Descripción |
|------------|---------|-------------|
| `/store/[domain]/cuenta` | `app/store/[domain]/cuenta/page.js` | Login y registro del cliente (3 vistas: bienvenida, registro, login) |
| `/store/[domain]/mis-pedidos` | `app/store/[domain]/mis-pedidos/page.js` | Portal del cliente autenticado |
| `POST /api/auth/cliente` | `app/api/auth/cliente/route.js` | Registro de cliente con email+contraseña |
| `PUT /api/auth/cliente` | `app/api/auth/cliente/route.js` | Actualizar perfil del cliente |
| `DELETE /api/auth/cliente` | `app/api/auth/cliente/route.js` | Eliminar cuenta (GDPR) |

##### Decisiones de arquitectura (Sesión 12)

| Decisión | Razón | Alternativa descartada |
|----------|-------|----------------------|
| Email + contraseña (sin Magic Link) | El dueño quería un registro visual completo con formulario — más confianza para el cliente final | Magic Link (menos fricción pero más frío, sin formulario) |
| `email_confirm: true` en createUser | Acceso inmediato sin bloquear por email. Los clientes del portal son usuarios finales de micronegocios, no empresas | Verificación por email (requiere Resend configurado) |
| Anonimizar en DELETE (no borrar fila) | Los pedidos históricos quedan válidos aunque sin datos del cliente. Cumple GDPR | Borrar la fila de clientes (rompería integridad de pedidos) |
| Vincular por email (no por user_id desde el inicio) | Un cliente puede haber comprado como invitado antes de registrarse — el historial previo queda vinculado | Siempre crear registro nuevo (perdería historial de compras como invitado) |
| Seguimiento Realtime solo en UPDATE | Solo nos interesa notificar cambios de estado al cliente, no los inserts | Escuchar también INSERT y DELETE |

---

### [2026-04-16] Sesión 13 — Rediseño del catálogo público + Página de detalle de producto + Sistema de planes SaaS

---

#### Parte A — Correcciones visuales en Ajustes (arrastradas de Sesión 12)

| Bug | Síntoma | Fix |
|-----|---------|-----|
| Borde amarillo en campo Google Reviews | `focus:ring-yellow-400/40` se veía mal visualmente | Cambiado a `focus:ring-slate-300/60 focus:border-slate-300` (gris neutro) |
| Botón "Abrir" salía fuera del card de Subdominio | Layout `flex-col md:flex-row` desbordaba el contenedor | URL en línea propia con `break-all`; botones debajo en `flex` con `flex-1` en cada uno |

---

#### Parte B — Rediseño completo del catálogo público (`StoreClient.js`)

**Motivación:** El catálogo anterior era funcional pero sin diferenciación visual. Se rediseñó completamente para parecer un e-commerce profesional (referencia: Sodimac / tienda de comida latina).

**Archivo modificado:** `components/StoreClient.js` — reescrito completamente (~500 líneas).

**Nuevas funcionalidades de UI:**

| Elemento | Descripción |
|----------|-------------|
| Navbar top | Logo + nombre de tienda · barra de búsqueda centrada · link "Mi cuenta" · botón carrito con contador |
| Sidebar desktop | Descripción + estado Abierto/Cerrado · filtro de categorías · filtro de precio (4 rangos) · filtro "Solo con stock" · contacto · "Powered by" footer |
| Cards de producto | Ratio 1:1, label de categoría, nombre (2 líneas máx.), descripción preview, precio en color primario, botón "Agregar" → contador +/− inline al añadir |
| Búsqueda en tiempo real | Filtra por nombre + descripción + código de barras. Combinable con filtros de precio y stock |
| Grid responsive | `repeat(2,1fr)` → `repeat(3,1fr)` → `repeat(4,1fr)` según ancho de pantalla |
| Navegación a detalle | Clic en la card navega a `/store/{domain}/producto/{id}` vía `router.push` |
| Carrito persistente | Cart sincronizado con `localStorage` (clave `to_cart_{subdominio}`) — sobrevive entre páginas |
| Limpiar carrito | Al confirmar pedido exitoso, `saveCartToStorage(tienda.subdominio, [])` limpia el localStorage |

**Toda la lógica de negocio fue preservada:** checkout 2 pasos, integración WhatsApp, cupones, zonas de envío, métodos de pago, portal del cliente post-pedido.

---

#### Parte C — Página de detalle de producto

**Archivos creados:**

| Archivo | Descripción |
|---------|-------------|
| `app/store/[domain]/producto/[id]/page.js` | Página Client Component que carga el producto via fetch a la API |
| `app/api/store/[domain]/producto/[id]/route.js` | API pública GET: devuelve producto + tienda + categoría + hasta 8 relacionados |

**Características de la página de detalle:**

- **Navbar propio** con botón "← Nombre de la tienda" (vuelve al catálogo) y botón de carrito con contador en vivo
- **Breadcrumb**: Catálogo › Categoría › Nombre del producto
- **Imagen grande** (ratio 1:1), badge "Sin stock" si aplica, fallback a emoji
- **Información del producto**: nombre, precio (+ precio tachado si hay `precio_antes`), semáforo de stock (verde/amarillo/rojo), descripción en caja destacada, código de barras/SKU
- **Botón "Agregar al carrito"**: al hacer clic se convierte en contador +/− inline + botón "Ver pedido"
- **Botón WhatsApp**: consulta directa por el producto específico
- **Productos relacionados**: grid de la misma categoría (hasta 8), 2→3→4→5 columnas según pantalla

**Carrito compartido entre páginas:**

```
Catálogo (StoreClient) ←──localStorage(to_cart_{domain})──→ Página de detalle
```

Al pulsar "Ver pedido" en la página de detalle: navega a `/store/{domain}?openCart=1`.  
`StoreClient` detecta `?openCart=1` en `useSearchParams` y abre el cajón del carrito automáticamente.

**API `GET /api/store/[domain]/producto/[id]`:**
```
1. Busca tienda por subdominio
2. Busca producto WHERE id = {id} AND tienda_id = tienda.id AND estado = 'activo'
3. Busca relacionados WHERE categoria_id = mismo AND estado = 'activo' LIMIT 8
4. Devuelve: { tienda, producto, categoria, relacionados }
```

---

#### Parte D — Sistema de planes SaaS (4 niveles)

**Motivación:** Monetizar la plataforma con un modelo freemium. El primer mes de registro es Pro gratis (trial). Al vencer, baja automáticamente a Free si no se elige plan. Recordatorio visual 7 días antes del vencimiento del trial.

##### Migración de base de datos

```sql
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS plan_suscripcion TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_fin DATE,
  ADD COLUMN IF NOT EXISTS trial_usado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Tiendas existentes: 30 días de trial desde hoy
UPDATE public.tiendas
SET plan_suscripcion = 'trial',
    trial_fin = CURRENT_DATE + INTERVAL '30 days',
    trial_usado = TRUE
WHERE trial_fin IS NULL;
```

> ✅ Ejecutado vía Supabase MCP (`execute_sql`) el 2026-04-16.

##### Nuevas columnas en `tiendas`

| Columna | Tipo | Notas |
|---------|------|-------|
| `plan_suscripcion` | text | `'trial'` \| `'gratis'` \| `'basico'` \| `'pro'` \| `'grow'` |
| `trial_fin` | date | Fecha de vencimiento del mes gratuito |
| `trial_usado` | boolean | Evita dar un segundo trial a la misma tienda |
| `stripe_customer_id` | text | Pendiente integración Stripe (Sprint 5) |
| `stripe_subscription_id` | text | Pendiente integración Stripe (Sprint 5) |

##### Planes definidos (`lib/planes.js`)

| Plan | Precio | Productos | Features clave |
|------|--------|-----------|----------------|
| **Gratis** | €0 | 50 | POS, WhatsApp checkout, subdominio |
| **Básico** | €15/mes | 500 | + Stripe/PayPal, CSV export, soporte email |
| **Pro** | €25/mes | 5.000 | + Reportes avanzados, cupones, fiados, portal cliente |
| **Grow** | €40/mes | Ilimitados | + Carritos abandonados, puntos, facturación, consultor |

**Lógica de `getPlan(tienda)`:**
```js
// Si plan = 'trial' y trial_fin >= hoy → tratada como Pro
// Si plan = 'trial' y trial_fin < hoy → baja automática a Gratis
// Si plan = 'basico'/'pro'/'grow' → plan correspondiente
```

##### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `lib/planes.js` | Definición de los 4 planes + `getPlan()` + `tieneFeature()` + `maxProductos()` + `FEATURE_REQUIERE` |
| `components/PlanBanner.js` | Banner dinámico en el dashboard según estado del trial/plan |
| `components/UpgradeModal.js` | Modal de bloqueo al intentar usar feature Pro/Básico sin el plan |
| `app/dashboard/planes/page.js` | Página de precios dentro del dashboard con toggle mensual/anual |

##### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `app/api/register/route.js` | Nuevas tiendas arrancan con `plan_suscripcion = 'trial'`, `trial_fin = hoy + 30 días`, `trial_usado = true` |
| `app/dashboard/layout.js` | Importa `PlanBanner` y lo renderiza antes de `{children}`. Añadido link "Planes y precios" en sidebar bajo Configuración |

##### Comportamiento del PlanBanner

| Situación | Banner mostrado |
|-----------|-----------------|
| Trial activo > 7 días | Nada (no molesta) |
| Trial activo ≤ 7 días | Banner amarillo "Tu prueba vence en X días" |
| Trial activo ≤ 3 días | Banner naranja urgente "¡Solo X días!" |
| Trial vencido | Banner rojo permanente "Período de prueba terminado" |
| Plan Gratis (sin trial) | Banner azul suave "Estás en el plan Gratis" |
| Plan Básico/Pro/Grow | Sin banner |

##### Página `/dashboard/planes`

- 4 cards de planes con colores diferenciados (gris / azul / verde / violeta)
- Toggle mensual / anual (descuento 20% en anual)
- Plan actual marcado con badge "ACTUAL" o "TRIAL"
- Si trial activo: banner verde con días restantes
- Botones: "Usar plan Gratis" / "Empezar ahora" / "Contactar" (los de pago muestran alerta provisional hasta integrar Stripe)
- Accesible desde sidebar: Configuración → "Planes y precios"

##### Decisiones de arquitectura (Sesión 13)

| Decisión | Razón | Alternativa descartada |
|----------|-------|----------------------|
| Trial 30 días como 'pro' (no plan separado) | Los dueños experimentan el valor máximo desde el inicio — mayor conversión | Trial de funciones limitadas (experiencia mediocre) |
| Baja automática a Free (no bloquear tienda) | El dueño sigue operando sin interrupción; más tiempo para convertirlo | Bloquear la tienda (experiencia agresiva, genera pérdida de confianza) |
| Recordatorio solo visual en dashboard | El sistema no tiene emails transaccionales aún (Resend pendiente) | Email automático a los 7 días (requiere Resend) |
| Carrito en localStorage (no Context global) | Las páginas de producto y catálogo son rutas diferentes en Next.js — no comparten estado React | Context global (requeriría refactorizar todo el routing del catálogo) |
| Botones de plan con `alert()` provisional | Stripe no está integrado aún — mantiene la UX sin romper nada | Desactivar botones (confuso para el usuario) |

---

#### Rutas nuevas añadidas en Sesión 13

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/store/[domain]/producto/[id]` | `app/store/[domain]/producto/[id]/page.js` | Página de detalle de producto |
| `/dashboard/planes` | `app/dashboard/planes/page.js` | Página de precios y selección de plan |
| `GET /api/store/[domain]/producto/[id]` | `app/api/store/[domain]/producto/[id]/route.js` | API pública para detalle de producto |

#### Roadmap actualizado tras Sesión 13

| Estado | Feature |
|--------|---------|
| ✅ Hecho | Rediseño catálogo público (navbar, sidebar filtros, cards) |
| ✅ Hecho | Página de detalle de producto con productos relacionados |
| ✅ Hecho | Carrito persistente en localStorage entre páginas |
| ✅ Hecho | Sistema de 4 planes (Gratis/Básico/Pro/Grow) con trial 30 días |
| ✅ Hecho | PlanBanner inteligente con alertas escalonadas |
| ✅ Hecho | Página `/dashboard/planes` con toggle mensual/anual |
| 🔴 Pendiente | **Stripe** — cobro real de suscripciones (Sprint 5) |
| 🔴 Pendiente | **Resend** — email de recordatorio del trial por correo |
| 🔴 Pendiente | **Guards de features** — bloqueo con UpgradeModal en cupones, fiados, reportes según plan |
| 🟢 Pendiente | Wizard de registro campo a campo (UX mejorada) |
| 🟢 Pendiente | Correo corporativo `@tiendaonline.it` (Zoho Mail recomendado) |

---

## [2026-04-16] Sesión 14 — Auditoría de Seguridad y Accesibilidad

### Objetivo
Auditoría estática completa del codebase (commit `6360df8`) aplicando los frameworks:
- OWASP Top 10 (seguridad de aplicaciones web)
- WCAG 2.1 AA (accesibilidad)
- Revisión de dependencias y configuración

### Herramienta utilizada
Análisis estático manual con Antigravity AI (sin ejecutar código en producción).

### Puntuaciones obtenidas

| Área | Puntuación |
|---|---|
| Seguridad General | 6.5 / 10 |
| Autenticación & Autorización | 7 / 10 |
| Seguridad de API | 6 / 10 |
| Accesibilidad WCAG 2.1 | 5 / 10 |
| Dependencias | 8 / 10 |

---

### Hallazgos de Seguridad

#### 🔴 Críticos (P0)

| ID | Problema | Archivo |
|---|---|---|
| SEC-01 | **API Key de PostHog hardcodeada** en código fuente (visible en GitHub y bundle cliente) | `components/PostHogProvider.js:7` · `app/api/register/route.js:90` |
| SEC-02 | **Email del admin hardcodeado** en `verifyAdmin()` | `lib/supabase-admin.js:35` |
| SEC-03 | **DSN de Sentry en código fuente** — permite inyectar errores falsos | `next.config.mjs:23` |

#### 🟠 Altos (P1)

| ID | Problema | Archivo |
|---|---|---|
| SEC-04 | Sin Rate Limiting en endpoints de registro | `app/api/register/route.js` · `app/api/auth/cliente/route.js` |
| SEC-05 | Sin validación de formato en datos de entrada (subdominio, email, whatsapp) | `app/api/register/route.js` |
| SEC-06 | Sin Security Headers HTTP (`X-Frame-Options`, `CSP`, etc.) | `next.config.mjs` |
| SEC-07 | `email_confirm: true` bypasea verificación real de email | Ambas rutas de registro |

#### 🟡 Medios (P2)

| ID | Problema | Archivo |
|---|---|---|
| SEC-08 | Middleware confía en headers manipulables (`x-tenant-host`) sin whitelist | `middleware.js:18` |
| SEC-09 | Debug headers expuestos en producción (`x-debug-*`) | `middleware.js:47-50` |
| SEC-10 | UUID interno devuelto innecesariamente en respuesta de registro de cliente | `app/api/auth/cliente/route.js:92` |

---

### Hallazgos de Accesibilidad

| ID | Problema | Nivel WCAG | Archivo |
|---|---|---|---|
| ACC-01 | Botones de nav sin `aria-current="page"` | 4.1.2 (AA) | `app/dashboard/layout.js` |
| ACC-02 | Sidebar móvil sin focus trap ni `role="dialog"` | 2.1.2 (A) | `app/dashboard/layout.js` |
| ACC-03 | Imágenes de productos posiblemente con `alt` genérico | 1.1.1 (A) | `components/StoreClient.js` |
| ACC-04 | `text-slate-400` — contraste 3:1 (mínimo WCAG: 4.5:1) | 1.4.3 (AA) | `app/dashboard/layout.js` |
| ACC-05 | `<html lang="it">` fijo aunque el usuario cambie el idioma | 3.1.2 (AA) | `app/layout.js` |
| ACC-06 | Sin Skip Navigation Link (obligatorio WCAG 2.4.1) | 2.4.1 (A) | `app/layout.js` |

---

### Lo que está bien (no tocar)

- ✅ `.env.local` en `.gitignore` — vars de entorno no subidas a GitHub
- ✅ `SUPABASE_SERVICE_KEY` como variable de entorno (nunca hardcodeada)
- ✅ Lazy singleton para Supabase Admin — patrón correcto
- ✅ Verificación JWT en endpoints PUT/DELETE de clientes
- ✅ Anonimización GDPR en DELETE de cuenta (no borra pedidos, desvincula datos)
- ✅ PostHog con `maskAllInputs: true` — protege contraseñas en grabaciones
- ✅ PostHog desactivado en desarrollo (`opt_out_capturing`)
- ✅ `rel="noopener noreferrer"` en todos los links externos
- ✅ Sentry integrado con `deleteSourcemapsAfterUpload: true`
- ✅ RLS activo en todas las tablas de Supabase

---

## 🗓️ PLAN DE CORRECCIONES — PRÓXIMA SESIÓN (Sesión 15)

> Organizado por fases de menor a mayor esfuerzo. Empezar siempre por FASE 1 (variables de entorno en Coolify PRIMERO, luego el código).

### ⚠️ ORDEN CRÍTICO: Configurar Coolify antes de hacer git push con los cambios

```
1. Ir a Coolify → Variables de entorno del proyecto TIENDAONLINE
2. Añadir las 4 variables nuevas (ver tabla abajo)
3. Solo después: hacer git push con los cambios de código
```

---

### FASE 1 — Variables de entorno (⏱ 25 min)

**Variables a añadir en Coolify + `.env.local`:**

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_BiKU9NPq9aQjxs9EZoVM7DLb6EWuFLwxeZhmU6UNniLF` |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` |
| `ADMIN_EMAIL` | `davidescalanteitalia@gmail.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984` |

**Archivos a modificar:**

| Archivo | Cambio |
|---|---|
| `components/PostHogProvider.js` | `POSTHOG_KEY` → `process.env.NEXT_PUBLIC_POSTHOG_KEY` |
| `app/api/register/route.js` | `api_key:` hardcoded → `process.env.NEXT_PUBLIC_POSTHOG_KEY` |
| `lib/supabase-admin.js` | email hardcoded → `process.env.ADMIN_EMAIL` |
| `next.config.mjs` | DSN hardcoded → `process.env.NEXT_PUBLIC_SENTRY_DSN` |
| `app/administrador/layout.js` | Verificar si tiene email hardcodeado → `process.env.ADMIN_EMAIL` |
| `app/login/page.js` | Verificar si tiene email hardcodeado → `process.env.NEXT_PUBLIC_ADMIN_EMAIL` |

---

### FASE 2 — Validaciones de API (⏱ ~2h)

**Archivo:** `app/api/register/route.js`

Añadir al inicio del handler POST (antes de cualquier lógica de negocio):
```js
// Validaciones de entrada
if (!nombre || !subdominio || !email || !password) {
  return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
}
if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(subdominio)) {
  return NextResponse.json({ error: 'invalid_subdomain' }, { status: 400 })
}
const RESERVED = ['www', 'api', 'admin', 'dashboard', 'login', 'register', 'store', 'app']
if (RESERVED.includes(subdominio)) {
  return NextResponse.json({ error: 'subdomain_reserved' }, { status: 400 })
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
}
if (password.length < 8) {
  return NextResponse.json({ error: 'password_too_short' }, { status: 400 })
}
```

**Archivo:** `app/api/auth/cliente/route.js`

```js
// Validar dominio — evitar path traversal
if (!domain || !/^[a-z0-9-]{1,30}$/.test(domain)) {
  return NextResponse.json({ error: 'Dominio inválido' }, { status: 400 })
}
```

---

### FASE 3 — Security Headers (⏱ 30 min)

**Archivo:** `next.config.mjs`

Añadir bloque de `headers` al `nextConfig`:
```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]
// Añadir dentro de nextConfig: headers: async () => [{ source: '/(.*)', headers: securityHeaders }]
```

**Archivo:** `middleware.js` (líneas 47-50)

```js
// Quitar los headers de debug en producción:
if (process.env.NODE_ENV !== 'production') {
  headers.set('x-debug-hostname-detected', hostname)
  headers.set('x-debug-is-subdomain', isSubdomain.toString())
  headers.set('x-debug-current-host', currentHost || 'none')
}
```

---

### FASE 4 — Accesibilidad (⏱ ~1.5h)

**Archivo:** `app/layout.js`

1. Añadir skip link como primer elemento del `<body>`
2. Añadir script inline para `lang` dinámico desde localStorage

**Archivo:** `app/dashboard/layout.js`

1. `aria-current={isActive ? 'page' : undefined}` en todos los botones de nav
2. `id="main-content"` en el `<main>`
3. `role="dialog" aria-modal="true" aria-label="Menú de navegación"` en sidebar móvil
4. `aria-label="Abrir menú"` / `aria-label="Cerrar menú"` en botones hamburguesa/X
5. Cambiar `text-slate-400` → `text-slate-500` en textos informativos

---

### Checklist de Verificación Post-Correcciones

```bash
# 1. Verificar Security Headers en producción
curl -I https://tiendaonline.it
# Debe mostrar: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

# 2. Verificar que debug headers NO aparecen en producción
curl -I https://tiendaonline.it | grep x-debug
# No debe devolver nada

# 3. Probar validaciones con inputs maliciosos
curl -X POST https://tiendaonline.it/api/register \
  -H "Content-Type: application/json" \
  -d '{"subdominio":"../../../etc","email":"no-es-email","password":"123"}'
# Debe devolver 400 con error descriptivo
```

**Pruebas manuales:**
- [ ] Navegar dashboard solo con teclado → Tab → debe aparecer skip link → Enter → salta al contenido
- [ ] Abrir sidebar móvil → el foco debe quedar dentro del drawer
- [ ] Lector de pantalla (NVDA/VoiceOver) en página dashboard → nav items activos deben decir "página actual"
- [ ] Cambiar idioma a Español → `document.documentElement.lang` debe ser `"es"` (verificar en consola)
- [ ] Registrar tienda con subdominio `www`, `admin`, `api` → debe mostrar error de subdominio reservado

---

> **Nota para la Sesión 15:** Comenzar SIEMPRE por la FASE 1 (Coolify → vars de entorno → git push).
> Las FASES 2-4 pueden hacerse en cualquier orden después.
> Tiempo total estimado: **~6 horas** (puede dividirse en dos sesiones de 3h).

---

## [2026-04-17] Sesión 15 — Correcciones de bugs críticos + Aplicación del Plan de Seguridad

### Objetivo
Revisar el historial técnico completo, diagnosticar bugs acumulados y aplicar las correcciones de seguridad planificadas en la Sesión 14.

---

### Parte A — Bugs corregidos en código

#### Bug 1: Código de pedido online `#C-` → `#WEB-`
- **Archivo:** `app/api/pedidos/route.js`
- **Síntoma:** Los pedidos online generaban código `#C-102` en lugar de `#WEB-102` como documenta la arquitectura.
- **Fix:** Cambiado `#C-${orderNumber}` → `#WEB-${orderNumber}`.

#### Bug 2: `/api/pos` no guardaba `metodo_pago`, `metodo_envio` ni `tipo_venta` en columnas de la tabla
- **Archivos:** `app/api/pos/route.js`, `app/dashboard/pos/page.js`
- **Síntoma:** El INSERT en `pedidos` desde el POS solo incluía `codigo`, `cliente_nombre`, `items`, `total`, `estado`. Las columnas de tipo de pago y venta quedaban NULL.
- **Fix:** La API ahora extrae `metodoPago` del body (nuevo campo) o del `ORDER_META` del `items` JSONB. El INSERT incluye `metodo_pago`, `metodo_envio: 'retiro'`, `tipo_venta: 'POS'`.
- **Fix frontend:** `pos/page.js` ahora envía `metodoPago` como campo explícito en el body del fetch.

#### Bug 3: `/api/pedidos` (checkout online) no guardaba `metodo_pago`, `metodo_envio`, `tipo_venta` ni `cliente_telefono`
- **Archivo:** `app/api/pedidos/route.js`
- **Fix:** El INSERT ahora incluye `metodo_pago`, `metodo_envio`, `tipo_venta: 'Online'`, `cliente_telefono: whatsapp || null`.

#### Bug 4: `/api/og/[domain]` usaba `getSupabaseAdmin` (singleton Node.js) en Edge Runtime
- **Archivo:** `app/api/og/[domain]/route.js`
- **Síntoma:** El Edge Runtime no es compatible con el módulo singleton de Node.js. Podía causar errores silenciosos o imágenes OG vacías en producción.
- **Fix:** Reemplazado `getSupabaseAdmin()` por `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` inline. Los datos de tiendas son públicos (RLS permite SELECT a anon), por lo que usar la anon key es correcto y seguro.

#### Bug 5: Portal `mis-pedidos` filtraba por `meta.email` que nunca se guardaba
- **Archivo:** `app/store/[domain]/mis-pedidos/page.js`
- **Síntoma:** El ORDER_META de los pedidos nunca incluía el campo `email` del comprador (el checkout público no pide email). El filtro `meta.email === email` siempre era false.
- **Fix:** El filtro ahora incluye 3 criterios combinados en OR:
  1. `meta.email === email` (legacy, si algún día se añade el campo)
  2. Comparación de teléfono: `meta.whatsapp` (ORDER_META legacy) O `p.cliente_telefono` (columna nueva) con el teléfono del cliente registrado
  3. `p.cliente_nombre === cliente.nombre` (fallback por nombre)
- También se pasa `telefono` del perfil del cliente a `fetchPedidos`.

#### Bug 6 (seguridad): `/api/clientes` — el abono no verificaba `tienda_id`
- **Archivo:** `app/api/clientes/route.js`
- **Síntoma:** El UPDATE de `deuda_actual` buscaba el cliente solo por `id`, sin verificar que pertenezca a la tienda del usuario autenticado. Un atacante con IDs conocidos podría modificar deudas de clientes de otras tiendas.
- **Fix:** El SELECT y el UPDATE ahora incluyen `.eq('tienda_id', tienda.id)`.

---

### Parte B — Migración de base de datos aplicada

```sql
-- Columnas nuevas en pedidos (faltaban — el código las usaba pero no existían en DB)
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS metodo_pago    TEXT,
  ADD COLUMN IF NOT EXISTS metodo_envio   TEXT,
  ADD COLUMN IF NOT EXISTS tipo_venta     TEXT,
  ADD COLUMN IF NOT EXISTS cliente_telefono TEXT;

-- Migrar datos existentes desde columnas inglés → español
UPDATE public.pedidos
SET
  metodo_pago  = COALESCE(payment_method, metodo_pago),
  tipo_venta   = COALESCE(order_type, tipo_venta)
WHERE metodo_pago IS NULL OR tipo_venta IS NULL;

-- Índices nuevos
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_venta ON public.pedidos(tipo_venta);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_telefono ON public.pedidos(cliente_telefono);
```

#### Políticas RLS añadidas

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `clientes` | `Cliente puede leer su perfil` | `FOR SELECT TO authenticated WHERE user_id = auth.uid()` |
| `clientes` | `Cliente puede actualizar su perfil` | `FOR UPDATE TO authenticated WHERE user_id = auth.uid()` |
| `pedidos` | `Cliente puede leer pedidos de su tienda` | `FOR SELECT TO authenticated WHERE tienda_id IN (SELECT tienda_id FROM clientes WHERE user_id = auth.uid())` |

> ⚠️ Sin estas políticas, el Portal del Cliente no podía leer sus propios datos desde el navegador (el query directo con supabase client fallaba en silencio por RLS).

#### Trigger añadido

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

> El código de `api/auth/cliente` (PUT) seteaba `updated_at` manualmente en el UPDATE. Con el trigger ya no es necesario, pero dejarlo no causa daño (el trigger sobreescribe el valor de todas formas).

---

### Parte C — Correcciones de seguridad (Plan de Sesión 14 aplicado)

#### FASE 1 — Variables de entorno (deshardecodear secrets)

| Archivo | Cambio |
|---------|--------|
| `components/PostHogProvider.js` | `POSTHOG_KEY` literal → `process.env.NEXT_PUBLIC_POSTHOG_KEY` |
| `app/api/register/route.js` | `api_key` hardcodeado → `process.env.NEXT_PUBLIC_POSTHOG_KEY` (solo captura si var existe) |
| `lib/supabase-admin.js` | email admin literal → `process.env.ADMIN_EMAIL \|\| fallback` |
| `app/administrador/layout.js` | `ADMIN_EMAIL` literal → `process.env.NEXT_PUBLIC_ADMIN_EMAIL \|\| fallback` |
| `app/login/page.js` | email admin literal → `process.env.NEXT_PUBLIC_ADMIN_EMAIL \|\| fallback` |
| `next.config.mjs` | DSN Sentry literal → `process.env.NEXT_PUBLIC_SENTRY_DSN \|\| fallback` |
| `sentry.client.config.js` | DSN literal → `process.env.NEXT_PUBLIC_SENTRY_DSN \|\| fallback` |
| `sentry.server.config.js` | DSN literal → `process.env.NEXT_PUBLIC_SENTRY_DSN \|\| fallback` |
| `sentry.edge.config.js` | DSN literal → `process.env.NEXT_PUBLIC_SENTRY_DSN \|\| fallback` |

> ⚠️ **ACCIÓN REQUERIDA:** Añadir en Coolify → Variables de entorno:
> - `NEXT_PUBLIC_POSTHOG_KEY` = `phc_BiKU9NPq9aQjxs9EZoVM7DLb6EWuFLwxeZhmU6UNniLF`
> - `NEXT_PUBLIC_POSTHOG_HOST` = `https://eu.i.posthog.com`
> - `ADMIN_EMAIL` = `davidescalanteitalia@gmail.com`
> - `NEXT_PUBLIC_ADMIN_EMAIL` = `davidescalanteitalia@gmail.com`
> - `NEXT_PUBLIC_SENTRY_DSN` = `https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984`

#### FASE 2 — Validaciones de entrada en APIs

**`app/api/register/route.js`** — añadidas validaciones antes de tocar la DB:
- Campos requeridos: `nombre`, `subdominio`, `email`, `password`
- Regex subdominio: `/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/`
- Lista de subdominios reservados: `www`, `api`, `admin`, `dashboard`, `login`, `register`, `store`, `app`, `administrador`, `cuenta`, `planes`
- Regex email básico
- Contraseña mínimo 8 caracteres

**`app/api/auth/cliente/route.js`** — añadida validación de dominio al inicio del POST:
- Regex dominio: `/^[a-z0-9-]{1,30}$/` — previene path traversal e inyección

#### FASE 3 — Security Headers HTTP

**`next.config.mjs`** — añadido bloque `headers()` con:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-DNS-Prefetch-Control: on`

**`middleware.js`** — eliminados debug headers expuestos en producción (`x-debug-*`). También eliminado el `console.log` del rewrite de subdominios.

---

### Resumen del estado de seguridad post-Sesión 15

| Issue | Estado |
|-------|--------|
| SEC-01: PostHog key hardcodeada | ✅ Movida a env var |
| SEC-02: Email admin hardcodeado | ✅ Movido a env var (con fallback) |
| SEC-03: DSN Sentry en código fuente | ✅ Movido a env var (con fallback) |
| SEC-05: Sin validaciones en API register | ✅ Añadidas validaciones regex + campos requeridos |
| SEC-06: Sin Security Headers | ✅ Añadidos 5 headers en next.config.mjs |
| SEC-08/09: Debug headers expuestos | ✅ Eliminados del middleware |
| Bug abono sin tienda_id | ✅ Corregido |
| RLS Portal del Cliente | ✅ Añadidas 3 políticas |

> ⚠️ SEC-04 (Rate Limiting) sigue pendiente — requiere integración con Upstash Redis o middleware de terceros.

