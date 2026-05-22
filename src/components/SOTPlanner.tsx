import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical, 
  GanttChartSquare, 
  Maximize2,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  FileText,
  Workflow,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { 
  type Task, 
  type SOT, 
  TaskType, 
  TaskPriority,
  SOTStatus 
} from '../types.ts';
import { MOCK_SOTS } from '../mockData.ts';
import { TaskDetailDrawer } from './TaskDetailDrawer.tsx';
import { BOQSelectionModal } from './BOQSelectionModal.tsx';

export const SOTPlanner = ({ sotId }: { sotId?: string }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<string[]>(['task-1', 'task-2']);
  const [isBOQModalOpen, setIsBOQModalOpen] = useState(false);
  const [selectedTreeNodeId, setSelectedTreeNodeId] = useState<string | null>(null);
  
  const activeSot = MOCK_SOTS.find(s => s.id === (sotId || 'sot-1')) || MOCK_SOTS[0];

  // For Demo: Use local state for tasks if we want to add new ones
  const [tasks, setTasks] = useState<Task[]>(activeSot.tasks);

  const toggleExpand = (id: string) => {
    if (expandedTasks.includes(id)) {
      setExpandedTasks(expandedTasks.filter(tid => tid !== id));
    } else {
      setExpandedTasks([...expandedTasks, id]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'In Progress': return <Clock size={14} className="text-primary-500" />;
      case 'Delayed': return <AlertTriangle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-slate-300" />;
    }
  };

  const handleAddTasksFromBOQ = (selections: { item: any, allocatedQty: number }[]) => {
    const newTasks: Task[] = selections.map((selection, index) => {
      const { item, allocatedQty } = selection;
      return {
        id: `task-new-${Date.now()}-${index}`,
        code: `T-${item.code}`,
        name: item.description,
        type: TaskType.TASK,
        priority: TaskPriority.MEDIUM,
        startDate: '2024-07-01',
        endDate: '2024-07-15',
        duration: 14,
        progressPercentage: 0,
        status: 'Pending',
        parentId: selectedTreeNodeId || undefined,
        dependencies: [],
        resourceAllocations: [],
        boqAllocations: [
          { 
            id: `ba-new-${Date.now()}-${index}`, 
            boqItemId: item.id, 
            boqItemCode: item.code, 
            description: item.description, 
            unit: item.unit, 
            boqQty: item.quantity, 
            allocatedQty: allocatedQty, 
            rate: item.rate 
          }
        ],
      };
    });

    setTasks([...tasks, ...newTasks]);
  };

  const renderTreeItem = (task: Task, level: number = 0) => {
    if (task.type !== TaskType.SUMMARY) return null;
    
    const isExpanded = expandedTasks.includes(task.id);
    const children = tasks.filter(t => t.parentId === task.id && t.type === TaskType.SUMMARY);
    const hasChildren = children.length > 0;
    const isSelected = selectedTreeNodeId === task.id;

    return (
      <div key={task.id}>
        <div 
          className={cn(
            "flex items-center py-2 px-3 cursor-pointer rounded-lg transition-all group",
            isSelected ? "bg-primary-50 text-primary-700 shadow-sm" : "hover:bg-slate-100 text-slate-600"
          )}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => setSelectedTreeNodeId(task.id)}
        >
          <div 
            className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-zentrix-blue mr-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(task.id);
            }}
          >
            {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
          </div>
          <FolderOpen size={14} className={cn("mr-2", isSelected ? "text-primary-500" : "text-slate-400")} />
          <span className="text-[12px] font-bold truncate">{task.name}</span>
        </div>
        {isExpanded && children.map(child => renderTreeItem(child, level + 1))}
      </div>
    );
  };

  const renderTaskRow = (task: Task, level: number = 0) => {
    const isExpanded = expandedTasks.includes(task.id);
    const children = tasks.filter(t => t.parentId === task.id);
    const hasChildren = children.length > 0;

    return (
      <React.Fragment key={task.id}>
        <tr 
          className={cn(
            "hover:bg-slate-50 transition-colors cursor-pointer group border-b border-zentrix-border/50",
            selectedTask?.id === task.id && "bg-primary-50/50"
          )}
          onClick={() => {
            setSelectedTask(task);
            setIsDrawerOpen(true);
          }}
        >
          <td className="px-4 py-3 min-w-[300px]">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              <div 
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-zentrix-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren) toggleExpand(task.id);
                }}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center mr-3 shrink-0",
                task.type === TaskType.SUMMARY ? "bg-slate-100 text-slate-600" : "bg-white border border-slate-200 text-slate-400"
              )}>
                {task.type === TaskType.SUMMARY ? <FolderOpen size={14} /> : <FileText size={14} />}
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[13px] text-zentrix-blue",
                  task.type === TaskType.SUMMARY ? "font-bold" : "font-medium"
                )}>{task.name}</span>
                <span className="text-[10px] text-zentrix-muted tracking-wide font-mono uppercase">{task.code}</span>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-[12px] font-medium text-zentrix-blue whitespace-nowrap">
            {new Date(task.startDate).toLocaleDateString()}
          </td>
          <td className="px-4 py-3 text-[12px] font-medium text-zentrix-blue whitespace-nowrap">
            {new Date(task.endDate).toLocaleDateString()}
          </td>
          <td className="px-4 py-3 text-[12px] font-medium text-zentrix-muted whitespace-nowrap">
            {task.duration}d
          </td>
          <td className="px-4 py-3 text-[12px] font-medium text-zentrix-blue">
            {task.boqAllocations.length > 0 ? (
               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-primary-600 font-bold">
                    <FileText size={12} />
                    {task.boqAllocations[0].boqItemCode}
                  </div>
                  <div className="text-[10px] text-zentrix-muted">
                    Qty: {task.boqAllocations[0].allocatedQty} {task.boqAllocations[0].unit}
                  </div>
               </div>
            ) : "-"}
          </td>
          <td className="px-4 py-3">
             <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className={cn(
                  "text-[11px] font-bold",
                  task.status === 'Completed' ? "text-green-600" : 
                  task.status === 'In Progress' ? "text-primary-600" : "text-slate-500"
                )}>{task.status}</span>
             </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-col gap-1 w-24">
               <div className="flex justify-between items-center text-[10px] font-bold text-zentrix-muted">
                  <span>{task.progressPercentage}%</span>
               </div>
               <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      task.progressPercentage === 100 ? "bg-green-500" : "bg-primary-500"
                    )} 
                    style={{ width: `${task.progressPercentage}%` }}
                  />
               </div>
            </div>
          </td>
          <td className="px-4 py-3 text-right">
             <button className="p-1.5 text-slate-300 hover:text-zentrix-blue hover:bg-slate-50 rounded transition-all opacity-0 group-hover:opacity-100">
                <MoreVertical size={14} />
             </button>
          </td>
        </tr>
        {isExpanded && children.map(child => renderTaskRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const filteredTasks = tasks.filter(t => {
    if (!selectedTreeNodeId) return !t.parentId; // Top level if nothing selected
    return t.parentId === selectedTreeNodeId || t.id === selectedTreeNodeId;
  });

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <BOQSelectionModal 
        isOpen={isBOQModalOpen}
        onClose={() => setIsBOQModalOpen(false)}
        onSelect={handleAddTasksFromBOQ}
      />

      {/* SOT Header */}
      <div className="bg-white border-b border-zentrix-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
             <GanttChartSquare size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <h1 className="text-lg font-bold text-zentrix-blue">{activeSot.code}</h1>
               <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
                  {activeSot.status}
               </span>
            </div>
            <p className="text-[13px] text-zentrix-muted font-medium">{activeSot.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsBOQModalOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 text-primary-600 text-[13px] font-bold rounded-lg hover:bg-primary-50 transition-all shadow-sm"
           >
             <Layers size={16} />
             Link BOQ Items
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-[13px] font-bold rounded-lg hover:bg-primary-700 transition-all shadow-sm">
             <Plus size={16} />
             Add task
           </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Side: Hierarchy Tree View */}
        <div className="w-72 bg-white rounded-xl border border-zentrix-border flex flex-col shadow-sm">
          <div className="p-4 border-b border-zentrix-border flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-zentrix-blue flex items-center gap-2">
              <FolderOpen size={16} className="text-primary-600" />
              SOT Structure
            </h3>
            <button className="p-1 text-slate-400 hover:text-zentrix-blue"><Plus size={14} /></button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <div 
              className={cn(
                "flex items-center py-2 px-3 cursor-pointer rounded-lg transition-all group mb-1",
                !selectedTreeNodeId ? "bg-primary-600 text-white shadow-md" : "hover:bg-slate-100 text-slate-600"
              )}
              onClick={() => setSelectedTreeNodeId(null)}
            >
              <Maximize2 size={14} className={cn("mr-2", !selectedTreeNodeId ? "text-white" : "text-slate-400")} />
              <span className="text-[12px] font-bold">Entire Project</span>
            </div>
            {tasks.filter(t => !t.parentId && t.type === TaskType.SUMMARY).map(task => renderTreeItem(task))}
          </div>
        </div>

        {/* Right Side: Task Workspace */}
        <div className="flex-1 bg-white rounded-xl border border-zentrix-border flex flex-col shadow-sm overflow-hidden">
          <div className="p-3 border-b border-zentrix-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search tasks in this level..." 
                    className="pl-9 pr-3 py-1.5 bg-white border border-zentrix-border rounded-lg text-[12px] focus:ring-2 focus:ring-primary-500/10 w-64 shadow-sm outline-none"
                  />
               </div>
               {selectedTreeNodeId && (
                 <div className="flex items-center gap-2 px-2 py-1 bg-primary-50 rounded text-primary-700 text-[11px] font-bold">
                    Currently Viewing: {tasks.find(t => t.id === selectedTreeNodeId)?.name}
                 </div>
               )}
            </div>
            <div className="flex items-center gap-2">
               <button className="p-1.5 text-slate-500 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all"><Filter size={14} /></button>
               <button className="p-1.5 text-slate-500 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all"><Download size={14} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                <tr className="border-b border-zentrix-border">
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[35%]">Task Code & Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[12%]">Start Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[12%]">End Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[8%]">Dur</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[15%]">Linked BOQ</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[10%]">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[12%]">Progress</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-[4%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zentrix-border/50">
                {filteredTasks.map(task => renderTaskRow(task))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-zentrix-muted opacity-60">
                        <FileText size={32} className="mb-2" />
                        <p className="text-[14px] font-medium">No tasks found in this section</p>
                        <button 
                          onClick={() => setIsBOQModalOpen(true)}
                          className="mt-4 px-4 py-1.5 border border-primary-200 text-primary-600 text-[12px] font-bold rounded-lg hover:bg-primary-50 transition-all"
                        >
                          Add from BOQ
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Drawer for Task Details */}
      <TaskDetailDrawer 
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

