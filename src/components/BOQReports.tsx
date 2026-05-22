import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart4, 
  CheckSquare, 
  Eye, 
  ShieldAlert,
  Loader,
  TrendingUp,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';
import { useBOQ } from '../context/BOQContext.tsx';
import { formatCurrency } from '../lib/utils.ts';

type ReportMeta = {
  id: string;
  title: string;
  description: string;
  category: 'Estimates' | 'Resources' | 'Auditing' | 'Contracts';
  suggestedFormat: 'PDF' | 'XLSX' | 'CSV';
  popularity: string;
};

export const BOQReports = () => {
  const { boqs } = useBOQ();
  const [runningId, setRunningId] = useState<string | null>(null);

  const reportsList: ReportMeta[] = [
    { id: 'rep-1', title: 'Grand Commercial Summary Report', description: 'Collapsible itemized summary containing bill-wise totals, contingency allocation, taxes, and grand totals for contract baselines.', category: 'Estimates', suggestedFormat: 'PDF', popularity: 'High (QS baseline)' },
    { id: 'rep-2', title: 'Detailed Construction BOQ Schedule', description: 'Comprehensive schedule itemizing all raw quantities, units, final recalculated unit rates, and remarks.', category: 'Estimates', suggestedFormat: 'XLSX', popularity: 'Senior Executive' },
    { id: 'rep-3', title: 'Consolidated Resource Allocation Report', description: 'Breaks down active BOQs into aggregate Material, Labor, and Equipment quantities. Extremely helpful for procurement forecasting.', category: 'Resources', suggestedFormat: 'XLSX', popularity: 'Procurement PM' },
    { id: 'rep-4', title: 'Audit Trail & Revision Comparison Report', description: 'Side-by-side quantities delta logs showing exact modifications, cost variance percentages, and surveyor explanations.', category: 'Auditing', suggestedFormat: 'PDF', popularity: 'Commercial Auditor' },
    { id: 'rep-5', title: 'Unit Rate Analysis Grid compilation', description: 'Combines linked item rates back into primary productivity factors, base material cost and regional labor indexes.', category: 'Auditing', suggestedFormat: 'CSV', popularity: 'Standard' }
  ];

  const handleGenerate = (id: string, format: string) => {
    setRunningId(id);
    setTimeout(() => {
      setRunningId(null);
      alert(`Successfully compiled and downloaded "${reportsList.find(r => r.id === id)?.title}" in ${format} format!`);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-zentrix-blue">Commercial & Estimating Reports</h3>
        <p className="text-[11px] text-slate-400">Generate, compile, and print legal submittals, spreadsheet templates, and audit logs for clients and general contractors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((report) => (
          <div key={report.id} className="border border-slate-200 hover:border-slate-350 bg-slate-50/40 hover:bg-white rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-primary-50 text-primary-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-primary-100">
                  {report.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Used by: <span className="font-semibold text-slate-600">{report.popularity}</span></span>
              </div>
              <h4 className="font-bold text-zentrix-blue text-sm">{report.title}</h4>
              <p className="text-[12px] text-slate-500 leading-relaxed">{report.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                Suggested format: <span className="text-primary-600 underline">{report.suggestedFormat}</span>
              </span>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleGenerate(report.id, 'PDF')}
                  disabled={runningId !== null}
                  className="px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {runningId === report.id ? <Loader size={12} className="animate-spin text-primary-600" /> : <Printer size={12} />} Print PDF
                </button>
                <button 
                  onClick={() => handleGenerate(report.id, 'Excel')}
                  disabled={runningId !== null}
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {runningId === report.id ? <Loader size={12} className="animate-spin" /> : <Download size={12} />} XLSX
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
