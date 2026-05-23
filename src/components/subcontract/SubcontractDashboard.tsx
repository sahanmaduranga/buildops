import React, { useState } from 'react';
import { useSubcontract } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  DollarSign, 
  Percent, 
  Briefcase, 
  CheckSquare, 
  Hourglass, 
  Clock, 
  AlertCircle, 
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Award,
  Wallet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { cn } from '../../lib/utils.ts';

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function SubcontractDashboard() {
  const { currentProject } = useProject();
  const { subcontractors, packages, ipcs, variations } = useSubcontract();
  
  // Local filters
  const [selectedSub, setSelectedSub] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1">Please select an active project workspace to load its commercial subcontract dashboard.</p>
      </div>
    );
  }

  // Filter project-specific data
  const projectPackages = packages.filter(p => p.projectId === currentProject.id);
  const projectIPCs = ipcs.filter(i => i.projectId === currentProject.id);
  const projectVariations = variations.filter(v => v.projectId === currentProject.id);

  // Apply filters
  const filteredPackages = projectPackages.filter(p => {
    const matchesSub = selectedSub === 'All' || p.subcontractorId === selectedSub;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSub && matchesStatus;
  });

  // Calculate high-fidelity totals
  const totalSubcontractValue = filteredPackages.reduce((sum, p) => sum + p.revisedContractValue, 0);
  const totalOriginalContractValue = filteredPackages.reduce((sum, p) => sum + p.originalContractValue, 0);
  
  // Certified Amount -> Approved/Submitted IPCs sum
  const approvedIPCs = projectIPCs.filter(i => i.status === 'Approved' || i.status === 'Paid');
  const totalCertifiedRaw = approvedIPCs.reduce((sum, i) => sum + i.certifiedAmount, 0);
  const totalNetPaid = projectIPCs.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.netAmount, 0);
  
  // Retention held across certified IPCs
  const totalRetentionHeld = approvedIPCs.reduce((sum, i) => sum + i.retentionAmount, 0);
  // Advance recovery across certified IPCs
  const totalAdvanceRecovered = approvedIPCs.reduce((sum, i) => sum + i.advanceRecoveryAmount, 0);
  
  const pendingIPCCount = projectIPCs.filter(i => i.status === 'Submitted' || i.status === 'Reviewed').length;
  const delayedPackages = filteredPackages.filter(p => p.status === 'Active' && new Date(p.endDate) < new Date('2026-05-23')).length;

  // Chart 1: Progress percentage by Package
  const progressChartData = filteredPackages.map(p => {
    // progress is estimated by comparing certified amount to revised contract value
    const cert = projectIPCs.filter(i => i.packageId === p.id && (i.status === 'Approved' || i.status === 'Paid')).reduce((sum, i) => sum + i.certifiedAmount, 0);
    const progressPercent = p.revisedContractValue > 0 ? Math.round((cert / p.revisedContractValue) * 100) : 0;
    return {
      name: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
      Progress: Math.min(progressPercent, 100),
      Value: p.revisedContractValue
    };
  });

  // Chart 2: Certified value trends monthly
  const monthlyData = [
    { month: 'Jan', Certified: 2500, Cumulative: 2500 },
    { month: 'Feb', Certified: 3200, Cumulative: 5700 },
    { month: 'Mar', Certified: 1800, Cumulative: 7500 },
    { month: 'Apr', Certified: 4600, Cumulative: 12100 },
    { month: 'May', Certified: (totalCertifiedRaw > 0 ? Math.round(totalCertifiedRaw * 0.4) : 5200), Cumulative: 17300 },
    { month: 'Jun (YTD)', Certified: (totalCertifiedRaw > 0 ? Math.round(totalCertifiedRaw * 0.6) : 6800), Cumulative: (totalCertifiedRaw > 0 ? Math.round(totalCertifiedRaw) : 24100) }
  ];

  // Chart 3: Distribution by Specialty
  const specialtyDistribution = filteredPackages.reduce((acc: Record<string, number>, p) => {
    acc[p.packageType] = (acc[p.packageType] || 0) + p.revisedContractValue;
    return acc;
  }, {});

  const pieChartData = Object.keys(specialtyDistribution).map(key => ({
    name: key,
    value: specialtyDistribution[key]
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-zinc-600 font-sans">
      
      {/* Search and context row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="font-extrabold text-slate-900 tracking-tight text-sm">Commercial Subcontract Monitor</span>
          <span className="text-slate-350 select-none">•</span>
          <span className="text-[11.5px] font-bold text-slate-400">{currentProject.code}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-400 whitespace-nowrap">Subcontractor</span>
            <select
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="All">All Companies</option>
              {subcontractors.map(s => (
                <option key={s.id} value={s.id}>{s.name.substring(0, 20)}...</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-400 whitespace-nowrap">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="All">All Packages</option>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-6 -translate-y-6" />
          <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500 flex items-center gap-1">
            <Briefcase size={12} /> Total Subcontracts Value
          </p>
          <h3 className="text-xl font-black text-slate-900 mt-2">{formatCurrency(totalSubcontractValue)}</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
            <span>Revised from</span>
            <span className="font-bold underline">{formatCurrency(totalOriginalContractValue)}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-6 -translate-y-6" />
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 flex items-center gap-1">
            <Award size={12} /> Certified to Date
          </p>
          <h3 className="text-xl font-black text-slate-900 mt-2">{formatCurrency(totalCertifiedRaw)}</h3>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2.5">
            <div 
              className="bg-emerald-500 h-1 rounded-full" 
              style={{ width: `${totalSubcontractValue > 0 ? (totalCertifiedRaw / totalSubcontractValue) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-bold flex items-center justify-between">
            <span>Progress certification Rate</span>
            <span>{totalSubcontractValue > 0 ? Math.round((totalCertifiedRaw / totalSubcontractValue) * 100) : 0}%</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full translate-x-6 -translate-y-6" />
          <p className="text-[10px] uppercase font-black tracking-widest text-cyan-600 flex items-center gap-1">
            <Wallet size={12} /> Paid Out YTD
          </p>
          <h3 className="text-xl font-black text-cyan-700 mt-2">{formatCurrency(totalNetPaid)}</h3>
          <p className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
            <span>Actual Net transfers</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-1 shadow-sm">
          <p className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1">
            <Percent size={12} /> Retention Held
          </p>
          <h3 className="text-[16px] font-black text-slate-900 mt-2.5">{formatCurrency(totalRetentionHeld)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">To be certified at Completion</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-1 shadow-sm">
          <p className="text-[10px] uppercase font-black tracking-widest text-rose-500 flex items-center gap-1">
            <TrendingUp size={12} /> Pending IPCs
          </p>
          <h3 className="text-[17px] font-black text-rose-600 mt-2">{pendingIPCCount} Requests</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Awaiting PM / QS signoff</p>
        </div>

      </div>

      {/* Visual Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart A: Package Program progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col h-[320px]">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Work Packages Certification Program</h4>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Compares certified progress value as percentage against revised subcontract budgets.</p>
          </div>
          <div className="flex-1 min-h-0 mt-4">
            {progressChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">No comparative package data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barSize={34}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="%" />
                  <Tooltip formatter={(value) => [`${value}% certified`, 'Certification Status']} />
                  <Bar dataKey="Progress" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Distribution Pie */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[320px]">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Package Value distribution</h4>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Value breakdown by engineering specialty (civil, MEP, structural).</p>
          </div>
          <div className="flex-1 min-h-0 mt-4 relative flex items-center justify-center">
            {pieChartData.length === 0 ? (
              <div className="text-slate-400 text-xs italic">No contract allocation data.</div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Sublet</span>
                    <span className="text-sm font-black text-slate-900">{formatCurrency(totalSubcontractValue)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold border-t border-slate-50 pt-2 shrink-0">
                  {pieChartData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-500 truncate">{d.name}:</span>
                      <span className="text-slate-800 font-extrabold ml-auto shrink-0">{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Trackers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending / Recent Commercial Valuations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[325px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
            <h4 className="font-bold text-slate-900 text-sm">Recent Valuation Progress Requests</h4>
            <span className="bg-indigo-50 text-indigo-700 font-black tracking-wide font-mono px-2 py-0.5 rounded text-[9.5px]">IPC MONITOR</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {projectIPCs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">No monthly interim payment bills mapped.</div>
            ) : (
              <div className="space-y-2">
                {projectIPCs.slice(0, 4).map(ipc => {
                  const pkg = projectPackages.find(p => p.id === ipc.packageId);
                  const sub = subcontractors.find(s => s.id === ipc.subcontractorId);
                  return (
                    <div key={ipc.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-350 transition gap-4">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 font-mono text-[11px] bg-slate-200/60 px-1.5 py-0.5 rounded">{ipc.ipcNo}</span>
                          <span className="text-[10.5px] font-bold text-slate-400 leading-none">{ipc.period}</span>
                        </div>
                        <h5 className="font-bold text-slate-800 truncate mt-1">{pkg ? pkg.name : 'Unknown Subcontract Package'}</h5>
                        <p className="text-[10.5px] text-slate-400 truncate flex items-center gap-1 font-semibold">{sub ? sub.name : 'Unassigned subcontractor'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-slate-950 text-xs">{formatCurrency(ipc.certifiedAmount)}</p>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider block mt-1 text-center w-20 ml-auto leading-none",
                          ipc.status === 'Approved' || ipc.status === 'Paid' 
                            ? "bg-emerald-50 text-emerald-700" 
                            : ipc.status === 'Submitted' 
                              ? "bg-amber-50 text-amber-700" 
                              : "bg-slate-100 text-slate-500"
                        )}>
                          {ipc.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Change Controls and Claims */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[325px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
            <h4 className="font-bold text-slate-900 text-sm">Pending & Approved Variations Orders</h4>
            <span className="bg-amber-50 text-amber-700 font-black tracking-wide font-mono px-2 py-0.5 rounded text-[9.5px]">VO LEDGER</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto font-sans">
            {projectVariations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">No variation orders or modifications requested.</div>
            ) : (
              <div className="space-y-2">
                {projectVariations.slice(0, 4).map(vo => {
                  const pkg = projectPackages.find(p => p.id === vo.packageId);
                  return (
                    <div key={vo.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-350 transition gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-amber-700 font-mono text-[10.5px] bg-amber-50 border border-amber-200/50 px-1.5 py-0.2 rounded">{vo.voNumber}</span>
                          {vo.approvedDate && <span className="text-[10px] text-slate-400 font-bold">Approved {vo.approvedDate}</span>}
                        </div>
                        <h5 className="font-bold text-slate-800 truncate leading-none mt-1">{vo.description}</h5>
                        <p className="text-[10.5px] text-slate-500 truncate leading-relaxed italic">Reason: {vo.reason}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-rose-600 text-xs">+ {formatCurrency(vo.amount)}</p>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider block mt-1 text-center w-22 ml-auto leading-none",
                          vo.status === 'Approved' 
                            ? "bg-emerald-50 text-emerald-700" 
                            : vo.status === 'Pending Approval' 
                              ? "bg-rose-50 text-rose-700 font-extrabold" 
                              : "bg-slate-100 text-slate-500"
                        )}>
                          {vo.status === 'Pending Approval' ? 'Awaiting Sign' : vo.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
