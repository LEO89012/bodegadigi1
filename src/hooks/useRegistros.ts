import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RegistroHora, Empleado } from '@/types';
import * as XLSX from 'xlsx';

export function useRegistros(tiendaId?: string) {
  const [registros, setRegistros] = useState<RegistroHora[]>([]);
  const [loading, setLoading] = useState(true);

  // Load registros from Supabase on mount and when tiendaId changes
  useEffect(() => {
    if (!tiendaId) {
      setRegistros([]);
      setLoading(false);
      return;
    }

    const fetchRegistros = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('registros_horas')
        .select('*')
        .eq('tienda_id', tiendaId)
        .eq('exportado', false)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching registros:', error);
        setRegistros([]);
      } else {
        // Map database records to our RegistroHora type
        const mapped: RegistroHora[] = (data || []).map((r) => ({
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
        }));
        setRegistros(mapped);
      }
      setLoading(false);
    };

    fetchRegistros();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('registros_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registros_horas',
          filter: `tienda_id=eq.${tiendaId}`,
        },
        () => {
          // Refetch on any change
          fetchRegistros();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tiendaId]);

  const addRegistro = useCallback(async (
    empleado: Empleado,
    tipo: 'ENTRADA' | 'SALIDA',
    extras?: { objetosPersonales?: string; tareas?: string[] }
  ): Promise<RegistroHora | null> => {
    if (!tiendaId) return null;

    const now = new Date();
    const fecha = now.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const hora = now.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const { data, error } = await supabase
      .from('registros_horas')
      .insert({
        empleado_id: empleado.id,
        cedula: empleado.cedula,
        nombre: empleado.nombre,
        area: empleado.area,
        tipo,
        fecha,
        hora,
        timestamp: now.toISOString(),
        objetos_personales: extras?.objetosPersonales || null,
        tareas: extras?.tareas || null,
        tienda_id: tiendaId,
        exportado: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding registro:', error);
      // If it's a duplicate trigger error, throw so the UI can show a message
      if (error.message?.includes('Registro duplicado')) {
        throw new Error(`Registro duplicado de ${tipo} para este empleado`);
      }
      return null;
    }

    // Also insert into registros_admin for real-time monitoring
    const { error: adminError } = await supabase
      .from('registros_admin')
      .insert({
        empleado_id: empleado.id,
        cedula: empleado.cedula,
        nombre: empleado.nombre,
        area: empleado.area,
        tipo,
        fecha,
        hora,
        timestamp: now.toISOString(),
        objetos_personales: extras?.objetosPersonales || null,
        tareas: extras?.tareas || null,
        tienda_id: tiendaId,
      });

    if (adminError) {
      console.error('Error adding admin registro:', adminError);
    }

    const nuevoRegistro: RegistroHora = {
      id: data.id,
      empleadoId: data.empleado_id,
      cedula: data.cedula,
      nombre: data.nombre,
      area: data.area,
      tipo: data.tipo as 'ENTRADA' | 'SALIDA',
      fecha: data.fecha,
      hora: data.hora,
      timestamp: new Date(data.timestamp),
      objetosPersonales: data.objetos_personales || undefined,
      tareas: data.tareas || undefined,
    };

    // Update local state immediately
    setRegistros(prev => [nuevoRegistro, ...prev]);
    return nuevoRegistro;
  }, [tiendaId]);

  const getUltimoRegistro = useCallback((empleadoId: number): RegistroHora | undefined => {
    return registros.find(r => r.empleadoId === empleadoId);
  }, [registros]);

  const getRegistrosPorEmpleado = useCallback((empleadoId: number): RegistroHora[] => {
    return registros.filter(r => r.empleadoId === empleadoId);
  }, [registros]);

  const exportToExcel = useCallback(async () => {
    if (registros.length === 0) return false;

    // Organizar por empleado (nombre) y luego por timestamp
    const sorted = [...registros].sort((a, b) => {
      const nameCompare = a.nombre.localeCompare(b.nombre);
      if (nameCompare !== 0) return nameCompare;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    const data = sorted.map(r => ({
      'CÉDULA': r.cedula,
      'NOMBRE': r.nombre,
      'ÁREA': r.area,
      'TIPO': r.tipo,
      'FECHA': r.fecha,
      'HORA': r.hora,
      'OBJETOS PERSONALES': r.objetosPersonales || '',
      'TAREAS': (r.tareas || []).join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');

    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Cedula
      { wch: 35 }, // Nombre
      { wch: 20 }, // Area
      { wch: 10 }, // Tipo
      { wch: 12 }, // Fecha
      { wch: 12 }, // Hora
      { wch: 28 }, // Objetos
      { wch: 40 }, // Tareas
    ];
    worksheet['!cols'] = colWidths;

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `registros_${fecha}.xlsx`);

    // Delete registros from database after export
    const ids = registros.map(r => r.id);
    const { error } = await supabase
      .from('registros_horas')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting registros:', error);
    }

    // Clear local state (they won't appear anymore because exportado=true)
    setRegistros([]);
    return true;
  }, [registros]);

  return {
    registros,
    loading,
    addRegistro,
    getUltimoRegistro,
    getRegistrosPorEmpleado,
    exportToExcel,
    clearRegistros: async () => {
      // Delete non-exported registros
      if (tiendaId) {
        await supabase
          .from('registros_horas')
          .delete()
          .eq('tienda_id', tiendaId)
          .eq('exportado', false);
      }
      setRegistros([]);
    },
  };
}
