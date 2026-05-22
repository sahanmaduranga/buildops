import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils.ts';
import { INITIAL_SUPPLIERS, INITIAL_RESOURCES, Supplier, EnhancedResource } from './resourceMockData.ts';
import { Plus, Check, Star, Mail, Phone, MapPin, Award, Eye, Search, Heart, User, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Supplier Form
  const [modalForm, setModalForm] = useState<Omit<Supplier, 'id'>>({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    status: 'Active',
    isPreferred: false
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(sup => {
      const q = searchQuery.toLowerCase();
      return sup.name.toLowerCase().includes(q) || sup.code.toLowerCase().includes(q) || sup.contactPerson.toLowerCase().includes(q);
    });
  }, [suppliers, searchQuery]);

  // Find linked resources for a supplier name
  const getSuppliedResources = (supplierName: string) => {
    return INITIAL_RESOURCES.filter(res => res.supplier === supplierName);
  };

  const handleTogglePreferred = (id: string) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isPreferred: !s.isPreferred } : s));
  };

  const handleToggleStatus = (id: string) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setModalForm({
      code: `SUP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: `VAT-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
      isPreferred: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setIsEditing(true);
    setSelectedSupplier(sup);
    setModalForm({
      code: sup.code,
      name: sup.name,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      taxNumber: sup.taxNumber,
      status: sup.status,
      isPreferred: sup.isPreferred
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedSupplier) {
      setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? { ...s, ...modalForm } : s));
    } else {
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        ...modalForm
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* Header controls */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <span>🤝 Qualified Procurement Suppliers</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Monitor trade tax certificates, SLA preference configurations, and active catalogs of regional trade suppliers.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus-within:border-primary-500 w-full sm:w-56">
            <Search size={14} className="mr-1.5 opacity-50 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter suppliers..."
              className="bg-transparent border-none text-xs w-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-primary-600 text-white font-bold text-xs py-2 px-4 rounded-lg hover:bg-primary-700 transition shadow shrink-0 cursor-pointer"
          >
            <Plus size={14} /> Register Supplier
          </button>
        </div>
      </div>

      {/* Supplier Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(sup => {
          const supplied = getSuppliedResources(sup.name);
          return (
            <div 
              key={sup.id} 
              className={cn(
                "bg-white border rounded-xl overflow-hidden shadow-sm transition-all relative flex flex-col justify-between hover:shadow-md",
                sup.isPreferred ? "border-amber-200 bg-amber-50/5" : "border-slate-200"
              )}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-start gap-3 bg-slate-50/30">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold border">
                      {sup.code}
                    </span>
                    <button 
                      onClick={() => handleTogglePreferred(sup.id)}
                      className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      title={sup.isPreferred ? "Preferred Supplier" : "Mark Preferred"}
                    >
                      <Star size={14} fill={sup.isPreferred ? "#f59e0b" : "none"} />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-[#111e29] text-sm mt-1.5 truncate">{sup.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <User size={10} /> {sup.contactPerson}
                  </p>
                </div>

                <button 
                  onClick={() => handleToggleStatus(sup.id)}
                  className={cn(
                    "text-[8.5px] px-2 py-0.5 rounded-full font-black uppercase leading-none tracking-wider",
                    sup.status === 'Active' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}
                >
                  {sup.status}
                </button>
              </div>

              {/* Contact Information & address */}
              <div className="p-4 space-y-2 text-xs text-slate-500 flex-1">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{sup.address}</span>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-100 flex justify-between text-[11px]">
                  <span className="font-bold text-slate-400">VAT Reg:</span>
                  <span className="font-mono text-slate-700 font-bold">{sup.taxNumber}</span>
                </div>
              </div>

              {/* SUPPLIED RESOURCES LIST */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
                <p className="font-black text-slate-400 uppercase tracking-wider text-[9.5px] mb-2">Supplied Items ({supplied.length})</p>
                {supplied.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                    {supplied.map(res => (
                      <span 
                        key={res.id}
                        className="text-[9.5px] bg-white border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded shadow-sm hover:border-primary-500 cursor-pointer"
                        title={res.name}
                      >
                        {res.code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No resource catalog links recorded.</p>
                )}
              </div>

              {/* Edit button */}
              <div className="p-3 bg-slate-100/50 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => handleOpenEdit(sup)}
                  className="w-full text-center hover:bg-slate-200 text-slate-700 bg-white border border-slate-200 font-bold py-1.5 rounded text-xs transition-colors"
                >
                  Configure Details & Contacts
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[85]" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[95] flex flex-col overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-slate-800">
                  {isEditing ? 'Configure Supplier Profile' : 'Register Supplier profile'}
                </h4>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Supplier Code</label>
                    <input 
                      type="text" required value={modalForm.code}
                      onChange={(e) => setModalForm({...modalForm, code: e.target.value})}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Tax Reg (VAT)</label>
                    <input 
                      type="text" required value={modalForm.taxNumber}
                      onChange={(e) => setModalForm({...modalForm, taxNumber: e.target.value})}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Company Name</label>
                  <input 
                    type="text" required value={modalForm.name}
                    onChange={(e) => setModalForm({...modalForm, name: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-primary-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Contact Person</label>
                  <input 
                    type="text" required value={modalForm.contactPerson}
                    onChange={(e) => setModalForm({...modalForm, contactPerson: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Email</label>
                    <input 
                      type="email" required value={modalForm.email}
                      onChange={(e) => setModalForm({...modalForm, email: e.target.value})}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Phone</label>
                    <input 
                      type="text" required value={modalForm.phone}
                      onChange={(e) => setModalForm({...modalForm, phone: e.target.value})}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Address Location</label>
                  <input 
                    type="text" required value={modalForm.address}
                    onChange={(e) => setModalForm({...modalForm, address: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600">
                    <input 
                      type="checkbox" checked={modalForm.isPreferred}
                      onChange={(e) => setModalForm({...modalForm, isPreferred: e.target.checked})}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Preferred Partner Status</span>
                  </label>
                </div>

                <div className="pt-2 flex gap-2">
                  <button type="submit" className="flex-1 bg-primary-600 text-white font-bold py-2 rounded-lg">
                    Confirm Details
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 border border-slate-200 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
