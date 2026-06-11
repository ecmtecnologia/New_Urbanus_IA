import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  Building2, 
  Scale, 
  Users, 
  Map, 
  Crown 
} from 'lucide-react';

const LoginModule: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email || 'usuario@urbanus.com', selectedRole, password || undefined);
    } catch {
      setError('Nao foi possivel autenticar. Verifique e-mail/senha e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'MASTER', label: 'Master / Gestor', icon: Crown, desc: 'Acesso total ao sistema e configurações.' },
    { id: 'JURIDICO', label: 'Jurídico', icon: Scale, desc: 'Gestão de processos e pareceres legais.' },
    { id: 'SOCIAL', label: 'Social', icon: Users, desc: 'Cadastro de famílias e selagem.' },
    { id: 'TECNICO', label: 'Técnico / GIS', icon: Map, desc: 'Mapeamento, topografia e análise espacial.' },
    { id: 'ADMIN', label: 'Administrativo', icon: Building2, desc: 'Gestão geral e relatórios.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="max-w-6xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Lado Esquerdo - Branding */}
        <div className="lg:w-1/2 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grid-pattern)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/50">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-4">
              Urbanus <span className="text-emerald-500">IA</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
              Plataforma inteligente de regularização fundiária urbana. Gestão jurídica, social e técnica em um único ecossistema.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Conformidade Legal</h3>
                <p className="text-slate-400 text-xs">Auditoria automática de processos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Inteligência Geoespacial</h3>
                <p className="text-slate-400 text-xs">Análise de sobreposição e conflitos</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-xs text-slate-600 font-mono">
            v2.5.0-beta • Secure Environment
          </div>
        </div>

        {/* Lado Direito - Login Form */}
        <div className="lg:w-1/2 p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Bem-vindo de volta</h2>
              <p className="text-slate-500 font-medium">Selecione seu perfil de acesso para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="email" 
                      autoComplete="username"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm group-hover:bg-slate-100"
                      placeholder="seu.nome@municipio.gov.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="password" 
                      autoComplete="current-password"
                      minLength={6}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm group-hover:bg-slate-100"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Perfil de Acesso (Simulação)</label>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id as UserRole)}
                        className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-900/10' 
                            : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-emerald-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>{role.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{role.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Acessar Plataforma <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {error && (
                <p className="text-xs font-bold text-rose-600 mt-3">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModule;
