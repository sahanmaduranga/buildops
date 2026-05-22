import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  Download, 
  Settings, 
  Layers, 
  FolderLock, 
  BookOpen, 
  Activity, 
  CheckCircle,
  TrendingUp,
  LineChart,
  Grid
} from 'lucide-react';
import { PurchaseRequest, PurchaseOrder, Supplier, ProcurementMaterial } from './procurementMockData.ts';

interface ReportsAndApprovalsProps {
  prs: PurchaseRequest[];
  pos: PurchaseOrder[];
  sups: Supplier[];
  mats: ProcurementMaterial[];
}

export const ReportsAndApprovals = ({ prs, pos, sups, mats }: ReportsAndApprovalsProps) => {
  const [activeRegTab, setActiveRegTab] = useState<'PR' | 'PO' | 'Supplier' | 'Movement'>('PR');

  const triggerSpreadsheetDownload = (title: string) => {
    alert(`BuildOps Enterprise ERP Report Exporter:\n-------------------------------------------------\nFile: ${title}_REGISTER_EXPORT_2026.xlsx\nRows: ${activeRegTab === 'PR' ? prs.length : activeRegTab === 'PO' ? pos.length : sups.length} records parsed\nFormat: Standard Excel Workbook (XML Schema)\n-------------------------------------------------\nExport completed. Transmitting file bytes...`);
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-in">
      
      {/* Description sheet */}
      <div className="flex bg-white border border-zentrix-border rounded-xl p-5 shadow-sm items-center justify-between">
        <div>
          <h4 className="font-extrabold text-[#111] text-[13px]">BuildOps Commercial SCM Reports Hub</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Generate compliant commercial audits, procurement registers, and warehouse ledger worksheets.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => triggerSpreadsheetDownload(activeRegTab)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs rounded-lg shadow-md leading-none flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export XLS Worksheet
          </button>
        </div>
      </div>

      {/* Selector tab row */}
      <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-205 pb-1">
        <button 
          onClick={() => setActiveRegTab('PR')}
          className={`px-4 py-2 rounded-t-lg text-xs font-black transition-all cursor-pointer ${activeRegTab === 'PR' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : 'text-slate-500'}`}
        >
          Purchase Request (PR) Registers
        </button>
        <button 
          onClick={() => setActiveRegTab('PO')}
          className={`px-4 py-2 rounded-t-lg text-xs font-black transition-all cursor-pointer ${activeRegTab === 'PO' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : 'text-slate-500'}`}
        >
          Purchase Order (PO) Registers
        </button>
        <button 
          onClick={() => setActiveRegTab('Supplier')}
          className={`px-4 py-2 rounded-t-lg text-xs font-black transition-all cursor-pointer ${activeRegTab === 'Supplier' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : 'text-slate-500'}`}
        >
          Supplier Performance Logs
        </button>
        <button 
          onClick={() => setActiveRegTab('Movement')}
          className={`px-4 py-2 rounded-t-lg text-xs font-black transition-all cursor-pointer ${activeRegTab === 'Movement' ? 'border-b-2 border-primary-600 text-primary-600 font-bold' : 'text-slate-500'}`}
        >
          Inventory Movement Worksheets
        </button>
      </div>

      {/* Main interactive spreadsheet grids */}

      {/* PR TAB */}
      {activeRegTab === 'PR' && (
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-medium">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-3">Reference No</th>
                  <th className="p-3">Requester Entity</th>
                  <th className="p-3">Department Division</th>
                  <th className="p-3">Required Lead Date</th>
                  <th className="p-3">Workflow Priority</th>
                  <th className="p-3 text-right">Draft Valuation ($)</th>
                  <th className="p-3">Signoff Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-650 font-bold">
                {prs.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-primary-600 font-extrabold">{pr.prNumber}</td>
                    <td className="p-3 text-slate-700">{pr.requestedBy}</td>
                    <td className="p-3 text-slate-500">{pr.department}</td>
                    <td className="p-3 text-slate-500">{pr.requiredDate}</td>
                    <td className="p-3">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100">{pr.priority}</span>
                    </td>
                    <td className="p-3 text-right text-slate-900font-black">${pr.totalAmount.toLocaleString()}</td>
                    <td className="p-3 text-emerald-600 font-extrabold">{pr.approvalStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO TAB */}
      {activeRegTab === 'PO' && (
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-3">PO Reference Number</th>
                  <th className="p-3">Market Supplier partner</th>
                  <th className="p-3">Issue Commitment Date</th>
                  <th className="p-3">Expected Logistics arrival</th>
                  <th className="p-3 text-right">Consolidated Invoice ($)</th>
                  <th className="p-3">Transit Level</th>
                  <th className="p-3">Invoiced payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-650 font-bold">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-[#111] font-black">{po.poNumber}</td>
                    <td className="p-3 text-slate-700">{po.supplierName}</td>
                    <td className="p-3 text-slate-400">{po.issueDate}</td>
                    <td className="p-3 text-slate-500">{po.deliveryDate}</td>
                    <td className="p-3 text-right text-slate-800 font-black">${po.totalAmount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black border border-emerald-100">{po.status}</span>
                    </td>
                    <td className="p-3 text-slate-400 font-medium">{po.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier rating TAB */}
      {activeRegTab === 'Supplier' && (
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-3">Supplier name</th>
                  <th className="p-3">Material category scope</th>
                  <th className="p-3 text-center">Score Stars</th>
                  <th className="p-3 text-center">Quality score</th>
                  <th className="p-3 text-center text-red-650">Logistics Delays</th>
                  <th className="p-3 text-right">Finance Exposure Rating ($)</th>
                  <th className="p-3">Tax registration ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-650 font-bold">
                {sups.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-800">{sup.name}</td>
                    <td className="p-3 text-slate-400">{sup.category}</td>
                    <td className="p-3 text-center text-amber-600">★ {sup.rating}</td>
                    <td className="p-3 text-center text-emerald-600">{sup.qualityScore}%</td>
                    <td className="p-3 text-center text-red-600 font-black">{sup.delayedDeliveries} deliveries delayed</td>
                    <td className="p-3 text-right text-slate-850">${sup.financialExposure.toLocaleString()}</td>
                    <td className="p-3 text-slate-400 font-semibold">{sup.taxId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement ledger TAB */}
      {activeRegTab === 'Movement' && (
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden text-[13px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="p-3">Material reference code</th>
                  <th className="p-3">Material item name</th>
                  <th className="p-3">Major category group</th>
                  <th className="p-3 text-center">Current depot balance</th>
                  <th className="p-3 text-center">Buffer limit parameters</th>
                  <th className="p-3 text-right">Avg cost valuation</th>
                  <th className="p-3 text-right">Total asset valuation ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-650 font-bold">
                {mats.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-primary-600 font-black">{mat.code}</td>
                    <td className="p-3 text-slate-800">{mat.name}</td>
                    <td className="p-3 text-slate-400">{mat.category}</td>
                    <td className="p-3 text-center text-slate-900 font-extrabold">{mat.currentStock} {mat.unit}</td>
                    <td className="p-3 text-center text-slate-500">Min {mat.reorderLevel} {mat.unit}</td>
                    <td className="p-3 text-right text-slate-500">${mat.avgCost}</td>
                    <td className="p-3 text-right font-black text-slate-900">${(mat.currentStock * mat.avgCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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
