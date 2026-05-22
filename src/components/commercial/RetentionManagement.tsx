import React, { useState } from 'react';
import { useCommercial, type RetentionEntry } from '../../context/CommercialContext.tsx';
import { 
  Building2, 
  Search, 
  ShieldAlert, 
  Settings, 
  Power, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  DollarSign, 
  Info 
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const RetentionManagement = () => {
  const { getRetentionsQuery, releaseRetention } = useCommercial();
  const retentions = getRetentionsQuery.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedRetId, setSelectedRetId] = useState<string | null>(null);
  const [amtToRelease, setAmtToRelease] = useState('');

  // Summaries
  const totalHeldVal = retentions.reduce((sum, r) => sum + r.retainedAmount, 0);
  const totalReleasedVal = retentions.reduce((sum, r) => sum + r.releasedAmount, 0);
  const remainingHeldVal = Math.max(0, totalHeldVal - totalReleasedVal);

  const filteredRet = retentions.filter(r => 
    r.ipcNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.contractor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerRelease = (retId: string) => {
    const target = retentions.find(r => r.id === retId);
    if (target) {
      setSelectedRetId(retId);
      setAmtToRelease(String(target.pendingBalance));
      setReleaseModalOpen(true);
    }
  };

  const handleConfirmRelease = () => {
    if (!selectedRetId || !amtToRelease) return;
    releaseRetention(selectedRetId, Number(amtToRelease));
    setReleaseModalOpen(false);
    setSelectedRetId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in relative">
      
      {/* High impact header widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Aggregate Retention Holdback</p>
            <h3 className="text-xl font-black text-slate-800">${totalHeldVal.toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">10% cumulative project deductions</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">DLP Released Retentions</p>
            <h3 className="text-xl font-black text-emerald-600">${totalReleasedVal.toLocaleString()}</h3>
            <p className="text-[10.5px] text-emerald-600 font-bold">Defects liability period clearings</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Net Retention Balance Held</p>
            <h3 className="text-xl font-black text-amber-600">${remainingHeldVal.toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Assets pending defect certificates</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Grid List for retentions */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden font-semibold">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-3">
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-2.5 text-slate-400"><Search size={14} /></span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find certificates or contractors ledger..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-semibold">
            <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">IPC Reference</th>
                <th className="py-2.5 px-4">Contractor partner</th>
                <th className="py-2.5 px-4 text-right">Deducted Amount</th>
                <th className="py-2.5 px-4 text-right text-emerald-600">Released Amount</th>
                <th className="py-2.5 px-4 text-right text-amber-600">Pending DLP Balance</th>
                <th className="py-2.5 px-4 text-center">Release state</th>
                <th className="py-2.5 px-4 text-slate-400">DLP Clear date</th>
                <th className="py-2.5 px-4 text-right pr-6">Management Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRet.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800">{r.ipcNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{r.contractor}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">${r.retainedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-bold">${r.releasedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-right text-amber-600 font-bold">${r.pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase border",
                      r.releaseStatus === 'Released' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                      r.releaseStatus === 'Partial Release' && "bg-blue-50 text-blue-700 border-blue-100",
                      r.releaseStatus === 'Retained' && "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {r.releaseStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-medium">{r.releaseDate || 'DLP is Active'}</td>
                  <td className="py-3 px-4 text-right pr-6 select-none">
                    {r.pendingBalance > 0 ? (
                      <button
                        onClick={() => triggerRelease(r.id)}
                        className="px-2.5 py-1 text-[11px] bg-primary-600 hover:bg-primary-700 text-white font-bold rounded cursor-pointer shadow-sm transition-colors"
                      >
                        Release Held Cash
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-black">Released ✓</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRet.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Info size={32} className="mx-auto text-slate-200 mb-2" />
                    <h5 className="font-bold">No retention ledger matches query</h5>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release held cash modal dialogue */}
      {releaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4 select-none">
          <div className="bg-white border rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4">
            <h4 className="font-extrabold text-[#192a56]">Authorized DLP Release</h4>
            <p className="text-[11.5px] text-slate-400">Release retained quantities for the contractor following inspections.</p>
            
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Release Amount ($)</label>
              <input
                type="number"
                value={amtToRelease}
                onChange={(e) => setAmtToRelease(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button 
                onClick={() => setReleaseModalOpen(false)}
                className="px-3.5 py-2 hover:bg-slate-50 text-slate-500 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmRelease}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow"
              >
                Confirm Capital Release
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
