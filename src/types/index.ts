export interface Tienda {
  id: string;
  nombre: string;
  created_at: string;
}

export interface Empleado {
  id: number;
  tienda_id: string;
  cedula: string;
  nombre: string;
  area: string;
  is_global: boolean;
  created_at: string;
}

export interface RegistroHora {
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
}

export type AreaEmpleado = 
  | 'ADMINISTRACIÓN'
  | 'PUNTO DE VENTA'
  | 'EXTERNO'
  | 'BODEGA'
  | 'SISTEMAS'
  | 'SUPERVISOR'
  | 'MANTENIMIENTO';
