import React, { useState } from 'react';
import { X, Search, FileText, Check, Plus, Filter, Info, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { MOCK_BOQ } from '../mockData.ts';
import { type BOQItem } from '../types.ts';

interface SelectionState {
  [id: string]: {
    qty: number;
    error?: string;
  };
}

interface BOQSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selections: { item: BOQItem, allocatedQty: number }[]) => void;
}

export const BOQSelectionModal = ({ isOpen, onClose, onSelect }: BOQSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selections, setSelections] = useState<SelectionState>({});
  const [expandedIds, setExpandedIds] = useState<string[]>(['bill-1', 'bill-2', 'bill-3']);

  const selectedIds = Object.keys(selections);

  const filteredBOQ = MOCK_BOQ.filter(item => 
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelect = (item: BOQItem) => {
    if (item.type !== 'ITEM') return;
    
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[item.id]) {
        delete newSelections[item.id];
      } else {
        newSelections[item.id] = { qty: item.quantity }; // Default to full quantity
      }
      return newSelections;
    });
  };

  const handleQtyChange = (id: string, value: string, max: number) => {
    const qty = parseFloat(value) || 0;
    setSelections(prev => ({
      ...prev,
      [id]: {
        qty,
        error: qty > max ? `Over-allocated by ${qty - max}` : undefined
      }
    }));
  };

  const hasErrors = Object.values(selections).some((s: any) => !!s.error);

  const handleConfirm = () => {
    const result = selectedIds.map(id => {
      const item = MOCK_BOQ.find(b => b.id === id)!;
      const selection = selections[id];
      return {
        item,
        allocatedQty: selection ? selection.qty : item.quantity
      };
    });
    onSelect(result);
    onClose();
  };

  const renderBOQItem = (item: BOQItem, level: number = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const children = MOCK_BOQ.filter(b => b.parentId === item.id);
    const hasChildren = children.length > 0;
    const isSelected = !!selections[item.id];
    const selection = selections[item.id];

    return (
      <React.Fragment key={item.id}>
        <div 
          className={cn(
            "flex flex-col py-2 px-3 hover:bg-slate-50 cursor-pointer rounded-lg transition-all border-l-2 mb-1",
            isSelected ? "bg-primary-50 border-primary-500 shadow-sm" : "border-transparent"
          )}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => {
            if (hasChildren) toggleExpand(item.id);
            else toggleSelect(item);
          }}
        >
          <div className="flex items-center">
            <div className="w-5 h-5 flex items-center justify-center text-slate-400 mr-1">
              {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
            </div>
            
            {item.type === 'ITEM' && (
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors",
                isSelected ? "bg-primary-600 border-primary-600 text-white" : "border-slate-300 bg-white"
              )}>
                {isSelected && <Check size={10} strokeWidth={4} />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zentrix-muted font-bold tracking-tight">{item.code}</span>
                <span className={cn(
                  "text-[12px] truncate",
                  item.type === 'BILL' ? "font-bold text-zentrix-blue" : 
                  item.type === 'SECTION' ? "font-bold text-slate-700" :
                  "font-medium text-slate-600"
                )}>
                  {item.description}
                </span>
              </div>
              {item.type === 'ITEM' && (
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zentrix-muted font-medium">
                  <span>BOQ Total: <span className="font-bold text-slate-700">{item.quantity} {item.unit}</span></span>
                  <span className="text-zentrix-blue font-bold">Rate: ${item.rate}</span>
                </div>
              )}
            </div>

            {isSelected && item.type === 'ITEM' && (
              <div className="flex items-center gap-4 ml-4" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col">
                   <label className="text-[9px] font-bold text-zentrix-muted uppercase mb-1">Allocated Qty</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        className={cn(
                          "w-24 px-2 py-1 border rounded text-[12px] font-bold outline-none",
                          selection?.error ? "border-red-500 bg-red-50 text-red-600" : "border-slate-200 focus:border-primary-500"
                        )}
                        value={selection?.qty || 0}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.quantity)}
                      />
                      <span className="text-[10px] font-bold text-zentrix-muted">{item.unit}</span>
                   </div>
                </div>
                <div className="flex flex-col min-w-[80px]">
                   <label className="text-[9px] font-bold text-zentrix-muted uppercase mb-1 text-right">Remaining</label>
                   <span className={cn(
                     "text-[12px] font-bold text-right",
                     selection?.error ? "text-red-600" : "text-green-600"
                   )}>
                     {(item.quantity - (selection?.qty || 0)).toFixed(2)}
                   </span>
                </div>
              </div>
            )}
          </div>
          
          {selection?.error && (
            <div className="mt-2 ml-10 p-2 bg-red-100/50 border border-red-100 rounded flex items-center gap-2 text-red-600 text-[10px] font-bold">
               <AlertTriangle size={12} />
               {selection.error}
            </div>
          )}
        </div>
        {isExpanded && children.map(child => renderBOQItem(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-zentrix-border flex flex-col"
          >
            <div className="p-5 border-b border-zentrix-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zentrix-blue">Allocate Tasks from BOQ</h2>
                  <p className="text-[12px] text-zentrix-muted">Specify quantities and create tasks directly from bill items</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-zentrix-blue hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-zentrix-border flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search BOQ items..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-zentrix-border rounded-lg text-[13px] outline-none focus:border-primary-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-zentrix-border rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm">
                <Filter size={14} />
                Filters
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-1">
              {searchTerm ? 
                filteredBOQ.map(item => renderBOQItem(item)) :
                MOCK_BOQ.filter(b => !b.parentId).map(item => renderBOQItem(item))
              }
            </div>

            <div className="p-4 bg-slate-50 border-t border-zentrix-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primary-700">
                  <Info size={16} />
                  <span className="text-[12px] font-bold">{selectedIds.length} items configured</span>
                </div>
                {hasErrors && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                     <AlertTriangle size={14} />
                     <span className="text-[11px] font-bold uppercase tracking-wider">Over-allocation detected</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:underline"
                >
                  Cancel
                </button>
                <button
                  disabled={selectedIds.length === 0 || hasErrors}
                  onClick={handleConfirm}
                  className={cn(
                    "px-8 py-2 text-[13px] font-bold rounded-lg transition-all shadow-md",
                    (selectedIds.length > 0 && !hasErrors)
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-900/20" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  Confirm & Create Tasks
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
