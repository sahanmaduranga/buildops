import React from 'react';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Info,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';

const evKPIs = [
  { label: 'Planned Value (PV)', value: '$1.42M', status: 'neutral', icon: Layers },
  { label: 'Earned Value (EV)', value: '$1.28M', status: 'warning', icon: Target },
  { label: 'Actual Cost (AC)', value: '$1.35M', status: 'error', icon: Activity },
  { label: 'Schedule Variance (SV)', value: '-$140K', status: 'error', icon: TrendingDown },
  { label: 'Cost Variance (CV)', value: '-$70K', status: 'error', icon: TrendingDown },
  { label: 'BAC (At Completion)', value: '$4.50M', status: 'neutral', icon: ShieldAlert },
];

const varianceData = [
  { name: 'Excavation', sv: -12, cv: 5 },
  { name: 'Foundations', sv: -25, cv: -10 },
  { name: 'Ground Floor', sv: 0, cv: 8 },
  { name: 'Struct. Frame', sv: -15, cv: -5 },
  { name: 'MEP Rough-in', sv: 5, cv: 12 },
];

export const EarnedValueAnalysis = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Earned Value Analysis (EVA)</h2>
          <p className="text-[13px] text-slate-500 font-medium">Executive financial and schedule performance metrics</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={14} /> Global Filters
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[12px] font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
              <Download size={14} /> Full Audit Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {evKPIs.map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:shadow-md transition-all">
             <div className="flex justify-between items-start mb-3">
                <div className="p-1.5 bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors rounded">
                   <kpi.icon size={16} />
                </div>
                {kpi.status === 'error' && <AlertCircle size={14} className="text-red-500" />}
                {kpi.status === 'warning' && <AlertCircle size={14} className="text-amber-500" />}
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</span>
             <p className="text-lg font-black text-slate-900 tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-black text-white uppercase tracking-widest">Performance Indicators</h3>
              <Info size={16} className="text-slate-500" />
           </div>
           
           <div className="space-y-8 py-4">
              <div className="flex items-center gap-6">
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                       <span>Schedule Index (SPI)</span>
                       <span className="text-red-400">0.82 (DELAYED)</span>
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded-lg p-1">
                       <div className="h-full bg-red-500 rounded flex items-center justify-end px-2" style={{ width: '82%' }}>
                          <ArrowDownRight size={10} className="text-white" />
                       </div>
                    </div>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-red-500/20 flex flex-col items-center justify-center text-red-500">
                    <span className="text-xs font-black">SPI</span>
                    <span className="text-lg font-black leading-none">0.8</span>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                       <span>Cost Index (CPI)</span>
                       <span className="text-emerald-400">1.04 (UNDER BUDGET)</span>
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded-lg p-1">
                       <div className="h-full bg-emerald-500 rounded flex items-center justify-end px-2" style={{ width: '100%', maxWidth: '95%' }}>
                          <ArrowUpRight size={10} className="text-white" />
                       </div>
                    </div>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex flex-col items-center justify-center text-emerald-500">
                    <span className="text-xs font-black">CPI</span>
                    <span className="text-lg font-black leading-none">1.0</span>
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-white/5 flex gap-4">
              <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
                 <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Estimate At Comp. (EAC)</span>
                 <p className="text-xl font-black text-white">$4.32M</p>
                 <span className="text-[10px] text-emerald-400 font-bold">-$0.18M Varianced</span>
              </div>
              <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
                 <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">To-Complete (TCPI)</span>
                 <p className="text-xl font-black text-white">1.08</p>
                 <span className="text-[10px] text-amber-400 font-bold">Efficiency Increase Req.</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                 <BarChart3 size={18} className="text-primary-600" />
                 Variance Breakdown by WBS Level 2
              </h3>
           </div>
           <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={varianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    />
                    <ReferenceLine y={0} stroke="#cbd5e1" />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="sv" fill="#ef4444" radius={[4, 4, 0, 0]} name="Schedule Var (Days)" barSize={24} />
                    <Bar dataKey="cv" fill="#10b981" radius={[4, 4, 0, 0]} name="Cost Var ($)" barSize={24} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <Layers size={16} className="text-primary-600" />
               Detailed EV Data Table
            </h3>
            <button className="text-[10px] font-black text-primary-600 flex items-center gap-1 hover:underline">
               VIEW WBS HIERARCHY <ChevronRight size={12} />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
               <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <tr>
                     <th className="text-left p-4">WBS ID</th>
                     <th className="text-left p-4">Activity Description</th>
                     <th className="text-right p-4">PV</th>
                     <th className="text-right p-4">EV</th>
                     <th className="text-right p-4">AC</th>
                     <th className="text-center p-4">SPI</th>
                     <th className="text-center p-4">CPI</th>
                     <th className="text-right p-4">Variance ($)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5].map(i => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                        <td className="p-4 font-black font-mono text-slate-400">1.2.0{i}</td>
                        <td className="p-4 font-black text-slate-800">Vertical Concreting Sector B - Level {i}</td>
                        <td className="p-4 text-right font-bold text-slate-600">${i*140}K</td>
                        <td className="p-4 text-right font-black text-slate-900">${i*125}K</td>
                        <td className="p-4 text-right font-bold text-slate-600">${i*130}K</td>
                        <td className="p-4 text-center">
                           <span className="text-[11px] font-black text-red-600">0.{(9-i)*10}</span>
                        </td>
                        <td className="p-4 text-center">
                           <span className="text-[11px] font-black text-emerald-600">1.0{i}</span>
                        </td>
                        <td className="p-4 text-right">
                           <span className="font-black text-red-600">-${i*5}K</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
               <tfoot className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-widest">
                  <tr>
                     <td colSpan={2} className="p-4">TOTAL PORTFOLIO Performance</td>
                     <td className="p-4 text-right">$4.25M</td>
                     <td className="p-4 text-right">$3.88M</td>
                     <td className="p-4 text-right">$4.10M</td>
                     <td className="p-4 text-center">0.91</td>
                     <td className="p-4 text-center">0.95</td>
                     <td className="p-4 text-right">-$220K</td>
                  </tr>
               </tfoot>
            </table>
         </div>
      </div>
    </div>
  );
};
