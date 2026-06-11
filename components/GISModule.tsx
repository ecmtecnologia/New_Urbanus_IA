
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  MapPin, 
  Maximize2, 
  Magnet, 
  Activity, 
  CloudUpload, 
  CheckCircle2, 
  Zap, 
  Box, 
  Plane, 
  Database, 
  ArrowRightLeft, 
  Download, 
  FileCode, 
  AlertTriangle, 
  TreePine, 
  Loader2, 
  Crosshair, 
  Undo2, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Ruler,
  MousePointer2,
  Hand,
  Square,
  Circle as CircleIcon,
  Info as InfoIcon,
  X,
  Search
} from 'lucide-react';
import { MOCK_PROCESSES } from '../constants';

interface GISModuleProps {
  initialProcessId?: string | null;
}

const GISModule: React.FC<GISModuleProps> = ({ initialProcessId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snapping, setSnapping] = useState(true);
  const [heatmap, setHeatmap] = useState(false);
  const [showAPP, setShowAPP] = useState(true);
  const [showZoning, setShowZoning] = useState(false);
  const [showCAR, setShowCAR] = useState(false);
  const [showSIGEF, setShowSIGEF] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'sync'>('view');
  
  // Estados de Importação e Visualização Geoespacial
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success'>('idle');
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [showImportedGeometry, setShowImportedGeometry] = useState(false);
  
  // Estados de Análise SIGEF (Incra)
  const [sigefAnalysisLoading, setSigefAnalysisLoading] = useState(false);
  const [sigefAnalysisComplete, setSigefAnalysisComplete] = useState(false);
  const [sigefConflicts, setSigefConflicts] = useState<{type: string, area: string}[]>([]);
  
  const [showExportSchema, setShowExportSchema] = useState(false);
  const [selectedLote, setSelectedLote] = useState(
    MOCK_PROCESSES.find(p => p.id === initialProcessId) || MOCK_PROCESSES[0]
  );
  
  // Novos Estados para Ferramentas GIS Padrão
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'measure' | 'draw'>('select');
  const [showLegend, setShowLegend] = useState(true);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
  };

  useEffect(() => {
    if (initialProcessId) {
      const process = MOCK_PROCESSES.find(p => p.id === initialProcessId);
      if (process) setSelectedLote(process);
    }
  }, [initialProcessId]);

  // Handler Real para Seleção de Arquivo KML/KMZ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificação de Extensão para Segurança do Módulo GIS
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'kml' && extension !== 'kmz') {
      alert('Formato inválido. Por favor, utilize arquivos .kml ou .kmz padrão OGC.');
      return;
    }

    setImportedFileName(file.name);
    setImportStatus('uploading');
    setShowImportedGeometry(false);

    // Pipeline de Processamento AISHA GIS
    // Simulando tempo de upload e análise topológica
    setTimeout(() => {
      setImportStatus('analyzing');
      
      setTimeout(() => {
        setImportStatus('success');
        setShowImportedGeometry(true); // Habilita a camada no mapa
        setHeatmap(true); // O heatmap destaca os conflitos detectados no novo levantamento
      }, 2000);
    }, 1500);
  };

  const triggerFileInput = () => {
    if (importStatus !== 'idle' && importStatus !== 'success') return;
    fileInputRef.current?.click();
  };

  const resetImport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImportStatus('idle');
    setImportedFileName(null);
    setShowImportedGeometry(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runSigefAnalysis = () => {
    if (!showImportedGeometry) return;
    
    setSigefAnalysisLoading(true);
    setSigefAnalysisComplete(false);
    
    // Simulação de cruzamento com base de dados do SIGEF/INCRA
    setTimeout(() => {
      setSigefAnalysisLoading(false);
      setSigefAnalysisComplete(true);
      setSigefConflicts([
        { type: 'Reserva Legal (Sobreposição)', area: '1.2 ha' },
        { type: 'Terra Indígena (Proximidade)', area: 'Buffer 500m' }
      ]);
      setShowSIGEF(true); // Ativa a camada SIGEF para visualização
    }, 3000);
  };

  const kmlSchema = `
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Urbanus_Export_${selectedLote.property.cadastralCode}</name>
    <Placemark>
      <name>${selectedLote.property.cadastralCode}</name>
      <ExtendedData>
        <Data name="NOME_OCUP"><value>${selectedLote.occupant.name}</value></Data>
        <Data name="REURB_TIPO"><value>${selectedLote.type}</value></Data>
        <Data name="AREA_M2"><value>${selectedLote.property.area_sqm}</value></Data>
        <Data name="SIT_JURID"><value>${selectedLote.status}</value></Data>
        <Data name="IA_HEATMAP"><value>HIGH_CONFLICT</value></Data>
      </ExtendedData>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>-46.123, -23.456, 0 ...</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>
  `.trim();

  return (
    <div className="lg:h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in zoom-in-95 duration-500 pb-20 lg:pb-0">
      {/* Input de arquivo oculto para integração com o card */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".kml,.kmz" 
        className="hidden" 
      />
      
      {/* Sidebar de Ferramentas GIS */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 order-2 lg:order-1">
        
        {/* Seletor de Modo de Operação */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
          <button 
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'view' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Navegação
          </button>
          <button 
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'sync' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            AISHA Link
          </button>
        </div>

        {activeTab === 'view' ? (
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" /> Camadas Ativas
               </h3>
               <div className="space-y-3">
                  <div className="flex flex-col gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-2">
                          <TreePine className="w-3.5 h-3.5" /> APP (Preservação)
                        </span>
                        <input 
                          type="checkbox" 
                          checked={showAPP} 
                          onChange={() => setShowAPP(!showAPP)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                        />
                     </div>
                     <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: '100%' }}></div>
                     </div>
                  </div>

                  {showImportedGeometry && (
                    <div className="flex flex-col gap-2 p-3 bg-cyan-50 rounded-2xl border border-cyan-100 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-cyan-700 flex items-center gap-2">
                            <Plane className="w-3.5 h-3.5" /> Levantamento Drone
                          </span>
                          <input 
                            type="checkbox" 
                            checked={showImportedGeometry} 
                            onChange={() => setShowImportedGeometry(!showImportedGeometry)}
                            className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" 
                          />
                      </div>
                      <p className="text-[8px] text-cyan-600 font-bold uppercase truncate">{importedFileName}</p>
                    </div>
                  )}

                   <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" /> Zoneamento (LPUOS)
                        </span>
                        <input 
                          type="checkbox" 
                          checked={showZoning} 
                          onChange={() => setShowZoning(!showZoning)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                        />
                     </div>
                     <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: showZoning ? '100%' : '0%' }}></div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-amber-700 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> SIGEF (Incra)
                        </span>
                        <input 
                          type="checkbox" 
                          checked={showSIGEF} 
                          onChange={() => setShowSIGEF(!showSIGEF)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
                        />
                     </div>
                     <div className="h-1 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: showSIGEF ? '100%' : '0%' }}></div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-blue-700 flex items-center gap-2">
                          <TreePine className="w-3.5 h-3.5" /> CAR (Ambiental)
                        </span>
                        <input 
                          type="checkbox" 
                          checked={showCAR} 
                          onChange={() => setShowCAR(!showCAR)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                        />
                     </div>
                     <div className="h-1 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: showCAR ? '100%' : '0%' }}></div>
                     </div>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-rose-700 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5" /> Heatmap de Conflitos
                        </span>
                        <input 
                          type="checkbox" 
                          checked={heatmap} 
                          onChange={() => setHeatmap(!heatmap)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500" 
                        />
                     </div>
                     <p className="text-[8px] text-rose-400 font-bold uppercase">Incidência IA detectada</p>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white">
               <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Auditoria Geométrica IA
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-400">Invasão de APP</span>
                     <span className={`px-2 py-0.5 ${showAPP ? 'bg-rose-500/20 text-rose-400 font-bold' : 'bg-slate-700 text-slate-500'} text-[9px] font-black rounded`}>
                       {importStatus === 'success' ? 'DETECTADO (3)' : (showAPP ? 'DETECTADO (2)' : 'OCULTO')}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-400">Sobreposições</span>
                     <span className={`px-2 py-0.5 ${importStatus === 'success' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-500'} text-[9px] font-black rounded`}>
                       {importStatus === 'success' ? 'ALERTA (1)' : 'ESTÁVEL'}
                     </span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                     <p className="text-[10px] text-slate-300 italic">
                       {sigefAnalysisComplete 
                         ? `"AISHA: Cruzamento SIGEF concluído. Detectada sobreposição crítica com Reserva Legal e proximidade com Terra Indígena homologada."`
                         : importStatus === 'success' 
                           ? `"AISHA: Geometria do arquivo ${importedFileName} processada. Foram detectados 3 novos conflitos topológicos que necessitam de retificação administrativa."`
                           : `"AISHA: Aguardando novos dados de levantamento drone para recalcular poligonais e áreas de conflito."`}
                     </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-left-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm border-2">
               <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Plane className="w-4 h-4" /> Importação Drone
               </h3>
               
               {/* Card de Gatilho para Importação de Arquivos Geoespaciais */}
               <div 
                 onClick={triggerFileInput}
                 className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative overflow-hidden ${
                    importStatus === 'idle' ? 'border-emerald-200 hover:bg-emerald-50' :
                    importStatus === 'success' ? 'border-emerald-500 bg-emerald-50' : 'border-blue-400 bg-blue-50 cursor-default'
                 }`}
               >
                  {importStatus === 'idle' && (
                    <>
                      <CloudUpload className="w-10 h-10 text-emerald-300 group-hover:text-emerald-500 transition-all duration-300 mb-3" />
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Selecionar KML / KMZ</p>
                      <p className="text-[8px] text-slate-400 mt-1 uppercase">Processamento Gejur IA</p>
                    </>
                  )}

                  {importStatus === 'uploading' && (
                    <>
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                      <p className="text-[10px] font-black text-blue-700 uppercase">Enviando ao Data Lake...</p>
                      <p className="text-[8px] text-blue-400 mt-1 uppercase truncate px-4">{importedFileName}</p>
                    </>
                  )}

                  {importStatus === 'analyzing' && (
                    <>
                      <Zap className="w-10 h-10 text-amber-500 animate-pulse mb-3" />
                      <p className="text-[10px] font-black text-amber-700 uppercase">Aisha: Analisando Topologia...</p>
                      <p className="text-[8px] text-amber-400 mt-1 uppercase">Detectando Sobreposições</p>
                    </>
                  )}

                  {importStatus === 'success' && (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
                      <p className="text-[10px] font-black text-emerald-700 uppercase">Importação Concluída</p>
                      <p className="text-[8px] text-emerald-500 mt-1 uppercase truncate px-4">{importedFileName}</p>
                      <button 
                        onClick={resetImport}
                        className="mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Undo2 className="w-2.5 h-2.5" /> Substituir
                      </button>
                    </>
                  )}
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-sm border-2">
               <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" /> Ferramentas SIGEF / INCRA
               </h3>
               <div className="space-y-3">
                  <button 
                    onClick={runSigefAnalysis}
                    disabled={!showImportedGeometry || sigefAnalysisLoading}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      !showImportedGeometry ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' :
                      sigefAnalysisLoading ? 'bg-amber-50 border-amber-200' :
                      sigefAnalysisComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                     <div className="flex items-center gap-3">
                        {sigefAnalysisLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                        ) : sigefAnalysisComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-blue-600 group-hover:text-white" />
                        )}
                        <div className="text-left">
                          <span className="text-[10px] font-black uppercase block">Cruzar Dados SIGEF</span>
                          <span className="text-[8px] opacity-60 uppercase">Terras Indígenas e Reservas</span>
                        </div>
                     </div>
                     {!sigefAnalysisLoading && !sigefAnalysisComplete && <ChevronRight className="w-3 h-3 opacity-40" />}
                  </button>

                  <button 
                    onClick={() => setShowExportSchema(true)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-blue-600 transition-all"
                  >
                     <div className="flex items-center gap-3">
                        <FileCode className="w-4 h-4 text-blue-600 group-hover:text-white" />
                        <span className="text-[10px] font-bold text-slate-700 group-hover:text-white">Gerar KML com Heatmap</span>
                     </div>
                     <Download className="w-3 h-3 text-blue-400 group-hover:text-white" />
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Área Central do Mapa - Visualização Geoespacial */}
      <div className="flex-1 bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative order-1 lg:order-2 min-h-[500px] lg:h-auto w-full">
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between z-10 overflow-x-auto">
          <div className="flex gap-2">
              <button 
                onClick={() => setSnapping(!snapping)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${snapping ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/20' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                  <Magnet className="w-3 h-3" />
                  Snapping
              </button>
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
                 <span className="text-[10px] font-black text-slate-400 uppercase hidden sm:inline">Filtro IA:</span>
                 <span className="text-[10px] font-bold text-emerald-600 uppercase">
                    {importStatus === 'success' ? 'Dados Levantamento' : 'Visualização Dinâmica'}
                 </span>
              </div>
              <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />
              <div className="relative hidden lg:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Buscar endereço ou coordenada..."
                   className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                 />
              </div>
          </div>
          <div className="flex gap-2 ml-4">
              <div className="px-3 py-1.5 bg-slate-900 rounded-lg text-[10px] font-mono text-emerald-400 border border-white/10 whitespace-nowrap hidden sm:block">
                  UTM: 23S 330245 7345678
              </div>
              <button 
                onClick={() => setShowLegend(!showLegend)}
                className={`p-2 rounded-lg transition-colors ${showLegend ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-500'}`}
                title="Legenda"
              >
                <InfoIcon className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg"><Maximize2 className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>

        <div className="flex-1 relative bg-slate-100 overflow-hidden group min-h-[350px]">
          {/* Barra de Ferramentas Flutuante (GIS Standard) */}
          <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
             <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTool('select')}
                  className={`p-2.5 rounded-xl transition-all ${activeTool === 'select' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Selecionar"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTool('pan')}
                  className={`p-2.5 rounded-xl transition-all ${activeTool === 'pan' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Panorâmica"
                >
                  <Hand className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTool('measure')}
                  className={`p-2.5 rounded-xl transition-all ${activeTool === 'measure' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Medir Distância/Área"
                >
                  <Ruler className="w-4 h-4" />
                </button>
                <div className="h-px bg-slate-100 mx-2 my-1" />
                <button 
                  onClick={() => setActiveTool('draw')}
                  className={`p-2.5 rounded-xl transition-all ${activeTool === 'draw' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Desenhar Polígono"
                >
                  <Square className="w-4 h-4" />
                </button>
             </div>

             <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-1">
                <button 
                  onClick={() => handleZoom(0.2)}
                  className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                  title="Aproximar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleZoom(-0.2)}
                  className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                  title="Afastar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={resetView}
                  className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                  title="Resetar Visualização"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Legenda Flutuante */}
          {showLegend && (
            <div className="absolute right-4 top-4 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xl w-48 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Legenda</h4>
                  <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
               </div>
               <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500"></div>
                     <span className="text-[9px] font-bold text-slate-600 uppercase">APP (Preservação)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500"></div>
                     <span className="text-[9px] font-bold text-slate-600 uppercase">Zoneamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-sm bg-cyan-500/20 border border-cyan-500 border-dashed"></div>
                     <span className="text-[9px] font-bold text-slate-600 uppercase">Drone / KML</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500 border-dashed"></div>
                     <span className="text-[9px] font-bold text-slate-600 uppercase">SIGEF / Incra</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
                     <span className="text-[9px] font-bold text-slate-600 uppercase">Conflito Crítico</span>
                  </div>
               </div>
            </div>
          )}

          {/* Definições SVG para Gradientes do Heatmap de Conflitos */}
          <svg className="absolute w-0 h-0">
             <defs>
                <radialGradient id="hotspot-red" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                   <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                   <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hotspot-orange" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                   <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                   <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
             </defs>
          </svg>

          {/* Overlay de Exportação KML/KMZ */}
          {showExportSchema && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md p-10 flex flex-col animate-in slide-in-from-bottom-full duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Preview do Pacote ArcGIS (KML)</h3>
                        <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">Esquema ExtendedData Estruturado</p>
                    </div>
                    <button onClick={() => setShowExportSchema(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase rounded-lg">Fechar</button>
                </div>
                <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 p-6 overflow-y-auto custom-scrollbar">
                    <pre className="text-blue-300 font-mono text-xs leading-relaxed">{kmlSchema}</pre>
                </div>
            </div>
          )}

          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-5 pointer-events-none">
              {Array.from({length: 144}).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-emerald-900"></div>
              ))}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full p-4 md:p-20 flex items-center justify-center transition-transform duration-500 ease-out" style={{ transform: `scale(${zoom})` }}>
                  <svg viewBox="0 0 100 100" className={`w-full h-full md:w-[80%] md:h-[80%] drop-shadow-2xl ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : activeTool === 'measure' ? 'cursor-crosshair' : 'cursor-default'}`}>
                      {/* Camada de APP (Área de Preservação Permanente) */}
                      {showAPP && (
                        <path 
                          d="M0,70 Q25,65 50,72 T100,68 L100,100 L0,100 Z" 
                          fill="rgba(5, 150, 105, 0.25)" 
                          stroke="#059669" 
                          strokeWidth="0.5" 
                          strokeDasharray="1 1"
                          className="animate-in fade-in duration-700"
                        />
                      )}

                      {/* Camada de Zoneamento (LPUOS) */}
                      {showZoning && (
                        <rect x="0" y="0" width="100" height="50" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="0.3" className="animate-in fade-in duration-500" />
                      )}

                      {/* Lotes Base Pré-Existentes (Município) */}
                      <g className="opacity-40">
                        <path d="M20,30 L80,25 L85,75 L15,80 Z" fill="none" stroke="#64748b" strokeWidth="0.2" />
                        <path d="M30,35 L45,34 L46,50 L31,52 Z" fill="#94a3b8" fillOpacity="0.2" />
                      </g>

                      {/* Camada SIGEF (Terras Indígenas / Reservas) */}
                      {showSIGEF && (
                        <g className="animate-in fade-in duration-1000">
                           {/* Terra Indígena (Simulada) */}
                           <path 
                             d="M0,0 L40,0 L35,40 L0,35 Z" 
                             fill="rgba(245, 158, 11, 0.1)" 
                             stroke="#f59e0b" 
                             strokeWidth="0.3" 
                             strokeDasharray="2 2"
                           />
                           {/* Reserva Legal (Simulada) */}
                           <path 
                             d="M60,10 L90,15 L85,45 L55,40 Z" 
                             fill="rgba(16, 185, 129, 0.1)" 
                             stroke="#10b981" 
                             strokeWidth="0.3" 
                           />
                        </g>
                      )}

                      {/* Geometria Importada Dinamicamente do Arquivo KML/KMZ */}
                      {showImportedGeometry && (
                        <g className="animate-in zoom-in-95 fade-in duration-1000">
                           {/* Polígono Principal de Levantamento Drone */}
                           <path 
                             d="M45,34 L75,30 L78,65 L46,70 Z" 
                             fill="rgba(6, 182, 212, 0.2)" 
                             stroke="#06b6d4" 
                             strokeWidth="0.6" 
                             strokeDasharray="1.5 1"
                             className="animate-pulse"
                           />
                           
                           {/* Polígono de Alerta Crítico (Invasão de APP detectada no KML) */}
                           <path 
                             d="M46,65 L55,64 L56,75 L47,76 Z" 
                             fill="rgba(244, 63, 94, 0.4)" 
                             stroke="#f43f5e" 
                             strokeWidth="0.8" 
                             className="animate-pulse"
                           />

                           {/* Vértices da Geometria Importada */}
                           <circle cx="45" cy="34" r="0.8" fill="#06b6d4" />
                           <circle cx="75" cy="30" r="0.8" fill="#06b6d4" />
                           <circle cx="78" cy="65" r="0.8" fill="#06b6d4" />
                           <circle cx="46" cy="70" r="0.8" fill="#06b6d4" />

                           {/* Indicador IA de Ponto de Conflito Geométrico */}
                           <g transform="translate(50, 68)">
                              <circle r="3" fill="#f43f5e" fillOpacity="0.15" />
                              <circle r="0.8" fill="#f43f5e" />
                           </g>
                        </g>
                      )}

                      {/* Camada de Heatmap (Focos de Conflito IA) */}
                      {heatmap && (
                        <g className="animate-in fade-in duration-1000">
                           <circle cx="50" cy="71" r="18" fill="url(#hotspot-red)" />
                           <circle cx="35" cy="70" r="14" fill="url(#hotspot-red)" />
                           <circle cx="68" cy="35" r="12" fill="url(#hotspot-orange)" />
                        </g>
                      )}

                      {snapping && !showImportedGeometry && (
                        <circle cx="30" cy="35" r="1.2" fill="#fff" stroke="#10b981" strokeWidth="0.5" className="animate-pulse" />
                      )}
                  </svg>
              </div>
          </div>

          {/* HUD de Informação Geográfica v1.2 - Removed from here */
          }
        </div>
        
        {/* HUD de Informação Geográfica v1.2 - Repositioned */}
        <div className="border-t border-slate-200 bg-white p-6 relative z-20">
             <div className="flex flex-col md:flex-row gap-6">
                 {/* Header Section */}
                 <div className="flex-1 flex items-center justify-between md:justify-start md:gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className={`p-3 rounded-xl ${showImportedGeometry ? 'bg-cyan-100 text-cyan-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Activity className="w-6 h-6" />
                     </div>
                     <div>
                         <h4 className="font-bold text-sm text-slate-900">
                            {showImportedGeometry ? 'Análise Geo-Drone Ativa' : 'Análise Geo-Jurídica v1.2'}
                         </h4>
                         <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">
                            {showImportedGeometry ? `FONTE: ${importedFileName}` : 'AUDITADO POR AISHA'}
                         </span>
                     </div>
                 </div>

                 {/* Alert Section */}
                 <div className={`flex-1 p-4 ${sigefAnalysisComplete ? 'bg-amber-50 border-amber-100' : showImportedGeometry ? 'bg-cyan-50 border-cyan-100' : 'bg-rose-50 border-rose-100'} rounded-2xl border flex gap-3`}>
                      {sigefAnalysisComplete ? <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /> : showImportedGeometry ? <Crosshair className="w-5 h-5 text-cyan-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                      <div>
                        <p className={`text-[10px] ${sigefAnalysisComplete ? 'text-amber-800' : showImportedGeometry ? 'text-cyan-800' : 'text-rose-800'} leading-tight font-black uppercase tracking-tight`}>
                           {sigefAnalysisComplete ? 'Conflito SIGEF/INCRA' : showImportedGeometry ? 'Novos Conflitos Topo' : 'Risco Detectado'}
                        </p>
                        <p className={`text-xs ${sigefAnalysisComplete ? 'text-amber-700' : showImportedGeometry ? 'text-cyan-700' : 'text-rose-700'} mt-1 leading-relaxed`}>
                          {sigefAnalysisComplete 
                            ? `Sobreposição detectada com Reserva Legal (1.2 ha) e proximidade com Terra Indígena.`
                            : showImportedGeometry 
                              ? `Divergência de 14.2% detectada entre o levantamento KML e a base cadastral.` 
                              : 'Lote invade 4.2m² de Área de Preservação Permanente (APP).'}
                        </p>
                      </div>
                 </div>

                 {/* Stats Section */}
                 <div className="flex gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px]">
                          <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Área Levantada</p>
                          <p className="text-lg font-black text-slate-900 leading-none">1.250 <span className="text-[10px] text-slate-400 font-bold uppercase">m²</span></p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 min-w-[100px]">
                          <p className="text-[8px] text-blue-600 uppercase font-black tracking-widest mb-1">Zon-Enquadro</p>
                          <p className="text-lg font-black text-blue-700 leading-none">ZEIS-1</p>
                      </div>
                 </div>
             </div>
        </div>

        {/* Barra de Status Inferior */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-6 whitespace-nowrap">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Sincronizado</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${showImportedGeometry ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-slate-300'} rounded-full transition-all duration-500`}></div>
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Dados Drone</span>
              </div>
          </div>
          <div className="flex gap-2 ml-4">
             <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-colors shadow-sm whitespace-nowrap">Relatório Geo-Ambiental</button>
             <button className="px-4 py-2 bg-emerald-950 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 whitespace-nowrap">
                <Box className="w-3 h-3" /> Memorial de Confluência
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GISModule;
