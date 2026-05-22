import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useProject } from '../../context/ProjectContext.tsx';
import { 
  UserTable 
} from './UserTable.tsx';
import { 
  RoleCard 
} from './RoleCard.tsx';
import { 
  PermissionMatrix 
} from './PermissionMatrix.tsx';
import { 
  SessionGrid 
} from './SessionGrid.tsx';
import { 
  AuditTable 
} from './AuditTable.tsx';
import { 
  SecurityCard 
} from './SecurityCard.tsx';
import { 
  InviteUserDrawer 
} from './InviteUserDrawer.tsx';
import { 
  ProjectAccessGrid 
} from './ProjectAccessGrid.tsx';
import { 
  PermissionToggleGroup 
} from './PermissionToggleGroup.tsx';
import { 
  Users, Shield, KeySquare, HelpCircle, ArrowRight, UserPlus, Info, 
  Trash2, Mail, Check, ShieldCheck, Building, Clock, MapPin, 
  RefreshCw, CheckCircle, Smartphone, Sliders, Globe, Camera, LayoutGrid, Calendar, Lock
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { IAMUser, IAMRole } from '../../mockIAMData.ts';

// ----------------------------------------------------
// (A) USER DETAILS SUB-VIEWS (Tabbed Page)
// ----------------------------------------------------
export const UserDetailPage = ({ userId, onBack }: { userId: string; onBack: () => void }) => {
  const { users, roles, sessions, auditLogs, updateUser, assignUserProjectRole, removeUserProjectAccess, terminateSession } = useAuth();
  const { projects } = useProject();
  const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'projects' | 'security' | 'sessions' | 'history'>('profile');
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return (
      <div className="p-6 bg-white border rounded-xl text-center text-slate-400 font-sans">
        Employee account not found in database.
      </div>
    );
  }

  const userFullName = `${user.firstName} ${user.lastName}`;
  const matchedGlobalRole = roles.find(r => r.id === user.globalRoleId);
  const userSessions = sessions.filter(s => s.userId === user.id);
  const userAudits = auditLogs.filter(l => l.userId === user.id);

  // Quick State Updates
  const handleToggleStatus = () => {
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    updateUser(user.id, { status: nextStatus });
  };

  const handleResetAttempts = () => {
    updateUser(user.id, { failedLoginAttempts: 0, status: 'Active' });
    alert('Locked state cleared and attempt limit reset.');
  };

  const handleToggleMfa = () => {
    updateUser(user.id, { mfaEnabled: !user.mfaEnabled });
  };

  return (
    <div className="space-y-6 font-sans text-[13px] text-slate-600 animate-fade-in">
      
      {/* Title bar / Micro-controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onBack} 
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm text-slate-700"
          >
            ← Back to List
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-slate-400 font-bold">Directories</span>
          <span className="text-slate-350">/</span>
          <span className="font-extrabold text-slate-800 truncate max-w-[200px]">{userFullName}</span>
        </div>

        {/* Floating actions */}
        <div className="flex flex-wrap items-center gap-2">
          {user.status === 'Locked' && (
            <button
              onClick={handleResetAttempts}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg text-xs shadow cursor-pointer"
            >
              Unlock Locked Account
            </button>
          )}

          <button
            onClick={handleToggleStatus}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer shadow",
              user.status === 'Active' 
                ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100" 
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            )}
          >
            {user.status === 'Active' ? 'Suspend Employee' : 'Onboard Active Status'}
          </button>
        </div>
      </div>

      {/* Profile Header Cards Stack */}
      <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-black shadow-inner uppercase shrink-0",
            user.avatarColor
          )}>
            {user.firstName[0]}{user.lastName[0]}
          </div>

          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-black text-zentrix-blue truncate">{userFullName}</h2>
            <p className="text-xs font-bold text-primary-600">{user.designation}</p>
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
              <span>Employee ID: <strong>{user.employeeId}</strong></span>
              <span>•</span>
              <span>User ID: <code className="font-mono">{user.id}</code></span>
            </p>
          </div>
        </div>

        {/* Fast metrics */}
        <div className="grid grid-cols-3 gap-6 text-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Workspaces</span>
            <p className="text-base font-black text-slate-800 mt-1">{user.projectAccess.length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Device Limits</span>
            <p className="text-base font-black text-slate-800 mt-1">{userSessions.length} Act</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Status</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase inline-block mt-2",
              user.status === 'Active' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}>
              {user.status}
            </span>
          </div>
        </div>
      </div>

      {/* TABBED INTERFACE HEADER */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto shrink-0 pb-1">
        {[
          { id: 'profile', name: 'Profile Details' },
          { id: 'roles', name: 'Identity Roles' },
          { id: 'projects', name: 'Site Mappings' },
          { id: 'security', name: 'Local Security' },
          { id: 'sessions', name: 'Sessions List' },
          { id: 'history', name: 'User Audit Activity' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-4 py-2 font-bold text-xs whitespace-nowrap cursor-pointer border-b-2 transition-all leading-none",
              activeTab === t.id 
                ? "border-slate-900 text-slate-900 font-extrabold" 
                : "border-transparent text-slate-550 hover:text-slate-850 hover:border-slate-200"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[300px]">
        
        {/* TAB: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="font-bold text-zentrix-blue text-sm">Contact & Enterprise Specifics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Enterprise Email</span>
                <p className="font-semibold text-slate-800 text-[13.5px]">{user.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Username</span>
                <p className="font-mono font-semibold text-slate-800 text-[13.5px]">@{user.username}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Designation</span>
                <p className="font-semibold text-slate-800 text-[13.5px]">{user.designation}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Onboarding Date</span>
                <p className="font-semibold text-slate-800 text-[13.5px]">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '—'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Directory Domain</span>
                <p className="font-semibold text-slate-800 text-[13.5px]">corporate-internal-directory.buildops.co</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Metadata Country</span>
                <p className="font-semibold text-slate-800 text-[13.5px]">Saudi Arabia (Corporate HQ)</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl flex gap-3 text-xs leading-normal text-slate-500 font-medium max-w-xl">
              <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <p>
                To override designations or update contact parameters of this employee profile, use the global edits action button in the directories list table view.
              </p>
            </div>
          </div>
        )}

        {/* TAB: ROLES & DIRECT PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-zentrix-blue text-sm">System Permission Schema</h3>
              <p className="text-[12px] text-slate-400 font-medium">Overarching global role profile assigned to this identity token layout.</p>
            </div>

            <div className="p-4 border rounded-xl flex items-start gap-3.5 bg-slate-50">
              <div className="w-10 h-10 bg-primary-100 border text-primary-700 flex items-center justify-center rounded-xl shrink-0">
                <Shield size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-zentrix-blue text-[13.5px]">{matchedGlobalRole?.name}</h4>
                  <span className="bg-indigo-50 border text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    {matchedGlobalRole?.scope} Level
                  </span>
                </div>
                <p className="text-xs text-slate-450 leading-relaxed font-semibold max-w-lg text-slate-500">
                  {matchedGlobalRole?.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">List of Associated Policy Statements ({matchedGlobalRole?.permissions.length || 0})</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {matchedGlobalRole?.permissions.map(perm => (
                  <span key={perm} className="px-2 py-1 font-mono text-[10.5px] bg-slate-100 text-slate-600 rounded border border-slate-200">
                    🔐 {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: SITE PROJECTS OVERRIDE */}
        {activeTab === 'projects' && (
          <div className="space-y-5">
            <div className="space-y-1 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zentrix-blue text-sm">Workspace Override Scopes</h3>
                <p className="text-[12px] text-slate-400 font-medium">Mapped direct roles this employee carries across explicit construction sites.</p>
              </div>
            </div>

            {user.projectAccess.length > 0 ? (
              <div className="border rounded-xl overflow-hidden divide-y divide-slate-100">
                {user.projectAccess.map(pa => {
                  const pObj = projects.find(p => p.id === pa.projectId);
                  const prRole = roles.find(r => r.id === pa.roleId);

                  return (
                    <div key={pa.projectId} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span className="bg-slate-200 text-slate-550 border rounded px-1 text-[9.5px] font-black font-mono leading-none">{pObj?.code || 'N/A'}</span>
                          <span className="font-bold text-zentrix-blue truncate">{pObj?.name || 'Assigned Workspace'}</span>
                        </div>
                        <p className="text-[11.5px] text-slate-400 font-semibold">
                          Assigned: {pa.assignedDate} • Expirations: {pa.expiryDate || 'No Limit Policy Set'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded bg-primary-50 text-primary-750 font-black text-[11px] uppercase tracking-wide border border-primary-100">
                          ⚙️ {prRole?.name || 'Local Role'}
                        </span>
                        
                        <button
                          onClick={() => {
                            if (confirm('Terminate user project scope?')) {
                              removeUserProjectAccess(user.id, pa.projectId);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 bg-slate-50 rounded-xl text-center text-slate-450 border border-dashed text-xs text-slate-400">
                No project overrides mapped. Global FALLBACK role applies to all workspaces.
              </div>
            )}
          </div>
        )}

        {/* TAB: LOCAL SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="font-bold text-zentrix-blue text-sm">Security Controls & Locks</h3>

            <div className="divide-y divide-slate-100 space-y-4">
              
              {/* Failed attempts controller */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 text-[13px]">Failure Attempts Log Tracker</h4>
                  <p className="text-xs text-slate-400 font-semibold">Currently registered failed entries: <strong className="text-rose-600">{user.failedLoginAttempts || 0} Attempts</strong></p>
                </div>

                <button
                  onClick={handleResetAttempts}
                  disabled={!user.failedLoginAttempts}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 hover:border-slate-350 disabled:opacity-40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm text-slate-700"
                >
                  Clear Fail Entries
                </button>
              </div>

              {/* MFA enforcer toggle */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 text-[13px]">Google / MS Authenticator Policy</h4>
                  <p className="text-xs text-slate-400 font-semibold">Two-factor auth requirement is {user.mfaEnabled ? 'Enforced' : 'Optional'}.</p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMfa}
                  className={cn(
                    "px-3.5 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm",
                    user.mfaEnabled 
                      ? "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700" 
                      : "bg-emerald-50 border-emerald-250 border-emerald-200 hover:bg-emerald-100 text-emerald-700"
                  )}
                >
                  {user.mfaEnabled ? 'Revoke Enforced MFA' : 'Force Turn On MFA'}
                </button>
              </div>

              {/* Password Age */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 text-[13px]">Credential Age standards</h4>
                  <p className="text-xs text-slate-400 font-semibold">
                    Last password rotation sequence: <strong>{user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never changed'}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert('Issued password forced-reset token dispatch to standard account inbox.');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-900 text-white hover:bg-black rounded-lg text-xs font-bold shadow cursor-pointer"
                >
                  Force Password Rotation
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: SESSIONS LIST */}
        {activeTab === 'sessions' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-zentrix-blue text-sm">Active Authorized Device Tokens</h3>
              <p className="text-[12px] text-slate-400 font-semibold">Revoke access tokens mapping this user's mobile or browser parameters.</p>
            </div>

            {userSessions.length > 0 ? (
              <div className="space-y-3.5 max-w-xl">
                {userSessions.map(sess => (
                  <div key={sess.id} className="p-4 border rounded-xl flex items-center justify-between gap-4 bg-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zentrix-blue text-[13px]">{sess.device}</span>
                        {sess.isActive ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">Online</span>
                        ) : (
                          <span className="bg-slate-250 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block">{sess.lastActivity}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{sess.browser} • IP: {sess.ipAddress} • {sess.location}</p>
                    </div>

                    {sess.isActive && (
                      <button
                        onClick={() => {
                          if (confirm('Forcibly sign out this active device?')) {
                            terminateSession(sess.id);
                          }
                        }}
                        className="px-2.5 py-1 text-slate-500 hover:text-rose-600 border rounded font-semibold text-xs cursor-pointer bg-white"
                      >
                        Terminate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 font-sans border border-dashed rounded-xl text-xs">
                No active device logs reported.
              </div>
            )}
          </div>
        )}

        {/* TAB: AUDIT Trail */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            <h3 className="font-bold text-zentrix-blue text-sm">Security Logs Stream</h3>

            {userAudits.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {userAudits.map(log => (
                  <div key={log.id} className="p-3.5 flex items-center justify-between gap-4 text-xs font-semibold hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-slate-800 leading-relaxed font-bold">{log.action}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{log.module} • IP: {log.ipAddress} • {log.project ? `Proj: ${log.project}` : 'Tenant Level'}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate whitespace-nowrap shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 bg-slate-50 text-slate-450 border border-dashed rounded-xl text-center text-xs text-slate-400">
                No security activities registered under this account context.
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};


// ----------------------------------------------------
// (B) ROLE DETAILS SUB-VIEWS (Tabbed Role Pane)
// ----------------------------------------------------
export const RoleDetailPage = ({ roleId, onBack }: { roleId: string; onBack: () => void }) => {
  const { roles, users, auditLogs, updateRole } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<'permissions' | 'users' | 'scope' | 'history'>('permissions');

  const roleObj = roles.find(r => r.id === roleId);
  if (!roleObj) {
    return (
      <div className="p-6 bg-white border rounded-xl text-center text-slate-400 font-sans">
        Role config not found.
      </div>
    );
  }

  const roleName = roleObj.name;
  const roleUsers = users.filter(u => u.globalRoleId === roleObj.id || u.projectAccess.some(pa => pa.roleId === roleObj.id));
  const roleAudits = auditLogs.filter(l => l.action.toLowerCase().includes(roleName.toLowerCase()) || l.module === 'Roles & Permissions');

  const handlePermissionsChange = (newPerms: string[]) => {
    updateRole(roleObj.id, { 
      permissions: newPerms,
      permissionCount: newPerms.length
    });
  };

  return (
    <div className="space-y-6 font-sans text-[13px] text-slate-600 animate-fade-in">
      
      {/* Role view Header line */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onBack} 
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-250 border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm text-slate-700"
          >
            ← Back to Security Profiles
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-slate-400 font-bold">Roles Pool</span>
          <span className="text-slate-350">/</span>
          <span className="font-extrabold text-slate-800">{roleObj.name} Role</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 bg-indigo-50 border rounded-xl text-indigo-700 shrink-0 flex items-center justify-center">
            <Shield size={22} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-zentrix-blue">{roleName} Configuration</h2>
            <p className="text-[12px] text-slate-400 leading-relaxed max-w-lg font-medium">{roleObj.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-center select-none shrink-0 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Claims count</span>
            <p className="text-base font-black text-slate-800 mt-0.5">{roleObj.permissions.length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Scope</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-center block mt-1.5",
              roleObj.scope === 'Global' ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"
            )}>
              {roleObj.scope} Scope
            </span>
          </div>
        </div>
      </div>

      {/* Role Detailed Pane Nav Tabs */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto shrink-0 pb-1">
        {[
          { id: 'permissions', name: 'Claims Rules Matrix' },
          { id: 'users', name: `Assigned Users List (${roleUsers.length})` },
          { id: 'scope', name: 'Authorized Project Scope' },
          { id: 'history', name: 'Role Changes History' }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setActiveRoleTab(tb.id as any)}
            className={cn(
              "px-4 py-2 font-bold text-xs whitespace-nowrap cursor-pointer border-b-2 transition-all leading-none",
              activeRoleTab === tb.id 
                ? "border-slate-900 text-slate-900 font-extrabold" 
                : "border-transparent text-slate-510 text-slate-500 hover:text-slate-800 hover:border-slate-200"
            )}
          >
            {tb.name}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm min-h-[300px]">
        {/* Claims rules editor */}
        {activeRoleTab === 'permissions' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-zentrix-blue text-sm">Policy statement claims definitions</h3>
              <p className="text-[11.5px] text-slate-400 font-semibold leading-relaxed">Toggle standard enterprise modules access for this security profile. Changes commit globally immediately.</p>
            </div>

            <PermissionMatrix
              selectedPermissions={roleObj.permissions}
              onChange={handlePermissionsChange}
              isReadOnly={roleObj.id === 'role-syst-admin'} // ReadOnly for master system admin to prevent lockout
            />
          </div>
        )}

        {/* Assigned Users list */}
        {activeRoleTab === 'users' && (
          <div className="space-y-5">
            <h3 className="font-bold text-zentrix-blue text-sm">Identities linked to this Role</h3>

            {roleUsers.length > 0 ? (
              <div className="border border-slate-250 border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {roleUsers.map(ru => {
                  const hasDirectOverride = ru.projectAccess.some(pa => pa.roleId === roleObj.id);
                  return (
                    <div key={ru.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-2.5 items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 uppercase shadow-inner",
                          ru.avatarColor
                        )}>
                          {ru.firstName[0]}{ru.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-zentrix-blue">{ru.firstName} {ru.lastName}</h4>
                          <span className="text-[10px] text-slate-400 lowercase font-mono">@{ru.username}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400 font-semibold">{ru.designation}</span>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wide border shadow-inner",
                          hasDirectOverride 
                            ? "bg-blue-50 text-blue-700 border-blue-150" 
                            : "bg-slate-100 text-slate-600 border-slate-250"
                        )}>
                          {hasDirectOverride ? 'Workspace Override' : 'Global Fallback'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 bg-slate-50 border border-dashed rounded-xl text-center text-xs text-slate-400">
                No mapped identities are carrying this role profile.
              </div>
            )}
          </div>
        )}

        {/* Scope limit configurations */}
        {activeRoleTab === 'scope' && (
          <div className="space-y-4">
            <h3 className="font-bold text-zentrix-blue text-sm">Authorized Project boundaries</h3>
            <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-md">
              Configured scope parameters limit this role's utility context. Global roles can navigate any company asset, while workspace mapped scopes restrict view actions completely to named projects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl bg-slate-50 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-slate-700 uppercase">Tenant Scope Model</h4>
                  <p className="text-xs text-slate-400 font-semibold">Allow claim assertions universally inside company directories.</p>
                </div>
                <input
                  type="checkbox"
                  checked={roleObj.scope === 'Global' || roleObj.scope === 'Tenant'}
                  readOnly
                  className="rounded border-slate-350 text-primary-600 cursor-not-allowed h-4 w-4"
                />
              </div>

              <div className="p-4 border rounded-xl bg-slate-50 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-slate-700 uppercase">Project Specific override</h4>
                  <p className="text-xs text-slate-400 font-semibold">Scope controls limits to selected construction sites context.</p>
                </div>
                <input
                  type="checkbox"
                  checked={roleObj.scope === 'Project-Specific' || roleObj.id !== 'role-syst-admin'}
                  readOnly
                  className="rounded border-slate-350 text-primary-600 cursor-not-allowed h-4 w-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Audit controls relative to changes on the role */}
        {activeRoleTab === 'history' && (
          <div className="space-y-5">
            <h3 className="font-bold text-zentrix-blue text-sm">Changes Audit Stream</h3>

            {roleAudits.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {roleAudits.map(log => (
                  <div key={log.id} className="p-3.5 flex items-center justify-between gap-4 text-xs font-semibold hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-slate-800 leading-relaxed font-bold">{log.action}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{log.module} • IP: {log.ipAddress} • {log.user}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 bg-slate-50 text-slate-450 border border-dashed rounded-xl text-center text-xs text-slate-400">
                No recent modifications logged relative to this security profile.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};


// ----------------------------------------------------
// (C) TENANT BRADING SETTINGS MODULE
// ----------------------------------------------------
export const TenatOrganizationSettingsPanel = () => {
  const { branding, updateBranding } = useAuth();
  const [success, setSuccess] = useState('');

  const [companyName, setCompanyName] = useState(branding.companyName);
  const [tenantSubdomain, setTenantSubdomain] = useState(branding.tenantSubdomain);
  const [adminNotificationEmail, setAdminNotificationEmail] = useState(branding.adminNotificationEmail);
  const [sandboxTimezone, setSandboxTimezone] = useState(branding.sandboxTimezone || 'Asia/Riyadh');
  const [defaultSystemLanguage, setDefaultSystemLanguage] = useState(branding.defaultSystemLanguage || 'en');
  const [primaryHex, setPrimaryHex] = useState(branding.themePrimaryColor || '#0284c7');
  const [companyLogoUrl, setCompanyLogoUrl] = useState(branding.companyLogoUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      companyName,
      tenantSubdomain,
      adminNotificationEmail,
      sandboxTimezone,
      defaultSystemLanguage,
      themePrimaryColor: primaryHex,
      companyLogoUrl
    });

    setSuccess('Organization branding configurations updated successfully.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const selectPredefinedColor = (hex: string) => {
    setPrimaryHex(hex);
  };

  const handleLogoGenerateDummy = () => {
    const dummyLogos = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=150'
    ];
    const rand = dummyLogos[Math.floor(Math.random() * dummyLogos.length)];
    setCompanyLogoUrl(rand);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 shadow-sm space-y-6 font-sans text-[13px] text-slate-600 animate-fade-in">
      
      {success && (
        <div className="p-4 bg-emerald-550 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm animate-slide-up">
          <CheckCircle size={15} />
          <span>{success}</span>
        </div>
      )}

      <div>
        <h4 className="text-base font-extrabold text-zentrix-blue flex items-center gap-1.5">
          <Globe size={18} className="text-primary-600" />
          Enterprise Tenant Branding & Settings
        </h4>
        <p className="text-[12.5px] text-slate-400 font-medium mt-1 leading-relaxed max-w-lg">
          Configure corporate names, customize primary design colors, timezones models, support emails, and configure asset logs directories language flags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Left column */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 focus:outline-none focus:border-primary-500 rounded-lg w-full font-bold shadow-sm"
              id="org-companyname-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">Directory Subdomain Prefix</label>
            <div className="flex bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <input
                type="text"
                value={tenantSubdomain}
                onChange={(e) => setTenantSubdomain(e.target.value)}
                className="py-2 px-3 bg-white border-r focus:outline-none focus:border-primary-500 flex-1 font-bold text-slate-700"
                id="org-subdomain-field"
              />
              <span className="py-2 px-3 text-slate-400 font-semibold font-mono text-xs whitespace-nowrap bg-slate-100 flex items-center">.buildops.cloud</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">Master IT Notification Email</label>
            <input
              type="email"
              value={adminNotificationEmail}
              onChange={(e) => setAdminNotificationEmail(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 focus:outline-none focus:border-primary-500 rounded-lg w-full font-bold shadow-sm"
              id="org-email-field"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">System Default Language</label>
            <select
              value={defaultSystemLanguage}
              onChange={(e) => setDefaultSystemLanguage(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 focus:outline-none focus:border-primary-500 rounded-lg w-full font-bold shadow-sm text-slate-700"
              id="org-lang-select"
            >
              <option value="en">English (United States / UK)</option>
              <option value="ar">العربية (Kingdom of Saudi Arabia)</option>
              <option value="fr">Français (France)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">Corporate Sandbox Timezone</label>
            <select
              value={sandboxTimezone}
              onChange={(e) => setSandboxTimezone(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 focus:outline-none focus:border-primary-500 rounded-lg w-full font-bold shadow-sm text-slate-700"
              id="org-tz-select"
            >
              <option value="Asia/Riyadh">Riyadh (GMT+3) - Arabic Standard Time</option>
              <option value="Asia/Dubai">Dubai (GMT+4) - Gulf Standard Time</option>
              <option value="Europe/London">London (GMT+0) - Western European Time</option>
              <option value="America/New_York">New York (GMT-5) - Eastern Standard Time</option>
            </select>
          </div>

          {/* Color theme selectors */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">Brand Highlight Color Accent</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="w-10 h-10 border rounded-lg cursor-pointer bg-white p-0.5 outline-none"
              />
              <div className="flex gap-2">
                {['#0ea5e9', '#0d9488', '#f59e0b', '#6366f1', '#e11d48'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => selectPredefinedColor(color)}
                    style={{ backgroundColor: color }}
                    className={cn(
                      "w-6 h-6 rounded-full border border-white hover:scale-110 active:scale-95 transition-all text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer",
                      primaryHex === color ? "ring-2 ring-slate-900" : ""
                    )}
                  >
                    {primaryHex === color && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Corporate logo selector */}
        <div className="md:col-span-2 p-5 border border-dashed rounded-xl bg-slate-50/50 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 border rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-inner text-slate-400 shrink-0 uppercase font-bold text-xs">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                'Log'
              )}
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-zentrix-blue">Company Directory Banner Banner</h5>
              <p className="text-[11px] text-slate-450 text-slate-400 leading-normal max-w-sm font-semibold">
                Generate high contrast vector launcher icons or corporate brand graphics for display on sign-on screens (maximum size limits 500kb in png / SVG).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoGenerateDummy}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Camera size={13} className="text-slate-500" />
            Simulate Brand Generator
          </button>
        </div>
      </div>

      <div className="border-t border-slate-150 pt-4 flex justify-end gap-3.5">
        <button
          type="button"
          onClick={() => {
            setCompanyName(branding.companyName);
            setTenantSubdomain(branding.tenantSubdomain);
            setAdminNotificationEmail(branding.adminNotificationEmail);
          }}
          className="px-4 py-2 bg-[#f8fafc] hover:bg-slate-100 border text-slate-500 hover:text-slate-700 transition-colors rounded-xl font-bold font-sans cursor-pointer"
        >
          Reset Updates
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-slate-900 border border-slate-900 text-white font-black hover:bg-black rounded-xl transition-all shadow-md font-sans cursor-pointer"
        >
          Save Configuration Changes
        </button>
      </div>

    </form>
  );
};


// ----------------------------------------------------
// (D) INVITATIONS MANAGEMENT LIST
// ----------------------------------------------------
export const InvitationsPanel = () => {
  const { invitations, roles, cancelInvite, resendInvite } = useAuth();
  const { projects } = useProject();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toast, setToast] = useState('');

  const displayToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-5 font-sans text-[13px] text-slate-600 animate-fade-in relative">
      
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white py-2 px-4 rounded-xl shadow-2xl flex items-center gap-2 z-50 text-xs shrink-0 animate-slide-up">
          <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check size={10} />
          </div>
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Slide Drawer Anchor link */}
      <InviteUserDrawer isOpen={isInviteOpen} onClose={() => { setIsInviteOpen(false); displayToast('Onboarding invitation issued.'); }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-black text-zentrix-blue">Outstanding Corporate Onboarding invitations</h3>
          <p className="text-[12px] text-slate-400 font-semibold">Track validation states, verify links expiration, or cancel issued invites instantly.</p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <UserPlus size={15} />
          Issue Invitation Key
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10.5px] font-black uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Dispatch Email Address</th>
              <th className="px-5 py-3">Default Basic Role</th>
              <th className="px-5 py-3">Authorized Workspaces</th>
              <th className="px-5 py-3">Invitation Status</th>
              <th className="px-5 py-3">Issued By Agent</th>
              <th className="px-5 py-3">Issued / Link Expiring</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {invitations.length > 0 ? (
              invitations.map((inv) => {
                const rtRole = roles.find(r => r.id === inv.roleId);
                const isAcceptable = inv.status === 'Pending';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Email */}
                    <td className="px-5 py-3.5 font-bold text-zentrix-blue">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 text-[10px]">
                          @
                        </div>
                        <span>{inv.email}</span>
                      </div>
                    </td>

                    {/* Default role */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {rtRole?.name || 'Viewer fallback'}
                      </span>
                    </td>

                    {/* Project access pre assign count */}
                    <td className="px-5 py-3.5 font-bold text-slate-700">
                      🏢 {inv.projects.length} Workspace{inv.projects.length !== 1 ? 's' : ''}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase flex items-center gap-1 w-fit border shadow-inner",
                        inv.status === 'Pending' && "bg-amber-500/10 text-amber-600 border-amber-500/10",
                        inv.status === 'Cancelled' && "bg-slate-500/10 text-slate-500 border-slate-300",
                        inv.status === 'Accepted' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                      )}>
                        <span className={cn(
                          "w-1 h-1 rounded-full",
                          inv.status === 'Pending' && "bg-amber-500",
                          inv.status === 'Cancelled' && "bg-slate-400",
                          inv.status === 'Accepted' && "bg-emerald-500"
                        )} />
                        {inv.status}
                      </span>
                    </td>

                    {/* Issued by */}
                    <td className="px-5 py-3.5 font-semibold text-slate-500">
                      {inv.sentBy}
                    </td>

                    {/* Timestamp checks */}
                    <td className="px-5 py-3.5 font-semibold text-slate-400 font-mono text-[11.5px] whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>Issued: {new Date(inv.sentAt).toLocaleDateString()}</span>
                        <span className="text-[10px]">Expires: {new Date(inv.expiryAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Inline actions triggers */}
                    <td className="px-5 py-3.5 text-right">
                      {isAcceptable ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { resendInvite(inv.id); displayToast('Invitation email reassert complete.'); }}
                            className="p-1 px-2 hover:bg-sky-50 hover:border-sky-200 text-sky-700 border rounded font-bold text-xs whitespace-nowrap cursor-pointer shadow-sm transition-all"
                          >
                            Resend Link
                          </button>
                          <button
                            onClick={() => { cancelInvite(inv.id); displayToast('Invitation cancelled.'); }}
                            className="p-1 px-2 hover:bg-rose-50 text-rose-600 rounded font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No further actions</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold bg-slate-50/50">
                  <Mail size={22} className="mx-auto text-slate-350 mb-2" />
                  No outstanding onboarding invitations detected in Tenant sandbox.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
