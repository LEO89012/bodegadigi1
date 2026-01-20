import { useState } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Empleado, AreaEmpleado } from '@/types';

interface RegistroEmpleadosProps {
  empleados: Empleado[];
  onAddEmpleado: (cedula: string, nombre: string, area: string) => Promise<Empleado>;
  onDeleteEmpleado: (id: number) => Promise<void>;
}

const AREAS: AreaEmpleado[] = [
  'ADMINISTRACIÓN',
  'PUNTO DE VENTA',
  'EXTERNO',
  'BODEGA',
  'SISTEMAS',
];

export function RegistroEmpleados({
  empleados,
  onAddEmpleado,
  onDeleteEmpleado,
}: RegistroEmpleadosProps) {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!cedula.trim() || !nombre.trim() || !area) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await onAddEmpleado(cedula, nombre, area);
      toast({
        title: 'Empleado registrado',
        description: `${nombre.toUpperCase()} ha sido agregado`,
      });
      setCedula('');
      setNombre('');
      setArea('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al registrar';
      let friendlyMessage = message;
      
      if (message.includes('duplicate key') || message.includes('unique')) {
        friendlyMessage = 'Ya existe un empleado con esta cédula en la tienda';
      }
      
      toast({
        title: 'Error',
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empleado: Empleado) => {
    if (!confirm(`¿Está seguro de eliminar a ${empleado.nombre}?`)) return;
    
    try {
      await onDeleteEmpleado(empleado.id);
      toast({
        title: 'Empleado eliminado',
        description: `${empleado.nombre} ha sido eliminado`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el empleado',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Users className="w-5 h-5" />
        REGISTRO DE EMPLEADOS
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="kiosk-label">CÉDULA</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Ingrese cédula"
            className="kiosk-input"
            disabled={loading}
          />
        </div>
        <div>
          <label className="kiosk-label">NOMBRE</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingrese nombre completo"
            className="kiosk-input"
            disabled={loading}
          />
        </div>
        <div>
          <label className="kiosk-label">ÁREA</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="kiosk-input"
            disabled={loading}
          >
            <option value="">Seleccione un área</option>
            {AREAS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="kiosk-btn-success flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          REGISTRAR EMPLEADO
        </button>
      </div>

      {/* Table */}
      {empleados.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="kiosk-table">
            <thead>
              <tr>
                <th>CÉDULA</th>
                <th>NOMBRE</th>
                <th>ÁREA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(empleado => (
                <tr key={empleado.id}>
                  <td>{empleado.cedula}</td>
                  <td className="font-semibold">{empleado.nombre}</td>
                  <td>{empleado.area}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(empleado)}
                      className="kiosk-btn-destructive text-sm py-2 px-4 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      BORRAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {empleados.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No hay empleados registrados</p>
          <p className="text-sm">Agregue empleados usando el formulario superior</p>
        </div>
      )}
    </div>
  );
}
