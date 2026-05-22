import React, { useState } from 'react';
import { X, Calendar, FileText, Briefcase, LayoutList, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { SOTStatus, type SOT } from '../types.ts';

interface CreateSOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newSot: Partial<SOT>) => void;
}

export const CreateSOTModal = ({ isOpen, onClose, onCreate }: CreateSOTModalProps) => {
  const [formData, setFormData] = useState({
    code: `SOT/${new Date().getFullYear()}/00${Math.floor(Math.random() * 100)}`,
    description: '',
    projectId: 'proj-1', // Defaulting to first project for demo
    projectName: 'Skyline Residence Towers',
    boqId: 'boq-1',
    startDate: '',
    endDate: '',
    remarks: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      status: SOTStatus.DRAFT,
      revisionNo: 0,
      progressPercentage: 0,
      totalBudget: 0,
       // @ts-ignore - In a real app we'd generate a UUID or handle on server
      id: `sot-${Math.random().toString(36).substr(2, 9)}`,
      tasks: []
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zentrix-border"
          >
            <div className="p-6 border-b border-zentrix-border flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                  <LayoutList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zentrix-blue">Create New SOT</h2>
                  <p className="text-[12px] text-zentrix-muted">Initialize a new project schedule</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-zentrix-blue hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">SOT Code</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[13px] font-bold text-zentrix-blue focus:bg-white focus:border-primary-500 outline-none transition-all"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Project</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] font-medium text-zentrix-blue outline-none appearance-none"
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value, projectName: e.target.options[e.target.selectedIndex].text })}
                    >
                      <option value="proj-1">Skyline Residence Towers</option>
                      <option value="proj-2">Industrial Park Development</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Structure and Finishing Schedule - Phase 1"
                  className="w-full px-4 py-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] focus:border-primary-500 outline-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Planned Start</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="date"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] outline-none"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zentrix-muted uppercase tracking-wider">Planned End</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="date"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zentrix-border rounded-lg text-[13px] outline-none"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                <AlertCircle className="text-primary-600 shrink-0" size={18} />
                <p className="text-[11px] text-primary-800 leading-tight">
                  <span className="font-bold">Initial Setup:</span> After creation, you'll be redirected to the Task Planner to begin adding your work breakdown structure (WBS) and allocating BOQ items.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zentrix-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-[13px] font-bold text-zentrix-blue hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-primary-600 text-white text-[13px] font-bold rounded-lg hover:bg-primary-700 transition-all shadow-md shadow-primary-900/20"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
