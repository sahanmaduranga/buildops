import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Check,
  PlusCircle, 
  MinusCircle, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { type RateAnalysis, type Resource, ResourceType } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface ComparisonViewProps {
  analyses: RateAnalysis[];
}

export const ComparisonView = ({ analyses }: ComparisonViewProps) => {
  const [selectedCode, setSelectedCode] = useState<string>('RA-CONC-25');
  const [rev1, setRev1] = useState<string>('Rev A (Initial)');
  const [rev2, setRev2] = useState<string>('Rev B (Revised)');

  // Simulating comparison snapshots for Concrete Work (RA-CONC-25)
  const comparisonSnapshots = {
    'RA-CONC-25': {
      activeLabel: 'Concrete Grade 25',
      unit: 'm3',
      diffOverview: {
        totalDiff: '$12.25',
        pctChange: '+7.1%',
        direction: 'up' as 'up' | 'down'
      },
      revisions: [
        { label: 'Rev A (Initial)', netRate: '$158.35', subtotal: '$129.00', overhead: '10%', profit: '5%', total: '$158.35' },
        { label: 'Rev B (Revised)', netRate: '$170.60', subtotal: '$139.10', overhead: '10%', profit: '5%', total: '$170.60' }
      ],
      rows: [
        { 
          id: '1', 
          resource: 'Portland Cement', 
          type: 'Material', 
          unit: 'Bag',
          rev1Val: { qty: '7.0', rate: '$8.50', total: '$59.50', waste: '3%' }, 
          rev2Val: { qty: '7.5', rate: '$8.50', total: '$63.75', waste: '5%' }, 
          diff: 'modified', 
          note: 'Waste threshold buffered +2%' 
        },
        { 
          id: '2', 
          resource: 'Fine Sand', 
          type: 'Material', 
          unit: 'm3',
          rev1Val: { qty: '0.45', rate: '$25.0', total: '$11.25', waste: '10%' }, 
          rev2Val: { qty: '0.45', rate: '$25.0', total: '$11.25', waste: '10%' }, 
          diff: 'equal', 
          note: 'Unchanged' 
        },
        { 
          id: '3', 
          resource: 'Crushed Stone 20mm', 
          type: 'Material', 
          unit: 'm3',
          rev1Val: { qty: '0.90', rate: '$35.0', total: '$31.50', waste: '10%' }, 
          rev2Val: { qty: '0.90', rate: '$35.0', total: '$31.50', waste: '10%' }, 
          diff: 'equal', 
          note: 'Unchanged' 
        },
        { 
          id: '4', 
          resource: 'Skilled Mason', 
          type: 'Labor', 
          unit: 'Day',
          rev1Val: { qty: '0.50', rate: '$45.0', total: '$22.50', waste: '-' }, 
          rev2Val: { qty: '0.55', rate: '$48.0', total: '$26.40', waste: '-' }, 
          diff: 'modified', 
          note: 'Base laborer price updated Riyadh Q2 index' 
        },
        { 
          id: '5', 
          resource: 'Waterproofing Admixture', 
          type: 'Material', 
          unit: 'Litres',
          rev1Val: null, 
          rev2Val: { qty: '5.00', rate: '$1.25', total: '$6.25', waste: '2%' }, 
          diff: 'added', 
          note: 'Added for underground foundation safety compliance parameters' 
        }
      ]
    },
    'RA-MAS-01': {
      activeLabel: 'Brick Masonry Wall',
      unit: 'm2',
      diffOverview: {
        totalDiff: '-$5.00',
        pctChange: '-11.8%',
        direction: 'down' as 'up' | 'down'
      },
      revisions: [
        { label: 'Rev A (Initial)', netRate: '$42.30', subtotal: '$33.20', overhead: '10%', profit: '5%', total: '$42.30' },
        { label: 'Rev B (Revised)', netRate: '$37.30', subtotal: '$28.20', overhead: '10%', profit: '5%', total: '$37.30' }
      ],
      rows: [
        { 
          id: '1', 
          resource: 'Solid Bricks', 
          type: 'Material', 
          unit: 'Nos',
          rev1Val: { qty: '55', rate: '0.25', total: '$13.75', waste: '5%' }, 
          rev2Val: { qty: '50', rate: '0.25', total: '$12.50', waste: '5%' }, 
          diff: 'modified', 
          note: 'Decreased waste allowance parameters code' 
        },
        { 
          id: '2', 
          resource: 'Portland Cement', 
          type: 'Material', 
          unit: 'Bag',
          rev1Val: { qty: '0.2', rate: '$8.50', total: '$1.70', waste: '3%' }, 
          rev2Val: { qty: '0.2', rate: '$8.50', total: '$1.70', waste: '3%' }, 
          diff: 'equal', 
          note: 'Unchanged' 
        },
        { 
          id: '3', 
          resource: 'Skilled Mason', 
          type: 'Labor', 
          unit: 'Day',
          rev1Val: { qty: '0.3', rate: '$45.0', total: '$13.50', waste: '-' }, 
          rev2Val: { qty: '0.2', rate: '$45.0', total: '$9.00', waste: '-' }, 
          diff: 'modified', 
          note: 'Optimized masonry productivity factors standard' 
        },
        { 
          id: '4', 
          resource: 'Helper', 
          type: 'Labor', 
          unit: 'Day',
          rev1Val: { qty: '0.2', rate: '$25.0', total: '$5.00', waste: '-' }, 
          rev2Val: { qty: '0.2', rate: '$25.0', total: '$5.00', waste: '-' }, 
          diff: 'equal', 
          note: 'Unchanged' 
        },
        { 
          id: '5', 
          resource: 'Masonry Scaffold Clamps', 
          type: 'Equipment', 
          unit: 'Sets',
          rev1Val: { qty: '2', rate: '$2.50', total: '$5.00', waste: '-' }, 
          rev2Val: null, 
          diff: 'removed', 
          note: 'Removed: Scaffold cost allocated directly under General Preliminaries bill' 
        }
      ]
    }
  };

  const currentMatch = selectedCode === 'RA-MAS-01' ? comparisonSnapshots['RA-MAS-01'] : comparisonSnapshots['RA-CONC-25'];

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Selection row bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zentrix-blue tracking-tight leading-none">Analysis Snapshot Comparison</h3>
          <p className="text-[11px] text-slate-400 mt-1">Audit changes in coefficients, added items, or deleted rows between two revision milestones.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 bg-white border border-zentrix-border p-1.5 rounded-lg shadow-sm">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase px-2">Item Code:</span>
            <select 
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="text-[11.5px] font-bold text-zentrix-blue outline-none cursor-pointer bg-transparent py-0.5 pr-2"
            >
              <option value="RA-CONC-25">RA-CONC-25 (Concrete works)</option>
              <option value="RA-MAS-01">RA-MAS-01 (Brick Masonry)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-lg">
            <select 
              value={rev1} 
              onChange={(e) => setRev1(e.target.value)}
              className="text-[11px] font-bold text-slate-655 outline-none cursor-pointer bg-white border border-slate-200 py-1 px-2.5 rounded-md"
            >
              <option value="Rev A (Initial)">Rev A (Initial)</option>
            </select>
            <span className="text-[10px] text-slate-400 font-black px-1">VS</span>
            <select 
              value={rev2} 
              onChange={(e) => setRev2(e.target.value)}
              className="text-[11px] font-bold text-slate-655 outline-none cursor-pointer bg-white border border-slate-200 py-1 px-2.5 rounded-md"
            >
              <option value="Rev B (Revised)">Rev B (Revised)</option>
            </select>
          </div>

        </div>
      </div>

      {/* METRICS SUMMARY CARD */}
      <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-indigo-50 text-indigo-600">
              <ArrowLeftRight size={16} />
            </div>
            <div>
              <h4 className="text-[14px] font-extrabold text-zentrix-blue">{currentMatch.activeLabel} Diff Overview</h4>
              <p className="text-[10.5px] text-slate-400">Unit rate calculation difference summary</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-right border-r border-[#f1f5f9] pr-5">
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">Absolute Variance</span>
              <h3 className={cn(
                "text-lg font-black",
                currentMatch.diffOverview.direction === 'up' ? "text-amber-600" : "text-emerald-600"
              )}>
                {currentMatch.diffOverview.direction === 'up' ? '+' : ''}{currentMatch.diffOverview.totalDiff}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">Ratio Fluctuation</span>
              <h3 className={cn(
                "text-lg font-black flex items-center justify-end gap-1",
                currentMatch.diffOverview.direction === 'up' ? "text-amber-600" : "text-emerald-600"
              )}>
                {currentMatch.diffOverview.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {currentMatch.diffOverview.pctChange}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* SIDE-BY-SIDE SIDEBAR CONTAINER */}
      <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-zentrix-muted uppercase tracking-widest border-b border-zentrix-border">
                <th className="px-5 py-3">Resource Block</th>
                <th className="px-5 py-3 text-center">Type</th>
                <th className="px-5 py-3 text-center bg-zinc-50 border-r border-slate-200">{rev1}</th>
                <th className="px-5 py-3 text-center bg-indigo-50/40 border-r border-slate-205">{rev2}</th>
                <th className="px-5 py-3 text-center">Calculated Net Diff</th>
                <th className="px-5 py-3">QS Action Audit comments</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {currentMatch.rows.map((row) => {
                let diffStyle = '';
                let labelStyle = '';
                let statusLabel = '';
                
                if (row.diff === 'added') {
                  diffStyle = 'bg-emerald-50/45';
                  labelStyle = 'text-emerald-700 bg-emerald-50 border border-emerald-200';
                  statusLabel = 'Added Row';
                } else if (row.diff === 'removed') {
                  diffStyle = 'bg-red-50/45';
                  labelStyle = 'text-red-700 bg-red-50 border border-red-200';
                  statusLabel = 'Removed Row';
                } else if (row.diff === 'modified') {
                  diffStyle = 'bg-amber-50/45';
                  labelStyle = 'text-amber-700 bg-amber-50 border border-amber-200';
                  statusLabel = 'Coefficient Change';
                }

                return (
                  <tr key={row.id} className={cn("text-[12.5px] hover:bg-slate-50 transition-colors", diffStyle)}>
                    
                    {/* Resource Name */}
                    <td className="px-5 py-4 font-bold text-zentrix-blue">
                      <div className="flex items-center gap-2">
                        {row.diff === 'added' && <PlusCircle size={14} className="text-emerald-500 shrink-0" />}
                        {row.diff === 'removed' && <MinusCircle size={14} className="text-red-500 shrink-0" />}
                        <div>
                          <span>{row.resource}</span>
                          <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">{row.unit} Unit</span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4 text-center">
                      <span className="text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded leading-none uppercase">
                        {row.type}
                      </span>
                    </td>

                    {/* Rev A Snapshot */}
                    <td className="px-5 py-4 bg-zinc-50 border-r border-slate-100 font-mono text-center">
                      {row.rev1Val ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-700">Cost: {row.rev1Val.total}</p>
                          <p className="text-[10px] text-slate-400 font-black">Coef: {row.rev1Val.qty} @ {row.rev1Val.rate}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-350 italic text-[11px]">— Excluded</span>
                      )}
                    </td>

                    {/* Rev B Snapshot */}
                    <td className="px-5 py-4 bg-indigo-50/20 border-r border-slate-150 font-mono text-center">
                      {row.rev2Val ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-zentrix-blue">Cost: {row.rev2Val.total}</p>
                          <p className="text-[10px] text-slate-400 font-black">Coef: {row.rev2Val.qty} @ {row.rev2Val.rate}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-350 italic text-[11px]">— Excluded</span>
                      )}
                    </td>

                    {/* Difference tag */}
                    <td className="px-5 py-4 text-center font-bold">
                      {row.diff === 'equal' ? (
                        <span className="text-zinc-400 inline-flex items-center gap-1"><Check size={11} /> Match</span>
                      ) : (
                        <span className={cn(
                          "px-2 py-0.5 text-[9.5px] font-black uppercase rounded leading-none text-center",
                          labelStyle
                        )}>
                          {statusLabel}
                        </span>
                      )}
                    </td>

                    {/* Audit logic */}
                    <td className="px-5 py-4 text-slate-500 leading-normal max-w-[280px]">
                      {row.note}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* SUMMARY HEADER COMPARATOR FOOTER */}
        <div className="bg-slate-50 border-t border-zentrix-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-4 font-mono text-xs">
            <div className="bg-white px-3 py-2 rounded border border-slate-205">
              <span className="text-slate-400 font-semibold">{rev1} Net Total:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{currentMatch.revisions[0].netRate}</p>
            </div>
            <div className="bg-[#eff6ff] px-3 py-2 rounded border border-blue-200">
              <span className="text-blue-500 font-semibold">{rev2} Net Total:</span>
              <p className="font-bold text-zentrix-blue text-sm mt-0.5">{currentMatch.revisions[1].netRate}</p>
            </div>
          </div>
          <button 
            onClick={() => alert(`Comparison sheet exported as professional Excel template.`)}
            className="px-4 py-2 border border-slate-200 hover:border-slate-355 rounded bg-white text-slate-655 font-bold text-xs cursor-pointer shadow-xs leading-none"
          >
            Export Comparison comparison.xlsx
          </button>
        </div>

      </div>

    </div>
  );
};
