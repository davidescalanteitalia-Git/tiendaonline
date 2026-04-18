# PENDIENTES — TIENDAONLINE
> Tablero de trabajo activo. Actualizar al inicio y al final de cada sesión.
> **Referencia técnica del sistema → ver `HISTORIAL_TECNICO.md`**

---

## 🔴 ALTA PRIORIDAD — Hacer antes de lanzar

| # | Tarea | Detalle |
|---|-------|---------|
| P1 | **Stripe → modo LIVE** | Cambiar `sk_test_` y `pk_test_` por claves de producción en Coolify. Verificar que el webhook sigue funcionando. |
| P2 | **Resend — emails transaccionales** | Sin esto, el sistema no envía ningún email: ni bienvenida, ni confirmación de pedido, ni aviso al vendedor. Es el mayor problema de retención. Integrar Resend + secuencia de 5 emails onboarding días 0-7. Configurar como SMTP en Supabase Auth. |
| P3 | **Verificación de email al registrarse** | Activar `email_confirm: true` en `createUser()`. Mostrar pantalla "Revisa tu correo 📬". **Bloqueador:** requiere Resend (P2) primero. |
| P4 | **Rediseño del wizard de registro** | Transformar `app/register/page.js` de formulario largo a wizard campo a campo (6 pasos): (1) Nombre del negocio, (2) Subdominio con preview en vivo, (3) WhatsApp, (4) Email, (5) Contraseña con barra de fortaleza, (6) Sector. Navegación con Enter + barra de progreso. Mobile-first. |
| P5 | **Stripe Connect para pagos en tienda** | Flujo de onboarding para que cada comercio (planes Básico/Pro/Grow) conecte su propia cuenta Stripe. TIENDAONLINE no interviene en el dinero. El flujo Gratis mantiene solo coordinación por WhatsApp. |
| P6 | **Correo corporativo `@tiendaonline.it`** | Activar Zoho Mail (gratis hasta 5 buzones). Requiere registros MX en Cloudflare DNS (proxy desactivado). Buzones mínimos: `hola@`, `soporte@`, `admin@tiendaonline.it`. Sin esto el soporte no es creíble. |

---

## 🟡 MEDIA PRIORIDAD — Hacer antes de escalar

### Features técnicos
| # | Tarea | Detalle |
|---|-------|---------|
| M1 | **Galería de imágenes en catálogo público** | Swipe/carousel entre las hasta 4 fotos del producto en la vista del comprador. |
| M2 | **Catálogo Instagram / Facebook** | Marcado como 🔜 en la landing y planes (Pro/Grow). Exportar catálogo en formato compatible con Meta Catalog Manager. |
| M3 | **Sistema de colaboradores multi-usuario** | Ver especificación completa abajo ↓ |
| M4 | **Zona horaria del dueño en ajustes** | Campo TZ en `/dashboard/ajustes`. El badge Abierto/Cerrado usa la TZ del negocio, no del cliente. |
| M5 | **Sistema de reseñas de clientes** | Reseñas con avatar visible. Vinculadas al portal del cliente. |

---

### 📋 ESPECIFICACIÓN COMPLETA — Sistema de Colaboradores (M3)

> Este es un feature grande con impacto en DB, auth, UI y cada módulo del dashboard. Leer completo antes de implementar.

#### Concepto general
El dueño de la tienda puede invitar a colaboradores (empleados, socios) para que accedan al dashboard con permisos limitados. Cada plan define cuántos colaboradores puede tener:

| Plan | Usuarios totales | Colaboradores extra |
|------|-----------------|---------------------|
| Gratis | 1 (solo el dueño) | 0 |
| Básico | 2 (dueño + 1) | 1 |
| Pro | 3 (dueño + 2) | 2 |
| Grow | 5 (dueño + 4) | 4 |

#### Permisos disponibles (el dueño asigna cuáles activa por colaborador)

| Permiso | Módulo que habilita | Descripción |
|---------|--------------------|-|
| `vender` | `/dashboard/pos` | Puede usar el POS y registrar cobros |
| `pedidos` | `/dashboard/pedidos` | Puede ver y gestionar pedidos |
| `inventario` | `/dashboard/productos`, `/dashboard/compras` | Puede ver/editar productos y registrar restock |
| `clientes` | `/dashboard/clientes` | Puede ver clientes y registrar abonos de fiado |
| `reportes` | `/dashboard/reportes` | Puede ver los reportes financieros (solo lectura) |
| `configurar` | `/dashboard/ajustes`, `/dashboard/diseno`, `/dashboard/categorias` | Puede cambiar ajustes, diseño y categorías |

> ⚠️ El permiso `configurar` incluye acceso a `/dashboard/planes` — el dueño debe decidir si quiere que un colaborador lo tenga. Por defecto viene desactivado.

#### Qué NO puede hacer ningún colaborador (siempre bloqueado)
- Ver los **costos de productos** (campo `costo` — solo el dueño)
- Acceder a `/dashboard/planes` y cambiar la suscripción
- Invitar o eliminar otros colaboradores
- Eliminar la tienda o la cuenta

#### Cambios técnicos requeridos

**1. Base de datos (Supabase)**
```sql
-- Nueva tabla
CREATE TABLE colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_id uuid REFERENCES tiendas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nombre text,
  estado text DEFAULT 'pendiente', -- 'pendiente' | 'activo' | 'bloqueado'
  permisos jsonb DEFAULT '{}',
  -- Ejemplo permisos: {"vender":true,"pedidos":true,"inventario":false,"clientes":false,"reportes":false,"configurar":false}
  created_at timestamptz DEFAULT now()
);

-- RLS: el dueño gestiona sus colaboradores
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dueno_gestiona" ON colaboradores
  FOR ALL USING (
    tienda_id IN (SELECT id FROM tiendas WHERE user_id = (select auth.uid()))
  );
CREATE POLICY "colaborador_se_ve" ON colaboradores
  FOR SELECT USING (user_id = (select auth.uid()));
```

**2. API routes nuevas**
- `GET /api/colaboradores` — lista colaboradores de la tienda
- `POST /api/colaboradores` — invitar por email (envía email con link de aceptación via Resend)
- `PATCH /api/colaboradores/[id]` — actualizar permisos o bloquear
- `DELETE /api/colaboradores/[id]` — eliminar colaborador

**3. Middleware — detección de colaborador**
En `middleware.js` o en `app/dashboard/layout.js`: al cargar el dashboard, detectar si el usuario autenticado es dueño o colaborador. Si es colaborador, leer sus `permisos` y ocultar/bloquear los módulos sin acceso.

**4. UI — Nueva página `/dashboard/equipo`**
- Lista de colaboradores con nombre, email, estado y permisos activos
- Botón "Invitar colaborador" (solo si el plan lo permite)
- Toggle switches para cada permiso por colaborador
- Badge del plan actual con límite: "2 de 3 colaboradores usados"

**5. Cambios en el sidebar (`app/dashboard/layout.js`)**
- Ocultar items del menú según permisos del colaborador
- El colaborador sin permiso `reportes` no ve "Reportes" en el sidebar
- El colaborador sin permiso `configurar` no ve "Ajustes" ni "Diseño"
- El colaborador nunca ve "Planes" ni "Mi Cuenta"

**6. Cambios en cada API route existente**
Cada API route debe verificar si el requester es dueño O colaborador con el permiso correcto:
```js
// Ejemplo en /api/pos
const esColaborador = await checkColaboradorPermiso(token, tienda_id, 'vender')
if (!esDueno && !esColaborador) return 403
```

**7. Protección del campo `costo`**
En `/api/productos` (GET), si el requester es colaborador → devolver productos SIN el campo `costo`. El margen/utilidad nunca es visible para colaboradores.

**8. Landing y planes — texto actualizado**
Reemplazar el feature 🔜 de colaboradores con los límites correctos por plan una vez implementado. Los textos de la landing y `PLAN_CONFIG` en `planes/page.js` ya tienen 🔜 hasta que esto esté listo.

#### Flujo de invitación
```
Dueño → escribe email del colaborador → POST /api/colaboradores
  → INSERT colaboradores(estado: 'pendiente')
  → Resend envía email al colaborador con link: /aceptar-invitacion?token=xxx
  → Colaborador hace clic → se registra o inicia sesión
  → UPDATE colaboradores(estado: 'activo', user_id: uid)
  → Colaborador accede al dashboard con permisos asignados
```

#### Dependencias
- **Bloqueador parcial:** Resend (P2) — sin emails no se puede enviar la invitación. Se puede implementar la lógica de permisos primero y la invitación por email después.
- Requiere que el plan esté en modo LIVE (P1) para que el límite de colaboradores se aplique correctamente según el plan Stripe activo.

### Marketing y adquisición
| # | Tarea | Detalle |
|---|-------|---------|
| MK1 | **Secuencia de 5 emails de onboarding** | Días 0-7 post-registro. Objetivo: guiar al usuario a su primera venta. Depende de Resend (P2). Temas: link tienda → primer producto → primer pedido → valor del POS → reporte semanal. |
| MK2 | ✅ **SEO de la home — completado** | Schema markup SoftwareApplication + Organization en `layout.js`. Keywords ampliadas. Title template dinámico. robots config. hreflang IT/ES. |
| MK3 | ✅ **Blog — Sistema completo + 4 artículos publicados** | `app/blog/page.js` + `app/blog/[slug]/page.js` + `lib/blog-posts.js` + `app/sitemap.js`. 4 artículos: ES (crear tienda, alternativa Shopify) + IT (POS celular, vender WhatsApp). Metadata dinámica, schema Article, sitemap automático. Añadir artículos nuevos solo en `lib/blog-posts.js`. |
| MK4 | **Perfil Instagram @tiendaonline.it** | Abrir perfil + primeros 9 posts: demos del POS, capturas del catálogo, antes/después. 3 posts por semana sin inversión publicitaria. |
| MK5 | **Secuencia de upgrade por email** | Trigger: usuario supera 80% del límite del plan. 3 emails en 14 días. Depende de Resend (P2). |

---

## 🟢 BAJA PRIORIDAD — Para después del primer lanzamiento

| # | Tarea | Detalle |
|---|-------|---------|
| B1 | **Export CSV/PDF de reportes** | Para contabilidad e impuestos del comerciante. |
| B2 | **Recuperación de carritos abandonados** | Marcado 🔜 en Grow. Requiere email transaccional (Resend) + lógica de detección de carrito inactivo. |
| B3 | **Programa de puntos y afiliados** | Marcado 🔜 en Grow. Tabla `puntos` en DB + lógica de canje. |
| B4 | **Facturación electrónica** | Marcado 🔜 en Grow. Integración con sistema italiano de fatturazione elettronica (SDI). |
| B5 | **Descuentos de cumpleaños** | La columna `fecha_nacimiento` ya existe en `clientes`. Falta la lógica de descuento automático. |
| B6 | **Google Business Profile** | Crear perfil de empresa en Google Maps. Solicitar reseñas a primeros clientes. SEO local. |
| B7 | **Primer caso de éxito documentado** | Entrevistar a un cliente real (panadería, bar, tienda). Foto + cifras reales + testimonio. Publicar en landing y blog. |

---

## ✅ COMPLETADO RECIENTEMENTE (Sesiones 21–25)

- Reorganización del sidebar del dashboard por frecuencia de uso (POS primero)
- Touch targets WCAG 2.2 mínimo 48px en POS y sidebar
- Acordeón expandible en tarjetas de planes (dashboard + landing pública)
- Acordeón expandible en bloque "Página Web Corporativa" (dashboard + landing pública)
- Soporte de hasta 4 imágenes por producto según plan (columnas `imagen_2/3/4` en DB)
- Corrección del modelo de pagos: TIENDAONLINE no cobra comisión por transacción
- Untracking permanente de `.mcp.json` del repositorio git
- FAQs italianas corregidas con precios actuales (Básico €15, Pro €25, Grow €40)
- Trust Bar: "Stripe Verified" → "Pagos con Stripe" (corrección legal)
- Hero IT: subtítulo y CTA mejorados para comunicar velocidad y beneficio
- Feature "Team incluso" reemplazado por "Clientes & Fiados" (feature real existente)
- Features no implementados marcados con 🔜 en landing y planes: Catálogo IG/FB, Carritos abandonados, Programa de puntos, Facturación electrónica
- Tabla de comparación: soporte "Community" → "FAQ" (honesto), 🔜 en features pendientes
