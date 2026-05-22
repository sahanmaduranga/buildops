import React from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  useBudgets, 
  useCosts, 
  useCashflow, 
  useForecast,
  useUserRole,
  Budget,
  CostItem
} from './MockCostData.ts';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock, 
  CheckCircle2,
  FileText,
  Briefcase,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart,
  Bar, 
  Line, 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';

export const CostDashboard = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: budgets, isLoading: isBudgetsLoading } = useBudgets(projectId);
  const { data: costs, isLoading: isCostsLoading } = useCosts(projectId);
  const { data: cashflow } = useCashflow(projectId);
  const { data: forecasts } = useForecast(projectId, budgets, costs);
  const { role } = useUserRole();

  if (isBudgetsLoading || isCostsLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing Ledger...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // METRIC CALCULATIONS
  // ==========================================
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const actualCost = costs.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);
  const remainingBudget = Math.max(0, totalBudget - actualCost);
  
  // Committed cost is calculated per forecast (unbilled PO values, site orders, etc.)
  const committedCost = forecasts.reduce((sum, f) => sum + f.committedCost, 0);
  const forecastFinalCost = actualCost + committedCost;
  const budgetVariance = totalBudget - forecastFinalCost;
  const variancePercent = totalBudget > 0 ? (budgetVariance / totalBudget) * 100 : 0;

  // Profitability
  const contractValue = currentProject?.contractValue || 45000000;
  const estimatedProfit = contractValue - forecastFinalCost;
  const profitMarginPercent = contractValue > 0 ? (estimatedProfit / contractValue) * 100 : 0;

  // Cash Flow summary
  const totalInflow = cashflow.reduce((sum, cf) => sum + cf.inflow, 0);
  const totalOutflow = cashflow.reduce((sum, cf) => sum + cf.outflow, 0);
  const cashPosition = totalInflow - totalOutflow;

  // Widget: Over Budget Items
  const overBudgetItems = budgets.filter(b => b.actualAmount > b.amount);
  const warningBudgetItems = budgets.filter(b => b.actualAmount > b.amount * 0.8 && b.actualAmount <= b.amount);

  // Widget: Procurement Exposure (Approved PO cost ratio)
  const poCosts = costs.filter(c => c.costType === 'Purchase Order' && c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);
  const prCosts = costs.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);

  // Widget: Recent Activities
  const recentActivities = costs.slice(0, 4);

  // Widget: Pending approvals
  const pendingApprovals = costs.filter(c => c.status === 'Pending');

  // Helper formatting
  const formatCur = (v: number) => {
    return '$' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  // KPI render block
  const renderKpi = (title: string, val: string, sub: string, trendVal: string, isTrendGood: boolean, icon: any, col: string) => {
    const Icon = icon;
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">{title}</p>
          <div className={cn("p-2 rounded-lg text-white", col)}>
            <Icon size={14} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight mt-2">{val}</h3>
        <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
          <span className={cn("font-bold px-1.5 py-0.5 rounded text-[9px] leading-none", 
            isTrendGood ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trendVal}
          </span>
          <span className="truncate">{sub}</span>
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-primary-500 transition-colors" />
      </div>
    );
  };

  // Recharts Chart Formats
  const chartBudgetVsActual = forecasts.map(f => ({
    name: f.category.substring(0, 10),
    Budget: f.budgetAmount,
    Actual: f.actualCost,
    Committed: f.committedCost
  }));

  const cashFlowTrendData = cashflow.map(cf => ({
    name: cf.month,
    Inflow: cf.inflow,
    Outflow: cf.outflow,
    Balance: cf.balance
  }));

  const costDistData = forecasts.map(f => ({
    name: f.category,
    value: f.actualCost
  })).filter(item => item.value > 0);

  const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

  return (
    <div className="space-y-6">
      {/* 1. TOP FINANCIAL KPI EXECUTIVE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpi(
          "Total Baseline Budget", 
          formatCur(totalBudget), 
          "Consolidated work breakdown budget", 
          "±0%", 
          true, 
          Briefcase, 
          "bg-slate-700"
        )}
        
        {renderKpi(
          "Actual Cost (ACWP)", 
          formatCur(actualCost), 
          `Processed invoices (${((actualCost / (totalBudget || 1)) * 100).toFixed(1)}% spent)`, 
          `-${(actualCost / 1000000).toFixed(1)}M`, 
          false, 
          DollarSign, 
          "bg-emerald-600"
        )}

        {renderKpi(
          "Remaining Budget", 
          formatCur(remainingBudget), 
          "Current uncommitted cash balance", 
          `${((remainingBudget / (totalBudget || 1)) * 100).toFixed(0)}% Left`, 
          true, 
          Clock, 
          "bg-sky-500"
        )}

        {renderKpi(
          "Committed Costs", 
          formatCur(committedCost), 
          "Outstanding POs & signed subcontracts", 
          "On-Order", 
          true, 
          FileText, 
          "bg-indigo-500"
        )}

        {renderKpi(
          "Budget Variance", 
          formatCur(budgetVariance), 
          `At-Completion (VAC) assessment`, 
          variancePercent >= 0 ? `+${variancePercent.toFixed(1)}%` : `${variancePercent.toFixed(1)}%`, 
          budgetVariance >= 0, 
          ShieldAlert, 
          budgetVariance >= 0 ? "bg-emerald-650" : "bg-rose-600"
        )}

        {renderKpi(
          "Forecast Final Cost (EAC)", 
          formatCur(forecastFinalCost), 
          "Total simulated final project cost", 
          "Calculated", 
          budgetVariance >= 0, 
          TrendingUp, 
          "bg-amber-500"
        )}

        {renderKpi(
          "Estimated Margins (P/L)", 
          formatCur(estimatedProfit), 
          `Projected profit margin (${profitMarginPercent.toFixed(1)}%)`, 
          profitMarginPercent > 10 ? "Optimal" : "Target: 15%", 
          estimatedProfit > 0, 
          CheckCircle2, 
          estimatedProfit > 0 ? "bg-emerald-600" : "bg-rose-600"
        )}

        {renderKpi(
          "Consolidated Cash Balance", 
          formatCur(cashPosition), 
          `Inflow: ${formatCur(totalInflow)}`, 
          "Ready Cash", 
          cashPosition >= 0, 
          DollarSign, 
          cashPosition >= 0 ? "bg-blue-600" : "bg-orange-500"
        )}
      </div>

      {/* 2. FINANCIAL CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Budget vs Actual by Category */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-light border-dashed pb-3 mb-4">
            <div>
              <h4 className="font-bold text-slate-800 leading-none">Budget vs Actual vs Committed</h4>
              <p className="text-[11px] text-slate-400 mt-1">Allocation analysis across critical cost headings</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded">
              Current Project Level
            </span>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartBudgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCur(Number(v))} contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="Committed" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-light border-dashed pb-3 mb-4">
            <div>
              <h4 className="font-bold text-slate-800 leading-none">Actual Cost Share</h4>
              <p className="text-[11px] text-slate-400 mt-1">Expenses distributed by category</p>
            </div>
          </div>
          <div className="h-60 w-full relative">
            {costDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {costDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCur(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs italic">
                No actual costs allocated yet
              </div>
            )}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-none">Actuals</p>
              <p className="text-sm font-black text-slate-800 mt-1">{formatCur(actualCost)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
            {costDistData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10.5px] font-bold text-slate-600 truncate">{item.name}</span>
                <span className="text-[10.5px] text-slate-400 font-semibold shrink-0 ml-auto">
                  {((item.value / (actualCost || 1)) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Balance Trend Area */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-12">
          <div className="flex items-center justify-between border-b border-light border-dashed pb-3 mb-4">
            <div>
              <h4 className="font-bold text-slate-800 leading-none">Project Cash Flow Dynamic</h4>
              <p className="text-[11px] text-slate-400 mt-1">Monthly Inflows vs Outflows matching payment receipts</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Outflow
              </span>
            </div>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowTrendData}>
                <defs>
                  <linearGradient id="colInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCur(Number(v))} />
                <Area type="monotone" dataKey="Inflow" stroke="#3b82f6" fillOpacity={1} fill="url(#colInflow)" strokeWidth={2} />
                <Area type="monotone" dataKey="Outflow" stroke="#10b981" fillOpacity={1} fill="url(#colOutflow)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. WIDGETS ROW: RECENT ACTIVITIES, PENDING APPROVALS, OVER BUDGET ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Alerts widget and over-budget list */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h4 className="font-bold text-slate-800 border-b border-light pb-2 mb-3 h-7 flex items-center justify-between">
            <span>⚠️ Over-Budget & Risk Alerts</span>
            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-black">
              {overBudgetItems.length + warningBudgetItems.length} Flagged
            </span>
          </h4>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
            {overBudgetItems.map(item => (
              <div key={item.id} className="p-3 bg-red-50/70 border border-red-100 rounded-xl flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-800 text-xs truncate">{item.name}</h5>
                  <p className="text-[10.5px] text-red-700/85 mt-0.5 font-semibold">
                    Spent: <strong className="font-bold">{formatCur(item.actualAmount)}</strong> exceeds budget by {formatCur(item.actualAmount - item.amount)}!
                  </p>
                  <span className="text-[9px] bg-red-100 text-red-800 px-1 py-0.5 font-bold rounded mt-1.5 inline-block uppercase">Critical Core Limit Breach</span>
                </div>
              </div>
            ))}
            
            {warningBudgetItems.map(item => (
              <div key={item.id} className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-800 text-xs truncate">{item.name}</h5>
                  <p className="text-[10.5px] text-amber-700 mt-0.5 font-semibold">
                    Spent has reached <strong className="font-bold">{((item.actualAmount / item.amount) * 100).toFixed(0)}%</strong> of {formatCur(item.amount)} limit.
                  </p>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 font-bold rounded mt-1.5 inline-block uppercase">Approaching Ceiling</span>
                </div>
              </div>
            ))}

            {overBudgetItems.length === 0 && warningBudgetItems.length === 0 && (
              <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xs font-bold text-slate-600 uppercase">All parameters healthy</p>
                <p className="text-[11px] mt-1 max-w-[190px]">Budget codes are currently operating within structural ceilings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent actual cost actions */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h4 className="font-bold text-slate-800 border-b border-light pb-2 mb-3 h-7 flex items-center justify-between">
            <span>Recent Cost Allocations</span>
            <span className="text-xs text-slate-400 font-bold hover:underline cursor-pointer">View Ledger →</span>
          </h4>
          <div className="space-y-3 flex-1">
            {recentActivities.map(act => (
              <div key={act.id} className="flex justify-between items-center bg-slate-50/70 border border-slate-100 p-2.5 rounded-lg group hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 rounded leading-none uppercase">
                      {act.sourceModule}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-semibold">{act.date}</span>
                  </div>
                  <h5 className="font-bold text-slate-700 text-xs truncate mt-1">{act.reference}</h5>
                  <p className="text-[10.5px] text-slate-400 font-medium truncate mt-0.5">Category: {act.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-slate-850 block">{formatCur(act.amount)}</span>
                  <span className={cn("text-[9px] font-bold uppercase", 
                    act.status === 'Approved' ? 'text-emerald-600' : 'text-amber-500'
                  )}>{act.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending approvals Widget & Procurement exposure */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h4 className="font-bold text-slate-800 border-b border-light pb-2 mb-3 h-7 flex items-center justify-between">
            <span>Pending Approvals & Exposure</span>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-1.5 rounded uppercase font-black text-[9px]">
              RBAC Role: {role}
            </span>
          </h4>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
            {/* Quick Procurement Exposure Meter */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-4">
              <h5 className="text-xs font-bold text-indigo-900 leading-none mb-2">SCM Procurement Exposure</h5>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                <div className="bg-indigo-600 h-2" style={{ width: `${(poCosts / (totalBudget || 1)) * 100}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-indigo-800 font-semibold mt-1.5">
                <span>POs Placed: {formatCur(poCosts)}</span>
                <span>{((poCosts / (totalBudget || 1)) * 100).toFixed(0)}% Exposure</span>
              </div>
            </div>

            {pendingApprovals.map(cf => (
              <div key={cf.id} className="p-3 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
                <div className="flex justify-between hover:bg-slate-50">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-primary-600 leading-none">{cf.costType}</span>
                    <h5 className="font-bold text-slate-800 text-xs mt-1">{cf.reference}</h5>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Category: {cf.category} • Doc: {cf.linkedDoc}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600 text-xs block">{formatCur(cf.amount)}</span>
                    <button className="text-[10px] bg-primary-600 hover:bg-primary-700 text-white font-bold py-1 px-2.5 rounded mt-1 cursor-pointer shadow-sm">
                      Approve →
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400">
                <span className="text-xs font-bold text-slate-650 uppercase">Approvals current</span>
                <p className="text-[11px] mt-1 max-w-[190px]">All committed procurement requisitions are cleared.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
