import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { useCosts, CostItem, useUserRole } from './MockCostData.ts';
import { 
  FileCheck2, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  ArrowUpDown, 
  Download, 
  Eye, 
  Plus, 
  FolderLock,
  X,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const CostTracking = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: costs, isLoading, addCost } = useCosts(projectId);
  const { role } = useUserRole();

  // Search & Filters states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'amount' | 'reference'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Manual Entry Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mRef, setMRef] = useState('');
  const [mAmount, setMAmount] = useState<number>(0);
  const [mCategory, setMCategory] = useState<CostItem['category']>('Materials');
  const [mDoc, setMDoc] = useState('');
  const [mError, setMError] = useState('');

  // Drill down / Details Drawer State
  const [focusedCost, setFocusedCost] = useState<CostItem | null>(null);

  // Sorting logic handler
  const handleSort = (field: 'date' | 'amount' | 'reference') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleCreateManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setMError('');

    if (!mRef || mAmount <= 0) {
      setMError('Please enter a valid receipt reference code and a positive Amount.');
      return;
    }

    try {
      addCost({
        reference: mRef.toUpperCase(),
        costType: 'Manual Expenses',
        sourceModule: 'Manual Entry',
        date: new Date().toISOString().split('T')[0],
        amount: mAmount,
        category: mCategory,
        linkedDoc: mDoc || 'Manual_Receipt_Upload.pdf',
        status: 'Approved' // Manual items instantly approved
      });

      // Clear Form
      setMRef('');
      setMAmount(0);
      setMDoc('');
      setIsFormOpen(false);
    } catch (err: any) {
      setMError(err.message || 'Error occurred adding manual expense.');
    }
  };

  // Main list filters
  const filteredCosts = costs.filter(c => {
    const matchesSearch = c.reference.toLowerCase().includes(search.toLowerCase()) ||
                          c.linkedDoc.toLowerCase().includes(search.toLowerCase()) ||
                          c.costType.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesType = typeFilter === 'all' || c.costType === typeFilter;
    const matchesSource = sourceFilter === 'all' || c.sourceModule === sourceFilter;

    // Date range checks
    const costMs = new Date(c.date).getTime();
    const startMs = startDate ? new Date(startDate).getTime() : null;
    const endMs = endDate ? new Date(endDate).getTime() : null;

    const matchesStartDate = !startMs || costMs >= startMs;
    const matchesEndDate = !endMs || costMs <= endMs;

    return matchesSearch && matchesCategory && matchesType && matchesSource && matchesStartDate && matchesEndDate;
  });

  // Export CSV Helper
  const exportLedger = (format: 'CSV' | 'XLSX' | 'PDF') => {
    const rows = [
      ['Cost Reference', 'Cost Type', 'Source Module', 'Date', 'Amount', 'Budget Category', 'Linked Document', 'Status']
    ];
    filteredCosts.forEach(item => {
      rows.push([
        item.reference,
        item.costType,
        item.sourceModule,
        item.date,
        item.amount.toString(),
        item.category,
        item.linkedDoc,
        item.status
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BuildOps_Cost_Ledger_${projectId}.${format.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Perform sort on filtered array
  const sortedCosts = [...filteredCosts].sort((a, b) => {
    let multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'amount') {
      return (a.amount - b.amount) * multiplier;
    }
    if (sortField === 'reference') {
      return a.reference.localeCompare(b.reference) * multiplier;
    }
    // Default is date sort
    return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
  });

  const totalCostFilteredSum = sortedCosts.reduce((acc, c) => acc + c.amount, 0);

  const formatCur = (v: number) => {
    return '$' + v.toLocaleString();
  };

  const isEngineer = role === 'Cost Engineer' || role === 'Commercial Manager' || role === 'Finance Manager' || role === 'Project Manager';

  return (
    <div className="space-y-6">
      {/* Search and Filters Hub */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
        
        {/* Row 1: Search & Manual Entry button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search costs by voucher code, PO index, structural document ref..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2.5 self-start md:self-auto shrink-0">
            {isEngineer && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-transform hover:scale-[1.01] cursor-pointer"
              >
                <PlusCircle size={14} className="text-slate-600" />
                Record Manual Cost
              </button>
            )}

            <button 
              onClick={() => exportLedger('CSV')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 text-white hover:bg-primary-700 text-xs font-black rounded-lg transition-transform hover:scale-[1.01] cursor-pointer shadow-md leading-none"
            >
              <Download size={14} />
              Export CSV Ledger
            </button>
          </div>
        </div>

        {/* Row 2: Micro Filters & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Budget Category</label>
            <select
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">📁 All Categories</option>
              <option value="Materials">Materials</option>
              <option value="Labor">Labor</option>
              <option value="Equipment">Equipment</option>
              <option value="Subcontract">Subcontract</option>
              <option value="Site Expenses font-bold">Site Expenses</option>
              <option value="General Expenses">General Expenses</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Source Type</label>
            <select
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">🧾 All Types</option>
              <option value="Purchase Order">Purchase Order</option>
              <option value="Material Issue">Material Issue</option>
              <option value="IPC / Billing">IPC / Billing</option>
              <option value="Manual Expenses">Manual Expenses</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">ERP Module Origin</label>
            <select
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 cursor-pointer"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">⚙️ All Modules</option>
              <option value="Procurement">Procurement</option>
              <option value="Inventory">Inventory</option>
              <option value="Billing">Billing</option>
              <option value="Manual Entry">Manual Entry</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Start Date</label>
            <input 
              type="date"
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">End Date</label>
            <input 
              type="date"
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Sum card */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner flex justify-between items-center">
        <div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider leading-none">Aggregated Costs (Filtered)</span>
          <p className="text-xl font-black text-slate-800 mt-2">{formatCur(totalCostFilteredSum)}</p>
        </div>
        <span className="text-xs text-slate-400 font-bold underline cursor-pointer" onClick={() => { setStartDate(''); setEndDate(''); setCategoryFilter('all'); setTypeFilter('all'); setSourceFilter('all'); setSearch(''); }}>
          Reset All Filters
        </span>
      </div>

      {/* Detailed cost table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10.5px] uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('reference')}>
                  <span className="flex items-center gap-1.5">
                    Cost Reference <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="py-3 px-4 font-bold">Cost Type</th>
                <th className="py-3 px-4 font-bold">Source Module</th>
                <th className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>
                  <span className="flex items-center gap-1.5">
                    Date <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="py-3 px-4 font-bold text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('amount')}>
                  <span className="flex items-center gap-1.5 justify-end">
                    Amount <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="py-3 px-4 font-bold">Budget Category</th>
                <th className="py-3 px-4 font-bold">Linked Document</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 italic">Accessing Ledger registers...</td>
                </tr>
              ) : sortedCosts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 italic font-medium">No ledger expense items correspond to options. Check date constraints.</td>
                </tr>
              ) : (
                sortedCosts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {c.reference}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-650">
                      {c.costType}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-550 font-black uppercase px-2 py-0.5 rounded">
                        {c.sourceModule}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold font-mono text-slate-500">
                      {c.date}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-850">
                      {formatCur(c.amount)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {c.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-primary-600 font-semibold truncate max-w-[130px]" title={c.linkedDoc}>
                        <FileCheck2 size={13} className="shrink-0 text-primary-500" />
                        <span>{c.linkedDoc}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full font-bold text-[9.5px] uppercase",
                        c.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                        c.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setFocusedCost(c)}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-500 hover:text-primary-600 cursor-pointer font-bold inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye size={12} />
                        Drill Down
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG 1: DRILL DOWN MODAL VIEW */}
      {focusedCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-150 w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-1.5">
                <Eye className="text-primary-600" size={16} />
                <span>Structural Cost Drill Down</span>
              </h3>
              <button onClick={() => setFocusedCost(null)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cost Reference</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{focusedCost.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Status State</p>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 font-bold text-[9px] uppercase inline-block mt-0.5">
                    {focusedCost.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Subtotal Amount</p>
                  <p className="font-black text-slate-800 text-sm mt-0.5">{formatCur(focusedCost.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Category Tag</p>
                  <p className="font-bold text-slate-700 mt-0.5">{focusedCost.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Origin Source</p>
                  <p className="font-bold text-slate-700 mt-0.5">{focusedCost.costType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Allocation Date</p>
                  <p className="font-mono font-bold text-slate-500 mt-0.5">{focusedCost.date}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">Associated Audit Documentation</p>
                <div className="flex items-center gap-2 font-bold text-primary-600">
                  <FileCheck2 size={16} />
                  <span>{focusedCost.linkedDoc}</span>
                </div>
                <p className="text-[10.5px] text-slate-450 font-medium mt-1.5">Secure PDF ledger manifest, stamped and compiled on-chain by the SCM procurement engine.</p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setFocusedCost(null)} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg cursor-pointer">
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 2: RECORD MANUAL COST MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-150 w-full max-w-md overflow-hidden animate-slide-up">
            
            <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="text-primary-600" size={18} />
                <h3 className="font-extrabold text-[#111827] text-sm">Record Project Manual Expense</h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateManualExpense} className="p-5 space-y-4 text-xs">
              
              {mError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 font-bold leading-relaxed flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0" />
                  {mError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Voucher / Invoice Code Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g. EXP-SUP-MAY02"
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500"
                  value={mRef}
                  onChange={(e) => setMRef(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Transaction Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000"
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500"
                    value={mAmount || ''}
                    onChange={(e) => setMAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-bold text-slate-600">Category Node</label>
                  <select
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value as CostItem['category'])}
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labor">Labor</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Subcontract">Subcontract</option>
                    <option value="Site Expenses font-bold">Site Expenses</option>
                    <option value="General Expenses">General Expenses</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Supporting Attachment Link (PDF/Excel)</label>
                <input 
                  type="text" 
                  placeholder="e.g. RECEIPT_DIESEL_SUP_22.pdf"
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500"
                  value={mDoc}
                  onChange={(e) => setMDoc(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 font-bold">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4.5 py-2 hover:bg-slate-100 text-slate-600 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 hover:text-white text-white rounded-lg cursor-pointer">
                  Commit Ledger Receipt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
