
import React, { useState } from 'react';
import { Download, CheckCircle, Clock, FileJson, FileCode, ShieldCheck, Send, Layers, Zap } from 'lucide-react';

const ExportModule: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'XML' | 'JSON'>('XML');

  const exports = [
    { id: 'EXP-104', nucleus: 'Jardim Esperança', units: 45, status: 'Pronto', score: 98 },
    { id: 'EXP-105', nucleus: 'Centro Velho', units: 12, status: 'Processando', score: 85 },
    { id: 'EXP-106', nucleus: 'Vila Industrial', units: 8, status: 'Revisão', score: 72 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Exportação Digital</h2>
          <p className="text-slate-500 mt-1">Interoperabilidade SAEC/ONR e Pacotes de Regularização.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10">
              <Zap className="w-4 h-4" /> Assinar em Lote (ICP-Brasil)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
           <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Layers className="w-4 h-4 text-emerald-600" /> Pacotes para Despacho
              </h3>
              <div className="flex gap-1 p-1 bg-slate-200 rounded-lg">
                 <button onClick={() => setSelectedFormat('XML')} className={`px-3 py-1 text-[10px] font-bold rounded ${selectedFormat === 'XML' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>SAEC XML</button>
                 <button onClick={() => setSelectedFormat('JSON')} className={`px-3 py-1 text-[10px] font-bold rounded ${selectedFormat === 'JSON' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>ONR JSON</button>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {exports.map((exp) => (
                <div key={exp.id} className="p-6 hover:bg-emerald-50/30 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${exp.status === 'Pronto' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                         <FileCode className="w-6 h-6" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{exp.id}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <span className="text-sm font-bold text-slate-900">{exp.nucleus}</span>
                         </div>
                         <p className="text-xs text-slate-500">{exp.units} Unidades Imobiliárias</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score Qualificação</p>
                         <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${exp.score}%` }}></div>
                            </div>
                            <span className="text-xs font-black text-slate-700">{exp.score}%</span>
                         </div>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all"><FileJson className="w-4 h-4" /></button>
                         <button className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-900/10 hover:bg-emerald-500 transition-all"><Send className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                 A AISHA realizou a pré-validação estrutural de todos os arquivos. Os pacotes estão em conformidade com o Provimento nº 93/2020 do CNJ.
              </p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-950 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between h-[300px]">
              <div>
                 <h4 className="text-lg font-bold mb-2">Interoperabilidade</h4>
                 <p className="text-slate-400 text-xs leading-relaxed">Conexão via API Rest com os principais sistemas de Registro de Imóveis do Brasil.</p>
              </div>
              <div className="space-y-3">
                 {[
                   { label: 'SREI Connect', status: 'Online' },
                   { label: 'SAEC Protocol', status: 'Online' },
                   { label: 'ONR Gateway', status: 'Offline' }
                 ].map((api, i) => (
                   <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-slate-300 font-medium">{api.label}</span>
                      <span className={`text-[9px] font-black uppercase ${api.status === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`}>{api.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold mb-6">Métricas de Exportação</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-xs text-slate-500 font-medium">Economia de Papel (Folhas)</span>
                       <span className="text-xs font-black text-emerald-600">12.4k</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Previsão de Protocolo</p>
                    <div className="flex items-center gap-3">
                       <Clock className="w-5 h-5 text-emerald-600" />
                       <span className="text-lg font-black text-slate-900">14:30 <span className="text-[10px] font-medium text-slate-500">Hoje</span></span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModule;
