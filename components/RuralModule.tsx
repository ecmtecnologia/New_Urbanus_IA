
import React, { useState } from 'react';
import { 
  TreePine, 
  Map as MapIcon, 
  FileCheck, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Search,
  ChevronRight,
  Info,
  X,
  Plus,
  User,
  Edit3,
  Globe
} from 'lucide-react';
import { ReurbProcess, ReurbType, RuralVertex, ProcessStatus } from '../types';
import { MOCK_PROCESSES, MOCK_FAMILIES } from '../constants';
import SigefSearchModal from './SigefSearchModal';

const RuralModule: React.FC = () => {
  const [processes, setProcesses] = useState<ReurbProcess[]>(
    MOCK_PROCESSES.filter(p => p.type === ReurbType.RURAL)
  );
  const [selectedProcess, setSelectedProcess] = useState<ReurbProcess | null>(
    MOCK_PROCESSES.find(p => p.type === ReurbType.RURAL) || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigefModalOpen, setIsSigefModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ReurbProcess | null>(null);
  const [newProcess, setNewProcess] = useState({
    title: '',
    neighborhood: '',
    cadastralCode: '',
    area: '',
    occupantName: '',
    cpf: '',
    matricula: '',
    car: '',
    nirf: '',
    moduloFiscal: '',
    municipio: '',
    // Dados Ambientais
    area_reserva_legal: '',
    area_app: '',
    area_uso_consolidado: '',
    vegetacao_nativa: '',
    // Dados Produtivos
    tipo_exploracao: '',
    area_utilizada: '',
    area_aproveitavel: '',
    indice_produtividade: ''
  });

  const handleSigefImport = (data: any) => {
    // Preenche o formulário com dados do SIGEF
    setNewProcess(prev => ({
      ...prev,
      title: data.name,
      cadastralCode: data.code,
      area: data.area.replace(' ha', '').replace('.', '').replace(',', '.'),
      municipio: data.municipio.split('/')[0],
      neighborhood: 'Zona Rural (SIGEF)',
      // Simulando preenchimento automático
      area_reserva_legal: (parseFloat(data.area.replace(' ha', '').replace('.', '').replace(',', '.')) * 0.2).toFixed(2),
      area_app: '0.00',
      area_uso_consolidado: '0.00',
      vegetacao_nativa: '0.00'
    }));
    setIsSigefModalOpen(false);
    setIsModalOpen(true); // Abre o modal de cadastro já preenchido
  };

  const handleOpenCreateModal = () => {
    setEditingProcess(null);
    setNewProcess({ 
      title: '', 
      neighborhood: '', 
      cadastralCode: '', 
      area: '', 
      occupantName: '', 
      cpf: '',
      matricula: '',
      car: '',
      nirf: '',
      moduloFiscal: '',
      municipio: '',
      area_reserva_legal: '',
      area_app: '',
      area_uso_consolidado: '',
      vegetacao_nativa: '',
      tipo_exploracao: '',
      area_utilizada: '',
      area_aproveitavel: '',
      indice_produtividade: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (proc: ReurbProcess) => {
    setEditingProcess(proc);
    setNewProcess({
      title: proc.title,
      neighborhood: proc.neighborhood,
      cadastralCode: proc.property.cadastralCode,
      area: (proc.ruralDetails?.area_total_ha || proc.property.area_sqm / 10000).toString(),
      occupantName: proc.occupant.name,
      cpf: proc.occupant.cpf,
      matricula: proc.ruralDetails?.numero_matricula || '',
      car: proc.ruralDetails?.registro_car || '',
      nirf: proc.ruralDetails?.nirf || '',
      moduloFiscal: proc.ruralDetails?.fiscalModule || '',
      municipio: proc.ruralDetails?.municipio_id || '',
      // Mapeando dados ambientais existentes ou vazios
      area_reserva_legal: proc.ruralDetails?.dados_ambientais?.area_reserva_legal_ha?.toString() || '',
      area_app: proc.ruralDetails?.dados_ambientais?.area_app_ha?.toString() || '',
      area_uso_consolidado: proc.ruralDetails?.dados_ambientais?.area_uso_consolidado_ha?.toString() || '',
      vegetacao_nativa: proc.ruralDetails?.dados_ambientais?.vegetacao_nativa_ha?.toString() || '',
      // Mapeando dados produtivos existentes ou vazios
      tipo_exploracao: proc.ruralDetails?.dados_produtivos?.tipo_exploracao || '',
      area_utilizada: proc.ruralDetails?.dados_produtivos?.area_efetivamente_utilizada_ha?.toString() || '',
      area_aproveitavel: proc.ruralDetails?.dados_produtivos?.area_aproveitavel_ha?.toString() || '',
      indice_produtividade: proc.ruralDetails?.dados_produtivos?.indice_produtividade?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const areaHa = parseFloat(newProcess.area);

    // Objetos auxiliares para dados ambientais e produtivos
    const dadosAmbientais = {
      id: `amb-${Date.now()}`,
      propriedade_id: editingProcess?.ruralDetails?.id || `rural-${Date.now()}`,
      area_reserva_legal_ha: parseFloat(newProcess.area_reserva_legal) || 0,
      area_app_ha: parseFloat(newProcess.area_app) || 0,
      area_uso_consolidado_ha: parseFloat(newProcess.area_uso_consolidado) || 0,
      vegetacao_nativa_ha: parseFloat(newProcess.vegetacao_nativa) || 0,
      status_car: (newProcess.car ? 'Pendente' : 'Suspenso') as 'Pendente' | 'Suspenso' | 'Ativo'
    };

    const dadosProdutivos = {
      id: `prod-${Date.now()}`,
      propriedade_id: editingProcess?.ruralDetails?.id || `rural-${Date.now()}`,
      tipo_exploracao: newProcess.tipo_exploracao || 'Não Informado',
      area_efetivamente_utilizada_ha: parseFloat(newProcess.area_utilizada) || 0,
      area_aproveitavel_ha: parseFloat(newProcess.area_aproveitavel) || 0,
      indice_produtividade: parseFloat(newProcess.indice_produtividade) || 0
    };

    if (editingProcess) {
      const updatedProcess: ReurbProcess = {
        ...editingProcess,
        title: newProcess.title,
        neighborhood: newProcess.neighborhood,
        occupant: {
          ...editingProcess.occupant,
          name: newProcess.occupantName,
          cpf: newProcess.cpf
        },
        property: {
          ...editingProcess.property,
          cadastralCode: newProcess.cadastralCode,
          area_sqm: areaHa * 10000,
          registryArea_sqm: areaHa * 10000,
        },
        ruralDetails: editingProcess.ruralDetails ? {
          ...editingProcess.ruralDetails,
          nome_imovel: newProcess.title,
          codigo_incra: newProcess.cadastralCode,
          numero_matricula: newProcess.matricula,
          registro_car: newProcess.car,
          nirf: newProcess.nirf,
          area_total_ha: areaHa,
          municipio_id: newProcess.municipio,
          fiscalModule: newProcess.moduloFiscal,
          originRegistry: newProcess.matricula,
          dados_ambientais: {
            ...editingProcess.ruralDetails.dados_ambientais,
            ...dadosAmbientais
          },
          dados_produtivos: {
            ...editingProcess.ruralDetails.dados_produtivos,
            ...dadosProdutivos
          }
        } : undefined
      };

      setProcesses(prev => prev.map(p => p.id === editingProcess.id ? updatedProcess : p));
      if (selectedProcess?.id === editingProcess.id) {
        setSelectedProcess(updatedProcess);
      }
    } else {
      const process: ReurbProcess = {
        id: Date.now().toString(),
        title: newProcess.title,
        neighborhood: newProcess.neighborhood,
        type: ReurbType.RURAL,
        status: ProcessStatus.TRIAGEM,
        createdAt: new Date().toISOString().split('T')[0],
        riskLevel: 'Low',
        aiInsights: ['Novo cadastro rural iniciado', 'Aguardando georreferenciamento'],
        occupant: { 
          name: newProcess.occupantName, 
          cpf: newProcess.cpf, 
          income: 0 
        },
        property: { 
          id: `prop-${Date.now()}`, 
          cadastralCode: newProcess.cadastralCode, 
          zone: 'RURAL', 
          sector: 'Setor Rural', 
          block: 'Gleba Nova', 
          area_sqm: areaHa * 10000,
          registryArea_sqm: areaHa * 10000,
          confrontantes: { norte: '', sul: '', leste: '', oeste: '' },
          confrontantes_lista: [],
          units: []
        },
        ruralDetails: {
          id: `rural-${Date.now()}`,
          nome_imovel: newProcess.title,
          codigo_incra: newProcess.cadastralCode,
          numero_matricula: newProcess.matricula,
          registro_car: newProcess.car,
          nirf: newProcess.nirf,
          area_total_ha: areaHa,
          municipio_id: newProcess.municipio,
          geomPoligono: null,
          fiscalModule: newProcess.moduloFiscal,
          originRegistry: newProcess.matricula,
          dados_ambientais: dadosAmbientais,
          dados_produtivos: dadosProdutivos,
          vertices: [],
          confrontantes: []
        }
      };

      setProcesses([process, ...processes]);
      setSelectedProcess(process);
    }

    setIsModalOpen(false);
    setEditingProcess(null);
  };

  // Mock vertices for the selected process
  const mockVertices: RuralVertex[] = [
    { id: 'v1', type: 'M', latitude: -23.5505, longitude: -46.6333, easting: 333450.12, northing: 7394500.45, azimuth: "45° 12' 30\"", distance: 120.5, confrontante: "Fazenda Boa Vista" },
    { id: 'v2', type: 'P', latitude: -23.5510, longitude: -46.6325, easting: 333570.62, northing: 7394450.15, azimuth: "135° 05' 12\"", distance: 85.2, confrontante: "Rio Claro" },
    { id: 'v3', type: 'V', latitude: -23.5520, longitude: -46.6330, easting: 333520.12, northing: 7394350.85, azimuth: "225° 18' 45\"", distance: 110.8, confrontante: "Estrada Municipal" },
    { id: 'v4', type: 'M', latitude: -23.5515, longitude: -46.6340, easting: 333420.32, northing: 7394400.25, azimuth: "315° 40' 10\"", distance: 95.4, confrontante: "Lote 02" },
  ];

  const handleGenerateMemorial = () => {
    if (!selectedProcess || !selectedProcess.ruralDetails) return;

    const { title, ruralDetails, occupant } = selectedProcess;
    const vertices = mockVertices;

    let memorialText = `MEMORIAL DESCRITIVO\n\n`;
    memorialText += `IMÓVEL: ${title}\n`;
    memorialText += `PROPRIETÁRIO/OCUPANTE: ${occupant.name} (CPF: ${occupant.cpf})\n`;
    memorialText += `MUNICÍPIO: ${ruralDetails.municipio_id || 'Não informado'}\n`;
    memorialText += `MATRÍCULA: ${ruralDetails.numero_matricula || 'Não informada'}\n`;
    memorialText += `CÓDIGO INCRA: ${ruralDetails.codigo_incra || 'Não informado'}\n`;
    memorialText += `ÁREA: ${ruralDetails.area_total_ha} ha\n\n`;
    
    memorialText += `DESCRIÇÃO DO PERÍMETRO:\n\n`;
    
    vertices.forEach((v, index) => {
      const nextV = vertices[(index + 1) % vertices.length];
      memorialText += `Do vértice ${v.id} de coordenadas N=${v.northing}m e E=${v.easting}m, segue com azimute de ${v.azimuth} e distância de ${v.distance}m até o vértice ${nextV.id}, confrontando com ${v.confrontante}.\n`;
    });

    memorialText += `\n\n`;
    memorialText += `Responsável Técnico:\n`;
    memorialText += `___________________________\n`;
    memorialText += `Eng. Agrimensor (Simulado)\n`;
    memorialText += `CREA: 000000/D\n`;
    memorialText += `Data: ${new Date().toLocaleDateString('pt-BR')}`;

    const blob = new Blob([memorialText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Memorial_Descritivo_${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Módulo Rural</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Gestão de Glebas, CAR, CCIR e Georreferenciamento INCRA.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsSigefModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Globe className="w-4 h-4 text-blue-600" /> Consultar SIGEF/INCRA
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 whitespace-nowrap"
          >
            <TreePine className="w-4 h-4" /> Novo Cadastro Rural
          </button>
        </div>
      </div>

      <SigefSearchModal 
        isOpen={isSigefModalOpen}
        onClose={() => setIsSigefModalOpen(false)}
        onImport={handleSigefImport}
      />

      {/* Modal de Novo Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-100 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 bg-emerald-950 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-xl">
                  {editingProcess ? <Edit3 className="w-6 h-6 text-slate-900" /> : <Plus className="w-6 h-6 text-slate-900" />}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">{editingProcess ? 'Editar Cadastro Rural' : 'Novo Cadastro Rural'}</h3>
                  <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-widest">REURB-R • Georreferenciamento</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProcess} className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome da Propriedade / Gleba</label>
                  <input 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: Fazenda Boa Esperança"
                    value={newProcess.title}
                    onChange={e => setNewProcess({...newProcess, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Localização / Bairro Rural</label>
                  <input 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: Setor Norte"
                    value={newProcess.neighborhood}
                    onChange={e => setNewProcess({...newProcess, neighborhood: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Código Cadastral / INCRA</label>
                  <input 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: 950.123.456.789-0"
                    value={newProcess.cadastralCode}
                    onChange={e => setNewProcess({...newProcess, cadastralCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Número da Matrícula</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: 12.345"
                    value={newProcess.matricula}
                    onChange={e => setNewProcess({...newProcess, matricula: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Registro CAR</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: PA-1502308-..."
                    value={newProcess.car}
                    onChange={e => setNewProcess({...newProcess, car: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">NIRF (Receita Federal)</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: 1.234.567-8"
                    value={newProcess.nirf}
                    onChange={e => setNewProcess({...newProcess, nirf: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Área Total (Hectares)</label>
                  <input 
                    required
                    type="number"
                    step="0.0001"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: 12.50"
                    value={newProcess.area}
                    onChange={e => setNewProcess({...newProcess, area: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Módulos Fiscais</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: 1.25"
                    value={newProcess.moduloFiscal}
                    onChange={e => setNewProcess({...newProcess, moduloFiscal: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Município</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    placeholder="Ex: Santarém"
                    value={newProcess.municipio}
                    onChange={e => setNewProcess({...newProcess, municipio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome do Responsável / Ocupante</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none"
                      value={newProcess.occupantName}
                      onChange={e => {
                        const selectedFamily = MOCK_FAMILIES.find(f => f.name === e.target.value);
                        setNewProcess({
                          ...newProcess, 
                          occupantName: e.target.value,
                          cpf: selectedFamily ? selectedFamily.cpf : ''
                        });
                      }}
                    >
                      <option value="">Selecione um responsável...</option>
                      {MOCK_FAMILIES.map(family => (
                        <option key={family.id} value={family.name}>
                          {family.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">CPF do Responsável</label>
                  <input 
                    required
                    readOnly
                    className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-slate-500 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none cursor-not-allowed"
                    placeholder="Ex: 123.456.789-00"
                    value={newProcess.cpf}
                  />
                </div>
              </div>

              {/* Seção de Dados Ambientais */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-emerald-600" /> Dados Ambientais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Área de Reserva Legal (ha)</label>
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 2.50"
                      value={newProcess.area_reserva_legal}
                      onChange={e => setNewProcess({...newProcess, area_reserva_legal: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Área de APP (ha)</label>
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 1.20"
                      value={newProcess.area_app}
                      onChange={e => setNewProcess({...newProcess, area_app: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Uso Consolidado (ha)</label>
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 8.00"
                      value={newProcess.area_uso_consolidado}
                      onChange={e => setNewProcess({...newProcess, area_uso_consolidado: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Vegetação Nativa (ha)</label>
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 3.50"
                      value={newProcess.vegetacao_nativa}
                      onChange={e => setNewProcess({...newProcess, vegetacao_nativa: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seção de Dados Produtivos */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" /> Dados Produtivos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Exploração</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none"
                      value={newProcess.tipo_exploracao}
                      onChange={e => setNewProcess({...newProcess, tipo_exploracao: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="Agricultura">Agricultura</option>
                      <option value="Pecuária">Pecuária</option>
                      <option value="Mista">Mista</option>
                      <option value="Florestal">Florestal</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Área Utilizada (ha)</label>
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 10.00"
                      value={newProcess.area_utilizada}
                      onChange={e => setNewProcess({...newProcess, area_utilizada: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Área Aproveitável (ha)</label>
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 11.50"
                      value={newProcess.area_aproveitavel}
                      onChange={e => setNewProcess({...newProcess, area_aproveitavel: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Índice de Produtividade (%)</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: 85.5"
                      value={newProcess.indice_produtividade}
                      onChange={e => setNewProcess({...newProcess, indice_produtividade: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full md:w-auto px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  {editingProcess ? <Edit3 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editingProcess ? 'Salvar Alterações' : 'Iniciar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Lista de Processos Rurais */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Processos em Análise</h3>
          {processes.map(proc => (
            <div 
              key={proc.id}
              onClick={() => setSelectedProcess(proc)}
              className={`w-full text-left p-5 rounded-[2rem] border transition-all cursor-pointer group ${
                selectedProcess?.id === proc.id 
                  ? 'bg-emerald-50 border-emerald-200 shadow-md' 
                  : 'bg-white border-slate-100 hover:border-emerald-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase tracking-tighter">
                  {proc.property.cadastralCode}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(proc); }}
                    className="p-1.5 bg-white border border-slate-100 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <span className={`text-[10px] font-bold ${proc.riskLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    Risco: {proc.riskLevel}
                  </span>
                </div>
              </div>
              <p className="font-bold text-slate-900 truncate">{proc.title}</p>
              <p className="text-xs text-slate-500 mt-1">{proc.neighborhood}</p>
            </div>
          ))}

          {/* Card de Resumo Ambiental */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <TreePine className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-bold">Análise Ambiental IA</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total de APP Analisada</span>
                <span className="font-mono">12.450 ha</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Sobreposições RL</span>
                <span className="text-rose-400 font-bold">03 Alertas</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-blue-400 w-3/4"></div>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-2">Sincronizado com SICAR em tempo real.</p>
            </div>
          </div>
        </div>

        {/* Main Content: Detalhes do Imóvel Rural */}
        <div className="lg:col-span-8 space-y-8">
          {selectedProcess ? (
            <>
              {/* Header do Imóvel */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="flex gap-4 items-center md:items-start">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                      <MapIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{selectedProcess.title}</h3>
                      <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                        <Compass className="w-4 h-4" /> {selectedProcess.property.sector} • {selectedProcess.property.block}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleEdit(selectedProcess)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Editar Dados
                    </button>
                    <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área Total</p>
                      <p className="text-2xl font-black text-slate-900">
                        {selectedProcess.ruralDetails?.area_total_ha 
                          ? selectedProcess.ruralDetails.area_total_ha.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : (selectedProcess.property.area_sqm / 10000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        } 
                        <span className="text-sm font-bold text-slate-400"> ha</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Status CAR</span>
                    </div>
                    <p className="font-bold text-slate-800">
                      {selectedProcess.ruralDetails?.dados_ambientais?.status_car || 'Não Inscrito'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">
                      Recibo: {selectedProcess.ruralDetails?.registro_car || '---'}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Status CCIR</span>
                    </div>
                    <p className="font-bold text-slate-800">
                      {selectedProcess.ruralDetails?.dados_produtivos?.tipo_exploracao || 'Sem Dados'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">
                      Código: {selectedProcess.ruralDetails?.codigo_incra || '---'}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Módulo Fiscal</span>
                    </div>
                    <p className="font-bold text-slate-800">
                      {selectedProcess.ruralDetails?.fiscalModule || '---'} Módulos
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Município: {selectedProcess.ruralDetails?.municipio_id || '---'}
                    </p>
                  </div>
                </div>

                {/* Detalhes Ambientais e Produtivos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-emerald-600" /> Dados Ambientais
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Reserva Legal</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_ambientais?.area_reserva_legal_ha?.toFixed(2) || '0.00'} ha</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Área de APP</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_ambientais?.area_app_ha?.toFixed(2) || '0.00'} ha</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Uso Consolidado</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_ambientais?.area_uso_consolidado_ha?.toFixed(2) || '0.00'} ha</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Vegetação Nativa</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_ambientais?.vegetacao_nativa_ha?.toFixed(2) || '0.00'} ha</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-600" /> Dados Produtivos
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Tipo de Exploração</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_produtivos?.tipo_exploracao || 'Não Informado'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Área Utilizada</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_produtivos?.area_efetivamente_utilizada_ha?.toFixed(2) || '0.00'} ha</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Área Aproveitável</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_produtivos?.area_aproveitavel_ha?.toFixed(2) || '0.00'} ha</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Índice de Produtividade</span>
                        <span className="font-bold text-slate-900">{selectedProcess.ruralDetails?.dados_produtivos?.indice_produtividade?.toFixed(2) || '0.00'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Georreferenciamento e Memorial */}
              <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Compass className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-lg font-bold">Vértices Georreferenciados (INCRA)</h3>
                  </div>
                  <button 
                    onClick={handleGenerateMemorial}
                    className="w-full md:w-auto px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Gerar Memorial Descritivo
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vértice</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Easting (m)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Northing (m)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Azimute</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distância (m)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Confrontante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mockVertices.map((v, idx) => (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{v.id.toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.type === 'M' ? 'bg-blue-100 text-blue-700' : 
                              v.type === 'P' ? 'bg-amber-100 text-amber-700' : 
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {v.type === 'M' ? 'Marco' : v.type === 'P' ? 'Ponto' : 'Vértice'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">{v.easting}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">{v.northing}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">{v.azimuth}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">{v.distance}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-800">{v.confrontante}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-emerald-50/30 flex items-center gap-3">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Nota Técnica INCRA 3ª Edição:</strong> Os cálculos de azimutes e distâncias foram validados pela IA Urbanus com base na projeção UTM (SAD69/SIRGAS2000).
                  </p>
                </div>
              </div>

              {/* Insights da IA para o Rural */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas de Conformidade Rural
                </h3>
                <div className="space-y-4">
                  {selectedProcess.aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="mt-1">
                        {insight.includes('Sobreposição') ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <TreePine className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Selecione um processo rural</h3>
              <p className="text-slate-400 max-w-xs mt-2">Escolha um imóvel na lista lateral para visualizar os dados de georreferenciamento e análise ambiental.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuralModule;
