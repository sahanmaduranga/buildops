import React from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { CostDashboard } from './CostDashboard.tsx';
import { BudgetManagement } from './BudgetManagement.tsx';
import { CostTracking } from './CostTracking.tsx';
import { BudgetVsActual } from './BudgetVsActual.tsx';
import { Forecasting } from './Forecasting.tsx';
import { CashFlow } from './CashFlow.tsx';
import { CostReports } from './CostReports.tsx';
import { useBudgets, useCosts, useUserRole } from './MockCostData.ts';
import { ShieldAlert } from 'lucide-react';

interface CostControlModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (id: string) => void;
}

export const CostControlModule = ({ 
  activeSubTab = 'cost-dashboard',
  setActiveSubTab 
}: CostControlModuleProps) => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';

  const { data: budgets } = useBudgets(projectId);
  const { data: costs } = useCosts(projectId);
  const { role } = useUserRole();

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-xl shadow-sm">
        <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 mb-4 border border-rose-100 italic shadow-inner">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">No Active Project Workspace Context</h2>
        <p className="text-slate-400 max-w-sm mb-4 text-xs font-semibold">Please select a project from the portfolio director directory prior to querying baseline costs or actual cash margins.</p>
      </div>
    );
  }

  // Aggregate high level numbers for top header widget
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const actualCost = costs.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);

  const renderActiveScreen = () => {
    switch (activeSubTab) {
      case 'cost-dashboard':
        return <CostDashboard />;
      case 'cost-budgets':
        return <BudgetManagement />;
      case 'cost-tracking':
        return <CostTracking />;
      case 'cost-budget-vs-actual':
        return <BudgetVsActual />;
      case 'cost-forecasting':
        return <Forecasting />;
      case 'cost-cashflow':
        return <CashFlow />;
      case 'cost-reports':
        return <CostReports />;
      default:
        return <CostDashboard />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in text-[13px] text-slate-600">
      
      {/* Module Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>💰 Cost Control & Budget Matrix</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-105 rounded-full px-2.5 py-0.5 font-extrabold tracking-normal">
              Internal Cost Ledger
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
            Consolidated WBS structures, real-time SCM actual calculations, and Earned Value EAC forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Baseline WBS</p>
            <p className="text-xs font-black text-slate-800">
              ${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currentProject.currency || 'USD'}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACWP Actual Spent</p>
            <p className="text-xs font-black text-emerald-600">
              ${actualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currentProject.currency || 'USD'}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QS Lead</p>
            <p className="text-xs font-black text-slate-700">{currentProject.qsManager || 'Robert Chen'}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Frame */}
      <div className="flex-1 min-h-0">
        {renderActiveScreen()}
      </div>

    </div>
  );
};
