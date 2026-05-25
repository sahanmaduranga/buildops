import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext.tsx';
import { type Resource, ResourceType } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';

// New Sub-panels
import { ResourceDashboard } from './resources/ResourceDashboard.tsx';
import { ResourceList } from './resources/ResourceList.tsx';
import { CategoryManagement } from './resources/CategoryManagement.tsx';
import { SupplierManagement } from './resources/SupplierManagement.tsx';
import { PriceManagement } from './resources/PriceManagement.tsx';
import { ResourceAnalytics } from './resources/ResourceAnalytics.tsx';
import { ImportExport } from './resources/ImportExport.tsx';
import { ResourceReports } from './resources/ResourceReports.tsx';
import { INITIAL_CATEGORIES, Category } from './resources/resourceMockData.ts';

const STANDARD_UNITS = [
  'Nos',
  'Bag',
  'Ton',
  'Kg',
  'm³',
  'm²',
  'm',
  'Hour',
  'Day',
  'Lot',
  'Pair',
  'Pack'
];

interface SubGroup {
  id: string;
  name: string;
}

interface ResourceGroup {
  id: string;
  name: string;
  subGroups: SubGroup[];
}

export const ResourceManagement = ({ 
  resources, 
  onUpdateResources,
  activeSubTab = 'resource-dashboard',
  setActiveSubTab
}: { 
  resources: Resource[], 
  onUpdateResources: (resources: Resource[]) => void,
  activeSubTab?: string,
  setActiveSubTab?: (id: string) => void
}) => {
  const { currentProject } = useProject();
  const [selectedRegion, setSelectedRegion] = React.useState('1');
  const [selectedPeriod, setSelectedPeriod] = React.useState('5');

  // Popup Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newResourceForm, setNewResourceForm] = useState({
    code: '',
    name: '',
    type: ResourceType.MATERIAL,
    unit: 'Nos',
    baseRate: 45.0,
    supplier: 'LafargeHolcim',
    specifications: ''
  });

  // Category and subcategory selection states for creation form
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Loaded groups list for population
  const [groups, setGroups] = useState<ResourceGroup[]>([]);

  // Synchronize loading groups whenever workspace groups are read or modal opens
  const loadWorkspaceGroups = () => {
    const saved = localStorage.getItem('resource_groups_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGroups(parsed);
        return parsed;
      } catch (e) {}
    }
    const defaultVal: ResourceGroup[] = [
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
    setGroups(defaultVal);
    return defaultVal;
  };

  useEffect(() => {
    const loaded = loadWorkspaceGroups();
    if (loaded && loaded.length > 0) {
      setSelectedGroup(loaded[0].name);
      setSelectedSubGroup('none');
    }

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
    setCategoriesList(cats);
    if (cats.length > 0) {
      setSelectedCategory(cats[0].name);
    }
  }, [isAddModalOpen]);

  // Defensive routing alignment
  const validSubTabs = [
    'resource-dashboard',
    'resource-list',
    'resource-categories',
    'resource-suppliers',
    'resource-prices',
    'resource-analytics',
    'resource-import-export',
    'resource-reports'
  ];

  const isMasterMode = activeSubTab === 'master-resources';
  const [localTabState, setLocalTabState] = useState('resource-list');

  const currentTab = isMasterMode 
    ? localTabState 
    : (validSubTabs.includes(activeSubTab) ? activeSubTab : 'resource-dashboard');

  const handleSetActiveSubTab = (tabId: string) => {
    if (isMasterMode) {
      setLocalTabState(tabId);
    } else if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  // Force reset if non-resource tab is active but parent rendered RM module, unless in Master library mode
  useEffect(() => {
    if (activeSubTab !== 'master-resources' && !validSubTabs.includes(activeSubTab) && setActiveSubTab) {
      setActiveSubTab('resource-dashboard');
    }
  }, [activeSubTab, setActiveSubTab]);

  const regions = [
    { id: '1', name: 'Riyadh Central (Index: 1.0)' },
    { id: '2', name: 'Jeddah Coastal (Index: 1.05)' },
    { id: '3', name: 'Dammam Eastern (Index: 1.0)' },
    { id: '4', name: 'NEOM District (Index: 1.15)' },
  ];

  const periods = [
    { id: '1', name: '2024 Q1 (Base)' },
    { id: '2', name: '2024 Q2 (Base)' },
    { id: '5', name: '2026 Q1 (Current Multiplier: 1.08)' },
  ];

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceForm.code.trim() || !newResourceForm.name.trim()) return;

    const newRes: Resource = {
      id: `res-${Date.now()}`,
      code: newResourceForm.code.trim(),
      name: newResourceForm.name.trim(),
      type: newResourceForm.type,
      category: selectedCategory || 'Cement',
      resourceGroup: selectedGroup,
      resourceSubGroup: selectedSubGroup && selectedSubGroup !== 'none' ? selectedSubGroup : undefined,
      unit: newResourceForm.unit,
      currency: 'USD',
      supplier: newResourceForm.supplier,
      baseRate: Number(newResourceForm.baseRate) || 0,
      specifications: newResourceForm.specifications || 'Approved standard industrial specification submittal.',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateResources([...resources, newRes]);
    setIsAddModalOpen(false);

    handleSetActiveSubTab('resource-list');
  };

  const selectedGroupDetails = groups.find(g => g.name === selectedGroup);

  const renderContent = () => {
    switch (currentTab) {
      case 'resource-dashboard':
        return <ResourceDashboard />;
      case 'resource-list':
        return (
          <ResourceList 
            resources={resources}
            onUpdateResources={onUpdateResources}
            selectedRegion={selectedRegion}
            selectedPeriod={selectedPeriod}
          />
        );
      case 'resource-categories':
        return <CategoryManagement />;
      case 'resource-suppliers':
        return <SupplierManagement />;
      case 'resource-prices':
        return <PriceManagement />;
      case 'resource-analytics':
        return <ResourceAnalytics />;
      case 'resource-import-export':
        return <ImportExport />;
      case 'resource-reports':
        return <ResourceReports />;
      default:
        return <ResourceDashboard />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 text-[13px] text-slate-600">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            {isMasterMode ? 'Enterprise Registry / Company Master Library' : `Workspace Logistics / ${currentProject?.name || 'Enterprise Registry'} / Resource Management`}
          </div>
          <h2 className="text-xl font-black text-slate-800 leading-tight">
            {isMasterMode ? (
              currentTab === 'resource-dashboard' ? 'Master Resource Analytics Core' :
              currentTab === 'resource-list' ? 'Master Corporate Resource Ledger' :
              currentTab === 'resource-categories' ? 'Master Class Association Catalog' :
              currentTab === 'resource-suppliers' ? 'Vetted Master Suppliers' :
              currentTab === 'resource-prices' ? 'Negotiated Enterprise Pricing Matrix' :
              currentTab === 'resource-analytics' ? 'Master Catalog Intelligence' :
              currentTab === 'resource-import-export' ? 'Master Catalog Excel Integrator' : 'Master Catalog QS Reports'
            ) : (
              currentTab === 'resource-dashboard' ? 'Logistics Control Center' :
              currentTab === 'resource-list' ? 'Material & Equipment Ledger' :
              currentTab === 'resource-categories' ? 'Registry Catalog' :
              currentTab === 'resource-suppliers' ? 'Vetted Suppliers' :
              currentTab === 'resource-prices' ? 'Negotiated Pricing Index' :
              currentTab === 'resource-analytics' ? 'Analytics Intelligence' :
              currentTab === 'resource-import-export' ? 'Bulks Excel Integrator' : 'QS Reports Snapshot'
            )}
          </h2>
        </div>

        {/* Filters and trigger Actions - Right Align layout */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Layout controls for current resource rate calculation */}
          <div className="flex items-center gap-2">
            <div className="space-y-0.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Active Region</label>
              <select 
                className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Fiscal Period</label>
              <select 
                className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
          
          <button 
            onClick={() => {
              const randSuffix = Math.floor(100 + Math.random() * 900);
              setNewResourceForm({
                code: `MAT-GEN-${randSuffix}`,
                name: '',
                type: ResourceType.MATERIAL,
                unit: 'Nos',
                baseRate: 45.0,
                supplier: 'LafargeHolcim',
                specifications: 'Approved standard industrial specification submittal.'
              });
              
              // Seed category selectors
              const defaultGroups = loadWorkspaceGroups();
              if (defaultGroups && defaultGroups.length > 0) {
                setSelectedGroup(defaultGroups[0].name);
                setSelectedSubGroup('none');
              }
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-700 transition shadow-sm cursor-pointer ml-auto md:ml-0"
          >
            <Plus size={14} /> Add Resource
          </button>
        </div>
      </div>

      {/* If in Master Resource Library mode, render on-screen horizontal sub-tabs */}
      {isMasterMode && (
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 flex-row self-start max-w-fit">
          {[
            { id: 'resource-dashboard', label: 'Dashboard' },
            { id: 'resource-list', label: 'Master Ledger' },
            { id: 'resource-categories', label: 'Categories' },
            { id: 'resource-suppliers', label: 'Vetted Suppliers' },
            { id: 'resource-prices', label: 'Price Matrix' },
            { id: 'resource-analytics', label: 'Analytics' },
            { id: 'resource-import-export', label: 'Excel Sync' },
            { id: 'resource-reports', label: 'QS Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLocalTabState(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                localTabState === tab.id 
                  ? 'bg-white text-primary-600 shadow-sm font-black' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Panel Frame */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* ADD RESOURCE POPUP MODAL - STANDARD CENTERED POPUP STYLE */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
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
                  <h3 className="text-sm font-black text-slate-800">Add New Construction Resource</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Define material specs, default suppliers, and unit rates inside the registry catalog.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateResource} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Resource Code</label>
                    <input 
                      type="text"
                      required
                      value={newResourceForm.code}
                      onChange={(e) => setNewResourceForm({ ...newResourceForm, code: e.target.value })}
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
                      value={newResourceForm.name}
                      onChange={(e) => setNewResourceForm({ ...newResourceForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-bold text-slate-800"
                      placeholder="e.g. Reinforcements Cage D16"
                    />
                  </div>
                </div>

                {/* Enterprise Category Selection (Requirement 2) */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Enterprise Category</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Resource Group Selection */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Resource Group</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold bg-white text-slate-800"
                      value={selectedGroup}
                      onChange={(e) => {
                        const grpName = e.target.value;
                        setSelectedGroup(grpName);
                        const matchedGrp = groups.find(g => g.name === grpName);
                        setSelectedSubGroup(matchedGrp?.subGroups && matchedGrp.subGroups.length > 0 ? matchedGrp.subGroups[0].name : 'none');
                      }}
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-group selection dropdown (optional) */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Sub Group (Optional)</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-medium bg-white text-slate-800"
                      value={selectedSubGroup}
                      onChange={(e) => setSelectedSubGroup(e.target.value)}
                    >
                      <option value="none">None (Main Group)</option>
                      {selectedGroupDetails?.subGroups?.map(sg => (
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
                      value={newResourceForm.type}
                      onChange={(e) => {
                        const nextType = e.target.value as ResourceType;
                        const prefix = nextType === ResourceType.MATERIAL ? 'MAT-' : nextType === ResourceType.LABOR ? 'LAB-' : 'EQP-';
                        const randSuffix = Math.floor(100 + Math.random() * 900);
                        setNewResourceForm({ 
                          ...newResourceForm, 
                          type: nextType,
                          code: `${prefix}GEN-${randSuffix}`
                        });
                      }}
                    >
                      <option value={ResourceType.MATERIAL}>Material</option>
                      <option value={ResourceType.LABOR}>Labor</option>
                      <option value={ResourceType.EQUIPMENT}>Equipment</option>
                      <option value={ResourceType.SUBCONTRACTOR}>Subcontractor</option>
                    </select>
                  </div>

                  {/* Standard Unit Dropdown Selection */}
                  <div className="space-y-1 col-span-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Standard Unit</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-semibold bg-white text-slate-800"
                      value={newResourceForm.unit}
                      onChange={(e) => setNewResourceForm({ ...newResourceForm, unit: e.target.value })}
                    >
                      {STANDARD_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Base rate */}
                  <div className="space-y-1 col-span-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Base Rate (USD)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={newResourceForm.baseRate}
                      onChange={(e) => setNewResourceForm({ ...newResourceForm, baseRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono font-bold text-slate-800"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Vetted Supplier */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Vetted Key Supplier</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-medium bg-white text-slate-805"
                    value={newResourceForm.supplier}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, supplier: e.target.value })}
                  >
                    <option value="LafargeHolcim">LafargeHolcim</option>
                    <option value="ArcelorMittal Steel">ArcelorMittal Steel</option>
                    <option value="CEMEX Saudi">CEMEX Saudi</option>
                    <option value="CAT Rental KSA">CAT Rental KSA</option>
                    <option value="Saudi Steel Corp">Saudi Steel Corp</option>
                    <option value="Internal">Internal Core Allocation</option>
                  </select>
                </div>

                {/* Specifications */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Detailed Material Specifications</label>
                  <textarea 
                    value={newResourceForm.specifications}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, specifications: e.target.value })}
                    className="w-full h-16 px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none font-medium text-slate-800"
                    placeholder="Provide compliance directives, submittal records or standard dimensions..."
                  />
                </div>

                {/* Submit Controls */}
                <div className="pt-2 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-primary-600 text-white font-bold py-2.5 rounded-lg hover:bg-primary-700 transition shadow cursor-pointer text-center"
                  >
                    Create and Publish Resource
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 border border-slate-200 hover:bg-slate-50 py-2.5 rounded-lg font-bold transition text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};;
