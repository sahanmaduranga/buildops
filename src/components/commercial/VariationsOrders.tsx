import React, { useState } from 'react';
import { useCommercial, type VariationsOrder } from '../../context/CommercialContext.tsx';
import { 
  History, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Info,
  Calendar,
  AlertTriangle,
  FileCheck2,
  ListFilter
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const VariationsOrders = () => {
  const { getVariationsQuery, approveVariation } = useCommercial();
  const variations = getVariationsQuery.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoId, setSelectedVoId] = useState<string | null>(variations[0]?.id || null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states to register a new VO
  const [vTitle, setVTitle] = useState('');
  const [vRef, setVRef] = useState(`VO-00${variations.length + 1}`);
  const [vValue, setVValue] = useState('');
  const [vDesc, setVDesc] = useState('');

  const activeVo = variations.find(v => v.id === selectedVoId);

  // Metric sums
  const totalApprovedVOVal = variations
    .filter(v => v.status === 'Approved')
    .reduce((sum, v) => sum + v.variationValue, 0);

  const totalPendingVOVal = variations
    .filter(v => v.status === 'Submitted')
    .reduce((sum, v) => sum + v.variationValue, 0);

  const filteredVOs = variations.filter(v => 
    v.voNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in text-[13px] text-slate-600 font-semibold relative">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Approved Variation Orders</p>
            <h3 className="text-xl font-black text-emerald-600">+${totalApprovedVOVal.toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Integrates into active BOQ scale</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Pending VOs under QS Vetting</p>
            <h3 className="text-xl font-black text-amber-600">${totalPendingVOVal.toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Reconciliations undergoing engineering reviews</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Contract Delta Reached</p>
            <h3 className="text-xl font-black text-slate-800">+${(totalApprovedVOVal + totalPendingVOVal).toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Consolidated variation index</p>
          </div>
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl shrink-0">
            <FileCheck2 size={18} />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Variation Registry vs Comparative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left: Interactive VO Catalogue */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden flex flex-col font-semibold">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><Search size={14} /></span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search variations registry..."
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => alert("Change management panel activated.")}
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm shrink-0"
            >
              Propose Variation Order
            </button>
          </div>

          <div className="overflow-x-auto max-h-[280px]">
            <table className="w-full text-left font-semibold">
              <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">VO Code</th>
                  <th className="py-2.5 px-4">Title Description</th>
                  <th className="py-2.5 px-4 text-right">Scope Net Delta</th>
                  <th className="py-2.5 px-4 text-center">Audit Stage</th>
                  <th className="py-2.5 px-4">Date Props</th>
                  <th className="py-2.5 px-4 text-right pr-6">Selector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-xs">
                {filteredVOs.map((v) => (
                  <tr key={v.id} className={cn("hover:bg-slate-50/50 cursor-pointer", selectedVoId === v.id && "bg-primary-50/20")}>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{v.voNumber}</td>
                    <td className="py-2.5 px-4 text-slate-700 truncate max-w-[200px]" title={v.title}>{v.title}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">+${v.variationValue.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase border",
                        v.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                      )}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-semibold">{v.dateProposed}</td>
                    <td className="py-2.5 px-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedVoId(v.id)}
                        className="px-2 py-1 bg-transparent hover:underline text-primary-600 hover:text-primary-700 font-bold"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVOs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Info size={32} className="mx-auto text-slate-200 mb-2" />
                      <h5 className="font-bold">No proposed variations recorded</h5>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Comparative Variance breakdown grid */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-1 flex justify-between items-center select-none font-sans">
            <span>BOQ Quantity Deltas</span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Compare View</span>
          </h4>

          {activeVo ? (
            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 select-none">
                <p className="font-bold text-slate-800 leading-tight">{activeVo.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal font-semibold">{activeVo.description}</p>
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 font-black text-slate-700">
                  <span>Incremental Contract Value:</span>
                  <span className="text-primary-600">+${activeVo.variationValue.toLocaleString()}</span>
                </div>
              </div>

              {/* BOQ Revision comparison fields */}
              <div className="space-y-2 select-none">
                <h5 className="text-[9.5px] text-slate-400 font-extrabold uppercase">Dynamic BOQ Adjustments</h5>
                <div className="p-2.5 border border-dashed border-slate-200 rounded-xl bg-slate-50/40 text-xs space-y-2">
                  <div className="flex justify-between border-b border-dashed border-slate-100 pb-1 font-bold text-slate-500">
                    <span>Item: Structural Foundations Excavation</span>
                    <span className="font-black">BOQ-CIV-101</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-bold">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Original quantity</p>
                      <p className="text-slate-800 mt-0.5">2,500 m³</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-primary-500 uppercase">Revised quantity</p>
                      <p className="text-primary-600 mt-0.5 font-black">2,950 m³</p>
                    </div>
                  </div>
                </div>
              </div>

              {activeVo.status !== 'Approved' && (
                <button
                  onClick={() => approveVariation(activeVo.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs cursor-pointer shadow"
                >
                  Approve and Revise BOQ Lines ✓
                </button>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-12">Select a Variation Order ledger line to audit details.</p>
          )}
        </div>

      </div>

    </div>
  );
};
