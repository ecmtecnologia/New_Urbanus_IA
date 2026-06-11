
import React from 'react';
import { BarChart3, Users, Activity, Target, ShieldAlert, Zap, TrendingUp, Clock, UserCheck } from 'lucide-react';

const TeamDashboard: React.FC = () => {
  const team = [
    { id: '1', name: 'Ana Silva', role: 'Engenharia', goal: 40, current: 32, idle: 0, avatar: 'AS' },
    { id: '2', name: 'Beto Luz', role: 'Social', goal: 100, current: 45, idle: 2, avatar: 'BL' },
    { id: '3', name: 'Clara Meire', role: 'Jurídico', goal: 15, current: 14, idle: 0, avatar: 'CM' },
    { id: '4', name: 'Diego Costa', role: 'Social', goal: 100, current: 12, idle: 5, avatar: 'DC' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Operação</h2>
          <p className="text-slate-500 mt-1">Produtividade da equipe e controle de gargalos humanos.</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">2 Alertas de Ociosidade</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Famílias Seladas/Dia', value: '142', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Memoriais Gerados', value: '45', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Matrículas em Análise', value: '18', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Eficiência Geral', value: '88%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Users className="w-4 h-4 text-emerald-600" /> Performance Individual
              </h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Ativo</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Ocioso</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {team.map((member) => (
                <div key={member.id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-emerald-700 bg-emerald-100 border-2 ${member.idle > 2 ? 'border-rose-400 animate-pulse' : 'border-emerald-200'}`}>
                         {member.avatar}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{member.name}</p>
                         <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{member.role}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-12">
                      <div className="w-48">
                         <div className="flex justify-between mb-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Meta Diária</span>
                            <span className="text-[10px] font-black text-slate-900">{member.current} / {member.goal}</span>
                         </div>
                         <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                               className={`h-full transition-all duration-1000 ${member.current/member.goal > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                               style={{ width: `${(member.current / member.goal) * 100}%` }}
                            ></div>
                         </div>
                      </div>
                      
                      <div className="text-right w-24">
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Ociosidade</p>
                         <p className={`text-xs font-black ${member.idle > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {member.idle === 0 ? 'Em Dia' : `${member.idle} Dias Sem Ação`}
                         </p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-emerald-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-[300px]">
              <div className="relative z-10">
                 <h4 className="text-lg font-bold mb-2">Monitor AISHA</h4>
                 <p className="text-emerald-100/60 text-xs leading-relaxed">A IA monitora as filas de trabalho em tempo real e sugere realocação de equipe conforme a demanda do cronograma municipal.</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl z-10 animate-in slide-in-from-right-4">
                 <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Sugestão de Realocação</span>
                 </div>
                 <p className="text-[10px] text-emerald-100 font-medium italic">"Mova 'Diego Costa' para auxiliar na análise de matrículas do Núcleo Sul. Gargalo jurídico detectado."</p>
              </div>
              <Activity className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-600" /> Tempo Médio por Etapa</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Triagem Social', time: '14 min', change: '-2%' },
                   { label: 'Memorial Geo', time: '42 min', change: '+12%' },
                   { label: 'Parecer Jurídico', time: '28 min', change: '-5%' },
                 ].map((t, i) => (
                   <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <div>
                         <span className="text-xs text-slate-600 font-medium">{t.label}</span>
                         <p className="text-[10px] font-black text-slate-400 uppercase leading-none mt-1">{t.time}</p>
                      </div>
                      <span className={`text-[10px] font-black ${t.change.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>{t.change}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
