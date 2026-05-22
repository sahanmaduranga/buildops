import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Maximize2, 
  Download,
  Calendar,
  Layers,
  Zap,
  MoreVertical,
  Minus,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { type Task, TaskType } from '../types.ts';
import { MOCK_SOTS } from '../mockData.ts';

const DAYS_TO_SHOW = 30;
const DAY_WIDTH = 40;

export const SOTGantt = ({ sotId }: { sotId?: string }) => {
  const [zoomLevel, setZoomLevel] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  
  const activeSot = MOCK_SOTS.find(s => s.id === (sotId || 'sot-1')) || MOCK_SOTS[0];
  const startDate = new Date(activeSot.startDate);
  
  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [activeSot.startDate]);

  const getTaskPosition = (task: Task) => {
    const start = new Date(task.startDate);
    const diffTime = Math.abs(start.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      left: diffDays * DAY_WIDTH,
      width: task.duration * DAY_WIDTH
    };
  };

  return (
    <div className="h-full flex flex-col bg-white border border-zentrix-border rounded-xl overflow-hidden shadow-sm">
      {/* Gantt Header */}
      <div className="p-4 border-b border-zentrix-border bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[15px] font-bold text-zentrix-blue">Gantt Visualization</h2>
          <div className="flex items-center p-1 bg-white border border-zentrix-border rounded-lg shadow-sm">
             {['Day', 'Week', 'Month'].map(z => (
               <button
                 key={z}
                 onClick={() => setZoomLevel(z as any)}
                 className={cn(
                   "px-3 py-1 rounded text-[11px] font-bold transition-all",
                   zoomLevel === z ? "bg-primary-600 text-white shadow-md shadow-primary-900/20" : "text-slate-500 hover:text-zentrix-blue"
                 )}
               >
                 {z}
               </button>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowCriticalPath(!showCriticalPath)}
             className={cn(
               "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
               showCriticalPath ? "bg-red-50 border-red-200 text-red-600 shadow-sm" : "bg-white border-zentrix-border text-slate-500"
             )}
           >
             <Zap size={14} className={showCriticalPath ? "animate-pulse" : ""} />
             Critical Path
           </button>
           <div className="h-6 w-[1px] bg-slate-200" />
           <button className="p-2 text-slate-500 hover:bg-white hover:border-zentrix-border border border-transparent rounded-lg"><Download size={16} /></button>
           <button className="p-2 text-slate-500 hover:bg-white hover:border-zentrix-border border border-transparent rounded-lg"><Filter size={16} /></button>
           <div className="flex items-center gap-1 ml-2">
              <button className="p-1.5 bg-white border border-zentrix-border rounded text-slate-500 hover:text-zentrix-blue"><Minus size={14} /></button>
              <button className="p-1.5 bg-white border border-zentrix-border rounded text-slate-500 hover:text-zentrix-blue"><Plus size={14} /></button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Task Names Sidebar */}
        <div className="w-[280px] border-r border-zentrix-border bg-slate-50/20 flex flex-col">
          <div className="h-10 border-b border-zentrix-border bg-slate-50/50 flex items-center px-4">
             <span className="text-[10px] font-black text-zentrix-muted uppercase tracking-widest">Tasks</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeSot.tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "h-12 border-b border-zentrix-border/50 flex items-center px-4 transition-colors hover:bg-slate-50",
                  task.type === TaskType.SUMMARY ? "bg-slate-50/50" : ""
                )}
              >
                <span className={cn(
                  "text-[12px] truncate",
                  task.type === TaskType.SUMMARY ? "font-bold text-zentrix-blue" : "text-slate-600 font-medium"
                )}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-auto bg-slate-50/10">
          <div style={{ width: `${DAYS_TO_SHOW * DAY_WIDTH}px` }}>
            {/* Date Header */}
            <div className="h-10 border-b border-zentrix-border bg-slate-50/50 flex">
               {dates.map((date, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "flex flex-col items-center justify-center shrink-0 border-r border-zentrix-border/30",
                     (date.getDay() === 0 || date.getDay() === 6) ? "bg-slate-100/50" : ""
                   )}
                   style={{ width: DAY_WIDTH }}
                 >
                    <span className="text-[9px] font-bold text-zentrix-muted uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                    <span className="text-[10px] font-black text-zentrix-blue leading-none">{date.getDate()}</span>
                 </div>
               ))}
            </div>

            {/* Grid Body */}
            <div className="relative">
               {/* Vertical background lines */}
               <div className="absolute inset-0 flex">
                  {dates.map((date, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-full border-r border-zentrix-border/20 shrink-0",
                        (date.getDay() === 0 || date.getDay() === 6) ? "bg-slate-100/30" : ""
                      )}
                      style={{ width: DAY_WIDTH }}
                    />
                  ))}
               </div>

               {/* Task Bars */}
               <div className="relative z-10">
                  {activeSot.tasks.map((task) => {
                    const pos = getTaskPosition(task);
                    return (
                      <div 
                        key={task.id} 
                        className="h-12 border-b border-zentrix-border/20 flex items-center px-0 relative group"
                      >
                         <motion.div
                           initial={{ opacity: 0, scaleX: 0.8 }}
                           animate={{ opacity: 1, scaleX: 1 }}
                           style={{ 
                             left: `${pos.left}px`, 
                             width: `${pos.width}px` 
                           }}
                           className={cn(
                             "absolute h-7 rounded shadow-sm cursor-pointer flex items-center px-3 border transition-all",
                             task.type === TaskType.SUMMARY 
                               ? "bg-slate-800 border-slate-900 group-hover:bg-black" 
                               : task.isCritical && showCriticalPath
                                 ? "bg-red-500 border-red-600 text-white shadow-red-200/50"
                                 : "bg-primary-600 border-primary-700 text-white shadow-primary-200/50"
                           )}
                         >
                            {/* Progress Fill */}
                            {task.type !== TaskType.SUMMARY && (
                               <div 
                                 className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l" 
                                 style={{ width: `${task.progressPercentage}%` }} 
                               />
                            )}
                            
                            <span className="text-[9px] font-black uppercase tracking-widest truncate relative z-10">
                               {task.progressPercentage}% 
                            </span>
                            
                            {/* Dependency lines placeholders would go here */}
                         </motion.div>
                         
                         {/* Dependency Line Example: simple CSS connector if needed */}
                         {task.dependencies.length > 0 && task.dependencies.map(dep => (
                            <div 
                              key={dep.id} 
                              className="absolute h-[2px] bg-slate-300 pointer-events-none" 
                              style={{ 
                                left: '-20px', 
                                width: '20px', 
                                top: '50%' 
                              }} 
                            />
                         ))}
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Footer */}
      <div className="p-3 bg-slate-50 border-t border-zentrix-border flex items-center justify-between px-6">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-primary-600 rounded" />
               <span className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Regular Task</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-red-500 rounded" />
               <span className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Critical Path</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-slate-800 rounded" />
               <span className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Summary</span>
            </div>
         </div>
         <div className="text-[11px] font-bold text-zentrix-muted">
           View Context: <span className="text-zentrix-blue">Construction Year 2024</span>
         </div>
      </div>
    </div>
  );
};
