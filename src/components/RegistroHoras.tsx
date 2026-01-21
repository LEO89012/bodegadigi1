import { useState } from 'react';
import { Clock, User, FileSpreadsheet, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Empleado, RegistroHora } from '@/types';
import { ObjetosPersonales } from '@/components/registro-horas/ObjetosPersonales';
import { TareasARealizar } from '@/components/registro-horas/TareasARealizar';

interface RegistroHorasProps {
  empleados: Empleado[];
  registros: RegistroHora[];
  findEmpleadoByCedula: (cedula: string) => Empleado | undefined;
  onAddRegistro: (
    empleado: Empleado,
    tipo: 'ENTRADA' | 'SALIDA',
    extras?: { objetosPersonales?: string; tareas?: string[] }
  ) => RegistroHora;
  onExportExcel: () => boolean;
  getRegistrosPorEmpleado: (empleadoId: number) => RegistroHora[];
}

export function RegistroHoras({
  empleados,
  registros,
  findEmpleadoByCedula,
  onAddRegistro,
  onExportExcel,
  getRegistrosPorEmpleado,
}: RegistroHorasProps) {
  const [cedula, setCedula] = useState('');
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState<Empleado | null>(null);
  const [objetosPersonales, setObjetosPersonales] = useState<string>('NINGUNO');
  const [tareas, setTareas] = useState<string[]>([]);
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

  const handleRegistro = (tipo: 'ENTRADA' | 'SALIDA') => {
    if (!empleadoEncontrado) {
      toast({
        title: 'Error',
        description: 'Primero busque un empleado por cédula',
        variant: 'destructive',
      });
      return;
    }

    onAddRegistro(empleadoEncontrado, tipo, {
      objetosPersonales,
      tareas,
    });
    toast({
      title: `${tipo} registrada`,
      description: `${empleadoEncontrado.nombre} - ${new Date().toLocaleTimeString('es-CO')}`,
    });
    setCedula('');
    setEmpleadoEncontrado(null);
  };

  const handleSalidaDirecta = (empleado: Empleado) => {
    onAddRegistro(empleado, 'SALIDA', {
      objetosPersonales,
      tareas,
    });
    toast({
      title: 'SALIDA registrada',
      description: `${empleado.nombre} - ${new Date().toLocaleTimeString('es-CO')}`,
    });
    setCedula('');
    setEmpleadoEncontrado(null);
  };

  const handleExport = () => {
    if (registros.length === 0) {
      toast({
        title: 'Sin registros',
        description: 'No hay registros para exportar',
        variant: 'destructive',
      });
      return;
    }

    const success = onExportExcel();
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
    setTareas((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
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
          disabled={!empleadoEncontrado}
          className="kiosk-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowRightCircle className="w-5 h-5" />
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
                        className="kiosk-btn-accent text-sm py-2 px-4"
                      >
                        <ArrowLeftCircle className="w-4 h-4 inline mr-1" />
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

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          className="kiosk-btn-accent flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-5 h-5" />
          GENERAR EXCEL
        </button>
        <button
          onClick={() => {}}
          className="kiosk-btn-success flex items-center justify-center gap-2"
        >
          <User className="w-5 h-5" />
          MOSTRAR TODOS LOS REGISTROS ({registros.length})
        </button>
      </div>
    </div>
  );
}
