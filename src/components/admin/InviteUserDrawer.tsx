import React, { useState } from 'react';
import { Mail, Shield, SquarePlus, Building, X, UserPlus, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { cn } from '../../lib/utils.ts';

interface InviteUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteUserDrawer = ({ isOpen, onClose }: InviteUserDrawerProps) => {
  const { inviteUser, roles } = useAuth();
  const { projects } = useProject();

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('role-view');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please input a valid enterprise email address to dispatch.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('The email address format provided is invalid.');
      return;
    }

    inviteUser(email, selectedRole, selectedProjects);
    
    // Reset form
    setEmail('');
    setSelectedRole('role-view');
    setSelectedProjects([]);
    onClose();
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 z-40 animate-fade-in" onClick={onClose} />
      
      {/* Slide Drawer container */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l border-slate-200 z-50 flex flex-col font-sans text-[13px] shadow-2xl animate-slide-left">
        
        {/* Header Section */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <UserPlus size={16} />
            </div>
            <div>
              <h4 className="font-extrabold text-zentrix-blue leading-none text-sm">Spread Invitation</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Tenant User Registries Onboarding</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Workspace */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} className="text-slate-400" /> Enterprise Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. engineer.khalid@buildops.co"
              className="py-2.5 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 w-full font-semibold shadow-sm"
              id="invite-email-input"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              An invitation token with a workspace sign-on key will be dispatched to this address.
            </p>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} className="text-slate-400" /> Default Tenant Access Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="py-2.5 px-3.5 border border-slate-200 focus:outline-none focus:border-primary-500 rounded-xl w-full font-bold bg-white text-slate-700 shadow-sm"
              id="invite-role-select"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              The overarching global role level assigned before specific project assignments are loaded.
            </p>
          </div>

          {/* Projects access selection */}
          <div className="space-y-2">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building size={12} className="text-slate-400" /> Authorized Project Access Scope
            </label>
            
            <div className="border border-slate-250 border-slate-200 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-slate-100 shadow-inner">
              {projects.map((p) => {
                const isSelected = selectedProjects.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleProject(p.id)}
                    className={cn(
                      "py-2 px-3 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 text-xs font-semibold text-slate-700",
                      isSelected ? "bg-primary-500/[0.01]" : ""
                    )}
                  >
                    <div className="flex items-center gap-2 max-w-[80%] truncate">
                      <span className="bg-slate-100 text-[9px] font-mono font-black border uppercase px-1 py-0.5 rounded leading-none text-slate-500">{p.code}</span>
                      <span className="truncate">{p.name}</span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              You can override and set tailored site-roles inside project settings subsequent to invitation acceptance.
            </p>
          </div>

          {/* Security details block */}
          <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-xl flex gap-2 text-xs text-orange-850 mt-4 leading-normal font-medium">
            <Info size={14} className="text-orange-600 shrink-0 mt-0.5" />
            <p>
              <strong>Policy Guideline:</strong> Invitations persist validation layers for a maximum period of 7 days before automated expiration.
            </p>
          </div>

        </form>

        {/* Footer controls */}
        <div className="p-4 border-t bg-slate-50 border-slate-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-350 border-slate-200 rounded-xl leading-none transition-colors cursor-pointer"
          >
            Go Back
          </button>
          
          <button
            type="button"
            onClick={handleFormSubmit}
            className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl leading-none transition-all cursor-pointer shadow-md"
          >
            Dispatch Invitation
          </button>
        </div>

      </div>
    </>
  );
};
export default InviteUserDrawer;
