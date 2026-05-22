import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowUpDown,
  Download,
  Copy,
  CheckSquare,
  FileEdit,
  ExternalLink,
  GanttChartSquare,
  History,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { type SOT, SOTStatus } from '../types.ts';
import { MOCK_SOTS } from '../mockData.ts';
import { CreateSOTModal } from './CreateSOTModal.tsx';

interface SOTListProps {
  onOpenPlanner: (id: string) => void;
  onOpenGantt: (id: string) => void;
  onViewProgress: (id: string) => void;
  sots: SOT[];
  onAddSOT: (newSot: Partial<SOT>) => void;
}

export const SOTList = ({ onOpenPlanner, onOpenGantt, onViewProgress, sots, onAddSOT }: SOTListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredSots = sots.filter(sot => {
    const matchesSearch = sot.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sot.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || sot.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: SOTStatus) => {
    switch (status) {
      case SOTStatus.ACTIVE: return 'bg-green-50 text-green-700 border-green-100';
      case SOTStatus.DRAFT: return 'bg-slate-100 text-slate-600 border-slate-200';
      case SOTStatus.PENDING_APPROVAL: return 'bg-amber-50 text-amber-700 border-amber-100';
      case SOTStatus.APPROVED: return 'bg-blue-50 text-blue-700 border-blue-100';
      case SOTStatus.COMPLETED: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zentrix-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zentrix-blue">Schedule of Tasks (SOT)</h1>
          <p className="text-[13px] text-zentrix-muted">Manage and monitor project execution schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zentrix-border text-zentrix-blue text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-[13px] font-bold rounded-lg hover:bg-primary-700 transition-all shadow-md shadow-primary-900/20"
          >
            <Plus size={16} />
            New SOT
          </button>
        </div>
      </div>

      <CreateSOTModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(newSot) => {
          onAddSOT(newSot);
        }}
      />

      {/* Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-zentrix-border shadow-sm sticky top-0 z-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by SOT code or project name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-[13px] focus:ring-2 focus:ring-primary-500/10 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center p-1 bg-slate-50 rounded-lg border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Active', 'Draft', 'Pending Approval'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[12px] font-bold transition-all whitespace-nowrap",
                  selectedStatus === status 
                    ? "bg-white text-primary-600 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-zentrix-blue"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={cn(
              "p-2 rounded-lg border transition-all",
              isFilterPanelOpen ? "bg-primary-50 border-primary-200 text-primary-600" : "bg-white border-zentrix-border text-zentrix-blue hover:bg-slate-50"
            )}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-zentrix-border">
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zentrix-blue uppercase">
                    SOT Code <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Project</th>
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Dates</th>
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Progress</th>
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Budget</th>
                <th className="px-5 py-4 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zentrix-border">
              {filteredSots.map((sot) => (
                <tr key={sot.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-zentrix-blue">{sot.code}</span>
                      <span className="text-[11px] text-zentrix-muted">Rev {sot.revisionNo}</span>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-zentrix-blue">{sot.projectName}</span>
                      <span className="text-[11px] text-zentrix-muted truncate max-w-[200px]">{sot.description}</span>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] font-bold text-zentrix-blue">
                         {new Date(sot.startDate).toLocaleDateString()}
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                      <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] font-bold text-zentrix-blue">
                         {new Date(sot.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                      getStatusColor(sot.status)
                    )}>
                      {sot.status}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-zentrix-blue">{sot.progressPercentage}%</span>
                        <span className="text-zentrix-muted">Complete</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            sot.progressPercentage > 80 ? "bg-green-500" : 
                            sot.progressPercentage > 40 ? "bg-primary-500" : "bg-amber-500"
                          )} 
                          style={{ width: `${sot.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                     <span className="text-[13px] font-bold text-zentrix-blue">
                       ${sot.totalBudget.toLocaleString()}
                     </span>
                  </td>
                  <td className="px-5 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onOpenPlanner(sot.id)}
                        className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all" 
                        title="Edit Planner"
                      >
                        <FileEdit size={16} />
                      </button>
                      <button 
                        onClick={() => onOpenGantt(sot.id)}
                        className="p-2 text-slate-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-md transition-all" 
                        title="View Gantt"
                      >
                        <GanttChartSquare size={16} />
                      </button>
                      <button 
                        onClick={() => onViewProgress(sot.id)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all" 
                        title="Track Progress"
                      >
                        <History size={16} />
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                      <button className="p-2 text-slate-500 hover:text-zentrix-blue hover:bg-slate-50 rounded-md transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-zentrix-border bg-slate-50/30 flex items-center justify-between">
           <p className="text-[12px] text-zentrix-muted">Showing <span className="font-bold text-zentrix-blue">2</span> of <span className="font-bold text-zentrix-blue">2</span> schedules</p>
           <div className="flex items-center gap-2">
             <button className="px-3 py-1.5 bg-white border border-zentrix-border text-slate-400 rounded-md text-[12px] font-bold cursor-not-allowed">Previous</button>
             <button className="px-3 py-1.5 bg-white border border-zentrix-border text-zentrix-blue rounded-md text-[12px] font-bold hover:bg-slate-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};
