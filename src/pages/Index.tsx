import { useAuth } from '@/hooks/useAuth';
import { useEmpleados } from '@/hooks/useEmpleados';
import { useRegistros } from '@/hooks/useRegistros';
import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const { user, tienda, loading, login, register, logout } = useAuth();
  const { 
    empleados, 
    addEmpleado, 
    deleteEmpleado, 
    findEmpleadoByCedula 
  } = useEmpleados(tienda?.id);
  const { 
    registros,
    loading: registrosLoading,
    addRegistro, 
    exportToExcel, 
    getRegistrosPorEmpleado 
  } = useRegistros(tienda?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !tienda) {
    return <LoginScreen onLogin={login} onRegister={register} />;
  }

  return (
    <Dashboard
      tienda={tienda}
      empleados={empleados}
      registros={registros}
      onLogout={logout}
      onAddEmpleado={addEmpleado}
      onDeleteEmpleado={deleteEmpleado}
      onAddRegistro={addRegistro}
      onExportExcel={exportToExcel}
      findEmpleadoByCedula={findEmpleadoByCedula}
      getRegistrosPorEmpleado={getRegistrosPorEmpleado}
    />
  );
};

export default Index;
