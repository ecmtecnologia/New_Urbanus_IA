
import React from 'react';
import { Fingerprint, ShieldCheck, Database, Server, Lock, ExternalLink, History } from 'lucide-react';
import { MOCK_PROCESSES } from '../constants';

const SecurityModule: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Segurança e Imutabilidade</h2>
          <p className="text-slate-500 mt-1">Rastreabilidade via Hashes de Integridade e Blockchain.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-emerald-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                   <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Certificação de Integridade</h3>
                <p className="text-emerald-100/60 max-w-lg mb-10 leading-relaxed">
                  Cada processo aprovado gera um hash único que sela o Memorial Descritivo, o Polígono GIS e os dados do Ocupante. Qualquer alteração posterior invalidará a certidão digital.
                </p>
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-emerald-400">100%</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-emerald-200/50">Imutável</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-emerald-400">SHA-256</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-emerald-200/50">Criptografia</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-emerald-400">Validado</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-emerald-200/50">Pelo Cartório</p>
                   </div>
                </div>
             </div>
             <Fingerprint className="absolute -right-20 -bottom-20 w-80 h-80 opacity-5 pointer-events-none" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5 text-emerald-600" /> Log de Transações Recentes</h3>
             <div className="space-y-4">
                {MOCK_PROCESSES.map((proc) => (
                  <div key={proc.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                           <Database className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800">{proc.title}</p>
                           <p className="text-[10px] font-mono text-slate-500 truncate w-48">{proc.security?.merkleRoot}</p>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-6">
                        <div className="hidden md:block">
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Timestamp</p>
                           <p className="text-xs text-slate-700">{proc.security?.timestamp}</p>
                        </div>
                        <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-900/10">
                           <ExternalLink className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Status da Rede</h3>
              <div className="space-y-6">
                 {[
                   { label: 'Integridade da Base', status: 'Operacional', color: 'text-emerald-500' },
                   { label: 'Blockchain Sync', status: 'Sincronizado', color: 'text-emerald-500' },
                   { label: 'API Registro Imóveis', status: 'Conectado', color: 'text-emerald-500' },
                   { label: 'Backups de Hashes', status: 'Em dia', color: 'text-emerald-500' },
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                      <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-blue-400" /> Nó Validador</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">Este terminal está atuando como um nó validador da rede Urbanus IA. Todas as minutas geradas aqui são assinadas digitalmente.</p>
              <div className="bg-black/30 p-4 rounded-2xl font-mono text-[10px] text-blue-300">
                 $ status --blockchain <br/>
                 {'>'} connecting... <br/>
                 {'>'} hash_verified: OK <br/>
                 {'>'} block_height: 842,912
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityModule;