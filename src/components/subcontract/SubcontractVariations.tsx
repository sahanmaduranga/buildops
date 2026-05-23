import React, { useState } from 'react';
import { useSubcontract, type SubcontractVariation } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  CheckSquare, 
  AlertTriangle, 
  FileText, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  CheckCircle,
  Clock,
  Briefcase,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

const REASON_CATEGORIES = [
  'Scope Extension',
  'Design Change / Alteration',
  'Unforeseen Site Conditions',
  'Material Spec Upgrades',
  'Client Directed Modification',
  'Force Majeure / Acceleration'
];

export function SubcontractVariations() {
  const { currentProject } = useProject();
  const { 
    subcontractors, 
    packages, 
    variations, 
    addVariation, 
    updateVariation, 
    deleteVariation 
  } = useSubcontract();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [voNumber, setVoNumber] = useState('');
  const [packageId, setPackageId] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState(REASON_CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  const [boqReferenceCode, setBoqReferenceCode] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'>('Draft');

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1">Please select an active project workspace to load its subcontract variations ledger.</p>
      </div>
    );
  }

  const projectVariations = variations.filter(v => v.projectId === currentProject.id);
  const projectPackages = packages.filter(p => p.projectId === currentProject.id && p.status !== 'Draft');

  const handleSaveVO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voNumber || !packageId || !description || amount === 0) {
      alert('VO code, package reference, description, and variation amount must be filled.');
      return;
    }

    const pkg = projectPackages.find(p => p.id === packageId)!;

    addVariation({
      voNumber,
      packageId,
      subcontractorId: pkg.subcontractorId,
      projectId: currentProject.id,
      description,
      reason,
      amount,
      boqReferenceCode,
      status,
      submittedDate: new Date().toISOString().split('T')[0],
      approvedDate: status === 'Approved' ? new Date().toISOString().split('T')[0] : ''
    });

    setIsFormOpen(false);
    alert('Subcontract Variation Order created successfully. Approved variations will instantly modify revised package budgets.');
  };

  const handleDeleteVO = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this variation order?')) {
      deleteVariation(id);
    }
  };

  const handleStatusChangeBtn = (id: string, nextStatus: any) => {
    const closedDate = nextStatus === 'Approved' ? new Date().toISOString().split('T')[0] : '';
    updateVariation(id, { 
      status: nextStatus,
      approvedDate: closedDate
    });
    alert(`Variation order status successfully set to ${nextStatus}.`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD' }).format(val);
  };

  const filteredVOs = projectVariations.filter(vo => {
    const pkg = projectPackages.find(p => p.id === vo.packageId);
    
    const matchesSearch = 
      vo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vo.voNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg && pkg.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || vo.reason === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || vo.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in text-[13px] text-slate-600 font-sans">
      
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search change orders description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary-500 text-xs focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {REASON_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="All">All Approval Status</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={() => {
              setVoNumber(`SBC-VO-${Math.floor(100 + Math.random() * 900)}`);
              setDescription('');
              setReason(REASON_CATEGORIES[0]);
              setAmount(0);
              setBoqReferenceCode('');
              setStatus('Draft');
              setPackageId(projectPackages[0]?.id || '');
              setIsFormOpen(true);
            }}
            disabled={projectPackages.length === 0}
            className={cn(
              "px-3.5 py-1.5 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none transition shadow-sm",
              projectPackages.length === 0 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-primary-600 hover:bg-primary-750 text-white"
            )}
          >
            <Plus size={14} /> New Variation Order
          </button>
        </div>
      </div>

      {/* Grid List displaying detailed Variations Cards */}
      <div className="flex-1 overflow-y-auto">
        {filteredVOs.length === 0 ? (
          <div className="bg-white border rounded-xl py-16 text-center shadow-xs">
            <SlidersHorizontal className="mx-auto text-slate-300 mb-2" size={32} />
            <h4 className="font-bold text-slate-900 leading-none">No variations logged</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No change orders match your selection parameters. Tap the action key to introduce a new VO entry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVOs.map(vo => {
              const pkg = projectPackages.find(p => p.id === vo.packageId);
              const sub = subcontractors.find(s => s.id === vo.subcontractorId);
              return (
                <div key={vo.id} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between hover:border-slate-350 transition">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full translate-x-12 -translate-y-12 shrink-0 pointer-events-none" />
                  
                  <div className="space-y-1.5 flex-1 select-none">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-250/50 px-2 py-0.2 rounded text-[10px] leading-none shrink-0 shadow-xs">
                        {vo.voNumber}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0 border",
                        vo.status === 'Approved' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" 
                          : vo.status === 'Pending Approval' 
                            ? "bg-amber-50 text-amber-700 border-amber-200/50" 
                            : "bg-slate-100 text-slate-500 border-slate-200/50"
                      )}>
                        {vo.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-950 text-[13px] leading-tight mt-2">{vo.description}</h4>
                    <p className="text-slate-500 font-medium text-[11.5px] leading-relaxed italic">{vo.reason}</p>
                    
                    <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-100/70 border-dashed">
                      <p><strong>Work Package:</strong> <span className="text-slate-700 font-semibold">{pkg ? pkg.name : 'Unknown package reference'}</span></p>
                      <p><strong>Subcontractor:</strong> <span className="text-slate-700 font-semibold">{sub ? sub.name : 'No subcontractor linked'}</span></p>
                      {vo.boqReferenceCode && <p><strong>BOQ Reference Item:</strong> <span className="text-slate-700 font-mono font-semibold">{vo.boqReferenceCode}</span></p>}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center mt-3 bg-slate-50/50 -mx-4.5 -mb-4.5 p-4.5 shrink-0">
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-black block uppercase tracking-wider mb-0.5">Change Value</span>
                      <span className="font-black font-mono text-rose-600 text-sm">{formatCurrency(vo.amount)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {vo.status !== 'Approved' && (
                        <>
                          <button
                            onClick={() => handleStatusChangeBtn(vo.id, 'Approved')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-750 font-bold rounded cursor-pointer leading-none text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChangeBtn(vo.id, 'Rejected')}
                            className="px-2 py-1 hover:bg-rose-50 text-rose-600 font-semibold rounded cursor-pointer leading-none text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteVO(vo.id)}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded border border-slate-100/50 ml-1.5 cursor-pointer shrink-0"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Variation Create Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in text-xs leading-normal">
          <div className="fixed inset-0" onClick={() => setIsFormOpen(false)} />
          <form 
            onSubmit={handleSaveVO}
            className="relative bg-white border border-slate-300 shadow-xl rounded-2xl w-full max-w-[480px] flex flex-col z-10 overflow-hidden font-sans"
          >
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-bold text-slate-950 text-sm font-sans">New Scope Variation Order (VO)</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-semibold leading-normal">Approved changes will dynamically augment the revised contract amount of the affected package.</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">VO Reference Code *</label>
                  <input 
                    type="text" 
                    value={voNumber}
                    onChange={(e) => setVoNumber(e.target.value)}
                    required
                    className="p-2 border border-slate-200 rounded bg-white text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 text-xs font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Change Category *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="p-2 border border-slate-200 bg-white rounded text-slate-950 outline-none focus:ring-1 focus:ring-primary-555 cursor-pointer text-xs font-bold"
                  >
                    {REASON_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Target Agreement Package *</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="p-2 border border-slate-200 bg-white rounded text-slate-950 outline-none focus:ring-1 focus:ring-primary-500 text-xs font-bold cursor-pointer"
                >
                  <option value="">Select Package...</option>
                  {projectPackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.code} - {pkg.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Adjustment Scope Title *</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Additional shoring plates waterproofing reinforcement"
                  required
                  className="p-2 border border-slate-200 bg-white rounded text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Deduction or Addition Value ({currentProject.defaultCurrency}) *</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="p-2 border border-slate-200 rounded bg-white text-xs text-rose-600 font-bold outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Linked BOQ Item Ref Code</label>
                  <input 
                    type="text" 
                    value={boqReferenceCode}
                    onChange={(e) => setBoqReferenceCode(e.target.value)}
                    placeholder="e.g. 2.2.A.1"
                    className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Approval Workflow Designation</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="p-2 border border-slate-200 bg-white rounded text-slate-950 outline-none focus:ring-1 focus:ring-primary-500 text-xs cursor-pointer font-bold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved immediately</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-4 border-t border-slate-150">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer leading-none transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={amount === 0}
                  className={cn(
                    "px-4 py-2 text-white rounded-lg cursor-pointer leading-none shadow-md transition font-extrabold",
                    amount === 0 ? "bg-slate-200 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-750"
                  )}
                >
                  Create Variation order
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

    </div>
  );
}
