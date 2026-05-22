import React, { useState } from 'react';
import { INITIAL_CATEGORIES, Category } from './resourceMockData.ts';
import { Plus, Folder, FolderOpen, Edit, Archive, FolderSymlink, MoreVertical, Layers, ChevronRight, Play, ChevronDown, CheckCircle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState<{
    id: string;
    code: string;
    name: string;
    parentId: string | null;
    description: string;
    status: 'Active' | 'Archived';
  }>({
    id: '',
    code: '',
    name: '',
    parentId: null,
    description: '',
    status: 'Active'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['cat-mat', 'cat-lab', 'cat-eqp']);

  const toggleNode = (id: string) => {
    if (expandedNodes.includes(id)) {
      setExpandedNodes(expandedNodes.filter(n => n !== id));
    } else {
      setExpandedNodes([...expandedNodes, id]);
    }
  };

  const handleOpenAdd = (parentId: string | null = null) => {
    setIsEditing(false);
    setModalForm({
      id: '',
      code: `CAT-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: '',
      parentId,
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
      parentId: cat.parentId,
      description: cat.description,
      status: cat.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setCategories(prev => prev.map(c => c.id === modalForm.id ? { ...c, ...modalForm } : c));
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        code: modalForm.code,
        name: modalForm.name,
        parentId: modalForm.parentId,
        description: modalForm.description,
        status: modalForm.status
      };
      setCategories(prev => [...prev, newCat]);
    }
    setIsModalOpen(false);
  };

  const handleArchive = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: 'Archived' as const } : c));
  };

  const handleMoveUp = (idx: number, parentId: string | null) => {
    // Reordering within sibling scope
    const group = categories.filter(c => c.parentId === parentId);
    if (idx === 0) return;
    
    const item = group[idx];
    const prevItem = group[idx - 1];
    
    // Find absolute indexes in main state
    const actualIdx = categories.findIndex(c => c.id === item.id);
    const actualPrevIdx = categories.findIndex(c => c.id === prevItem.id);
    
    const copy = [...categories];
    copy[actualIdx] = prevItem;
    copy[actualPrevIdx] = item;
    setCategories(copy);
  };

  // Build root nodes
  const rootCategories = categories.filter(c => c.parentId === null);

  // Render Category Node Recursive Helper
  const renderCategoryNode = (cat: Category, level: number = 0) => {
    const children = categories.filter(c => c.parentId === cat.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.includes(cat.id);
    const siblings = categories.filter(c => c.parentId === cat.parentId);
    const siblingIdx = siblings.findIndex(s => s.id === cat.id);

    return (
      <div key={cat.id} className="space-y-1">
        <div 
          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Label Area */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button 
              onClick={() => hasChildren && toggleNode(cat.id)}
              className={`p-1 hover:bg-slate-100 rounded text-slate-400 ${hasChildren ? 'cursor-pointer' : 'opacity-0'}`}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className="text-primary-600 rounded">
              {hasChildren ? (isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />) : <Layers size={14} className="text-slate-400" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#1a2e40] text-sm">{cat.name}</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-1 py-0.2 rounded border">
                  {cat.code}
                </span>
                <span className={`text-[8px] px-1.5 py-0.2 rounded font-black font-mono leading-none ${cat.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5" title={cat.description}>{cat.description || 'No special category blueprint described.'}</p>
            </div>
          </div>

          {/* Controls Area */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Reorder Buttons */}
            <button 
              disabled={siblingIdx === 0}
              onClick={() => handleMoveUp(siblingIdx, cat.parentId)}
              className="p-1 hover:bg-slate-50 text-slate-400 disabled:opacity-30 rounded text-xs"
              title="Move Up"
            >
              ▲
            </button>

            <button 
              onClick={() => handleOpenAdd(cat.id)}
              className="px-2 py-1 text-[11px] hover:bg-primary-50 text-primary-600 rounded flex items-center gap-0.5 font-bold"
              title="Add subcategory"
            >
              <Plus size={11} /> Sub
            </button>
            <button 
              onClick={() => handleOpenEdit(cat)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
              title="Edit category info"
            >
              <Edit size={12} />
            </button>
            {cat.status === 'Active' && (
              <button 
                onClick={() => handleArchive(cat.id)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Archive category"
              >
                <Archive size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 animate-slide-up">
            {children.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
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
            Build and order project division catalogs. Subcategories link with BOQ workpackages and Rate Analyses structures.
          </p>
        </div>
        <button 
          onClick={() => handleOpenAdd(null)}
          className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary-700 transition-all shadow cursor-pointer"
        >
          <Plus size={14} /> Add Master Category
        </button>
      </div>

      {/* Main categories listing tree container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {rootCategories.map(cat => renderCategoryNode(cat, 0))}
      </div>

      {/* CREATE / EDIT CATEGORY DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[80]" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[90] flex flex-col overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-[#1e293b]">
                  {isEditing ? 'Configure Category' : 'Create Division Category'}
                </h4>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-4 space-y-4 text-xs">
                {/* Parent Selection display */}
                {modalForm.parentId && (
                  <div className="p-2.5 bg-slate-55 border border-slate-100 rounded-lg text-slate-500 font-medium">
                    Parent Node ID: <span className="font-mono text-primary-600 font-bold">{modalForm.parentId}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Category Code</label>
                  <input 
                    type="text"
                    required
                    value={modalForm.code}
                    onChange={(e) => setModalForm({ ...modalForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-primary-500 focus:outline-none"
                    placeholder="e.g. CAT-CM"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Category Name</label>
                  <input 
                    type="text"
                    required
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none font-bold text-slate-800"
                    placeholder="e.g. Concrete mix"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Description</label>
                  <textarea 
                    value={modalForm.description}
                    onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                    className="w-full h-16 px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="Brief notes..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Status</label>
                  <select 
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save Category
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 border border-slate-200 hover:bg-slate-50 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
