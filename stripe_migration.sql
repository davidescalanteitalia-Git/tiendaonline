-- Migración para añadir seguimiento de suscripciones Stripe (SaaS B2B)
-- Ejecuta esto en el panel SQL de tu proyecto Supabase.

ALTER TABLE public.tiendas 
ADD COLUMN stripe_customer_id VARCHAR(255) NULL UNIQUE,
ADD COLUMN stripe_subscription_id VARCHAR(255) NULL UNIQUE,
ADD COLUMN stripe_price_id VARCHAR(255) NULL;

-- Agregamos un comentario descriptivo
COMMENT ON COLUMN public.tiendas.stripe_customer_id IS 'ID de cliente B2B en Stripe para facturación';
COMMENT ON COLUMN public.tiendas.stripe_subscription_id IS 'Suscripción activa actual (si existe)';
COMMENT ON COLUMN public.tiendas.stripe_price_id IS 'ID del nivel de plan facturado actualmente (price_...)';
