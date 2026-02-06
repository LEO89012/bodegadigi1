import { useState } from 'react';
import { Clock, User, FileSpreadsheet, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Empleado, RegistroHora } from '@/types';
import { ObjetosPersonales } from '@/components/registro-horas/ObjetosPersonales';
import { TareasARealizar } from '@/components/registro-horas/TareasARealizar';
import { AdminDashboard } from './AdminDashboard';

interface RegistroHorasProps {
  empleados: Empleado[];
  registros: RegistroHora[];
  findEmpleadoByCedula: (cedula: string) => Empleado | undefined;
  onAddRegistro: (
    empleado: Empleado,
    tipo: 'ENTRADA' | 'SALIDA',
    extras?: { objetosPersonales?: string; tareas?: string[] }
  ) => Promise<RegistroHora | null>;
  onExportExcel: () => Promise<boolean>;
  getRegistrosPorEmpleado: (empleadoId: number) => RegistroHora[];
  tiendaId: string;
  tiendaNombre: string;
}

export function RegistroHoras({
  empleados,
  registros,
  findEmpleadoByCedula,
  onAddRegistro,
  onExportExcel,
  getRegistrosPorEmpleado,
  tiendaId,
  tiendaNombre,
}: RegistroHorasProps) {
  const [cedula, setCedula] = useState('');
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState<Empleado | null>(null);
  const [objetosPersonales, setObjetosPersonales] = useState<string[]>(['NO INGRESA NADA']);
  const [tareas, setTareas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const now = new Date();
  const horaActual = now.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleCedulaChange = (value: string) => {
    setCedula(value);
    if (value.length >= 3) {
      const empleado = findEmpleadoByCedula(value);
      setEmpleadoEncontrado(empleado || null);
    } else {
      setEmpleadoEncontrado(null);
    }
  };

  const handleRegistro = async (tipo: 'ENTRADA' | 'SALIDA') => {
    if (isSubmitting) return; // Prevenir clicks múltiples
    
    if (!empleadoEncontrado) {
      toast({
        title: 'Error',
        description: 'Primero busque un empleado por cédula',
        variant: 'destructive',
      });
      return;
    }
    
    // Validar que no haya duplicados ANTES de bloquear
    const registrosEmpleado = getRegistrosPorEmpleado(empleadoEncontrado.id);
    const ultimoRegistro = registrosEmpleado[0];

    if (tipo === 'ENTRADA' && ultimoRegistro?.tipo === 'ENTRADA') {
      toast({
        title: 'Entrada duplicada',
        description: `${empleadoEncontrado.nombre} ya tiene una ENTRADA registrada. Debe registrar SALIDA primero.`,
        variant: 'destructive',
      });
      return;
    }

    if (tipo === 'SALIDA' && (!ultimoRegistro || ultimoRegistro.tipo === 'SALIDA')) {
      toast({
        title: 'Salida no permitida',
        description: `${empleadoEncontrado.nombre} no tiene una ENTRADA activa. Debe registrar ENTRADA primero.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const objetosTexto = objetosPersonales.length ? objetosPersonales.join(', ') : '';

    try {
      const registro = await onAddRegistro(empleadoEncontrado, tipo, {
        objetosPersonales: objetosTexto,
        tareas,
      });
      
      if (registro) {
        toast({
          title: `${tipo} registrada`,
          description: `${empleadoEncontrado.nombre} - ${new Date().toLocaleTimeString('es-CO')}`,
        });
      }
      setCedula('');
      setEmpleadoEncontrado(null);
      setObjetosPersonales(['NO INGRESA NADA']);
      setTareas([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalidaDirecta = async (empleado: Empleado) => {
    if (isSubmitting) return; // Prevenir clicks múltiples
    
    setIsSubmitting(true);
    const registrosEmpleado = getRegistrosPorEmpleado(empleado.id);
    const ultimo = registrosEmpleado[0];

    // Solo permitir SALIDA si el último registro fue ENTRADA
    if (!ultimo || ultimo.tipo !== 'ENTRADA') {
      setIsSubmitting(false);
      toast({
        title: 'Salida no permitida',
        description: 'Debe registrar una nueva ENTRADA antes de generar otra SALIDA.',
        variant: 'destructive',
      });
      return;
    }
    
    try {

    // En SALIDA, conservar los objetos personales de la última ENTRADA
    const ultimaEntrada = registrosEmpleado.find((r) => r.tipo === 'ENTRADA');
    const objetosTextoActual = objetosPersonales.length ? objetosPersonales.join(', ') : '';
    const objetosParaSalida = ultimaEntrada?.objetosPersonales || objetosTextoActual;

      const registro = await onAddRegistro(empleado, 'SALIDA', {
        objetosPersonales: objetosParaSalida,
        tareas,
      });
      
      if (registro) {
        toast({
          title: 'SALIDA registrada',
          description: `${empleado.nombre} - ${new Date().toLocaleTimeString('es-CO')}`,
        });
      }
      setCedula('');
      setEmpleadoEncontrado(null);
      setObjetosPersonales(['NO INGRESA NADA']);
      setTareas([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (registros.length === 0) {
      toast({
        title: 'Sin registros',
        description: 'No hay registros para exportar',
        variant: 'destructive',
      });
      return;
    }

    const success = await onExportExcel();
    if (success) {
      toast({
        title: 'Excel generado',
        description: 'Los registros han sido exportados y limpiados',
      });
    }
  };

  // Get unique employees that have registros
  const empleadosConRegistros = empleados.filter(e => 
    getRegistrosPorEmpleado(e.id).length > 0
  );

  const toggleTarea = (value: string) => {
    // Solo permitir 1 tarea a la vez (click de nuevo para deseleccionar)
    setTareas((prev) => (prev[0] === value ? [] : [value]));
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Clock className="w-4 h-4" />
        REGISTRO DE HORAS
      </div>
      <div className="h-px bg-border" />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="kiosk-label">CÉDULA</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => handleCedulaChange(e.target.value)}
            placeholder="Ingrese cédula"
            className="kiosk-input"
          />
        </div>
        <div>
          <label className="kiosk-label">NOMBRE</label>
          <input
            type="text"
            value={empleadoEncontrado?.nombre || ''}
            disabled
            className="kiosk-input bg-secondary/30"
          />
        </div>
        <div>
          <label className="kiosk-label">ÁREA</label>
          <input
            type="text"
            value={empleadoEncontrado?.area || ''}
            disabled
            className="kiosk-input bg-secondary/30"
          />
        </div>
        <div>
          <label className="kiosk-label">HORA DE REGISTRO</label>
          <input
            type="text"
            value={horaActual}
            disabled
            className="kiosk-input bg-secondary/30"
          />
        </div>
      </div>

      {/* Extra fields like the reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ObjetosPersonales value={objetosPersonales} onChange={setObjetosPersonales} />
        <TareasARealizar selected={tareas} onToggle={toggleTarea} />
      </div>

      {/* Main action */}
      <div>
        <button
          onClick={() => handleRegistro('ENTRADA')}
          disabled={!empleadoEncontrado || isSubmitting}
          className="kiosk-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRightCircle className="w-5 h-5" />
          )}
          REGISTRADOR DE ENTRADA
        </button>
      </div>

      <div className="h-px bg-border" />

      {/* Table */}
      {empleadosConRegistros.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="kiosk-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>CÉDULA</th>
                <th>ÁREA</th>
                <th>REGISTROS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {empleadosConRegistros.map(empleado => {
                const registrosEmpleado = getRegistrosPorEmpleado(empleado.id);
                const puedeGenerarSalida = registrosEmpleado[0]?.tipo === 'ENTRADA';
                return (
                  <tr key={empleado.id}>
                    <td className="font-semibold">{empleado.nombre}</td>
                    <td>{empleado.cedula}</td>
                    <td>{empleado.area}</td>
                    <td>
                      <div className="space-y-1 text-sm">
                        {registrosEmpleado.slice(0, 3).map(r => (
                          <div key={r.id}>
                            <span className={r.tipo === 'ENTRADA' ? 'kiosk-badge-entry' : 'kiosk-badge-exit'}>
                              {r.tipo}:
                            </span>{' '}
                            {r.fecha}, {r.hora}
                          </div>
                        ))}
                        {registrosEmpleado.length > 3 && (
                          <div className="text-muted-foreground">
                            +{registrosEmpleado.length - 3} más
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleSalidaDirecta(empleado)}
                        disabled={!puedeGenerarSalida || isSubmitting}
                        className="kiosk-btn-accent text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline mr-1" />
                        ) : (
                          <ArrowLeftCircle className="w-4 h-4 inline mr-1" />
                        )}
                        GENERAR SALIDA
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kiosk-empty">No hay registros para mostrar</div>
      )}

      {/* Action Buttons - Unified size */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleExport}
          className="flex-1 py-2.5 px-4 bg-accent text-accent-foreground font-semibold text-sm rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          GENERAR EXCEL
        </button>
        <AdminDashboard tiendaId={tiendaId} tiendaNombre={tiendaNombre} />
        <button
          onClick={() => {}}
          className="flex-1 py-2.5 px-4 bg-success text-success-foreground font-semibold text-sm rounded-lg hover:bg-success/90 transition-all flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          TODOS LOS REGISTROS ({registros.length})
        </button>
      </div>
    </div>
  );
}
