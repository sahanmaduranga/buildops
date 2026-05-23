import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadIAMData, saveIAMData, IAMUser, IAMRole, IAMSession, IAMInvitation, IAMAuditLog, SecuritySettings, TenantBranding } from '../mockIAMData.ts';
import { useProject } from './ProjectContext.tsx';

interface AuthContextType {
  currentUser: IAMUser | null;
  selectedTenantId: string;
  activeSessionId: string | null;
  users: IAMUser[];
  roles: IAMRole[];
  sessions: IAMSession[];
  invitations: IAMInvitation[];
  auditLogs: IAMAuditLog[];
  securitySettings: SecuritySettings;
  branding: TenantBranding;
  userRoleInActiveProject: IAMRole | null;
  userPermissionsInActiveProject: string[];
  
  // Custom SPA Routing State
  currentPath: string;
  navigateTo: (path: string) => void;

  // IAM Service Actions / API Mock placeholders
  mockLogin: (identity: string, pass: string) => Promise<{ success: boolean; error?: string; mfaRequired?: boolean; user?: IAMUser }>;
  mockLogout: () => Promise<void>;
  mockForgotPassword: (email: string) => Promise<{ success: boolean; msg: string }>;
  mockResetPassword: (pass: string) => Promise<{ success: boolean; msg: string }>;
  mockVerifyMfa: (code: string) => Promise<{ success: boolean; user: IAMUser }>;
  
  // User Actions
  addUser: (user: Omit<IAMUser, 'id' | 'lastLogin' | 'failedLoginAttempts' | 'tenantId'>) => void;
  updateUser: (id: string, updated: Partial<IAMUser>) => void;
  deleteUser: (id: string) => void;
  assignUserProjectRole: (userId: string, projectId: string, roleId: string) => void;
  removeUserProjectAccess: (userId: string, projectId: string) => void;

  // Role Actions
  addRole: (role: Omit<IAMRole, 'userCount'>) => void;
  updateRole: (id: string, updated: Partial<IAMRole>) => void;
  deleteRole: (id: string) => void;

  // Invite Actions
  inviteUser: (email: string, roleId: string, projectIds: string[]) => void;
  cancelInvite: (id: string) => void;
  resendInvite: (id: string) => void;

  // Config Actions
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  updateBranding: (branding: Partial<TenantBranding>) => void;
  
  // Authorization Guards
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  terminateSession: (sessionId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentProject, selectProject } = useProject();

  // 1. Core State loaded from localStorage of mock database
  const [db, setDb] = useState(() => loadIAMData());
  const [currentUser, setCurrentUser] = useState<IAMUser | null>(() => {
    const saved = localStorage.getItem('iam_current_user');
    if (saved) return JSON.parse(saved);
    // First page always should be login page, so we default to null
    return null;
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const savedUser = localStorage.getItem('iam_current_user');
    return savedUser ? (localStorage.getItem('iam_active_session_id') || 'sess-1') : null;
  });

  // Track simple virtual path in URL state
  const [currentPath, setCurrentPath] = useState(() => {
    const savedUser = localStorage.getItem('iam_current_user');
    const hash = window.location.hash;
    const initialRoute = hash ? hash.replace('#', '') : (window.location.pathname === '/' ? '/login' : window.location.pathname);
    
    // Force login if no user is saved
    if (!savedUser && !['/login', '/forgot-password', '/reset-password', '/mfa-verification'].includes(initialRoute)) {
      return '/login';
    }
    return initialRoute === '/' ? '/login' : initialRoute;
  });

  // Route Navigator
  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
    setCurrentPath(path);
    
    // Smooth scroll content area to top
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
  };

  // Sync virtual path with window popstate/hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const savedUser = localStorage.getItem('iam_current_user');
      const hash = window.location.hash;
      const rawRoute = hash ? hash.replace('#', '') : (window.location.pathname === '/' ? '/login' : window.location.pathname);
      
      if (!savedUser && !['/login', '/forgot-password', '/reset-password', '/mfa-verification'].includes(rawRoute)) {
        setCurrentPath('/login');
      } else {
        setCurrentPath(rawRoute);
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // 2. Persist Database state to localStorage when changes occur
  useEffect(() => {
    saveIAMData(db);
  }, [db]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('iam_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('iam_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('iam_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('iam_active_session_id');
    }
  }, [activeSessionId]);

  // 3. Calculation of Current Project-Specific Roles & Permissions
  // "please note one user should be able to access many projects and same user can have different role in different project."
  const [userRoleInActiveProject, setUserRoleInActiveProject] = useState<IAMRole | null>(null);
  const [userPermissionsInActiveProject, setUserPermissionsInActiveProject] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setUserRoleInActiveProject(null);
      setUserPermissionsInActiveProject([]);
      return;
    }

    let resolvedRoleId = currentUser.globalRoleId;

    // Check project-specific override role if a project is selected
    if (currentProject) {
      const pAccess = currentUser.projectAccess.find(pa => pa.projectId === currentProject.id);
      if (pAccess && pAccess.status === 'Active') {
        resolvedRoleId = pAccess.roleId;
      }
    }

    const roleObj = db.roles.find(r => r.id === resolvedRoleId) || null;
    setUserRoleInActiveProject(roleObj);
    setUserPermissionsInActiveProject(roleObj ? roleObj.permissions : []);
  }, [currentUser, currentProject, db.roles]);

  // Add system audit logs helper
  const triggerAuditRecord = (userId: string, userName: string, module: IAMAuditLog['module'], action: string, projectId?: string) => {
    const matchedProject = db.users.find(u => u.id === userId)?.projectAccess;
    const projName = projectId ? 'Project' : undefined;

    const newAudit: IAMAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: userName,
      userId,
      module,
      action,
      projectId,
      project: projectId ? 'Workspace Assignment' : undefined,
      ipAddress: '197.35.48.92' // Mock user IP
    };

    setDb(prev => ({
      ...prev,
      auditLogs: [newAudit, ...prev.auditLogs]
    }));
  };

  // 4. API Service Mocks (POST /auth/login, etc.)
  const mockLogin = async (identity: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Network delay

    const matchedUser = db.users.find(u => u.email.toLowerCase() === identity.toLowerCase() || u.username.toLowerCase() === identity.toLowerCase());

    if (!matchedUser) {
      return { success: false, error: 'User identity record not found in tenant database.' };
    }

    if (matchedUser.status === 'Suspended') {
      return { success: false, error: 'Your corporate access has been Suspended. Please contact your Tenant Administrator.' };
    }

    if (matchedUser.status === 'Locked') {
      return { success: false, error: 'This account is Locked due to 5 consecutive failed login attempts. Reset your password or wait for admin lockout window.' };
    }

    if (matchedUser.status === 'Pending') {
      return { success: false, error: 'Your invitation is currently pending. Please verify your email connection and register credentials.' };
    }

    // Mock specific passwords for testing specific states
    if (pass === 'lockme') {
      const updatedUsers = db.users.map(u => {
        if (u.id === matchedUser.id) {
          const attempts = u.failedLoginAttempts + 1;
          return {
            ...u,
            failedLoginAttempts: attempts,
            status: attempts >= 5 ? ('Locked' as const) : u.status
          };
        }
        return u;
      });
      setDb(prev => ({ ...prev, users: updatedUsers }));
      
      if (matchedUser.failedLoginAttempts + 1 >= 5) {
        triggerAuditRecord('sys-control', 'System Controller', 'Authentication', `Locked user account ${matchedUser.firstName} ${matchedUser.lastName} due to security lockout violation.`);
        return { success: false, error: 'Exceeded maximum authentication attempts. This account is now Locked.' };
      }
      return { success: false, error: `Invalid security credentials. ${5 - (matchedUser.failedLoginAttempts + 1)} attempts remaining until administrative lockout.` };
    }

    if (pass === 'expired') {
      return { success: false, error: 'Your enterprise password expired 95 days ago. Password policy forces a password reset to recover operations.' };
    }

    if (pass === 'inactive') {
      return { success: false, error: 'User login blocked: Your account status is marked as Inactive.' };
    }

    // Default mock behavior - any other password works, but let's check for simple validation
    if (pass.length < 4) {
      return { success: false, error: 'Password must comply with security policies (Minimum 4 characters).' };
    }

    // Reset failed login count on successful auth
    const updatedUsers = db.users.map(u => {
      if (u.id === matchedUser.id) {
        return { ...u, failedLoginAttempts: 0, lastLogin: new Date().toISOString() };
      }
      return u;
    });

    setDb(prev => ({ ...prev, users: updatedUsers }));

    if (matchedUser.mfaEnabled) {
      // Prompt MFA redirect
      return { success: true, mfaRequired: true, user: matchedUser };
    }

    // Final Login Process
    setCurrentUser(matchedUser);
    const newSessionId = `sess-${Date.now()}`;
    setActiveSessionId(newSessionId);
    selectProject(null); // Clear selected project on login!

    // Create a new session entry
    const newSession: IAMSession = {
      id: newSessionId,
      userId: matchedUser.id,
      userName: `${matchedUser.firstName} ${matchedUser.lastName}`,
      device: 'Apple MacBook Pro 14"',
      browser: 'Chrome 125.0',
      ipAddress: '197.35.48.92',
      location: 'Riyadh, Saudi Arabia',
      lastActivity: 'Active Now',
      isActive: true
    };

    setDb(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions]
    }));

    triggerAuditRecord(matchedUser.id, `${matchedUser.firstName} ${matchedUser.lastName}`, 'Authentication', 'Interactive user password authenticated successfully.');

    return { success: true, user: matchedUser };
  };

  const mockLogout = async () => {
    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Authentication', 'Terminated administrative workspace session.');
      
      // Mark active session inactive
      if (activeSessionId) {
        setDb(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => s.id === activeSessionId ? { ...s, isActive: false, lastActivity: 'Logged Out' } : s)
        }));
      }
    }
    
    selectProject(null); // Clear selected project on logout!
    setCurrentUser(null);
    setActiveSessionId(null);
    navigateTo('/login');
  };

  const mockForgotPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const matched = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matched) {
      return { success: false, msg: 'No enterprise email registered under that address in the active Tenant sandbox.' };
    }
    
    return { success: true, msg: `Passphrase reset instruction dispatch complete. Please check the inbox at: ${email}` };
  };

  const mockResetPassword = async (pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Authentication', 'Reset password: User initiated credential rotation verified under strict hashing policy.');
      
      // Update password change timestamp
      setDb(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === currentUser.id ? { ...u, passwordChangedAt: new Date().toISOString() } : u)
      }));
    }
    return { success: true, msg: 'Password policy rotation validated successfully and committed to local directories.' };
  };

  const mockVerifyMfa = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Let's assume any 6-digit code acts as valid check for robust UX playground
    if (!/^\d{6}$/.test(code)) {
      throw new Error('MFA Authentication error: Totp validation code must consist of exactly 6 numeric digits.');
    }

    // Retrieve temporary login user
    const tempUserStr = localStorage.getItem('iam_tmp_mfa_user');
    if (!tempUserStr) {
      throw new Error('MFA Context timeout: No temporary login user reference found.');
    }
    
    const matchedUser = JSON.parse(tempUserStr) as IAMUser;
    setCurrentUser(matchedUser);
    
    const newSessionId = `sess-${Date.now()}`;
    setActiveSessionId(newSessionId);
    selectProject(null); // Clear selected project on MFA verify!

    const newSession: IAMSession = {
      id: newSessionId,
      userId: matchedUser.id,
      userName: `${matchedUser.firstName} ${matchedUser.lastName}`,
      device: 'Apple MacBook Pro 14"',
      browser: 'Chrome 125.0',
      ipAddress: '197.35.48.92',
      location: 'Riyan Province, Saudi Arabia',
      lastActivity: 'Active Now',
      isActive: true
    };

    setDb(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions]
    }));

    triggerAuditRecord(matchedUser.id, `${matchedUser.firstName} ${matchedUser.lastName}`, 'Authentication', 'Completed second-factor Multi-Factor (MFA) TOTP challenge.');

    return { success: true, user: matchedUser };
  };

  // 5. User administration operations
  const addUser = (newUser: Omit<IAMUser, 'id' | 'lastLogin' | 'failedLoginAttempts' | 'tenantId'>) => {
    const id = `usr-${Date.now()}`;
    const userObj: IAMUser = {
      ...newUser,
      id,
      tenantId: 'tenant-1',
      lastLogin: '—',
      failedLoginAttempts: 0
    };

    setDb(prev => ({
      ...prev,
      users: [...prev.users, userObj]
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'User Management', `Created new employee identity user [${userObj.firstName} ${userObj.lastName}] with default Global Role.`);
    }
  };

  const updateUser = (id: string, updated: Partial<IAMUser>) => {
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updated } as IAMUser : u)
    }));

    // If active user is editing their own record, sync it
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? ({ ...prev, ...updated } as IAMUser) : null);
    }

    if (currentUser) {
      const targetUser = db.users.find(u => u.id === id);
      const name = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : id;
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'User Management', `Updated configuration parameters for user: ${name}.`);
    }
  };

  const deleteUser = (id: string) => {
    const targetUser = db.users.find(u => u.id === id);
    const name = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : id;

    setDb(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'User Management', `Archived and purged user identity record: ${name}.`);
    }
  };

  const assignUserProjectRole = (userId: string, projectId: string, roleId: string) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;

    const existingAccessIndex = user.projectAccess.findIndex(pa => pa.projectId === projectId);
    let updatedAccess = [...user.projectAccess];

    if (existingAccessIndex > -1) {
      updatedAccess[existingAccessIndex] = {
        ...updatedAccess[existingAccessIndex],
        roleId,
        status: 'Active'
      };
    } else {
      updatedAccess.push({
        projectId,
        roleId,
        status: 'Active',
        assignedDate: new Date().toISOString().split('T')[0]
      });
    }

    updateUser(userId, { projectAccess: updatedAccess });

    if (currentUser) {
      const projRole = db.roles.find(r => r.id === roleId)?.name || roleId;
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Project Access', `Assigned user ${user.firstName} ${user.lastName} project-level role: [${projRole}]`, projectId);
    }
  };

  const removeUserProjectAccess = (userId: string, projectId: string) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;

    const updatedAccess = user.projectAccess.filter(pa => pa.projectId !== projectId);
    updateUser(userId, { projectAccess: updatedAccess });

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Project Access', `Revoked project-level access for user ${user.firstName} ${user.lastName}.`, projectId);
    }
  };

  // 6. Role database actions
  const addRole = (newRole: Omit<IAMRole, 'userCount'>) => {
    const id = `role-${Date.now()}`;
    const roleObj: IAMRole = {
      ...newRole,
      id,
      userCount: 0
    };

    setDb(prev => ({
      ...prev,
      roles: [...prev.roles, roleObj]
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Roles & Permissions', `Created custom security Role profile: ${roleObj.name}.`);
    }
  };

  const updateRole = (id: string, updated: Partial<IAMRole>) => {
    setDb(prev => ({
      ...prev,
      roles: prev.roles.map(r => r.id === id ? { ...r, ...updated } as IAMRole : r)
    }));

    if (currentUser) {
      const role = db.roles.find(r => r.id === id);
      const name = role ? role.name : id;
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Roles & Permissions', `Modified policy statements and permission counts for Role context: ${name}.`);
    }
  };

  const deleteRole = (id: string) => {
    const role = db.roles.find(r => r.id === id);
    const name = role ? role.name : id;

    setDb(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.id !== id)
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Roles & Permissions', `Deleted corporate Role schema context: ${name}.`);
    }
  };

  // 7. Corporate Invitation modules
  const inviteUser = (email: string, roleId: string, projectIds: string[]) => {
    const newInvite: IAMInvitation = {
      id: `inv-${Date.now()}`,
      email,
      roleId,
      projects: projectIds,
      status: 'Pending',
      sentBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Admin',
      sentAt: new Date().toISOString(),
      expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 Day Expiry
    };

    setDb(prev => ({
      ...prev,
      invitations: [newInvite, ...prev.invitations]
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'User Management', `Issued corporate onboarding invitation to ${email}.`);
    }
  };

  const cancelInvite = (id: string) => {
    const target = db.invitations.find(i => i.id === id);
    if (!target) return;

    setDb(prev => ({
      ...prev,
      invitations: prev.invitations.map(i => i.id === id ? { ...i, status: 'Cancelled' as const } : i)
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'User Management', `Cancelled corporate invitation issued to: ${target.email}.`);
    }
  };

  const resendInvite = (id: string) => {
    const target = db.invitations.find(i => i.id === id);
    if (!target) return;

    setDb(prev => ({
      ...prev,
      invitations: prev.invitations.map(i => i.id === id ? { ...i, sentAt: new Date().toISOString(), status: 'Pending' as const } : i)
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'User Management', `Reissued and refreshed corporate workspace invitation for: ${target.email}.`);
    }
  };

  // 8. General Settings updates
  const updateSecuritySettings = (updated: Partial<SecuritySettings>) => {
    setDb(prev => {
      const ns = { ...prev.securitySettings, ...updated };
      return { ...prev, securitySettings: ns };
    });

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Roles & Permissions', 'Modified enterprise system directory security policies.');
    }
  };

  const updateBranding = (updated: Partial<TenantBranding>) => {
    setDb(prev => {
      const nb = { ...prev.branding, ...updated };
      return { ...prev, branding: nb };
    });

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Roles & Permissions', 'Updated company profile, tenant timezone, or branding parameters.');
    }
  };

  const terminateSession = (sessionId: string) => {
    const sessObj = db.sessions.find(s => s.id === sessionId);
    if (!sessObj) return;

    setDb(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId)
    }));

    if (currentUser) {
      triggerAuditRecord(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`, 'Authentication', `Forcibly terminated session on device: ${sessObj.device} (${sessObj.browser}).`);
    }

    if (sessionId === activeSessionId) {
      mockLogout();
    }
  };

  // 9. Permission Guard Evaluators
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    // System admin naturally overrides standard controls
    if (currentUser.globalRoleId === 'role-syst-admin') {
      return true;
    }

    return userPermissionsInActiveProject.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.globalRoleId === 'role-syst-admin') return true;
    return userRoleInActiveProject?.name.toLowerCase() === roleName.toLowerCase();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      selectedTenantId: 'tenant-1',
      activeSessionId,
      users: db.users,
      roles: db.roles,
      sessions: db.sessions,
      invitations: db.invitations,
      auditLogs: db.auditLogs,
      securitySettings: db.securitySettings,
      branding: db.branding,
      userRoleInActiveProject,
      userPermissionsInActiveProject,
      currentPath,
      navigateTo,
      mockLogin,
      mockLogout,
      mockForgotPassword,
      mockResetPassword,
      mockVerifyMfa,
      addUser,
      updateUser,
      deleteUser,
      assignUserProjectRole,
      removeUserProjectAccess,
      addRole,
      updateRole,
      deleteRole,
      inviteUser,
      cancelInvite,
      resendInvite,
      updateSecuritySettings,
      updateBranding,
      hasPermission,
      hasRole,
      terminateSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
