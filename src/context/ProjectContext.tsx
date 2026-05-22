import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectMember, ProjectDocument, ProjectCalendarEvent } from '../types.ts';

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string | null;
  currentProject: Project | null;
  recentProjectIds: string[];
  favoritedProjectIds: string[];
  pinnedProjectId: string | null;
  projectMembers: ProjectMember[];
  projectDocuments: ProjectDocument[];
  projectEvents: ProjectCalendarEvent[];
  isProjectSelected: boolean;
  selectProject: (id: string | null) => void;
  addProject: (project: Omit<Project, 'id' | 'tenant_id'>) => void;
  cloneProject: (sourceId: string, name: string, code: string) => void;
  archiveProject: (id: string) => void;
  toggleFavoriteProject: (id: string) => void;
  pinProject: (id: string | null) => void;
  addProjectMember: (member: Omit<ProjectMember, 'id'>) => void;
  removeProjectMember: (id: string) => void;
  addProjectDocument: (doc: Omit<ProjectDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  addProjectEvent: (event: Omit<ProjectCalendarEvent, 'id'>) => void;
  updateProjectSettings: (id: string, updatedFields: Partial<Project>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    tenant_id: 'tenant-1',
    code: 'PRJ-SRT-001',
    name: 'Skyline Residence Towers',
    shortName: 'Skyline Towers',
    description: 'A premium 45-storey twin residential tower project featuring ultra-luxury duplexes, state-of-the-art sky bridges, high-end wellness decks, and a multi-tiered mechanical parking system.',
    type: 'High-Rise Residential',
    sector: 'Real Estate & Infrastructure',
    client: 'Emaar Properties PJSC',
    consultant: 'Dar Al-Handasah',
    contractor: 'BuildOps Construction Corp',
    status: 'Active',
    avatarColor: 'bg-indigo-600',
    bannerImage: 'https://images.unsplash.com/photo-1541913057-25902bc56201?auto=format&fit=crop&q=80&w=1200',
    country: 'Saudi Arabia',
    state: 'Riyadh Province',
    city: 'Riyadh',
    address: 'King Fahd Road, Sector 4',
    gpsCoordinates: '24.7136° N, 46.6753° E',
    contractValue: 45000000,
    currency: 'USD',
    budget: 42000000,
    estimatedCost: 41500000,
    spentToDate: 1250000,
    startDate: '2024-06-01',
    plannedFinishDate: '2025-12-30',
    baselineStartDate: '2024-06-01',
    baselineFinishDate: '2025-12-30',
    projectDirector: 'Fahad Al-Saud',
    projectManager: 'Sarah Johnson',
    qsManager: 'Robert Chen',
    planningEngineer: 'Youhana Mikhail',
    siteEngineers: ['Sarah Johnson', 'Michael Brown'],
    workingCalendar: 'Standard 6-Day',
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'USD',
    measurementSystem: 'Metric',
    riskLevel: 'Medium',
    priority: 'High',
    tags: ['High-Rise', 'Luxury', 'Riyadh', 'Fast-Track'],
  },
  {
    id: 'proj-2',
    tenant_id: 'tenant-1',
    code: 'PRJ-IP-002',
    name: 'Industrial Park Development',
    shortName: 'Industrial Park',
    description: 'Phase 1 construction of a smart industrial park. Consists of 12 standard modular warehouses, shared logistics plazas, specialized effluent treatment utilities, and modern fiber-backboned admin structures.',
    type: 'Industrial Estate',
    sector: 'Logistics & Infrastructure',
    client: 'Saudi Aramco',
    consultant: 'SNC-Lavalin',
    contractor: 'BuildOps Engineering Ltd',
    status: 'Delayed',
    avatarColor: 'bg-amber-600',
    bannerImage: 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&q=80&w=1200',
    country: 'Saudi Arabia',
    state: 'Eastern Province',
    city: 'Dammam',
    address: 'Industrial City II',
    gpsCoordinates: '26.4207° N, 50.1040° E',
    contractValue: 75000000,
    currency: 'USD',
    budget: 72000000,
    estimatedCost: 73500000,
    spentToDate: 4500000,
    startDate: '2024-08-01',
    plannedFinishDate: '2026-02-28',
    baselineStartDate: '2024-08-01',
    baselineFinishDate: '2025-12-31',
    projectDirector: 'Ibrahim Al-Harbi',
    projectManager: 'David Miller',
    qsManager: 'Robert Chen',
    planningEngineer: 'Anas Al-Ghamdi',
    siteEngineers: ['Sarah Johnson'],
    workingCalendar: '7-Day Continuous',
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'USD',
    measurementSystem: 'Metric',
    riskLevel: 'High',
    priority: 'Immediate',
    tags: ['Industrial', 'Logistics', 'Steel-Structure', 'Aramco'],
  },
  {
    id: 'proj-3',
    tenant_id: 'tenant-1',
    code: 'PRJ-NH-003',
    name: 'NEOM Highway Extension',
    shortName: 'NEOM Highway',
    description: 'Expansion of the primary coastal link highway into NEOM cluster, including dual tunnels, heavy-load bridges, solar-panel safety shelters, and automated smart-traffic monitoring systems.',
    type: 'Civil Transportation',
    sector: 'Public Roads & Transport',
    client: 'NEOM Authority',
    consultant: 'AECOM',
    contractor: 'BuildOps Infra Group',
    status: 'Active',
    avatarColor: 'bg-emerald-600',
    bannerImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&q=80&w=1200',
    country: 'Saudi Arabia',
    state: 'Tabuk Province',
    city: 'NEOM District',
    address: 'Zone North Coastal Road',
    gpsCoordinates: '28.5364° N, 34.8214° E',
    contractValue: 120000000,
    currency: 'USD',
    budget: 115000000,
    estimatedCost: 113000000,
    spentToDate: 92000000,
    startDate: '2023-01-15',
    plannedFinishDate: '2026-09-30',
    baselineStartDate: '2023-01-15',
    baselineFinishDate: '2026-06-30',
    projectDirector: 'Sami Al-Otaibi',
    projectManager: 'Yasmin Al-Harbi',
    qsManager: 'Ali Bashara',
    planningEngineer: 'Sarah Johnson',
    siteEngineers: ['Michael Brown'],
    workingCalendar: '7-Day Continuous',
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'USD',
    measurementSystem: 'Metric',
    riskLevel: 'Critical',
    priority: 'Immediate',
    tags: ['Infrastructure', 'Tunneling', 'NEOM', 'Smart-Roads'],
  },
  {
    id: 'proj-4',
    tenant_id: 'tenant-1',
    code: 'PRJ-JR-004',
    name: 'Jeddah Coastal Villas',
    shortName: 'Jeddah Villas',
    description: 'A coastal resort housing 30 luxury smart villas overlooking the Red Sea. Integrates self-sustaining greywater treatment systems, private yacht slips, and geothermal cooling systems.',
    type: 'Luxury Residential Resort',
    sector: 'Tourism & Housing',
    client: 'Red Sea Global',
    consultant: 'Gensler',
    contractor: 'BuildOps Living Co.',
    status: 'Planning',
    avatarColor: 'bg-cyan-600',
    bannerImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    country: 'Saudi Arabia',
    state: 'Makkah Province',
    city: 'Jeddah',
    address: 'Al-Hamra Coastal Strip',
    gpsCoordinates: '21.5433° N, 39.1728° E',
    contractValue: 28000000,
    currency: 'SAR',
    budget: 26000000,
    estimatedCost: 25500000,
    spentToDate: 0,
    startDate: '2026-09-01',
    plannedFinishDate: '2028-06-30',
    projectDirector: 'Khalid Al-Mansoori',
    projectManager: 'Majed Al-Mutairi',
    qsManager: 'Robert Chen',
    planningEngineer: 'Youhana Mikhail',
    siteEngineers: [],
    workingCalendar: '5-Day Week',
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'SAR',
    measurementSystem: 'Metric',
    riskLevel: 'Low',
    priority: 'Medium',
    tags: ['Resort', 'Marine-Engineering', 'Smart-Home'],
  },
  {
    id: 'proj-5',
    tenant_id: 'tenant-1',
    code: 'PRJ-QT-005',
    name: 'Qiddiya Theme Park Grid',
    shortName: 'Qiddiya Grid',
    description: 'Subterranean power grid and central chillers station for the theme park development. Features cryogenic pipelines, high-voltage transformers, and fully resilient concrete blast vaults.',
    type: 'Heavy Civil Utilities',
    sector: 'Utilities & Leisure',
    client: 'Qiddiya Investment Co.',
    consultant: 'WSP Middle East',
    contractor: 'BuildOps Infra Group',
    status: 'On Hold',
    avatarColor: 'bg-rose-600',
    bannerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    country: 'Saudi Arabia',
    state: 'Riyadh Province',
    city: 'Qiddiya',
    address: 'Leisure Ridge Sector',
    gpsCoordinates: '24.5829° N, 46.2902° E',
    contractValue: 55000000,
    currency: 'USD',
    budget: 52000000,
    estimatedCost: 51000000,
    spentToDate: 6000000,
    startDate: '2024-03-01',
    plannedFinishDate: '2026-11-30',
    projectDirector: 'Turki Al-Sudairi',
    projectManager: 'Michael Brown',
    qsManager: 'Ali Bashara',
    planningEngineer: 'Robert Chen',
    siteEngineers: ['Michael Brown'],
    workingCalendar: 'Standard 6-Day',
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'USD',
    measurementSystem: 'Metric',
    riskLevel: 'Medium',
    priority: 'Medium',
    tags: ['Utilities', 'Power-Grid', 'Theme-Park'],
  },
  {
    id: 'proj-6',
    tenant_id: 'tenant-1',
    code: 'PRJ-OR-006',
    name: 'Old Riyadh Restorations',
    shortName: 'Riyadh Heritage',
    description: 'Historical reinforcement and structural stabilization of mud-tile adobe palaces in Ad-Diriyah. Employs ancient lime stabilization techniques blended with micro-fine carbon-fiber rods.',
    type: 'Historical Heritage Restoration',
    sector: 'Heritage & Hospitality',
    client: 'Ministry of Culture / DGDA',
    consultant: 'UNESCO Heritage Engineers',
    contractor: 'BuildOps Heritage Specialists',
    status: 'Completed',
    avatarColor: 'bg-purple-600',
    bannerImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
    country: 'Saudi Arabia',
    state: 'Riyadh Province',
    city: 'Diriyah',
    address: 'At-Turaif Historic District',
    gpsCoordinates: '24.7344° N, 46.5746° E',
    contractValue: 18000000,
    currency: 'USD',
    budget: 17500000,
    estimatedCost: 17300000,
    spentToDate: 17300000,
    startDate: '2022-02-15',
    plannedFinishDate: '2024-04-30',
    actualFinishDate: '2024-04-18',
    projectDirector: 'Faisal Al-Rashed',
    projectManager: 'Ali Al-Hassan',
    qsManager: 'Robert Chen',
    planningEngineer: 'Youhana Mikhail',
    siteEngineers: ['Sarah Johnson', 'Michael Brown'],
    workingCalendar: '5-Day Week',
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'USD',
    measurementSystem: 'Metric',
    riskLevel: 'High',
    priority: 'Low',
    tags: ['Heritage', 'Restoration', 'Diriyah', 'Cultural'],
  }
];

const DEFAULT_MEMBERS: ProjectMember[] = [
  // Skyline Towers (proj-1)
  { id: 'm-1', projectId: 'proj-1', name: 'Sarah Johnson', email: 's.johnson@buildops.com', role: 'Project Manager', status: 'Active', permissionLevel: 'Admin' },
  { id: 'm-2', projectId: 'proj-1', name: 'Robert Chen', email: 'robert.chen@buildops.com', role: 'QS Engineer', status: 'Active', permissionLevel: 'Write' },
  { id: 'm-3', projectId: 'proj-1', name: 'Fahad Al-Saud', email: 'fahad@emaar.com', role: 'Project Director', status: 'Active', permissionLevel: 'Admin' },
  { id: 'm-4', projectId: 'proj-1', name: 'Youhana Mikhail', email: 'y.mikhail@buildops.com', role: 'Planning Engineer', status: 'Active', permissionLevel: 'Write' },
  { id: 'm-5', projectId: 'proj-1', name: 'Sahan Maduranga', email: 'sahan.maduranga@nordhealth.com', role: 'Client Viewer', status: 'Active', permissionLevel: 'Read-Only' },
  { id: 'm-6', projectId: 'proj-1', name: 'Michael Brown', email: 'm.brown@buildops.com', role: 'Site Engineer', status: 'Active', permissionLevel: 'Write' },
  
  // Industrial Park (proj-2)
  { id: 'm-7', projectId: 'proj-2', name: 'David Miller', email: 'd.miller@buildops.com', role: 'Project Manager', status: 'Active', permissionLevel: 'Admin' },
  { id: 'm-8', projectId: 'proj-2', name: 'Robert Chen', email: 'robert.chen@buildops.com', role: 'QS Engineer', status: 'Active', permissionLevel: 'Write' },
  { id: 'm-9', projectId: 'proj-2', name: 'Samir Jahanger', email: 's.jahanger@aramco.com', role: 'Client Viewer', status: 'Pending', permissionLevel: 'Read-Only' }
];

const DEFAULT_DOCUMENTS: ProjectDocument[] = [
  { id: 'doc-1', projectId: 'proj-1', name: 'Architectural_Drawings_Rev4.pdf', category: 'Drawings', version: '4.2', uploadedBy: 'Youhana Mikhail', uploadedAt: '2024-05-12T09:30:00Z', size: '42.5 MB', fileType: 'pdf' },
  { id: 'doc-2', projectId: 'proj-1', name: 'Structural_Load_Calculations_Final.pdf', category: 'Drawings', version: '1.0', uploadedBy: 'Dar Al-Handasah', uploadedAt: '2024-04-20T14:15:00Z', size: '18.1 MB', fileType: 'pdf' },
  { id: 'doc-3', projectId: 'proj-1', name: 'Main_Contract_Signed_Exec.pdf', category: 'Contracts', version: '1.0_signed', uploadedBy: 'Sarah Johnson', uploadedAt: '2024-03-01T11:00:00Z', size: '12.4 MB', fileType: 'pdf' },
  { id: 'doc-4', projectId: 'proj-1', name: 'BOQ_Civil_Concrete_Grade_Rev3.xlsx', category: 'BOQ', version: '3.0', uploadedBy: 'Robert Chen', uploadedAt: '2024-05-18T16:22:00Z', size: '2.8 MB', fileType: 'xlsx' },
  { id: 'doc-5', projectId: 'proj-2', name: 'Warehouse_Sourcing_Contract.pdf', category: 'Contracts', version: '2.1', uploadedBy: 'David Miller', uploadedAt: '2024-07-15T10:00:00Z', size: '5.9 MB', fileType: 'pdf' }
];

const DEFAULT_EVENTS: ProjectCalendarEvent[] = [
  { id: 'ev-1', projectId: 'proj-1', title: 'Concrete Pour Block A - Tier 3', description: 'Continuous pour of Grade 25 concrete for slab S3. Requires structural engineer inspection signoff.', startDate: '2026-05-22T06:00:00Z', endDate: '2026-05-22T18:00:00Z', type: 'Milestone' },
  { id: 'ev-2', projectId: 'proj-1', title: 'Consultant Joint Site Inspection', description: 'Joint site walkthrough with Dar Al-Handasah inspectors for foundation waterproofing check.', startDate: '2026-05-24T09:00:00Z', endDate: '2026-05-24T12:00:00Z', type: 'Inspection' },
  { id: 'ev-3', projectId: 'proj-1', title: 'Steel Reinforcement Arrives', description: 'Logistics delivery of 35 Tons of 20mm rebar steel from ArcelorMittal.', startDate: '2026-05-26T08:00:00Z', endDate: '2026-05-26T14:00:00Z', type: 'Delivery' },
  { id: 'ev-4', projectId: 'proj-2', title: 'Weekly Aramco Review Meeting', description: 'Progress alignment forum and delay mitigations discussion.', startDate: '2026-05-21T10:00:00Z', endDate: '2026-05-21T12:00:00Z', type: 'Meeting' }
];

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const localSaved = localStorage.getItem('buildops_projects');
    return localSaved ? JSON.parse(localSaved) : DEFAULT_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('buildops_selected_project_id') || null; // Start with no project selected - show portfolio dashboard
  });

  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(() => {
    const localSaved = localStorage.getItem('buildops_recent_projects');
    return localSaved ? JSON.parse(localSaved) : ['proj-1', 'proj-2'];
  });

  const [favoritedProjectIds, setFavoritedProjectIds] = useState<string[]>(() => {
    const localSaved = localStorage.getItem('buildops_favorited_projects');
    return localSaved ? JSON.parse(localSaved) : ['proj-1'];
  });

  const [pinnedProjectId, setPinnedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('buildops_pinned_project_id') || null;
  });

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>(() => {
    const localSaved = localStorage.getItem('buildops_project_members');
    return localSaved ? JSON.parse(localSaved) : DEFAULT_MEMBERS;
  });

  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(() => {
    const localSaved = localStorage.getItem('buildops_project_documents');
    return localSaved ? JSON.parse(localSaved) : DEFAULT_DOCUMENTS;
  });

  const [projectEvents, setProjectEvents] = useState<ProjectCalendarEvent[]>(() => {
    const localSaved = localStorage.getItem('buildops_project_events');
    return localSaved ? JSON.parse(localSaved) : DEFAULT_EVENTS;
  });

  // Save state functions
  useEffect(() => {
    localStorage.setItem('buildops_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('buildops_selected_project_id', selectedProjectId);
      // Update recents
      setRecentProjectIds(prev => {
        const withNew = [selectedProjectId, ...prev.filter(id => id !== selectedProjectId)];
        const trimmed = withNew.slice(0, 5);
        localStorage.setItem('buildops_recent_projects', JSON.stringify(trimmed));
        return trimmed;
      });
    } else {
      localStorage.removeItem('buildops_selected_project_id');
    }
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem('buildops_favorited_projects', JSON.stringify(favoritedProjectIds));
  }, [favoritedProjectIds]);

  useEffect(() => {
    if (pinnedProjectId) {
      localStorage.setItem('buildops_pinned_project_id', pinnedProjectId);
    } else {
      localStorage.removeItem('buildops_pinned_project_id');
    }
  }, [pinnedProjectId]);

  useEffect(() => {
    localStorage.setItem('buildops_project_members', JSON.stringify(projectMembers));
  }, [projectMembers]);

  useEffect(() => {
    localStorage.setItem('buildops_project_documents', JSON.stringify(projectDocuments));
  }, [projectDocuments]);

  useEffect(() => {
    localStorage.setItem('buildops_project_events', JSON.stringify(projectEvents));
  }, [projectEvents]);

  const selectProject = (id: string | null) => {
    setSelectedProjectId(id);
  };

  const currentProject = projects.find(p => p.id === selectedProjectId) || null;

  const addProject = (p: Omit<Project, 'id' | 'tenant_id'>) => {
    const generatedId = `proj-${Date.now()}`;
    const newProj: Project = {
      ...p,
      id: generatedId,
      tenant_id: 'tenant-1',
    };
    setProjects(prev => [newProj, ...prev]);
    
    // Automatically add creative project site engineer/PM as team members
    const defaultManager = p.projectManager || 'Robert Chen';
    const parsedRole = 'Project Manager';
    const newMember: ProjectMember = {
      id: `m-${Date.now()}`,
      projectId: generatedId,
      name: defaultManager,
      email: `${defaultManager.toLowerCase().replace(/\s+/g, '.')}@buildops.com`,
      role: parsedRole,
      status: 'Active',
      permissionLevel: 'Admin'
    };
    setProjectMembers(prev => [...prev, newMember]);
    
    // Select the newly created project automatically to offer immediate workspace conversion!
    setSelectedProjectId(generatedId);
  };

  const cloneProject = (sourceId: string, name: string, code: string) => {
    const source = projects.find(p => p.id === sourceId);
    if (!source) return;
    const generatedId = `proj-${Date.now()}`;
    const clonedProj: Project = {
      ...source,
      id: generatedId,
      code,
      name,
      shortName: name.substring(0, 15),
      status: 'Planning',
      spentToDate: 0,
    };
    setProjects(prev => [clonedProj, ...prev]);

    // Copy members
    const sourceMembers = projectMembers.filter(m => m.projectId === sourceId);
    const clonedMembers = sourceMembers.map(m => ({
      ...m,
      id: `m-${Math.random().toString(36).substring(2, 9)}`,
      projectId: generatedId
    }));
    setProjectMembers(prev => [...prev, ...clonedMembers]);

    // Select the cloned project
    setSelectedProjectId(generatedId);
  };

  const archiveProject = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Archived' as const };
      }
      return p;
    }));
  };

  const toggleFavoriteProject = (id: string) => {
    setFavoritedProjectIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const pinProject = (id: string | null) => {
    setPinnedProjectId(id);
  };

  const addProjectMember = (member: Omit<ProjectMember, 'id'>) => {
    const newMember: ProjectMember = {
      ...member,
      id: `m-${Date.now()}`
    };
    setProjectMembers(prev => [...prev, newMember]);
  };

  const removeProjectMember = (id: string) => {
    setProjectMembers(prev => prev.filter(m => m.id !== id));
  };

  const addProjectDocument = (doc: Omit<ProjectDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newDoc: ProjectDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Robert Chen' // Current user
    };
    setProjectDocuments(prev => [newDoc, ...prev]);
  };

  const addProjectEvent = (event: Omit<ProjectCalendarEvent, 'id'>) => {
    const newEvent: ProjectCalendarEvent = {
      ...event,
      id: `ev-${Date.now()}`
    };
    setProjectEvents(prev => [...prev, newEvent]);
  };

  const updateProjectSettings = (id: string, updatedFields: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProjectId,
      currentProject,
      recentProjectIds,
      favoritedProjectIds,
      pinnedProjectId,
      projectMembers,
      projectDocuments,
      projectEvents,
      isProjectSelected: !!selectedProjectId,
      selectProject,
      addProject,
      cloneProject,
      archiveProject,
      toggleFavoriteProject,
      pinProject,
      addProjectMember,
      removeProjectMember,
      addProjectDocument,
      addProjectEvent,
      updateProjectSettings
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
