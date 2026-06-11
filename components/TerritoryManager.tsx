
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  MapPinned, 
  Box, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Sparkles,
  ArrowLeft,
  Info,
  Building2,
  Grid3X3,
  Home,
  X,
  Check,
  Save,
  AlertCircle,
  Loader
} from 'lucide-react';
import LotEditor from './LotEditor';
import { Zone, Sector, Block, Property, listZones, createZone, deleteZone, listSectors, createSector, deleteSector, listBlocks, createBlock, deleteBlock, listProperties, deleteProperty } from '../services/territoryService';

type ViewMode = 'ZONES' | 'SECTORS' | 'BLOCKS' | 'LOTS';

const TerritoryManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('ZONES');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  
  // States para CRUD
  const [showModal, setShowModal] = useState(false);
  const [showLotEditor, setShowLotEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Database from API
  const [zones, setZones] = useState<Zone[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Carrega dados ao montar e quando muda de visualização
  useEffect(() => {
    loadData();
  }, [viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (viewMode === 'ZONES') {
        const data = await listZones();
        setZones(data);
      } else if (viewMode === 'SECTORS') {
        const data = await listSectors();
        setSectors(data);
      } else if (viewMode === 'BLOCKS') {
        const data = await listBlocks();
        setBlocks(data);
      } else if (viewMode === 'LOTS') {
        const data = await listProperties();
        setProperties(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Handlers de CRUD
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const data: any = Object.fromEntries(formData.entries());

      if (viewMode === 'ZONES') {
        const zoneData: Omit<Zone, 'id' | 'created_at'> = {
          name: data.name,
          type: data.type,
          description: data.description,
          min_lot_area_sqm: data.minLot ? parseFloat(data.minLot) : undefined,
          max_height_meters: undefined,
        };
        await createZone(zoneData);
        await loadData();
      } else if (viewMode === 'SECTORS') {
        if (selectedZone) {
          await createSector({
            zone_id: selectedZone.id,
            name: data.name,
            responsible_tech_id: undefined,
          });
          await loadData();
        }
      } else if (viewMode === 'BLOCKS') {
        if (selectedSector) {
          await createBlock({
            sector_id: selectedSector.id,
            designation: data.designation,
            registry_number: data.registry || undefined,
            total_area_sqm: data.area ? parseFloat(data.area) : undefined,
          });
          await loadData();
        }
      }
      
      setShowModal(false);
      setEditItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      setLoading(true);
      if (viewMode === 'SECTORS') {
        await deleteSector(id);
        await loadData();
      } else if (viewMode === 'BLOCKS') {
        await deleteBlock(id);
        await loadData();
      } else if (viewMode === 'LOTS') {
        await deleteProperty(id);
        await loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally {
      setLoading(false);
    }
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
      <button onClick={() => { setViewMode('ZONES'); setSelectedZone(null); setSelectedSector(null); setSelectedBlock(null); }} className="hover:text-emerald-600 transition-colors">Município</button>
      {selectedZone && (
        <>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => { setViewMode('SECTORS'); setSelectedSector(null); setSelectedBlock(null); }} className="hover:text-emerald-600 transition-colors">{selectedZone.name}</button>
        </>
      )}
      {selectedSector && (
        <>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => { setViewMode('BLOCKS'); setSelectedBlock(null); }} className="hover:text-emerald-600 transition-colors">{selectedSector.name}</button>
        </>
      )}
      {selectedBlock && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600">{selectedBlock.designation}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Integrador do Editor de Lotes Detalhado */}
      {showLotEditor && <LotEditor onClose={() => setShowLotEditor(false)} initialData={editItem} />}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão Territorial</h2>
          <p className="text-slate-500 mt-1">Hierarquia: Zona → Setor → Quadra → Lote.</p>
        </div>
        <button 
          onClick={() => { 
            setEditItem(null); 
            if (viewMode === 'LOTS') setShowLotEditor(true); 
            else setShowModal(true); 
          }}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10"
        >
          <Plus className="w-4 h-4" /> 
          {viewMode === 'ZONES' && 'Nova Zona'}
          {viewMode === 'SECTORS' && 'Novo Setor'}
          {viewMode === 'BLOCKS' && 'Nova Quadra'}
          {viewMode === 'LOTS' && 'Novo Lote'}
        </button>
      </div>

      {renderBreadcrumbs()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Filtrar nesta camada..." className="bg-transparent border-none text-sm outline-none w-64" />
              </div>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                Camada Ativa: {viewMode}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading && (
                <div className="p-8 flex items-center justify-center text-slate-500">
                  <Loader className="w-6 h-6 animate-spin mr-2" /> Carregando...
                </div>
              )}
              {error && (
                <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-bold">
                  {error}
                </div>
              )}
              {!loading && viewMode === 'ZONES' && zones.map(zone => (
                <div key={zone.id} className="p-4 md:p-6 hover:bg-emerald-50/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                  <div className="flex items-center gap-4 cursor-pointer flex-1 w-full" onClick={() => { setSelectedZone(zone); setViewMode('SECTORS'); }}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{zone.name}</h4>
                      <p className="text-xs text-slate-500">{zone.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-16 md:pl-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Tipo</p>
                      <p className="text-sm font-black text-slate-700">{zone.type}</p>
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); setEditItem(zone); setShowModal(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                       <button onClick={(e) => { e.stopPropagation(); deleteZone(zone.id).then(() => loadData()).catch((err) => setError(err.message)); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-rose-500 hover:text-rose-600 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />
                  </div>
                </div>
              ))}

              {!loading && viewMode === 'SECTORS' && sectors.filter(s => s.zone_id === selectedZone?.id).map(sector => (
                <div key={sector.id} className="p-4 md:p-6 hover:bg-emerald-50/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                  <div className="flex items-center gap-4 cursor-pointer flex-1 w-full" onClick={() => { setSelectedSector(sector); setViewMode('BLOCKS'); }}>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{sector.name}</h4>
                      <p className="text-xs text-slate-500">ID: {sector.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-16 md:pl-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                      <p className="text-sm font-black text-slate-700">Ativo</p>
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); setEditItem(sector); setShowModal(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(sector.id); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-rose-500 hover:text-rose-600 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />
                  </div>
                </div>
              ))}

              {!loading && viewMode === 'BLOCKS' && blocks.filter(b => b.sector_id === selectedSector?.id).map(block => (
                <div key={block.id} className="p-4 md:p-6 hover:bg-emerald-50/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                  <div className="flex items-center gap-4 cursor-pointer flex-1 w-full" onClick={() => { setSelectedBlock(block); setViewMode('LOTS'); }}>
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Grid3X3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{block.designation}</h4>
                      <p className="text-xs text-slate-500">{block.total_area_sqm}m²</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-16 md:pl-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                      <p className="text-sm font-black text-slate-700">Auditado</p>
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); setEditItem(block); setShowModal(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(block.id); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-rose-500 hover:text-rose-600 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />
                  </div>
                </div>
              ))}

              {!loading && viewMode === 'LOTS' && properties.filter(p => p.block_id === selectedBlock?.id).map(prop => (
                <div key={prop.id} className="p-4 md:p-6 hover:bg-emerald-50/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{prop.cadastral_code}</h4>
                      <p className="text-xs text-slate-500">{prop.address_street}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-8 pl-16 md:pl-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Área (m²)</p>
                      <p className="text-sm font-black text-slate-700">{prop.area_sqm}</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => { setEditItem(prop); setShowLotEditor(true); }} 
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(prop.id)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-rose-500 hover:text-rose-600 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Genérico para Zonas, Setores e Quadras */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
                    {editItem ? 'Editar' : 'Criar'} {viewMode === 'ZONES' ? 'Zona' : viewMode === 'SECTORS' ? 'Setor' : 'Quadra'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
               </div>
               <form onSubmit={handleSave} className="p-6 md:p-8 space-y-4">
                  {viewMode === 'ZONES' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome da Zona</label>
                        <input name="name" defaultValue={editItem?.name} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Tipo de Zona</label>
                        <select name="type" defaultValue={editItem?.type} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
                           <option value="Social">ZEIS (Social)</option>
                           <option value="Residencial">ZR (Residencial)</option>
                           <option value="Comercial">ZC (Comercial)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {viewMode === 'SECTORS' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome do Setor / Núcleo</label>
                        <input name="name" defaultValue={editItem?.name} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Responsável Técnico</label>
                        <input name="responsible" defaultValue={editItem?.responsible} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </>
                  )}

                  {viewMode === 'BLOCKS' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Designação da Quadra</label>
                        <input name="designation" defaultValue={editItem?.designation} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Área Total (m²)</label>
                        <input name="area" type="number" defaultValue={editItem?.area} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </>
                  )}

                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                      <Save className="w-4 h-4" /> Salvar Registro
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Monitor Lateral */}
        <div className="space-y-6">
          <div className="bg-emerald-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[450px]">
             <div className="relative z-10">
                <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-slate-900" />
                </div>
                <h4 className="text-xl font-bold mb-2">Monitor Territorial</h4>
                <p className="text-emerald-100/60 text-xs leading-relaxed">
                   A hierarquia garante que o Lote esteja vinculado à Quadra correta para emissão automática da CRF.
                </p>
             </div>
             
             <div className="space-y-4 z-10">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Status da Camada</p>
                   <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Total de {viewMode}:</span>
                      <span className="font-bold">
                        {viewMode === 'ZONES' ? zones.length : 
                         viewMode === 'SECTORS' ? sectors.length :
                         viewMode === 'BLOCKS' ? blocks.length : properties.length}
                      </span>
                   </div>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '60%' }}></div>
                   </div>
                </div>
             </div>

             <MapPinned className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Exportação</h3>
             <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
                Download GeoJSON
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritoryManager;
