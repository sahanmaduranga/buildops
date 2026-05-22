import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Wrench, 
  CheckCircle, 
  Activity, 
  Gauge, 
  FileText, 
  CornerDownRight, 
  Package,
  Cpu,
  Bookmark,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  MOCK_PROCUREMENT_MATERIALS, 
  MOCK_EQUIPMENT_PLANT, 
  MOCK_MATERIAL_ISSUES, 
  ProcurementMaterial, 
  MaterialIssue, 
  EquipmentPlant 
} from './procurementMockData.ts';

interface InventoryAndEquipmentProps {
  materials: ProcurementMaterial[];
  equipment: EquipmentPlant[];
  issues: MaterialIssue[];
  onIssueAdded: (iss: MaterialIssue) => void;
}

export const InventoryAndEquipment = ({ materials, equipment, issues, onIssueAdded }: InventoryAndEquipmentProps) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Issues' | 'Equipment'>('Inventory');
  const [inventorySearch, setInventorySearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');

  // Selected material for transaction history cards
  const [selectedMatRecord, setSelectedMatRecord] = useState<ProcurementMaterial | null>(null);

  // Material issue form draft state
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState('pm-3');
  const [allocBOQ, setAllocBOQ] = useState('BOQ-CIV-3.1A-02');
  const [allocSOT, setAllocSOT] = useState('SOT-T-140 Substructure Cast');
  const [issueQty, setIssueQty] = useState(100);
  const [scrapQty, setScrapQty] = useState(5);
  const [remarks, setRemarks] = useState('');

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const matObj = materials.find(m => m.id === selectedMatId);
    if (!matObj) return;

    // decrease current stock state in Mock
    matObj.currentStock = Math.max(0, matObj.currentStock - issueQty);

    const newIssue: MaterialIssue = {
      id: `iss-${Math.random().toString(36).substring(2, 7)}`,
      voucherNo: `ISV-2026-00${issues.length + 42}`,
      issueDate: new Date().toISOString().split('T')[0],
      issuedBy: 'Khalid Al-Asiri',
      issuedTo: 'Robert Chen',
      warehouseId: 'wh-1',
      warehouseName: 'Main Civil Area Depot',
      taskAllocationId: 'task-1-3',
      taskName: allocSOT,
      boqItemCode: allocBOQ,
      totalAmount: issueQty * matObj.lastPurchaseRate,
      status: 'Issued',
      items: [
        {
          code: matObj.code,
          name: matObj.name,
          unit: matObj.unit,
          issuedQty: issueQty,
          consumedQty: issueQty - scrapQty,
          wastageQty: scrapQty,
          rate: matObj.lastPurchaseRate,
          returnQty: 0
        }
      ]
    };

    onIssueAdded(newIssue);
    setIsIssueOpen(false);
    setIssueQty(100);
    setScrapQty(5);
  };

  const handleEquipmentBreakdown = (eqId: string) => {
    const eq = equipment.find(e => e.id === eqId);
    if (eq) {
      eq.status = 'Breakdown';
      alert(`Breakdown ticket raised for ${eq.name}. Mechanical taskforce dispatched.`);
    }
  };

  const getStockStatus = (item: ProcurementMaterial) => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock <= item.reorderLevel) return 'Low Stock';
    return 'Optimal';
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Category Selection Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl self-start">
        <button 
          onClick={() => setActiveTab('Inventory')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'Inventory' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <Package size={14} /> Master Inventory Explorer
        </button>
        <button 
          onClick={() => setActiveTab('Issues')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'Issues' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <FileText size={14} /> Material Issue Vouchers (Site Allocation)
        </button>
        <button 
          onClick={() => setActiveTab('Equipment')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'Equipment' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <Cpu size={14} /> Heavy Plant & Equipment Tracking
        </button>
      </div>

      {/* MASTER INVENTORY EXPLORER PAGE */}
      {activeTab === 'Inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Main Grid */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Search */}
            <div className="flex bg-white border border-zentrix-border rounded-xl p-4 shadow-sm items-center justify-between">
              <div className="flex-1 max-w-sm relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  placeholder="Filter stock inventory by category, names..."
                  className="w-full bg-slate-55 border border-slate-205 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-primary-500 transition-colors"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Operational Parts: {materials.length}</span>
            </div>

            {/* Grid Table */}
            <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-medium">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                      <th className="py-3 px-4">Item Code</th>
                      <th className="py-3 px-4">Material Name</th>
                      <th className="py-3 px-4">Material Category</th>
                      <th className="py-3 px-4 text-center">Available Stock</th>
                      <th className="py-3 px-4 text-center">Reserved Qty</th>
                      <th className="py-3 px-4 text-right">Avg Unit Cost</th>
                      <th className="py-3 px-4 text-right">Total Valuation</th>
                      <th className="py-3 px-4">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px] font-bold">
                    {materials.filter(m => m.name.toLowerCase().includes(inventorySearch.toLowerCase()) || m.code.toLowerCase().includes(inventorySearch.toLowerCase())).map((item) => {
                      const status = getStockStatus(item);
                      const isLow = status === 'Low Stock' || status === 'Out of Stock';
                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => setSelectedMatRecord(item)}
                        >
                          <td className="py-3 px-4 font-extrabold text-[#111]">{item.code}</td>
                          <td className="py-3 px-4 font-bold text-slate-705">
                            <div>{item.name}</div>
                            <span className="text-[9.5px] text-zinc-400 font-bold block">Yard: Central Civil yard</span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-semibold">{item.category}</td>
                          <td className={`py-3 px-4 text-center font-black text-xs ${isLow ? 'text-red-600 font-extrabold' : 'text-slate-800'}`}>
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-center text-[11.5px] font-bold text-slate-400">{Math.floor(item.currentStock * 0.15)} {item.unit}</td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-500">${item.avgCost.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">${(item.currentStock * item.avgCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              status === 'Low Stock' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                              'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar Audit trail timeline cards */}
          <div className="lg:col-span-4 bg-white border border-zentrix-border rounded-xl p-5 shadow-sm min-h-[350px] flex flex-col gap-4">
            {selectedMatRecord ? (
              <>
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[9.5px] bg-[#eff6ff] text-[#1e40af] border-blue-200 border px-1.5 py-0.5 rounded font-black uppercase tracking-wider leading-none">
                    {selectedMatRecord.code}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-[13px] mt-1.5">{selectedMatRecord.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium font-semibold">Tracking historical storage card movements.</p>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-3">
                  {/* Let's render mock stock card logs securely */}
                  <div className="border-l-2 border-[#3b82f6] pl-3.5 py-1 text-xs">
                    <div className="flex justify-between font-black text-slate-700">
                      <span>Received Goods Receipt</span>
                      <span className="text-slate-400 font-normal">2026-05-20</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pb-1">
                      Log change: <span className="text-emerald-600 font-black">+150 {selectedMatRecord.unit}</span>
                    </p>
                    <p className="text-[10px] text-accent-neutral italic leading-none text-slate-450">Ref: GRN-2026-0012</p>
                  </div>

                  <div className="border-l-2 border-[#ef4444] pl-3.5 py-1 text-xs">
                    <div className="flex justify-between font-black text-slate-700">
                      <span>Issued Site Dispatch</span>
                      <span className="text-slate-400 font-normal">2026-05-18</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pb-1">
                      Log change: <span className="text-red-650 font-black">-350 {selectedMatRecord.unit}</span>
                    </p>
                    <p className="text-[10px] text-accent-neutral italic leading-none text-slate-450">Ref: ISV-2026-0189</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 select-none">
                <Bookmark size={32} className="text-slate-200 mb-2 animate-bounce" />
                <h5 className="font-bold text-slate-600">Material Card History</h5>
                <p className="text-slate-400 text-[11px] max-w-[200px] mt-1 mx-auto leading-relaxed">Select any inventory material line on the left table to load chronological audits.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MATERIAL ISSUES PANEL */}
      {activeTab === 'Issues' && (
        <div className="flex flex-col gap-4">
          
          <div className="flex bg-white border border-zentrix-border rounded-xl p-4 shadow-sm items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-800 text-[12.5px]">Material Issue Vouchers</h4>
              <p className="text-[11px] text-slate-400">Allocate stored construction materials directly to BOQ codes & SOT task timelines.</p>
            </div>
            
            <button 
              onClick={() => setIsIssueOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md leading-none"
            >
              <Plus size={14} /> Raise Issue Voucher
            </button>
          </div>

          <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-medium">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4">Material Issued</th>
                    <th className="py-3 px-4 text-center">Qty Dispatched</th>
                    <th className="py-3 px-4 text-center">Wastage / Scrap</th>
                    <th className="py-3 px-4">Allocated BOQ</th>
                    <th className="py-3 px-4">Allocated SOT Task</th>
                    <th className="py-3 px-4">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px] font-bold">
                  {issues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-[#111]">{iss.voucherNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-400">{iss.issueDate}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{iss.items[0]?.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-705">{iss.items[0]?.name}</td>
                      <td className="py-3 px-4 text-center text-xs font-black text-slate-850">{iss.items[0]?.issuedQty} {iss.items[0]?.unit}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-red-650">{iss.items[0]?.wastageQty || 0} {iss.items[0]?.unit}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] font-extrabold text-amber-700">{iss.boqItemCode}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500 max-w-[170px] truncate">{iss.taskName}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">
                          {iss.status === 'Issued' ? 'Dispatched' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* HEAVY PLANT EQUIPMENT PORTAL */}
      {activeTab === 'Equipment' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Filter equipment registry, status..."
                className="w-full bg-slate-50 border border-slate-205 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-primary-500 transition-colors"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Tracked Fleet: {equipment.length}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.filter(e => e.name.toLowerCase().includes(equipmentSearch.toLowerCase())).map((eq) => {
              const daysLeft = Math.ceil((new Date(eq.maintenanceDueDate).getTime() - new Date('2026-05-20').getTime()) / (1000 * 3600 * 24));
              
              return (
                <div key={eq.id} className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4 border-b border-slate-50 pb-3">
                    <div>
                      <span className="text-[9.5px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-black uppercase tracking-wider leading-none">
                        {eq.code}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs mt-1.5">{eq.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold">Operator: {eq.operatorName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      eq.status === 'In Use' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      eq.status === 'Idle' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {eq.status}
                    </span>
                  </div>

                  {/* Meter indicators telemetry */}
                  <div className="grid grid-cols-3 gap-2.5 text-center text-[11px] font-bold text-slate-705">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Utilization</span>
                      <span className="text-[12px] font-black text-slate-900 mt-1 block">{eq.utilizationPercentage}%</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Hours Tracked</span>
                      <span className="text-[12px] font-black text-slate-900 mt-1 block">{eq.actualHours} hrs</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Fuel index</span>
                      <span className="text-[11px] text-slate-700 font-black mt-1 block">{eq.actualHours > 0 ? (eq.fuelConsumedLiters / eq.actualHours).toFixed(1) : '0'} L/hr</span>
                    </div>
                  </div>

                  {/* Maintenance log details */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50/50 p-3 rounded-lg border border-slate-100 font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Wrench size={11} className="text-slate-400" /> Maintenance Watch:
                    </span>
                    <span className={`font-black ${daysLeft <= 5 ? 'text-red-650 font-black animate-pulse' : 'text-slate-800'}`}>
                      {daysLeft <= 0 ? 'MAINTENANCE PAST DUE' : `${daysLeft} Days left`}
                    </span>
                  </div>

                  {/* Issue breakdown option */}
                  {eq.status === 'In Use' && (
                    <button 
                      type="button"
                      onClick={() => handleEquipmentBreakdown(eq.id)}
                      className="w-full py-2 border border-red-300 hover:bg-red-50 text-red-650 text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                    >
                      Dispatch Breakdown Alert
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Material Issue Creation Voucher Overlay Modal */}
      {isIssueOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateIssue} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <h4 className="font-extrabold text-zentrix-blue text-[14px]">Draft Material Issue Voucher</h4>
              <button type="button" onClick={() => setIsIssueOpen(false)} className="text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-xs text-slate-600">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Inventory Stock Resource</label>
                <select 
                  className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-800"
                  value={selectedMatId}
                  onChange={(e) => setSelectedMatId(e.target.value)}
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.currentStock} {m.unit})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Allocated BOQ line item code</label>
                <select className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-amber-700" value={allocBOQ} onChange={(e) => setAllocBOQ(e.target.value)}>
                  <option>BOQ-CIV-3.1A-02 - Concrete grading base</option>
                  <option>BOQ-STR-4.2C-05 - Reinforcement bars high yield</option>
                  <option>BOQ-FIN-9.1Z-12 - Acrylic internal masonry painting</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Allocated SOT active task link</label>
                <select className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-semibold text-slate-700" value={allocSOT} onChange={(e) => setAllocSOT(e.target.value)}>
                  <option>SOT-T-140 Substructure Cast foundation</option>
                  <option>SOT-T-218 Columns Frame reinforcement superstructure</option>
                  <option>SOT-T-502 Boundary Wall perimeter finishing blockwork</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500">Qty Issued (Dispatched)</label>
                  <input 
                    type="number" 
                    className="border border-slate-300 p-2 rounded font-bold text-slate-800"
                    value={issueQty}
                    onChange={(e) => setIssueQty(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-red-655">Scrap Wastage Allowance</label>
                  <input 
                    type="number" 
                    className="border border-slate-300 p-2 rounded font-bold text-red-700"
                    value={scrapQty}
                    onChange={(e) => setScrapQty(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Remarks / Purpose</label>
                <textarea 
                  rows={2} 
                  className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 text-slate-700 font-semibold"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record dispatcher site notes..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={() => setIsIssueOpen(false)} className="px-4 py-2 bg-white border border-slate-250 text-slate-600 rounded text-xs font-bold leading-none cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded text-xs font-black leading-none shadow shadow-primary-500/20 cursor-pointer">Re-allocate and Dispatch</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
