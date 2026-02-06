
-- Trigger to prevent consecutive duplicate entry types for the same employee in the same store
CREATE OR REPLACE FUNCTION public.prevent_duplicate_consecutive_registro()
RETURNS TRIGGER AS $$
DECLARE
  last_tipo TEXT;
BEGIN
  SELECT tipo INTO last_tipo
  FROM public.registros_horas
  WHERE empleado_id = NEW.empleado_id
    AND tienda_id = NEW.tienda_id
    AND exportado = false
  ORDER BY timestamp DESC
  LIMIT 1;

  IF last_tipo IS NOT NULL AND last_tipo = NEW.tipo THEN
    RAISE EXCEPTION 'Registro duplicado: ya existe un registro de tipo % activo para este empleado', NEW.tipo;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_duplicate_registro
BEFORE INSERT ON public.registros_horas
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_consecutive_registro();

-- Same for registros_admin
CREATE OR REPLACE FUNCTION public.prevent_duplicate_consecutive_admin()
RETURNS TRIGGER AS $$
DECLARE
  last_tipo TEXT;
BEGIN
  SELECT tipo INTO last_tipo
  FROM public.registros_admin
  WHERE empleado_id = NEW.empleado_id
    AND tienda_id = NEW.tienda_id
  ORDER BY timestamp DESC
  LIMIT 1;

  IF last_tipo IS NOT NULL AND last_tipo = NEW.tipo THEN
    RAISE EXCEPTION 'Registro admin duplicado: ya existe un registro de tipo % activo', NEW.tipo;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_duplicate_admin_registro
BEFORE INSERT ON public.registros_admin
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_consecutive_admin();
