import React from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { useBudgets, useCosts, useForecast } from './MockCostData.ts';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  FileCheck2,
  Lock,
  Compass
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
  AreaChart, 
  Area 
} from 'recharts';
import { cn } from '../../lib/utils.ts';

export const Forecasting = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: budgets, isLoading: isBLoading } = useBudgets(projectId);
  const { data: costs, isLoading: isCLoading } = useCosts(projectId);
  const { data: forecasts } = useForecast(projectId, budgets, costs);

  if (isBLoading || isCLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Simulating final cost projections...</p>
        </div>
      </div>
    );
  }

  // Aggregate Metrics
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const actualCost = costs.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);
  const committedCost = forecasts.reduce((sum, f) => sum + f.committedCost, 0);
  
  // Forecast Calculation: Actual + Committed = Forecast Final Cost (EAC)
  const forecastFinalCost = actualCost + committedCost;
  
  const budgetRemaining = Math.max(0, totalBudget - actualCost);
  const forecastVariance = totalBudget - forecastFinalCost;
  
  const contractValue = currentProject?.contractValue || 45000000;
  const estimatedProfit = contractValue - forecastFinalCost;

  const formatCur = (v: number) => {
    return '$' + v.toLocaleString();
  };

  // Cost Projection Curve (Cumulative spending curve model over 9 operational stages)
  const projectionCurveData = [
    { stage: 'Prelims', Baseline: totalBudget * 0.05, Actual: actualCost * 0.1, Forecast: forecastFinalCost * 0.08 },
    { stage: 'Excavation', Baseline: totalBudget * 0.12, Actual: actualCost * 0.25, Forecast: forecastFinalCost * 0.18 },
    { stage: 'Foundation', Baseline: totalBudget * 0.25, Actual: actualCost * 0.65, Forecast: forecastFinalCost * 0.35 },
    { stage: 'Substructure', Baseline: totalBudget * 0.40, Actual: actualCost, Forecast: forecastFinalCost * 0.52 },
    { stage: 'Superstructure (Mid)', Baseline: totalBudget * 0.58, Actual: null, Forecast: forecastFinalCost * 0.68 },
    { stage: 'Superstructure (Top)', Baseline: totalBudget * 0.72, Actual: null, Forecast: forecastFinalCost * 0.81 },
    { stage: 'Cladding', Baseline: totalBudget * 0.85, Actual: null, Forecast: forecastFinalCost * 0.90 },
    { stage: 'MEP Fitout', Baseline: totalBudget * 0.95, Actual: null, Forecast: forecastFinalCost * 0.96 },
    { stage: 'Handover', Baseline: totalBudget, Actual: null, Forecast: forecastFinalCost }
  ];

  return (
    <div className="space-y-6">
      {/* Forecasting KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Estimate At Completion (EAC)</p>
          <h3 className="text-xl font-black text-slate-800 mt-2">{formatCur(forecastFinalCost)}</h3>
          <p className="text-[11.5px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5 border-t border-slate-50 pt-1.5">
            <span className="font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-1 text-[9.5px]">Formula</span>
            <span>Actual ({formatCur(actualCost)}) + Committed</span>
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Committed To Completion (ETC)</p>
          <h3 className="text-xl font-black text-slate-800 mt-2">{formatCur(committedCost)}</h3>
          <p className="text-[11.5px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5 border-t border-slate-50 pt-1.5">
            <span className="font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-1 text-[9.5px]">Unbilled</span>
            <span>Forecast remaining procurement exposure</span>
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Variance At Completion (VAC)</p>
          <h3 className={cn("text-xl font-black mt-2", forecastVariance >= 0 ? "text-emerald-600" : "text-red-650")}>
            {forecastVariance >= 0 ? `+${formatCur(forecastVariance)}` : `-${formatCur(Math.abs(forecastVariance))}`}
          </h3>
          <p className="text-[11.5px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5 border-t border-slate-50 pt-1.5">
            {forecastVariance >= 0 ? (
              <span className="text-emerald-650 font-bold bg-emerald-50 px-1 py-0.5 rounded text-[9.5px]">On Track</span>
            ) : (
              <span className="text-red-700 font-black bg-red-50 px-1 py-0.5 rounded text-[9.5px]">Over Budget</span>
            )}
            <span>Projected final balance at hand</span>
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Projected Profit Margin (P/L)</p>
          <h3 className={cn("text-xl font-black mt-2", estimatedProfit >= 0 ? "text-emerald-600" : "text-red-650")}>
            {formatCur(estimatedProfit)}
          </h3>
          <p className="text-[11.5px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5 border-t border-slate-50 pt-1.5">
            <span className="font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-1 text-[9.5px]">Margin Ratio</span>
            <span>{((estimatedProfit / contractValue) * 100).toFixed(1)}% of Net Contract Value</span>
          </p>
        </div>

      </div>

      {/* cumulative S-Curve Projection chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="pb-3 border-b border-light border-dashed mb-4">
          <h4 className="font-bold text-slate-800 leading-none">Cumulative S-Curve Cost Projections</h4>
          <p className="text-[11px] text-slate-400 mt-1">Overlaying Baseline works execution milestones with actual costs vs calculated completion projection</p>
        </div>
        <div className="h-72 w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionCurveData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="stage" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: any) => formatCur(Number(v))} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="Baseline" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
              <Line type="monotone" strokeDasharray="5 5" dataKey="Forecast" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast breakdown per Category */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider">Forecasting Sheet by Category</h4>
          <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded leading-none">Live Calculators</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10.5px] uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4 font-bold">WBS Category Heading</th>
                <th className="py-3 px-4 font-bold text-right">Baseline WBS Budget</th>
                <th className="py-3 px-4 font-bold text-right">Actual Cost (Mtd)</th>
                <th className="py-3 px-4 font-bold text-right">Committed Outstanding</th>
                <th className="py-3 px-4 font-bold text-right">Forecast Final (EAC)</th>
                <th className="py-3 px-4 font-bold text-right">Variance Balance (VAC)</th>
                <th className="py-3 px-4 font-bold text-center">Estimation Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {forecasts.map((e) => {
                const isBreached = e.variance < 0;
                const isTight = e.variance >= 0 && (e.variance / e.budgetAmount) < 0.1;

                return (
                  <tr key={e.category} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 text-xs">{e.category}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-600">{formatCur(e.budgetAmount)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">{formatCur(e.actualCost)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-500">{formatCur(e.committedCost)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-850">{formatCur(e.forecastFinalCost)}</td>
                    <td className={cn(
                      "py-3 px-4 text-right font-black font-mono",
                      isBreached ? "text-red-650" : "text-emerald-700"
                    )}>
                      {isBreached ? `-${formatCur(Math.abs(e.variance))}` : `+${formatCur(e.variance)}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex justify-center">
                        {isBreached ? (
                          <span className="bg-red-50 text-red-700 border border-red-100 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase leading-none">Breached</span>
                        ) : isTight ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase leading-none">Tight Limit</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase leading-none">Secured</span>
                        )}
                      </div>
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
