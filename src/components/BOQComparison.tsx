import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowLeft, 
  ChevronRight, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { useBOQ } from '../context/BOQContext.tsx';
import { formatCurrency, formatNumber } from '../lib/utils.ts';

type DiffRow = {
  code: string;
  description: string;
  unit: string;
  v1Qty: number;
  v2Qty: number;
  v1Rate: number;
  v2Rate: number;
  v1Amount: number;
  v2Amount: number;
  changeType: 'added' | 'removed' | 'modified' | 'none';
};

export const BOQComparison = ({ onBack }: { onBack: () => void }) => {
  const { boqs, boqItemsMap } = useBOQ();

  // Selected dropdowns for versions comparison
  const [v1No, setV1No] = useState<number>(boqs[1]?.revisionNo || 1);
  const [v2No, setV2No] = useState<number>(boqs[0]?.revisionNo || 2);

  const v1BOQ = boqs.find(b => b.revisionNo === v1No) || boqs[boqs.length - 1];
  const v2BOQ = boqs.find(b => b.revisionNo === v2No) || boqs[0];

  const itemsV1 = boqItemsMap[v1BOQ?.id] || [];
  const itemsV2 = boqItemsMap[v2BOQ?.id] || [];

  // Construct comparison rows
  const allCodes = Array.from(new Set([
    ...itemsV1.filter(i => i.type === 'ITEM').map(i => i.code),
    ...itemsV2.filter(i => i.type === 'ITEM').map(i => i.code)
  ])).sort();

  const diffRows: DiffRow[] = allCodes.map(code => {
    const item1 = itemsV1.find(i => i.code === code);
    const item2 = itemsV2.find(i => i.code === code);

    const v1Qty = item1?.quantity || 0;
    const v2Qty = item2?.quantity || 0;
    const v1Rate = item1?.rate || 0;
    const v2Rate = item2?.rate || 0;
    const v1Amount = item1?.amount || 0;
    const v2Amount = item2?.amount || 0;

    let changeType: 'added' | 'removed' | 'modified' | 'none' = 'none';

    if (!item1 && item2) {
      changeType = 'added';
    } else if (item1 && !item2) {
      changeType = 'removed';
    } else if (v1Qty !== v2Qty || v1Rate !== v2Rate) {
      changeType = 'modified';
    }

    return {
      code,
      description: item2?.description || item1?.description || 'Structural Line Element',
      unit: item2?.unit || item1?.unit || 'm3',
      v1Qty,
      v2Qty,
      v1Rate,
      v2Rate,
      v1Amount,
      v2Amount,
      changeType
    };
  });

  const costAddedTotal = diffRows
    .filter(r => r.changeType === 'added' || (r.changeType === 'modified' && r.v2Amount > r.v1Amount))
    .reduce((sum, r) => sum + (r.v2Amount - r.v1Amount), 0);

  const costSavedTotal = diffRows
    .filter(r => r.changeType === 'removed' || (r.changeType === 'modified' && r.v1Amount > r.v2Amount))
    .reduce((sum, r) => sum + (r.v1Amount - r.v2Amount), 0);

  const variancePercent = v1BOQ?.totalAmount 
    ? ((v2BOQ?.totalAmount - v1BOQ.totalAmount) / v1BOQ.totalAmount) * 100 
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase cursor-pointer"
          >
            ← Back to Versioning
          </button>
          <h3 className="text-lg font-bold text-zentrix-blue">Revision Comparison Engine</h3>
          <p className="text-[11px] text-slate-400">Verify budget drift, quantities revision log, and unit rate changes side-by-side.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown Base Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            <span className="text-slate-400 font-medium">Compare:</span>
            <select 
              value={v1No} 
              onChange={(e) => setV1No(Number(e.target.value))}
              className="text-zentrix-blue outline-none bg-transparent cursor-pointer"
            >
              {boqs.map(b => (
                <option key={b.id} value={b.revisionNo}>Rev v{b.revisionNo} ({b.status})</option>
              ))}
            </select>
          </div>

          <ChevronRight size={14} className="text-slate-400" />

          {/* Target Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            <span className="text-slate-400 font-medium">With:</span>
            <select 
              value={v2No} 
              onChange={(e) => setV2No(Number(e.target.value))}
              className="text-zentrix-blue outline-none bg-transparent cursor-pointer"
            >
              {boqs.map(b => (
                <option key={b.id} value={b.revisionNo}>Rev v{b.revisionNo} ({b.status})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI variance dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
        <div className="bg-emerald-50/50 border border-emerald-100 p-4.5 rounded-xl">
          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Gross Cost Additions</p>
          <h4 className="text-xl font-bold font-mono text-emerald-700 mt-1 flex items-center gap-1">
            <TrendingUp size={16} /> +{formatCurrency(costAddedTotal)}
          </h4>
          <p className="text-[10.5px] text-emerald-600 mt-1">Due to scope additions & rate increments.</p>
        </div>

        <div className="bg-red-50/50 border border-red-100 p-4.5 rounded-xl">
          <p className="text-[10px] font-black uppercase text-red-600 tracking-wider">Gross Cost Savings</p>
          <h4 className="text-xl font-bold font-mono text-red-700 mt-1 flex items-center gap-1">
            <TrendingDown size={16} /> -{formatCurrency(costSavedTotal)}
          </h4>
          <p className="text-[10.5px] text-red-600 mt-1">Due to descoping and value engineering.</p>
        </div>

        <div className={`p-4.5 rounded-xl border ${
          variancePercent >= 0 
            ? "bg-amber-50/30 border-amber-200 text-amber-800" 
            : "bg-emerald-50/30 border-emerald-200 text-emerald-800"
        }`}>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Net Estimating Variance</p>
          <h4 className="text-xl font-black font-mono mt-1">
            {variancePercent >= 0 ? "+" : ""}{variancePercent.toFixed(2)}%
          </h4>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Net drift of {formatCurrency(v2BOQ?.totalAmount - v1BOQ?.totalAmount)}
          </p>
        </div>
      </div>

      {/* Comparison Detailed Breakdown Grid list */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-black text-slate-500 uppercase tracking-widest">
                <th colSpan={3} className="px-4 py-2 border-r border-slate-200">BOQ Scope Identity</th>
                <th colSpan={3} className="px-4 py-2 text-center border-r border-slate-200 bg-slate-100/50">Base Version (v{v1No})</th>
                <th colSpan={3} className="px-4 py-2 text-center border-r border-slate-200 bg-primary-50/30">Target Version (v{v2No})</th>
                <th colSpan={2} className="px-4 py-2 text-center">Variations</th>
              </tr>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10.5px] font-black text-slate-500 uppercase">
                <th className="px-4 py-2 border-r border-slate-200 w-24">Item Code</th>
                <th className="px-4 py-2 border-r border-slate-200">Description</th>
                <th className="px-4 py-2 border-r border-slate-200 w-16">Unit</th>
                
                <th className="px-4 py-2 text-right bg-slate-100/10">Qty</th>
                <th className="px-4 py-2 text-right bg-slate-100/10">Rate</th>
                <th className="px-4 py-2 text-right border-r border-slate-200 bg-slate-100/20 font-bold">Total</th>

                <th className="px-4 py-2 text-right bg-primary-50/10">Qty</th>
                <th className="px-4 py-2 text-right bg-primary-50/10">Rate</th>
                <th className="px-4 py-2 text-right border-r border-slate-200 bg-primary-50/20 font-bold">Total</th>

                <th className="px-4 py-2 text-right">Qty Diff</th>
                <th className="px-4 py-2 text-right font-black">Net Change</th>
              </tr>
            </thead>
            <tbody>
              {diffRows.map((row) => {
                const qtyDiff = row.v2Qty - row.v1Qty;
                const costDiff = row.v2Amount - row.v1Amount;

                return (
                  <tr 
                    key={row.code}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 text-[12.5px] transition-colors ${
                      row.changeType === 'added' ? 'bg-emerald-50/20' :
                      row.changeType === 'removed' ? 'bg-red-50/20' :
                      row.changeType === 'modified' ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold border-r border-slate-100">{row.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-100">
                      <div className="flex flex-col">
                        <span className="truncate max-w-sm" title={row.description}>{row.description}</span>
                        {row.changeType === 'added' ? (
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center mt-0.5 uppercase tracking-wider">● Scope Added</span>
                        ) : row.changeType === 'removed' ? (
                          <span className="text-[9px] text-red-500 font-bold flex items-center mt-0.5 uppercase tracking-wider line-through">● Descope</span>
                        ) : row.changeType === 'modified' ? (
                          <span className="text-[9px] text-amber-600 font-bold flex items-center mt-0.5 uppercase tracking-wider">● Values Modified</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-center border-r border-slate-100">{row.unit}</td>

                    {/* V1 base */}
                    <td className="px-4 py-3 text-right bg-slate-100/10 font-mono text-slate-600">{row.v1Qty > 0 ? formatNumber(row.v1Qty) : '-'}</td>
                    <td className="px-4 py-3 text-right bg-slate-100/10 font-mono text-slate-600">{row.v1Rate > 0 ? formatCurrency(row.v1Rate) : '-'}</td>
                    <td className="px-4 py-3 text-right border-r border-slate-100 bg-slate-100/20 font-bold font-mono text-slate-700">{row.v1Amount > 0 ? formatCurrency(row.v1Amount) : '-'}</td>

                    {/* V2 target */}
                    <td className="px-4 py-3 text-right bg-primary-50/10 font-mono text-zentrix-blue">{row.v2Qty > 0 ? formatNumber(row.v2Qty) : '-'}</td>
                    <td className="px-4 py-3 text-right bg-primary-50/10 font-mono text-zentrix-blue">{row.v2Rate > 0 ? formatCurrency(row.v2Rate) : '-'}</td>
                    <td className="px-4 py-3 text-right border-r border-slate-100 bg-primary-50/20 font-bold font-mono text-zentrix-blue">{row.v2Amount > 0 ? formatCurrency(row.v2Amount) : '-'}</td>

                    {/* Variations */}
                    <td className={`px-4 py-3 text-right font-mono font-bold ${qtyDiff > 0 ? 'text-emerald-600' : qtyDiff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {qtyDiff > 0 ? `+${formatNumber(qtyDiff)}` : qtyDiff < 0 ? formatNumber(qtyDiff) : '0'}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-black ${costDiff > 0 ? 'text-emerald-700' : costDiff < 0 ? 'text-red-650' : 'text-slate-400'}`}>
                      {costDiff > 0 ? `+${formatCurrency(costDiff)}` : costDiff < 0 ? formatCurrency(costDiff) : 'No change'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
