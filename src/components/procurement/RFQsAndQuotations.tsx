import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ThumbsUp, 
  ArrowUpRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { RFQ, RFQSupplierSubmission, MOCK_RFQS, MOCK_SUPPLIERS, PurchaseOrder } from './procurementMockData.ts';

interface RFQsAndQuotationsProps {
  onQuoteApproved: (po: PurchaseOrder) => void;
  rfqList: RFQ[];
}

export const RFQsAndQuotations = ({ onQuoteApproved, rfqList }: RFQsAndQuotationsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [isCompareViewOpen, setIsCompareViewOpen] = useState(false);
  const [comparisonSubmissions, setComparisonSubmissions] = useState<RFQSupplierSubmission[]>([]);

  // RFQ Creation draft state
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [prRef, setPrRef] = useState('PR-2026-0410');
  const [closingDate, setClosingDate] = useState('2026-06-30');
  const [invitedSups, setInvitedSups] = useState<string[]>([]);

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate RFQ publication
    const randomSups = MOCK_SUPPLIERS.filter((_, idx) => idx < 3).map(s => s.name);
    // Create new RFQ Mock
    const newRFQ: RFQ = {
      id: `rfq-${Math.random().toString(36).substring(2, 7)}`,
      rfqNumber: `RFQ-2026-0${Math.floor(Math.random() * 80) + 10}`,
      prReference: prRef,
      prId: 'pr-1',
      subject: subject || 'Bulk Structural Aggregate Lots',
      creationDate: new Date().toISOString().split('T')[0],
      closingDate,
      status: 'Published',
      createdBy: 'Robert Chen',
      items: [
        { code: 'MAT-AG-10', name: 'Crushed Coarse Aggregates 20mm', unit: 'm3', qty: 500 }
      ],
      supplierSubmissions: [
        {
          supplierId: 'sup-1',
          supplierName: 'Atlas Steel & Rebars Co.',
          unitPrice: 34.00,
          deliveryDays: 6,
          paymentTerms: 'CAD 45 Days',
          taxAmount: 2550,
          warrantyYears: 1,
          specificationsMatch: true,
          score: 92
        },
        {
          supplierId: 'sup-3',
          supplierName: 'Gulf Building Materials Corp.',
          unitPrice: 33.50,
          deliveryDays: 10,
          paymentTerms: 'Cash On Delivery',
          taxAmount: 2512.5,
          warrantyYears: 1,
          specificationsMatch: true,
          score: 84
        }
      ]
    };
    rfqList.unshift(newRFQ);
    setIsCreateRFQOpen(false);
    setSubject('');
  };

  const handleOpenComparison = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setComparisonSubmissions(rfq.supplierSubmissions);
    setIsCompareViewOpen(true);
  };

  const approveQuotationSubmission = (submission: RFQSupplierSubmission) => {
    if (!selectedRFQ) return;
    
    // Auto-create PO
    const netAmount = (selectedRFQ.items[0]?.qty || 100) * submission.unitPrice;
    const grossAmount = netAmount + submission.taxAmount;

    const newPO: PurchaseOrder = {
      id: `po-${Math.random().toString(36).substring(2, 7)}`,
      poNumber: `PO-2026-00${Math.floor(Math.random() * 90) + 10}`,
      supplierId: submission.supplierId,
      supplierName: submission.supplierName,
      rfqReference: selectedRFQ.rfqNumber,
      prReference: selectedRFQ.prReference,
      issueDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + submission.deliveryDays * 24 * 3600 * 1000).toISOString().split('T')[0],
      netAmount,
      taxAmount: submission.taxAmount,
      totalAmount: grossAmount,
      status: 'Approved',
      paymentStatus: 'Unpaid',
      paymentTerms: submission.paymentTerms,
      remarks: `Quotation Approved under ${selectedRFQ.rfqNumber} comparative matrix analysis score card.`,
      items: selectedRFQ.items.map(item => ({
        resourceId: 'pm-1',
        code: item.code,
        name: item.name,
        unit: item.unit,
        orderedQty: item.qty,
        rate: submission.unitPrice,
        receivedQty: 0,
        amount: item.qty * submission.unitPrice
      })),
      deliverySchedules: [
        { date: new Date(Date.now() + submission.deliveryDays * 24 * 3600 * 1000).toISOString().split('T')[0], qty: selectedRFQ.items[0]?.qty || 100, status: 'Scheduled' }
      ],
      revisions: [
        { revNo: 0, date: new Date().toISOString().split('T')[0], updatedBy: 'Ziad Mansour', notes: 'PO generated automatically from approved quotation lot.' }
      ],
      approvalsTimeline: [
        { role: 'Procurement Officer', name: 'Ziad Mansour', status: 'Approved', date: new Date().toISOString().split('T')[0] },
        { role: 'Commercial Manager', name: 'Sarah Johnson', status: 'Approved', date: new Date().toISOString().split('T')[0], comment: 'Quotation verified with recommended comparison rating score of ' + submission.score }
      ]
    };
    
    onQuoteApproved(newPO);
    // Mark RFQ as completed
    selectedRFQ.status = 'Completed';
    setIsCompareViewOpen(false);
    setSelectedRFQ(null);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Control row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm">
        <div className="flex-1 max-w-md relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search active RFQs by closing date, PR reference, subject..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-primary-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setIsCreateRFQOpen(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md leading-none"
        >
          <Plus size={14} /> Create Request for Quotation (RFQ)
        </button>
      </div>

      {/* RFQ Registry table */}
      <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">RFQ Number</th>
                <th className="py-3 px-4">Subject Lot</th>
                <th className="py-3 px-4">PR Reference</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4">Quotation Closing Date</th>
                <th className="py-3 px-4">Bids Received</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center text-[11px]">Compare Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px]">
              {rfqList.filter((rfq) => rfq.subject.toLowerCase().includes(searchTerm.toLowerCase()) || rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase())).map((rfq) => (
                <tr key={rfq.id} className="hover:bg-slate-55/40 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-[#111]">{rfq.rfqNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{rfq.subject}</td>
                  <td className="py-3 px-4 font-semibold text-primary-600">{rfq.prReference}</td>
                  <td className="py-3 px-4 text-slate-500">{rfq.creationDate}</td>
                  <td className="py-3 px-4 text-slate-500 font-semibold">{rfq.closingDate}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 font-bold">
                      <Users size={12} className="text-slate-400" />
                      <span>{rfq.supplierSubmissions.length} suppliers</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-500">{rfq.createdBy}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rfq.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      rfq.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {rfq.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => handleOpenComparison(rfq)}
                      className="px-3 py-1 bg-primary-50 text-primary-600 rounded text-[10px] font-black border border-primary-200 hover:bg-primary-100 cursor-pointer flex items-center gap-1 mx-auto leading-none h-6"
                    >
                      <Sparkles size={10} /> Bid Index
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare Matrix Overlay Modal */}
      {isCompareViewOpen && selectedRFQ && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="font-extrabold text-zentrix-blue text-[15px]">Corporate Bid Comparison Matrix</h3>
                <p className="text-[11px] text-zinc-400">Analytically review supplier commercial Quotations side-by-side.</p>
              </div>
              <button onClick={() => { setIsCompareViewOpen(false); setSelectedRFQ(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Matrix comparison worksheet */}
            <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-600 space-y-5">
              
              {/* Material information */}
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Target Quote Requirements Lot</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedRFQ.items[0]?.name} ({selectedRFQ.items[0]?.qty} {selectedRFQ.items[0]?.unit})</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-right">PR Reference Lot</p>
                  <p className="font-semibold text-primary-600 text-xs mt-0.5 text-right">{selectedRFQ.prReference}</p>
                </div>
              </div>

              {/* Grid matrix sheets side-by-side matching SAP models */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold text-[10.5px]">
                      <th className="p-3">Parameters Checked</th>
                      {comparisonSubmissions.map((sub, idx) => {
                        // Highlight best score
                        const isBest = idx === 0;
                        return (
                          <th key={idx} className={`p-3 text-center border-l border-slate-200 min-w-[180px] ${isBest ? 'bg-primary-50/40 text-primary-800 font-black' : ''}`}>
                            <div className="flex flex-col items-center">
                              {isBest && (
                                <span className="inline-flex items-center gap-1 text-[8.5px] bg-amber-100 text-amber-800 border-amber-200 border px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider mb-1 leading-none">
                                  <ThumbsUp size={8} /> SCM Recommended
                                </span>
                              )}
                              <span>{sub.supplierName}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11.5px] font-semibold text-slate-700">
                    <tr>
                      <td className="p-3 text-slate-400 font-medium">Unit Rate Quotation</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200 font-black text-slate-900">${sub.unitPrice}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400 font-medium font-medium">Total Cost Commitment</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200 font-extrabold text-blue-800">
                          ${((selectedRFQ.items[0]?.qty || 100) * sub.unitPrice).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400 font-medium">VAT & Taxes Allocation</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200 font-bold text-slate-500">${sub.taxAmount.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400 font-medium">Direct Delivery Lead-time</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200 font-bold text-slate-800">{sub.deliveryDays} Days</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400 font-medium">Payment Terms Frame</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200 text-[10.5px] text-slate-600">{sub.paymentTerms}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400 font-medium">Warranty Coverage</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200">{sub.warrantyYears} Year warranty</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400 font-medium font-medium">Approved Specifications Match</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200">
                          <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-black ${sub.specificationsMatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700'}`}>
                            100% Pass
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-3 text-slate-400 font-extrabold text-[10px] uppercase">Vendor SCM Rating Score</td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200">
                          <div className="flex flex-col items-center">
                            <span className="text-[14px] font-extrabold text-primary-600">{sub.score} / 100</span>
                            <span className="text-[9px] text-[#94a3b8] font-medium">Quality-delivery matrix</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3"></td>
                      {comparisonSubmissions.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-200">
                          <button
                            onClick={() => approveQuotationSubmission(sub)}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded text-xs leading-none transition-all cursor-pointer shadow-md w-full"
                          >
                            Release PO Lot
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Score breakdown metrics explanation */}
              <div className="flex gap-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-800 leading-relaxed font-semibold">
                <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[10.5px]">
                  <p className="font-bold">SCM Commercial recommendation logic engine:</p>
                  <p className="text-blue-700">The recommendation model computes vendor scores using a ratio allocation of 50% Purchase price, 30% logistics delivery transit schedule, and 20% historic vendor compliance rating score limits. Sika Chemicals complies with direct structural specifications parameters.</p>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => { setIsCompareViewOpen(false); setSelectedRFQ(null); }}
                className="px-6 py-2 bg-slate-100 border border-slate-205 text-slate-600 font-bold rounded text-xs cursor-pointer"
              >
                Cancel Evaluation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual RFQ Creation Modal */}
      {isCreateRFQOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateRFQ} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-xl">
              <h4 className="font-extrabold text-zentrix-blue text-[14px]">Initiate Market RFQ Lot</h4>
              <button type="button" onClick={() => setIsCreateRFQOpen(false)} className="text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-xs text-slate-600">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Subject Name</label>
                <input 
                  type="text" 
                  className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-semibold"
                  placeholder="e.g., Cement supply for sub-grade foundation lots"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">PR Reference</label>
                <select className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold" value={prRef} onChange={(e) => setPrRef(e.target.value)}>
                  <option>PR-2026-0410 - Cement and Steel</option>
                  <option>PR-2026-0515 - Premium Weathercoat paint</option>
                  <option>PR-2026-0502 - Cable lots</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Quotation submission closing date</label>
                <input 
                  type="date" 
                  className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-semibold"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">Invite registered materials suppliers:</label>
                <div className="max-h-[140px] overflow-y-auto border border-slate-200 p-2 rounded flex flex-col gap-2 bg-slate-50/50">
                  {MOCK_SUPPLIERS.map((sup) => (
                    <label key={sup.id} className="flex items-center gap-2 text-slate-705 font-bold cursor-pointer">
                      <input type="checkbox" defaultChecked />
                      <span>{sup.name} ({sup.category})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={() => setIsCreateRFQOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-xs font-bold leading-none">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded text-xs font-bold leading-none shadow shadow-primary-500/20">Publish RFQ Lot</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
