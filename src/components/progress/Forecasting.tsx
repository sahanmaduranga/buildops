import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Activity,
  History,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';

const forecastData = [
  { month: 'Jun', planned: 65, forecast: 65 },
  { month: 'Jul', planned: 80, forecast: 74 },
  { month: 'Aug', planned: 92, forecast: 82 },
  { month: 'Sep', planned: 100, forecast: 90 },
  { month: 'Oct', planned: 100, forecast: 96 },
  { month: 'Nov', planned: 100, forecast: 100 },
];

export const ForecastingAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Predictive Progress Forecasting</h2>
          <p className="text-[13px] text-slate-500 font-medium">Data-driven projections for project completion and delivery impact</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[13px] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              <Zap size={18} />
              Run Simulation
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Projection Summary */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-6 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp size={120} />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-900 rounded-lg text-white">
                     <Target size={20} />
                  </div>
                  <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Delivery Projection</h3>
               </div>
               
               <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Baseline completion</span>
                  <p className="text-3xl font-black text-slate-900 tabular-nums">Sept 15, 2024</p>
               </div>

               <div className="space-y-2">
                  <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase tracking-widest leading-none font-black">Forecasted completion</span>
                  <p className="text-3xl font-black text-red-600 tabular-nums">Nov 12, 2024</p>
                  <p className="text-[11px] text-red-500 font-black flex items-center gap-1"><AlertTriangle size={12} /> Slip Impact: +58 Days</p>
               </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Confidence</span>
                  <span className="text-[12px] font-black text-emerald-600 uppercase">HIGH (85%)</span>
               </div>
               <button className="text-[11px] font-black text-primary-600 flex items-center gap-1 hover:underline">
                  ADJUST VARS <ChevronRight size={14} />
               </button>
            </div>
         </div>

         {/* Velocity Analysis */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Activity size={20} />
               </div>
               <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Required Recovery Velocity</h3>
            </div>
            
            <div className="flex-1 space-y-8">
               <div className="space-y-4">
                  <div className="flex items-end justify-between">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase block">Current Output</span>
                        <p className="text-2xl font-black text-slate-900 tabular-nums">42.5 <span className="text-[11px] text-slate-400">m3/day</span></p>
                     </div>
                     <div className="text-right space-y-1">
                        <span className="text-[10px] font-black text-primary-500 uppercase block">Target for Baseline</span>
                        <p className="text-2xl font-black text-primary-600 tabular-nums">58.2 <span className="text-[11px] text-primary-400">m3/day</span></p>
                     </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div className="h-full bg-slate-900" style={{ width: '73%' }} />
                     <div className="h-full bg-primary-400 animate-pulse" style={{ width: '27%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium italic text-center leading-relaxed">
                     An output surge of <span className="font-black text-slate-900">37%</span> is required to realign with the Sept 15 milestone.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase block">Labor Impact</span>
                     <p className="text-[13px] font-black text-slate-800">+12 Workers Req.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase block">Equipment Inc.</span>
                     <p className="text-[13px] font-black text-slate-800">2 Add. Excavators</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Risk Heatmap Summary */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <ShieldAlert size={20} />
               </div>
               <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Completion Risk Heatmap</h3>
            </div>
            
            <div className="flex-1 space-y-4">
               {[
                  { label: 'Bulk Excavation', risk: 'Critical', color: 'text-red-600', bg: 'bg-red-50', prob: 95 },
                  { label: 'Foundation Rebar', risk: 'High', color: 'text-amber-600', bg: 'bg-amber-50', prob: 72 },
                  { label: 'MEP 1st Fix', risk: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50', prob: 45 },
                  { label: 'Interior Finishes', risk: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50', prob: 12 },
               ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-2 h-2 rounded-full", item.color === 'text-red-600' ? "bg-red-600" : item.color === 'text-amber-600' ? "bg-amber-600" : "bg-blue-600")} />
                        <span className="text-[12px] font-black text-slate-700">{item.label}</span>
                     </div>
                     <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest", item.bg, item.color)}>{item.risk} ({item.prob}%)</span>
                  </div>
               ))}
            </div>
            <button className="w-full py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black hover:bg-slate-200 transition-all uppercase tracking-widest leading-none">View Monte Carlo simulation</button>
         </div>
      </div>

      {/* Forecast Line Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl flex flex-col h-[500px]">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[16px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
               <TrendingUp size={24} className="text-primary-600" />
               Cumulative Progress Forecast
            </h3>
            <div className="flex gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-[11px] font-black text-slate-400">PLANNED TARGET</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-600" />
                  <span className="text-[11px] font-black text-slate-900">MOST LIKELY FORECAST</span>
               </div>
            </div>
         </div>
         
         <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} unit="%" />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', padding: '16px' }}
                  />
                  <Area type="monotone" dataKey="planned" fill="#f1f5f9" fillOpacity={1} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" name="Cumulative Planned" />
                  <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} name="Projected Forecast" />
                  <ReferenceLine x="Sep" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'top', value: 'BASELINE END', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
