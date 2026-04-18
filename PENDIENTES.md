# PENDIENTES — TIENDAONLINE
> Tablero de trabajo activo. Actualizar al inicio y al final de cada sesión.
> **Referencia técnica del sistema → ver `HISTORIAL_TECNICO.md`**

---

## 🔴 ALTA PRIORIDAD — Hacer antes de lanzar

| # | Tarea | Detalle |
|---|-------|---------|
| P1 | **Stripe → modo LIVE** | Cambiar `sk_test_` y `pk_test_` por claves de producción en Coolify. Verificar que el webhook sigue funcionando. |
| P2 | **Resend — emails transaccionales** | Confirmar registro, resumen de pedido al comprador, notificación al vendedor, recibo de abono de fiado. Configurar como SMTP en Supabase Auth para desbloquear verificación de email. |
| P3 | **Verificación de email al registrarse** | Activar `email_confirm: true` en `createUser()`. Mostrar pantalla "Revisa tu correo 📬". **Bloqueador:** requiere Resend (P2) primero. |
| P4 | **Rediseño del wizard de registro** | Transformar `app/register/page.js` de formulario largo a wizard campo a campo (6 pasos): (1) Nombre del negocio, (2) Subdominio con preview en vivo, (3) WhatsApp, (4) Email, (5) Contraseña con barra de fortaleza, (6) Sector. Navegación con Enter + barra de progreso. Mobile-first. |
| P5 | **Stripe Connect para pagos en tienda** | Flujo de onboarding para que cada comercio (planes Básico/Pro/Grow) conecte su propia cuenta Stripe. TIENDAONLINE no interviene en el dinero. El flujo Gratis mantiene solo coordinación por WhatsApp. |

---

## 🟡 MEDIA PRIORIDAD — Hacer antes de escalar

| # | Tarea | Detalle |
|---|-------|---------|
| M1 | **Galería de imágenes en catálogo público** | Swipe/carousel entre las hasta 4 fotos del producto en la vista del comprador. |
| M2 | **Tabla de comparación de planes actualizada** | La landing `/` tiene la tabla de features. Actualizar con las nuevas reglas de imágenes (1/2/4 fotos) y Stripe Connect. |
| M3 | **Zona horaria del dueño en ajustes** | Campo TZ en `/dashboard/ajustes`. El badge Abierto/Cerrado usa la TZ del negocio, no del cliente. |
| M4 | **Sistema de reseñas de clientes** | Reseñas con avatar visible. Vinculadas al portal del cliente. |
| M5 | **Correo corporativo `@tiendaonline.it`** | Zoho Mail (gratis, hasta 5 usuarios — recomendado) o Google Workspace (~€6/mes/buzón). Requiere registros MX en Cloudflare DNS (nube gris). Buzones: `hola@`, `soporte@`, `admin@tiendaonline.it`. |

---

## 🟢 BAJA PRIORIDAD — Para después del primer lanzamiento

| # | Tarea | Detalle |
|---|-------|---------|
| B1 | **Export CSV/PDF de reportes** | Para contabilidad e impuestos del comerciante. |
| B2 | **Feed para Instagram Shopping / Facebook** | Exportar catálogo en formato compatible. |
| B3 | **Descuentos de cumpleaños** | La columna `fecha_nacimiento` ya existe en `clientes`. Falta la lógica de descuento automático. |
| B4 | **Filtro por fecha en reportes más avanzado** | Rangos personalizados (hoy ya hay: hoy / semana / mes / año / todo). |

---

## ✅ COMPLETADO RECIENTEMENTE (Sesiones 21–24)

- Reorganización del sidebar del dashboard por frecuencia de uso (POS primero)
- Touch targets WCAG 2.2 mínimo 48px en POS y sidebar
- Acordeón expandible en tarjetas de planes (dashboard + landing pública)
- Acordeón expandible en bloque "Página Web Corporativa" (dashboard + landing pública)
- Soporte de hasta 4 imágenes por producto según plan (columnas `imagen_2/3/4` en DB)
- Corrección del modelo de pagos: TIENDAONLINE no cobra comisión por transacción
- Untracking permanente de `.mcp.json` del repositorio git
