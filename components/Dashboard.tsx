
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, Clock, Map as MapIcon, Users } from 'lucide-react';
import { MOCK_PROCESSES } from '../constants';

const Dashboard: React.FC = () => {
  const neighborhoodData = [
    { name: 'Jd. Flores', total: 45, regularizados: 32 },
    { name: 'Centro Velho', total: 28, regularizados: 5 },
    { name: 'Vila Esperança', total: 88, regularizados: 62 },
    { name: 'Setor Norte', total: 12, regularizados: 10 },
  ];

  const timelineData = [
    { month: 'Jan', processos: 10 },
    { month: 'Fev', processos: 25 },
    { month: 'Mar', processos: 42 },
    { month: 'Abr', processos: 58 },
  ];

  const COLORS = ['#10b981', '#059669', '#34d399', '#064e3b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">Análise de progresso por Núcleos e Bairros.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm">
             <MapIcon className="w-4 h-4" />
             Ver Mapa de Calor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Unidades Totais', value: '1.242', icon: MapIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'População Beneficiada', value: '4.968', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Arrecadação Potencial', value: 'R$ 2.4M', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Gargalos Críticos', value: '14', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Progresso por Bairro
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={neighborhoodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={100} />
                <Tooltip 
                   cursor={{fill: '#ecfdf5'}}
                   contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#f1f5f9" radius={[0, 8, 8, 0]} barSize={24} />
                <Bar dataKey="regularizados" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Crescimento da Base Registrada
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="processos" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{r: 8, strokeWidth: 0}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
