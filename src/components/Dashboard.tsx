import { useState } from 'react';
import { ShoppingCart, LogOut } from 'lucide-react';
import { RegistroHoras } from './RegistroHoras';
import { RegistroEmpleados } from './RegistroEmpleados';
import type { Tienda, Empleado, RegistroHora } from '@/types';
import ktronixAlkostoLogo from '@/assets/ktronix-alkosto.png';
interface DashboardProps {
  tienda: Tienda;
  empleados: Empleado[];
  registros: RegistroHora[];
  onLogout: () => void;
  onAddEmpleado: (cedula: string, nombre: string, area: string) => Promise<Empleado>;
  onDeleteEmpleado: (id: number) => Promise<void>;
  onAddRegistro: (empleado: Empleado, tipo: 'ENTRADA' | 'SALIDA', extras?: {
    objetosPersonales?: string;
    tareas?: string[];
  }) => RegistroHora;
  onExportExcel: () => boolean;
  findEmpleadoByCedula: (cedula: string) => Empleado | undefined;
  getRegistrosPorEmpleado: (empleadoId: number) => RegistroHora[];
}
export function Dashboard({
  tienda,
  empleados,
  registros,
  onLogout,
  onAddEmpleado,
  onDeleteEmpleado,
  onAddRegistro,
  onExportExcel,
  findEmpleadoByCedula,
  getRegistrosPorEmpleado
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'horas' | 'empleados'>('horas');
  return <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Card */}
        <div className="kiosk-card p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="flex justify-center mb-3">
                <img src={ktronixAlkostoLogo} alt="Logo Ktronix Alkosto" loading="lazy" className="h-16 sm:h-20 w-auto object-contain border-dotted shadow-xl rounded-2xl" />
              </div>
              <div className="flex items-center justify-center gap-3 text-primary">
                <ShoppingCart className="w-6 h-6" />
                <h1 className="text-xl sm:text-2xl font-bold text-primary text-center">
                  REGISTRO EMPLEADOS A BODEGA DIGITAL
                </h1>
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>

            <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-primary transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">{tienda.nombre}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button type="button" onClick={() => setActiveTab('horas')} className={`kiosk-tab ${activeTab === 'horas' ? 'kiosk-tab-active' : 'kiosk-tab-inactive'}`}>
              Registro de Horas
            </button>
            <button type="button" onClick={() => setActiveTab('empleados')} className={`kiosk-tab ${activeTab === 'empleados' ? 'kiosk-tab-active' : 'kiosk-tab-inactive'}`}>
              Registro de Empleados
            </button>
          </div>

          {/* Content */}
          {activeTab === 'horas' ? <RegistroHoras empleados={empleados} registros={registros} findEmpleadoByCedula={findEmpleadoByCedula} onAddRegistro={onAddRegistro} onExportExcel={onExportExcel} getRegistrosPorEmpleado={getRegistrosPorEmpleado} /> : <RegistroEmpleados empleados={empleados} onAddEmpleado={onAddEmpleado} onDeleteEmpleado={onDeleteEmpleado} />}
        </div>
      </div>
    </div>;
}