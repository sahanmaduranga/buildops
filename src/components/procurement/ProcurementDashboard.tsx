import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  Truck, 
  Package, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { 
  MOCK_SUPPLIERS, 
  MOCK_PURCHASE_REQUESTS, 
  MOCK_PURCHASE_ORDERS, 
  MOCK_PROCUREMENT_MATERIALS, 
  MOCK_EQUIPMENT_PLANT 
} from './procurementMockData.ts';

// Dynamic analytical data
const SPEND_DATA = [
  { month: 'Jan', Budget: 80000, Actual: 72000, Savings: 8000 },
  { month: 'Feb', Budget: 95000, Actual: 91000, Savings: 4000 },
  { month: 'Mar', Budget: 120000, Actual: 114000, Savings: 6000 },
  { month: 'Apr', Budget: 140000, Actual: 146000, Savings: -6000 },
  { month: 'May', Budget: 110000, Actual: 98000, Savings: 12000 },
];

const PO_STATUS_DATA = [
  { name: 'Approved', value: 3, color: '#10b981' },
  { name: 'In Transit', value: 2, color: '#3b82f6' },
  { name: 'Draft/Submitted', value: 1, color: '#64748b' },
  { name: 'Delayed', value: 1, color: '#f59e0b' },
];

const CONSUMPTION_TREND_DATA = [
  { name: 'Wk 1', Cement: 120, Steel: 12, Aggregate: 80 },
  { name: 'Wk 2', Cement: 180, Steel: 15, Aggregate: 110 },
  { name: 'Wk 3', Cement: 240, Steel: 18, Aggregate: 140 },
  { name: 'Wk 4', Cement: 150, Steel: 14, Aggregate: 95 },
  { name: 'Wk 5', Cement: 310, Steel: 22, Aggregate: 160 },
];

interface DashboardProps {
  onNavigateToTab: (subTab: string) => void;
}

export const ProcurementDashboard = ({ onNavigateToTab }: DashboardProps) => {
  // Sum valuations
  const stockValue = MOCK_PROCUREMENT_MATERIALS.reduce((acc, m) => acc + (m.currentStock * m.avgCost), 0);
  const lowStockAlerts = MOCK_PROCUREMENT_MATERIALS.filter(m => m.currentStock <= m.reorderLevel).length;
  const activePOsCount = MOCK_PURCHASE_ORDERS.filter(po => po.status !== 'Draft' && po.status !== 'Cancelled').length;
  
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* 1. KPI Cards Row (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        
        {/* Pending PRs */}
        <div 
          onClick={() => onNavigateToTab('procurement-purchase-requests')}
          className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-widest leading-none">Pending PRs</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold text-zentrix-blue">
              {MOCK_PURCHASE_REQUESTS.filter(pr => pr.approvalStatus === 'Submitted').length}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-bold">
              <ArrowUpRight size={12} />
              <span>2 awaiting final signoff</span>
            </div>
          </div>
        </div>

        {/* Active POs */}
        <div 
          onClick={() => onNavigateToTab('procurement-purchase-orders')}
          className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-widest leading-none">Active POs</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold text-zentrix-blue">{activePOsCount}</h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>Value: </span>
              <span className="font-bold text-slate-700">$51,658</span>
            </div>
          </div>
        </div>

        {/* Stock Value */}
        <div 
          onClick={() => onNavigateToTab('procurement-inventory')}
          className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-widest leading-none">Stock Valuation</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold text-zentrix-blue">${stockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-bold">
              <span>94.8% inventory accuracy</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => onNavigateToTab('procurement-inventory')}
          className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-widest leading-none">Low Stock Items</span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-red-600">{lowStockAlerts}</h3>
            <div className="flex items-center gap-1 text-[11px] text-red-600/80 mt-1 font-semibold">
              <span>Critical materials under buffer</span>
            </div>
          </div>
        </div>

        {/* Equipment Utilization */}
        <div 
          onClick={() => onNavigateToTab('procurement-equipment')}
          className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer cursor-pointer transition-all sm:col-span-2 lg:col-span-1"
        >
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-widest leading-none">Plant Util %</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold text-zentrix-blue">
              {(MOCK_EQUIPMENT_PLANT.reduce((acc, eq) => acc + eq.utilizationPercentage, 0) / MOCK_EQUIPMENT_PLANT.length).toFixed(1)}%
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-semibold">
              <span>1 unit breakdown reported</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Spend analytics */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-7 flex flex-col gap-3 min-h-[350px]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h4 className="font-bold text-zentrix-blue text-[14px]">Enterprise Spend & Savings Variance</h4>
              <p className="text-[10.5px] text-slate-400">Comparison between procurement budget ceilings and actual invoice cashflows.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              $24,000 Saved YTD
            </span>
          </div>
          <div className="flex-1 w-full min-h-[250px] text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPEND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PO Status Share */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h4 className="font-bold text-zentrix-blue text-[14px]">Purchase Order Status Log</h4>
              <p className="text-[10.5px] text-slate-400">Proportional split of active and transient supply orders.</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[250px]">
            {/* Pie Chart */}
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PO_STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PO_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-col gap-2 flex-1">
              {PO_STATUS_DATA.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 font-bold text-xs">{entry.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                    {entry.value} orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material Consumption trend */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm lg:col-span-12 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h4 className="font-bold text-zentrix-blue text-[14px]">Weekly Material Site Consumption</h4>
              <p className="text-[10.5px] text-slate-400">Weekly tracked issue records mapping consumption rates of primary SCM resources to concrete/masonry activities.</p>
            </div>
            <div className="flex gap-2 text-[11px]">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-600">Period: Last 5 Weeks</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px] text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CONSUMPTION_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cementCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="steelCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Cement" stroke="#3b82f6" fillOpacity={1} fill="url(#cementCol)" />
                <Area type="monotone" dataKey="Steel" stroke="#10b981" fillOpacity={1} fill="url(#steelCol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Bottom Grid: Pending Approvals + Invent Alerts + Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Approvals Widget */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-black text-zentrix-blue flex items-center gap-1.5 leading-none">
              <UserCheck size={16} className="text-primary-600" />
              <span>Pending Approvals</span>
            </h4>
            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-black">
              {MOCK_PURCHASE_REQUESTS.filter(pr => pr.approvalStatus === 'Submitted').length} PRs
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[240px] divide-y divide-slate-50 flex flex-col">
            {MOCK_PURCHASE_REQUESTS.filter(pr => pr.approvalStatus === 'Submitted').map((pr) => (
              <div key={pr.id} className="py-3 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors cursor-pointer rounded-lg p-2" onClick={() => onNavigateToTab('procurement-purchase-requests')}>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-primary-600">{pr.prNumber}</span>
                  <span className="text-[9px] bg-red-150 text-red-650 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    {pr.priority}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="font-semibold text-slate-700">{pr.department}</span>
                  <span className="font-black text-slate-900">${pr.totalAmount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">Req By: {pr.requestedBy} • target: {pr.requiredDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Watch */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-black text-zentrix-blue flex items-center gap-1.5 leading-none">
              <ShieldAlert size={16} className="text-red-600" />
              <span>Low-Stock Inventory Watch</span>
            </h4>
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-black">
              {lowStockAlerts} Alerts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[240px] divide-y divide-slate-50 flex flex-col">
            {MOCK_PROCUREMENT_MATERIALS.filter(m => m.currentStock <= m.reorderLevel).map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors p-1.5 rounded-lg" onClick={() => onNavigateToTab('procurement-inventory')}>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs">{item.name}</h5>
                  <p className="text-[10px] text-slate-400">{item.code} • {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-red-600 text-[12.5px]">{item.currentStock} {item.unit}</p>
                  <span className="text-[9px] text-slate-400">Min safe level: {item.reorderLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent GRN Activity list */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-black text-zentrix-blue flex items-center gap-1.5 leading-none">
              <Truck size={16} className="text-indigo-600" />
              <span>Receiving Yard Traffic</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gate Activity</span>
          </div>

          <div className="flex-1 flex flex-col gap-3 max-h-[240px] overflow-y-auto">
            {MOCK_PURCHASE_ORDERS.filter(po => po.status === 'In Transit').map(po => (
              <div key={po.id} className="flex gap-3 bg-slate-50 border border-slate-100 rouned-lg p-2.5 rounded-xl" onClick={() => onNavigateToTab('procurement-grn')}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                  <Truck size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-[#1e293b]">{po.supplierName}</span>
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={8} /> In Transit
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">PO: {po.poNumber} • Delivery: {po.deliveryDate}</p>
                  <p className="text-[10px] mt-1 hover:underline text-primary-600 font-bold cursor-pointer">Register Incoming Gate Entry →</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
