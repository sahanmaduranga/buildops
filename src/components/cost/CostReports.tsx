import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { useBudgets, useCosts, useForecast, useCashflow } from './MockCostData.ts';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  FileText, 
  BarChart3, 
  Layers,
  Archive,
  ArrowRight,
  Printer
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

type ReportType = 'budget' | 'tracking' | 'variance' | 'forecast' | 'cashflow';

export const CostReports = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: budgets } = useBudgets(projectId);
  const { data: costs } = useCosts(projectId);
  const { data: cashflow } = useCashflow(projectId);
  const { data: forecasts } = useForecast(projectId, budgets, costs);

  const [activeReport, setActiveReport] = useState<ReportType>('budget');
  const [successMsg, setSuccessMsg] = useState('');

  const formatCur = (num: number) => {
    return '$' + num.toLocaleString();
  };

  // Perform Simulated Exporters
  const handleExport = (format: 'CSV' | 'XLSX' | 'PDF') => {
    let rows: string[][] = [];
    let title = '';

    if (activeReport === 'budget') {
      title = 'Core_Baseline_Budget_WBS_W Breakdown';
      rows.push(['WBS Code', 'Budget Package Name', 'Category', 'Budget Amount (Limit)', 'Actual Spent', 'Remaining Margin']);
      budgets.forEach(b => {
        rows.push([b.code, b.name, b.category, b.amount.toString(), b.actualAmount.toString(), b.remainingAmount.toString()]);
      });
    } else if (activeReport === 'tracking') {
      title = 'Expenditure_Ledger_Actuals';
      rows.push(['Reference ID', 'Type', 'Origin Module', 'Date', 'Amount', 'Category Reference', 'Linked Document', 'Status']);
      costs.forEach(c => {
        rows.push([c.reference, c.costType, c.sourceModule, c.date, c.amount.toString(), c.category, c.linkedDoc, c.status]);
      });
    } else if (activeReport === 'variance') {
      title = 'WBS_Budget_vs_Actual_Variance';
      rows.push(['WBS Category Heading', 'Approved Budget', 'Actual Cost (ACWP)', 'Remaining', 'Variance Balance', 'Consumption Ratio']);
      forecasts.forEach(f => {
        const ratio = f.budgetAmount > 0 ? (f.actualCost / f.budgetAmount) * 100 : 0;
        rows.push([f.category, f.budgetAmount.toString(), f.actualCost.toString(), (f.budgetAmount - f.actualCost).toString(), f.variance.toString(), `${ratio.toFixed(1)}%`]);
      });
    } else if (activeReport === 'forecast') {
      title = 'Project_EAC_Cost_Forecasting';
      rows.push(['WBS Category', 'Baseline Budget', 'Actual Cost', 'Committed Outstanding', 'Forecast EAC', 'Variance at Completion (VAC)']);
      forecasts.forEach(f => {
        rows.push([f.category, f.budgetAmount.toString(), f.actualCost.toString(), f.committedCost.toString(), f.forecastFinalCost.toString(), f.variance.toString()]);
      });
    } else {
      title = 'Consolidated_Project_Monthly_Cashflow';
      rows.push(['Month', 'Inflow Receipts', 'Outflow Expenses', 'Monthly Balance', 'Cumulative Balance']);
      let cum = 0;
      cashflow.forEach(cf => {
        cum += cf.balance;
        rows.push([cf.month, cf.inflow.toString(), cf.outflow.toString(), cf.balance.toString(), cum.toString()]);
      });
    }

    if (format === 'CSV') {
      const csvStr = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvStr));
      link.setAttribute("download", `BuildOps_${title}_Export.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setSuccessMsg(`Successfully generated and dispatched project ${activeReport.toUpperCase()} report in ${format} format!`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const reportsList = [
    { id: 'budget', name: 'WBS Baseline Budget Report', desc: 'Detailed breakdown of active allocations, actual usage, and revised baseline limits.', icon: FileSpreadsheet },
    { id: 'tracking', name: 'Actual Cost (ACWP) Ledger', desc: 'Voucher list of procurement purchase orders, SCM material issues, and IPC billings.', icon: FileText },
    { id: 'variance', name: 'Budget vs Actual Matrix', desc: 'Core structural variance auditing, consumption rates, and over-budget alert status.', icon: BarChart3 },
    { id: 'forecast', name: 'EAC Forecasting & EAC Sheets', desc: 'Calculated projections, committed outstanding orders, and profit margin models.', icon: Layers },
    { id: 'cashflow', name: 'Liquidity & Cash Flow Schedule', desc: 'Month-by-month cash inflow billing, actual outflow payments, and running liquid balance.', icon: Printer }
  ];

  const currentReportObj = reportsList.find(r => r.id === activeReport);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar selection */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 leading-none">Cost Control Master Directory</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Toggle and compile clean, audited enterprise financial worksheets formatted for administrative review.</p>
        </div>

        <div className="space-y-2.5">
          {reportsList.map(item => {
            const Icon = item.icon;
            const isSel = item.id === activeReport;

            return (
              <div 
                key={item.id}
                onClick={() => setActiveReport(item.id as ReportType)}
                className={cn(
                  "p-3.5 border rounded-xl hover:border-slate-300 transition-all cursor-pointer flex gap-3 group relative overflow-hidden",
                  isSel ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white border-slate-100'
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center", 
                  isSel ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400 group-hover:text-primary-600"
                )}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs leading-none">{item.name}</h5>
                  <p className={cn("text-[10.5px] mt-1.5 leading-relaxed", 
                    isSel ? "text-primary-100/90" : "text-slate-400"
                  )}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Preview */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-inner">
            <CheckCircle size={15} />
            {successMsg}
          </div>
        )}

        {/* Display Sheet */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] bg-primary-600 text-white font-extrabold px-1.5 py-0.5 rounded leading-none uppercase">ERP Live Preview</span>
                <h4 className="font-bold text-slate-800 text-xs mt-1.5 uppercase tracking-wider">{currentReportObj?.name}</h4>
              </div>
              
              {/* Exporters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('CSV')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-slate-600 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <Download size={12} />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('XLSX')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-slate-600 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <Download size={12} />
                  Excel
                </button>
                <button
                  onClick={() => handleExport('PDF')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-slate-600 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <Download size={12} />
                  PDF
                </button>
              </div>
            </div>

            {/* Simulated Data Grid */}
            <div className="p-1 overflow-x-auto">
              
              {activeReport === 'budget' && (
                <table className="w-full text-left text-[11.5px] font-medium text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-wider text-slate-400">
                      <th className="py-2.5 px-4">WBS Code</th>
                      <th className="py-2.5 px-4">Budget Package Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4 text-right">Budget Limit</th>
                      <th className="py-2.5 px-4 text-right">Actual Spent</th>
                      <th className="py-2.5 px-4 text-right">Balance Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {budgets.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{b.code}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-700">{b.name}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-550">{b.category}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatCur(b.amount)}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-700">{formatCur(b.actualAmount)}</td>
                        <td className="py-2.5 px-4 text-right font-black font-semibold text-emerald-700">{formatCur(b.remainingAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === 'tracking' && (
                <table className="w-full text-left text-[11.5px] font-medium text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-wider text-slate-400">
                      <th className="py-2.5 px-4">Reference</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Module</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {costs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{c.reference}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-700">{c.costType}</td>
                        <td className="py-2.5 px-4 text-slate-550">{c.sourceModule}</td>
                        <td className="py-2.5 px-4 font-mono">{c.date}</td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-850">{formatCur(c.amount)}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-750">{c.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === 'variance' && (
                <table className="w-full text-left text-[11.5px] font-medium text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-wider text-slate-400">
                      <th className="py-2.5 px-4">Category Heading</th>
                      <th className="py-2.5 px-4 text-right">Approved Budget</th>
                      <th className="py-2.5 px-4 text-right">Actual Cost (Mtd)</th>
                      <th className="py-2.5 px-4 text-right">Balance Margin</th>
                      <th className="py-2.5 px-4 text-right">Consumed Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forecasts.map(f => {
                      const ratio = f.budgetAmount > 0 ? (f.actualCost / f.budgetAmount) * 100 : 0;
                      return (
                        <tr key={f.category} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-800">{f.category}</td>
                          <td className="py-2.5 px-4 text-right font-bold">{formatCur(f.budgetAmount)}</td>
                          <td className="py-2.5 px-4 text-right font-black text-slate-850">{formatCur(f.actualCost)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-700">{formatCur(f.budgetAmount - f.actualCost)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">{ratio.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeReport === 'forecast' && (
                <table className="w-full text-left text-[11.5px] font-medium text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-wider text-slate-400">
                      <th className="py-2.5 px-4">WBS Category</th>
                      <th className="py-2.5 px-4 text-right">WBS Budget</th>
                      <th className="py-2.5 px-4 text-right">Actual Spent</th>
                      <th className="py-2.5 px-4 text-right">Committed ETC</th>
                      <th className="py-2.5 px-4 text-right">Forecast EAC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forecasts.map(f => (
                      <tr key={f.category} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{f.category}</td>
                        <td className="py-2.5 px-4 text-right font-bold">{formatCur(f.budgetAmount)}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-700">{formatCur(f.actualCost)}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-500">{formatCur(f.committedCost)}</td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-850">{formatCur(f.forecastFinalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === 'cashflow' && (
                <table className="w-full text-left text-[11.5px] font-medium text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-wider text-slate-400">
                      <th className="py-2.5 px-4">Month</th>
                      <th className="py-2.5 px-4 text-right">Inflow Receipts</th>
                      <th className="py-2.5 px-4 text-right">Outflow Expenses</th>
                      <th className="py-2.5 px-4 text-right">Net Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono font-semibold">
                    {cashflow.map(cf => (
                      <tr key={cf.month} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-slate-800 font-bold">{cf.month}</td>
                        <td className="py-2.5 px-4 text-right text-blue-650">{formatCur(cf.inflow)}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-650">{formatCur(cf.outflow)}</td>
                        <td className={cn("py-2.5 px-4 text-right font-bold", cf.balance >= 0 ? "text-emerald-700" : "text-rose-650")}>
                          {cf.balance >= 0 ? `+${formatCur(cf.balance)}` : `-${formatCur(Math.abs(cf.balance))}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </div>
          
          {/* Bottom sign off */}
          <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 p-3 flex justify-between items-center text-[10.5px] font-bold text-slate-400 font-mono">
            <span>AUDITED BY USER ROLE: {currentProject?.qsManager || 'Robert Chen'}</span>
            <span>SYSTEM COMPILED ON {new Date().toLocaleDateString()}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
