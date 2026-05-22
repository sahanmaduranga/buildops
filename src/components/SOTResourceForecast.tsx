import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Truck, 
  Package, 
  Download, 
  Filter, 
  Search,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.ts';

const histogramData = [
  { week: 'W22', labor: 120, equipment: 45, material: 80 },
  { week: 'W23', labor: 150, equipment: 50, material: 120 },
  { week: 'W24', labor: 180, equipment: 55, material: 180 },
  { week: 'W25', labor: 220, equipment: 65, material: 250 },
  { week: 'W26', labor: 210, equipment: 60, material: 220 },
  { week: 'W27', labor: 190, equipment: 50, material: 150 },
  { week: 'W28', labor: 160, equipment: 40, material: 100 },
];

export const SOTResourceForecast = () => {
  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="bg-white p-5 rounded-xl border border-zentrix-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-zentrix-blue">Resource Forecast</h1>
           <p className="text-[13px] text-zentrix-muted">Analyze and predict resource requirements from schedule</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <select className="pl-9 pr-8 py-2 bg-slate-50 border-none rounded-lg text-[13px] font-bold text-zentrix-blue outline-none appearance-none cursor-pointer">
                <option>All Resource Types</option>
                <option>Labor (Headcount)</option>
                <option>Equipment (Machine Hours)</option>
                <option>Material (Consumption)</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zentrix-border text-zentrix-blue text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm">
             <Download size={16} />
             Download PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Histogram */}
        <div className="lg:col-span-2 bg-white border border-zentrix-border rounded-xl shadow-sm p-6">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[15px] font-bold text-zentrix-blue">Weekly Resource Loading Histogram</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <div className="w-3 h-3 rounded bg-primary-600" />
                    Labor
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <div className="w-3 h-3 rounded bg-secondary-500" />
                    Equipment
                 </div>
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={histogramData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 20 }} />
                    <Bar dataKey="labor" name="Labor Count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="equipment" name="Eqp Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Consumption Curve */}
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm p-6">
           <h3 className="text-[15px] font-bold text-zentrix-blue mb-2">Material Consumption S-Curve</h3>
           <p className="text-[12px] text-zentrix-muted mb-8">Aggregate material spend over time</p>
           <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={histogramData}>
                    <defs>
                      <linearGradient id="colorMat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" hide={true} />
                    <YAxis hide={true} />
                    <Tooltip />
                    <Area type="stepAfter" dataKey="material" stroke="#10b981" fill="url(#colorMat)" strokeWidth={2} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center text-[12px]">
                 <span className="text-zentrix-muted font-bold">Planned Total Spend</span>
                 <span className="text-zentrix-blue font-black font-mono">$1,250,400</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                 <span className="text-zentrix-muted font-bold">Projected Inventory Gap</span>
                 <span className="text-red-600 font-black font-mono">-$42,000</span>
              </div>
           </div>
        </div>
      </div>

      {/* Resource Allocation Grid */}
      <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zentrix-border flex items-center justify-between">
           <h3 className="text-[15px] font-bold text-zentrix-blue">Resource Usage Details</h3>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Find specific resource..." 
                className="pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-[12px] w-64 outline-none"
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-zentrix-border uppercase tracking-widest text-[10px] font-black text-zentrix-muted">
                <th className="px-5 py-4">Resource</th>
                <th className="px-5 py-4 text-right">Planned Usage</th>
                <th className="px-5 py-4 text-right">Actual Usage</th>
                <th className="px-5 py-4 text-right">Remaining</th>
                <th className="px-5 py-4 text-right">Variance</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zentrix-border">
              {[
                { name: 'Portland Cement', type: 'Material', planned: '4,500 Bag', actual: '1,200 Bag', remaining: '3,300 Bag', var: '+2%', status: 'Normal' },
                { name: 'Skilled Mason', type: 'Labor', planned: '120 Man-Days', actual: '145 Man-Days', remaining: '-25 Man-Days', var: '-15%', status: 'Warning' },
                { name: 'Excavator 20T', type: 'Equipment', planned: '450 Hours', actual: '460 Hours', remaining: '-10 Hours', var: '-2%', status: 'Normal' },
                { name: 'Structural Steel', type: 'Material', planned: '25 Ton', actual: '0 Ton', remaining: '25 Ton', var: '0%', status: 'Pending' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-zentrix-blue">{row.name}</span>
                      <span className="text-[11px] text-zentrix-muted">{row.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-[13px] font-medium text-zentrix-blue">{row.planned}</td>
                  <td className="px-5 py-4 text-right text-[13px] font-medium text-zentrix-blue">{row.actual}</td>
                  <td className="px-5 py-4 text-right text-[13px] font-bold text-zentrix-blue">{row.remaining}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={cn(
                      "text-[12px] font-black",
                      row.var.startsWith('+') ? "text-green-600" : row.var === '0%' ? "text-slate-400" : "text-red-500"
                    )}>
                      {row.var}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      row.status === 'Normal' ? "bg-green-50 text-green-600" : 
                      row.status === 'Warning' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
