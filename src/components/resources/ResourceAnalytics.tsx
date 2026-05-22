import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Ship, ShoppingBag, ShieldCheck, AlertCircle, Sparkles
} from 'lucide-react';
import { INITIAL_RESOURCES, INITIAL_SUPPLIERS, INITIAL_PRICES } from './resourceMockData.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { ResourceType } from '../../types.ts';

export const ResourceAnalytics = () => {
  // Calculations
  const steelItems = INITIAL_RESOURCES.filter(r => r.category === 'Steel');
  const cementItems = INITIAL_RESOURCES.filter(r => r.category === 'Cement' || r.name.toLowerCase().includes('cement'));
  
  // Charts transformations
  const costLeaderboard = INITIAL_RESOURCES
    .sort((a,b) => b.baseRate - a.baseRate)
    .slice(0, 5)
    .map(r => ({
      name: r.code,
      fullName: r.name,
      cost: r.baseRate,
      unit: r.unit
    }));

  const usageLeaderboard = INITIAL_RESOURCES
    .sort((a,b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map(r => ({
      name: r.code,
      fullName: r.name,
      usage: r.usageCount,
      unit: r.unit
    }));

  const supplierDependency = INITIAL_SUPPLIERS.map((s, idx) => {
    const list = INITIAL_RESOURCES.filter(r => r.supplier === s.name);
    const avgRate = list.length > 0 ? list.reduce((acc, r) => acc + r.baseRate, 0) / list.length : 0;
    return {
      name: s.name,
      itemCount: list.length,
      avgRate: parseFloat(avgRate.toFixed(1))
    };
  }).filter(d => d.itemCount > 0);

  const priceTrendInflation = [
    { period: 'Q1-25', IndexRate: 100.0, CostBaseline: 98.4 },
    { period: 'Q2-25', IndexRate: 102.5, CostBaseline: 100.2 },
    { period: 'Q3-25', IndexRate: 104.1, CostBaseline: 101.5 },
    { period: 'Q4-25', IndexRate: 105.8, CostBaseline: 102.8 },
    { period: 'Q1-26', IndexRate: 108.4, CostBaseline: 104.0 },
  ];

  const TYPE_COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981'];

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* 🚀 AI Insight Panel */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl flex items-start gap-3 shadow-inner">
        <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
          <Sparkles size={14} className="animate-pulse" />
        </div>
        <div>
          <h4 className="font-extrabold text-[#1a2b3d] text-sm">Lightweight Material Risk & Supply Intelligence</h4>
          <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
            Concentration risk is identified with <strong className="text-indigo-600">ArcelorMittal Steel</strong> supplying 100% of Reinforcement Steel products. High market volatility trend (+4.2%) predicted for structural aggregate divisions. Recommending backup supplier contracts for Dammam Coastal zone.
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CHART: Top Cost Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h5 className="font-extrabold text-[#111] text-xs uppercase tracking-wide">Top Master Rate Resources (Cost Leaderboard)</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Items with the highest standard base rate per unit.</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costLeaderboard} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
                <Tooltip formatter={(value) => [`$${value}`, 'Base rate']} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28}>
                  {costLeaderboard.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: Highest Used Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h5 className="font-extrabold text-[#111] text-xs uppercase tracking-wide">Usage Frequency List (Total Links)</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Quantity of rate analyses and planning tasks linking each item.</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageLeaderboard} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
                <Tooltip formatter={(value) => [`${value} active links`, 'Usage']} />
                <Bar dataKey="usage" fill="#f97316" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: Supplier Dependency mapping */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h5 className="font-extrabold text-[#111] text-xs uppercase tracking-wide">Supplier Portfolio Concentration Rate</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Aggregate number of material items mapped to procurement partners.</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={supplierDependency} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="itemCount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} name="Materials Count" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: Price increase trends with index */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h5 className="font-extrabold text-[#111] text-xs uppercase tracking-wide">Inflation & Price Velocity Forecast</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Compares volatile market index against budgeted cost baselines.</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceTrendInflation} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9.5 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="IndexRate" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIndex)" name="Volatile Market Index" />
                <Line type="monotone" dataKey="CostBaseline" stroke="#ef4444" strokeWidth={2} name="Budgeted Baseline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
