-- ============================================================
-- TIENDAONLINE — Fix: Columna fecha_vencimiento en productos y compras
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-04-12
-- ============================================================

-- Agregar fecha_vencimiento a tabla productos (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'productos'
      AND column_name = 'fecha_vencimiento'
  ) THEN
    ALTER TABLE productos ADD COLUMN fecha_vencimiento date;
    RAISE NOTICE 'Columna fecha_vencimiento añadida a productos.';
  ELSE
    RAISE NOTICE 'fecha_vencimiento ya existe en productos.';
  END IF;
END $$;

-- Agregar fecha_vencimiento a tabla compras (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compras'
      AND column_name = 'fecha_vencimiento'
  ) THEN
    ALTER TABLE compras ADD COLUMN fecha_vencimiento date;
    RAISE NOTICE 'Columna fecha_vencimiento añadida a compras.';
  ELSE
    RAISE NOTICE 'fecha_vencimiento ya existe en compras.';
  END IF;
END $$;

-- Verificación final
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('productos', 'compras')
  AND column_name = 'fecha_vencimiento';
