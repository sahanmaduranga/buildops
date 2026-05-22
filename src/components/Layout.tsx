import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Warehouse, 
  Calculator, 
  FileText, 
  Truck, 
  Package, 
  Calendar, 
  ShieldAlert, 
  CreditCard, 
  Users, 
  BarChart3,
  TrendingUp,
  Menu,
  ChevronLeft,
  Search,
  Bell,
  User,
  Settings,
  X,
  MapPin,
  Ruler,
  Layers,
  Database,
  Archive,
  ChevronDown,
  ChevronRight,
  Pin,
  Lock,
  Compass,
  Briefcase,
  HelpCircle,
  Activity,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { useProject } from '../context/ProjectContext.tsx';
import { ProjectSelectorModal } from './ProjectSelectorModal.tsx';
import { ProjectCreationWizard } from './ProjectCreationWizard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { LogOut, LayoutGrid, ShieldAlert as PolicyIcon, Shield, Mail, Globe } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  subItems?: { id: string, label: string }[];
  activeSubTab?: string;
  activeTab?: string;
  onSubItemClick?: (id: string) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  [key: string]: any;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  collapsed, 
  subItems, 
  activeSubTab,
  activeTab,
  onSubItemClick,
  expanded,
  onToggleExpand
}: SidebarItemProps) => {
  const hasSubItems = subItems && subItems.length > 0;

  return (
    <div className="flex flex-col text-[13px]">
      <button
        onClick={() => {
          if (hasSubItems) {
            onToggleExpand?.();
          } else {
            onClick?.();
          }
        }}
        className={cn(
          "flex items-center justify-between px-4 py-2.5 mx-3 my-0.5 rounded-lg transition-all text-left font-medium relative group cursor-pointer",
          active 
            ? "bg-primary-600 text-white font-bold" 
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon size={16} className={cn("flex-shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
          {!collapsed && <span className="truncate pr-1">{label}</span>}
        </div>

        {!collapsed && hasSubItems && (
          <span className="text-slate-400 group-hover:text-white shrink-0 ml-1">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}

        {collapsed && (
          <div className="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all whitespace-nowrap z-50 shadow-md font-normal">
            {label}
          </div>
        )}
      </button>

      {/* Sub menu items if expanded and not collapsed */}
      {!collapsed && hasSubItems && expanded && (
        <div className="ml-10 pr-4 flex flex-col gap-1 border-l border-white/10 my-1 animate-slide-up">
          {subItems.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSubItemClick?.(sub.id)}
              className={cn(
                "py-1.5 px-3 rounded-md text-left text-xs transition-colors hover:text-white font-medium cursor-pointer",
                // Check if this submenu item is active (either via activeSubTab or activeTab matching the sub.id)
                (activeSubTab === sub.id || activeTab === sub.id)
                  ? "text-primary-400 font-bold" 
                  : "text-slate-400"
              )}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
  isWizardOpen?: boolean;
  setIsWizardOpen?: (open: boolean) => void;
}

export const AppLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  activeSubTab, 
  setActiveSubTab,
  isWizardOpen: isWizardOpenProp,
  setIsWizardOpen: setIsWizardOpenProp
}: LayoutProps) => {
  const { currentProject, selectProject } = useProject();
  const { currentUser, mockLogout, navigateTo } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  
  // Modals for switcher
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isWizardOpenLocal, setIsWizardOpenLocal] = useState(false);

  const isWizardOpen = isWizardOpenProp !== undefined ? isWizardOpenProp : isWizardOpenLocal;
  const setIsWizardOpen = setIsWizardOpenProp !== undefined ? setIsWizardOpenProp : setIsWizardOpenLocal;

  // Auto-expand Administration menu when an admin page is active
  React.useEffect(() => {
    if (activeTab.startsWith('admin-') && !expandedMenus.includes('administration')) {
      setExpandedMenus([...expandedMenus, 'administration']);
    }
  }, [activeTab]);

  const toggleMenu = (id: string) => {
    if (expandedMenus.includes(id)) {
      setExpandedMenus(expandedMenus.filter(m => m !== id));
    } else {
      setExpandedMenus([...expandedMenus, id]);
    }
  };

  // Define two lists of menus: Portfolio view (project unselected) and Workspace view (project active)
  const portfolioMenu = [
    { id: 'dashboard', label: 'Portfolio Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'All Projects', icon: Building2 },
    { id: 'archived-projects', label: 'Archived Projects', icon: Archive },
    {
      id: 'administration',
      label: 'Administration',
      icon: ShieldAlert,
      subItems: [
        { id: 'admin-users', label: 'User Management' },
        { id: 'admin-roles', label: 'Roles & Permissions' },
        { id: 'admin-project-access', label: 'Project Access' },
        { id: 'admin-invitations', label: 'Invitations' },
        { id: 'admin-security', label: 'Security Rules' },
        { id: 'admin-audit-logs', label: 'Audit Logs' },
        { id: 'admin-branding', label: 'Tenant Branding' },
        { id: 'admin-auth-policies', label: 'Auth Policies' },
      ]
    },
  ];

  const workspaceMenu = [
    { id: 'project-overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'boq', 
      label: 'BOQ Management', 
      icon: FileText,
      subItems: [
        { id: 'boq-dashboard', label: 'BOQ Dashboard' },
        { id: 'boq-list', label: 'BOQ Schedule List' },
        { id: 'boq-builder', label: 'BOQ Builder / Estimator' },
        { id: 'boq-versions', label: 'Versions & Baselines' },
        { id: 'boq-comparison', label: 'Revision Comparison' },
        { id: 'boq-resource-analysis', label: 'Resource Analysis' },
        { id: 'boq-cost-summary', label: 'Cost Summary' },
        { id: 'boq-import-export', label: 'Spreadsheet Integrator' },
        { id: 'boq-reports', label: 'QS Reports' }
      ]
    },
    { 
      id: 'rate-analysis', 
      label: 'Rate Analysis', 
      icon: Calculator,
      subItems: [
        { id: 'rate-analysis-dashboard', label: 'Dashboard' },
        { id: 'rate-analysis-list', label: 'Rate Analysis List' },
        { id: 'rate-analysis-builder', label: 'Rate Builder' },
        { id: 'rate-analysis-resource-costing', label: 'Resource Costing' },
        { id: 'rate-analysis-comparison', label: 'Analysis Comparison' },
        { id: 'rate-analysis-templates', label: 'Templates' },
        { id: 'rate-analysis-import-export', label: 'Import / Export' },
        { id: 'rate-analysis-reports', label: 'Reports' }
      ]
    },
    { 
      id: 'resource-management', 
      label: 'Resource Management', 
      icon: Warehouse,
      subItems: [
        { id: 'resource-dashboard', label: 'Dashboard' },
        { id: 'resource-list', label: 'Resources Ledger' },
        { id: 'resource-categories', label: 'Categories' },
        { id: 'resource-suppliers', label: 'Suppliers' },
        { id: 'resource-prices', label: 'Price Matrix' },
        { id: 'resource-analytics', label: 'Resource Analytics' },
        { id: 'resource-import-export', label: 'Import/Export' },
        { id: 'resource-reports', label: 'Reports' }
      ]
    },
    { 
      id: 'master-data', 
      label: 'Master Data', 
      icon: Database,
      subItems: [
        { id: 'master-regions', label: 'Regions' },
        { id: 'master-periods', label: 'Periods' },
        { id: 'master-units', label: 'Units' },
        { id: 'master-types', label: 'Resource Types' }
      ]
    },
    { 
      id: 'planning', 
      label: 'Project Planning', 
      icon: Calendar,
      subItems: [
        { id: 'sot-dashboard', label: 'SOT Dashboard' },
        { id: 'sot-list', label: 'SOT List' },
        { id: 'sot-planner', label: 'Task Planner' },
        { id: 'sot-gantt', label: 'Gantt View' },
        { id: 'sot-forecast', label: 'Resource Forecast' },
        { id: 'sot-baselines', label: 'Baselines' },
        { id: 'sot-reports', label: 'Reports' },
      ]
    },
    { 
      id: 'progress-management', 
      label: 'Progress Management', 
      icon: TrendingUp,
      subItems: [
        { id: 'progress-dashboard', label: 'Dashboard' },
        { id: 'progress-tracking', label: 'Progress Tracking' },
        { id: 'progress-logs', label: 'Daily Progress Logs' },
        { id: 'progress-delays', label: 'Delay Management' },
        { id: 'progress-productivity', label: 'Productivity Analysis' },
        { id: 'progress-scurve', label: 'S-Curve Analysis' },
        { id: 'progress-eva', label: 'Earned Value (EVA)' },
        { id: 'progress-approvals', label: 'Progress Approvals' },
        { id: 'progress-photos', label: 'Site Photos' },
        { id: 'progress-forecasting', label: 'Forecasting' },
      ]
    },
    { 
      id: 'commercial', 
      label: 'Commercial Management', 
      icon: CreditCard,
      subItems: [
        { id: 'commercial-dashboard', label: 'Dashboard' },
        { id: 'commercial-ipc', label: 'IPC Management' },
        { id: 'commercial-client-billing', label: 'Client Billing' },
        { id: 'commercial-contractor-billing', label: 'Contractor Billing' },
        { id: 'commercial-retention', label: 'Retention Management' },
        { id: 'commercial-advance-recovery', label: 'Advance Recovery' },
        { id: 'commercial-variations', label: 'Variations & Change' },
        { id: 'commercial-payments', label: 'Payment Tracking' },
        { id: 'commercial-claims', label: 'Claims' },
        { id: 'commercial-forecast', label: 'Forecast Billing' },
        { id: 'commercial-reports', label: 'Commercial Reports' },
      ]
    },
    { 
      id: 'cost-control', 
      label: 'Cost Control', 
      icon: ShieldAlert,
      subItems: [
        { id: 'cost-dashboard', label: 'Dashboard' },
        { id: 'cost-budgets', label: 'Budgets' },
        { id: 'cost-tracking', label: 'Cost Tracking' },
        { id: 'cost-budget-vs-actual', label: 'Budget vs Actual' },
        { id: 'cost-forecasting', label: 'Forecasting' },
        { id: 'cost-cashflow', label: 'Cash Flow' },
        { id: 'cost-reports', label: 'Reports' },
      ]
    },
    { 
      id: 'procurement', 
      label: 'Procurement & Inventory', 
      icon: Truck,
      subItems: [
        { id: 'procurement-dashboard', label: 'Dashboard' },
        { id: 'procurement-purchase-requests', label: 'Purchase Requests' },
        { id: 'procurement-rfqs', label: 'RFQs & Quotations' },
        { id: 'procurement-purchase-orders', label: 'Purchase Orders' },
        { id: 'procurement-grn', label: 'Goods Receipt (GRN)' },
        { id: 'procurement-suppliers', label: 'Suppliers & Warehouses' },
        { id: 'procurement-inventory', label: 'Inventory Explorer' },
        { id: 'procurement-equipment', label: 'Equipment & Plant' },
        { id: 'procurement-reports', label: 'SCM Reports Hub' }
      ]
    },
    { id: 'project-documents', label: 'Project Documents', icon: FolderOpen },
    { id: 'project-calendar', label: 'Project Calendar', icon: Calendar },
    { id: 'project-teams', label: 'Project Teams', icon: Users },
    { id: 'project-settings', label: 'Project Settings', icon: Settings },
    {
      id: 'administration',
      label: 'Administration',
      icon: ShieldAlert,
      subItems: [
        { id: 'admin-users', label: 'User Management' },
        { id: 'admin-roles', label: 'Roles & Permissions' },
        { id: 'admin-project-access', label: 'Project Access' },
        { id: 'admin-invitations', label: 'Invitations' },
        { id: 'admin-security', label: 'Security Rules' },
        { id: 'admin-audit-logs', label: 'Audit Logs' },
        { id: 'admin-branding', label: 'Tenant Branding' },
        { id: 'admin-auth-policies', label: 'Auth Policies' },
      ]
    },
  ];

  const currentMenu = currentProject ? workspaceMenu : portfolioMenu;

  return (
    <div className="flex h-screen bg-zentrix-gray overflow-hidden">
      
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: collapsed ? 64 : 270 }}
        animate={{ width: collapsed ? 64 : 270 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-zentrix-blue relative z-30 shadow-lg"
      >
        {/* Core App Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5 bg-slate-950/25">
          <div className="relative w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-900/20">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            <span className="text-white font-black text-lg leading-none italic select-none tracking-tight">B</span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#152033] shadow-sm" />
          </div>
          {!collapsed && (
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-[17px] tracking-tight leading-none font-extrabold text-white">
                Build<span className="text-primary-400 font-semibold">Ops</span>
              </h1>
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1 block truncate">
                Enterprise Application
              </span>
            </div>
          )}
        </div>

        {/* Project Selector Under Sidebar Header (Procore/Clickup Style) */}
        {!collapsed ? (
          <div className="mx-3 my-4 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/90 relative shadow-inner">
            {currentProject ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-primary-600/30 text-primary-300 border border-primary-500/30 rounded">
                    {currentProject.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <h4 className="font-bold truncate mt-2 text-[12.5px] text-white" title={currentProject.name}>
                  {currentProject.name}
                </h4>
                <div className="flex items-center justify-between mt-3 text-[10.5px] text-slate-400">
                  <button 
                    onClick={() => selectProject(null)}
                    className="hover:text-white text-slate-400 hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-0.5 font-bold"
                  >
                    ← All Projects
                  </button>
                  <button 
                    onClick={() => setIsSelectorOpen(true)}
                    className="text-primary-400 hover:text-white font-bold bg-transparent cursor-pointer flex items-center gap-1 border-none"
                  >
                    Switch ▼
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-1.5">
                <p className="text-slate-400 font-medium">No Project Open</p>
                <button 
                  onClick={() => setIsSelectorOpen(true)}
                  className="mt-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs leading-none transition-all cursor-pointer shadow-md"
                >
                  Select Project ▼
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="my-4 mx-auto">
            <button 
              onClick={() => setIsSelectorOpen(true)}
              className="w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Switch project context selector"
            >
              <Briefcase size={16} />
            </button>
          </div>
        )}

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto mt-1 pb-4">
          {currentMenu.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id || (item.id === 'administration' && activeTab.startsWith('admin-'))}
              collapsed={collapsed}
              subItems={(item as any).subItems}
              activeSubTab={activeSubTab}
              activeTab={activeTab}
              onSubItemClick={(subId) => {
                // For administration submenu, set activeTab to the actual admin page (e.g., 'admin-users')
                if (item.id === 'administration') {
                  setActiveTab(subId);
                  setActiveSubTab?.('');
                } else {
                  // For other menus with subItems, keep the parent as activeTab
                  setActiveTab(item.id);
                  setActiveSubTab?.(subId);
                }
              }}
              expanded={expandedMenus.includes(item.id)}
              onToggleExpand={() => toggleMenu(item.id)}
              onClick={() => {
                setActiveTab(item.id);
                if ((item as any).subItems) {
                  if (!expandedMenus.includes(item.id)) toggleMenu(item.id);
                }
              }}
            />
          ))}
        </nav>

        {/* Sidebar Footer settings */}
        <div className="p-4 flex items-center gap-3 text-white/50 border-t border-white/5 bg-slate-950/15">
          <Settings size={16} className="cursor-pointer hover:text-white" />
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wide">ZENTRIX SYSTEM v4.5</span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-zentrix-border rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-500 shadow z-40 cursor-pointer"
        >
          {collapsed ? <Menu size={11} /> : <ChevronLeft size={11} />}
        </button>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-64 bg-zentrix-blue z-50 md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-900/20">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    <span className="text-white font-black text-lg leading-none italic select-none tracking-tight">B</span>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#152033] shadow-sm" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h1 className="text-[17px] tracking-tight leading-none font-extrabold text-white">
                      Build<span className="text-primary-400 font-semibold">Ops</span>
                    </h1>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1 block truncate">
                      Enterprise Application
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 cursor-pointer"><X size={20} /></button>
              </div>

              {/* Mobile Project Switcher Area */}
              <div className="mx-4 my-3 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/90">
                {currentProject ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold truncate text-white">{currentProject.name}</span>
                    <button onClick={() => setIsSelectorOpen(true)} className="text-primary-400 shrink-0 uppercase font-black tracking-wider text-[10px]">Change ▼</button>
                  </div>
                ) : (
                  <button onClick={() => setIsSelectorOpen(true)} className="w-full text-center py-1 bg-primary-600 text-white font-bold rounded-lg text-xs">Open Workspace Context</button>
                )}
              </div>

              <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto text-white">
                {currentMenu.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id || (item.id === 'administration' && activeTab.startsWith('admin-'))}
                    collapsed={false}
                    subItems={(item as any).subItems}
                    activeSubTab={activeSubTab}
                    activeTab={activeTab}
                    onSubItemClick={(subId) => {
                      // For administration submenu, set activeTab to the actual admin page (e.g., 'admin-users')
                      if (item.id === 'administration') {
                        setActiveTab(subId);
                        setActiveSubTab?.('');
                      } else {
                        // For other menus with subItems, keep the parent as activeTab
                        setActiveTab(item.id);
                        setActiveSubTab?.(subId);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    expanded={expandedMenus.includes(item.id)}
                    onToggleExpand={() => toggleMenu(item.id)}
                    onClick={() => {
                      setActiveTab(item.id);
                      if ((item as any).subItems) {
                        if (!expandedMenus.includes(item.id)) toggleMenu(item.id);
                      } else {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-[56px] bg-white border-b border-zentrix-border flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-zentrix-muted hover:bg-slate-50 rounded-lg"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Context Chain */}
            <div className="hidden md:flex items-center gap-2.5 text-xs font-bold text-slate-500">
              <span className="hover:text-primary-600 cursor-pointer" onClick={() => selectProject(null)}>Projects</span>
              <ChevronRight size={13} className="text-slate-300" />
              {currentProject ? (
                <>
                  <span className="text-primary-600 truncate max-w-[150px]" onClick={() => setIsSelectorOpen(true)}>
                    {currentProject.name}
                  </span>
                  <ChevronRight size={13} className="text-slate-300" />
                  <span className="text-slate-800 capitalize">{activeTab.replace('project-', '').replace('-', ' ')}</span>
                  {activeSubTab && (
                    <>
                      <ChevronRight size={13} className="text-slate-300" />
                      <span className="text-slate-400 capitalize">{activeSubTab.replace('sot-', '').replace('progress-', '').replace('-', ' ')}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-slate-800">Portfolio Deck</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Context Selector (Top Panel) */}
            <div className="flex items-center gap-2 pr-4 border-r border-zentrix-border">
              {currentProject ? (
                <div 
                  onClick={() => setIsSelectorOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-primary-50/70 hover:bg-primary-100/70 border border-primary-100 rounded-lg py-1 px-3 cursor-pointer transition-all shrink-0"
                >
                  <span className="text-[10px] bg-primary-600 text-white font-black px-1.5 py-0.5 rounded uppercase leading-none tracking-wider">
                    {currentProject.code}
                  </span>
                  <span className="max-w-[120px] truncate">{currentProject.name}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>
              ) : (
                <div 
                  onClick={() => setIsSelectorOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1 px-3 cursor-pointer transition-all shrink-0"
                >
                  <span>Switch Project Context</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>
              )}
            </div>

            <button className="p-2 text-zentrix-muted hover:bg-slate-50 rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-2.5 relative">
              <div className="text-right hidden sm:block select-none">
                <p className="text-[12.5px] font-bold text-zentrix-blue">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
                </p>
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">
                  {currentUser ? currentUser.designation : 'Unauthorized'}
                </p>
              </div>

              {/* Interactive Avatar button */}
              <button 
                onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                className={cn(
                  "w-8.5 h-8.5 rounded-full border flex items-center justify-center text-white font-black text-xs uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all outline-none",
                  currentUser ? currentUser.avatarColor : "bg-slate-400 border-slate-500"
                )}
              >
                {currentUser ? `${currentUser.firstName[0]}${currentUser.lastName[0]}` : '??'}
              </button>

              {isAvatarDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setIsAvatarDropdownOpen(false)} />
                  <div className="absolute right-0 top-10 w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl z-[70] py-1.5 flex flex-col text-left font-sans text-xs text-slate-600 animate-slide-up">
                    <div className="px-3.5 py-2 border-b border-slate-100 select-none">
                      <p className="font-bold text-zentrix-blue truncate">{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate leading-normal">{currentUser ? currentUser.email : 'No session linked'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsAvatarDropdownOpen(false);
                        if (currentUser) {
                          setActiveTab(`admin-users-detail-${currentUser.id}`);
                        }
                      }}
                      className="px-3.5 py-2.5 hover:bg-slate-50 text-left text-xs text-slate-700 font-bold flex items-center gap-2 w-full cursor-pointer leading-none"
                    >
                      👤 My Cloud Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsAvatarDropdownOpen(false);
                        mockLogout();
                      }}
                      className="px-3.5 py-2.5 hover:bg-rose-50 text-left text-xs text-rose-600 font-extrabold flex items-center gap-2 w-full border-t border-slate-100 mt-1.5 cursor-pointer leading-none"
                    >
                      <LogOut size={12} />
                      Log Out Platform
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5 scroll-smooth content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeSubTab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Enterprise Project Switcher modal */}
      <ProjectSelectorModal 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectProject={(id) => {
          selectProject(id);
          // Auto route to project overview when switching workspace
          if (id) {
            setActiveTab('project-overview');
          } else {
            setActiveTab('dashboard');
          }
        }}
        onOpenCreateProject={() => setIsWizardOpen(true)}
      />

      {/* Clone/Creation Wizard */}
      <ProjectCreationWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
};
