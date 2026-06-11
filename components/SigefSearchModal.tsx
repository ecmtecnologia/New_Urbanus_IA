import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Map, 
  Database, 
  Server, 
  Code, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Globe,
  Layers,
  FileJson
} from 'lucide-react';

interface SigefSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

const MOCK_SIGEF_RESULTS = [
  {
    id: 'gleba-01',
    type: 'Gleba Federal',
    name: 'GLEBA RIO VERDE I',
    code: 'GLB-MT-12345',
    status: 'Arrecadada',
    area: '1.250,00 ha',
    municipio: 'Sinop/MT',
    processo: '54000.001234/2020-12'
  },
  {
    id: 'assent-02',
    type: 'Assentamento',
    name: 'PA NOVA ESPERANÇA',
    code: 'PA-MT-54321',
    status: 'Consolidado',
    area: '5.400,00 ha',
    municipio: 'Sorriso/MT',
    processo: '54000.005678/2018-99'
  },
  {
    id: 'sigef-03',
    type: 'Certificação Privada',
    name: 'FAZENDA SANTA FÉ',
    code: 'BR-1234567890',
    status: 'Certificado',
    area: '850,50 ha',
    municipio: 'Sinop/MT',
    processo: '---'
  }
];

const SigefSearchModal: React.FC<SigefSearchModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'API'>('SEARCH');
  const [searchParams, setSearchParams] = useState({
    bbox: '-60.0,-10.0,-50.0,0.0',
    layer: 'incra:sigef_glebas',
    municipio: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = () => {
    setLoading(true);
    setSearched(true);
    // Simulating API delay
    setTimeout(() => {
      setResults(MOCK_SIGEF_RESULTS);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-xl">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Consulta SIGEF / INCRA</h3>
              <p className="text-emerald-300 text-xs font-mono uppercase tracking-widest">Sistema de Gestão Fundiária</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-4 gap-4 bg-slate-50">
          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'SEARCH' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Busca Geoespacial (WFS)
          </button>
          <button
            onClick={() => setActiveTab('API')}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'API' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Configuração API (Python)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
          
          {activeTab === 'SEARCH' && (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Bounding Box (BBOX) / Coordenadas</label>
                    <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-mono text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={searchParams.bbox}
                        onChange={(e) => setSearchParams({...searchParams, bbox: e.target.value})}
                        placeholder="min_lon, min_lat, max_lon, max_lat"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Camada de Dados</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                        value={searchParams.layer}
                        onChange={(e) => setSearchParams({...searchParams, layer: e.target.value})}
                      >
                        <option value="incra:sigef_glebas">Glebas Federais</option>
                        <option value="incra:assentamentos">Assentamentos</option>
                        <option value="incra:sigef_privado">Imóveis Certificados</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Buscar no INCRA
                  </button>
                </div>
              </div>

              {/* Results */}
              {searched && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600" /> Resultados Encontrados ({results.length})
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">Source: geoserver.incra.gov.br</span>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Consultando WFS do SIGEF...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {results.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                                <Map className="w-6 h-6" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900">{item.name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">{item.type}</span>
                                  <span className="text-xs text-slate-500 font-mono">{item.code}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3">
                                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Área:</span> {item.area}</p>
                                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Município:</span> {item.municipio}</p>
                                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Status:</span> {item.status}</p>
                                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Processo:</span> {item.processo}</p>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => onImport(item)}
                              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Importar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'API' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-8 text-slate-300 font-mono text-xs overflow-hidden relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="flex items-center gap-2 mb-6 text-emerald-400 border-b border-white/10 pb-4">
                  <Server className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-widest">Backend Integration Script (Python)</span>
                </div>
                <pre className="overflow-x-auto custom-scrollbar">
{`import requests
import json
from shapely.geometry import shape
from django.contrib.gis.geos import GEOSGeometry

def buscar_dados_sigef(bbox="${searchParams.bbox}"):
    """
    Busca dados geográficos do INCRA via WFS.
    Endpoint: https://sigef.incra.gov.br/geo/wfs/
    Layer: ${searchParams.layer}
    """
    
    base_url = "https://sigef.incra.gov.br/geo/wfs/"
    
    params = {
        'service': 'WFS',
        'version': '1.1.0',
        'request': 'GetFeature',
        'typeName': '${searchParams.layer}',
        'outputFormat': 'application/json',
        'srsName': 'EPSG:4326',
        'bbox': bbox
    }

    try:
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        print(f"Total de registros: {data['totalFeatures']}")
        return data
        
    except Exception as e:
        print(f"Erro ao buscar dados: {e}")
        return None`}
                </pre>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-1">Requisitos de Acesso Restrito</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Para acessar dados sensíveis (CPF de beneficiários, processos sigilosos), é necessário configurar o certificado digital (Gov.br Nível Prata/Ouro) no servidor backend. O script acima consome apenas as camadas públicas do GeoServer.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SigefSearchModal;
