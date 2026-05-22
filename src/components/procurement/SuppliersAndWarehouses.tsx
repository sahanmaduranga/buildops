import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Building, 
  Layers, 
  DollarSign, 
  MapPin, 
  Truck, 
  AlertTriangle, 
  Shuffle, 
  Grid2X2, 
  Activity, 
  Plus, 
  X, 
  ShieldCheck, 
  FileCheck,
  CheckCircle2,
  Warehouse as WHIcon,
  ChevronRight
} from 'lucide-react';
import { Supplier, Warehouse, StockTransfer, MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_STOCK_TRANSFERS, MOCK_PROCUREMENT_MATERIALS } from './procurementMockData.ts';

interface SuppliersAndWarehousesProps {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  transfers: StockTransfer[];
  onTransferAdded: (trn: StockTransfer) => void;
}

export const SuppliersAndWarehouses = ({ suppliers, warehouses, transfers, onTransferAdded }: SuppliersAndWarehousesProps) => {
  const [panelMode, setPanelMode] = useState<'Suppliers' | 'Warehouses' | 'Transfers'>('Suppliers');
  const [supSearch, setSupSearch] = useState('');
  const [whSelected, setWhSelected] = useState<string | null>(null);

  // Stock transfer form draft state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [sourceWH, setSourceWH] = useState('wh-1');
  const [targetWH, setTargetWH] = useState('wh-2');
  const [selectedMat, setSelectedMat] = useState('pm-7');
  const [transferQty, setTransferQty] = useState(50);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceName = warehouses.find(w => w.id === sourceWH)?.name || 'Main Civil Area Depot';
    const targetName = warehouses.find(w => w.id === targetWH)?.name || 'Mechanical Yard Open Store';
    const matObj = MOCK_PROCUREMENT_MATERIALS.find(m => m.id === selectedMat);

    const newTransfer: StockTransfer = {
      id: `trn-${Math.random().toString(36).substring(2, 7)}`,
      transferNo: `TRN-2026-00${transfers.length + 5}`,
      requestDate: new Date().toISOString().split('T')[0],
      sourceWarehouseId: sourceWH,
      sourceWarehouseName: sourceName,
      targetWarehouseId: targetWH,
      targetWarehouseName: targetName,
      requestedBy: 'Robert Chen (Project Director)',
      status: 'Requested',
      items: [
        {
          code: matObj?.code || 'MAT-PL-09',
          name: matObj?.name || 'PVC Pipe Heavy Duty',
          unit: matObj?.unit || 'Meter',
          qty: transferQty
        }
      ]
    };

    onTransferAdded(newTransfer);
    setIsTransferOpen(false);
    setTransferQty(50);
  };

  const approveTransferItem = (transferNo: string) => {
    const trn = transfers.find(t => t.transferNo === transferNo);
    if (trn) {
      trn.status = 'Approved_Received';
      alert(`Transfer order ${transferNo} completed and stock moved securely.`);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Control Category Tab */}
      <div className="flex bg-slate-100 p-1 rounded-xl self-start">
        <button 
          onClick={() => setPanelMode('Suppliers')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${panelMode === 'Suppliers' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <Users size={14} /> Suppliers Directory & Scorecard
        </button>
        <button 
          onClick={() => setPanelMode('Warehouses')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${panelMode === 'Warehouses' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <Building size={14} /> Warehouse Operations & Zones
        </button>
        <button 
          onClick={() => setPanelMode('Transfers')}
          className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${panelMode === 'Transfers' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
        >
          <Shuffle size={14} /> Inter-Warehouse Stock Transfers
        </button>
      </div>

      {/* SUPPLIERS PANEL */}
      {panelMode === 'Suppliers' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm">
            <div className="flex-1 max-w-sm relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Search registered suppliers, ratings..."
                className="w-full bg-slate-55 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-primary-500 transition-colors"
                value={supSearch}
                onChange={(e) => setSupSearch(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Approved Suppliers: {suppliers.length}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.filter(s => s.name.toLowerCase().includes(supSearch.toLowerCase())).map((sup) => (
              <div key={sup.id} className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                
                {/* Header */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-[9.5px] bg-slate-100 text-slate-550 border border-slate-200 px-1.5 py-0.5 rounded font-black uppercase tracking-wider leading-none">
                      {sup.code}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-[13px] mt-1">{sup.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{sup.category} • {sup.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-black text-amber-600">★ {sup.rating}</span>
                    <span className="text-[9px] text-slate-400 block font-bold">Audit score</span>
                  </div>
                </div>

                {/* Scorecard metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-slate-50 p-2 border border-slate-100/50 rounded-lg">
                    <p className="text-slate-400 uppercase text-[8.5px] tracking-wider leading-none">Total POs</p>
                    <p className="font-black text-slate-700 text-xs mt-1">{sup.totalOrders}</p>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-100/50 rounded-lg">
                    <p className="text-slate-400 uppercase text-[8.5px] tracking-wider leading-none">Quality (QC)</p>
                    <p className="font-black text-emerald-600 text-xs mt-1">{sup.qualityScore}%</p>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-100/50 rounded-lg">
                    <p className="text-slate-400 uppercase text-[8.5px] tracking-wider leading-none">Delay risk</p>
                    <p className="font-black text-orange-600 text-xs mt-1">{((sup.delayedDeliveries / (sup.totalOrders || 1)) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="text-[11px] space-y-1 bg-slate-50/50 border border-slate-100 p-3 rounded-lg font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Exposure:</span>
                    <span className="text-slate-700 font-extrabold">${sup.financialExposure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IBAN Register:</span>
                    <span className="text-slate-500 font-mono truncate max-w-[170px]">{sup.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax Reg ID:</span>
                    <span className="text-slate-600">{sup.taxId}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* WAREHOUSES PANEL */}
      {panelMode === 'Warehouses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Warehouse list */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h4 className="font-extrabold text-[#111] text-[12.5px]">Operational Warehouses</h4>
            {warehouses.map((wh) => (
              <div 
                key={wh.id}
                onClick={() => setWhSelected(wh.id)}
                className={`p-4 border rounded-xl shadow-sm cursor-pointer transition-all flex flex-col gap-1.5 ${
                  whSelected === wh.id 
                    ? 'bg-[#eff6ff] border-primary-400 text-primary-800' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-[13px]">{wh.name}</span>
                  <span className="text-[10px] bg-sky-200 text-sky-800 font-black px-1.5 py-0.5 rounded leading-none uppercase">{wh.code}</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5 font-bold">Yard: {wh.location}</p>
                
                {/* Capacity tracking */}
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Depot Capacity:</span>
                    <span>{wh.capacityUsed}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary-600 h-full rounded-full" style={{ width: `${wh.capacityUsed}%` }} />
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Warehouse inside zones details */}
          <div className="lg:col-span-8 bg-white border border-zentrix-border rounded-xl p-5 shadow-sm min-h-[300px] flex flex-col gap-4">
            {whSelected ? (
              <>
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-black text-zentrix-blue text-[13px] flex items-center gap-1.5 leading-none">
                    <WHIcon size={16} className="text-primary-600" />
                    <span>Layout Zones & Rack Allocation Grid</span>
                  </h4>
                  <p className="text-[10.5px] text-slate-400 mt-1">Active locations of materials inside: {warehouses.find(w => w.id === whSelected)?.name}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {warehouses.find(w => w.id === whSelected)?.layoutZones.map((zone, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-150 p-4 rounded-xl shadow-inner flex flex-col gap-1.5">
                      <span className="text-[10px] bg-[#dbeafe]/80 text-[#1e40af] border-blue-200 border px-2 py-0.5 rounded font-black uppercase tracking-wider self-start leading-none">
                        {zone.zoneCode}
                      </span>
                      <h5 className="font-heavy text-slate-800 text-xs mt-1">{zone.description}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold">{zone.currentLayout}</span>
                    </div>
                  ))}
                </div>

                {/* Simulated bay storage layout schema */}
                <div className="bg-slate-50 border border-slate-100/70 p-4 rounded-xl font-mono text-[9px] text-[#0f172a] space-y-1">
                  <p className="font-bold border-b border-slate-205 pb-1 select-none text-slate-400">BIN LAYOUT RACK SHEETS POSITION MAP (AUTOMATED SCM LOGISTICS)</p>
                  <div className="grid grid-cols-8 gap-1.5 font-black text-center pt-1.5">
                    <div className="p-2 bg-emerald-100 border border-emerald-300 rounded">A1: 85%</div>
                    <div className="p-2 bg-emerald-100 border border-emerald-300 rounded">A2: 24%</div>
                    <div className="p-2 bg-emerald-50 border border-emerald-250 rounded">A3: EMPTY</div>
                    <div className="p-2 bg-amber-100 border border-amber-300 rounded">B1: 90%</div>
                    <div className="p-2 bg-amber-100 border border-amber-300 rounded">B2: 78%</div>
                    <div className="p-2 bg-emerald-100 border border-emerald-300 rounded">B3: 12%</div>
                    <div className="p-2 bg-red-100 border border-red-300 rounded">C1: FULL</div>
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded text-slate-350">C2: TEMP</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <Grid2X2 size={32} className="text-slate-300 mb-2" />
                <h5 className="font-bold text-slate-700">Storage Zone Mapping</h5>
                <p className="text-slate-400 text-[11px] max-w-xs mt-1">Please select an operational warehouse from the left menu to inspect zone allocation grids.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* INTER-WAREHOUSE TRANSFERS PANEL */}
      {panelMode === 'Transfers' && (
        <div className="flex flex-col gap-4">
          
          <div className="flex bg-white border border-zentrix-border rounded-xl p-4 shadow-sm items-center justify-between">
            <div>
              <h4 className="font-extrabold text-[#111] text-[12.5px]">Inter-Warehouse Stock Transfers</h4>
              <p className="text-[11px] text-slate-400">Request or track material stock balances relocation between operational yards.</p>
            </div>
            
            <button 
              onClick={() => setIsTransferOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md leading-none"
            >
              <Plus size={14} /> Request Stock Transfer
            </button>
          </div>

          <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Transfer Number</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4">Source Warehouse</th>
                    <th className="py-3 px-4">Target Warehouse</th>
                    <th className="py-3 px-4">Relocated Items</th>
                    <th className="py-3 px-4">Relocated Quantities</th>
                    <th className="py-3 px-4">Requested By</th>
                    <th className="py-3 px-4">Transit Status</th>
                    <th className="py-3 px-4 text-center">Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px]">
                  {transfers.map((trn) => (
                    <tr key={trn.id} className="hover:bg-slate-55/40 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-[#111]">{trn.transferNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-400">{trn.requestDate}</td>
                      <td className="py-3 px-4 text-slate-700 font-bold">{trn.sourceWarehouseName}</td>
                      <td className="py-3 px-4 text-slate-700 font-bold">{trn.targetWarehouseName}</td>
                      <td className="py-3 px-4 text-zinc-600 font-medium">{trn.items[0]?.name}</td>
                      <td className="py-3 px-4 font-bold text-slate-905">{trn.items[0]?.qty} {trn.items[0]?.unit}</td>
                      <td className="py-3 px-4 text-slate-400">{trn.requestedBy}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          trn.status === 'Approved_Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          trn.status === 'Requested' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {trn.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {trn.status === 'Requested' ? (
                          <button 
                            type="button"
                            onClick={() => approveTransferItem(trn.transferNo)}
                            className="text-[11px] font-bold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer"
                          >
                            Approve Transit
                          </button>
                        ) : (
                          <span className="text-zinc-400 font-bold">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Stock Transfer creation modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTransfer} className="bg-white rounded-xl border border-slate-205 shadow-2xl max-w-sm w-full flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <h4 className="font-extrabold text-zentrix-blue text-[14px]">Draft Stock Transfer Voucher</h4>
              <button type="button" onClick={() => setIsTransferOpen(false)} className="text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-xs text-slate-600">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Source Warehouse</label>
                <select className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-800" value={sourceWH} onChange={(e) => setSourceWH(e.target.value)}>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Target Warehouse</label>
                <select className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-700" value={targetWH} onChange={(e) => setTargetWH(e.target.value)}>
                  {warehouses.filter(w => w.id !== sourceWH).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500">Transfer Stock Item</label>
                <select className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-800" value={selectedMat} onChange={(e) => setSelectedMat(e.target.value)}>
                  {MOCK_PROCUREMENT_MATERIALS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest text-[9.5px]">Relocation Quantity</label>
                <input 
                  type="number" 
                  className="border border-slate-300 p-2 rounded focus:outline-none focus:border-primary-500 font-bold text-slate-800"
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={() => setIsTransferOpen(false)} className="px-4 py-2 bg-white border border-slate-205 text-slate-600 rounded text-xs font-bold leading-none cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded text-xs font-bold leading-none shadow shadow-primary-505/20 cursor-pointer">Submit Relocation Request</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
