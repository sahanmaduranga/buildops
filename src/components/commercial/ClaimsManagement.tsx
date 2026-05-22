import React, { useState } from 'react';
import { useCommercial, type DelayClaim } from '../../context/CommercialContext.tsx';
import { 
  Building, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  DollarSign, 
  Info,
  AlertTriangle 
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const ClaimsManagement = () => {
  const { getClaimsQuery, approveClaim } = useCommercial();
  const claims = getClaimsQuery.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);

  const activeClaim = claims.find(c => c.id === selectedClaimId);

  const totalClaimedDays = claims.reduce((sum, c) => sum + c.daysEOTClaimed, 0);
  const totalMoneyClaimed = claims.reduce((sum, c) => sum + c.monetaryValueClaimed, 0);

  const filteredClaims = claims.filter(c => 
    c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in text-[13px] text-slate-600 font-semibold select-none">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">EOT Extension Days Claimed</p>
            <h3 className="text-xl font-black text-rose-600">{totalClaimedDays} Days Claimed</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Aggregate delay assessments</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <Calendar size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Monetary Value Disputed</p>
            <h3 className="text-xl font-black text-slate-800">${totalMoneyClaimed.toLocaleString()}</h3>
            <p className="text-[10.5px] text-slate-300 font-semibold">Prolongation cost claims</p>
          </div>
          <div className="p-3 bg-zinc-50 text-zinc-600 rounded-xl shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase text-amber-600">Claims Auditing Status</p>
            <h3 className="text-xl font-black text-amber-600">QS Mediation</h3>
            <p className="text-[10.5px] text-amber-600 font-bold">Awaiting contractual reviews</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Split claims registry vs details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left: Active claims table grid */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden font-semibold">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><Search size={14} /></span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find claims by reference context..."
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto select-none">
            <table className="w-full text-left font-semibold text-xs leading-normal">
              <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Claim ID</th>
                  <th className="py-2.5 px-4">Delay Context Title</th>
                  <th className="py-2.5 px-4 text-center">EOT Offset</th>
                  <th className="py-2.5 px-4 text-right">Value Claimed</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right pr-6 md:w-[120px]">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {filteredClaims.map((c) => (
                  <tr key={c.id} className={cn("hover:bg-slate-50/50 cursor-pointer", selectedClaimId === c.id && "bg-primary-50/20")}>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{c.claimNumber}</td>
                    <td className="py-2.5 px-4 text-slate-700 truncate max-w-[150px]">{c.title}</td>
                    <td className="py-2.5 px-4 text-center text-rose-600 font-bold">{c.daysEOTClaimed} Days</td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">${c.monetaryValueClaimed.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded border text-[9px] uppercase",
                        c.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedClaimId(c.id)}
                        className="px-2 py-1 bg-transparent hover:underline text-primary-600 hover:text-primary-700 font-bold font-sans"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredClaims.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Info size={32} className="mx-auto text-slate-200 mb-2" />
                      <h5 className="font-bold">No delay claims registered</h5>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right segment: Claim audit inspect */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-1 font-sans">Arbitration Inspector</h4>

          {activeClaim ? (
            <div className="space-y-4 font-semibold leading-relaxed text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 select-none">
                <p className="font-bold text-slate-800 leading-tight">{activeClaim.title}</p>
                <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                  <span>EOT Duration:</span>
                  <span className="text-rose-600">{activeClaim.daysEOTClaimed} Days Extension</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-bold border-t border-slate-100 pt-1.5">
                  <span>Prolongation Sum:</span>
                  <span className="font-bold text-slate-800">${activeClaim.monetaryValueClaimed.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5 select-none">
                <h5 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Vetted delay justification</h5>
                <p className="text-slate-500 font-semibold leading-normal">{activeClaim.justification || 'Engineering delay assessment details submitted for mediation.'}</p>
              </div>

              {activeClaim.status === 'QS Evaluation' && (
                <button
                  onClick={() => approveClaim(activeClaim.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs cursor-pointer shadow"
                >
                  Approve and Update Schedule Baseline ✓
                </button>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-12">Select a claim to review justification logs.</p>
          )}
        </div>

      </div>

    </div>
  );
};
