import { useState, useEffect } from 'react';
import { Building2, Lock, SmartphoneCharging } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ktronixLogo from '@/assets/ktronix-alkosto.png';
import alkostoLogo from '@/assets/alkosto-logo.png';
import loginVideo from '@/assets/login-video.mp4';
interface LoginScreenProps {
  onLogin: (nombre: string, password: string) => Promise<unknown>;
  onRegister: (nombre: string, password: string) => Promise<unknown>;
}
export function LoginScreen({
  onLogin,
  onRegister
}: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nombreTienda, setNombreTienda] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const {
    toast
  } = useToast();

  const logos = [ktronixLogo, alkostoLogo];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTienda.trim() || !password.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingrese todos los campos',
        variant: 'destructive'
      });
      return;
    }
    if (password.length < 4) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 4 caracteres',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(nombreTienda, password);
        toast({
          title: '¡Bienvenido!',
          description: `Acceso concedido a ${nombreTienda.toUpperCase()}`
        });
      } else {
        await onRegister(nombreTienda, password);
        toast({
          title: '¡Tienda registrada!',
          description: `${nombreTienda.toUpperCase()} ha sido creada exitosamente`
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      let friendlyMessage = message;
      if (message.includes('Invalid login credentials')) {
        friendlyMessage = 'Credenciales inválidas. Verifique el nombre de tienda y contraseña.';
      } else if (message.includes('User already registered')) {
        friendlyMessage = 'Esta tienda ya está registrada. Intente iniciar sesión.';
      } else if (message.includes('duplicate key')) {
        friendlyMessage = 'Ya existe una tienda con este nombre.';
      }
      toast({
        title: 'Error',
        description: friendlyMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen p-4 opacity-100 items-center justify-start flex flex-row px-[5px] py-[5px]">
      <div className="flex items-stretch gap-0 max-w-4xl w-full">
        {/* Video - lado izquierdo, translúcido */}
        <div className="hidden md:flex w-[420px] rounded-l-3xl overflow-hidden relative" style={{ opacity: 0.15 }}>
          <video
          src={loginVideo}
          autoPlay
          loop
          muted
          playsInline
          className="min-w-full min-h-full object-cover opacity-30" />

        </div>

        {/* Login - lado derecho */}
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-36 flex items-center justify-center relative">
                {logos.map((logo, index) =>
              <img
                key={index}
                src={logo}
                alt="Logo"
                style={{
                  opacity: index === currentLogoIndex ? 1 : 0,
                  transform: index === currentLogoIndex ? 'scale(1)' : 'scale(0.95)'
                }}
                className="h-12 w-auto object-contain rounded-xl absolute transition-all duration-700 ease-in-out" />
              )}
              </div>
              <div className="flex items-center justify-center gap-3">
                <SmartphoneCharging className="w-7 text-primary h-[35px]" />
                <h1 className="text-3xl font-bold text-primary">BODEGA DIGITAL</h1>
                <SmartphoneCharging className="w-7 text-primary h-[35px]" />
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="kiosk-card p-8 py-[35px] my-0 mx-0 px-[35px] pb-[35px] border-4 border-secondary border-solid rounded-3xl opacity-100" style={{ boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35), 0 10px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div className="text-center mb-6">
              <h2 className="font-bold mb-1 text-primary text-center text-2xl">Acceso al Sistema</h2>
              <p className="text-sm text-muted-foreground">Ingrese sus credenciales para continuar</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button type="button" onClick={() => setMode('login')} className={`flex-1 kiosk-tab ${mode === 'login' ? 'kiosk-tab-active' : 'kiosk-tab-inactive'}`}>
                Iniciar Sesión
              </button>
              <button type="button" onClick={() => setMode('register')} className={`flex-1 kiosk-tab ${mode === 'register' ? 'kiosk-tab-active' : 'kiosk-tab-inactive'}`}>
                Registrar Tienda
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="kiosk-label">
                  <Building2 className="w-4 h-4" />
                  Nombre de la Tienda
                </label>
                <input type="text" value={nombreTienda} onChange={(e) => setNombreTienda(e.target.value)} placeholder="ALKOSTO PRUEBA" className="kiosk-input" disabled={loading} autoComplete="username" />
              </div>

              <div>
                <label className="kiosk-label">
                  <Lock className="w-4 h-4" />
                  Contraseña
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="kiosk-input" disabled={loading} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </div>

              <button type="submit" disabled={loading} className="kiosk-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrar Tienda'}
              </button>
            </form>

            {mode === 'register' && <p className="text-xs text-muted-foreground text-center mt-4">
                Al registrar, se creará automáticamente un usuario interno para esta tienda.
              </p>}
          </div>
        </div>
      </div>
    </div>;
}