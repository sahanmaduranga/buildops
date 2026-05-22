import React, { useState } from 'react';
import { useCommercial, type IPC, type IPCLineItem, type IPCComment, type IPCAttachment } from '../../context/CommercialContext.tsx';
import { useProgress } from '../../context/ProgressContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  FileText, 
  ArrowLeft,
  Calendar,
  Layers,
  FileCheck2,
  Lock,
  ChevronDown,
  Clock,
  Send,
  User,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  Paperclip,
  Maximize2,
  MessageSquare,
  History,
  Info,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const IPCManagement = () => {
  const { currentProject } = useProject();
  const { tasks } = useProgress();
  const { 
    getIpcsQuery, 
    createIPCMutation, 
    updateIPCMutation, 
    deleteIPCMutation,
    approveIPCStep, 
    addPaymentRecord 
  } = useCommercial();

  const ipcs = getIpcsQuery.data || [];

  // View state: 'list' | 'detail' | 'create'
  const [activeView, setActiveView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedIpcId, setSelectedIpcId] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSavedView, setSelectedSavedView] = useState('All IPCs');
  const [sortBy, setSortBy] = useState<'ipcNumber' | 'createdDate' | 'netAmount'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Audit view toggles
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  // Active ipc calculated lines
  const activeIpc = ipcs.find(i => i.id === selectedIpcId);

  // ==========================================
  // IPC CREATOR WIZARD STATE (Multi-step)
  // ==========================================
  const [wizardStep, setWizardStep] = useState(1);
  // Step 1
  const [wIPCNumber, setWIPCNumber] = useState(`PROJ1-IPC-00${ipcs.length + 1}`);
  const [wBillingPeriod, setWBillingPeriod] = useState('June 2026');
  const [wContractor, setWContractor] = useState('Vertex Heavy Engineering');
  const [wBillingType, setWBillingType] = useState<'Client Progress Billing' | 'Contractor Payment Claim' | 'Subcontractor IPC'>('Client Progress Billing');
  const [wRemarks, setWRemarks] = useState('');
  // Step 2 variables
  const [selectedBOQItems, setSelectedBOQItems] = useState<{
    id: string;
    boqCode: string;
    description: string;
    unit: string;
    contractQty: number;
    previousQty: number;
    currQty: number; // editable
    rate: number;
    section: string;
  }[]>([]);

  // ==========================================
  // INLINE COMMENT & ATTACHMENT DETAILS STATE
  // ==========================================
  const [commentInput, setCommentInput] = useState('');

  // Auto-init certified quantities on entering STEP 2
  const handleNextStep1 = () => {
    // Collect from progresses and tasks
    // Let's build items dynamically from the progress module tasks to simulate automatic Quantity-Based Billing!
    const billableRows = tasks
      .filter(t => t.boqAllocations && t.boqAllocations.length > 0)
      .flatMap(t => t.boqAllocations.map(alloc => {
        const approvedQty = t.actualQty || 0; // quantities completed
        const prevQty = Math.round(approvedQty * 0.6); // simulated previous certified qty
        const currQty = Math.max(0, approvedQty - prevQty); // remainder certified in this bill
        
        return {
          id: alloc.id,
          boqCode: alloc.boqItemCode,
          description: alloc.description,
          unit: alloc.unit,
          contractQty: alloc.boqQty,
          previousQty: prevQty,
          currQty: currQty,
          rate: alloc.rate,
          section: t.name || 'Civil Operations'
        };
      }));

    setSelectedBOQItems(billableRows.slice(0, 4)); // Choose a clean set of 3-4 items for high quality density
    setWizardStep(2);
  };

  // Create IPC Async submit
  const handleWizardSubmit = async () => {
    // Perform calculations
    const grossVal = selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0);
    const retentionVal = grossVal * 0.10; // 10%
    const advRecoveryVal = grossVal * 0.05; // 5%
    const taxVal = grossVal * 0.15; // 15% VAT
    const netPayableVal = grossVal - retentionVal - advRecoveryVal + taxVal;

    const lineItems: IPCLineItem[] = selectedBOQItems.map((item, idx) => {
      const currentAmt = item.currQty * item.rate;
      const totalQuantityVal = item.previousQty + item.currQty;
      const remainingVal = Math.max(0, item.contractQty - totalQuantityVal);
      const totalAmt = totalQuantityVal * item.rate;
      const itemRetention = currentAmt * 0.10;
      const itemTax = currentAmt * 0.15;
      const itemNet = currentAmt - itemRetention + itemTax;

      return {
        id: `${item.id}-line`,
        boqCode: item.boqCode,
        description: item.description,
        unit: item.unit,
        contractQty: item.contractQty,
        previousQty: item.previousQty,
        currentQty: item.currQty,
        totalQty: totalQuantityVal,
        remainingQty: remainingVal,
        rate: item.rate,
        currentAmount: currentAmt,
        totalAmount: totalAmt,
        retentionPercent: 10,
        retentionAmount: itemRetention,
        taxPercent: 15,
        taxAmount: itemTax,
        netAmount: itemNet,
        section: item.section
      };
    });

    const newIPC = {
      ipcNumber: wIPCNumber,
      projectId: currentProject?.id || 'proj-1',
      billingPeriod: wBillingPeriod,
      contractor: wContractor,
      billingType: wBillingType,
      certifiedAmount: grossVal,
      retentionRate: 0.10,
      retentionAmount: retentionVal,
      taxRate: 0.15,
      taxAmount: taxVal,
      advanceRecoveryRate: 0.05,
      advanceRecoveryAmount: advRecoveryVal,
      deductionsAmount: 0,
      netAmount: netPayableVal,
      status: 'Submitted' as const,
      approvalStatus: 'In Progress' as const,
      paymentStatus: 'Unpaid' as const,
      remarks: wRemarks,
      lineItems
    };

    await createIPCMutation.mutateAsync(newIPC);
    setActiveView('list');
    setWizardStep(1);
    setWRemarks('');
  };

  const handleExportCSV = () => {
    alert("Export in progress... Interim payment certificate CSV exported to system clipboard.");
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedIpcId) return;
    const comment: IPCComment = {
      id: `c-${Date.now()}`,
      author: 'Robert Chen',
      text: commentInput,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      avatar: 'RC'
    };

    const currentComments = activeIpc?.comments || [];
    updateIPCMutation.mutateAsync(selectedIpcId, {
      comments: [...currentComments, comment]
    });
    setCommentInput('');
  };

  // ==========================================
  // DATA FILTERING & PAGING
  // ==========================================
  const filteredIPCs = ipcs
    .filter(i => {
      // Search Box
      const matchesSearch = i.ipcNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            i.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (i.billingPeriod && i.billingPeriod.toLowerCase().includes(searchTerm.toLowerCase()));
      // Grid Tabs Status filter
      if (statusFilter === 'all') return matchesSearch;
      return matchesSearch && i.status.toLowerCase() === statusFilter.toLowerCase();
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'ipcNumber') {
        comparison = a.ipcNumber.localeCompare(b.ipcNumber);
      } else if (sortBy === 'createdDate') {
        comparison = a.createdDate.localeCompare(b.createdDate);
      } else if (sortBy === 'netAmount') {
        comparison = a.netAmount - b.netAmount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedIPCs = filteredIPCs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredIPCs.length / itemsPerPage);

  const toggleSort = (field: 'ipcNumber' | 'createdDate' | 'netAmount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* ==========================================
          SCENE 1: LIST VIEW GRID
          ==========================================*/}
      {activeView === 'list' && (
        <div className="space-y-4 flex flex-col flex-1">
          {/* Saved views and action triggers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {['All IPCs', 'Submitted for Audit', 'Completed Payments', 'Retention Holds'].map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    setSelectedSavedView(view);
                    if (view === 'All IPCs') setStatusFilter('all');
                    if (view === 'Submitted for Audit') setStatusFilter('submitted');
                    if (view === 'Completed Payments') setStatusFilter('paid');
                    if (view === 'Retention Holds') setStatusFilter('approved');
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all",
                    selectedSavedView === view
                      ? "bg-primary-50 text-primary-700 border-primary-200"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {view}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setActiveView('create')}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus size={14} /> Create Interim Payment (IPC)
            </button>
          </div>

          {/* Filters, search, bulk options */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4.5 shadow-sm">
            <div className="flex-1 max-w-md relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><Search size={15} /></span>
              <input
                type="text"
                placeholder="Search IPCs by code, contractor, billing cycles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Category Tab:</span>
              <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-[11px] font-bold">
                {['all', 'draft', 'submitted', 'approved', 'paid', 'overdue'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-2.5 py-1 rounded-md capitalize cursor-pointer",
                      statusFilter === status ? "bg-white text-slate-800 shadow" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleExportCSV}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Export Grid Data"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* STICKY DATA GRID */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1 h-[400px]">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th onClick={() => toggleSort('ipcNumber')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none">
                      IPC Reference {sortBy === 'ipcNumber' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="py-3 px-4">Billing Cycle</th>
                    <th className="py-3 px-4">Contractor Partner</th>
                    <th onClick={() => toggleSort('netAmount')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 select-none">
                      Net Amount {sortBy === 'netAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="py-3 px-4 text-right">Retention hold</th>
                    <th className="py-3 px-4 text-right">Tax (VAT)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Payment Status</th>
                    <th onClick={() => toggleSort('createdDate')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none">
                      Date Created {sortBy === 'createdDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="py-3 px-4 text-right pr-6">Portal Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedIPCs.map((ipc) => {
                    return (
                      <tr key={ipc.id} className="text-xs hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3 px-4 font-bold text-slate-800">{ipc.ipcNumber}</td>
                        <td className="py-3 px-4 text-slate-500 font-semibold">{ipc.billingPeriod}</td>
                        <td className="py-3 px-4 text-slate-700 font-bold">{ipc.contractor}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">${ipc.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right text-slate-500">${ipc.retentionAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-slate-500">${ipc.taxAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase border",
                            ipc.status === 'Draft' && "bg-slate-50 text-slate-600 border-slate-200",
                            ipc.status === 'Submitted' && "bg-blue-50 text-blue-700 border-blue-100",
                            ipc.status === 'Approved' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                            ipc.status === 'Paid' && "bg-green-100 text-green-700 border-green-200",
                            ipc.status === 'Rejected' && "bg-red-50 text-red-700 border-red-100",
                            ipc.status === 'Overdue' && "bg-orange-50 text-orange-700 border-orange-100"
                          )}>
                            {ipc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase",
                            ipc.paymentStatus === 'Paid' ? "bg-green-50 text-green-700" : "bg-zinc-50 text-zinc-500"
                          )}>
                            {ipc.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-semibold">{ipc.createdDate}</td>
                        <td className="py-3 px-4 text-right pr-6">
                          <div className="flex justify-end gap-1 select-none">
                            <button
                              onClick={() => { setSelectedIpcId(ipc.id); setActiveView('detail'); }}
                              className="px-2 py-1 hover:bg-slate-100 text-slate-600 hover:text-primary-600 font-bold rounded cursor-pointer transition-colors"
                              title="Invoice details workspace"
                            >
                              Workspace →
                            </button>
                            {ipc.status === 'Draft' && (
                              <button
                                onClick={() => { deleteIPCMutation.mutateAsync(ipc.id); }}
                                className="p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded cursor-pointer"
                                title="Trash draft"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredIPCs.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">
                        <Info size={32} className="mx-auto text-slate-300 mb-2" />
                        <h5 className="font-bold">No interim billing matching query</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Create a new IPC to begin certified quantity evaluation.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-500 select-none">
              <p>Showing 1-{Math.min(filteredIPCs.length, itemsPerPage)} of {filteredIPCs.length} records</p>
              <div className="flex gap-2.5">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <span className="py-1">Doc page {currentPage} of {totalPages || 1}</span>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SCENE 2: WIZARD IPC CREATION PAGE
          ==========================================*/}
      {activeView === 'create' && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 max-w-4xl mx-auto w-full">
          {/* Step header indicator */}
          <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-4 mb-6 select-none">
            <button 
              onClick={() => { setActiveView('list'); setWizardStep(1); }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                    wizardStep === step ? "bg-primary-600 text-white" : wizardStep > step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  )}>
                    {step}
                  </span>
                  {step < 4 && <span className="w-8 h-0.5 bg-slate-100" />}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Basic Info */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-[#192a56]">Interim Building Certificate Metadata</h4>
                <p className="text-[11px] text-slate-400">Establish standard client details and billing cycles.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">IPC Number</label>
                  <input
                    type="text"
                    value={wIPCNumber}
                    onChange={(e) => setWIPCNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Billing Period</label>
                  <input
                    type="text"
                    value={wBillingPeriod}
                    onChange={(e) => setWBillingPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Contractor Partner</label>
                  <input
                    type="text"
                    value={wContractor}
                    onChange={(e) => setWContractor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary-500 animate-fade-in"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Billing Category</label>
                  <select
                    value={wBillingType}
                    onChange={(e) => setWBillingType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500 font-bold"
                  >
                    <option value="Client Progress Billing">Client Progress Billing</option>
                    <option value="Contractor Payment Claim">Contractor Payment Claim</option>
                    <option value="Subcontractor IPC">Subcontractor IPC</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-bold">Scope remarks</label>
                <textarea
                  value={wRemarks}
                  onChange={(e) => setWRemarks(e.target.value)}
                  placeholder="Record summary of scope landmarks completed during this interim span..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs h-20 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNextStep1}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow"
                >
                  Load Certified Quantities →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Load Certified Quantities */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-slate-800">Loaded Site Approved Quantities</h4>
                  <p className="text-[11px] text-slate-400">Quantities calculated directly from SOT progress tracker in this billing cycle.</p>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black uppercase">
                  Quantity-based billing
                </span>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">BOQ Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Contract Qty</th>
                      <th className="py-2.5 px-3 text-right">Prev Certified</th>
                      <th className="py-2.5 px-3 text-right text-primary-600">Current Qty</th>
                      <th className="py-2.5 px-3">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {selectedBOQItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-extrabold text-slate-700">{item.boqCode}</td>
                        <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">{item.description}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{item.contractQty}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{item.previousQty}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={item.currQty}
                            onChange={(e) => {
                              const updated = [...selectedBOQItems];
                              updated[index].currQty = Number(e.target.value);
                              setSelectedBOQItems(updated);
                            }}
                            className="w-16 px-1.5 py-0.5 border border-primary-300 rounded text-right font-black focus:outline-none focus:border-primary-500 bg-primary-50/30 text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-400 italic font-medium">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-200"
                >
                  ← Back Info
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow"
                >
                  Verify Calculations →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Commercial calculations */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-800">Commercial Multipliers & Deduction Baseline</h4>
                <p className="text-[11px] text-slate-400">Verifying taxes, mobilization advances, and retention hold percentages.</p>
              </div>

              {/* Ledger Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Gross Value</p>
                  <h4 className="text-base font-black text-slate-800 mt-1">
                    ${selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0).toLocaleString()}
                  </h4>
                </div>

                <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
                  <p className="text-[9px] text-amber-600 font-extrabold uppercase">Retention Holdback (10%)</p>
                  <h4 className="text-base font-black text-amber-700 mt-1">
                    -${(selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.10).toLocaleString()}
                  </h4>
                </div>

                <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                  <p className="text-[9px] text-indigo-600 font-extrabold uppercase">Mobilization Retiring (5%)</p>
                  <h4 className="text-base font-black text-indigo-700 mt-1">
                    -${(selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.05).toLocaleString()}
                  </h4>
                </div>

                <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                  <p className="text-[9px] text-emerald-600 font-extrabold uppercase">Net VAT (15% VAT)</p>
                  <h4 className="text-base font-black text-emerald-700 mt-1">
                    +${(selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.15).toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Calculated Formula Board */}
              <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-[11px]">
                <h5 className="font-black text-slate-400 uppercase tracking-widest text-[9px] mb-2 font-sans border-b border-white/10 pb-1.5">Consolidated Ledger Statement</h5>
                <div className="space-y-1.5 font-bold">
                  <div className="flex justify-between">
                    <span>Aggregate Certified Row Total (QTY x Rate)</span>
                    <span>${selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400">
                    <span>(-) Retention Deduction Clause @ 10.0%</span>
                    <span>-${(selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>(-) Amortization Adv Mobilization Recovery @ 5.0%</span>
                    <span>-${(selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>(+) Value Added Tax (VAT) Provisions @ 15.0%</span>
                    <span>+${(selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-dashed border-white/20 pt-2 flex justify-between text-white text-xs font-black">
                    <span>Calculated Total Net Payable (Capital Certificate)</span>
                    <span>
                      ${(
                        selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) -
                        (selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.10) -
                        (selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.05) +
                        (selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.15)
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-200"
                >
                  ← Adjust Quantities
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow"
                >
                  Review Chain & Submit →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review submitting info */}
          {wizardStep === 4 && (
            <div className="space-y-5">
              <div>
                <h4 className="font-extrabold text-[#192a56]">Final Workflow Audit Verification</h4>
                <p className="text-[11px] text-slate-400">Review authorization node details before transmitting values to structural QS flow.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                  <span>Certificate ID Code:</span>
                  <span className="font-bold text-slate-800">{wIPCNumber}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                  <span>Cycle Period:</span>
                  <span className="font-bold text-slate-800">{wBillingPeriod}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                  <span>Primary Contractor partner:</span>
                  <span className="font-bold text-slate-800">{wContractor}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                  <span>Billing Group Type:</span>
                  <span className="font-bold text-slate-800">{wBillingType}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-primary-600 font-black">Net Certified Value Requested:</span>
                  <span className="font-black text-slate-800">
                    ${(
                      selectedBOQItems.reduce((acc, curr) => acc + (curr.currQty * curr.rate), 0) * 0.90
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 select-none">
                <h5 className="text-[10px] text-slate-400 font-extrabold uppercase">Sequential Workflow Gateway Chain</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Site Engineer', 'QS Engineer', 'Project Manager', 'Commercial Manager', 'Finance'].map((role, rIdx) => (
                    <div key={role} className="p-2 border border-slate-100 bg-slate-50 rounded-lg text-center text-[10px] font-bold">
                      <p className="text-slate-400">{role}</p>
                      <p className="text-slate-800 mt-1">James / Robert</p>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse mt-1.5" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-200"
                >
                  ← Edit Calculations
                </button>
                <button
                  onClick={handleWizardSubmit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow"
                >
                  Confirm and Dispatch to QS Gate ✓
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==========================================
          SCENE 3: WORKSPACE DETAIL PAGE
          ==========================================*/}
      {activeView === 'detail' && activeIpc && (
        <div className="flex-1 flex flex-col gap-5">
          {/* Header context panels */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedIpcId(null); setActiveView('list'); setShowAuditHistory(false); }}
                className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Return to index"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-800">{activeIpc.ipcNumber}</h3>
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase",
                    activeIpc.status === 'Draft' && "bg-slate-50 text-slate-600 border-slate-200",
                    activeIpc.status === 'Submitted' && "bg-blue-50 text-blue-700 border-blue-100",
                    activeIpc.status === 'Approved' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                    activeIpc.status === 'Paid' && "bg-green-100 text-green-700 border-green-200"
                  )}>
                    {activeIpc.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Billing Period Cycle: {activeIpc.billingPeriod} • Contractor: {activeIpc.contractor}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAuditHistory(!showAuditHistory)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <History size={13} /> Audit Trail
              </button>
              <button 
                onClick={() => alert("Interim Payment Certificate PDF generated successfully.")}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <FileCheck2 size={13} /> Generate PDF Certificate
              </button>
              {activeIpc.status === 'Approved' && (
                <button
                  onClick={() => addPaymentRecord({
                    projectId: activeIpc.projectId,
                    refNumber: '',
                    invoiceOrIpcNumber: activeIpc.ipcNumber,
                    payee: activeIpc.contractor,
                    payer: 'BuildOps Capital Holding Ltd',
                    amountPaid: activeIpc.netAmount,
                    paymentDate: new Date().toISOString().split('T')[0],
                    paymentMethod: 'Bank Transfer',
                    status: 'Cleared'
                  })}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                >
                  Pay Claim
                </button>
              )}
            </div>
          </div>

          {/* Audit trail conditional list */}
          {showAuditHistory && (
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10.5px] border border-slate-800 shadow-inner select-none">
              <h5 className="font-sans font-black text-slate-400 uppercase tracking-widest text-[9px] mb-2">Gate Audit History logs</h5>
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                {activeIpc.auditHistory.map((h) => (
                  <div key={h.id} className="flex justify-between items-start border-b border-slate-800/60 pb-1.5">
                    <span>[{h.timestamp}] <span className="text-blue-400">{h.action}</span> - Checked by {h.user}: {h.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Workspace split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            
            {/* Left: Financial quantity grid */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 select-none">
                <h4 className="text-sm font-bold text-slate-800">Interim Quantities Allocation Statement</h4>
                <p className="text-[11px] text-slate-400 font-semibold">Row by row quantity-driven BOQ specifications of active cycle.</p>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
                <table className="w-full text-left text-xs border-collapse relative font-semibold">
                  <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[9.5px] uppercase tracking-wider border-b border-snoke">
                    <tr className="sticky top-0 bg-[#f8fafc] z-10">
                      <th className="py-2.5 px-3">BOQ Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Contract Qty</th>
                      <th className="py-2.5 px-3 text-right">Prev Qty</th>
                      <th className="py-2.5 px-3 text-right text-primary-600">Cycle Qty</th>
                      <th className="py-2.5 px-3 text-right">Total Qty</th>
                      <th className="py-2.5 px-3 text-right">Remaining</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right pr-4">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/75">
                    {activeIpc.lineItems.map((line) => {
                      return (
                        <tr key={line.id} className="hover:bg-slate-50/40">
                          <td className="py-2 px-3 font-extrabold text-slate-700">{line.boqCode}</td>
                          <td className="py-2 px-3 text-slate-500 truncate max-w-[150px]" title={line.description}>{line.description}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{line.contractQty.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{line.previousQty.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-primary-600 font-bold">{line.currentQty.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-700">{line.totalQty.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{line.remainingQty.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-slate-600">${line.rate.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right pr-4 font-bold text-slate-800">${line.currentAmount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    {/* Aggregated totals row */}
                    <tr className="bg-slate-50/40 text-xs font-black text-slate-800">
                      <td colSpan={2} className="py-3 px-3">Aggregate Value Sum</td>
                      <td colSpan={6} className="py-3 px-3"></td>
                      <td className="py-3 px-3 text-right pr-4 font-black text-slate-900">
                        ${activeIpc.lineItems.reduce((acc, curr) => acc + curr.currentAmount, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right sidebars: Calculations + Workflow timeline */}
            <div className="space-y-4">
              
              {/* Commercial Summary Panel */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-4 select-none">Consolidated Billing Ledger</h4>
                <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Aggregate Certified Work Done:</span>
                    <span className="font-bold text-slate-900">${activeIpc.certifiedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-600">
                    <span>(-) Contract Retention Held (10%):</span>
                    <span className="font-bold">-${activeIpc.retentionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-600">
                    <span>(-) Mobilization Advance Recovered:</span>
                    <span className="font-bold">-${activeIpc.advanceRecoveryAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>(+) Net Code Taxes (15% VAT):</span>
                    <span className="font-bold">+${activeIpc.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {activeIpc.deductionsAmount > 0 && (
                    <div className="flex justify-between items-center text-rose-600">
                      <span>(-) Safety / Deducted Penalties:</span>
                      <span className="font-bold">-${activeIpc.deductionsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-slate-200 pt-3.5 flex justify-between items-center text-slate-800 text-sm font-black">
                    <span>Net Amount Certified:</span>
                    <span className="text-primary-600">${activeIpc.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Approval workflow timeline */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-4 select-none">Approval Workflow Status</h4>
                <div className="space-y-4">
                  {activeIpc.approvalChain.map((step, idx) => (
                    <div key={idx} className="flex gap-3 relative select-none">
                      {idx < activeIpc.approvalChain.length - 1 && (
                        <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-100" />
                      )}
                      
                      {/* Avatar node status */}
                      <span className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                        step.status === 'Approved' ? "bg-emerald-100 text-emerald-700" : step.status === 'Rejected' ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-400"
                      )}>
                        {step.avatar || 'RC'}
                      </span>

                      <div className="flex-1 space-y-0.5 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-700 leading-none">{step.name || 'Anonymous'}</p>
                          <span className={cn(
                            "text-[8px] font-black px-1 rounded-sm uppercase tracking-wide",
                            step.status === 'Approved' ? "bg-emerald-50 text-emerald-700" : step.status === 'Rejected' ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-400"
                          )}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{step.role}</p>
                        {step.comment && <p className="text-[11px] text-slate-500 font-semibold italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100/50">"{step.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments list & Comments discussions */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-2 mb-2 select-none">Shared Attachments Hub</h4>
                <div className="space-y-2 select-none">
                  {activeIpc.attachments.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 cursor-pointer text-xs"
                      onClick={() => alert(`Opening file: ${file.name}`)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400"><Paperclip size={13} /></span>
                        <span className="font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{file.size}</span>
                    </div>
                  ))}
                  {activeIpc.attachments.length === 0 && (
                    <p className="text-center text-[10.5px] text-slate-300 py-3 font-semibold">No certification PDFs uploaded.</p>
                  )}
                </div>

                {/* Comment segment */}
                <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-2 mb-2 select-none pt-2">Notes discussion board</h4>
                <div className="space-y-2 select-none max-h-[140px] overflow-y-auto">
                  {activeIpc.comments.map((comm) => (
                    <div key={comm.id} className="bg-slate-50 p-2 border border-slate-100 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-700">{comm.author}</span>
                        <span className="text-slate-400 font-semibold">{comm.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{comm.text}</p>
                    </div>
                  ))}
                  {activeIpc.comments.length === 0 && (
                    <p className="text-center text-[10.5px] text-slate-300 py-3 font-semibold">No discussions recorded.</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Contribute billing notes..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={handleAddComment}
                    className="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg aspect-square cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
