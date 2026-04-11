-- ============================================================
-- TIENDAONLINE — Verificación y fix de RLS en tabla pedidos
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-04-12
-- ============================================================

-- 1. Ver todas las políticas activas en pedidos
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'pedidos';

-- 2. Ver todas las políticas activas en clientes (nueva tabla usada desde POS)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'clientes';

-- ============================================================
-- FIX: Asegurar que compradores anónimos puedan crear pedidos
-- (necesario para el checkout del catálogo público)
-- Si la política ya existe con este nombre, omitir este bloque.
-- ============================================================

-- Primero eliminar si existe una versión anterior con nombre diferente
-- (descomenta si pg_policies muestra una política duplicada con otro nombre):
-- DROP POLICY IF EXISTS "Public can insert orders" ON pedidos;

-- Política de INSERT público para pedidos de tienda online
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pedidos'
      AND cmd = 'INSERT'
      AND policyname = 'Public can insert orders'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public can insert orders"
      ON pedidos
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
    $policy$;
    RAISE NOTICE 'Política "Public can insert orders" creada correctamente.';
  ELSE
    RAISE NOTICE 'Política "Public can insert orders" ya existe. No se hizo ningún cambio.';
  END IF;
END $$;

-- ============================================================
-- FIX: Asegurar que la tabla clientes tiene RLS habilitado
-- (ya debería estar desde la auditoría del 2026-04-10,
--  pero esto lo confirma sin romper nada si ya está activo)
-- ============================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política para que el dueño gestione sus clientes (ALL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clientes'
      AND policyname = 'Dueño gestiona sus clientes'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Dueño gestiona sus clientes"
      ON clientes
      FOR ALL
      TO authenticated
      USING ((select auth.uid()) = (SELECT user_id FROM tiendas WHERE id = clientes.tienda_id))
      WITH CHECK ((select auth.uid()) = (SELECT user_id FROM tiendas WHERE id = clientes.tienda_id));
    $policy$;
    RAISE NOTICE 'Política "Dueño gestiona sus clientes" creada correctamente.';
  ELSE
    RAISE NOTICE 'Política "Dueño gestiona sus clientes" ya existe.';
  END IF;
END $$;

-- ============================================================
-- VERIFICACIÓN FINAL — Ver estado de RLS en todas las tablas
-- ============================================================
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tiendas', 'productos', 'categorias', 'pedidos', 'compras', 'clientes')
ORDER BY tablename;
