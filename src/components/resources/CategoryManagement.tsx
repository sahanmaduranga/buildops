import React, { useState, useEffect } from 'react';
import { Category } from './resourceMockData.ts';
import { Plus, Edit, Archive, Layers, Trash2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_FLAT_CATEGORIES: Category[] = [
  { id: 'cat-cem', code: 'CAT-CEM', name: 'Cement', parentId: null, description: 'Portland cement and structural mixes', status: 'Active' },
  { id: 'cat-st', code: 'CAT-ST', name: 'Steel', parentId: null, description: 'Reinforcement bars, beams, and rods', status: 'Active' },
  { id: 'cat-agg', code: 'CAT-AGG', name: 'Aggregate', parentId: null, description: 'Fine sand, gravel, and crushed stone', status: 'Active' },
  { id: 'cat-sk', code: 'CAT-SK', name: 'Skilled', parentId: null, description: 'Masons, electricians, welders, and carpenters', status: 'Active' },
  { id: 'cat-usk', code: 'CAT-USK', name: 'Unskilled', parentId: null, description: 'General helpers and site cleanup crews', status: 'Active' },
  { id: 'cat-hvy', code: 'CAT-HVY', name: 'Heavy Machinery', parentId: null, description: 'Excavators, cranes, bulk dump trucks', status: 'Active' },
  { id: 'cat-mat', code: 'CAT-MAT', name: 'Materials', parentId: null, description: 'Bulk physical building materials', status: 'Active' },
  { id: 'cat-lab', code: 'CAT-LAB', name: 'Labor', parentId: null, description: 'Human resources and construction crews', status: 'Active' },
  { id: 'cat-eqp', code: 'CAT-EQP', name: 'Equipment', parentId: null, description: 'Yellow machinery, power tools, and fuel', status: 'Active' },
];

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('resource_categories_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_FLAT_CATEGORIES;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState<{
    id: string;
    code: string;
    name: string;
    description: string;
    status: 'Active' | 'Archived';
  }>({
    id: '',
    code: '',
    name: '',
    description: '',
    status: 'Active'
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('resource_categories_list', JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setModalForm({
      id: '',
      code: `CAT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: '',
      description: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setIsEditing(true);
    setModalForm({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description,
      status: cat.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setCategories(prev => prev.map(c => c.id === modalForm.id ? { 
        ...c, 
        code: modalForm.code, 
        name: modalForm.name, 
        description: modalForm.description, 
        status: modalForm.status 
      } : c));
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        code: modalForm.code.trim(),
        name: modalForm.name.trim(),
        parentId: null,
        description: modalForm.description.trim(),
        status: modalForm.status
      };
      setCategories(prev => [...prev, newCat]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleArchive = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: 'Archived' as const } : c));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...categories];
    const temp = copy[idx];
    copy[idx] = copy[idx - 1];
    copy[idx - 1] = temp;
    setCategories(copy);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === categories.length - 1) return;
    const copy = [...categories];
    const temp = copy[idx];
    copy[idx] = copy[idx + 1];
    copy[idx + 1] = temp;
    setCategories(copy);
  };

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in text-[13px] text-slate-600">
      
      {/* Header Panel */}
      <div className="p-4 bg-slate-50 border border-slate-250 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <span>🗂️ Enterprise Category Registry</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Build and arrange resource categories. Categories represent major classifications for material catalog indexes, crew structures, and equipment types.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary-700 transition-all shadow cursor-pointer"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Main Categories Flat List View */}
      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {categories.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <AlertCircle size={36} className="text-slate-300 mb-2" />
            <p className="font-semibold text-xs">No active categories found.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click the "Add Category" button to define your flat category registry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-3 w-32">Code</th>
                  <th className="px-5 py-3">Category Name</th>
                  <th className="px-5 py-3 max-w-xs">Description</th>
                  <th className="px-5 py-3 w-28">Status</th>
                  <th className="px-5 py-3 w-24">Order</th>
                  <th className="px-5 py-3 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                        {cat.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-800 font-bold">
                      {cat.name}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-[11px] truncate max-w-xs" title={cat.description}>
                      {cat.description || <span className="italic">No description specified.</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[9px] px-2 py-0.2 rounded font-black uppercase tracking-wide border leading-tight ${cat.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-550 border-slate-200'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-20 rounded transition"
                          title="Move up in priority"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === categories.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-20 rounded transition"
                          title="Move down in priority"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="px-2 py-1 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded text-slate-500 transition font-bold"
                          title="Edit Category"
                        >
                          Edit
                        </button>
                        {cat.status === 'Active' ? (
                          <button
                            onClick={() => handleArchive(cat.id)}
                            className="px-2 py-1 text-xs hover:bg-amber-50 hover:text-amber-700 rounded text-slate-505 transition font-bold"
                            title="Archive Category"
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-2 py-1 text-xs hover:bg-red-50 hover:text-red-605 rounded text-red-500 transition font-bold"
                            title="Delete Category Permanent"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CATEGORY DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl z-[110] flex flex-col overflow-hidden text-xs text-slate-600"
            >
              <div className="p-4 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[#0f172a] text-sm">
                    {isEditing ? 'Configure Category' : 'Create Division Category'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define category properties for classification</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Category Code</label>
                  <input 
                    type="text"
                    required
                    value={modalForm.code}
                    onChange={(e) => setModalForm({ ...modalForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-primary-500 focus:outline-none font-bold text-slate-800"
                    placeholder="e.g. CAT-CM"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Category Name</label>
                  <input 
                    type="text"
                    required
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-extrabold text-slate-800 text-xs"
                    placeholder="e.g. Concrete mix"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Description</label>
                  <textarea 
                    value={modalForm.description}
                    onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                    className="w-full h-16 px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none font-medium"
                    placeholder="Brief notes about this category usage..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide text-[10px]">Status</label>
                  <select 
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-500 font-bold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors shadow"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
