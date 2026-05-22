import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { Project } from '../types.ts';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Grid, 
  List, 
  KanbanSquare, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Plus, 
  Star, 
  Pin, 
  Archive, 
  Copy, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  PauseCircle,
  TrendingDown,
  ArrowRight,
  MoreVertical,
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectPortfolioProps {
  statusFilter?: string;
  onSelectProject?: (id: string) => void;
  onOpenCreateModal?: () => void;
  onOpenCloneModal?: (id: string) => void;
}

export const ProjectPortfolio = ({ 
  statusFilter: initialStatusFilter = 'all', 
  onSelectProject, 
  onOpenCreateModal, 
  onOpenCloneModal 
}: ProjectPortfolioProps) => {
  const { 
    projects, 
    favoritedProjectIds, 
    toggleFavoriteProject, 
    pinnedProjectId, 
    pinProject, 
    archiveProject 
  } = useProject();

  const [viewMode, setViewMode] = useState<'card' | 'table' | 'kanban'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filter and sort projects
  const filteredProjects = projects.filter(p => {
    // Basic search code/name/client
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' 
      ? (showActiveOnly ? p.status !== 'Archived' : true)
      : p.status === statusFilter;
      
    // Sector filter
    const matchesSector = sectorFilter === 'all' || p.sector === sectorFilter;

    // Risk Level filter
    const matchesRisk = riskFilter === 'all' || p.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesSector && matchesRisk;
  });

  // Calculate high level KPI details
  const totalBudget = projects.filter(p => p.status !== 'Archived').reduce((acc, p) => acc + p.budget, 0);
  const totalValue = projects.filter(p => p.status !== 'Archived').reduce((acc, p) => acc + p.contractValue, 0);
  const activeCount = projects.filter(p => p.status === 'Active' || p.status === 'Delayed').length;
  const delayedCount = projects.filter(p => p.status === 'Delayed').length;
  const planningCount = projects.filter(p => p.status === 'Planning').length;

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
            <CheckCircle2 size={12} className="text-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Delayed':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
            <AlertTriangle size={12} className="text-rose-500 animate-bounce" />
            Delayed
          </span>
        );
      case 'Planning':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-100 rounded-full">
            <Clock size={12} className="text-sky-500" />
            Planning
          </span>
        );
      case 'On Hold':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
            <PauseCircle size={12} className="text-amber-500" />
            On Hold
          </span>
        );
      case 'Completed':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100 rounded-full">
            <CheckCircle2 size={12} className="text-purple-500" />
            Completed
          </span>
        );
      case 'Archived':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded-full">
            <Archive size={12} className="text-slate-400" />
            Archived
          </span>
        );
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Analytics Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Total Portfolio Value</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-zentrix-blue">{formatCurrency(totalValue)}</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp size={10} /> +12% YoY
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Sum of all signed active contracts</p>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Active Projects</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-zentrix-blue">{activeCount}</h3>
            <span className="text-[11px] text-zinc-400">/ {projects.length} Total</span>
          </div>
          <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle size={12} /> {delayedCount} experiencing delays
          </p>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Overall Target SPI</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-emerald-600">1.02</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Healthy
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Average Schedule Performance Index</p>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Budget Utilization</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-zentrix-blue">42.8%</h3>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              CPI: 0.99
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Actual Cost vs planned baseline</p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white border border-zentrix-border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by project name, code, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-[13px] border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 user-select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={!showActiveOnly} 
                onChange={() => setShowActiveOnly(!showActiveOnly)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
              />
              Show Archived
            </label>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-zentrix-border rounded-lg px-2.5 py-1.5">
            <Filter size={13} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="Delayed">Delayed</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-zentrix-border rounded-lg px-2.5 py-1.5">
            <Sliders size={13} className="text-slate-400" />
            <select 
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none font-medium cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="Real Estate & Infrastructure">Residential/Real Estate</option>
              <option value="Logistics & Infrastructure">Industrial/Logistics</option>
              <option value="Public Roads & Transport">Infrastructure</option>
              <option value="Tourism & Housing">Tourism</option>
              <option value="Utilities & Leisure">Utilities</option>
              <option value="Heritage & Hospitality">Heritage</option>
            </select>
          </div>

          {/* Layout switcher */}
          <div className="flex items-center border border-zentrix-border rounded-lg p-0.5 bg-slate-50">
            <button 
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Card View"
            >
              <Grid size={15} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Kanban Board"
            >
              <KanbanSquare size={15} />
            </button>
          </div>

          <button 
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-[13px] px-3.5 py-2 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            Create Project
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-zentrix-border rounded-xl py-12 px-8 text-center flex flex-col items-center justify-center">
          <Building2 size={48} className="text-slate-300 mb-4" />
          <h4 className="text-md font-bold text-zentrix-blue">No matching projects found</h4>
          <p className="text-slate-400 max-w-sm text-xs mt-1">Try adjusting your filters, adding a search keyword, or create a brand new construction project to begin.</p>
          <button 
            onClick={onOpenCreateModal}
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> Create New Project
          </button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const isFav = favoritedProjectIds.includes(p.id);
            const isPinned = pinnedProjectId === p.id;
            // Calculate a fake progress bar / SPI bar
            let progressPercent = p.status === 'Completed' ? 100 : p.status === 'Planning' ? 0 : p.id === 'proj-1' ? 45 : p.id === 'proj-2' ? 12 : p.id === 'proj-3' ? 92 : p.id === 'proj-5' ? 15 : 25;
            
            return (
              <div 
                key={p.id}
                className="bg-white border border-zentrix-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col relative group cursor-pointer"
                onClick={() => onSelectProject(p.id)}
              >
                {/* Banner / Header */}
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={p.bannerImage || 'https://images.unsplash.com/photo-1541913057-25902bc56201?auto=format&fit=crop&q=80&w=600'} 
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  {/* Floating Pins and Stars */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => pinProject(isPinned ? null : p.id)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${isPinned ? 'bg-primary-600 text-white' : 'bg-black/40 text-white/70 hover:text-white'}`}
                      title={isPinned ? 'Unpin project' : 'Pin project to workspace'}
                    >
                      <Pin size={13} className={isPinned ? 'rotate-45 fill-white' : ''} />
                    </button>
                    <button 
                      onClick={() => toggleFavoriteProject(p.id)}
                      className="p-1.5 rounded-full backdrop-blur-md bg-black/40 text-white/70 hover:text-white transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star size={13} className={isFav ? 'text-amber-400 fill-amber-400' : ''} />
                    </button>
                  </div>

                  {/* Absolute sector / status badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-white/20 text-white border border-white/10 rounded backdrop-blur-md">
                      {p.code}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wide leading-none">{p.client}</p>
                      <h4 className="text-[14px] font-bold text-white truncate leading-snug mt-1">{p.name}</h4>
                    </div>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <p className="text-[11px] text-zinc-500 line-clamp-2 min-h-[32px] leading-relaxed">
                    {p.description}
                  </p>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 border-t border-b border-dashed border-slate-100 py-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{p.city}, {p.city === 'NEOM District' ? 'KSA' : 'Saudi Arabia'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end text-right">
                      <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="font-bold text-zentrix-blue">{formatCurrency(p.contractValue)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate text-[11px] font-medium">{p.projectManager}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end text-right text-[11px]">
                      <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                      <span>{p.startDate}</span>
                    </div>
                  </div>

                  {/* Progress segment */}
                  <div className="space-y-1.5 mt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wide">Overall Work Progress</span>
                      <span className="text-zentrix-blue font-black">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${p.status === 'Delayed' ? 'bg-rose-500' : 'bg-primary-600'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-zentrix-border flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <div>
                    {getStatusBadge(p.status)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onOpenCloneModal(p.id)}
                      className="p-1 px-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-md transition-all flex items-center gap-1"
                      title="Clone/Duplicate Project Model"
                    >
                      <Copy size={12} />
                      <span className="text-[10px] font-bold">Clone</span>
                    </button>
                    <button 
                      onClick={() => archiveProject(p.id)}
                      className="p-1 px-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-all flex items-center gap-1"
                      title="Archive Project"
                    >
                      <Archive size={12} />
                      <span className="text-[10px] font-bold">Archive</span>
                    </button>
                    <button 
                      onClick={() => onSelectProject(p.id)}
                      className="p-1 px-1.5 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 hover:text-primary-700 transition-all ml-1"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-zentrix-border text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4 font-normal text-left">Client & Sector</th>
                  <th className="py-3 px-4 font-normal text-left">Status</th>
                  <th className="py-3 px-4 text-right">Contract Value</th>
                  <th className="py-3 px-4 font-normal">Progress %</th>
                  <th className="py-3 px-4 font-normal">Project Manager</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredProjects.map((p) => {
                  let progressPercent = p.status === 'Completed' ? 100 : p.status === 'Planning' ? 0 : p.id === 'proj-1' ? 45 : p.id === 'proj-2' ? 12 : p.id === 'proj-3' ? 92 : p.id === 'proj-5' ? 15 : 25;
                  
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className="hover:bg-slate-50/75 cursor-pointer/ transition-all group cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{p.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zentrix-blue group-hover:text-primary-600 transition-colors">{p.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.city}, KSA</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">{p.client}</div>
                        <div className="text-[10px] text-slate-400">{p.sector}</div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-3 px-4 text-right font-bold text-zentrix-blue">{formatCurrency(p.contractValue)}</td>
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${progressPercent}%` }} />
                          </div>
                          <span className="font-bold text-[11px] text-zentrix-blue">{progressPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{p.projectManager}</td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onOpenCloneModal(p.id)}
                            className="p-1 text-slate-400 hover:text-primary-600 rounded"
                            title="Clone"
                          >
                            <Copy size={13} />
                          </button>
                          <button 
                            onClick={() => archiveProject(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="Archive"
                          >
                            <Archive size={13} />
                          </button>
                          <button 
                            onClick={() => onSelectProject(p.id)}
                            className="p-1 text-primary-600 bg-primary-50 rounded"
                            title="Open Workspace"
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board representing construction projects status */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {['Planning', 'Active', 'Delayed', 'Completed'].map((statusCol) => {
            const projectsInCol = filteredProjects.filter(p => {
              if (p.status === 'On Hold' && statusCol === 'Planning') return true;
              return p.status === statusCol;
            });

            return (
              <div key={statusCol} className="bg-slate-100/75 border border-zentrix-border rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-bold text-zentrix-blue font-mono uppercase tracking-widest">{statusCol}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white border border-zentrix-border rounded-full text-slate-500">
                    {projectsInCol.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[550px] pr-0.5">
                  {projectsInCol.map(p => {
                    let progressPercent = p.status === 'Completed' ? 100 : p.status === 'Planning' ? 0 : p.id === 'proj-1' ? 45 : p.id === 'proj-2' ? 12 : p.id === 'proj-3' ? 92 : p.id === 'proj-5' ? 15 : 25;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => onSelectProject(p.id)}
                        className="bg-white border border-zentrix-border rounded-lg p-3.5 shadow-sm hover:shadow hover:border-slate-300 transition-all cursor-pointer flex flex-col gap-2 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {p.code}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : p.status === 'Delayed' ? 'bg-rose-500' : p.status === 'Planning' ? 'bg-sky-500' : 'bg-purple-500'}`} />
                        </div>

                        <h5 className="font-bold text-[13px] text-zentrix-blue truncate">{p.name}</h5>
                        <p className="text-[10px] text-slate-400 -mt-1">{p.client}</p>

                        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-dashed border-slate-100">
                          <span className="font-bold text-zentrix-blue">{formatCurrency(p.contractValue)}</span>
                          <span className="font-bold text-primary-600">{progressPercent}% progress</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
