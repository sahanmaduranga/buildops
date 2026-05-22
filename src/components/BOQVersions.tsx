import React from 'react';
import { 
  GitCommit, 
  GitBranch, 
  Trash, 
  FileText, 
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useBOQ } from '../context/BOQContext.tsx';
import { formatCurrency } from '../lib/utils.ts';

export const BOQVersions = ({ onBack, onCompare }: { onBack: () => void, onCompare: () => void }) => {
  const { boqs, restoreVersion } = useBOQ();

  // Pick the revisions of the primary BOQ (or filter revisions in active list)
  const currentBOQ = boqs[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[500px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zentrix-blue">Revision & Version Control</h3>
          <p className="text-[11px] text-slate-400">Track and manage every historical draft snapshot and baseline of your bill of quantities.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onCompare}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <GitBranch size={13} /> Open Comparison Matrix
          </button>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-650 font-bold font-mono">
            V{currentBOQ?.revisionNo || 1}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Active Workspace Model: {currentBOQ?.name}</h4>
            <p className="text-xs text-slate-450 mt-0.5">Code Ref: {currentBOQ?.code} • Status: <span className="font-semibold text-primary-600">{currentBOQ?.status}</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Active Baseline Worth</p>
          <p className="text-lg font-black text-zentrix-blue">{formatCurrency(currentBOQ?.totalAmount || 1849200)}</p>
        </div>
      </div>

      {/* Revisions Visual Timeline */}
      <div className="relative pl-8 border-l-2 border-slate-100 space-y-8 ml-4 py-2">
        {boqs.map((boq, index) => {
          const isLatest = index === 0;
          return (
            <div key={boq.id} className="relative group">
              {/* Node Bullet */}
              <span className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow ${
                isLatest ? "bg-primary-600 text-white border-primary-500 ring-4 ring-primary-50" : "bg-white text-slate-500 border-slate-300"
              }`}>
                {index === 0 ? "★" : boqs.length - index}
              </span>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white border border-slate-200 p-4.5 rounded-xl group-hover:border-slate-350 transition-all hover:shadow-sm">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zentrix-blue">Revision v{boq.revisionNo} snapshot</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      boq.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      boq.status === 'Review' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {boq.status}
                    </span>
                    {isLatest && (
                      <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Current Model
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    &ldquo;{boq.revisionNotes || 'No notes left by surveyor.'}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 text-[10.5px] text-slate-400 font-medium flex-wrap pt-1 border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Edited: {new Date().toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={11} /> By: {boq.createdBy || 'Senior QS Engineer'}
                    </span>
                    <span className="font-mono text-primary-600 font-bold">
                      Amt: {formatCurrency(boq.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-end gap-2 justify-end">
                  {!isLatest ? (
                    <>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to restore the model to v${boq.revisionNo}? This will revert any subsequent drafts.`)) {
                            restoreVersion(boq.id);
                            alert(`Restored successfully to revision v${boq.revisionNo}!`);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Draft rollback"
                      >
                        <RotateCcw size={12} /> Rollback
                      </button>
                      <button 
                        onClick={() => alert(`Reviewing static snapshot audit log of revision ${boq.revisionNo}.`)}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        View Audit Log
                      </button>
                    </>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md block uppercase">
                        ● Live Baseline
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
