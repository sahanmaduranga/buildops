import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  CheckCircle, 
  X, 
  Paperclip, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  AlertCircle,
  Link,
  Zap,
  CornerDownRight,
  Database
} from 'lucide-react';
import { 
  MOCK_PURCHASE_REQUESTS, 
  MOCK_PROCUREMENT_MATERIALS, 
  PurchaseRequest, 
  PRItem, 
  ProcurementMaterial 
} from './procurementMockData.ts';

interface PurchaseRequestsProps {
  onPRAdded: (pr: PurchaseRequest) => void;
  prsList: PurchaseRequest[];
}

export const PurchaseRequests = ({ onPRAdded, prsList }: PurchaseRequestsProps) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Urgent'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal toggle
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Detail drawer view
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);

  // New PR wizard draft state
  const [prNo, setPRNo] = useState(`PR-2026-05${Math.floor(Math.random() * 90) + 10}`);
  const [dept, setDept] = useState('Civil Infrastructure');
  const [location, setLocation] = useState('Zone B Main Block');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [requiredDelivDate, setRequiredDelivDate] = useState('2026-06-20');
  const [remarks, setRemarks] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemsToRequest, setItemsToRequest] = useState<PRItem[]>([]);
  const [prComments, setPrComments] = useState('');

  // SCM link tools
  const triggerBOQLink = () => {
    // Automatically retrieve raw cement/steel items matching BOQ schedules
    const cement = MOCK_PROCUREMENT_MATERIALS.find(m => m.code === 'MAT-CM-01')!;
    const steel = MOCK_PROCUREMENT_MATERIALS.find(m => m.code === 'MAT-ST-20')!;
    
    const cementLine: PRItem = {
      resourceId: cement.id,
      resourceCode: cement.code,
      resourceName: cement.name,
      category: cement.category,
      unit: cement.unit,
      qty: 1500,
      estimatedRate: cement.lastPurchaseRate,
      amount: 1500 * cement.lastPurchaseRate,
      requiredDate: requiredDelivDate,
      warehouseId: 'wh-1',
      remarks: 'Linked to BOQ Bill 03 / Section 3.1.A.1 foundation requirements'
    };

    const steelLine: PRItem = {
      resourceId: steel.id,
      resourceCode: steel.code,
      resourceName: steel.name,
      category: steel.category,
      unit: steel.unit,
      qty: 45,
      estimatedRate: steel.lastPurchaseRate,
      amount: 45 * steel.lastPurchaseRate,
      requiredDate: requiredDelivDate,
      warehouseId: 'wh-1',
      remarks: 'Linked to SOT structural superstructure reinforcement Task Phase 2'
    };

    setItemsToRequest([cementLine, steelLine]);
    setSelectedItemIds([cement.id, steel.id]);
  };

  const handleToggleMaterial = (mat: ProcurementMaterial) => {
    if (selectedItemIds.includes(mat.id)) {
      setSelectedItemIds(selectedItemIds.filter(id => id !== mat.id));
      setItemsToRequest(itemsToRequest.filter(item => item.resourceId !== mat.id));
    } else {
      setSelectedItemIds([...selectedItemIds, mat.id]);
      setItemsToRequest([
        ...itemsToRequest,
        {
          resourceId: mat.id,
          resourceCode: mat.code,
          resourceName: mat.name,
          category: mat.category,
          unit: mat.unit,
          qty: 100,
          estimatedRate: mat.lastPurchaseRate,
          amount: 100 * mat.lastPurchaseRate,
          requiredDate: requiredDelivDate,
          warehouseId: 'wh-1',
          remarks: ''
        }
      ]);
    }
  };

  const updateLineItem = <K extends keyof PRItem>(index: number, key: K, val: PRItem[K]) => {
    const fresh = [...itemsToRequest];
    fresh[index] = { ...fresh[index], [key]: val };
    // update computed total amount
    if (key === 'qty' || key === 'estimatedRate') {
      const q = key === 'qty' ? (val as number) : fresh[index].qty;
      const r = key === 'estimatedRate' ? (val as number) : fresh[index].estimatedRate;
      fresh[index].amount = q * r;
    }
    setItemsToRequest(fresh);
  };

  const handleSubmitPR = () => {
    const totalAmount = itemsToRequest.reduce((acc, item) => acc + item.amount, 0);
    const newPR: PurchaseRequest = {
      id: `pr-${Math.random().toString(36).substring(2, 7)}`,
      prNumber: prNo,
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: 'Robert Chen (Project Director)',
      department: dept,
      siteLocation: location,
      requiredDate: requiredDelivDate,
      priority,
      totalAmount,
      approvalStatus: 'Submitted',
      procurementStatus: 'Pending RFP',
      remarks: remarks || prComments,
      items: itemsToRequest,
      approvalsLogs: [
        { role: 'Site Engineer', name: 'Robert Chen', status: 'Submitted', date: new Date().toISOString().split('T')[0], comment: remarks }
      ],
      attachments: ['SITE_PLAN_COORDINATES.pdf']
    };
    onPRAdded(newPR);
    setIsWizardOpen(false);
    // resetting step
    setWizardStep(1);
    setItemsToRequest([]);
    setSelectedItemIds([]);
    setRemarks('');
  };

  // Filter computations
  const filteredList = prsList.filter((pr) => {
    const matchesSearch = pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pr.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pr.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Draft') return pr.approvalStatus === 'Draft';
    if (activeFilter === 'Submitted') return pr.approvalStatus === 'Submitted';
    if (activeFilter === 'Approved') return pr.approvalStatus === 'Approved';
    if (activeFilter === 'Rejected') return pr.approvalStatus === 'Rejected';
    if (activeFilter === 'Urgent') return pr.priority === 'Critical' || pr.priority === 'High';
    
    return true;
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-4 shadow-sm">
        <div className="flex-1 max-w-md relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search PR registers by number, department, engineer..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-primary-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setPRNo(`PR-2026-05${Math.floor(Math.random() * 90) + 10}`);
              setIsWizardOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md leading-none"
          >
            <Plus size={14} /> Add Purchase Request
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {(['All', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Urgent'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === tab 
                ? 'bg-primary-600 text-white shadow' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold group-hover:bg-slate-200">
              {tab === 'All' ? prsList.length : 
               tab === 'Urgent' ? prsList.filter(p => p.priority === 'Critical' || p.priority === 'High').length :
               prsList.filter(p => p.approvalStatus === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">PR Number</th>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Estimated Amount</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Procurement Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 text-[11.5px]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400 font-medium">No purchase requests matching criteria inside this project.</td>
                </tr>
              ) : (
                filteredList.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-55/40 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-[#1d4ed8]">{pr.prNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{pr.requestDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{pr.requestedBy}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{pr.department}</td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">{pr.requiredDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                        pr.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                        pr.priority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        pr.priority === 'Medium' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">${pr.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pr.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        pr.approvalStatus === 'Submitted' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        pr.approvalStatus === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {pr.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-600 font-bold">
                        {pr.procurementStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setSelectedPR(pr)}
                        className="text-[11px] font-bold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer"
                      >
                        Review details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-step PR Creation Wizard (Modal Overlay) */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-300 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75 rounded-t-xl">
              <div>
                <h3 className="font-extrabold text-zentrix-blue text-[15px]">Create Purchase Request (PR) Wizard</h3>
                <p className="text-[11px] text-slate-400">Establish corporate procurement flow directly connected to BOQ & resources.</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="px-6 py-3 border-b border-dashed border-slate-100 bg-slate-50/25 flex items-center justify-between text-xs font-bold text-slate-400">
              <span className={wizardStep >= 1 ? 'text-primary-600 font-black' : ''}>1. Basic Information</span>
              <ChevronRight size={14} />
              <span className={wizardStep >= 2 ? 'text-primary-600 font-black' : ''}>2. SCM Library selection</span>
              <ChevronRight size={14} />
              <span className={wizardStep >= 3 ? 'text-primary-600 font-black' : ''}>3. Line Items & BOQ Linking</span>
              <ChevronRight size={14} />
              <span className={wizardStep >= 4 ? 'text-primary-600 font-black' : ''}>4. Review & Submit</span>
            </div>

            {/* Step Content Area */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-600">
              
              {/* STEP 1: Basic Information */}
              {wizardStep === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">PR Number Reference</label>
                    <input type="text" disabled className="bg-slate-100 border border-slate-200 rounded p-2 text-xs font-semibold" value={prNo} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Proposed Site Delivery Date</label>
                    <input type="date" className="border border-slate-300 rounded p-2 text-xs font-semibold" value={requiredDelivDate} onChange={(e) => setRequiredDelivDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Requesting Division / Dept</label>
                    <select className="border border-slate-300 rounded p-2 text-xs font-bold" value={dept} onChange={(e) => setDept(e.target.value)}>
                      <option>Civil Infrastructure</option>
                      <option>Structural Reinforcements</option>
                      <option>Plumbing & Irrigation SCM</option>
                      <option>MEP Logistics</option>
                      <option>Interior Finishing Lot</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Operational Priority</label>
                    <select className="border border-slate-300 rounded p-2 text-xs font-bold text-red-600" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500">Target Delivery / Warehouse Yard Location</label>
                    <input type="text" className="border border-slate-300 rounded p-2 text-xs font-semibold" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500">Usage Remarks</label>
                    <textarea rows={2.5} className="border border-slate-300 rounded p-2 text-xs font-semibold" placeholder="Elaborate what this procurement aligns with..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                </div>
              )}

              {/* STEP 2: SCM Resource Selector */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-blue-800 flex items-center gap-1">
                        <Database size={13} />
                        <span>BuildOps SCM Master Inventory Linkageer</span>
                      </p>
                      <p className="text-[10.5px] text-blue-600/80">Select standard enterprise assets under active project budget limits.</p>
                    </div>
                    {/* SOT Link button */}
                    <button 
                      type="button"
                      onClick={triggerBOQLink}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3 py-1.5 rounded text-[10.5px] leading-none flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Zap size={11} /> Auto-Link BOQ / SOT Demand
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 font-extrabold text-slate-500">
                        <tr>
                          <th className="p-2.5 text-center">Select</th>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5">Base Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MOCK_PROCUREMENT_MATERIALS.map((mat) => (
                          <tr key={mat.id} className="hover:bg-slate-50/55">
                            <td className="p-2.5 text-center">
                              <input 
                                type="checkbox" 
                                checked={selectedItemIds.includes(mat.id)}
                                onChange={() => handleToggleMaterial(mat)}
                              />
                            </td>
                            <td className="p-2.5 font-black text-slate-700">{mat.code}</td>
                            <td className="p-2.5 font-bold text-slate-800">{mat.name}</td>
                            <td className="p-2.5 text-slate-500">{mat.currentStock} {mat.unit}</td>
                            <td className="p-2.5 text-slate-900 font-extrabold">${mat.lastPurchaseRate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic font-semibold">
                    *Tip: Clicking "Auto-Link BOQ / SOT Demand" uses built-in estimation parameters to forecast concrete volume matrices directly.
                  </p>
                </div>
              )}

              {/* STEP 3: Requested Line Items Spreadsheet */}
              {wizardStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-700 text-xs">Request Items Allocation Table</h4>
                    <span className="text-[10.5px] font-bold text-slate-400">Items: {itemsToRequest.length}</span>
                  </div>

                  {itemsToRequest.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      No lines added yet. Switch back to Step 2 to checklist materials, or auto-simulate linking.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto">
                      <table className="w-full border-collapse text-left text-xs min-w-[650px]">
                        <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 font-black">
                          <tr>
                            <th className="p-2.5">Material</th>
                            <th className="p-2.5">Unit</th>
                            <th className="p-2.5">Req Qty</th>
                            <th className="p-2.5">Est Rate ($)</th>
                            <th className="p-2.5">Total ($)</th>
                            <th className="p-2.5">SOT Allocation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {itemsToRequest.map((item, idx) => (
                            <tr key={item.resourceId} className="hover:bg-slate-50">
                              <td className="p-2.5 text-slate-700 font-bold">
                                <div>{item.resourceName}</div>
                                <div className="text-[9.5px] text-slate-400">{item.resourceCode}</div>
                              </td>
                              <td className="p-2.5 text-slate-500">{item.unit}</td>
                              <td className="p-2.5">
                                <input 
                                  type="number" 
                                  className="border border-slate-200 p-1 rounded w-16 text-center focus:outline-none focus:border-primary-500 font-bold text-slate-700"
                                  value={item.qty}
                                  onChange={(e) => updateLineItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="border border-slate-200 p-1 rounded w-16 text-center focus:outline-none focus:border-primary-500 font-bold text-slate-700"
                                  value={item.estimatedRate}
                                  onChange={(e) => updateLineItem(idx, 'estimatedRate', parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td className="p-2.5 font-extrabold text-[#111]">${item.amount.toLocaleString()}</td>
                              <td className="p-2.5">
                                <span className="text-[10px] bg-slate-150 text-slate-650 px-2 py-0.5 rounded font-black max-w-[140px] truncate block">
                                  {item.remarks || 'Direct Yard Supply'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Review and Submit */}
              {wizardStep === 4 && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-y-2 gap-x-4">
                    <p className="text-slate-400 font-bold">PR Draft Reference:</p>
                    <p className="font-extrabold text-[#111] text-right">{prNo}</p>

                    <p className="text-slate-400 font-bold">Target Delivery Yard:</p>
                    <p className="font-semibold text-slate-800 text-right">{location}</p>

                    <p className="text-slate-400 font-bold">Required Date Limit:</p>
                    <p className="font-semibold text-slate-800 text-right">{requiredDelivDate}</p>

                    <div className="h-[1px] bg-slate-200 col-span-2 my-1" />

                    <p className="text-slate-900 font-black text-[13px]">Total PR Valuation:</p>
                    <p className="font-black text-emerald-600 text-right text-[14px]">
                      ${itemsToRequest.reduce((acc, item) => acc + item.amount, 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">SCM Multi-Level Signoff Timeline:</h5>
                    <div className="border border-slate-100 rounded-lg p-3 flex gap-4 text-center items-center justify-between text-[11px] bg-slate-50/50">
                      <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
                        <span className="font-bold text-slate-800 text-[10px] mt-1">Robert Chen</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Site Eng (Draft)</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                      <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] animate-pulse">2</span>
                        <span className="font-bold text-slate-800 text-[10px] mt-1">Khalid Asiri</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Store Keeper</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                      <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-[10px]">3</span>
                        <span className="font-bold text-slate-400 text-[10px] mt-1">Ziad Mansour</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Proc. Officer</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                      <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-[10px]">4</span>
                        <span className="font-bold text-slate-400 text-[10px] mt-1">Sarah Johnson</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Comm Manager</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitter Verification Remarks</label>
                    <textarea 
                      placeholder="Input finalize instructions for the commercial approval team..." 
                      className="border border-slate-350 rounded p-2 focus:outline-none focus:border-primary-500 text-xs text-slate-700"
                      rows={2.5}
                      value={prComments}
                      onChange={(e) => setPrComments(e.target.value)}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-xl">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded text-xs flex items-center gap-1 cursor-pointer leading-none"
                onClick={() => {
                  if (wizardStep > 1) {
                    setWizardStep(wizardStep - 1);
                  } else {
                    setIsWizardOpen(false);
                  }
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>

              <button
                type="button"
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer leading-none shadow-md"
                onClick={() => {
                  if (wizardStep < 4) {
                    setWizardStep(wizardStep + 1);
                  } else {
                    handleSubmitPR();
                  }
                }}
              >
                {wizardStep === 4 ? 'Commit & Release' : 'Proceed'}
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PR Detail Modal */}
      {selectedPR && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <span className="text-[10px] bg-sky-100 border border-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded leading-none text-xs">
                  {selectedPR.priority} Priority Flow
                </span>
                <h3 className="font-extrabold text-zentrix-blue text-[15px] mt-1">Purchase Request: {selectedPR.prNumber}</h3>
              </div>
              <button onClick={() => setSelectedPR(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Content info */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-600 flex flex-col gap-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Requested By</p>
                  <p className="font-black text-slate-800 mt-0.5">{selectedPR.requestedBy}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Department Code</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedPR.department}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Creation Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPR.requestDate}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Required Date Limit</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPR.requiredDate}</p>
                </div>
              </div>

              {/* Items Grid */}
              <div className="flex flex-col gap-1.5">
                <h5 className="font-black text-slate-500 uppercase tracking-widest text-[9.5px]">PR Requested Items List</h5>
                <div className="border border-slate-150 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f8fafc] text-slate-500 border-b border-slate-150 font-black">
                      <tr>
                        <th className="p-2">Item Code</th>
                        <th className="p-2">Resource</th>
                        <th className="p-2">Requested Qty</th>
                        <th className="p-2 text-right">Est. Rate</th>
                        <th className="p-2 text-right">Total Budget</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedPR.items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 font-black text-primary-600">{item.resourceCode}</td>
                          <td className="p-2 text-slate-800">{item.resourceName}</td>
                          <td className="p-2 text-slate-600 font-bold">{item.qty} {item.unit}</td>
                          <td className="p-2 text-right text-slate-500">${item.estimatedRate}</td>
                          <td className="p-2 text-right text-slate-900 font-black">${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-lg p-3 mt-1.5 font-bold text-xs h-10 leading-none">
                  <span className="text-slate-600">Consolidated PR Estimated Value:</span>
                  <span className="text-emerald-700 text-sm font-black">${selectedPR.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Approval Ledger History */}
              <div className="flex flex-col gap-2.5">
                <h5 className="font-black text-slate-500 uppercase tracking-widest text-[9.5px]">Multi-Level Approval Matrix Trail</h5>
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col gap-3">
                  {selectedPR.approvalsLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8.5px] font-black shrink-0 mt-0.5">✓</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between font-bold text-slate-800 text-[11.5px] leading-none">
                          <span>{log.name} • {log.role}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{log.date}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-1">Status: <span className="text-emerald-600 font-extrabold">{log.status}</span></p>
                        {log.comment && (
                          <div className="mt-1 pb-1 text-[10.5px] text-slate-500 bg-white border border-slate-100 p-2 rounded italic font-semibold">
                            "{log.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments Section */}
              {selectedPR.attachments && (
                <div className="flex flex-col gap-2">
                  <h5 className="font-black text-slate-400 uppercase tracking-widest text-[9.5px]">Drawings & Specifications Links</h5>
                  <div className="flex gap-2">
                    {selectedPR.attachments.map((file, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10.5px] text-primary-600 bg-primary-50/50 hover:bg-primary-100 px-2.5 py-1 rounded-full font-black border border-primary-100 cursor-pointer">
                        <Paperclip size={10} /> {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => setSelectedPR(null)}
                className="px-6 py-2 bg-slate-100 border border-slate-205 text-slate-600 hover:bg-slate-200 font-bold rounded text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
