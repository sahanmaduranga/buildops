import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Save, 
  Info,
  TrendingUp,
  ChevronDown,
  Search,
  Maximize2,
  FileSpreadsheet,
  X,
  CreditCard,
  FileText,
  ArrowLeft,
  MoreVertical,
  Layers,
  Copy,
  Edit,
  ExternalLink,
  MapPin,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  FileCheck2,
  FolderLock,
  Download,
  Upload,
  FileCode,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils.ts';
import { MOCK_REGIONS, MOCK_PERIODS, MOCK_PRICE_MATRIX, MOCK_RATE_ANALYSES_CATEGORIES } from '../mockData.ts';
import { ResourceType, type RateAnalysis, type Resource, type RateCategory } from '../types.ts';
import { useProject } from '../context/ProjectContext.tsx';

// Import newly created modular sub-views
import { DashboardView } from './rate-analysis/DashboardView.tsx';
import { ListView } from './rate-analysis/ListView.tsx';
import { ResourceCostingView } from './rate-analysis/ResourceCostingView.tsx';
import { ComparisonView } from './rate-analysis/ComparisonView.tsx';
import { TemplatesView } from './rate-analysis/TemplatesView.tsx';
import { ImportExportView } from './rate-analysis/ImportExportView.tsx';
import { ReportsView } from './rate-analysis/ReportsView.tsx';

// Helper function to get rate from price matrix or fallback to default
const getResourceRate = (resourceId: string, regionId: string, periodId: string, defaultRate: number) => {
  const customRate = MOCK_PRICE_MATRIX.find(
    p => p.resourceId === resourceId && p.regionId === regionId && p.periodId === periodId
  );
  return customRate ? customRate.rate : defaultRate;
};

// Helper function to recalculate analysis based on region and period
const getRecalculatedAnalysis = (analysis: RateAnalysis, regionId: string, periodId: string): RateAnalysis => {
  const updatedResources = analysis.resources.map(res => {
    const rate = getResourceRate(res.resourceId, regionId, periodId, res.rate);
    const prodFactor = res.productivityFactor ?? 1;
    const wasteFactor = res.wasteFactor ?? 0;
    
    // Amount calculation logic:
    // Productivity factor affects quantity (e.g., labor productivity)
    // Waste factor adds a percentage to materials
    const amount = res.quantity * rate * prodFactor * (1 + wasteFactor);
    
    return { ...res, rate, amount };
  });

  const totalMaterialCost = updatedResources
    .filter(r => r.resourceType === ResourceType.MATERIAL)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalLaborCost = updatedResources
    .filter(r => r.resourceType === ResourceType.LABOR)
    .reduce((sum, r) => sum + r.amount, 0);
    
  const totalEquipmentCost = updatedResources
    .filter(r => r.resourceType === ResourceType.EQUIPMENT)
    .reduce((sum, r) => sum + r.amount, 0);

  const subtotal = totalMaterialCost + totalLaborCost + totalEquipmentCost;
  const overhead = (subtotal * analysis.overheadPercentage) / 100;
  const profit = (subtotal * analysis.profitPercentage) / 100;
  const tax = (subtotal * analysis.taxPercentage) / 100;
  
  const finalRate = subtotal + overhead + profit + tax;
  const netRate = subtotal + overhead + profit; 

  return {
    ...analysis,
    resources: updatedResources,
    totalMaterialCost,
    totalLaborCost,
    totalEquipmentCost,
    subtotal,
    netRate,
    finalRate
  };
};

export const RateAnalysisScreen = ({ 
  analyses, 
  onUpdateAnalyses,
  resources,
  activeSubTab = 'rate-analysis-dashboard',
  setActiveSubTab
}: { 
  analyses: RateAnalysis[], 
  onUpdateAnalyses: (analyses: RateAnalysis[]) => void,
  resources: Resource[],
  activeSubTab?: string,
  setActiveSubTab: (subTab: string) => void
}) => {
  const { currentProject } = useProject();
  const [selectedAnalysis, setSelectedAnalysis] = useState<RateAnalysis | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(MOCK_REGIONS[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(MOCK_PERIODS[1].id); // Default to Q2 (Open)

  const [categories, setCategories] = useState<RateCategory[]>([
    { id: 'civil', label: 'Civil Works' },
    { id: 'concrete', label: 'Concrete Works', parentId: 'civil' },
    { id: 'masonry', label: 'Masonry Works', parentId: 'civil' },
    { id: 'earth', label: 'Earth Works', parentId: 'civil' },
    { id: 'finishing', label: 'Finishing Works' },
  ]);

  // Sync to subtab switches to reset/maintain local active selections
  useEffect(() => {
    if (activeSubTab !== 'rate-analysis-builder') {
      setSelectedAnalysis(null);
    }
  }, [activeSubTab]);

  const handleSelectAnalysis = (analysisId: string) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
      setSelectedAnalysis(analysis);
      setActiveSubTab('rate-analysis-builder');
    }
  };

  const handleDuplicateAnalysis = (id: string) => {
    const original = analyses.find(a => a.id === id);
    if (original) {
      const copy: RateAnalysis = {
        ...original,
        id: `ra-${Date.now()}`,
        code: `${original.code}-COPY`,
        description: `${original.description} (Duplicate)`,
      };
      onUpdateAnalyses([copy, ...analyses]);
      alert(`Analysis matched: duplicated ${original.code} to ${copy.code}!`);
    }
  };

  const handleArchiveAnalysis = (id: string) => {
    alert(`Moving analysis ${id} to archived project parameters context.`);
  };

  const handleSaveAnalysis = (updatedAnalysis: RateAnalysis) => {
    const exists = analyses.some(a => a.id === updatedAnalysis.id);
    let newAnalyses: RateAnalysis[];
    if (exists) {
      newAnalyses = analyses.map(a => a.id === updatedAnalysis.id ? updatedAnalysis : a);
    } else {
      newAnalyses = [updatedAnalysis, ...analyses];
    }
    onUpdateAnalyses(newAnalyses);
    setSelectedAnalysis(null);
    setActiveSubTab('rate-analysis-list');
  };

  const handleDeleteAnalysis = (id: string) => {
    onUpdateAnalyses(analyses.filter(a => a.id !== id));
    setSelectedAnalysis(null);
    setActiveSubTab('rate-analysis-list');
  };

  const handleImportTemplate = (templateCode: string) => {
    // Standard simulation of loading template resources
    const templateItem: RateAnalysis = {
      id: `imp-ra-${Date.now()}`,
      code: 'RA-CONC-NEW',
      description: 'Concrete works from Template Works',
      unit: 'm3',
      categoryId: 'concrete',
      resources: [
        { id: `rai-${Date.now()}-1`, resourceId: 'res-1', resourceName: 'Portland Cement Type I', resourceType: ResourceType.MATERIAL, quantity: 7.5, unit: 'Bag (50kg)', rate: 8.5, amount: 63.75, wasteFactor: 0.05 },
        { id: `rai-${Date.now()}-2`, resourceId: 'res-3', resourceName: 'Skilled Mason', resourceType: ResourceType.LABOR, quantity: 0.5, unit: 'Day', rate: 45.0, amount: 22.5, productivityFactor: 1.1 }
      ],
      totalMaterialCost: 63.75,
      totalLaborCost: 22.5,
      totalEquipmentCost: 0,
      subtotal: 86.25,
      overheadPercentage: 10,
      profitPercentage: 5,
      taxPercentage: 15,
      netRate: 99.18,
      finalRate: 114.05
    };
    setSelectedAnalysis(templateItem);
    alert(`Standard template loaded into the active builder!`);
  };

  const handleBulkImport = (importedList: RateAnalysis[]) => {
    onUpdateAnalyses([...importedList, ...analyses]);
  };

  // Render correct sub-view based on activeSubTab route
  const renderContent = () => {
    switch (activeSubTab) {
      case 'rate-analysis-dashboard':
        return (
          <DashboardView 
            analyses={analyses} 
            resources={resources} 
            onNavigateToTab={setActiveSubTab}
            onSelectAnalysis={handleSelectAnalysis}
          />
        );
      case 'rate-analysis-list':
        return (
          <ListView 
            analyses={analyses} 
            resources={resources} 
            onSelectAnalysis={handleSelectAnalysis}
            onDuplicateAnalysis={handleDuplicateAnalysis}
            onArchiveAnalysis={handleArchiveAnalysis}
            onSelectSubTab={setActiveSubTab}
            categories={categories}
            setCategories={setCategories}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        );
      case 'rate-analysis-builder':
        return (
          <DetailView 
            analysis={selectedAnalysis} 
            onBack={() => setActiveSubTab('rate-analysis-list')}
            regionId={selectedRegion}
            periodId={selectedPeriod}
            onRegionChange={setSelectedRegion}
            onPeriodChange={setSelectedPeriod}
            onSave={handleSaveAnalysis}
            onDelete={handleDeleteAnalysis}
            resources={resources}
            categories={categories}
          />
        );
      case 'rate-analysis-resource-costing':
        return (
          <ResourceCostingView 
            analyses={analyses} 
            resources={resources} 
          />
        );
      case 'rate-analysis-comparison':
        return (
          <ComparisonView 
            analyses={analyses} 
          />
        );
      case 'rate-analysis-templates':
        return (
          <TemplatesView 
            analyses={analyses} 
            resources={resources} 
            onSelectSubTab={setActiveSubTab}
            onImportFromTemplate={handleImportTemplate}
          />
        );
      case 'rate-analysis-import-export':
        return (
          <ImportExportView 
            analyses={analyses} 
            onBulkImport={handleBulkImport}
          />
        );
      case 'rate-analysis-reports':
        return (
          <ReportsView 
            analyses={analyses} 
            resources={resources} 
          />
        );
      default:
        return (
          <DashboardView 
            analyses={analyses} 
            resources={resources} 
            onNavigateToTab={setActiveSubTab}
            onSelectAnalysis={handleSelectAnalysis}
          />
        );
    }
  };

  return (
    <div className="h-full">
      <div className="text-[12px] text-zentrix-muted font-medium mb-1">
        Projects / {currentProject?.name || 'Global Catalog'} / Costing & Estimation
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-zentrix-blue leading-tight tracking-tight">Rate Analysis Module</h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface DetailViewProps {
  analysis: RateAnalysis | null;
  onBack: () => void;
  regionId: string;
  periodId: string;
  onRegionChange: (id: string) => void;
  onPeriodChange: (id: string) => void;
  onSave: (analysis: RateAnalysis) => void;
  onDelete: (id: string) => void;
  resources: Resource[];
  categories: RateCategory[];
}

const DetailView = ({ 
  analysis, 
  onBack, 
  regionId, 
  periodId, 
  onRegionChange, 
  onPeriodChange,
  onSave,
  onDelete,
  resources,
  categories
}: DetailViewProps) => {
  const templateAnalysis: RateAnalysis = analysis || {
    id: `new-${Date.now()}`,
    code: 'RA-CONC-',
    description: 'New Concrete Estimation Block',
    unit: 'm3',
    resources: [],
    overheadPercentage: 10,
    profitPercentage: 5,
    taxPercentage: 15,
    totalMaterialCost: 0,
    totalLaborCost: 0,
    totalEquipmentCost: 0,
    subtotal: 0,
    netRate: 0,
    finalRate: 0
  };

  const [raData, setRaData] = useState<RateAnalysis>(templateAnalysis);
  const [remarkText, setRemarkText] = useState('Reviewed by QS. Cement usage matches standards.');
  const [attachmentFiles, setAttachmentFiles] = useState<string[]>([
    'Civil_Estimation_Guideline_V2.pdf', 
    'Portland-Cement-Type-I-Specs.xlsx'
  ]);
  const [statusVal, setStatusVal] = useState<'Draft' | 'Approved' | 'Revised' | 'Cancelled'>('Draft');

  const ra = getRecalculatedAnalysis(raData, regionId, periodId);

  const handleUpdateField = (field: keyof RateAnalysis, value: any) => {
    setRaData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateResource = (id: string, field: string, value: number) => {
    setRaData(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handleMoveResource = (index: number, direction: 'up' | 'down') => {
    setRaData(prev => {
      const copy = [...prev.resources];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < copy.length) {
        const item = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = item;
      }
      return { ...prev, resources: copy };
    });
  };

  const handleDuplicateResource = (id: string) => {
    const originalItem = raData.resources.find(r => r.id === id);
    if (originalItem) {
      const duplicate = {
        ...originalItem,
        id: `rai-dup-${Date.now()}`
      };
      setRaData(prev => {
        const index = prev.resources.findIndex(r => r.id === id);
        const copy = [...prev.resources];
        copy.splice(index + 1, 0, duplicate);
        return { ...prev, resources: copy };
      });
    }
  };

  const handleRemoveResource = (id: string) => {
    setRaData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id)
    }));
  };

  const handleAddResource = (resource: any) => {
    const newItem: any = {
      id: `rai-${Date.now()}`,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      quantity: 1,
      unit: resource.unit,
      rate: resource.baseRate,
      amount: resource.baseRate,
      wasteFactor: resource.type === ResourceType.MATERIAL ? 0.05 : 0,
      productivityFactor: 1
    };

    setRaData(prev => ({
      ...prev,
      resources: [...prev.resources, newItem]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      setAttachmentFiles(prev => [...prev, name]);
      alert(`Successfully uploaded ${name}! Affixed to rate sheet parameters.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <button 
            onClick={onBack}
            className="p-2 mt-1 rounded-lg bg-white border border-zentrix-border text-slate-500 hover:bg-slate-50 hover:text-zentrix-blue transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
               <input 
                 type="text"
                 value={raData.code}
                 onChange={(e) => handleUpdateField('code', e.target.value)}
                 className="font-mono font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-[11px] w-28 outline-none focus:ring-1 focus:ring-primary-500 hover:bg-primary-100 transition-colors shrink-0 text-center"
                 placeholder="Code"
               />
               <span className="text-[12px] text-zentrix-muted font-medium truncate">Costing / Builder Worksheet</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <input 
                type="text"
                value={raData.description}
                onChange={(e) => handleUpdateField('description', e.target.value)}
                className="text-lg md:text-xl font-bold text-zentrix-blue leading-tight flex-1 outline-none border-b border-transparent focus:border-slate-200 hover:border-slate-100 py-0.5 transition-all min-w-0"
                placeholder="Description"
              />
              
              <div className="flex items-center gap-2.5">
                {/* Rate Unit */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate Unit</span>
                  <input 
                    type="text"
                    value={raData.unit}
                    onChange={(e) => handleUpdateField('unit', e.target.value)}
                    className="text-[13px] font-black text-primary-600 bg-transparent w-12 outline-none text-center"
                    placeholder="Unit"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <select 
                    value={statusVal}
                    onChange={(e: any) => setStatusVal(e.target.value)}
                    className="text-[12px] font-bold text-primary-600 bg-transparent outline-none cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Revised">Revised</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Enterprise Actions Toolbar bar */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-white border border-zentrix-border p-1.5 rounded-lg shadow-sm flex-1 sm:flex-none justify-center">
             <div className="flex items-center gap-2 px-2 border-r border-slate-100">
                <MapPin size={14} className="text-slate-400" />
                <select 
                  value={regionId}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="text-[12px] font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
                >
                  {MOCK_REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
             </div>
             <div className="flex items-center gap-2 px-2">
                <Calendar size={14} className="text-slate-400" />
                <select 
                  value={periodId}
                  onChange={(e) => onPeriodChange(e.target.value)}
                  className="text-[12px] font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
                >
                  {MOCK_PERIODS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <button 
              onClick={() => onDelete(raData.id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-white border border-red-200 px-3.5 py-2.25 rounded-lg text-xs font-bold text-red-600 hover:bg-slate-50 transition-colors cursor-pointer leading-none"
            >
              <Trash2 size={13} /> Delete
            </button>
            <button 
              onClick={() => onSave(ra)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-primary-605 bg-primary-600 text-white px-4 py-2.25 rounded-lg text-xs font-black shadow-md cursor-pointer leading-none hover:bg-primary-700 transition"
            >
              <Save size={13} /> Save Workbook
            </button>
          </div>
        </div>
      </div>

      {/* CORE BUILDER BODY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Main calculation sheet */}
        <div className="lg:col-span-3 bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[480px]">
          
          <div>
            <div className="h-12 border-b border-zentrix-border flex items-center justify-between px-4 bg-white sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zentrix-blue">Worksheet Line Items Composition ({ra.resources.length})</span>
              </div>
              <div className="shrink-0">
                <ResourceSelector onSelect={handleAddResource} resources={resources} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-55/40 bg-slate-50 text-[10px] font-extrabold uppercase text-zentrix-muted border-b border-zentrix-border">
                    <th className="px-5 py-3 w-16">Reorder</th>
                    <th className="px-5 py-3">Resource Specs</th>
                    <th className="px-5 py-3 w-28 text-center">Type</th>
                    <th className="px-5 py-3 w-24 text-right">Coefficient Qty</th>
                    <th className="px-5 py-3 w-24 text-right">Prod. Factor</th>
                    <th className="px-5 py-3 w-24 text-right">Waste %</th>
                    <th className="px-5 py-3 w-16 text-center">Unit</th>
                    <th className="px-5 py-3 w-28 text-right">Rate</th>
                    <th className="px-5 py-3 w-32 text-right">Aggregate Amount</th>
                    <th className="px-5 py-3 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ra.resources.map((res, i) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                      
                      {/* Interactive Reordering */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button 
                            disabled={i === 0}
                            onClick={() => handleMoveResource(i, 'up')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button 
                            disabled={i === ra.resources.length - 1}
                            onClick={() => handleMoveResource(i, 'down')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Info name */}
                      <td className="px-5 py-3 font-bold text-zentrix-blue">
                        <div>
                          <span>{res.resourceName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{res.resourceId}</span>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="px-5 py-3 text-center">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider leading-none",
                          res.resourceType === ResourceType.MATERIAL ? "bg-blue-50 text-blue-600 border border-blue-105" :
                          res.resourceType === ResourceType.LABOR ? "bg-orange-50 text-orange-600 border border-orange-105" :
                          "bg-purple-50 text-purple-600 border border-purple-105"
                        )}>
                          {res.resourceType}
                        </span>
                      </td>

                      {/* Qty field */}
                      <td className="px-5 py-3 text-right">
                        <input 
                          type="number" 
                          value={res.quantity}
                          onChange={(e) => handleUpdateResource(res.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded px-2 py-1 text-[12px] text-right focus:outline-none font-mono font-bold"
                        />
                      </td>

                      {/* Prod Factor */}
                      <td className="px-5 py-3 text-right">
                        <input 
                          type="number" 
                          value={res.productivityFactor ?? 1}
                          step="0.01"
                          onChange={(e) => handleUpdateResource(res.id, 'productivityFactor', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded px-2 py-1 text-[12px] text-right focus:outline-none font-mono"
                        />
                      </td>

                      {/* Waste factor */}
                      <td className="px-5 py-3 text-right">
                        {res.resourceType === ResourceType.MATERIAL ? (
                          <div className="flex items-center justify-end gap-1">
                            <input 
                              type="number" 
                              value={(res.wasteFactor ?? 0) * 100}
                              onChange={(e) => handleUpdateResource(res.id, 'wasteFactor', (parseFloat(e.target.value) || 0) / 100)}
                              className="w-12 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded px-2 py-1 text-[12px] text-right focus:outline-none font-mono"
                            />
                            <span className="text-[10px] text-zinc-400">%</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="px-5 py-3 text-center text-slate-500 font-bold font-mono">
                        {res.unit}
                      </td>

                      {/* Rate */}
                      <td className="px-5 py-3 text-right font-mono font-bold text-slate-400">
                        {formatCurrency(res.rate)}
                      </td>

                      {/* Aggregate amount */}
                      <td className="px-5 py-3 text-right font-semibold font-mono text-zentrix-blue">
                        {formatCurrency(res.amount)}
                      </td>

                      {/* Duplicate & trash buttons */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 bg-white">
                          <button 
                            onClick={() => handleDuplicateResource(res.id)}
                            className="p-1 hover:bg-slate-100 text-slate-300 hover:text-primary-600 rounded cursor-pointer"
                            title="Duplicate ROW"
                          >
                            <Copy size={12} />
                          </button>
                          <button 
                            onClick={() => handleRemoveResource(res.id)}
                            className="p-1 hover:bg-slate-100 text-slate-300 hover:text-red-500 rounded cursor-pointer"
                            title="Trash line item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                  {ra.resources.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-slate-450 italic">
                        Empty sheet. Add master resources lines by clicking "+ Add Line" at the top right.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Bottom consolidated total summary */}
          <div className="p-4 bg-slate-900 border-t border-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 mt-auto">
            <div className="flex gap-8 text-[11px] font-mono leading-none">
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest">Material Subtotal</span>
                <p className="text-sm font-bold text-sky-400">{formatCurrency(ra.totalMaterialCost)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest">Labor Subtotal</span>
                <p className="text-sm font-bold text-orange-400">{formatCurrency(ra.totalLaborCost)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest">Equipment Subtotal</span>
                <p className="text-sm font-bold text-purple-400">{formatCurrency(ra.totalEquipmentCost)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">Certified Net Unit Rate</span>
                <h3 className="text-xl md:text-2xl font-black text-[#10B981] font-mono leading-none mt-1">{formatCurrency(ra.finalRate)}</h3>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          
          {/* Classification block */}
          <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F97316] block border-b border-dashed border-slate-100 pb-2">Primary Classification</span>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">CATEGORY MATCH</label>
              <select 
                value={raData.categoryId || ''}
                onChange={(e) => handleUpdateField('categoryId', e.target.value)}
                className="w-full text-xs font-bold text-zentrix-blue bg-slate-50 border border-slate-100 p-2 rounded-lg outline-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.filter(c => !c.parentId && c.id !== 'all').map(parentCat => {
                  const subCats = categories.filter(sub => sub.parentId === parentCat.id);
                  return (
                    <React.Fragment key={parentCat.id}>
                      <option value={parentCat.id} className="font-bold">{parentCat.label}</option>
                      {subCats.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          &nbsp;&nbsp;{sub.label}
                        </option>
                      ))}
                    </React.Fragment>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Markups Block */}
          <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2563EB] block border-b border-dashed border-slate-100 pb-2">Legal Overhead & Markups</span>
            
            <div className="space-y-3.5">
              
              {/* Overhead ratio */}
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase leading-none">
                    <span>Overhead Allowance</span>
                    <span className="text-zentrix-blue font-mono font-bold">{formatCurrency((ra.subtotal * raData.overheadPercentage) / 100)}</span>
                 </div>
                 <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1.5 pr-2">
                    <input 
                      type="number" 
                      value={raData.overheadPercentage}
                      onChange={(e) => handleUpdateField('overheadPercentage', parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none text-right"
                    />
                    <span className="text-zinc-400 font-bold">%</span>
                 </div>
              </div>

              {/* Profits ratio */}
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase leading-none">
                    <span>Profit Margin</span>
                    <span className="text-zentrix-blue font-mono font-bold">{formatCurrency((ra.subtotal * raData.profitPercentage) / 100)}</span>
                 </div>
                 <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1.5 pr-2">
                    <input 
                      type="number" 
                      value={raData.profitPercentage}
                      onChange={(e) => handleUpdateField('profitPercentage', parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none text-right"
                    />
                    <span className="text-zinc-400 font-bold">%</span>
                 </div>
              </div>

              {/* VAT ratio */}
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase leading-none">
                    <span>Tax compliance</span>
                    <span className="text-zentrix-blue font-mono font-bold">{formatCurrency((ra.subtotal * raData.taxPercentage) / 100)}</span>
                 </div>
                 <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1.5 pr-2">
                    <input 
                      type="number" 
                      value={raData.taxPercentage}
                      onChange={(e) => handleUpdateField('taxPercentage', parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none text-right"
                    />
                    <span className="text-zinc-400 font-bold">%</span>
                 </div>
              </div>

            </div>
          </div>

          {/* Remarks, notes and custom attachments panel */}
          <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#10B981] block border-b border-dashed border-slate-100 pb-2 font-black">Audit Remarks & Compliance Attachments</span>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block mb-0.5">ESTIMATOR REMARKS</span>
                <textarea 
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Insert notes regarding labor rates index, region fluctuations, etc."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 text-slate-705 text-slate-700 font-medium font-sans"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold block">ATTACHED SUPPORT FILES ({attachmentFiles.length})</span>
                <ul className="space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-2 shadow-inner">
                  {attachmentFiles.map((file, idx) => (
                    <li key={idx} className="flex justify-between items-center text-[11px] leading-tight text-slate-600 font-medium">
                      <span className="truncate max-w-[170px]" title={file}>{file}</span>
                      <button 
                        onClick={() => setAttachmentFiles(prev => prev.filter(f => f !== file))}
                        className="text-red-500 hover:underline hover:text-red-600 font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                
                <input 
                  id="form-attachment-input"
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="form-attachment-input" 
                  className="w-full py-1.75 border border-dashed border-slate-200 hover:border-slate-355 rounded-lg font-extrabold text-[10.5px] cursor-pointer flex items-center justify-center gap-1.2 bg-white text-slate-655 hover:bg-slate-50"
                >
                  <Upload size={12} className="text-primary-600" /> Affix File Parameters
                </label>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

// Resource Selector Component for adding lines
const ResourceSelector = ({ onSelect, resources }: { onSelect: (resource: any) => void, resources: Resource[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs leading-none cursor-pointer"
      >
        <Plus size={14} /> Add Resource Line Row
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white border border-zentrix-border rounded-xl shadow-xl z-40 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-primary-500 shadow-sm font-semibold"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                {filteredResources.map(res => (
                  <button
                    key={res.id}
                    onClick={() => {
                      onSelect(res);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-bold text-zentrix-blue group-hover:text-primary-600 truncate mr-2">{res.name}</span>
                      <span className="text-[9px] font-bold text-primary-500 uppercase shrink-0">{res.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-mono text-slate-400 font-bold">{res.code}</span>
                       <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold">{res.type}</span>
                    </div>
                  </button>
                ))}
                {filteredResources.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-[12px] italic">
                    No resources found matching "{search}"
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
