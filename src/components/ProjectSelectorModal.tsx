import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { Project } from '../types.ts';
import { 
  X, 
  Search, 
  Star, 
  Pin, 
  MapPin, 
  User, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Archive,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (id: string) => void;
  onOpenCreateProject: () => void;
}

export const ProjectSelectorModal = ({ isOpen, onClose, onSelectProject, onOpenCreateProject }: ProjectSelectorModalProps) => {
  const { 
    projects, 
    recentProjectIds, 
    favoritedProjectIds, 
    toggleFavoriteProject,
    pinnedProjectId,
    pinProject
  } = useProject();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'recent' | 'favorites' | 'archived'>('active');

  if (!isOpen) return null;

  // Determine lists
  const activeProjects = projects.filter(p => p.status !== 'Archived');
  const recentProjects = recentProjectIds.map(id => projects.find(p => p.id === id)).filter(Boolean) as Project[];
  const favoriteProjects = favoritedProjectIds.map(id => projects.find(p => p.id === id)).filter(Boolean) as Project[];
  const archivedProjects = projects.filter(p => p.status === 'Archived');

  let currentList: Project[] = [];
  if (activeTab === 'active') currentList = activeProjects;
  else if (activeTab === 'recent') currentList = recentProjects;
  else if (activeTab === 'favorites') currentList = favoriteProjects;
  else if (activeTab === 'archived') currentList = archivedProjects;

  // Search Filter
  const filteredList = currentList.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeColor = (status: Project['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Delayed': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Planning': return 'bg-sky-50 text-sky-700 border-sky-150';
      case 'On Hold': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'Completed': return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const selectAndClose = (id: string) => {
    onSelectProject(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-[13px] text-slate-600">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-zentrix-border animate-slide-up">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zentrix-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-primary-600" size={20} />
            <div>
              <h3 className="text-md font-black text-zentrix-blue">Enterprise Project Switcher</h3>
              <p className="text-[11px] text-slate-400">Shift active platform workspace context across multi-tenant projects.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 px-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Search, Filter bar */}
        <div className="p-4 border-b border-zentrix-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search workspaces by code, client, sector or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Tab switchers */}
            <div className="flex items-center border border-zentrix-border rounded-lg p-0.5 bg-slate-50 whitespace-nowrap shrink-0">
              <button 
                onClick={() => setActiveTab('active')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('recent')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'recent' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Recent
              </button>
              <button 
                onClick={() => setActiveTab('favorites')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'favorites' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Starred
              </button>
              <button 
                onClick={() => setActiveTab('archived')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'archived' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Archived
              </button>
            </div>

            <button 
              onClick={() => { onOpenCreateProject(); onClose(); }}
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs leading-none flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} /> New
            </button>
          </div>
        </div>

        {/* Projects Cards Grid List */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((p) => {
              const isFav = favoritedProjectIds.includes(p.id);
              const isPinned = pinnedProjectId === p.id;
              let progressPercent = p.status === 'Completed' ? 100 : p.status === 'Planning' ? 0 : p.id === 'proj-1' ? 45 : p.id === 'proj-2' ? 12 : p.id === 'proj-3' ? 92 : p.id === 'proj-5' ? 15 : 25;

              return (
                <div 
                  key={p.id}
                  onClick={() => selectAndClose(p.id)}
                  className="bg-white border border-zentrix-border rounded-xl overflow-hidden shadow-sm hover:shadow hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  {/* Absolute pin status */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => pinProject(isPinned ? null : p.id)}
                      className={`p-1 rounded-full ${isPinned ? 'bg-primary-600 text-white' : 'bg-black/30 text-white/80 hover:bg-black/55'}`}
                      title="Pin Workspace Context"
                    >
                      <Pin size={11} className={isPinned ? 'rotate-45' : ''} />
                    </button>
                    <button 
                      onClick={() => toggleFavoriteProject(p.id)}
                      className="p-1 rounded-full bg-black/30 text-white/80 hover:bg-black/55"
                      title="Star Workspace"
                    >
                      <Star size={11} className={isFav ? 'text-amber-400 fill-amber-400' : ''} />
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 rounded border border-slate-200">
                      {p.code}
                    </span>
                    <h4 className="font-bold text-zentrix-blue group-hover:text-primary-600 transition-colors mt-2 text-[13.5px] truncate max-w-[210px]">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-bold -mt-0.5">{p.client}</p>

                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mt-2.5 min-h-[32px]">
                      {p.description}
                    </p>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-500 mt-3 pt-3 border-t border-dashed border-slate-100">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{p.city}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end font-bold text-zentrix-blue">
                        <DollarSign size={11} className="text-slate-400" />
                        <span>{progressPercent}% Complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2 bg-slate-50 border-t border-zentrix-border flex justify-between items-center text-[11px]">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border uppercase ${getStatusBadgeColor(p.status)}`}>
                      {p.status}
                    </span>

                    <span className="text-primary-600 font-bold hover:underline group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Enter Workspace <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredList.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No matching construction workspaces found in this filter tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
