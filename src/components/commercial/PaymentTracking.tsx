import React, { useState } from 'react';
import { useCommercial, type PaymentRecord } from '../../context/CommercialContext.tsx';
import { 
  Building, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Info 
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const PaymentTracking = () => {
  const { getPaymentsQuery } = useCommercial();
  const payments = getPaymentsQuery.data || [];

  const [searchTerm, setSearchTerm] = useState('');

  const totalClearedAmount = payments
    .filter(p => p.status === 'Cleared')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const filteredPayments = payments.filter(p => 
    p.invoiceOrIpcNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.payee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in text-[13px] text-slate-600 font-semibold select-none">
      
      {/* 1. AGING BUCKETS DASHBOARD */}
      <div>
        <h4 className="text-xs font-extrabold text-[#1c2e4a] uppercase tracking-wider mb-2.5">Accounts Receivable Aging Bucket Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner text-center">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">Current Balance</p>
            <h4 className="text-sm font-black text-slate-800 mt-1.5">$245,000</h4>
            <span className="inline-block mt-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner text-center">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">1-30 Days Due</p>
            <h4 className="text-sm font-black text-slate-800 mt-1.5">$18,500</h4>
            <span className="inline-block mt-1 w-2 h-2 rounded-full bg-blue-400" />
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner text-center">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">31-60 Days Due</p>
            <h4 className="text-sm font-black text-slate-800 mt-1.5">$15,400</h4>
            <span className="inline-block mt-1 w-2 h-2 rounded-full bg-amber-400" />
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner text-center font-bold">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">61-90 Days Due</p>
            <h4 className="text-sm font-black text-slate-800 mt-1.5">$4,800</h4>
            <span className="inline-block mt-1 w-2 h-2 rounded-full bg-orange-400" />
          </div>

          <div className="bg-[#fff5f5] border border-red-100 rounded-xl p-3 text-center">
            <p className="text-[9px] text-red-500 font-extrabold uppercase leading-none">&gt;90 Days Overdue</p>
            <h4 className="text-sm font-black text-red-700 mt-1.5">$1,850</h4>
            <span className="inline-block mt-1 w-2 h-2 rounded-full bg-red-600" />
          </div>
        </div>
      </div>

      {/* 2. PAYMENT TRANSACTIONS LEDGER */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden min-h-[220px]">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-2.5 text-slate-400"><Search size={14} /></span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cash entries by ref code or bill..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Claim / IPC Reference</th>
                <th className="py-2.5 px-4">Receiver Payee</th>
                <th className="py-2.5 px-4">Payer Entity</th>
                <th className="py-2.5 px-4 text-right">Settled Cash Amount</th>
                <th className="py-2.5 px-4">Treasury Method</th>
                <th className="py-2.5 px-4 text-center">Clearance Node</th>
                <th className="py-2.5 px-4 pr-6">Clearing Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-xs text-slate-600">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.refNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-500">{p.invoiceOrIpcNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{p.payee}</td>
                  <td className="py-3 px-4 text-slate-400">{p.payer}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">${p.amountPaid.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-500">{p.paymentMethod}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] uppercase">
                      Cleared ✓
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 pr-6 font-semibold">{p.paymentDate}</td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Info size={32} className="mx-auto text-slate-200 mb-2" />
                    <h5 className="font-bold">No clearance records match query</h5>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
