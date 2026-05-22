import React from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText, 
  Users, 
  CheckCircle, 
  Calendar,
  DollarSign, 
  Clock,
  MapPin,
  Camera,
  Layers,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export const ProjectWorkspaceDashboard = () => {
  const { currentProject, projectMembers, projectDocuments, projectEvents } = useProject();
  const { progressUpdates, delays, photos } = useProgress();

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-zentrix-border rounded-xl shadow-sm">
        <Building2 size={48} className="text-slate-300 mb-4 animate-bounce" />
        <h4 className="text-md font-bold text-zentrix-blue">No Project Selected</h4>
        <p className="text-slate-400 max-w-sm text-xs mt-1">Select a construction project from the portfolio or global switcher to activate the workspace.</p>
      </div>
    );
  }

  // Calculate project-specific values
  const members = projectMembers.filter(m => m.projectId === currentProject.id);
  const docs = projectDocuments.filter(d => d.projectId === currentProject.id);
  const events = projectEvents.filter(e => e.projectId === currentProject.id);
  
  // Progress calculations based on mock status or custom settings
  let workProgress = 25;
  let spi = 0.98;
  let cpi = 0.95;
  let delayTasksCount = 0;
  let pendingLogsCount = 0;

  if (currentProject.id === 'proj-1') {
    workProgress = 45;
    spi = 1.05;
    cpi = 0.98;
    delayTasksCount = 2;
    pendingLogsCount = 1;
  } else if (currentProject.id === 'proj-2') {
    workProgress = 12;
    spi = 0.85;
    cpi = 0.92;
    delayTasksCount = 1;
    pendingLogsCount = 0;
  } else if (currentProject.id === 'proj-3') {
    workProgress = 92;
    spi = 1.00;
    cpi = 1.01;
    delayTasksCount = 0;
    pendingLogsCount = 0;
  } else if (currentProject.id === 'proj-4') {
    workProgress = 0;
    spi = 1.00;
    cpi = 1.00;
    delayTasksCount = 0;
    pendingLogsCount = 0;
  } else if (currentProject.id === 'proj-5') {
    workProgress = 15;
    spi = 0.95;
    cpi = 1.05;
    delayTasksCount = 1;
    pendingLogsCount = 0;
  } else if (currentProject.id === 'proj-6') {
    workProgress = 100;
    spi = 1.00;
    cpi = 0.97;
    delayTasksCount = 0;
    pendingLogsCount = 0;
  }

  // Budget calculations
  const totalBudget = currentProject.budget;
  const spent = currentProject.spentToDate || 0;
  const budgetUtilization = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const costVariance = spent - (totalBudget * (workProgress / 100));

  // 1. S-Curve Dynamic Recharts Mock Data
  const sCurveData = [
    { month: 'Jun 24', planned: 5, actual: 4 },
    { month: 'Aug 24', planned: 15, actual: 12 },
    { month: 'Oct 24', planned: 30, actual: 28 },
    { month: 'Dec 24', planned: 45, actual: 42 },
    { month: 'Feb 25', planned: 60, actual: currentProject.id === 'proj-1' ? 45 : undefined },
    { month: 'Apr 25', planned: 75, actual: undefined },
    { month: 'Jun 25', planned: 90, actual: undefined },
    { month: 'Aug 25', planned: 100, actual: undefined },
  ].filter(d => currentProject.id !== 'proj-4'); // Empty if planning

  // 2. Cash Flow / Cost Trend Over Time data
  const cashFlowData = [
    { name: 'Q1 24', budget: 15, spent: 14, projection: 15 },
    { name: 'Q2 24', budget: 35, spent: 32, projection: 35 },
    { name: 'Q3 24', budget: 55, spent: 54, projection: 56 },
    { name: 'Q4 24', budget: 75, spent: 78, projection: 80 },
    { name: 'Q1 25', budget: 95, spent: spent > 1000000 ? 98 : undefined, projection: 100 },
  ];

  // 3. Delay distribution percentages
  const delayPieData = [
    { name: 'Design / RFI', value: 40, color: '#4f46e5' },
    { name: 'Weather Obstructions', value: 25, color: '#f59e0b' },
    { name: 'Logistics / Materials', value: 20, color: '#ef4444' },
    { name: 'Subcontractor Crew', value: 15, color: '#10b981' },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val} ${currentProject.currency}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Visual Banner Header */}
      <div className="relative bg-white border border-zentrix-border rounded-xl p-6 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-primary-50/20 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0 border border-primary-100 shadow-sm">
            <Building2 size={28} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 rounded border border-slate-200">
                {currentProject.code}
              </span>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                ● {currentProject.sector}
              </span>
            </div>
            <h2 className="text-xl font-black text-zentrix-blue mt-1 tracking-tight leading-none">
              {currentProject.name}
            </h2>
            <p className="text-[12px] text-zinc-500 mt-1.5 flex items-center gap-1">
              <MapPin size={13} className="text-slate-400" /> {currentProject.address}, {currentProject.city}, {currentProject.state}
            </p>
          </div>
        </div>

        {/* Timeline Indicator */}
        <div className="flex items-center gap-6 pr-4 border-dashed border-slate-100 md:border-l md:pl-6 text-xs text-slate-500">
          <div>
            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Timeline Start</p>
            <p className="font-bold text-zentrix-blue text-[13px] mt-1">{currentProject.startDate}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Target Handover</p>
            <p className="font-bold text-zentrix-blue text-[13px] mt-1">{currentProject.plannedFinishDate}</p>
          </div>
        </div>
      </div>

      {/* 4 Block KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress KPI */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Work Accomplished</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="text-2xl font-black text-primary-600">{workProgress}%</h3>
            <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              SPI: {spi}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${workProgress}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Earned value physical units verification</p>
        </div>

        {/* Budget KPI */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Budget Utilization</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="text-2xl font-black text-zentrix-blue">{budgetUtilization.toFixed(1)}%</h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${cpi < 1.0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              CPI: {cpi}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <DollarSign size={12} /> Spent: <strong className="text-slate-700">{formatCurrency(spent)}</strong> / {formatCurrency(totalBudget)}
          </p>
        </div>

        {/* Delayed Tasks KPI */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Delays</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className={`text-2xl font-black ${delayTasksCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
              {delayTasksCount}
            </h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${delayTasksCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              {delayTasksCount > 1 ? 'High Risk' : delayTasksCount > 0 ? 'Warning' : 'Healthy'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <Clock size={12} /> Cumulative path delay: <strong className={delayTasksCount > 0 ? 'text-rose-600' : 'text-slate-700'}>{delayTasksCount > 0 ? '8 Days' : '0 Days'}</strong>
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Workflow Approvals</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className={`text-2xl font-black ${pendingLogsCount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
              {pendingLogsCount}
            </h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pendingLogsCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              {pendingLogsCount > 0 ? 'Pending PM' : 'Cleared'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <FileText size={12} /> Daily progress quantities awaits review
          </p>
        </div>
      </div>

      {/* Main Charts & Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* S-Curve cumulative chart */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-4">
            <div>
              <h4 className="font-bold text-zentrix-blue">S-Curve Analysis</h4>
              <p className="text-[11px] text-slate-400">Cumulative physical accomplished vs. planned master line</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-indigo-500" />
                <span className="text-indigo-600 font-bold">Planned Baseline</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-emerald-500" />
                <span className="text-emerald-600 font-bold">Actual Work</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            {sCurveData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis ticks={[0, 20, 40, 60, 80, 100]} unit="%" stroke="#94A3B8" fontSize={11} />
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Line type="monotone" dataKey="planned" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center border border-dashed border-slate-100 rounded-lg">
                <Calendar size={32} className="text-slate-300 mb-2" />
                No scheduling milestones recorded.
                <p className="text-[10px] text-slate-300 mt-1">S-Curve displays cumulative progress once milestones are locked.</p>
              </div>
            )}
          </div>
        </div>

        {/* Delay analysis factor pie */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
          <div>
            <h4 className="font-bold text-zentrix-blue">Delay Analysis Breakdown</h4>
            <p className="text-[11px] text-slate-400">Distribution of schedule delays by site categories</p>
          </div>
          <div className="h-44 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={delayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {delayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Primary Cost</span>
              <span className="text-md font-black text-zentrix-blue mt-0.5">RFI Resp</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-4 border-t border-dashed border-slate-100 pt-3">
            {delayPieData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="truncate">{p.name}: <strong className="text-slate-700">{p.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Trend & Cash Flow Bar chart */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-2">
          <div>
            <h4 className="font-bold text-zentrix-blue">Financial Trend & Cash Flow</h4>
            <p className="text-[11px] text-slate-400">Quarterly planned vs. actual spent analysis ($ Thousands)</p>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="budget" name="Planned Budget" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent to Date" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site Details Sidebar Widget */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-zentrix-blue">Operational Personnel</h4>
            <p className="text-[11px] text-slate-400">Team staffing directory for this project</p>
          </div>
          <div className="space-y-3 mt-4 flex-1">
            {members.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-zentrix-blue uppercase">
                    {m.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 truncate max-w-[120px]">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${m.permissionLevel === 'Admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                  {m.permissionLevel}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-slate-100 pt-3 mt-4 text-center">
            <span className="text-[11px] text-primary-600 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1">
              View Entire {members.length} Members Staffing <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Site Photos Widget */}
      <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-4">
          <div>
            <h4 className="font-bold text-zentrix-blue">Recent Site Photos Log</h4>
            <p className="text-[11px] text-slate-400">Visual proof documents associated with this project workspace</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">📷 {photos.length} Captured Images</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.slice(0, 4).map((p) => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden border border-slate-100 h-28 cursor-pointer">
              <img 
                src={p.url} 
                alt={p.caption} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5" />
              <div className="absolute bottom-1.5 left-2 right-2 text-white truncate text-[10px] font-bold group-hover:block hidden">
                {p.caption}
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-4 py-8 text-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
              No site photos captured yet for this workspace. Use Progress Log to upload site snaps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
