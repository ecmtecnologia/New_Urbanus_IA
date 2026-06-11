import React, { useState, useRef } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  PenTool, 
  Eraser,
  Save,
  UserCog,
  Lock
} from 'lucide-react';

type TabType = 'USERS' | 'GROUPS';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  group: string;
  status: 'Ativo' | 'Inativo';
  hasSignature: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@municipio.gov.br', role: 'Engenheira', group: 'Técnico', status: 'Ativo', hasSignature: true },
  { id: '2', name: 'Carlos Souza', email: 'carlos.souza@municipio.gov.br', role: 'Advogado', group: 'Jurídico', status: 'Ativo', hasSignature: true },
  { id: '3', name: 'Mariana Lima', email: 'mariana.lima@municipio.gov.br', role: 'Assistente Social', group: 'Social', status: 'Inativo', hasSignature: false },
];

const MOCK_GROUPS: Group[] = [
  { id: '1', name: 'Administradores', description: 'Acesso total ao sistema', permissions: ['ALL'], usersCount: 2 },
  { id: '2', name: 'Jurídico', description: 'Gestão de processos e pareceres', permissions: ['PROCESS_VIEW', 'PROCESS_EDIT', 'LEGAL_OPINION'], usersCount: 5 },
  { id: '3', name: 'Técnico', description: 'Mapeamento e topografia', permissions: ['MAP_VIEW', 'MAP_EDIT', 'UPLOAD_KML'], usersCount: 8 },
  { id: '4', name: 'Social', description: 'Cadastro de famílias', permissions: ['FAMILY_VIEW', 'FAMILY_EDIT'], usersCount: 12 },
];

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('USERS');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  
  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  // Form States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  
  // Signature Canvas
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- Signature Logic (Reused) ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY
    };
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    setShowSignatureModal(false);
    // Here you would save the signature data to the user state
    alert('Assinatura digital vinculada ao usuário!');
  };

  // --- CRUD Handlers ---

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save/update user
    setShowUserModal(false);
    setEditingUser(null);
    alert('Usuário salvo com sucesso!');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save/update group
    setShowGroupModal(false);
    setEditingGroup(null);
    alert('Grupo salvo com sucesso!');
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Tem certeza que deseja remover este grupo?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Usuários e Permissões</h2>
          <p className="text-slate-500 mt-1">Gerencie o acesso e a estrutura organizacional da equipe.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'USERS' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'GROUPS' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Grupos
          </button>
        </div>
      </div>

      {/* --- USERS TAB --- */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar usuário por nome ou e-mail..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button 
              onClick={() => { setEditingUser(null); setShowUserModal(true); }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Usuário
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">{user.group}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {user.hasSignature ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100" title="Assinatura Digital Cadastrada">
                      <PenTool className="w-3 h-3 text-emerald-600" />
                      <span className="text-[9px] font-bold text-emerald-700 uppercase">Assinado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 opacity-50" title="Sem Assinatura">
                      <PenTool className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Pendente</span>
                    </div>
                  )}
                  
                  <div className="h-8 w-px bg-slate-100 mx-2" />
                  
                  <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- GROUPS TAB --- */}
      {activeTab === 'GROUPS' && (
        <div className="space-y-6">
          <div className="flex justify-end items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => { setEditingGroup(null); setShowGroupModal(true); }}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Grupo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingGroup(group); setShowGroupModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteGroup(group.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{group.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{group.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissões</p>
                    <div className="flex flex-wrap gap-2">
                      {group.permissions.map((perm, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-mono border border-slate-200">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-slate-500">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold">{group.usersCount} Usuários vinculados</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- USER MODAL --- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-emerald-600" />
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome Completo</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" defaultValue={editingUser?.name} required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">E-mail Corporativo</label>
                  <input type="email" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" defaultValue={editingUser?.email} required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Cargo / Função</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" defaultValue={editingUser?.role} required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Grupo de Acesso</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none" defaultValue={editingUser?.group}>
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Status</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none" defaultValue={editingUser?.status || 'Ativo'}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Assinatura Digital</label>
                  <button 
                    type="button"
                    onClick={() => setShowSignatureModal(true)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <PenTool className="w-3 h-3" /> {editingUser?.hasSignature ? 'Atualizar Assinatura' : 'Coletar Assinatura'}
                  </button>
                </div>
                
                <div className="w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                   {editingUser?.hasSignature ? (
                     <p className="text-xs font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Assinatura Válida e Criptografada</p>
                   ) : (
                     <p className="text-xs font-bold text-slate-400">Nenhuma assinatura digital cadastrada</p>
                   )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GROUP MODAL --- */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGroup} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome do Grupo</label>
                <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" defaultValue={editingGroup?.name} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Descrição</label>
                <textarea className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none resize-none h-24" defaultValue={editingGroup?.description} />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Permissões (Tags)</label>
                <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" placeholder="Separe por vírgula (ex: VIEW, EDIT)" defaultValue={editingGroup?.permissions.join(', ')} />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SIGNATURE MODAL (Reused) --- */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Assinatura Digital</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coleta Biométrica do Usuário</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSignatureModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative group">
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={200}
                  className="w-full h-[200px] cursor-crosshair touch-none bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="absolute bottom-2 right-2 opacity-50 pointer-events-none text-[8px] font-black text-slate-300 uppercase">
                  Área de Assinatura
                </div>
              </div>
              
              <p className="text-center text-xs text-slate-500 max-w-xs">
                Solicite ao usuário que assine no campo acima para vincular sua identidade digital às ações do sistema.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between gap-4">
              <button 
                onClick={clearSignature}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Eraser className="w-4 h-4" /> Limpar
              </button>
              <button 
                onClick={saveSignature}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
