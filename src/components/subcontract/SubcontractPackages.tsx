import React, { useState, useEffect } from 'react';
import { useSubcontract, type SubcontractPackage, type SubcontractBOQAllocation } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { useBOQ } from '../../context/BOQContext.tsx';
import { type BOQItem } from '../../types.ts';
import { 
  Plus, 
  Search, 
  Briefcase, 
  FolderLock, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  Layers, 
  Calendar, 
  DollarSign, 
  Percent,
  FileText,
  User,
  Inbox,
  ArrowRight,
  UploadCloud,
  FileIcon,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export function SubcontractPackages() {
  const { currentProject } = useProject();
  const { boqs, boqItemsMap } = useBOQ();
  const { 
    subcontractors, 
    packages, 
    addPackage, 
    updatePackage, 
    deletePackage, 
    agreements, 
    ipcs, 
    variations,
    getBOQAllocatedTotalQty 
  } = useSubcontract();

  // Active package focus
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'allocation' | 'progress' | 'ipcs' | 'variations' | 'documents'>('summary');
  const [packageSearch, setPackageSearch] = useState('');
  
  // Package editing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<SubcontractPackage | null>(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [subcontractorId, setSubcontractorId] = useState('');
  const [packageType, setPackageType] = useState('Civil');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [retentionPercentage, setRetentionPercentage] = useState(10);
  const [advancePercentage, setAdvancePercentage] = useState(20);
  const [recoveryPercentage, setRecoveryPercentage] = useState(15);
  const [status, setStatus] = useState<'Draft' | 'Active' | 'On Hold' | 'Completed' | 'Closed'>('Draft');
  const [description, setDescription] = useState('');

  // BOQ Selection explorer states (BOQ Allocation Tab)
  const [selectedExplorerBOQId, setSelectedExplorerBOQId] = useState<string>('');
  const [allocatingBOQItem, setAllocatingBOQItem] = useState<any | null>(null);
  const [allocatingQty, setAllocatingQty] = useState<number>(0);
  const [allocatingRate, setAllocatingRate] = useState<number>(0);

  // Document management states
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, uploadedAt: string}[]>([
    { name: 'Shoring_Sublet_Plan_Final.pdf', size: '3.6 MB', uploadedAt: '2026-05-20' }
  ]);

  // Ensure selected package is within current project context
  const projectPackages = packages.filter(p => p.projectId === currentProject?.id);

  useEffect(() => {
    if (projectPackages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(projectPackages[0].id);
    }
  }, [projectPackages, selectedPackageId]);

  // Ensure default selected BOQ in allocation tab explorer is active for this project
  const projectBOQs = boqs.filter(b => b.projectId === currentProject?.id);
  useEffect(() => {
    if (projectBOQs.length > 0 && !selectedExplorerBOQId) {
      setSelectedExplorerBOQId(projectBOQs[0].id);
    }
  }, [projectBOQs, selectedExplorerBOQId]);

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Inbox className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1">Please select an active project workspace to load its subcontract packages.</p>
      </div>
    );
  }

  const activePkg = projectPackages.find(p => p.id === selectedPackageId);

  const openAddForm = () => {
    setEditingPkg(null);
    setCode(`PKG-${currentProject.code.split('-')[1] || 'SBC'}-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setSubcontractorId(subcontractors[0]?.id || '');
    setPackageType('Civil');
    setStartDate(currentProject.startDate);
    setEndDate(currentProject.plannedFinishDate);
    setRetentionPercentage(10);
    setAdvancePercentage(20);
    setRecoveryPercentage(15);
    setStatus('Draft');
    setDescription('');
    setIsFormOpen(true);
  };

  const openEditForm = (pkg: SubcontractPackage) => {
    setEditingPkg(pkg);
    setCode(pkg.code);
    setName(pkg.name);
    setSubcontractorId(pkg.subcontractorId);
    setPackageType(pkg.packageType);
    setStartDate(pkg.startDate);
    setEndDate(pkg.endDate);
    setRetentionPercentage(pkg.retentionPercentage);
    setAdvancePercentage(pkg.advancePercentage);
    setRecoveryPercentage(pkg.recoveryPercentage || 15);
    setStatus(pkg.status);
    setDescription(pkg.description);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subcontractorId) {
      alert('Please provide package name and subcontractor.');
      return;
    }

    const payload = {
      code,
      name,
      projectId: currentProject.id,
      subcontractorId,
      packageType,
      startDate,
      endDate,
      retentionPercentage,
      advancePercentage,
      recoveryPercentage,
      status,
      description,
      allocations: editingPkg ? editingPkg.allocations : []
    };

    if (editingPkg) {
      updatePackage(editingPkg.id, payload);
    } else {
      addPackage(payload);
    }
    setIsFormOpen(false);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this subcontract work package? All associated agreements and IPCs will also be removed.')) {
      deletePackage(id);
      setSelectedPackageId(null);
    }
  };

  // Allocating a BOQ item to the package
  const triggerAllocatingItem = (item: any) => {
    // calculate how much is already allocated
    const alreadyAllocated = getBOQAllocatedTotalQty(item.id, activePkg?.id);
    const balance = (item.quantity || 0) - alreadyAllocated;
    
    setAllocatingBOQItem(item);
    setAllocatingQty(Math.max(0, balance));
    setAllocatingRate(item.rate || 0);
  };

  const handleSaveAllocation = () => {
    if (!activePkg || !allocatingBOQItem) return;

    // Check duplicate warnings
    const exists = activePkg.allocations.some(a => a.boqItemId === allocatingBOQItem.id);
    
    const alreadyAllocatedInOthers = getBOQAllocatedTotalQty(allocatingBOQItem.id, activePkg.id);
    const totalNewQty = alreadyAllocatedInOthers + allocatingQty;

    // Validation: cannot exceed BOQ quantity
    if (totalNewQty > allocatingBOQItem.quantity) {
      alert(`Invalid Qty! Total allocated quantity cross packages (${totalNewQty} ${allocatingBOQItem.unit}) cannot exceed BOQ Item Quantity (${allocatingBOQItem.quantity} ${allocatingBOQItem.unit}).`);
      return;
    }

    let updatedAllocations = [...activePkg.allocations];
    const newAllocation: SubcontractBOQAllocation = {
      boqItemId: allocatingBOQItem.id,
      allocatedQty: allocatingQty,
      rate: allocatingRate,
      amount: allocatingQty * allocatingRate
    };

    if (exists) {
      // update
      updatedAllocations = updatedAllocations.map(a => a.boqItemId === allocatingBOQItem.id ? newAllocation : a);
    } else {
      // add
      updatedAllocations.push(newAllocation);
    }

    updatePackage(activePkg.id, {
      allocations: updatedAllocations
    });

    setAllocatingBOQItem(null);

    if (exists) {
      alert('BOQ item allocation modified successfully.');
    } else {
      alert('BOQ item allocated to subcontract package successfully.');
    }
  };

  const handleRemoveAllocation = (boqItemId: string) => {
    if (!activePkg) return;
    if (confirm('Remove this BOQ item allocation from this package?')) {
      const filtered = activePkg.allocations.filter(a => a.boqItemId !== boqItemId);
      updatePackage(activePkg.id, {
        allocations: filtered
      });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD' }).format(val);
  };

  // Filter package list
  const filteredPackages = projectPackages.filter(p => 
    p.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(packageSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in text-[13px] text-slate-600 font-sans">
      
      {/* Top action toolbar row */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search work packages..."
            value={packageSearch}
            onChange={(e) => setPackageSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary-500 text-xs focus:outline-none"
          />
        </div>

        <button
          onClick={openAddForm}
          className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none transition shadow-sm"
        >
          <Plus size={14} /> New Package
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden min-h-0">
        
        {/* Left Side: Package list tree layout */}
        <div className="w-full lg:w-[270px] bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-2 shrink-0 overflow-y-auto">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 pb-1.5 mb-1 px-1">
            Packages Directory ({filteredPackages.length})
          </label>
          
          {filteredPackages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">No packages configured.</div>
          ) : (
            <div className="space-y-1.5">
              {filteredPackages.map(pkg => {
                const isSelected = pkg.id === selectedPackageId;
                const sub = subcontractors.find(s => s.id === pkg.subcontractorId);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => { setSelectedPackageId(pkg.id); setActiveTab('summary'); }}
                    className={cn(
                      "p-3 rounded-xl border transition cursor-pointer text-left relative",
                      isSelected 
                        ? "bg-primary-50/50 border-primary-500 text-slate-900 shadow-xs" 
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-300 text-slate-650"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10.5px] text-primary-600 bg-white px-1.5 py-0.5 rounded leading-none border border-slate-100">
                        {pkg.code}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-1 rounded leading-none",
                        pkg.status === 'Active' ? "text-emerald-700 bg-emerald-50" : "text-slate-550 bg-slate-100"
                      )}>
                        {pkg.status}
                      </span>
                    </div>

                    <h5 className="font-bold text-[12px] text-slate-900 mt-2 truncate leading-snug">{pkg.name}</h5>
                    <p className="text-[10.5px] text-slate-400 font-semibold truncate mt-1 flex items-center gap-1">
                      <User size={11} /> {sub ? sub.name : 'No subcontractor assigned'}
                    </p>

                    <div className="flex items-center justify-between border-t border-dashed border-slate-200/60 mt-2.5 pt-2 text-[11px] font-bold">
                      <span className="text-slate-400">Revised Budget</span>
                      <span className="text-slate-800">{formatCurrency(pkg.revisedContractValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Tab details */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-hidden">
          {!activePkg ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Layers className="text-slate-350 mb-3" size={32} />
              <h4 className="font-bold text-slate-900 leading-none">No Subcontract Package Selected</h4>
              <p className="text-xs text-slate-400 mt-1">Please select or construct an active subcontract package to open details.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
              
              {/* Tab Selector Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 pt-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="bg-primary-600 text-white font-mono text-[11px] font-black px-1.5 py-0.5 rounded shadow-sm">{activePkg.code}</span>
                  <p className="font-black text-slate-900 text-[13.5px] truncate max-w-[250px]">{activePkg.name}</p>
                </div>

                <div className="flex gap-1">
                  {[
                    { id: 'summary', label: 'Summary' },
                    { id: 'allocation', label: 'BOQ Allocation' },
                    { id: 'progress', label: 'Progress Ledger' },
                    { id: 'ipcs', label: 'IPC History' },
                    { id: 'variations', label: 'Variations' },
                    { id: 'documents', label: 'Documents' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "px-3.5 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all leading-none focus:outline-none",
                        activeTab === tab.id 
                          ? "border-primary-600 text-primary-600 font-extrabold" 
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tab Viewport */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5">
                
                {/* Tab 1: Summary */}
                {activeTab === 'summary' && (
                  <div className="space-y-5 animate-fade-in">
                    
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Package Scope Description</span>
                        <p className="text-slate-550 leading-relaxed text-xs">{activePkg.description || 'No descriptive summary defined for this package.'}</p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button 
                          onClick={() => openEditForm(activePkg)}
                          className="px-2.5 py-1.5 hover:bg-slate-50 text-primary-700 font-bold border border-slate-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition leading-none shadow-sm"
                        >
                          <Edit3 size={13} /> Edit Details
                        </button>
                        <button 
                          onClick={() => handleDeletePackage(activePkg.id)}
                          className="px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 font-bold border border-slate-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition leading-none shadow-sm"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 shadow-inner">
                        <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">Company Profile</h5>
                        {subcontractors.find(s => s.id === activePkg.subcontractorId) ? (
                          (() => {
                            const sub = subcontractors.find(s => s.id === activePkg.subcontractorId)!;
                            return (
                              <div className="space-y-2">
                                <p className="font-extrabold text-slate-950 text-xs leading-snug">{sub.name}</p>
                                <div className="space-y-1 text-[11px] text-slate-500">
                                  <p><strong>Code:</strong> {sub.code}</p>
                                  <p><strong>Contact:</strong> {sub.contactPerson}</p>
                                  <p><strong>Email:</strong> {sub.email}</p>
                                  <p><strong>Phone:</strong> {sub.phone}</p>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <p className="text-xs text-rose-500 italic">No corporate subcontractor matched.</p>
                        )}
                      </div>

                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 shadow-inner">
                        <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">Operational Duration</h5>
                        <div className="space-y-2.5 font-sans leading-none">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-slate-400" size={14} />
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Start Execution</span>
                              <span className="text-slate-755 text-xs font-bold">{activePkg.startDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="text-primary-500 animate-pulse" size={14} />
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Estimated Handover</span>
                              <span className="text-slate-755 text-xs font-bold">{activePkg.endDate}</span>
                            </div>
                          </div>
                          <p className="text-[10.5px] text-slate-500 italic border-t border-slate-200 pt-2 font-medium">
                            Status mapped as: <span className="font-bold text-slate-950">{activePkg.status}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 shadow-inner">
                        <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">Financial Metrics</h5>
                        <div className="space-y-2 text-xs font-bold text-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-normal">Original Contract Value:</span>
                            <span className="font-mono font-bold text-slate-900">{formatCurrency(activePkg.originalContractValue)}</span>
                          </div>
                          <div className="flex justify-between items-center text-rose-500">
                            <span className="font-normal">Approved Changes:</span>
                            <span className="font-mono font-bold">+ {formatCurrency(activePkg.revisedContractValue - activePkg.originalContractValue)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-slate-950 text-xs shrink-0 font-extrabold">
                            <span className="text-slate-500">Revised contract Value:</span>
                            <span className="font-mono text-indigo-700 font-black text-sm">{formatCurrency(activePkg.revisedContractValue)}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Commercial Terms Banner */}
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-indigo-900">Ceylon/Gulf Contract Terms Applied</h5>
                        <p className="text-[11.5px] text-indigo-700 leading-normal">
                          This work package is bound by SLA clauses including <strong>{activePkg.retentionPercentage}% retention hold-backs</strong> (certified until practical completion) and <strong>{activePkg.advancePercentage}% advance payment mobilization</strong> which will be recovered incrementally at <strong>{activePkg.recoveryPercentage}% rate</strong> on each Interims Valuation IPC.
                        </p>
                      </div>
                      <div className="flex gap-4 text-center shrink-0">
                        <div className="bg-white border border-indigo-100 rounded-lg p-2.5 w-20 shadow-xs">
                          <span className="text-[10px] text-slate-450 font-bold block mb-0.5">Retention</span>
                          <span className="text-slate-850 font-black text-xs">{activePkg.retentionPercentage}%</span>
                        </div>
                        <div className="bg-white border border-indigo-100 rounded-lg p-2.5 w-20 shadow-xs">
                          <span className="text-[10px] text-slate-450 font-bold block mb-0.5">Advance</span>
                          <span className="text-slate-850 font-black text-xs">{activePkg.advancePercentage}%</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab 2: BOQ Allocation */}
                {activeTab === 'allocation' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in relative min-h-0 overflow-hidden h-[450px]">
                    
                    {/* Left: Project BOQ list tree */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden h-full">
                      <div className="border-b border-slate-200 pb-2 mb-3 shrink-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900">Project BOQ Schedule Tree</h5>
                          <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-white border px-2 py-0.5 rounded leading-none shadow-xs">Active Catalog</span>
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <select
                            value={selectedExplorerBOQId}
                            onChange={(e) => setSelectedExplorerBOQId(e.target.value)}
                            className="flex-1 p-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer text-slate-800"
                          >
                            {projectBOQs.map(b => (
                              <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Loader list of items */}
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                        {!selectedExplorerBOQId || !boqItemsMap[selectedExplorerBOQId] || boqItemsMap[selectedExplorerBOQId].filter(i=>i.type==='ITEM').length === 0 ? (
                          <p className="text-slate-400 text-xs italic py-8 text-center bg-white border rounded">No BOQ standard items loaded in selected schedule.</p>
                        ) : (
                          boqItemsMap[selectedExplorerBOQId]
                            .filter(item => item.type === 'ITEM')
                            .map(item => {
                              const alreadyAllocatedQtyAll = getBOQAllocatedTotalQty(item.id);
                              const remainingQty = (item.quantity || 0) - alreadyAllocatedQtyAll;
                              const isFullyAllocated = remainingQty <= 0;
                              const isAllocatedInSelectedPkg = activePkg.allocations.some(a => a.boqItemId === item.id);

                              return (
                                <div 
                                  key={item.id}
                                  onClick={() => !isFullyAllocated && triggerAllocatingItem(item)}
                                  className={cn(
                                    "p-2.5 rounded-lg border transition text-left text-xs bg-white flex flex-col justify-between gap-1.5 relative",
                                    isFullyAllocated 
                                      ? "opacity-55 border-slate-200 cursor-not-allowed bg-slate-100" 
                                      : "border-slate-200 hover:border-primary-400 hover:bg-slate-50 cursor-pointer"
                                  )}
                                >
                                  {isAllocatedInSelectedPkg && (
                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                  )}

                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
                                      <span className="bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-black">{item.code}</span>
                                      <span className="text-slate-400 font-semibold">• Quantity: {item.quantity} {item.unit}</span>
                                    </div>
                                    <h6 className="font-bold text-slate-800 tracking-tight leading-normal max-w-[85%]">{item.description}</h6>
                                  </div>

                                  <div className="flex items-center justify-between mt-1 text-[11px] font-bold border-t border-slate-50 pt-1.5 shrink-0">
                                    <span className="text-slate-400">Rate: {formatCurrency(item.rate || 0)}</span>
                                    <span className={cn(
                                      "text-[10px]",
                                      isFullyAllocated ? "text-rose-500 font-extrabold" : "text-emerald-600 font-bold"
                                    )}>
                                      {isFullyAllocated 
                                        ? "Fully Sublet (0 standard remaining)" 
                                        : `${Math.round((remainingQty / (item.quantity || 1)) * 100)}% Available (${remainingQty} ${item.unit})`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                    {/* Right: Selected package BOQ items */}
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 h-full overflow-hidden">
                      <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between shrink-0">
                        <h5 className="font-bold text-slate-900">Package Allocated BOQ Schedules</h5>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-black border px-2 py-0.5 rounded leading-none shadow-xs">
                          {activePkg.allocations.length} Items Sublet
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {activePkg.allocations.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <CheckSquare className="mx-auto text-slate-300 mb-2" size={24} />
                            <p className="font-bold">No Items Allocated</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Click on available items from the left BOQ Schedule tree to associate them here.</p>
                          </div>
                        ) : (
                          activePkg.allocations.map(alloc => {
                            const matchedItem = (Object.values(boqItemsMap) as BOQItem[][])
                              .flatMap(items => items)
                              .find(i => i.id === alloc.boqItemId);
                            
                            if (!matchedItem) return null;
                            const progressPercentage = Math.round((alloc.allocatedQty / (matchedItem.quantity || 1)) * 100);

                            return (
                              <div key={alloc.boqItemId} className="p-3 bg-indigo-50/10 border border-indigo-100 rounded-xl space-y-2 shadow-xs flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
                                      <span className="bg-indigo-50 text-indigo-700 font-black px-1 rounded">{matchedItem.code}</span>
                                      <span className="text-slate-400 font-semibold">• Ref Standard Qty: {matchedItem.quantity} {matchedItem.unit}</span>
                                    </div>
                                    <h6 className="font-bold text-slate-900 leading-normal truncate" title={matchedItem.description}>{matchedItem.description}</h6>
                                  </div>
                                  <button 
                                    onClick={() => handleRemoveAllocation(alloc.boqItemId)}
                                    className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer shrink-0"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-[11px] font-semibold">
                                  <div>
                                    <span className="text-slate-400 block text-[9.5px]">Allocated Qty</span>
                                    <span className="text-slate-800 font-extrabold">{alloc.allocatedQty} {matchedItem.unit}</span>
                                    <span className="text-[9.5px] text-slate-400 font-bold ml-1">({progressPercentage}%)</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9.5px]">Negotiated Rate</span>
                                    <span className="text-indigo-650 font-extrabold">{formatCurrency(alloc.rate)}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-slate-400 block text-[9.5px] mr-1">Allocated Amount</span>
                                    <span className="text-slate-950 font-black">{formatCurrency(alloc.amount)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Auto calculated Value Indicator bottom */}
                      {activePkg.allocations.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mt-3 shrink-0 flex items-center justify-between text-xs font-bold font-sans">
                          <span className="text-slate-500">Calculated Allocated Value:</span>
                          <span className="text-indigo-650 font-black text-sm">{formatCurrency(activePkg.allocations.reduce((sum, a) => sum + a.amount, 0))}</span>
                        </div>
                      )}
                    </div>

                    {/* Allocation Dialog Overlay */}
                    {allocatingBOQItem && (
                      <div className="absolute inset-0 bg-white/95 z-20 flex flex-col justify-center p-6 space-y-4 shadow-xl border border-slate-200 rounded-xl leading-normal">
                        <div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-black border border-indigo-200/50 px-2 py-0.5 rounded uppercase leading-none">
                            BOQ ALLOCATION WORKSPACE
                          </span>
                          <h6 className="font-extrabold text-slate-900 mt-2 text-sm leading-normal">{allocatingBOQItem.description}</h6>
                          <p className="text-[11px] text-slate-400 font-semibold mt-1">
                            Standard Item Code: <strong>{allocatingBOQItem.code}</strong> | Total Standard BOQ quantity limits: <strong>{allocatingBOQItem.quantity} {allocatingBOQItem.unit}</strong>
                          </p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200/60 flex justify-between gap-4 text-xs font-semibold select-none leading-none">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Previously Allocated in Other Packages</span>
                            <span className="text-slate-800 font-extrabold text-xs block mt-1">{getBOQAllocatedTotalQty(allocatingBOQItem.id, activePkg.id)} {allocatingBOQItem.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] mr-2">Available Quantity Allowance</span>
                            <span className="text-emerald-600 font-black text-xs block mt-1">
                              {allocatingBOQItem.quantity - getBOQAllocatedTotalQty(allocatingBOQItem.id, activePkg.id)} {allocatingBOQItem.unit}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Allocation Quantity ({allocatingBOQItem.unit}) *</label>
                            <input 
                              type="number" 
                              max={allocatingBOQItem.quantity - getBOQAllocatedTotalQty(allocatingBOQItem.id, activePkg.id)}
                              value={allocatingQty}
                              onChange={(e) => setAllocatingQty(parseFloat(e.target.value) || 0)}
                              className="p-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 font-bold"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Subcontract Rate ({currentProject.defaultCurrency}) *</label>
                            <input 
                              type="number" 
                              value={allocatingRate}
                              onChange={(e) => setAllocatingRate(parseFloat(e.target.value) || 0)}
                              className="p-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-500 text-indigo-750 font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 text-xs font-bold pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => setAllocatingBOQItem(null)}
                            className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-lg cursor-pointer transition leading-none shadow-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            disabled={allocatingQty <= 0 || allocatingRate <= 0}
                            onClick={handleSaveAllocation}
                            className={cn(
                              "px-3.5 py-2 text-white rounded-lg cursor-pointer transition leading-none shadow-sm font-extrabold",
                              allocatingQty <= 0 || allocatingRate <= 0
                                ? "bg-slate-200 cursor-not-allowed" 
                                : "bg-primary-600 hover:bg-primary-700"
                            )}
                          >
                            Save Allocation Details
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Tab 3: Progress Tracker */}
                {activeTab === 'progress' && (
                  <div className="space-y-4 animate-fade-in text-xs text-slate-600 leading-normal">
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h5 className="font-extrabold text-slate-900">Workforce Progress Monitoring</h5>
                        <p className="text-[11.5px] mt-0.5 text-slate-400">Track sublet BOQ progress of active interims certificates against original agreement parameters.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">Overall Certified Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5 select-none">
                            <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: '35%' }} />
                          </div>
                          <span className="font-black text-slate-900 text-xs">35% Certified</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="py-2.5 px-3">BOQ Ref</th>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3 text-center">Unit</th>
                            <th className="py-2.5 px-3 text-center">Sublet Qty</th>
                            <th className="py-2.5 px-3 text-center">Certified Qty</th>
                            <th className="py-2.5 px-3 text-center">Balance Qty</th>
                            <th className="py-2.5 px-3 text-right">Physical %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activePkg.allocations.map(alloc => {
                            const matchedItem = (Object.values(boqItemsMap) as BOQItem[][])
                              .flatMap(items => items)
                              .find(i => i.id === alloc.boqItemId);
                            
                            if (!matchedItem) return null;
                            const approvedIPCForThisItem = ipcs
                              .filter(i => i.packageId === activePkg.id && i.status === 'Approved')
                              .flatMap(i => i.items)
                              .find(item => item.boqItemId === alloc.boqItemId);
                            
                            const certQty = approvedIPCForThisItem ? approvedIPCForThisItem.totalQty : 0;
                            const balanceQty = alloc.allocatedQty - certQty;
                            const physicalPct = Math.round((certQty / alloc.allocatedQty) * 100);

                            return (
                              <tr key={alloc.boqItemId} className="hover:bg-slate-50 transition">
                                <td className="py-2.5 px-3 font-mono font-bold text-primary-600">{matchedItem.code}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-sm truncate" title={matchedItem.description}>{matchedItem.description}</td>
                                <td className="py-2.5 px-3 text-center">{matchedItem.unit}</td>
                                <td className="py-2.5 px-3 text-center font-bold">{alloc.allocatedQty}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{certQty}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-400">{balanceQty}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5 font-bold">
                                    <span>{physicalPct}%</span>
                                    <div className="w-10 bg-slate-200 rounded-full h-1">
                                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${physicalPct}%` }} />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 4: IPC / Interims Payments History */}
                {activeTab === 'ipcs' && (
                  <div className="space-y-4 animate-fade-in text-xs text-slate-600 font-sans">
                    <div className="flex border-b pb-2 items-center justify-between">
                      <h5 className="font-extrabold text-slate-900">Interim Payment Certificates (IPC Ledger)</h5>
                      <span className="text-[10px] uppercase font-black text-slate-400 font-mono">Package payments history</span>
                    </div>

                    {ipcs.filter(i => i.packageId === activePkg.id).length === 0 ? (
                      <p className="py-12 text-slate-400 text-center italic bg-slate-50 border rounded-xl">No Interims Payment Certificates initiated for this package.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ipcs.filter(i => i.packageId === activePkg.id).map(ipc => (
                          <div key={ipc.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3 shadow-inner">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono font-bold text-primary-600 bg-white border px-1.5 py-0.5 rounded text-[10px] shadow-xs">
                                  {ipc.ipcNo}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold ml-2">Period: {ipc.period}</span>
                              </div>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider leading-none",
                                ipc.status === 'Approved' ? "bg-emerald-50 text-emerald-700" : ipc.status === 'Submitted' ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                              )}>
                                {ipc.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold border-t border-slate-200/50 pt-2.5">
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Certified Amount (Gross)</span>
                                <span className="text-slate-900 font-extrabold">{formatCurrency(ipc.certifiedAmount)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Retention Held ({activePkg.retentionPercentage}%)</span>
                                <span className="text-amber-600 font-extrabold">- {formatCurrency(ipc.retentionAmount)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Advance Recovery ({activePkg.recoveryPercentage}%)</span>
                                <span className="text-rose-600 font-extrabold">- {formatCurrency(ipc.advanceRecoveryAmount)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Net Claim Payable</span>
                                <span className="text-slate-950 font-black text-xs block mt-0.5">{formatCurrency(ipc.netAmount)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 5: Variations */}
                {activeTab === 'variations' && (
                  <div className="space-y-4 animate-fade-in text-xs text-slate-650 font-sans leading-normal">
                    <div className="flex border-b border-slate-150 pb-2 items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs">Sublet variation orders (VO ledger)</h4>
                      <span className="text-[10px] text-slate-400 font-mono text-right font-bold uppercase">Tracks changes made to work packages</span>
                    </div>

                    {variations.filter(v => v.packageId === activePkg.id).length === 0 ? (
                      <p className="py-12 text-slate-400 text-center italic bg-slate-50 border rounded-xl">No structural variations orders registered for this sublet package context.</p>
                    ) : (
                      <div className="space-y-3">
                        {variations.filter(v => v.packageId === activePkg.id).map(vo => (
                          <div key={vo.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.2 rounded text-[10px]">{vo.voNumber}</span>
                                <span className="text-[10px] font-bold text-slate-400">Submitted: {vo.submittedDate}</span>
                              </div>
                              <h5 className="font-bold text-slate-900 mt-1">{vo.description}</h5>
                              <p className="text-slate-500 text-[11px] leading-relaxed italic">Reason: {vo.reason}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-black text-slate-950 leading-none text-xs">+ {formatCurrency(vo.amount)}</p>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider block mt-2 text-center leading-none",
                                vo.status === 'Approved' ? "bg-emerald-50 text-emerald-700" : vo.status === 'Pending Approval' ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                              )}>
                                {vo.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 6: Documents */}
                {activeTab === 'documents' && (
                  <div className="space-y-4 animate-fade-in text-xs text-slate-600 font-sans leading-normal">
                    <div className="border border-slate-200 border-dashed p-6 rounded-xl text-center bg-slate-50/50 hover:bg-white hover:border-primary-400 cursor-pointer transition-all">
                      <UploadCloud className="mx-auto text-slate-350 mb-2" size={28} />
                      <h5 className="font-extrabold text-slate-800 leading-none">Drop files or click to upload new sub agreements revision</h5>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Standard PDF contracts, licensing, measurements excel schedules (Max 25MB)</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1.5">Uploaded Package Assets</h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-white rounded border border-slate-200 text-primary-600">
                                <FileIcon size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 truncate max-w-sm">{file.name}</p>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{file.size} • uploaded {file.uploadedAt} by Robert Chen</span>
                              </div>
                            </div>

                            <a href="#" className="text-primary-600 hover:underline font-bold text-xs cursor-pointer select-none">Download</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Package Overlay Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-white border border-slate-300 shadow-xl rounded-2xl w-full max-w-[500px] flex flex-col z-10 overflow-hidden leading-normal">
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 select-none">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-950 text-sm">
                  {editingPkg ? `Modify Work Package: ${editingPkg.name}` : 'New Subcontract Work Package'}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">Bind a corporate subcontractor and establish project agreements coefficients.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] font-sans text-xs">
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Package Code *</label>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="p-2 border border-slate-200 bg-white rounded text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Package Type (Specialty) *</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="p-2 border border-slate-200 bg-white rounded text-slate-950 outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="Civil">Civil Works</option>
                    <option value="Electrical">Electrical Works</option>
                    <option value="Plumbing">Plumbing Works</option>
                    <option value="HVAC">HVAC Services</option>
                    <option value="Aluminum">Aluminum Cladding</option>
                    <option value="Interior">Interior Fitouts</option>
                    <option value="Finishing">Facade Finishing</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Package Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shoring & Foundation Excavation Works"
                  required
                  className="p-2 border border-slate-200 bg-white rounded text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Subcontractor Firm *</label>
                <select
                  value={subcontractorId}
                  onChange={(e) => setSubcontractorId(e.target.value)}
                  required
                  className="p-2 border border-slate-200 bg-white rounded text-slate-950 outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="">Select Subcontractor...</option>
                  {subcontractors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Execution Start Date *</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="p-2 border border-slate-200 bg-white rounded text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Estimated Handover Date *</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="p-2 border border-slate-200 bg-white rounded text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Terms inputs */}
              <div className="bg-slate-50 border p-4 rounded-xl grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">Retention % *</label>
                  <input 
                    type="number" 
                    value={retentionPercentage}
                    onChange={(e) => setRetentionPercentage(parseFloat(e.target.value) || 0)}
                    required
                    className="p-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">Advance Payment % *</label>
                  <input 
                    type="number" 
                    value={advancePercentage}
                    onChange={(e) => setAdvancePercentage(parseFloat(e.target.value) || 0)}
                    required
                    className="p-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">Recovery Rate % *</label>
                  <input 
                    type="number" 
                    value={recoveryPercentage}
                    onChange={(e) => setRecoveryPercentage(parseFloat(e.target.value) || 0)}
                    required
                    className="p-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Package Scope Details</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed scopes of sublet works, specs, or limits..."
                    rows={2}
                    className="p-2 border border-slate-200 bg-white rounded text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 resize-none leading-normal"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Operating Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="p-2 border border-slate-200 bg-white rounded text-slate-950 outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold border-t border-slate-100 pt-4 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer leading-none transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer leading-none shadow-md transition"
                >
                  {editingPkg ? 'Update Package' : 'Create Package'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
