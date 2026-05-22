import { Project } from './types.ts';

export interface UserProjectAccess {
  projectId: string;
  roleId: string; // Role the user has IN THIS project
  status: 'Active' | 'Inactive' | 'Suspended' | 'Locked';
  assignedDate: string;
  expiryDate?: string;
}

export interface IAMUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  designation: string;
  department: string;
  employeeId: string;
  status: 'Active' | 'Suspended' | 'Locked' | 'Pending';
  lastLogin: string;
  tenantId: string;
  avatarColor: string;
  globalRoleId: string; // Global role context
  projectAccess: UserProjectAccess[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  passwordChangedAt: string;
  failedLoginAttempts: number;
}

export interface IAMRole {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissionCount: number;
  scope: 'Global' | 'Tenant' | 'Project-Specific' | 'Hybrid';
  permissions: string[]; // List of permission strings (e.g. ['BOQ.View', 'BOQ.Create'])
}

export interface IAMSession {
  id: string;
  userId: string;
  userName: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActivity: string;
  isActive: boolean;
}

export interface IAMInvitation {
  id: string;
  email: string;
  roleId: string;
  projects: string[]; // Project IDs assigned during invitation
  status: 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';
  sentBy: string;
  sentAt: string;
  expiryAt: string;
}

export interface IAMAuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  module: 'Authentication' | 'User Management' | 'Roles & Permissions' | 'Project Access' | 'BOQ' | 'Rate Analysis' | 'Progress' | 'Cost Control' | 'Procurement' | 'Billing';
  action: string;
  project?: string;
  projectId?: string;
  ipAddress: string;
}

// 1. Initial Roles & Permissions
export const INITIAL_ROLES: IAMRole[] = [
  {
    id: 'role-syst-admin',
    name: 'System Admin',
    description: 'Complete cross-tenant global administrative access to core cloud infrastructure and subscription modules.',
    userCount: 1,
    permissionCount: 22,
    scope: 'Global',
    permissions: [
      'BOQ.View', 'BOQ.Create', 'BOQ.Edit', 'BOQ.Delete', 'BOQ.Approve',
      'Rate.View', 'Rate.Create', 'Rate.Edit', 'Rate.Delete', 'Rate.Approve',
      'Resources.View', 'Resources.Create', 'Resources.Edit', 'Resources.Delete',
      'Projects.View', 'Projects.Create', 'Projects.Edit', 'Projects.Archive',
      'Billing.View', 'Billing.Create', 'Billing.Edit', 'Billing.Approve',
      'Progress.View', 'Progress.Create', 'Progress.Edit', 'Progress.Approve',
      'Procurement.View', 'Procurement.Create', 'Procurement.Edit', 'Procurement.Approve',
      'Admin.View', 'Admin.Edit'
    ]
  },
  {
    id: 'role-ten-admin',
    name: 'Tenant Admin',
    description: 'Complete administration over company workspace users, roles, settings, billing, credentials, and projects.',
    userCount: 2,
    permissionCount: 18,
    scope: 'Tenant',
    permissions: [
      'BOQ.View', 'BOQ.Create', 'BOQ.Edit', 'BOQ.Approve',
      'Rate.View', 'Rate.Create', 'Rate.Edit', 'Rate.Approve',
      'Resources.View', 'Resources.Create', 'Resources.Edit',
      'Projects.View', 'Projects.Create', 'Projects.Edit',
      'Billing.View', 'Billing.Create', 'Billing.Edit', 'Billing.Approve',
      'Progress.View', 'Progress.Create', 'Progress.Edit', 'Progress.Approve',
      'Procurement.View', 'Procurement.Create', 'Procurement.Edit', 'Procurement.Approve',
      'Admin.View', 'Admin.Edit'
    ]
  },
  {
    id: 'role-proj-dir',
    name: 'Project Director',
    description: 'Executive project-level controller overseeing milestones, budgets, IPC releases, and project teams.',
    userCount: 1,
    permissionCount: 14,
    scope: 'Project-Specific',
    permissions: [
      'BOQ.View', 'BOQ.Approve',
      'Rate.View', 'Rate.Approve',
      'Resources.View',
      'Projects.View', 'Projects.Edit',
      'Billing.View', 'Billing.Approve',
      'Progress.View', 'Progress.Approve',
      'Procurement.View', 'Procurement.Approve',
      'Admin.View'
    ]
  },
  {
    id: 'role-proj-mgr',
    name: 'Project Manager',
    description: 'Manages baseline schedules, task planning, daily progress tracking, resource allocations, and site engineering teams.',
    userCount: 4,
    permissionCount: 12,
    scope: 'Project-Specific',
    permissions: [
      'BOQ.View', 'BOQ.Create', 'BOQ.Edit',
      'Rate.View', 'Rate.Create',
      'Resources.View',
      'Projects.View',
      'Billing.View',
      'Progress.View', 'Progress.Create', 'Progress.Edit',
      'Procurement.View', 'Procurement.Create', 'Procurement.Edit'
    ]
  },
  {
    id: 'role-qs-eng',
    name: 'QS Engineer',
    description: 'Quantity Surveyor specializing in rate calculations, direct material takeoff, BOQ estimators, and billing submissions.',
    userCount: 2,
    permissionCount: 10,
    scope: 'Project-Specific',
    permissions: [
      'BOQ.View', 'BOQ.Create', 'BOQ.Edit',
      'Rate.View', 'Rate.Create', 'Rate.Edit',
      'Resources.View', 'Resources.Create', 'Resources.Edit',
      'Billing.View', 'Billing.Create', 'Billing.Edit'
    ]
  },
  {
    id: 'role-site-eng',
    name: 'Site Engineer',
    description: 'Supervises physical construction works, records daily progress logs, reports delays, and snaps site photos.',
    userCount: 3,
    permissionCount: 6,
    scope: 'Project-Specific',
    permissions: [
      'BOQ.View',
      'Rate.View',
      'Resources.View',
      'Progress.View', 'Progress.Create', 'Progress.Edit'
    ]
  },
  {
    id: 'role-proc-off',
    name: 'Procurement Officer',
    description: 'Directs purchase requests, coordinates with certified suppliers, issues RFQs, and monitors material deliveries.',
    userCount: 2,
    permissionCount: 6,
    scope: 'Project-Specific',
    permissions: [
      'Resources.View', 'Resources.Create', 'Resources.Edit',
      'Procurement.View', 'Procurement.Create', 'Procurement.Edit'
    ]
  },
  {
    id: 'role-store-kp',
    name: 'Store Keeper',
    description: 'Controls layout parameters, warehouse stock balances, GRN arrivals, and plant allocation ledgers.',
    userCount: 1,
    permissionCount: 4,
    scope: 'Project-Specific',
    permissions: [
      'Resources.View',
      'Procurement.View', 'Procurement.Create'
    ]
  },
  {
    id: 'role-fin-off',
    name: 'Finance Officer',
    description: 'Audit controller for cost tracking, currency parameters, budget vs actual variance, and certified payment tracks.',
    userCount: 2,
    permissionCount: 7,
    scope: 'Project-Specific',
    permissions: [
      'Projects.View',
      'Billing.View', 'Billing.Create', 'Billing.Edit',
      'Procurement.View'
    ]
  },
  {
    id: 'role-view',
    name: 'Viewer',
    description: 'Read-only stakeholder format (Client, Auditor, JV Partner) restricted to reports and read-only tables.',
    userCount: 3,
    permissionCount: 5,
    scope: 'Project-Specific',
    permissions: [
      'BOQ.View',
      'Rate.View',
      'Projects.View',
      'Progress.View',
      'Billing.View'
    ]
  }
];

export const INITIAL_USERS: IAMUser[] = [
  {
    id: 'usr-1',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@buildops.com',
    username: 'robert.chen',
    phone: '+1 (555) 302-9471',
    designation: 'Lead Quantity Surveyor & Director',
    department: 'Commercial & Costing',
    employeeId: 'BO-QS-092',
    status: 'Active',
    lastLogin: '2026-05-22T03:15:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-indigo-600',
    globalRoleId: 'role-ten-admin',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-qs-eng', status: 'Active', assignedDate: '2024-06-01' },
      { projectId: 'proj-2', roleId: 'role-proj-mgr', status: 'Active', assignedDate: '2024-08-01' },
      { projectId: 'proj-3', roleId: 'role-qs-eng', status: 'Active', assignedDate: '2023-01-15' }
    ],
    mfaEnabled: true,
    passwordChangedAt: '2026-04-10T12:00:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 's.johnson@buildops.com',
    username: 'sarah.j',
    phone: '+1 (555) 103-8842',
    designation: 'Senior Project Manager',
    department: 'Operations',
    employeeId: 'BO-PM-041',
    status: 'Active',
    lastLogin: '2026-05-22T02:40:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-emerald-600',
    globalRoleId: 'role-proj-mgr',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-proj-mgr', status: 'Active', assignedDate: '2024-06-01' },
      { projectId: 'proj-2', roleId: 'role-site-eng', status: 'Active', assignedDate: '2024-08-01' },
      { projectId: 'proj-3', roleId: 'role-proj-mgr', status: 'Active', assignedDate: '2023-01-15' }
    ],
    mfaEnabled: false,
    passwordChangedAt: '2025-11-20T10:30:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-3',
    firstName: 'Fahad',
    lastName: 'Al-Saud',
    email: 'fahad@emaar.com',
    username: 'fahad.director',
    phone: '+966 50 123 4567',
    designation: 'Client Project Director',
    department: 'Client Representative Unit',
    employeeId: 'EM-DIR-001',
    status: 'Active',
    lastLogin: '2026-05-21T18:30:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-amber-600',
    globalRoleId: 'role-proj-dir',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-proj-dir', status: 'Active', assignedDate: '2024-06-01' }
    ],
    mfaEnabled: true,
    passwordChangedAt: '2026-03-01T08:00:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-4',
    firstName: 'Sahan',
    lastName: 'Maduranga',
    email: 'sahan.maduranga@nordhealth.com',
    username: 'sahanm',
    phone: '+358 40 882 1293',
    designation: 'External Joint Venture Auditor',
    department: 'Joint Operations Committee',
    employeeId: 'BO-JV-887',
    status: 'Active',
    lastLogin: '2026-05-22T01:05:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-violet-600',
    globalRoleId: 'role-view',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-view', status: 'Active', assignedDate: '2024-06-01' }
    ],
    mfaEnabled: false,
    passwordChangedAt: '2026-05-01T15:20:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-5',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'm.brown@buildops.com',
    username: 'michael.b',
    phone: '+1 (555) 728-1192',
    designation: 'Structural Site Engineer',
    department: 'Engineering & QAQC',
    employeeId: 'BO-SE-109',
    status: 'Active',
    lastLogin: '2026-05-21T07:11:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-rose-600',
    globalRoleId: 'role-site-eng',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-site-eng', status: 'Active', assignedDate: '2024-06-01' },
      { projectId: 'proj-5', roleId: 'role-proj-mgr', status: 'Active', assignedDate: '2024-03-01' }
    ],
    mfaEnabled: false,
    passwordChangedAt: '2026-01-15T09:00:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-6',
    firstName: 'Youhana',
    lastName: 'Mikhail',
    email: 'y.mikhail@buildops.com',
    username: 'youhana.m',
    phone: '+1 (555) 441-9283',
    designation: 'Lead Logistics & Planning Specialist',
    department: 'Planning & SOT Control',
    employeeId: 'BO-PE-052',
    status: 'Active',
    lastLogin: '2026-05-21T11:45:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-teal-600',
    globalRoleId: 'role-proj-mgr',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-proj-mgr', status: 'Active', assignedDate: '2024-06-01' },
      { projectId: 'proj-4', roleId: 'role-proj-mgr', status: 'Active', assignedDate: '2026-09-01' }
    ],
    mfaEnabled: true,
    passwordChangedAt: '2026-02-14T11:00:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-7',
    firstName: 'Taruk',
    lastName: 'Mansour',
    email: 't.mansour@buildops.com',
    username: 'taruk.m',
    phone: '+966 53 881 2291',
    designation: 'Store Logistics Manager',
    department: 'Supply Chain Management',
    employeeId: 'BO-SC-204',
    status: 'Suspended',
    lastLogin: '2026-05-10T14:22:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-slate-600',
    globalRoleId: 'role-store-kp',
    projectAccess: [
      { projectId: 'proj-2', roleId: 'role-store-kp', status: 'Suspended', assignedDate: '2024-08-01' }
    ],
    mfaEnabled: false,
    passwordChangedAt: '2025-08-10T11:30:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-8',
    firstName: 'Aisha',
    lastName: 'Al-Ghamdi',
    email: 'a.ghamdi@buildops.com',
    username: 'aisha.g',
    phone: '+966 55 902 4455',
    designation: 'Financial Site Audit Controller',
    department: 'Finance & Compliance',
    employeeId: 'BO-FI-018',
    status: 'Active',
    lastLogin: '2026-05-22T03:02:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-pink-600',
    globalRoleId: 'role-fin-off',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-fin-off', status: 'Active', assignedDate: '2024-06-01' },
      { projectId: 'proj-3', roleId: 'role-fin-off', status: 'Active', assignedDate: '2023-01-15' }
    ],
    mfaEnabled: true,
    passwordChangedAt: '2026-05-18T10:00:00Z',
    failedLoginAttempts: 0
  },
  {
    id: 'usr-9',
    firstName: 'David',
    lastName: 'Miller',
    email: 'd.miller@buildops.com',
    username: 'david.miller',
    phone: '+1 (555) 902-8811',
    designation: 'Industrial Project Manager',
    department: 'Operations',
    employeeId: 'BO-PM-070',
    status: 'Locked',
    lastLogin: '2026-05-19T10:00:00Z',
    tenantId: 'tenant-1',
    avatarColor: 'bg-cyan-600',
    globalRoleId: 'role-proj-mgr',
    projectAccess: [
      { projectId: 'proj-2', roleId: 'role-proj-mgr', status: 'Locked', assignedDate: '2024-08-01' }
    ],
    mfaEnabled: false,
    passwordChangedAt: '2025-10-10T09:00:00Z',
    failedLoginAttempts: 5
  },
  {
    id: 'usr-10',
    firstName: 'Salma',
    lastName: 'Hakim',
    email: 's.hakim@buildops.com',
    username: 'salma.h',
    phone: '+966 50 882 1192',
    designation: 'Procurement Executive Officer',
    department: 'Supply Chain Management',
    employeeId: 'BO-SC-108',
    status: 'Pending',
    lastLogin: '—',
    tenantId: 'tenant-1',
    avatarColor: 'bg-primary-600',
    globalRoleId: 'role-proc-off',
    projectAccess: [
      { projectId: 'proj-1', roleId: 'role-proc-off', status: 'Active', assignedDate: '2026-05-20' }
    ],
    mfaEnabled: false,
    passwordChangedAt: '—',
    failedLoginAttempts: 0
  }
];

export const INITIAL_SESSIONS: IAMSession[] = [
  {
    id: 'sess-1',
    userId: 'usr-1',
    userName: 'Robert Chen',
    device: 'Apple MacBook Pro 16"',
    browser: 'Chrome 125.0',
    ipAddress: '197.35.48.92',
    location: 'Riyadh, Saudi Arabia',
    lastActivity: 'Active Now',
    isActive: true
  },
  {
    id: 'sess-2',
    userId: 'usr-1',
    userName: 'Robert Chen',
    device: 'Apple iPhone 15 Pro Max',
    browser: 'Safari Mobile 17.4',
    ipAddress: '94.201.35.228',
    location: 'Jeddah, Saudi Arabia',
    lastActivity: '12 minutes ago',
    isActive: true
  },
  {
    id: 'sess-3',
    userId: 'usr-2',
    userName: 'Sarah Johnson',
    device: 'Lenovo ThinkPad T14 Gen 4',
    browser: 'Microsoft Edge 124.0',
    ipAddress: '82.164.22.45',
    location: 'Riyadh, Saudi Arabia',
    lastActivity: '42 minutes ago',
    isActive: true
  },
  {
    id: 'sess-4',
    userId: 'usr-4',
    userName: 'Sahan Maduranga',
    device: 'Dell XPS 15 9530',
    browser: 'Chrome 125.0',
    ipAddress: '62.241.11.109',
    location: 'Helsinki, Finland',
    lastActivity: '1 hour ago',
    isActive: true
  },
  {
    id: 'sess-5',
    userId: 'usr-6',
    userName: 'Youhana Mikhail',
    device: 'iPad Pro 12.9" Cellular',
    browser: 'Safari Mobile 17.5',
    ipAddress: '91.73.44.11',
    location: 'Khobar, Saudi Arabia',
    lastActivity: '2 hours ago',
    isActive: true
  }
];

export const INITIAL_INVITATIONS: IAMInvitation[] = [
  {
    id: 'inv-1',
    email: 'khalid.al-turki@buildops.com',
    roleId: 'role-proj-mgr',
    projects: ['proj-2', 'proj-3'],
    status: 'Pending',
    sentBy: 'Robert Chen',
    sentAt: '2026-05-20T11:30:00Z',
    expiryAt: '2026-05-27T11:30:00Z'
  },
  {
    id: 'inv-2',
    email: 'john.smith@consultant.dar.com',
    roleId: 'role-view',
    projects: ['proj-1'],
    status: 'Expired',
    sentBy: 'Robert Chen',
    sentAt: '2026-05-10T09:00:00Z',
    expiryAt: '2026-05-17T09:00:00Z'
  },
  {
    id: 'inv-3',
    email: 'yasmin.h@buildops.com',
    roleId: 'role-site-eng',
    projects: ['proj-1'],
    status: 'Accepted',
    sentBy: 'Sarah Johnson',
    sentAt: '2026-05-18T10:15:00Z',
    expiryAt: '2026-05-25T10:15:00Z'
  },
  {
    id: 'inv-4',
    email: 'billing.clerk@buildops.com',
    roleId: 'role-fin-off',
    projects: ['proj-5'],
    status: 'Cancelled',
    sentBy: 'Robert Chen',
    sentAt: '2026-05-21T15:20:00Z',
    expiryAt: '2026-05-28T15:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: IAMAuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-05-22T03:15:00Z',
    user: 'Robert Chen',
    userId: 'usr-1',
    module: 'Authentication',
    action: 'Successful administrative login. Authentication completed via multi-factor TOTP verification.',
    ipAddress: '197.35.48.92'
  },
  {
    id: 'audit-2',
    timestamp: '2026-05-22T03:02:00Z',
    user: 'Aisha Al-Ghamdi',
    userId: 'usr-8',
    module: 'Authentication',
    action: 'Login completed successfully.',
    ipAddress: '94.205.112.5'
  },
  {
    id: 'audit-3',
    timestamp: '2026-05-22T01:05:00Z',
    user: 'Sahan Maduranga',
    userId: 'usr-4',
    module: 'Authentication',
    action: 'Successful login (Read-Only JV Stakeholder).',
    ipAddress: '62.241.11.109'
  },
  {
    id: 'audit-4',
    timestamp: '2026-05-21T16:45:00Z',
    user: 'Robert Chen',
    userId: 'usr-1',
    module: 'Project Access',
    action: 'Modified project permission parameters. Assigned Aisha Al-Ghamdi to Qiddiya Theme Park Project with role Finance Officer.',
    project: 'Qiddiya Theme Park Grid',
    projectId: 'proj-5',
    ipAddress: '197.35.48.92'
  },
  {
    id: 'audit-5',
    timestamp: '2026-05-21T15:20:00Z',
    user: 'Robert Chen',
    userId: 'usr-1',
    module: 'User Management',
    action: 'Issued corporate invitation with system metadata to billing.clerk@buildops.com.',
    ipAddress: '197.35.48.92'
  },
  {
    id: 'audit-6',
    timestamp: '2026-05-21T10:30:00Z',
    user: 'Sarah Johnson',
    userId: 'usr-2',
    module: 'Roles & Permissions',
    action: 'Duplicated template Role [Site Engineer] into newly optimized custom variant [Assistant Site Inspector].',
    ipAddress: '82.164.22.45'
  },
  {
    id: 'audit-7',
    timestamp: '2026-05-20T14:40:00Z',
    user: 'Robert Chen',
    userId: 'usr-1',
    module: 'BOQ',
    action: 'Approved Bill Of Quantities Revision Schedule BOQ-CIV-CONC-R3.',
    project: 'Skyline Residence Towers',
    projectId: 'proj-1',
    ipAddress: '197.35.48.92'
  },
  {
    id: 'audit-8',
    timestamp: '2026-05-19T10:00:00Z',
    user: 'System Controller',
    userId: 'sys-control',
    module: 'Authentication',
    action: 'Account locked: David Miller suspended due to exceeding maximum failed authentication limit (5 attempts).',
    ipAddress: '127.0.0.1'
  }
];

export interface SecuritySettings {
  passwordComplexity: 'Simple' | 'Medium' | 'Strict';
  passwordExpiryDays: number;
  mfaEnforcement: 'None' | 'Admin' | 'All';
  rememberMeDays: number;
  lockoutAttempts: number;
  lockoutMinutes: number;
  sessionTimeoutMinutes: number;
}

export const INITIAL_SECURITY_SETTINGS: SecuritySettings = {
  passwordComplexity: 'Strict',
  passwordExpiryDays: 90,
  mfaEnforcement: 'Admin',
  rememberMeDays: 30,
  lockoutAttempts: 5,
  lockoutMinutes: 15,
  sessionTimeoutMinutes: 60
};

export interface TenantBranding {
  companyName: string;
  subdomain: string;
  primaryColor: string;
  timezone: string;
  currency: string;
  language: string;
  fiscalYearStart: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
}

export const INITIAL_BRANDING: TenantBranding = {
  companyName: 'BuildOps Infra Group Ltd',
  subdomain: 'buildops-saudi',
  primaryColor: '#0c8724',
  timezone: 'Asia/Riyadh (UTC+3)',
  currency: 'USD',
  language: 'English',
  fiscalYearStart: 'January 1st',
  contactEmail: 'hq.admin@buildops.com',
  contactPhone: '+966 11 405 9200'
};

// State Helper for LocalStorage Persistence
export function loadIAMData() {
  const getOrSet = (key: string, defaults: any) => {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  };

  return {
    users: getOrSet('iam_users', INITIAL_USERS) as IAMUser[],
    roles: getOrSet('iam_roles', INITIAL_ROLES) as IAMRole[],
    sessions: getOrSet('iam_sessions', INITIAL_SESSIONS) as IAMSession[],
    invitations: getOrSet('iam_invitations', INITIAL_INVITATIONS) as IAMInvitation[],
    auditLogs: getOrSet('iam_audit_logs', INITIAL_AUDIT_LOGS) as IAMAuditLog[],
    securitySettings: getOrSet('iam_security_settings', INITIAL_SECURITY_SETTINGS) as SecuritySettings,
    branding: getOrSet('iam_branding', INITIAL_BRANDING) as TenantBranding,
  };
}

export function saveIAMData(data: {
  users?: IAMUser[];
  roles?: IAMRole[];
  sessions?: IAMSession[];
  invitations?: IAMInvitation[];
  auditLogs?: IAMAuditLog[];
  securitySettings?: SecuritySettings;
  branding?: TenantBranding;
}) {
  if (data.users) localStorage.setItem('iam_users', JSON.stringify(data.users));
  if (data.roles) localStorage.setItem('iam_roles', JSON.stringify(data.roles));
  if (data.sessions) localStorage.setItem('iam_sessions', JSON.stringify(data.sessions));
  if (data.invitations) localStorage.setItem('iam_invitations', JSON.stringify(data.invitations));
  if (data.auditLogs) localStorage.setItem('iam_audit_logs', JSON.stringify(data.auditLogs));
  if (data.securitySettings) localStorage.setItem('iam_security_settings', JSON.stringify(data.securitySettings));
  if (data.branding) localStorage.setItem('iam_branding', JSON.stringify(data.branding));
}
