
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  FileText, 
  ShieldCheck, 
  Settings, 
  Layers,
  Search,
  Bell,
  UserCircle,
  Database,
  Users,
  Fingerprint,
  Handshake,
  Download,
  BarChart3,
  BookMarked,
  MapPinned,
  Menu,
  X,
  TreePine,
  LogOut,
  UserCog
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, hasPermission } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Definição dos itens de menu com permissões
  const allMenuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, roles: ['ADMIN', 'MASTER', 'JURIDICO', 'SOCIAL', 'TECNICO'] },
    { id: 'processes', label: 'Processos', icon: FileText, roles: ['ADMIN', 'MASTER', 'JURIDICO', 'SOCIAL'] },
    { id: 'ged', label: 'Gestão de Documentos (GED)', icon: Layers, roles: ['ADMIN', 'MASTER', 'JURIDICO', 'SOCIAL', 'TECNICO'] },
    { id: 'territory', label: 'Gestão Territorial', icon: MapPinned, roles: ['ADMIN', 'MASTER', 'TECNICO'] },
    { id: 'rural', label: 'Módulo Rural', icon: TreePine, roles: ['ADMIN', 'MASTER', 'TECNICO', 'SOCIAL'] },
    { id: 'gis', label: 'Módulo GIS', icon: Map, roles: ['ADMIN', 'MASTER', 'TECNICO'] },
    { id: 'analyst', label: 'Analista Virtual', icon: ShieldCheck, roles: ['ADMIN', 'MASTER', 'JURIDICO'] },
    { id: 'conflicts', label: 'Mediação (Pacificador)', icon: Handshake, roles: ['ADMIN', 'MASTER', 'JURIDICO'] },
    { id: 'legislation', label: 'Base de Leis', icon: BookMarked, roles: ['ADMIN', 'MASTER', 'JURIDICO'] },
    { id: 'export', label: 'Exportação SAEC', icon: Download, roles: ['ADMIN', 'MASTER', 'TECNICO'] },
    { id: 'team', label: 'Gestão de Equipe', icon: BarChart3, roles: ['ADMIN', 'MASTER'] },
    { id: 'users', label: 'Usuários e Acessos', icon: UserCog, roles: ['ADMIN', 'MASTER'] },
    { id: 'portal', label: 'Gerenciar Família', icon: Users, roles: ['ADMIN', 'MASTER', 'SOCIAL'] },
    { id: 'security', label: 'Segurança', icon: Fingerprint, roles: ['ADMIN', 'MASTER'] },
    { id: 'database', label: 'Banco de Dados', icon: Database, roles: ['MASTER'] },
  ];

  // Filtrar itens baseado no role do usuário
  const menuItems = allMenuItems.filter(item => 
    user?.role === 'MASTER' || item.roles.includes(user?.role as any)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Urbanus IA</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-emerald-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                  : 'text-emerald-300/60 hover:text-white hover:bg-emerald-900'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-900">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-900/50 rounded-xl mb-2">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-emerald-500" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-emerald-400 uppercase font-black tracking-wider">{user?.role || 'Visitante'}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-950 hover:bg-rose-900/50 text-emerald-400 hover:text-rose-200 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
          >
            <LogOut className="w-3 h-3" /> Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar processos, matrículas ou ocupantes..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-slate-500 hover:bg-emerald-50 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
               ) : (
                  <UserCircle className="w-8 h-8 text-slate-400" />
               )}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#fdfdfd]">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
