# HISTORIAL TÉCNICO - TIENDA_ONLINE (SaaS)

Este documento centraliza el estado actual, la evolución reciente, la arquitectura detallada de cada módulo, y la visión a futuro de la plataforma de e-commerce y gestión financiera **TIENDA_ONLINE**.

---

## 🎯 LA DIRECCIÓN ESTRATÉGICA (Hacia Dónde Vamos)

El objetivo central actual de **TIENDA_ONLINE** es consolidarse como un producto de **Software como Servicio (SaaS)** multi-inquilino. Hemos dejado atrás la concepción de "una simple tienda online" para evolucionar hacia un ecosistema de gestión empresarial integral diseñado para la agilidad móvil — similar a como operan plataformas de talla mundial como Square o Shopify POS, pero optimizadas para micronegocios latinoamericanos y europeos.

**La visión arquitectónica persigue tres pilares:**
1. **Fricción Cero en Ventas:** Terminal de Punto de Venta (POS) ultrarrápida combinada con un catálogo web automatizado vía WhatsApp.
2. **Empoderamiento Financiero:** Otorgarle a los dueños de negocios reportes financieros de nivel corporativo calculados en tiempo real (márgenes de utilidad bruta y neta).
3. **Multi-Tenant Seguro:** La base de datos está securizada con Row Level Security para que cientos de comerciantes puedan usar la app bajo suscripción con un subdominio propio, sin que los datos se crucen jamás.

---

## 🗂️ DESCRIPCIÓN COMPLETA DE TODOS LOS MÓDULOS

La plataforma TIENDA_ONLINE se divide en **dos grandes áreas**: la **Tienda Pública** (visible al cliente comprador) y el **Panel de Administración** (solo visible al dueño del negocio).

---

### 📦 ÁREA 1 — TIENDA PÚBLICA (E-commerce del Comerciante)
**Ruta de código:** `app/store/[subdominio]/`

Esta es la cara visible del negocio en Internet. Un comprador puede acceder a ella a través de la URL única del comercio (`subdominio.tiendaonline.it` o `/store/nombre_tienda`).

#### 🔹 1.1 — Catálogo de Productos
- Muestra todos los productos del negocio en un formato de **Grid de tarjetas visuales** con foto/emoji, nombre y precio.
- Puede alternar entre vista de **cuadrícula (Grid)** y **vista de lista compacta**.
- **Filtros por categoría:** Barra superior de botones horizontales, en móvil como scroll. En Desktop, aparecen como lista vertical en la Sidebar izquierda.
- Los artículos **sin stock** aparecen bloqueados o marcados visualmente para indicar "agotado".

#### 🔹 1.2 — Sidebar de Información de la Tienda
- Visible en pantallas de Desktop (≥ 768px), oculta en móvil.
- Muestra: Logo o emoji del negocio, nombre, descripción corta, estado de apertura (Abierto/Cerrado), horario, y links de contacto (WhatsApp, Instagram, Email, Dirección física).
- El botón de WhatsApp lanza un mensaje predefinido de "Hola, quisiera información sobre..." para capturar leads instantáneamente.

#### 🔹 1.3 — Carrito de Compras Visual
- Botón flotante o barra inferior (según dispositivo) con el contador de ítems en tiempo real.
- Al abrir el carrito se listan los artículos seleccionados con su cantidad, precio unitario y subtotal.
- El cliente puede incrementar o reducir la cantidad de cualquier ítem.

#### 🔹 1.4 — Proceso de Checkout (2 Pasos Sin Fricción)
- **Paso 1 — Datos del cliente:** Nombre, teléfono (WhatsApp del comprador). Opcionalmente email.
- **Paso 2 — Método de Entrega:**
  - **Retiro en tienda (gratis):** El cliente pasa a buscarlo.
  - **Envío a domicilio:** Selección de zona geográfica con precio de envío automático según tarifas configuradas por el dueño.
- El botón final **no requiere pago en línea** para la versión base: Genera un mensaje pre-formateado que se abre directamente en WhatsApp con el pedido completo para que el dueño lo confirme manualmente. Este modelo elimina barreras de adopción en negocios pequeños.

---

### 🛠️ ÁREA 2 — PANEL DE ADMINISTRACIÓN (Backoffice del Dueño)
**Ruta de código:** `app/dashboard/`

Exclusivo para el dueño autenticado. Está protegido por Supabase Auth (JWT). Diseño "Glassmorphism Pro Max" con Tailwind CSS.

---

#### 🔹 2.1 — Módulo: Inicio / Centro de Comando
**Ruta:** `app/dashboard/page.js`

- Panel de bienvenida con el nombre de la tienda.
- **Estadísticas rápidas en tiempo real:** Total de pedidos del día, ingresos del mes, productos con bajo stock, y clientes nuevos.
- **Checklist de configuración inicial** que guía al nuevo comerciante a completar su perfil: subir logo, añadir primer producto, configurar WhatsApp, etc.
- Accesos directos a los módulos más usados (POS, Productos, Pedidos).

---

#### 🔹 2.2 — Módulo: Caja / Terminal POS
**Ruta:** `app/dashboard/pos/page.js` | `app/api/pos/route.js`

El módulo más crítico para operaciones físicas en mostrador.

**Panel Izquierdo — Catálogo Táctil:**
- Grid de botones grandes con emoji/foto, nombre y precio de cada producto.
- **Filtrado por categoría** con barra de botones en la parte superior.
- **Barra de búsqueda** con ícono de escáner (preparado para lectores de código de barras).
- Los productos **sin stock** se bloquean automáticamente y se muestran en escala de grises.
- Al tocar un producto, se añade instantáneamente al ticket de la derecha.

**Panel Derecho — Ticket de Venta:**
- Muestra el nombre del cliente (editable en tiempo real).
- Lista de artículos seleccionados con controles de cantidad `(+)` y `(-)`.
- Botón para eliminar cualquier ítem del ticket con ícono de papelera.
- **Sección de Totales:**
  - Subtotal calculado automáticamente.
  - **Campo de Descuento directo (€):** Permite ingresar un valor de descuento fijo que se resta al subtotal al instante.
  - Total Final (en azul destacado): Subtotal − Descuento.
- **Selector de Método de Pago** (4 botones rápidos):
  - 💵 **Efectivo** — Pago en cash.
  - 💳 **Tarjeta** — Terminal física externa.
  - 📱 **Transferencia** — Bizum / PayPal / Wire.
  - 🤝 **Fiado** — Venta a crédito. Registra la deuda en el CRM de Clientes.
- **Botón "Cobrar":** Confirma la venta. Acciones que dispara automáticamente:
  1. Resta el `stock` de cada producto vendido en la base de datos.
  2. Guarda el pedido en la tabla `pedidos` marcado como `confirmado` / TIPO "POS".
  3. Si el método fue "Fiado", actualiza (o crea) el registro del cliente en la tabla `clientes` con el monto de la deuda.
  4. Muestra un **Modal de Ticket Post-Venta** con todos los detalles, y un botón para **Compartir el Recibo por WhatsApp**.

---

#### 🔹 2.3 — Módulo: Gestión de Productos / Inventario
**Ruta:** `app/dashboard/productos/page.js` | `app/api/productos/route.js`

- Lista todos los productos del comercio con su nombre, precio, stock, categoría y emoji/imagen.
- **Vista Dual:** Alternancia entre grid de tarjetas y tabla de lista compacta.
- **Panel Lateral (Slide-over) de Edición Rápida:** Al tocar un producto se abre un panel deslizante desde la derecha para editar en línea sin cambiar de página.
- **Formulario de Nuevo Producto** con los siguientes campos:
  - Nombre del producto.
  - **Precio de Venta (€)** — Visible al cliente.
  - **Costo Neto (€)** — Costo real de compra/producción. **Oculto al público.** Usado para los reportes financieros.
  - **Margen de Utilidad (% Calculado Automáticamente):** Muestra en tiempo real el porcentaje de ganancia del producto: `((Precio - Costo) / Precio) × 100`. Se colorea en verde si es rentable, rojo si es negativo.
  - Stock disponible.
  - Selector de Categoría.
  - Selector de Emoji.
  - Carga de imagen con **compresión automática** (max 1MB).
  - Fecha de vencimiento (opcional para productos perecederos).
- **Barra de búsqueda** y filtros por categoría en la parte superior.
- **Acciones por producto:** Editar, Eliminar, cambiar stock directamente.

---

#### 🔹 2.4 — Módulo: Gestión de Categorías
**Ruta:** `app/dashboard/categorias/` | `app/api/categorias/route.js`

- Lista las categorías del negocio.
- CRUD completo: Crear, ver, editar y eliminar categorías.
- Las categorías se usan como filtros tanto en el POS como en la tienda pública.
- Orden personalizable por drag-and-drop (planeado).

---

#### 🔹 2.5 — Módulo: Gestión de Pedidos Online
**Ruta:** `app/dashboard/pedidos/` | `app/api/pedidos/route.js`

- Lista todos los pedidos recibidos (Online y POS).
- **KPIs superiores dinámicos:** Total Pendientes, Confirmados, Cancelados, e Ingresos del Período.
- **Panel Lateral (Slide-over) de Detalle:** Al hacer clic en un pedido se abre un panel con info completa del cliente, los ítems pedidos, método de envío, método de pago y estado.
- **Cambio de Estado:** El dueño puede mover el pedido entre `pendiente → confirmado → enviado → cancelado`.
- Diferencia visualmente pedidos de caja (POS) y pedidos del catálogo online.

---

#### 🔹 2.6 — Módulo: CRM de Clientes y Fiados
**Ruta:** `app/dashboard/clientes/` | `app/api/clientes/route.js`

- Lista de todos los clientes registrados en la tienda (creados automáticamente al usar "Fiado" en el POS, o manualmente).
- **Vista de Deuda Pendiente (Fiado):** Destaca en color ámbar los clientes que tienen saldo pendiente con el comercio.
- **Contador Global:** El header muestra el total de dinero "en calle" sumado de todos los clientes deudores.
- **Modal de Abono:** Al tocar "Abonar" en un cliente, se abre un modal dedicado donde el dueño ingresa el monto que el cliente pagó. El sistema:
  1. Resta automáticamente ese monto de la `deuda_actual`.
  2. Actualiza el registro en la base de datos.
  3. Si la deuda llega a 0, el cliente queda "en cero" y desaparece del resaltado ámbar.
- **Creación manual de clientes** con nombre, teléfono y email.
- Búsqueda por nombre o teléfono.

---

#### 🔹 2.7 — Módulo: Reportes Financieros y Analítica
**Ruta:** `app/dashboard/reportes/` | `app/api/reportes/route.js`

El cerebro contable de la plataforma.

**KPIs Principales (tarjetas destacadas):**
- 💰 **Ventas Brutas Totales:** Suma de todos los pedidos confirmados.
- 📈 **Utilidad Neta Real:** `Ventas Totales − Costos de Mercancía Vendida`. El primer número verdadero de ganancia.
- **% de Margen:** Porcentaje de rentabilidad real. Colorimetría dinámica (verde si es sano, rojo si es deficitario).
- 📉 **Costo de Inversión:** Total de costos incurridos en los productos vendidos.
- 🤝 **Total en Fiado:** Suma de ventas que quedaron registradas como crédito sin cobrar.

**Ranking de Productos:**
- Top 5 productos más vendidos por rotación (unidades) y por ingresos generados.
- Iconos visuales con emoji de cada producto para facilitar lectura rápida.

**Resumen Operativo:**
- Total de pedidos completados registrados en el sistema.

---

#### 🔹 2.8 — Módulo: Diseño y Personalización de la Tienda
**Ruta:** `app/dashboard/diseno/` | `app/api/me/route.js`

- **Branding:** Subir logo, imagen de portada (banner), color primario de la tienda (picker hexadecimal).
- **Configuración del Catálogo:** Mostrar/ocultar stock público, activar/desactivar el carrito de compras, modo solo consulta.
- **Métodos de Pago Aceptados:** Configura cuáles métodos verá el comprador en el checkout (Transferencia, Efectivo, QR, etc.).
- **Zonas de Envío:** Configuración de zonas con costos personalizados por zona geográfica.
- **Horarios de Atención:** Define los días y horarios en que la tienda aparece como "Abierta" o "Cerrada" en el catálogo público.

---

#### 🔹 2.9 — Módulo: Ajustes de la Cuenta
**Ruta:** `app/dashboard/ajustes/`

- Datos del comerciante: Nombre del negocio, subdominio, descripción.
- Datos de contacto: WhatsApp, Instagram, Email, Dirección física.
- **Subdominio personalizado:** Define la URL pública de su tienda (`mitienda.tiendaonline.it`).
- Selector de idioma de la interfaz (Español, Italiano, Inglés).
- **Gestión de cuenta:** Cambiar contraseña, cerrar sesión.

---

## ✅ PASOS EJECUTADOS RECIENTEMENTE

| # | Módulo | Estado | Detalles |
|---|---|---|---|
| 1 | **POS — Descuentos** | ✅ Completado | Input de descuento fijo (€) que ajusta el total en tiempo real antes de cobrar |
| 2 | **POS — Método de Pago Fiado** | ✅ Completado | Conectado al módulo CRM para registrar la deuda automáticamente |
| 3 | **POS — Ticket Post-Venta** | ✅ Completado | Modal de resumen de cobro con botón "Compartir por WhatsApp" |
| 4 | **Productos — Campo Costo** | ✅ Completado | Costo oculto al público + Cálculo automático de % de Margen de Ganancia |
| 5 | **CRM Clientes / Fiados** | ✅ Completado | Vista, deuda en tiempo real, modal de Abono, creación manual de clientes |
| 6 | **Reportes Financieros** | ✅ Completado | Ventas Brutas, Costos, Utilidad Neta, Margen %, Ranking de productos |
| 7 | **Navegación Actualizada** | ✅ Completado | Módulos CRM y Reportes añadidos al sidebar del dashboard |
| 8 | **Git / Deploy** | ✅ Completado | Todos los cambios subidos a GitHub rama `main` |

---

## 👁️ OBSERVACIONES TÉCNICAS Y RIESGOS

- **Row Level Security (RLS) en Supabase:** Al ser un SaaS, toda nueva tabla que se cree debe llevavar el filtro `tienda_id` obligatorio, de lo contrario existe riesgo de fuga de datos entre inquilinos.
- **Costos en Reportes:** El cálculo de Utilidad Neta cruza los costos que tenía el producto en el momento de la venta. Si el dueño edita el costo de un producto después de venderlo, el reporte histórico se verá afectado. Para mayor precisión futura debería guardarse una snapshot del costo en el momento de la transacción.
- **Fiado sin nombre completo:** Si el dueño no ingresa el nombre real del cliente en el POS (deja "Cliente Local"), el sistema no registra la deuda en el CRM. Esto es por diseño para ventas anónimas, pero puede generar fiados que no quedan registrados si el operador no coloca el nombre.
- **JSONB en pedidos:** La información del método de pago y envío se guarda dentro del array `items` como un ítem especial `ORDER_META`. Esto es flexible pero puede dificultar queries SQL directas en reportes futuros avanzados.

---

## 🚀 ROADMAP — Próximos Sprints

| Prioridad | Módulo | Descripción |
|---|---|---|
| 🔴 Alta | **Stripe Billing / Suscripciones** | Cobros B2B mensuales/anuales a los comerciantes por usar la plataforma (planes Free, Pro, Grow). Desbloquea módulos premium según plan. |
| 🟡 Media | **Notificaciones de Email** | Integración con Resend para emails transaccionales: confirmación de pedido, recibo de pago, registro de abono. |
| 🟡 Media | **Lector de Código de Barras** | Activar la cámara del dispositivo para escanear barcodes directamente desde el POS usando librerías HTML5. |
| 🟢 Baja | **PWA / App Instalable** | Añadir `manifest.json` y Service Worker para que el dashboard sea instalable como app nativa en iOS/Android. |
| 🟢 Baja | **Catálogos Automáticos IG/FB** | Exportar el catálogo de productos como feed compatible para Instagram Shopping y Facebook Marketplace. |

---

---

### [2026-04-12] — Auditoría Global de Conexión Supabase + Correcciones de Calidad

**Objetivo:** Revisar que todas las páginas y APIs estén correctamente conectadas a Supabase, sin fugas de datos, y con patrones de código consistentes en toda la plataforma.

#### ✅ Estado global confirmado (sin errores)

| Módulo | Auth | API | Supabase | Estado |
|--------|------|-----|----------|--------|
| `lib/supabase.js` | — | — | `createClient` con vars públicas | ✅ OK |
| `lib/supabase-admin.js` | JWT `getUser()` | Singleton lazy | `SERVICE_KEY` con `autoRefreshToken: false` | ✅ OK |
| `dashboard/layout.js` | `getSession()` → redirect `/login` | `/api/me` | Bearer token | ✅ OK |
| `dashboard/page.js` | `getSession()` | `/api/me` + `/api/pedidos` + `/api/productos` | Bearer token | ✅ OK |
| `dashboard/productos` | `getSession()` | `/api/productos` + `/api/categorias` | Bearer token | ✅ OK |
| `dashboard/compras` | `getSession()` | `/api/compras` + `/api/productos` + `/api/categorias` | Bearer token | ✅ OK |
| `dashboard/categorias` | `getSession()` | `/api/categorias` | Bearer token | ✅ OK |
| `dashboard/pedidos` | `getSession()` | `/api/pedidos` + `/api/pedidos/[id]` | Bearer token | ✅ OK |
| `dashboard/pos` | `getSession()` | `/api/pos` | Bearer token | ✅ OK |
| `dashboard/clientes` | `getSession()` | `/api/clientes` | Bearer token | ✅ OK |
| `dashboard/reportes` | `getSession()` | `/api/reportes` | Bearer token | ✅ OK |
| `dashboard/diseno` | `getSession()` | `/api/tienda` PATCH | Bearer token | ✅ OK |
| `dashboard/ajustes` | `getSession()` | `/api/tienda` PATCH | Bearer token | ✅ OK |
| `store/[domain]` | — (público) | `getSupabaseAdmin()` directo (Server Component) | `SERVICE_KEY` server-side | ✅ OK |
| `administrador/layout.js` | `getSession()` + email check | — | — | ✅ OK |
| `administrador/page.js` | Cookie/session | `/api/admin/stats` | `verifyAdmin()` | ✅ OK |
| `administrador/tiendas` | Cookie/session | `/api/admin/tiendas` | `verifyAdmin()` | ✅ OK |
| `administrador/usuarios` | Cookie/session | `/api/admin/usuarios` | `verifyAdmin()` | ✅ OK |
| `login/page.js` | `signInWithPassword()` | — | Supabase Auth client | ✅ OK |
| `register/page.js` | — | `/api/register` | `admin.createUser()` | ✅ OK |

#### 🔧 Bugs corregidos

**`app/dashboard/pos/page.js` — ArrowRight SVG duplicado eliminado**
- El ícono `ArrowRight` estaba definido como función SVG manual al final del archivo, conflictando con el import potencial de lucide-react.
- Fix: añadido `ArrowRight` al import de lucide-react. Eliminada la función SVG manual.

**`app/dashboard/page.js` — KPI "Lealtad" hardcodeado al 82%**
- El cuarto KPI del Centro de Comando mostraba `82%` fijo, sin ninguna conexión con datos reales.
- Fix: se añadió fetch a `/api/clientes` en el `Promise.all()` inicial. El KPI ahora calcula el porcentaje de clientes sin deuda pendiente vs. total de clientes registrados. Título cambiado a "Clientes al Día".

**`app/api/stats/route.js` — Cliente Supabase instanciado directamente**
- Esta API creaba su propio `createClient()` en lugar de usar el singleton `getSupabaseAdmin()`.
- Fix: migrado a `getSupabaseAdmin()`. Añadido `export const dynamic = 'force-dynamic'` para evitar respuestas cacheadas en producción.

#### 📋 Script de seguridad RLS generado

Creado `supabase/rls_check_and_fix.sql` con:
- Query para verificar políticas activas en `pedidos` y `clientes`.
- Fix idempotente para crear la política `"Public can insert orders"` en `pedidos` si no existe (necesaria para el checkout del catálogo público donde el comprador es anónimo).
- Fix para habilitar RLS y crear política `"Dueño gestiona sus clientes"` en la tabla `clientes`.
- Query final de verificación del estado de RLS en todas las tablas del sistema.

**✅ Ejecutado directamente vía MCP de Supabase** — Ver sección siguiente.

#### Estado de .env.local

El archivo `.env.local` está vacío. Las variables de entorno están configuradas directamente en el entorno de despliegue (Vercel). Para desarrollo local se deben copiar desde Supabase → Project Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=https://[proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-role-key]
```

---

### [2026-04-12] — Auditoría y Migración Directa en Supabase (vía MCP)

**Proyecto Supabase:** `bripfrfkwahsxtegmils` · Región: `eu-west-2` · Estado: `ACTIVE_HEALTHY`

#### 🔴 CRÍTICO resuelto — Desincronización total entre esquema DB y código

Al conectar el MCP de Supabase directamente, se descubrió que el esquema real de la base de datos no tenía las columnas que el código espera. Esto causaba que **ningún módulo funcionara correctamente** con datos reales.

##### Columnas faltantes añadidas por tabla:

**`productos`** — Añadidas: `emoji`, `imagen_url`, `estado` (text, default 'activo'), `categoria_id` (FK → categorias). Sincronizado `is_active` → `estado` en registros existentes.

**`clientes`** — La tabla tenía `full_name`, `phone`, `total_spent` en inglés. El código usa `nombre`, `telefono`, `deuda_actual`, `total_gastado`. Añadidas las columnas en español + `updated_at`. Datos existentes migrados.

**`pedidos`** — La tabla tenía `status`, `order_type`, `payment_method` en inglés. El código usa `codigo`, `cliente_nombre`, `items` (JSONB), `estado`. Añadidas todas las columnas. `status` → `estado` sincronizado.

**`tiendas`** — Faltaban: `descripcion`, `instagram`, `email`, `direccion`, `emoji`, `aceptar_pedidos`, `enviar_whatsapp`, `mensaje_post_pedido`, `updated_at`. Todas añadidas con valores por defecto correctos.

#### 🔴 CRÍTICO resuelto — Políticas RLS incompletas

Estado real encontrado vs. lo esperado:

| Tabla | Problema encontrado | Fix aplicado |
|-------|--------------------|-|
| `pedidos` | Sin política INSERT pública → pedidos online no se grababan | ✅ Creada `"Público puede crear pedidos"` (anon + authenticated) |
| `compras` | Sin ninguna política → módulo de compras completamente bloqueado | ✅ Creada `"Dueño gestiona sus compras"` (ALL authenticated) |
| `categorias` | Solo SELECT público, sin política para el dueño → el dueño no podía crear/editar categorías | ✅ Creada `"Dueño gestiona sus categorias"` (ALL authenticated) |
| `pedidos`, `productos`, `clientes`, `tiendas` | Usaban `auth.uid()` sin wrapper → re-evaluación por fila, lento a escala | ✅ Migradas a `(select auth.uid())` optimizado |

#### ⚡ Índices de rendimiento añadidos

| Índice | Tabla | Columna |
|--------|-------|---------|
| `idx_tiendas_user_id` | tiendas | user_id |
| `idx_productos_tienda_id` | productos | tienda_id |
| `idx_productos_categoria_id` | productos | categoria_id |
| `idx_pedidos_tienda_id` | pedidos | tienda_id |
| `idx_pedidos_created_at` | pedidos | created_at DESC |
| `idx_clientes_tienda_id` | clientes | tienda_id |

#### Estado final de políticas RLS (todas las tablas):

| Tabla | RLS | Políticas |
|-------|-----|-----------|
| `tiendas` | ✅ | Dueño maneja su tienda (ALL) + Publico lee tiendas (SELECT) |
| `productos` | ✅ | Dueño maneja sus productos (ALL) + Publico lee productos (SELECT) |
| `categorias` | ✅ | Dueño gestiona sus categorias (ALL) + Lectura pública (SELECT) |
| `pedidos` | ✅ | Dueño maneja sus pedidos (ALL) + Público puede crear pedidos (INSERT) |
| `compras` | ✅ | Dueño gestiona sus compras (ALL) ← **nuevo** |
| `clientes` | ✅ | Dueño maneja sus clientes (ALL) |

---

## Sesión 2026-04-12 — Verificación completa + PWA + Migraciones adicionales vía MCP

### Verificación en vivo con MCP Supabase (project: `bripfrfkwahsxtegmils`)

Se conectó directamente el MCP de Supabase y se auditaron todas las tablas y políticas en tiempo real. Resultado del scan:

**Esquema confirmado como OK:**
- `fecha_vencimiento` (date) ya existe en `productos` y `compras` — no requirió migración
- Todas las 10 políticas RLS confirmadas activas y correctas
- Las 6 tablas tienen RLS habilitado

**3 problemas nuevos detectados y resueltos:**

| Problema | Impacto | Fix aplicado |
|----------|---------|-------------|
| `clientes.full_name` tenía `NOT NULL` constraint | Cada INSERT desde POS/CRM fallaba silenciosamente porque el código inserta en `nombre`, no en `full_name` | ✅ Dropped NOT NULL, set DEFAULT '' + sincronizados datos existentes `full_name → nombre`, `phone → telefono` |
| `productos` no tenía `codigo_barras` ni `descripcion` | El POS scanner no puede guardar/buscar por código de barras. La descripción de productos en español se perdía | ✅ Añadidas columnas `codigo_barras` y `descripcion`. Datos migrados desde `barcode` y `description` |
| Columnas inglesas huérfanas (`barcode`, `description`, `is_active`) | Columnas muertas que confunden el esquema pero no bloquean operaciones | Mantenidas para retrocompatibilidad. Las columnas españolas son las activas |

### PWA instalable — añadido en esta sesión

**`/public/manifest.json`** — Creado con:
- `start_url: /dashboard` → abre directo en el panel
- `display: standalone` → pantalla completa sin barra del navegador
- `theme_color: #0f172a` → barra de estado oscura, acorde al diseño
- **Shortcuts:** acceso directo a POS y Pedidos al mantener pulsado el ícono (Android)

**`app/layout.js`** — Actualizado con:
- `manifest: '/manifest.json'` en metadata de Next.js
- `viewport-fit=cover` para iPhone con notch
- `apple-mobile-web-app-capable` + `status-bar-style: black-translucent`
- `apple-touch-icon` → `/logo.png`

Resultado: los dueños de tiendas pueden instalar TIENDAONLINE como app nativa en iPhone y Android desde el navegador, accediendo a pantalla completa y con atajos directos al POS.

### Estado del proyecto tras esta sesión

**Completado (Sprints 1-4):**
- ✅ Arquitectura multi-tenant con Supabase + RLS
- ✅ Auth JWT completo (login, registro, admin)
- ✅ CRUD inventario completo (productos + categorías + compras)
- ✅ POS móvil (caja, fiado, recibo por WhatsApp)
- ✅ Catálogo público por subdominio (`/store/[domain]`)
- ✅ CRM clientes + sistema de fiados/abonos
- ✅ Reportes de rentabilidad (ventas, costos, utilidad neta, top productos)
- ✅ Ajustes de tienda + diseño personalizable
- ✅ Panel de administración SaaS (gestión de tiendas y usuarios)
- ✅ PWA instalable (manifest.json + meta tags iOS/Android)

**Pendiente (Sprint 5 + operaciones):**
- ⏳ Stripe — suscripciones para planes Pro/Grow
- ⏳ SMTP → activar Leaked Password Protection en Supabase Auth
- ⏳ DNS Resend → emails transaccionales
- ⏳ `og-image.png` → imagen social para compartir en WhatsApp/redes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                