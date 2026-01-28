import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Empleado } from '@/types';

export function useEmpleados(tiendaId: string | undefined) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpleados = useCallback(async () => {
    if (!tiendaId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('nombre');

    if (!error && data) {
      setEmpleados(data as Empleado[]);
    }
    setLoading(false);
  }, [tiendaId]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const addEmpleado = async (cedula: string, nombre: string, area: string) => {
    if (!tiendaId) throw new Error('No hay tienda autenticada');

    // Check if this is a global role
    const globalRoles = ['ADMINISTRACIÓN', 'SISTEMAS', 'EXTERNO', 'SUPERVISOR', 'MANTENIMIENTO'];
    const isGlobal = globalRoles.includes(area.toUpperCase());

    const { data, error } = await supabase
      .from('empleados')
      .insert({
        tienda_id: tiendaId,
        cedula,
        nombre: nombre.toUpperCase(),
        area,
        is_global: isGlobal,
      })
      .select()
      .single();

    if (error) throw error;
    
    setEmpleados(prev => [...prev, data as Empleado]);
    return data as Empleado;
  };

  const deleteEmpleado = async (id: number) => {
    const { error } = await supabase
      .from('empleados')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setEmpleados(prev => prev.filter(e => e.id !== id));
  };

  const findEmpleadoByCedula = (cedula: string): Empleado | undefined => {
    return empleados.find(e => e.cedula === cedula);
  };

  return {
    empleados,
    loading,
    addEmpleado,
    deleteEmpleado,
    findEmpleadoByCedula,
    refetch: fetchEmpleados,
  };
}
