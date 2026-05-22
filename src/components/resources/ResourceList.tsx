import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, ChevronDown, Layers, ArrowRight, X, 
  CreditCard, FileText, TrendingUp, Save, Heart, ShieldCheck, RefreshCw, 
  Copy, Trash2, Eye, Archive, Link2, BookOpen, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../../lib/utils.ts';
import { ResourceType, type Resource } from '../../types.ts';
import { 
  INITIAL_RESOURCES, INITIAL_SUPPLIERS, INITIAL_PRICES, INITIAL_RESOURCE_USAGES, MOCK_PRICING_HISTORY, EnhancedResource 
} from './resourceMockData.ts';

interface ResourceListProps {
  resources: Resource[];
  onUpdateResources: (resources: Resource[]) => void;
  selectedRegion: string;
  selectedPeriod: string;
}

export const ResourceList = ({ 
  resources, 
  onUpdateResources,
  selectedRegion,
  selectedPeriod
}: ResourceListProps) => {

  // Left categories state
  const [categories, setCategories] = useState([
    { id: 'all', label: 'All Resources', count: 12 },
    { 
      id: 'Cement', 
      label: 'Cement & Concrete', 
      count: 2,
      children: [
        { id: 'Cement', label: 'Portland Cement', count: 1 },
        { id: 'Aggregate', label: 'Aggregates', count: 2 },
      ]
    },
    { id: 'Steel', label: 'Structural Steel', count: 2 },
    { id: 'Skilled', label: 'Labor & Engineering', count: 3 },
    { id: 'Heavy Machinery', label: 'Equipment & Heavy machinery', count: 2 },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterRecentOnly, setFilterRecentOnly] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // Detail Drawer state
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EnhancedResource | null>(null);

  // Editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EnhancedResource>>({});

  // Active / Opened row action menu index
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Pricing history modal/view state
  const [activeTabInDrawer, setActiveTabInDrawer] = useState<'details' | 'prices' | 'usages'>('details');

  // Sync state or merge
  const mergedResources = useMemo(() => {
    return resources.map(res => {
      const match = INITIAL_RESOURCES.find(e => e.id === res.id || e.code === res.code);
      return {
        id: res.id,
        code: res.code,
        name: res.name,
        category: res.category || match?.category || 'Materials',
        type: res.type,
        unit: res.unit,
        currency: res.currency || 'USD',
        supplier: res.supplier || match?.supplier || 'LafargeHolcim',
        baseRate: res.baseRate,
        specifications: res.specifications || match?.specifications || '',
        lastUpdated: res.lastUpdated || match?.lastUpdated || '2026-05-21',
        status: (match?.status || 'Active') as 'Active' | 'Inactive' | 'Archived' | 'Draft',
        usageCount: match?.usageCount || 0,
        linkedRateAnalysisCount: match?.linkedRateAnalysisCount || 0,
        remarks: match?.remarks || '',
        attachments: match?.attachments || [],
        currentRegionPrice: match?.currentRegionPrice || res.baseRate
      } as EnhancedResource;
    });
  }, [resources]);

  // Unique units and suppliers for filter dropdowns
  const uniqueUnits = useMemo(() => Array.from(new Set(mergedResources.map(r => r.unit))), [mergedResources]);
  const uniqueSuppliers = useMemo(() => Array.from(new Set(mergedResources.map(r => r.supplier))), [mergedResources]);

  // Filtering Logic
  const filteredResources = useMemo(() => {
    return mergedResources.filter(res => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = res.name.toLowerCase().includes(query) || res.code.toLowerCase().includes(query) || res.supplier.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      // 2. Left Category Category Tree Filter
      if (selectedCategory !== 'all') {
        const catLower = selectedCategory.toLowerCase();
        const matchesCategory = res.category.toLowerCase().includes(catLower) || res.category.toLowerCase() === catLower;
        if (!matchesCategory) return false;
      }

      // 3. Status filter
      if (filterStatus !== 'all' && res.status !== filterStatus) return false;

      // 4. Resource Type filter
      if (filterType !== 'all' && res.type !== filterType) return false;

      // 5. Supplier filter
      if (filterSupplier !== 'all' && res.supplier !== filterSupplier) return false;

      // 6. Unit filter
      if (filterUnit !== 'all' && res.unit !== filterUnit) return false;

      // 7. Recent Only (within 30 days)
      if (filterRecentOnly) {
        const lastUp = new Date(res.lastUpdated);
        const cutoff = new Date('2026-04-20'); // 30 days before current date May 2026
        if (lastUp < cutoff) return false;
      }

      return true;
    });
  }, [mergedResources, searchQuery, selectedCategory, filterStatus, filterType, filterSupplier, filterUnit, filterRecentOnly]);

  // Actions
  const handleViewDetails = (res: EnhancedResource, defaultTab: 'details' | 'prices' | 'usages' = 'details') => {
    setSelectedResource(res);
    setActiveTabInDrawer(defaultTab);
    setIsDetailDrawerOpen(true);
    setActionMenuOpenId(null);
  };

  const handleEditResourceStart = (res: EnhancedResource) => {
    setSelectedResource(res);
    setEditForm(res);
    setIsEditMode(true);
    setIsDetailDrawerOpen(true);
    setActionMenuOpenId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    const updated = mergedResources.map(r => r.id === selectedResource.id ? { ...r, ...editForm } : r);
    // Convert back to base Resource interface before calling parent update
    const baseResources = updated.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: r.category,
      type: r.type,
      unit: r.unit,
      currency: r.currency,
      supplier: r.supplier,
      baseRate: r.baseRate,
      specifications: r.specifications,
      lastUpdated: new Date().toISOString().split('T')[0]
    }));

    onUpdateResources(baseResources);
    setIsEditMode(false);
    setIsDetailDrawerOpen(false);
  };

  const handleDuplicate = (res: EnhancedResource) => {
    const duplicated: Resource = {
      id: `res-${Date.now()}`,
      code: `${res.code}-DUP`,
      name: `${res.name} (Copy)`,
      category: res.category,
      type: res.type,
      unit: res.unit,
      currency: res.currency,
      supplier: res.supplier,
      baseRate: res.baseRate,
      specifications: res.specifications,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdateResources([...resources, duplicated]);
    setActionMenuOpenId(null);
  };

  const handleArchive = (res: EnhancedResource) => {
    const updated = mergedResources.map(r => r.id === res.id ? { ...r, status: 'Archived' as const } : r);
    const baseResources = updated.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: r.category,
      type: r.type,
      unit: r.unit,
      currency: r.currency,
      supplier: r.supplier,
      baseRate: r.baseRate,
      specifications: r.specifications,
      lastUpdated: new Date().toISOString().split('T')[0]
    }));
    onUpdateResources(baseResources);
    setActionMenuOpenId(null);
  };

  // Calculations for current pricing based on region/period adjustments
  const getWeightedPrice = (base: number) => {
    const regionMult = selectedRegion === '4' ? 1.15 : selectedRegion === '2' ? 1.05 : 1.0;
    const periodMult = selectedPeriod === '5' ? 1.08 : 1.0;
    return base * regionMult * periodMult;
  };

  return (
    <div className="flex-1 flex gap-5 overflow-hidden text-[13px]">
      
      {/* LEFT CATEGORY TREE */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 px-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers size={13} className="text-primary-500" />
            Workspace Categories
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black font-mono">
           {mergedResources.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {categories.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCategory(item.id)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2 transition-all cursor-pointer text-left outline-none",
                  selectedCategory === item.id 
                    ? "text-primary-600 bg-primary-50/70 font-bold border-l-3 border-primary-600" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <span className="truncate">{item.label}</span>
                <span className="text-[9.5px] font-bold opacity-50">{item.count}</span>
              </div>
              
              {/* Children categories */}
              {item.children && (
                <div className="pl-6 border-l border-slate-100 ml-5 my-0.5 space-y-0.5">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedCategory(child.id)}
                      className={cn(
                        "flex items-center justify-between w-full pr-4 py-1.5 text-xs text-left transition-colors",
                        selectedCategory === child.id 
                          ? "text-primary-600 font-bold" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <span className="truncate">{child.label}</span>
                      <span className="text-[9px] opacity-40 font-mono">{child.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* RESOURCE GRID PANEL */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        
        {/* Top Control Bar with Search and Advanced Filters Trigger */}
        <div className="p-3 px-4 border-b border-slate-100 flex flex-col gap-3 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex items-center bg-slate-50 px-3 py-1.5 rounded-lg w-72 border border-slate-200 focus-within:border-primary-500 focus-within:bg-white transition-all">
              <Search size={14} className="mr-2 opacity-50 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search code, name, or supplier..."
                className="bg-transparent border-none text-xs w-full focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer",
                  showFiltersPanel || filterStatus !== 'all' || filterType !== 'all' || filterSupplier !== 'all' || filterUnit !== 'all' || filterRecentOnly
                    ? "bg-primary-50 border-primary-300 text-primary-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Filter size={13} />
                Filters
                {(filterStatus !== 'all' || filterType !== 'all' || filterSupplier !== 'all' || filterUnit !== 'all' || filterRecentOnly) && (
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                )}
              </button>

              <span className="text-[11px] text-slate-400 font-semibold uppercase pr-2">
                {filteredResources.length} of {mergedResources.length} items
              </span>
            </div>
          </div>

          {/* ADVANCED FILTERS INNER PANEL */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-dashed border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-3 pb-2 text-[11px]">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Status</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  {/* Resource Type */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Type</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value={ResourceType.MATERIAL}>{ResourceType.MATERIAL}</option>
                      <option value={ResourceType.LABOR}>{ResourceType.LABOR}</option>
                      <option value={ResourceType.EQUIPMENT}>{ResourceType.EQUIPMENT}</option>
                    </select>
                  </div>

                  {/* Supplier */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Supplier</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                      value={filterSupplier}
                      onChange={(e) => setFilterSupplier(e.target.value)}
                    >
                      <option value="all">All Suppliers</option>
                      {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Unit</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                      value={filterUnit}
                      onChange={(e) => setFilterUnit(e.target.value)}
                    >
                      <option value="all">All Units</option>
                      {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  {/* Quick toggle recent / clear all */}
                  <div className="flex flex-col justify-end gap-2">
                    <label className="flex items-center gap-1.5 pb-1 cursor-pointer font-bold text-slate-500">
                      <input 
                        type="checkbox" 
                        checked={filterRecentOnly}
                        onChange={(e) => setFilterRecentOnly(e.target.checked)}
                        className="rounded border-slate-300 focus:ring-primary-500 text-primary-600"
                      />
                      <span>Recent Updates (30d)</span>
                    </label>

                    {(filterStatus !== 'all' || filterType !== 'all' || filterSupplier !== 'all' || filterUnit !== 'all' || filterRecentOnly) && (
                      <button 
                        onClick={() => {
                          setFilterStatus('all');
                          setFilterType('all');
                          setFilterSupplier('all');
                          setFilterUnit('all');
                          setFilterRecentOnly(false);
                        }}
                        className="text-left text-xs text-red-600 hover:underline font-bold"
                      >
                        Reset All Filters ✖
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RESOURCE TABLE */}
        <div className="flex-1 overflow-auto">
          {filteredResources.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <AlertCircle size={32} className="text-slate-300 mb-2" />
              <p className="font-bold">No Construction Resources found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your advanced filter criteria or category parameters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-[10.5px]">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-3 font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Base Rate</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Weighted Cost</th>
                  <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider text-center">Linked R.A.</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider text-center">Usage Count</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((resource) => (
                  <tr 
                    key={resource.id} 
                    onClick={() => handleViewDetails(resource)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group relative border-b border-dashed border-slate-100"
                  >
                    {/* Status Badge */}
                    <td className="px-5 py-3">
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-black uppercase leading-none tracking-wider",
                        resource.status === 'Active' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        resource.status === 'Inactive' ? "bg-slate-100 text-slate-600 border border-slate-200" :
                        resource.status === 'Draft' ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-red-50 text-red-600 border border-red-100"
                      )}>
                        {resource.status}
                      </span>
                    </td>

                    {/* Code */}
                    <td className="px-5 py-3 text-[12.5px] font-mono text-primary-600 font-bold">
                      {resource.code}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 text-[12.5px] font-bold text-[#1e293b]">
                      {resource.name}
                    </td>

                    {/* Type */}
                    <td className="px-2 py-3">
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider",
                        resource.type === ResourceType.MATERIAL ? "bg-blue-50 text-blue-600" :
                        resource.type === ResourceType.LABOR ? "bg-orange-50 text-orange-600" :
                        "bg-purple-50 text-purple-600"
                      )}>
                        {resource.type}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3 text-[12.5px] text-slate-500 font-medium">
                      {resource.unit}
                    </td>

                    {/* Base Rate */}
                    <td className="px-4 py-3 text-[12.5px] font-bold text-slate-400 font-mono text-right">
                      {formatCurrency(resource.baseRate)}
                    </td>

                    {/* Weighted Adjusted Rate */}
                    <td className="px-4 py-3 text-[12.5px] font-black text-slate-800 font-mono text-right">
                      {formatCurrency(getWeightedPrice(resource.baseRate))}
                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-3 text-[12px] font-bold text-slate-500 truncate max-w-[120px]" title={resource.supplier}>
                      {resource.supplier}
                    </td>

                    {/* Linked Rate Analyses */}
                    <td className="px-4 py-3 text-center text-xs font-mono font-bold text-purple-600">
                      {resource.linkedRateAnalysisCount}
                    </td>

                    {/* Usage Count */}
                    <td className="px-4 py-3 text-center text-xs font-mono font-bold text-blue-600">
                      {resource.usageCount}
                    </td>

                    {/* Line Item Actions */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button 
                          onClick={() => setActionMenuOpenId(actionMenuOpenId === resource.id ? null : resource.id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {actionMenuOpenId === resource.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpenId(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-20 text-left"
                              >
                                <button 
                                  onClick={() => handleViewDetails(resource, 'details')}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 font-bold flex items-center gap-2"
                                >
                                  <Eye size={12} className="text-slate-400" /> View Details
                                </button>
                                <button 
                                  onClick={() => handleEditResourceStart(resource)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 font-bold flex items-center gap-2"
                                >
                                  <Plus size={12} className="text-slate-400" /> Edit Specifications
                                </button>
                                <button 
                                  onClick={() => handleDuplicate(resource)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 font-bold flex items-center gap-2"
                                >
                                  <Copy size={12} className="text-slate-400" /> Duplicate Resource
                                </button>
                                <button 
                                  onClick={() => handleViewDetails(resource, 'prices')}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 font-bold flex items-center gap-2"
                                >
                                  <CreditCard size={12} className="text-slate-400" /> Regional Price History
                                </button>
                                <button 
                                  onClick={() => handleViewDetails(resource, 'usages')}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 font-bold flex items-center gap-2"
                                >
                                  <Link2 size={12} className="text-slate-400" /> Linked References ("Used In")
                                </button>
                                <hr className="my-1 border-slate-100" />
                                <button 
                                  onClick={() => handleArchive(resource)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-red-600 font-bold flex items-center gap-2"
                                >
                                  <Archive size={12} className="text-red-400" /> Archive Item
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAIL DRAWER / SLIDE PANEL */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedResource && (
          <>
            <div className="fixed inset-0 bg-slate-900/15 backdrop-blur-[1px] z-[60]" onClick={() => { setIsDetailDrawerOpen(false); setIsEditMode(false); }} />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 w-[420px] h-full bg-white border-l border-slate-200 z-[70] flex flex-col pt-14 md:pt-0 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide",
                      selectedResource.status === 'Active' ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    )}>
                      {selectedResource.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Res ID: {selectedResource.id}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800">{selectedResource.name}</h3>
                  <p className="text-[11px] font-mono text-primary-600 font-bold">{selectedResource.code}</p>
                </div>
                <button 
                  onClick={() => { setIsDetailDrawerOpen(false); setIsEditMode(false); }}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs in Drawer */}
              <div className="flex border-b border-slate-100 text-xs">
                <button 
                  onClick={() => { setIsEditMode(false); setActiveTabInDrawer('details'); }}
                  className={cn(
                    "flex-1 py-2.5 text-center font-bold tracking-tight border-b-2 hover:bg-slate-50",
                    activeTabInDrawer === 'details' && !isEditMode ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500"
                  )}
                >
                  Specs & Details
                </button>
                <button 
                  onClick={() => { setIsEditMode(false); setActiveTabInDrawer('prices'); }}
                  className={cn(
                    "flex-1 py-2.5 text-center font-bold tracking-tight border-b-2 hover:bg-slate-50",
                    activeTabInDrawer === 'prices' ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500"
                  )}
                >
                  Prices History
                </button>
                <button 
                  onClick={() => { setIsEditMode(false); setActiveTabInDrawer('usages'); }}
                  className={cn(
                    "flex-1 py-2.5 text-center font-bold tracking-tight border-b-2 hover:bg-slate-50",
                    activeTabInDrawer === 'usages' ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500"
                  )}
                >
                  Used In ({selectedResource.usageCount})
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* 1. EDIT MODE FORM */}
                {isEditMode ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase">Resource Name</label>
                      <input 
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-primary-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase">Specifications</label>
                      <textarea
                        value={editForm.specifications || ''}
                        onChange={(e) => setEditForm({ ...editForm, specifications: e.target.value })}
                        className="w-full h-24 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase">Status</label>
                        <select
                          className="w-full px-2 py-1.5 border border-slate-200 rounded"
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Draft">Draft</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase">Unit</label>
                        <input
                          type="text"
                          value={editForm.unit || ''}
                          onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase">Remarks</label>
                      <textarea
                        value={editForm.remarks || ''}
                        onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                        className="w-full h-16 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button 
                        type="submit"
                        className="flex-1 bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Save size={13} /> Save Adjustments
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsEditMode(false)}
                        className="px-4 border border-slate-200 text-slate-600 font-bold py-2 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* 2. REGULAR SPECS & DETAILS TAB */}
                    {activeTabInDrawer === 'details' && (
                      <div className="space-y-5 text-xs text-slate-600 leading-relaxed animate-fade-in">
                        
                        {/* Specifications */}
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Specifications Schema</h4>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg italic">
                            {selectedResource.specifications || "No special architectural specs linked to this item."}
                          </div>
                        </div>

                        {/* Supplier Info */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Indexed Supplier Info</h4>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                            <p className="font-bold text-slate-800 text-[12px]">{selectedResource.supplier || 'Internal Core Allocation'}</p>
                            <p className="text-slate-500">Contact Person: Arnaud van de Kamp</p>
                            <p className="text-slate-500">Official Email: arnaud@lafarge.com</p>
                            <p className="text-slate-500">Tax Number: VAT-918231 (Verified)</p>
                          </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Certificates & Attachments</h4>
                          {selectedResource.attachments && selectedResource.attachments.length > 0 ? (
                            <div className="space-y-1.5">
                              {selectedResource.attachments.map(att => (
                                <div key={att} className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-100 cursor-pointer">
                                  <span className="font-bold text-primary-600 truncate">{att}</span>
                                  <span className="text-[9px] text-slate-400 uppercase font-black">Download 🡥</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">No certificates attached.</p>
                          )}
                        </div>

                        {/* Remarks */}
                        {selectedResource.remarks && (
                          <div className="space-y-1 border-t border-slate-100 pt-3">
                            <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Internal Remarks</h4>
                            <p className="text-slate-500">{selectedResource.remarks}</p>
                          </div>
                        )}

                        {/* Trigger specs edit */}
                        <div className="pt-2">
                          <button 
                            onClick={() => setIsEditMode(true)}
                            className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Edit Resource Metadata
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. PRICES TAB */}
                    {activeTabInDrawer === 'prices' && (
                      <div className="space-y-4 animate-fade-in text-xs">
                        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex gap-2 border border-emerald-100 leading-normal">
                          <TrendingUp size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Regional Adjustment Active</p>
                            <p className="text-[10.5px] text-emerald-700 mt-1">
                              Current Region Price adjusts the global rate of index dynamically! NEOM +15%, Coastal +5%, Central base rate.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Consolidated Price Matrix History</h4>
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg bg-white overflow-hidden shadow-sm">
                            <div className="flex justify-between p-2.5 bg-slate-50 font-bold text-slate-500">
                              <span>Fiscal Period</span>
                              <span>Unit Rate (USD)</span>
                            </div>
                            
                            {/* pricing history list */}
                            {((MOCK_PRICING_HISTORY as any)[selectedResource.id] || [
                              { period: '2025 Q1', rate: selectedResource.baseRate * 0.95 },
                              { period: '2025 Q2', rate: selectedResource.baseRate * 0.97 },
                              { period: '2025 Q3', rate: selectedResource.baseRate * 0.98 },
                              { period: '2025 Q4', rate: selectedResource.baseRate * 0.99 },
                              { period: '2026 Q1', rate: selectedResource.baseRate },
                            ]).map((hist: any, hidx: number) => (
                              <div key={hidx} className="flex justify-between p-2.5 hover:bg-slate-50 font-medium">
                                <span className="font-bold text-slate-600">{hist.period}</span>
                                <span className="font-mono font-bold text-slate-800">${hist.rate.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price Trend Chart placeholder or mini representation */}
                        <div className="border border-slate-100 p-3 rounded-xl bg-slate-55 flex flex-col gap-1 items-center justify-center text-center">
                          <span className="font-black text-[10px] text-slate-400 uppercase tracking-wider mb-2">Price Velocity Index</span>
                          <div className="flex items-end justify-between gap-5 h-16 w-full px-4 border-b border-dashed border-slate-200">
                            <div className="w-6 bg-primary-100 h-8 rounded-t" title="Q1: $8.10" />
                            <div className="w-6 bg-primary-200 h-10 rounded-t" title="Q2: $8.32" />
                            <div className="w-6 bg-primary-300 h-11 rounded-t" title="Q3: $8.35" />
                            <div className="w-6 bg-primary-400 h-12 rounded-t" title="Q4: $8.42" />
                            <div className="w-6 bg-primary-600 h-14 rounded-t" title="Current Q1: $8.50" />
                          </div>
                          <span className="text-[9.5px] text-emerald-600 font-bold mt-1.5 flex items-center gap-0.5">
                            ▲ +4.94% overall year-on-year increase
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 4. USAGES TAB */}
                    {activeTabInDrawer === 'usages' && (
                      <div className="space-y-4 animate-fade-in text-xs">
                        <div className="p-3 bg-blue-50 text-blue-800 rounded-lg flex gap-2 border border-blue-105 leading-normal">
                          <Link2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Real-time ERP Links</p>
                            <p className="text-[10.5px] text-blue-700 mt-1">
                              This resource is referenced recursively inside QS engineering rate analyses and project BOQ estimates.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Linked Workspace References</h4>
                          <div className="space-y-2">
                            {INITIAL_RESOURCE_USAGES
                              .filter(u => u.resourceId === selectedResource.id || u.resourceName.includes(selectedResource.name) || selectedResource.name.includes(u.resourceName))
                              .map(usage => (
                                <div key={usage.id} className="p-2.5 border border-slate-10
                                bg-slate-50 rounded-lg shadow-inner flex justify-between items-center gap-2">
                                  <div>
                                    <span className={cn(
                                      "text-[8px] px-1.5 py-0.5 rounded uppercase font-black leading-none bg-white",
                                      usage.type === 'Rate Analysis' ? "text-purple-700 border border-purple-100" :
                                      usage.type === 'BOQ Item' ? "text-blue-700 border border-blue-100" :
                                      usage.type === 'Procurement' ? "text-emerald-700 border border-emerald-100" : "text-amber-700 border border-amber-100"
                                    )}>
                                      {usage.type}
                                    </span>
                                    <h5 className="font-bold text-slate-800 mt-1.5">{usage.name}</h5>
                                    <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 block">{usage.code}</span>
                                  </div>
                                  <div className="text-right">
                                    {usage.quantity && (
                                      <p className="font-black text-slate-700 font-mono text-xs">{usage.quantity} {usage.unit}</p>
                                    )}
                                    {usage.amount && (
                                      <p className="font-black text-emerald-600 font-mono font-bold">${usage.amount.toLocaleString()}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
