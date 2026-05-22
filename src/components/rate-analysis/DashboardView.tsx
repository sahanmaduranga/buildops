import React from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingDown, 
  ArrowUpRight,
  RefreshCw,
  Archive,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { type RateAnalysis, type Resource, ResourceType } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface DashboardViewProps {
  analyses: RateAnalysis[];
  resources: Resource[];
  onNavigateToTab: (tabId: string) => void;
  onSelectAnalysis: (analysisId: string) => void;
}

export const DashboardView = ({ 
  analyses, 
  resources, 
  onNavigateToTab, 
  onSelectAnalysis 
}: DashboardViewProps) => {
  // Compute KPI analysis metrics
  const totalCount = analyses.length;
  // Simulating active status on our mocks (approved vs draft vs revised)
  // Let's add status simulation as mock data since the existing MOCK_RATE_ANALYSES does not have explicit status.
  // We'll calculate it or fallback neatly.
  const approvedCount = analyses.filter(a => a.id === 'ra-1' || a.finalRate > 150).length;
  const draftCount = totalCount - approvedCount;
  
  // Total Estimated Value (or sum of rates multiplied by standard bulk quantities)
  const totalCostVal = analyses.reduce((acc, a) => acc + (a.finalRate * 1250), 0); // Simulated quantity multiplier 1250

  const mostUsedResources = [
    { name: 'Portland Cement Type I', type: 'Material', count: 5, rate: '$8.50' },
    { name: 'Skilled Mason', type: 'Labor', count: 4, rate: '$45.00/day' },
    { name: 'Helper', type: 'Labor', count: 3, rate: '$25.00/day' },
  ];

  // Resource cost breakdown across materials, labor, equipment, overheads
  const totalMaterials = analyses.reduce((sum, a) => sum + (a.totalMaterialCost || 0), 0);
  const totalLabor = analyses.reduce((sum, a) => sum + (a.totalLaborCost || 0), 0);
  const totalEquipment = analyses.reduce((sum, a) => sum + (a.totalEquipmentCost || 0), 0);
  const totalOverhead = analyses.reduce((sum, a) => sum + ((a.subtotal * a.overheadPercentage) / 100 || 0), 0);
  
  const compositionData = [
    { name: 'Materials', value: totalMaterials, color: '#3B82F6' },
    { name: 'Labor', value: totalLabor, color: '#F97316' },
    { name: 'Equipment', value: totalEquipment, color: '#8B5CF6' },
    { name: 'Overhead & Markup', value: totalOverhead, color: '#10B981' },
  ];

  const barData = analyses.map(a => ({
    name: a.code,
    'Material Cost': a.totalMaterialCost || 0,
    'Labor Cost': a.totalLaborCost || 0,
    'Equipment Cost': a.totalEquipmentCost || 0,
    'Total Rate': a.finalRate
  }));

  // Trend data points over previous months
  const trendData = [
    { month: 'Jan', Civil: 155, Concrete: 165, Finishing: 34 },
    { month: 'Feb', Civil: 158, Concrete: 167, Finishing: 35 },
    { month: 'Mar', Civil: 162, Concrete: 169, Finishing: 36 },
    { month: 'Apr', Civil: 164, Concrete: 170, Finishing: 37 },
    { month: 'May (Current)', Civil: 166, Concrete: 171, Finishing: 37 },
  ];

  const recentRevisions = [
    { id: 'rev-1', code: 'RA-CONC-25', user: 'Robert Chen', type: 'Revision B Created', time: '2 mins ago', detail: 'Increased Portland Cement waste threshold to 5%' },
    { id: 'rev-2', code: 'RA-MAS-01', user: 'Robert Chen', type: 'Approved', time: '1 hr ago', detail: 'Commercial Manager final rate audit completed' },
    { id: 'rev-3', code: 'RA-EARTH-02', user: 'QS Engineer', type: 'Created Draft', time: '4 hrs ago', detail: 'Excavation 20T fuel adjustment markup applied' },
    { id: 'rev-4', code: 'RA-CONC-25', user: 'System', type: 'Resource Cost Synced', time: 'Yesterday', detail: 'Synced with Riyadh Central Q2 price index matrix' },
  ];

  const alerts = [
    { text: 'Steel Price Adjustment: Reinforcement Steel base rate increased by +3.5% in NEOM District.', type: 'warning' },
    { text: 'Unapproved Rate Item: Brick Masonry contains pending supplier quotes for Riyadh Central.', type: 'info' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zentrix-blue tracking-tight leading-none">Rate Analysis Analytics Dashboard</h3>
          <p className="text-[11px] text-slate-400 mt-1">Lightweight cost estimation cockpit. Monitor unit rate fluctuations with pricing tables matrix.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigateToTab('rate-analysis-list')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs leading-none transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Layers size={14} /> Open Analyses List
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Analyses</span>
            <div className="bg-slate-100 p-1.5 rounded text-zentrix-blue">
              <Layers size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-zentrix-blue mt-2">{totalCount}</h3>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-bold">
            <span className="text-emerald-500 flex items-center"><TrendingUp size={10} /> +1 New</span> this month
          </p>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Approved Rates</span>
            <div className="bg-emerald-50 p-1.5 rounded text-emerald-600">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">{approvedCount}</h3>
          <p className="text-[10px] text-emerald-600/90 mt-1 flex items-center gap-1.2 font-bold">
            {((approvedCount / totalCount) * 100).toFixed(0)}% Certified baselines
          </p>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Draft Analyses</span>
            <div className="bg-orange-50 p-1.5 rounded text-orange-600">
              <Clock size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-orange-600 mt-2">{draftCount}</h3>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.2 font-bold">
            Requires engineering approval
          </p>
        </div>

        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Est. Allocation Value</span>
            <div className="bg-sky-50 p-1.5 rounded text-sky-600">
              <DollarSign size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-zentrix-blue mt-2">${(totalCostVal / 1000).toFixed(1)}k</h3>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.2 font-bold">
            Simulated 1,250 Unit Volume
          </p>
        </div>

        {/* Recently Updated Analyses Code */}
        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Recently Updated</span>
          <h4 className="text-[14px] font-black text-zentrix-blue mt-2.5 truncate">{analyses[0]?.code || 'N/A'}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 max-w-full truncate">{analyses[0]?.description || 'No recent updates'}</p>
          <span className="text-[9px] text-primary-600 font-bold hover:underline block mt-1 cursor-pointer" onClick={() => onSelectAnalysis(analyses[0]?.id)}>Edit Detail →</span>
        </div>

        {/* Most Used Resources list */}
        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm col-span-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Top Resource</span>
          <h4 className="text-[13px] font-black text-slate-800 mt-2.5 truncate">Portland Cement</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Used in 5 core analyses</p>
          <span className="text-[9px] text-emerald-600 font-black flex items-center gap-1 mt-1"><Star size={10} /> High Demand</span>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cost Trend & Price Indices */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-100 mb-4">
            <div>
              <h4 className="font-bold text-zentrix-blue">Historical Cost fluctuation trends</h4>
              <p className="text-[10.5px] text-slate-400">Monthly breakdown of master category unit rates.</p>
            </div>
            <div className="flex gap-2 text-[10px] bg-slate-50 border border-slate-100 p-1.5 rounded-lg font-bold">
              <span className="text-primary-600">● Civil</span>
              <span className="text-amber-500">● Concrete</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis style={{ fontSize: '10px' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="Civil" name="Civil Works" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Concrete" name="Concrete Works" stroke="#F59E0B" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Finishing" name="Finishing Works" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Cost Distribution (Pie Chart) */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-zentrix-blue pb-3 border-b border-dashed border-slate-100 mb-4">Resource Type Cost Distribution</h4>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 bottom-1 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Aggregate</span>
                <span className="text-[13px] font-black text-slate-700">${(totalMaterials + totalLabor + totalEquipment).toFixed(0)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            {compositionData.map((c) => {
              const totalVal = totalMaterials + totalLabor + totalEquipment + totalOverhead;
              const pct = totalVal > 0 ? ((c.value / totalVal) * 100).toFixed(0) : '0';
              return (
                <div key={c.name} className="flex justify-between items-center text-[11px] leading-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                    <span className="font-medium text-slate-600">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{pct}% ({formatCurrency(c.value)})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Alerts & Critical Parameters Block */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4 col-span-1">
          <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-3">QS Market Intelligence Warnings</h4>
          <div className="space-y-3">
            {alerts.map((alt, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-3.5 rounded-lg flex items-start gap-3 border shadow-inner",
                  alt.type === 'warning' ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-sky-50 border-sky-200 text-sky-800"
                )}
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11.5px] font-semibold leading-relaxed">{alt.text}</p>
                </div>
              </div>
            ))}
            <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl text-center space-y-3">
              <p className="text-[11px] text-slate-400 font-bold">Need a live price indices update?</p>
              <button 
                onClick={() => onNavigateToTab('rate-analysis-import-export')}
                className="w-full py-2 border border-slate-200 hover:border-slate-300 rounded font-semibold text-xs bg-white text-slate-655 flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50"
              >
                <RefreshCw size={11} /> Recalculate price indices
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities Registry */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
            <h4 className="font-bold text-zentrix-blue">Recent Rate Revisions & Approvals Activity</h4>
            <span className="text-[10px] text-slate-400 font-bold">Latest 4 operations logged</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentRevisions.map((rev) => (
              <div key={rev.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between gap-4 items-center group">
                <div className="flex gap-3">
                  <div className="w-8.5 h-8.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-zentrix-blue font-bold shrink-0 text-xs">
                    {rev.code.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1 py-0.2 rounded leading-none">{rev.code}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase leading-none tracking-wider px-1.5 py-0.5 rounded-sm",
                        rev.type.includes('Approved') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        rev.type.includes('Created') ? "bg-primary-50 text-primary-600 border border-primary-100" :
                        "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {rev.type}
                      </span>
                      <span className="text-[10px] text-slate-400">• {rev.user}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 font-medium mt-1 leading-normal">{rev.detail}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-semibold">{rev.time}</p>
                  <span className="text-[10.5px] text-primary-400 group-hover:text-primary-600 transition-colors hover:underline cursor-pointer font-bold inline-block mt-0.5" onClick={() => onSelectAnalysis(rev.code === 'RA-CONC-25' ? 'ra-1' : 'ra-2')}>Inspect →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
