import React from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { useBudgets, Budget, useCosts, useForecast } from './MockCostData.ts';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  HelpCircle,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { cn } from '../../lib/utils.ts';

export const BudgetVsActual = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: budgets, isLoading: isBgtLoading } = useBudgets(projectId);
  const { data: costs, isLoading: isCstLoading } = useCosts(projectId);
  const { data: forecasts } = useForecast(projectId, budgets, costs);

  if (isBgtLoading || isCstLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compiling variance metrics...</p>
        </div>
      </div>
    );
  }

  // Combine data per category
  const categories: Budget['category'][] = ['Materials', 'Labor', 'Equipment', 'Subcontract', 'Site Expenses', 'General Expenses'];
  
  const varianceData = categories.map(cat => {
    const catBudgets = budgets.filter(b => b.category === cat);
    const budgetValue = catBudgets.reduce((sum, b) => sum + b.amount, 0);
    const actualValue = costs.filter(c => c.category === cat && c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);
    const balance = budgetValue - actualValue;
    const consRatio = budgetValue > 0 ? (actualValue / budgetValue) * 100 : 0;

    let warningState: 'Healthy' | 'Warning' | 'OverBudget' = 'Healthy';
    if (actualValue > budgetValue) {
      warningState = 'OverBudget';
    } else if (consRatio >= 80) {
      warningState = 'Warning';
    }

    return {
      category: cat,
      budget: budgetValue,
      actual: actualValue,
      balance,
      consRatio,
      warningState
    };
  }).filter(v => v.budget > 0 || v.actual > 0);

  const formatCur = (num: number) => {
    return '$' + num.toLocaleString();
  };

  const chartData = varianceData.map(v => ({
    name: v.category,
    Budget: v.budget,
    Actual: v.actual
  }));

  return (
    <div className="space-y-6">
      {/* Visual Chart section */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h4 className="font-bold text-slate-800 border-b border-light pb-2 mb-4">Budget vs Actual Comparison Log</h4>
        <div className="h-64 text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCur(Number(v))} />
              <Legend iconType="circle" />
              <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Variance Report Panel */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Variance Allocation Breakdown</h4>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded leading-none uppercase">
            Double Check Entries Prior to Certification
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10.5px] uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4 font-bold">WBS Budget Category</th>
                <th className="py-3 px-4 font-bold text-right">Approved Budget</th>
                <th className="py-3 px-4 font-bold text-right">Actual Cost (ACWP)</th>
                <th className="py-3 px-4 font-bold text-right">Remaining Budget</th>
                <th className="py-3 px-4 font-bold text-right">Variance Balance</th>
                <th className="py-3 px-4 font-bold text-right">Expenditure Ratio</th>
                <th className="py-3 px-4 font-bold text-center">Variance Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {varianceData.map((d) => (
                <tr key={d.category} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">
                    {d.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-600">
                    {formatCur(d.budget)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-850">
                    {formatCur(d.actual)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                    {formatCur(Math.max(0, d.budget - d.actual))}
                  </td>
                  <td className={cn(
                    "py-3.5 px-4 text-right font-black font-mono",
                    d.balance < 0 ? "text-red-600" : d.warningState === "Warning" ? "text-amber-600" : "text-emerald-700"
                  )}>
                    {d.balance < 0 ? `-${formatCur(Math.abs(d.balance))}` : `+${formatCur(d.balance)}`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black font-mono">
                    {d.consRatio.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      {d.warningState === 'OverBudget' && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-150 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase">
                          <AlertTriangle size={11.5} className="text-red-650" />
                          Over Budget (Blt Breach)
                        </span>
                      )}
                      {d.warningState === 'Warning' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-150 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase">
                          <AlertTriangle size={11.5} className="text-amber-600" />
                          Warning (At Risk)
                        </span>
                      )}
                      {d.warningState === 'Healthy' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase">
                          <CheckCircle2 size={11.5} className="text-emerald-650" />
                          Healthy (Under Limit)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory Note panel */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3.5">
        <div className="p-1 text-slate-400">
          <CheckCircle2 size={18} className="text-primary-600" />
        </div>
        <div className="text-xs">
          <h5 className="font-bold text-slate-800 leading-none">WBS Integration Advisory and Mitigation Action Plans</h5>
          <p className="text-slate-500 mt-1 lines-relaxed leading-relaxed">
            Variance ratios over <strong>80%</strong> are automatically color-flagged inside the active workspace environment. For packages highlighted with <strong className="text-red-600">Over-Budget WBS Breaches</strong>, cost controllers must freeze any outgoing purchase requests inside SCM and coordinate with the Commercial Lead (<strong>Sarah Johnson</strong>) to initiate change order recovery protocols.
          </p>
        </div>
      </div>
    </div>
  );
};
