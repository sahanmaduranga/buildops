import React from 'react';
import { 
  History, 
  ChevronRight, 
  ArrowLeftRight, 
  Trash2, 
  Plus, 
  Clock, 
  Calendar, 
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { MOCK_BASELINES } from '../mockData.ts';

// Add MOCK_BASELINES to mockData if not present but let's assume it is
const snapshots = [
  { id: 'b1', name: 'Original Contract Baseline', date: '2024-05-15', createdBy: 'Admin', status: 'Active', tasksCount: 145, variance: '0%' },
  { id: 'b2', name: 'Q1 Reforecast', date: '2024-08-20', createdBy: 'Robert Chen', status: 'Archived', tasksCount: 152, variance: '+4.2%' },
  { id: 'b3', name: 'Scope Change #04', date: '2024-09-05', createdBy: 'Robert Chen', status: 'Archived', tasksCount: 158, variance: '+5.5%' },
];

export const SOTBaselines = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-zentrix-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-zentrix-blue">Schedule Baselines</h1>
           <p className="text-[13px] text-zentrix-muted">Manage schedule snapshots and version comparisons</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-[13px] font-bold rounded-lg hover:bg-primary-700 transition-all shadow-sm">
             <Plus size={16} />
             Create New Baseline
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Baseline List */}
        <div className="lg:col-span-1 space-y-4">
           {snapshots.map((snap) => (
             <div key={snap.id} className={cn(
               "p-4 border rounded-xl cursor-pointer transition-all",
               snap.status === 'Active' ? "bg-primary-50 border-primary-200" : "bg-white border-zentrix-border hover:border-slate-300"
             )}>
                <div className="flex justify-between items-start mb-3">
                   <span className={cn(
                     "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                     snap.status === 'Active' ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                   )}>{snap.status}</span>
                   <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
                <h4 className="text-[13px] font-bold text-zentrix-blue mb-1">{snap.name}</h4>
                <div className="space-y-1 mt-3">
                   <div className="flex items-center gap-2 text-[11px] text-zentrix-muted">
                      <Calendar size={12} /> {snap.date}
                   </div>
                   <div className="flex items-center gap-2 text-[11px] text-zentrix-muted">
                      <Clock size={12} /> {snap.tasksCount} Tasks Recorded
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Right: Comparison Details */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white border border-zentrix-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[15px] font-bold text-zentrix-blue flex items-center gap-2">
                    <ArrowLeftRight size={18} className="text-primary-600" />
                    Timeline Variance Analysis
                 </h3>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-bold text-zentrix-blue">
                       Original Baseline
                    </div>
                    <span className="text-zentrix-muted">vs</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-md text-[11px] font-bold text-primary-600">
                       Current Schedule
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 {[
                   { task: 'Excavation & Foundations', base: 45, current: 52, diff: '+7d', status: 'Delayed' },
                   { task: 'Substructure Concrete', base: 60, current: 60, diff: '0d', status: 'On Track' },
                   { task: 'Superstructure Phase 1', base: 120, current: 128, diff: '+8d', status: 'Delayed' },
                 ].map((row, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center text-[12px] font-bold">
                         <span className="text-zentrix-blue">{row.task}</span>
                         <span className={cn(
                           "text-[11px] px-2 py-0.5 rounded",
                           row.status === 'Delayed' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                         )}>{row.status} ({row.diff})</span>
                      </div>
                      <div className="relative h-6 flex items-center">
                         {/* Baseline bar */}
                         <div className="absolute h-2 w-full bg-slate-100 rounded-full" />
                         <div 
                           className="absolute h-2 bg-slate-300 rounded-full transition-all" 
                           style={{ width: `${(row.base / 150) * 100}%` }} 
                         />
                         {/* Current bar */}
                         <div 
                           className="absolute h-1 bg-primary-500 rounded-full transition-all" 
                           style={{ width: `${(row.current / 150) * 100}%`, top: '10px' }} 
                         />
                      </div>
                      <div className="flex justify-between text-[10px] text-zentrix-muted font-bold">
                         <span>Baseline Duration: {row.base} Days</span>
                         <span>Current Duration: {row.current} Days</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <h4 className="text-[14px] font-bold text-amber-900 mb-1">Critical Path Variance Detected</h4>
                 <p className="text-[12px] text-amber-800 leading-relaxed mb-4">
                   Your current critical path has drifted by 15 days compared to the Original Baseline. This exceeds the project's tolerance threshold of 10 days. 
                   A rescheduling or acceleration plan may be required to recover the project timeline.
                 </p>
                 <button className="px-4 py-1.5 bg-amber-600 text-white text-[11px] font-bold rounded-lg hover:bg-amber-700 transition-all">Review Acceleration Options</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
