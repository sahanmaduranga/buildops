import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  User, 
  ArrowRight, 
  Sparkles, 
  Building, 
  Edit, 
  Trash2, 
  Sliders, 
  RefreshCw, 
  FileCheck,
  Calculator,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Tag
} from 'lucide-react';
import { useTender, TenderOpportunity, TenderBOQItem, SupplierQuotation, SubcontractorQuotation, BidSubmission } from '../context/TenderContext.tsx';
import { formatCurrency, cn } from '../lib/utils.ts';
import { MOCK_RATE_ANALYSES } from '../mockData.ts';

export const TenderManagementShell: React.FC<{
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}> = ({ activeSubTab, setActiveSubTab }) => {
  const { 
    tenders, 
    tenderBoqs, 
    supplierQuotations, 
    subcontractorQuotations, 
    bidSubmissions,
    selectedTenderId, 
    setSelectedTenderId,
    addTender,
    updateTender,
    deleteTender,
    updateTenderBoq,
    addSupplierQuotation,
    addSubcontractorQuotation,
    addBidSubmission,
    convertTenderToProject
  } = useTender();

  // Selected Tender Scope
  const activeTender = useMemo(() => {
    return tenders.find(t => t.id === selectedTenderId) || null;
  }, [tenders, selectedTenderId]);

  // Linear Step Tracker State (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Automatically advance or position the step based on active tender status
  useEffect(() => {
    if (activeTender) {
      if (activeTender.status === 'Draft') {
        setActiveStep(1);
      } else if (activeTender.status === 'Estimating') {
        setActiveStep(2);
      } else if (activeTender.status === 'Reviewing') {
        setActiveStep(4);
      } else if (activeTender.status === 'Submitted') {
        setActiveStep(5);
      } else if (activeTender.status === 'Awarded' || activeTender.status === 'Lost') {
        setActiveStep(6);
      }
    }
  }, [selectedTenderId, activeTender?.status]);

  // Reset selected tender when sub-tab changes, so they see the appropriate global landing view
  useEffect(() => {
    setSelectedTenderId(null);
  }, [activeSubTab, setSelectedTenderId]);

  // Filters for Tender Directory
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  // Create Tender Opportunity Modal form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTender, setNewTender] = useState<Omit<TenderOpportunity, 'id' | 'dateCreated'>>({
    tenderNo: 'TND-2026-COL-095',
    name: '',
    client: '',
    consultant: '',
    location: '',
    tenderType: 'Building',
    status: 'Draft',
    submissionDate: '2026-07-31',
    estimatedValue: 0,
    assignedEstimator: 'Suren Jayasinghe (Lead QS)',
    currency: 'LKR',
    description: '',
    submissionMethod: 'Electronic Portal',
    notes: '',
    marginPercent: 12,
    overheadPercent: 6,
  });

  // Quotation forms
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteType, setQuoteType] = useState<'supplier' | 'subcontractor'>('supplier');
  const [supplierFormData, setSupplierFormData] = useState<Omit<SupplierQuotation, 'id'>>({
    tenderId: '',
    supplier: '',
    materialCategory: 'Cement / Bulk Aggregates',
    amount: 0,
    currency: 'LKR',
    quotationDate: new Date().toISOString().split('T')[0],
    deliveryPeriod: 'Within 7 Days',
    status: 'Received',
    remarks: ''
  });
  const [subconFormData, setSubconFormData] = useState<Omit<SubcontractorQuotation, 'id'>>({
    tenderId: '',
    subcontractor: '',
    workCategory: 'Civil Works',
    quotedValue: 0,
    currency: 'LKR',
    submissionDate: new Date().toISOString().split('T')[0],
    duration: '3 Months',
    status: 'Submitted',
    remarks: ''
  });

  // Submission States
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [discountPct, setDiscountPct] = useState(0);

  // Conversion overlay
  const [isConvertingOverlayOpen, setIsConvertingOverlayOpen] = useState(false);
  const [conversionResult, setConversionResult] = useState<{ projectId: string; boqId: string } | null>(null);

  // Filtering Tenders (Comprehensive of all statuses)
  const filteredTenders = useMemo(() => {
    return tenders.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tenderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchType = typeFilter === 'All' || t.tenderType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [tenders, searchTerm, statusFilter, typeFilter]);

  // Filtering Tenders for Dashboard (Active status only: Draft, Estimating, Reviewing, Submitted)
  const filteredActiveTenders = useMemo(() => {
    return tenders.filter(t => {
      const isActive = t.status !== 'Awarded' && t.status !== 'Lost';
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tenderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'All' || t.tenderType === typeFilter;
      return isActive && matchSearch && matchType;
    });
  }, [tenders, searchTerm, typeFilter]);

  // Active sub-sections helper for active tender BOQ
  const activeTenderBOQItems = useMemo(() => {
    if (!activeTender) return [];
    return tenderBoqs[activeTender.id] || [];
  }, [tenderBoqs, activeTender]);

  const activeTenderSupplierQuotes = useMemo(() => {
    if (!activeTender) return [];
    return supplierQuotations.filter(q => q.tenderId === activeTender.id);
  }, [supplierQuotations, activeTender]);

  const activeTenderSubconQuotes = useMemo(() => {
    if (!activeTender) return [];
    return subcontractorQuotations.filter(q => q.tenderId === activeTender.id);
  }, [subcontractorQuotations, activeTender]);

  const activeTenderSubmission = useMemo(() => {
    if (!activeTender) return null;
    return bidSubmissions.find(s => s.tenderId === activeTender.id) || null;
  }, [bidSubmissions, activeTender]);

  // BOQ Creation Form
  const [isAddBoqItemOpen, setIsAddBoqItemOpen] = useState(false);
  const [boqItemType, setBoqItemType] = useState<'SECTION' | 'ITEM'>('ITEM');
  const [newBoqItem, setNewBoqItem] = useState<{
    code: string;
    description: string;
    unit: string;
    quantity: number;
    rate: number;
    rateAnalysisId: string;
    remarks: string;
    parentId: string;
  }>({
    code: 'B.1',
    description: '',
    unit: 'm3',
    quantity: 1,
    rate: 0,
    rateAnalysisId: '',
    remarks: '',
    parentId: ''
  });

  // Inline editing row state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemQty, setEditItemQty] = useState(0);
  const [editItemRate, setEditItemRate] = useState(0);

  // Calculations for Active Tender pricing
  const pricingSummary = useMemo(() => {
    if (!activeTender) return { baseCost: 0, overheads: 0, profit: 0, finalBid: 0 };
    const items = tenderBoqs[activeTender.id] || [];
    const baseCost = items
      .filter(item => item.type === 'ITEM')
      .reduce((sum, item) => sum + (item.amount || 0), 0) || activeTender.estimatedValue;
    
    const overheads = baseCost * (activeTender.overheadPercent / 100);
    const profit = baseCost * (activeTender.marginPercent / 100);
    const finalBid = baseCost + overheads + profit;
    
    return { baseCost, overheads, profit, finalBid };
  }, [tenderBoqs, activeTender]);

  // Submit handers
  const handleCreateTenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTender.name || !newTender.client) {
      return;
    }
    const createdId = addTender(newTender);
    setIsCreateModalOpen(false);
    setSelectedTenderId(createdId);
    setActiveStep(1);
  };

  const handleConvertTender = () => {
    if (!activeTender) return;
    setIsConvertingOverlayOpen(true);
    setConversionResult(null);

    setTimeout(() => {
      const res = convertTenderToProject(activeTender.id);
      if (res) {
        setConversionResult(res);
      } else {
        setIsConvertingOverlayOpen(false);
        alert('Failed to convert tender to project workspace.');
      }
    }, 1500);
  };

  const handleCreateBoqItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTender) return;
    const items = [...activeTenderBOQItems];
    
    const itemToAdd: TenderBOQItem = {
      id: `it-${Date.now()}`,
      tenderId: activeTender.id,
      type: boqItemType,
      code: newBoqItem.code,
      description: newBoqItem.description,
      parentId: boqItemType === 'ITEM' && newBoqItem.parentId ? newBoqItem.parentId : undefined,
      unit: boqItemType === 'ITEM' ? newBoqItem.unit : undefined,
      quantity: boqItemType === 'ITEM' ? Number(newBoqItem.quantity) : undefined,
      rate: boqItemType === 'ITEM' ? Number(newBoqItem.rate) : undefined,
      amount: boqItemType === 'ITEM' ? Number(newBoqItem.quantity) * Number(newBoqItem.rate) : undefined,
      remarks: newBoqItem.remarks,
      rateAnalysisId: boqItemType === 'ITEM' && newBoqItem.rateAnalysisId ? newBoqItem.rateAnalysisId : undefined
    };

    items.push(itemToAdd);
    updateTenderBoq(activeTender.id, items);
    setIsAddBoqItemOpen(false);
    setNewBoqItem({ code: 'B.5', description: '', unit: 'm3', quantity: 1, rate: 0, rateAnalysisId: '', remarks: '', parentId: '' });
  };

  const handleDeleteBoqItem = (itemId: string) => {
    if (!activeTender) return;
    if (confirm('Are you sure you want to delete this BOQ item?')) {
      const updated = activeTenderBOQItems.filter(i => i.id !== itemId);
      updateTenderBoq(activeTender.id, updated);
    }
  };

  const handleSaveInlineEdit = (item: TenderBOQItem) => {
    if (!activeTender) return;
    const updated = activeTenderBOQItems.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          quantity: editItemQty,
          rate: editItemRate,
          amount: editItemQty * editItemRate
        };
      }
      return i;
    });
    updateTenderBoq(activeTender.id, updated);
    setEditingItemId(null);
  };

  const handleAddQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTender) return;
    if (quoteType === 'supplier') {
      addSupplierQuotation({
        ...supplierFormData,
        tenderId: activeTender.id,
        amount: Number(supplierFormData.amount)
      });
    } else {
      addSubcontractorQuotation({
        ...subconFormData,
        tenderId: activeTender.id,
        quotedValue: Number(subconFormData.quotedValue)
      });
    }
    setIsQuoteModalOpen(false);
  };

  const handleAddSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTender) return;
    const subNo = `SUB-TND-${Math.floor(1000 + Math.random() * 9000)}`;
    addBidSubmission({
      tenderId: activeTender.id,
      submissionNo: subNo,
      submittedDate: new Date().toISOString().split('T')[0],
      submittedAmount: pricingSummary.finalBid,
      discountPercent: discountPct,
      finalBidAmount: pricingSummary.finalBid * (1 - (discountPct / 100)),
      notes: submissionNotes,
      status: 'Pending'
    });
    updateTender(activeTender.id, { status: 'Submitted' });
    setActiveStep(6);
  };

  // Human steps labels
  const steps = [
    { id: 1, name: 'Tender Details', desc: 'Scope Definitions' },
    { id: 2, name: 'BOQ Estimates', desc: 'Priced List' },
    { id: 3, name: 'Trade Quotes', desc: 'Vendor Proposals' },
    { id: 4, name: 'Cost margins', desc: 'Slide Coefficients' },
    { id: 5, name: 'Bid Submission', desc: 'Final Envelope' },
    { id: 6, name: 'Award & Launch', desc: 'Project Handover' }
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-sans text-[13px] text-slate-700">
      
      {/* 1. Loading Overlay for converter conversion progress */}
      {isConvertingOverlayOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in" id="conversion-overlay">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-lg w-full text-center space-y-6">
            {!conversionResult ? (
              <div className="space-y-4 py-8">
                <RefreshCw size={44} className="mx-auto text-indigo-650 animate-spin" />
                <h3 className="text-lg font-black text-slate-800">Processing Pre-Contract Commercial Data</h3>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Synthesizing active Tender estimates, structuring master BOQ divisions, parsing overhead parameters, and generating live Post-Contract workspace...
                </p>
                <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-left">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-lg font-black text-center text-slate-900 leading-none">Tender Handed Over & Converted!</h3>
                <p className="text-slate-500 text-center text-xs">
                  Representative pre-contract estimation data carried accurately into execution phase modules.
                </p>

                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project Workspace ID:</span>
                    <span className="font-bold text-slate-800">{conversionResult.projectId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Post-Contract BOQ ID:</span>
                    <span className="font-bold text-slate-800">{conversionResult.boqId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Contract Value:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(activeTender ? activeTender.estimatedValue : 0)} LKR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Integrated Baseline:</span>
                    <span className="font-bold text-emerald-600">Active Approved</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-amber-500 font-bold animate-pulse">
                  ♻ Reloading workspace state cleanly...
                </div>

                <div className="text-slate-400 text-[11px] text-center italic">
                  Refreshing local switch states inside project controls.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Directory / Ledger/ Reports Views (Shown if no tender is active) */}
      {!selectedTenderId && (
        <div className="space-y-6 animate-fade-in" id="tender-directory">
          
          {/* ======================================= */}
          {/* CASE A: TENDER DASHBOARD (ACTIVE ONLY)   */}
          {/* ======================================= */}
          {activeSubTab === 'tender-dashboard' && (
            <div className="space-y-6" id="tender-subtab-dashboard">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Active Bidding Pipeline</span>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2 mt-1">
                    <Briefcase className="text-indigo-650" size={22} /> Live Tender Workspace Dashboard
                  </h1>
                  <p className="text-slate-500 text-xs">A comprehensive dashboard presenting only ongoing, active pre-contract opportunities currently in negotiation or calculation phase.</p>
                </div>
                
                <button 
                  id="btn-create-tender"
                  onClick={() => {
                    setNewTender({
                      tenderNo: `TND-2026-COL-${Math.floor(100 + Math.random() * 900)}`,
                      name: '',
                      client: '',
                      consultant: '',
                      location: '',
                      tenderType: 'Building',
                      status: 'Draft',
                      submissionDate: '2026-07-31',
                      estimatedValue: 0,
                      assignedEstimator: 'Suren Jayasinghe (Lead QS)',
                      currency: 'LKR',
                      description: '',
                      submissionMethod: 'Electronic Portal',
                      notes: '',
                      marginPercent: 12,
                      overheadPercent: 6,
                    });
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 font-bold hover:bg-indigo-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Plus size={15} /> Initiate New Tender
                </button>
              </div>

              {/* Active-only Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="active-tender-stats">
                <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Active Pipeline</p>
                  <h3 className="text-xl font-bold text-indigo-700 mt-1">
                    {tenders.filter(t => t.status !== 'Awarded' && t.status !== 'Lost').length} Live Bids
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Actively tracked proposals</p>
                </div>
                <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Bids Under Calculation</p>
                  <h3 className="text-xl font-bold text-amber-600 mt-1">
                    {tenders.filter(t => ['Draft', 'Estimating', 'Reviewing'].includes(t.status)).length} Opportunities
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">QS preparing BOQ models</p>
                </div>
                <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Envelopes Submitted</p>
                  <h3 className="text-xl font-bold text-indigo-650 mt-1">
                    {tenders.filter(t => t.status === 'Submitted').length} Submitted
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pending client award board</p>
                </div>
                <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Estimated Pipeline Value</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    {formatCurrency(tenders.filter(t => t.status !== 'Awarded' && t.status !== 'Lost').reduce((sum, t) => sum + t.estimatedValue, 0))} LKR
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Active combined valuation</p>
                </div>
              </div>

              {/* Dynamic Filter Layout */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-600" /> Active Pre-Contract Bidding List
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search active tender name/client..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none w-52"
                      />
                    </div>
                    
                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs outline-none font-semibold cursor-pointer"
                    >
                      <option value="All">All Sectors</option>
                      <option value="Building">Building Only</option>
                      <option value="Infrastructure">Infrastructure Only</option>
                      <option value="Road">Road Only</option>
                      <option value="Civil">Civil Only</option>
                      <option value="MEP">MEP Only</option>
                    </select>
                  </div>
                </div>

                {/* Grid */}
                {filteredActiveTenders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-150 rounded-xl">
                    <Briefcase className="mx-auto text-slate-300 mb-2 font-light" size={32} />
                    <p className="font-bold text-slate-600 text-xs">No Active Tenders Found</p>
                    <p className="text-[11px] text-slate-400">All current opportunities have been awarded, lost, or archived. Create a new one above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredActiveTenders.map((t) => {
                      const estCost = tenderBoqs[t.id] ? 
                        tenderBoqs[t.id]
                          .filter(i => i.type === 'ITEM')
                          .reduce((sum, item) => sum + (item.amount || 0), 0)
                        : t.estimatedValue;

                      return (
                        <div 
                          key={t.id} 
                          className="bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group duration-200"
                        >
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="font-mono text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded leading-none border border-indigo-100">
                                {t.tenderNo}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border leading-tight",
                                t.status === 'Submitted' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                t.status === 'Estimating' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                t.status === 'Reviewing' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                "bg-slate-100 text-slate-700 border-slate-200"
                              )}>
                                ● {t.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-sm leading-snug tracking-tight group-hover:text-indigo-700 duration-150 truncate" title={t.name}>
                                {t.name}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium truncate">Client: {t.client}</p>
                              <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <MapPin size={11} className="text-slate-400 shrink-0" /> <span className="truncate">{t.location}</span>
                              </p>
                            </div>

                            {/* Miniature pipeline bar */}
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                <span>Bidding Phase Progress</span>
                                <span className="text-indigo-600 uppercase">{t.status}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {['Draft', 'Estimating', 'Reviewing', 'Submitted'].map((step, idx) => {
                                  const stepIdx = ['Draft', 'Estimating', 'Reviewing', 'Submitted'].indexOf(t.status);
                                  const isFilled = stepIdx >= idx;
                                  return (
                                    <div 
                                      key={step} 
                                      className={cn(
                                        "h-1 rounded-full flex-1",
                                        isFilled ? "bg-indigo-600" : "bg-slate-200"
                                      )}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                              <div>
                                <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Closing Date</span>
                                <strong className="text-slate-700 font-mono">{t.submissionDate}</strong>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Estimations sum</span>
                                <strong className="text-slate-800">{formatCurrency(estCost)} LKR</strong>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedTenderId(t.id);
                            }}
                            className="w-full mt-4.5 py-2.5 bg-slate-900 group-hover:bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-transparent"
                          >
                            Manage Tender Workspace <ArrowRight size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CASE B: ALL TENDERS LEDGER (HISTORICAL)  */}
          {/* ======================================= */}
          {activeSubTab === 'tender-list' && (
            <div className="space-y-6" id="tender-subtab-list">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">All Tenders Registry</span>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2 mt-1">
                    <FileText className="text-slate-650" size={22} /> Comprehensive Tender Ledger & Archive
                  </h1>
                  <p className="text-slate-500 text-xs">A unified list of all historical pre-contract items, including drafted, ongoing estimates, submitted envelopes, won contracts, and lost proposals.</p>
                </div>
                
                <button 
                  id="btn-create-tender"
                  onClick={() => {
                    setNewTender({
                      tenderNo: `TND-2026-COL-${Math.floor(100 + Math.random() * 900)}`,
                      name: '',
                      client: '',
                      consultant: '',
                      location: '',
                      tenderType: 'Building',
                      status: 'Draft',
                      submissionDate: '2026-07-31',
                      estimatedValue: 0,
                      assignedEstimator: 'Suren Jayasinghe (Lead QS)',
                      currency: 'LKR',
                      description: '',
                      submissionMethod: 'Electronic Portal',
                      notes: '',
                      marginPercent: 12,
                      overheadPercent: 6,
                    });
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-800 font-bold hover:bg-slate-900 text-white text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Plus size={15} /> Initiate New Tender
                </button>
              </div>

              {/* Overarching Pre-Contract Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="all-tender-stats">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secured Contracts</p>
                  <h3 className="text-xl font-bold text-emerald-600 mt-1">
                    {tenders.filter(t => t.status === 'Awarded').length} Awarded Wins
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bids marked as Won & Handed Over</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unsuccessful Proposals</p>
                  <h3 className="text-xl font-bold text-rose-600 mt-1">
                    {tenders.filter(t => t.status === 'Lost').length} Lost Bids
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Closed / Archived historical entries</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Pipeline</p>
                  <h3 className="text-xl font-bold text-indigo-700 mt-1">
                    {tenders.filter(t => t.status !== 'Awarded' && t.status !== 'Lost').length} In Progress
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Being calculated / reviewed</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consolidated Value Pool</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(tenders.reduce((sum, t) => sum + t.estimatedValue, 0))} LKR</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Total life-cycle tender value pool</p>
                </div>
              </div>

              {/* Directory Filter Base */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wide">
                    Master Bidding Opportunities Registry
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search tender name/number..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none w-52"
                      />
                    </div>
                    
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs outline-none font-semibold cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Estimating">Estimating</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Awarded">Awarded (Won)</option>
                      <option value="Lost">Lost</option>
                    </select>

                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs outline-none font-semibold cursor-pointer"
                    >
                      <option value="All">All Sectors</option>
                      <option value="Building">Building Only</option>
                      <option value="Infrastructure">Infrastructure Only</option>
                      <option value="Road">Road Only</option>
                      <option value="Civil">Civil Only</option>
                      <option value="MEP">MEP Only</option>
                    </select>
                  </div>
                </div>

                {/* Grid */}
                {filteredTenders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-150 rounded-xl">
                    <Briefcase className="mx-auto text-slate-300 mb-2 font-light" size={32} />
                    <p className="font-bold text-slate-600 text-xs">No Tenders Found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTenders.map((t) => {
                      const estCost = tenderBoqs[t.id] ? 
                        tenderBoqs[t.id]
                          .filter(i => i.type === 'ITEM')
                          .reduce((sum, item) => sum + (item.amount || 0), 0)
                        : t.estimatedValue;

                      return (
                        <div 
                          key={t.id} 
                          className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group duration-200"
                        >
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="font-mono text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded leading-none border border-indigo-100">
                                {t.tenderNo}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border leading-tight",
                                t.status === 'Awarded' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                t.status === 'Submitted' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                t.status === 'Estimating' ? "bg-amber-50 text-amber-750 border-amber-100" :
                                t.status === 'Reviewing' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                t.status === 'Lost' ? "bg-red-50 text-red-700 border-red-100" :
                                "bg-slate-100 text-slate-700 border-slate-200"
                              )}>
                                ● {t.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-sm leading-snug tracking-tight group-hover:text-slate-800 duration-150 truncate" title={t.name}>
                                {t.name}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium truncate">Client: {t.client}</p>
                              <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <MapPin size={11} className="text-slate-400 shrink-0" /> <span className="truncate">{t.location}</span>
                              </p>
                            </div>

                            {/* Miniature pipeline progress */}
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                <span>Bidding Phase Progress</span>
                                <span className={cn(
                                  "font-bold uppercase",
                                  t.status === 'Awarded' ? "text-emerald-650" : t.status === 'Lost' ? "text-red-500" : "text-indigo-600"
                                )}>{t.status}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {['Draft', 'Estimating', 'Reviewing', 'Submitted', 'Awarded'].map((step, idx) => {
                                  const stepIdx = ['Draft', 'Estimating', 'Reviewing', 'Submitted', 'Awarded'].indexOf(t.status);
                                  const isFilled = stepIdx >= idx && t.status !== 'Lost';
                                  return (
                                    <div 
                                      key={step} 
                                      className={cn(
                                        "h-1 rounded-full flex-1",
                                        isFilled ? (t.status === 'Awarded' ? "bg-emerald-500" : "bg-indigo-600") : "bg-slate-200"
                                      )}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                              <div>
                                <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Closing Date</span>
                                <strong className="text-slate-700 font-mono">{t.submissionDate}</strong>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Estimations sum</span>
                                <strong className="text-slate-800">{formatCurrency(estCost)} LKR</strong>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedTenderId(t.id);
                            }}
                            className="w-full mt-4.5 py-2.5 bg-slate-900 group-hover:bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-transparent"
                          >
                            Manage Tender Workspace <ArrowRight size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CASE C: TENDER REPORTS SUITE            */}
          {/* ======================================= */}
          {activeSubTab === 'tender-reports' && (
            <div className="space-y-6" id="tender-subtab-reports">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-teal-650 bg-teal-50 px-2 py-0.5 rounded">Pre-Contract Valuation Office</span>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2 mt-1">
                    <TrendingUp className="text-teal-600" size={22} /> Pre-Contract Analytics & Win/Loss Ratio
                  </h1>
                  <p className="text-slate-500 text-xs">Analyze bidding success indicators, conversion rates, and the financial structure of the total contract estimation registry.</p>
                </div>
                
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-teal-600 font-bold hover:bg-teal-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <FileCheck size={14} /> Print Reports Abstract
                </button>
              </div>

              {/* Statistical KPI Block */}
              {(() => {
                const totalTenders = tenders.length;
                const wonTenders = tenders.filter(t => t.status === 'Awarded').length;
                const lostTenders = tenders.filter(t => t.status === 'Lost').length;
                const activePipelineCount = tenders.filter(t => t.status !== 'Awarded' && t.status !== 'Lost').length;

                const winRatio = wonTenders + lostTenders > 0 ? (wonTenders / (wonTenders + lostTenders)) * 100 : 0;
                
                const activePipelineValue = tenders
                  .filter(t => t.status !== 'Awarded' && t.status !== 'Lost')
                  .reduce((sum, t) => sum + t.estimatedValue, 0);

                const securedValue = tenders
                  .filter(t => t.status === 'Awarded')
                  .reduce((sum, t) => sum + t.estimatedValue, 0);

                const submittedBidsValue = tenders
                  .filter(t => t.status === 'Submitted')
                  .reduce((sum, t) => sum + t.estimatedValue, 0);

                return (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Lead Conversion Success Index</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-2xl font-black text-slate-900 leading-none">{winRatio.toFixed(1)}%</h3>
                          <span className="text-emerald-600 text-xs font-bold font-mono">Win Rate</span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Calculated as <strong className="text-slate-600">{wonTenders} won</strong> vs <strong className="text-slate-600">{lostTenders} lost</strong>
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Secured Post-Contract Value</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-2xl font-black text-emerald-650 leading-none">{formatCurrency(securedValue)} LKR</h3>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Carried over to execution workspaces
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Active Pipeline Exposure</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-2xl font-black text-indigo-700 leading-none">{formatCurrency(activePipelineValue)} LKR</h3>
                          <span className="text-indigo-600 text-[10px] font-bold font-mono">({activePipelineCount} active)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Estimated values being priced
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
                        <span className="text-[9px] text-[#4ea0a1] font-bold uppercase tracking-wider block">Submitted Bids Value</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-2xl font-black text-slate-800 leading-none">{formatCurrency(submittedBidsValue)} LKR</h3>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Pending final evaluation decision
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      
                      {/* Bidding Funnel Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs uppercase font-extrabold text-slate-700 tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span>Bidding Funnel Performance</span>
                          <span className="font-mono text-[10px] text-slate-400 capitalize">Life registry conversion</span>
                        </h3>
                        
                        <div className="space-y-4 pt-1">
                          {/* Draft Stage */}
                          {(() => {
                            const count = tenders.filter(t => t.status === 'Draft').length;
                            const val = tenders.filter(t => t.status === 'Draft').reduce((s,t)=> s+t.estimatedValue,0);
                            const percent = totalTenders > 0 ? (count / totalTenders) * 100 : 0;
                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-600">Draft Formulation Phase</span>
                                  <span className="font-mono text-slate-400 font-bold">{count} bids ({formatCurrency(val)} LKR)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-slate-400" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })()}

                          {/* Estimating Stage */}
                          {(() => {
                            const count = tenders.filter(t => t.status === 'Estimating').length;
                            const val = tenders.filter(t => t.status === 'Estimating').reduce((s,t)=> s+t.estimatedValue,0);
                            const percent = totalTenders > 0 ? (count / totalTenders) * 100 : 0;
                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-amber-600">Active Estimating & BOQ Build</span>
                                  <span className="font-mono text-slate-500 font-bold">{count} bids ({formatCurrency(val)} LKR)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })()}

                          {/* Submitted Stage */}
                          {(() => {
                            const count = tenders.filter(t => t.status === 'Submitted').length;
                            const val = tenders.filter(t => t.status === 'Submitted').reduce((s,t)=> s+t.estimatedValue,0);
                            const percent = totalTenders > 0 ? (count / totalTenders) * 100 : 0;
                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-indigo-650">Submitted Proposal Envelopes</span>
                                  <span className="font-mono text-slate-500 font-bold">{count} bids ({formatCurrency(val)} LKR)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-600" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })()}

                          {/* Awarded Stage */}
                          {(() => {
                            const count = tenders.filter(t => t.status === 'Awarded').length;
                            const val = tenders.filter(t => t.status === 'Awarded').reduce((s,t)=> s+t.estimatedValue,0);
                            const percent = totalTenders > 0 ? (count / totalTenders) * 100 : 0;
                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-emerald-600">Awarded Assets Handed Over</span>
                                  <span className="font-mono text-emerald-700 font-bold">{count} bids ({formatCurrency(val)} LKR)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Sector Breakdown Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs uppercase font-extrabold text-slate-700 tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span>Sector Distribution & Focus</span>
                          <span className="font-mono text-[10px] text-slate-450 uppercase">By Estimated Value</span>
                        </h3>

                        <div className="space-y-3.5 pt-1">
                          {['Building', 'Infrastructure', 'Road', 'Civil', 'MEP'].map((sector) => {
                            const sectorTenders = tenders.filter(t => t.tenderType === sector);
                            const value = sectorTenders.reduce((sum, t) => sum + t.estimatedValue, 0);
                            const totalVal = tenders.reduce((sum, t) => sum + t.estimatedValue, 0);
                            const pct = totalVal > 0 ? (value / totalVal) * 105 : 0;

                            return (
                              <div key={sector} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                                    {sector}
                                  </span>
                                  <span className="font-mono text-slate-600">{sectorTenders.length} items • <strong className="text-slate-850">{formatCurrency(value)} LKR</strong></span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* All Bids Detailed Register Table */}
                    <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs space-y-4">
                      <h3 className="text-xs uppercase font-extrabold text-slate-700 tracking-wider">
                        Master Bid Abstracts Sheet
                      </h3>

                      <div className="overflow-x-auto border border-slate-150 rounded-xl">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                              <th className="p-3">Tender Code</th>
                              <th className="p-3">Tender Name</th>
                              <th className="p-3">Client</th>
                              <th className="p-3">Sectors</th>
                              <th className="p-3">Closing Date</th>
                              <th className="p-3 text-right">Value (LKR)</th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 text-slate-700">
                            {tenders.map((t) => (
                              <tr key={t.id} className="hover:bg-slate-50/55 transition-colors">
                                <td className="p-3 font-mono text-indigo-700 font-bold">{t.tenderNo}</td>
                                <td className="p-3 font-bold text-slate-900 max-w-[200px] truncate" title={t.name}>{t.name}</td>
                                <td className="p-3 text-slate-500 max-w-[150px] truncate">{t.client}</td>
                                <td className="p-3 font-bold uppercase text-[10px] text-slate-400">{t.tenderType}</td>
                                <td className="p-3 font-mono">{t.submissionDate}</td>
                                <td className="p-3 text-right font-bold text-slate-800 font-mono">{formatCurrency(t.estimatedValue)}</td>
                                <td className="p-3 text-center">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded text-[10px] font-black uppercase text-center border inline-block leading-none",
                                    t.status === 'Awarded' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                    t.status === 'Submitted' ? "bg-indigo-50 text-indigo-700 border-indigo-150" :
                                    t.status === 'Estimating' ? "bg-amber-50 text-amber-700 border-amber-150" :
                                    t.status === 'Lost' ? "bg-red-50 text-red-700 border-red-150" :
                                    "bg-slate-50 text-slate-600 border-slate-200"
                                  )}>
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

        </div>
      )}

      {/* 3. Direct Guided Bidding Workspace Flow once Tender is Selected */}
      {selectedTenderId && activeTender && (
        <div className="space-y-6 animate-fade-in" id="tender-wizard">
          
          {/* Top Banner & Fast Back Actions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-705">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Interactive Bidding Pathway Controls</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded border leading-none",
                    activeTender.status === 'Awarded' ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                    activeTender.status === 'Submitted' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                    "bg-amber-50 text-amber-700 border-amber-250"
                  )}>
                    ● {activeTender.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-705 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {activeTender.tenderNo}
                  </span>
                  <h2 className="font-bold text-slate-900 text-base tracking-tight leading-none">
                    {activeTender.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">• Client: {activeTender.client}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTenderId(null);
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                >
                  ← Back to Tender Deck
                </button>
              </div>
            </div>

            {/* Visual step-by-step progress checklist to force steps sequence */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1" id="wizard-steps-timeline">
              {steps.map((st) => {
                const isCurrent = activeStep === st.id;
                const isPassed = activeStep > st.id;
                
                return (
                  <button
                    key={st.id}
                    onClick={() => setActiveStep(st.id)}
                    className={cn(
                      "flex flex-col text-left p-3 rounded-lg border transition-all text-xs font-sans",
                      isCurrent ? "bg-indigo-600 border-indigo-500 text-white shadow-sm" : 
                      isPassed ? "bg-indigo-50 border-indigo-100 text-indigo-905 font-medium" : 
                      "bg-white hover:bg-slate-50 border-slate-205 text-slate-400"
                    )}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 block">Step 0{st.id}</span>
                    <span className="font-bold block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{st.name}</span>
                    <span className="text-[10px] font-medium block truncate opacity-75 mt-0.5">{st.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1 DETAIL CARD: Scope Details Formulation */}
          {activeStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="wizard-step-1">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-slate-50/50 p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Step 1: Tender Scope & Specifications</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define pre-contract parameters and assign standard QS estimators.</p>
                </div>
                <Tag className="text-indigo-600" size={18} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tender Identification Code</label>
                  <input 
                    type="text" 
                    value={activeTender.tenderNo}
                    onChange={(e) => updateTender(activeTender.id, { tenderNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tender Project Name</label>
                  <input 
                    type="text" 
                    value={activeTender.name}
                    onChange={(e) => updateTender(activeTender.id, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Client Organization</label>
                  <input 
                    type="text" 
                    value={activeTender.client}
                    onChange={(e) => updateTender(activeTender.id, { client: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Consultant Engineers</label>
                  <input 
                    type="text" 
                    value={activeTender.consultant}
                    onChange={(e) => updateTender(activeTender.id, { consultant: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Closing Bid Date</label>
                  <input 
                    type="date" 
                    value={activeTender.submissionDate}
                    onChange={(e) => updateTender(activeTender.id, { submissionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Geographic Location</label>
                  <input 
                    type="text" 
                    value={activeTender.location}
                    onChange={(e) => updateTender(activeTender.id, { location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 block">Detailed Description & Field Parameters</label>
                  <textarea 
                    rows={3}
                    value={activeTender.description}
                    onChange={(e) => updateTender(activeTender.id, { description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none leading-snug"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">✏️ Scope values sync instantly with pre-contract localStorage records</span>
                <button 
                  onClick={() => {
                    updateTender(activeTender.id, { status: 'Estimating' });
                    setActiveStep(2);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow duration-150"
                >
                  Proceed to BOQ Estimates <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 DETAIL CARD: BOQ Estimator Breakdown Table with links to rate analysis */}
          {activeStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="wizard-step-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3 bg-slate-50/50 p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Step 2: Tender Bill of Quantities (BOQ)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Append item components, configure estimated quantities, or pair with detailed Rate Analysis.</p>
                </div>
                
                <button 
                  onClick={() => {
                    setBoqItemType('ITEM');
                    setNewBoqItem({ code: `B.${activeTenderBOQItems.length + 1}`, description: '', unit: 'm3', quantity: 1, rate: 0, rateAnalysisId: '', remarks: '', parentId: '' });
                    setIsAddBoqItemOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-605 hover:bg-indigo-700 text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-xl font-bold text-xs flex items-center gap-1"
                >
                  <PlusCircle size={14} /> Add BOQ Item
                </button>
              </div>

              {/* BOQ Grid Table */}
              <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="pl-6 py-3 w-28 font-mono">Code</th>
                      <th className="px-4 py-3">Description of Work Scopes</th>
                      <th className="px-4 py-3 w-16">Unit</th>
                      <th className="px-4 py-3 w-24 text-right">Quantity</th>
                      <th className="px-4 py-3 w-28 text-right">Unit Rate (LKR)</th>
                      <th className="px-4 py-3 w-28 text-right">Base Sum</th>
                      <th className="pr-6 py-3 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeTenderBOQItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                          No items added to this tender yet. Provide structural categories or items.
                        </td>
                      </tr>
                    ) : (
                      activeTenderBOQItems.map(item => {
                        const isSect = item.type === 'SECTION';
                        const isEd = editingItemId === item.id;

                        return (
                          <tr 
                            key={item.id} 
                            className={cn(
                              "hover:bg-slate-50/30 font-medium",
                              isSect ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-600"
                            )}
                          >
                            <td className="pl-6 py-2.5 font-mono text-indigo-700">{item.code}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-850">{item.description}</span>
                                {item.rateAnalysisId && (
                                  <span className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                                    ✓ Linked via rate analysis reference
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 font-mono">{isSect ? '-' : item.unit}</td>
                            
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
                              {isSect ? '-' : (
                                isEd ? (
                                  <input 
                                    type="number" 
                                    value={editItemQty}
                                    onChange={(e) => setEditItemQty(Number(e.target.value))}
                                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-right scale-95"
                                  />
                                ) : item.quantity
                              )}
                            </td>

                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
                              {isSect ? '-' : (
                                isEd ? (
                                  <input 
                                    type="number" 
                                    value={editItemRate}
                                    onChange={(e) => setEditItemRate(Number(e.target.value))}
                                    className="w-20 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-right scale-95"
                                  />
                                ) : formatCurrency(item.rate || 0)
                              )}
                            </td>

                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                              {isSect ? '-' : formatCurrency(item.amount || 0)}
                            </td>

                            <td className="pr-6 py-2.5 text-center">
                              {isSect ? (
                                <button 
                                  onClick={() => handleDeleteBoqItem(item.id)}
                                  className="text-slate-400 hover:text-red-650 p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              ) : (
                                <div className="flex justify-center gap-1.5">
                                  {isEd ? (
                                    <>
                                      <button 
                                        onClick={() => handleSaveInlineEdit(item)}
                                        className="p-1 px-1.5 bg-indigo-50 border border-indigo-150 rounded text-[9.5px] text-indigo-700 font-black cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={() => setEditingItemId(null)}
                                        className="p-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-[9.5px] text-slate-500 font-black cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => {
                                          setEditingItemId(item.id);
                                          setEditItemQty(item.quantity || 0);
                                          setEditItemRate(item.rate || 0);
                                        }}
                                        className="text-slate-400 hover:text-indigo-600 p-1"
                                      >
                                        <Edit size={13} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteBoqItem(item.id)}
                                        className="text-slate-400 hover:text-red-650 p-1"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Base Estimations Summary Panel */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs text-slate-500">
                  <p className="font-bold text-slate-700 leading-none">Summed Base Cost Estimate</p>
                  <p className="text-[11px] mt-1">Sum of direct material construction rates before company target profit margins or overhead allocations.</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Direct Base Valuation</p>
                  <h4 className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(pricingSummary.baseCost)} LKR</h4>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Back to Details
                </button>
                
                <button 
                  onClick={() => {
                    updateTender(activeTender.id, { status: 'Estimating' });
                    setActiveStep(3);
                  }}
                  className="px-5 py-2 bg-indigo-605 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  Proceed to Quotes <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 DETAIL CARD: Trade Quotes & Suppliers Registry */}
          {activeStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="wizard-step-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3 bg-slate-50/50 p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Step 3: Materials & Subcontractor Proposal Quotes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Compare supplier rates or specialist bids with your internal direct estimates.</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setQuoteType('supplier'); setIsQuoteModalOpen(true); }}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-704 border border-indigo-150 text-xs font-bold rounded-xl"
                  >
                    + Supplier Quote
                  </button>
                  <button 
                    onClick={() => { setQuoteType('subcontractor'); setIsQuoteModalOpen(true); }}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-705 border border-slate-200 text-xs font-bold rounded-xl"
                  >
                    + Subcontractor Quote
                  </button>
                </div>
              </div>

              {/* Horizontal layout side-by-side grids */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Supplier proposal registry column */}
                <div className="space-y-3.5">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1 leading-none uppercase tracking-wide">
                    <span>1. Bulk Materials Supplier Quotes</span>
                  </h4>
                  
                  <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-55 border-b border-slate-150 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                          <th className="pl-4 py-2">Supplier</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2 text-right">Quoted price</th>
                          <th className="pr-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {activeTenderSupplierQuotes.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">No material quotes registered.</td>
                          </tr>
                        ) : (
                          activeTenderSupplierQuotes.map(q => (
                            <tr key={q.id} className="hover:bg-slate-50/50">
                              <td className="pl-4 py-2.5 font-bold text-slate-800">{q.supplier}</td>
                              <td className="px-3 py-2.5 text-slate-450">{q.materialCategory}</td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(q.amount)} {q.currency}</td>
                              <td className="pr-4 py-2.5 text-center">
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9.5px] font-black border border-emerald-100">
                                  {q.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subcontractor proposal registry column */}
                <div className="space-y-3.5">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1 leading-none uppercase tracking-wide">
                    <span>2. Specialist Trade Subcontractor bids</span>
                  </h4>
                  
                  <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-55 border-b border-slate-150 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                          <th className="pl-4 py-2">Subcontractor</th>
                          <th className="px-3 py-2">Category Specialty</th>
                          <th className="px-3 py-2 text-right">Quoted bid</th>
                          <th className="pr-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {activeTenderSubconQuotes.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">No subcontractor bids registered.</td>
                          </tr>
                        ) : (
                          activeTenderSubconQuotes.map(sc => (
                            <tr key={sc.id} className="hover:bg-slate-50/50">
                              <td className="pl-4 py-2.5 font-bold text-slate-800">{sc.subcontractor}</td>
                              <td className="px-3 py-2.5 text-slate-455">{sc.workCategory}</td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(sc.quotedValue)} {sc.currency}</td>
                              <td className="pr-4 py-2.5 text-center">
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9.5px] font-black border border-indigo-100">
                                  {sc.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Back to BOQ
                </button>
                
                <button 
                  onClick={() => {
                    updateTender(activeTender.id, { status: 'Reviewing' });
                    setActiveStep(4);
                  }}
                  className="px-5 py-2 bg-indigo-605 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  Configure Markup Coefficients <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 DETAIL CARD: Markups, Overheads, and Sliders Coefficients */}
          {activeStep === 4 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="wizard-step-4">
              <div className="border-b border-slate-100 pb-3 bg-slate-50/50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm">Step 4: Overheads & Gross Markup Coefficients</h3>
                <p className="text-xs text-slate-400 mt-0.5">Use sliders to configure custom overhead multipliers and target margins to construct final bid pricing.</p>
              </div>

              {/* Pricing breakdown summary card block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Base Materials Sum</span>
                  <p className="text-sm font-bold text-slate-805 font-mono mt-2">{formatCurrency(pricingSummary.baseCost)} LKR</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Sourced from direct BOQ items</p>
                </div>
                <div className="bg-white border border-indigo-150 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Site Overheads ({activeTender.overheadPercent}%)</span>
                  <p className="text-sm font-bold text-indigo-700 font-mono mt-2">+{formatCurrency(pricingSummary.overheads)} LKR</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Insurance, administration, bonds</p>
                </div>
                <div className="bg-white border border-emerald-150 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Profit Margin target ({activeTender.marginPercent}%)</span>
                  <p className="text-sm font-bold text-emerald-600 font-mono mt-2">+{formatCurrency(pricingSummary.profit)} LKR</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Net contractor bidding margin</p>
                </div>
                <div className="bg-slate-900 text-white rounded-xl p-4">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block leading-none">Computed Gross Bid Price</span>
                  <p className="text-base font-black text-white font-mono mt-2">{formatCurrency(pricingSummary.finalBid)} LKR</p>
                  <p className="text-[10.5px] text-indigo-200 mt-0.5">Proposed gross contract sum</p>
                </div>
              </div>

              {/* Multiplier Adjustment sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-1"><Sliders size={13} className="text-indigo-650" /> Target Margin Coefficient</label>
                    <span className="text-indigo-650 font-mono font-bold text-sm bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">{activeTender.marginPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="25" 
                    value={activeTender.marginPercent}
                    onChange={(e) => updateTender(activeTender.id, { marginPercent: Number(e.target.value) })}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-450 leading-snug">Estimator note: typical margins across government infrastructure works fluctuate between 8% to 15%.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-1"><Building size={13} className="text-emerald-605" /> Site Overheads coefficient</label>
                    <span className="text-emerald-605 font-mono font-bold text-sm bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">{activeTender.overheadPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={activeTender.overheadPercent}
                    onChange={(e) => updateTender(activeTender.id, { overheadPercent: Number(e.target.value) })}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-455 leading-snug">Estimator note: covers bank bond security commissions, logistics mobilization, and local field security guards.</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Back to Quotes
                </button>
                
                <button 
                  onClick={() => {
                    updateTender(activeTender.id, { status: 'Reviewing' });
                    setActiveStep(5);
                  }}
                  className="px-5 py-2 bg-indigo-605 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  Proceed to Proposal Submission <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 DETAIL CARD: Proposal Submission Envelopes Packing */}
          {activeStep === 5 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="wizard-step-5">
              <div className="border-b border-slate-100 pb-3 bg-slate-50/50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm">Step 5: Final Submission compilation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Adjust discretionary board discounts and submit final bid proposals formally to client.</p>
              </div>

              {activeTenderSubmission ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle className="text-emerald-500" size={20} />
                    <strong className="text-sm">Proposal Bid Formally Transmitted to Client!</strong>
                  </div>
                  <p className="text-xs text-emerald-700 max-w-xl leading-relaxed">
                    This pre-contract opportunity has been successfully locked and tagged as <span className="font-bold uppercase">Submitted</span>. 
                    The bidding records have been transmitted, waiting for formal client bid opening results. Next step guides you to register results.
                  </p>

                  <div className="bg-white border border-emerald-150 rounded-xl p-4 space-y-3 font-mono text-xs max-w-md">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submission Code Ref:</span>
                      <strong className="text-slate-700">{activeTenderSubmission.submissionNo}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Estimate Code:</span>
                      <strong className="text-slate-700">{formatCurrency(activeTenderSubmission.submittedAmount)} LKR</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-405">Board Discount:</span>
                      <strong className="text-slate-700">{activeTenderSubmission.discountPercent}%</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-900 font-bold">
                      <span>Submitted Bid Offer:</span>
                      <span>{formatCurrency(activeTenderSubmission.finalBidAmount)} LKR</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Applied Board Discount coefficients inputs */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 xl:col-span-1">
                    <h4 className="font-bold text-slate-800 text-xs uppercase leading-none">Compile Bid Pricing</h4>
                    <p className="text-[11px] text-slate-400">Apply any final administrative or discretionary board discounts on top of built markup rates.</p>

                    <div className="space-y-4 pt-2 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-650 block">Target Built Bid Price</label>
                        <input 
                          type="text" 
                          disabled 
                          value={`${formatCurrency(pricingSummary.finalBid)} LKR`}
                          className="w-full px-3 py-2 bg-slate-200 text-slate-600 border border-slate-300 rounded-xl font-mono font-bold text-center"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-750">
                          <label>Board Discount (%)</label>
                          <span className="font-mono text-indigo-700 font-bold">{discountPct}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="0.5"
                          value={discountPct}
                          onChange={(e) => setDiscountPct(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1 bg-slate-900 text-white p-3 rounded-xl">
                        <span className="text-[10px] text-indigo-30s uppercase font-bold block text-center leading-none">Net Bid Offer to Submit</span>
                        <p className="font-mono text-center font-black mt-2 text-base text-white">
                          {formatCurrency(pricingSummary.finalBid * (1 - (discountPct / 100)))} LKR
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Form inputs details */}
                  <div className="bg-white border border-slate-250 rounded-xl p-5 space-y-4 xl:col-span-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase leading-none">Submission Details</h4>
                    <p className="text-[11px] text-slate-400">Submit bid packages formally to Road Development Authority or foreign ministries.</p>

                    <form onSubmit={handleAddSubmissionSubmit} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-left">Registration transmission notes</label>
                        <textarea 
                          rows={3}
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          placeholder="e.g. Bidding pack compiled into single-stage and uploaded to WebPortal. Bid security guarantee bonded by Peoples Bank."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none leading-snug"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl w-full flex items-center justify-center gap-1.5 shadow"
                      >
                        Transmit Final Registered Bid Offer 🚀
                      </button>
                    </form>
                  </div>

                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Back to Coefficients
                </button>
                
                <button 
                  onClick={() => setActiveStep(6)}
                  className="px-5 py-2 bg-indigo-605 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  Result & Handover <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 DETAIL CARD: Outcome Commission & Conversion to live project */}
          {activeStep === 6 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="wizard-step-6">
              <div className="border-b border-slate-100 pb-3 bg-slate-50/50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm">Step 6: Outcome & Live Project Commissioning</h3>
                <p className="text-xs text-slate-400 mt-0.5">Acknowledge formal bidding result. Convert won tenders into active implementation contracts.</p>
              </div>

              {activeTender.status !== 'Awarded' && activeTender.status !== 'Lost' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto">
                  <Calculator className="mx-auto text-slate-400 animate-pulse" size={32} />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Waiting for client contract award notice</h4>
                    <p className="text-xs text-slate-455 max-w-sm mx-auto leading-relaxed mt-1">
                      If the client registers our bid offer as selected, choose "Mark as Awarded" to carry pre-contract estimations into post-contract modules.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2.5 pt-2">
                    <button 
                      onClick={() => {
                        updateTender(activeTender.id, { status: 'Awarded' });
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Mark as Awarded / Won ✓
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Confirm status change to Unsuccessful Opportunity ("Lost")?`)) {
                          updateTender(activeTender.id, { status: 'Lost' });
                        }
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Mark as Lost ✗
                    </button>
                  </div>
                </div>
              ) : activeTender.status === 'Lost' ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto text-red-800">
                  <XCircle className="mx-auto" size={36} />
                  <h4 className="font-bold text-sm">Opportunity Terminated ("Lost")</h4>
                  <p className="text-xs max-w-sm mx-auto leading-relaxed">
                    This bid proposal was marked as unsuccessful by client audit boards. Estimations remain preserved for pre-contract analytics.
                  </p>
                  <button 
                    onClick={() => {
                      updateTender(activeTender.id, { status: 'Estimating' });
                      setActiveStep(4);
                    }}
                    className="mt-2 text-xs font-bold text-indigo-650 hover:underline cursor-pointer"
                  >
                    ↺ Re-open estimating envelope to re-bidding
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <Sparkles size={24} className="animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950 leading-none">Pre-Contract Tender Awarded Successfully!</h3>
                    <p className="text-xs text-emerald-700 leading-snug tracking-tight max-w-sm mx-auto mt-2">
                      Formal contract letters received. Click below to synthesize direct estimates and commission a live Post-Contract workspace containing synchronized BOQ units!
                    </p>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleConvertTender}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-md border border-emerald-505 transition-transform hover:scale-103 cursor-pointer duration-150"
                    >
                      Commission Post-Contract Project Workspace 🚀
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setActiveStep(5)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Back to Submissions
                </button>
                <div className="text-slate-400 text-xs font-medium">Bidding Wizard Completed</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* OVERLAY MODAL: CREATE OPPORTUNITY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs text-xs">
          <form 
            onSubmit={handleCreateTenderSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6.5 max-w-lg w-full text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                 Initiate Tender Opportunity Draft
              </h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tender Reference No*</label>
                <input 
                  type="text" 
                  value={newTender.tenderNo}
                  onChange={(e) => setNewTender({ ...newTender, tenderNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Opportunity Name*</label>
                <input 
                  type="text" 
                  value={newTender.name}
                  onChange={(e) => setNewTender({ ...newTender, name: e.target.value })}
                  placeholder="e.g. Port Access Elevated Highway"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Client Organization*</label>
                <input 
                  type="text" 
                  value={newTender.client}
                  onChange={(e) => setNewTender({ ...newTender, client: e.target.value })}
                  placeholder="e.g. Road Development Authority"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Consultant Engineer</label>
                <input 
                  type="text" 
                  value={newTender.consultant}
                  onChange={(e) => setNewTender({ ...newTender, consultant: e.target.value })}
                  placeholder="e.g. State Engineering Corp"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tender Division Sector</label>
                <select 
                  value={newTender.tenderType}
                  onChange={(e) => setNewTender({ ...newTender, tenderType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold cursor-pointer"
                >
                  <option value="Building">Building</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Road">Road</option>
                  <option value="MEP">MEP</option>
                  <option value="Civil">Civil</option>
                  <option value="Interior">Interior</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Submission Closing Date</label>
                <input 
                  type="date" 
                  value={newTender.submissionDate}
                  onChange={(e) => setNewTender({ ...newTender, submissionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Scopes / Opportunity Description</label>
                <textarea 
                  rows={2}
                  value={newTender.description}
                  onChange={(e) => setNewTender({ ...newTender, description: e.target.value })}
                  placeholder="Describe precast concrete piles, pavement guidelines, or core scope parameters..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none leading-snug"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Add Opportunity Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OVERLAY MODAL: CREATE BOQ ITEM */}
      {isAddBoqItemOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs">
          <form 
            onSubmit={handleCreateBoqItem}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6.5 max-w-md w-full text-left space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-indigo-705 flex items-center gap-1.5 leading-none">
                 Add Bill of Quantities Core Item
              </h3>
              <button type="button" onClick={() => setIsAddBoqItemOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Item Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => { setBoqItemType('ITEM'); setNewBoqItem({ ...newBoqItem, code: `B.${activeTenderBOQItems.length + 1}` }); }}
                    className={cn("flex-1 py-1.5 border rounded-lg text-center font-bold duration-150 cursor-pointer text-xs", boqItemType === 'ITEM' ? "border-indigo-600 text-indigo-600 bg-indigo-50/20" : "border-slate-200 text-slate-500")}
                  >
                    BOQ Rate Item
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setBoqItemType('SECTION'); setNewBoqItem({ ...newBoqItem, code: 'C' }); }}
                    className={cn("flex-1 py-1.5 border rounded-lg text-center font-bold duration-150 cursor-pointer text-xs", boqItemType === 'SECTION' ? "border-indigo-600 text-indigo-600 bg-indigo-50/20" : "border-slate-200 text-slate-500")}
                  >
                    Division Section
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Unified Item Code / Division Code*</label>
                <input 
                  type="text" 
                  value={newBoqItem.code}
                  onChange={(e) => setNewBoqItem({ ...newBoqItem, code: e.target.value })}
                  placeholder="e.g. B.4 or C"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Detailed Description*</label>
                <textarea 
                  rows={2}
                  value={newBoqItem.description}
                  onChange={(e) => setNewBoqItem({ ...newBoqItem, description: e.target.value })}
                  placeholder="Provide concrete grade or structural rebar descriptions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                  required
                />
              </div>

              {boqItemType === 'ITEM' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Unit</label>
                    <input 
                      type="text" 
                      value={newBoqItem.unit}
                      onChange={(e) => setNewBoqItem({ ...newBoqItem, unit: e.target.value })}
                      placeholder="e.g. m3"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Quantity</label>
                    <input 
                      type="number" 
                      value={newBoqItem.quantity}
                      onChange={(e) => setNewBoqItem({ ...newBoqItem, quantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Unit Rate (LKR)</label>
                    <input 
                      type="number" 
                      value={newBoqItem.rate}
                      onChange={(e) => setNewBoqItem({ ...newBoqItem, rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                    />
                  </div>
                </div>
              )}

              {boqItemType === 'ITEM' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Link Rate Analysis reference</label>
                  <select 
                    value={newBoqItem.rateAnalysisId}
                    onChange={(e) => {
                      const selectedRa = MOCK_RATE_ANALYSES.find(ra => ra.id === e.target.value);
                      setNewBoqItem({
                        ...newBoqItem,
                        rateAnalysisId: e.target.value,
                        rate: selectedRa ? selectedRa.finalRate : newBoqItem.rate
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl outline-none font-semibold cursor-pointer"
                  >
                    <option value="">-- No Direct Link --</option>
                    {MOCK_RATE_ANALYSES.map(ra => (
                      <option key={ra.id} value={ra.id}>{ra.code} - {ra.description.slice(0, 40)}... ({ra.finalRate} LKR)</option>
                    ))}
                  </select>
                </div>
              )}

              {boqItemType === 'ITEM' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Parent Division Section</label>
                  <select 
                    value={newBoqItem.parentId}
                    onChange={(e) => setNewBoqItem({ ...newBoqItem, parentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold cursor-pointer"
                  >
                    <option value="">-- Main level --</option>
                    {activeTenderBOQItems.filter(i => i.type === 'SECTION').map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.code} - {sec.description}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsAddBoqItemOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Create BOQ Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OVERLAY MODAL: CREATE PROPOSAL QUOTATION */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs text-xs">
          <form 
            onSubmit={handleAddQuotation}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6.5 max-w-md w-full text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                 Register Proposal Quote Offer
              </h3>
              <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {quoteType === 'supplier' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Vendor / Supplier Name*</label>
                  <input 
                    type="text" 
                    value={supplierFormData.supplier}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, supplier: e.target.value })}
                    placeholder="e.g. Tokyo Cement Group"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Materials Category*</label>
                  <select 
                    value={supplierFormData.materialCategory}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, materialCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold cursor-pointer"
                  >
                    <option value="Cement / Bulk Aggregates">Cement / Bulk Aggregates</option>
                    <option value="Reinforcement Rebar Steel">Reinforcement Rebar Steel</option>
                    <option value="Structural Precast Columns">Structural Precast Columns</option>
                    <option value="Epoxy Resins & Fire Paints">Epoxy Resins & Fire Paints</option>
                    <option value="Electrical High Voltage Cabling">Electrical High Voltage Cabling</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Amount Offer (LKR)*</label>
                    <input 
                      type="number" 
                      value={supplierFormData.amount}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Currency</label>
                    <input 
                      type="text" 
                      value={supplierFormData.currency}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Delivery Turnaround Window</label>
                  <input 
                    type="text" 
                    value={supplierFormData.deliveryPeriod}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, deliveryPeriod: e.target.value })}
                    placeholder="e.g. Within 4 hours"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Scope Remarks</label>
                  <textarea 
                    rows={2}
                    value={supplierFormData.remarks}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, remarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Subcontractor Name*</label>
                  <input 
                    type="text" 
                    value={subconFormData.subcontractor}
                    onChange={(e) => setSubconFormData({ ...subconFormData, subcontractor: e.target.value })}
                    placeholder="e.g. Nawaloka Piling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Specialty Scope Division*</label>
                  <input 
                    type="text" 
                    value={subconFormData.workCategory}
                    onChange={(e) => setSubconFormData({ ...subconFormData, workCategory: e.target.value })}
                    placeholder="e.g. Bored Piling Operations"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Bid Amount Offer (LKR)*</label>
                    <input 
                      type="number" 
                      value={subconFormData.quotedValue}
                      onChange={(e) => setSubconFormData({ ...subconFormData, quotedValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Required Duration</label>
                    <input 
                      type="text" 
                      value={subconFormData.duration}
                      onChange={(e) => setSubconFormData({ ...subconFormData, duration: e.target.value })}
                      placeholder="e.g. 2 Months"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Technical Scope Remarks</label>
                  <textarea 
                    rows={2}
                    value={subconFormData.remarks}
                    onChange={(e) => setSubconFormData({ ...subconFormData, remarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Register Bid Offer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
