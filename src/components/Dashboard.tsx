import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Users, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Edit3
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '../lib/utils.ts';

const costData = [
  { name: 'Jan', budget: 120000, actual: 115000 },
  { name: 'Feb', budget: 150000, actual: 162000 },
  { name: 'Mar', budget: 180000, actual: 175000 },
  { name: 'Apr', budget: 140000, actual: 145000 },
  { name: 'May', budget: 160000, actual: 158000 },
  { name: 'Jun', budget: 200000, actual: 195000 },
];

const resourceDistribution = [
  { name: 'Material', value: 55, color: '#3b82f6' },
  { name: 'Labor', value: 25, color: '#f97316' },
  { name: 'Equipment', value: 15, color: '#8b5cf6' },
  { name: 'Subcon', value: 5, color: '#10b981' },
];

const MetricCard = ({ label, value, change, trend, icon: Icon }: any) => (
  <div className="bg-white p-5 rounded-lg border border-zentrix-border shadow-sm group hover:border-primary-500 transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className="text-zentrix-muted group-hover:text-primary-600 transition-colors">
        <Icon size={18} />
      </div>
      <div className={cn(
        "text-[10px] font-bold px-1.5 py-0.5 rounded",
        trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      )}>
        {trend === 'up' ? '↑' : '↓'} {change}%
      </div>
    </div>
    <p className="text-zentrix-muted text-[11px] font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl font-bold text-zentrix-blue mt-0.5">{value}</p>
  </div>
);

export const Dashboard = () => {
  return (
    <div className="h-full space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] text-zentrix-muted font-medium mb-1">Portfolio / Abu Dhabi Tower C / Analytics</div>
          <h2 className="text-xl font-semibold text-zentrix-blue leading-tight">Executive Performance Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-zentrix-border flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium text-slate-600">
             <Calendar size={14} className="text-primary-500" />
             <span>Q2 2024 Overview</span>
          </div>
          <button className="bg-primary-600 text-white px-4 py-1.5 rounded-md text-[13px] font-medium hover:bg-primary-700 flex items-center gap-2 shadow-sm transition-all">
             <ArrowUpRight size={14} /> Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          label="Estimated Budget" 
          value="$12.4M" 
          change={12} 
          trend="up" 
          icon={Briefcase} 
        />
        <MetricCard 
          label="Actual Cost" 
          value="$4.8M" 
          change={5.4} 
          trend="up" 
          icon={DollarSign} 
        />
        <MetricCard 
          label="Total Man-Hours" 
          value="42,850" 
          change={2.1} 
          trend="down" 
          icon={Users} 
        />
        <MetricCard 
          label="Risk Incidents" 
          value="0" 
          change={0} 
          trend="up" 
          icon={AlertCircle} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-zentrix-border shadow-sm min-h-[360px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-bold text-zentrix-blue">Consolidated Spend Analytics</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                  <span className="text-slate-400">Budget</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary-200 rounded-full"></span>
                  <span className="text-slate-400">Actual</span>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData}>
                <defs>
                   <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="budget" stroke="#2563eb" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} />
                <Area type="monotone" dataKey="actual" stroke="#94a3b8" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zentrix-border shadow-sm flex flex-col">
          <h3 className="text-[13px] font-bold text-zentrix-blue mb-6">Budget Distribution</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { fill: '#1e293b' },
                      { fill: '#2563eb' },
                      { fill: '#f59e0b' },
                      { fill: '#94a3b8' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
               <p className="text-xl font-bold text-zentrix-blue">100%</p>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Budgeted</p>
            </div>
          </div>
          <div className="space-y-2 mt-6">
            {resourceDistribution.map((item, i) => {
              const colors = ['bg-[#1e293b]', 'bg-[#2563eb]', 'bg-[#f59e0b]', 'bg-[#94a3b8]'];
              return (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors[i])}></div>
                    <span className="text-slate-500 font-medium">{item.name}</span>
                  </div>
                  <span className="text-zentrix-blue font-bold">{item.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-zentrix-border shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold text-zentrix-blue">Active Project Milestones</h3>
              <button className="text-[11px] font-bold text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors">View Timeline</button>
           </div>
           <div className="space-y-5">
              {[
                { name: 'Foundations & Excavation', progress: 100, status: 'Completed', date: 'May 02' },
                { name: 'Structural Superstructure', progress: 65, status: 'In Progress', date: 'Jul 20' },
                { name: 'Mechanical & Electrical', progress: 12, status: 'Delayed', date: 'Nov 15' },
              ].map((project, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-zentrix-blue">{project.name}</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                        project.status === 'Completed' ? "bg-green-50 text-green-600" : 
                        project.status === 'Delayed' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      )}>{project.status}</span>
                   </div>
                   <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          project.status === 'Completed' ? "bg-green-500" : 
                          project.status === 'Delayed' ? "bg-red-500" : "bg-primary-600"
                        )}
                        style={{ width: `${project.progress}%` }}
                      />
                   </div>
                   <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      <span>{project.progress}% Completion</span>
                      <span>Deadline: {project.date}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zentrix-border shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold text-zentrix-blue">Critical Audit Trail</h3>
              <button className="text-[11px] font-bold text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors">Export Log</button>
           </div>
           <div className="space-y-2">
              {[
                { user: 'Sarah J.', action: 'Authorized PO #812', target: 'MAT-ST-01', time: '14m', icon: CheckCircle2, color: 'text-green-500' },
                { user: 'Robert C.', action: 'Baseline Revision', target: 'Project Phase 2', time: '1h', icon: Edit3, color: 'text-blue-500' },
                { user: 'System', action: 'Daily Auto-Backup', target: 'ERP Core DB', time: '3h', icon: Clock, color: 'text-slate-400' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 p-2.5 hover:bg-slate-50 rounded-md transition-all group cursor-pointer">
                   <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-zinc-600">
                        <span className="font-bold text-zentrix-blue">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-[10px] text-primary-600 font-mono mt-0.5 uppercase">{activity.target}</p>
                   </div>
                   <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{activity.time} ago</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

