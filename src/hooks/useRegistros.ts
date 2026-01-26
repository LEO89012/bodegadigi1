import { useState, useCallback, useEffect } from 'react';
import type { RegistroHora, Empleado } from '@/types';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'registros_horas';

function loadFromStorage(): RegistroHora[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reconstruct Date objects from timestamps
      return parsed.map((r: RegistroHora & { timestamp: string }) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
    }
  } catch (e) {
    console.error('Error loading registros from storage:', e);
  }
  return [];
}

function saveToStorage(registros: RegistroHora[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  } catch (e) {
    console.error('Error saving registros to storage:', e);
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing registros from storage:', e);
  }
}

export function useRegistros() {
  const [registros, setRegistros] = useState<RegistroHora[]>(() => loadFromStorage());

  // Sync to localStorage whenever registros change
  useEffect(() => {
    saveToStorage(registros);
  }, [registros]);

  const addRegistro = useCallback((
    empleado: Empleado,
    tipo: 'ENTRADA' | 'SALIDA',
    extras?: { objetosPersonales?: string; tareas?: string[] }
  ) => {
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
      objetosPersonales: extras?.objetosPersonales,
      tareas: extras?.tareas,
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

    // Clear registros after export and remove from storage
    setRegistros([]);
    clearStorage();
    return true;
  }, [registros]);

  return {
    registros,
    addRegistro,
    getUltimoRegistro,
    getRegistrosPorEmpleado,
    exportToExcel,
    clearRegistros: () => {
      setRegistros([]);
      clearStorage();
    },
  };
}
