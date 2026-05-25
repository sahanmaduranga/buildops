import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/Layout.tsx';
import { TenderProvider } from './context/TenderContext.tsx';
import { TenderManagementShell } from './components/TenderManagement.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ResourceManagement } from './components/ResourceManagement.tsx';
import { RateAnalysisScreen } from './components/RateAnalysis.tsx';
import { BOQManagement } from './components/BOQManagement.tsx';
import { RegionManagement } from './components/Regions.tsx';
import { PeriodManagement } from './components/Periods.tsx';
import { UnitManagement } from './components/Units.tsx';
import { ResourceTypeManagement } from './components/ResourceTypes.tsx';
import { BOQList } from './components/BOQList.tsx';
import { BOQDashboard } from './components/boq/BOQDashboard.tsx';
import { BOQVersions } from './components/BOQVersions.tsx';
import { BOQComparison } from './components/BOQComparison.tsx';
import { BOQReports } from './components/BOQReports.tsx';
import { 
  Package, 
  Truck, 
  Calendar, 
  ShieldAlert, 
  CreditCard, 
  Users, 
  BarChart3, 
  MapPin, 
  Ruler, 
  Layers, 
  ArrowLeft,
  FileText,
  Building2,
  FolderOpen,
  Settings,
  Archive,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { MOCK_RATE_ANALYSES, MOCK_RESOURCES, MOCK_BOQ, MOCK_SOTS } from './mockData.ts';
import { type RateAnalysis, type Resource, type BOQItem, type SOT } from './types.ts';
import { getGlobalResources, getGlobalAnalyses } from './utils/masterLibraryImportUtils.ts';
import { SOTDashboard } from './components/SOTDashboard.tsx';
import { SOTList } from './components/SOTList.tsx';
import { SOTPlanner } from './components/SOTPlanner.tsx';
import { SOTGantt } from './components/SOTGantt.tsx';
import { SOTResourceForecast } from './components/SOTResourceForecast.tsx';
import { SOTBaselines } from './components/SOTBaselines.tsx';
import { ProgressDashboard } from './components/progress/ProgressDashboard.tsx';
import { ProgressTracker } from './components/progress/ProgressTracker.tsx';
import { DailyProgressLogs } from './components/progress/DailyProgressLogs.tsx';
import { DelayManagement } from './components/progress/DelayManagement.tsx';
import { ProductivityAnalysis } from './components/progress/ProductivityAnalysis.tsx';
import { SCurveAnalysis } from './components/progress/SCurveAnalysis.tsx';
import { EarnedValueAnalysis } from './components/progress/EarnedValueAnalysis.tsx';
import { ProgressApprovals } from './components/progress/ProgressApprovals.tsx';
import { SitePhotos } from './components/progress/SitePhotos.tsx';
import { ForecastingAnalytics } from './components/progress/Forecasting.tsx';

// Project module modular components
import { ProjectProvider, useProject } from './context/ProjectContext.tsx';
import { ProjectPortfolio } from './components/ProjectPortfolio.tsx';
import { CommercialProvider } from './context/CommercialContext.tsx';
import { CommercialModule } from './components/commercial/CommercialModule.tsx';
import { CostControlModule } from './components/cost/CostControlModule.tsx';
import ProcurementModule from './components/procurement/ProcurementModule.tsx';
import { ProjectWorkspaceDashboard } from './components/ProjectWorkspaceDashboard.tsx';
import { ProjectTeams } from './components/ProjectTeams.tsx';
import { ProjectDocuments } from './components/ProjectDocuments.tsx';
import { ProjectCalendar } from './components/ProjectCalendar.tsx';
import { ProjectSettings } from './components/ProjectSettings.tsx';

import { ProgressProvider } from './context/ProgressContext.tsx';
import { BOQProvider, useBOQ } from './context/BOQContext.tsx';
import { SubcontractProvider } from './context/SubcontractContext.tsx';
import { SubcontractorRegistry } from './components/subcontract/SubcontractorRegistry.tsx';
import { SubcontractManagement } from './components/SubcontractManagement.tsx';

// IAM Module Components & Contexts
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import AuthPages from './components/admin/AuthPages.tsx';
import { 
  UserDetailPage, 
  RoleDetailPage, 
  TenatOrganizationSettingsPanel, 
  InvitationsPanel 
} from './components/admin/AdminPages.tsx';
import { UserTable } from './components/admin/UserTable.tsx';
import { RoleCard } from './components/admin/RoleCard.tsx';
import { SessionGrid } from './components/admin/SessionGrid.tsx';
import { AuditTable } from './components/admin/AuditTable.tsx';
import { SecurityCard } from './components/admin/SecurityCard.tsx';
import { InviteUserDrawer } from './components/admin/InviteUserDrawer.tsx';
import { ProjectAccessGrid } from './components/admin/ProjectAccessGrid.tsx';
import { Plus, UserPlus } from 'lucide-react';

const PlaceholderModule = ({ name, icon: Icon }: { name: string, icon: any }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-zentrix-border rounded-lg shadow-sm">
    <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-6 border border-slate-100 italic shadow-inner">
       <Icon size={32} />
    </div>
    <h2 className="text-xl font-bold text-zentrix-blue mb-2">{name} Module</h2>
    <p className="text-slate-500 max-w-sm mx-auto mb-8 text-[13px] leading-relaxed">
      The {name.toLowerCase()} enterprise module is currently being optimized for high-performance scale.
    </p>
    <div className="flex gap-3">
       <button className="px-6 py-2 bg-primary-600 text-white rounded-md text-[13px] font-medium shadow-sm hover:bg-primary-700 transition-all cursor-pointer">Request Access</button>
       <button className="px-6 py-2 bg-white border border-zentrix-border text-slate-600 rounded-md text-[13px] font-medium hover:bg-slate-50 transition-all">Documentation</button>
    </div>
  </div>
);

function AppWorkspace() {
  const { currentProject, selectProject, projects, cloneProject } = useProject();
  
  // Auth state pulling
  const { currentUser, currentPath, users, roles, sessions, auditLogs, securitySettings, addRole, deleteRole, updateSecuritySettings } = useAuth();

  // Route/Tab state
  const [activeTab, setActiveTab] = useState(() => {
    return currentProject ? 'project-overview' : 'project-management';
  });
  const [activeSubTab, setActiveSubTab] = useState(() => {
    return currentProject ? 'sot-dashboard' : 'dashboard';
  });
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Admin sub-route tracking
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string | null>(null);
  const [selectedAdminRoleId, setSelectedAdminRoleId] = useState<string | null>(null);
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  
  const { selectedBOQId, setSelectedBOQId, createNewBOQ } = useBOQ();
  const [selectedSOTId, setSelectedSOTId] = useState<string | null>(null);
  
  // Lifted state
  const [analyses, setAnalyses] = useState<RateAnalysis[]>(MOCK_RATE_ANALYSES);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  
  // Clean persistent Global Corporate Master tables
  const [globalResources, setGlobalResources] = useState<Resource[]>(() => getGlobalResources());
  const [globalAnalyses, setGlobalAnalyses] = useState<RateAnalysis[]>(() => getGlobalAnalyses());

  const [boqList, setBoqList] = useState<BOQItem[]>(MOCK_BOQ);
  const [sots, setSots] = useState<SOT[]>(MOCK_SOTS);

  // Dynamic redirect if user custom loads direct profiles
  useEffect(() => {
    if (activeTab.startsWith('admin-users-detail-')) {
      const uId = activeTab.replace('admin-users-detail-', '');
      setSelectedAdminUserId(uId);
      setActiveTab('administrator');
      setActiveSubTab('admin-users');
    } else if (activeTab.startsWith('admin-')) {
      const legacyTab = activeTab;
      setActiveTab('administrator');
      setActiveSubTab(legacyTab);
    }
  }, [activeTab]);

  // Sync tab layout and load isolated workspace sandbox data when current project switches
  useEffect(() => {
    if (currentProject) {
      // If a project gains focus, default to overview dashboard
      setActiveTab('project-overview');
      
      const projResSaved = localStorage.getItem(`buildops_project_resources_${currentProject.id}`);
      if (projResSaved) {
        try {
          setResources(JSON.parse(projResSaved));
        } catch (e) {
          setResources(getGlobalResources());
        }
      } else {
        const globalRes = getGlobalResources();
        setResources(globalRes);
        localStorage.setItem(`buildops_project_resources_${currentProject.id}`, JSON.stringify(globalRes));
      }

      const projAnalysesSaved = localStorage.getItem(`buildops_project_analyses_${currentProject.id}`);
      if (projAnalysesSaved) {
        try {
          setAnalyses(JSON.parse(projAnalysesSaved));
        } catch (e) {
          setAnalyses(getGlobalAnalyses());
        }
      } else {
        const globalAnal = getGlobalAnalyses();
        setAnalyses(globalAnal);
        localStorage.setItem(`buildops_project_analyses_${currentProject.id}`, JSON.stringify(globalAnal));
      }
    } else {
      // If no project is focused, go back to portfolio scorecard
      // Preserve active tab if it's an administration tab!
      if (activeTab !== 'administrator' && !activeTab.startsWith('admin-')) {
        setActiveTab('project-management');
        setActiveSubTab('dashboard');
      }
      setResources(getGlobalResources());
      setAnalyses(getGlobalAnalyses());
    }
  }, [currentProject]);

  const handleUpdateAnalyses = (newAnalyses: RateAnalysis[]) => {
    setAnalyses(newAnalyses);
    if (currentProject) {
      localStorage.setItem(`buildops_project_analyses_${currentProject.id}`, JSON.stringify(newAnalyses));
    } else {
      setGlobalAnalyses(newAnalyses);
      localStorage.setItem('buildops_global_analyses', JSON.stringify(newAnalyses));
    }
  };

  const handleUpdateResources = (newResources: Resource[]) => {
    setResources(newResources);
    if (currentProject) {
      localStorage.setItem(`buildops_project_resources_${currentProject.id}`, JSON.stringify(newResources));
    } else {
      setGlobalResources(newResources);
      localStorage.setItem('buildops_global_resources', JSON.stringify(newResources));
    }
  };

  const renderSOTContent = () => {
    switch (activeSubTab) {
      case 'sot-dashboard':
        return <SOTDashboard onLaunchProgress={() => { setActiveTab('progress-management'); setActiveSubTab('progress-tracking'); }} />;
      case 'sot-list':
        return (
          <SOTList 
            sots={sots}
            onAddSOT={(newSot) => {
               const sotToAdd = {
                 ...newSot,
                 projectId: currentProject?.id || 'proj-1'
               } as SOT;
               setSots([sotToAdd, ...sots]);
               setSelectedSOTId(sotToAdd.id);
               setActiveSubTab('sot-planner');
            }}
            onOpenPlanner={(id) => { setSelectedSOTId(id); setActiveSubTab('sot-planner'); }}
            onOpenGantt={(id) => { setSelectedSOTId(id); setActiveSubTab('sot-gantt'); }}
            onViewProgress={(id) => { 
                setSelectedSOTId(id); 
                setActiveTab('progress-management');
                setActiveSubTab('progress-tracking'); 
            }}
          />
        );
      case 'sot-planner':
        return <SOTPlanner sotId={selectedSOTId || undefined} />;
      case 'sot-gantt':
        return <SOTGantt sotId={selectedSOTId || undefined} />;
      case 'sot-forecast':
        return <SOTResourceForecast />;
      case 'sot-baselines':
        return <SOTBaselines />;
      case 'sot-reports':
        return <PlaceholderModule name="SOT Reports" icon={BarChart3} />;
      default:
        return <SOTDashboard />;
    }
  };

  const renderProgressManagement = () => {
    switch (activeSubTab) {
      case 'progress-dashboard':
        return <ProgressDashboard />;
      case 'progress-tracking':
        return <ProgressTracker sotId={selectedSOTId || undefined} />;
      case 'progress-logs':
        return <DailyProgressLogs />;
      case 'progress-delays':
        return <DelayManagement />;
      case 'progress-productivity':
        return <ProductivityAnalysis />;
      case 'progress-scurve':
        return <SCurveAnalysis />;
      case 'progress-eva':
        return <EarnedValueAnalysis />;
      case 'progress-approvals':
        return <ProgressApprovals />;
      case 'progress-photos':
        return <SitePhotos />;
      case 'progress-forecasting':
        return <ForecastingAnalytics />;
      default:
        return <ProgressDashboard />;
    }
  };

  const renderBOQContent = () => {
    switch (activeSubTab) {
      case 'boq-dashboard':
        return (
          <BOQDashboard 
            onNavigate={(tab) => {
              if (tab === 'list') {
                setActiveSubTab('boq-list');
              } else {
                setActiveSubTab('boq-builder');
              }
            }} 
          />
        );
      case 'boq-list':
        return (
          <BOQList 
            onSelectBOQ={(id) => { setSelectedBOQId(id); setActiveSubTab('boq-builder'); }} 
            onCreateBOQ={() => { createNewBOQ(); setActiveSubTab('boq-builder'); }} 
          />
        );
      case 'boq-builder':
        return (
          <BOQManagement 
            boqId={selectedBOQId || 'boq-1'} 
            analyses={analyses}
            resources={resources}
          />
        );
      case 'boq-versions':
        return (
          <BOQVersions 
            onBack={() => { setActiveSubTab('boq-builder'); }} 
            onCompare={() => { setActiveSubTab('boq-comparison'); }}
          />
        );
      case 'boq-comparison':
        return (
          <BOQComparison 
            onBack={() => { setActiveSubTab('boq-versions'); }} 
          />
        );
      case 'boq-resource-analysis':
        return (
          <BOQManagement 
            boqId={selectedBOQId || 'boq-1'} 
            analyses={analyses}
            resources={resources}
          />
        );
      case 'boq-cost-summary':
        return (
          <BOQManagement 
            boqId={selectedBOQId || 'boq-1'} 
            analyses={analyses}
            resources={resources}
          />
        );
      case 'boq-import-export':
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-zentrix-blue">Spreadsheet Integrator Simulator</h3>
            <p className="text-xs text-slate-500">Attach and ingest any Excel or CSV formatted BOQ schedule. Our schema engine validates item codes, quantities, and units recursively.</p>
            <div className="border-2 border-dashed border-slate-200 p-12 text-center rounded-xl bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-inner" onClick={() => {
              alert('Successfully validated and imported BOQ Template from Excel: zero duplicate codes identified, 5 active rows loaded into active sections.');
              setActiveSubTab('boq-list');
            }}>
              <p className="text-sm font-bold text-slate-755 text-primary-600">Drag & Drop BOQ Excel template file here</p>
              <p className="text-xs text-slate-400 mt-1">Or click to select a local template file (XLSX, CSV)</p>
            </div>
          </div>
        );
      case 'boq-reports':
        return <BOQReports />;
      default:
        return (
          <BOQList 
            onSelectBOQ={(id) => { setSelectedBOQId(id); setActiveSubTab('boq-builder'); }} 
            onCreateBOQ={() => { createNewBOQ(); setActiveSubTab('boq-builder'); }} 
          />
        );
    }
  };

  const renderPortfolioDashboard = () => {
    // Elegant Multi-Project Portfolio Scorecard Dashboard view
    const totalCount = projects.length;
    const activeCount = projects.filter(p => p.status === 'Active').length;
    const planningCount = projects.filter(p => p.status === 'Planning').length;
    const archivedCount = projects.filter(p => p.status === 'Archived').length;

    // Summing budget
    const totalBudgetSum = projects.reduce((acc, p) => p.status !== 'Archived' ? acc + p.budget : acc, 0);
    const totalSpentSum = projects.reduce((acc, p) => p.status !== 'Archived' ? acc + (p.spentToDate || 0) : acc, 0);

    return (
      <div className="flex flex-col gap-6 animate-fade-in text-[13px] text-slate-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-zentrix-blue tracking-tight leading-none">Portfolio Management</h2>
            <p className="text-[11px] text-slate-400 mt-1">Global command center for multi-tenant construction workspace portfolios.</p>
          </div>

          <button 
            onClick={() => { setActiveTab('project-management'); setActiveSubTab('projects'); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer self-start sm:self-auto leading-none transition-all shadow-md"
          >
            Open Project Portfolio Grid →
          </button>
        </div>

        {/* Global Statistics Portfolio bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Master Portfolio</p>
            <h3 className="text-2xl font-black text-zentrix-blue mt-1.5">{totalCount} Workspaces</h3>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {activeCount} Live Operations
            </p>
          </div>

          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pre-construction Planning</p>
            <h3 className="text-2xl font-black text-primary-600 mt-1.5">{planningCount} Projects</h3>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Awaiting resource allocation
            </p>
          </div>

          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Committed Cost Budget</p>
            <h3 className="text-2xl font-black text-zentrix-blue mt-1.5">${(totalBudgetSum / 1000000).toFixed(1)}M</h3>
            <p className="text-[11px] text-slate-400 mt-1.5">Consolidated cash flow baseline</p>
          </div>

          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Consolidated Cash Spent</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1.5">${(totalSpentSum / 1000000).toFixed(1)}M</h3>
            <p className="text-[11px] text-slate-400 mt-1.5">Spent across live workspace environments</p>
          </div>
        </div>

        {/* Live Project Overview list */}
        <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-3 mb-4">Enterprise Workspaces Deck</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.filter(p=>p.status !== 'Archived').map((p) => {
              let progressPercent = p.status === 'Completed' ? 100 : p.status === 'Planning' ? 0 : p.id === 'proj-1' ? 45 : p.id === 'proj-2' ? 12 : p.id === 'proj-3' ? 92 : p.id === 'proj-5' ? 15 : 25;
              return (
                <div 
                  key={p.id}
                  onClick={() => selectProject(p.id)}
                  className="p-4 border border-slate-100 bg-slate-50 rounded-xl hover:border-slate-300 transition-all cursor-pointer flex justify-between gap-4 items-center group shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600 font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 px-1 py-0.5 rounded leading-none">
                          {p.code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">• {p.sector}</span>
                      </div>
                      <h5 className="font-bold text-zentrix-blue mt-1 group-hover:text-primary-600 transition-colors">{p.name}</h5>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-700 text-xs">{progressPercent}% Done</p>
                    <span className="text-[10px] text-primary-600 font-bold hover:underline">Launch Workspace →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMasterData = () => {
    let childComponent;
    switch (activeSubTab) {
      case 'master-units':
        childComponent = <UnitManagement />;
        break;
      case 'master-types':
        childComponent = <ResourceTypeManagement />;
        break;
      case 'master-regions':
        childComponent = <RegionManagement />;
        break;
      case 'master-periods':
        childComponent = <PeriodManagement />;
        break;
      default:
        childComponent = currentProject ? <RegionManagement /> : <UnitManagement />;
        break;
    }

    if (currentProject) {
      return (
        <div className="h-full flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300 shadow-sm font-sans">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-primary-500/10 text-primary-600 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Project Workspace Data Mode</span>
                <span className="text-[12px] text-slate-300 font-medium">|</span>
                <span className="text-[12px] text-slate-500 font-bold">{currentProject.name} Catalog Scope</span>
              </div>
              <p className="text-[12.5px] text-slate-500">
                Configure workspace-specific parameters including active project Regions and dynamic reporting Periods for the active project: <strong>{currentProject.name}</strong>.
              </p>
            </div>
          </div>
          <div className="flex-1">
            {childComponent}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col gap-4 animate-fade-in">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm font-sans flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Tenant Global Master data</span>
              <span className="text-[12px] text-slate-300 font-medium">|</span>
              <span className="text-[12px] text-slate-500 font-bold">Organization & ERP Standards</span>
            </div>
            <p className="text-[12.5px] text-slate-500 leading-normal">
              Configure corporate standardized parameters including Measurement Units and Resource Types globally across all workspaces.
            </p>
          </div>
        </div>
        <div className="flex-1">
          {childComponent}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // ----------------------------------------------------
    // MASTER LIBRARY GLOBAL VIEWS (RESTRICTED TO ERP GLOBAL CATALOGS)
    // ----------------------------------------------------
    if (activeTab === 'master-library') {
      if (activeSubTab === 'master-resources') {
        return (
          <ResourceManagement
            resources={globalResources}
            onUpdateResources={(updated) => {
              setGlobalResources(updated);
              localStorage.setItem('buildops_global_resources', JSON.stringify(updated));
            }}
            activeSubTab="master-resources"
            setActiveSubTab={setActiveSubTab}
          />
        );
      } else {
        return (
          <RateAnalysisScreen
            analyses={globalAnalyses}
            onUpdateAnalyses={(updated) => {
              setGlobalAnalyses(updated);
              localStorage.setItem('buildops_global_analyses', JSON.stringify(updated));
            }}
            resources={globalResources}
            activeSubTab="master-analyses"
            setActiveSubTab={setActiveSubTab}
          />
        );
      }
    }

    // ----------------------------------------------------
    // ADMINISTRATION ROUTING PANE SWITCHERS
    // ----------------------------------------------------
    if (activeTab === 'administrator') {
      switch (activeSubTab) {
        case 'admin-users':
          if (selectedAdminUserId) {
            return <UserDetailPage userId={selectedAdminUserId} onBack={() => setSelectedAdminUserId(null)} />;
          }
          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-zentrix-blue">User Directories & Corporate Accounts</h3>
                  <p className="text-[12px] text-slate-400 font-semibold mt-1">Search, lock, or modify user scopes mapping this tenant.</p>
                </div>

                <button
                  onClick={() => setIsInviteDrawerOpen(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <UserPlus size={15} />
                  Issue Onboarding Invitation
                </button>
              </div>

              <UserTable
                users={users}
                roles={roles}
                onViewDetails={(id) => setSelectedAdminUserId(id)}
                onEditUser={(id) => setSelectedAdminUserId(id)}
              />

              <InviteUserDrawer isOpen={isInviteDrawerOpen} onClose={() => setIsInviteDrawerOpen(false)} />
            </div>
          );

        case 'admin-roles':
          if (selectedAdminRoleId) {
            return <RoleDetailPage roleId={selectedAdminRoleId} onBack={() => setSelectedAdminRoleId(null)} />;
          }
          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-zentrix-blue">IAM Security Profiles & Roles Matrix</h3>
                  <p className="text-[12px] text-slate-400 font-semibold mt-1">Create or modify permission claim blocks mapping role indices.</p>
                </div>

                <button
                  onClick={() => {
                    const nm = prompt('Enter a name for the new custom Role:');
                    if (nm) {
                      addRole({
                        name: nm,
                        description: 'Custom security profile created under tenant administrative guidelines.',
                        scope: 'Project-Specific',
                        permissions: ['BOQ.View', 'Rate.View', 'Resources.View', 'Projects.View']
                      });
                      alert('Custom role created. You can now modify its parameters.');
                    }
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus size={14} className="text-primary-450 text-indigo-400" />
                  Create Core Role Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isActive={false}
                    onSelect={() => setSelectedAdminRoleId(role.id)}
                    onEdit={() => setSelectedAdminRoleId(role.id)}
                    onDuplicate={() => {
                      addRole({
                        name: `${role.name} Copy`,
                        description: `Duplicate clone of security profile [${role.name}].`,
                        scope: role.scope,
                        permissions: [...role.permissions]
                      });
                      alert('Role configurations duplicated.');
                    }}
                    onDelete={() => {
                      if (confirm(`Archive and delete the custom role [${role.name}]?`)) {
                        deleteRole(role.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          );

        case 'admin-project-access':
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-zentrix-blue border-b border-slate-200 pb-4 mb-1">Project Workspace Access Dashboard</h3>
              </div>
              <ProjectAccessGrid users={users} roles={roles} projects={projects} />
            </div>
          );

        case 'admin-invitations':
          return <InvitationsPanel />;

        case 'admin-security':
          return (
            <div className="space-y-6 animate-fade-in">
              <SecurityCard settings={securitySettings} onUpdate={updateSecuritySettings} />
            </div>
          );

        case 'admin-audit-logs':
          return (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-base font-black text-zentrix-blue">Tenant System Audit Logs</h3>
                <p className="text-[12.5px] text-slate-400 mt-1">Read immutable, ISO-compliant records tracking administration actions.</p>
              </div>
              <AuditTable logs={auditLogs} />
            </div>
          );

        case 'admin-branding':
          return <TenatOrganizationSettingsPanel />;

        case 'admin-auth-policies':
          return (
            <div className="space-y-6">
              <SecurityCard settings={securitySettings} onUpdate={updateSecuritySettings} />
            </div>
          );

        default:
          if (selectedAdminUserId) {
            return <UserDetailPage userId={selectedAdminUserId} onBack={() => setSelectedAdminUserId(null)} />;
          }
          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-zentrix-blue">User Directories & Corporate Accounts</h3>
                  <p className="text-[12px] text-slate-400 font-semibold mt-1">Search, lock, or modify user scopes mapping this tenant.</p>
                </div>

                <button
                  onClick={() => setIsInviteDrawerOpen(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <UserPlus size={15} />
                  Issue Onboarding Invitation
                </button>
              </div>

              <UserTable
                users={users}
                roles={roles}
                onViewDetails={(id) => setSelectedAdminUserId(id)}
                onEditUser={(id) => setSelectedAdminUserId(id)}
              />

              <InviteUserDrawer isOpen={isInviteDrawerOpen} onClose={() => setIsInviteDrawerOpen(false)} />
            </div>
          );
      }
    }

    if (activeTab === 'tender-management') {
      return (
        <TenderManagementShell 
          activeSubTab={activeSubTab || 'tender-dashboard'} 
          setActiveSubTab={setActiveSubTab} 
        />
      );
    }

    // If no project is selected, render global screens
    if (!currentProject) {
      switch (activeTab) {
        case 'project-management':
          switch (activeSubTab) {
            case 'dashboard':
              return renderPortfolioDashboard();
            case 'projects':
              return (
                <ProjectPortfolio 
                  statusFilter="all" 
                  onSelectProject={selectProject}
                  onOpenCreateModal={() => setIsWizardOpen(true)}
                  onOpenCloneModal={(id) => {
                    const source = projects.find(p => p.id === id);
                    if (source) {
                      const newName = `${source.name} (Clone)`;
                      const newCode = `${source.code}-COPY`;
                      cloneProject(id, newName, newCode);
                    }
                  }}
                />
              );
            case 'archived-projects':
              return (
                <ProjectPortfolio 
                  statusFilter="Archived" 
                  onSelectProject={selectProject}
                  onOpenCreateModal={() => setIsWizardOpen(true)}
                  onOpenCloneModal={(id) => {
                    const source = projects.find(p => p.id === id);
                    if (source) {
                      const newName = `${source.name} (Clone)`;
                      const newCode = `${source.code}-COPY`;
                      cloneProject(id, newName, newCode);
                    }
                  }}
                />
              );
            default:
              return renderPortfolioDashboard();
          }
        case 'dashboard':
          return renderPortfolioDashboard();
        case 'projects':
          return (
            <ProjectPortfolio 
              statusFilter="all" 
              onSelectProject={selectProject}
              onOpenCreateModal={() => setIsWizardOpen(true)}
              onOpenCloneModal={(id) => {
                const source = projects.find(p => p.id === id);
                if (source) {
                  const newName = `${source.name} (Clone)`;
                  const newCode = `${source.code}-COPY`;
                  cloneProject(id, newName, newCode);
                }
              }}
            />
          );
        case 'rate-analysis':
          return (
            <RateAnalysisScreen 
              analyses={analyses} 
              onUpdateAnalyses={handleUpdateAnalyses} 
              resources={resources} 
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
            />
          );
        case 'resource-management':
          return (
            <ResourceManagement 
              resources={resources} 
              onUpdateResources={handleUpdateResources} 
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
            />
          );
        case 'master-data':
          return renderMasterData();
        case 'subcontractor-registry':
          return <SubcontractorRegistry />;
        case 'project-teams':
          return <ProjectTeams />;
        case 'project-documents':
          return <ProjectDocuments />;
        case 'project-calendar':
          return <ProjectCalendar />;
        case 'archived-projects':
          return (
            <ProjectPortfolio 
              statusFilter="Archived" 
              onSelectProject={selectProject}
              onOpenCreateModal={() => setIsWizardOpen(true)}
              onOpenCloneModal={(id) => {
                const source = projects.find(p => p.id === id);
                if (source) {
                  const newName = `${source.name} (Clone)`;
                  const newCode = `${source.code}-COPY`;
                  cloneProject(id, newName, newCode);
                }
              }}
            />
          );
        default:
          return renderPortfolioDashboard();
      }
    }

    // IF project is selected: Render workspace-focused modular views
    switch (activeTab) {
      case 'project-overview':
        return <ProjectWorkspaceDashboard />;
      case 'boq':
        return renderBOQContent();
      case 'rate-analysis':
        return (
          <RateAnalysisScreen 
            analyses={analyses} 
            onUpdateAnalyses={handleUpdateAnalyses} 
            resources={resources} 
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
          />
        );
      case 'resource-management':
        return (
          <ResourceManagement 
            resources={resources} 
            onUpdateResources={handleUpdateResources} 
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
          />
        );
      case 'master-data':
        return renderMasterData();
      case 'planning':
        return renderSOTContent();
      case 'progress-management':
        return renderProgressManagement();
      case 'commercial':
        return <CommercialModule activeSubTab={activeSubTab} />;
      case 'cost-control':
        return <CostControlModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />;
      case 'procurement':
        return <ProcurementModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />;
      case 'subcontract':
        return <SubcontractManagement activeSubTab={activeSubTab || 'subcontract-dashboard'} />;
      case 'subcontractor-registry':
        return <SubcontractorRegistry />;
      case 'project-documents':
        return <ProjectDocuments />;
      case 'project-calendar':
        return <ProjectCalendar />;
      case 'project-teams':
        return <ProjectTeams />;
      case 'project-settings':
        return <ProjectSettings />;
      default:
        return <ProjectWorkspaceDashboard />;
    }
  };

  // If user is completely unauthenticated, force login flow blocks entirely
  if (!currentUser) {
    return <AuthPages />;
  }

  return (
    <AppLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      isWizardOpen={isWizardOpen}
      setIsWizardOpen={setIsWizardOpen}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AuthProvider>
        <ProgressProvider>
          <CommercialProvider>
            <SubcontractProvider>
              <BOQProvider>
                <TenderProvider>
                  <AppWorkspace />
                </TenderProvider>
              </BOQProvider>
            </SubcontractProvider>
          </CommercialProvider>
        </ProgressProvider>
      </AuthProvider>
    </ProjectProvider>
  );
}
