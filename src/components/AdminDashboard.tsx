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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-white to-blue-50 border-2 border-primary/20">
        <DialogHeader className="border-b border-primary/10 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl text-primary">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            Monitor en Tiempo Real - {tiendaNombre}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="bg-white rounded-xl p-4 shadow-md border border-green-200 flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{empleadosDentro.length}</p>
                <p className="text-sm text-gray-600 font-medium">Dentro de Bodega</p>
              </div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-md border border-orange-200 flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                <EyeOff className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{empleadosFuera.length}</p>
                <p className="text-sm text-gray-600 font-medium">Fuera de Bodega</p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button onClick={() => refetch()} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50 font-medium">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Employees Inside Table */}
          <div 
            className="bg-white rounded-xl p-4 shadow-md border border-green-200 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              EMPLEADOS DENTRO DE BODEGA ({empleadosDentro.length})
            </h3>
            {empleadosDentro.length > 0 ? <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">NOMBRE</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ÁREA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">OBJETOS</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">HORA ENTRADA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">FECHA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {empleadosDentro.map(emp => <tr key={emp.empleadoId} className="hover:bg-green-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-800">{emp.nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.area}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{emp.objetosPersonales || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.ultimaEntrada?.hora || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.ultimaEntrada?.fecha || '-'}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">No hay empleados dentro de bodega</div>}
          </div>

          {/* Employees Outside Table */}
          <div 
            className="bg-white rounded-xl p-4 shadow-md border border-orange-200 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              EMPLEADOS FUERA DE BODEGA ({empleadosFuera.length})
            </h3>
            {empleadosFuera.length > 0 ? <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">NOMBRE</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ÁREA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">HORA ENTRADA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">HORA SALIDA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">FECHA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {empleadosFuera.map(emp => <tr key={emp.empleadoId} className="hover:bg-orange-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-800">{emp.nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.area}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.ultimaEntrada?.hora || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.ultimaSalida?.hora || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.ultimaSalida?.fecha || emp.ultimaEntrada?.fecha || '-'}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">No hay empleados fuera de bodega</div>}
          </div>

          {/* All Registros History */}
          <div 
            className="bg-white rounded-xl p-4 shadow-md border border-blue-200 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              HISTORIAL DE REGISTROS DEL DÍA ({registros.length})
            </h3>
            {registros.length > 0 ? <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-64">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">NOMBRE</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">TIPO</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">HORA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">FECHA</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">OBJETOS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registros.slice(0, 50).map(r => <tr key={r.id} className="hover:bg-blue-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-800">{r.nombre}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            r.tipo === 'ENTRADA' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {r.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.hora}</td>
                        <td className="px-4 py-3 text-gray-600">{r.fecha}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                          {r.objetosPersonales || '-'}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">No hay registros del día</div>}
          </div>

          {/* Info Note */}
          <div 
            className="text-xs text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-200 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <p className="font-medium">ℹ️ Esta vista muestra registros en tiempo real que NO se borran al exportar Excel.</p>
            <p className="mt-1">Los registros se limpian automáticamente a las 11:00 PM cada día.</p>
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