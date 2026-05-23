import React, { useState, useEffect } from 'react';
import { useSubcontract, type SubcontractIPC, type SubcontractIPCItem } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { useBOQ } from '../../context/BOQContext.tsx';
import { type BOQItem } from '../../types.ts';
import { 
  FileText, 
  Plus, 
  Search, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Save, 
  History, 
  Scale, 
  Calendar,
  Layers,
  Percent,
  X,
  FileSpreadsheet,
  Download,
  Receipt
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export function SubcontractIPC() {
  const { currentProject } = useProject();
  const { boqItemsMap } = useBOQ();
  const { 
    subcontractors, 
    packages, 
    ipcs, 
    addIPC, 
    updateIPC, 
    approveIPC, 
    deleteIPC 
  } = useSubcontract();

  const [activeView, setActiveView] = useState<'list' | 'create' | 'view'>('list');
  const [ipcSearch, setIpcSearch] = useState('');
  const [selectedIPCId, setSelectedIPCId] = useState<string | null>(null);

  // IPC Creation form states
  const [ipcNo, setIpcNo] = useState('');
  const [packageId, setPackageId] = useState('');
  const [period, setPeriod] = useState('2024 Q3');
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [deductionNotes, setDeductionNotes] = useState('');
  const [tempAttachmentName, setTempAttachmentName] = useState('');
  const [attachments, setAttachments] = useState<{id: string, name: string, fileType: string}[]>([]);
  const [itemsValuations, setItemsValuations] = useState<SubcontractIPCItem[]>([]);

  // Filtering active project IPCs
  const projectIPCs = ipcs.filter(i => i.projectId === currentProject?.id);
  const projectPackages = packages.filter(p => p.projectId === currentProject?.id && p.status !== 'Draft');

  const selectedIPC = projectIPCs.find(i => i.id === selectedIPCId);

  // When package selected during creation, pre-load allocated items with previous progress certified qty
  useEffect(() => {
    if (!packageId) {
      setItemsValuations([]);
      return;
    }

    const pkg = projectPackages.find(p => p.id === packageId);
    if (!pkg) return;

    // Load allocations
    const valuations: SubcontractIPCItem[] = pkg.allocations.map(alloc => {
      // Find sum of certified quantity in previously APPROVED or PAID IPCs for this specific package & BOQ item
      const previouslyApprovedQtySum = projectIPCs
        .filter(i => i.packageId === packageId && (i.status === 'Approved' || i.status === 'Paid'))
        .flatMap(i => i.items)
        .filter(item => item.boqItemId === alloc.boqItemId)
        .reduce((sum, item) => sum + item.currentQty, 0);

      return {
        boqItemId: alloc.boqItemId,
        previousQty: previouslyApprovedQtySum,
        currentQty: 0, // initially zero, user inputs claims
        totalQty: previouslyApprovedQtySum, // accum cumulative
        rate: alloc.rate
      };
    });

    setItemsValuations(valuations);
  }, [packageId]);

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Receipt className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1 font-semibold">Please select an active project workspace to load its Interims Payment Certificates dashboard.</p>
      </div>
    );
  }

  // Handle current qty claimed modifications with cumulative bounds check
  const handleCurrentQtyChange = (boqItemId: string, enteredQty: number) => {
    const pkg = projectPackages.find(p => p.id === packageId);
    if (!pkg) return;

    const alloc = pkg.allocations.find(a => a.boqItemId === boqItemId);
    if (!alloc) return;

    setItemsValuations(prev => 
      prev.map(val => {
        if (val.boqItemId === boqItemId) {
          const proposedTotal = val.previousQty + enteredQty;
          
          // Warn if user attempts to exceed package allocated limit
          if (proposedTotal > alloc.allocatedQty) {
            alert(`Claim Quantity Warning! Cumulative claimed amount of ${proposedTotal} exceeds the package total sublet allowance of ${alloc.allocatedQty}. Cumulative quantity has been capped to allotted limit.`);
            const cappedQty = Math.max(0, alloc.allocatedQty - val.previousQty);
            return {
              ...val,
              currentQty: cappedQty,
              totalQty: val.previousQty + cappedQty
            };
          }

          return {
            ...val,
            currentQty: enteredQty,
            totalQty: proposedTotal
          };
        }
        return val;
      })
    );
  };

  // Intermediate calculations
  const calculateGrossCertified = () => {
    return itemsValuations.reduce((sum, item) => sum + (item.currentQty * item.rate), 0);
  };

  const getActivePackageTerms = () => {
    return projectPackages.find(p => p.id === packageId);
  };

  // Deductions calculations based on selected package SLA metrics
  const pkgTerms = getActivePackageTerms();
  const retentionDeduction = pkgTerms ? (calculateGrossCertified() * (pkgTerms.retentionPercentage / 100)) : 0;
  const advanceRecoveryDeduction = pkgTerms ? (calculateGrossCertified() * ((pkgTerms.recoveryPercentage || 15) / 100)) : 0;
  const netPayableCalculated = calculateGrossCertified() - retentionDeduction - advanceRecoveryDeduction - otherDeductions;

  const handleAddAttachmentSim = () => {
    if (!tempAttachmentName) return;
    setAttachments(prev => [
      ...prev,
      { id: `att-${Date.now()}`, name: tempAttachmentName, fileType: tempAttachmentName.split('.').pop() || 'xlsx' }
    ]);
    setTempAttachmentName('');
  };

  const handleSaveIPC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId || !ipcNo) {
      alert('Interims Billing reference code and package source must be declared.');
      return;
    }

    if (calculateGrossCertified() <= 0) {
      alert('Verification Error! Certified Gross value must make progress. Enter current work claimed quantities under the valuation log.');
      return;
    }

    const pkg = projectPackages.find(p => p.id === packageId)!;

    addIPC({
      ipcNo,
      packageId,
      subcontractorId: pkg.subcontractorId,
      projectId: currentProject.id,
      period,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: itemsValuations,
      certifiedAmount: calculateGrossCertified(),
      retentionAmount: retentionDeduction,
      advanceRecoveryAmount: advanceRecoveryDeduction,
      otherDeductions,
      deductionNotes,
      netAmount: netPayableCalculated,
      attachments
    });

    setActiveView('list');
    setPackageId('');
    setAttachments([]);
    alert('Monthly Interim Payment Certificate (IPC) saved to Draft ledger. Processed successfully.');
  };

  const handleStatusChangeAction = (id: string, proposedState: any) => {
    updateIPC(id, { status: proposedState });
    alert(`IPC status transitioned to ${proposedState}. Calculation ledger locked.`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD' }).format(val);
  };

  const filteredIPCs = projectIPCs.filter(i => {
    const pkg = projectPackages.find(p => p.id === i.packageId);
    return i.ipcNo.toLowerCase().includes(ipcSearch.toLowerCase()) || 
           (pkg && pkg.name.toLowerCase().includes(ipcSearch.toLowerCase()));
  });

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in text-[13px] text-slate-600 font-sans">
      
      {/* Dynamic Main view Router */}
      {activeView === 'list' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
          
          {/* Action Toolbar */}
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search IPC references..."
                value={ipcSearch}
                onChange={(e) => setIpcSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary-500 text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                setIpcNo(`SBC-IPC-${Math.floor(100 + Math.random() * 900)}`);
                setPeriod('2024 Q3');
                setOtherDeductions(0);
                setDeductionNotes('');
                setPackageId(projectPackages[0]?.id || '');
                setAttachments([]);
                setActiveView('create');
              }}
              disabled={projectPackages.length === 0}
              className={cn(
                "px-3.5 py-1.5 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none transition shadow-sm",
                projectPackages.length === 0 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-primary-650 hover:bg-primary-750 bg-primary-600 hover:bg-primary-750 text-white"
              )}
            >
              <Plus size={14} /> Certify Monthly Valuation
            </button>
          </div>

          {/* List panel */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {filteredIPCs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <Coins size={32} className="text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-900 leading-none">No monthly valuations certified</h4>
                <p className="text-xs text-slate-450 mt-1 max-w-xs font-semibold">Make sure you have authorized active subcontract packages to generate quarterly interim certificates.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse text-left relative text-zinc-650">
                  <thead className="bg-slate-50 text-zinc-400 select-none uppercase text-[10px] font-black tracking-wider sticky top-0 border-b border-slate-100 z-10">
                    <tr>
                      <th className="py-3 px-4">Certificate #</th>
                      <th className="py-3 px-4">Work Package</th>
                      <th className="py-3 px-4">Subcontractor</th>
                      <th className="py-3 px-4">Monthly Period</th>
                      <th className="py-3 px-4">Gross Progress</th>
                      <th className="py-3 px-4">Net Claim Payable</th>
                      <th className="py-3 px-4">Billing Status</th>
                      <th className="py-3 px-4 text-center">Measurement Sheets</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIPCs.map(ipc => {
                      const pkg = projectPackages.find(p => p.id === ipc.packageId);
                      const sub = subcontractors.find(s => s.id === ipc.subcontractorId);
                      return (
                        <tr key={ipc.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-primary-600 whitespace-nowrap">{ipc.ipcNo}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{pkg ? pkg.name : 'Unknown Service Package'}</td>
                          <td className="py-3 px-4 font-semibold text-slate-650 truncate max-w-[170px]">{sub ? sub.name : 'Unassigned'}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-bold">{ipc.period}</td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-800">{formatCurrency(ipc.certifiedAmount)}</td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono font-black text-indigo-750">{formatCurrency(ipc.netAmount)}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider inline-flex items-center gap-1 leading-none shadow-xs border",
                              ipc.status === 'Approved' || ipc.status === 'Paid'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-250/50"
                                : ipc.status === 'Submitted'
                                  ? "bg-amber-50 text-amber-700 border-amber-250/50"
                                  : "bg-slate-100 text-slate-550 border-slate-200/50"
                            )}>
                              {ipc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-400">
                            {ipc.attachments?.length || 0} files
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => { setSelectedIPCId(ipc.id); setActiveView('view'); }}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-[11.5px] cursor-pointer transition leading-none shadow-xs"
                            >
                              Open Certificate Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IPC View Workspace */}
      {activeView === 'view' && selectedIPC && (
        (() => {
          const pkg = projectPackages.find(p => p.id === selectedIPC.packageId);
          const sub = subcontractors.find(s => s.id === selectedIPC.subcontractorId);
          return (
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-y-auto space-y-6 animate-fade-in text-xs text-slate-655 font-sans leading-normal">
              
              {/* Back navigation and header with change states */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-150 pb-4">
                <div className="space-y-1">
                  <button 
                    onClick={() => setActiveView('list')}
                    className="text-primary-600 font-black hover:underline cursor-pointer leading-none text-[11.5px]"
                  >
                    ← Back to Valuations Ledger
                  </button>
                  <div className="flex items-center gap-3 mt-1 select-none">
                    <span className="font-mono text-xs font-black text-primary-655 bg-primary-50 px-2 py-0.5 rounded leading-none border border-slate-100">{selectedIPC.ipcNo}</span>
                    <span className="text-slate-400 font-bold">• Period: {selectedIPC.period}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-[14.5px] leading-tight">{pkg ? pkg.name : 'Work package'}</h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border font-bold text-[10px]">
                    {['Draft', 'Submitted', 'Approved', 'Paid'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChangeAction(selectedIPC.id, st as any)}
                        className={cn(
                          "px-2 py-1 rounded cursor-pointer leading-none transition-all",
                          selectedIPC.status === st 
                            ? "bg-white text-slate-900 font-extrabold shadow-sm" 
                            : "text-slate-400 hover:text-slate-800"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Summary Blocks */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 leading-none">
                <div className="bg-slate-50 border p-3 rounded-xl text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Gross Progress</span>
                  <span className="font-black text-slate-850 text-sm font-mono">{formatCurrency(selectedIPC.certifiedAmount)}</span>
                </div>
                <div className="bg-slate-50 border p-3 rounded-xl text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Retention Holding</span>
                  <span className="font-black text-amber-600 text-sm font-mono">- {formatCurrency(selectedIPC.retentionAmount)}</span>
                </div>
                <div className="bg-slate-50 border p-3 rounded-xl text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Advance Recovered</span>
                  <span className="font-black text-rose-550 text-sm font-mono">- {formatCurrency(selectedIPC.advanceRecoveryAmount)}</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-xl text-center shadow-xs">
                  <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block mb-1">Net Pay Certified</span>
                  <span className="font-black text-indigo-900 text-sm font-mono">{formatCurrency(selectedIPC.netAmount)}</span>
                </div>
              </div>

              {/* Itemized Valuations Breakdown Table */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Itemized Valuations breakdown</h5>
                <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Item Code</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">SLA Rate</th>
                        <th className="py-2.5 px-3 text-center">Previous Qty</th>
                        <th className="py-2.5 px-3 text-center">Current Qty</th>
                        <th className="py-2.5 px-3 text-center">Cumulative Qty</th>
                        <th className="py-2.5 px-3 text-right">Valued Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedIPC.items.map((item, index) => {
                        const matchedBOQItem = (Object.values(boqItemsMap) as BOQItem[][])
                          .flatMap(itm => itm)
                          .find(i => i.id === item.boqItemId);
                        
                        return (
                          <tr key={index} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-primary-650">{matchedBOQItem?.code || 'N/A'}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-sm" title={matchedBOQItem?.description}>{matchedBOQItem?.description || 'Item Description'}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">{formatCurrency(item.rate)}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-400">{item.previousQty}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-600">{item.currentQty}</td>
                            <td className="py-2.5 px-3 text-center font-bold">{item.previousQty + item.currentQty}</td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">{formatCurrency(item.currentQty * item.rate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions, Chargebacks & Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
                
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs">Contract Charges & General Chargebacks</h5>
                  <div className="bg-slate-50 border p-4.5 rounded-xl space-y-2">
                    <div className="flex justify-between font-bold text-[11.5px]">
                      <span className="text-slate-455">Other Penalties / Logistics Deductions:</span>
                      <span className="text-rose-550">- {formatCurrency(selectedIPC.otherDeductions || 0)}</span>
                    </div>
                    {selectedIPC.otherDeductions > 0 && selectedIPC.deductionNotes && (
                      <div className="text-[10.5px] text-slate-450 italic p-2 bg-white rounded border border-rose-100/50 leading-relaxed">
                        Reason: {selectedIPC.deductionNotes}
                      </div>
                    )}
                    <p className="text-[10.5px] text-slate-400 leading-snug pt-1 border-t border-dashed">All backcharges are logged under general ledger cost-control indicators dynamically on PM approval.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs">Measurement Sheets & Inflow Files ({selectedIPC.attachments?.length || 0})</h5>
                  {selectedIPC.attachments?.length === 0 ? (
                    <p className="text-slate-400 italic">No files connected to this certificate.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedIPC.attachments.map(doc => (
                        <div key={doc.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                          <span className="font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</span>
                          <button 
                            onClick={() => alert(`Simulating file download: ${doc.name}`)}
                            className="px-2 py-0.5 text-[10px] bg-white border rounded text-slate-655 font-bold cursor-pointer hover:bg-slate-100 leading-none shadow-xs"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()
      )}

      {/* IPC Creating Workspace Screen */}
      {activeView === 'create' && (
        <form onSubmit={handleSaveIPC} className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-y-auto space-y-5 animate-slide-up text-xs text-slate-650 font-sans leading-normal">
          
          <div className="flex border-b border-slate-150 pb-3 items-center justify-between select-none shrink-0">
            <div>
              <h4 className="font-bold text-slate-950 text-sm">Quantities Certification & Valuation</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Logs progress claims and computes interims payment liabilities inline.</p>
            </div>
            <button 
              type="button"
              onClick={() => setActiveView('list')}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer text-xs font-bold px-2.5 border"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Interim Valuation Reference # *</label>
              <input 
                type="text" 
                value={ipcNo}
                onChange={(e) => setIpcNo(e.target.value)}
                required
                className="p-2 border border-slate-200 bg-white rounded-lg text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Select Agreement Work Package *</label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                required
                className="p-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-950 cursor-pointer outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Choose Package Reference...</option>
                {projectPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.code} - {pkg.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Certification Period *</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="p-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-950 cursor-pointer outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="2024 M4">April 2024</option>
                <option value="2024 M5">May 2024</option>
                <option value="2024 M6">June 2024</option>
                <option value="2024 M7">July 2024</option>
                <option value="2024 Q3">2024 Q3 Period</option>
              </select>
            </div>

          </div>

          {/* Inline claims list inputs table */}
          <div className="space-y-1.5 min-h-0">
            <h5 className="font-bold text-slate-900 border-b pb-1">Claimed Physical Progress Logs</h5>
            {!packageId ? (
              <p className="text-slate-400 text-center py-10 border rounded bg-slate-50 italic">Select an active package reference to load its structural allocated BOQ items.</p>
            ) : (
              <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Item Ref</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Allotted Bound</th>
                      <th className="py-2.5 px-3 text-center">Negotiated Rate</th>
                      <th className="py-2.5 px-3 text-center">Previously Certified</th>
                      <th className="py-2.5 px-3 text-center w-32">Current Claimed Qty</th>
                      <th className="py-2.5 px-3 text-right">Claim Progress Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {itemsValuations.map((item, index) => {
                      const pkg = projectPackages.find(p => p.id === packageId)!;
                      const alloc = pkg.allocations.find(a => a.boqItemId === item.boqItemId)!;
                      
                      const matchedBOQItem = (Object.values(boqItemsMap) as BOQItem[][])
                        .flatMap(it => it)
                        .find(i => i.id === item.boqItemId);

                      return (
                        <tr key={index} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-primary-655 whitespace-nowrap">{matchedBOQItem?.code || 'N/A'}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-xs">{matchedBOQItem?.description || 'Allocated item description'}</td>
                          <td className="py-2 px-3 text-center font-bold">{alloc.allocatedQty} {matchedBOQItem?.unit}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-indigo-750">{formatCurrency(item.rate)}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-400">{item.previousQty}</td>
                          <td className="py-2 px-3 text-center">
                            <input 
                              type="number"
                              min={0}
                              max={alloc.allocatedQty - item.previousQty}
                              value={item.currentQty || ''}
                              onChange={(e) => handleCurrentQtyChange(item.boqItemId, parseFloat(e.target.value) || 0)}
                              className="w-full text-center p-1 font-bold border border-slate-200 hover:border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary-500 text-amber-700"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-black font-mono text-slate-900">{formatCurrency(item.currentQty * item.rate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Computed Deductions & Backcharges summary panel */}
          {packageId && pkgTerms && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-150 pt-5 leading-normal">
              
              <div className="space-y-3.5 bg-slate-50 border p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-slate-900">Custom Deductions / Backcharges</h5>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">Logs manual chargebacks (site welfare, material supply offsets, scaffolding penalties).</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Liquidated Deduction Amount ({currentProject.defaultCurrency})</label>
                    <input 
                      type="number"
                      value={otherDeductions}
                      onChange={(e) => setOtherDeductions(parseFloat(e.target.value) || 0)}
                      className="p-1.5 border bg-white rounded-lg text-xs font-bold text-rose-600 outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Statement Penalty remarks</label>
                    <textarea 
                      placeholder="Declare justification for damages, safety gear penalties..."
                      value={deductionNotes}
                      onChange={(e) => setDeductionNotes(e.target.value)}
                      rows={2}
                      className="p-1.5 border bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-bold text-slate-900">Aggregate Calculations Sheet</h5>
                <div className="bg-slate-50 border p-4.5 rounded-xl space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-normal">Gross claim Progress:</span>
                    <span className="font-mono">{formatCurrency(calculateGrossCertified())}</span>
                  </div>
                  <div className="flex justify-between text-amber-600">
                    <span className="font-normal">SLA Retention hold ({pkgTerms.retentionPercentage}%):</span>
                    <span className="font-mono">- {formatCurrency(retentionDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-rose-550">
                    <span className="font-normal">SLA Advance recoup ({pkgTerms.recoveryPercentage || 15}%):</span>
                    <span className="font-mono">- {formatCurrency(advanceRecoveryDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-rose-650">
                    <span className="font-normal">Logistics Deductions:</span>
                    <span className="font-mono">- {formatCurrency(otherDeductions)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200/60 pt-3 text-slate-950 text-xs shrink-0 font-extrabold items-center">
                    <span className="text-slate-500">Proposed net certification payout:</span>
                    <span className="font-mono text-indigo-750 font-black text-sm">{formatCurrency(netPayableCalculated)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Measure sheet attachments simulator */}
          {packageId && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Measure records upload ({attachments.length} attached)</h5>
              {attachments.length > 0 && (
                <div className="space-y-1.5 max-w-md">
                  {attachments.map(att => (
                    <div key={att.id} className="p-2 bg-slate-50 border rounded-lg flex items-center justify-between gap-4 font-semibold text-slate-700">
                      <span className="truncate">{att.name}</span>
                      <button 
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter(p=>p.id!==att.id))}
                        className="text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 max-w-sm">
                <input 
                  type="text" 
                  placeholder="e.g. June_Concrete_Pours_MeasurementSheet.xlsx"
                  value={tempAttachmentName}
                  onChange={(e) => setTempAttachmentName(e.target.value)}
                  className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs focus:ring-1 focus:ring-primary-500 bg-slate-50"
                />
                <button 
                  type="button" 
                  disabled={!tempAttachmentName}
                  onClick={handleAddAttachmentSim}
                  className="px-3 bg-slate-200 text-slate-700 disabled:opacity-50 font-bold text-xs rounded-lg shadow-sm"
                >
                  Link File
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex justify-end gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setActiveView('list')}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer font-bold shrink-0 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={calculateGrossCertified() <= 0}
              className={cn(
                "px-4 py-2 text-white font-bold rounded-lg shrink-0 transition shadow-md leading-none cursor-pointer",
                calculateGrossCertified() <= 0 ? "bg-slate-200 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"
              )}
            >
              Issue Draft Certificate
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
