# HISTORIAL TÉCNICO - TIENDAONLINE

Este documento centraliza la evolución técnica, auditorías y cambios realizados en la plataforma TIENDAONLINE para asegurar coherencia y escalabilidad.

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
- [ ] Activar "Leaked Password Protection" en Supabase Dashboard → Auth → Settings → Password Security.

---

## 🚀 PRÓXIMOS PASOS
- [ ] Módulo de Clientes (CRM Simple) - Listado de clientes recurrentes basado en pedidos.
- [ ] Integración de Catálogos Automáticos (IG/FB).
- [ ] Notificaciones Push/Email para nuevos pedidos.
