import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Building, Users, Truck, Wrench, RefreshCw, AlertTriangle, ShieldCheck, 
  TrendingUp, ArrowUpRight, ArrowDownRight, FileText, Settings
} from 'lucide-react';
import { INITIAL_RESOURCES, INITIAL_SUPPLIERS, INITIAL_PRICES, INITIAL_RESOURCE_USAGES } from './resourceMockData.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { ResourceType } from '../../types.ts';

export const ResourceDashboard = () => {
  // 1. Calculations from Mock Data
  const totalResources = INITIAL_RESOURCES.length;
  const materialCount = INITIAL_RESOURCES.filter(r => r.type === ResourceType.MATERIAL).length;
  const laborCount = INITIAL_RESOURCES.filter(r => r.type === ResourceType.LABOR).length;
  const equipmentCount = INITIAL_RESOURCES.filter(r => r.type === ResourceType.EQUIPMENT).length;
  const activeSuppliers = INITIAL_SUPPLIERS.filter(s => s.status === 'Active').length;
  const recentlyUpdated = INITIAL_RESOURCES.filter(r => {
    const updatedDate = new Date(r.lastUpdated);
    const threshold = new Date('2026-05-01');
    return updatedDate >= threshold;
  }).length;

  // 2. Chart Data Transformations
  const typeData = [
    { name: 'Materials', value: materialCount, color: '#2563eb' },
    { name: 'Labor', value: laborCount, color: '#f97316' },
    { name: 'Equipment', value: equipmentCount, color: '#a855f7' },
  ];

  const topCostData = INITIAL_RESOURCES
    .filter(r => r.type === ResourceType.MATERIAL || r.type === ResourceType.EQUIPMENT)
    .sort((a, b) => b.baseRate - a.baseRate)
    .slice(0, 5)
    .map(r => ({
      name: r.name.length > 20 ? `${r.name.slice(0, 18)}...` : r.name,
      rate: r.baseRate,
      unit: r.unit
    }));

  const supplierDistrib = INITIAL_SUPPLIERS.map(s => {
    const count = INITIAL_RESOURCES.filter(r => r.supplier === s.name).length;
    return { name: s.name, count };
  }).filter(d => d.count > 0);

  const usageTrendData = [
    { month: 'Jan', cement: 120, steel: 45, equipment: 80 },
    { month: 'Feb', cement: 154, steel: 56, equipment: 95 },
    { month: 'Mar', cement: 180, steel: 62, equipment: 110 },
    { month: 'Apr', cement: 165, steel: 70, equipment: 105 },
    { month: 'May', cement: 210, steel: 88, equipment: 130 },
  ];

  const COLORS = ['#2563eb', '#f97316', '#a855f7', '#10b981', '#f1c40f'];

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* 1️⃣ KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI: Total Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-600" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Resources</span>
            <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Building size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{totalResources}</h3>
          <p className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp size={11} /> +3.4% vs last Q
          </p>
        </div>

        {/* KPI: Materials */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Materials</span>
            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <Truck size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{materialCount}</h3>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-1">Active ledger items</p>
        </div>

        {/* KPI: Labor */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-orange-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Labor Trades</span>
            <div className="w-7 h-7 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
              <Users size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{laborCount}</h3>
          <p className="text-[10.5px] text-orange-600 font-bold flex items-center gap-1 mt-1">
             Indexed manpower
          </p>
        </div>

        {/* KPI: Equipment */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-purple-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Equipment</span>
            <div className="w-7 h-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <Wrench size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{equipmentCount}</h3>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-1">Machines & Yellow plants</p>
        </div>

        {/* KPI: Suppliers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-cyan-300 transition-all">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-cyan-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suppliers</span>
            <div className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center shrink-0">
               <ShieldCheck size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{activeSuppliers}</h3>
          <p className="text-[10.5px] text-cyan-600 font-bold mt-1">100% Verified status</p>
        </div>

        {/* KPI: Recently Updated */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-pink-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modified (30d)</span>
            <div className="w-7 h-7 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center shrink-0">
              <RefreshCw size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{recentlyUpdated}</h3>
          <p className="text-[10.5px] text-pink-600 font-bold mt-1">Requires audit tracking</p>
        </div>
      </div>

      {/* 2️⃣ CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Type Distribution (PieChart) & Supplier Count (BarChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" />
              Resource Classification & Supplier Distribution
            </h4>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Real-Time</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[240px]">
            {/* Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Type Breakdown</span>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center items-center mt-2 text-[11px] font-semibold">
                {typeData.map(t => (
                  <span key={t.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name} ({t.value})
                  </span>
                ))}
              </div>
            </div>

            {/* Supplier Bar Chart */}
            <div className="flex flex-col justify-between">
              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Suppliers Coverage</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={supplierDistrib} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip formatter={(value) => [`${value} resources`, 'Supplied']} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Cost Resources & Usage Trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-orange-600" />
              Top Cost Items & Usage Trend Forecast
            </h4>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Financials</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[240px]">
            {/* Top Cost Bar Chart */}
            <div className="flex flex-col justify-between">
              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Top 5 Expensive Items</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topCostData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={60} stroke="#94a3b8" />
                  <Tooltip formatter={(value) => [`$${value}`, 'Base Rate']} />
                  <Bar dataKey="rate" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Usage Trend Line Chart */}
            <div className="flex flex-col justify-between">
              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Consumption Curve</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={usageTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="cement" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Cement (Bags)" />
                  <Line type="monotone" dataKey="steel" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} name="Steel (Tons)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ RECENT ACTIVITY + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latest Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h4 className="font-extrabold text-[#1e293b] text-xs uppercase tracking-wide">Recently Added</h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded leading-none font-bold">Newest</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
            {INITIAL_RESOURCES.slice(0, 4).map(res => (
              <div key={res.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded px-1 transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-slate-700 truncate">{res.name}</p>
                  <p className="text-[10px] text-primary-600 font-mono mt-0.5">{res.code} • {res.unit}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 font-mono">${res.baseRate.toFixed(2)}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{res.lastUpdated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Price Updates */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h4 className="font-extrabold text-[#1e293b] text-xs uppercase tracking-wide">Regional Rate Changes</h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded leading-none">Price Feed</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
            {INITIAL_PRICES.slice(0, 4).map(price => (
              <div key={price.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded px-1 transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-slate-700 truncate">{price.resourceName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{price.regionName} • {price.fiscalPeriod}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-emerald-600 font-mono">${price.unitRate.toFixed(2)}</p>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded uppercase font-bold tracking-wide">
                    {price.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Critical Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h4 className="font-extrabold text-[#1e293b] text-xs uppercase tracking-wide">Manpower & Material Alerts</h4>
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5">
              <AlertTriangle size={10} /> Priority
            </span>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            <div className="p-3 bg-red-50/75 border border-red-100 rounded-lg text-slate-700 leading-normal flex gap-2">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={14} />
              <div>
                <p className="font-bold text-red-900 text-xs">Steel Price Deviation Detected</p>
                <p className="text-[10.5px] text-red-700 mt-0.5">Steel rebar rate in Riyadh exceeds baseline cost indexes by +4.2%. Awaiting submittals review.</p>
              </div>
            </div>

            <div className="p-3 bg-orange-50/75 border border-orange-100 rounded-lg text-slate-700 leading-normal flex gap-2">
              <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={14} />
              <div>
                <p className="font-bold text-orange-900 text-xs">Unregistered Supplier Quote</p>
                <p className="text-[10.5px] text-orange-700 mt-0.5">CEMEX Saudi submitted rates for Fine Sand under unregistered tax bracket. Action required.</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/75 border border-blue-100 rounded-lg text-slate-700 leading-normal flex gap-2">
              <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={14} />
              <div>
                <p className="font-bold text-blue-900 text-xs">Labor Wage Standard Audit</p>
                <p className="text-[10.5px] text-blue-700 mt-0.5">Standard daily wages for Skilled Mason verified and locked for the next fiscal quarter (2026 Q2).</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
