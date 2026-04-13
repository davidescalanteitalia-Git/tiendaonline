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
| `estado` | text | 'activo' o 'suspendido' |
| `plan_suscripcion` | text | 'free', 'pro', 'grow' (futuro Stripe) |
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

### Tabla: `clientes` (CRM + Fiados)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `tienda_id` | uuid FK | |
| `nombre` | text | |
| `telefono` | text | |
| `email` | text | |
| `deuda_actual` | numeric | Saldo de fiado pendiente |
| `total_gastado` | numeric | Historial de compras totales |
| `full_name` | text | Columna legacy (NOT NULL removido) — usar `nombre` |
| `phone` | text | Columna legacy — usar `telefono` |
| `updated_at` | timestamptz | |

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
| OG image en SVG | No renderiza en Facebook/LinkedIn | Pendiente migrar a `@vercel/og` |
| Horario detectado en TZ del cliente | El dueño en Madrid, cliente en NY → estado incorrecto | Pendiente campo TZ en ajustes |
| Sin filtro de fechas en reportes | No puedes ver ventas de esta semana vs. el mes | Pendiente selector de rango |
| `items` como JSONB | Dificulta queries SQL avanzadas en reportes | Aceptable por ahora. Migrar si escala. |
| Columnas huérfanas en inglés | Confunden el esquema DB | Mantener para retrocompatibilidad |
| Sin emails transaccionales | Ningún email sale del sistema | Pendiente Resend integration |
| Sin lector de barras activo | `codigo_barras` existe en DB pero cámara no se activa | Pendiente `@zxing/browser` |
| Sin filtro de rango en reportes | Todo el historial siempre | Pendiente UI de filtro |
| Stripe no integrado | Sin modelo de negocio activo | Pendiente Sprint 5 |

---

## 15. ROADMAP — SPRINTS PENDIENTES

| Prioridad | Feature | Descripción |
|-----------|---------|-------------|
| 🔴 Alta | **Stripe B2B** | Cobro mensual a comercios. Planes: Free / Pro (€9/mes) / Grow (€19/mes). Desbloquea: subdominios propios, analítica avanzada, catálogos automáticos IG. |
| 🔴 Alta | **Resend (emails transaccionales)** | Confirmación de registro, resumen de pedido al comprador, notificación al vendedor, recibo de abono de fiado. |
| 🟡 Media | **`@vercel/og` — OG Image PNG** | Edge Function que genera imagen 1200×630 con el nombre y logo de cada tienda dinámicamente. |
| 🟡 Media | **Lector código de barras** | Activar cámara en POS con `BarcodeDetector` API nativa o `@zxing/browser`. El campo `codigo_barras` ya existe en la DB. |
| 🟡 Media | **Filtro de fechas en Reportes** | Selector: Hoy / Esta semana / Este mes / Personalizado. Pasar `desde` y `hasta` como query params a `/api/reportes`. |
| 🟡 Media | **Drag-and-drop para orden** | El campo `orden` ya existe en `productos` y `categorias`. Falta UI con `@dnd-kit` o similar. |
| 🟢 Baja | **Export CSV/PDF de reportes** | Para contabilidad e impuestos del comerciante. |
| 🟢 Baja | **Feed para Instagram Shopping / Facebook** | Exportar catálogo en formato compatible. |
| 🟢 Baja | **TZ del dueño en ajustes** | Para que el badge Abierto/Cerrado use la zona horaria del negocio, no del cliente. |
| 🟢 Baja | **Auditoría y mejora de landing** | Conversión de `/` (home) — la página que convierte visitantes en comercios registrados. |

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
