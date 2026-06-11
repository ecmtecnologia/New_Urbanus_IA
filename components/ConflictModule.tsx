
import React, { useState } from 'react';
import { Handshake, AlertTriangle, Scale, CheckCircle, FileText, Camera, Users, History, Sparkles, Gavel, X, Image as ImageIcon, Maximize2, Plus } from 'lucide-react';

const ConflictModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'acordos'>('ativos');
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);

  const conflicts = [
    {
      id: 'C-001',
      propertyA: 'Lote 12',
      propertyB: 'Lote 13',
      type: 'Sobreposição',
      risk: 'Alto',
      status: 'Mediação',
      aiSummary: 'O muro construído no Lote 12 invade 1.5m² da poligonal registral do Lote 13.',
      recommendation: 'Gerar Termo de Anuência com compensação de área proporcional.',
      photos: [
        'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
      ]
    },
    {
      id: 'C-002',
      propertyA: 'Lote 45',
      propertyB: 'Via Pública',
      type: 'Invasão',
      risk: 'Crítico',
      status: 'Aberto',
      aiSummary: 'Unidade consolidada avança 0.5m sobre o recuo viário projetado no Plano Diretor.',
      recommendation: 'Aplicar Art. 45 do PD (Tolerância para Núcleos Consolidados).',
      photos: [
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=600'
      ]
    }
  ];

  const handleOpenGallery = (conflict: any) => {
    setSelectedConflict(conflict);
    setShowPhotoGallery(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">O Pacificador</h2>
          <p className="text-slate-500 mt-1">Gestão de conflitos de divisa e mediação digital fundamentada.</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl">
           <button onClick={() => setActiveTab('ativos')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'ativos' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>Em Aberto</button>
           <button onClick={() => setActiveTab('acordos')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'acordos' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>Acordos Firmados</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {conflicts.map((conflict) => (
             <div key={conflict.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="p-6 flex items-start justify-between border-b border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${conflict.risk === 'Crítico' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                         <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conflito {conflict.id}</p>
                         <h4 className="text-lg font-bold text-slate-900">{conflict.propertyA} vs {conflict.propertyB}</h4>
                      </div>
                   </div>
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-tighter">{conflict.status}</span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Diagnóstico IA</p>
                         <p className="text-xs text-slate-700 leading-relaxed italic">"{conflict.aiSummary}"</p>
                      </div>
                      <div className="flex gap-2">
                         <button className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10">Agendar Mediação</button>
                         <button 
                            onClick={() => handleOpenGallery(conflict)}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 group"
                          >
                            <Camera className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" /> Ver Fotos Campo
                         </button>
                      </div>
                   </div>

                   <div className="bg-emerald-950 p-5 rounded-2xl text-white relative overflow-hidden">
                      <div className="relative z-10">
                         <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Solução Proposta por AISHA</span>
                         </div>
                         <p className="text-xs text-emerald-100 leading-relaxed font-medium mb-4">{conflict.recommendation}</p>
                         <button className="w-full py-2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg uppercase hover:bg-emerald-400">Gerar Termo de Acordo</button>
                      </div>
                      <Handshake className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-slate-900">
                <Users className="w-4 h-4 text-emerald-600" /> Conselheiros de Mediação
              </h3>
              <div className="space-y-4">
                 {[
                   { name: 'Dr. Roberto Santos', role: 'Mediador Jurídico', status: 'Disponível' },
                   { name: 'Eng. Carla Dias', role: 'Perita Topógrafa', status: 'Em Campo' },
                   { name: 'Márcia Oliveira', role: 'Assitente Social', status: 'Disponível' },
                 ].map((c, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">{c.name[0]}</div>
                         <div>
                            <p className="text-xs font-bold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-500">{c.role}</p>
                         </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${c.status === 'Disponível' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                 <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                    <Gavel className="w-6 h-6 text-slate-900" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Segurança em Bloco</h4>
                 <p className="text-slate-400 text-xs leading-relaxed mb-6">Todos os termos de acordo firmados nesta interface são assinados com certificado ICP-Brasil e possuem validade para retificação administrativa de matrícula.</p>
                 <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest">Válido Art. 16</span>
                    <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest">Anuência Digital</span>
                 </div>
              </div>
              <History className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5" />
           </div>
        </div>
      </div>

      {/* MODAL DE GALERIA DE FOTOS */}
      {showPhotoGallery && selectedConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Evidências de Campo</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Conflito: {selectedConflict.id} • {selectedConflict.propertyA} vs {selectedConflict.propertyB}
                    </p>
                 </div>
                 <button 
                   onClick={() => setShowPhotoGallery(false)}
                   className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-rose-500"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Botão de Upload Fake */}
                    <div className="aspect-[4/3] border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer group">
                       <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-200 flex items-center justify-center mb-2 transition-colors">
                          <Plus className="w-6 h-6" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">Adicionar Nova Foto</p>
                    </div>

                    {selectedConflict.photos.map((photo: string, index: number) => (
                      <div key={index} className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border-4 border-white">
                         <img src={photo} alt={`Evidência ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <div className="flex justify-between items-end">
                               <div>
                                  <span className="px-2 py-1 bg-rose-500 text-white text-[8px] font-black uppercase rounded mb-1 inline-block">Evidência #{index + 1}</span>
                                  <p className="text-white text-xs font-bold">Invasão de Perímetro</p>
                               </div>
                               <button className="p-2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-lg backdrop-blur-sm transition-all">
                                  <Maximize2 className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl">
                       <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-amber-800">Análise Visual da IA</h4>
                       <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                          "As fotos 01 e 02 confirmam a existência de muro de alvenaria recente que diverge 1.5 metros da planta aprovada. A imagem aérea (Drone) corrobora a sobreposição na face norte do lote."
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3 Fotos • 1 Vídeo Drone • 5MB Total</p>
                 <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                    Baixar Relatório Fotográfico
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConflictModule;
