import { ResourceType, SOTStatus, TaskType, TaskPriority, DependencyType, type Resource, type RateAnalysis, type BOQItem, type Region, type Period, type PriceMatrixEntry, type SOT, type SOTBaseline, type Task, type DelayRecord, type SitePhoto, type ProductivityMetric, type ProgressUpdate } from './types.ts';

export const MOCK_REGIONS: Region[] = [
  { id: '1', name: 'Riyadh Central', code: 'RIY-C', description: 'Central region covering the capital city.', status: 'Active' },
  { id: '2', name: 'Jeddah Coastal', code: 'JED-W', description: 'Western coastal region and port areas.', status: 'Active' },
  { id: '3', name: 'Dammam Eastern', code: 'DAM-E', description: 'Eastern province and industrial hubs.', status: 'Active' },
  { id: '4', name: 'NEOM District', code: 'NEO-N', description: 'Northern development zone.', status: 'Active' },
];

export const MOCK_PERIODS: Period[] = [
  { id: '1', name: '2024 Q1', startDate: '2024-01-01', endDate: '2024-03-31', status: 'Closed' },
  { id: '2', name: '2024 Q2', startDate: '2024-04-01', endDate: '2024-06-30', status: 'Open' },
  { id: '3', name: '2024 Q3', startDate: '2024-07-01', endDate: '2024-09-30', status: 'Future' },
  { id: '4', name: '2024 Q4', startDate: '2024-10-01', endDate: '2024-12-31', status: 'Future' },
];

export const MOCK_PRICE_MATRIX: PriceMatrixEntry[] = [
  // Cement prices vary by region and period
  { resourceId: 'res-1', regionId: '1', periodId: '1', rate: 8.5 },
  { resourceId: 'res-1', regionId: '1', periodId: '2', rate: 8.75 },
  { resourceId: 'res-1', regionId: '2', periodId: '1', rate: 9.0 },
  { resourceId: 'res-1', regionId: '2', periodId: '2', rate: 9.25 },
  
  // Steel prices
  { resourceId: 'res-2', regionId: '1', periodId: '1', rate: 720.0 },
  { resourceId: 'res-2', regionId: '1', periodId: '2', rate: 745.0 },
  { resourceId: 'res-2', regionId: '3', periodId: '1', rate: 710.0 },
  { resourceId: 'res-2', regionId: '3', periodId: '2', rate: 730.0 },

  // Labour prices
  { resourceId: 'res-3', regionId: '1', periodId: '1', rate: 45.0 },
  { resourceId: 'res-3', regionId: '1', periodId: '2', rate: 48.0 },
  { resourceId: 'res-3', regionId: '4', periodId: '1', rate: 65.0 },
  { resourceId: 'res-3', regionId: '4', periodId: '2', rate: 70.0 },
];

export const MOCK_RATE_ANALYSES_CATEGORIES = [
  { id: 'all', label: 'All Analysis', count: 12 },
  { 
    id: 'civil', 
    label: 'Civil Works', 
    count: 8,
    children: [
      { id: 'concrete', label: 'Concrete Works', count: 3 },
      { id: 'masonry', label: 'Masonry Works', count: 2 },
      { id: 'earth', label: 'Earth Works', count: 3 },
    ]
  },
  { id: 'finishing', label: 'Finishing Works', count: 4 },
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    code: 'MAT-CM-01',
    name: 'Portland Cement Type I',
    category: 'Cements',
    type: ResourceType.MATERIAL,
    unit: 'Bag (50kg)',
    currency: 'USD',
    supplier: 'LafargeHolcim',
    baseRate: 8.5,
    lastUpdated: '2024-03-15',
  },
  {
    id: 'res-2',
    code: 'MAT-ST-20',
    name: 'Reinforcement Steel 20mm',
    category: 'Steel',
    type: ResourceType.MATERIAL,
    unit: 'Ton',
    currency: 'USD',
    supplier: 'ArcelorMittal',
    baseRate: 720.0,
    lastUpdated: '2024-03-14',
  },
  {
    id: 'res-3',
    code: 'LAB-SK-01',
    name: 'Skilled Mason',
    category: 'Masonry',
    type: ResourceType.LABOR,
    unit: 'Day',
    currency: 'USD',
    supplier: 'Internal',
    baseRate: 45.0,
    lastUpdated: '2024-03-10',
  },
  {
    id: 'res-4',
    code: 'EQP-EX-01',
    name: 'Excavator 20T',
    category: 'Earthworks',
    type: ResourceType.EQUIPMENT,
    unit: 'Hour',
    currency: 'USD',
    supplier: 'CAT Rental',
    baseRate: 65.0,
    lastUpdated: '2024-03-12',
  },
];

export const MOCK_RATE_ANALYSES: RateAnalysis[] = [
  {
    id: 'ra-1',
    code: 'RA-CONC-25',
    description: 'Concrete Grade 25 (1:2:4)',
    unit: 'm3',
    categoryId: 'concrete',
    resources: [
      { id: 'rai-1', resourceId: 'res-1', resourceName: 'Portland Cement', resourceType: ResourceType.MATERIAL, quantity: 7.5, unit: 'Bag', rate: 8.5, amount: 63.75, wasteFactor: 0.05 },
      { id: 'rai-2', resourceId: 'res-5', resourceName: 'Fine Sand', resourceType: ResourceType.MATERIAL, quantity: 0.45, unit: 'm3', rate: 25.0, amount: 11.25, wasteFactor: 0.1 },
      { id: 'rai-3', resourceId: 'res-6', resourceName: 'Crushed Stone 20mm', resourceType: ResourceType.MATERIAL, quantity: 0.9, unit: 'm3', rate: 35.0, amount: 31.5, wasteFactor: 0.1 },
      { id: 'rai-4', resourceId: 'res-3', resourceName: 'Skilled Mason', resourceType: ResourceType.LABOR, quantity: 0.5, unit: 'Day', rate: 45.0, amount: 22.5, productivityFactor: 1.1 },
    ],
    totalMaterialCost: 106.5,
    totalLaborCost: 22.5,
    totalEquipmentCost: 0,
    subtotal: 129.0,
    overheadPercentage: 10,
    profitPercentage: 5,
    taxPercentage: 15,
    netRate: 148.35,
    finalRate: 170.6,
  },
  {
    id: 'ra-2',
    code: 'RA-MAS-01',
    description: 'Brick Masonry Wall (1:4)',
    unit: 'm2',
    categoryId: 'masonry',
    resources: [
      { id: 'rai-5', resourceId: 'res-7', resourceName: 'Solid Bricks', resourceType: ResourceType.MATERIAL, quantity: 50, unit: 'Nos', rate: 0.25, amount: 12.5, wasteFactor: 0.05 },
      { id: 'rai-6', resourceId: 'res-1', resourceName: 'Portland Cement', resourceType: ResourceType.MATERIAL, quantity: 0.2, unit: 'Bag', rate: 8.5, amount: 1.7, wasteFactor: 0.03 },
      { id: 'rai-7', resourceId: 'res-3', resourceName: 'Skilled Mason', resourceType: ResourceType.LABOR, quantity: 0.2, unit: 'Day', rate: 45.0, amount: 9.0, productivityFactor: 1.0 },
      { id: 'rai-8', resourceId: 'res-8', resourceName: 'Helper', resourceType: ResourceType.LABOR, quantity: 0.2, unit: 'Day', rate: 25.0, amount: 5.0, productivityFactor: 1.0 },
    ],
    totalMaterialCost: 14.2,
    totalLaborCost: 14.0,
    totalEquipmentCost: 0,
    subtotal: 28.2,
    overheadPercentage: 10,
    profitPercentage: 5,
    taxPercentage: 15,
    netRate: 32.43,
    finalRate: 37.3,
  },
];

export const MOCK_BOQ: BOQItem[] = [
  // Bill 01
  { id: 'bill-1', type: 'BILL', code: 'BILL 01', description: 'PRELIMINARIES AND GENERAL' },
  { id: 'sec-1-1', type: 'SECTION', code: '1.1', description: 'Contractual Requirements', parentId: 'bill-1' },
  { id: 'item-1-1-1', type: 'ITEM', code: '1.1.1', description: 'Performance Bond', unit: 'LS', quantity: 1, rate: 50000, amount: 50000, parentId: 'sec-1-1' },
  { id: 'item-1-1-2', type: 'ITEM', code: '1.1.2', description: 'Insurance of Works', unit: 'LS', quantity: 1, rate: 25000, amount: 25000, parentId: 'sec-1-1' },

  // Bill 02
  { id: 'bill-2', type: 'BILL', code: 'BILL 02', description: 'EARTHWORKS' },
  
  // Section 2.1
  { id: 'sec-2-1', type: 'SECTION', code: '2.1', description: 'Site Clearing', parentId: 'bill-2' },
  { id: 'item-2-1-1', type: 'ITEM', code: '2.1.1', description: 'Clear site of bush and scrub', unit: 'm2', quantity: 5000, rate: 1.5, amount: 7500, parentId: 'sec-2-1' },
  
  // Section 2.2
  { id: 'sec-2-2', type: 'SECTION', code: '2.2', description: 'Excavation', parentId: 'bill-2' },
  
  // Sub Section 2.2.A
  { id: 'sub-2-2-a', type: 'SUB_SECTION', code: '2.2.A', description: 'Bulk Excavation', parentId: 'sec-2-2' },
  { id: 'item-2-2-a-1', type: 'ITEM', code: '2.2.A.1', description: 'Excavate in normal soil', unit: 'm3', quantity: 1200, rate: 8.75, amount: 10500, parentId: 'sub-2-2-a', rateAnalysisId: 'RA-EXC-01' },
  
  // Sub Section 2.2.B
  { id: 'sub-2-2-b', type: 'SUB_SECTION', code: '2.2.B', description: 'Foundation Excavation', parentId: 'sec-2-2' },
  { id: 'item-2-2-b-1', type: 'ITEM', code: '2.2.B.1', description: 'Excavate for strip foundations', unit: 'm3', quantity: 450, rate: 12.50, amount: 5625, parentId: 'sub-2-2-b' },

  // Bill 03
  { id: 'bill-3', type: 'BILL', code: 'BILL 03', description: 'CONCRETE WORKS' },
  { id: 'sec-3-1', type: 'SECTION', code: '3.1', description: 'In-situ Concrete', parentId: 'bill-3' },
  { id: 'sub-3-1-a', type: 'SUB_SECTION', code: '3.1.A', description: 'Grade 25 Concrete', parentId: 'sec-3-1' },
  { id: 'item-3-1-a-1', type: 'ITEM', code: '3.1.A.1', description: 'Concrete Grade 25 in foundations', unit: 'm3', quantity: 150, rate: 170.6, amount: 25590, parentId: 'sub-3-1-a', rateAnalysisId: 'ra-1' },
  { id: 'item-3-1-a-2', type: 'ITEM', code: '3.1.A.2', description: 'Polythene damp proof membrane', unit: 'm2', quantity: 450, rate: 4.50, amount: 2025, parentId: 'sub-3-1-a', resourceId: 'res-7' },
];

export const MOCK_SOTS: SOT[] = [
  {
    id: 'sot-1',
    code: 'SOT/2024/001',
    description: 'Main Building Structure Schedule',
    projectId: 'proj-1',
    projectName: 'Skyline Residence Towers',
    boqId: 'boq-1',
    revisionNo: 1,
    status: SOTStatus.ACTIVE,
    startDate: '2024-06-01',
    endDate: '2024-12-30',
    duration: 212,
    progressPercentage: 35,
    totalBudget: 1250000,
    tasks: [
      {
        id: 'task-1',
        code: 'PH-01',
        name: 'Phase 1: Substructure',
        type: TaskType.SUMMARY,
        priority: TaskPriority.HIGH,
        startDate: '2024-06-01',
        endDate: '2024-07-30',
        duration: 60,
        progressPercentage: 65,
        status: 'In Progress',
        dependencies: [],
        resourceAllocations: [],
        boqAllocations: [],
      },
      {
        id: 'task-1-1',
        parentId: 'task-1',
        code: '1.1',
        name: 'Bulk Excavation',
        type: TaskType.TASK,
        priority: TaskPriority.HIGH,
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        actualStart: '2024-06-02',
        actualFinish: '2024-06-18',
        duration: 14,
        plannedQty: 1200,
        actualQty: 1200,
        totalRemainingQty: 0,
        progressPercentage: 100,
        status: 'Completed',
        delayDays: 3,
        varianceQty: 0,
        responsibleEngineer: 'Sarah Johnson',
        dependencies: [],
        resourceAllocations: [
          { id: 'ra-1', resourceId: 'res-4', resourceName: 'Excavator 20T', resourceType: ResourceType.EQUIPMENT, plannedQty: 120, actualQty: 128, unit: 'Hour', rate: 65, amount: 8320 }
        ],
        boqAllocations: [
          { id: 'ba-1', boqItemId: 'item-2-2-a-1', boqItemCode: '2.2.A.1', description: 'Bulk Excavation in normal soil', unit: 'm3', boqQty: 1200, allocatedQty: 1200, actualQty: 1200, rate: 8.75 }
        ],
        history: [
          { id: 'up-1', taskId: 'task-1-1', date: '2024-06-10', actualQty: 800, unit: 'm3', recordedBy: 'Robert Chen', notes: 'Progressing well. Soil quality as expected.', status: 'Approved' },
          { id: 'up-2', taskId: 'task-1-1', date: '2024-06-18', actualQty: 400, unit: 'm3', recordedBy: 'Robert Chen', notes: 'Excavation completed.', status: 'Approved' }
        ]
      },
      {
        id: 'task-1-2',
        parentId: 'task-1',
        code: '1.2',
        name: 'Water Proofing Foundations',
        type: TaskType.TASK,
        priority: TaskPriority.MEDIUM,
        startDate: '2024-06-16',
        endDate: '2024-06-25',
        actualStart: '2024-06-20',
        duration: 9,
        plannedQty: 450,
        actualQty: 310,
        totalRemainingQty: 140,
        progressPercentage: 68,
        status: 'In Progress',
        delayDays: 4,
        responsibleEngineer: 'Michael Brown',
        dependencies: [{ id: 'dep-1', predecessorId: 'task-1-1', type: DependencyType.FS, lagDays: 0 }],
        resourceAllocations: [],
        boqAllocations: [
          { id: 'ba-2', boqItemId: 'item-3-1-a-2', boqItemCode: '3.1.A.2', description: 'Polythene damp proof membrane', unit: 'm2', boqQty: 450, allocatedQty: 450, actualQty: 310, rate: 4.50 }
        ],
        history: [
          { id: 'up-3', taskId: 'task-1-2', date: '2024-06-22', actualQty: 150, unit: 'm2', recordedBy: 'Robert Chen', notes: 'Delayed due to site accessibility.', status: 'Approved' }
        ]
      },
      {
        id: 'task-1-3',
        parentId: 'task-1',
        code: '1.3',
        name: 'Foundation Concrete (RC 25)',
        type: TaskType.TASK,
        priority: TaskPriority.CRITICAL,
        startDate: '2024-06-26',
        endDate: '2024-07-20',
        actualStart: '2024-06-28',
        duration: 24,
        plannedQty: 150,
        actualQty: 45,
        totalRemainingQty: 105,
        progressPercentage: 30,
        status: 'In Progress',
        isCritical: true,
        delayDays: 2,
        responsibleEngineer: 'Sarah Johnson',
        dependencies: [{ id: 'dep-2', predecessorId: 'task-1-2', type: DependencyType.FS, lagDays: 0 }],
        resourceAllocations: [
          { id: 'ra-2', resourceId: 'res-1', resourceName: 'Portland Cement', resourceType: ResourceType.MATERIAL, plannedQty: 1125, actualQty: 350, unit: 'Bag', rate: 8.5, amount: 2975 }
        ],
        boqAllocations: [
          { id: 'ba-3', boqItemId: 'item-3-1-a-1', boqItemCode: '3.1.A.1', description: 'Concrete Grade 25 in foundations', unit: 'm3', boqQty: 150, allocatedQty: 150, actualQty: 45, rate: 170.6 }
        ]
      },
      {
        id: 'task-2',
        code: 'PH-02',
        name: 'Phase 2: Superstructure',
        type: TaskType.SUMMARY,
        priority: TaskPriority.HIGH,
        startDate: '2024-08-01',
        endDate: '2024-11-30',
        duration: 120,
        progressPercentage: 0,
        status: 'Pending',
        dependencies: [{ id: 'dep-3', predecessorId: 'task-1', type: DependencyType.FS, lagDays: 0 }],
        resourceAllocations: [],
        boqAllocations: [],
      }
    ]
  },
  {
    id: 'sot-2',
    code: 'SOT/2024/002',
    description: 'Infrastructure Phase 1',
    projectId: 'proj-2',
    projectName: 'Industrial Park Development',
    boqId: 'boq-2',
    revisionNo: 0,
    status: SOTStatus.DRAFT,
    startDate: '2024-08-01',
    endDate: '2025-02-28',
    duration: 212,
    progressPercentage: 0,
    totalBudget: 4500000,
    tasks: []
  }
];

export const MOCK_BASELINES: SOTBaseline[] = [
  {
    id: 'base-1',
    sotId: 'sot-1',
    name: 'Original Baseline',
    description: 'Approved baseline at project start',
    createdAt: '2024-05-30',
    tasks: [] // In a real app, this would be a deep copy
  }
];

export const MOCK_DELAY_RECORDS: DelayRecord[] = [
  {
    id: 'del-1',
    taskId: 'task-1-2',
    reason: 'Heavy rain and site flooding',
    category: 'Weather',
    impactDays: 3,
    startDate: '2024-06-16',
    endDate: '2024-06-19',
    mitigationPlan: 'Pump water and dry site with blowers',
    status: 'Resolved',
    responsibleParty: 'Site Logistics'
  },
  {
    id: 'del-2',
    taskId: 'task-1-3',
    reason: 'RFI #43 response delayed',
    category: 'Design',
    impactDays: 5,
    startDate: '2024-06-25',
    status: 'Active',
    mitigationParty: 'Structural Consultant',
    responsibleParty: 'Lead Designer'
  } as any
];

export const MOCK_SITE_PHOTOS: SitePhoto[] = [
  {
    id: 'img-1',
    taskId: 'task-1-1',
    url: 'https://images.unsplash.com/photo-1541913057-25902bc56201?auto=format&fit=crop&q=80&w=400',
    caption: 'Bulk excavation complete on Block A',
    uploadedAt: '2024-06-18T10:00:00Z',
    uploadedBy: 'John Site-Engineer',
    location: 'Area 4 - South'
  },
  {
    id: 'img-2',
    taskId: 'task-1-2',
    url: 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&q=80&w=400',
    caption: 'Waterproofing layer 1 inspection',
    uploadedAt: '2024-06-22T14:30:00Z',
    uploadedBy: 'Robert Chen',
    location: 'Foundation Block B'
  }
];

export const MOCK_PRODUCTIVITY: ProductivityMetric[] = [
  {
    id: 'prod-1',
    taskId: 'task-1-1',
    resourceId: 'res-4',
    date: '2024-06-10',
    outputQty: 80,
    inputHours: 8,
    efficiency: 10,
    targetEfficiency: 12
  },
  {
    id: 'prod-2',
    taskId: 'task-1-1',
    resourceId: 'res-4',
    date: '2024-06-11',
    outputQty: 110,
    inputHours: 8,
    efficiency: 13.75,
    targetEfficiency: 12
  }
];

export const MOCK_PROGRESS_UPDATES: ProgressUpdate[] = [
  {
    id: 'up-1',
    taskId: 'task-1-1',
    taskName: 'Bulk Excavation',
    date: '2024-06-10',
    actualQty: 800,
    unit: 'm3',
    recordedBy: 'Robert Chen',
    reportedBy: 'Robert Chen',
    notes: 'Progressing well. Soil quality as expected.',
    status: 'Approved',
    approvalWorkflow: [
      { id: 'app-1', role: 'Site Engineer', name: 'Robert Chen', status: 'Approved', timestamp: '2024-06-10T11:00:00Z' },
      { id: 'app-2', role: 'Project Manager', name: 'Sarah Johnson', status: 'Approved', timestamp: '2024-06-10T16:00:00Z' }
    ]
  },
  {
    id: 'up-2',
    taskId: 'task-1-2',
    taskName: 'Water Proofing Foundations',
    date: '2024-06-22',
    actualQty: 150,
    unit: 'm2',
    recordedBy: 'Michael Brown',
    reportedBy: 'Michael Brown',
    notes: 'Partial waterproofing done.',
    status: 'Submitted',
    approvalWorkflow: [
      { id: 'app-3', role: 'Site Engineer', name: 'Michael Brown', status: 'Approved', timestamp: '2024-06-22T17:00:00Z' },
      { id: 'app-4', role: 'Project Manager', name: 'Sarah Johnson', status: 'Pending' }
    ]
  }
];
