import React, { useState } from 'react';
import { useSubcontract } from '../../context/SubcontractContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  FileSpreadsheet, 
  Search, 
  Coins, 
  TrendingUp, 
  Scale, 
  Download,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export function SubcontractReports() {
  const { currentProject } = useProject();
  const { subcontractors, packages, ipcs, variations } = useSubcontract();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="font-bold text-slate-900 leading-none">No Enterprise Project Context</h4>
        <p className="text-xs text-slate-400 mt-1">Please select an active project workspace to load its consolidated package reports.</p>
      </div>
    );
  }

  const projectPackages = packages.filter(p => p.projectId === currentProject.id);
  const projectIPCs = ipcs.filter(i => i.projectId === currentProject.id);

  // Apply filters
  const filteredPackages = projectPackages.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSimulateReportExport = () => {
    alert(`Subcontract Commercial Ledger report successfuly generated for ${currentProject.name}. Standard Excel workbook compiled with ${filteredPackages.length} active row entries.`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentProject.defaultCurrency || 'USD' }).format(val);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs text-slate-650 font-sans leading-normal">
      
      {/* Consolidated Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm select-none">
        <div className="relative w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search report entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary-555 text-xs focus:outline-none focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-white rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer text-slate-800"
          >
            <option value="All">All Operations Status</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={handleSimulateReportExport}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer leading-none transition shadow-sm"
          >
            <FileSpreadsheet size={14} /> Export Commercial Ledger
          </button>
        </div>
      </div>

      {/* Main Ledger Table Row */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
        
        <div className="overflow-x-auto">
          {filteredPackages.length === 0 ? (
            <p className="py-16 text-center text-slate-400 italic font-semibold">No reportable entries mapped.</p>
          ) : (
            <table className="w-full border-collapse text-left text-zinc-650 min-w-[1000px]">
              <thead className="bg-slate-50 text-zinc-400 select-none uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Pkg Code</th>
                  <th className="py-3 px-3">Work Package Name</th>
                  <th className="py-3 px-3">Subcontractor</th>
                  <th className="py-3 px-3">Original Budget</th>
                  <th className="py-3 px-3">Variations Value</th>
                  <th className="py-3 px-3">Revised Contract</th>
                  <th className="py-3 px-3">Gross Certified</th>
                  <th className="py-3 px-3">Advance Balance</th>
                  <th className="py-3 px-3">Retention Held</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPackages.map(pkg => {
                  const sub = subcontractors.find(s => s.id === pkg.subcontractorId);
                  
                  // Variations approved sum
                  const approvedVarAmt = variations
                    .filter(v => v.packageId === pkg.id && v.status === 'Approved')
                    .reduce((sum, v) => sum + v.amount, 0);

                  // Approved IPCs
                  const approvedIPCs = projectIPCs.filter(i => i.packageId === pkg.id && (i.status === 'Approved' || i.status === 'Paid'));
                  const grossCertified = approvedIPCs.reduce((sum, i) => sum + i.certifiedAmount, 0);
                  const retentionHeld = approvedIPCs.reduce((sum, i) => sum + i.retentionAmount, 0);
                  const totalRecoveredAdvance = approvedIPCs.reduce((sum, i) => sum + i.advanceRecoveryAmount, 0);

                  // Advance Balance calculations: Mobilized minus recovered
                  const initialAdvanceAmt = pkg.revisedContractValue * (pkg.advancePercentage / 100);
                  const advanceBalanceOutstanding = Math.max(0, initialAdvanceAmt - totalRecoveredAdvance);

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-primary-655 whitespace-nowrap">{pkg.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate" title={pkg.name}>{pkg.name}</td>
                      <td className="py-3 px-3 font-semibold text-slate-550 truncate max-w-[150px]">{sub ? sub.name : 'Unassigned'}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono">{formatCurrency(pkg.originalContractValue)}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-rose-500 font-bold">+ {formatCurrency(approvedVarAmt)}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">{formatCurrency(pkg.revisedContractValue)}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-emerald-600 font-bold">{formatCurrency(grossCertified)}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-indigo-700">
                        {formatCurrency(advanceBalanceOutstanding)}
                        <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">Initial: {pkg.advancePercentage}%</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-amber-600 font-bold">{formatCurrency(retentionHeld)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider block text-center w-18 leading-none",
                          pkg.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-550"
                        )}>
                          {pkg.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
