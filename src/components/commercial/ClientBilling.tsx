import React, { useState } from 'react';
import { useCommercial, type ClientInvoice } from '../../context/CommercialContext.tsx';
import { 
  FileText, 
  Search, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Printer,
  ChevronRight,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const ClientBilling = () => {
  const { getInvoicesQuery, addPaymentRecord } = useCommercial();
  const invoices = getInvoicesQuery.data || [];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);

  // Aggregated indicators
  const totalBilled = invoices.reduce((sum, i) => sum + i.netPayable, 0);
  const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.netPayable, 0);
  const outstandingReceivable = Math.max(0, totalBilled - totalCollected);

  // Filter lists
  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.subject.toLowerCase().includes(searchTerm.toLowerCase());
    if (typeFilter === 'all') return matchesSearch;
    return matchesSearch && i.status.toLowerCase() === typeFilter.toLowerCase();
  });

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Amortized Invoiced total</p>
            <h3 className="text-xl font-black text-slate-800">${totalBilled.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Consolidated progress & variations</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Cleared Client Receipts</p>
            <h3 className="text-xl font-black text-emerald-600">${totalCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-[10.5px] text-emerald-600 font-bold">100% processed settlements</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Active Outstanding Balance</p>
            <h3 className="text-xl font-black text-amber-600">${outstandingReceivable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-[10.5px] text-slate-400 font-semibold">Currently aging invoices</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {selectedInvoice ? (
        /* Invoice Detail View & Simulation Live PDF */
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <button 
              onClick={() => setSelectedInvoiceId(null)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 font-bold text-xs cursor-pointer select-none"
            >
              <ArrowLeft size={14} /> Back to Invoices List
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Printer size={13} /> Print Invoice
              </button>
              {selectedInvoice.status !== 'Paid' && (
                <button 
                  onClick={() => {
                    addPaymentRecord({
                      projectId: selectedInvoice.projectId,
                      refNumber: '',
                      invoiceOrIpcNumber: selectedInvoice.invoiceNumber,
                      payee: 'Apex Steel & Concrete',
                      payer: 'BuildOps Developer Tenant',
                      amountPaid: selectedInvoice.netPayable,
                      paymentDate: new Date().toISOString().split('T')[0],
                      paymentMethod: 'ACH',
                      status: 'Cleared'
                    });
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow"
                >
                  Record Receipt of Payment
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* Split 1: Core Invoice PDF mockup */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow p-8 space-y-6 relative font-sans leading-relaxed text-slate-800">
              {/* Draft Watermark logo */}
              <div className="absolute top-10 right-10 text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded border uppercase select-none">
                {selectedInvoice.invoiceType}
              </div>

              {/* PDF Header information */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-100 pb-5">
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Build<span className="text-primary-600">Ops</span> Group</h4>
                  <p className="text-[10.5px] text-slate-400 font-semibold">12 King Abdulaziz Road, Riyadh, KSA</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">VAT Registration #: 30048293021</p>
                </div>
                <div className="text-right space-y-1 select-none">
                  <h5 className="text-sm font-black text-slate-900 leading-none">TAX INVOICE</h5>
                  <p className="text-[11px] font-bold text-slate-600 mt-1">Invoice ID: {selectedInvoice.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">Date issued: {selectedInvoice.invoiceDate}</p>
                  <p className="text-[11px] text-rose-500 font-bold">Due by: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Bill to Section */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="space-y-1 select-none">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Bill From:</p>
                  <p className="font-bold text-slate-800">Vertex Heavy Operations</p>
                  <p className="text-slate-400 font-semibold">Primary Contracting Lead, Riyadh Zone</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Representing Developer Client:</p>
                  <p className="font-bold text-slate-800">BuildOps Prime Holdings Ltd</p>
                  <p className="text-slate-400 font-semibold">QS & Commercial Treasury Officer</p>
                </div>
              </div>

              {/* Invoice lines */}
              <div className="border border-slate-100 rounded-lg overflow-hidden font-semibold">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[9px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Certified amount</th>
                      <th className="py-2 px-3 text-right">Amortized retention</th>
                      <th className="py-2 px-3 text-right pr-4">Tax due (15%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    <tr>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{selectedInvoice.subject}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Interim Certificate Quantity evaluations certified by Robert Chen (QS Coordinator)</p>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">${selectedInvoice.certifiedAmount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-amber-600">-${selectedInvoice.retentionAmount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-700 pr-4">${selectedInvoice.taxAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total footer values */}
              <div className="flex justify-end pt-2">
                <div className="w-1/2 space-y-2 text-xs font-semibold text-slate-600 border-t border-dashed border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Invoiced Net:</span>
                    <span className="font-bold">${selectedInvoice.certifiedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-yellow-600">
                    <span>(-) Retention Clause:</span>
                    <span>-${selectedInvoice.retentionAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>(+) Added tax:</span>
                    <span>+${selectedInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-black text-sm">
                    <span>Outstanding Due:</span>
                    <span>${selectedInvoice.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split 2: Lateral payment updates */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 h-full select-none">
              <h4 className="text-sm font-bold text-slate-800 border-b border-dashed border-slate-100 pb-3 mb-1">Treasury Verification</h4>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-500 font-semibold">
                  <p>Payment Stage: <span className="font-bold text-slate-800 capitalize">{selectedInvoice.status}</span></p>
                  <p>Due Date Interval: <span className="font-bold text-slate-800">{selectedInvoice.dueDate}</span></p>
                  <p>Settled Balance Amount: <span className="font-bold text-slate-800">${selectedInvoice.paidAmount.toLocaleString()}</span></p>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">AEP Accounts Receivable guidelines</h5>
                  <p className="text-slate-500 leading-relaxed font-semibold">This progress invoice is quantity-backed and verified. Receipts should clear in Treasury holding within 30 days of standard invoice dispatch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Invoices Grid */
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><Search size={14} /></span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find progress invoice codes..."
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-semibold">
              <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Invoice ID</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-left">Subject matter</th>
                  <th className="py-2.5 px-4 text-right">Certified amount</th>
                  <th className="py-2.5 px-4 text-right">Tax component</th>
                  <th className="py-2.5 px-4 text-right">Net Payable</th>
                  <th className="py-2.5 px-4 text-center">Receipt Stage</th>
                  <th className="py-2.5 px-4 text-right pr-6">PDF Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-blue-600 font-bold text-[10.5px]">{inv.invoiceType}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">{inv.subject}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700">${inv.certifiedAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-500">${inv.taxAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">${inv.netPayable.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase border",
                        inv.status === 'Paid' ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        className="px-2 py-1 text-[11px] font-bold text-primary-600 hover:underline cursor-pointer bg-transparent"
                      >
                        Inspect Invoice PDF →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
