import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useProject } from '../context/ProjectContext.tsx';
import { type Resource } from '../types.ts';

// New Sub-panels
import { ResourceDashboard } from './resources/ResourceDashboard.tsx';
import { ResourceList } from './resources/ResourceList.tsx';
import { CategoryManagement } from './resources/CategoryManagement.tsx';
import { SupplierManagement } from './resources/SupplierManagement.tsx';
import { PriceManagement } from './resources/PriceManagement.tsx';
import { ResourceAnalytics } from './resources/ResourceAnalytics.tsx';
import { ImportExport } from './resources/ImportExport.tsx';
import { ResourceReports } from './resources/ResourceReports.tsx';

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

  const currentTab = validSubTabs.includes(activeSubTab) ? activeSubTab : 'resource-dashboard';

  // Force reset if non-resource tab is active but parent rendered RM module
  useEffect(() => {
    if (!validSubTabs.includes(activeSubTab) && setActiveSubTab) {
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

  // Quick Action to simulate adding standard resource directly into resources array
  const handleDirectAddResource = () => {
    const code = `MAT-GEN-${Math.floor(100 + Math.random() * 900)}`;
    const newRes: Resource = {
      id: `res-${Date.now()}`,
      code,
      name: 'Standard Architectural Fitting Submittal',
      type: 'Material' as any,
      category: 'Materials',
      unit: 'Nos',
      currency: 'USD',
      supplier: 'Riyadh Trade Corp',
      baseRate: 45.0,
      specifications: 'Approved standard industrial specification submittal.',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdateResources([...resources, newRes]);
    alert(`Resource ${code} added and catalog elements updated.`);
    if (setActiveSubTab) {
      setActiveSubTab('resource-list');
    }
  };

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
            Workspace Logistics / {currentProject?.name || 'Enterprise Registry'} / Resource Management
          </div>
          <h2 className="text-xl font-black text-slate-800 leading-tight">
            {currentTab === 'resource-dashboard' ? 'Logistics Control Center' :
             currentTab === 'resource-list' ? 'Material & Equipment Ledger' :
             currentTab === 'resource-categories' ? 'Registry Catalog' :
             currentTab === 'resource-suppliers' ? 'Vetted Suppliers' :
             currentTab === 'resource-prices' ? 'Negotiated Pricing Index' :
             currentTab === 'resource-analytics' ? 'Analytics Intelligence' :
             currentTab === 'resource-import-export' ? 'Bulks Excel Integrator' : 'QS Reports Snapshot'}
          </h2>
        </div>

        {/* Filters and trigger Actions */}
        <div className="flex flex-wrap items-center gap-3">
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
            onClick={handleDirectAddResource}
            className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-700 transition shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Add Resource
          </button>
        </div>
      </div>

      {/* Main Panel Frame */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

    </div>
  );
};
