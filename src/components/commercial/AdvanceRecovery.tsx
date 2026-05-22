import React, { useState } from 'react';
import { useCommercial } from '../../context/CommercialContext.tsx';
import { 
  History, 
  Search, 
  Percent, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const AdvanceRecovery = () => {
  const { getAdvancesQuery } = useCommercial();
  const advances = getAdvancesQuery.data || [];

  const [selectedAdvId, setSelectedAdvId] = useState<string | null>(advances[0]?.id || null);
  const activeAdv = advances.find(a => a.id === selectedAdvId);

  return (
    <div className="space-y-5 animate-fade-in text-[13px] text-slate-600 font-semibold">
      
      {/* Advance Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Mobilized Advance Principal</p>
            <h3 className="text-xl font-black text-slate-800">${(advances[0]?.advanceAmount || 250000).toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Upfront mobilization funding</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase text-emerald-600">Total Capital Recovered</p>
            <h3 className="text-xl font-black text-emerald-600">${(advances[0]?.recoveredToDate || 22277.75).toLocaleString()}</h3>
            <p className="text-[10.5px] text-emerald-600 font-bold">Deducted amortizations from IPC 1 & 2</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase text-amber-600">Remaining Advance Balance</p>
            <h3 className="text-xl font-black text-amber-600">${(advances[0]?.remainingBalance || 227722.25).toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Amortizing throughout future cycles</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Advance Schedules Detail Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left: General recovery list of records */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-4 select-none">Amortization Recovery Schedule Logs</h4>
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left font-semibold">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider pb-2">
                  <th className="pb-3 px-1">IPC Reference</th>
                  <th className="pb-3">Amortization Date</th>
                  <th className="pb-3 text-right">Deducted Recovery</th>
                  <th className="pb-3 text-right pr-4">Balance amortization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeAdv?.history.map((h, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-1 font-bold text-slate-800">{h.ipcNumber}</td>
                      <td className="py-2.5 text-slate-500">{h.recoveredDate}</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">${h.recoveredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 text-right font-bold text-slate-700 pr-4">
                        -${h.recoveredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
                {(!activeAdv || activeAdv.history.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-300">
                      <Info size={32} className="mx-auto text-slate-100 mb-2" />
                      <p className="text-xs">No recovered advances logged in this workspace</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right segment: rule triggers */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-1 select-none font-sans">Amortization Recovery Rule</h4>
          
          {activeAdv ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs text-slate-500 font-semibold select-none">
                <p>Selected rule: <span className="font-bold text-slate-800">{activeAdv.recoveringRule}</span></p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="p-1 bg-primary-50 rounded text-primary-600 font-black"><Percent size={12} /></span>
                  <span>Amortization rate: <span className="font-bold text-slate-800">{activeAdv.recoveryRatePercent}%</span> of Gross Certified IPC Value</span>
                </div>
              </div>

              <div className="space-y-1 text-xs select-none">
                <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wide">Advance Recovery Clause</h5>
                <p className="text-slate-500 font-semibold leading-relaxed">This advance was approved and disbursed upon signing initial contracts. Deduction amortizations cease automatically when remaining balance reaches zero.</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400">Loading schedules...</p>
          )}
        </div>

      </div>

    </div>
  );
};
