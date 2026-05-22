import React from 'react';
import { Plus, Layers, Search, MoreVertical, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { ResourceType } from '../types.ts';

interface TypeConfig {
  id: string;
  name: string;
  code: string;
  color: string;
  status: 'Active' | 'Inactive';
}

const MOCK_TYPES: TypeConfig[] = [
  { id: '1', name: 'Material', code: 'MAT', color: 'bg-blue-500', status: 'Active' },
  { id: '2', name: 'Labor', code: 'LAB', color: 'bg-amber-500', status: 'Active' },
  { id: '3', name: 'Equipment', code: 'EQU', color: 'bg-emerald-500', status: 'Active' },
  { id: '4', name: 'Subcontractor', code: 'SUB', color: 'bg-indigo-500', status: 'Active' },
  { id: '5', name: 'Consumables', code: 'CON', color: 'bg-slate-500', status: 'Active' },
];

export const ResourceTypeManagement = () => {
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [newType, setNewType] = React.useState({ name: '', code: '' });

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding resource type:', newType);
    setIsAddPanelOpen(false);
    setNewType({ name: '', code: '' });
  };

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] text-zentrix-muted font-medium mb-1">Settings / Master Data / Classification</div>
          <h2 className="text-xl font-semibold text-zentrix-blue leading-tight">Resource Classification</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddPanelOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-primary-700 transition-all shadow-sm"
          >
            <Plus size={16} /> Add Type
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zentrix-border rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="p-3 px-4 border-b border-zentrix-border flex items-center justify-between bg-white">
          <div className="relative flex items-center bg-slate-50 px-3 py-1.5 rounded-md w-64 text-zentrix-muted border border-slate-100">
            <Search size={14} className="mr-2 opacity-60" />
            <input 
              type="text" 
              placeholder="Search types..."
              className="bg-transparent border-none text-[13px] w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-zentrix-gray border-b border-zentrix-border z-10">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Type Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Classification Code</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_TYPES.map((type) => (
                <tr key={type.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", type.color)} />
                      <span className="text-[13px] font-medium text-zentrix-blue">{type.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-mono text-slate-500 font-bold uppercase tracking-wider">{type.code}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-50 text-green-600">
                      {type.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <MoreVertical size={14} className="text-slate-300 group-hover:text-zentrix-blue transition-colors ml-auto cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddPanelOpen && (
        <>
          <div className="fixed inset-0 bg-zentrix-blue/10 z-40 backdrop-blur-[1px]" onClick={() => setIsAddPanelOpen(false)} />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="fixed top-0 right-0 w-[320px] h-full bg-white border-l border-zentrix-border z-50 flex flex-col pt-14 md:pt-0 shadow-2xl"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Standard / Master Data</div>
                <h3 className="text-[15px] font-bold text-zentrix-blue">Add Resource Type</h3>
              </div>
              <button onClick={() => setIsAddPanelOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-300">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddType} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Subcontractor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classification Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. SUB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                    value={newType.code}
                    onChange={(e) => setNewType({...newType, code: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-zentrix-border flex gap-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-md text-[13px] font-medium">Create Type</button>
                <button type="button" onClick={() => setIsAddPanelOpen(false)} className="px-4 border border-zentrix-border text-slate-600 py-2 rounded-md text-[13px] font-medium">Cancel</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
};
