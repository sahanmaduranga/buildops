import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { ProjectDocument } from '../types.ts';
import { 
  FileText, 
  Folder, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Upload, 
  ChevronRight, 
  Info,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  X,
  PlusCircle,
  Check,
  CheckCircle2
} from 'lucide-react';

export const ProjectDocuments = () => {
  const { currentProject, projectDocuments, addProjectDocument } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isOpenUploadModal, setIsOpenUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Upload state
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<'Drawings' | 'Contracts' | 'BOQ' | 'SOT' | 'Site Photos' | 'QA/QC' | 'Daily Logs' | 'Correspondence'>('Drawings');
  const [docSize, setDocSize] = useState('2.4 MB');
  const [docVersion, setDocVersion] = useState('1.0');

  if (!currentProject) {
    return (
      <div className="bg-white border border-zentrix-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
        <Folder size={48} className="text-slate-300 mb-2" />
        <h4 className="text-md font-bold text-zentrix-blue">No Workspace Active</h4>
        <p className="text-slate-400 text-xs">Please select an active project to view document vaults.</p>
      </div>
    );
  }

  const docs = projectDocuments.filter(d => d.projectId === currentProject.id);

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { label: 'All Vaults', id: 'all', count: docs.length },
    { label: 'Engineering Drawings', id: 'Drawings', count: docs.filter(d => d.category === 'Drawings').length },
    { label: 'Contracts & SLA', id: 'Contracts', count: docs.filter(d => d.category === 'Contracts').length },
    { label: 'BOQ Sheets', id: 'BOQ', count: docs.filter(d => d.category === 'BOQ').length },
    { label: 'Planning & Schedule', id: 'SOT', count: docs.filter(d => d.category === 'SOT').length },
    { label: 'Photos History', id: 'Site Photos', count: docs.filter(d => d.category === 'Site Photos').length },
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    addProjectDocument({
      projectId: currentProject.id,
      name: docName,
      category: docCategory,
      version: docVersion,
      size: docSize,
      fileType: docName.endsWith('.xlsx') || docName.endsWith('.xls') ? 'xlsx' : 'pdf'
    });

    setIsOpenUploadModal(false);
    setDocName('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDocName(file.name);
      setDocSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 animate-fade-in text-[13px] text-slate-600">
      
      {/* Category Folders Sidebar */}
      <div className="flex flex-col gap-3.5">
        <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 font-mono">DMS Classifications</h4>
        <div className="bg-white border border-zentrix-border rounded-xl p-3 flex flex-col gap-1 shadow-sm">
          {categories.map((c) => (
            <button 
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${categoryFilter === c.id ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <div className="flex items-center gap-2">
                <Folder size={15} className={categoryFilter === c.id ? 'text-primary-600' : 'text-slate-400'} />
                <span className="truncate">{c.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryFilter === c.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                {c.count}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-slate-50 border border-zentrix-border rounded-xl p-4 flex gap-2 text-[11px] text-slate-400 leading-relaxed shadow-sm">
          <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <span>This vault enforces EDMS workflows, automatically locking and tagging files with project_id tags for legal and cost variation records.</span>
        </div>
      </div>

      {/* Main Files Directory */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Search Header */}
        <div className="bg-white border border-zentrix-border rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search drawings, specs, contracts sheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 w-full border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <button 
            onClick={() => setIsOpenUploadModal(true)}
            className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg leading-none transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto"
          >
            <Upload size={14} />
            Upload Document
          </button>
        </div>

        {/* Directory Files List */}
        <div className="bg-white border border-zentrix-border rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-zentrix-border text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Document Title</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4 text-center">Revision</th>
                  <th className="py-2.5 px-4">Size</th>
                  <th className="py-2.5 px-4 font-normal">Uploaded By</th>
                  <th className="py-2.5 px-4 text-center font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredDocs.map((dw) => (
                  <tr key={dw.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium flex items-center gap-3">
                      {dw.fileType === 'xlsx' ? (
                        <FileSpreadsheet size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <FileText size={18} className="text-red-500 shrink-0" />
                      )}
                      <div className="font-bold text-slate-700 truncate max-w-[240px]" title={dw.name}>
                        {dw.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 font-bold rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                        {dw.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-zentrix-blue">
                      Rev {dw.version}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono font-bold">{dw.size}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-600">{dw.uploadedBy}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dw.uploadedAt.split('T')[0]}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-slate-400 hover:text-primary-600 transition-colors" title="Download draft copy">
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No files loaded inside this folder.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DMS File Upload Simulator Area Modal */}
      {isOpenUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-zentrix-border animate-fade-in text-[13px] text-slate-600">
            <div className="px-5 py-4 bg-slate-50 border-b border-zentrix-border flex items-center justify-between">
              <h3 className="font-bold text-zentrix-blue">Upload Document to Project Container</h3>
              <button onClick={() => setIsOpenUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              {/* Drag Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload size={32} className="text-slate-400" />
                  <p className="font-bold text-slate-700">Drag & drop construction files here</p>
                  <p className="text-[11px] text-slate-400">Supports PDF drawings, Excel sheets, contract docs up to 150MB</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Document / Revision Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Electrical_Plan_Rev3.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">DMS Category</label>
                  <select 
                    value={docCategory}
                    onChange={(e: any) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="Drawings">Engineering Drawings</option>
                    <option value="Contracts">Contracts & SLAs</option>
                    <option value="BOQ">BOQ sheet</option>
                    <option value="SOT">SOT Planning</option>
                    <option value="Site Photos">Site Photo Log</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Revision Identifier</label>
                  <input 
                    type="text" 
                    value={docVersion}
                    onChange={(e) => setDocVersion(e.target.value)}
                    placeholder="e.g. 1.0"
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <CheckCircle2 size={15} /> Save Document Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
