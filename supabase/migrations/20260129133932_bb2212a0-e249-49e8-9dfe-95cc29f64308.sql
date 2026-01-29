-- Hacer tienda_id nullable para empleados globales
ALTER TABLE public.empleados ALTER COLUMN tienda_id DROP NOT NULL;

-- Actualizar la política de SELECT para incluir empleados globales del sistema
DROP POLICY IF EXISTS "Tiendas ven sus empleados o globales" ON public.empleados;

CREATE POLICY "Tiendas ven sus empleados o globales"
ON public.empleados
FOR SELECT
USING (
  (auth.uid() = tienda_id) OR 
  (is_global = true AND tienda_id IS NULL)
);

-- Política para que cualquier tienda autenticada pueda crear empleados globales
DROP POLICY IF EXISTS "Tiendas crean empleados" ON public.empleados;

CREATE POLICY "Tiendas crean empleados"
ON public.empleados
FOR INSERT
WITH CHECK (
  (auth.uid() = tienda_id) OR 
  (is_global = true AND tienda_id IS NULL)
);

-- Política para que solo admins puedan eliminar empleados globales (nadie por ahora)
DROP POLICY IF EXISTS "Tiendas eliminan empleados" ON public.empleados;

CREATE POLICY "Tiendas eliminan sus empleados locales"
ON public.empleados
FOR DELETE
USING (auth.uid() = tienda_id AND is_global = false);

-- Política de actualización solo para empleados locales
DROP POLICY IF EXISTS "Tiendas actualizan empleados" ON public.empleados;

CREATE POLICY "Tiendas actualizan sus empleados locales"
ON public.empleados
FOR UPDATE
USING (auth.uid() = tienda_id AND is_global = false);