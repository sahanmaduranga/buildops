import React from 'react';
import { 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  Activity, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useBOQ } from '../../context/BOQContext.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { useProject } from '../../context/ProjectContext.tsx';

// Recharts colors
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export const BOQDashboard = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { boqs } = useBOQ();
  const { currentProject } = useProject();

  // Filter BOQs belonging to current project
  const projectBoqs = React.useMemo(() => {
    if (!currentProject) return boqs;
    return boqs.filter(b => b.projectId === currentProject.id);
  }, [boqs, currentProject]);

  // KPI Calculations
  const stats = React.useMemo(() => {
    const totalCount = projectBoqs.length;
    const totalValue = projectBoqs
      .filter(b => b.status !== 'Archived')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const activeCount = projectBoqs.filter(b => b.status === 'Approved' || b.status === 'Review' || b.status === 'Draft').length;
    const revisedCount = projectBoqs.filter(b => b.status === 'Revised').length;
    const draftCount = projectBoqs.filter(b => b.status === 'Draft').length;
    const approvedCount = projectBoqs.filter(b => b.status === 'Approved').length;

    return { totalCount, totalValue, activeCount, revisedCount, draftCount, approvedCount };
  }, [projectBoqs]);

  // Chart 1: Cost Distribution by Discipline (Civil, Structure, Architectural, MEP, Prelims)
  const disciplineCostData = React.useMemo(() => {
    const group: Record<string, number> = {
      'Preliminaries': 75000,
      'Earthworks': 23750,
      'Structural Works': 27615,
    };
    
    projectBoqs.forEach(b => {
      const disc = b.discipline || 'General';
      group[disc] = (group[disc] || 0) + b.totalAmount;
    });

    return Object.entries(group).map(([name, value]) => ({ name, value }));
  }, [projectBoqs]);

  // Chart 2: Monthly BOQ Changes (Trend of cumulative edits/approvals for mock timeline)
  const monthlyChangesData = [
    { month: 'Jan', value: 850000, revisions: 1 },
    { month: 'Feb', value: 1250000, revisions: 2 },
    { month: 'Mar', value: 1450250, revisions: 3 },
    { month: 'Apr', value: 1450250, revisions: 3 },
    { month: 'May', value: 1465500, revisions: 5 },
  ];

  // Chart 3: Top Cost Categories in actively selected BOQs
  const categoryCostData = [
    { name: 'Structural Concrete', amount: 485000 },
    { name: 'Cabling & Plumbing', amount: 320000 },
    { name: 'Excavation & Shoring', amount: 250000 },
    { name: 'Masonry & Wet Finishes', amount: 180000 },
    { name: 'Site Mobilization', amount: 125250 },
  ];

  // Recent Activities list
  const recentActivities = [
    {
      id: 'act-1',
      type: 'REVISION',
      title: 'Structural Works Revision R2 Created',
      desc: 'Added Block B footing additions.',
      user: 'Robert Chen (QS Engineer)',
      time: '3 hours ago',
    },
    {
      id: 'act-2',
      type: 'APPROVAL',
      title: 'Architectural Finishing Submitted for Review',
      desc: 'Status updated to Joint Review.',
      user: 'Sarah Johnson (Project Director)',
      time: 'Yesterday',
    },
    {
      id: 'act-3',
      type: 'IMPORT',
      title: 'MEP Items Imported (120 lines)',
      desc: 'Validated successfully with no schema errors.',
      user: 'Robert Chen (QS Engineer)',
      time: '3 days ago',
    },
    {
      id: 'act-4',
      type: 'STATUS',
      title: 'BOQ Main Structural Baseline Approved',
      desc: 'Contract commitment finalized.',
      user: 'Fahad Al-Saud (Client Director)',
      time: 'May 15, 2026',
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zentrix-blue tracking-tight">BOQ Workspace Dashboard</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Quantity surveying dashboard for financial baselines, disciplines, and cost controls.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-500 font-medium">Last Sync:</span>
          <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded text-slate-600 shadow-sm flex items-center gap-1">
             <Clock size={12} className="text-primary-500" /> Live
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div id="kpi-total-boqs" className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start text-blue-500">
            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><FileText size={16} /></span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 leading-none">Total BOQs</p>
          <h3 className="text-xl font-black text-zentrix-blue mt-2 font-mono">{stats.totalCount}</h3>
        </div>

        <div id="kpi-total-value" className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm col-span-2">
          <div className="flex justify-between items-start text-emerald-500 font-mono">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><DollarSign size={16} /></span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 font-bold rounded">+1.2% dev</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 leading-none">Total Committed Value</p>
          <h3 className="text-xl font-black text-emerald-600 mt-2 font-mono">{formatCurrency(stats.totalValue)}</h3>
        </div>

        <div id="kpi-approved" className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start text-emerald-600">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={16} /></span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 leading-none">Approved</p>
          <h3 className="text-xl font-black text-zentrix-blue mt-2 font-mono">{stats.approvedCount}</h3>
        </div>

        <div id="kpi-drafts" className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start text-amber-500">
            <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Clock size={16} /></span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 leading-none">Draft Copies</p>
          <h3 className="text-xl font-black text-zentrix-blue mt-2 font-mono">{stats.draftCount}</h3>
        </div>

        <div id="kpi-revisions" className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm">
          <div className="flex justify-between items-start text-purple-500">
            <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><TrendingUp size={16} /></span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 leading-none">Revised</p>
          <h3 className="text-xl font-black text-zentrix-blue mt-2 font-mono">{stats.revisedCount}</h3>
        </div>
      </div>

      {/* Main Charts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left column charts: Cost distributions */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-zentrix-blue mb-4 flex items-center gap-1.5 leading-none">
              <Layers size={15} className="text-primary-500" /> Discipline Wise Cost Distribution
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disciplineCostData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                    {disciplineCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-zentrix-blue mb-4 flex items-center gap-1.5 leading-none">
                <TrendingUp size={15} className="text-emerald-500" /> Monthly BOQ Financial baseline
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChangesData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-zentrix-blue mb-4 flex items-center gap-1.5 leading-none">
                <Layers size={15} className="text-amber-500" /> Top Cost Categories (Active Estimations)
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryCostData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={100} fontSize={10} stroke="#94a3b8" />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Recent activity & quick info */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick info pane */}
          <div className="bg-gradient-to-br from-primary-900 to-slate-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-5 translate-y-5">
              <FileText size={180} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-300">QS Enterprise Baseline</p>
            <h4 className="text-lg font-bold mt-1 text-white leading-tight">Master Cost Base is active</h4>
            <p className="text-slate-300 text-xs mt-2.5 leading-relaxed">
              Quantity survey rates are calculated using active pricing matrix inputs, syncing automatically with {currentProject?.name}.
            </p>
            <button 
              onClick={() => onNavigate?.('boq-list')}
              className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary-300 hover:text-white transition-colors cursor-pointer"
            >
              Configure listing details <ArrowRight size={12} />
            </button>
          </div>

          {/* Recent Activity Panel */}
          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col h-[283px]">
            <h4 className="font-bold text-zentrix-blue mb-4 flex items-center gap-1.5 leading-none shrink-0">
              <Activity size={15} className="text-blue-500" /> Recent QS Operations
            </h4>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 text-[12px] border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="shrink-0 mt-0.5">
                    {act.type === 'REVISION' && <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px]">⚙️</span>}
                    {act.type === 'APPROVAL' && <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-[10px]">✅</span>}
                    {act.type === 'IMPORT' && <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-[10px]">📥</span>}
                    {act.type === 'STATUS' && <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px]">⭐</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 truncate">{act.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{act.desc}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{act.user}</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
