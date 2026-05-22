import React from 'react';
import { Search, Filter, Save, FileSpreadsheet, MapPin, Calendar, ArrowRight, History } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils.ts';
import { MOCK_RESOURCES } from '../mockData.ts';
import { ResourceType } from '../types.ts';

export const PriceMatrix = ({ embedded = false }: { embedded?: boolean }) => {
  const [selectedRegion, setSelectedRegion] = React.useState('1');
  const [selectedPeriod, setSelectedPeriod] = React.useState('5'); // 2026 Q1
  const [searchQuery, setSearchQuery] = React.useState('');

  const regions = [
    { id: '1', name: 'Riyadh Central' },
    { id: '2', name: 'Jeddah Coastal' },
    { id: '3', name: 'Dammam Eastern' },
    { id: '4', name: 'NEOM District' },
  ];

  const periods = [
    { id: '1', name: '2024 Q1' },
    { id: '2', name: '2024 Q2' },
    { id: '3', name: '2024 Q3' },
    { id: '4', name: '2024 Q4' },
    { id: '5', name: '2026 Q1' },
  ];

  // Filtering resources for display
  const filteredResources = MOCK_RESOURCES.filter(res => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    res.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("h-full flex flex-col gap-5", embedded ? "p-0" : "p-0")}>
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[12px] text-zentrix-muted font-medium mb-1">Pricing / Market Data / Multi-Dimensional</div>
            <h2 className="text-xl font-semibold text-zentrix-blue leading-tight">Price Matrix Analysis</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-white border border-zentrix-border px-4 py-2 rounded-md text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <FileSpreadsheet size={16} /> Export CSV
            </button>
            <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-primary-700 transition-all shadow-sm">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zentrix-border p-4 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <MapPin size={14} className="text-primary-500" /> Target Region
          </div>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-primary-500 font-medium text-zentrix-blue"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        
        <div className="bg-white border border-zentrix-border p-4 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={14} className="text-primary-500" /> Pricing Period
          </div>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-primary-500 font-medium text-zentrix-blue"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="bg-white border border-zentrix-border p-4 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Filter size={14} className="text-primary-500" /> Quick Search
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Code or name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zentrix-border rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-zentrix-gray border-b border-zentrix-border z-10">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Resource Code</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Unit</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right">Standard Rate</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right bg-primary-50/50">Market Rate (Combined)</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResources.map((res) => {
                const standardRate = res.baseRate;
                const marketRate = res.baseRate * 1.05; // Simulation: slightly higher for 2026 Q1
                const variance = ((marketRate - standardRate) / standardRate) * 100;
                
                return (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3 text-[12px] font-mono text-slate-500">{res.code}</td>
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-medium text-zentrix-blue">{res.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{res.type}</div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{res.unit}</td>
                    <td className="px-5 py-3 text-[13px] font-mono text-right text-slate-400 line-through">{formatCurrency(standardRate)}</td>
                    <td className="px-5 py-3 text-right bg-primary-50/20">
                      <div className="flex items-center justify-end gap-2">
                        <input 
                          type="number" 
                          defaultValue={marketRate.toFixed(2)}
                          className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-[13px] font-bold font-mono text-right text-primary-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                        />
                        <button className="p-1 hover:bg-primary-50 rounded text-primary-600">
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn(
                        "text-[11px] font-bold",
                        variance > 0 ? "text-red-500" : "text-green-500"
                      )}>
                        {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zentrix-blue p-4 rounded-lg flex items-center justify-between text-white">
        <div className="flex items-center gap-10">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-primary-300 uppercase tracking-widest">Selected Region</span>
            <p className="text-[13px] font-medium">{regions.find(r => r.id === selectedRegion)?.name}</p>
          </div>
          <div className="flex items-center text-primary-400">
            <ArrowRight size={16} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-primary-300 uppercase tracking-widest">Selected Period</span>
            <p className="text-[13px] font-medium">{periods.find(p => p.id === selectedPeriod)?.name}</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic">Values automatically indexed based on regional inflation modifiers.</p>
      </div>
    </div>
  );
};
