import React, { useState } from 'react';
import { 
  Calculator, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  Cpu, 
  Hammer, 
  Briefcase, 
  Percent, 
  Info,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { type RateAnalysis, type Resource, ResourceType } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface ResourceCostingViewProps {
  analyses: RateAnalysis[];
  resources: Resource[];
}

export const ResourceCostingView = ({ analyses, resources }: ResourceCostingViewProps) => {
  const [selectedId, setSelectedId] = useState<string>(analyses[0]?.id || 'ra-1');

  const selectedAnalysis = analyses.find(a => a.id === selectedId) || analyses[0];

  if (!selectedAnalysis) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold italic">
        Please load and define at least one rate analysis to perform breakdown audits.
      </div>
    );
  }

  // Calculate Breakdown Items
  const matCost = selectedAnalysis.totalMaterialCost || 0;
  const labCost = selectedAnalysis.totalLaborCost || 0;
  const eqCost = selectedAnalysis.totalEquipmentCost || 0;
  const overheadCost = (selectedAnalysis.subtotal * selectedAnalysis.overheadPercentage) / 100;
  const profitCost = (selectedAnalysis.subtotal * selectedAnalysis.profitPercentage) / 100;
  const taxCost = (selectedAnalysis.subtotal * selectedAnalysis.taxPercentage) / 100;
  
  const subtotal = selectedAnalysis.subtotal;
  const netRate = selectedAnalysis.finalRate;

  // Pie chart breakdown
  const pieData = [
    { name: 'Materials', value: matCost, color: '#3B82F6', icon: Cpu },
    { name: 'Labor', value: labCost, color: '#F97316', icon: Hammer },
    { name: 'Equipment', value: eqCost, color: '#8B5CF6', icon: Briefcase },
    { name: 'Overhead & Profits', value: overheadCost + profitCost, color: '#10B981', icon: Percent },
  ].filter(p => p.value > 0);

  const totalValue = pieData.reduce((sum, p) => sum + p.value, 0);

  // Concrete view example requested:
  // Show standard human friendly calculation logic:
  // Cost matrix or manual equations
  
  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Upper header selection bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zentrix-blue tracking-tight leading-none">Resource Costing & Breakdown</h3>
          <p className="text-[11px] text-slate-400 mt-1">Audit granular contribution ratios of material inputs, workforce productivity, and logistic markups.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-zentrix-border p-1.5 rounded-lg shadow-sm">
          <span className="text-[10px] text-zinc-400 font-black uppercase px-2">Analysis Scope:</span>
          <select 
            value={selectedId} 
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-[11.5px] font-bold text-zentrix-blue outline-none cursor-pointer bg-transparent py-0.5 pr-2"
          >
            {analyses.map(a => (
              <option key={a.id} value={a.id}>{a.code} - {a.description}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Material Card */}
        <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6] block mb-0.5">Material Factor</span>
            <h3 className="text-xl font-black text-zentrix-blue">{formatCurrency(matCost)}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Contributes {totalValue > 0 ? ((matCost / totalValue) * 100).toFixed(0) : 0}% of net subtotal</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            M
          </div>
        </div>

        {/* Labor Card */}
        <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F97316] block mb-0.5">Labor Productivity</span>
            <h3 className="text-xl font-black text-zentrix-blue">{formatCurrency(labCost)}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Contributes {totalValue > 0 ? ((labCost / totalValue) * 100).toFixed(0) : 0}% of net subtotal</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            L
          </div>
        </div>

        {/* Equipment Card */}
        <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8B5CF6] block mb-0.5">Equipment Utilization</span>
            <h3 className="text-xl font-black text-zentrix-blue">{formatCurrency(eqCost)}</h3>
            <p className="text-[10px] text-slate-400 font-medium font-mono">Contributes {totalValue > 0 ? ((eqCost / totalValue) * 100).toFixed(0) : 0}% of net subtotal</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            E
          </div>
        </div>

        {/* Overheads Card */}
        <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#10B981] block mb-0.5">Overland & Markups</span>
            <h3 className="text-xl font-black text-zentrix-blue">{formatCurrency(overheadCost + profitCost)}</h3>
            <p className="text-[10px] text-slate-400 font-medium font-mono">Combined markup ratios</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            O
          </div>
        </div>

      </div>

      {/* DETAILED BREAKDOWN BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Core Calculation Logic & Linear Formula audit */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-100">
            <div>
              <h4 className="font-extrabold text-zentrix-blue text-[14px]">Sub-calculation Formula Matrix</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Quantified calculation statement for {selectedAnalysis.code}: {selectedAnalysis.description}</p>
            </div>
            <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded font-bold uppercase text-slate-600">Unit: 1 {selectedAnalysis.unit}</span>
          </div>

          <div className="space-y-3.5">
            {/* Resources list with calculated equations */}
            <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/20 shadow-inner">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="p-3">Resource Line</th>
                    <th className="p-3 text-right">Coefficient (Qty)</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-center">Friction Markup</th>
                    <th className="p-3 text-right">Subtotal Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAnalysis.resources.map((res) => {
                    const prodFactor = res.productivityFactor ?? 1;
                    const wasteFactor = res.wasteFactor ?? 0;
                    const computedValue = res.quantity * res.rate * prodFactor * (1 + wasteFactor);
                    
                    return (
                      <tr key={res.id} className="text-[12.5px] hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-zentrix-blue">{res.resourceName}</div>
                          <span className="text-[9.5px] text-slate-400 font-mono uppercase">{res.resourceType}</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-600 tabular-nums">
                          {res.quantity} {res.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500 tabular-nums">
                          {formatCurrency(res.rate)}
                        </td>
                        <td className="p-3 text-center text-[11px]">
                          {res.resourceType === ResourceType.MATERIAL ? (
                            <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Waste +{(wasteFactor*100).toFixed(0)}%</span>
                          ) : (
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Prod x{prodFactor}</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-zentrix-blue tabular-nums">
                          {formatCurrency(computedValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Combined rate audit formulas */}
            <div className="bg-slate-900 border border-slate-950 text-white p-5 rounded-xl space-y-4 shadow-lg font-sans">
              <h5 className="text-xs font-black uppercase tracking-widest text-[#F97316]">Consolidated Enterprise Formula View</h5>
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/10 text-xs text-slate-400">
                <div className="space-y-1">
                  <span>Gross Direct Costs Subtotal:</span>
                  <p className="text-sm font-bold text-white font-mono">${subtotal.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span>Overhead Markup Allowance ({selectedAnalysis.overheadPercentage}%):</span>
                  <p className="text-sm font-bold text-white font-mono">${overheadCost.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span>Profit Threshold ({selectedAnalysis.profitPercentage}%):</span>
                  <p className="text-sm font-bold text-white font-mono">${profitCost.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span>Tax & Compliance Value ({selectedAnalysis.taxPercentage}%):</span>
                  <p className="text-sm font-bold text-white font-mono">${taxCost.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="font-bold flex items-center gap-1"><Sparkles size={16} className="text-yellow-400 animate-pulse" /> Certified Baseline Unit Rate:</span>
                <span className="text-xl md:text-2xl font-black text-[#10B981] font-mono tracking-tight">${netRate.toLocaleString()} / {selectedAnalysis.unit}</span>
              </div>
            </div>

          </div>
        </div>

        {/* PIE CHART CONTROLLER SIDEBAR */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="font-extrabold text-zentrix-blue text-[14px]">Percentage Contributions</h4>
          
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 top-14 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Net Rate</span>
                <p className="text-lg font-black text-zentrix-blue">${netRate.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {pieData.map((item, idx) => {
              const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(0) : '0';
              const IconComp = item.icon;
              return (
                <div key={item.name} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-lg p-3 group hover:border-slate-355 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded" style={{ backgroundColor: item.color + '15', color: item.color }}>
                      <IconComp size={14} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">{item.name}</span>
                      <span className="inline-block text-[10px] text-zinc-400 font-semibold mt-0.5">{pct}% Share ratio</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-[13px] font-mono">{formatCurrency(item.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
