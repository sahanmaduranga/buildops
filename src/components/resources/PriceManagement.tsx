import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils.ts';
import { INITIAL_PRICES, INITIAL_RESOURCES, INITIAL_SUPPLIERS, ResourcePrice, MOCK_PRICING_HISTORY } from './resourceMockData.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { Plus, Search, Filter, ShieldCheck, ChevronRight, BarChart3, TrendingUp, X, Check, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export const PriceManagement = () => {
  const [prices, setPrices] = useState<ResourcePrice[]>(INITIAL_PRICES);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create Price Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    resourceId: '',
    regionId: '1',
    regionName: 'Riyadh Central',
    supplierId: 'sup-1',
    supplierName: 'LafargeHolcim',
    effectiveDate: '2026-05-21',
    fiscalPeriod: '2026 Q1',
    unitRate: 0,
    currency: 'USD',
  });

  const regions = [
    { id: '1', name: 'Riyadh Central' },
    { id: '2', name: 'Jeddah Coastal' },
    { id: '3', name: 'Dammam Eastern' },
    { id: '4', name: 'NEOM District' },
  ];

  const periods = [
    { id: '1', name: '2024 Q1' },
    { id: '2', name: '2024 Q2' },
    { id: '3', name: '2025 Q3' },
    { id: '4', name: '2025 Q4' },
    { id: '5', name: '2026 Q1' },
  ];

  // Filtering Logic
  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      if (selectedRegion !== 'all' && p.regionId !== selectedRegion) return false;
      if (selectedPeriod !== 'all' && p.fiscalPeriod !== selectedPeriod) return false;
      
      const q = searchQuery.toLowerCase();
      if (q) {
        return p.resourceName.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [prices, selectedRegion, selectedPeriod, searchQuery]);

  const handleDeactivate = (id: string) => {
    setPrices(prev => prev.map(p => p.id === id ? { ...p, status: 'Deactivated' as const } : p));
  };

  const handleCreatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const res = INITIAL_RESOURCES.find(r => r.id === modalForm.resourceId);
    const sup = INITIAL_SUPPLIERS.find(s => s.id === modalForm.supplierId);
    const reg = regions.find(r => r.id === modalForm.regionId);

    const newPrice: ResourcePrice = {
      id: `p-${Date.now()}`,
      resourceId: modalForm.resourceId,
      resourceName: res?.name || 'Unknown Resource',
      regionId: modalForm.regionId,
      regionName: reg?.name || 'Riyadh Central',
      supplierId: modalForm.supplierId,
      supplierName: sup?.name || 'LafargeHolcim',
      effectiveDate: modalForm.effectiveDate,
      fiscalPeriod: modalForm.fiscalPeriod,
      unitRate: modalForm.unitRate,
      currency: modalForm.currency,
      status: 'Active'
    };

    setPrices([newPrice, ...prices]);
    setIsModalOpen(false);
  };

  // Static pricing trend data for Recharts (combining cement and steel index velocities)
  const lineChartData = [
    { period: '2025 Q1', PortlandCement: 8.10, StructuralSteel: 690, SkilledMason: 42.0 },
    { period: '2025 Q2', PortlandCement: 8.32, StructuralSteel: 695, SkilledMason: 43.5 },
    { period: '2025 Q3', PortlandCement: 8.35, StructuralSteel: 710, SkilledMason: 44.0 },
    { period: '2025 Q4', PortlandCement: 8.42, StructuralSteel: 715, SkilledMason: 45.0 },
    { period: '2026 Q1', PortlandCement: 8.50, StructuralSteel: 720, SkilledMason: 45.0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* 📊 CORE VISUAL TRENDS CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-[#111e29] text-sm flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-500" />
              Construction Materials Rate Velocity (Year-on-Year Trend)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Indices showing seasonal volatility and supply constraints across Riyadh & NEOM development sectors.</p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">Audit Verified</span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 9.5 }} stroke="#2563eb" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9.5 }} stroke="#7c3aed" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="PortlandCement" stroke="#2563eb" strokeWidth={3} name="Portland Cement Type I ($/Bag)" />
              <Line yAxisId="right" type="monotone" dataKey="StructuralSteel" stroke="#7c3aed" strokeWidth={3} name="Reinforcement Steel ($/Ton)" />
              <Line yAxisId="left" type="monotone" dataKey="SkilledMason" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" name="Skilled Mason ($/Day)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Region filter */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Filter Region</span>
            <select 
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">Global Workspace Prices</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Period Filter */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Filter Period</span>
            <select 
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">All Fiscal Quarters</option>
              {periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          {/* Search bar inside container */}
          <div className="relative flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:border-primary-500 focus-within:bg-white w-full sm:w-56 mt-4 md:mt-0 self-end">
            <Search size={14} className="mr-1.5 opacity-50" />
            <input 
              type="text" 
              placeholder="Filter pricing ledger..."
              className="bg-transparent border-none text-xs w-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white font-bold text-xs py-2 px-4 rounded-lg hover:bg-primary-700 transition flex items-center gap-1.5 self-end cursor-pointer"
        >
          <Plus size={14} /> Add Region/Supplier Price
        </button>
      </div>

      {/* MATRIX PRICING GRID */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10.5px]">
            <tr>
              <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Resource Item</th>
              <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">Region Target</th>
              <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider">SLA Supplier</th>
              <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Effective On</th>
              <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Fiscal Period</th>
              <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Unit Rate</th>
              <th className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filteredPrices.map(price => (
              <tr key={price.id} className="hover:bg-slate-55/40 font-medium">
                <td className="px-5 py-3">
                  <span className={cn(
                    "text-[8.5px] px-2 py-0.5 rounded font-black uppercase tracking-wider leading-none",
                    price.status === 'Active' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}>
                    {price.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-bold text-[#1e293b]">
                  {price.resourceName}
                </td>
                <td className="px-5 py-3 text-slate-500 font-bold">{price.regionName}</td>
                <td className="px-5 py-3 text-slate-550">{price.supplierName}</td>
                <td className="px-4 py-3 font-mono text-slate-400 text-xs">{price.effectiveDate}</td>
                <td className="px-4 py-3 text-slate-600 font-bold">{price.fiscalPeriod}</td>
                <td className="px-4 py-3 font-black text-[#111] font-mono text-right">
                  {formatCurrency(price.unitRate)} <span className="text-[10px] text-slate-450">{price.currency}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  {price.status === 'Active' && (
                    <button 
                      onClick={() => handleDeactivate(price.id)}
                      className="text-[10.5px] text-red-600 hover:underline font-bold"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RAMP DIALOG TO ADD NEW RATE */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[85]" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[95] flex flex-col overflow-hidden animate-fade-in"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800">Add Region / Supplier Rate Matrix</h4>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePrice} className="p-4 space-y-4 text-xs">
                
                {/* Select Resource */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Select Resource Item</label>
                  <select 
                    required
                    value={modalForm.resourceId}
                    onChange={(e) => setModalForm({...modalForm, resourceId: e.target.value})}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-[12.5px]"
                  >
                    <option value="">-- Choose Materials or Equipment --</option>
                    {INITIAL_RESOURCES.map(r => (
                      <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Region and SLA Supplier */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Target Region</label>
                    <select 
                      value={modalForm.regionId}
                      onChange={(e) => setModalForm({...modalForm, regionId: e.target.value})}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded"
                    >
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Supplier Contract</label>
                    <select 
                      value={modalForm.supplierId}
                      onChange={(e) => setModalForm({...modalForm, supplierId: e.target.value})}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded"
                    >
                      {INITIAL_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Fiscal Period and Effective Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Fiscal Period</label>
                    <select 
                      value={modalForm.fiscalPeriod}
                      onChange={(e) => setModalForm({...modalForm, fiscalPeriod: e.target.value})}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded"
                    >
                      {periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase">Effective Date</label>
                    <input 
                      type="date"
                      value={modalForm.effectiveDate}
                      onChange={(e) => setModalForm({...modalForm, effectiveDate: e.target.value})}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded"
                    />
                  </div>
                </div>

                {/* Rate Index */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Negotiated Unit Rate (USD)</label>
                  <input 
                    type="number" step="0.01" required
                    value={modalForm.unitRate || ''}
                    onChange={(e) => setModalForm({...modalForm, unitRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button type="submit" className="flex-1 bg-primary-600 text-white font-bold py-2 rounded-lg">
                    Publish Rate Matrix
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
