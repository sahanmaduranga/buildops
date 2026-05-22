import React from 'react';
import { Plus, MapPin, Search, MoreVertical, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.ts';

interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

const MOCK_REGIONS: Region[] = [
  { id: '1', name: 'Riyadh Central', code: 'RIY-C', description: 'Central region covering the capital city.', status: 'Active' },
  { id: '2', name: 'Jeddah Coastal', code: 'JED-W', description: 'Western coastal region and port areas.', status: 'Active' },
  { id: '3', name: 'Dammam Eastern', code: 'DAM-E', description: 'Eastern province and industrial hubs.', status: 'Active' },
  { id: '4', name: 'NEOM District', code: 'NEO-N', description: 'Northern development zone.', status: 'Active' },
];

export const RegionManagement = () => {
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [newRegion, setNewRegion] = React.useState({ name: '', code: '', description: '' });

  const handleAddRegion = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding region:', newRegion);
    setIsAddPanelOpen(false);
    setNewRegion({ name: '', code: '', description: '' });
  };

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] text-zentrix-muted font-medium mb-1">Settings / Master Data / Logistics</div>
          <h2 className="text-xl font-semibold text-zentrix-blue leading-tight">Region Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddPanelOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-primary-700 transition-all shadow-sm"
          >
            <Plus size={16} /> Add Region
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zentrix-border rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="p-3 px-4 border-b border-zentrix-border flex items-center justify-between bg-white">
          <div className="relative flex items-center bg-slate-50 px-3 py-1.5 rounded-md w-64 text-zentrix-muted border border-slate-100">
            <Search size={14} className="mr-2 opacity-60" />
            <input 
              type="text" 
              placeholder="Search regions..."
              className="bg-transparent border-none text-[13px] w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-zentrix-gray border-b border-zentrix-border z-10">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Region Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zentrix-muted uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_REGIONS.map((region) => (
                <tr key={region.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3 text-[13px] font-mono text-primary-600">{region.code}</td>
                  <td className="px-5 py-3 text-[13px] font-medium text-zentrix-blue">{region.name}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500 max-w-xs truncate">{region.description}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-50 text-green-600">
                      {region.status}
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
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logistics / Master Data</div>
                <h3 className="text-[15px] font-bold text-zentrix-blue">Add New Region</h3>
              </div>
              <button onClick={() => setIsAddPanelOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-300">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddRegion} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Region Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. RIY-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                    value={newRegion.code}
                    onChange={(e) => setNewRegion({...newRegion, code: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Region Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Central Riyadh Area"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                    value={newRegion.name}
                    onChange={(e) => setNewRegion({...newRegion, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                    value={newRegion.description}
                    onChange={(e) => setNewRegion({...newRegion, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-zentrix-border flex gap-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-md text-[13px] font-medium">Create Region</button>
                <button type="button" onClick={() => setIsAddPanelOpen(false)} className="px-4 border border-zentrix-border text-slate-600 py-2 rounded-md text-[13px] font-medium">Cancel</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
};
