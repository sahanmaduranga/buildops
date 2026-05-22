import React from 'react';
import { useCommercial } from '../../context/CommercialContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  FileCheck2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock, 
  ClipboardCheck,
  CheckCircle2,
  FileSpreadsheet,
  Ban
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
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
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.ts';

export const CommercialDashboard = () => {
  const { currentProject } = useProject();
  const { 
    getIpcsQuery, 
    getPaymentsQuery, 
    getRetentionsQuery, 
    getClaimsQuery, 
    getVariationsQuery,
    approveIPCStep
  } = useCommercial();

  const ipcs = getIpcsQuery.data || [];
  const payments = getPaymentsQuery.data || [];
  const retentions = getRetentionsQuery.data || [];
  const claims = getClaimsQuery.data || [];
  const variations = getVariationsQuery.data || [];

  // ==========================================
  // METRIC CALCULATIONS
  // ==========================================
  
  // Total Certified (Approved or Paid IPCs Gross Amount)
  const totalCertifiedAmount = ipcs
    .filter(i => i.status === 'Approved' || i.status === 'Paid')
    .reduce((sum, i) => sum + i.certifiedAmount, 0);

  // Total Net Certified (Net amounts due to contractor)
  const totalNetDue = ipcs
    .filter(i => i.status === 'Approved' || i.status === 'Paid')
    .reduce((sum, i) => sum + i.netAmount, 0);

  // Total Paid
  const totalPaid = payments
    .filter(p => p.status === 'Cleared')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Outstanding Accounts Receivable/Payable
  const outstandingAmount = Math.max(0, totalNetDue - totalPaid);

  // Retention held
  const totalRetentionHeld = retentions.reduce((sum, r) => sum + r.retainedAmount, 0);
  const totalRetentionReleased = retentions.reduce((sum, r) => sum + r.releasedAmount, 0);
  const netRetentionBalance = Math.max(0, totalRetentionHeld - totalRetentionReleased);

  // Pending IPCS count
  const pendingIPCsCount = ipcs.filter(i => i.status === 'Submitted' || i.status === 'Draft').length;

  // Overdue Amount
  const overduePaymentsAmount = ipcs
    .filter(i => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.netAmount, 0);

  // Cash flow status is defined as positive if paid matches a high ratio
  const cashFlowRatio = totalCertifiedAmount > 0 ? (totalPaid / totalCertifiedAmount) * 100 : 92.5;

  // Render Premium KPI Card
  const renderKpiCard = (
    title: string, 
    value: string, 
    subtitle: string, 
    trend: { value: string; isPositive: boolean } | null,
    icon: React.ElementType,
    bgColor: string,
    textColor: string
  ) => {
    const Icon = icon;
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{title}</p>
          <div className={cn("p-2 rounded-lg shrink-0", bgColor, textColor)}>
            <Icon size={16} />
          </div>
        </div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2">{value}</h3>
        <div className="flex items-center gap-1.5 mt-2">
          {trend && (
            <span className={cn(
              "text-[10px] font-bold flex items-center gap-0.5 px-1 rounded-md", 
              trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {trend.value}
            </span>
          )}
          <span className="text-[10.5px] text-slate-400 font-semibold">{subtitle}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-primary-500 transition-colors" />
      </div>
    );
  };

  // ==========================================
  // CHART DEFEAT CHART DATA
  // ==========================================

  const billingTrendData = [
    { month: 'Jan', planned: 120000, certified: 110000, cashIn: 95000 },
    { month: 'Feb', planned: 160000, certified: 145000, cashIn: 130000 },
    { month: 'Mar', planned: 210000, certified: 195000, cashIn: 185000 },
    { month: 'Apr', planned: 280000, certified: 291243, cashIn: 243750 },
    { month: 'May', planned: 200000, certified: 154312, cashIn: 154312 },
    { month: 'Jun', planned: 190000, certified: 185000, cashIn: 10000 },
  ];

  const pieData = [
    { name: 'Paid Blocked', value: totalPaid, color: '#10b981' },
    { name: 'Pending Balance', value: outstandingAmount, color: '#0ea5e9' },
    { name: 'Retention Held', value: netRetentionBalance, color: '#f59e0b' },
    { name: 'Overdue Claims', value: overduePaymentsAmount || 15000, color: '#f97316' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 10 KPI grid for executive Procore-level visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {renderKpiCard(
          "Total Certified Gross", 
          `$${totalCertifiedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          "Aggregate billable SOT qty", 
          { value: "+14.2% MoM", isPositive: true },
          FileCheck2, 
          "bg-emerald-50", 
          "text-emerald-600"
        )}

        {renderKpiCard(
          "Total Net Certified", 
          `$${totalNetDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          "Net payable certification", 
          { value: "+8.9%", isPositive: true },
          TrendingUp, 
          "bg-primary-50", 
          "text-primary-600"
        )}

        {renderKpiCard(
          "Collected Cash Paid", 
          `$${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          "Cleared treasury funds", 
          { value: "98.4% clear", isPositive: true },
          DollarSign, 
          "bg-indigo-50", 
          "text-indigo-600"
        )}

        {renderKpiCard(
          "Outstanding Amount", 
          `$${outstandingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          "Receivables current gap", 
          { value: "-12.5%", isPositive: true },
          Clock, 
          "bg-sky-50", 
          "text-sky-600"
        )}

        {renderKpiCard(
          "Retention Bal (Held)", 
          `$${netRetentionBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          `Held from $${totalRetentionHeld.toLocaleString(undefined, { maximumFractionDigits: 0 })} total`, 
          { value: `$${totalRetentionReleased.toLocaleString(undefined, { maximumFractionDigits: 0 })} released`, isPositive: true },
          ShieldAlert, 
          "bg-amber-50", 
          "text-amber-600"
        )}

        {renderKpiCard(
          "Pending IPC Approvals", 
          String(pendingIPCsCount), 
          "Interim bills under audit", 
          pendingIPCsCount > 0 ? { value: "Needs attention", isPositive: false } : null,
          ClipboardCheck, 
          "bg-slate-50", 
          "text-slate-600"
        )}

        {renderKpiCard(
          "Overdue Payments", 
          `$${overduePaymentsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          "Aged receivables >30d", 
          overduePaymentsAmount > 0 ? { value: "Warning state", isPositive: false } : null,
          AlertTriangle, 
          "bg-orange-50", 
          "text-orange-600"
        )}

        {renderKpiCard(
          "Current Month Rev", 
          "$185,000", 
          "June cycle projection", 
          { value: "+2.1%", isPositive: true },
          FileSpreadsheet, 
          "bg-emerald-50 text-emerald-600",
          "text-emerald-700"
        )}

        {renderKpiCard(
          "Forecast Next Month", 
          "$260,000", 
          "SOT task pipeline value", 
          { value: "+22.4%", isPositive: true },
          TrendingUp, 
          "bg-rose-50", 
          "text-rose-600"
        )}

        {renderKpiCard(
          "Cash Flow Status", 
          `${cashFlowRatio.toFixed(1)}%`, 
          "Settlement efficiency ratio", 
          { value: "Optimal", isPositive: true },
          CheckCircle2, 
          "bg-emerald-50", 
          "text-emerald-600"
        )}
      </div>

      {/* Modern Split Charts Section - Cash Flow Curve + Payment Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Monthly Billing & Cash Trend */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Monthly Contract Value Stream</h4>
              <p className="text-[11px] text-slate-400 font-semibold">Comparison of Planned Schedule vs Certified Quantities vs Settled Cash Cashflow</p>
            </div>
            <div className="flex gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#cbd5e1] rounded-full inline-block" /> Planned Schedule</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#3b82f6] rounded-full inline-block" /> Certified Quantities</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[#10b981] rounded-full inline-block" /> Collected Cash</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={billingTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'black', fontSize: '11px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line type="monotone" dataKey="certified" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                <Area type="monotone" dataKey="cashIn" fill="url(#colorCash)" stroke="none" />
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Certified vs Paid Distribution */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Financial Pool Distribution</h4>
            <p className="text-[11px] text-slate-400 font-semibold">Breakdown of gross certified contract claims</p>
          </div>
          <div className="h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-none">Net Value</p>
              <h4 className="text-lg font-black text-slate-800 mt-1">${(totalNetDue/1000).toFixed(1)}k</h4>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {pieData.map((d, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-dashed border-slate-50 pb-1.5 last:border-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-500 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-700">${d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom widgets row: Approvals Queue + Variation alerts + claims detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Commercial Approval Queue */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Pending Commercial Approvals</h4>
              <p className="text-[11px] text-slate-400">Interim Payment Certificates claiming quantities awaiting QS verification</p>
            </div>
            <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
              {ipcs.filter(i=>i.status === 'Submitted' || i.status === 'Draft').length} Active Task
            </span>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[220px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider pb-2">
                  <th className="pb-3 pr-4">Certificate ID</th>
                  <th className="pb-3 pr-4">Contractor</th>
                  <th className="pb-3 pr-4">Period</th>
                  <th className="pb-3 pr-4 text-right">Net Value</th>
                  <th className="pb-3 pr-4 text-center">Gate Status</th>
                  <th className="pb-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ipcs.filter(i => i.status === 'Submitted' || i.status === 'Draft').map((ipc) => {
                  return (
                    <tr key={ipc.id} className="text-xs hover:bg-slate-50/50 group">
                      <td className="py-3 font-bold text-slate-800 pr-4">{ipc.ipcNumber}</td>
                      <td className="py-3 text-slate-500 pr-4">{ipc.contractor}</td>
                      <td className="py-3 text-slate-500 pr-4">{ipc.billingPeriod}</td>
                      <td className="py-3 font-bold text-slate-800 text-right pr-4">${ipc.netAmount.toLocaleString()}</td>
                      <td className="py-3 text-center pr-4">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-100/70">
                          <Clock size={10} /> QS Vetting
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => approveIPCStep(ipc.id, 'QS Engineer', 'Quantity audits checked via portal.')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded cursor-pointer text-[10.5px]"
                          >
                            Pass Audit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {ipcs.filter(i => i.status === 'Submitted' || i.status === 'Draft').length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-300">
                      <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-200" />
                      <p className="font-semibold text-xs">All interim audits successfully vetted</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Variations & Claims Alert widget */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-4 flex justify-between items-center">
            <span>Variations & Claims</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Alert Monitor</span>
          </h4>

          <div className="space-y-3.5 flex-1 select-none">
            {/* Active Variation Order */}
            {variations.map((vo) => (
              <div key={vo.id} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-black text-[9px] rounded uppercase leading-none">
                    {vo.voNumber}
                  </span>
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none border",
                    vo.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                  )}>
                    {vo.status}
                  </span>
                </div>
                <h5 className="font-bold text-slate-800 text-[12px] mt-2 leading-tight truncate">{vo.title}</h5>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-semibold">
                  <span>Scope Delta:</span>
                  <span className="font-bold text-slate-700">+${vo.variationValue.toLocaleString()}</span>
                </div>
              </div>
            ))}

            {/* Active Claims */}
            {claims.map((claim) => (
              <div key={claim.id} className="p-3 bg-rose-50/30 border border-rose-100/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-black text-[9px] rounded uppercase leading-none">
                    {claim.claimNumber}
                  </span>
                  <span className="text-[9px] bg-amber-50 text-amber-700 font-black px-1.5 py-0.5 rounded border border-amber-100 uppercase leading-none">
                    {claim.status}
                  </span>
                </div>
                <h5 className="font-bold text-slate-800 text-[12px] mt-2 leading-tight truncate">{claim.title}</h5>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-semibold">
                  <span>EOT Claimed:</span>
                  <span className="font-bold text-rose-700">{claim.daysEOTClaimed} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
