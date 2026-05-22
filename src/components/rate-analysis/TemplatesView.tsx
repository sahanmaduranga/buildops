import React, { useState } from 'react';
import { 
  FolderHeart, 
  Copy, 
  Trash2, 
  Upload, 
  Layers, 
  Check, 
  ArrowRight,
  PlusCircle, 
  Cpu, 
  Calculator,
  Search
} from 'lucide-react';
import { type RateAnalysis, type Resource, ResourceType } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface TemplatesViewProps {
  analyses: RateAnalysis[];
  resources: Resource[];
  onSelectSubTab: (subTabId: string) => void;
  onImportFromTemplate: (templateCode: string) => void;
}

export const TemplatesView = ({ 
  analyses, 
  resources, 
  onSelectSubTab,
  onImportFromTemplate
}: TemplatesViewProps) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'Concrete' | 'Masonry' | 'Excavation'>('all');
  
  const mockTemplates = [
    {
      id: 'temp-1',
      code: 'TEMP-CONC-GRADE',
      name: 'Concrete Works (High Grade)',
      category: 'Concrete',
      description: 'Standard civil structural concrete works template. Exposes cements, aggregates, sand, and typical productivity output matrices.',
      unit: 'm3',
      defaultUsageCount: 22,
      resources: [
        { name: 'Portland Cement', type: ResourceType.MATERIAL, standardQty: '7.5 Bags' },
        { name: 'Fine Sand', type: ResourceType.MATERIAL, standardQty: '0.45 m3' },
        { name: 'Crushed Stone 20mm', type: ResourceType.MATERIAL, standardQty: '0.90 m3' },
        { name: 'Skilled Mason', type: ResourceType.LABOR, standardQty: '0.50 Days' },
      ]
    },
    {
      id: 'temp-2',
      code: 'TEMP-EXC-STANDARD',
      name: 'Excavation Works (Soft Rock)',
      category: 'Excavation',
      description: 'Bulk soil excavation parameter template. Includes equipment hour rate indicators, fuel adjustments, and operator factor indices.',
      unit: 'm3',
      defaultUsageCount: 14,
      resources: [
        { name: 'Excavator 20T', type: ResourceType.EQUIPMENT, standardQty: '0.05 Hours' },
        { name: 'Operator Skilled', type: ResourceType.LABOR, standardQty: '0.05 Days' },
        { name: 'Fuel Diesel', type: ResourceType.MATERIAL, standardQty: '4.50 Litres' },
      ]
    },
    {
      id: 'temp-3',
      code: 'TEMP-REINF-WORKS',
      name: 'Reinforcement Works (High Strength)',
      category: 'Concrete',
      description: 'Steel fixing and bar reinforcement works framework template. Aligns waste thresholds and labor productivity hours recursively.',
      unit: 'Ton',
      defaultUsageCount: 18,
      resources: [
        { name: 'Reinforcement Steel 20mm', type: ResourceType.MATERIAL, standardQty: '1.05 Tons' },
        { name: 'Steel Fixer', type: ResourceType.LABOR, standardQty: '2.50 Days' },
        { name: 'Binding Wire', type: ResourceType.MATERIAL, standardQty: '5.00 Kg' },
      ]
    },
    {
      id: 'temp-4',
      code: 'TEMP-MASONRY-STD',
      name: 'Standard Masonry Works (1:4 cement)',
      category: 'Masonry',
      description: 'Blockwork and masonry laying templates with typical water, cement, and mason allocation coefficients.',
      unit: 'm2',
      defaultUsageCount: 9,
      resources: [
        { name: 'Solid Bricks', type: ResourceType.MATERIAL, standardQty: '50.00 Nos' },
        { name: 'Portland Cement', type: ResourceType.MATERIAL, standardQty: '0.20 Bags' },
        { name: 'Skilled Mason', type: ResourceType.LABOR, standardQty: '0.20 Days' },
      ]
    }
  ];

  const filtered = mockTemplates.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase()) ||
                          item.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zentrix-blue tracking-tight leading-none">Standard Rate Templates Repository</h3>
          <p className="text-[11px] text-slate-400 mt-1">Accelerate estimation with master rate analysis templates designed for recurring operations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert('New template wizard opened. Create from current active rate builder.')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs leading-none transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={14} /> Create New Rate Template
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS & QUICK SEARCH */}
      <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4.5">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.75 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white transition-all shadow-inner text-slate-700 focus:border-primary-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'Concrete', 'Excavation', 'Masonry'].map((cat: any) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold leading-none cursor-pointer transition-all border",
                activeCategory === cat 
                  ? "bg-primary-50 text-primary-600 border-primary-200" 
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              )}
            >
              {cat === 'all' ? 'All Classes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* BENTO GRID DEFAULT WORK TEMPLATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((t) => (
          <div 
            key={t.id} 
            className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FolderHeart size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zentrix-blue text-[13.5px] leading-tight group-hover:text-primary-600 transition-colors">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{t.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] bg-slate-100 px-2 py-0.5 rounded-full font-bold uppercase text-slate-500">{t.unit}</span>
                </div>
              </div>

              <p className="text-[12px] text-slate-500 leading-relaxed mb-4">{t.description}</p>

              {/* Resource composition lines snippet */}
              <div className="space-y-2 mb-6">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block mb-1">Standard Resource Formula:</span>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1.5 font-mono text-xs shadow-inner">
                  {t.resources.map((res, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">{res.name}</span>
                      <span className="text-[10px] text-zinc-400 font-bold">{res.standardQty} ({res.type[0]})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
              <span className="text-[11px] text-slate-400 font-bold">Frequently used {t.defaultUsageCount} times</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => {
                    onImportFromTemplate(t.code);
                    onSelectSubTab('rate-analysis-builder');
                  }}
                  className="px-3.5 py-1.75 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer leading-none shadow-sm"
                >
                  Load Template <ArrowRight size={12} />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 italic">
            No templates matching search criteria.
          </div>
        )}
      </div>

    </div>
  );
};
