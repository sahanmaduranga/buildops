import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  MOCK_PURCHASE_REQUESTS, 
  MOCK_PURCHASE_ORDERS, 
  MOCK_GRNS, 
  MOCK_STOCK_TRANSFERS, 
  MOCK_PROCUREMENT_MATERIALS, 
  MOCK_SUPPLIERS, 
  MOCK_EQUIPMENT_PLANT, 
  MOCK_MATERIAL_ISSUES, 
  MOCK_RFQS, 
  MOCK_WAREHOUSES,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceiptNote,
  StockTransfer,
  MaterialIssue,
  ProcurementMaterial,
  EquipmentPlant,
  Supplier
} from './procurementMockData.ts';

// Modular SCM imports
import { ProcurementDashboard } from './ProcurementDashboard.tsx';
import { PurchaseRequests } from './PurchaseRequests.tsx';
import { RFQsAndQuotations } from './RFQsAndQuotations.tsx';
import { PurchaseOrdersAndGRN } from './PurchaseOrdersAndGRN.tsx';
import { SuppliersAndWarehouses } from './SuppliersAndWarehouses.tsx';
import { InventoryAndEquipment } from './InventoryAndEquipment.tsx';
import { ReportsAndApprovals } from './ReportsAndApprovals.tsx';

import { 
  Building2, 
  Layers, 
  FileText, 
  HelpCircle, 
  ShieldCheck,
  Zap,
  Printer,
  ChevronRight,
  Truck
} from 'lucide-react';

interface ProcurementModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

export default function ProcurementModule({ activeSubTab = 'procurement-dashboard', setActiveSubTab }: ProcurementModuleProps) {
  const { currentProject } = useProject();

  // Unified global-to-module reactive state arrays
  const [prs, setPrs] = useState<PurchaseRequest[]>(MOCK_PURCHASE_REQUESTS);
  const [pos, setPos] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>(MOCK_GRNS);
  const [transfers, setTransfers] = useState<StockTransfer[]>(MOCK_STOCK_TRANSFERS);
  const [mats, setMats] = useState<ProcurementMaterial[]>(MOCK_PROCUREMENT_MATERIALS);
  const [sups, setSups] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [equipment, setEquipment] = useState<EquipmentPlant[]>(MOCK_EQUIPMENT_PLANT);
  const [issues, setIssues] = useState<MaterialIssue[]>(MOCK_MATERIAL_ISSUES);

  // Auto-redirect if activeSubTab is not the primary root but subTab is active
  useEffect(() => {
    if (!activeSubTab && setActiveSubTab) {
      setActiveSubTab('procurement-dashboard');
    }
  }, [activeSubTab, setActiveSubTab]);

  const handleAddPR = (newPR: PurchaseRequest) => {
    setPrs([newPR, ...prs]);
    alert(`Purchase Request ${newPR.prNumber} successfully published to SCM Workflow and logged.`);
  };

  const handleAddPO = (newPO: PurchaseOrder) => {
    setPos([newPO, ...pos]);
    alert(`Purchase Order ${newPO.poNumber} successfully issued. Active supplier was notified.`);
  };

  const handleAddGRN = (newGRN: GoodsReceiptNote) => {
    setGrns([newGRN, ...grns]);
    
    // Auto-update quantity totals inside Mats
    const items = newGRN.items;
    if (items && items[0]) {
      const mat = mats.find(m => m.code === items[0].code);
      if (mat) {
        mat.currentStock += items[0].receivedQty;
        // add to stock card logs
        mat.stockCardLogs.unshift({
          id: `log-${Math.random()}`,
          date: new Date().toISOString().split('T')[0],
          activityType: 'Received (GRN Gate Traffic)',
          qtyDelta: items[0].receivedQty,
          refVoucherNo: newGRN.grnNumber
        });
        setMats([...mats]);
      }
    }
    alert(`Goods Receipt ${newGRN.grnNumber} stored. Inventory balances loaded.`);
  };

  const handleAddTransfer = (newTransfer: StockTransfer) => {
    setTransfers([newTransfer, ...transfers]);
    alert(`Stock Transfer request ${newTransfer.transferNo} generated in transit.`);
  };

  const handleAddIssue = (newIssue: MaterialIssue) => {
    setIssues([newIssue, ...issues]);
    
    // Add transaction to stock card log
    const items = newIssue.items;
    if (items && items[0]) {
      const mat = mats.find(m => m.code === items[0].code);
      if (mat) {
        // Since stockCardLogs is read-only or we update dynamically, we update mats
        setMats([...mats]);
      }
    }
    alert(`Issue Voucher ${newIssue.voucherNo} logged. Dispatching stock now.`);
  };

  // Safe fallback renderer
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'procurement-dashboard':
        return (
          <ProcurementDashboard 
            onNavigateToTab={(sub) => setActiveSubTab?.(sub)} 
          />
        );
      case 'procurement-purchase-requests':
        return (
          <PurchaseRequests 
            prsList={prs} 
            onPRAdded={handleAddPR} 
          />
        );
      case 'procurement-rfqs':
        return (
          <RFQsAndQuotations 
            rfqList={MOCK_RFQS} 
            onQuoteApproved={handleAddPO} 
          />
        );
      case 'procurement-purchase-orders':
        return (
          <PurchaseOrdersAndGRN 
            poList={pos} 
            grnList={grns} 
            onGRNAdded={handleAddGRN} 
          />
        );
      case 'procurement-grn':
        // Reuse PO and GRN component but switch view natively if needed, or pass prop if helpful
        return (
          <PurchaseOrdersAndGRN 
            poList={pos} 
            grnList={grns} 
            onGRNAdded={handleAddGRN} 
          />
        );
      case 'procurement-suppliers':
        return (
          <SuppliersAndWarehouses 
            suppliers={sups} 
            warehouses={MOCK_WAREHOUSES} 
            transfers={transfers} 
            onTransferAdded={handleAddTransfer} 
          />
        );
      case 'procurement-inventory':
        return (
          <InventoryAndEquipment 
            materials={mats} 
            equipment={equipment} 
            issues={issues} 
            onIssueAdded={handleAddIssue} 
          />
        );
      case 'procurement-equipment':
        return (
          <InventoryAndEquipment 
            materials={mats} 
            equipment={equipment} 
            issues={issues} 
            onIssueAdded={handleAddIssue} 
          />
        );
      case 'procurement-reports':
        return (
          <ReportsAndApprovals 
            prs={prs} 
            pos={pos} 
            sups={sups} 
            mats={mats} 
          />
        );
      default:
        return (
          <ProcurementDashboard 
            onNavigateToTab={(sub) => setActiveSubTab?.(sub)} 
          />
        );
    }
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
        <Building2 size={48} className="text-slate-300 mb-3 animate-pulse" />
        <h4 className="text-lg font-bold text-slate-705">Workspace Access Denied</h4>
        <p className="text-xs text-slate-450 max-w-sm mt-1">Please select an active construction project from the sidebar switch block to access Procurement & Inventory workspaces.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6 bg-[#f8fafc]/50 min-h-screen">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <Truck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-220 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                {currentProject.code}
              </span>
              <span className="text-xs text-slate-400 font-bold">Supply Chain Workspace</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 leading-none">Procurement & Warehouse Operations</h2>
            <p className="text-[11px] text-zinc-400 mt-1.5 font-semibold">Active operational space: <span className="text-slate-700 font-extrabold">{currentProject.name}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l md:border-l pl-0 md:pl-5 border-slate-100 text-[11px] text-slate-400">
          <div className="space-y-1">
            <p className="font-extrabold flex items-center gap-1 text-[#111]">
              <ShieldCheck size={13} className="text-emerald-500" /> Standard SAP Compliance Verified
            </p>
            <p className="font-medium text-slate-450">Active operator: Khalid Al-Dossary (Store Keeper ID #954)</p>
          </div>
        </div>
      </div>

      {/* Actual tab area */}
      <div className="flex-1 w-full min-w-0">
        {renderSubTabContent()}
      </div>

    </div>
  );
}
