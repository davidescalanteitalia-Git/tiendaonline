# CORRECCIONES PASO A PASO — TIENDAONLINE SaaS
> Hoja de ruta ejecutable. Cada paso incluye: qué hacer, qué archivo tocar, resultado esperado.  
> Última actualización: 2026-04-19 · Sintetizado de: PENDIENTES.md + REVISION_MARCA.md + HISTORIAL_TECNICO.md + auditoría de código

---

## ÍNDICE RÁPIDO

| Fase | Nombre | Estado |
|------|--------|--------|
| [FASE 1](#fase-1--lanzamiento-bloqueantes-absolutos) | Lanzamiento — bloqueantes absolutos | 🔴 Pendiente |
| [FASE 2](#fase-2--operaciones-y-credibilidad) | Operaciones y credibilidad | 🟡 Pendiente |
| [FASE 3](#fase-3--crecimiento-y-retención) | Crecimiento y retención | 🟡 Pendiente |
| [FASE 4](#fase-4--marketing-y-adquisición) | Marketing y adquisición | 🟡 Pendiente |
| [FASE 5](#fase-5--monetización-saas-avanzada) | Monetización SaaS avanzada | ⚪ Después del lanzamiento |
| [APÉNDICE A](#apéndice-a--correcciones-de-marca-y-legales-ya-aplicadas) | Correcciones de marca ya aplicadas | ✅ Completado |
| [APÉNDICE B](#apéndice-b--backlog-de-baja-prioridad) | Backlog de baja prioridad | ⚪ Sin fecha |

---

## FASE 1 — Lanzamiento (Bloqueantes Absolutos)

> Sin estos pasos, la plataforma NO debe ponerse en producción real.

---

### PASO 1 · Stripe → Modo LIVE
**Prioridad:** 🔴 CRÍTICO | **Tiempo estimado:** 2 horas | **Referencia:** P1

#### Qué hacer
1. Entra al panel de Stripe en [dashboard.stripe.com](https://dashboard.stripe.com)
2. Activa el modo Live y genera:
   - `sk_live_...` → clave secreta
   - `pk_live_...` → clave pública
3. Ve al webhook existente → en modo Live, crea un nuevo webhook endpoint:
   - URL: `https://tiendaonline.it/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copia el nuevo `whsec_...`
4. En Coolify → Variables de entorno, reemplaza:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... (nuevo, de modo live)
   ```
5. Redeploy en Coolify.

#### Verificación
- Haz una suscripción de prueba real con tarjeta real (€0,00 si usas periodo de prueba).
- Verifica que el plan cambia en Supabase (`tiendas.plan_suscripcion`).
- Verifica que el webhook devuelve 200 en los logs de Stripe.

#### Archivos que NO tocar (ya están correctos)
- `app/dashboard/planes/page.js` — ya tiene los Price IDs con fallback hardcoded.
- `app/api/stripe/` — la lógica funciona igual en live y test.

---

### PASO 2 · Resend — Emails Transaccionales
**Prioridad:** 🔴 CRÍTICO | **Tiempo estimado:** 4-6 horas | **Referencia:** P2

> Sin esto: ningún email sale de la plataforma. Ni bienvenida, ni confirmación de pedido, ni aviso al vendedor. Es el mayor problema de retención.

#### Qué hacer

**2a. Crear cuenta Resend y dominio verificado**
1. Registrarse en [resend.com](https://resend.com)
2. Añadir dominio `tiendaonline.it`
3. Configurar registros DNS en Cloudflare (SPF, DKIM, DMARC)
4. Esperar verificación (5-30 min)
5. Generar API key

**2b. Configurar Supabase Auth con Resend como SMTP**
1. En Supabase → Authentication → SMTP Settings:
   ```
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [tu API key de Resend]
   Sender email: hola@tiendaonline.it
   Sender name: TIENDAONLINE
   ```
2. Esto cubre los emails de Supabase Auth (confirmación de cuenta, reset de contraseña).

**2c. Instalar SDK de Resend en el proyecto**
```bash
npm install resend
```

**2d. Crear utilidad central**  
Archivo nuevo: `lib/resend.js`
```js
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export { resend }
```

**2e. Añadir variable de entorno en Coolify**
```
RESEND_API_KEY=re_...
```

**2f. Crear API route para email de bienvenida**  
Archivo nuevo: `app/api/emails/bienvenida/route.js`
- Se llama desde `app/api/tiendas/route.js` después de crear la tienda.
- Usa la plantilla de la Secuencia de Onboarding (ver FASE 4, PASO 11).

#### Verificación
- Registra una cuenta de prueba → debe llegar email de confirmación desde `hola@tiendaonline.it`.
- Crea una tienda de prueba → debe llegar email de bienvenida.

---

### PASO 3 · Verificación de Email al Registrarse
**Prioridad:** 🔴 CRÍTICO | **Tiempo estimado:** 1 hora | **Referencia:** P3  
**Bloqueador:** Requiere PASO 2 (Resend) primero.

#### Qué hacer
1. En `app/api/auth/register/route.js` (o donde esté `createUser()`), activa:
   ```js
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
       data: { tienda_id, nombre_tienda }
     }
   })
   ```
2. En `app/register/page.js`, después del submit exitoso (paso 6 del wizard), mostrar pantalla de confirmación en lugar de redirigir al dashboard:
   ```jsx
   // Estado: registroExitoso = true
   <div className="text-center">
     <div className="text-6xl mb-4">📬</div>
     <h2>¡Revisa tu correo!</h2>
     <p>Te enviamos un enlace a <strong>{email}</strong></p>
     <p className="text-sm text-gray-500">
       ¿No lo ves? Revisa la carpeta de spam o{' '}
       <button onClick={reenviarEmail}>reenvía el email</button>
     </p>
   </div>
   ```
3. La redirección a `/dashboard` ocurre automáticamente cuando el usuario hace clic en el link del email (Supabase Auth lo gestiona).

#### Verificación
- Registro con email real → pantalla de "Revisa tu correo" aparece.
- Link en el email lleva correctamente al dashboard.
- Sin confirmar email, no se puede acceder al dashboard.

---

### PASO 4 · Correo Corporativo `@tiendaonline.it`
**Prioridad:** 🔴 CRÍTICO (para credibilidad en producción) | **Tiempo estimado:** 2 horas | **Referencia:** P6

#### Qué hacer
1. Registrarse en [Zoho Mail](https://www.zoho.com/mail/) — plan gratuito (hasta 5 buzones)
2. Añadir el dominio `tiendaonline.it`
3. En Cloudflare DNS (con **proxy desactivado** en los registros MX):
   ```
   MX  @   mx.zoho.eu   priority 10
   MX  @   mx2.zoho.eu  priority 20
   MX  @   mx3.zoho.eu  priority 50
   TXT @   "v=spf1 include:zoho.eu ~all"
   CNAME zmail._domainkey [el DKIM que te da Zoho]
   ```
4. Crear buzones mínimos:
   - `hola@tiendaonline.it` — contacto general y soporte
   - `soporte@tiendaonline.it` — tickets de soporte
   - `admin@tiendaonline.it` — uso interno / Stripe / Supabase

5. Actualizar en el código todas las referencias al email de contacto:
   - `lib/dictionaries.js` → buscar `davidescalanteitalia@gmail.com` → reemplazar por `hola@tiendaonline.it`
   - `app/contatti/page.js` → mismo reemplazo
   - `app/layout.js` → schema.org contactPoint

6. Actualizar `ADMIN_EMAIL` en Coolify:
   ```
   ADMIN_EMAIL=admin@tiendaonline.it
   NEXT_PUBLIC_ADMIN_EMAIL=admin@tiendaonline.it
   ```

#### Verificación
- Envía un email a `hola@tiendaonline.it` desde una cuenta externa → llega a Zoho.
- El formulario de contacto de la web envía correctamente.

---

## FASE 2 — Operaciones y Credibilidad

> Para que el negocio funcione bien una vez lanzado.

---

### PASO 5 · Stripe Connect para Pagos en Tienda
**Prioridad:** 🟡 ALTA | **Tiempo estimado:** 1-2 días | **Referencia:** P5

> Permite que cada comercio conecte su cuenta Stripe para cobrar directamente. TIENDAONLINE no toca el dinero del cliente final.

#### Qué hacer

**5a. Activar Stripe Connect en el panel de Stripe**
1. Dashboard Stripe → Connect → Habilitar
2. Elegir tipo: **Express** (más simple para onboarding de pequeños negocios)

**5b. Añadir columna en Supabase**
```sql
ALTER TABLE tiendas ADD COLUMN stripe_account_id text;
ALTER TABLE tiendas ADD COLUMN stripe_connect_enabled boolean DEFAULT false;
```

**5c. Crear el flujo de onboarding**  
Archivo nuevo: `app/api/stripe/connect/onboarding/route.js`
```js
// POST → crea AccountLink para que el comercio complete el onboarding
const account = await stripe.accounts.create({ type: 'express', country: 'IT' })
const link = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${APP_URL}/dashboard/ajustes?connect=refresh`,
  return_url: `${APP_URL}/dashboard/ajustes?connect=success`,
  type: 'account_onboarding'
})
// Guardar account.id en tiendas.stripe_account_id
return redirect(link.url)
```

**5d. Botón en `/dashboard/ajustes`**
- Si `stripe_connect_enabled === false` → botón "Conectar mi cuenta Stripe para cobros online"
- Si `stripe_connect_enabled === true` → badge verde "✅ Pagos online activos"

**5e. Webhook para confirmar la conexión**  
En `app/api/stripe/webhook/route.js`, añadir manejo del evento:
- `account.updated` → si `charges_enabled === true` → actualizar `tiendas.stripe_connect_enabled = true`

**5f. Actualizar el flujo de checkout del catálogo público**
- Plan Gratis → solo WhatsApp (sin cambios)
- Plan Básico/Pro/Grow + Stripe Connect activo → mostrar opción "Pagar con tarjeta" usando el `stripe_account_id` del comercio

#### Planes y acceso
| Plan | Stripe Connect |
|------|---------------|
| Gratis | ❌ Solo WhatsApp |
| Básico | ✅ Disponible |
| Pro | ✅ Disponible |
| Grow | ✅ Disponible |

---

### PASO 6 · Sistema de Colaboradores (Multi-usuario)
**Prioridad:** 🟡 MEDIA-ALTA | **Tiempo estimado:** 3-4 días | **Referencia:** M3  
**Bloqueador parcial:** Requiere Resend (PASO 2) para el email de invitación.

#### Qué hacer

**6a. Migración de base de datos**
```sql
CREATE TABLE colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_id uuid REFERENCES tiendas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nombre text,
  estado text DEFAULT 'pendiente', -- 'pendiente' | 'activo' | 'bloqueado'
  permisos jsonb DEFAULT '{}',
  -- Ejemplo: {"vender":true,"pedidos":true,"inventario":false,"clientes":false,"reportes":false,"configurar":false}
  created_at timestamptz DEFAULT now()
);

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dueno_gestiona" ON colaboradores
  FOR ALL USING (
    tienda_id IN (SELECT id FROM tiendas WHERE user_id = auth.uid())
  );

CREATE POLICY "colaborador_se_ve" ON colaboradores
  FOR SELECT USING (user_id = auth.uid());
```

**6b. API routes nuevas**
- `GET /api/colaboradores` — lista
- `POST /api/colaboradores` — invitar por email (enviar email con Resend)
- `PATCH /api/colaboradores/[id]` — actualizar permisos o bloquear
- `DELETE /api/colaboradores/[id]` — eliminar

**6c. Nueva página `/dashboard/equipo`**
- Lista de colaboradores con nombre, email, estado y permisos activos
- Botón "Invitar colaborador" (solo visible si el plan lo permite)
- Toggle switches para cada permiso
- Badge: "2 de 3 colaboradores usados"

**6d. Middleware de permisos en `app/dashboard/layout.js`**
```js
// Detectar si el usuario es dueño o colaborador
// Si es colaborador → leer permisos y filtrar menú
const esColaborador = await checkEsColaborador(userId)
if (esColaborador) {
  const permisos = await getPermisosColaborador(userId)
  // Pasar permisos al context del layout
}
```

**6e. Proteger campo `costo` en `/api/productos`**
```js
// Si el requester es colaborador → devolver sin campo costo
if (esColaborador) {
  productos = productos.map(p => { const { costo, ...rest } = p; return rest })
}
```

**6f. Actualizar sidebar** `app/dashboard/layout.js`
- Ocultar "Reportes" si no tiene permiso `reportes`
- Ocultar "Ajustes" y "Diseño" si no tiene permiso `configurar`
- Nunca mostrar "Planes" ni "Mi Cuenta" a colaboradores

**6g. Flujo de invitación por email (con Resend)**
```
Dueño escribe email → POST /api/colaboradores
  → INSERT estado='pendiente'
  → Resend envía: "Te invitaron a gestionar [Nombre Tienda]"
  → Link: /aceptar-invitacion?token=xxx
  → Colaborador acepta → UPDATE estado='activo', user_id=uid
```

**Límites por plan:**
| Plan | Colaboradores |
|------|--------------|
| Gratis | 0 |
| Básico | 1 |
| Pro | 2 |
| Grow | 4 |

---

### PASO 7 · Galería de Imágenes en Catálogo Público
**Prioridad:** 🟡 MEDIA | **Tiempo estimado:** 4 horas | **Referencia:** M1

#### Qué hacer
Las columnas `imagen_2`, `imagen_3`, `imagen_4` ya existen en la tabla `productos`. Solo falta el componente de galería en la vista pública.

**7a. Crear componente `components/GaleriaProducto.js`**
- Props: `[imagen_url, imagen_2, imagen_3, imagen_4]` (filtrar nulos)
- Si hay 1 imagen → mostrar imagen estática
- Si hay 2+ imágenes → carousel swipeable (usar `embla-carousel-react` o CSS puro con `overflow-x: scroll snap`)
- Indicadores de puntos abajo (dots)
- Soporte para swipe táctil en móvil

**7b. Integrar en `app/store/[subdominio]/page.js`**
- En la modal o vista de detalle de producto, reemplazar `<img>` simple por `<GaleriaProducto>`

**7c. Instalar dependencia (opcional, alternativa CSS pura)**
```bash
npm install embla-carousel-react
```

---

### PASO 8 · Zona Horaria del Negocio en Ajustes
**Prioridad:** 🟡 MEDIA | **Tiempo estimado:** 2 horas | **Referencia:** M4

#### Qué hacer

**8a. Añadir columna en Supabase**
```sql
ALTER TABLE tiendas ADD COLUMN timezone text DEFAULT 'Europe/Rome';
```

**8b. En `/dashboard/ajustes/page.js`**
- Añadir campo de selección de zona horaria
- Opciones principales: Europe/Rome, Europe/Madrid, America/Mexico_City, America/Bogota, America/Lima, America/Buenos_Aires, etc.
- Usar `Intl.supportedValuesOf('timeZone')` para lista completa

**8c. En el catálogo público `app/store/[subdominio]/page.js`**
- El badge "🟢 Abierto" / "🔴 Cerrado" debe calcularse con `dayjs.tz(now, tienda.timezone)`
- Instalar: `npm install dayjs` (ya puede estar) + `dayjs/plugin/timezone` + `dayjs/plugin/utc`

---

### PASO 9 · Catálogo Meta (Instagram / Facebook)
**Prioridad:** 🟡 MEDIA | **Tiempo estimado:** 1 día | **Referencia:** M2

#### Qué hacer

**9a. Crear endpoint de exportación**  
Archivo nuevo: `app/api/catalogo-meta/[tiendaId]/route.js`
- Formato: JSON compatible con Meta Catalog Manager
- Campos requeridos por Meta: `id`, `title`, `description`, `availability`, `condition`, `price`, `link`, `image_link`, `brand`
- Acceso público (para que Meta pueda hacer fetch)

**9b. Página en `/dashboard/canales` (nueva)**
- Instrucciones paso a paso para conectar el catálogo a Meta Business Suite
- URL del feed: `https://tiendaonline.it/api/catalogo-meta/{tiendaId}`
- Botón "Copiar URL del catálogo"

**9c. En la landing y planes**
- Reemplazar el 🔜 de "Catálogo Instagram/Facebook" cuando esté listo

---

## FASE 3 — Crecimiento y Retención

---

### PASO 10 · Sistema de Reseñas de Clientes
**Prioridad:** 🟡 MEDIA | **Tiempo estimado:** 1-2 días | **Referencia:** M5

#### Qué hacer

**10a. Nueva tabla en Supabase**
```sql
CREATE TABLE resenas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_id uuid REFERENCES tiendas(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes(id),
  pedido_id uuid REFERENCES pedidos(id),
  puntuacion int CHECK (puntuacion BETWEEN 1 AND 5),
  comentario text,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
-- Lectura pública de reseñas visibles
CREATE POLICY "publico_lee" ON resenas FOR SELECT USING (visible = true);
-- Solo el dueño puede moderar (ocultar)
CREATE POLICY "dueno_modera" ON resenas FOR UPDATE USING (
  tienda_id IN (SELECT id FROM tiendas WHERE user_id = auth.uid())
);
```

**10b. Flujo de reseña post-pedido**
- Después de marcar un pedido como entregado → enviar link de reseña por WhatsApp al cliente
- URL: `/store/[subdominio]/resena?pedido=xxx&token=yyy`
- Formulario simple: 5 estrellas + comentario opcional + nombre

**10c. Mostrar reseñas en catálogo público**
- Promedio de estrellas + número de reseñas en el header del catálogo
- Sección scrollable de reseñas al pie

**10d. En el dashboard `/dashboard/reseñas`**
- Lista de reseñas con opción de ocultar las inapropiadas

---

### PASO 11 · Descuentos Automáticos de Cumpleaños
**Prioridad:** 🟢 BAJA | **Tiempo estimado:** 3 horas | **Referencia:** B5

#### Qué hacer
La columna `fecha_nacimiento` ya existe en `clientes`. Solo falta la lógica.

**11a. Cron job o Edge Function en Supabase**
```sql
-- Función que se ejecuta diariamente
-- Detecta clientes cuyo cumpleaños es HOY
-- Crea un código de descuento en Stripe o lo registra localmente
SELECT * FROM clientes 
WHERE EXTRACT(MONTH FROM fecha_nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM fecha_nacimiento) = EXTRACT(DAY FROM CURRENT_DATE)
```

**11b. Enviar WhatsApp / Email** con el código de descuento (requiere Resend, PASO 2)

---

## FASE 4 — Marketing y Adquisición

---

### PASO 12 · Secuencia de 5 Emails de Onboarding
**Prioridad:** 🔴 CRÍTICA (para retención) | **Tiempo estimado:** 1 día | **Referencia:** MK1  
**Bloqueador:** Requiere Resend (PASO 2).

#### Estructura de la secuencia

| Día | Asunto | Objetivo | Trigger |
|-----|--------|----------|---------|
| 0 (inmediato) | "Tu tienda está lista, [nombre] 🎉" | Activación — que entren al dashboard | Creación de tienda |
| 1 | "Tu primer producto en 2 minutos" | Que suban al menos 1 producto | 24h si no subió productos |
| 3 | "¿Ya recibiste tu primer pedido?" | Que compartan el link de la tienda | 72h si no tiene pedidos |
| 5 | "Cobra en el mostrador con el POS" | Que usen el POS | 5 días si no abrió /dashboard/pos |
| 7 | "Tu primer reporte semanal" | Ver el valor analítico | Siempre (7 días post-registro) |

#### Qué hacer
**12a. Crear las plantillas HTML**  
Carpeta nueva: `emails/` con archivos:
- `bienvenida.html`
- `primer-producto.html`
- `primer-pedido.html`
- `pos-tutorial.html`
- `reporte-semanal.html`

**12b. Crear la lógica de envío programado**
- Usar Supabase Edge Functions con `pg_cron` o un cron externo
- O Resend Broadcasts si se usa la lista de contactos de Resend

**12c. Métricas clave a seguir (PostHog)**
- Open rate objetivo: > 35%
- Click-to-activate (primer producto) objetivo: > 25%
- Activación completa (primer pedido) objetivo: > 15%

---

### PASO 13 · Perfil Instagram @tiendaonline.it
**Prioridad:** 🟡 MEDIA | **Referencia:** MK4

#### Plan de contenidos primeros 30 días (9 posts base)

| # | Formato | Contenido | CTA |
|---|---------|-----------|-----|
| 1 | Reel 30s | Demo del POS en acción (manos + pantalla) | "Link en bio" |
| 2 | Carrusel | Antes/después: catálogo WhatsApp vs TIENDAONLINE | "Crea gratis" |
| 3 | Story destacada | Tutorial: crear tienda en 10 min | — |
| 4 | Reel 15s | "¿Cuánto perdiste hoy sin saber?" (hook + solución) | "Link en bio" |
| 5 | Foto | Captura del dashboard de reportes | "Utilidad real" |
| 6 | Carrusel | Planes comparados (Gratis vs Pro vs Grow) | "Empieza gratis" |
| 7 | Reel 30s | Checkout por WhatsApp en 30 segundos | "Link en bio" |
| 8 | Foto | Testimonio de cliente real (cuando esté disponible) | — |
| 9 | Carrusel | "5 errores que cometen los negocios sin POS digital" | "Link en bio" |

**Frecuencia objetivo:** 3 posts/semana · Sin inversión publicitaria inicial.

---

### PASO 14 · Secuencia de Upgrade por Email
**Prioridad:** 🟡 MEDIA | **Referencia:** MK5  
**Bloqueador:** Requiere Resend (PASO 2) y lógica de detección de uso.

#### Trigger: usuario supera el 80% del límite de su plan

| Día | Asunto | Contenido |
|-----|--------|-----------|
| 0 (trigger) | "Estás casi al límite, [nombre]" | Cuánto espacio/productos/funciones les quedan |
| 7 | "¿Qué perderías sin Pro?" | Comparativa concreta de features |
| 14 | "Oferta especial: primer mes Pro a €12" | CTA con descuento de bienvenida |

#### Qué hacer
**14a. PostHog:** crear propiedad `plan_usage_pct` que se actualiza con cada nueva venta/producto
**14b. Webhook de PostHog:** cuando `plan_usage_pct >= 80` → disparar la secuencia en Resend
**14c. Crear precio de oferta en Stripe:** `price_upgrade_promo` con un cupón de 20% descuento primer mes

---

### PASO 15 · Google Business Profile
**Prioridad:** 🟢 BAJA | **Tiempo estimado:** 1 hora | **Referencia:** B6

#### Qué hacer
1. Ir a [business.google.com](https://business.google.com)
2. Crear perfil para "TIENDAONLINE" (servicio online, no local físico)
3. Añadir categoría: "Software de comercio electrónico"
4. Añadir descripción, URL, capturas del producto
5. Una vez activo, solicitar reseñas a los primeros clientes por email/WhatsApp

---

## FASE 5 — Monetización SaaS Avanzada

---

### PASO 16 · Export CSV/PDF de Reportes
**Prioridad:** 🟢 BAJA | **Referencia:** B1

#### Qué hacer
**16a. En `/dashboard/reportes/page.js`**, añadir botón "Exportar":
- CSV: `json-to-csv` o generación manual de string CSV en el cliente
- PDF: usar `jsPDF` o llamar a `app/api/reportes/export/route.js` que genere el PDF server-side

**16b. Estructura del CSV de ventas:**
```
Fecha,Código,Producto,Cantidad,Precio,Costo,Utilidad,Método de Pago,Cliente
```

---

### PASO 17 · Carritos Abandonados
**Prioridad:** 🟢 BAJA (Grow) | **Referencia:** B2  
**Bloqueador:** Requiere Resend (PASO 2) + lógica de detección de carrito inactivo.

#### Qué hacer
**17a. Tabla en Supabase:**
```sql
CREATE TABLE carritos_abandonados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_id uuid REFERENCES tiendas(id),
  session_id text,
  email text,
  telefono text,
  items jsonb,
  total numeric,
  abandonado_en timestamptz DEFAULT now(),
  recuperado boolean DEFAULT false
);
```

**17b. Lógica en el catálogo público:**
- Si el usuario llena email/teléfono en el checkout pero NO completa el pedido → guardar en `carritos_abandonados`
- Cron que revisa cada hora → si pasaron 2h sin completar → email/WhatsApp recordatorio

---

### PASO 18 · Facturación Electrónica Italiana (SDI)
**Prioridad:** 🟢 BAJA (Grow) | **Referencia:** B4

> Este es un feature complejo específico del mercado italiano.

#### Qué hacer
1. Investigar proveedores API de fatturazione elettronica: Aruba, Fatture in Cloud, o Invoicecloud
2. Añadir en la tabla `pedidos`: `fattura_richiesta`, `fattura_codice_fiscale`, `fattura_piva`, `fattura_codice_destinatario`
3. Crear `/dashboard/fatturazione` con el formulario de datos fiscales del cliente
4. Integrar con el proveedor de SDI elegido

---

## APÉNDICE A — Correcciones de Marca y Legales Ya Aplicadas

> Estas correcciones están **completadas**. Se documentan aquí como referencia.

| Ítem | Archivo | Estado |
|------|---------|--------|
| Texto italiano mezclado en bloque ES (`faq7Q/A`) | `dictionaries.js:619` | ✅ Corregido |
| `aggregateRating` falso en schema.org | `app/layout.js:113-118` | ✅ Eliminado |
| 81 claves muertas de pricing (`planAvanzato*`, `planFree*`) | `dictionaries.js` | ✅ Eliminadas |
| `heroSubtitle` reescrito con pilar POS en IT/ES/EN | `dictionaries.js` | ✅ Hecho |
| `feat5Title` italiano: "Fiati" → "Conti in sospeso" | `dictionaries.js` | ✅ Corregido |
| Linter i18n creado (`validate-i18n.js`) | `lib/validate-i18n.js` | ✅ Creado |
| Pre-commit hook instalado (sin Husky) | `.githooks/` | ✅ Instalado |
| Términos: sección de pagos Stripe + D.Lgs. 206/2005 | `app/terms/page.js` | ✅ Actualizado |
| "0% commissioni" → disclaimer Stripe en landing y planes | `app/page.js`, `app/dashboard/planes/page.js` | ✅ Actualizado |
| Política de privacidad: Stripe, Cloudflare, Sentry | `app/privacy/page.js` | ✅ Actualizado |
| Cookie policy: tabla Stripe añadida | `app/cookie-policy/page.js` | ✅ Actualizado |
| Cliché "¡Impulsa tus Ventas! 🚀" eliminado del dashboard | `app/dashboard/page.js` | ✅ Corregido |
| "Consulente dedicato" → "1 videollamada al mes (30 min)" | `app/page.js`, `app/dashboard/planes/page.js` | ✅ Definido |
| Trust Bar: "Stripe Verified" → "Pagos con Stripe" | `app/page.js` | ✅ Corregido |
| Features no implementados marcados con 🔜 | Landing y planes | ✅ Marcados |
| Tabla comparativa: "Community" → "FAQ" en soporte | `app/page.js` | ✅ Corregido |
| Blog sistema completo + 4 artículos | `app/blog/`, `lib/blog-posts.js` | ✅ Publicado |
| SEO: schema, hreflang, robots, sitemap | `app/layout.js`, `app/sitemap.js` | ✅ Completado |

---

## APÉNDICE B — Backlog de Baja Prioridad

> Para después del primer lanzamiento estable.

| # | Feature | Referencia | Notas |
|---|---------|-----------|-------|
| B1 | Export CSV/PDF de reportes | B1 | Ver PASO 16 |
| B3 | Programa de puntos y afiliados | B3 | Tabla `puntos` en DB + lógica de canje |
| B4 | Facturación electrónica italiana | B4 | Ver PASO 18 |
| B7 | Primer caso de éxito documentado | B7 | Entrevistar un cliente real con cifras reales |

---

## RESUMEN EJECUTIVO — Orden de Ejecución

```
SEMANA 1 (Pre-lanzamiento crítico)
  PASO 1 → Stripe LIVE
  PASO 4 → Email corporativo @tiendaonline.it
  PASO 2 → Resend configurado
  PASO 3 → Verificación de email (depende de PASO 2)

SEMANA 2-3 (Operaciones)
  PASO 5 → Stripe Connect para tiendas
  PASO 12 → Secuencia onboarding por email (depende de PASO 2)
  PASO 8 → Zona horaria en ajustes

SEMANA 4-6 (Crecimiento)
  PASO 6 → Sistema de colaboradores (multi-usuario)
  PASO 7 → Galería de imágenes
  PASO 13 → Instagram @tiendaonline.it (empezar posts)
  PASO 14 → Emails de upgrade

MES 2 (Expansión)
  PASO 9 → Catálogo Meta
  PASO 10 → Sistema de reseñas
  PASO 15 → Google Business Profile
  PASO 16 → Export CSV/PDF
```

---

*Documento vivo. Actualizar al completar cada paso.*  
*Para el estado actual de tareas activas → ver `PENDIENTES.md`*  
*Para el historial técnico completo → ver `HISTORIAL_TECNICO.md`*
