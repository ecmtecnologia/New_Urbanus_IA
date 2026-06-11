
import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Upload, 
  Search, 
  Tag, 
  MapPin, 
  ChevronRight, 
  FileText, 
  BrainCircuit, 
  Sparkles, 
  Database,
  X,
  FileUp,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const LegislationModule: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const laws = [
    { id: '1', title: 'Lei Federal 13.465/2017', articles: 124, status: 'Ativo' },
    { id: '2', title: 'Plano Diretor Municipal (Lei 45/2024)', articles: 88, status: 'Processando' },
    { id: '3', title: 'Decreto Federal 9.310/2018', articles: 56, status: 'Ativo' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      startSimulation();
    }
  };

  const startSimulation = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setIsComplete(false);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setIsUploading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const resetModal = () => {
    setShowUploadModal(false);
    setIsUploading(false);
    setIsComplete(false);
    setUploadProgress(0);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Alimentação da Base</h2>
          <p className="text-slate-500 mt-1">Ingestão de Plano Diretor e Leis com Tagging por IA.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10"
        >
          <Upload className="w-4 h-4" />
          Subir Nova Lei (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" /> Fragmentação e Tagging
                 </h3>
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" placeholder="Buscar Artigo..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none" />
                 </div>
              </div>
              
              <div className="p-0">
                 {[
                   { art: 'Art. 13', content: 'Considera-se REURB-S a regularização fundiária aplicável a núcleos urbanos informais ocupados predominantemente por população de baixa renda...', tags: ['REURB-S', 'Baixa Renda', 'Social'], zone: 'ZEIS-1' },
                   { art: 'Art. 45', content: 'Os recuos frontais e laterais poderão ser dispensados em núcleos urbanos consolidados, desde que garantida a segurança estrutural e ventilação...', tags: ['Recuos', 'Geometria', 'Lote'], zone: 'Sede' },
                   { art: 'Art. 18', content: 'A REURB não será aplicada em áreas de risco geológico não mitigável ou em áreas de preservação permanente que não admitam consolidação...', tags: ['Ambiental', 'Risco', 'Vedação'], zone: 'Global' }
                 ].map((item, i) => (
                   <div key={i} className="p-6 hover:bg-emerald-50/30 transition-all border-b border-slate-50 group last:border-0">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-black rounded uppercase tracking-widest">{item.art}</span>
                            <div className="flex gap-2">
                               {item.tags.map((tag, j) => (
                                 <span key={j} className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                                    <Tag className="w-2.5 h-2.5" /> {tag}
                                 </span>
                               ))}
                            </div>
                         </div>
                         <div className="flex items-center gap-1 text-blue-600">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.zone}</span>
                         </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 italic">"{item.content}"</p>
                      <button className="mt-3 text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         Editar Fragmento <ChevronRight className="w-3 h-3" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-[340px] flex flex-col justify-between">
              <div>
                 <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                    <BrainCircuit className="w-6 h-6 text-slate-900" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Vínculo Geográfico</h4>
                 <p className="text-slate-400 text-xs leading-relaxed">A AISHA cruza automaticamente os artigos do seu Plano Diretor com os polígonos de zoneamento do módulo GIS.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Treinamento Ativo</p>
                 <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-300">Precisão do Tagging</span>
                    <span className="text-xl font-black text-white">94.2%</span>
                 </div>
              </div>
              <MapPin className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5" />
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold mb-6 text-slate-900">Bibliotecas Carregadas</h3>
              <div className="space-y-4">
                 {laws.map((law) => (
                   <div key={law.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-xl border border-slate-200">
                            <FileText className="w-4 h-4 text-emerald-600" />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold text-slate-800 truncate w-32">{law.title}</p>
                            <p className="text-[9px] text-slate-500">{law.articles} Artigos Mapeados</p>
                         </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${law.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>{law.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Modal de Upload de PDF */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 transition-all">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Ingestão de Base Legal</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Treinamento da AISHA via Documentos PDF</p>
               </div>
               <button onClick={resetModal} className="p-3 hover:bg-slate-200 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
               </button>
            </div>

            <div className="p-10 space-y-8">
              {!selectedFile && (
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group-hover:border-emerald-200 group-hover:bg-emerald-50/30 transition-all duration-300">
                    <div className="bg-emerald-100 text-emerald-600 p-6 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
                       <FileUp className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-wide">Arraste seu PDF aqui</p>
                    <p className="text-xs text-slate-400 mt-2">Formatos aceitos: PDF (máx. 20MB)</p>
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="bg-emerald-600 p-3 rounded-xl text-white">
                       <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                    </div>
                    {isComplete && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {isComplete ? 'Processamento Concluído' : 'Indexando Artigos...'}
                       </span>
                       <span className="text-sm font-black text-emerald-600">{uploadProgress}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {isComplete && (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-2">
                       <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-emerald-900 leading-tight">Sucesso!</p>
                          <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                            A AISHA identificou 42 fragmentos jurídicos. Os artigos já estão disponíveis para consulta no fluxo de regularização.
                          </p>
                       </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {!isComplete ? (
                      <button disabled className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processando...
                      </button>
                    ) : (
                      <button 
                        onClick={resetModal}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20"
                      >
                        Concluir e Voltar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegislationModule;
