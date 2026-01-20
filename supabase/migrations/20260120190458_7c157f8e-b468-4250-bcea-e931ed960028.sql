-- Crear tabla de tiendas (id vinculado a auth.users.id)
CREATE TABLE public.tiendas (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de empleados
CREATE TABLE public.empleados (
    id SERIAL PRIMARY KEY,
    tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
    cedula TEXT NOT NULL,
    nombre TEXT NOT NULL,
    area TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tienda_id, cedula)
);

-- Habilitar RLS en tiendas
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;

-- Política: Cada tienda solo puede ver su propia información
CREATE POLICY "Tiendas pueden ver sus datos"
ON public.tiendas FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política: Permitir insertar tienda al registrarse
CREATE POLICY "Usuarios pueden crear su tienda"
ON public.tiendas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Habilitar RLS en empleados
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;

-- Política: Tiendas solo ven sus empleados
CREATE POLICY "Tiendas ven sus empleados"
ON public.empleados FOR SELECT
TO authenticated
USING (auth.uid() = tienda_id);

-- Política: Tiendas pueden crear empleados
CREATE POLICY "Tiendas crean empleados"
ON public.empleados FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = tienda_id);

-- Política: Tiendas pueden actualizar sus empleados
CREATE POLICY "Tiendas actualizan empleados"
ON public.empleados FOR UPDATE
TO authenticated
USING (auth.uid() = tienda_id);

-- Política: Tiendas pueden eliminar sus empleados
CREATE POLICY "Tiendas eliminan empleados"
ON public.empleados FOR DELETE
TO authenticated
USING (auth.uid() = tienda_id);