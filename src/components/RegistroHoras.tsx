import { useState } from 'react';
import { Clock, User, FileSpreadsheet, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Empleado, RegistroHora } from '@/types';

interface RegistroHorasProps {
  empleados: Empleado[];
  registros: RegistroHora[];
  findEmpleadoByCedula: (cedula: string) => Empleado | undefined;
  onAddRegistro: (empleado: Empleado, tipo: 'ENTRADA' | 'SALIDA') => RegistroHora;
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

    onAddRegistro(empleadoEncontrado, tipo);
    toast({
      title: `${tipo} registrada`,
      description: `${empleadoEncontrado.nombre} - ${new Date().toLocaleTimeString('es-CO')}`,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Clock className="w-5 h-5" />
        REGISTRO DE HORAS
      </div>

      {/* Search Form */}
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleRegistro('ENTRADA')}
          disabled={!empleadoEncontrado}
          className="kiosk-btn-success flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowRightCircle className="w-5 h-5" />
          REGISTRAR ENTRADA
        </button>
        <button
          onClick={() => handleRegistro('SALIDA')}
          disabled={!empleadoEncontrado}
          className="kiosk-btn-accent flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          GENERAR SALIDA
        </button>
      </div>

      {/* Table */}
      {empleadosConRegistros.length > 0 && (
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
                        onClick={() => {
                          setCedula(empleado.cedula);
                          setEmpleadoEncontrado(empleado);
                        }}
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
      )}

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="kiosk-btn-success flex items-center gap-2"
        >
          <FileSpreadsheet className="w-5 h-5" />
          GENERAR EXCEL
        </button>
        <button
          onClick={() => {}}
          className="kiosk-btn-primary flex items-center gap-2"
        >
          <User className="w-5 h-5" />
          MOSTRAR TODOS LOS REGISTROS ({registros.length})
        </button>
      </div>
    </div>
  );
}
