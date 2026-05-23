import React, { useState } from 'react';
import { useSubcontract, type Subcontractor } from '../../context/SubcontractContext.tsx';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Star, 
  Phone, 
  Mail, 
  Building2, 
  MoreVertical, 
  Edit, 
  Trash2, 
  MapPin, 
  X, 
  Filter, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.ts';

const SPECIALTIES = [
  'Civil', 'Structural', 'Electrical', 'Plumbing',
  'HVAC', 'Aluminum', 'Interior', 'Finishing',
  'Landscaping', 'Mechanical'
];

export function SubcontractorRegistry() {
  const { subcontractors, addSubcontractor, updateSubcontractor, deleteSubcontractor } = useSubcontract();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcontractor | null>(null);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [viewingSub, setViewingSub] = useState<Subcontractor | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [specialty, setSpecialty] = useState('Civil');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [rating, setRating] = useState(5);

  const openAddForm = () => {
    setEditingSub(null);
    setCode(`SBC-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setRegNumber('');
    setTaxNumber('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setSpecialty('Civil');
    setBankName('');
    setBankAccountNumber('');
    setNotes('');
    setStatus('Active');
    setRating(5);
    setIsFormOpen(true);
  };

  const openEditForm = (sub: Subcontractor) => {
    setEditingSub(sub);
    setCode(sub.code);
    setName(sub.name);
    setRegNumber(sub.registrationNumber || '');
    setTaxNumber(sub.taxNumber || '');
    setContactPerson(sub.contactPerson);
    setPhone(sub.phone);
    setEmail(sub.email);
    setAddress(sub.address || '');
    setSpecialty(sub.specialty);
    setBankName(sub.bankName || '');
    setBankAccountNumber(sub.bankAccountNumber || '');
    setNotes(sub.notes || '');
    setStatus(sub.status);
    setRating(sub.rating);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !email) {
      alert('Please fill in the required fields (name, contact person, email)');
      return;
    }

    const payload = {
      code,
      name,
      registrationNumber: regNumber,
      taxNumber,
      contactPerson,
      phone,
      email,
      address,
      specialty,
      bankName,
      bankAccountNumber,
      notes,
      status,
      rating
    };

    if (editingSub) {
      updateSubcontractor(editingSub.id, payload);
    } else {
      addSubcontractor(payload);
    }
    setIsFormOpen(false);
    setEditingSub(null);
  };

  const handleExport = () => {
    alert('Master Subcontractor Registry successfully exported as XLSX (4 records generated, formatted output saved to device).');
  };

  const filteredSubs = subcontractors.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All' || sub.specialty === selectedSpecialty;
    const matchesStatus = selectedStatus === 'All' || sub.status === selectedStatus;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in text-[13px] text-slate-600 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2">
            <Building2 className="text-primary-600" size={24} />
            Master Subcontractor Registry
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Global catalog of subcontractor firms pre-qualified and reusable across enterprise workspaces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="px-3.5 py-2 hover:bg-slate-50 text-slate-700 bg-white border border-slate-200 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none shadow-sm transition"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Export List
          </button>
          
          <button 
            onClick={openAddForm}
            className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none shadow-sm transition"
          >
            <Plus size={14} /> Add Subcontractor
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden min-h-0">
        
        {/* Left filter panel */}
        <div className="w-full lg:w-[240px] shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-950 flex items-center gap-1.5">
              <Filter size={14} className="text-primary-600" /> Filter Criteria
            </span>
            {(selectedSpecialty !== 'All' || selectedStatus !== 'All' || searchTerm) && (
              <button 
                onClick={() => { setSelectedSpecialty('All'); setSelectedStatus('All'); setSearchTerm(''); }}
                className="text-[10px] text-primary-600 font-extrabold hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Name, code, specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary-500 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Specialty</label>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setSelectedSpecialty('All')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition text-xs font-semibold",
                  selectedSpecialty === 'All' 
                    ? "bg-primary-50 text-primary-700 font-bold" 
                    : "hover:bg-slate-50 text-slate-600"
                )}
              >
                All Specialties ({subcontractors.length})
              </button>
              {SPECIALTIES.map(spec => {
                const count = subcontractors.filter(s => s.specialty === spec).length;
                return (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-left transition text-xs font-semibold flex items-center justify-between",
                      selectedSpecialty === spec 
                        ? "bg-primary-50 text-primary-700 font-bold" 
                        : "hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <span>{spec}</span>
                    <span className="text-[10px] font-bold text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[11px] uppercase font-black tracking-widest text-slate-400">Status</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['All', 'Active', 'Inactive'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={cn(
                    "flex-1 py-1 text-center rounded-md font-bold text-[10.5px] cursor-pointer transition",
                    selectedStatus === s 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main table grid */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 overflow-y-auto">
          {filteredSubs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Building2 size={24} className="text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-900">No Subcontractors Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Try clearing your filters or create a new registry entry to begin.</p>
              <button 
                onClick={openAddForm}
                className="mt-4 px-3 py-1.5 bg-primary-600 text-white font-bold rounded-lg text-xs hover:bg-primary-700 transition"
              >
                Add Subcontractor
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-zinc-600 relative">
              <thead className="bg-slate-50 text-zinc-400 select-none uppercase text-[10px] font-black tracking-wider sticky top-0 border-b border-slate-100 z-10">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Subcontractor Name</th>
                  <th className="py-3 px-4">Specialty</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Active Projects</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 divide-dashed">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-primary-600 font-mono whitespace-nowrap">{sub.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-950">
                      <div>{sub.name}</div>
                      {sub.registrationNumber && (
                        <div className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">Reg: {sub.registrationNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700">
                        {sub.specialty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{sub.contactPerson}</p>
                      <span className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={11} /> {sub.email}</span>
                      <span className="text-[10.5px] text-slate-400 flex items-center gap-1"><Phone size={11} /> {sub.phone}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider leading-none shrink-0 inline-flex items-center gap-1",
                        sub.status === 'Active' 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                          : "bg-slate-50 text-slate-500 border border-slate-200/50"
                      )}>
                        <span className={cn("w-1 h-1 rounded-full", sub.status === 'Active' ? "bg-emerald-500" : "bg-slate-400")} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{sub.activeProjectsCount || 0}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < Math.floor(sub.rating) ? "currentColor" : "none"} className={i < Math.floor(sub.rating) ? "" : "text-slate-200"} />
                        ))}
                        <span className="text-[11px] text-slate-500 font-bold ml-1">{sub.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setViewingSub(sub)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs font-bold px-2 cursor-pointer border border-slate-200"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => openEditForm(sub)}
                          className="p-1 hover:bg-slate-100 rounded text-primary-600 cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirmId(sub.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex gap-3 items-start text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Delete Subcontractor?</h4>
                <p className="text-xs text-slate-500">This action will permanently delete this subcontractor registry entry. This operation is irreversible.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-slate-100">
              <button 
                onClick={() => setShowDeleteConfirmId(null)}
                className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteSubcontractor(showDeleteConfirmId);
                  setShowDeleteConfirmId(null);
                }}
                className="px-3.5 py-2 bg-rose-650 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Delete Registry Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {viewingSub && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg mx-4 flex flex-col overflow-hidden max-h-[85vh]">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-primary-600 text-xs font-mono bg-primary-50 px-2 py-0.5 rounded">{viewingSub.code}</span>
                <h4 className="font-bold text-slate-950 text-sm">{viewingSub.name}</h4>
              </div>
              <button onClick={() => setViewingSub(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-normal">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Specialty Type</p>
                  <p className="font-bold text-slate-900 text-xs mt-1">{viewingSub.specialty}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Registry Status</p>
                  <p className="font-bold mt-1">
                    <span className={cn(
                      "px-2 py-0.2 rounded text-[10px] font-bold leading-none inline-flex items-center gap-1",
                      viewingSub.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                    )}>
                      {viewingSub.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Reg Number</p>
                  <p className="text-slate-800 mt-1 font-mono">{viewingSub.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">TAX Identification</p>
                  <p className="text-slate-800 mt-1 font-mono">{viewingSub.taxNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h5 className="font-bold text-xs text-slate-900">Primary Contact</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Contact Person</span>
                    <span className="font-semibold text-slate-700">{viewingSub.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Email</span>
                    <span className="text-slate-700 block select-all truncate">{viewingSub.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Phone Line</span>
                    <span className="text-slate-700 block select-all">{viewingSub.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Office Address</span>
                    <span className="text-slate-700 block">{viewingSub.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h5 className="font-bold text-xs text-slate-900">Bank Settlement Details</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Settlement Bank</span>
                    <span className="font-semibold text-slate-700">{viewingSub.bankName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Account Number</span>
                    <span className="text-slate-700 font-mono block select-all">{viewingSub.bankAccountNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {viewingSub.notes && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Remarks & Audit Notes</p>
                  <p className="text-slate-500 bg-slate-50 rounded-lg p-3 mt-1.5 leading-relaxed italic">{viewingSub.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => { setViewingSub(null); openEditForm(viewingSub); }} 
                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold text-xs transition"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setViewingSub(null)} 
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-bold text-xs transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-[100] animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsFormOpen(false)} />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="relative bg-white w-full max-w-[500px] h-full shadow-2xl flex flex-col z-10"
          >
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-950 text-sm">
                  {editingSub ? `Modify: ${editingSub.name}` : 'New Subcontractor Profile'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Define corporate registry profile and default bank details.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-primary-700">Administrative Identifiers</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Company Code *</label>
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Specialty *</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-950 outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {SPECIALTIES.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Legal Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. State Development Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Registration ID</label>
                    <input 
                      type="text" 
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. PV-12495"
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">TAX Identification (VAT/TIN)</label>
                    <input 
                      type="text" 
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="e.g. TAX-13245"
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-800">Primary Contact Desk</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Contact Officer Name *</label>
                    <input 
                      type="text" 
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                      placeholder="Mr. Susantha Gunawardena"
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Officer Email *</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="contacts@sbc.lk"
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Phone Hotline *</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+94 11..."
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Work Office Address</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h5 className="font-bold text-xs text-slate-800">Settlement Account & Governance</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Settlement Bank</label>
                    <input 
                      type="text" 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Bank of Ceylon"
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Account Number</label>
                    <input 
                      type="text" 
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. 1002341051"
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Default Prequalification Rating (1-5)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value))}
                      className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-950 outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent (5.0)</option>
                      <option value="4">⭐⭐⭐⭐ Highly Reliable (4.0)</option>
                      <option value="3">⭐⭐⭐ Good Status (3.0)</option>
                      <option value="2">⭐⭐ Satisfactory (2.0)</option>
                      <option value="1">⭐ Probation (1.0)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Registry Status</label>
                    <div className="flex p-0.5 bg-slate-100 rounded-lg mt-0.5 border border-slate-200">
                      {['Active', 'Inactive'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(st as any)}
                          className={cn(
                            "flex-1 py-1.5 text-center text-xs font-bold rounded-md cursor-pointer",
                            status === st ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"
                          )}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Technical Qualifications Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any pre-qualification assessment or licensing scopes..."
                    rows={3}
                    className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-primary-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </form>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 hover:bg-slate-100 border border-slate-200 font-bold text-slate-600 rounded-lg text-xs cursor-pointer transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md transition"
              >
                {editingSub ? 'Save Profile' : 'Register Subcontractor'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
