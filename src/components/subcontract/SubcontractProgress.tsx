import React from 'react';
import { useSubcontract } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  TrendingUp, 
  Hourglass, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from '../../lib/utils.ts';

export function SubcontractProgress() {
  const { currentProject } = useProject();
  const { subcontractors, packages, ipcs } = useSubcontract();

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900 leading-none">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1">Please select an active project workspace to load its progress charts.</p>
      </div>
    );
  }

  const projectPackages = packages.filter(p => p.projectId === currentProject.id);

  // Compute stats for physical progress
  const activePackages = projectPackages.filter(p => p.status === 'Active');
  const delayedCount = activePackages.filter(p => new Date(p.endDate) < new Date('2026-05-23')).length;
  const onTrackCount = activePackages.length - delayedCount;
  const completedCount = projectPackages.filter(p => p.status === 'Completed' || p.status === 'Closed').length;

  // S-Curve mock sequence tracking cumulative progress
  const sCurveData = [
    { name: 'Month 1', Planned: 10, Actual: 8 },
    { name: 'Month 2', Planned: 25, Actual: 21 },
    { name: 'Month 3', Planned: 45, Actual: 38 },
    { name: 'Month 4', Planned: 68, Actual: 60 },
    { name: 'Month 5', Planned: 85, Actual: 80 },
    { name: 'Month 6 (Cur)', Planned: 100, Actual: 92 }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs text-slate-650 font-sans leading-normal">
      
      {/* Visual KPI stats block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-650">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Active Programs</span>
            <span className="font-extrabold text-slate-900 text-sm">{activePackages.length} Packages</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
            <CheckCircle size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Handovers Completed</span>
            <span className="font-extrabold text-slate-900 text-sm">{completedCount} Packages</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
            <Clock size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">On-Schedule Works</span>
            <span className="font-extrabold text-slate-900 text-sm">{onTrackCount} Packages</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-550">
            <AlertTriangle size={15} className="animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Schedule Bottlenecks</span>
            <span className="font-extrabold text-rose-600 text-sm">{delayedCount} Flagged</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Progress Map list */}
        <div className="bg-white border rounded-xl p-4.5 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Packages Physical Completion Progress</h4>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Highlights the structural physical milestone certified to date compared against completion schedules.</p>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {projectPackages.length === 0 ? (
              <p className="text-slate-400 italic text-center py-10">No packages details configured.</p>
            ) : (
              projectPackages.map(pkg => {
                const sub = subcontractors.find(s => s.id === pkg.subcontractorId);
                const approvedIPCSum = ipcs
                  .filter(i => i.packageId === pkg.id && (i.status === 'Approved' || i.status === 'Paid'))
                  .reduce((sum, i) => sum + i.certifiedAmount, 0);
                
                const ratio = pkg.revisedContractValue > 0 ? (approvedIPCSum / pkg.revisedContractValue) * 100 : 0;
                const physicalProgressPct = Math.min(100, Math.round(ratio));
                const isDelayed = pkg.status === 'Active' && new Date(pkg.endDate) < new Date('2026-05-23');

                return (
                  <div key={pkg.id} className="space-y-1.5 p-3.5 bg-slate-50 border rounded-xl border-slate-100">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-1.5 py-0.2 rounded-md font-black select-none mr-2">
                          {pkg.code}
                        </span>
                        <span className="text-slate-900 font-extrabold truncate text-[11.5px]">{pkg.name}</span>
                      </div>
                      <span className="font-black text-slate-950 font-mono">{physicalProgressPct}% Completion</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 select-none">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          physicalProgressPct >= 80 
                            ? "bg-emerald-500" 
                            : physicalProgressPct >= 40 
                              ? "bg-indigo-650" 
                              : "bg-amber-500"
                        )}
                        style={{ width: `${physicalProgressPct}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-400 pt-1 shrink-0">
                      <span>Subcontractor: <strong className="text-slate-700 font-bold">{sub ? sub.name.substring(0, 30) : 'Unassigned'}</strong></span>
                      {isDelayed ? (
                        <span className="text-rose-600 font-extrabold flex items-center gap-1">
                          <AlertTriangle size={11} /> Overdue for completion ({pkg.endDate})
                        </span>
                      ) : (
                        <span>Deadline: <strong className="text-slate-700">{pkg.endDate}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Visual Line S-Curve Progress */}
        <div className="bg-white border rounded-xl p-4.5 shadow-sm flex flex-col h-[385px] lg:h-auto">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Sublet Cumulative S-Curve Chart</h4>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Project cumulative S-Curve comparing planned vs actual physically certified milestones percentages.</p>
          </div>

          <div className="flex-1 min-h-0 mt-4 relative font-sans text-[10.5px]">
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={sCurveData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fafafa" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} unit="%" />
                <Tooltip formatter={(value) => [`${value}% Completion`, '']} />
                <Legend iconSize={8} />
                <Area type="monotone" dataKey="Planned" stroke="#8b5cf6" fillOpacity={0.06} fill="#8b5cf6" strokeWidth={2} />
                <Area type="monotone" dataKey="Actual" stroke="#10b981" fillOpacity={0.1} fill="#10b981" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
