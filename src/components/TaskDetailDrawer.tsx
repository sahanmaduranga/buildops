import React, { useState } from 'react';
import { 
  X, 
  Info, 
  LayoutList, 
  Users2, 
  Link2, 
  BarChart2, 
  Paperclip, 
  History,
  Calendar,
  Clock,
  User,
  MoreVertical,
  Plus,
  Trash2,
  FileEdit,
  AlertCircle,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { 
  type Task, 
  TaskType, 
  TaskPriority, 
  DependencyType,
  ResourceType 
} from '../types.ts';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-3 text-[12px] font-bold transition-all border-b-2",
      active 
        ? "text-primary-600 border-primary-600 bg-primary-50/30" 
        : "text-zentrix-muted border-transparent hover:text-zentrix-blue hover:bg-slate-50"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

export const TaskDetailDrawer = ({ task, isOpen, onClose }: TaskDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!task) return null;

  const renderGeneralTab = () => (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Task Code</label>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[13px] font-bold text-zentrix-blue">
            {task.code}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Task Type</label>
          <select className="w-full p-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] focus:ring-2 focus:ring-primary-500/10">
            <option>{task.type}</option>
            <option>{TaskType.SUMMARY}</option>
            <option>{TaskType.MILESTONE}</option>
          </select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Task Name</label>
          <input 
            type="text" 
            className="w-full p-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] font-bold text-zentrix-blue focus:ring-2 focus:ring-primary-500/10"
            defaultValue={task.name}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Description</label>
          <textarea 
            className="w-full p-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] h-24 focus:ring-2 focus:ring-primary-500/10"
            defaultValue={task.description || "Detailed task requirements and technical specifications for field execution."}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="date" 
              className="w-full pl-10 p-2.5 bg-white border border-zentrix-border rounded-lg text-[13px]"
              defaultValue={task.startDate}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">End Date</label>
           <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="date" 
              className="w-full pl-10 p-2.5 bg-white border border-zentrix-border rounded-lg text-[13px]"
              defaultValue={task.endDate}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Priority</label>
          <select className={cn(
             "w-full p-2.5 border rounded-lg text-[13px] font-bold",
             task.priority === TaskPriority.CRITICAL ? "text-red-600 bg-red-50 border-red-200" : "bg-white border-zentrix-border"
          )}>
            <option>{task.priority}</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Status</label>
          <select className="w-full p-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] font-bold">
            <option>{task.status}</option>
            <option>Completed</option>
            <option>Delayed</option>
            <option>Critical</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBOQAllocationTab = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zentrix-border flex items-center justify-between bg-slate-50/50">
        <h4 className="text-[12px] font-bold text-zentrix-blue">BOQ Item Allocations</h4>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-[11px] font-bold rounded-md hover:bg-primary-700 transition-all">
          <Plus size={14} />
          Allocate BOQ
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zentrix-border">
              <th className="px-4 py-3 text-[10px] font-bold text-zentrix-muted uppercase">BOQ Code</th>
              <th className="px-4 py-3 text-[10px] font-bold text-zentrix-muted uppercase text-right">BOQ Qty</th>
              <th className="px-4 py-3 text-[10px] font-bold text-zentrix-muted uppercase text-right">Allocated</th>
              <th className="px-4 py-3 text-[10px] font-bold text-zentrix-muted uppercase text-right">Remaining</th>
              <th className="px-1 py-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zentrix-border">
            {task.boqAllocations.map((boq) => (
              <tr key={boq.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-zentrix-blue">{boq.boqItemCode}</span>
                    <span className="text-[10px] text-zentrix-muted truncate max-w-[120px]">{boq.description}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-[12px] font-medium text-zentrix-blue">{boq.boqQty} {boq.unit}</td>
                <td className="px-4 py-4 text-right">
                  <input 
                    type="number" 
                    className="w-20 p-1.5 border border-zentrix-border rounded text-[12px] text-right focus:border-primary-500 outline-none"
                    defaultValue={boq.allocatedQty}
                  />
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[12px] font-bold",
                      (boq.boqQty - boq.allocatedQty < 0) ? "text-red-500" : "text-zentrix-blue"
                    )}>
                      {(boq.boqQty - boq.allocatedQty).toFixed(2)}
                    </span>
                    {(boq.boqQty - boq.allocatedQty < 0) && (
                      <span className="text-[8px] text-red-500 font-bold uppercase mt-0.5 flex items-center gap-1">
                        <AlertCircle size={8} /> Exceeded
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-4 text-right">
                   <button className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                     <Trash2 size={14} />
                   </button>
                </td>
              </tr>
            ))}
            {task.boqAllocations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-zentrix-muted">
                    <LayoutList size={32} className="opacity-20" />
                    <p className="text-[13px]">No BOQ items allocated to this task</p>
                    <button className="text-[11px] font-bold text-primary-600 hover:underline">Select BOQ Items</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-zentrix-border">
         <div className="flex justify-between items-center text-[13px]">
           <span className="font-bold text-zentrix-blue">Total Allocated Value</span>
           <span className="font-black text-primary-600 font-mono">
             ${task.boqAllocations.reduce((sum, b) => sum + (b.allocatedQty * b.rate), 0).toLocaleString()}
           </span>
         </div>
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-zentrix-border flex items-center justify-between bg-slate-50/50">
        <h4 className="text-[12px] font-bold text-zentrix-blue">Planned Resources</h4>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-[11px] font-bold rounded-md">
          <Plus size={14} /> Add Resource
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 grid grid-cols-1 gap-3">
          {task.resourceAllocations.map((res) => (
            <div key={res.id} className="p-3 border border-zentrix-border rounded-xl hover:border-primary-200 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold",
                  res.resourceType === ResourceType.MATERIAL ? "bg-blue-50 text-blue-600" :
                  res.resourceType === ResourceType.LABOR ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600"
                )}>
                  {res.resourceType.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-[13px] font-bold text-zentrix-blue">{res.resourceName}</h5>
                  <p className="text-[11px] text-zentrix-muted">Planned: {res.plannedQty} {res.unit}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[13px] font-bold text-zentrix-blue">${(res.plannedQty * res.rate).toLocaleString()}</p>
                 <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-slate-400 hover:text-primary-600"><FileEdit size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProgressTab = () => {
    const historicalData = [
       { day: 'Day 1', progress: 5, planned: 10 },
       { day: 'Day 5', progress: 15, planned: 20 },
       { day: 'Day 10', progress: 35, planned: 40 },
       { day: 'Day 15', progress: 55, planned: 60 },
       { day: 'Day 20', progress: 75, planned: 80 },
       { day: 'Today', progress: task.progressPercentage, planned: 100 },
    ];

    return (
      <div className="space-y-6 p-6 overflow-y-auto max-h-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-zentrix-border rounded-xl">
             <p className="text-[11px] text-zentrix-muted font-bold uppercase tracking-wider mb-2">Planned Progress</p>
             <p className="text-2xl font-black text-zentrix-blue">85%</p>
          </div>
          <div className="p-4 bg-white border border-zentrix-border rounded-xl">
             <p className="text-[11px] text-zentrix-muted font-bold uppercase tracking-wider mb-2">Actual Progress</p>
             <p className={cn(
               "text-2xl font-black",
               task.progressPercentage < 85 ? "text-amber-500" : "text-green-500"
             )}>{task.progressPercentage}%</p>
          </div>
          <div className="p-4 bg-white border border-zentrix-border rounded-xl">
             <p className="text-[11px] text-zentrix-muted font-bold uppercase tracking-wider mb-2">Efficiency Index</p>
             <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-zentrix-blue">0.88</p>
                <div className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">-12%</div>
             </div>
          </div>
          <div className="p-4 bg-white border border-zentrix-border rounded-xl">
             <p className="text-[11px] text-zentrix-muted font-bold uppercase tracking-wider mb-2">Estimated Delay</p>
             <p className="text-2xl font-black text-red-600">3 Days</p>
          </div>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-4">
           <h5 className="text-[13px] font-bold text-zentrix-blue mb-4">Progress Trend (Planned vs Actual)</h5>
           <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="progress" stroke="#2563eb" fill="url(#colorProg)" strokeWidth={2} />
                    <Line type="monotone" dataKey="planned" stroke="#cbd5e1" strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-[13px] font-bold text-zentrix-blue">Daily Progress Log</h5>
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <History size={14} className="text-slate-400" />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[12px] font-bold text-zentrix-blue">Robert Chen updated progress to {task.progressPercentage}%</span>
                     <span className="text-[10px] text-zentrix-muted">Yesterday, 4:30 PM</span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed italic">"Completed reinforcement works for slab section A-4. Ready for concrete pouring scheduled for tomorrow."</p>
                  <div className="flex gap-2 mt-2">
                     <div className="w-12 h-12 rounded bg-slate-200 border border-slate-300 cursor-pointer flex items-center justify-center text-[10px] hover:bg-slate-300">
                        <Eye size={16} className="text-white opactiy-50" />
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'boq': return renderBOQAllocationTab();
      case 'resources': return renderResourcesTab();
      case 'progress': return renderProgressTab();
      default: return <div className="p-12 text-center text-zentrix-muted">Feature under development</div>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[550px] bg-white z-[70] shadow-2xl flex flex-col border-l border-zentrix-border"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-zentrix-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    task.isCritical ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary-600"
                  )}>
                    {task.isCritical ? 'Critical Path' : task.type}
                  </span>
                  <span className="text-[11px] text-zentrix-muted">Task ID: {task.id}</span>
                </div>
                <h2 className="text-xl font-bold text-zentrix-blue">{task.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-zentrix-muted hover:bg-slate-50 rounded-lg"><MoreVertical size={20} /></button>
                <button onClick={onClose} className="p-2 text-zentrix-muted hover:bg-slate-50 rounded-lg"><X size={20} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zentrix-border overflow-x-auto no-scrollbar">
              <TabButton active={activeTab === 'general'} label="General" icon={Info} onClick={() => setActiveTab('general')} />
              <TabButton active={activeTab === 'boq'} label="BOQ Allocation" icon={LayoutList} onClick={() => setActiveTab('boq')} />
              <TabButton active={activeTab === 'resources'} label="Resources" icon={Users2} onClick={() => setActiveTab('resources')} />
              <TabButton active={activeTab === 'dependencies'} label="Dependencies" icon={Link2} onClick={() => setActiveTab('dependencies')} />
              <TabButton active={activeTab === 'progress'} label="Progress" icon={BarChart2} onClick={() => setActiveTab('progress')} />
              <TabButton active={activeTab === 'attachments'} label="Attachments" icon={Paperclip} onClick={() => setActiveTab('attachments')} />
              <TabButton active={activeTab === 'history'} label="Audit Log" icon={History} onClick={() => setActiveTab('history')} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto">
                {renderContent()}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zentrix-border bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-zentrix-blue font-bold text-xs uppercase">
                    RC
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[12px] font-bold text-zentrix-blue">Robert Chen</span>
                   <span className="text-[10px] text-zentrix-muted">Last modified 2h ago</span>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-5 py-2 text-[13px] font-bold text-zentrix-blue hover:underline">Cancel</button>
                <button className="px-5 py-2 bg-primary-600 text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-primary-700 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
