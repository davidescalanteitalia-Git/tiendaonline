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

---

## 🚀 PRÓXIMOS PASOS
- [ ] Módulo de Clientes (CRM Simple) - Listado de clientes recurrentes basado en pedidos.
- [ ] Integración de Catálogos Automáticos (IG/FB).
- [ ] Notificaciones Push/Email para nuevos pedidos.
