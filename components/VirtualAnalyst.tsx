
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  FileText, 
  Map as MapIcon,
  ChevronRight,
  TrendingUp,
  Activity,
  Workflow,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Gavel,
  History,
  Terminal,
  ArrowDownCircle,
  Zap,
  BookOpen,
  Database,
  Cpu
} from 'lucide-react';
import { analyzeProcessWithAisha } from '../services/geminiService';
import { MOCK_PROCESSES } from '../constants';
import { AishaAnalysis } from '../types';

interface VirtualAnalystProps {
  initialProcessId?: string | null;
}

const VirtualAnalyst: React.FC<VirtualAnalystProps> = ({ initialProcessId }) => {
  const [selectedId, setSelectedId] = useState(initialProcessId || '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AishaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'approved' | 'contested'>('idle');
  
  // Estado para seleção do modelo
  const [modelType, setModelType] = useState<'fast' | 'deep'>('fast');

  const process = MOCK_PROCESSES.find(p => p.id === selectedId);

  useEffect(() => {
    if (initialProcessId) {
      setSelectedId(initialProcessId);
      handleStartAnalysis(initialProcessId);
    }
  }, [initialProcessId]);

  const handleStartAnalysis = async (idToAnalyze?: string) => {
    const id = idToAnalyze || selectedId;
    const processToAnalyze = MOCK_PROCESSES.find(p => p.id === id);
    if (!processToAnalyze) return;
    
    setLoading(true);
    setAnalysis(null); 
    setError(null);
    setFeedbackStatus('idle');
    try {
      // Passa o modelo selecionado para o serviço
      const result = await analyzeProcessWithAisha(processToAnalyze, modelType);
      if (!result) {
        throw new Error("Falha ao gerar análise. Verifique a conexão ou tente novamente.");
      }
      setAnalysis(result);
    } catch (err) {
      console.error("Erro na análise:", err);
      setError("Não foi possível gerar a análise. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type: 'approved' | 'contested') => {
    setFeedbackStatus(type);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Panel - AISHA v1.2 */}
      <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl border border-white/5 flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0">
            <Database className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LOTE: {process?.property?.cadastralCode || '---'}</span>
               <div className="hidden md:block w-1 h-1 rounded-full bg-white/20"></div>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hidden md:inline">PROTOCOLO INTEGRADO</span>
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight leading-tight">AISHA v1.2 - Análise Territorial Multi-Pilar</h2>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          <select 
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setAnalysis(null);
            }}
            className="w-full md:w-auto bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="" className="text-slate-900">Selecionar Lote para Auditoria...</option>
            {MOCK_PROCESSES.map(p => <option key={p.id} value={p.id} className="text-slate-900">{p.title}</option>)}
          </select>

          {/* Seletor de Modelo de IA */}
          <div className="relative w-full md:w-auto group">
            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as 'fast' | 'deep')}
              className="w-full md:w-auto bg-white/10 border border-white/20 rounded-xl pl-10 pr-8 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none hover:bg-white/20 transition-all"
            >
              <option value="fast" className="text-slate-900 font-bold">⚡ Flash (Instantâneo)</option>
              <option value="deep" className="text-slate-900 font-bold">🧠 Pro (Profundo)</option>
            </select>
          </div>
          
          <button 
            onClick={() => handleStartAnalysis()}
            disabled={loading || !selectedId}
            className={`w-full md:w-auto px-6 py-2 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
              modelType === 'deep' 
                ? 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
            } disabled:opacity-50`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {modelType === 'deep' ? 'Análise Profunda' : 'Auditoria Rápida'}
          </button>
        </div>
      </div>

      {analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-6">
          
          {/* QUADRANTE A: MAPA E CONTEXTO */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-emerald-600" /> (A) Contexto Geográfico
              </h3>
              <div className="flex gap-2">
                 <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase ${modelType === 'deep' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                   {modelType === 'deep' ? 'Modelo Pro Ativo' : 'Modelo Flash'}
                 </span>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-50 p-6 flex flex-col">
              <div className="relative flex-1 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center overflow-hidden min-h-[200px]">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
                <div className="text-center">
                    <img src="https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=200" className="w-32 h-24 object-cover rounded-xl border-4 border-white shadow-xl mx-auto mb-4" alt="Fachada" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação Visual Confirmada</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Status de Consolidação</p>
                    <p className="text-xs font-bold text-slate-800">Infraestrutura Completa (v1.2)</p>
                 </div>
                 <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Divergência Territorial</p>
                    <p className="text-xs font-bold text-blue-700">Cartório vs Município: OK</p>
                 </div>
              </div>
            </div>
          </div>

          {/* QUADRANTE B: RACIOCÍNIO (DIAGNÓSTICO) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[480px]">
             <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-emerald-600" /> (B) Raciocínio (AISHA v1.2)
                </h3>
                <div className="flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-[8px] text-slate-400 font-black uppercase">Confiança</p>
                      <p className="text-sm font-black text-emerald-600 leading-none">{analysis?.confidenceScore ?? 0}%</p>
                   </div>
                   <div className="w-10 h-10 rounded-full border-2 border-emerald-100 flex items-center justify-center text-xs font-black text-emerald-600 bg-emerald-50">
                      {analysis?.confidenceScore ?? 0}
                   </div>
                </div>
             </div>
             <div className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
                {analysis?.reasoningTree?.map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all cursor-default">
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm ${
                      step.status === 'valid' ? 'bg-emerald-500' : step.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                       {step.status === 'valid' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{step.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">"{step.detail}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* QUADRANTE C: SIMULADOR DE GARGALOS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto min-h-[420px]">
             <div className="p-5 bg-slate-50 border-b border-slate-200">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" /> (C) Simulador de Devoluções
                </h3>
             </div>
             <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                   <div className="text-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Prazo em Cartório</p>
                      <p className="text-4xl font-black text-slate-900">{analysis?.prediction?.estimatedDays ?? '--'} <span className="text-sm font-medium text-slate-400">dias</span></p>
                   </div>
                   <div className="text-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Risco de Nota Devolutiva</p>
                      <p className={`text-4xl font-black ${(analysis?.prediction?.riskOfDevolution ?? 0) > 30 ? 'text-rose-600' : 'text-emerald-600'}`}>{analysis?.prediction?.riskOfDevolution ?? 0}%</p>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Zap className="w-5 h-5 text-emerald-600" />
                         <span className="text-xs font-bold text-emerald-800">Sugestão de Correção (Pilar Fundiário):</span>
                      </div>
                   </div>
                   <p className="text-[11px] text-slate-600 italic px-2">"{analysis?.suggestedCorrection || 'Sem correções sugeridas no momento.'}"</p>
                </div>
             </div>
          </div>

          {/* QUADRANTE D: CONSOLE DE TREINAMENTO */}
          <div className="bg-slate-950 text-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-auto min-h-[420px]">
             <div className="p-5 bg-black/20 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> (D) Console de Verificação v1.2
                </h3>
             </div>
             
             <div className="flex-1 p-8 flex flex-col">
                <div className="space-y-3">
                   <button 
                     onClick={() => handleFeedback('approved')}
                     className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${feedbackStatus === 'approved' ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/10 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500'}`}
                   >
                      <div className="flex items-center gap-3">
                         <ThumbsUp className="w-5 h-5" />
                         <span className="font-bold text-sm">Validar Auditoria Territorial</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                   </button>
                   
                   <button 
                     onClick={() => setShowAudit(true)}
                     className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-between group"
                   >
                      <div className="flex items-center gap-3">
                         <BookOpen className="w-5 h-5 text-blue-400" />
                         <span className="font-bold text-sm">Relatório de Enquadramento Legal</span>
                      </div>
                      <ArrowDownCircle className="w-4 h-4 text-blue-400" />
                   </button>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${modelType === 'deep' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {modelType === 'deep' ? 'Raciocínio Profundo Ativo' : 'Sincronia Flash: 10 Pilares'}
                      </span>
                   </div>
                   <span className="text-[10px] text-slate-500 italic">Core AISHA: v1.2</span>
                </div>
             </div>

             {/* Audit Overlay */}
             {showAudit && (
               <div className="absolute inset-0 bg-slate-950 p-8 animate-in slide-in-from-right-full duration-500 z-20 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Parecer Técnico-Jurídico Fundamentado</h4>
                     <button onClick={() => setShowAudit(false)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase">Fechar</button>
                  </div>
                  <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar text-[11px] leading-relaxed">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-emerald-400 font-black uppercase mb-2">Fundamentação Federal:</p>
                        <ul className="list-disc pl-4 opacity-80 space-y-1">
                           {analysis?.audit?.citationFederal?.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                     </div>
                     <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl">
                        <p className="text-slate-400 font-black uppercase mb-2">Conclusão AISHA v1.2:</p>
                        <p className="italic opacity-80">"{analysis?.audit?.justification || 'Análise jurídica em processamento.'}"</p>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      ) : null}

      {!analysis && !loading && !error && (
        <div className="h-[400px] md:h-[600px] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
           <BrainCircuit className="w-16 h-16 md:w-20 md:h-20 opacity-10 mb-4" />
           <p className="font-bold text-xs md:text-sm uppercase tracking-[0.3em] text-center px-4">Módulo AISHA v1.2 Ready</p>
           <p className="text-xs mt-2 text-center px-4">Pronta para analisar os 10 pilares técnicos do lote.</p>
           <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
             Modelo Selecionado: {modelType === 'deep' ? 'Gemini Pro (Profundo)' : 'Gemini Flash (Rápido)'}
           </p>
        </div>
      )}

      {error && (
        <div className="h-[400px] md:h-[600px] border-4 border-dashed border-rose-200 bg-rose-50/50 rounded-[3rem] flex flex-col items-center justify-center text-rose-400">
           <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 opacity-50 mb-4" />
           <p className="font-bold text-xs md:text-sm uppercase tracking-[0.3em] text-center px-4">Erro na Análise</p>
           <p className="text-xs mt-2 text-center px-4 max-w-md">{error}</p>
           <button 
             onClick={() => handleStartAnalysis()}
             className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
           >
             Tentar Novamente
           </button>
        </div>
      )}

      {loading && (
        <div className="h-[400px] md:h-[600px] flex flex-col items-center justify-center space-y-6">
           <div className="relative">
              <div className={`w-24 h-24 md:w-28 md:h-28 border-[10px] rounded-full animate-spin ${modelType === 'deep' ? 'border-purple-100 border-t-purple-500' : 'border-emerald-100 border-t-emerald-500'}`}></div>
              <Sparkles className={`absolute inset-0 m-auto w-8 h-8 md:w-10 md:h-10 animate-pulse ${modelType === 'deep' ? 'text-purple-500' : 'text-emerald-500'}`} />
           </div>
           <div className="text-center px-4">
              <p className={`${modelType === 'deep' ? 'text-purple-700' : 'text-emerald-700'} font-black animate-pulse uppercase tracking-[0.2em] text-xs md:text-base`}>
                AISHA v1.2 {modelType === 'deep' ? 'Raciocinando Profundamente...' : 'Processando Rapidamente...'}
              </p>
              <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase">Correlacionando: Infraestrutura ↔ Zoneamento ↔ Territorialidade</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default VirtualAnalyst;
