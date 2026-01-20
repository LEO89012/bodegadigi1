import { useState, useCallback } from 'react';
import type { RegistroHora, Empleado } from '@/types';
import * as XLSX from 'xlsx';

export function useRegistros() {
  const [registros, setRegistros] = useState<RegistroHora[]>([]);

  const addRegistro = useCallback((empleado: Empleado, tipo: 'ENTRADA' | 'SALIDA') => {
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

    const nuevoRegistro: RegistroHora = {
      id: crypto.randomUUID(),
      empleadoId: empleado.id,
      cedula: empleado.cedula,
      nombre: empleado.nombre,
      area: empleado.area,
      tipo,
      fecha,
      hora,
      timestamp: now,
    };

    setRegistros(prev => [nuevoRegistro, ...prev]);
    return nuevoRegistro;
  }, []);

  const getUltimoRegistro = useCallback((empleadoId: number): RegistroHora | undefined => {
    return registros.find(r => r.empleadoId === empleadoId);
  }, [registros]);

  const getRegistrosPorEmpleado = useCallback((empleadoId: number): RegistroHora[] => {
    return registros.filter(r => r.empleadoId === empleadoId);
  }, [registros]);

  const exportToExcel = useCallback(() => {
    if (registros.length === 0) return false;

    const data = registros.map(r => ({
      'CÉDULA': r.cedula,
      'NOMBRE': r.nombre,
      'ÁREA': r.area,
      'TIPO': r.tipo,
      'FECHA': r.fecha,
      'HORA': r.hora,
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
    ];
    worksheet['!cols'] = colWidths;

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `registros_${fecha}.xlsx`);

    // Clear registros after export
    setRegistros([]);
    return true;
  }, [registros]);

  return {
    registros,
    addRegistro,
    getUltimoRegistro,
    getRegistrosPorEmpleado,
    exportToExcel,
    clearRegistros: () => setRegistros([]),
  };
}
