import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  MapPin, 
  DollarSign,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  Archive,
  RefreshCw,
  Copy,
  FolderOpen,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils.ts';
import { MOCK_REGIONS, MOCK_PERIODS } from '../mockData.ts';
import { useProject } from '../context/ProjectContext.tsx';
import { useBOQ, type BOQHeader } from '../context/BOQContext.tsx';

export const BOQList = ({ 
  onSelectBOQ, 
  onCreateBOQ 
}: { 
  onSelectBOQ: (id: string) => void; 
  onCreateBOQ: () => void; 
}) => {
  const { currentProject } = useProject();
  const { 
    boqs, 
    duplicateBOQ, 
    createRevision, 
    archiveBOQ, 
    deleteBOQ, 
    setSelectedBOQId 
  } = useBOQ();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Draft' | 'Approved' | 'Review' | 'Revised' | 'Archived'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'amount' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Revision popup modal
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisionTargetId, setRevisionTargetId] = useState<string | null>(null);

  // Active Menu Row
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const activeProjectBOQs = useMemo(() => {
    if (!currentProject) return boqs;
    return boqs.filter(boq => boq.projectId === currentProject.id);
  }, [boqs, currentProject]);

  const filteredBOQs = useMemo(() => {
    return activeProjectBOQs.filter(boq => {
      const matchesSearch = 
        boq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        boq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (boq.createdBy && boq.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = 
        activeFilter === 'All' || 
        boq.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeProjectBOQs, searchTerm, activeFilter]);

  const sortedBOQs = useMemo(() => {
    const list = [...filteredBOQs];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortBy === 'amount') {
        comparison = a.totalAmount - b.totalAmount;
      } else if (sortBy === 'updated') {
        comparison = a.lastUpdated.localeCompare(b.lastUpdated);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return list;
  }, [filteredBOQs, sortBy, sortOrder]);

  // Pagination calculation
  const paginatedBOQs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBOQs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBOQs, currentPage]);

  const totalPages = Math.ceil(sortedBOQs.length / itemsPerPage) || 1;

  const handleOpenRevisionModal = (e: React.MouseEvent, boqId: string) => {
    e.stopPropagation();
    setRevisionTargetId(boqId);
    setRevisionNotes('');
  };

  const handleCreateRevisionSubmit = () => {
    if (revisionTargetId) {
      createRevision(revisionTargetId, revisionNotes || 'Additional version updates.');
      setRevisionTargetId(null);
      onSelectBOQ(boqs[boqs.length - 1]?.id || 'boq-1'); // Select new
    }
  };

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionMenuOpenId(actionMenuOpenId === id ? null : id);
  };

  return (
    <div className="h-full flex flex-col gap-5 text-[13px] text-slate-600 animate-fade-in relative">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] text-zentrix-muted font-medium mb-1">
            Projects / {currentProject?.name || 'All'} / Cost Management
          </div>
          <h2 className="text-xl font-bold text-zentrix-blue leading-tight">Master Bills of Quantities (BOQ)</h2>
          <p className="text-slate-500 text-[12.5px]">Configure Bill Structures, Resource Estimates, Revisions, and Cost Summaries.</p>
        </div>
        <button 
          onClick={onCreateBOQ}
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-700 hover:shadow-lg transition-all shadow-md cursor-pointer self-start md:self-auto leading-none"
        >
          <Plus size={15} />
          Create New BOQ
        </button>
      </div>

      {/* Control Bar: Search + Filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="flex-1 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          
          {/* Status Tabs instead of select button for premium vibe */}
          <div className="flex bg-white border border-zentrix-border rounded-xl p-1 gap-1 shadow-sm shrink-0 overflow-x-auto">
            {(['All', 'Draft', 'Approved', 'Review', 'Revised', 'Archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveFilter(tab); setCurrentPage(1); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap",
                  activeFilter === tab 
                    ? "bg-primary-600 text-white" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search container */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by BOQ code, name, quantity surveyor..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zentrix-border rounded-xl text-xs focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Sort & Region Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-white border border-zentrix-border p-1.5 py-1 rounded-xl shadow-sm text-xs">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
            >
              <option value="updated">Last Updated</option>
              <option value="name">Name</option>
              <option value="code">BOQ Code</option>
              <option value="amount">Total Value</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="pl-1 text-slate-400 hover:text-slate-600 font-black cursor-pointer"
            >
              {sortOrder === 'asc' ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Listing Grid (Table style for professional Quantity Surveyors) */}
      <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-zentrix-border text-slate-400 font-bold text-[10.5px] uppercase tracking-wider">
                <th className="pl-6 py-3.5 w-32">BOQ Code</th>
                <th className="px-4 py-3.5">BOQ Name</th>
                <th className="px-4 py-3.5 w-24 text-center">Rev No</th>
                <th className="px-4 py-3.5 w-32 text-right">Total Estimated Value</th>
                <th className="px-4 py-3.5 w-36">Created By</th>
                <th className="px-4 py-3.5 w-28">Last Updated</th>
                <th className="px-4 py-3.5 w-28">Approval Status</th>
                <th className="pr-6 py-3.5 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBOQs.length > 0 ? (
                paginatedBOQs.map((boq) => (
                  <tr 
                    key={boq.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedBOQId(boq.id);
                      onSelectBOQ(boq.id);
                    }}
                  >
                    <td className="pl-6 py-4.5 font-mono font-bold text-primary-600">
                      {boq.code}
                    </td>
                    <td className="px-4 py-4.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-zentrix-blue group-hover:text-primary-600 transition-colors">{boq.name}</span>
                        {boq.revisionNotes && (
                          <span className="text-[11px] text-slate-450 mt-1 truncate max-w-sm">{boq.revisionNotes}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4.5 text-center font-bold">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 text-[11px]">v{boq.revisionNo}</span>
                    </td>
                    <td className="px-4 py-4.5 text-right font-mono font-black text-zentrix-blue">
                      {formatCurrency(boq.totalAmount)}
                    </td>
                    <td className="px-4 py-4.5 text-slate-500 font-medium">
                      {boq.createdBy || 'Systems QS'}
                    </td>
                    <td className="px-4 py-4.5 text-slate-400 font-mono text-[11px]">
                      {boq.lastUpdated}
                    </td>
                    <td className="px-4 py-4.5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase",
                        boq.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        boq.status === 'Review' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        boq.status === 'Revised' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                        boq.status === 'Archived' ? "bg-slate-100 text-slate-500" :
                        "bg-blue-50 text-blue-600 border border-blue-100" // Draft
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          boq.status === 'Approved' ? "bg-emerald-500" :
                          boq.status === 'Review' ? "bg-amber-500" :
                          boq.status === 'Revised' ? "bg-purple-500" :
                          boq.status === 'Archived' ? "bg-slate-400" : "bg-blue-500"
                        )} />
                        {boq.status === 'Draft' ? 'Draft Scope' : boq.status}
                      </span>
                    </td>
                    <td className="pr-6 py-4.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handleActionClick(e, boq.id)}
                        className="p-1 px-2 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {/* Dropdown Menu */}
                      {actionMenuOpenId === boq.id && (
                        <div className="absolute right-6 top-10 mt-1.5 w-44 bg-white border border-zentrix-border rounded-xl shadow-xl z-50 py-1.5 text-left divide-y divide-slate-100 animate-scale-up">
                          <div className="py-1">
                            <button 
                              onClick={() => { setSelectedBOQId(boq.id); onSelectBOQ(boq.id); }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-xs font-bold text-zentrix-blue flex items-center gap-2"
                            >
                              <FolderOpen size={13} className="text-slate-400" /> Open Builder
                            </button>
                            <button 
                              onClick={() => { duplicateBOQ(boq.id); setActionMenuOpenId(null); }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-xs text-slate-600 flex items-center gap-2"
                            >
                              <Copy size={13} className="text-slate-400" /> Duplicate BOQ
                            </button>
                          </div>
                          <div className="py-1">
                            <button 
                              onClick={(e) => { handleOpenRevisionModal(e, boq.id); setActionMenuOpenId(null); }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-xs text-primary-600 font-bold flex items-center gap-2"
                            >
                              <RefreshCw size={13} className="text-primary-500 animate-spin-once" /> Create Revision
                            </button>
                            <button 
                              onClick={() => { archiveBOQ(boq.id); setActionMenuOpenId(null); }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-xs text-slate-500 flex items-center gap-2"
                            >
                              <Archive size={13} className="text-slate-400" /> Archive BOQ
                            </button>
                          </div>
                          <div className="py-1">
                            <button 
                              onClick={() => { if (confirm('Delete this BOQ?')) deleteBOQ(boq.id); setActionMenuOpenId(null); }}
                              className="w-full px-4 py-2 hover:bg-red-50 text-xs text-red-650 font-bold flex items-center gap-2"
                            >
                              🗑️ Delete BOQ
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <FileText size={24} />
                    </div>
                    <p className="text-slate-500 font-bold">No Bills of Quantities found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting status filters or start a new structural sheet.</p>
                    <button 
                      onClick={onCreateBOQ}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow"
                    >
                      + Create New BOQ
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination */}
        <div className="bg-slate-50 border-t border-zentrix-border px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-500">
          <div>
            Showing <span className="font-bold text-zentrix-blue">{sortedBOQs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-zentrix-blue">{Math.min(currentPage * itemsPerPage, sortedBOQs.length)}</span> of{' '}
            <span className="font-bold text-zentrix-blue">{sortedBOQs.length}</span> sheets
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-500 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-zentrix-blue">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-500 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Revision Modal Popup */}
      {revisionTargetId && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center.5 z-50 p-4.5 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-zentrix-border shadow-2xl p-6.5 max-w-md w-full text-left space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zentrix-blue flex items-center gap-1.5 leading-none">
                <Sparkles size={16} className="text-amber-500" /> Create BOQ Version Revision
              </h3>
              <button onClick={() => setRevisionTargetId(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              This duplicates the source sheet, increments the version code, copies all item breakdown entries, and opens the editor scope under custom draft revision.
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revision Description / Notes</label>
              <textarea 
                rows={3}
                placeholder="e.g. Scope adjustments following structural meeting R7..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setRevisionTargetId(null)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateRevisionSubmit}
                className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-primary-900/10"
              >
                Launch New Revision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
