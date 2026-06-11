
import React from 'react';
// Added missing BrainCircuit import
import { Search, Home, FileCheck, MapPin, User, ChevronRight, Layers, ShieldCheck, BrainCircuit } from 'lucide-react';
import { MOCK_PROCESSES } from '../constants';

const PortalCidadao: React.FC = () => {
  const exampleProcess = MOCK_PROCESSES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Portal do Ocupante</h2>
          <p className="text-emerald-100 opacity-80 max-w-sm">Acompanhe a regularização da sua unidade em tempo real com transparência e segurança jurídica.</p>
        </div>
        <div className="mt-6 md:mt-0 relative z-10">
           <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center">
              <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-widest mb-1">Inscrição Municipal</p>
              <p className="text-2xl font-mono font-black">{exampleProcess.property.cadastralCode}</p>
              <div className="mt-4 px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black uppercase">REURB SOCIAL</div>
           </div>
        </div>
        <Layers className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Section */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold text-slate-800">Status da Regularização</h3>
                <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                   <ShieldCheck className="w-4 h-4" />
                   Dados Auditados por IA
                </span>
             </div>
             
             <div className="relative px-4">
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full" />
                <div className="absolute top-5 left-0 w-1/3 h-1 bg-emerald-500 rounded-full" />
                
                <div className="relative flex justify-between">
                    {[
                        { label: 'Documentação', active: true },
                        { label: 'Diagnóstico', active: true },
                        { label: 'Prefeitura', active: false },
                        { label: 'Cartório', active: false },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 transition-all ${
                                step.active ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-200 text-slate-400'
                            }`}>
                                <span className="text-xs font-bold">{i+1}</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                step.active ? 'text-emerald-700' : 'text-slate-400'
                            }`}>{step.label}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          {/* Detailed Info */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-2 gap-8">
             <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Localização Técnica</h4>
                <div className="space-y-4">
                   <div>
                      <p className="text-xs text-slate-500">Quadra / Lote</p>
                      <p className="font-bold text-slate-900">{exampleProcess.property.block} / {exampleProcess.property.cadastralCode}</p>
                   </div>
                   <div>
                      <p className="text-xs text-slate-500">Zona Urbanística</p>
                      <p className="font-bold text-emerald-700">{exampleProcess.property.zone}</p>
                   </div>
                </div>
             </div>
             <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Dados da Unidade</h4>
                <div className="space-y-4">
                   <div>
                      <p className="text-xs text-slate-500">Área Privativa</p>
                      <p className="font-bold text-slate-900">{exampleProcess.property.units[0].area_privativa} m²</p>
                   </div>
                   <div>
                      <p className="text-xs text-slate-500">Conformidade IA</p>
                      <p className="font-bold text-emerald-600">100% Validado</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-950 p-8 rounded-[2rem] text-white shadow-2xl flex flex-col h-full relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-xl font-bold mb-2">Analista Virtual</h4>
                 <p className="text-sm text-slate-400 leading-relaxed mb-6">Dúvidas sobre o processo? Nosso assistente jurídico está pronto para ajudar.</p>
                 <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group">
                    Iniciar Consulta
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                 </button>
              </div>
              <BrainCircuit className="absolute -left-10 -bottom-10 w-48 h-48 text-white/5" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default PortalCidadao;
