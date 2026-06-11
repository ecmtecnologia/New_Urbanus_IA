
import React, { useState, useEffect } from 'react';
import { MOCK_PROCESSES, MOCK_FAMILIES } from '../constants';
import { ReurbProcess, ReurbType, ProcessStatus } from '../types';
import { createProcess, deleteProcess, listProcesses, updateProcess } from '../services/processService';
import { 
  ExternalLink, 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Map as MapIcon, 
  Edit3, 
  X, 
  Save, 
  CheckCircle2,
  User,
  Home
} from 'lucide-react';

interface ProcessListProps {
  onAnalyze: (id: string) => void;
  onViewMap: (id: string) => void;
  onOpenFamily: (id: string) => void;
}

const ProcessList: React.FC<ProcessListProps> = ({ onAnalyze, onViewMap, onOpenFamily }) => {
  const [processes, setProcesses] = useState<ReurbProcess[]>(MOCK_PROCESSES);
  const [showModal, setShowModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ReurbProcess | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const loadFromApi = async () => {
      try {
        const items = await listProcesses();
        if (items.length > 0) {
          setProcesses(items);
        }
      } catch {
        setApiError('API de processos indisponível. Operando em modo local temporário.');
      }
    };

    loadFromApi();
  }, []);

  // Form state for lookups
  const [formData, setFormData] = useState({
    cadastralCode: '',
    neighborhood: '',
    occupantName: '',
    cpf: '',
    income: '',
    area: '',
    type: ReurbType.SOCIAL
  });

  useEffect(() => {
    if (editingProcess) {
      setFormData({
        cadastralCode: editingProcess.property.cadastralCode,
        neighborhood: editingProcess.neighborhood,
        occupantName: editingProcess.occupant.name,
        cpf: editingProcess.occupant.cpf,
        income: editingProcess.occupant.income.toString(),
        area: editingProcess.property.area_sqm.toString(),
        type: editingProcess.type
      });
    } else {
      setFormData({
        cadastralCode: '',
        neighborhood: '',
        occupantName: '',
        cpf: '',
        income: '',
        area: '',
        type: ReurbType.SOCIAL
      });
    }
  }, [editingProcess, showModal]);

  const handleOccupantLookup = (name: string) => {
    const family = MOCK_FAMILIES.find(f => f.name === name);
    if (family) {
      setFormData(prev => ({
        ...prev,
        occupantName: family.name,
        cpf: family.cpf,
        income: family.income.toString()
      }));
    } else {
      setFormData(prev => ({ ...prev, occupantName: name }));
    }
  };

  const handlePropertyLookup = (code: string) => {
    const existing = processes.find(p => p.property.cadastralCode === code);
    if (existing) {
      setFormData(prev => ({
        ...prev,
        cadastralCode: existing.property.cadastralCode,
        neighborhood: existing.neighborhood,
        area: existing.property.area_sqm.toString()
      }));
    } else {
      setFormData(prev => ({ ...prev, cadastralCode: code }));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este processo do fluxo de regularização?')) {
      const previous = [...processes];
      setProcesses(prev => prev.filter(p => p.id !== id));

      try {
        await deleteProcess(id);
      } catch {
        setProcesses(previous);
        setApiError('Falha ao excluir processo na API.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProcess) {
      const updatedProcess: ReurbProcess = {
        ...editingProcess,
        neighborhood: formData.neighborhood,
        type: formData.type,
        title: `${formData.neighborhood} - ${formData.cadastralCode}`,
        occupant: { ...editingProcess.occupant, name: formData.occupantName, cpf: formData.cpf, income: Number(formData.income) },
        property: { ...editingProcess.property, cadastralCode: formData.cadastralCode, area_sqm: Number(formData.area) }
      };

      setProcesses(prev => prev.map(p => p.id === editingProcess.id ? updatedProcess : p));

      try {
        const saved = await updateProcess(editingProcess.id, updatedProcess);
        setProcesses(prev => prev.map(p => p.id === editingProcess.id ? saved : p));
      } catch {
        setApiError('Falha ao atualizar processo na API.');
      }
    } else {
      const newProcess: ReurbProcess = {
        id: crypto.randomUUID(),
        title: `${formData.neighborhood} - ${formData.cadastralCode}`,
        neighborhood: formData.neighborhood,
        type: formData.type,
        status: ProcessStatus.TRIAGEM,
        createdAt: new Date().toISOString().split('T')[0],
        riskLevel: 'Low',
        aiInsights: ['Aguardando primeira análise da AISHA'],
        occupant: { name: formData.occupantName, cpf: formData.cpf, income: Number(formData.income) },
        property: {
          id: crypto.randomUUID(),
          cadastralCode: formData.cadastralCode,
          zone: '',
          sector: '',
          block: '',
          area_sqm: Number(formData.area),
          units: [],
          confrontantes_lista: [],
          confrontantes: { norte: '', sul: '', leste: '', oeste: '' }
        }
      };

      setProcesses(prev => [newProcess, ...prev]);

      try {
        const saved = await createProcess(newProcess);
        setProcesses(prev => [saved, ...prev.filter(p => p.id !== newProcess.id)]);
      } catch {
        setApiError('Falha ao criar processo na API.');
      }
    }

    setShowModal(false);
    setEditingProcess(null);
  };

  const filteredProcesses = processes.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.occupant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
          {apiError}
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fluxo de Regularização</h2>
          <p className="text-sm text-slate-500">Gestão centralizada de protocolos e títulos.</p>
        </div>
        <button 
          onClick={() => { setEditingProcess(null); setShowModal(true); }}
          className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10"
        >
          <Plus className="w-4 h-4" /> 
          Novo Protocolo
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por lote, ocupante ou núcleo..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 transition-all w-full md:w-auto flex justify-center">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modalidade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiário</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Atual</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risco/IA</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcesses.map((process) => (
                <tr key={process.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900">{process.title}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">Protocolado em {process.createdAt}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      process.type === ReurbType.SOCIAL 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {process.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-700">{process.occupant.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{process.occupant.cpf}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${process.status === ProcessStatus.CONCLUIDO ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                      <span className="text-xs font-bold text-slate-600">{process.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                      process.riskLevel === 'High' ? 'bg-rose-50 text-rose-600' : 
                      process.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {process.riskLevel === 'High' && <ShieldAlert className="w-3.5 h-3.5" />}
                      {process.riskLevel === 'Low' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-black uppercase tracking-tight">{process.aiInsights[0]}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => onAnalyze(process.id)}
                          title="Análise IA Jurídica"
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onViewMap(process.id)}
                          title="Ver no GIS"
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                        >
                            <MapIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onOpenFamily(process.id)}
                          title="Abrir Cadastro Social"
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                        >
                            <User className="w-4 h-4" />
                        </button>
                        <div className="w-px h-8 bg-slate-200 mx-1"></div>
                        <button 
                          onClick={() => { setEditingProcess(process); setShowModal(true); }}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(process.id)}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                  {editingProcess ? 'Editar Protocolo' : 'Novo Protocolo'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-200 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
             </div>
             
             <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Imóvel</h4>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={formData.cadastralCode}
                        onChange={(e) => handlePropertyLookup(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none"
                      >
                        <option value="">Selecionar Inscrição...</option>
                        {processes.map(p => (
                          <option key={p.id} value={p.property.cadastralCode}>{p.property.cadastralCode}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      value={formData.neighborhood} 
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      required 
                      placeholder="Núcleo" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm" 
                    />
                    <input 
                      value={formData.area} 
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      required 
                      placeholder="Área (m²)" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm" 
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">Ocupante</h4>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={formData.occupantName}
                        onChange={(e) => handleOccupantLookup(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none"
                      >
                        <option value="">Selecionar Beneficiário...</option>
                        {MOCK_FAMILIES.map(f => (
                          <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      value={formData.cpf} 
                      readOnly
                      placeholder="CPF (Automático)" 
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-500 cursor-not-allowed" 
                    />
                    <input 
                      value={formData.income} 
                      onChange={(e) => setFormData(prev => ({ ...prev, income: e.target.value }))}
                      placeholder="Renda Mensal" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modalidade REURB</h4>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: ReurbType.SOCIAL }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.type === ReurbType.SOCIAL ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                    >
                      REURB-S (Social)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: ReurbType.ESPECIFICO }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.type === ReurbType.ESPECIFICO ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                    >
                      REURB-E (Específico)
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Protocolo
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessList;
