import React, { useState } from 'react';
import { Project } from '../../types.ts';
import { IAMUser, IAMRole } from '../../mockIAMData.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { Building, ShieldAlert, KeyRound, Plus, Trash2, Calendar, User, ToggleLeft, Shield, Sparkles, Check } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface ProjectAccessGridProps {
  users: IAMUser[];
  roles: IAMRole[];
  projects: Project[];
}

export const ProjectAccessGrid = ({ users, roles, projects }: ProjectAccessGridProps) => {
  const { assignUserProjectRole, removeUserProjectAccess, updateUser } = useAuth();
  const [selectedProjIndex, setSelectedProjIndex] = useState(0);

  // Expose append states
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRoleId, setNewMemberRoleId] = useState('role-view');
  const [newMemberExpiry, setNewMemberExpiry] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const activeProj = projects[selectedProjIndex] || projects[0];

  if (!activeProj) {
    return (
      <div className="py-12 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 font-sans text-xs">
        No active projects available in workspace.
      </div>
    );
  }

  // Find all user records who have active or defined access to this specific project
  const assignedUsers = users.filter(u => u.projectAccess.some(pa => pa.projectId === activeProj.id));

  // Find users who DO NOT have access to this project yet (for appending members)
  const nonAssignedUsers = users.filter(u => !u.projectAccess.some(pa => pa.projectId === activeProj.id));

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUserId) return;

    // Execute assignment
    assignUserProjectRole(newMemberUserId, activeProj.id, newMemberRoleId);

    // Optional expiry date set
    if (newMemberExpiry) {
      const targetUser = users.find(u => u.id === newMemberUserId);
      if (targetUser) {
        const uAccess = targetUser.projectAccess.map(pa => {
          if (pa.projectId === activeProj.id) {
            return { ...pa, expiryDate: newMemberExpiry };
          }
          return pa;
        });
        updateUser(newMemberUserId, { projectAccess: uAccess });
      }
    }

    setNewMemberUserId('');
    setNewMemberRoleId('role-view');
    setNewMemberExpiry('');
    setIsAddingMember(false);
    triggerToast('Project access rule set complete.');
  };

  const handleRoleChangeInGrid = (userId: string, targetRoleId: string) => {
    assignUserProjectRole(userId, activeProj.id, targetRoleId);
    triggerToast('Project role level modified.');
  };

  const handleExpiryChangeInGrid = (userId: string, date: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const uAccess = targetUser.projectAccess.map(pa => {
      if (pa.projectId === activeProj.id) {
        return { ...pa, expiryDate: date || undefined };
      }
      return pa;
    });

    updateUser(userId, { projectAccess: uAccess });
    triggerToast('Rule expiry updated.');
  };

  const handleRemoveMemberAccess = (userId: string) => {
    if (confirm('Revoke access for this user in the active project? The user will immediately lose all associated privileges.')) {
      removeUserProjectAccess(userId, activeProj.id);
      triggerToast('Revoked user access.');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[480px] font-sans text-[13px] relative">
      
      {/* Toast Prompt */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white py-2 px-4 rounded-xl shadow-2xl flex items-center gap-2 z-50 text-xs shrink-0 animate-slide-up">
          <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check size={10} />
          </div>
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Main Left: Projects column */}
      <div className="w-full md:w-[260px] bg-white border-b md:border-b-0 md:border-r border-slate-200 shrink-0 flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="font-extrabold text-zentrix-blue leading-none flex items-center gap-1.5">
            <Building size={14} className="text-primary-600" />
            Active Projects List
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Multi-Project Registry Scope</p>
        </div>

        <div className="p-1.5 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {projects.map((proj, idx) => {
            const isSelected = idx === selectedProjIndex;
            const liveMembersCount = users.filter(u => u.projectAccess.some(pa => pa.projectId === proj.id && pa.status === 'Active')).length;

            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => { setSelectedProjIndex(idx); setIsAddingMember(false); }}
                className={cn(
                  "p-3 rounded-xl text-left font-bold cursor-pointer transition-colors shrink-0 flex flex-col gap-1.5 relative group min-w-[150px]",
                  isSelected 
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "bg-slate-150 text-[9px] font-black uppercase border rounded px-1 tracking-wider leading-none",
                    isSelected ? "bg-white/20 text-white border-white/10" : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {proj.code}
                  </span>
                  <span className={cn(
                    "text-[10.5px] px-1.5 rounded-full font-extrabold leading-none",
                    isSelected ? "bg-primary-500 text-white" : "bg-indigo-50 text-indigo-700"
                  )}>
                    {liveMembersCount} active
                  </span>
                </div>
                <span className="truncate w-full text-[12.5px] text-left">{proj.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Right: Users & Roles Grid pane */}
      <div className="flex-1 bg-white p-5 flex flex-col justify-start">
        
        {/* Workspace Active Header */}
        <div className="border-b border-slate-150 border-slate-200 pb-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-primary-50 text-primary-650 font-black border border-primary-200 rounded px-2.5 py-0.5 text-[10.5px] tracking-wide uppercase leading-none">
                Workspace Override View
              </span>
              <span className="text-slate-350">•</span>
              <h3 className="text-base font-black text-zentrix-blue">{activeProj.name}</h3>
            </div>
            <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-xl">
              Manage team access scopes mapped exclusively to the active workspace. One user can be Project Manager here while acting as a QS or Viewer in adjacent projects.
            </p>
          </div>

          <button
            onClick={() => setIsAddingMember(!isAddingMember)}
            className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer shrink-0"
          >
            <Plus size={14} />
            Assign User Scope
          </button>
        </div>

        {/* Append form area when toggled */}
        {isAddingMember && (
          <form onSubmit={handleAddMemberSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4.5 space-y-4 animate-slide-up font-medium">
            <h4 className="font-bold text-zentrix-blue flex items-center gap-1 text-xs">
              <KeyRound size={13} className="text-primary-500" />
              Configure Project Permission Anchor Overrides
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Select User */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Select Target User</label>
                <select
                  value={newMemberUserId}
                  onChange={(e) => setNewMemberUserId(e.target.value)}
                  className="py-1.5 px-2.5 border rounded-lg bg-white w-full text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-700"
                  id="target-user-select"
                >
                  <option value="">-- Choose Employee --</option>
                  {nonAssignedUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.designation})</option>
                  ))}
                </select>
              </div>

              {/* Select Role overrides */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Site Permission Role</label>
                <select
                  value={newMemberRoleId}
                  onChange={(e) => setNewMemberRoleId(e.target.value)}
                  className="py-1.5 px-2.5 border rounded-lg bg-white w-full text-xs font-bold focus:outline-none focus:border-primary-500 text-slate-700"
                  id="target-role-select"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>
                  ))}
                </select>
              </div>

              {/* Select Expiry Optional date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={newMemberExpiry}
                  onChange={(e) => setNewMemberExpiry(e.target.value)}
                  className="py-1.5 px-2 bg-white border rounded-lg w-full text-xs focus:outline-none focus:border-primary-500 text-slate-700"
                  id="target-expiry-date"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="px-3 py-1.5 bg-white border rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newMemberUserId}
                className="px-4 py-1.5 bg-slate-900 border border-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        )}

        {/* Assigned Users custom spreadsheet-style grid columns */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">User Identity Profiles</th>
                <th className="px-4 py-2.5">Scope Project Role Override</th>
                <th className="px-4 py-2.5">Assigned Date</th>
                <th className="px-4 py-2.5">Grant Expiration date</th>
                <th className="px-4 py-2.5 text-right">Revoke Access</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-150 divide-slate-100 text-slate-600">
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user) => {
                  const pAccess = user.projectAccess.find(pa => pa.projectId === activeProj.id);
                  if (!pAccess) return null;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                      {/* Name & avatar details */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-7 h-7 rounded-full text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 uppercase",
                            user.avatarColor
                          )}>
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-zentrix-blue truncate">{user.firstName} {user.lastName}</h5>
                            <p className="text-[10px] text-slate-400 font-bold truncate tracking-wide uppercase mt-0.5" title={user.designation}>
                              {user.designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Dropdown Role Selector inside grid (Direct Edit) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg py-0.5 px-2 w-fit shadow-inner">
                          <Shield size={11} className="text-slate-400" />
                          <select
                            value={pAccess.roleId}
                            onChange={(e) => handleRoleChangeInGrid(user.id, e.target.value)}
                            className="bg-transparent border-none text-xs focus:outline-none py-0.5 cursor-pointer font-extrabold text-slate-700 font-sans"
                            id={`grid-role-select-${user.id}`}
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Assigned Date */}
                      <td className="px-4 py-3 font-semibold text-slate-500 font-mono text-[11px]">
                        {pAccess.assignedDate}
                      </td>

                      {/* Expiry direct Date editing inside grid list */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <input
                            type="date"
                            value={pAccess.expiryDate || ''}
                            onChange={(e) => handleExpiryChangeInGrid(user.id, e.target.value)}
                            className="bg-transparent border-none focus:outline-none p-0.5 outline-none font-semibold text-slate-600 text-[11px] w-[115px] cursor-pointer"
                            id={`grid-expiry-date-${user.id}`}
                          />
                        </div>
                      </td>

                      {/* Purge button */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberAccess(user.id)}
                          className="p-1 px-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
                          title="Revoke Permission Context from Workspace"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    <ShieldAlert size={22} className="mx-auto text-slate-350 mb-2.5" />
                    No employee identities assigned to this workspace registry yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informative tips bubble */}
        <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-2 text-xs text-indigo-850 mt-4 font-medium">
          <ShieldAlert size={14} className="text-primary-600 shrink-0 mt-0.5" />
          <p>
            <strong>Workspace Isolation Rule:</strong> Mapped roles here override standard Tenant Fallbacks only inside this selected workspace parameters scope. All subsequent user actions are logged securely.
          </p>
        </div>

      </div>

    </div>
  );
};
export default ProjectAccessGrid;
