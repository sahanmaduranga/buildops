import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Search,
  Filter,
  User,
  ExternalLink,
  History,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';
import { ProgressUpdate } from '../../types.ts';

export const ProgressApprovals = () => {
  const { progressUpdates, approveOrRejectUpdate } = useProgress();

  const handleApprove = (id: string) => {
    approveOrRejectUpdate(id, 'Approved');
  };

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      approveOrRejectUpdate(id, 'Rejected');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Progress Approval Workflow</h2>
          <p className="text-[13px] text-slate-500 font-medium">Verify site execution reports and multi-stage digital approvals</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] font-black text-slate-400 uppercase mr-3">Filter status:</span>
              <div className="flex gap-1">
                 <button className="px-2 py-0.5 bg-primary-600 text-white rounded text-[10px] font-black">PENDING</button>
                 <button className="px-2 py-0.5 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded text-[10px] font-black">ALL</button>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
           {progressUpdates.map((update) => (
              <div key={update.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-primary-300 transition-all group">
                 <div className="p-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200 shrink-0">
                          <span className="text-[10px] font-black text-slate-400 leading-none mb-1">{new Date(update.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                          <span className="text-lg font-black text-slate-900 leading-none">{new Date(update.date).getDate()}</span>
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Task #{update.taskId}</span>
                             <span className={cn(
                                "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase",
                                update.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                update.status === 'Rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                             )}>{update.status}</span>
                          </div>
                          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-tight">{update.taskName}</h3>
                          <p className="text-[12px] text-slate-500 font-medium mt-1">Recorded by <span className="text-slate-900 font-bold">{update.reportedBy}</span></p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Actual Realized</span>
                       <span className="text-2xl font-black text-primary-600 tabular-nums">{update.actualQty} <span className="text-[12px] text-slate-400 ml-1">m3</span></span>
                    </div>
                 </div>
                 
                 <div className="p-5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex-1 min-w-[300px]">
                       <div className="flex items-center gap-2 mb-3">
                          <MessageSquare size={14} className="text-slate-400" />
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Site Inspector Notes</span>
                       </div>
                       <p className="text-[13px] text-slate-600 italic font-medium">"{update.notes || 'No notes provided.'}"</p>
                       <div className="mt-4 flex gap-4">
                          <button className="flex items-center gap-2 text-[11px] font-black text-primary-600 hover:underline">
                             <FileText size={14} /> VIEW SOT ALLOCATION
                          </button>
                          <button className="flex items-center gap-2 text-[11px] font-black text-primary-600 hover:underline">
                             <ExternalLink size={14} /> BOQ REFERENCE
                          </button>
                       </div>
                    </div>

                    <div className="w-[320px] bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                          <span>Multi-Stage Flow</span>
                          <History size={12} />
                       </h4>
                       <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                          {update.approvalWorkflow && update.approvalWorkflow.map((step, sIdx) => (
                             <div key={step.id} className="relative pl-6 flex items-center justify-between group/step">
                                <div className={cn(
                                   "absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 z-10 transition-all",
                                   step.status === 'Approved' ? "bg-emerald-500 ring-emerald-500/20" : "bg-white ring-slate-200"
                                )} />
                                <div className="flex flex-col">
                                   <span className="text-[12px] font-black text-slate-800 tracking-tight leading-none">{step.name}</span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{step.role}</span>
                                </div>
                                {step.status === 'Approved' ? (
                                   <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                   <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded border border-amber-100 animate-pulse">PENDING</div>
                                )}
                             </div>
                          ))}
                          {(!update.approvalWorkflow || update.approvalWorkflow.length === 0) && (
                            <div className="relative pl-6 flex items-center justify-between group/step">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 z-10 bg-white ring-slate-200" />
                              <div className="flex flex-col">
                                <span className="text-[12px] font-black text-slate-800 tracking-tight leading-none">Internal Verify</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QS Dept</span>
                              </div>
                              <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded border border-amber-100">PENDING</div>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {update.status === 'Submitted' && (
                  <div className="px-5 py-4 bg-white border-t border-slate-100 flex items-center justify-between group-hover:bg-primary-50/10 transition-all">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(update.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[12px] font-black shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} /> Approve Entry
                        </button>
                        <button 
                          onClick={() => handleReject(update.id)}
                          className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-[12px] font-black hover:bg-red-50 transition-all flex items-center gap-2"
                        >
                            <XCircle size={16} /> Reject with Comments
                        </button>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                  </div>
                 )}
              </div>
           ))}
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl space-y-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Workflow summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Submission Queue</span>
                       <p className="text-3xl font-black tabular-nums">{progressUpdates.filter(u => u.status === 'Submitted').length}</p>
                    </div>
                    <Clock size={32} className="text-white/10" />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black text-slate-400">
                       <span>AVG RESPONSE TIME</span>
                       <span className="text-emerald-400">4.2 HOURS</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">My recent actions</h3>
                 <History size={16} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                 {progressUpdates.filter(u => u.status !== 'Submitted').slice(0, 3).map((u, i) => (
                    <div key={u.id} className="flex gap-3 text-[12px]">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                         u.status === 'Approved' ? "bg-emerald-500" : "bg-red-500"
                       )} />
                       <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 leading-tight">{u.status} update for {u.taskName}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(u.date).toLocaleDateString()}</span>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full py-2 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">View Audit Log</button>
           </div>
        </div>
      </div>
    </div>
  );
};

