-- Create table for storing entry/exit records
CREATE TABLE public.registros_horas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id INTEGER NOT NULL,
  cedula TEXT NOT NULL,
  nombre TEXT NOT NULL,
  area TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  objetos_personales TEXT,
  tareas TEXT[],
  tienda_id UUID NOT NULL,
  exportado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registros_horas ENABLE ROW LEVEL SECURITY;

-- Create policies for store access
CREATE POLICY "Tiendas ven sus registros" 
ON public.registros_horas 
FOR SELECT 
USING (auth.uid() = tienda_id);

CREATE POLICY "Tiendas crean registros" 
ON public.registros_horas 
FOR INSERT 
WITH CHECK (auth.uid() = tienda_id);

CREATE POLICY "Tiendas actualizan registros" 
ON public.registros_horas 
FOR UPDATE 
USING (auth.uid() = tienda_id);

CREATE POLICY "Tiendas eliminan registros" 
ON public.registros_horas 
FOR DELETE 
USING (auth.uid() = tienda_id);

-- Create index for faster queries
CREATE INDEX idx_registros_tienda_exportado ON public.registros_horas (tienda_id, exportado);