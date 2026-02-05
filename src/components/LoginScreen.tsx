import { useState } from 'react';
import { Building2, Lock, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import alkostoKtronixLogo from '@/assets/alkosto-ktronix-logo.png';

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
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src={alkostoKtronixLogo} 
            alt="Alkosto Ktronix Logo" 
            className="h-32 w-32 object-contain drop-shadow-xl" 
          />
        </div>

        {/* Title with phone icons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Smartphone className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">BODEGA DIGITAL</h1>
          <Smartphone className="w-6 h-6 text-primary" />
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-2xl p-8 border-4 border-secondary">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primary mb-1 italic">Acceso al Sistema</h2>
            <p className="text-sm text-muted-foreground">Ingrese sus credenciales para continuar</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button 
              type="button" 
              onClick={() => setMode('login')} 
              className={`flex-1 py-3 px-4 font-bold text-sm uppercase rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card text-muted-foreground border-2 border-border hover:bg-secondary/50'
              }`}
            >
              Iniciar Sesión
            </button>
            <button 
              type="button" 
              onClick={() => setMode('register')} 
              className={`flex-1 py-3 px-4 font-bold text-sm uppercase rounded-lg transition-all ${
                mode === 'register' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card text-muted-foreground border-2 border-border hover:bg-secondary/50'
              }`}
            >
              Registrar Tienda
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Building2 className="w-4 h-4" />
                Nombre de la Tienda
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={nombreTienda} 
                  onChange={e => setNombreTienda(e.target.value)} 
                  placeholder="ALKOSTO PRUEBA" 
                  className="w-full px-4 py-3 pr-12 border-2 border-border rounded-lg bg-secondary/30 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" 
                  disabled={loading} 
                  autoComplete="username" 
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full px-4 py-3 border-2 border-border rounded-lg bg-secondary/30 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" 
                disabled={loading} 
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 px-6 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground font-bold rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrar Tienda'}
            </button>
          </form>

          {mode === 'register' && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Al registrar, se creará automáticamente un usuario interno para esta tienda.
            </p>
          )}
        </div>

        {/* Decorative phones on sides - hidden on mobile */}
        <div className="hidden md:block fixed left-8 top-1/2 -translate-y-1/2 opacity-30">
          <Smartphone className="w-16 h-16 text-primary rotate-[-15deg]" />
        </div>
        <div className="hidden md:block fixed right-8 top-1/2 -translate-y-1/2 opacity-30">
          <Smartphone className="w-16 h-16 text-primary rotate-[15deg]" />
        </div>
      </div>
    </div>
  );
}