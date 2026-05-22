import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Filter, 
  Download, 
  Search,
  Plus,
  BarChart3,
  TrendingDown,
  Calendar,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  X,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn(
    "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider",
    status === 'Active' ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
  )}>
    {status}
  </span>
);

const delayTrendData = [
  { name: 'Jan', design: 4, weather: 2, logistics: 1 },
  { name: 'Feb', design: 3, weather: 0, logistics: 2 },
  { name: 'Mar', design: 8, weather: 5, logistics: 3 },
  { name: 'Apr', design: 5, weather: 1, logistics: 4 },
  { name: 'May', design: 12, weather: 3, logistics: 6 },
];

export const DelayManagement = () => {
  const { delays, addDelay, tasks } = useProgress();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newDelay, setNewDelay] = useState({
    taskId: tasks[0]?.id || '',
    reason: '',
    category: 'Logistics',
    startDate: new Date().toISOString().split('T')[0],
    impactDays: 0,
    status: 'Active',
    responsibleParty: 'Site Logistics Team'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDelay({
      ...newDelay,
      id: `DLY-${Math.floor(Math.random() * 10000)}`
    });
    setIsModalOpen(false);
    setNewDelay({
      taskId: tasks[0]?.id || '',
      reason: '',
      category: 'Logistics',
      startDate: new Date().toISOString().split('T')[0],
      impactDays: 0,
      status: 'Active',
      responsibleParty: 'Site Logistics Team'
    });
  };

  const filteredDelays = delays.filter(d => 
    (d.reason?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (d.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delay Incident Management</h2>
          <p className="text-[13px] text-slate-500 font-medium">Track, analyze, and mitigate project execution delays</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[13px] font-black hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95"
          >
            <Plus size={18} />
            Record Delay Incident
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle size={24} />
           </div>
           <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Active Delays</span>
              <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">{delays.filter(d => d.status === 'Active').length}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
           </div>
           <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Total Impact</span>
              <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">
                {delays.reduce((sum, d) => sum + d.impactDays, 0)} <span className="text-[11px] font-bold text-slate-400">Days</span>
              </p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldAlert size={24} />
           </div>
           <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Mitigated Ratio</span>
              <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">64%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-600" />
              Delay Category Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={delayTrendData} layout="vertical" margin={{ left: -10 }}>
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                   <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                   />
                   <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                   <Bar dataKey="design" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} name="Design Issues" />
                   <Bar dataKey="weather" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Weather" />
                   <Bar dataKey="logistics" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} name="Logistics" />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-primary-600" />
              Impact Over Time (Recovery Curve)
            </h3>
          </div>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={delayTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                   <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                   <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                   />
                   <Line type="monotone" dataKey="design" stroke="#ef4444" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} name="Incident Days" />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Delay Incident log
           </h3>
           <div className="flex gap-2">
              <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search delays..." 
                    className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                 <Download size={16} />
              </button>
           </div>
        </div>
        <table className="w-full border-collapse text-[13px]">
           <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <tr>
                 <th className="text-left p-4">Incident #</th>
                 <th className="text-left p-4">Description / Root Cause</th>
                 <th className="text-center p-4">Category</th>
                 <th className="text-center p-4">Duration</th>
                 <th className="text-center p-4">Status</th>
                 <th className="text-left p-4">Responsible</th>
                 <th className="text-right p-4">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {filteredDelays.map((rec) => (
                 <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="p-4 font-black font-mono text-slate-400">{rec.id}</td>
                    <td className="p-4">
                       <div className="flex flex-col">
                          <span className="font-black text-slate-900">{rec.reason}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">Started: {new Date(rec.startDate).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center justify-center gap-2 px-3 py-1 bg-slate-50 rounded-full w-fit mx-auto border border-slate-100">
                          <span className="text-[10px] font-black text-slate-500 uppercase">{rec.category}</span>
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className="font-black text-red-600">{rec.impactDays} Days</span>
                    </td>
                    <td className="p-4 text-center">
                       <StatusBadge status={rec.status} />
                    </td>
                    <td className="p-4 font-bold text-slate-600">
                       {rec.responsibleParty}
                    </td>
                    <td className="p-4 text-right">
                       <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                          <ChevronRight size={18} />
                       </button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* Add Delay Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg text-white">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Record Delay Incident</h3>
                    <p className="text-[11px] text-red-600 font-bold uppercase tracking-widest">Impact assessment entry</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Task</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    value={newDelay.taskId}
                    onChange={e => setNewDelay({...newDelay, taskId: e.target.value})}
                  >
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delay Reason / Description</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold"
                    placeholder="e.g. Excavator breakdown on sector 4"
                    value={newDelay.reason}
                    onChange={e => setNewDelay({...newDelay, reason: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold"
                      value={newDelay.category}
                      onChange={e => setNewDelay({...newDelay, category: e.target.value})}
                    >
                      <option value="Logistics">Logistics</option>
                      <option value="Design">Design</option>
                      <option value="Weather">Weather</option>
                      <option value="Labor">Labor</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact (Days)</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold"
                      value={newDelay.impactDays}
                      onChange={e => setNewDelay({...newDelay, impactDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsible Party</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold"
                    value={newDelay.responsibleParty}
                    onChange={e => setNewDelay({...newDelay, responsibleParty: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-black hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl text-[13px] font-black hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95 uppercase tracking-widest"
                  >
                    Record Incident
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

