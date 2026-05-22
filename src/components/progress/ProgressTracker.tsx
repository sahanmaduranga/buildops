import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  History, 
  Search,
  Filter,
  Plus,
  ChevronDown,
  LayoutGrid,
  Target,
  Maximize2,
  ChevronRight,
  Download,
  FileText,
  Activity,
  Calendar,
  MoreVertical,
  X,
  TrendingUp,
  BarChart2,
  Settings,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';
import { Task, TaskType, TaskPriority } from '../../types.ts';

// --- Sub-components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Delayed': 'bg-red-100 text-red-700 border-red-200',
    'At Risk': 'bg-amber-100 text-amber-700 border-amber-200',
    'Critical': 'bg-red-600 text-white border-red-700',
    'Pending': 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider", styles[status] || styles['Pending'])}>
      {status}
    </span>
  );
};

export const ProgressTracker = ({ sotId }: { sotId?: string }) => {
  const { tasks: allTasks, updateTaskProgress } = useProgress();
  
  // Filter tasks if sotId is provided, otherwise show first SOT group for demonstration
  const tasks = useMemo(() => {
    if (sotId) return allTasks.filter(t => t.id.includes(sotId));
    return allTasks;
  }, [allTasks, sotId]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks.find(t => t.type === TaskType.TASK)?.id || (tasks[0]?.id || null));
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState<string>('');

  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId), 
    [tasks, selectedTaskId]
  );

  const filteredTasks = useMemo(() => {
    let tList = tasks;
    if (searchQuery) {
      tList = tList.filter(t => 
        (t.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (t.code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    return tList;
  }, [tasks, searchQuery]);

  const taskGroups = useMemo(() => {
    const groups: { parent: Task | null; tasks: Task[] }[] = [];
    let currentGroup: { parent: Task | null; tasks: Task[] } = { parent: null, tasks: [] };

    filteredTasks.forEach(task => {
      if (task.type === TaskType.SUMMARY) {
        if (currentGroup.tasks.length > 0 || currentGroup.parent) {
          groups.push(currentGroup);
        }
        currentGroup = { parent: task, tasks: [] };
      } else {
        currentGroup.tasks.push(task);
      }
    });
    if (currentGroup.tasks.length > 0 || currentGroup.parent) {
      groups.push(currentGroup);
    }
    return groups;
  }, [filteredTasks]);

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTempQty((task.actualQty || 0).toString());
  };

  const handleSaveQty = (taskId: string) => {
    const qty = parseFloat(tempQty);
    if (!isNaN(qty)) {
      updateTaskProgress(taskId, qty);
    }
    setEditingTaskId(null);
  };

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary-900 p-2 rounded-lg text-white shadow-lg shadow-primary-900/10">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Quantity-Driven Progress Tracking</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Progress Monitoring</p>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
          <div className="relative hidden md:block w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by code or task name..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/10 placeholder:text-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={14} /> Filters
           </button>
           <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Download size={14} /> Export
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95 ml-2">
              <Plus size={16} /> Batch Update
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Task Hierarchy Tree */}
        <div className={cn(
          "bg-slate-50/50 border-r border-slate-200 flex flex-col transition-all duration-300",
          isSidebarOpen ? "w-72" : "w-12"
        )}>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {isSidebarOpen && <span className="flex items-center gap-2"><LayoutGrid size={14} /> Project Hierarchy</span>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white rounded transition-colors text-slate-400 hover:text-primary-600">
               {isSidebarOpen ? <X size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
          {isSidebarOpen && (
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {taskGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-0.5">
                  {group.parent && (
                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2 bg-slate-100/50 rounded-lg mb-1">
                      <ChevronDown size={12} />
                      {group.parent.name}
                    </div>
                  )}
                  {group.tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg transition-all group flex items-start gap-3",
                        selectedTaskId === task.id ? "bg-white text-primary-700 shadow-sm ring-1 ring-slate-200" : "hover:bg-white/80 text-slate-600"
                      )}
                    >
                      <div className={cn(
                        "mt-1.5 w-1.5 h-1.5 rounded-full ring-2 ring-white shrink-0 shadow-sm",
                        task.status === 'Completed' ? "bg-emerald-500" : 
                        task.status === 'In Progress' ? "bg-blue-500" : 
                        task.status === 'Delayed' ? "bg-red-500" : "bg-slate-300"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-[12px] font-bold leading-tight truncate",
                          selectedTaskId === task.id ? "text-primary-800" : "text-slate-700"
                        )}>{task.name}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-slate-400 font-mono">{task.code}</span>
                          <span className="text-[10px] font-black text-slate-500">{task.progressPercentage}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center Panel: Advanced Execution Grid */}
        <div className="flex-1 overflow-auto bg-white scrollbar-thin">
           <table className="w-full border-collapse text-[12px] border-spacing-0 min-w-[1200px]">
              <thead className="sticky top-0 z-30">
                <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-wider text-[9px] border-b border-white/10">
                  <th className="text-left p-4 sticky left-0 z-40 bg-slate-900 border-r border-white/10 w-[120px]">Task Code</th>
                  <th className="text-left p-4 sticky left-[120px] z-40 bg-slate-900 border-r border-white/10 w-[240px]">Resource / Task Description</th>
                  <th className="text-center p-4 border-r border-white/10 w-[70px]">Unit</th>
                  <th className="text-right p-4 border-r border-white/10 w-[110px]">Planned Qty</th>
                  <th className="text-right p-4 bg-primary-900 text-white border-r border-white/10 w-[120px]">Actual Qty</th>
                  <th className="text-right p-4 border-r border-white/10 w-[110px]">Remaining</th>
                  <th className="text-right p-4 border-r border-white/10 w-[90px]">Planned %</th>
                  <th className="text-right p-4 border-r border-white/10 w-[100px] bg-slate-800/50">Actual %</th>
                  <th className="text-center p-4 border-r border-white/10 w-[120px]">Status</th>
                  <th className="text-center p-4 border-r border-white/10 w-[120px]">Start Date</th>
                  <th className="text-center p-4 border-r border-white/10 w-[120px]">Finish Date</th>
                  <th className="text-right p-4 w-[110px]">Delay (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taskGroups.map(group => (
                  <React.Fragment key={group.parent?.id}>
                    {group.parent && (
                       <tr className="bg-slate-50/80 sticky top-[45px] z-20">
                          <td colSpan={13} className="p-3 px-4 border-b border-slate-200">
                             <div className="flex items-center gap-2">
                                <div className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-black">{group.parent.code}</div>
                                <span className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{group.parent.name}</span>
                                <div className="flex-1 h-[1px] bg-slate-200 mx-3" />
                                <div className="text-[10px] font-bold text-slate-400 flex gap-4">
                                   <span className="text-primary-600">ACTUAL: {group.parent.progressPercentage}%</span>
                                </div>
                             </div>
                          </td>
                       </tr>
                    )}
                    {group.tasks.map(task => (
                      <tr 
                        key={task.id} 
                        onClick={() => setSelectedTaskId(task.id)}
                        className={cn(
                          "group transition-all cursor-pointer",
                          selectedTaskId === task.id ? "bg-primary-50/30" : "hover:bg-slate-50"
                        )}
                      >
                        <td className="p-4 font-mono font-black text-slate-400 sticky left-0 z-10 bg-inherit border-r border-slate-100 group-hover:bg-slate-50 transition-colors">{task.code}</td>
                        <td className="p-4 sticky left-[120px] z-10 bg-inherit border-r border-slate-100 group-hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col">
                            <span className={cn("font-black text-slate-900", selectedTaskId === task.id && "text-primary-700")}>{task.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight truncate">BOQ: {task.boqAllocations[0]?.boqItemCode || 'UNLINKED'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center text-slate-500 font-bold border-r border-slate-100 tabular-nums">{task.boqAllocations[0]?.unit || '-'}</td>
                        <td className="p-4 text-right font-black text-slate-600 border-r border-slate-100 tabular-nums">{task.plannedQty?.toLocaleString()}</td>
                        <td className="p-4 text-right border-r border-slate-100 bg-primary-900 text-white px-2">
                           {editingTaskId === task.id ? (
                             <div className="flex items-center gap-1">
                               <input 
                                 autoFocus
                                 type="text" 
                                 value={tempQty}
                                 onChange={(e) => setTempQty(e.target.value)}
                                 className="w-full bg-white/10 border-none text-right font-black text-white focus:outline-none focus:ring-1 ring-white/50 rounded tabular-nums px-2 py-1"
                                 onClick={(e) => e.stopPropagation()}
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') handleSaveQty(task.id);
                                   if (e.key === 'Escape') setEditingTaskId(null);
                                 }}
                               />
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleSaveQty(task.id); }}
                                 className="p-1 hover:bg-white/20 rounded"
                               >
                                 <Save size={14} />
                               </button>
                             </div>
                           ) : (
                             <div 
                              className="w-full text-right font-black text-white cursor-edit py-1"
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(task); }}
                             >
                               {task.actualQty || 0}
                             </div>
                           )}
                        </td>
                        <td className="p-4 text-right font-black text-slate-400 border-r border-slate-100 tabular-nums">{(task.totalRemainingQty || 0).toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-slate-400 border-r border-slate-100 tabular-nums">64%</td>
                        <td className="p-4 text-right font-black text-primary-600 border-r border-slate-100 tabular-nums bg-slate-50/80">{task.progressPercentage}%</td>
                        <td className="p-4 text-center border-r border-slate-100">
                           <StatusBadge status={task.status} />
                        </td>
                        <td className="p-4 text-center border-r border-slate-100 font-bold text-slate-500 tabular-nums">{new Date(task.startDate).toLocaleDateString()}</td>
                        <td className="p-4 text-center border-r border-slate-100 font-bold text-slate-500 tabular-nums">{new Date(task.endDate).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                           <span className={cn(
                             "font-black text-[11px]",
                             (task.delayDays || 0) > 0 ? "text-red-600" : "text-slate-300"
                           )}>{task.delayDays || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
           </table>
        </div>

        {/* Right Panel: Task Analytics & Forecaster */}
        <AnimatePresence>
          {isDetailOpen && selectedTask && (
            <motion.div 
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: 420, opacity: 1 }}
               exit={{ width: 0, opacity: 0 }}
               className="bg-slate-50 border-l border-slate-200 flex flex-col shadow-2xl relative z-40"
            >
               <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Task Analytics</span>
                    <h3 className="text-[15px] font-black text-slate-900 mt-1">{selectedTask.name}</h3>
                  </div>
                  <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                     <X size={18} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                  {/* Productivity Pulse */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="text-primary-600" />
                           Productivity Pulse
                        </h4>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12% vs Target</span>
                     </div>
                     <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Actual Output Rate</span>
                              <p className="text-xl font-black text-slate-900">42.5 <span className="text-[10px] text-slate-400">m3/day</span></p>
                           </div>
                           <BarChart2 size={32} className="text-slate-100" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-600" style={{ width: '74%' }} />
                        </div>
                     </div>
                  </div>

                  {/* Delay Diagnostics */}
                  <div className="space-y-4">
                     <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        Delay Diagnostics
                     </h4>
                     <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-[12px]">
                           <span className="font-bold text-slate-600">Total Delay Impact</span>
                           <span className="font-black text-red-600">8.0 Days</span>
                        </div>
                        <div className="p-4 bg-red-50/50 rounded-lg border border-red-100 space-y-2">
                           <p className="text-[11px] font-black text-red-900 uppercase tracking-tight">Active Warning</p>
                           <p className="text-[12px] text-red-700 leading-relaxed font-medium">Schedule performance index (SPI) dropped to 0.82. Recovery plan required to meet June 15 baseline.</p>
                        </div>
                     </div>
                  </div>

                  {/* Forecast */}
                  <div className="space-y-4">
                     <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} className="text-primary-600" />
                        Projected Finish
                     </h4>
                     <div className="bg-slate-900 p-5 rounded-xl text-white shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black text-slate-400 tracking-wider">FORECASTED</span>
                           <span className="text-[10px] font-black text-red-400">+5 DAYS</span>
                        </div>
                        <p className="text-xl font-black tabular-nums">June 20, 2024</p>
                        <p className="text-[10px] text-slate-500 mt-2 font-bold italic">Calculation based on current velocity of 42.5 m3/day</p>
                     </div>
                  </div>
               </div>

               <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-2 gap-3">
                  <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[12px] hover:bg-slate-50">MANAGE DELAY</button>
                  <button className="p-3 bg-primary-600 text-white rounded-xl font-black text-[12px] shadow-lg shadow-primary-900/20 hover:bg-primary-700">SUBMIT UPDATE</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating expander if details closed */}
        {!isDetailOpen && selectedTask && (
           <button 
              onClick={() => setIsDetailOpen(true)}
              className="absolute right-4 bottom-4 w-12 h-12 bg-primary-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
           >
              <BarChart2 size={24} />
           </button>
        )}
      </div>
    </div>
  );
};

const ImageIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

