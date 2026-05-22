import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, Clock, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export const ForecastBilling = () => {
  // S-Curve combined cashflow projection data
  const forecastTrendData = [
    { month: 'Jan', plannedCumulative: 120000, certifiedCumulative: 110000, outlookCumulative: 110000 },
    { month: 'Feb', plannedCumulative: 280000, certifiedCumulative: 255000, outlookCumulative: 255000 },
    { month: 'Mar', plannedCumulative: 490000, certifiedCumulative: 450000, outlookCumulative: 450000 },
    { month: 'Apr', plannedCumulative: 770000, certifiedCumulative: 741243, outlookCumulative: 741243 },
    { month: 'May', plannedCumulative: 970000, certifiedCumulative: 895555, outlookCumulative: 895555 },
    { month: 'Jun', plannedCumulative: 1160000, certifiedCumulative: 1080555, outlookCumulative: 1080555 },
    { month: 'Jul', plannedCumulative: 1420000, certifiedCumulative: null, outlookCumulative: 1340555 },
    { month: 'Aug', plannedCumulative: 1730000, certifiedCumulative: null, outlookCumulative: 1650555 },
    { month: 'Sep', plannedCumulative: 2100000, certifiedCumulative: null, outlookCumulative: 2020555 },
  ];

  const futureMonths = [
    { month: 'Jul 2026', plannedAmount: 260000, riskLevel: 'Low', basis: 'Scheduled Structural Finish' },
    { month: 'Aug 2026', plannedAmount: 310000, riskLevel: 'Low', basis: 'SOT Fit-out Commences' },
    { month: 'Sep 2026', plannedAmount: 370000, riskLevel: 'Medium', basis: 'MEP Structural integration' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 font-semibold text-[13px]">
      
      {/* Overview Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Billing Outlook (6M)</p>
            <h3 className="text-xl font-black text-slate-800">$2,020,555</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Cumulative billing run rate</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Next Cycle Projection</p>
            <h3 className="text-xl font-black text-slate-800">$260,000</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Standard July Billing targets</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Variance Outlook Ratio</p>
            <h3 className="text-xl font-black text-emerald-600">-3.6% Gap</h3>
            <p className="text-[10.5px] text-emerald-600 font-bold">Planned vs actual cumulative</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldAlert size={18} />
          </div>
        </div>
      </div>

      {/* Cumulative Cashflow Curve Chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 select-none">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Cumulative Contract S-Curve Projections</h4>
            <p className="text-[11px] text-slate-400">Comparing original planned billing streams against actual certified and 3-month outlooks.</p>
          </div>
          <div className="flex gap-4 text-[11.5px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-[#475569] rounded-full inline-block" /> Planned S-Curve</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-[#3b82f6] rounded-full inline-block" /> Certified S-Curve</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-[#cbd5e1] rounded-dash border-t-2 border-[#64748b] w-4 inline-block" /> Forecast Trend</span>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 11 }}
                formatter={(value: any) => [`$${value?.toLocaleString() || 'N/A'}`, '']}
              />
              <Area type="monotone" dataKey="plannedCumulative" stroke="#94a3b8" fill="url(#colorPlanned)" strokeWidth={1} />
              <Area type="monotone" dataKey="certifiedCumulative" stroke="#3b82f6" fill="url(#colorCert)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="outlookCumulative" stroke="#64748b" strokeDasharray="4 4" fill="none" />
              <defs>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly billing schedule pipeline */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 select-none">Upcoming Billing SOT Pipeline Actions</h4>
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left font-semibold text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="pb-3 px-1">Cycle Target</th>
                <th className="pb-3 text-right">Target Amount</th>
                <th className="pb-3 text-center">Estimation Certainty</th>
                <th className="pb-3 pr-4">Scope Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold">
              {futureMonths.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-1 font-bold text-slate-800">{m.month}</td>
                  <td className="py-2.5 text-right font-black text-slate-800">${m.plannedAmount.toLocaleString()}</td>
                  <td className="py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/55 text-[10px] uppercase">
                      {m.riskLevel} Risk
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 pr-4">{m.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
