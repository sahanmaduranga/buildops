import React, { useState } from 'react';
import { useSubcontract, type SubcontractAgreement } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  FileText, 
  Plus, 
  Search, 
  HelpCircle, 
  CheckCircle, 
  Calendar, 
  Trash2, 
  Upload, 
  Download, 
  AlertCircle,
  TrendingUp,
  FileCheck2,
  FolderMinus,
  Briefcase,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export function SubcontractAgreements() {
  const { currentProject } = useProject();
  const { 
    subcontractors, 
    packages, 
    agreements, 
    addAgreement, 
    updateAgreement, 
    deleteAgreement, 
    addAgreementDocument 
  } = useSubcontract();

  // Selected agreement focused
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [agreementSearch, setAgreementSearch] = useState('');
  
  // Add Agreement drawer state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [agreementNo, setAgreementNo] = useState('');
  const [packageId, setPackageId] = useState('');
  const [subcontractorId, setSubcontractorId] = useState('');
  const [retentionPercentage, setRetentionPercentage] = useState(10);
  const [advancePercentage, setAdvancePercentage] = useState(20);
  const [recoveryPercentage, setRecoveryPercentage] = useState(15);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Signed' | 'Active' | 'Closed' | 'Terminated'>('Draft');

  // File Upload Simulator
  const [attachedDocName, setAttachedDocName] = useState('');

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1">Please select an active project workspace to load its subcontract agreements.</p>
      </div>
    );
  }

  const projectAgreements = agreements.filter(a => a.projectId === currentProject.id);
  const activeAgreement = projectAgreements.find(a => a.id === selectedAgreementId) || projectAgreements[0];

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementNo || !packageId || !subcontractorId) {
      alert('Agreement number, package reference, and subcontractor are required.');
      return;
    }

    const pkg = packages.find(p => p.id === packageId);
    const calculatedValue = pkg ? pkg.revisedContractValue : 0;

    addAgreement({
      agreementNo,
      agreementDate: new Date().toISOString().split('T')[0],
      packageId,
      subcontractorId,
      projectId: currentProject.id,
      contractValue: calculatedValue,
      retentionPercentage,
      advancePercentage,
      recoveryPercentage,
      paymentTerms,
      remarks,
      status
    });

    setIsFormOpen(false);
    alert('Subcontract Agreement successfully generated in Draft status.');
  };

  const handleAddSBCDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgreement || !attachedDocName) return;

    addAgreementDocument(activeAgreement.id, {
      name: attachedDocName,
      fileType: attachedDocName.split('.').pop() || 'pdf'
    });

    setAttachedDocName('');
    alert('Certified corporate SLA document linked successfully.');
  };

  const handleDeleteSBCArg = (id: string) => {
    if (confirm('Permanently remove this agreement from project records?')) {
      deleteAgreement(id);
      setSelectedAgreementId(null);
    }
  };

  const changeStatusSBCArg = (id: string, newStats: any) => {
    updateAgreement(id, { status: newStats });
    alert(`Agreement status updated to ${newStats} successfully.`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD' }).format(val);
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in text-[13px] text-slate-600 font-sans">
      
      {/* Top action row */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search agreements ledger..."
            value={agreementSearch}
            onChange={(e) => setAgreementSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary-500 text-xs focus:outline-none"
          />
        </div>

        <button
          onClick={() => {
            setAgreementNo(`AGR-${currentProject.code.split('-')[1] || 'SBC'}-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
            setPackageId(packages[0]?.id || '');
            setSubcontractorId(subcontractors[0]?.id || '');
            setPaymentTerms('30-days certification cycles.');
            setRemarks('');
            setStatus('Draft');
            setIsFormOpen(true);
          }}
          className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none transition shadow-sm"
        >
          <Plus size={14} /> Create Agreement SLA
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden min-h-0">
        
        {/* Left Side: Agreements listing */}
        <div className="w-full lg:w-[270px] bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-2 shrink-0 overflow-y-auto">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 pb-1.5 mb-1 px-1">
            Agreements Ledger ({projectAgreements.length})
          </label>

          {projectAgreements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">No agreements in system.</div>
          ) : (
            <div className="space-y-1.5">
              {projectAgreements.map(arg => {
                const isSelected = activeAgreement && arg.id === activeAgreement.id;
                const pkg = packages.find(p => p.id === arg.packageId);
                const sub = subcontractors.find(s => s.id === arg.subcontractorId);
                return (
                  <div
                    key={arg.id}
                    onClick={() => setSelectedAgreementId(arg.id)}
                    className={cn(
                      "p-3 rounded-xl border transition cursor-pointer text-left relative",
                      isSelected 
                        ? "bg-primary-50/50 border-primary-500 text-slate-900 shadow-xs" 
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-300 text-slate-650"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10.5px] text-primary-600 bg-white px-1.5 py-0.5 rounded leading-none border border-slate-100">
                        {arg.agreementNo}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-1 rounded leading-none",
                        arg.status === 'Signed' || arg.status === 'Active' ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                      )}>
                        {arg.status}
                      </span>
                    </div>

                    <h5 className="font-bold text-[11.5px] text-slate-900 mt-2 truncate leading-snug">{pkg ? pkg.name : 'Subcontract Package'}</h5>
                    <p className="text-[10.5px] text-slate-400 font-semibold truncate mt-1">{sub ? sub.name : 'Unknown Firm'}</p>

                    <div className="flex items-center justify-between border-t border-dashed border-slate-200/60 mt-2.5 pt-2 text-[11px] font-bold">
                      <span className="text-slate-450">Agreed Value</span>
                      <span className="text-slate-800">{formatCurrency(arg.contractValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Detailed Focus details with Document links */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-y-auto p-5">
          {!activeAgreement ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <FolderMinus className="text-slate-300 mb-3" size={32} />
              <h4 className="font-bold text-slate-900 leading-none">No Agreement record active</h4>
              <p className="text-xs text-slate-400 mt-1">Select an active agreement to read SLA parameters, pay clauses, and linked documents.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in leading-normal text-xs text-slate-600">
              
              {/* Header Title with Workflow actions */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-150 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-primary-650 bg-primary-50 px-2 py-0.5 rounded leading-none">
                      {activeAgreement.agreementNo}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Date Signed: {activeAgreement.agreementDate}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-[14.5px] mt-1.5">
                    {packages.find(p => p.id === activeAgreement.packageId)?.name || 'Unmapped Subcontract package'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 font-bold text-[10px]">
                    {['Draft', 'Signed', 'Active', 'Closed'].map(st => (
                      <button
                        key={st}
                        onClick={() => changeStatusSBCArg(activeAgreement.id, st as any)}
                        className={cn(
                          "px-2 py-1 rounded cursor-pointer leading-none transition-all",
                          activeAgreement.status === st 
                            ? "bg-white text-slate-900 shadow-sm font-extrabold" 
                            : "text-slate-400 hover:text-slate-800"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleDeleteSBCArg(activeAgreement.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded border border-slate-100 cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Grid detail stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
                <div className="bg-slate-50 p-3.5 border rounded-xl shadow-inner text-center">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">Agreed Contract Value</span>
                  <span className="font-black text-slate-900 text-sm font-mono">{formatCurrency(activeAgreement.contractValue)}</span>
                </div>
                <div className="bg-slate-50 p-3.5 border rounded-xl shadow-inner text-center">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">Security Retention</span>
                  <span className="font-black text-amber-600 text-sm font-mono">{activeAgreement.retentionPercentage}% holdback</span>
                </div>
                <div className="bg-slate-50 p-3.5 border rounded-xl shadow-inner text-center">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">Mobilization Advance</span>
                  <span className="font-black text-indigo-700 text-sm font-mono">{activeAgreement.advancePercentage}% allocation</span>
                </div>
                <div className="bg-slate-50 p-3.5 border rounded-xl shadow-inner text-center">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">Mobilization Recovery</span>
                  <span className="font-black text-rose-600 text-sm font-mono">{activeAgreement.recoveryPercentage || 15}% rate</span>
                </div>
              </div>

              {/* Specialty & Sub info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Associated Subcontractor Info</h5>
                  {subcontractors.find(s => s.id === activeAgreement.subcontractorId) ? (
                    (() => {
                      const sub = subcontractors.find(s => s.id === activeAgreement.subcontractorId)!;
                      return (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1">
                          <p className="font-bold text-slate-900">{sub.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Contact: {sub.contactPerson} | {sub.phone}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Bank settle: {sub.bankName} - {sub.bankAccountNumber}</p>
                        </div>
                      );
                    })()
                  ) : <p className="text-xs text-slate-400 italic">No subcontractor matched.</p>}
                </div>

                <div className="space-y-2 font-sans">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Negotiated SLA Payment Terms</h5>
                  <div className="p-3 bg-indigo-50/40 border border-indigo-150/40 rounded-lg text-[11px] font-medium text-slate-600">
                    <p className="leading-relaxed"><strong className="text-indigo-900">Certified Milestone Transfer:</strong> {activeAgreement.paymentTerms || 'Terms subject to interims valuations.'}</p>
                    {activeAgreement.remarks && <p className="mt-2 text-[10.5px] italic text-slate-400">Notes: {activeAgreement.remarks}</p>}
                  </div>
                </div>
              </div>

              {/* Collateral/Guarantees and Docs section */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 size={15} className="text-primary-600" />
                    Agreement SLA Documents ({activeAgreement.documents.length})
                  </h5>

                  <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold">Auto Version Tracking active</span>
                </div>

                {activeAgreement.documents.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 italic bg-slate-50 border rounded-xl border-dashed">No contract scan or performance guarantee files linked yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeAgreement.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-white rounded border border-slate-200 text-primary-600 font-black">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Version {doc.version} • uploaded {new Date(doc.uploadedAt).toLocaleString()} by {doc.uploadedBy}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => alert(`Simulating file download of: ${doc.name}`)}
                          className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded flex items-center gap-1 cursor-pointer leading-none"
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Form Simulator */}
                <form onSubmit={handleAddSBCDocument} className="bg-slate-50 p-4 border border-dashed rounded-xl flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Simulate SLA Attachment Upload</label>
                    <input 
                      type="text"
                      placeholder="e.g. Bank_Guarantee_Shoring_Works_Final.pdf"
                      required
                      value={attachedDocName}
                      onChange={(e) => setAttachedDocName(e.target.value)}
                      className="p-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-550"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-3.5 py-2 bg-primary-650 hover:bg-primary-750 bg-primary-600 hover:bg-primary-750 text-white font-bold text-xs rounded-lg flex items-center gap-1 leading-none shadow-sm cursor-pointer"
                  >
                    <Upload size={12} /> Upload File
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Create Agreement Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in text-xs leading-normal">
          <div className="fixed inset-0" onClick={() => setIsFormOpen(false)} />
          <form 
            onSubmit={handleCreateAgreement}
            className="relative bg-white border border-slate-300 shadow-xl rounded-2xl w-full max-w-[480px] flex flex-col z-10 overflow-hidden font-sans"
          >
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-bold text-slate-950 text-sm">Create Subcontract Agreement SLA</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Establishes the mutual SLA coefficients and payment mobilization.</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Agreement Number *</label>
                <input 
                  type="text" 
                  value={agreementNo}
                  onChange={(e) => setAgreementNo(e.target.value)}
                  required
                  className="p-2 border border-slate-200 rounded-lg text-xs font-mono select-all text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Ref Work Package *</label>
                  <select
                    value={packageId}
                    onChange={(e) => {
                      setPackageId(e.target.value);
                      const pkg = packages.find(p => p.id === e.target.value);
                      if (pkg) {
                        setSubcontractorId(pkg.subcontractorId);
                        setRetentionPercentage(pkg.retentionPercentage);
                        setAdvancePercentage(pkg.advancePercentage);
                        setRecoveryPercentage(pkg.recoveryPercentage || 15);
                      }
                    }}
                    required
                    className="p-2 border border-slate-200 bg-white rounded-lg text-xs text-slate-950 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="">Select Package...</option>
                    {packages.filter(p => !projectAgreements.some(a=>a.packageId === p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Subcontractor Firm</label>
                  <select
                    value={subcontractorId}
                    onChange={(e) => setSubcontractorId(e.target.value)}
                    required
                    disabled
                    className="p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 outline-none cursor-not-allowed"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 border p-4.5 rounded-xl grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-black tracking-widest text-slate-450">Retention %</label>
                  <input 
                    type="number"
                    value={retentionPercentage}
                    onChange={(e) => setRetentionPercentage(parseFloat(e.target.value) || 0)}
                    required
                    className="p-1.5 border border-slate-200 rounded text-xs select-none block font-bold text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-black tracking-widest text-slate-455">Advance Mobilization %</label>
                  <input 
                    type="number"
                    value={advancePercentage}
                    onChange={(e) => setAdvancePercentage(parseFloat(e.target.value) || 0)}
                    required
                    className="p-1.5 border border-slate-200 rounded text-xs select-none block font-bold text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-black tracking-widest text-slate-455">Recovery %</label>
                  <input 
                    type="number"
                    value={recoveryPercentage}
                    onChange={(e) => setRecoveryPercentage(parseFloat(e.target.value) || 0)}
                    required
                    className="p-1.5 border border-slate-200 rounded text-xs select-none block font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Payment SLA Conditions Terms *</label>
                <textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. subject to 30 day measurement approvals, exclusive of tax hold back..."
                  required
                  rows={2}
                  className="p-2 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-500 resize-none leading-normal"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Internal Audit Marks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Review or guarantee remarks..."
                  rows={2}
                  className="p-2 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-500 resize-none leading-normal"
                />
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
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer leading-none shadow-md transition"
                >
                  Save Draft Agreement
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

    </div>
  );
}
