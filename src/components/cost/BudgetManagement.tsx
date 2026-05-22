import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { useBudgets, Budget, useUserRole } from './MockCostData.ts';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  FileCheck2, 
  PenTool, 
  CheckCircle, 
  AlertCircle,
  FolderPlus,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const BudgetManagement = () => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || 'proj-1';
  
  const { data: budgets, isLoading, addBudget } = useBudgets(projectId);
  const { role } = useUserRole();

  // Dialog & Search states
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Budget Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Budget['category']>('Materials');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<Budget['status']>('Draft');

  const [formError, setFormError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!code || !name || amount <= 0) {
      setFormError('Please fill out Code, Name and input a valid Budget Amount.');
      return;
    }

    try {
      addBudget({
        code,
        name,
        category,
        amount,
        description,
        startDate,
        endDate,
        status
      });

      // Reset
      setCode('');
      setName('');
      setAmount(0);
      setDescription('');
      setIsOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred saving');
    }
  };

  const getStatusBadge = (st: Budget['status']) => {
    switch (st) {
      case 'Approved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase">Approved</span>;
      case 'Revised':
        return <span className="bg-sky-50 text-sky-700 border border-sky-100 rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase">Revised</span>;
      case 'Under Review':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase">Under Review</span>;
      case 'Draft':
      default:
        return <span className="bg-slate-50 text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase">Draft</span>;
    }
  };

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.code.toLowerCase().includes(search.toLowerCase()) || 
                          b.name.toLowerCase().includes(search.toLowerCase()) ||
                          (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalAllocated = filteredBudgets.reduce((acc, b) => acc + b.amount, 0);
  const totalActual = filteredBudgets.reduce((acc, b) => acc + b.actualAmount, 0);
  const totalRemaining = filteredBudgets.reduce((acc, b) => acc + b.remainingAmount, 0);

  const formatCur = (num: number) => {
    return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const isCostAuthorized = role === 'Finance Manager' || role === 'Commercial Manager' || role === 'Cost Engineer' || role === 'Project Manager';

  return (
    <div className="space-y-6">
      {/* Search Header Options */}
      <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search budgets by code, keyword, package name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-primary-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">📁 All Categories</option>
              <option value="Materials">Materials</option>
              <option value="Labor">Labor</option>
              <option value="Equipment">Equipment</option>
              <option value="Subcontract">Subcontract</option>
              <option value="Site Expenses">Site Expenses</option>
              <option value="General Expenses">General Expenses</option>
            </select>
            <select
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">💡 Original/All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Revised">Revised</option>
              <option value="Under Review">Under Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {isCostAuthorized && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-lg transition-transform hover:scale-[1.01] cursor-pointer shadow-md leading-none self-start md:self-auto shrink-0"
          >
            <Plus size={14} />
            Create Budget WBS Node
          </button>
        )}
      </div>

      {/* Grid Summarizer Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Total Filtered Budget</p>
          <p className="text-xl font-black text-slate-800 mt-2">{formatCur(totalAllocated)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Total Actual Spend</p>
          <p className="text-xl font-black text-emerald-600 mt-2">
            {formatCur(totalActual)} 
            <span className="text-xs text-slate-400 font-medium ml-2">({totalAllocated > 0 ? ((totalActual/totalAllocated)*100).toFixed(1) : 0}% Consumed)</span>
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Remaining Margin Ceiling</p>
          <p className={cn("text-xl font-black mt-2", totalRemaining < 0 ? "text-red-650" : "text-slate-800")}>
            {formatCur(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Main Budget Data table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10.5px] uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4 font-bold">WBS Code</th>
                <th className="py-3.5 px-4 font-bold">Package / Budget Name</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold text-right">Budget Limit</th>
                <th className="py-3.5 px-4 font-bold text-right">Actual Spent</th>
                <th className="py-3.5 px-4 font-bold text-right">Balance Margin</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
                <th className="py-3.5 px-4 font-bold">WBS Limits</th>
                <th className="py-3.5 px-4 font-bold">Revised On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 italic">Syncing master control budgets...</td>
                </tr>
              ) : filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 italic font-medium">No budget packages match filters. Adjust criteria above.</td>
                </tr>
              ) : (
                filteredBudgets.map((b) => {
                  const percentUsed = b.amount > 0 ? (b.actualAmount / b.amount) * 100 : 0;
                  const isOver = b.actualAmount > b.amount;
                  const isWarning = !isOver && percentUsed >= 80;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-slate-850 truncate max-w-[125px]">
                        {b.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="min-w-[170px]">
                          <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors leading-none">{b.name}</p>
                          <p className="text-[10.5px] text-slate-400 truncate mt-1.5" title={b.description}>{b.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md font-semibold text-[10.5px]",
                          b.category === "Materials" && "bg-blue-50 text-blue-700",
                          b.category === "Labor" && "bg-orange-50 text-orange-700",
                          b.category === "Equipment" && "bg-yellow-50 text-yellow-700",
                          b.category === "Subcontract" && "bg-purple-50 text-purple-700",
                          b.category === "Site Expenses" && "bg-violet-50 text-violet-700",
                          b.category === "General Expenses" && "bg-teal-50 text-teal-700"
                        )}>
                          {b.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-800">
                        {formatCur(b.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-700">
                        {formatCur(b.actualAmount)}
                      </td>
                      <td className={cn(
                        "py-3 px-4 text-right font-bold font-mono",
                        isOver ? "text-red-650" : isWarning ? "text-amber-600" : "text-emerald-700"
                      )}>
                        {formatCur(b.remainingAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex flex-col gap-1 w-24">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>Spent</span>
                            <span className={isOver ? "text-red-600 font-bold" : "text-slate-500 font-semibold"}>
                              {percentUsed.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                isOver ? "bg-red-600 animate-pulse" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                              )} 
                              style={{ width: `${Math.min(100, percentUsed)}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-semibold font-mono text-[11px]">
                        {b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER CREATE WBS PANEL DIALOG / MODAL DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-150 w-full max-w-lg overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="text-primary-600" size={18} />
                <h3 className="font-extrabold text-[#111827] text-sm">Create New Master WBS Budget Package</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 font-bold text-[11.5px] leading-relaxed flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  {formError}
                </div>
              )}

              {/* Grid 1: Code and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Budget WBS Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BGT-MAT-011"
                    className="w-full placeholder:text-slate-350 text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500 transition-colors"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Category Heading</label>
                  <select
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Budget['category'])}
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labor">Labor</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Subcontract">Subcontract</option>
                    <option value="Site Expenses">Site Expenses</option>
                    <option value="General Expenses">General Expenses</option>
                  </select>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Package / WBS Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Masonry Procurement Substructure Block A"
                  className="w-full placeholder:text-slate-350 text-xs font-semibold px-3 py-2 bg-slate-55 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Amount & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Budget Amount (Limit)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 500000"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-primary-500"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Authorization Status</label>
                  <select
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Budget['status'])}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Revised">Revised</option>
                  </select>
                </div>
              </div>

              {/* Timeline (Start and End dates) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500 cursor-pointer"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Finish Date</label>
                  <input 
                    type="date" 
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500 cursor-pointer"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description Expense */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Package Scope & Specifications</label>
                <textarea 
                  rows={2}
                  placeholder="Allocate scope, specific grade codes, SCM supply constraints, etc."
                  className="w-full placeholder:text-slate-350 text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-primary-500 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3.5 text-xs font-bold">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4.5 py-2 hover:bg-slate-100 text-slate-600 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-black shadow-md cursor-pointer"
                >
                  Publish WBS Node
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
