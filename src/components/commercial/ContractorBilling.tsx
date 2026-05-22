import React, { useState } from 'react';
import { useCommercial } from '../../context/CommercialContext.tsx';
import { 
  History, 
  Search, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileSpreadsheet,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const ContractorBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Realistic subcontract data
  const subcontracts = [
    { id: 'sc-1', code: 'SUB-CIV-002', name: 'Al-Fayha Earthworks & Pumping', sector: 'Excavation & Shoring', contractVal: 450000, certifiedVal: 243750, paidVal: 185000, retentionDeducted: 24375, status: 'Active' },
    { id: 'sc-2', code: 'SUB-CON-004', name: 'Riyadh Steel Fixing Ltd', sector: 'Reinforcement Steelwork', contractVal: 620000, certifiedVal: 51180, paidVal: 51180, retentionDeducted: 5118, status: 'Active' },
    { id: 'sc-3', code: 'SUB-FIN-012', name: 'Masry Masonry Co', sector: 'Masonry & Blockwork', contractVal: 125000, certifiedVal: 16785, paidVal: 0, retentionDeducted: 1678, status: 'Under Review' },
  ];

  const filteredContracts = subcontracts.filter(sc => 
    sc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sc.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Structural overview bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Subcontract Portfolios Count</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">{subcontracts.length} Partners</h3>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-1">SOT allocated contractors</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Subcontract Committed Caps</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">$1,195,000</h3>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-1">Total committed contract allocation</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total Subcontract Certified</p>
          <h3 className="text-xl font-black text-primary-600 mt-1.5">$311,715</h3>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-1">Quantity approved across live gates</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Subcontract Retention Held</p>
          <h3 className="text-xl font-black text-amber-600 mt-1.5">$31,171</h3>
          <p className="text-[10.5px] text-amber-600 font-bold mt-1">10% standard subcontractor hold</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden whitespace-nowrap">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-2.5 text-slate-400"><Search size={14} /></span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subcontractors by trade or code..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500 font-semibold"
            />
          </div>
          <button 
            onClick={() => alert("Subcontract allocation register opened.")}
            className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-sm"
          >
            Register Subcontract Order
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-semibold">
            <thead className="bg-[#f8fafc] text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Agreement ID</th>
                <th className="py-2.5 px-4">Partner Contractor</th>
                <th className="py-2.5 px-4">Scope Domain</th>
                <th className="py-2.5 px-4 text-right font-black">Contract Value</th>
                <th className="py-2.5 px-4 text-right text-primary-600">Total Certified</th>
                <th className="py-2.5 px-4 text-right text-emerald-600">Paid to date</th>
                <th className="py-2.5 px-4 text-right">Retention Holds</th>
                <th className="py-2.5 px-4 text-center">Operation Status</th>
                <th className="py-2.5 px-4 text-right pr-6">Ledger Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800">{sc.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{sc.name}</td>
                  <td className="py-3 px-4 text-slate-500">{sc.sector}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-800">${sc.contractVal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">${sc.certifiedVal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">${sc.paidVal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-500">${sc.retentionDeducted.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase border",
                      sc.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {sc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right pr-6">
                    <button
                      onClick={() => alert(`Opening ledger history for: ${sc.name}`)}
                      className="px-2 py-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 cursor-pointer hover:underline bg-transparent"
                    >
                      Audit Agreements →
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Info size={32} className="mx-auto text-slate-200 mb-2" />
                    <h5 className="font-bold">No subcontractors match query</h5>
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
