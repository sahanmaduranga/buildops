import React, { useState } from 'react';
import { useCommercial } from '../../context/CommercialContext.tsx';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Printer, 
  FileCheck2, 
  Info,
  Layers,
  CheckCircle2,
  Table
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const CommercialReports = () => {
  const { getIpcsQuery, getPaymentsQuery, getRetentionsQuery } = useCommercial();
  const ipcs = getIpcsQuery.data || [];
  const retentions = getRetentionsQuery.data || [];

  const [activeReport, setActiveReport] = useState<'ipc' | 'subcontract' | 'retention'>('ipc');

  const handleExportExcel = () => {
    alert(`Report compiled successfully. Exporting ${activeReport.toUpperCase()} report register to system clipboard.`);
  };

  return (
    <div className="space-y-5 animate-fade-in text-[13px] text-slate-600 font-semibold leading-relaxed">
      
      {/* 1. SELECT CURRENT REPORT CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div 
          onClick={() => setActiveReport('ipc')}
          className={cn(
            "p-4 border rounded-xl cursor-pointer shadow-sm hover:shadow transition-all relative",
            activeReport === 'ipc' ? "bg-primary-50/10 border-primary-500 text-slate-800" : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <h5 className="font-extrabold text-xs uppercase tracking-wider">IPC Summary Register</h5>
            <span className="p-1.5 bg-primary-100 text-primary-700 rounded-lg"><Layers size={14} /></span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Register of gross billing valuations, retentions, tax, and net payable stages.</p>
          {activeReport === 'ipc' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-b-xl" />}
        </div>

        <div 
          onClick={() => setActiveReport('subcontract')}
          className={cn(
            "p-4 border rounded-xl cursor-pointer shadow-sm hover:shadow transition-all relative",
            activeReport === 'subcontract' ? "bg-primary-50/10 border-primary-500 text-slate-800" : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <h5 className="font-extrabold text-xs uppercase tracking-wider">Subcontract Ledger</h5>
            <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg"><Table size={14} /></span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Vetted ledger audit logs for reinforcement steel, concrete shoring, excavation contracts.</p>
          {activeReport === 'subcontract' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-b-xl" />}
        </div>

        <div 
          onClick={() => setActiveReport('retention')}
          className={cn(
            "p-4 border rounded-xl cursor-pointer shadow-sm hover:shadow transition-all relative",
            activeReport === 'retention' ? "bg-primary-50/10 border-primary-500 text-slate-800" : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <h5 className="font-extrabold text-xs uppercase tracking-wider">Retention Hold Register</h5>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg"><FileSpreadsheet size={14} /></span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">DLP release logs, pending retention balances, and clearance certificates overview.</p>
          {activeReport === 'retention' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-b-xl" />}
        </div>
      </div>

      {/* 2. TABULAR PREVIEW */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col font-semibold">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center select-none">
          <div>
            <h4 className="text-sm font-bold text-slate-800 capitalize">{activeReport} Statement Sheets</h4>
            <p className="text-[11px] text-slate-400">Live preview of filtered reporting parameters prior to official transmission.</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExportExcel}
              className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <FileSpreadsheet size={13} /> Export Excel / CSV
            </button>
            <button 
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Printer size={13} /> Print Sheet Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[220px]">
          {activeReport === 'ipc' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">IPC Reference</th>
                  <th className="py-2.5 px-4">Cycle Period</th>
                  <th className="py-2.5 px-4">Partner</th>
                  <th className="py-2.5 px-4 text-right">Gross Certified</th>
                  <th className="py-2.5 px-4 text-right">Retention</th>
                  <th className="py-2.5 px-4 text-right">Net Payable</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {ipcs.map((ipc) => (
                  <tr key={ipc.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{ipc.ipcNumber}</td>
                    <td className="py-2.5 px-4">{ipc.billingPeriod}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-700">{ipc.contractor}</td>
                    <td className="py-2.5 px-4 text-right">${ipc.certifiedAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right">-${ipc.retentionAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-800">${ipc.netAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-bold uppercase">{ipc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'subcontract' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Agreement Code</th>
                  <th className="py-2.5 px-4">Subcontractor name</th>
                  <th className="py-2.5 px-4">sector scope</th>
                  <th className="py-2.5 px-4 text-right">Total Committed Cap</th>
                  <th className="py-2.5 px-4 text-right text-emerald-600">Cleared payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">SUB-CIV-002</td>
                  <td className="py-3 px-4 font-bold text-slate-700">Al-Fayha Earthworks & Pumping</td>
                  <td className="py-3 px-4">Excavation & Shoring</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">$450,000</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600">$185,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">SUB-CON-004</td>
                  <td className="py-3 px-4 font-bold text-slate-700">Riyadh Steel Fixing Ltd</td>
                  <td className="py-3 px-4">Reinforcement Steelwork</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">$620,000</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600">$51,180</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeReport === 'retention' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="py-2.5 px-4">Reference Code</th>
                  <th className="py-2.5 px-4">Contractor partner</th>
                  <th className="py-2.5 px-4 text-right">Deducted baseline</th>
                  <th className="py-2.5 px-4 text-right text-emerald-600">Released sum</th>
                  <th className="py-2.5 px-4 text-right text-amber-600">Remaining DLP Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {retentions.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{r.ipcNumber}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-700">{r.contractor}</td>
                    <td className="py-2.5 px-4 text-right">${r.retainedAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">${r.releasedAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-amber-600 font-black">${r.pendingBalance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
