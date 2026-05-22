import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Layers, 
  Calendar, 
  TrendingUp, 
  FileSpreadsheet,
  CheckCircle2,
  FileBadge2,
  Lock,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { type RateAnalysis, type Resource, ResourceType } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface ReportsViewProps {
  analyses: RateAnalysis[];
  resources: Resource[];
}

export const ReportsView = ({ analyses, resources }: ReportsViewProps) => {
  const [selectedReportType, setSelectedReportType] = useState<'summary' | 'detailed' | 'resources'>('summary');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'concrete' | 'masonry' | 'earth'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const reportOptions = [
    { id: 'summary', title: 'Rate Analysis Summary Report', desc: 'Overview of all active unit rates, category codes, and certified net prices.' },
    { id: 'detailed', title: 'Detailed Rate Analysis Ledger', desc: 'Granular drill-down highlighting individual material, labor, and equipment coefficients.' },
    { id: 'resources', title: 'Resource Allocation and Contribution', desc: 'Aggregated list of master resources and their relative utilization weights.' }
  ];

  const handleExportSimulated = (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report exported successfully! Completed compiling ${selectedReportType === 'summary' ? 'Summary' : 'Detailed'} report in .${format === 'pdf' ? 'pdf' : 'xlsx'} format.`);
    }, 1200);
  };

  const handlePrintSimulated = () => {
    alert('Report compiled in print-friendly format! Initializing browser system print loop.');
  };

  // Process data based on selection for the preview screen.
  const filteredAnalyses = analyses.filter(a => selectedCategory === 'all' || a.categoryId === selectedCategory);

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zentrix-blue tracking-tight leading-none">Quantity Survey Reports Generator</h3>
          <p className="text-[11px] text-slate-400 mt-1">Compile and print compliant certified rate estimations formats, ledger revisions, and aggregate resource indices.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrintSimulated}
            className="px-3 py-1.75 border border-slate-205 hover:border-slate-355 rounded-lg bg-white font-bold text-xs flex items-center gap-1.5 cursor-pointer leading-none hover:bg-slate-50 transition-all text-slate-655"
          >
            <Printer size={13} /> Print-friendly Layout
          </button>
        </div>
      </div>

      {/* FILTER CONTROLLER BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Side: Selecting Report type */}
        <div className="space-y-3.5 col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Select Report Type</span>
          <div className="space-y-2.5">
            {reportOptions.map((opt) => {
              const active = selectedReportType === opt.id;
              return (
                <div 
                  key={opt.id} 
                  onClick={() => setSelectedReportType(opt.id as any)}
                  className={cn(
                    "bg-white border rounded-xl p-4 shadow-xs transition-all cursor-pointer hover:shadow-md",
                    active 
                      ? "border-primary-520 ring-1 ring-primary-500 bg-primary-50/10" 
                      : "border-zentrix-border hover:border-slate-355"
                  )}
                >
                  <h4 className={cn("font-bold text-[13px]", active ? "text-primary-600" : "text-zentrix-blue")}>{opt.title}</h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-normal">{opt.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm space-y-3 pt-3">
            <span className="text-[10.5px] font-black uppercase tracking-widest text-[#F97316] block border-b border-dashed border-slate-100 pb-2">Report Constraints</span>
            
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-zinc-400 font-extrabold block">Category Subset:</label>
              <select 
                value={selectedCategory} 
                onChange={(e: any) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2 text-xs rounded-lg font-bold text-zentrix-blue outline-none cursor-pointer"
              >
                <option value="all">All Category Subsets</option>
                <option value="concrete">Concrete Works</option>
                <option value="masonry">Masonry Works</option>
                <option value="earth">Earth Works</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => handleExportSimulated('pdf')}
                disabled={isExporting}
                className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:bg-black leading-none transition-all disabled:opacity-40"
              >
                <Download size={12} /> Expose PDF
              </button>
              <button 
                onClick={() => handleExportSimulated('excel')}
                disabled={isExporting}
                className="flex-1 py-2 border border-slate-200 text-slate-655 hover:border-slate-355 bg-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm leading-none transition-all disabled:opacity-40"
              >
                <FileSpreadsheet size={12} className="text-emerald-500" /> Excel Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Print/Report Preview Container */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Document Live Preview</span>
              <h4 className="font-extrabold text-zentrix-blue text-[13.5px] mt-0.5">BuildOps Quantity Survey Ledger</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Page 1 of 1</span>
          </div>

          {/* REPORT SHEET BOX */}
          <div className="border border-slate-150 rounded-xl bg-slate-50/15 p-6 space-y-6 shadow-inner font-mono text-slate-700 select-none">
            
            {/* Header meta */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <h3 className="font-extrabold text-[#2563EB] text-[15px] block">BUILDOPS QUANTITY SURVEY REPORT</h3>
              <p className="text-[10.5px] text-zinc-400">Riyadh Central Project Workspace Sub-Ledger</p>
              <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString()} • Compiled By: Robert Chen (Senior QS)</p>
            </div>

            {selectedReportType === 'summary' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#F97316] uppercase pb-1 border-b border-dashed border-slate-200">Rate Summary Grid Matrix</div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-400">
                      <th className="pb-1 text-left">CODE</th>
                      <th className="pb-1 text-left">DESCRIPTION</th>
                      <th className="pb-1 text-center">UNIT</th>
                      <th className="pb-1 text-right">CERTIFIED RATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAnalyses.map(a => (
                      <tr key={a.id} className="py-2 inline-table w-full">
                        <td className="py-2 text-[#2563EB] font-bold text-left">{a.code}</td>
                        <td className="py-2 text-slate-600 text-left truncate max-w-[190px]">{a.description}</td>
                        <td className="py-2 text-center text-slate-500 uppercase">{a.unit}</td>
                        <td className="py-2 text-right text-zentrix-blue font-bold">${a.finalRate.toFixed(2)}</td>
                      </tr>
                    ))}
                    {filteredAnalyses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center italic text-slate-400">No matching items for selected constraints.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReportType === 'detailed' && (
              <div className="space-y-5">
                <div className="text-xs font-bold text-[#F97316] uppercase pb-1 border-b border-dashed border-slate-200">Granular Row Coefficients</div>
                
                {filteredAnalyses.slice(0, 2).map(a => (
                  <div key={a.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center text-xs font-bold bg-slate-50 p-1 rounded">
                      <span className="text-[#2563EB]">{a.code} - {a.description}</span>
                      <span className="text-slate-800">${a.finalRate.toFixed(2)} / {a.unit}</span>
                    </div>

                    <table className="w-full text-left border-collapse text-[10.5px]">
                      <thead>
                        <tr className="border-b border-slate-200 font-bold text-slate-400">
                          <th className="pb-1">Resource</th>
                          <th className="pb-1 text-center">Type</th>
                          <th className="pb-1 text-right">Coefficient Qty</th>
                          <th className="pb-1 text-right">Direct Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {a.resources.map(r => (
                          <tr key={r.id}>
                            <td className="py-1 text-slate-700 font-semibold">{r.resourceName}</td>
                            <td className="py-1 text-center text-[9px] uppercase font-bold text-zinc-400">{r.resourceType}</td>
                            <td className="py-1 text-right tabular-nums">{r.quantity} {r.unit}</td>
                            <td className="py-1 text-right font-bold text-zentrix-blue">${(r.quantity * r.rate).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {selectedReportType === 'resources' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#F97316] uppercase pb-1 border-b border-dashed border-slate-200">Allocated Master Resources List</div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-400">
                      <th className="pb-1">RESOURCE CODE</th>
                      <th className="pb-1">NAME</th>
                      <th className="pb-1 text-center">TYPE</th>
                      <th className="pb-1 text-right">CATALOGUE BASE RATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map(r => (
                      <tr key={r.id}>
                        <td className="py-1.5 font-bold font-mono text-zinc-400 text-left">{r.code}</td>
                        <td className="py-1.5 text-slate-700 font-bold text-left">{r.name}</td>
                        <td className="py-1.5 text-center">
                          <span className="text-[10px] bg-slate-100 px-1 py-0.2 rounded font-black">{r.type}</span>
                        </td>
                        <td className="py-1.5 text-right font-bold text-zentrix-blue">${r.baseRate.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Stamp footer */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-205 flex justify-between items-center text-[10px] text-slate-400">
              <span>BuildOps Enterprise Compliance Code Matrix Certified</span>
              <span className="font-extrabold uppercase text-[#10B981] pb-1 border border-emerald-300 px-2 rounded">Verified Baseline</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
