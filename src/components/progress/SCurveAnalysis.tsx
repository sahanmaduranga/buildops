import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Calendar, 
  Download, 
  Filter, 
  Info,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';

const sCurveData = [
  { month: 'Jun 23', planned: 2, actual: 1.5, ev: 1.8 },
  { month: 'Jul 23', planned: 8, actual: 7, ev: 7.5 },
  { month: 'Aug 23', planned: 18, actual: 15, ev: 16 },
  { month: 'Sep 23', planned: 35, actual: 28, ev: 30 },
  { month: 'Oct 23', planned: 55, actual: 45, ev: 48 },
  { month: 'Nov 23', planned: 72, actual: 58, ev: 62 },
  { month: 'Dec 23', planned: 88, actual: 75, ev: 80 },
  { month: 'Jan 24', planned: 95, actual: 88, ev: 92 },
  { month: 'Feb 24', planned: 100, actual: 100, ev: 100 },
];

export const SCurveAnalysis = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise S-Curve Analysis</h2>
          <p className="text-[13px] text-slate-500 font-medium">Cumulative progress tracking vs baseline and earned value</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Calendar size={14} /> Full Project
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95">
              <Download size={14} /> Export Dataset
           </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl flex flex-col h-[600px]">
         <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex gap-8">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 underline decoration-primary-600 decoration-2 underline-offset-4">Planned Curve (PV)</span>
                  <span className="text-2xl font-black text-slate-900">72.4%</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 underline decoration-emerald-500 decoration-2 underline-offset-4">Actual Curve (AV)</span>
                  <div className="flex items-center gap-2">
                     <span className="text-2xl font-black text-slate-900">58.8%</span>
                     <span className="text-[11px] font-black text-red-500 bg-red-50 px-2 rounded">-13.6%</span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 underline decoration-amber-500 decoration-2 underline-offset-4">Earned Value (EV)</span>
                  <span className="text-2xl font-black text-slate-900">62.1%</span>
               </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
                  <div className="w-3 h-3 rounded-full bg-primary-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <span className="text-[11px] font-black text-slate-700">BASELINE 1.0</span>
               </div>
               <ChevronDown size={14} className="text-slate-400" />
            </div>
         </div>

         <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none rounded-xl" />
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={sCurveData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                     <linearGradient id="curvePlanned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                     </linearGradient>
                     <linearGradient id="curveActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={11} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    fontSize={11} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                    unit="%"
                    dx={-10}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', padding: '16px' }}
                     labelStyle={{ fontWeight: 'black', fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}
                     itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#curvePlanned)" 
                    name="Planned Progress (PV)"
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#curveActual)" 
                    name="Actual Executed (AV)"
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ev" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="8 4"
                    fillOpacity={0}
                    name="Earned Value (EV)"
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                  <Info size={18} />
               </div>
               <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">S-Curve Variance</h4>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
               The current slippage of 13.6% is primarily driven by the foundation delays in Sector A and B. Monthly recovery rate of 4% required.
            </p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Target size={18} />
               </div>
               <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Milestone Alignment</h4>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-[11px] font-black text-slate-700">
                  <span>PHASE 1 COMPLETE</span>
                  <span className="text-emerald-600">ON TIME</span>
               </div>
               <div className="flex justify-between items-center text-[11px] font-black text-slate-700">
                  <span>PHASE 2 START</span>
                  <span className="text-red-500">8D DELAY</span>
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <TrendingUp size={18} />
               </div>
               <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Acceleration Plan</h4>
            </div>
            <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-black shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all uppercase tracking-widest">
               SIMULATE RECOVERY
            </button>
         </div>
      </div>
    </div>
  );
};
