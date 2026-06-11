
import React from 'react';
import { SQL_SCHEMA } from '../constants';
import { Database, Code2, ClipboardList } from 'lucide-react';

const DatabaseSchema: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Arquitetura de Dados</h2>
          <p className="text-slate-500 mt-1">Estrutura matricial SQL para suporte à regularização fundiária complexa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-200 font-mono text-sm">schema.sql</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(SQL_SCHEMA)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-colors"
                >
                    Copiar Script
                </button>
            </div>
            <pre className="text-blue-100/80 font-mono text-sm overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                {SQL_SCHEMA}
            </pre>
            <div className="absolute right-0 bottom-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Database className="w-64 h-64" />
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Entidades Principais
                </h3>
                <div className="space-y-4">
                    {[
                        { name: 'territory_zones', desc: 'Zoneamento urbano e rural (ZEIS, ZR, RURAL).' },
                        { name: 'properties', desc: 'Unidades imobiliárias (lotes) com geometria PostGIS.' },
                        { name: 'occupants', desc: 'Dados socioeconômicos e assinaturas digitais.' },
                        { name: 'processes', desc: 'Fluxo processual e ciclo de vida do título.' },
                        { name: 'rural_properties', desc: 'Imóveis rurais com georreferenciamento INCRA.' },
                        { name: 'dados_ambientais', desc: 'CAR detalhado, áreas de APP e Reserva Legal.' },
                        { name: 'dados_produtivos', desc: 'CCIR, índices de produtividade e exploração.' },
                        { name: 'users', desc: 'Gestão de usuários, cargos e assinaturas técnicas.' },
                        { name: 'user_groups', desc: 'Grupos de acesso e matriz de permissões.' },
                        { name: 'ai_analyses', desc: 'Rastreabilidade de análises preditivas e auditoria.' },
                        { name: 'ged_documents', desc: 'Repositório central de documentos (Matrículas, Escrituras, Pareceres).' },
                        { name: 'ged_workflows', desc: 'Tramitações digitais de documentos e pareceres entre setores.' }
                    ].map((entity, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                            <p className="text-sm font-bold text-slate-900">{entity.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{entity.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-200">
                <h3 className="text-xl font-bold mb-4">Escalabilidade GIS</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                    A estrutura utiliza PostGIS para cálculos de área e detecção de sobreposição em tempo real (ST_Intersects).
                </p>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase">PostgreSQL</span>
                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase">PostGIS</span>
                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase">JSONB</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchema;
