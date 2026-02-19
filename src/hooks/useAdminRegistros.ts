import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminRegistro {
  id: string;
  empleadoId: number;
  cedula: string;
  nombre: string;
  area: string;
  tipo: 'ENTRADA' | 'SALIDA';
  fecha: string;
  hora: string;
  timestamp: Date;
  objetosPersonales?: string;
  tareas?: string[];
  tiendaNombre?: string;
}

export interface EmpleadoEstado {
  empleadoId: number;
  cedula: string;
  nombre: string;
  area: string;
  estado: 'DENTRO' | 'FUERA';
  ultimaEntrada?: { fecha: string; hora: string };
  ultimaSalida?: { fecha: string; hora: string };
  objetosPersonales?: string;
}

export function useAdminRegistros(tiendaId?: string) {
  const [registros, setRegistros] = useState<AdminRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistros = useCallback(async () => {
    if (!tiendaId) {
      setRegistros([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('registros_admin')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching admin registros:', error);
      setRegistros([]);
    } else {
      const mapped: AdminRegistro[] = (data || []).map((r) => ({
        id: r.id,
        empleadoId: r.empleado_id,
        cedula: r.cedula,
        nombre: r.nombre,
        area: r.area,
        tipo: r.tipo as 'ENTRADA' | 'SALIDA',
        fecha: r.fecha,
        hora: r.hora,
        timestamp: new Date(r.timestamp),
        objetosPersonales: r.objetos_personales || undefined,
        tareas: r.tareas || undefined,
        tiendaNombre: r.tienda_nombre || undefined,
      }));
      // Deduplicate by id
      const unique = mapped.filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i);
      setRegistros(unique);
    }
    setLoading(false);
  }, [tiendaId]);

  useEffect(() => {
    fetchRegistros();

    if (!tiendaId) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin_registros_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registros_admin',
          filter: `tienda_id=eq.${tiendaId}`,
        },
        () => {
          fetchRegistros();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tiendaId, fetchRegistros]);

  // Compute employee states (DENTRO/FUERA)
  const getEmpleadosEstado = useCallback((): EmpleadoEstado[] => {
    const empleadosMap = new Map<number, AdminRegistro[]>();
    
    registros.forEach((r) => {
      const existing = empleadosMap.get(r.empleadoId) || [];
      existing.push(r);
      empleadosMap.set(r.empleadoId, existing);
    });

    const estados: EmpleadoEstado[] = [];
    
    empleadosMap.forEach((regs, empleadoId) => {
      // Sort by timestamp desc
      const sorted = [...regs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const ultimo = sorted[0];
      
      const entradas = sorted.filter(r => r.tipo === 'ENTRADA');
      const salidas = sorted.filter(r => r.tipo === 'SALIDA');
      
      estados.push({
        empleadoId,
        cedula: ultimo.cedula,
        nombre: ultimo.nombre,
        area: ultimo.area,
        estado: ultimo.tipo === 'ENTRADA' ? 'DENTRO' : 'FUERA',
        ultimaEntrada: entradas[0] ? { fecha: entradas[0].fecha, hora: entradas[0].hora } : undefined,
        ultimaSalida: salidas[0] ? { fecha: salidas[0].fecha, hora: salidas[0].hora } : undefined,
        objetosPersonales: ultimo.objetosPersonales,
      });
    });

    return estados;
  }, [registros]);

  return {
    registros,
    loading,
    getEmpleadosEstado,
    refetch: fetchRegistros,
  };
}
