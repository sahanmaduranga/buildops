import React, { useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Target, 
  Users, 
  Wrench, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Search,
  Zap,
  Hammer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';

const productivityData = [
  { name: 'Week 1', actual: 42, target: 45, resource: 10 },
  { name: 'Week 2', actual: 48, target: 45, resource: 12 },
  { name: 'Week 3', actual: 45, target: 45, resource: 11 },
  { name: 'Week 4', actual: 52, target: 45, resource: 14 },
  { name: 'Week 5', actual: 38, target: 45, resource: 10 },
  { name: 'Week 6', actual: 44, target: 45, resource: 11 },
];

const efficiencyData = [
  { category: 'Piling', efficiency: 92 },
  { category: 'Excavation', efficiency: 105 },
  { category: 'Concrete', efficiency: 88 },
  { category: 'Formwork', efficiency: 95 },
  { category: 'Steel Fix', efficiency: 112 },
];

export const ProductivityAnalysis = () => {
  const { tasks } = useProgress();

  const resourcesPerformance = useMemo(() => {
    // Group tasks/productivity by task name or category
    return tasks.map(t => {
      const target = t.plannedQty || 100;
      const actual = t.actualQty || 0;
      const efficiency = target > 0 ? (actual / target) * 100 : 0;
      return {
        ...t,
        efficiency: Math.round(efficiency),
        variance: Math.round(efficiency - 100)
      };
    });
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Productivity & Efficiency Analysis</h2>
          <p className="text-[13px] text-slate-500 font-medium">Monitor resource output velocity and efficiency variances</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={14} /> Filter Resource
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95">
            Compare Sets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Overall Efficiency', value: '94.2%', change: '+2.1%', trend: 'up', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Daily Output', value: '112%', change: '+5.4%', trend: 'up', icon: Hammer, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Schedule Variance', value: '-4.8%', change: '-0.5%', trend: 'down', icon: Target, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Unit Production Rate', value: '1.24', change: '-12%', trend: 'up', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:border-primary-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-lg", kpi.bg, kpi.color)}>
                <kpi.icon size={20} />
              </div>
              <span className={cn(
                "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full",
                kpi.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {kpi.change}
              </span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</span>
            <p className="text-2xl font-black text-slate-900 leading-none tabular-nums group-hover:text-primary-600 transition-colors">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-600" />
              Output Velocity (Actual vs Target)
            </h3>
          </div>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                   <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                   <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                   />
                   <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual Output" barSize={32} />
                   <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Efficiency Target" />
                </ComposedChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Efficiency Index by Category
            </h3>
          </div>
          <div className="flex-1 min-h-0 space-y-6 overflow-y-auto pr-2 scrollbar-thin">
             {efficiencyData.map((item, idx) => (
                <div key={idx} className="space-y-2">
                   <div className="flex justify-between text-[12px] font-black uppercase tracking-tight">
                      <span className="text-slate-600">{item.category}</span>
                      <span className={cn(item.efficiency >= 100 ? "text-emerald-600" : "text-amber-600")}>{item.efficiency}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(item.efficiency, 100)}%` }}
                         className={cn(
                            "h-full transition-all duration-700",
                            item.efficiency >= 100 ? "bg-emerald-500" : "bg-amber-500"
                         )} 
                      />
                      {item.efficiency > 100 && (
                         <div className="h-full bg-emerald-300" style={{ width: `${item.efficiency - 100}%` }} />
                      )}
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} className="text-primary-600" />
              Workforce Productivity Log
           </h3>
           <button className="text-[11px] font-black text-primary-600 bg-white border border-primary-100 px-3 py-1 rounded-lg shadow-sm hover:bg-primary-50 transition-all">VIEW RESOURCE MATRIX</button>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full border-collapse text-[13px]">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                 <tr>
                    <th className="text-left p-4">Activity Code</th>
                    <th className="text-left p-4">Task Allocation</th>
                    <th className="text-right p-4">Plan Output</th>
                    <th className="text-right p-4">Actual Output</th>
                    <th className="text-center p-4">Efficiency</th>
                    <th className="text-right p-4">Variance</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {resourcesPerformance.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                       <td className="p-4 font-black font-mono text-slate-400">{t.code}</td>
                       <td className="p-4 font-bold text-slate-800">{t.name}</td>
                       <td className="p-4 text-right font-bold text-slate-400">{t.plannedQty} m3</td>
                       <td className="p-4 text-right font-black text-slate-900">{t.actualQty} m3</td>
                       <td className="p-4 text-center">
                          <span className={cn(
                             "px-2 py-0.5 border rounded text-[10px] font-black",
                             t.efficiency >= 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                          )}>{t.efficiency}%</span>
                       </td>
                       <td className="p-4 text-right">
                          <span className={cn(
                             "font-black flex items-center justify-end gap-1",
                             t.variance >= 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                             {t.variance >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                             {Math.abs(t.variance)}%
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

