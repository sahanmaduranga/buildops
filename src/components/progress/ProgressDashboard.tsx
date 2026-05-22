import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Target,
  BarChart3,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';

const KPICard = ({ label, value, subtext, trend, status, icon: Icon }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn(
        "p-2 rounded-lg",
        status === 'warning' ? "bg-amber-50 text-amber-600" : 
        status === 'error' ? "bg-red-50 text-red-600" : 
        status === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-600"
      )}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={cn(
          "flex items-center text-[11px] font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
          {subtext}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</h3>
      <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
      {!trend && subtext && <p className="text-[11px] text-slate-400 font-medium">{subtext}</p>}
    </div>
  </div>
);

const sCurveData = [
  { name: 'Jan', planned: 5, actual: 4, ev: 4.2 },
  { name: 'Feb', planned: 12, actual: 10, ev: 11 },
  { name: 'Mar', planned: 25, actual: 20, ev: 22 },
  { name: 'Apr', planned: 45, actual: 35, ev: 38 },
  { name: 'May', planned: 65, actual: 55, ev: 58 },
  { name: 'Jun', planned: 85 },
  { name: 'Jul', planned: 100 },
];

const delayTrendData = [
  { name: 'W1', delays: 3 },
  { name: 'W2', delays: 5 },
  { name: 'W3', delays: 2 },
  { name: 'W4', delays: 8 },
  { name: 'W5', delays: 12 },
  { name: 'W6', delays: 7 },
  { name: 'W7', delays: 4 },
];

export const ProgressDashboard = () => {
  const { tasks, progressUpdates, delays } = useProgress();

  const stats = useMemo(() => {
    const totalPlanned = tasks.reduce((sum, t) => sum + (t.plannedQty || 0), 0);
    const totalActual = tasks.reduce((sum, t) => sum + (t.actualQty || 0), 0);
    const avgProgress = tasks.length > 0 ? (tasks.reduce((sum, t) => sum + (t.progressPercentage || 0), 0) / tasks.length) : 0;
    
    return {
      totalTasks: tasks.length,
      avgProgress: avgProgress.toFixed(1),
      pendingApprovals: progressUpdates.filter(u => u.status === 'Submitted').length,
      activeDelays: delays.filter(d => d.status === 'Active').length,
      totalDelayImpact: delays.reduce((sum, d) => sum + d.impactDays, 0)
    };
  }, [tasks, progressUpdates, delays]);

  const delayedActivities = useMemo(() => {
    return tasks.filter(t => t.delayDays && t.delayDays > 0).slice(0, 5);
  }, [tasks]);

  const recentApprovals = useMemo(() => {
    return progressUpdates.filter(u => u.status === 'Submitted').slice(0, 5);
  }, [progressUpdates]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Progress Executive Dashboard</h2>
          <p className="text-[13px] text-slate-500 font-medium">Enterprise overview of project execution & performance</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Calendar size={14} />
            Period: May 2024
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard 
          label="Planned Progress" 
          value="64.2%" 
          subtext="Target: 65.0%" 
          icon={Target}
        />
        <KPICard 
          label="Actual Progress" 
          value={`${stats.avgProgress}%`} 
          trend={parseFloat(stats.avgProgress) < 64 ? "down" : "up"} 
          subtext={`${(parseFloat(stats.avgProgress) - 64.2).toFixed(1)}% Variance`} 
          status={parseFloat(stats.avgProgress) < 64 ? "error" : "success"} 
          icon={TrendingUp}
        />
        <KPICard 
          label="Pending Approvals" 
          value={stats.pendingApprovals} 
          subtext="Requires Immediate Action" 
          status={stats.pendingApprovals > 0 ? "warning" : "success"} 
          icon={CheckCircle2}
        />
        <KPICard 
          label="Delay Impact" 
          value={`${stats.totalDelayImpact} Days`} 
          trend="down" 
          subtext={`${stats.activeDelays} Active Incidents`} 
          status={stats.activeDelays > 0 ? "error" : "success"} 
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S-Curve Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-900 rounded-lg text-white">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Project S-Curve Analysis</h3>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600" /> Planned
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Actual
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> EV
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} unit="%" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: 'black', color: '#1e293b', marginBottom: '8px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="planned" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPlanned)" />
                <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                <Area type="monotone" dataKey="ev" stroke="#f59e0b" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900 rounded-lg text-white">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Delay Incident Trend</h3>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/10">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="delays" radius={[6, 6, 0, 0]}>
                  {delayTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.delays > 10 ? '#ef4444' : entry.delays > 5 ? '#f59e0b' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delayed Tasks Widget */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-red-500" />
              Delayed Activities
            </h3>
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{delayedActivities.length} Active</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-slate-100">
            {delayedActivities.map((task, i) => (
              <div key={task.id} className="p-4 hover:bg-slate-50 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-mono font-black text-slate-400">{task.code}</span>
                  <span className="text-[10px] font-black text-red-600 uppercase">+{task.delayDays} Days</span>
                </div>
                <h4 className="text-[13px] font-black text-slate-800 group-hover:text-primary-600 transition-colors">{task.name}</h4>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: `${task.progressPercentage}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{task.progressPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
          <button className="p-3 text-[11px] font-black text-primary-600 hover:bg-primary-50 transition-all border-t border-slate-100">VIEW ALL DELAYS</button>
        </div>

        {/* Pending Approvals Widget */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-500" />
              Pending Approvals
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">{recentApprovals.length} Requests</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-slate-100">
            {recentApprovals.map((item, i) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-bold text-slate-400">{item.reportedBy}</span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-[13px] font-black text-slate-800 group-hover:text-primary-600 transition-colors">{item.taskName}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">Qty: {item.actualQty}</span>
                  <button className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-wider">Fast Approve</button>
                </div>
              </div>
            ))}
          </div>
          <button className="p-3 text-[11px] font-black text-primary-600 hover:bg-primary-50 transition-all border-t border-slate-100">MANAGE WORKFLOWS</button>
        </div>

        {/* Site Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" />
              Site activity feed
            </h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-6">
            {progressUpdates.slice(-6).reverse().map((u, i) => (
              <div key={u.id} className="flex gap-3 relative before:absolute before:left-2.5 before:top-8 before:bottom-[-24px] before:w-[1px] before:bg-slate-100 last:before:hidden">
                <div className="w-5 h-5 rounded-full bg-slate-100 border-4 border-white ring-1 ring-slate-200 shrink-0 z-10" />
                <div className="flex-1 -mt-0.5">
                  <p className="text-[12px] text-slate-700 leading-snug">
                    <span className="font-black text-slate-900">{u.reportedBy}</span> recorded <span className="font-black text-primary-600">{u.actualQty} m3</span> of execution in <span className="font-bold underline">{u.taskName}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">{new Date(u.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

