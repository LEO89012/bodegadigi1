import { useState } from 'react';
import { Eye, EyeOff, Users, Clock, RefreshCw, Lock } from 'lucide-react';
import { useAdminRegistros, EmpleadoEstado } from '@/hooks/useAdminRegistros';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  tiendaId: string;
  tiendaNombre: string;
}

export function AdminDashboard({
  tiendaId,
  tiendaNombre
}: AdminDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  
  const {
    registros,
    loading,
    getEmpleadosEstado,
    refetch
  } = useAdminRegistros(tiendaId);
  const empleadosEstado = getEmpleadosEstado();
  const empleadosDentro = empleadosEstado.filter(e => e.estado === 'DENTRO');
  const empleadosFuera = empleadosEstado.filter(e => e.estado === 'FUERA');

  const handleAdminClick = () => {
    setShowPasswordDialog(true);
    setPassword('');
  };

  const handlePasswordSubmit = () => {
    if (password === 'admin') {
      setShowPasswordDialog(false);
      setIsOpen(true);
      setPassword('');
    } else {
      toast({
        title: 'Acceso denegado',
        description: 'Contraseña incorrecta',
        variant: 'destructive',
      });
      setPassword('');
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <>
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Acceso Administrador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="kiosk-label">CONTRASEÑA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                placeholder="Ingrese contraseña"
                className="kiosk-input"
                autoFocus
              />
            </div>
            <button
              onClick={handlePasswordSubmit}
              className="w-full kiosk-btn-primary"
            >
              INGRESAR
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Button */}
      <button
        onClick={handleAdminClick}
        className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        VISUALIZACIÓN ADMIN
      </button>

      {/* Admin Dashboard Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Users className="w-6 h-6 text-primary" />
            Monitor en Tiempo Real - {tiendaNombre}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="kiosk-panel flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{empleadosDentro.length}</p>
                <p className="text-sm text-muted-foreground">Dentro de Bodega</p>
              </div>
            </div>
            <div className="kiosk-panel flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{empleadosFuera.length}</p>
                <p className="text-sm text-muted-foreground">Fuera de Bodega</p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button onClick={() => refetch()} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Employees Inside Table */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              EMPLEADOS DENTRO DE BODEGA ({empleadosDentro.length})
            </h3>
            {empleadosDentro.length > 0 ? <div className="overflow-x-auto rounded-lg border border-border">
                <table className="kiosk-table">
                  <thead>
                    <tr>
                      <th>NOMBRE</th>
                      <th>ÁREA</th>
                      <th>OBJETOS</th>
                      <th>HORA ENTRADA</th>
                      <th>FECHA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosDentro.map(emp => <EmpleadoRow key={emp.empleadoId} empleado={emp} />)}
                  </tbody>
                </table>
              </div> : <div className="kiosk-empty">No hay empleados dentro de bodega</div>}
          </div>

          {/* Employees Outside Table */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              EMPLEADOS FUERA DE BODEGA ({empleadosFuera.length})
            </h3>
            {empleadosFuera.length > 0 ? <div className="overflow-x-auto rounded-lg border border-border">
                <table className="kiosk-table">
                  <thead>
                    <tr>
                      <th>NOMBRE</th>
                      <th>ÁREA</th>
                      <th>HORA ENTRADA</th>
                      <th>HORA SALIDA</th>
                      <th>FECHA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosFuera.map(emp => <tr key={emp.empleadoId}>
                        <td className="font-semibold">{emp.nombre}</td>
                        <td>{emp.area}</td>
                        <td>{emp.ultimaEntrada?.hora || '-'}</td>
                        <td>{emp.ultimaSalida?.hora || '-'}</td>
                        <td>{emp.ultimaSalida?.fecha || emp.ultimaEntrada?.fecha || '-'}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="kiosk-empty">No hay empleados fuera de bodega</div>}
          </div>

          {/* All Registros History */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              HISTORIAL DE REGISTROS DEL DÍA ({registros.length})
            </h3>
            {registros.length > 0 ? <div className="overflow-x-auto rounded-lg border border-border max-h-64">
                <table className="kiosk-table">
                  <thead className="sticky top-0">
                    <tr>
                      <th>NOMBRE</th>
                      <th>TIPO</th>
                      <th>HORA</th>
                      <th>FECHA</th>
                      <th>OBJETOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.slice(0, 50).map(r => <tr key={r.id}>
                        <td className="font-semibold">{r.nombre}</td>
                        <td>
                          <span className={r.tipo === 'ENTRADA' ? 'kiosk-badge-entry' : 'kiosk-badge-exit'}>
                            {r.tipo}
                          </span>
                        </td>
                        <td>{r.hora}</td>
                        <td>{r.fecha}</td>
                        <td className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {r.objetosPersonales || '-'}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="kiosk-empty">No hay registros del día</div>}
          </div>

          {/* Info Note */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg">
            <p>ℹ️ Esta vista muestra registros en tiempo real que NO se borran al exportar Excel.</p>
            <p>Los registros se limpian automáticamente a las 11:00 PM cada día.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
function EmpleadoRow({
  empleado
}: {
  empleado: EmpleadoEstado;
}) {
  return <tr>
      <td className="font-semibold">{empleado.nombre}</td>
      <td>{empleado.area}</td>
      <td className="text-sm text-muted-foreground max-w-[200px] truncate">
        {empleado.objetosPersonales || '-'}
      </td>
      <td>{empleado.ultimaEntrada?.hora || '-'}</td>
      <td>{empleado.ultimaEntrada?.fecha || '-'}</td>
    </tr>;
}