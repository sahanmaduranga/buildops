import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Plus, 
  Paperclip, 
  Clock, 
  BarChart, 
  Download, 
  Camera, 
  Barcode, 
  CornerDownRight, 
  CheckSquare, 
  TrendingUp,
  Warehouse,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { PurchaseOrder, GoodsReceiptNote, MOCK_PURCHASE_ORDERS, MOCK_GRNS, MOCK_WAREHOUSES, GoodsReceiptNote as GRNModel } from './procurementMockData.ts';

interface PurchaseOrdersAndGRNProps {
  poList: PurchaseOrder[];
  grnList: GoodsReceiptNote[];
  onGRNAdded: (grn: GoodsReceiptNote) => void;
}

export const PurchaseOrdersAndGRN = ({ poList, grnList, onGRNAdded }: PurchaseOrdersAndGRNProps) => {
  const [activeTab, setActiveTab] = useState<'PO' | 'GRN'>('PO');
  const [poSearch, setPoSearch] = useState('');
  const [grnSearch, setGrnSearch] = useState('');

  // Selected item states
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  
  // Create GRN Form states
  const [isGRNFormOpen, setIsGRNFormOpen] = useState(false);
  const [targetPOId, setTargetPOId] = useState('');
  const [receiptDate, setReceiptDate] = useState('2026-05-20');
  const [targetWH, setTargetWH] = useState('wh-1');
  const [receivedQty, setReceivedQty] = useState(100);
  const [damagedQty, setDamagedQty] = useState(0);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [batchNo, setBatchNo] = useState('B-AG-LOT-2026C');
  const [inspectionPassed, setInspectionPassed] = useState(true);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [photoMockText, setPhotoMockText] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // SCM partial delivery tools
  const triggerAutoScan = () => {
    setBarcodeInput('SA43-BC-908722A');
  };

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const po = poList.find(p => p.id === targetPOId);
    if (!po) return;

    const newGRN: GoodsReceiptNote = {
      id: `grn-${Math.random().toString(36).substring(2, 7)}`,
      grnNumber: `GRN-2026-00${grnList.length + 13}`,
      poReference: po.poNumber,
      poId: po.id,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      receiptDate,
      receivedBy: 'Khalid Al-Asiri (Store Keeper)',
      warehouseId: targetWH,
      warehouseName: MOCK_WAREHOUSES.find(w => w.id === targetWH)?.name || 'Central Area Depot',
      inspectionStatus: inspectionPassed ? 'Passed' : 'Failed_Rejected',
      inspectionNotes,
      items: [
        {
          code: po.items[0]?.code || 'MAT-AG-10',
          name: po.items[0]?.name || 'Crushed Aggregate',
          unit: po.items[0]?.unit || 'm3',
          orderedQty: po.items[0]?.orderedQty || 100,
          receivedQty,
          damagedQty,
          rejectedQty,
          batchNo: batchNo || 'BATCH-MOCK-A',
          inspectionPassed
        }
      ],
      attachments: ['MOCK_INVOICE_BILL.pdf'],
      photos: photoMockText ? [photoMockText] : []
    };

    // Update PO received quantity representation
    if (po.items[0]) {
      po.items[0].receivedQty += receivedQty;
      if (po.items[0].receivedQty >= po.items[0].orderedQty) {
        po.status = 'Delivered';
      } else {
        po.status = 'In Transit'; // partially delivered
      }
    }

    onGRNAdded(newGRN);
    setIsGRNFormOpen(false);
    // resetting form
    setTargetPOId('');
    setReceivedQty(100);
    setDamagedQty(0);
    setRejectedQty(0);
    setInspectionNotes('');
    setPhotoMockText('');
  };

  const currentPOForGRN = poList.find(p => p.id === targetPOId);

  const triggerPDFExport = (po: PurchaseOrder) => {
    // Generate simulated print layout alert matching enterprise Procore
    alert(`Generating Standard Purchase Order Agreement Copy:\n-------------------------------------------------\nPO NUMBER: ${po.poNumber}\nSUPPLIER: ${po.supplierName}\nNET AMOUNT: $${po.netAmount.toLocaleString()}\nTAX VALUE (15%): $${po.taxAmount.toLocaleString()}\nTOTAL: $${po.totalAmount.toLocaleString()}\n-------------------------------------------------\nFile PO-${po.poNumber}.pdf is downloaded to local client storage.`);
  };

  const requestPORevision = (po: PurchaseOrder) => {
    po.status = 'Draft';
    alert(`Purchase Order ${po.poNumber} is unlocked back for cost parameter revisions.`);
    setSelectedPO(null);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Category selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl self-start">
        <button 
          onClick={() => setActiveTab('PO')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'PO' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <FileText size={14} /> Active Purchase Orders (POs)
        </button>
        <button 
          onClick={() => setActiveTab('GRN')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'GRN' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <Truck size={14} /> Goods Receipt Notes (GRN Yard)
        </button>
      </div>

      {/* PO View PORTAL */}
      {activeTab === 'PO' && (
        <div className="flex flex-col gap-4">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Search PO ledger by vendor, number..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-primary-500 transition-colors"
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total PO Transactions: {poList.length}</p>
          </div>

          {/* Grid list PO */}
          <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier / Vendor</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Target Delivery</th>
                    <th className="py-3 px-4 text-right">Draft Valuation</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment Terms</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px]">
                  {poList.filter(po => po.supplierName.toLowerCase().includes(poSearch.toLowerCase()) || po.poNumber.toLowerCase().includes(poSearch.toLowerCase())).map((po) => (
                    <tr key={po.id} className="hover:bg-slate-55/40 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-[#111]">{po.poNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{po.supplierName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-400">{po.issueDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500">{po.deliveryDate}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-800">${po.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          po.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          po.status === 'Approved' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10.5px] text-slate-500 font-medium truncate max-w-[140px]">{po.paymentTerms}</td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => setSelectedPO(po)}
                          className="text-[11px] font-bold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer"
                        >
                          Review PO Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GRN View PORTAL */}
      {activeTab === 'GRN' && (
        <div className="flex flex-col gap-4">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Search GRNs by number, supplier..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-primary-500 transition-colors"
                value={grnSearch}
                onChange={(e) => setGrnSearch(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setIsGRNFormOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md leading-none animate-bounce"
            >
              <Plus size={14} /> Record Goods Receipt (GRN)
            </button>
          </div>

          {/* GRN History Matrix */}
          <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">GRN Number</th>
                    <th className="py-3 px-4">PO Reference</th>
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4">Receipt Date</th>
                    <th className="py-3 px-4">Received In Warehouse</th>
                    <th className="py-3 px-4">Item details</th>
                    <th className="py-3 px-4">Qaty Received</th>
                    <th className="py-3 px-4">Inspection</th>
                    <th className="py-3 px-4">Received By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px]">
                  {grnList.filter(grn => grn.supplierName.toLowerCase().includes(grnSearch.toLowerCase()) || grn.grnNumber.toLowerCase().includes(grnSearch.toLowerCase())).map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-55/40 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-[#111]">{grn.grnNumber}</td>
                      <td className="py-3 px-4 font-semibold text-primary-600">{grn.poReference}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{grn.supplierName}</td>
                      <td className="py-3 px-4 text-slate-500">{grn.receiptDate}</td>
                      <td className="py-3 px-4 text-slate-500 font-bold">{grn.warehouseName}</td>
                      <td className="py-3 px-4">
                        <div>{grn.items[0]?.name}</div>
                        <div className="text-[9.5px] text-slate-400 font-black">Batch: {grn.items[0]?.batchNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-exrabold text-[12px] text-slate-800">{grn.items[0]?.receivedQty} {grn.items[0]?.unit}</span>
                        {grn.items[0] && grn.items[0].damagedQty > 0 && (
                          <div className="text-[10px] font-bold text-red-600">Damaged: {grn.items[0].damagedQty}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          grn.inspectionStatus === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {grn.inspectionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium truncate max-w-[140px]">{grn.receivedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <div>
                <span className="text-[9.5px] bg-indigo-150 text-indigo-800 font-black tracking-widest uppercase border border-indigo-200 px-2 py-0.5 rounded">
                  Purchase Agreement
                </span>
                <h4 className="font-extrabold text-zentrix-blue text-[15px] mt-1">Transaction Ledger: {selectedPO.poNumber}</h4>
              </div>
              <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-600 space-y-5">
              
              {/* Supplier details matrix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10.5px] text-[#94a3b8] font-black uppercase">Supplier Vendor:</p>
                  <p className="font-extrabold text-slate-800 text-[12.5px] mt-1">{selectedPO.supplierName}</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-[#94a3b8] font-black uppercase">Payment Credit terms:</p>
                  <p className="font-bold text-slate-705 text-[12.5px] mt-1">{selectedPO.paymentTerms}</p>
                </div>
              </div>

              {/* Items Grid */}
              <div className="space-y-1.5">
                <h5 className="font-black text-slate-500 uppercase tracking-widest text-[9.5px]">Ordered Supply Lots</h5>
                <div className="border border-slate-150 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px] font-semibold">
                    <thead className="bg-[#f8fafc] text-slate-500 border-b border-slate-150 font-black">
                      <tr>
                        <th className="p-2">Code</th>
                        <th className="p-2">Material Description</th>
                        <th className="p-2">Ordered Qty</th>
                        <th className="p-2">Received Qty</th>
                        <th className="p-2 text-right">Unit Net</th>
                        <th className="p-2 text-right">Agg. Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedPO.items.map((item, id) => (
                        <tr key={id}>
                          <td className="p-2 font-black text-slate-900">{item.code}</td>
                          <td className="p-2 text-slate-800">{item.name}</td>
                          <td className="p-2 text-slate-700 font-bold">{item.orderedQty} {item.unit}</td>
                          <td className="p-2 text-slate-500">{item.receivedQty} {item.unit}</td>
                          <td className="p-2 text-right text-slate-500">${item.rate}</td>
                          <td className="p-2 text-right text-slate-900 font-black">${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Financial Summary card */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col gap-1 text-[11px] font-bold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Valuation Base:</span>
                    <span className="text-slate-800">${selectedPO.netAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">VAT & Taxes Allocation (15%):</span>
                    <span className="text-slate-800">${selectedPO.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-[1px] bg-slate-200 my-1" />
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-700">Gross Invoice Commitment Value:</span>
                    <span className="text-emerald-700 font-extrabold">${selectedPO.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Schedule Progress */}
              <div className="space-y-1.5">
                <h5 className="font-black text-slate-500 uppercase tracking-widest text-[9.5px]">Receiving Progress logs</h5>
                <div className="flex flex-col gap-2 bg-slate-50/50 p-3.5 border border-slate-100 rounded-lg">
                  {selectedPO.deliverySchedules.map((sch, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> Target Date: {sch.date}
                      </span>
                      <span className="text-slate-700 font-bold">Allocated Lot: {sch.qty} Units</span>
                      <span className="text-emerald-600 font-black">{sch.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action panel */}
              <div className="flex justify-between gap-3 border-t border-dashed border-slate-100 pt-4">
                <button 
                  type="button" 
                  onClick={() => triggerPDFExport(selectedPO)}
                  className="px-4 py-2 bg-[#f8fafc] border border-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded flex items-center gap-1.5 leading-none transition-all cursor-pointer shadow-sm text-xs"
                >
                  <Download size={13} /> Export PDF Copy
                </button>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => requestPORevision(selectedPO)}
                    className="px-4 py-2 bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-50 font-bold rounded text-xs leading-none cursor-pointer"
                  >
                    Unlock for Revision
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedPO(null);
                      alert(`Purchase order cancel sequence dispatched.`);
                    }}
                    className="px-4 py-2 bg-red-650 text-white rounded text-xs font-bold leading-none cursor-pointer"
                  >
                    Cancel Purchase order
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Record Goods Receipt Note (GRN) Overlay Modal */}
      {isGRNFormOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateGRN} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <h4 className="font-extrabold text-zentrix-blue text-[14px]">Gate-In Good Receiving (GRN Form)</h4>
              <button type="button" onClick={() => setIsGRNFormOpen(false)} className="text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-600 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">PO reference check</label>
                  <select 
                    className="border border-slate-350 p-2 rounded focus:outline-none focus:border-primary-500 font-black text-primary-600"
                    value={targetPOId}
                    onChange={(e) => setTargetPOId(e.target.value)}
                    required
                  >
                    <option value="">Select PO Order...</option>
                    {poList.filter(p => p.status !== 'Delivered').map(po => (
                      <option key={po.id} value={po.id}>{po.poNumber} - {po.supplierName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Warehouse destination Depot</label>
                  <select 
                    className="border border-slate-350 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-800"
                    value={targetWH}
                    onChange={(e) => setTargetWH(e.target.value)}
                  >
                    {MOCK_WAREHOUSES.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {currentPOForGRN && (
                <div className="bg-blue-50 border border-blue-105 p-3 rounded-lg text-blue-800 font-semibold space-y-1">
                  <p className="text-[10px] text-blue-550 uppercase font-black">Target PO Items details:</p>
                  <p className="font-bold text-xs">{currentPOForGRN.items[0]?.name} ({currentPOForGRN.items[0]?.orderedQty} {currentPOForGRN.items[0]?.unit} ordered)</p>
                  <p className="text-[10px] text-blue-600/80">Pending to receive: {(currentPOForGRN.items[0]?.orderedQty || 0) - (currentPOForGRN.items[0]?.receivedQty || 0)} Units</p>
                </div>
              )}

              {/* Barcode scanner mock */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Barcode Scanning identifier</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Place cursor here or scan tracking labels..."
                    className="border border-slate-300 p-2 rounded font-mono flex-1 text-slate-700 font-semibold"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={triggerAutoScan}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs rounded transition-all font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Barcode size={14} /> Scan Label
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Received Qty</label>
                  <input 
                    type="number" 
                    className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-800"
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-red-650">Damaged Qty</label>
                  <input 
                    type="number" 
                    className="border border-slate-300 p-2 rounded focus:outline-none focus:border-red-500 font-bold text-red-700"
                    value={damagedQty}
                    onChange={(e) => setDamagedQty(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-red-650">Rejected Qty</label>
                  <input 
                    type="number" 
                    className="border border-slate-300 p-2 rounded focus:outline-none focus:border-red-500 font-bold text-red-700"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Batch tracking numbers</label>
                  <input 
                    type="text" 
                    className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-700"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Quality Inspection status</label>
                  <div className="flex gap-4 p-2.5 border border-slate-250 rounded bg-slate-50 items-center justify-around">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input type="radio" checked={inspectionPassed} onChange={() => setInspectionPassed(true)} />
                      <span>Pass</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-red-650">
                      <input type="radio" checked={!inspectionPassed} onChange={() => setInspectionPassed(false)} />
                      <span>Fail</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo Upload Attachment */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest text-[9.5px]">Site inspection photograph</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 flex flex-col items-center justify-center gap-1">
                  <Camera size={20} className="text-slate-400" />
                  <p className="text-[10px] text-slate-500 font-bold">Upload material condition upon arrival</p>
                  <button 
                    type="button" 
                    onClick={() => setPhotoMockText('CEMENT_DELIV_TRUCK_INSPECT_04.jpg')}
                    className="text-[10px] bg-primary-50 hover:bg-primary-100 text-primary-600 px-2 py-1 rounded font-black border border-primary-200 mt-1 cursor-pointer"
                  >
                    Simulate Camera Click
                  </button>
                  {photoMockText && (
                    <span className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <CheckCircle size={11} /> Attached: {photoMockText}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Condition review remarks</label>
                <textarea 
                  rows={2} 
                  className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 text-slate-700"
                  placeholder="Record moisture levels or visual defects..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                />
              </div>

            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={() => setIsGRNFormOpen(false)} className="px-4 py-2 bg-white border border-slate-205 text-slate-600 rounded text-xs font-bold leading-none cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded text-xs font-bold leading-none shadow shadow-primary-505/20 cursor-pointer">Submit GRN Log</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
