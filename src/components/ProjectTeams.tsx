import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { ProjectMember } from '../types.ts';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Check, 
  Mail, 
  ShieldAlert, 
  MoreVertical,
  X,
  User,
  Shield,
  HelpCircle,
  Filter
} from 'lucide-react';

export const ProjectTeams = () => {
  const { currentProject, projectMembers, addProjectMember, removeProjectMember } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isOpenInviteModal, setIsOpenInviteModal] = useState(false);

  // Invitation Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Project Director' | 'Project Manager' | 'QS Engineer' | 'Planning Engineer' | 'Site Engineer' | 'Commercial Manager' | 'Client Viewer'>('Site Engineer');
  const [invitePermission, setInvitePermission] = useState<'Admin' | 'Write' | 'Read-Only'>('Write');

  if (!currentProject) {
    return (
      <div className="bg-white border border-zentrix-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
        <Users size={48} className="text-slate-300 mb-2" />
        <h4 className="text-md font-bold text-zentrix-blue">No Workspace Active</h4>
        <p className="text-slate-400 text-xs">Please select an active project to view team directories.</p>
      </div>
    );
  }

  const members = projectMembers.filter(m => m.projectId === currentProject.id);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    addProjectMember({
      projectId: currentProject.id,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
      permissionLevel: invitePermission
    });

    // Reset Form
    setInviteName('');
    setInviteEmail('');
    setIsOpenInviteModal(false);
  };

  const getPermissionLabelClass = (level: ProjectMember['permissionLevel']) => {
    switch (level) {
      case 'Admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Write':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Read-Only':
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in text-[13px] text-slate-600">
      {/* Search and control strip */}
      <div className="bg-white border border-zentrix-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filters and trigger */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <div className="bg-slate-50 border border-zentrix-border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
            <Filter size={13} className="text-slate-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="Project Director">Project Director</option>
              <option value="Project Manager">Project Manager</option>
              <option value="QS Engineer">QS Engineer</option>
              <option value="Planning Engineer">Planning Engineer</option>
              <option value="Site Engineer">Site Engineer</option>
              <option value="Client Viewer">Client Viewer</option>
            </select>
          </div>

          <button 
            onClick={() => setIsOpenInviteModal(true)}
            className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 font-semibold text-white px-3.5 py-2 rounded-lg text-xs leading-none transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus size={15} />
            Add Member
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((m) => (
          <div 
            key={m.id}
            className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm hover:shadow transition-all relative flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-zentrix-blue font-bold flex items-center justify-center text-sm uppercase">
                  {m.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-zentrix-blue">{m.name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail size={11} /> {m.email}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeProjectMember(m.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Remove Member permission key"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Bottom details */}
            <div className="border-t border-dashed border-slate-100 pt-3 mt-1 flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Role assignment</p>
                <p className="font-semibold text-slate-700 mt-0.5">{m.role}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 font-bold rounded text-[10px] uppercase border ${getPermissionLabelClass(m.permissionLevel)}`}>
                  {m.permissionLevel}
                </span>

                <span className={`px-1.5 py-0.5 font-bold text-[9px] uppercase border rounded ${m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {m.status}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400">
            No team members matched your keyword.
          </div>
        )}
      </div>

      {/* Invite Member Drawer/Modal Dialog */}
      {isOpenInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-zentrix-border animate-fade-in">
            <div className="px-5 py-4 bg-slate-50 border-b border-zentrix-border flex items-center justify-between">
              <h3 className="font-bold text-zentrix-blue">Invite Project Professional</h3>
              <button onClick={() => setIsOpenInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Contact Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Youhana Mikhail"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Corporate Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. y.mikhail@buildops.co"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Workspace Role Assignment</label>
                <select 
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Project Director">Project Director</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="QS Engineer">QS Engineer</option>
                  <option value="Planning Engineer">Planning Engineer</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Commercial Manager">Commercial Manager</option>
                  <option value="Client Viewer">Client Viewer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Access Key/Permission Level</label>
                <select 
                  value={invitePermission}
                  onChange={(e: any) => setInvitePermission(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Write">Write Permissions (Planner, logs, photos)</option>
                  <option value="Admin">Admin (Full settings & staffing keys)</option>
                  <option value="Read-Only">Read-Only Viewer (Client/Investors audit)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <UserPlus size={15} /> Send Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
