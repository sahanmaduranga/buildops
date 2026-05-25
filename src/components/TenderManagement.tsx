import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  User, 
  ArrowRight, 
  Filter, 
  Sparkles, 
  Grid, 
  Layers, 
  Building, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Upload, 
  Tag, 
  Settings,
  Shield, 
  Sliders, 
  RefreshCw, 
  Flame, 
  FileCheck,
  ChevronDown,
  ArrowUpRight,
  Calculator,
  ChevronLeft
} from 'lucide-react';
import { useTender, TenderOpportunity, TenderBOQItem, SupplierQuotation, SubcontractorQuotation, TenderRevision, BidSubmission } from '../context/TenderContext.tsx';
import { formatCurrency, cn } from '../lib/utils.ts';
import { MOCK_RATE_ANALYSES, MOCK_RESOURCES } from '../mockData.ts';

export const TenderManagementShell: React.FC<{
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}> = ({ activeSubTab, setActiveSubTab }) => {
  const { 
    tenders, 
    tenderBoqs, 
    supplierQuotations, 
    subcontractorQuotations, 
    tenderRevisions, 
    bidSubmissions,
    selectedTenderId, 
    setSelectedTenderId,
    addTender,
    updateTender,
    deleteTender,
    updateTenderBoq,
    addSupplierQuotation,
    updateSupplierQuotation,
    addSubcontractorQuotation,
    updateSubcontractorQuotation,
    addTenderRevision,
    updateTenderRevision,
    addBidSubmission,
    updateBidSubmission,
    convertTenderToProject
  } = useTender();

  // Selected Tender Scope
  const activeTender = useMemo(() => {
    return tenders.find(t => t.id === selectedTenderId) || tenders[0] || null;
  }, [tenders, selectedTenderId]);

  // If active tab changes sub-routes or is clicked
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
    assignedEstimator: 'Robert Chen (Lead QS)',
    currency: 'LKR',
    description: '',
    submissionMethod: 'Electronic Portal',
    notes: '',
    marginPercent: 12,
    overheadPercent: 6,
  });

  // Quotation drawer / forms
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
    remarks: '',
    attachmentName: ''
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
    remarks: '',
    attachmentName: ''
  });

  // Revisions & Bid Submission States
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revNotes, setRevNotes] = useState('');
  const [revEstimate, setRevEstimate] = useState(0);

  const [isSubmitBidModalOpen, setIsSubmitBidModalOpen] = useState(false);
  const [discountPct, setDiscountPct] = useState(0);
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Conversion overlay
  const [isConvertingOverlayOpen, setIsConvertingOverlayOpen] = useState(false);
  const [conversionResult, setConversionResult] = useState<{ projectId: string; boqId: string } | null>(null);

  // Filter Tenders
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

  const activeTenderRevisions = useMemo(() => {
    if (!activeTender) return [];
    return tenderRevisions.filter(r => r.tenderId === activeTender.id);
  }, [tenderRevisions, activeTender]);

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
    code: 'B.4',
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

  // Calculations for Active Tender
  const tenderTotals = useMemo(() => {
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

  // Handlers
  const handleCreateTenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTender.name || !newTender.client) {
      alert('Please fill out all required fields.');
      return;
    }
    const createdId = addTender(newTender);
    setIsCreateModalOpen(false);
    setSelectedTenderId(createdId);
    setActiveSubTab('tender-opportunities');
  };

  const handleConvertTender = () => {
    if (!activeTender) return;
    if (activeTender.status !== 'Awarded') {
      alert('Only Awarded tenders can be converted to Post-Contract Projects!');
      return;
    }
    setIsConvertingOverlayOpen(true);
    setConversionResult(null);

    setTimeout(() => {
      const res = convertTenderToProject(activeTender.id);
      if (res) {
        setConversionResult(res);
      } else {
        setIsConvertingOverlayOpen(false);
        alert('Failed to convert tender to project.');
      }
    }, 1200);
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
    setNewBoqItem({ code: '', description: '', unit: 'm3', quantity: 1, rate: 0, rateAnalysisId: '', remarks: '', parentId: '' });
  };

  const handleDeleteBoqItem = (itemId: string) => {
    if (!activeTender) return;
    if (confirm('Delete this BOQ entry?')) {
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

  const handleAddRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTender) return;
    addTenderRevision({
      tenderId: activeTender.id,
      revisionNo: `Addendum ${activeTenderRevisions.length + 1}`,
      description: revNotes,
      date: new Date().toISOString().split('T')[0],
      revisedBy: 'Sarah Johnson (QS)',
      status: 'Active',
      revisedEstimate: revEstimate || tenderTotals.baseCost
    });
    setIsRevisionModalOpen(false);
    setRevNotes('');
    setRevEstimate(0);
  };

  const handleAddSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTender) return;
    addBidSubmission({
      tenderId: activeTender.id,
      submissionNo: `SUB-TND-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedDate: new Date().toISOString().split('T')[0],
      submittedAmount: tenderTotals.finalBid,
      discountPercent: discountPct,
      finalBidAmount: tenderTotals.finalBid * (1 - (discountPct / 100)),
      notes: submissionNotes,
      status: 'Pending',
      attachmentName: 'Bid_Proposal_Document.zip'
    });
    updateTender(activeTender.id, { status: 'Submitted' });
    setIsSubmitBidModalOpen(false);
    setSubmissionNotes('');
    setDiscountPct(0);
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      
      {/* Dynamic Conversion Progress Overlay */}
      {isConvertingOverlayOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in text-[13px]">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-lg w-full text-center space-y-6 animate-scale-up">
            {!conversionResult ? (
              <div className="space-y-4 py-8">
                <RefreshCw size={44} className="mx-auto text-primary-600 animate-spin" />
                <h3 className="text-lg font-black text-slate-800">Processing Pre-Contract Commercial Data</h3>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Synthesizing active Tender estimates, structuring master BOQ divisions, parsing overhead parameters, and generating live Post-Contract workspace...
                </p>
                <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full animate-progress-bar w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-left">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-lg font-black text-center text-slate-900 leading-none">Tender Workspace Converted Successfully!</h3>
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

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-amber-500 font-bold animate-pulse">
                    ♻ Refreshed layout context safely. Syncing workspace switcher state...
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setIsConvertingOverlayOpen(false);
                    // Select project and refresh page to load context updates
                    localStorage.setItem('buildops_selected_project_id', conversionResult.projectId);
                    window.location.reload();
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Launch Post-Contract Project Workspace <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}      {/* Integrated Workspace Architecture */}
      {!selectedTenderId && activeSubTab !== 'tender-dashboard' && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Division</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                <Briefcase className="text-primary-600" size={20} /> Tender Directory Deck
              </h2>
              <p className="text-slate-550 text-xs">Launch a customized, isolated pre-contract workspace by clicking any tender opportunity below.</p>
            </div>
            
            <button 
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
                  assignedEstimator: 'Suren Jayasinghe (Lead PM)',
                  currency: 'LKR',
                  description: '',
                  submissionMethod: 'Electronic Portal',
                  notes: '',
                  marginPercent: 12,
                  overheadPercent: 6,
                });
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-600 font-extrabold hover:bg-primary-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow transition-all hover:shadow-lg cursor-pointer"
            >
              <Plus size={15} /> Create Tender Opportunity
            </button>
          </div>

          {/* Directory Context Alert for other subtabs */}
          {activeSubTab !== 'tender-dashboard' && activeSubTab !== 'tender-opportunities' && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 text-amber-800">
              <span className="p-1 px-2 bg-amber-100 rounded text-xs font-black font-mono">WORKSPACE REQUIRED</span>
              <div className="space-y-0.5">
                <p className="font-bold text-xs">A specific tender workspace is required to view the requested tab "{activeSubTab.replace('tender-', '').toUpperCase()}".</p>
                <p className="text-[11px] text-amber-700/90 leading-tight">Please select one of the professional tender opportunities below to launch its isolated editing suite.</p>
              </div>
            </div>
          )}

          {/* Overarching Pre-Contract Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-xs">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Active Opportunities</p>
              <h3 className="text-xl font-black text-slate-800 mt-1">{tenders.filter(t => ['Draft', 'Estimating', 'Reviewing'].includes(t.status)).length} Tenders</h3>
              <p className="text-[10.5px] text-slate-400 mt-1">Estimators preparing bids</p>
            </div>
            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-xs">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Submitted Envelopes</p>
              <h3 className="text-xl font-black text-purple-700 mt-1">{tenders.filter(t => t.status === 'Submitted').length} Pending</h3>
              <p className="text-[10.5px] text-slate-400 mt-1">Pending client responses</p>
            </div>
            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-xs">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Tenders Won / Awarded</p>
              <h3 className="text-xl font-black text-emerald-600 mt-1">{tenders.filter(t => t.status === 'Awarded').length} Awarded</h3>
              <p className="text-[10.5px] text-emerald-600/90 font-semibold mt-1">Ready for Post-Contract build</p>
            </div>
            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-xs">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Consolidated Value Pool</p>
              <h3 className="text-xl font-black text-slate-800 mt-1">{formatCurrency(tenders.reduce((sum, t) => sum + t.estimatedValue, 0))} LKR</h3>
              <p className="text-[10.5px] text-slate-400 mt-1">Est. commercial baseline</p>
            </div>
          </div>

          {/* Directory Ledger Filters & Card Deck */}
          <div className="bg-slate-50 border border-slate-200/85 rounded-xl p-4.5 space-y-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 pb-3 border-b border-slate-205">
              <h3 className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                 Opportunities Filter Base 
              </h3>
              
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-[220px]">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search tender name/number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                </div>
                
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs outline-none font-bold cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Estimating">Estimating</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Awarded">Awarded</option>
                  <option value="Lost">Lost</option>
                </select>

                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs outline-none font-bold cursor-pointer"
                >
                  <option value="All">All Divisions</option>
                  <option value="Building">Building Only</option>
                  <option value="Infrastructure">Infrastructure Only</option>
                  <option value="Road">Road Only</option>
                  <option value="Civil">Civil Only</option>
                  <option value="MEP">MEP Only</option>
                </select>
              </div>
            </div>

            {/* List of Tenders Cards Grid */}
            {filteredTenders.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-150 rounded-xl">
                <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="font-bold text-slate-700">No Pre-Contract Opportunities Found</p>
                <p className="text-xs text-slate-400">Try loosening your search terms or classification filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {filteredTenders.map((t) => {
                  return (
                    <div 
                      key={t.id} 
                      className="bg-white border border-slate-200 hover:border-primary-500 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group scale-100 hover:scale-[1.01]"
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="font-mono text-xs font-black text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded leading-none">
                            {t.tenderNo}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border leading-tight",
                            t.status === 'Awarded' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            t.status === 'Submitted' ? "bg-purple-50 text-purple-700 border-purple-100" :
                            t.status === 'Estimating' ? "bg-amber-50 text-amber-700 border-amber-100" :
                            t.status === 'Reviewing' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            t.status === 'Lost' ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-slate-100 text-slate-700 border-slate-205"
                          )}>
                            ● {t.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-sm leading-snug tracking-tight group-hover:text-primary-800 transition-colors">
                            {t.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">Client: {t.client}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" /> {t.location}
                          </p>
                        </div>

                        {/* Visual Non-Clickable Card Progress Pipeline Indicator */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1.5">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                            <span>Pipeline Stage</span>
                            <span className="text-primary-700 font-bold">{t.status}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {['Draft', 'Estimating', 'Reviewing', 'Submitted', 'Awarded'].map((step, sIdx) => {
                              const stepIndex = ['Draft', 'Estimating', 'Reviewing', 'Submitted', 'Awarded'].indexOf(t.status);
                              const currentStageIndex = ['Draft', 'Estimating', 'Reviewing', 'Submitted', 'Awarded'].indexOf(step);
                              const isCompletedOrActive = stepIndex >= currentStageIndex && t.status !== 'Lost';
                              
                              return (
                                <div 
                                  key={step} 
                                  className={cn(
                                    "h-1 px-1 rounded-full flex-1",
                                    isCompletedOrActive ? (
                                      t.status === 'Awarded' ? "bg-emerald-500" : "bg-primary-600"
                                    ) : "bg-slate-200"
                                  )}
                                  title={step}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold block">Closing Date</span>
                            <strong className="text-slate-700 font-mono text-[11.5px]">{t.submissionDate}</strong>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold block">Est. Bid Value</span>
                            <strong className="text-slate-800 font-bold text-[11.5px]">{formatCurrency(t.estimatedValue)} LKR</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTenderId(t.id);
                          if (activeSubTab === 'tender-dashboard') {
                            setActiveSubTab('tender-opportunities');
                          }
                        }}
                        className="w-full mt-4.5 py-2.5 bg-slate-900 group-hover:bg-primary-650 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-transparent"
                      >
                        Manage Tender Workspace <ArrowRight size={13} className="stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Workspace Tabs Route: If we are not on the general dashboard, choose between selected tender workspace and selection ledger */}
      {selectedTenderId && activeTender && (
        <div className="space-y-6 animate-fade-in text-[13px]">
                 {/* Simplified, Clear Tender Workspace Action Header & Interactive Status Controller */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-fade-in shadow-inner text-slate-700">
            
            {/* Top Row: Back to Ledger List & Selected Tender Title Display */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-400">Tender Management Workspace</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-black text-primary-650 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                    {activeTender.tenderNo}
                  </span>
                  <h2 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-none">
                    {activeTender.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">• {activeTender.client}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTenderId(null);
                    setActiveSubTab('tender-opportunities');
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-705 hover:text-slate-900 border border-slate-250 text-xs font-black rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                >
                  ← Back to Tender Ledger List
                </button>
              </div>
            </div>

            {/* SIMPLIFIED DEDICATED STATUS CONTROLLER FOR DRAFT, ESTIMATE, SUBMIT, AWARD */}
            <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3.5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Interactive Bidding Pathway Controls</span>
                  <p className="text-xs text-slate-500 font-medium leading-none">Change the tender status by clicking any of the steps below directly:</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Workspace Status:</span>
                  <span className={cn(
                    "text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border leading-tight shadow-xs",
                    activeTender.status === 'Awarded' ? "bg-emerald-50 text-emerald-700 border-emerald-250 animate-pulse" :
                    activeTender.status === 'Submitted' ? "bg-purple-50 text-purple-700 border-purple-200" :
                    activeTender.status === 'Reviewing' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                    activeTender.status === 'Estimating' ? "bg-amber-50 text-amber-700 border-amber-200" :
                    activeTender.status === 'Lost' ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-slate-100 text-slate-655 border-slate-250"
                  )}>
                    ● {activeTender.status}
                  </span>

                  {activeTender.status === 'Awarded' && (
                    <button 
                      onClick={handleConvertTender}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow border border-emerald-500 transition-transform hover:scale-103 cursor-pointer animate-pulse"
                    >
                      <Sparkles size={12} className="text-amber-305" /> Convert to Live Project! 🚀
                    </button>
                  )}
                </div>
              </div>

              {/* Steps Row representing Draft, Estimating, Reviewing, Submitted, Awarded clickable pipeline statuses */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { status: 'Draft', label: '1. Draft Proposal', desc: 'Configure core scope' },
                  { status: 'Estimating', label: '2. Estimating Cost', desc: 'Build BOQ & quote rates' },
                  { status: 'Reviewing', label: '3. QA/QC Reviewing', desc: 'Inspect bid margins' },
                  { status: 'Submitted', label: '4. Bid Submitted', desc: 'Officially post to client' },
                  { status: 'Awarded', label: '5. Contract Awarded', desc: 'Commission live workspace' }
                ].map((step, sIdx) => {
                  const isSelected = activeTender.status === step.status;
                  const isCompleted = ['Draft', 'Estimating', 'Reviewing', 'Submitted', 'Awarded'].indexOf(activeTender.status) >= sIdx;
                  const activeColorStyle = 
                    step.status === 'Awarded' ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white font-black" :
                    "bg-primary-600 hover:bg-primary-700 border-primary-550 text-white font-black";

                  return (
                    <button
                      key={step.status}
                      type="button"
                      onClick={() => {
                        updateTender(activeTender.id, { status: step.status as any });
                      }}
                      className={cn(
                        "flex flex-col text-left p-3 rounded-xl border transition-all hover:translate-y-[-1px] cursor-pointer shadow-xs",
                        isSelected ? (
                          activeColorStyle
                        ) : isCompleted ? (
                          "bg-primary-50 hover:bg-primary-100 border-primary-150 text-primary-900 font-bold"
                        ) : (
                          "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500"
                        )
                      )}
                      title={`Instantly set status to ${step.status}`}
                    >
                      <span className="text-[9px] uppercase font-black tracking-wider block">
                        {isSelected ? '✓ ACTIVE NOW' : `STAGE 0${sIdx + 1}`}
                      </span>
                      <span className="text-xs font-black tracking-tight block mt-0.5 whitespace-nowrap">
                        {step.label}
                      </span>
                      <span className={cn(
                        "text-[10px] font-medium block leading-tight mt-1 truncate",
                        isSelected ? "text-white/80" : "text-slate-400"
                      )}>
                        {step.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Additional Helper controls for Lost/Reset */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  💡 <strong>User Action:</strong> Adjusting bidding status dynamically updates reports and live tracking parameters.
                </span>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {activeTender.status !== 'Awarded' && activeTender.status !== 'Lost' && (
                    <button 
                      onClick={() => {
                        if (confirm(`Confirm status change to Unsuccessful Opportunity ("Lost")?`)) {
                          updateTender(activeTender.id, { status: 'Lost' });
                        }
                      }}
                      className="px-3.5 py-1 bg-white hover:bg-red-50 text-red-655 border border-slate-205 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Mark as Lost Opportunity ✗
                    </button>
                  )}
                  {activeTender.status === 'Lost' && (
                    <button 
                      onClick={() => {
                        updateTender(activeTender.id, { status: 'Estimating' });
                      }}
                      className="px-3.5 py-1 bg-white hover:bg-slate-50 text-primary-655 border border-slate-205 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Re-Open Tender (Set back to Estimating) ↺
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-navigation Menu Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-transparent">
              {[
                { id: 'tender-opportunities', label: 'Tender Overview Room', icon: Briefcase },
                { id: 'tender-boq', label: 'Bill of Quantities (BOQ)', icon: FileText },
                { id: 'tender-estimation', label: 'Cost Analysis & Margin', icon: Calculator },
                { id: 'tender-supplier-quotes', label: 'Supplier Proposals', icon: Sliders },
                { id: 'tender-subcontractor-quotes', label: 'Subcont. Bid-List', icon: User },
                { id: 'tender-revisions', label: 'Revisions & Addendums', icon: Calendar },
                { id: 'tender-bid-submission', label: 'Proposal Submission', icon: CheckCircle },
                { id: 'tender-reports', label: 'QS Summary Reports', icon: TrendingUp },
              ].map((tab) => {
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer border",
                      isSelected ? (
                        "bg-primary-900 text-white border-primary-850 shadow-md font-black"
                      ) : (
                        "bg-white text-slate-550 hover:text-slate-850 hover:bg-slate-50 border-slate-200 font-bold"
                      )
                    )}
                  >
                    {React.createElement(tab.icon, { size: 13, className: isSelected ? "text-amber-305 stroke-[2.5]" : "text-slate-400" })}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Simple, Consistent Status Metric Cards Row For Active Workspace */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm font-sans text-slate-700">
            {activeSubTab === 'tender-opportunities' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Client Partner</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTender.client}</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Closing Bid Date</span>
                  <strong className="text-slate-800 font-mono text-[13px] block mt-0.5">{activeTender.submissionDate}</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Estimated Tender Value</span>
                  <strong className="text-primary-700 font-extrabold text-[13px] block mt-0.5">{formatCurrency(activeTender.estimatedValue)} LKR</strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-boq' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Total Line Items</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTenderBOQItems.length} lines scheduled</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Total Scheduled cost</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{formatCurrency(tenderTotals.baseCost)} LKR</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Priced Items with Formulas</span>
                  <strong className="text-primary-700 font-extrabold text-[13px] block mt-0.5">{activeTenderBOQItems.filter(item => item.rateAnalysisId).length} units analyzed</strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-estimation' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Direct Base Cost</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{formatCurrency(tenderTotals.baseCost)} LKR</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Overhead & Profit Markups</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">OH: {activeTender.overheadPercent}% | GM: {activeTender.marginPercent}%</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Proposed Bid Price</span>
                  <strong className="text-primary-700 font-extrabold text-[13px] block mt-0.5">{formatCurrency(tenderTotals.finalBid)} LKR</strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-supplier-quotes' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Requests Broadcasted</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTenderSupplierQuotes.length} Proposals Requested</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active Approved Materials</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTenderSupplierQuotes.filter(q => q.status === 'Approved').length} Checked</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans font-mono">Supplier cost committed</span>
                  <strong className="text-primary-705 font-extrabold text-[13px] block mt-0.5 font-mono">{formatCurrency(activeTenderSupplierQuotes.reduce((s, q) => s + q.totalAmount, 0))} LKR</strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-subcontractor-quotes' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Work Packages</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTenderSubconQuotes.length} Portfolios</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Approved Subcontract Partners</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTenderSubconQuotes.filter(q => q.status === 'Approved').length} Approved</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Subcont value committed</span>
                  <strong className="text-primary-705 font-extrabold text-[13px] block mt-0.5 font-sans">{formatCurrency(activeTenderSubconQuotes.filter(q => q.status === 'Approved').reduce((s, q) => s + q.totalAmount, 0))} LKR</strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-revisions' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Registered Revisions</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTenderRevisions.length} Bulletins</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Original Base estimate</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{formatCurrency(activeTender.estimatedValue)} LKR</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-mono">Latest revised estimate</span>
                  <strong className="text-primary-705 font-extrabold text-[13px] block mt-0.5">
                    {formatCurrency(activeTenderRevisions.length > 0 ? (activeTenderRevisions[0].revisedEstimate || tenderTotals.finalBid) : tenderTotals.finalBid)} LKR
                  </strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-bid-submission' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Bidding Opportunity Status</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTender.status}</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Bid Amount Locked</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{formatCurrency(tenderTotals.finalBid)} LKR</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-mono font-sans">Submission Portal</span>
                  <strong className="text-primary-705 font-extrabold text-[13px] block mt-0.5">Electronic RDA Portal</strong>
                </div>
              </>
            )}

            {activeSubTab === 'tender-reports' && (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Estimated Base Value</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{formatCurrency(tenderTotals.baseCost)} LKR</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Bidding Gross Margin</span>
                  <strong className="text-slate-800 font-extrabold text-[13px] block mt-0.5">{activeTender.marginPercent}% Markup Applied</strong>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider font-sans">Proposed Bid Outlay</span>
                  <strong className="text-primary-705 font-extrabold text-[13px] block mt-0.5 font-sans">{formatCurrency(tenderTotals.finalBid)} LKR</strong>
                </div>
              </>
            )}
          </div>

          {/* Render Active Subtab Content with individual dropdown bypass */}
          
          {/* Individual Tender Workspace Dashboard Cockpit overrides general stats */}
          {activeSubTab === 'tender-dashboard' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6.5 space-y-6 animate-fade-in text-slate-655">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">WORKSPACE COCKPIT</h3>
                  <p className="text-[11px] text-slate-400">Consolidated pre-contract status for {activeTender.name}.</p>
                </div>
                <span className="text-xs text-primary-600 bg-primary-50 px-2 rounded font-bold font-mono py-0.5">ESTIMATION ONGOING</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5">
                  <span className="text-[10px] text-slate-405 font-bold uppercase block tracking-wider">BOQ Rate Schedule</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-800">{activeTenderBOQItems.length}</span>
                    <span className="text-xs text-slate-400">item entries indexed</span>
                  </div>
                  <button onClick={() => setActiveSubTab('tender-boq')} className="text-xs text-primary-600 font-extrabold hover:underline block mt-3">Configure BOQ Entries →</button>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5">
                  <span className="text-[10px] text-slate-405 font-bold uppercase block tracking-wider">Supplier/Vendor Quotes</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-800">{activeTenderSupplierQuotes.length}</span>
                    <span className="text-xs text-slate-400">proposals evaluated</span>
                  </div>
                  <button onClick={() => setActiveSubTab('tender-supplier-quotes')} className="text-xs text-primary-600 font-extrabold hover:underline block mt-3 font-bold">Inspect Quotations →</button>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5">
                  <span className="text-[10px] text-slate-405 font-bold uppercase block tracking-wider">Target Estimate Sum</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-800">{formatCurrency(tenderTotals.finalBid)}</span>
                    <span className="text-[10px] text-slate-400 pl-0.5">LKR ({activeTender.marginPercent}% margin applied)</span>
                  </div>
                  <button onClick={() => setActiveSubTab('tender-estimation')} className="text-xs text-primary-600 font-extrabold hover:underline block mt-3 font-bold font-sans">Modify Markups & Overheads →</button>
                </div>
              </div>

              <div className="p-4 bg-primary-100/10 border border-primary-200/50 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-primary-950">Next Operation Guideline:</p>
                  <p className="text-[11px] text-slate-500">Conduct detailed Cost Analysis breakout or finalize revision history before registering the official bid transmission.</p>
                </div>
                <button 
                  onClick={() => setActiveSubTab('tender-bid-submission')}
                  className="px-4 py-1.5 bg-primary-900 text-white rounded-lg text-xs hover:bg-primary-950 font-bold transition-transform cursor-pointer"
                >
                  Compile Proposal Submission
                </button>
              </div>
            </div>
          )}

          {/* Renders other sub-tabs when context ledger is active */}
        </div>
      )}

      {/* Tender Dashboard (Main Option 1) */}
      {activeSubTab === 'tender-dashboard' && !selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          {/* Header */}
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Operations</span>
              <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Tender Command Deck</h2>
              <p className="text-slate-400 text-xs">Contractor dashboard tracking tender invitations, bid estimates, and awards.</p>
            </div>
            
            <button 
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
                  assignedEstimator: 'Suren Jayasinghe (Lead PM)',
                  currency: 'LKR',
                  description: '',
                  submissionMethod: 'Electronic Portal',
                  notes: '',
                  marginPercent: 12,
                  overheadPercent: 6,
                });
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-600 font-bold hover:bg-primary-700 text-white text-xs rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus size={15} /> Create Tender Opportunity
            </button>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Active Tenders</span>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={14} /></span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{tenders.filter(t => ['Estimating', 'Reviewing'].includes(t.status)).length} Opportunities</h3>
              <p className="text-[10.5px] text-slate-400 mt-1">Estimators analyzing rate analyses</p>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Submitted Bids</span>
                <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={14} /></span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{tenders.filter(t => t.status === 'Submitted').length} Proposals</h3>
              <p className="text-[10.5px] text-slate-400 mt-1">Pending client selection boards</p>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Tenders Awarded</span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={14} /></span>
              </div>
              <h3 className="text-2xl font-black text-emerald-650 mt-2">{tenders.filter(t => t.status === 'Awarded').length} Awarded</h3>
              <p className="text-[10.5px] text-emerald-600 font-semibold mt-1">Awaiting workspace conversion</p>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Consolidated Tender Value</span>
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><DollarSign size={14} /></span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(tenders.reduce((sum, t) => sum + t.estimatedValue, 0) / 1000000)}M LKR</h3>
              <p className="text-[10.5px] text-slate-400 mt-1">Global pool estimated baseline</p>
            </div>
          </div>

          {/* Quick Stats: Deadlines and Active Pipeline Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Visual Pipeline with neat HTML styling */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 leading-none">Tender Pipeline Distribution</h4>
              <p className="text-[11px] text-slate-400">Breakdown of opportunities by pre-contract status index.</p>
              
              <div className="space-y-3.5 pt-2">
                {[
                  { status: 'Draft', color: 'bg-slate-300', count: tenders.filter(t => t.status === 'Draft').length },
                  { status: 'Estimating', color: 'bg-amber-500', count: tenders.filter(t => t.status === 'Estimating').length },
                  { status: 'Reviewing', color: 'bg-indigo-500', count: tenders.filter(t => t.status === 'Reviewing').length },
                  { status: 'Submitted', color: 'bg-purple-500', count: tenders.filter(t => t.status === 'Submitted').length },
                  { status: 'Awarded', color: 'bg-emerald-500', count: tenders.filter(t => t.status === 'Awarded').length },
                ].map(item => {
                  const pct = Math.max((item.count / tenders.length) * 100, 3);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{item.status}</span>
                        <span>{item.count} items ({Math.round(pct)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Deadlines Table */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm col-span-2 space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 leading-none">Upcoming Tender Closing Dates</h4>
                <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <Flame size={10} /> Critical Deadlines
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-50">
                      <th className="pb-2">Tender ID</th>
                      <th className="pb-2">Tender Name</th>
                      <th className="pb-2">Submission Date</th>
                      <th className="pb-2 text-right">Estimated Value</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {tenders.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono text-[11px] font-bold text-primary-600">{t.tenderNo}</td>
                        <td className="py-2.5 font-bold text-slate-800">{t.name}</td>
                        <td className="py-2.5 text-slate-500 text-xs">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Calendar size={12} className="text-slate-400" /> {t.submissionDate}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">{formatCurrency(t.estimatedValue)} LKR</td>
                        <td className="py-2.5 text-right">
                          <button 
                            onClick={() => {
                              setSelectedTenderId(t.id);
                              setActiveSubTab('tender-opportunities');
                            }}
                            className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Pending Supplier and Subcontractor bids */}
          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 leading-none">Latest Registered Supplier & Subcontractor Quotes</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                  <span>Supplier Proposals</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-150 text-blue-700 rounded-full">Materials pricing</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {supplierQuotations.slice(0, 3).map(sq => (
                    <div key={sq.id} className="p-3 text-xs flex justify-between items-center hover:bg-slate-50/20">
                      <div>
                        <p className="font-bold text-slate-900">{sq.supplier}</p>
                        <p className="text-[10.5px] text-slate-400">{sq.materialCategory}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-800">{formatCurrency(sq.amount)} {sq.currency}</p>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">{sq.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                  <span>Subcontractor Proposals</span>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-150 text-purple-700 rounded-full">Works pricing</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {subcontractorQuotations.slice(0, 3).map(sc => (
                    <div key={sc.id} className="p-3 text-xs flex justify-between items-center hover:bg-slate-50/20">
                      <div>
                        <p className="font-bold text-slate-900">{sc.subcontractor}</p>
                        <p className="text-[10.5px] text-slate-400">{sc.workCategory}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-800">{formatCurrency(sc.quotedValue)} {sc.currency}</p>
                        <span className="text-[10px] text-indigo-650 font-bold uppercase">{sc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tender Opportunities Tab VIEW */}
      {activeSubTab === 'tender-opportunities' && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract / Estimations</span>
              <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Tender Opportunities Ledger</h2>
              <p className="text-slate-400 text-xs text-[12.5px]">Manage invitations, specifications worksheets, and individual detail workspaces.</p>
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary-600 font-bold hover:bg-primary-700 text-white text-xs rounded-lg flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus size={15} /> Create Tender Opportunity
            </button>
          </div>

          {/* Table list and Quick Detail split side pane */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Listing Column */}
            <div className="xl:col-span-5 bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search ledger..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 p-1 px-2.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Estimating">Estimating</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Lost">Lost</option>
                  </select>
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="flex-1 p-1 px-2.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
                  >
                    <option value="All">All Types</option>
                    <option value="Building">Building</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Road">Road</option>
                    <option value="Civil">Civil</option>
                    <option value="MEP">MEP</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                {filteredTenders.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTenderId(t.id)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col gap-2 relative",
                      activeTender?.id === t.id ? "bg-primary-50/45 border-l-4 border-primary-600" : ""
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-primary-600 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{t.tenderNo}</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                        t.status === 'Awarded' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        t.status === 'Submitted' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                        t.status === 'Estimating' ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                        "bg-slate-100 text-slate-550 border border-slate-200"
                      )}>
                        {t.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs truncate">{t.name}</h4>
                      <p className="text-[10.5px] text-slate-400 mt-1">{t.client}</p>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100/40">
                      <span>Closing: <strong className="text-slate-600 font-mono">{t.submissionDate}</strong></span>
                      <span className="font-bold text-slate-800">{formatCurrency(t.estimatedValue)} {t.currency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Workspace Column */}
            <div className="xl:col-span-7 bg-white border border-zentrix-border rounded-xl shadow-sm p-6 space-y-6">
              {activeTender ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Title & Conversion Actions banner */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary-650 bg-slate-100 px-2 py-0.5 rounded font-black">{activeTender.tenderNo}</span>
                        <span className="text-xs text-slate-400">• {activeTender.tenderType} Division</span>
                      </div>
                      <h3 className="text-base font-black text-zentrix-blue mt-1.5 leading-tight">{activeTender.name}</h3>
                    </div>

                    <div className="flex gap-2">
                      {activeTender.status === 'Awarded' && (
                        <button 
                          onClick={handleConvertTender}
                          className="px-4.5 py-2.5 bg-emerald-600 font-black hover:bg-emerald-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow"
                        >
                          <Sparkles size={14} className="text-amber-300 animate-pulse" /> Converted Workspace
                        </button>
                      )}
                      
                      {activeTender.status !== 'Awarded' && activeTender.status !== 'Lost' && (
                        <button 
                          onClick={() => {
                            if (confirm('Mark this Tender Opportunity as formally Awarded?')) {
                              updateTender(activeTender.id, { status: 'Awarded' });
                            }
                          }}
                          className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs rounded-lg font-bold"
                        >
                          Mark Awarded ✓
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary / Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Client Organization</p>
                      <p className="text-slate-800 font-bold block mt-0.5">{activeTender.client}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Consulting Engineers</p>
                      <p className="text-slate-800 font-bold block mt-0.5">{activeTender.consultant}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Closing Bid Date</p>
                      <p className="text-slate-800 font-bold block mt-0.5 font-mono">{activeTender.submissionDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Assigned Lead QS Estimator</p>
                      <p className="text-slate-800 font-bold block mt-0.5">{activeTender.assignedEstimator}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Project Location Scope</p>
                      <p className="text-slate-800 font-bold block mt-0.5 flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {activeTender.location}</p>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 text-xs">Pre-Contract Tender Scope Description</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{activeTender.description}</p>
                  </div>

                  {/* Workspace Menu Shortcuts */}
                  <div className="bg-primary-50/30 border border-primary-100/50 rounded-xl p-4.5 space-y-3">
                    <h4 className="font-bold text-primary-950 text-xs">Pre-Contract Estimation Submenus Shortcut</h4>
                    <p className="text-[11px] text-slate-500">Jump directly to specialized bid-prep sub-modules linked to this tender:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button onClick={() => setActiveSubTab('tender-boq')} className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-700 font-bold transition-all truncate">Tender BOQ</button>
                      <button onClick={() => setActiveSubTab('tender-estimation')} className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-700 font-bold transition-all truncate">Estimation</button>
                      <button onClick={() => setActiveSubTab('tender-supplier-quotes')} className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-700 font-bold transition-all truncate">Quotes</button>
                      <button onClick={() => setActiveSubTab('tender-bid-submission')} className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-700 font-bold transition-all truncate">Submission</button>
                    </div>
                  </div>

                  {/* Attachment Document Management Area */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner bg-slate-50/25">
                    <h4 className="font-bold text-slate-800 text-xs leading-none">Tender Specifications & Drawings (DMS Simulator)</h4>
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-slate-100 text-slate-500 rounded"><FileText size={16} /></span>
                        <div>
                          <p className="font-bold text-xs text-slate-800">TND_Drawings_ElevatedPierLimits_V2.pdf</p>
                          <p className="text-[10px] text-slate-400">18.5 MB • Version 2.0 • Ingested via RDA Portal</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold">Standard PDF</span>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-white transition-all cursor-pointer">
                      <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-700">Attach and upload addendums</p>
                      <p className="text-[10px] text-slate-400">Supports PDF, XLSX up to 30MB</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-24 text-slate-400">
                  <Briefcase size={36} className="mx-auto mb-2 text-slate-350" />
                  <p className="font-bold">No Tender Opportunity Selected</p>
                  <p className="text-xs">Click on any tender opportunity in the left ledger to launch your workspace.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Tender BOQ Module (Option 3) */}
      {activeSubTab === 'tender-boq' && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Estimations</span>
              <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Tender Bill of Quantities (BOQ)</h2>
              <p className="text-slate-400 text-xs">Verify breakdown structures, adjust quantities, or link items to rate analysis formulas.</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddBoqItemOpen(true)}
                className="px-4 py-2 bg-primary-600 font-bold hover:bg-primary-700 text-white text-xs rounded-lg flex items-center gap-1.5 shadow"
              >
                <Plus size={15} /> Add BOQ Item
              </button>
            </div>
          </div>

          {/* Core Tender info Banner */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Active Tender Draft Scope</p>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">{activeTender ? activeTender.name : 'Unknown scope'}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Reference No: {activeTender?.tenderNo}</p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black">Summed Base Cost</p>
              <h4 className="font-bold text-zentrix-blue text-lg">{formatCurrency(tenderTotals.baseCost)} {activeTender?.currency}</h4>
            </div>
          </div>

          {/* Tender BOQ Compact Table */}
          <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-zentrix-border text-slate-400 font-extrabold text-[10.5px] uppercase tracking-wider">
                  <th className="pl-6 py-3 w-32">Item Code</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 w-20">Unit</th>
                  <th className="px-4 py-3 w-28 text-right">Draft Qty</th>
                  <th className="px-4 py-3 w-32 text-right">Rate build-up</th>
                  <th className="px-4 py-3 w-32 text-right">Summed Amount</th>
                  <th className="pr-6 py-3 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activeTenderBOQItems.length > 0 ? (
                  activeTenderBOQItems.map(item => {
                    const isSection = item.type === 'SECTION';
                    const isEditing = editingItemId === item.id;
                    
                    return (
                      <tr 
                        key={item.id} 
                        className={cn(
                          "transition-colors hover:bg-slate-50/20",
                          isSection ? "bg-slate-50/75 text-slate-800 font-black" : "text-slate-650"
                        )}
                      >
                        <td className={cn("pl-6 py-3 font-mono", isSection ? "font-extrabold text-slate-900" : "font-semibold text-primary-650")}>
                          {item.code}
                        </td>
                        <td className="px-4 py-3 max-w-sm sm:max-w-md">
                          <div className="flex flex-col">
                            <span className="font-medium whitespace-normal balance">{item.description}</span>
                            {item.remarks && <span className="text-[10px] text-slate-400 mt-1">{item.remarks}</span>}
                            {item.rateAnalysisId && (
                              <span className="text-[10px] text-indigo-500 font-bold mt-1 inline-flex items-center gap-0.5">
                                 Rate analysis linked ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">{isSection ? '-' : item.unit}</td>
                        
                        {/* Quantity Field */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                          {isSection ? '-' : (
                            isEditing ? (
                              <input 
                                type="number" 
                                value={editItemQty}
                                onChange={(e) => setEditItemQty(Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-white border border-slate-350 rounded text-right scale-95"
                              />
                            ) : item.quantity
                          )}
                        </td>

                        {/* Rate Field */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                          {isSection ? '-' : (
                            isEditing ? (
                              <input 
                                type="number" 
                                value={editItemRate}
                                onChange={(e) => setEditItemRate(Number(e.target.value))}
                                className="w-24 px-2 py-1 bg-white border border-slate-350 rounded text-right scale-95"
                              />
                            ) : formatCurrency(item.rate || 0)
                          )}
                        </td>

                        {/* Amount Summed */}
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900">
                          {isSection ? '-' : formatCurrency(item.amount || 0)}
                        </td>

                        {/* Actions column */}
                        <td className="pr-6 py-3 text-center">
                          {isSection ? (
                            <button 
                              onClick={() => handleDeleteBoqItem(item.id)}
                              className="p-1 hover:text-red-650 text-slate-400"
                              title="Delete Section Division"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <div className="flex justify-center gap-1.5">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={() => handleSaveInlineEdit(item)}
                                    className="p-1 bg-emerald-50 text-emerald-605 border border-emerald-200 rounded text-[10px] font-bold px-1.5"
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditingItemId(null)}
                                    className="p-1 bg-slate-50 text-slate-500 border border-slate-200 rounded text-[10px] font-bold px-1.5"
                                  >
                                    X
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
                                    className="p-1 text-slate-400 hover:text-slate-750"
                                    title="Edit inline"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteBoqItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-red-650"
                                    title="Delete Item"
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
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-450 border-t border-slate-100">
                      <Briefcase size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-bold">Tender BOQ Workspace is empty</p>
                      <p className="text-[11px] text-slate-400 mt-1">Start manually adding division sections or specific items.</p>
                      <button 
                        onClick={() => setIsAddBoqItemOpen(true)}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold"
                      >
                        + Create First Entry
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Estimation Module (Option 4) */}
      {activeSubTab === 'tender-estimation' && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Estimations</span>
            <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Tender Commercial Estimation Build-up</h2>
            <p className="text-slate-400 text-xs text-[12.5px]">Control markup profit allowances, apply overhead coefficients, and evaluate subcontractor competitive quotes.</p>
          </div>

          {/* Summaries Cards Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm text-left">
              <p className="text-[10px] text-slate-400 uppercase font-black">Summed Base Cost</p>
              <h3 className="text-xl font-black text-slate-900 mt-1.5">{formatCurrency(tenderTotals.baseCost)} LKR</h3>
              <p className="text-[10px] text-slate-400 mt-1">Sourced from active BOQ schedule</p>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm text-left">
              <p className="text-[10px] text-slate-400 uppercase font-black">Company Site Overheads ({activeTender?.overheadPercent}%)</p>
              <h3 className="text-xl font-black text-indigo-650 mt-1.5">+{formatCurrency(tenderTotals.overheads)} LKR</h3>
              <p className="text-[10px] text-slate-400 mt-1">For insurance, security, logistics</p>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm text-left">
              <p className="text-[10px] text-slate-400 uppercase font-black">Company Target Margin ({activeTender?.marginPercent}%)</p>
              <h3 className="text-xl font-black text-emerald-650 mt-1.5">+{formatCurrency(tenderTotals.profit)} LKR</h3>
              <p className="text-[10px] text-slate-400 mt-1">Net gross profit target</p>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm text-left col-span-2 bg-gradient-to-br from-primary-900 to-primary-950 text-white border-primary-800">
              <p className="text-[10px] text-primary-300 uppercase font-black tracking-wider">Final Bid Pricing Value</p>
              <h3 className="text-2xl font-black mt-1.5 text-white">{formatCurrency(tenderTotals.finalBid)} LKR</h3>
              <p className="text-[10px] text-primary-200 mt-1 font-semibold">Tender proposal submission total</p>
            </div>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Rates Adjustment Form Panel */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-800 leading-none">Estimation Coefficients Editor</h4>
              <p className="text-slate-400 text-xs">Instantly updates the proposal bid value with direct calculations.</p>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <label>Target Net Profit Margin</label>
                    <span className="text-primary-600 font-mono">{activeTender?.marginPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="25" 
                    value={activeTender?.marginPercent || 10}
                    onChange={(e) => {
                      if (activeTender) {
                        updateTender(activeTender.id, { marginPercent: Number(e.target.value) });
                      }
                    }}
                    className="w-full accent-primary-600"
                  />
                  <span className="text-[10.5px] text-slate-400 block">Typical Middle East rate: 8-15% range.</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <label>Assigned Site Overheads</label>
                    <span className="text-indigo-650 font-mono">{activeTender?.overheadPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={activeTender?.overheadPercent || 5}
                    onChange={(e) => {
                      if (activeTender) {
                        updateTender(activeTender.id, { overheadPercent: Number(e.target.value) });
                      }
                    }}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10.5px] text-slate-400 block">Covers supervision and local bond guarantees.</span>
                </div>
              </div>
            </div>

            {/* In-House Estimation Detail Sheet */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm xl:col-span-2 space-y-3.5">
              <h4 className="font-extrabold text-slate-800 leading-none">Individual BOQ Estimated Rate Breakdowns</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Code</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">In-house Base Rate</th>
                      <th className="pb-2 text-right">Calculated Yield Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeTenderBOQItems
                      .filter(i => i.type === 'ITEM')
                      .map(item => {
                        const mup = activeTender ? (activeTender.marginPercent + activeTender.overheadPercent) / 100 : 0.15;
                        const finalRate = (item.rate || 0) * (1 + mup);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-mono font-bold text-primary-650">{item.code}</td>
                            <td className="py-2.5 font-medium text-slate-800 truncate max-w-xs">{item.description}</td>
                            <td className="py-2.5 text-right font-mono font-semibold text-slate-700">{item.quantity}</td>
                            <td className="py-2.5 text-right font-mono text-slate-500">{formatCurrency(item.rate || 0)}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(finalRate)} LKR</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Supplier & Subcontractor Quotations Tabs (Options 5 & 6) */}
      {(activeSubTab === 'tender-supplier-quotes' || activeSubTab === 'tender-subcontractor-quotes') && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Estimations</span>
              <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">
                {activeSubTab === 'tender-supplier-quotes' ? 'Supplier Materials Quotations' : 'Subcontractor Scopes Quotations'}
              </h2>
              <p className="text-slate-400 text-xs">Track active requests, record submitted prices, and mark preferred commercial bids.</p>
            </div>
            
            <button 
              onClick={() => {
                setQuoteType(activeSubTab === 'tender-supplier-quotes' ? 'supplier' : 'subcontractor');
                if (activeTender) {
                  setSupplierFormData(prev => ({ ...prev, tenderId: activeTender.id }));
                  setSubconFormData(prev => ({ ...prev, tenderId: activeTender.id }));
                }
                setIsQuoteModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-600 font-bold hover:bg-primary-700 text-white text-xs rounded-lg flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus size={15} /> Add Proposal Quote
            </button>
          </div>

          {/* Quotations Compact Card view */}
          {activeSubTab === 'tender-supplier-quotes' ? (
            <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-zentrix-border text-slate-400 font-bold text-[10.5px] uppercase tracking-wider">
                    <th className="pl-6 py-3">Vendor / Supplier</th>
                    <th className="px-4 py-3">Product Category</th>
                    <th className="px-4 py-3">Quoted Amount</th>
                    <th className="px-4 py-3 text-center">Delivery Window</th>
                    <th className="px-4 py-3">Proposal Status</th>
                    <th className="pr-6 py-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeTenderSupplierQuotes.length > 0 ? (
                    activeTenderSupplierQuotes.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/50">
                        <td className="pl-6 py-3 font-bold text-slate-800">{q.supplier}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{q.materialCategory}</td>
                        <td className="px-4 py-3 font-mono font-black text-slate-900">{formatCurrency(q.amount)} {q.currency}</td>
                        <td className="px-4 py-3 font-mono text-center text-slate-700">{q.deliveryPeriod}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                            q.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            q.status === 'Received' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-red-50 text-red-650"
                          )}>
                            {q.status}
                          </span>
                        </td>
                        <td className="pr-6 py-3 text-right text-slate-400 font-medium italic">{q.remarks || 'None'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">No Supplier proposals registered for this tender yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-zentrix-border text-slate-400 font-bold text-[10.5px] uppercase tracking-wider">
                    <th className="pl-6 py-3">Subcontractor</th>
                    <th className="px-4 py-3">Specialty Scope</th>
                    <th className="px-4 py-3">Quoted Proposal Amount</th>
                    <th className="px-4 py-3 text-center">Completion Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="pr-6 py-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeTenderSubconQuotes.length > 0 ? (
                    activeTenderSubconQuotes.map(sc => (
                      <tr key={sc.id} className="hover:bg-slate-50/50">
                        <td className="pl-6 py-3 font-bold text-slate-800">{sc.subcontractor}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{sc.workCategory}</td>
                        <td className="px-4 py-3 font-mono font-black text-slate-900">{formatCurrency(sc.quotedValue)} {sc.currency}</td>
                        <td className="px-4 py-3 font-mono text-center text-slate-700">{sc.duration}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded font-black uppercase text-[10px]",
                            sc.status === 'Selected' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            sc.status === 'Submitted' ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-slate-100 text-slate-400"
                          )}>
                            {sc.status}
                          </span>
                        </td>
                        <td className="pr-6 py-3 text-right text-slate-400 font-medium italic">{sc.remarks || 'None'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">No Subcontractor quotes registered for this tender yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tender Revisions (Option 7) */}
      {activeSubTab === 'tender-revisions' && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Estimations</span>
              <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Tender Revisions & Client Addendums</h2>
              <p className="text-slate-400 text-xs">Record incoming RFP changes, modifications in bill items quantities, and track estimations version history.</p>
            </div>
            
            <button 
              onClick={() => setIsRevisionModalOpen(true)}
              className="px-4 py-2 bg-primary-600 font-bold hover:bg-primary-700 text-white text-xs rounded-lg flex items-center gap-1 shadow cursor-pointer mr-0.5"
            >
              <Plus size={15} /> Add Revision Tracker
            </button>
          </div>

          {/* Revisions list */}
          <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-zentrix-border text-slate-400 font-bold text-[10.5px] uppercase tracking-wider">
                  <th className="pl-6 py-3 w-40">Revision Code</th>
                  <th className="px-4 py-3">Description of Changes</th>
                  <th className="px-4 py-3 w-40">Registered Date</th>
                  <th className="px-4 py-3 w-48">Prepared By</th>
                  <th className="px-4 py-3 w-32">Status</th>
                  <th className="pr-6 py-3 text-right">Revised Cost Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activeTenderRevisions.length > 0 ? (
                  activeTenderRevisions.map(rev => (
                    <tr key={rev.id} className="hover:bg-slate-50/50">
                      <td className="pl-6 py-3 font-mono font-bold text-primary-650">{rev.revisionNo}</td>
                      <td className="px-4 py-3 font-medium text-slate-850 balance">{rev.description}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rev.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{rev.revisedBy}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold uppercase">{rev.status}</span>
                      </td>
                      <td className="pr-6 py-3 text-right font-mono font-black text-slate-900">{formatCurrency(rev.revisedEstimate)} LKR</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">No revisions mapped for this tender opportunity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Bid Submission (Option 8) */}
      {activeSubTab === 'tender-bid-submission' && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600 font-sans">
          
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Estimations</span>
            <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Proposal Submission & Results</h2>
            <p className="text-slate-400 text-xs">Finalize bid proposals, input submitted contract values and discount parameters, and convert awarded results.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Form submission card */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-800 leading-none">Compile Tender Submission</h4>
              <p className="text-slate-400 text-xs">Applies financial discount matrices onto built-up estimates for physical bid envelope packing.</p>
              
              {activeTenderSubmission ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4.5 space-y-3">
                  <h5 className="font-bold text-emerald-805 text-xs flex items-center gap-1.5 leading-none">
                     Bid Proposal Submitted
                  </h5>
                  <div className="divide-y divide-emerald-100 text-xs text-slate-700">
                    <div className="flex justify-between py-1.5">
                      <span>Submitted Reference:</span>
                      <span className="font-bold">{activeTenderSubmission.submissionNo}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Date Submitted:</span>
                      <span className="font-bold text-slate-700">{activeTenderSubmission.submittedDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Applied Discount:</span>
                      <span className="font-bold">{activeTenderSubmission.discountPercent}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Total Bid Amount:</span>
                      <span className="font-bold font-mono text-slate-900">{formatCurrency(activeTenderSubmission.finalBidAmount)} LKR</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block text-left">Proposed Gross Value (LKR)</label>
                    <input 
                      type="text" 
                      disabled 
                      value={formatCurrency(tenderTotals.finalBid)} 
                      className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <label>Applied Board Discount (%)</label>
                      <span className="font-mono text-primary-600">{discountPct}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="0.5"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(Number(e.target.value))}
                      className="w-full accent-primary-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block text-left">Compiled Net Bid Offer</label>
                    <div className="w-full p-2.5 bg-slate-900 text-white rounded-xl font-mono text-lg font-black text-center">
                      {formatCurrency(tenderTotals.finalBid * (1 - (discountPct / 100)))} LKR
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsSubmitBidModalOpen(true)}
                    className="w-full py-2 bg-primary-650 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer text-center block"
                  >
                     Lock & Submit Project Proposal Bid
                  </button>
                </div>
              )}
            </div>

            {/* Results tracking list */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm xl:col-span-2 space-y-4">
              <h4 className="font-extrabold text-slate-850 leading-none">Formal Submission Register</h4>
              <p className="text-slate-400 text-xs">Audit tracking entries for registered proposals sent to Sri Lankan/Middle East contracting agencies.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Sub Ref</th>
                      <th className="pb-2">Gross Proposal</th>
                      <th className="pb-2 text-center">Discount</th>
                      <th className="pb-2 text-right">Discounted Bid Amount</th>
                      <th className="pb-2 text-center">Opening Date</th>
                      <th className="pr-2 pb-2 text-right">Result Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {bidSubmissions.map(subIndex => (
                      <tr key={subIndex.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono font-bold text-primary-600">{subIndex.submissionNo}</td>
                        <td className="py-2.5 font-mono font-bold text-slate-650">{formatCurrency(subIndex.submittedAmount)} LKR</td>
                        <td className="py-2.5 text-center font-mono font-semibold text-slate-500">{subIndex.discountPercent}%</td>
                        <td className="py-2.5 text-right font-mono font-black text-slate-900">{formatCurrency(subIndex.finalBidAmount)} LKR</td>
                        <td className="py-2.5 text-center text-slate-500">{subIndex.submittedDate}</td>
                        <td className="py-2.5 text-right">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide",
                            subIndex.status === 'Awarded' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            subIndex.status === 'Pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-500"
                          )}>
                            {subIndex.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tender Reports (Option 9) */}
      {activeSubTab === 'tender-reports' && selectedTenderId && (
        <div className="space-y-6 animate-fade-in text-[13px] text-slate-600 font-sans">
          
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Pre-Contract Estimations</span>
            <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Commercial QS Estimations Reports</h2>
            <p className="text-slate-400 text-xs">Printable executive summaries for company bids, quotations evaluation worksheets, and conversion logs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Tender Summary Report */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
              <span className="p-2 bg-indigo-50 text-indigo-650 rounded-lg inline-block text-xs font-bold leading-none"><FileCheck size={16} /> Commercial QS summary</span>
              <h4 className="font-extrabold text-slate-800 leading-none">RDA Elevated Expressway Package (C3)</h4>
              <p className="text-slate-405 text-xs">Consolidated pricing worksheets prepared for board approval session.</p>
              
              <div className="space-y-2 border-t border-dashed border-slate-150 pt-3 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span>Gross Built Estimate:</span>
                  <span className="font-bold text-slate-800">18,450,000 LKR</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Margin Allowed:</span>
                  <span className="font-bold text-emerald-600">2,214,000 LKR (12%)</span>
                </div>
                <div className="flex justify-between">
                  <span>General Overheads:</span>
                  <span className="font-bold text-indigo-650">1,476,000 LKR (8%)</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900 text-sm">
                  <span>Compiled Bid Offer:</span>
                  <span>22,140,000 LKR</span>
                </div>
              </div>
              
              <button 
                onClick={() => alert('Opening compiled PDF worksheet simulator... Saved in pre-contract logs registry.')}
                className="w-full py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors text-center"
              >
                Download Compiled PDF Worksheet
              </button>
            </div>

            {/* Quotations Evaluation Worksheets SUMMARY */}
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
              <span className="p-2 bg-purple-50 text-purple-650 rounded-lg inline-block text-xs font-bold leading-none"><Calculator size={16} /> SCM quotes analysis</span>
              <h4 className="font-extrabold text-slate-800 leading-none">Dubai South Aerospace Hangar 4B</h4>
              <p className="text-slate-405 text-xs">Aggregated vendor supplier prices compared to standard in-house estimative averages.</p>
              
              <div className="space-y-2 border-t border-dashed border-slate-150 pt-3 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span>Jotun UAE Paints Quote:</span>
                  <span className="font-bold text-emerald-600">1,250,000 AED [Preferred]</span>
                </div>
                <div className="flex justify-between">
                  <span>Reinforcement Steel Quote:</span>
                  <span className="font-bold text-slate-700">Lanwa Sanstha [Active]</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900 text-sm">
                  <span>Total External Bids Sourced:</span>
                  <span>5 Registered Quotes</span>
                </div>
              </div>
              
              <button 
                onClick={() => alert('SCM quotations evaluated worksheet downloaded successfully.')}
                className="w-full py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors text-center"
              >
                Download SCM Evaluation Matrix
              </button>
            </div>

          </div>

        </div>
      )}

      {/* CREATE TENDER OPPORTUNITY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs">
          <form 
            onSubmit={handleCreateTenderSubmit}
            className="bg-white rounded-2xl border border-zentrix-border shadow-2xl p-6.5 max-w-lg w-full text-left space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zentrix-blue flex items-center gap-1.5 leading-none">
                <Briefcase size={16} className="text-primary-600" /> Create Tender Opportunity
              </h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tender Reference No*</label>
                <input 
                  type="text" 
                  value={newTender.tenderNo}
                  onChange={(e) => setNewTender({ ...newTender, tenderNo: e.target.value })}
                  placeholder="e.g. TND-2026-COL-095"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tender Name*</label>
                <input 
                  type="text" 
                  value={newTender.name}
                  onChange={(e) => setNewTender({ ...newTender, name: e.target.value })}
                  placeholder="e.g. Galle Face Pier Extension"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Client Organization*</label>
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
                <label className="font-bold text-slate-700">Consultant Engineer</label>
                <input 
                  type="text" 
                  value={newTender.consultant}
                  onChange={(e) => setNewTender({ ...newTender, consultant: e.target.value })}
                  placeholder="e.g. State Engineering Corp"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tender Division Class</label>
                <select 
                  value={newTender.tenderType}
                  onChange={(e) => setNewTender({ ...newTender, tenderType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                <label className="font-bold text-slate-700">Submission Closing Date</label>
                <input 
                  type="date" 
                  value={newTender.submissionDate}
                  onChange={(e) => setNewTender({ ...newTender, submissionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Scopes / Opportunity Description</label>
                <textarea 
                  rows={2}
                  value={newTender.description}
                  onChange={(e) => setNewTender({ ...newTender, description: e.target.value })}
                  placeholder="Describe precast concrete piles, pavement guidelines, or core scope parameters..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs"
              >
                Add Opportunity Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPONENT DRAWER: CREATE BOQ ITEM */}
      {isAddBoqItemOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs">
          <form 
            onSubmit={handleCreateBoqItem}
            className="bg-white rounded-2xl border border-zentrix-border shadow-2xl p-6.5 max-w-md w-full text-left space-y-4 animate-scale-up text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zentrix-blue flex items-center gap-1.5 leading-none">
                 Add Bill of Quantities Core Item
              </h3>
              <button type="button" onClick={() => setIsAddBoqItemOpen(false)} className="text-slate-405 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Item Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => { setBoqItemType('ITEM'); setNewBoqItem({ ...newBoqItem, code: 'B.4' }); }}
                    className={cn("flex-1 py-1.5 border rounded-lg text-center font-bold", boqItemType === 'ITEM' ? "border-primary-600 text-primary-600 bg-primary-50/20" : "border-slate-200 text-slate-500")}
                  >
                    BOQ Rate Item
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setBoqItemType('SECTION'); setNewBoqItem({ ...newBoqItem, code: 'C' }); }}
                    className={cn("flex-1 py-1.5 border rounded-lg text-center font-bold", boqItemType === 'SECTION' ? "border-primary-600 text-primary-600 bg-primary-50/20" : "border-slate-200 text-slate-500")}
                  >
                    Division Section
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Unified Item Code / Division Code*</label>
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
                <label className="font-bold text-slate-700">Detailed Description*</label>
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
                    <label className="font-bold text-slate-700">Unit</label>
                    <input 
                      type="text" 
                      value={newBoqItem.unit}
                      onChange={(e) => setNewBoqItem({ ...newBoqItem, unit: e.target.value })}
                      placeholder="e.g. m3"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Quantity</label>
                    <input 
                      type="number" 
                      value={newBoqItem.quantity}
                      onChange={(e) => setNewBoqItem({ ...newBoqItem, quantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Unit Rate (LKR)</label>
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
                  <label className="font-bold text-slate-700">Link Rate Analysis reference</label>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                  <label className="font-bold text-slate-700">Parent Division Section</label>
                  <select 
                    value={newBoqItem.parentId}
                    onChange={(e) => setNewBoqItem({ ...newBoqItem, parentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="">-- Main level --</option>
                    {activeTenderBOQItems.filter(i => i.type === 'SECTION').map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.code} - {sec.description}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsAddBoqItemOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs"
              >
                Create BOQ Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REGISTER PROPOSAL QUOTATION MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs text-xs">
          <form 
            onSubmit={handleAddQuotation}
            className="bg-white rounded-2xl border border-zentrix-border shadow-2xl p-6.5 max-w-md w-full text-left space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zentrix-blue flex items-center gap-1.5 leading-none">
                 Register Proposal Quote
              </h3>
              <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="text-slate-405 hover:text-slate-600 font-bold">✕</button>
            </div>

            {quoteType === 'supplier' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Vendor / Supplier Name*</label>
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
                  <label className="font-bold text-slate-700">Materials Category*</label>
                  <select 
                    value={supplierFormData.materialCategory}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, materialCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                    <label className="font-bold text-slate-700">Amount Offer*</label>
                    <input 
                      type="number" 
                      value={supplierFormData.amount}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Currency</label>
                    <input 
                      type="text" 
                      value={supplierFormData.currency}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Delivery Period / Turnaround</label>
                  <input 
                    type="text" 
                    value={supplierFormData.deliveryPeriod}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, deliveryPeriod: e.target.value })}
                    placeholder="e.g. Within 4 hours"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Technical Remarks</label>
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
                  <label className="font-bold text-slate-700">Subcontractor Name*</label>
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
                  <label className="font-bold text-slate-700">Specialty Scope Division*</label>
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
                    <label className="font-bold text-slate-700">Bid Amount Offer*</label>
                    <input 
                      type="number" 
                      value={subconFormData.quotedValue}
                      onChange={(e) => setSubconFormData({ ...subconFormData, quotedValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-right font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Duration Required</label>
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
                  <label className="font-bold text-slate-700">Technical Scope Remarks</label>
                  <textarea 
                    rows={2}
                    value={subconFormData.remarks}
                    onChange={(e) => setSubconFormData({ ...subconFormData, remarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs"
              >
                Register Bid Offer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TENDER REVISIONS MODAL */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs text-xs">
          <form 
            onSubmit={handleAddRevisionSubmit}
            className="bg-white rounded-2xl border border-zentrix-border shadow-2xl p-6.5 max-w-md w-full text-left space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zentrix-blue flex items-center gap-1.5 leading-none">
                 Add Revision Tracker
              </h3>
              <button type="button" onClick={() => setIsRevisionModalOpen(false)} className="text-slate-405 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description of Client Changes / Addendums*</label>
                <textarea 
                  rows={3}
                  value={revNotes}
                  onChange={(e) => setRevNotes(e.target.value)}
                  placeholder="e.g. Revised realignment of piling corridor under Colombo Port expansion interface limit."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Revised Cost Estimate (LKR)</label>
                <input 
                  type="number" 
                  value={revEstimate}
                  onChange={(e) => setRevEstimate(Number(e.target.value))}
                  placeholder="Defaults to active sum"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs"
              >
                Add Revision History
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPRESS BID SUBMISSION MODAL */}
      {isSubmitBidModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-xs text-xs">
          <form 
            onSubmit={handleAddSubmissionSubmit}
            className="bg-white rounded-2xl border border-zentrix-border shadow-2xl p-6.5 max-w-sm w-full text-left space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zentrix-blue flex items-center gap-1.5 leading-none">
                 Finalize Bid Proposal Submission
              </h3>
              <button type="button" onClick={() => setIsSubmitBidModalOpen(false)} className="text-slate-405 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-slate-500 leading-normal">
              You are locking the current base estimate of <strong className="text-slate-900 font-mono">{formatCurrency(tenderTotals.finalBid)} LKR</strong> with discount coefficient of <strong className="text-slate-900">{discountPct}%</strong>. This formally moves the pre-contract opportunity status to <span className="bg-purple-50 text-purple-650 px-1.5 font-bold uppercase rounded text-[10px]">Submitted</span>.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Submission Reference Document ID</label>
                <input 
                  type="text" 
                  disabled 
                  value={`SUB-TND-${Math.floor(1000 + Math.random() * 9000)}`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none font-mono text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Proposal Tender Scope Notes / Remarks</label>
                <textarea 
                  rows={2}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Filed online via tejarat portal with comprehensive project resume..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsSubmitBidModalOpen(false)}
                className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs hover:shadow-lg transition-transform hover:scale-105"
              >
                Transmit Final Bid Envelope
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
