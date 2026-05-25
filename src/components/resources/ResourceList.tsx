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
  INITIAL_RESOURCES, INITIAL_SUPPLIERS, INITIAL_PRICES, INITIAL_RESOURCE_USAGES, MOCK_PRICING_HISTORY, EnhancedResource, INITIAL_CATEGORIES, Category
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

  interface SubGroup {
    id: string;
    name: string;
  }

  interface ResourceGroup {
    id: string;
    name: string;
    subGroups: SubGroup[];
  }

  // Left group/subgroup state and selection
  const [groups, setGroups] = useState<ResourceGroup[]>(() => {
    const saved = localStorage.getItem('resource_groups_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'g-1',
        name: 'Cement & Concrete',
        subGroups: [
          { id: 'sg-1', name: 'Cement' },
          { id: 'sg-2', name: 'Aggregate' }
        ]
      },
      {
        id: 'g-2',
        name: 'Structural Steel',
        subGroups: [
          { id: 'sg-3', name: 'Steel' }
        ]
      },
      {
        id: 'g-3',
        name: 'Labor & Engineering',
        subGroups: [
          { id: 'sg-4', name: 'Skilled' },
          { id: 'sg-5', name: 'Unskilled' }
        ]
      },
      {
        id: 'g-4',
        name: 'Equipment & Machinery',
        subGroups: [
          { id: 'sg-6', name: 'Heavy Machinery' }
        ]
      }
    ];
  });

  const saveGroups = (newGroups: ResourceGroup[]) => {
    setGroups(newGroups);
    localStorage.setItem('resource_groups_list', JSON.stringify(newGroups));
  };

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<{ type: 'all' | 'group' | 'subgroup'; id: string }>({ type: 'all', id: 'all' });
  const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);
  const [newGroupInput, setNewGroupInput] = useState<string>('');
  const [addingSubGroupId, setAddingSubGroupId] = useState<string | null>(null);
  const [newSubGroupInput, setNewSubGroupInput] = useState<string>('');

  // States to facilitate tree-view collapse, and safe iframe deletion confirmation
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [subGroupToDelete, setSubGroupToDelete] = useState<{ groupId: string; subGroupId: string } | null>(null);

  const handleAddGroup = () => {
    if (!newGroupInput.trim()) return;
    const newG: ResourceGroup = {
      id: `g-${Date.now()}`,
      name: newGroupInput.trim(),
      subGroups: []
    };
    saveGroups([...groups, newG]);
    setNewGroupInput('');
    setIsAddingGroup(false);
  };

  const handleAddSubGroup = (groupId: string) => {
    if (!newSubGroupInput.trim()) return;
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subGroups: [
            ...g.subGroups,
            { id: `sg-${Date.now()}`, name: newSubGroupInput.trim() }
          ]
        };
      }
      return g;
    });
    saveGroups(updated);
    setNewSubGroupInput('');
    setAddingSubGroupId(null);
  };

  const handleDeleteGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = groups.filter(g => g.id !== groupId);
    saveGroups(updated);
    if (selectedGroupFilter.type === 'group' && selectedGroupFilter.id === groupId) {
      setSelectedGroupFilter({ type: 'all', id: 'all' });
    }
  };

  const handleDeleteSubGroup = (groupId: string, subGroupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subGroups: g.subGroups.filter(sg => sg.id !== subGroupId)
        };
      }
      return g;
    });
    saveGroups(updated);
    if (selectedGroupFilter.type === 'subgroup' && selectedGroupFilter.id === subGroupId) {
      setSelectedGroupFilter({ type: 'all', id: 'all' });
    }
  };

  const getGroupCount = (groupId: string) => {
    const parentGroup = groups.find(g => g.id === groupId);
    if (!parentGroup) return 0;
    const validNames = [parentGroup.name.toLowerCase(), ...parentGroup.subGroups.map(sg => sg.name.toLowerCase())];
    return mergedResources.filter(res => 
      validNames.some(valName => 
        res.category.toLowerCase() === valName || 
        res.category.toLowerCase().includes(valName) || 
        valName.includes(res.category.toLowerCase())
      )
    ).length;
  };

  const getSubGroupCount = (subGroupId: string) => {
    let foundSubGroup: SubGroup | null = null;
    for (const g of groups) {
      const match = g.subGroups.find(sg => sg.id === subGroupId);
      if (match) {
        foundSubGroup = match;
        break;
      }
    }
    if (!foundSubGroup) return 0;
    const subName = foundSubGroup.name.toLowerCase();
    return mergedResources.filter(res => 
      res.category.toLowerCase() === subName || 
      res.category.toLowerCase().includes(subName) || 
      subName.includes(res.category.toLowerCase())
    ).length;
  };
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EnhancedResource>>({});
  const [editSelectedCategory, setEditSelectedCategory] = useState<string>('');
  const [editSelectedSubCategory, setEditSelectedSubCategory] = useState<string>('');
  const [editCategoryVal, setEditCategoryVal] = useState<string>('');
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);

  React.useEffect(() => {
    const savedCats = localStorage.getItem('resource_categories_list');
    let cats: Category[] = [];
    if (savedCats) {
      try {
        cats = JSON.parse(savedCats);
      } catch (e) {}
    }
    if (!cats || cats.length === 0) {
      cats = INITIAL_CATEGORIES.filter(c => c.parentId === null || !c.parentId);
    }
    setFlatCategories(cats);
  }, [isEditModalOpen]);

  // Regional price creation state
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceForm, setPriceForm] = useState({
    regionId: '1',
    periodName: '2026 Q1',
    rate: 0,
    supplierId: 'sup-1',
    supplierName: 'LafargeHolcim',
  });
  const [localPricingHistory, setLocalPricingHistory] = useState<Record<string, Array<{ period: string; rate: number }>>>({});

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
        currentRegionPrice: match?.currentRegionPrice || res.baseRate,
        resourceGroup: res.resourceGroup,
        resourceSubGroup: res.resourceSubGroup,
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

      // 2. Left Resource Group & Sub-group Filter
      if (selectedGroupFilter.type === 'group') {
        const parentGroup = groups.find(g => g.id === selectedGroupFilter.id);
        if (parentGroup) {
          if (res.resourceGroup) {
            if (res.resourceGroup.toLowerCase() !== parentGroup.name.toLowerCase()) return false;
          } else {
            const validNames = [parentGroup.name.toLowerCase(), ...parentGroup.subGroups.map(sg => sg.name.toLowerCase())];
            const matches = validNames.some(valName => 
              res.category.toLowerCase() === valName || 
              res.category.toLowerCase().includes(valName) || 
              valName.includes(res.category.toLowerCase())
            );
            if (!matches) return false;
          }
        }
      } else if (selectedGroupFilter.type === 'subgroup') {
        let foundSubGroup: SubGroup | null = null;
        for (const g of groups) {
          const match = g.subGroups.find(sg => sg.id === selectedGroupFilter.id);
          if (match) {
            foundSubGroup = match;
            break;
          }
        }
        if (foundSubGroup) {
          if (res.resourceSubGroup) {
            if (res.resourceSubGroup.toLowerCase() !== foundSubGroup.name.toLowerCase()) return false;
          } else {
            const subName = foundSubGroup.name.toLowerCase();
            const matches = res.category.toLowerCase() === subName || 
              res.category.toLowerCase().includes(subName) || 
              subName.includes(res.category.toLowerCase());
            if (!matches) return false;
          }
        }
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
  }, [mergedResources, searchQuery, selectedGroupFilter, groups, filterStatus, filterType, filterSupplier, filterUnit, filterRecentOnly]);

  // Actions
  const handleViewDetails = (res: EnhancedResource, defaultTab: 'details' | 'prices' | 'usages' = 'details') => {
    setSelectedResource(res);
    setActiveTabInDrawer(defaultTab);
    setIsDetailDrawerOpen(true);
    setActionMenuOpenId(null);
  };

  const resolveGroupAndSubGroup = (categoryString: string) => {
    const catLower = (categoryString || '').trim().toLowerCase();
    
    // 1. Try to find a subgroup that exact matches
    for (const g of groups) {
      if (g.subGroups) {
        const sub = g.subGroups.find(sg => sg.name.toLowerCase() === catLower);
        if (sub) {
          return { categoryName: g.name, subCategoryName: sub.name };
        }
      }
    }
    
    // 2. Try to find a group that exact matches
    const g = groups.find(gp => gp.name.toLowerCase() === catLower);
    if (g) {
      return { categoryName: g.name, subCategoryName: 'none' };
    }
    
    // 3. Fallback
    return { categoryName: groups[0]?.name || 'Cement & Concrete', subCategoryName: 'none' };
  };

  const handleEditResourceStart = (res: EnhancedResource) => {
    setSelectedResource(res);
    setEditForm(res);

    const resolved = resolveGroupAndSubGroup(res.category);
    setEditSelectedCategory(res.resourceGroup || resolved.categoryName);
    setEditSelectedSubCategory(res.resourceSubGroup || resolved.subCategoryName);
    setEditCategoryVal(res.category);

    setIsEditModalOpen(true);
    setActionMenuOpenId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    const finalForm = {
      ...editForm,
      category: editCategoryVal || 'Cement',
      resourceGroup: editSelectedCategory,
      resourceSubGroup: editSelectedSubCategory && editSelectedSubCategory !== 'none' ? editSelectedSubCategory : undefined
    };

    const updated = mergedResources.map(r => r.id === selectedResource.id ? { ...r, ...finalForm } : r);
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
      lastUpdated: new Date().toISOString().split('T')[0],
      resourceGroup: r.resourceGroup,
      resourceSubGroup: r.resourceSubGroup
    }));

    onUpdateResources(baseResources);
    setIsEditModalOpen(false);
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

  const regionsList = [
    { id: '1', name: 'Riyadh Central (Active Region)' },
    { id: '2', name: 'Jeddah Coastal' },
    { id: '3', name: 'Dammam Eastern' },
    { id: '4', name: 'NEOM District' },
  ];
  
  const periodsList = [
    { id: '1', name: '2024 Q1' },
    { id: '2', name: '2024 Q2' },
    { id: '3', name: '2024 Q3' },
    { id: '4', name: '2024 Q4' },
    { id: '5', name: '2026 Q1 (Active Period)' },
  ];

  const handleOpenCreatePrice = (res: EnhancedResource) => {
    setSelectedResource(res);
    
    // Resolve matched active period to label (e.g. selectedPeriod='5' -> '2026 Q1')
    const matchedPeriodObj = periodsList.find(p => p.id === selectedPeriod) || periodsList[4];
    
    setPriceForm({
      regionId: selectedRegion || '1',
      periodName: matchedPeriodObj.name || '2026 Q1',
      rate: res.baseRate || 0,
      supplierId: 'sup-1',
      supplierName: res.supplier || 'Internal Core Allocation',
    });
    setIsPriceModalOpen(true);
    setActionMenuOpenId(null);
  };

  const handleSaveCreatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    const newRateEntry = {
      period: priceForm.periodName,
      rate: Number(priceForm.rate) || 0
    };

    setLocalPricingHistory(prev => {
      const existing = prev[selectedResource.id] || [];
      const updatedList = existing.filter(item => item.period !== newRateEntry.period);
      updatedList.push(newRateEntry);
      return {
        ...prev,
        [selectedResource.id]: updatedList
      };
    });

    setIsPriceModalOpen(false);
  };

  // Calculations for current pricing based on region/period adjustments
  const getWeightedPrice = (base: number) => {
    const regionMult = selectedRegion === '4' ? 1.15 : selectedRegion === '2' ? 1.05 : 1.0;
    const periodMult = selectedPeriod === '5' ? 1.08 : 1.0;
    return base * regionMult * periodMult;
  };

  return (
    <div className="flex-1 flex gap-5 overflow-hidden text-[13px]">
      
      {/* LEFT RESOURCE GROUPS & SUB-GROUPS */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 px-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers size={13} className="text-primary-500" />
            Resource Groups
          </h3>
          <button 
            onClick={() => setIsAddingGroup(true)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-primary-650 transition cursor-pointer"
            title="Add a new Resource Group"
          >
            <Plus size={14} />
          </button>
        </div>

        {isAddingGroup && (
          <div className="p-3 border-b border-slate-100 bg-slate-50/60 space-y-1.5">
            <input
              type="text"
              placeholder="Group name..."
              autoFocus
              value={newGroupInput}
              onChange={(e) => setNewGroupInput(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-primary-500 focus:outline-none bg-white font-semibold text-slate-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddGroup();
                if (e.key === 'Escape') { setIsAddingGroup(false); setNewGroupInput(''); }
              }}
            />
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={() => { setIsAddingGroup(false); setNewGroupInput(''); }}
                className="px-2 py-0.5 text-[10px] border border-slate-200 rounded hover:bg-slate-100 text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                className="px-2 py-0.5 text-[10px] bg-primary-600 text-white rounded hover:bg-primary-700 font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {/* All Resources default tab */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedGroupFilter({ type: 'all', id: 'all' })}
            className={cn(
              "flex items-center justify-between px-4 py-2 text-xs transition-all cursor-pointer font-bold border-l-3 outline-none mb-1.5",
              selectedGroupFilter.type === 'all'
                ? "text-primary-600 bg-primary-50/70 border-primary-600"
                : "text-slate-600 hover:bg-slate-50 border-transparent"
            )}
          >
            <span>All Resources</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono text-slate-500 font-bold">
              {mergedResources.length}
            </span>
          </div>

          <div className="px-3 pb-1 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Groups</span>
          </div>

          {groups.map((item) => {
            const isExpanded = !!expandedGroups[item.id];
            return (
              <div key={item.id} className="space-y-0.5 group/group">
                <div
                  className={cn(
                    "flex items-center justify-between w-full px-2 py-1.5 transition-all outline-none",
                    selectedGroupFilter.type === 'group' && selectedGroupFilter.id === item.id 
                      ? "text-primary-700 bg-primary-50/70 border-l-3 border-primary-600 font-bold" 
                      : "text-slate-600 hover:bg-slate-50/60 border-l-3 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {/* Chevron Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGroups(prev => ({
                          ...prev,
                          [item.id]: !prev[item.id]
                        }));
                      }}
                      className="p-1 hover:bg-slate-200/60 rounded text-slate-450 hover:text-slate-700 focus:outline-none shrink-0 transition"
                      type="button"
                    >
                      <ChevronDown 
                        size={11} 
                        className={cn(
                          "transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>

                    <span 
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedGroupFilter({ type: 'group', id: item.id });
                        if (!isExpanded) {
                          setExpandedGroups(prev => ({ ...prev, [item.id]: true }));
                        }
                      }}
                      className="truncate flex-1 text-left cursor-pointer font-bold text-[12px] hover:text-primary-600"
                    >
                      {item.name}
                    </span>
                  </div>

                  {/* Group Action Controls */}
                  <div className="flex items-center gap-0.5 shrink-0 pl-1.5">
                    {groupToDelete === item.id ? (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] animate-fade-in shadow-sm select-none">
                        <span className="text-red-700 font-extrabold text-[8px] uppercase tracking-wide">Del?</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(item.id, e);
                            setGroupToDelete(null);
                          }}
                          className="bg-red-600 text-white hover:bg-red-700 px-1 rounded font-extrabold text-[9px] cursor-pointer"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setGroupToDelete(null);
                          }}
                          className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-150 px-1 py-0.2 rounded font-bold text-[9px] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[9.5px] font-bold opacity-60 mr-1 bg-slate-100/60 px-1 rounded text-slate-500">{getGroupCount(item.id)}</span>
                        
                        <button
                          onClick={() => {
                            setAddingSubGroupId(item.id);
                            setNewSubGroupInput('');
                            setExpandedGroups(prev => ({ ...prev, [item.id]: true }));
                          }}
                          className="opacity-0 group-hover/group:opacity-100 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-primary-650 transition cursor-pointer"
                          title="Add Sub-group"
                        >
                          <Plus size={11} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGroupToDelete(item.id);
                          }}
                          className="opacity-0 group-hover/group:opacity-100 p-0.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-650 transition cursor-pointer"
                          title="Delete Group"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Children subGroups - Expandable Tree Folder */}
                {isExpanded && (
                  <div className="pl-4 border-l border-slate-100 ml-4 my-0.5 space-y-0.5 animate-fade-in">
                    {item.subGroups.map(child => (
                      <div
                        key={child.id}
                        className={cn(
                          "flex items-center justify-between w-full pr-3 py-1 text-[11.5px] text-left transition-colors cursor-pointer group/sub pl-3 rounded-md hover:bg-slate-50/50",
                          selectedGroupFilter.type === 'subgroup' && selectedGroupFilter.id === child.id 
                            ? "text-primary-600 font-bold bg-primary-50/30" 
                            : "text-slate-500 hover:text-slate-800"
                        )}
                        onClick={() => setSelectedGroupFilter({ type: 'subgroup', id: child.id })}
                      >
                        <span className="truncate">{child.name}</span>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {subGroupToDelete && subGroupToDelete.subGroupId === child.id ? (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-150 px-1 rounded text-[9.5px] shadow-sm select-none">
                              <span className="text-red-700 font-bold text-[8px] uppercase">Del?</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubGroup(item.id, child.id, e);
                                  setSubGroupToDelete(null);
                                }}
                                className="text-red-650 hover:bg-red-100 px-0.5 rounded font-black text-[9px] cursor-pointer"
                              >
                                Yes
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubGroupToDelete(null);
                                }}
                                className="text-slate-500 hover:bg-slate-205 px-0.5 rounded font-black text-[9px] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-[9px] opacity-60 font-mono bg-slate-50 px-1 rounded">{getSubGroupCount(child.id)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubGroupToDelete({ groupId: item.id, subGroupId: child.id });
                                }}
                                className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-red-600 transition p-0.5 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete Sub-group"
                              >
                                <Trash2 size={10} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {addingSubGroupId === item.id && (
                      <div className="pr-3 py-1 bg-slate-50/80 space-y-1 my-1 rounded border border-slate-100 ml-3">
                        <input
                          type="text"
                          placeholder="Sub-group name..."
                          autoFocus
                          value={newSubGroupInput}
                          onChange={(e) => setNewSubGroupInput(e.target.value)}
                          className="w-full px-1.5 py-0.5 text-[11px] border border-slate-200 rounded focus:border-primary-500 focus:outline-none bg-white font-medium text-slate-800"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddSubGroup(item.id);
                            if (e.key === 'Escape') { setAddingSubGroupId(null); setNewSubGroupInput(''); }
                          }}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => { setAddingSubGroupId(null); setNewSubGroupInput(''); }}
                            className="px-1.5 py-0.5 text-[9px] border border-slate-200 rounded hover:bg-slate-100 text-slate-500 font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddSubGroup(item.id)}
                            className="px-1.5 py-0.5 text-[9px] bg-primary-600 text-white rounded hover:bg-primary-700 font-bold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                                  onClick={() => handleOpenCreatePrice(resource)}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs text-primary-600 font-bold flex items-center gap-2"
                                >
                                  <TrendingUp size={12} className="text-primary-500" /> Create Regional Price
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
            <div className="fixed inset-0 bg-slate-900/15 backdrop-blur-[1px] z-[60]" onClick={() => { setIsDetailDrawerOpen(false); }} />
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
                  onClick={() => { setIsDetailDrawerOpen(false); }}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs in Drawer */}
              <div className="flex border-b border-slate-100 text-xs">
                <button 
                  onClick={() => { setActiveTabInDrawer('details'); }}
                  className={cn(
                    "flex-1 py-2.5 text-center font-bold tracking-tight border-b-2 hover:bg-slate-50",
                    activeTabInDrawer === 'details' ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500"
                  )}
                >
                  Specs & Details
                </button>
                <button 
                  onClick={() => { setActiveTabInDrawer('prices'); }}
                  className={cn(
                    "flex-1 py-2.5 text-center font-bold tracking-tight border-b-2 hover:bg-slate-50",
                    activeTabInDrawer === 'prices' ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500"
                  )}
                >
                  Prices History
                </button>
                <button 
                  onClick={() => { setActiveTabInDrawer('usages'); }}
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
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-[10.5px] uppercase text-slate-400 tracking-wider">Consolidated Price Matrix History</h4>
                            <button
                              onClick={() => handleOpenCreatePrice(selectedResource)}
                              className="text-[10px] text-primary-600 hover:text-white hover:bg-primary-600 font-extrabold flex items-center gap-1 border border-primary-200 hover:border-primary-600 px-2.5 py-1 rounded bg-white transition cursor-pointer shadow-sm select-none"
                            >
                              <Plus size={10} /> Add Region Price
                            </button>
                          </div>
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg bg-white overflow-hidden shadow-sm">
                            <div className="flex justify-between p-2.5 bg-slate-50 font-bold text-slate-500">
                              <span>Fiscal Period</span>
                              <span>Unit Rate (USD)</span>
                            </div>
                            
                            {/* pricing history list */}
                            {(() => {
                              const staticHistory = (MOCK_PRICING_HISTORY as any)[selectedResource.id] || [
                                { period: '2025 Q1', rate: selectedResource.baseRate * 0.95 },
                                { period: '2025 Q2', rate: selectedResource.baseRate * 0.97 },
                                { period: '2025 Q3', rate: selectedResource.baseRate * 0.98 },
                                { period: '2025 Q4', rate: selectedResource.baseRate * 0.99 },
                                { period: '2026 Q1', rate: selectedResource.baseRate },
                              ];
                              const customized = localPricingHistory[selectedResource.id] || [];
                              const merged = [...customized];
                              staticHistory.forEach((h: any) => {
                                if (!merged.some(m => m.period === h.period)) {
                                  merged.push(h);
                                }
                              });
                              // Sort descending or by period name
                              return merged.sort((a, b) => b.period.localeCompare(a.period));
                            })().map((hist: any, hidx: number) => (
                              <div key={hidx} className="flex justify-between p-2.5 hover:bg-slate-50 font-medium items-center">
                                <span className="font-bold text-slate-650 flex items-center gap-1.5">
                                  {hist.period}
                                  {(localPricingHistory[selectedResource.id] || []).some((item: any) => item.period === hist.period) && (
                                    <span className="bg-primary-50 text-primary-700 text-[8px] px-1 py-0.2 rounded font-black uppercase tracking-wide border border-primary-100">
                                      Custom Added
                                    </span>
                                  )}
                                </span>
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

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EDIT RESOURCE POPUP MODAL - STANDARD CENTERED POPUP STYLE */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col text-xs text-slate-600"
            >
              {/* Header */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Modify Construction Resource</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Edit properties, category hierarchy, unit rates, and tracking specifications.</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Resource Code</label>
                    <input 
                      type="text"
                      required
                      value={editForm.code || ''}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono font-bold text-slate-800"
                      placeholder="e.g. MAT-CM-02"
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Resource Name</label>
                    <input 
                      type="text"
                      required
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-bold text-slate-800"
                      placeholder="e.g. Reinforcements Cage D16"
                    />
                  </div>
                </div>

                {/* Enterprise Category Selection (Requirement 2) */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Enterprise Category</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800 text-xs"
                    value={editCategoryVal}
                    onChange={(e) => setEditCategoryVal(e.target.value)}
                  >
                    {flatCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Resource Group</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800"
                      value={editSelectedCategory}
                      onChange={(e) => {
                        const grpName = e.target.value;
                        setEditSelectedCategory(grpName);
                        const matchedGrp = groups.find(g => g.name === grpName);
                        setEditSelectedSubCategory(matchedGrp?.subGroups && matchedGrp.subGroups.length > 0 ? matchedGrp.subGroups[0].name : 'none');
                      }}
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub category selection dropdown */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Sub Group (Optional)</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-medium bg-white text-slate-800"
                      value={editSelectedSubCategory}
                      onChange={(e) => setEditSelectedSubCategory(e.target.value)}
                    >
                      <option value="none">None (Main Group)</option>
                      {groups.find(g => g.name === editSelectedCategory)?.subGroups?.map(sg => (
                        <option key={sg.id} value={sg.name}>{sg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Resource Type */}
                  <div className="space-y-1 col-span-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Resource Type</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800"
                      value={editForm.type || 'Material'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    >
                      <option value="Material">Material</option>
                      <option value="Labor">Labor</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Subcontractor">Subcontractor</option>
                    </select>
                  </div>

                  {/* Standard Unit */}
                  <div className="space-y-1 col-span-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Standard Unit</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-semibold bg-white text-slate-800"
                      value={editForm.unit || 'Nos'}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    >
                      {['Nos','Bag','Ton','Kg','m³','m²','m','Hour','Day','Lot', 'Pair', 'Pack'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Base rate */}
                  <div className="space-y-1 col-span-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Base Rate (USD)</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={editForm.baseRate || 0}
                      onChange={(e) => setEditForm({ ...editForm, baseRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-bold text-slate-800"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Supplier & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Supplier Index</label>
                    <input 
                      type="text"
                      value={editForm.supplier || ''}
                      onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-medium text-slate-800"
                      placeholder="e.g. Holcim Group"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800"
                      value={editForm.status || 'Active'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Specifications Detail</label>
                  <textarea 
                    value={editForm.specifications || ''}
                    onChange={(e) => setEditForm({ ...editForm, specifications: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-medium h-16 resize-none"
                    placeholder="Provide technical specifications if any..."
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-lg shadow transition flex items-center gap-1.5"
                  >
                    <Save size={14} /> Update Resource
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP: CREATE PRICE TO ACTIVE REGION AND ACTIVE PERIOD */}
      <AnimatePresence>
        {isPriceModalOpen && selectedResource && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 px-5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Create Regional Price Matrix</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Define regional/period-specific pricing indexes</p>
                </div>
                <button 
                  onClick={() => setIsPriceModalOpen(false)} 
                  className="p-1.5 hover:bg-slate-200 hover:text-slate-700 rounded-full text-slate-400 transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveCreatePrice} className="p-5 space-y-4 text-xs">
                
                {/* Resource Info (Read only) */}
                <div className="p-3 bg-primary-50/50 rounded-xl border border-primary-100/50 space-y-1">
                  <span className="font-extrabold text-[#0369a1] uppercase tracking-wider text-[9px]">Resource Target</span>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="font-black text-[#0f172a] text-[12px]">{selectedResource.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-[#e0f2fe] text-[#0369a1] px-1.5 py-0.5 rounded">
                      {selectedResource.code}
                    </span>
                  </div>
                </div>

                {/* Region Selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Target Region</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800 font-semibold"
                    value={priceForm.regionId}
                    onChange={(e) => setPriceForm({ ...priceForm, regionId: e.target.value })}
                  >
                    {regionsList.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Period Selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Fiscal Period</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800 font-semibold"
                    value={priceForm.periodName}
                    onChange={(e) => setPriceForm({ ...priceForm, periodName: e.target.value })}
                  >
                    {periodsList.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Rate Index */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Unit Rate (USD)</label>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">Base is {formatCurrency(selectedResource.baseRate)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-black">$</span>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={priceForm.rate || ''}
                      onChange={(e) => setPriceForm({ ...priceForm, rate: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono font-bold text-slate-800 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* SLA Supplier (Pre-filled) */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">SLA Supplier (Optional)</label>
                  <input 
                    type="text"
                    value={priceForm.supplierName}
                    onChange={(e) => setPriceForm({ ...priceForm, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-medium text-slate-800"
                    placeholder="Provide supplier SLA reference if any..."
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsPriceModalOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-lg shadow transition flex items-center gap-1.5"
                  >
                    <Save size={14} /> Create Rate Index
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
