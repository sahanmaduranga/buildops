import React from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { useCashflow } from './MockCostData.ts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Activity, 
  Wallet,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../../lib/utils.ts';

export const CashFlow = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: cashflow, isLoading } = useCashflow(projectId);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compiling cash registers...</p>
        </div>
      </div>
    );
  }

  // Calculate Cumulative Balance running total
  let runningTotal = 0;
  const processedCashflow = cashflow.map(cf => {
    runningTotal += cf.balance;
    return {
      ...cf,
      cumulative: runningTotal
    };
  });

  const totalInflow = cashflow.reduce((sum, cf) => sum + cf.inflow, 0);
  const totalOutflow = cashflow.reduce((sum, cf) => sum + cf.outflow, 0);
  const netPosition = totalInflow - totalOutflow;

  const formatCur = (num: number) => {
    return '$' + num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* KPI Sum Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex justify-between items-center relative group">
          <div>
            <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">Total Inflow Payments</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2.5">{formatCur(totalInflow)}</h3>
            <span className="text-[10.5px] text-slate-400 font-semibold block mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Client progress billing receipts
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex justify-between items-center relative group">
          <div>
            <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">Total Outflow Payments</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2.5">{formatCur(totalOutflow)}</h3>
            <span className="text-[10.5px] text-slate-400 font-semibold block mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-550 inline-block animation-pulse" /> Material & subcontractor billings
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-650 rounded-xl">
            <ArrowDownRight size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex justify-between items-center relative group">
          <div>
            <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">Net Project Cash Position</p>
            <h3 className={cn("text-xl font-black tracking-tight mt-2.5", netPosition >= 0 ? "text-emerald-700" : "text-rose-650")}>
              {formatCur(netPosition)}
            </h3>
            <span className="text-[10.5px] text-slate-400 font-semibold block mt-1.5 flex items-center gap-1">
              {netPosition >= 0 ? (
                <span className="text-emerald-650 font-bold">Positive Liquidity</span>
              ) : (
                <span className="text-rose-650 font-bold">Negative Liquidity Check</span>
              )}
              <span>Fluidity status index</span>
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Wallet size={18} />
          </div>
        </div>

      </div>

      {/* Double charts: monthly liquidity bar + cumulative curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monthly Inflow/Outflow */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <h4 className="font-bold text-slate-800 border-b border-light pb-2 mb-4 leading-none">Monthly Liquidity Flow</h4>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedCashflow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCur(Number(v))} />
                <Legend iconType="circle" />
                <Bar dataKey="inflow" label="Inflow" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outflow" label="Outflow" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cumulative balance */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <h4 className="font-bold text-slate-800 border-b border-light pb-2 mb-4 leading-none">Cumulative Cash Balance Trend</h4>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedCashflow}>
                <defs>
                  <linearGradient id="colCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCur(Number(v))} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colCum)" name="Cumulative Cash Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Cashflow monthly table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider">Consolidated Cash Flow Schedule</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10.5px] uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4 font-bold">Accounting Month</th>
                <th className="py-3 px-4 font-bold text-right">Inflow Progress Receipts</th>
                <th className="py-3 px-4 font-bold text-right">Outflow Expenditure Payments</th>
                <th className="py-3 px-4 font-bold text-right">Monthly Net Balance</th>
                <th className="py-3 px-4 font-bold text-right">Running Cash Position</th>
                <th className="py-3 px-4 font-bold text-center">Liquidity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-medium">
              {processedCashflow.map((r) => {
                const isNetPositive = r.balance >= 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{r.month}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-blue-600">{formatCur(r.inflow)}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCur(r.outflow)}</td>
                    <td className={cn(
                      "py-3.5 px-4 text-right font-bold font-mono",
                      isNetPositive ? "text-emerald-700" : "text-rose-650"
                    )}>
                      {isNetPositive ? `+${formatCur(r.balance)}` : `-${formatCur(Math.abs(r.balance))}`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black font-semibold font-mono text-slate-700">{formatCur(r.cumulative)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase",
                        isNetPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                      )}>
                        {isNetPositive ? "Net Positive" : "Deficit Check"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
