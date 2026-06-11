
import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  MapPin, 
  FileText, 
  Home, 
  Maximize2, 
  Layers, 
  Building2, 
  Zap, 
  Clock, 
  User, 
  Plus, 
  Paperclip,
  CheckCircle2,
  Image as ImageIcon,
  Map as MapIcon,
  Gavel,
  ClipboardList,
  Target,
  Download
} from 'lucide-react';

type LotTab = 'IDENTIFICACAO' | 'DOCUMENTACAO' | 'TERRITORIAL' | 'DIMENSOES' | 'FUNDIARIA' | 'ZONEAMENTO' | 'INFRAESTRUTURA' | 'CONTEXTO' | 'GEO' | 'TITULARIDADE';

interface LotEditorProps {
  onClose: () => void;
  initialData?: any;
}

const LotEditor: React.FC<LotEditorProps> = ({ onClose, initialData }) => {
  const [activeTab, setActiveTab] = useState<LotTab>('IDENTIFICACAO');
  
  // State for Memorial Descritivo generation
  const [lotData, setLotData] = useState({
    loteNumber: '01',
    quadraId: 'QD-001',
    endereco: 'Rua Principal, S/N',
    bairro: 'Centro',
    cidade: 'Santarém',
    uf: 'PA',
    testada: '10.00',
    profundidade: '25.00',
    area: '250.00',
    confrontanteFrente: 'Rua Principal',
    confrontanteFundo: 'Lote 15',
    confrontanteDireita: 'Lote 02',
    confrontanteEsquerda: 'Lote 20',
    memorial: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setLotData(prev => ({ ...prev, [field]: value }));
  };

  const generateMemorial = () => {
    const text = `MEMORIAL DESCRITIVO

IMÓVEL: Lote Urbano nº ${lotData.loteNumber} da Quadra ${lotData.quadraId}
LOCALIZAÇÃO: ${lotData.endereco}, ${lotData.bairro}, ${lotData.cidade} - ${lotData.uf}
ÁREA TOTAL: ${lotData.area} m²

DESCRIÇÃO DO PERÍMETRO:
Inicia-se a descrição deste perímetro no vértice V-01, situado no alinhamento predial da ${lotData.confrontanteFrente}, distante 0,00m da esquina mais próxima.
Deste, segue confrontando com o ${lotData.confrontanteDireita}, com azimute de 90°00'00" e distância de ${lotData.profundidade}m até o vértice V-02.
Deste, deflete à direita e segue confrontando com o ${lotData.confrontanteFundo}, com azimute de 180°00'00" e distância de ${lotData.testada}m até o vértice V-03.
Deste, deflete à direita e segue confrontando com o ${lotData.confrontanteEsquerda}, com azimute de 270°00'00" e distância de ${lotData.profundidade}m até o vértice V-04.
Deste, deflete à direita e segue confrontando com a ${lotData.confrontanteFrente}, com azimute de 0°00'00" e distância de ${lotData.testada}m até o vértice V-01, ponto inicial da descrição deste perímetro.

Santarém - PA, ${new Date().toLocaleDateString('pt-BR')}

__________________________________________
Responsável Técnico
CREA/CAU: 000000`;
    
    handleInputChange('memorial', text);
  };

  const downloadMemorial = () => {
    if (!lotData.memorial) return;
    const blob = new Blob([lotData.memorial], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Memorial_Lote_${lotData.loteNumber}_Quadra_${lotData.quadraId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'IDENTIFICACAO', label: 'Identificação' },
    { id: 'DOCUMENTACAO', label: 'Documentação' },
    { id: 'TERRITORIAL', label: 'Territorial' },
    { id: 'DIMENSOES', label: 'Dimensões' },
    { id: 'FUNDIARIA', label: 'Fundiária' },
    { id: 'ZONEAMENTO', label: 'Zoneamento' },
    { id: 'INFRAESTRUTURA', label: 'Infra Estrutura' },
    { id: 'CONTEXTO', label: 'Contexto' },
    { id: 'GEO', label: 'Geo' },
    { id: 'TITULARIDADE', label: 'Titularidade' },
  ];

  const inputClass = "w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest";
  const sectionTitleClass = "text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6";

  const renderIdentificacao = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>ID (Sistema Lote)</label>
          <input className={inputClass} defaultValue="LT-1001" />
        </div>
        <div>
          <label className={labelClass}>ID da Quadra</label>
          <input 
            className={inputClass} 
            value={lotData.quadraId} 
            onChange={(e) => handleInputChange('quadraId', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <label className={labelClass}>Tipo de Imóvel</label>
        <div className="relative">
          <select className={inputClass + " appearance-none"}>
            <option>Urbano - Edificado</option>
            <option>Urbano - Lote Vago</option>
            <option>Rural</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Número do Lote</label>
          <input 
            className={inputClass} 
            value={lotData.loteNumber} 
            onChange={(e) => handleInputChange('loteNumber', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>UF</label>
          <div className="relative">
            <select 
              className={inputClass + " appearance-none"}
              value={lotData.uf}
              onChange={(e) => handleInputChange('uf', e.target.value)}
            >
              <option>MA</option>
              <option>SP</option>
              <option>RJ</option>
              <option>PA</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Endereço Completo</label>
        <input 
          className={inputClass} 
          value={lotData.endereco} 
          onChange={(e) => handleInputChange('endereco', e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
           <ImageIcon className="w-4 h-4 text-emerald-600" />
           <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Fachada do Imóvel</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { label: 'Lateral Direita', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=300' },
             { label: 'Fachada Principal', img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=300' },
             { label: 'Lateral Esquerda', img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=300' }
           ].map((fachada, i) => (
             <div key={i} className="space-y-3 text-center">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{fachada.label}</p>
               <div className="aspect-[4/3] rounded-3xl overflow-hidden border-4 border-emerald-50 shadow-lg group relative cursor-pointer">
                  <img src={fachada.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={fachada.label} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Plus className="w-8 h-8 text-white" />
                  </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentacao = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-10">
        <h4 className={sectionTitleClass}><Plus className="w-4 h-4" /> Anexar Arquivo do Imóvel</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className={labelClass}>Tipo de Documento</label>
            <div className="relative">
              <select className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none">
                <option>Selecione o Tipo...</option>
                <option>Certidão de Matrícula</option>
                <option>Contrato de Compra e Venda</option>
                <option>Planta Planimétrica</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Nº Documento / Referência</label>
            <input className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none" placeholder="Opcional" />
          </div>
          <div>
            <label className={labelClass}>Arquivo (PDF, JPG, PNG)</label>
            <label className="flex-1 px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
              <Paperclip className="w-3 h-3" /> Escolher Ficheiro
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
            Anexar ao Dossiê
          </button>
        </div>
      </div>
      <div className="min-h-[250px] border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-10 bg-slate-50/20">
        <ImageIcon className="w-12 h-12 text-slate-100 mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nenhum documento anexado ao lote</p>
      </div>
    </div>
  );

  const renderTerritorial = () => (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-2">
        <h4 className={sectionTitleClass}>📜 Registro Cartorial</h4>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Matrícula Cartorial Nº</label>
            <input className={inputClass} placeholder="Ex: 00.123" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Setor</label>
              <input className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quadra</label>
              <input className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Lote</label>
              <input className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Situação Registral</label>
              <div className="relative">
                <select className={inputClass + " appearance-none"}>
                  <option>Pendente</option>
                  <option>Matriculado</option>
                  <option>Regularizado</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="bg-white rounded-[2rem] p-2">
        <h4 className={sectionTitleClass}>🏛️ Inscrição Municipal</h4>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Inscrição Municipal Nº</label>
            <input className={inputClass} placeholder="Ex: 123.456.789" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Setor</label>
              <input className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quadra</label>
              <input className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Lote Status</label>
            <div className="relative">
              <select className={inputClass + " appearance-none"}>
                <option>Regular</option>
                <option>Irregular</option>
                <option>Em Regularização</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDimensoes = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h4 className={sectionTitleClass}><Maximize2 className="w-5 h-5 text-emerald-600" /> Dimensões do Terreno</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Testada (Mts)</label>
          <input 
            className={inputClass} 
            value={lotData.testada} 
            onChange={(e) => handleInputChange('testada', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Profundidade (Mts)</label>
          <input 
            className={inputClass} 
            value={lotData.profundidade} 
            onChange={(e) => handleInputChange('profundidade', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Área Declarada (m²)</label>
        <input 
          className={inputClass} 
          value={lotData.area} 
          onChange={(e) => handleInputChange('area', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Confrontante Frente</label>
          <input 
            className={inputClass} 
            value={lotData.confrontanteFrente} 
            onChange={(e) => handleInputChange('confrontanteFrente', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Confrontante Fundo</label>
          <input 
            className={inputClass} 
            value={lotData.confrontanteFundo} 
            onChange={(e) => handleInputChange('confrontanteFundo', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Confrontante Direita</label>
          <input 
            className={inputClass} 
            value={lotData.confrontanteDireita} 
            onChange={(e) => handleInputChange('confrontanteDireita', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Confrontante Esquerda</label>
          <input 
            className={inputClass} 
            value={lotData.confrontanteEsquerda} 
            onChange={(e) => handleInputChange('confrontanteEsquerda', e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className={labelClass}>Memorial Descritivo do Lote</label>
          <div className="flex gap-2">
            <button 
              onClick={generateMemorial}
              className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> Gerar Automático
            </button>
            {lotData.memorial && (
              <button 
                onClick={downloadMemorial}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Baixar .TXT
              </button>
            )}
          </div>
        </div>
        <textarea 
          className={inputClass + " h-48 resize-none py-6 font-mono text-xs leading-relaxed"} 
          placeholder="Descreva os limites, confrontações e benfeitorias..." 
          value={lotData.memorial}
          onChange={(e) => handleInputChange('memorial', e.target.value)}
        />
      </div>
    </div>
  );

  const renderFundiaria = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h4 className={sectionTitleClass}>📋 Informações Fundiárias</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Cadastro Fundiário</label>
          <input className={inputClass} defaultValue="CF-2024-001" />
        </div>
        <div>
          <label className={labelClass}>Tipo de Ocupação</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Posse</option>
              <option>Propriedade</option>
              <option>Concessão</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Núcleo Formal</label>
          <input className={inputClass} defaultValue="Vila Esperança I" />
        </div>
        <div>
          <label className={labelClass}>Código REURB</label>
          <input className={inputClass} defaultValue="REURB-2024-MA-001" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Situação Fundiária</label>
        <div className="relative">
          <select className={inputClass + " appearance-none"}>
            <option>Regularizável</option>
            <option>Área de Risco</option>
            <option>Consolidado</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  const renderZoneamento = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h4 className={sectionTitleClass}>🏗️ Parâmetros Urbanísticos (Zoning)</h4>
      <div>
        <label className={labelClass}>Setor de Uso e Ocupação do Solo</label>
        <input className={inputClass} placeholder="Ex: Residencial Predominante" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Gabarito Máximo (M)</label>
          <input className={inputClass} defaultValue="0" />
        </div>
        <div>
          <label className={labelClass}>Taxa de Ocupação (%)</label>
          <input className={inputClass} defaultValue="0" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Taxa de Permeabilidade (%)</label>
          <input className={inputClass} defaultValue="0" />
        </div>
        <div>
          <label className={labelClass}>Coef. Aproveitamento</label>
          <input className={inputClass} defaultValue="0" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Fonte Normativa (Lei/Decreto)</label>
        <input className={inputClass} placeholder="Ex: Lei Comp. 45/2012" />
      </div>
    </div>
  );

  const renderInfraestrutura = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h4 className={sectionTitleClass}><Zap className="w-5 h-5 text-emerald-600" /> Infraestrutura e Divisas</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Abastecimento de Água</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Rede Pública</option>
              <option>Poço Artesiano</option>
              <option>Sem Abastecimento</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Energia Elétrica</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Rede Pública</option>
              <option>Individual (Ligação Direta)</option>
              <option>Sem Energia</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Esgotamento Sanitário</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Fossa Séptica</option>
              <option>Rede Coletora Pública</option>
              <option>Céu Aberto</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Pavimentação</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Asfalto</option>
              <option>Bloco / Paralelepípedo</option>
              <option>Terra / Sem Pavimentação</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div>
        <label className={labelClass}>Tipo de Divisa</label>
        <div className="relative">
          <select className={inputClass + " appearance-none"}>
            <option>Muro</option>
            <option>Cerca / Arame</option>
            <option>Cerca Viva</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  const renderContexto = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h4 className={sectionTitleClass}>🏠 Contexto e Edificação</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Tempo de Ocupação</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Acima de 10 Anos</option>
              <option>5 a 10 Anos</option>
              <option>2 a 5 Anos</option>
              <option>Recente (Menos de 2 Anos)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Modo de Aquisição</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Compra</option>
              <option>Herança</option>
              <option>Doação</option>
              <option>Ocupação Direta</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Uso do Imóvel</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Residencial</option>
              <option>Comercial</option>
              <option>Misto</option>
              <option>Industrial</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Tipo de Construção</label>
          <div className="relative">
            <select className={inputClass + " appearance-none"}>
              <option>Alvenaria</option>
              <option>Madeira / Mista</option>
              <option>Containers / Outros</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeo = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h4 className={sectionTitleClass}><MapIcon className="w-5 h-5 text-emerald-600" /> Geoprocessamento do Lote</h4>
        <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10 flex items-center gap-2">
           <Target className="w-3 h-3" /> Capturar Coordenadas
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Latitude</label>
          <input className={inputClass} defaultValue="-2.5325" />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input className={inputClass} defaultValue="-44.301" />
        </div>
      </div>
      <div className="h-72 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-inner relative overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
         <div className="z-10 bg-white/90 p-4 rounded-2xl shadow-xl flex flex-col items-center">
            <MapPin className="w-8 h-8 text-rose-500 animate-bounce mb-2" />
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ponto Georeferenciado RTK</p>
         </div>
      </div>
    </div>
  );

  const renderTitularidade = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h4 className={sectionTitleClass}><User className="w-5 h-5 text-emerald-600" /> Titularidade e Vínculo</h4>
      <div>
        <label className={labelClass}>Titular Atual (Selecione Cliente)</label>
        <div className="relative">
          <select className={inputClass + " appearance-none"}>
            <option>Maria da Silva Oliveira</option>
            <option>João da Silva</option>
            <option>Outro Beneficiário...</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Tipo de Vínculo</label>
        <div className="relative">
          <select className={inputClass + " appearance-none"}>
            <option>Proprietário</option>
            <option>Posseiro / Ocupante</option>
            <option>Comprador (Contrato Gaveta)</option>
            <option>Cessionário</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-slate-200 flex flex-col h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Barra de Status Superior */}
        <div className="h-2.5 bg-emerald-500 w-full" />
        
        {/* Header Fixo */}
        <div className="p-8 pb-4 border-b border-slate-50 flex justify-between items-start bg-white z-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Editar Registro</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">ENTIDADE: Loteamento / Unidade Imobiliária</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-all group">
            <X className="w-6 h-6 text-slate-400 group-hover:text-rose-500" />
          </button>
        </div>

        {/* Menu de Abas - Rolagem Horizontal Suave */}
        <div className="px-8 pt-4 bg-white overflow-x-auto scrollbar-hide">
           <div className="flex gap-2 pb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as LotTab)}
                  className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/30 ring-2 ring-emerald-500/20' 
                      : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
           {/* Faixa de Contexto Visual Cinza (Baseada na imagem) */}
           <div className="h-10 bg-slate-300/40 w-full rounded-2xl mb-4 shadow-inner flex items-center px-6">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Módulo de Gestão Técnica / Lotes</span>
           </div>
        </div>

        {/* Área de Conteúdo - Rolagem Vertical customizada */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 custom-scrollbar bg-white">
          {activeTab === 'IDENTIFICACAO' && renderIdentificacao()}
          {activeTab === 'DOCUMENTACAO' && renderDocumentacao()}
          {activeTab === 'TERRITORIAL' && renderTerritorial()}
          {activeTab === 'DIMENSOES' && renderDimensoes()}
          {activeTab === 'FUNDIARIA' && renderFundiaria()}
          {activeTab === 'ZONEAMENTO' && renderZoneamento()}
          {activeTab === 'INFRAESTRUTURA' && renderInfraestrutura()}
          {activeTab === 'CONTEXTO' && renderContexto()}
          {activeTab === 'GEO' && renderGeo()}
          {activeTab === 'TITULARIDADE' && renderTitularidade()}
        </div>

        {/* Footer Fixo de Ações */}
        <div className="p-8 pt-4 flex justify-end items-center gap-8 border-t border-slate-50 bg-white">
          <button onClick={onClose} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancelar</button>
          <button 
            onClick={() => {
               alert('Dados do Lote atualizados com sucesso na base AISHA!');
               onClose();
            }}
            className="px-12 py-5 bg-emerald-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default LotEditor;
