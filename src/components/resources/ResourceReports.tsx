import React, { useState } from 'react';
import { INITIAL_RESOURCES, INITIAL_SUPPLIERS, INITIAL_PRICES } from './resourceMockData.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { FileText, Download, Eye, Layers, Settings, ChevronRight, Check, Send, Printer } from 'lucide-react';

export const ResourceReports = () => {
  const [selectedReportType, setSelectedReportType] = useState<'cost_summary' | 'supplier_coverage' | 'price_velocity'>('cost_summary');

  // Trigger simulated exports
  const handleExport = (format: 'Excel' | 'PDF' | 'Print') => {
    alert(`Generating requested construction report snapshot as: ${selectedReportType}.${format.toLowerCase()}. Document generated automatically with certified cryptographic seal.`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* Selector Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="font-extrabold text-[#111] text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Layers size={14} className="text-primary-500" />
            Workspace Reports Center
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Configure report layouts and query parameters for structural project submittals.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setSelectedReportType('cost_summary')}
            className={`flex-1 p-3 border rounded-xl pointer text-left transition relative overflow-hidden ${selectedReportType === 'cost_summary' ? 'border-primary-500 bg-primary-50/10' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            {selectedReportType === 'cost_summary' && <div className="absolute top-0 left-0 h-full w-[3px] bg-primary-600" />}
            <span className="font-black text-[12px] text-slate-800 block">Resource Cost Summary</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Aggregated units, global rates, and active suppliers listed recursively.</span>
          </button>

          <button 
            onClick={() => setSelectedReportType('supplier_coverage')}
            className={`flex-1 p-3 border rounded-xl pointer text-left transition relative overflow-hidden ${selectedReportType === 'supplier_coverage' ? 'border-primary-500 bg-primary-50/10' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            {selectedReportType === 'supplier_coverage' && <div className="absolute top-0 left-0 h-full w-[3px] bg-primary-600" />}
            <span className="font-black text-[12px] text-slate-800 block">Supplier Coverage Audit</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Tax compliance statuses and total catalog metrics.</span>
          </button>

          <button 
            onClick={() => setSelectedReportType('price_velocity')}
            className={`flex-1 p-3 border rounded-xl pointer text-left transition relative overflow-hidden ${selectedReportType === 'price_velocity' ? 'border-primary-500 bg-primary-50/10' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            {selectedReportType === 'price_velocity' && <div className="absolute top-0 left-0 h-full w-[3px] bg-primary-600" />}
            <span className="font-black text-[12px] text-slate-800 block">Price Velocity Analysis</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Quarterly historical variations mapped across materials.</span>
          </button>
        </div>
      </div>

      {/* Dynamic Preview Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Title area */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h5 className="font-bold text-[#111e29] uppercase tracking-wide text-xs">
              {selectedReportType === 'cost_summary' ? 'Resource Cost Summary Preview' :
               selectedReportType === 'supplier_coverage' ? 'Supplier Coverage Audit Preview' : 'Price Velocity Index Preview'}
            </h5>
            <span className="text-[10px] text-slate-400 font-medium">Rendered Snapshot generated dynamically from workspace database</span>
          </div>

          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => handleExport('Excel')}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              <Download size={12} /> Excel
            </button>
            <button 
              onClick={() => handleExport('PDF')}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              <FileText size={12} /> PDF
            </button>
            <button 
              onClick={() => handleExport('Print')}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              <Printer size={12} /> Print
            </button>
          </div>
        </div>

        {/* Dynamic Table Preview */}
        <div className="overflow-x-auto">
          {selectedReportType === 'cost_summary' && (
            <table className="w-full text-left border-collapse border-b">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10.5px]">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Item Code</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Description</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Unit</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase text-right">Standard Rate</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Primary Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {INITIAL_RESOURCES.slice(0, 6).map(res => (
                  <tr key={res.id} className="hover:bg-slate-55/40 font-medium">
                    <td className="px-5 py-2.5 font-mono text-primary-600 font-bold">{res.code}</td>
                    <td className="px-5 py-2.5 font-bold text-slate-800">{res.name}</td>
                    <td className="px-5 py-2.5 text-slate-500 font-bold">{res.unit}</td>
                    <td className="px-5 py-2.5 text-right font-mono font-bold text-slate-700">${res.baseRate.toFixed(2)}</td>
                    <td className="px-5 py-2.5 text-slate-500 font-bold">{res.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'supplier_coverage' && (
            <table className="w-full text-left border-collapse border-b">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10.5px]">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Supplier Name</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Contact Email</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Active Status</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase text-center">Catalog Items Count</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Tax Reg (VAT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {INITIAL_SUPPLIERS.map(sup => {
                  const itemsCount = INITIAL_RESOURCES.filter(r => r.supplier === sup.name).length;
                  return (
                    <tr key={sup.id} className="hover:bg-slate-55/40 font-medium">
                      <td className="px-5 py-2.5 font-bold text-slate-800">{sup.name}</td>
                      <td className="px-5 py-2.5 text-slate-500 font-bold">{sup.email}</td>
                      <td className="px-5 py-2.5 font-bold">
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                          {sup.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-center font-bold text-indigo-600">{itemsCount} units</td>
                      <td className="px-5 py-2.5 font-mono font-bold text-slate-600">{sup.taxNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedReportType === 'price_velocity' && (
            <table className="w-full text-left border-collapse border-b text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10.5px]">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">Resource Item</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">2025 Q1</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">2025 Q2</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">2025 Q3</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase">2026 Q1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {INITIAL_RESOURCES.slice(0, 5).map(res => (
                  <tr key={res.id} className="hover:bg-slate-55/40 font-medium">
                    <td className="px-5 py-2.5 font-bold text-slate-800">{res.name}</td>
                    <td className="px-5 py-2.5 font-mono font-bold text-slate-500">${(res.baseRate * 0.95).toFixed(2)}</td>
                    <td className="px-5 py-2.5 font-mono font-bold text-slate-500">${(res.baseRate * 0.97).toFixed(2)}</td>
                    <td className="px-5 py-2.5 font-mono font-bold text-slate-500">${(res.baseRate * 0.99).toFixed(2)}</td>
                    <td className="px-5 py-2.5 font-mono font-bold text-emerald-600">${res.baseRate.toFixed(2)}</td>
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
