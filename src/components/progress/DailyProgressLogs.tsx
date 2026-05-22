import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Camera, 
  CloudRain, 
  Sun, 
  Wind,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Upload,
  MoreVertical,
  ChevronRight,
  FileText,
  X,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';

const WeatherIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Sunny': return <Sun size={14} className="text-amber-500" />;
    case 'Rainy': return <CloudRain size={14} className="text-blue-500" />;
    case 'Windy': return <Wind size={14} className="text-slate-400" />;
    default: return <Sun size={14} className="text-amber-500" />;
  }
};

export const DailyProgressLogs = () => {
  const { progressUpdates, addProgressUpdate, tasks } = useProgress();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newLog, setNewLog] = useState({
    taskId: tasks[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    actualQty: 0,
    notes: '',
    weather: 'Sunny',
    workforce: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task = tasks.find(t => t.id === newLog.taskId);
    if (!task) return;

    addProgressUpdate({
      taskId: newLog.taskId,
      taskName: task.name,
      date: newLog.date,
      actualQty: newLog.actualQty,
      notes: newLog.notes,
      reportedBy: 'Robert Chen', // Mock logged in user
      status: 'Submitted'
    });
    setIsModalOpen(false);
    setNewLog({
      taskId: tasks[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      actualQty: 0,
      notes: '',
      weather: 'Sunny',
      workforce: 10
    });
  };

  const filteredLogs = progressUpdates.filter(log => 
    (log.taskName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (log.reportedBy?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Execution Logs</h2>
          <p className="text-[13px] text-slate-500 font-medium">Record and manage daily site progress data</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-[13px] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/20 active:scale-95"
        >
          <Plus size={18} />
          Create New Daily Log
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Log Inventory */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
             <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                   type="text" 
                   placeholder="Search logs by task or engineer..." 
                   className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/10 placeholder:text-slate-400 font-medium"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="flex gap-2 ml-4">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200">
                   <Filter size={18} />
                </button>
                <div className="h-9 w-[1px] bg-slate-200" />
                <button className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">All Projects</button>
                <button className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">This Week</button>
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="text-left p-4">Submission</th>
                  <th className="text-left p-4">Task / Activity</th>
                  <th className="text-right p-4">Actual Qty</th>
                  <th className="text-center p-4">Notes</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-[11px]">
                          {(log.reportedBy || 'U N').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 tracking-tight">{log.reportedBy || 'Unknown User'}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(log.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{log.taskName}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Main Building Site</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                       <span className="font-black text-slate-900">{log.actualQty}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-600 truncate max-w-[200px]">
                      {log.notes}
                    </td>
                    <td className="p-4 text-center">
                       <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider",
                          log.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          log.status === 'Submitted' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                       )}>
                          {log.status}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors"><FileText size={16} /></button>
                          <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Stats & Filters */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Submission Metrics</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[12px] font-bold text-slate-300">Approval Rate</span>
                       <span className="text-lg font-black text-emerald-400">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                       <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Weekly Logs</span>
                       <span className="text-xl font-black tabular-nums">{progressUpdates.length}</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                       <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Avg Efficiency</span>
                       <span className="text-xl font-black tabular-nums">84%</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Camera size={16} className="text-primary-600" />
                 Recent Site Photos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group relative cursor-pointer">
                       <img src={`https://placehold.co/150x150/f1f5f9/64748b?text=P${i}`} className="w-full h-full object-cover" alt="Upload" />
                       <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={16} className="text-white" />
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full py-2 bg-slate-50 text-slate-500 rounded-lg text-[11px] font-black border border-dashed border-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all uppercase tracking-widest">
                 Upload New Gallery
              </button>
           </div>
        </div>
      </div>

      {/* Add Log Modal */}
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
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 p-2 rounded-lg text-white">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">New Progress Log</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Site execution entry</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Task</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    value={newLog.taskId}
                    onChange={e => setNewLog({...newLog, taskId: e.target.value})}
                  >
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold"
                      value={newLog.date}
                      onChange={e => setNewLog({...newLog, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Quantity</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold"
                      value={newLog.actualQty}
                      onChange={e => setNewLog({...newLog, actualQty: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes / Observations</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium h-24 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    placeholder="Enter site notes, constraints encountered, etc."
                    value={newLog.notes}
                    onChange={e => setNewLog({...newLog, notes: e.target.value})}
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
                    className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-xl text-[13px] font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95 uppercase tracking-widest"
                  >
                    Submit Log
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

