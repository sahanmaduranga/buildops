import React from 'react';
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
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  MoreVertical,
  Activity,
  Layers,
  ChevronRight,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { type DashboardMetric } from '../types.ts';

const metrics: DashboardMetric[] = [
  { label: 'Total Projects', value: 12, change: 8.5, trend: 'up' },
  { label: 'Active Schedules', value: 24, change: 12.2, trend: 'up' },
  { label: 'Delayed Tasks', value: 5, change: -15.4, trend: 'down' },
  { label: 'Upcoming Milestones', value: 8, change: 0, trend: 'neutral' },
];

const progressData = [
  { month: 'Jan', planned: 5, actual: 4 },
  { month: 'Feb', planned: 15, actual: 12 },
  { month: 'Mar', planned: 25, actual: 28 },
  { month: 'Apr', planned: 45, actual: 40 },
  { month: 'May', planned: 65, actual: 58 },
  { month: 'Jun', planned: 85, actual: 75 },
];

const resourceUtilization = [
  { name: 'Labor', value: 75 },
  { name: 'Equipment', value: 62 },
  { name: 'Material', value: 88 },
];

const COLORS = ['#2563eb', '#8b5cf6', '#10b981'];

const RecentActivity = () => (
  <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
    <div className="p-5 border-b border-zentrix-border flex items-center justify-between">
      <h3 className="font-bold text-zentrix-blue flex items-center gap-2">
        <Activity size={18} className="text-primary-600" />
        Recent Activity
      </h3>
      <button className="text-primary-600 text-[12px] font-bold hover:underline">View All</button>
    </div>
    <div className="p-5 space-y-5 overflow-y-auto flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 group">
          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary-200 group-hover:bg-primary-50 transition-colors">
            <CheckCircle2 size={14} className="text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-zentrix-blue font-medium leading-tight">
              Task <span className="font-bold">#2.1 Foundations</span> was completed by Robert Chen
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-zentrix-muted">2 hours ago</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-primary-600 font-bold">Building A</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TaskAlerts = () => (
  <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
    <div className="p-5 border-b border-zentrix-border flex items-center justify-between">
      <h3 className="font-bold text-zentrix-blue flex items-center gap-2">
        <AlertTriangle size={18} className="text-amber-500" />
        Priority Alerts
      </h3>
      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">3 Critical</span>
    </div>
    <div className="p-5 space-y-4 overflow-y-auto flex-1">
      {[
        { task: 'Excavation Phase 2', project: 'Skyline Residence', delay: '4 Days', level: 'Critical' },
        { task: 'Steel Procurement', project: 'Industrial Park', delay: '2 Days', level: 'High' },
        { task: 'Site Mobilization', project: 'Green Valley', delay: '1 Day', level: 'Medium' },
      ].map((alert, i) => (
        <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-amber-200 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[13px] font-bold text-zentrix-blue group-hover:text-primary-600 transition-colors">{alert.task}</p>
            <span className={cn(
               "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
               alert.level === 'Critical' ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"
            )}>
              {alert.level}
            </span>
          </div>
          <p className="text-[11px] text-zentrix-muted mb-2">{alert.project}</p>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600">
            <Clock size={12} />
            Delayed by {alert.delay}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SOTDashboard = ({ onLaunchProgress }: { onLaunchProgress?: () => void }) => {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-xl border border-zentrix-border shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                {metric.label === 'Total Projects' && <Layers size={20} className="text-primary-600" />}
                {metric.label === 'Active Schedules' && <Calendar size={20} className="text-secondary-600" />}
                {metric.label === 'Delayed Tasks' && <AlertTriangle size={20} className="text-red-500" />}
                {metric.label === 'Upcoming Milestones' && <CheckCircle2 size={20} className="text-green-500" />}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full",
                metric.trend === 'up' ? "text-green-600 bg-green-50" : 
                metric.trend === 'down' ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50"
              )}>
                {metric.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {metric.change !== 0 ? `${Math.abs(metric.change)}%` : 'Stable'}
              </div>
            </div>
            <p className="text-[13px] text-zentrix-muted font-medium mb-1">{metric.label}</p>
            <h3 className="text-2xl font-bold text-zentrix-blue">{metric.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Quick Access */}
        <div className="lg:col-span-3 bg-gradient-to-r from-primary-900 to-primary-700 rounded-xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={120} />
           </div>
           <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <Target size={24} />
                Site Execution & Progress Tracking
              </h3>
              <p className="text-primary-100 text-[14px] max-w-2xl font-medium leading-relaxed">
                Connect site reality with project plans. Record daily quantities, track resource productivity, and manage delays in real-time.
              </p>
           </div>
           <div className="flex gap-3 relative z-10 w-full md:w-auto">
              <button 
                onClick={onLaunchProgress}
                className="flex-1 md:flex-none px-6 py-3 bg-white text-primary-600 rounded-xl font-black text-[14px] shadow-lg hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              >
                Launch Progress Tracker
                <ArrowRight size={18} />
              </button>
              <button className="flex-1 md:flex-none px-6 py-3 bg-primary-800 text-white rounded-xl font-bold text-[14px] hover:bg-primary-900 transition-all">
                Daily Site Logs
              </button>
           </div>
        </div>

        {/* Main Progress Chart */}
        <div className="lg:col-span-2 bg-white border border-zentrix-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zentrix-blue mb-1">Planned vs Actual Progress</h3>
              <p className="text-[12px] text-zentrix-muted">Cumulative progress analysis across all active projects</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-bold text-zentrix-blue">
                 <div className="w-2 h-2 rounded-full bg-primary-600" />
                 Planned
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-bold text-zentrix-blue">
                 <div className="w-2 h-2 rounded-full bg-secondary-500" />
                 Actual
               </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPlanned)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-zentrix-blue mb-2">Resource Utilization</h3>
          <p className="text-[12px] text-zentrix-muted mb-8">Average efficiency across active sites</p>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {resourceUtilization.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4 mt-4">
              {resourceUtilization.map((item, index) => (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[12px] font-medium">
                    <span className="text-zentrix-blue flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                       {item.name}
                    </span>
                    <span className="text-zentrix-muted">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.value}%`, backgroundColor: COLORS[index] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[400px]">
          <RecentActivity />
        </div>
        <div className="h-[400px]">
          <TaskAlerts />
        </div>
        
        {/* Monthly Progress Curve (S-Curve) */}
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-zentrix-blue">Monthly Progress Curve</h3>
            <button className="p-1.5 text-slate-400 hover:text-zentrix-blue hover:bg-slate-50 rounded-lg"><MoreVertical size={16} /></button>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {[
                { label: 'Work Performed', value: '$842,500', target: '$950,000', color: '#2563eb' },
                { label: 'Resource Burn Rate', value: '$45,200/wk', target: '$40,000/wk', color: '#8b5cf6' },
                { label: 'Project Health', value: 'On Track', target: 'Normal', color: '#10b981' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[11px] text-zentrix-muted uppercase font-bold tracking-wider">{stat.label}</p>
                      <p className="text-lg font-bold text-zentrix-blue leading-none mt-1">{stat.value}</p>
                    </div>
                    <p className="text-[11px] text-zentrix-muted">Target: {stat.target}</p>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: '85%', 
                        backgroundColor: stat.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-100 text-zentrix-blue text-[13px] font-bold rounded-lg hover:bg-slate-100 hover:border-slate-200 transition-all group">
              Generate Detailed Report
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
