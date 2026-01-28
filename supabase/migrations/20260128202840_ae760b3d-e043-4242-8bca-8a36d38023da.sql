-- Add is_global column to empleados table for global visibility
ALTER TABLE public.empleados 
ADD COLUMN is_global BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster global employee queries
CREATE INDEX idx_empleados_is_global ON public.empleados(is_global) WHERE is_global = true;

-- Update RLS policy to allow reading global employees from any store
DROP POLICY IF EXISTS "Tiendas ven sus empleados" ON public.empleados;

CREATE POLICY "Tiendas ven sus empleados o globales" 
ON public.empleados 
FOR SELECT 
USING (
  auth.uid() = tienda_id OR is_global = true
);

-- Create a table to store admin monitoring registros (not deleted on export)
CREATE TABLE public.registros_admin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id INTEGER NOT NULL,
  cedula TEXT NOT NULL,
  nombre TEXT NOT NULL,
  area TEXT NOT NULL,
  tipo TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  objetos_personales TEXT,
  tareas TEXT[],
  tienda_id UUID NOT NULL,
  tienda_nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on registros_admin
ALTER TABLE public.registros_admin ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view admin registros for their store
CREATE POLICY "Tiendas ven registros admin" 
ON public.registros_admin 
FOR SELECT 
USING (auth.uid() = tienda_id);

-- All authenticated users can insert into admin registros
CREATE POLICY "Tiendas crean registros admin" 
ON public.registros_admin 
FOR INSERT 
WITH CHECK (auth.uid() = tienda_id);

-- Allow delete for the cron job cleanup (using service role)
CREATE POLICY "Tiendas eliminan registros admin" 
ON public.registros_admin 
FOR DELETE 
USING (auth.uid() = tienda_id);

-- Enable realtime for admin registros
ALTER PUBLICATION supabase_realtime ADD TABLE public.registros_admin;