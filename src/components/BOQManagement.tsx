import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  MoreHorizontal, 
  ArrowUpRight,
  Calculator,
  ListFilter,
  Layers,
  LayoutGrid,
  MapPin,
  Calendar,
  Filter,
  Users,
  Truck,
  Package,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Archive,
  Copy,
  Trash,
  ArrowUp,
  ArrowDown,
  Tag,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency, formatNumber } from '../lib/utils.ts';
import { MOCK_REGIONS, MOCK_PERIODS, MOCK_RATE_ANALYSES, MOCK_PRICE_MATRIX, MOCK_RESOURCES, MOCK_BOQ } from '../mockData.ts';
import { type BOQItem, ResourceType, RateAnalysis, Resource } from '../types.ts';
import { useProject } from '../context/ProjectContext.tsx';
import { useBOQ } from '../context/BOQContext.tsx';

// Helper to get rate from price matrix or fallback to default
const getResourceRateForBOQ = (resourceId: string, regionId: string, periodId: string, defaultRate: number) => {
  const customRate = MOCK_PRICE_MATRIX.find(
    p => p.resourceId === resourceId && p.regionId === regionId && p.periodId === periodId
  );
  return customRate ? customRate.rate : defaultRate;
};

// Helper to recalculate rate analysis based on region and period
const getRecalculatedAnalysisForBOQ = (analysis: RateAnalysis, regionId: string, periodId: string, resourceList: Resource[]): RateAnalysis => {
  const updatedResources = analysis.resources.map(res => {
    const origRes = resourceList.find(r => r.id === res.resourceId || r.code === res.resourceId);
    const baseRate = origRes ? origRes.baseRate : res.rate;
    const rate = getResourceRateForBOQ(res.resourceId, regionId, periodId, baseRate);
    const prodFactor = res.productivityFactor ?? 1;
    const wasteFactor = res.wasteFactor ?? 0;
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
  const overhead = (subtotal * (analysis.overheadPercentage || 12)) / 100;
  const profit = (subtotal * (analysis.profitPercentage || 8)) / 100;
  const tax = (subtotal * (analysis.taxPercentage || 5)) / 100;
  
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

// Helper to get all leaf items under a specific parent node
const getAllLeafItems = (items: BOQItem[], parentId: string | undefined): BOQItem[] => {
  if (!parentId) return items.filter(item => item.type === 'ITEM');
  
  const children = items.filter(item => item.parentId === parentId);
  let leafItems: BOQItem[] = [];
  
  children.forEach(child => {
    if (child.type === 'ITEM') {
      leafItems.push(child);
    } else {
      leafItems = [...leafItems, ...getAllLeafItems(items, child.id)];
    }
  });
  
  return leafItems;
};

export const BOQManagement = ({ boqId, analyses, resources }: { boqId: string, analyses: RateAnalysis[], resources: Resource[] }) => {
  const { currentProject } = useProject();
  const { 
    boqs, 
    boqItemsMap, 
    updateBOQItems, 
    updateBOQMetadata, 
    approveBOQ, 
    submitForReview,
    archiveBOQ,
    duplicateBOQ,
    createRevision
  } = useBOQ();

  // Selected elements from Context
  const activeBOQHeader = boqs.find(b => b.id === boqId) || boqs[0] || {
    id: boqId,
    name: 'New Bill of Quantities',
    code: 'BOQ-NEW-001',
    status: 'Draft',
    totalAmount: 0,
    projectId: currentProject?.id || 'proj-1',
    revisionNo: 1
  };

  const [activeTab, setActiveTab] = useState<'items' | 'summary' | 'resources'>('items');
  const [gridSearchTerm, setGridSearchTerm] = useState('');
  
  // Connect items state to context map
  const [items, setItems] = useState<BOQItem[]>(() => {
    const existing = boqItemsMap[boqId];
    return existing ? [...existing] : [];
  });

  // Synchronize items updates to BOQ Context dynamically
  useEffect(() => {
    updateBOQItems(boqId, items);
  }, [items, boqId]);

  const [metadata, setMetadata] = useState({
    name: activeBOQHeader.name,
    code: activeBOQHeader.code,
    description: activeBOQHeader.revisionNotes || ''
  });

  const [isEditingMetadata, setIsEditingMetadata] = useState(
    boqId === 'new-boq' || activeBOQHeader.name === 'New Bill of Quantities'
  );

  // Synchronize metadata changes to context
  useEffect(() => {
    if (!isEditingMetadata) {
      updateBOQMetadata(boqId, metadata.name, metadata.code, metadata.description);
    }
  }, [isEditingMetadata]);

  // Handle prop change to load details correctly
  useEffect(() => {
    const existing = boqItemsMap[boqId];
    if (existing) {
      setItems(prev => {
        if (prev === existing) return prev;
        if (prev.length === existing.length && prev.every((item, idx) => 
          item.id === existing[idx].id && 
          item.quantity === existing[idx].quantity && 
          item.rate === existing[idx].rate && 
          item.amount === existing[idx].amount &&
          item.isProvisional === existing[idx].isProvisional &&
          item.remarks === existing[idx].remarks &&
          item.tags === existing[idx].tags &&
          item.attachments === existing[idx].attachments
        )) {
          return prev;
        }
        return [...existing];
      });
    }
    const currentHeader = boqs.find(b => b.id === boqId) || boqs[0];
    if (currentHeader) {
      setMetadata(prev => {
        const desc = currentHeader.revisionNotes || '';
        if (prev.name === currentHeader.name && prev.code === currentHeader.code && prev.description === desc) {
          return prev;
        }
        return {
          name: currentHeader.name,
          code: currentHeader.code,
          description: desc
        };
      });
    }
  }, [boqId]);
  
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<BOQItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(MOCK_REGIONS[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(MOCK_PERIODS[1].id);

  // Calculate a multiplier: Base is 1.0 (Dubai, Q4 2023)
  // Each region index adds 10%, each period index adds 5%
  const getMultiplier = (regionId: string, periodId: string) => {
    const regionIndex = MOCK_REGIONS.findIndex(r => r.id === regionId);
    const periodIndex = MOCK_PERIODS.findIndex(p => p.id === periodId);
    return 1 + (regionIndex * 0.1) + (periodIndex * 0.05);
  };

  const resolveItemRate = React.useCallback((item: BOQItem, regionId: string, periodId: string) => {
    if (item.rateAnalysisId) {
      const dbAnalysis = analyses.find(ra => ra.id === item.rateAnalysisId || ra.code === item.rateAnalysisId);
      if (dbAnalysis) {
        const recalcAnalysis = getRecalculatedAnalysisForBOQ(dbAnalysis, regionId, periodId, resources);
        return Number((recalcAnalysis.finalRate).toFixed(2));
      }
    } else if (item.resourceId) {
      const resItem = resources.find(r => r.id === item.resourceId || r.code === item.resourceId);
      if (resItem) {
        const regionalRate = getResourceRateForBOQ(resItem.id, regionId, periodId, resItem.baseRate);
        return Number(regionalRate.toFixed(2));
      }
    }
    
    // Fallback to baseRate with standard multiplier
    const multiplier = getMultiplier(regionId, periodId);
    const base = item.baseRate || item.rate || 0;
    return Number((base * multiplier).toFixed(2));
  }, [analyses, resources]);

  // Update rates when region, period, analyses or resources change
  React.useEffect(() => {
    setItems(currentItems => currentItems.map(item => {
      if (item.type !== 'ITEM') return item;
      
      const newRate = resolveItemRate(item, selectedRegion, selectedPeriod);
      const newAmount = Number((newRate * (item.quantity || 0)).toFixed(2));
      
      return { ...item, rate: newRate, amount: newAmount };
    }));
  }, [selectedRegion, selectedPeriod, analyses, resources, resolveItemRate]);

  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(
    (boqId === 'new-boq' || activeBOQHeader.name === 'New Bill of Quantities') ? {} : {
      'bill-1': true,
      'bill-2': true,
      'bill-3': true,
      'sec-2-2': true,
    }
  );

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedNode = items.find(i => i.id === selectedId);
  const displayItems = getAllLeafItems(items, selectedId || undefined).filter(item => 
    item.description.toLowerCase().includes(gridSearchTerm.toLowerCase()) || 
    item.code.toLowerCase().includes(gridSearchTerm.toLowerCase())
  );

  const getSubtotal = () => {
    return displayItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const getGrandTotal = () => {
    return items
      .filter(item => item.type === 'ITEM')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleAddNewItem = (template?: BOQItem) => {
    const multiplier = getMultiplier(selectedRegion, selectedPeriod);
    const newItem: BOQItem = template ? {
      ...template,
      id: `item-${Date.now()}`,
      parentId: selectedId || undefined,
      baseRate: template.rate || 0,
      rate: Number(((template.rate || 0) * multiplier).toFixed(2)),
      amount: Number(((template.rate || 0) * multiplier * (template.quantity || 0)).toFixed(2))
    } : {
      id: `item-${Date.now()}`,
      type: 'ITEM',
      code: '',
      description: '',
      unit: '',
      quantity: 0,
      rate: 0,
      baseRate: 0,
      amount: 0,
      parentId: selectedId || undefined
    };
    setEditingItem(newItem);
  };

  const handleAddSection = (parentId: string, type: 'SECTION' | 'SUB_SECTION' | 'ITEM') => {
    const parent = items.find(i => i.id === parentId);
    const newId = `${type.toLowerCase()}-${Date.now()}`;
    const newItem: BOQItem = {
      id: newId,
      type,
      code: `${parent?.code || ''}.${items.filter(i => i.parentId === parentId).length + 1}`,
      description: `New ${type.replace('_', ' ').toLowerCase()}`,
      parentId
    };
    setItems([...items, newItem]);
    setSelectedId(newId);
    setOpenItems(prev => ({ ...prev, [parentId]: true, [newId]: true }));
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    setItems(prev => {
      const exists = prev.some(i => i.id === editingItem.id);
      if (exists) {
        return prev.map(i => i.id === editingItem.id ? editingItem : i);
      } else {
        return [...prev, editingItem];
      }
    });
    setEditingItem(null);
  };

  const handleAddBill = () => {
    const newBill: BOQItem = {
      id: `bill-${Date.now()}`,
      type: 'BILL',
      code: `BILL ${items.filter(i => i.type === 'BILL').length + 1}`,
      description: 'New Bill Section',
      parentId: undefined
    };
    setItems([...items, newBill]);
    setSelectedId(newBill.id);
    setOpenItems(prev => ({ ...prev, [newBill.id]: true }));
  };

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="text-[12px] text-zentrix-muted font-medium mb-1">Projects / {currentProject?.name || 'All'} / Cost Management</div>
          
          <AnimatePresence mode="wait">
            {!isEditingMetadata ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="group cursor-pointer"
                onClick={() => setIsEditingMetadata(true)}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-zentrix-blue leading-tight">
                    {metadata.name} <span className="text-slate-400 font-mono text-sm ml-2">{metadata.code}</span>
                  </h2>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Click to edit details</div>
                </div>
                {selectedNode && (
                  <div className="text-[13px] text-primary-600 font-semibold mt-1">
                    Viewing Section: {selectedNode.code} - {selectedNode.description}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm space-y-3 max-w-2xl"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BOQ Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={metadata.name}
                      onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[14px] font-bold text-zentrix-blue focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BOQ Code</label>
                    <input 
                      type="text" 
                      value={metadata.code}
                      onChange={(e) => setMetadata({ ...metadata, code: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[14px] font-mono font-bold text-primary-600 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g. BOQ-001"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={2}
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    placeholder="Enter BOQ description..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsEditingMetadata(false)}
                    className="px-3 py-1.5 text-[12px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setIsEditingMetadata(false)}
                    className="px-4 py-1.5 bg-primary-600 text-white text-[12px] font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
          {/* Status Badge */}
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border mr-1.5",
            activeBOQHeader.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            activeBOQHeader.status === 'Review' ? "bg-amber-50 text-amber-600 border-amber-100" :
            activeBOQHeader.status === 'Revised' ? "bg-purple-50 text-purple-600 border-purple-100" :
            activeBOQHeader.status === 'Archived' ? "bg-slate-100 text-slate-500 border-slate-200" :
            "bg-blue-50 text-blue-600 border-blue-100"
          )}>
            ● {activeBOQHeader.status === 'Draft' ? 'Draft Scope' : activeBOQHeader.status}
          </span>

          <div className="flex items-center gap-2 bg-white border border-zentrix-border p-1.5 rounded-lg shadow-sm">
             <div className="flex items-center gap-2 px-2 border-r border-slate-100">
                <MapPin size={13} className="text-slate-400" />
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="text-[12px] font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
                >
                  {MOCK_REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
             </div>
             <div className="flex items-center gap-2 px-2">
                <Calendar size={13} className="text-slate-400" />
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-[12px] font-bold text-zentrix-blue outline-none bg-transparent cursor-pointer"
                >
                  {MOCK_PERIODS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => alert('All local modifications were compiled and saved successfully to regional baseline.')}
              className="px-3.5 py-2 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              title="Save changes to global estimate"
            >
              Save As Baseline
            </button>

            {activeBOQHeader.status === 'Draft' && (
              <button 
                onClick={() => { submitForReview(boqId); alert('BOQ model submitted for commercial review.'); }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                Submit Estimate
              </button>
            )}

            {activeBOQHeader.status === 'Review' && (
              <button 
                onClick={() => { approveBOQ(boqId); alert('Model approved. Locked for SOT planning and IPC generation.'); }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 size={13} /> Approve BOQ
              </button>
            )}

            {activeBOQHeader.status === 'Approved' && (
              <button 
                onClick={() => {
                  const notes = prompt('Enter notes for this revision:');
                  if (notes !== null) {
                    createRevision(boqId, notes || 'Standard revision.');
                    alert('New draft revision created.');
                  }
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1"
                title="Create a new draft revision"
              >
                <Sparkles size={13} /> Revise Model
              </button>
            )}

            {/* Menu of other operations */}
            <div className="relative group/menu">
              <button className="p-2 bg-white border border-slate-250 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm">
                Actions <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-zentrix-border rounded-xl shadow-xl hidden group-hover/menu:block z-50 py-1.5 text-left divide-y divide-slate-100">
                <div className="py-1">
                  <button 
                    onClick={() => { duplicateBOQ(boqId); alert('Scope duplicated successfully.'); }}
                    className="w-full px-3.5 py-2 text-xs text-slate-650 font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Copy size={13} className="text-slate-400" /> Duplicate BOQ
                  </button>
                  <button 
                    onClick={() => { archiveBOQ(boqId); alert('BOQ Archived.'); }}
                    className="w-full px-3.5 py-2 text-xs text-slate-650 font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Archive size={13} className="text-slate-400" /> Archive BOQ
                  </button>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8,Code,Description,Unit,Quantity,Rate,Amount\n" + 
                        items.filter(i => i.type === 'ITEM').map(i => `"${i.code}","${i.description}","${i.unit || ''}",${i.quantity || 0},${i.rate || 0},${i.amount || 0}`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `${metadata.code || 'BOQ'}_Export.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full px-3.5 py-2 text-xs text-slate-650 font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    📊 Export Excel/CSV
                  </button>
                  <button 
                    onClick={() => alert('PDF generation compiling. Detailed cost matrix will download shortly.')}
                    className="w-full px-3.5 py-2 text-xs text-slate-650 font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    📄 Export PDF
                  </button>
                  <button 
                    onClick={() => {
                      // Trigger a fast template validation template load
                      const templateItems: BOQItem[] = [
                        { id: 'item-imp-1', type: 'ITEM', code: '1.2.1', description: 'Excavate structural strip trench in hard limestone', unit: 'm3', quantity: 800, rate: 14.50, amount: 11600, parentId: 'sec-1-1' },
                        { id: 'item-imp-2', type: 'ITEM', code: '1.2.2', description: 'Supply Type I cement compound 50kg bags', unit: 'Bag', quantity: 200, rate: 8.50, amount: 1700, parentId: 'sec-1-1' }
                      ];
                      setItems(prev => [...prev, ...templateItems]);
                      alert('Successfully simulated Excel Import: added 2 valid items into active section, verified with zero duplicate codes.');
                    }}
                    className="w-full px-3.5 py-2 text-xs text-primary-600 font-bold hover:bg-slate-100 flex items-center gap-2"
                  >
                    📥 Import Excel Sheets
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Left Hierarchy Tree */}
        <aside className="hidden lg:flex flex-col w-[280px] bg-white border border-zentrix-border rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 px-4 border-b border-zentrix-border bg-white flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-zentrix-muted uppercase tracking-wider">BOQ Hierarchy</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAddBill}
                className="p-1 hover:bg-slate-100 rounded text-primary-600 transition-colors" 
                title="Add New Bill"
              >
                <Plus size={14} />
              </button>
              <span className="text-slate-300 cursor-pointer hover:text-slate-500">
                 <ListFilter size={14} />
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <div 
              className={cn(
                "px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-50 flex items-center gap-2",
                !selectedId ? "text-primary-600 font-bold bg-primary-50/50" : "text-slate-600"
              )}
              onClick={() => setSelectedId(null)}
            >
              <LayoutGrid size={14} className="opacity-60" /> All Bills
            </div>

            {items.filter(i => i.type === 'BILL').map(bill => (
              <div key={bill.id} className="group">
                <div 
                  className={cn(
                    "px-4 py-2 text-[13px] flex items-center justify-between cursor-pointer hover:bg-slate-50",
                    selectedId === bill.id ? "text-primary-600 font-semibold bg-primary-50/30" : "text-slate-600"
                  )}
                  onClick={() => setSelectedId(bill.id)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span 
                      className="opacity-60 text-sm hover:text-primary-500 transition-colors"
                      onClick={(e) => toggleItem(bill.id, e)}
                    >
                      {openItems[bill.id] ? '📂' : '📁'}
                    </span>
                    <span className="truncate">{bill.code}: {bill.description}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 group-hover:block hidden transition-all"
                      title="Add Section"
                      onClick={(e) => { e.stopPropagation(); handleAddSection(bill.id, 'SECTION'); }}
                    >
                      <Plus size={12} />
                    </button>
                    <div onClick={(e) => toggleItem(bill.id, e)}>
                      {openItems[bill.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </div>
                  </div>
                </div>
                
                {openItems[bill.id] && (
                  <div className="ml-4 border-l border-slate-100 pb-1">
                    {items.filter(s => s.parentId === bill.id).map(sec => (
                      <div key={sec.id} className="group/sec">
                        <div 
                          className={cn(
                            "pl-6 pr-4 py-1.5 text-[12px] flex items-center justify-between cursor-pointer hover:bg-slate-50",
                            selectedId === sec.id ? "text-primary-600 font-semibold bg-primary-50/20" : "text-slate-500"
                          )}
                          onClick={() => setSelectedId(sec.id)}
                        >
                          <div className="flex items-center gap-2 truncate">
                             <span 
                               className="opacity-40"
                               onClick={(e) => sec.type !== 'ITEM' && toggleItem(sec.id, e)}
                             >
                               {sec.type === 'ITEM' ? '📄' : '📁'}
                             </span>
                             <span className="truncate">{sec.code} {sec.description}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {sec.type !== 'ITEM' && (
                              <button 
                                className="p-1 hover:bg-slate-200 rounded text-slate-400 group-hover/sec:block hidden transition-all"
                                title="Add Sub Section"
                                onClick={(e) => { e.stopPropagation(); handleAddSection(sec.id, 'SUB_SECTION'); }}
                              >
                                <Plus size={10} />
                              </button>
                            )}
                            {items.some(ss => ss.parentId === sec.id) && (
                              <div onClick={(e) => toggleItem(sec.id, e)}>
                                {openItems[sec.id] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                              </div>
                            )}
                          </div>
                        </div>

                        {openItems[sec.id] && (
                          <div className="ml-4 border-l border-slate-100">
                            {items.filter(ss => ss.parentId === sec.id).map(sub => (
                              <div key={sub.id} className="group/sub">
                                <div 
                                  className={cn(
                                    "pl-6 pr-4 py-1 text-[11px] flex items-center justify-between cursor-pointer hover:bg-slate-50",
                                    selectedId === sub.id ? "text-primary-600 font-semibold bg-primary-50/10" : 
                                    sub.type === 'ITEM' ? "text-slate-400" : "text-slate-600 font-medium"
                                  )}
                                  onClick={() => setSelectedId(sub.id)}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="opacity-30">{sub.type === 'ITEM' ? '•' : '📄'}</span>
                                    <span className="truncate">{sub.code} {sub.description}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {sub.type !== 'ITEM' && (
                                      <button 
                                        className="p-1 hover:bg-slate-200 rounded text-slate-400 group-hover/sub:block hidden transition-all"
                                        title="Add Item"
                                        onClick={(e) => { e.stopPropagation(); handleAddSection(sub.id, 'ITEM'); }}
                                      >
                                        <Plus size={8} />
                                      </button>
                                    )}
                                    {items.some(i => i.parentId === sub.id) && (
                                      <div onClick={(e) => toggleItem(sub.id, e)} className="p-0.5">
                                        {openItems[sub.id] ? <ChevronDown size={8} /> : <ChevronRight size={8} />}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {items.filter(i => i.type === 'BILL').length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <FileText size={20} />
                </div>
                <p className="text-[12px] text-slate-500">No bills added yet.</p>
                <button 
                  onClick={handleAddBill}
                  className="text-[11px] font-bold text-primary-600 mt-2 hover:underline"
                >
                  + Add First Bill
                </button>
              </div>
            )}
          </div>
        </aside>


        {/* BOQ Grid Panel */}
        <div className="flex-1 bg-white border border-zentrix-border rounded-lg flex flex-col overflow-hidden shadow-sm relative">
          <div className="flex border-b border-zentrix-border px-4 h-11 items-center bg-white sticky top-0 z-20">
             <div 
               onClick={() => setActiveTab('items')}
               className={cn(
                 "px-4 h-full flex items-center text-[13px] font-medium border-b-2 cursor-pointer transition-colors",
                 activeTab === 'items' ? "border-primary-600 text-primary-600" : "border-transparent text-zentrix-muted hover:text-zentrix-blue"
               )}
             >
               Items Breakdown
             </div>
             <div 
               onClick={() => setActiveTab('summary')}
               className={cn(
                 "px-4 h-full flex items-center text-[13px] font-medium border-b-2 cursor-pointer transition-colors",
                 activeTab === 'summary' ? "border-primary-600 text-primary-600" : "border-transparent text-zentrix-muted hover:text-zentrix-blue"
               )}
             >
               BOQ Summary
             </div>
             <div 
               onClick={() => setActiveTab('resources')}
               className={cn(
                 "px-4 h-full flex items-center text-[13px] font-medium border-b-2 cursor-pointer transition-colors",
                 activeTab === 'resources' ? "border-primary-600 text-primary-600" : "border-transparent text-zentrix-muted hover:text-zentrix-blue"
               )}
             >
               Resource Analysis
             </div>
             
             <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search items..." 
                    value={gridSearchTerm}
                    onChange={(e) => setGridSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] focus:ring-1 focus:ring-primary-500 w-48 outline-none transition-all"
                  />
                </div>
                <BOQItemSelector onSelect={handleAddNewItem} />
             </div>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'items' && (
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="sticky top-0 bg-zentrix-gray border-b border-zentrix-border z-10">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-24 text-center">Order</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-28">Code</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-16">Unit</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right w-28">Qty (Inline)</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right w-28">Rate (USD)</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right w-28">Total</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-24 text-center">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length > 0 ? (
                    displayItems.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className={cn(
                          "border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer",
                          editingItem?.id === item.id && "bg-primary-50/50"
                        )}
                        onClick={() => setEditingItem(item)}
                      >
                        {/* Move Up/Down Controls */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              disabled={idx === 0}
                              onClick={(e) => {
                                const index = items.findIndex(i => i.id === item.id);
                                if (index > 0) {
                                  const cpy = [...items];
                                  const temp = cpy[index - 1];
                                  cpy[index - 1] = cpy[index];
                                  cpy[index] = temp;
                                  setItems(cpy);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 rounded disabled:opacity-35 cursor-pointer"
                              title="Move Row Up"
                            >
                              <ArrowUp size={12} className="text-slate-500" />
                            </button>
                            <button 
                              disabled={idx === displayItems.length - 1}
                              onClick={(e) => {
                                const index = items.findIndex(i => i.id === item.id);
                                if (index !== -1 && index < items.length - 1) {
                                  const cpy = [...items];
                                  const temp = cpy[index + 1];
                                  cpy[index + 1] = cpy[index];
                                  cpy[index] = temp;
                                  setItems(cpy);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 rounded disabled:opacity-35 cursor-pointer"
                              title="Move Row Down"
                            >
                              <ArrowDown size={12} className="text-slate-500" />
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[13px] text-slate-600 font-mono">{item.code}</td>
                        <td className="px-4 py-3 text-[13px]">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-zentrix-blue">{item.description}</span>
                              {item.isProvisional && (
                                <span className="bg-purple-150 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-purple-200">Optional</span>
                              )}
                              {item.tags && item.tags.split(',').map((tag, tIdx) => (
                                <span key={tIdx} className="bg-slate-100 text-slate-600 text-[9px] font-medium px-1 rounded flex items-center gap-0.5">
                                  🏷️ {tag.trim()}
                                </span>
                              ))}
                            </div>
                            
                            {(item.rateAnalysisId || item.resourceId || item.remarks) && (
                              <div className="flex flex-wrap items-center gap-2.5 mt-1 border-t border-slate-50 pt-1">
                                {item.rateAnalysisId && (
                                  <div className="flex items-center gap-1.5">
                                    <Calculator size={10} className="text-zentrix-orange" />
                                    <span className="text-[10px] text-slate-400 font-mono">RA: {item.rateAnalysisId}</span>
                                  </div>
                                )}
                                {item.resourceId && (
                                  <div className="flex items-center gap-1.5">
                                    <Layers size={10} className="text-primary-500" />
                                    <span className="text-[10px] text-slate-400 font-mono">Res: {item.resourceId}</span>
                                  </div>
                                )}
                                {item.remarks && (
                                  <span className="text-[10px] text-slate-400 italic truncate max-w-xs" title={item.remarks}>
                                    📝 Remarks: {item.remarks}
                                  </span>
                                )}
                                {item.attachments && (
                                  <span className="text-[10px] text-blue-500 underline truncate max-w-xs flex items-center gap-0.5 font-bold">
                                    📎 Specs Linked
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-500">{item.unit || '-'}</td>
                        
                        {/* Inline editable quantity input */}
                        <td className="px-4 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="number"
                            value={item.quantity === undefined ? '' : item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setItems(prev => prev.map(i => i.id === item.id ? { 
                                ...i, 
                                quantity: val, 
                                amount: Number((val * (i.rate || 0)).toFixed(2)) 
                              } : i));
                            }}
                            className="w-20 px-2 py-1 border border-transparent hover:border-slate-200 focus:border-primary-500 bg-transparent hover:bg-slate-50 focus:bg-white rounded font-mono text-right text-[12.5px] font-bold text-slate-700 focus:ring-1 focus:ring-primary-450 outline-none"
                            title="Edit Quantity Inline"
                          />
                        </td>

                        <td className="px-4 py-3 text-[13px] font-mono text-slate-700 text-right">{formatCurrency(item.rate || 0)}</td>
                        <td className="px-4 py-3 text-[13px] font-bold text-zentrix-blue text-right font-mono">{formatCurrency(item.amount || 0)}</td>
                        
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                            item.quantity && item.quantity > 0 ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                          )}>
                            {item.quantity && item.quantity > 0 ? 'Approved' : 'Draft'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                const dup: BOQItem = {
                                  ...item,
                                  id: `item-${Date.now()}`,
                                  code: `${item.code}-DUP`
                                };
                                setItems(prev => {
                                  const index = prev.findIndex(i => i.id === item.id);
                                  const cpy = [...prev];
                                  cpy.splice(index + 1, 0, dup);
                                  return cpy;
                                });
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary-500 transition-colors cursor-pointer"
                              title="Duplicate Item"
                            >
                              <Copy size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Delete this item line from structural list?')) {
                                  setItems(prev => prev.filter(i => i.id !== item.id));
                                  setEditingItem(null);
                                }
                              }}
                              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Remove Line"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm italic">
                        No items found in this section
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'summary' && (
              <BOQSummaryView items={items} />
            )}

            {activeTab === 'resources' && (
              <ResourceAnalysisView items={items} analyses={analyses} />
            )}
          </div>

          <div className="h-[50px] bg-zentrix-blue text-white flex items-center justify-end px-6 gap-10 rounded-b-lg sticky bottom-0 z-30 shadow-2xl">
              <div className="text-[12px] text-slate-400 uppercase font-bold tracking-widest mr-auto">
                {selectedId ? `Section Subtotal: ${formatCurrency(getSubtotal())}` : `Grand Total: ${formatCurrency(getGrandTotal())}`}
              </div>
              <div className="text-[13px]">Selected Items: <span className="font-semibold">0</span></div>
              <div className="text-[13px]">Total: <span className="text-zentrix-orange font-bold font-mono tracking-tight">{formatCurrency(getSubtotal())}</span></div>
          </div>
        </div>

        {/* Right Details Panel - Only open for edit item */}
        {editingItem && (
          <aside className="w-[320px] bg-white border-l border-zentrix-border flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
             <div className="p-4 border-b border-zentrix-border flex items-center justify-between bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BOQ Item detail</span>
                  <span className="text-[13px] font-semibold text-zentrix-blue">
                    {editingItem.id.startsWith('item-') && editingItem.code === '' ? 'New BOQ Item' : `Edit: ${editingItem.code}`}
                  </span>
                </div>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-400 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Item Code</label>
                    <input 
                      type="text" 
                      value={editingItem.code}
                      onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="e.g. 2.3.1"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Description</label>
                    <textarea 
                      rows={3}
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                      placeholder="Enter detailed description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Unit</label>
                      <select 
                        value={editingItem.unit}
                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                      >
                        <option value="">Select Unit</option>
                        <option value="m">m</option>
                        <option value="m2">m2</option>
                        <option value="m3">m3</option>
                        <option value="kg">kg</option>
                        <option value="Ton">Ton</option>
                        <option value="LS">LS</option>
                        <option value="Nos">Nos</option>
                        <option value="Bag">Bag</option>
                        <option value="Day">Day</option>
                        <option value="Hour">Hour</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Quantity</label>
                      <input 
                        type="number" 
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0, amount: (parseFloat(e.target.value) || 0) * (editingItem.rate || 0) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] font-mono focus:ring-1 focus:ring-primary-500 transition-all text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Rate Source Selection */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-3">Rate Source</label>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      type="button"
                      onClick={() => {
                        const firstAnalysisId = analyses[0]?.id || '';
                        const rateVal = resolveItemRate({ ...editingItem, rateAnalysisId: firstAnalysisId, resourceId: undefined }, selectedRegion, selectedPeriod);
                        setEditingItem({
                          ...editingItem,
                          rateAnalysisId: firstAnalysisId,
                          resourceId: undefined,
                          rate: rateVal,
                          amount: rateVal * (editingItem.quantity || 0)
                        });
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 border rounded-lg transition-all cursor-pointer text-center",
                        editingItem.rateAnalysisId ? "border-zentrix-orange bg-zentrix-orange/5 text-zentrix-orange" : "border-slate-200 hover:border-slate-300 text-slate-500"
                      )}
                    >
                      <Calculator size={14} className={editingItem.rateAnalysisId ? "text-zentrix-orange" : "text-slate-400"} />
                      <span className="text-[10px] font-bold leading-tight">Rate Analysis</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        const firstResId = resources[0]?.id || '';
                        const resItem = resources.find(r => r.id === firstResId);
                        const rateVal = resolveItemRate({ ...editingItem, resourceId: firstResId, rateAnalysisId: undefined }, selectedRegion, selectedPeriod);
                        setEditingItem({
                          ...editingItem,
                          resourceId: firstResId,
                          rateAnalysisId: undefined,
                          unit: resItem?.unit || editingItem.unit,
                          rate: rateVal,
                          amount: rateVal * (editingItem.quantity || 0)
                        });
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 border rounded-lg transition-all cursor-pointer text-center",
                        editingItem.resourceId ? "border-primary-500 bg-primary-50 text-primary-600" : "border-slate-200 hover:border-slate-300 text-slate-500"
                      )}
                    >
                      <Layers size={14} className={editingItem.resourceId ? "text-primary-500" : "text-slate-400"} />
                      <span className="text-[10px] font-bold leading-tight">Resource</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setEditingItem({
                          ...editingItem,
                          rateAnalysisId: undefined,
                          resourceId: undefined,
                          baseRate: editingItem.baseRate || editingItem.rate || 0,
                        });
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 border rounded-lg transition-all cursor-pointer text-center",
                        (!editingItem.rateAnalysisId && !editingItem.resourceId) ? "border-slate-800 bg-slate-100 text-slate-800" : "border-slate-200 hover:border-slate-300 text-slate-500"
                      )}
                    >
                      <Layers size={14} className={(!editingItem.rateAnalysisId && !editingItem.resourceId) ? "text-slate-850" : "text-slate-400"} />
                      <span className="text-[10px] font-bold leading-tight">Manual Rate</span>
                    </button>
                  </div>

                  {editingItem.rateAnalysisId ? (
                    <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked analysis</span>
                        <select
                          value={editingItem.rateAnalysisId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const rateVal = resolveItemRate({ ...editingItem, rateAnalysisId: val, resourceId: undefined }, selectedRegion, selectedPeriod);
                            setEditingItem({
                              ...editingItem,
                              rateAnalysisId: val,
                              resourceId: undefined,
                              rate: rateVal,
                              amount: rateVal * (editingItem.quantity || 0)
                            });
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[12px] font-medium text-zentrix-blue focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">-- Choose Analysis --</option>
                          {analyses.map(ra => (
                            <option key={ra.id} value={ra.id}>
                              {ra.code} - {ra.description} (Est: {formatCurrency(ra.finalRate || ra.subtotal)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="text-[10px] text-slate-400 italic">Dynamic calculations react to active Region, Period, and Resource base rates.</div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between">
                         <span className="text-[12px] font-medium">Calculated Rate</span>
                         <span className="text-[12px] font-bold text-zentrix-orange">{formatCurrency(editingItem.rate || 0)}</span>
                      </div>
                    </div>
                  ) : editingItem.resourceId ? (
                    <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked resource</span>
                        <select
                          value={editingItem.resourceId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const resItem = resources.find(r => r.id === val || r.code === val);
                            const rateVal = resolveItemRate({ ...editingItem, resourceId: val, rateAnalysisId: undefined }, selectedRegion, selectedPeriod);
                            setEditingItem({
                              ...editingItem,
                              resourceId: val,
                              rateAnalysisId: undefined,
                              unit: resItem?.unit || editingItem.unit,
                              rate: rateVal,
                              amount: rateVal * (editingItem.quantity || 0)
                            });
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[12px] font-medium text-zentrix-blue focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">-- Choose Resource --</option>
                          {resources.map(res => (
                            <option key={res.id} value={res.id}>
                              {res.code} - {res.name} ({res.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between">
                         <span className="text-[12px] font-medium">Resource Rate</span>
                         <span className="text-[12px] font-bold text-primary-600">{formatCurrency(editingItem.rate || 0)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Manual Rate</label>
                        <input 
                          type="number" 
                          value={editingItem.rate}
                          onChange={(e) => {
                            const newRate = parseFloat(e.target.value) || 0;
                            const multiplier = getMultiplier(selectedRegion, selectedPeriod);
                            setEditingItem({ 
                              ...editingItem, 
                              rate: newRate, 
                              baseRate: Number((newRate / multiplier).toFixed(4)),
                              amount: (editingItem.quantity || 0) * newRate 
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] font-mono text-right focus:ring-1 focus:ring-primary-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Enterprise Options */}
                <div className="space-y-4.5 pt-5 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block leading-none">Enterprise Options</label>
                  
                  <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] font-medium text-slate-700">
                      <input 
                        type="checkbox"
                        checked={editingItem.isProvisional || false}
                        onChange={(e) => setEditingItem({ ...editingItem, isProvisional: e.target.checked })}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                      <span>Provisional / Optional Item Flag</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] font-medium text-slate-700 mt-1">
                      <input 
                        type="checkbox"
                        checked={editingItem.isRounded || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newQty = isChecked ? Math.round(editingItem.quantity || 0) : editingItem.quantity || 0;
                          setEditingItem({ 
                            ...editingItem, 
                            isRounded: isChecked,
                            quantity: newQty,
                            amount: newQty * (editingItem.rate || 0)
                          });
                        }}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                      <span>Enforce Quantity Rounding (Integer)</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Tag size={12} className="text-slate-400" /> Item Tags
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. concrete, basement, tower-a"
                      value={editingItem.tags || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:ring-1 focus:ring-primary-500 transition-all text-slate-700 placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Item Remarks & Observations</label>
                    <textarea 
                      rows={2}
                      placeholder="Add surveyor observations or source notes..."
                      value={editingItem.remarks || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, remarks: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13.5px] focus:ring-1 focus:ring-primary-500 transition-all text-slate-700 placeholder-slate-400 h-14"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Paperclip size={12} className="text-slate-400" /> Attached Drawings & Specs
                    </label>
                    <div 
                      onClick={() => {
                        const file = prompt('Enter Spec/Drawing hyperlink URL or filename:');
                        if (file) {
                          setEditingItem({ ...editingItem, attachments: file });
                        }
                      }}
                      className="border border-dashed border-slate-250 hover:bg-slate-50 transition-colors p-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer text-slate-500 hover:text-slate-700"
                    >
                      <span>{editingItem.attachments || 'Click to link submittal specification / DWG'}</span>
                      <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">Attach</span>
                    </div>
                  </div>

                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Calculated amount</span>
                    <span className="text-lg font-bold text-zentrix-blue tracking-tight">
                      {formatCurrency((editingItem.quantity || 0) * (editingItem.rate || 0))}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    Last updated<br/>
                    <span className="font-medium text-slate-600">Today, 14:20</span>
                  </div>
                </div>
             </div>

             <div className="p-5 flex gap-2 border-t border-zentrix-border bg-slate-50/80">
                <button 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2 bg-white border border-zentrix-border rounded-md text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveItem}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md text-[13px] font-medium hover:bg-primary-700 transition-all shadow-md active:scale-95"
                >
                  Save Item
                </button>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const BOQItemSelector = ({ onSelect }: { onSelect: (template?: BOQItem) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const libraryItems = MOCK_BOQ.filter(item => 
    item.type === 'ITEM' && 
    (item.description.toLowerCase().includes(search.toLowerCase()) || 
     item.code.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-primary-700 hover:shadow-lg transition-all shadow-md active:scale-95 group"
      >
        <div className="bg-white/20 p-0.5 rounded-md group-hover:bg-white/30 transition-colors">
          <Plus size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="hidden sm:inline">Add Item</span>
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
                    placeholder="Search from library..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-primary-500 shadow-sm"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                <button
                  onClick={() => {
                    onSelect();
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-slate-50 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors shrink-0">
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-zentrix-blue block">Create New From Scratch</span>
                    <span className="text-[10px] text-slate-400">Add an empty BOQ item</span>
                  </div>
                </button>

                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Library Templates</div>

                {libraryItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-bold text-zentrix-blue group-hover:text-primary-600 truncate mr-2">{item.description}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{item.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                       <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Template</span>
                    </div>
                  </button>
                ))}
                {libraryItems.length === 0 && search !== '' && (
                  <div className="p-8 text-center text-slate-400 text-[12px] italic">
                    No matching templates found
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

const COLORS = ['#0f172a', '#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

const BOQSummaryView = ({ items }: { items: BOQItem[] }) => {
  const bills = items.filter(i => i.type === 'BILL');
  
  const summaryData = bills.map(bill => {
    // Get all items under this bill
    const billItems = items.filter(i => {
      if (i.type !== 'ITEM') return false;
      // Trace back to bill
      let current: BOQItem | undefined = i;
      while (current && current.parentId) {
        current = items.find(p => p.id === current?.parentId);
      }
      return current?.id === bill.id;
    });

    const total = billItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    return {
      name: bill.description,
      amount: total,
      code: bill.code
    };
  });

  const totalAmount = summaryData.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zentrix-blue mb-6 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid size={16} className="text-primary-500" />
            Cost Distribution by Bill
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="code" 
                  type="category" 
                  width={80} 
                  fontSize={12} 
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{data.code}</p>
                          <p className="text-[13px] font-bold text-zentrix-blue mb-0.5">{data.name}</p>
                          <p className="text-[13px] font-bold text-primary-600 font-mono">{formatCurrency(data.amount)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zentrix-blue mb-6 uppercase tracking-wider flex items-center gap-2">
            <PieChartIcon size={16} className="text-primary-500" />
            Percentage Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {summaryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                          <p className="text-[13px] font-bold text-zentrix-blue mb-0.5">{data.name}</p>
                          <p className="text-[13px] font-bold text-primary-600 font-mono">{formatCurrency(data.amount)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bill Code</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right w-32">Weight (%)</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((bill, index) => {
              const percentage = totalAmount > 0 ? ((bill.amount / totalAmount) * 100).toFixed(1) : "0.0";
              
              return (
                <tr key={bill.code} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-mono font-bold text-slate-500">{bill.code}</td>
                  <td className="px-6 py-4 text-[14px] font-bold text-zentrix-blue">{bill.name}</td>
                  <td className="px-6 py-4 text-[14px] font-mono font-bold text-right text-zentrix-blue">{formatCurrency(bill.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-[12px] font-bold text-slate-500">
                       <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                       </div>
                       {percentage}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ResourceAnalysisView = ({ items, analyses }: { items: BOQItem[], analyses: RateAnalysis[] }) => {
  // Aggregate resource costs
  let totalMaterials = 0;
  let totalLabor = 0;
  let totalEquipment = 0;
  let totalOther = 0;

  items.filter(i => i.type === 'ITEM').forEach(item => {
    if (item.rateAnalysisId) {
      const analysis = analyses.find(ra => ra.id === item.rateAnalysisId || ra.code === item.rateAnalysisId);
      if (analysis) {
        totalMaterials += (analysis.totalMaterialCost || 0) * (item.quantity || 0);
        totalLabor += (analysis.totalLaborCost || 0) * (item.quantity || 0);
        totalEquipment += (analysis.totalEquipmentCost || 0) * (item.quantity || 0);
        // Add overheads/profit to "Other"
        const resourcesCost = (analysis.totalMaterialCost || 0) + (analysis.totalLaborCost || 0) + (analysis.totalEquipmentCost || 0);
        const nonResourceCost = ((analysis.finalRate || analysis.subtotal || 0) - resourcesCost) * (item.quantity || 0);
        totalOther += nonResourceCost;
      } else {
        totalOther += item.amount || 0;
      }
    } else {
      totalOther += item.amount || 0;
    }
  });

  const resourceData = [
    { name: 'Materials', value: totalMaterials, color: '#3b82f6', icon: Package },
    { name: 'Labor', value: totalLabor, color: '#f59e0b', icon: Users },
    { name: 'Equipment', value: totalEquipment, color: '#ec4899', icon: Truck },
    { name: 'General/Other', value: totalOther, color: '#64748b', icon: Layers },
  ].filter(d => d.value > 0);

  const totalCost = resourceData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourceData.map((res) => (
          <div key={res.name} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${res.color}15`, color: res.color }}
                >
                  <res.icon size={20} />
                </div>
                <div className="text-[11px] font-bold text-slate-400">
                  {totalCost > 0 ? ((res.value / totalCost) * 100).toFixed(1) : "0.0"}%
                </div>
             </div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{res.name}</p>
             <h4 className="text-xl font-bold text-zentrix-blue font-mono tracking-tight">{formatCurrency(res.value)}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-zentrix-blue mb-6 uppercase tracking-wider">Resource Allocation</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={resourceData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                 <YAxis hide />
                 <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                          <p className="text-[13px] font-bold text-zentrix-blue mb-0.5">{data.name}</p>
                          <p className="text-[13px] font-bold text-primary-600 font-mono">{formatCurrency(data.value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                 />
                 <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                    {resourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
           <h3 className="text-sm font-bold text-zentrix-blue mb-6 uppercase tracking-wider">Top Consumed resources</h3>
           <div className="flex-1 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[13px] font-medium text-zentrix-blue">Reinforcement Steel 20mm</span>
                   </div>
                   <span className="text-[13px] font-bold text-slate-600 font-mono">{formatCurrency(totalMaterials * 0.65)}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-[13px] font-medium text-zentrix-blue">Portland Cement Type I</span>
                   </div>
                   <span className="text-[13px] font-bold text-slate-600 font-mono">{formatCurrency(totalMaterials * 0.25)}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[13px] font-medium text-zentrix-blue">Skilled Mason hours</span>
                   </div>
                   <span className="text-[13px] font-bold text-slate-600 font-mono">{formatCurrency(totalLabor * 0.8)}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-pink-500" />
                      <span className="text-[13px] font-medium text-zentrix-blue">Excavator Rental</span>
                   </div>
                   <span className="text-[13px] font-bold text-slate-600 font-mono">{formatCurrency(totalEquipment * 0.9)}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-50">
                 <button className="w-full py-2.5 text-[12px] font-bold text-primary-600 border border-primary-100 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                    <ArrowUpRight size={14} /> Download Full Resource Schedule
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

