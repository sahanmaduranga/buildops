import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Edit, 
  Copy, 
  FolderLock, 
  Download, 
  ChevronRight,
  MoreHorizontal,
  ChevronUp,
  X,
  Plus,
  Grid,
  List,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { type RateAnalysis, type Resource, ResourceType, type RateCategory } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';
import { MOCK_REGIONS, MOCK_PERIODS } from '../../mockData.ts';

interface ListViewProps {
  analyses: RateAnalysis[];
  resources: Resource[];
  onSelectAnalysis: (analysisId: string) => void;
  onDuplicateAnalysis: (analysisId: string) => void;
  onArchiveAnalysis: (analysisId: string) => void;
  onSelectSubTab: (subTabId: string) => void;
  categories: RateCategory[];
  setCategories: React.Dispatch<React.SetStateAction<RateCategory[]>>;
  selectedRegion: string;
  onRegionChange: (regionId: string) => void;
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
}

export const ListView = ({ 
  analyses, 
  resources, 
  onSelectAnalysis,
  onDuplicateAnalysis,
  onArchiveAnalysis,
  onSelectSubTab,
  categories,
  setCategories,
  selectedRegion,
  onRegionChange,
  selectedPeriod,
  onPeriodChange
}: ListViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'Approved' | 'Revised' | 'Archived'>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'all' | ResourceType>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<keyof RateAnalysis | 'code' | 'finalRate'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Category expanded tree states
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    civil: true,
  });

  // Category creation states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  const [activeActionsMenu, setActiveActionsMenu] = useState<string | null>(null);

  // Helper to dynamically calculate count of rate analyses for any category/subcategory (including nested children counts)
  const getCategoryCount = (catId: string) => {
    const descendantIds = [catId];
    categories.forEach(c => {
      if (c.parentId === catId) {
        descendantIds.push(c.id);
      }
    });

    return analyses.filter(a => descendantIds.includes(a.categoryId || '')).length;
  };

  // Get active descendant category IDs for selected category filter
  const getActiveFilterCategories = () => {
    if (selectedCategory === 'all') return [];
    const ids = [selectedCategory];
    categories.forEach(c => {
      if (c.parentId === selectedCategory) {
        ids.push(c.id);
      }
    });
    return ids;
  };

  // Process and decorate analyses
  const decoratedAnalyses = analyses.map((a, idx) => {
    let mockStatus: 'Draft' | 'Approved' | 'Revised' | 'Archived' = 'Draft';
    if (a.id === 'ra-1') mockStatus = 'Approved';
    else if (a.id === 'ra-2') mockStatus = 'Revised';
    else if (idx % 2 === 0) mockStatus = 'Approved';

    return {
      ...a,
      status: mockStatus,
      revision: a.id === 'ra-1' ? 'Rev 3' : a.id === 'ra-2' ? 'Rev 2' : 'Rev 1',
      lastUpdated: a.id === 'ra-1' ? '2026-05-20' : '2026-05-18',
      createdBy: a.id === 'ra-1' ? 'Robert Chen (Senior QS)' : 'Robert Chen (Senior QS)'
    };
  });

  // Filter analyses
  const activeFilterCats = getActiveFilterCategories();
  const filtered = decoratedAnalyses.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    // Matched category includes the selected category, or is a subcategory of the selected category
    const matchesCategory = selectedCategory === 'all' || activeFilterCats.includes(item.categoryId || '');
    
    const matchesResourceType = resourceTypeFilter === 'all' || 
      item.resources.some(r => r.resourceType === resourceTypeFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesResourceType;
  });

  // Sort analyses
  const sorted = [...filtered].sort((a: any, b: any) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  const handleSort = (field: keyof RateAnalysis | 'finalRate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Dynamic Header Section matching "Riyadh Central" & "2024 Q2" & "+ New Rate Analysis" */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Rate Analysis Library</h3>
          <p className="text-[11px] text-slate-400 mt-1">Manage rate estimation groups, sub-groups, and custom construction worksheets.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Region selector */}
          <div className="flex items-center gap-1.5 bg-white border border-zentrix-border px-3 py-1.5 rounded-lg shadow-sm">
            <MapPin size={13} className="text-slate-400" />
            <select 
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="text-xs font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
            >
              {MOCK_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-white border border-zentrix-border px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar size={13} className="text-slate-400" />
            <select 
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="text-xs font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
            >
              {MOCK_PERIODS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => onSelectSubTab('rate-analysis-builder')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs leading-none transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> New Rate Analysis
          </button>
        </div>
      </div>

      {/* SEARCH, FILTERS, AND VIEW TOGGLE ROW */}
      <div className="bg-white border border-zentrix-border rounded-xl p-3 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by description or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[12.5px] focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner font-medium text-slate-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-405 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Advanced filter toggle btn */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "px-3 py-2 border rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
              showAdvancedFilters || statusFilter !== 'all' || resourceTypeFilter !== 'all'
                ? "border-primary-200 bg-primary-50/50 text-primary-700"
                : "border-zentrix-border hover:bg-slate-55 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter size={13} />
            <span>Filters</span>
          </button>

          {/* View mode toggle with visual colors */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-md transition-all cursor-pointer",
                viewMode === 'grid' 
                  ? "bg-white text-primary-600 shadow-xs font-bold" 
                  : "text-slate-450 hover:text-slate-650"
              )}
              title="Grid Cards View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-md transition-all cursor-pointer",
                viewMode === 'table' 
                  ? "bg-white text-primary-600 shadow-xs font-bold" 
                  : "text-slate-450 hover:text-slate-650"
              )}
              title="Ledger Table View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSED ADVANCED FILTERS PANEL */}
      {showAdvancedFilters && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-inner">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Analysis Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs font-semibold outline-none text-slate-700"
            >
              <option value="all">All States</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Revised">Revised</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Required Resource Composition:</span>
            <select 
              value={resourceTypeFilter} 
              onChange={(e: any) => setResourceTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs font-semibold outline-none text-slate-700"
            >
              <option value="all">Any Resources Composition</option>
              <option value={ResourceType.MATERIAL}>Must contain Materials</option>
              <option value={ResourceType.LABOR}>Must contain Labor</option>
              <option value={ResourceType.EQUIPMENT}>Must contain Equipment</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 md:col-span-1 flex items-end">
            <button 
              onClick={() => {
                setStatusFilter('all');
                setResourceTypeFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="w-full py-1.5 bg-white border border-slate-200 hover:border-slate-300 font-bold text-xs rounded text-slate-500 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* PRIMARY LIBRARY BODY GRID */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* LEFT COMPANION: CATEGORIES TREE STRUCTURE */}
        <div className="w-full lg:w-64 shrink-0 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">CATEGORIES</span>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-1 hover:bg-slate-100 rounded text-primary-600 transition hover:text-primary-700 flex items-center justify-center cursor-pointer"
              title="Add Category Group / Sub-group"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1.5">
            {/* All Analysis button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer",
                selectedCategory === 'all' 
                  ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600" 
                  : "hover:bg-slate-50 text-slate-600"
              )}
            >
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-slate-400" />
                <span>All Analysis</span>
              </div>
              <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {analyses.length}
              </span>
            </button>

            {/* Dynamic Parent groups and Child sub-groups */}
            {categories.filter(c => !c.parentId && c.id !== 'all').map(parent => {
              const subGroups = categories.filter(child => child.parentId === parent.id);
              const isExpanded = expandedParents[parent.id] ?? true;
              const parentCount = getCategoryCount(parent.id);
              const hasChildren = subGroups.length > 0;
              
              return (
                <div key={parent.id} className="space-y-1">
                  {/* Parent Cat Row */}
                  <div
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all text-left",
                      selectedCategory === parent.id 
                        ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600" 
                        : "hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-1.5 cursor-pointer flex-1" onClick={() => setSelectedCategory(parent.id)}>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedParents(prev => ({ ...prev, [parent.id]: !isExpanded }));
                          }}
                          className="p-0.5 hover:bg-slate-200 rounded text-slate-400 cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                      )}
                      {!hasChildren && <div className="w-4" />}
                      <span className="truncate">{parent.label}</span>
                    </div>
                    
                    <span className="bg-slate-150 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {parentCount}
                    </span>
                  </div>

                  {/* Children Sub-categories */}
                  {hasChildren && isExpanded && (
                    <div className="pl-6 border-l border-slate-100 ml-4 space-y-1 my-0.5">
                      {subGroups.map(sub => {
                        const subCount = getCategoryCount(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedCategory(sub.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[11.5px] font-medium transition-all text-left cursor-pointer",
                              selectedCategory === sub.id 
                                ? "bg-primary-50/70 text-primary-700 font-extrabold" 
                                : "hover:bg-slate-50 text-slate-500"
                            )}
                          >
                            <span className="truncate">{sub.label}</span>
                            <span className="text-[10px] text-slate-405 font-medium">
                              {subCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTENT COLUMN: CARDS LAYOUT OR LEDGER DATAGRID TABLE */}
        <div className="flex-1 w-full">
          {viewMode === 'grid' ? (
            /* VISUAL CARDS GRID MODULE */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted.map(item => {
                const hasMaterial = item.resources.some(r => r.resourceType === ResourceType.MATERIAL);
                const hasLabor = item.resources.some(r => r.resourceType === ResourceType.LABOR);
                const hasEquipment = item.resources.some(r => r.resourceType === ResourceType.EQUIPMENT);

                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-zentrix-border rounded-xl p-4 opacity-100 hover:border-primary-400 transition-all hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                  >
                    
                    {/* Top row */}
                    <div className="flex items-start gap-3.5 pt-1 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shrink-0 shadow-sm">
                        <Layers size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10.5px] font-black text-primary-500 uppercase tracking-wide bg-primary-50/40 px-1.5 py-0.5 rounded border border-primary-100/30">
                            {item.code}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                            {item.unit}
                          </span>
                        </div>
                        
                        <h4 
                          onClick={() => onSelectAnalysis(item.id)}
                          className="font-black text-zentrix-blue hover:text-primary-600 text-[13.5px] tracking-tight leading-tight cursor-pointer pt-1 truncate"
                          title={item.description}
                        >
                          {item.description}
                        </h4>
                      </div>
                    </div>

                    {/* Middle Core info (FINAL RATE v RESOURCES COUNT) */}
                    <div className="grid grid-cols-2 gap-4 my-4 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-lg text-left">
                      <div>
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block leading-none">FINAL RATE</span>
                        <span className="text-[15.5px] font-black font-mono text-[#0F172A] leading-none mt-1.5 block">
                          {formatCurrency(item.finalRate)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block leading-none">RESOURCES</span>
                        <span className="text-xs font-black text-[#475569] mt-1.5 block leading-none">
                          {item.resources.length} items
                        </span>
                      </div>
                    </div>

                    {/* Footer Row (Composition circle badges & Stable certification labels) */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {hasMaterial && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] bg-blue-50 text-blue-600 font-bold border border-white" title="Materials Composition">M</span>
                          )}
                          {hasLabor && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] bg-orange-50 text-orange-600 font-bold border border-white" title="Labor Composition">L</span>
                          )}
                          {hasEquipment && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] bg-purple-50 text-purple-600 font-bold border border-white" title="Equipment Composition">E</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Composition</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 border leading-none",
                          item.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          item.status === 'Revised' ? "bg-cyan-50 text-cyan-600 border-cyan-100" :
                          "bg-amber-50 text-amber-605 border-amber-100 text-amber-600"
                        )}>
                          <span className={cn(
                            "w-1 h-1 rounded-full",
                            item.status === 'Approved' ? "bg-emerald-500" :
                            item.status === 'Revised' ? "bg-cyan-500" :
                            "bg-amber-550 bg-amber-500"
                          )} />
                          {item.status === 'Approved' ? 'Stable' : item.status}
                        </span>
                        
                        {/* Quick hover menu option icons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition absolute right-2.5 top-2.5 bg-white border border-slate-200 rounded-md p-1 shadow-md">
                          <button 
                            onClick={() => onSelectAnalysis(item.id)}
                            className="p-1 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded cursor-pointer"
                            title="Edit Rate Sheet"
                          >
                            <Edit size={11} />
                          </button>
                          <button 
                            onClick={() => onDuplicateAnalysis(item.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
                            title="Duplicate Row"
                          >
                            <Copy size={11} />
                          </button>
                          <button 
                            onClick={() => onArchiveAnalysis(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded cursor-pointer"
                            title="Archive Item"
                          >
                            <FolderLock size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Dotted CREATE NEW ANALYSIS button matching mockup */}
              <button 
                onClick={() => onSelectSubTab('rate-analysis-builder')}
                className="border-2 border-dashed border-slate-200 hover:border-primary-500 rounded-xl p-6 flex flex-col items-center justify-center gap-3.5 bg-slate-50/40 hover:bg-white transition-all cursor-pointer group min-h-[165px]"
              >
                <div className="w-11 h-11 rounded-full border border-slate-300 group-hover:border-primary-500 flex items-center justify-center bg-white shadow-sm transition">
                   <Plus className="text-slate-400 group-hover:text-primary-600" size={20} />
                </div>
                <span className="text-xs font-black text-slate-450 group-hover:text-primary-600 uppercase tracking-widest leading-none">CREATE NEW ANALYSIS</span>
              </button>

              {sorted.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 font-semibold italic text-sm border-2 border-dashed border-slate-100 rounded-xl">
                  No rate estimation cards matched. Adjust the filters or select other categories.
                </div>
              )}
            </div>
          ) : (
            /* DETAILED LEDGER DATAGRID TABLE LIST */
            <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-left">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-zentrix-border text-[10.5px]">
                      <th 
                        onClick={() => handleSort('code')}
                        className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          Analysis Code
                          {sortBy === 'code' && (sortOrder === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                      <th className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider w-20 text-center">
                        Unit
                      </th>
                      <th 
                        onClick={() => handleSort('finalRate')}
                        className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider cursor-pointer hover:bg-slate-100 text-right w-32"
                      >
                        <div className="flex items-center justify-end gap-1">
                          Total Rate
                          {sortBy === 'finalRate' && (sortOrder === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                      <th className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider w-28 text-center">
                        Status
                      </th>
                      <th className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider w-24 text-center">
                        Revision
                      </th>
                      <th className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider w-32">
                        Last Updated
                      </th>
                      <th className="px-5 py-3.5 font-bold text-zentrix-muted uppercase tracking-wider w-20 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {sorted.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        
                        <td className="px-5 py-3.5 font-mono text-[11.5px] text-slate-400 font-bold">
                          <span 
                            onClick={() => onSelectAnalysis(item.id)}
                            className="cursor-pointer text-primary-600 hover:underline hover:text-primary-700 font-bold"
                          >
                            {item.code}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <h4 
                              onClick={() => onSelectAnalysis(item.id)}
                              className="font-bold text-zentrix-blue hover:text-primary-600 cursor-pointer limit-lines text-[13px]"
                            >
                              {item.description}
                            </h4>
                            <p className="text-[10px] text-slate-400 capitalize">
                              {item.categoryId || 'General'} • Contains {item.resources.length} active resources
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-center font-bold text-slate-500 uppercase">
                          {item.unit}
                        </td>

                        <td className="px-5 py-3.5 text-right font-bold text-zentrix-blue font-mono whitespace-nowrap">
                          {formatCurrency(item.finalRate)}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 border shadow-xs leading-none",
                            item.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            item.status === 'Revised' ? "bg-cyan-50 text-cyan-600 border-cyan-100" :
                            item.status === 'Draft' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-zinc-50 text-zinc-500 border-zinc-100"
                          )}>
                            <span className={cn(
                              "w-1 h-1 rounded-full",
                              item.status === 'Approved' ? "bg-emerald-500" :
                              item.status === 'Revised' ? "bg-cyan-500" :
                              item.status === 'Draft' ? "bg-amber-500" :
                              "bg-zinc-400"
                            )} />
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-center font-bold font-mono text-xs text-primary-600">
                          {item.revision}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                          {item.lastUpdated}
                        </td>

                        <td className="px-5 py-3.5 text-center relative">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => onSelectAnalysis(item.id)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary-600 rounded cursor-pointer"
                              title="Open Builder"
                            >
                              <Edit size={13} />
                            </button>
                            
                            <div className="relative">
                              <button 
                                onClick={() => setActiveActionsMenu(activeActionsMenu === item.id ? null : item.id)}
                                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                              >
                                <MoreHorizontal size={13} />
                              </button>

                              {activeActionsMenu === item.id && (
                                <>
                                  <div className="fixed inset-0 z-15" onClick={() => setActiveActionsMenu(null)} />
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-zentrix-border rounded-lg shadow-xl z-20 overflow-hidden text-left divide-y divide-slate-50">
                                    <button 
                                      onClick={() => { onSelectAnalysis(item.id); setActiveActionsMenu(null); }}
                                      className="un-btn w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-zentrix-blue font-semibold flex items-center gap-2 cursor-pointer border-0"
                                    >
                                      <Eye size={12} /> Open Worksheet
                                    </button>
                                    <button 
                                      onClick={() => { onDuplicateAnalysis(item.id); setActiveActionsMenu(null); }}
                                      className="un-btn w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-650 flex items-center gap-2 cursor-pointer border-0"
                                    >
                                      <Copy size={12} /> Duplicate ROW
                                    </button>
                                    <button 
                                      onClick={() => { onArchiveAnalysis(item.id); setActiveActionsMenu(null); }}
                                      className="un-btn w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-red-600 font-bold flex items-center gap-2 cursor-pointer border-0"
                                    >
                                      <FolderLock size={12} /> Archive
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                      </tr>
                    ))}
                    
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-450 italic text-sm">
                          No analyses match filters. Try adjusting the search or select other categories.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CREATE CATEGORY DIALOG */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border text-left border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-105 border-slate-100 pb-2.5">
              <h4 className="text-sm font-black text-zentrix-blue uppercase tracking-wider">Create Category Group</h4>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">Category Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Electrical Works"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">Category Code Prefix / ID</label>
                <input 
                  type="text"
                  placeholder="e.g. electrical"
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white outline-none focus:ring-1 focus:ring-primary-500 font-mono font-semibold"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">Parent Group (Hierarchy Level)</label>
                <select 
                  value={newCatParent}
                  onChange={(e) => setNewCatParent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:bg-white cursor-pointer font-semibold"
                >
                  <option value="">None (Create as Root Parent Group)</option>
                  {categories.filter(c => !c.parentId && c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCatName('');
                  setNewCatId('');
                  setNewCatParent('');
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-55 rounded-lg text-xs font-bold bg-white text-slate-500 cursor-pointer transition text-center"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newCatName || !newCatId) {
                    alert('Please supply category label and custom prefix!');
                    return;
                  }
                  if (categories.some(c => c.id === newCatId)) {
                    alert('A group with this category ID prefix already exists.');
                    return;
                  }
                  const newItem: RateCategory = {
                    id: newCatId,
                    label: newCatName,
                    parentId: newCatParent || undefined
                  };
                  setCategories(prev => [...prev, newItem]);
                  setIsCategoryModalOpen(false);
                  setNewCatName('');
                  setNewCatId('');
                  setNewCatParent('');
                }}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-lg cursor-pointer transition text-center shadow-md border-0"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
