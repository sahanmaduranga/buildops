// Enterprise Construction SCM Mock Data
import { ResourceType } from '../../types.ts';

export interface ProcurementMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  lastPurchaseRate: number;
  avgCost: number;
  reorderLevel: number;
  targetStock: number;
}

export const MOCK_PROCUREMENT_MATERIALS: ProcurementMaterial[] = [
  { id: 'pm-1', code: 'MAT-CM-01', name: 'Portland Cement Type I (50kg)', category: 'Cement & Binder', unit: 'Bag', currentStock: 250, lastPurchaseRate: 8.5, avgCost: 8.45, reorderLevel: 500, targetStock: 1500 },
  { id: 'pm-2', code: 'MAT-ST-20', name: 'Reinforcement Steel Rebar 20mm', category: 'Steel & Metals', unit: 'Ton', currentStock: 48, lastPurchaseRate: 720.0, avgCost: 715.00, reorderLevel: 15, targetStock: 80 },
  { id: 'pm-3', code: 'MAT-ST-12', name: 'Reinforcement Steel Rebar 12mm', category: 'Steel & Metals', unit: 'Ton', currentStock: 8, lastPurchaseRate: 740.0, avgCost: 735.00, reorderLevel: 12, targetStock: 60 }, // Low Stock
  { id: 'pm-4', code: 'MAT-AG-10', name: 'Crushed Coarse Aggregates 20mm', category: 'Aggregates', unit: 'm3', currentStock: 850, lastPurchaseRate: 35.0, avgCost: 34.20, reorderLevel: 200, targetStock: 1000 },
  { id: 'pm-5', code: 'MAT-SA-02', name: 'Washed Fine Plaster Sand', category: 'Aggregates', unit: 'm3', currentStock: 450, lastPurchaseRate: 25.0, avgCost: 24.80, reorderLevel: 150, targetStock: 600 },
  { id: 'pm-6', code: 'MAT-BK-03', name: 'Solid Clay Bricks 200x100x75mm', category: 'Masonry', unit: 'Pcs', currentStock: 15000, lastPurchaseRate: 0.25, avgCost: 0.24, reorderLevel: 5000, targetStock: 30000 },
  { id: 'pm-7', code: 'MAT-PL-09', name: 'PVC Pipe Heavy Duty Class 5 110mm', category: 'Plumbing', unit: 'Meter', currentStock: 320, lastPurchaseRate: 14.5, avgCost: 14.20, reorderLevel: 100, targetStock: 500 },
  { id: 'pm-8', code: 'MAT-EL-15', name: 'Armored Copper Cable 4-Core 16mm', category: 'Electrical', unit: 'Meter', currentStock: 15, lastPurchaseRate: 45.0, avgCost: 44.50, reorderLevel: 100, targetStock: 400 }, // Low Stock
  { id: 'pm-9', code: 'MAT-PT-04', name: 'Premium Weathercoat Exterior Paint', category: 'Finishes', unit: 'Drum (20L)', currentStock: 64, lastPurchaseRate: 85.0, avgCost: 83.50, reorderLevel: 20, targetStock: 150 },
  { id: 'pm-10', code: 'MAT-AD-01', name: 'Waterproofing Chemical Compound Sika', category: 'Chemicals', unit: 'Can (10L)', currentStock: 5, lastPurchaseRate: 110.0, avgCost: 108.00, reorderLevel: 15, targetStock: 50 }, // Low Stock
];

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rating: number; // 0 - 5
  totalOrders: number;
  delayedDeliveries: number;
  qualityScore: number; // %
  financialExposure: number; // unpaid amounts
  paymentStatus: 'Current' | 'Overdue' | 'Grace';
  bankName: string;
  bankBranch: string;
  iban: string;
  taxId: string;
  category: string;
}

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Atlas Steel & Rebars Co.',
    code: 'SUP-ATL-01',
    contactName: 'Yousef Al-Kharji',
    email: 'sales@atlassteel.com',
    phone: '+966 50 123 4567',
    address: 'Industrial City Area 4, Riyadh, KSA',
    rating: 4.8,
    totalOrders: 35,
    delayedDeliveries: 1,
    qualityScore: 99,
    financialExposure: 145000,
    paymentStatus: 'Current',
    bankName: 'Saudi National Bank (SNB)',
    bankBranch: 'Main Olaya Branch',
    iban: 'SA4390000010001234567890',
    taxId: '300012345600003',
    category: 'Steel & Metals'
  },
  {
    id: 'sup-2',
    name: 'Unified Cement Group (UCG)',
    code: 'SUP-UNI-02',
    contactName: 'Ahmad Al-Mansour',
    email: 'commercial@ucg-cement.sa',
    phone: '+966 54 987 6543',
    address: 'Al Kharj Highway Road, Riyadh, KSA',
    rating: 4.5,
    totalOrders: 58,
    delayedDeliveries: 3,
    qualityScore: 96,
    financialExposure: 87400,
    paymentStatus: 'Current',
    bankName: 'Al Rajhi Bank',
    bankBranch: 'Al Kharj Rd Branch',
    iban: 'SA1280000040009876543210',
    taxId: '300054321000003',
    category: 'Cement & Binder'
  },
  {
    id: 'sup-3',
    name: 'Gulf Building Materials Corp.',
    code: 'SUP-GBM-03',
    contactName: 'Sanjay Kapoor',
    email: 's.kapoor@gulfmaterials.com',
    phone: '+966 11 445 6111',
    address: 'Exit 17 Sandbox District, Riyadh, KSA',
    rating: 3.9,
    totalOrders: 22,
    delayedDeliveries: 5,
    qualityScore: 90,
    financialExposure: 32000,
    paymentStatus: 'Overdue',
    bankName: 'Banque Saudi Fransi',
    bankBranch: 'Exit 17 Branch',
    iban: 'SA7750000015004455667788',
    taxId: '301222445500003',
    category: 'General Aggregate'
  },
  {
    id: 'sup-4',
    name: 'National Piping & PVC Systems',
    code: 'SUP-NPP-04',
    contactName: 'Fahad Bin Khalid',
    email: 'info@nationalpipe.com.sa',
    phone: '+966 56 443 2121',
    address: 'Dammam Industrial Zone 2, KSA',
    rating: 4.6,
    totalOrders: 18,
    delayedDeliveries: 0,
    qualityScore: 98,
    financialExposure: 41200,
    paymentStatus: 'Current',
    bankName: 'Riyad Bank',
    bankBranch: 'Dammam Main',
    iban: 'SA2440000025008899221133',
    taxId: '300099887700003',
    category: 'Plumbing'
  },
  {
    id: 'sup-5',
    name: 'Sika Chemicals Saudi Arabia',
    code: 'SUP-SIK-05',
    contactName: 'Marc-Andre Dupont',
    email: 'dupont.marc@sa.sika.com',
    phone: '+966 12 607 1234',
    address: 'Phase III, Industrial City, Jeddah, KSA',
    rating: 4.7,
    totalOrders: 14,
    delayedDeliveries: 1,
    qualityScore: 99,
    financialExposure: 11000,
    paymentStatus: 'Current',
    bankName: 'Arab National Bank (ANB)',
    bankBranch: 'Jeddah Business Gate',
    iban: 'SA3320000012001122334455',
    taxId: '300854215400003',
    category: 'Chemicals'
  }
];

export interface PRItem {
  resourceId: string;
  resourceCode: string;
  resourceName: string;
  category: string;
  unit: string;
  qty: number;
  estimatedRate: number;
  amount: number;
  requiredDate: string;
  warehouseId: string;
  remarks?: string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requestDate: string;
  requestedBy: string;
  department: string;
  siteLocation: string;
  requiredDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  totalAmount: number;
  approvalStatus: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  procurementStatus: 'Draft' | 'Pending RFP' | 'RFP Issued' | 'PO Created' | 'Partially Received' | 'Fulfilled';
  remarks?: string;
  items: PRItem[];
  approvalsLogs: { role: string; name: string; status: string; date: string; comment?: string }[];
  attachments?: string[];
}

export const MOCK_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 'pr-1',
    prNumber: 'PR-2026-0410',
    requestDate: '2026-04-10',
    requestedBy: 'Robert Chen',
    department: 'Civil Infrastructure',
    siteLocation: 'Zone A Foundation Block',
    requiredDate: '2026-06-15',
    priority: 'High',
    totalAmount: 36000,
    approvalStatus: 'Approved',
    procurementStatus: 'RFP Issued',
    remarks: 'Urgent cement and reinforcing steel requirement for foundation casting schedule.',
    items: [
      { resourceId: 'pm-1', resourceCode: 'MAT-CM-01', resourceName: 'Portland Cement Type I (50kg)', category: 'Cement & Binder', unit: 'Bag', qty: 1000, estimatedRate: 8.5, amount: 8500, requiredDate: '2026-06-15', warehouseId: 'wh-1', remarks: 'Grade 25 concrete compounding' },
      { resourceId: 'pm-2', resourceCode: 'MAT-ST-20', name: 'Reinforcement Steel Rebar 20mm', category: 'Steel & Metals', unit: 'Ton', qty: 38, estimatedRate: 720, amount: 27520, requiredDate: '2026-06-12', warehouseId: 'wh-1' } as any
    ],
    approvalsLogs: [
      { role: 'Site Engineer', name: 'Robert Chen', status: 'Submitted', date: '2026-04-10', comment: 'Casting planned for mid-June.' },
      { role: 'Store Manager', name: 'Khalid Al-Asiri', status: 'Approved', date: '2026-04-11', comment: 'Stock levels insufficient; purchase required.' },
      { role: 'Procurement Officer', name: 'Ziad Mansour', status: 'Approved', date: '2026-04-12', comment: 'RFP is ready to transmit.' },
      { role: 'Commercial Manager', name: 'Sarah Johnson', status: 'Approved', date: '2026-04-13', comment: 'Cost allocated inside Civil BOQ baseline.' }
    ],
    attachments: ['MOCK_BOQ_EXTRACT.pdf', 'SITE_CASTING_PLAN_V2.dwg']
  },
  {
    id: 'pr-2',
    prNumber: 'PR-2026-0502',
    requestDate: '2026-05-02',
    requestedBy: 'Michael Brown',
    department: 'MEP (Mechanical & Electrical)',
    siteLocation: 'Utility Plant Building',
    requiredDate: '2026-05-28',
    priority: 'Critical',
    totalAmount: 18000,
    approvalStatus: 'Approved',
    procurementStatus: 'PO Created',
    remarks: 'Power systems cabling required to initiate main switchgear connection.',
    items: [
      { resourceId: 'pm-8', resourceCode: 'MAT-EL-15', resourceName: 'Armored Copper Cable 4-Core 16mm', category: 'Electrical', unit: 'Meter', qty: 400, estimatedRate: 45.0, amount: 18000, requiredDate: '2026-05-28', warehouseId: 'wh-2' }
    ],
    approvalsLogs: [
      { role: 'Site Engineer', name: 'Michael Brown', status: 'Submitted', date: '2026-05-02' },
      { role: 'Store Manager', name: 'Khalid Al-Asiri', status: 'Approved', date: '2026-05-03' },
      { role: 'Procurement Officer', name: 'Ziad Mansour', status: 'Approved', date: '2026-05-04' },
      { role: 'Commercial Manager', name: 'Sarah Johnson', status: 'Approved', date: '2026-05-05' },
      { role: 'Finance Officer', name: 'Waleed Fakhry', status: 'Approved', date: '2026-05-06', comment: 'Budget approved.' }
    ]
  },
  {
    id: 'pr-3',
    prNumber: 'PR-2026-0515',
    requestDate: '2026-05-15',
    requestedBy: 'Tariq Al-Harbi',
    department: 'Finishes & Fitouts',
    siteLocation: 'Towers Office Level 12-15',
    requiredDate: '2026-06-30',
    priority: 'Medium',
    totalAmount: 5440,
    approvalStatus: 'Submitted',
    procurementStatus: 'Pending RFP',
    remarks: 'Premium paint drum lots for building partition walls.',
    items: [
      { resourceId: 'pm-9', resourceCode: 'MAT-PT-04', resourceName: 'Premium Weathercoat Exterior Paint', category: 'Finishes', unit: 'Drum (20L)', qty: 64, estimatedRate: 85.0, amount: 5440, requiredDate: '2026-06-30', warehouseId: 'wh-1' }
    ],
    approvalsLogs: [
      { role: 'Site Engineer', name: 'Tariq Al-Harbi', status: 'Submitted', date: '2026-05-15', comment: 'Standard lead time finishes.' },
      { role: 'Store Manager', name: 'Khalid Al-Asiri', status: 'Approved', date: '2026-05-16', comment: 'Ready for market price checks.' }
    ]
  },
  {
    id: 'pr-4',
    prNumber: 'PR-2026-0518',
    requestDate: '2026-05-18',
    requestedBy: 'Robert Chen',
    department: 'Civil Infrastructure',
    siteLocation: 'Block C Basement Tank',
    requiredDate: '2026-05-25',
    priority: 'High',
    totalAmount: 1100,
    approvalStatus: 'Submitted',
    procurementStatus: 'Pending RFP',
    remarks: 'Low stock notification response - Sika waterproofing compound requirement.',
    items: [
      { resourceId: 'pm-10', resourceCode: 'MAT-AD-01', resourceName: 'Waterproofing Chemical Compound Sika', category: 'Chemicals', unit: 'Can (10L)', qty: 10, estimatedRate: 110.0, amount: 1100, requiredDate: '2026-05-25', warehouseId: 'wh-1' }
    ],
    approvalsLogs: [
      { role: 'Site Engineer', name: 'Robert Chen', status: 'Submitted', date: '2026-05-18', comment: 'Low store alert recommendation.' }
    ]
  }
];

export interface RFQSupplierSubmission {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  taxAmount: number;
  warrantyYears: number;
  specificationsMatch: boolean;
  score: number;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  prReference: string;
  prId: string;
  subject: string;
  creationDate: string;
  closingDate: string;
  status: 'Published' | 'Under Review' | 'Completed' | 'Closed';
  createdBy: string;
  items: { code: string; name: string; unit: string; qty: number }[];
  supplierSubmissions: RFQSupplierSubmission[];
}

export const MOCK_RFQS: RFQ[] = [
  {
    id: 'rfq-1',
    rfqNumber: 'RFQ-2026-015',
    prReference: 'PR-2026-0410',
    prId: 'pr-1',
    subject: 'Bulk Heavy Portland Cement Procurement Lot',
    creationDate: '2026-04-14',
    closingDate: '2026-05-25',
    status: 'Under Review',
    createdBy: 'Ziad Mansour',
    items: [
      { code: 'MAT-CM-01', name: 'Portland Cement Type I (50kg)', unit: 'Bag', qty: 1000 }
    ],
    supplierSubmissions: [
      {
        supplierId: 'sup-2',
        supplierName: 'Unified Cement Group (UCG)',
        unitPrice: 8.25,
        deliveryDays: 5,
        paymentTerms: 'CAD 30 Days Net',
        taxAmount: 1237.5,
        warrantyYears: 1,
        specificationsMatch: true,
        score: 95
      },
      {
        supplierId: 'sup-3',
        supplierName: 'Gulf Building Materials Corp.',
        unitPrice: 8.40,
        deliveryDays: 3,
        paymentTerms: 'Advanced Cash on Delivery',
        taxAmount: 1260.0,
        warrantyYears: 1,
        specificationsMatch: true,
        score: 82
      }
    ]
  },
  {
    id: 'rfq-2',
    rfqNumber: 'RFQ-2026-016',
    prReference: 'PR-2026-0502',
    prId: 'pr-2',
    subject: 'MEP Armored Cable Distribution Supply',
    creationDate: '2026-05-06',
    closingDate: '2026-05-18',
    status: 'Completed',
    createdBy: 'Ziad Mansour',
    items: [
      { code: 'MAT-EL-15', name: 'Armored Copper Cable 4-Core 16mm', unit: 'Meter', qty: 400 }
    ],
    supplierSubmissions: [
      {
        supplierId: 'sup-4',
        supplierName: 'National Piping & PVC Systems',
        unitPrice: 43.50,
        deliveryDays: 4,
        paymentTerms: 'Credit 45 Days',
        taxAmount: 2610.0,
        warrantyYears: 5,
        specificationsMatch: true,
        score: 97
      }
    ]
  }
];

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  rfqReference?: string;
  prReference?: string;
  issueDate: string;
  deliveryDate: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'In Transit' | 'Delivered' | 'Delayed' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid - Cash' | 'Paid - LC' | 'Partially Paid' | 'LC Advised';
  paymentTerms: string;
  remarks?: string;
  items: { resourceId: string; code: string; name: string; unit: string; orderedQty: number; rate: number; receivedQty: number; amount: number }[];
  deliverySchedules: { date: string; qty: number; status: string }[];
  revisions: { revNo: number; date: string; updatedBy: string; notes: string }[];
  approvalsTimeline: { role: string; name: string; status: string; date: string; comment?: string }[];
}

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-0034',
    supplierId: 'sup-4',
    supplierName: 'National Piping & PVC Systems',
    rfqReference: 'RFQ-2026-016',
    prReference: 'PR-2026-0502',
    issueDate: '2026-05-10',
    deliveryDate: '2026-05-24',
    netAmount: 17400,
    taxAmount: 2610,
    totalAmount: 20010,
    status: 'In Transit',
    paymentStatus: 'Unpaid',
    paymentTerms: 'Credit 45 Days Post Delivery',
    remarks: 'Cabling for switchgear utility room connection, high priority sequence.',
    items: [
      { resourceId: 'pm-8', code: 'MAT-EL-15', name: 'Armored Copper Cable 4-Core 16mm', unit: 'Meter', orderedQty: 400, rate: 43.50, receivedQty: 120, amount: 17400 }
    ],
    deliverySchedules: [
      { date: '2026-05-20', qty: 120, status: 'Completed (GRN-12)' },
      { date: '2026-05-24', qty: 280, status: 'In Transit' }
    ],
    revisions: [
      { revNo: 0, date: '2026-05-10', updatedBy: 'Ziad Mansour', notes: 'Initial Purchase Order Release.' }
    ],
    approvalsTimeline: [
      { role: 'Procurement Officer', name: 'Ziad Mansour', status: 'Approved', date: '2026-05-10' },
      { role: 'Commercial Manager', name: 'Sarah Johnson', status: 'Approved', date: '2026-05-11', comment: 'Within MEP electrical cost limits.' },
      { role: 'Finance Officer', name: 'Waleed Fakhry', status: 'Approved', date: '2026-05-12', comment: 'LC/Credit line verified.' }
    ]
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-0035',
    supplierId: 'sup-1',
    supplierName: 'Atlas Steel & Rebars Co.',
    prReference: 'PR-2026-0410',
    issueDate: '2026-05-12',
    deliveryDate: '2026-05-28',
    netAmount: 27520,
    taxAmount: 4128,
    totalAmount: 31648,
    status: 'Approved',
    paymentStatus: 'Unpaid',
    paymentTerms: '30 Days Net on GRN',
    remarks: 'Rebars 20mm for structural retaining foundation wall project.',
    items: [
      { resourceId: 'pm-2', code: 'MAT-ST-20', name: 'Reinforcement Steel Rebar 20mm', unit: 'Ton', orderedQty: 38, rate: 720.00, receivedQty: 0, amount: 27520 }
    ],
    deliverySchedules: [
      { date: '2026-05-28', qty: 38, status: 'Scheduled' }
    ],
    revisions: [],
    approvalsTimeline: [
      { role: 'Procurement Officer', name: 'Ziad Mansour', status: 'Approved', date: '2026-05-12' },
      { role: 'Commercial Manager', name: 'Sarah Johnson', status: 'Approved', date: '2026-05-13' }
    ]
  }
];

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poReference: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  receivedBy: string;
  warehouseId: string;
  warehouseName: string;
  inspectionStatus: 'Pending' | 'Passed' | 'Failed_Rejected';
  inspectionNotes?: string;
  items: { code: string; name: string; unit: string; orderedQty: number; receivedQty: number; damagedQty: number; rejectedQty: number; batchNo: string; inspectionPassed: boolean }[];
  attachments?: string[];
  photos?: string[];
}

export const MOCK_GRNS: GoodsReceiptNote[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-0012',
    poReference: 'PO-2026-0034',
    poId: 'po-1',
    supplierId: 'sup-4',
    supplierName: 'National Piping & PVC Systems',
    receiptDate: '2026-05-20',
    receivedBy: 'Khalid Al-Asiri',
    warehouseId: 'wh-2',
    warehouseName: 'Mechanical Yard Open Store',
    inspectionStatus: 'Passed',
    inspectionNotes: 'The visual insulation covers are checked and intact. Continuity Ohm-test passed on partial coils.',
    items: [
      { code: 'MAT-EL-15', name: 'Armored Copper Cable 4-Core 16mm', unit: 'Meter', orderedQty: 400, receivedQty: 120, damagedQty: 0, rejectedQty: 0, batchNo: 'B-EL-C416-2026A', inspectionPassed: true }
    ],
    attachments: ['DELIVERY_NOTE_NPP_431.pdf'],
    photos: ['COIL_INSPECT_CHECK.jpg']
  }
];

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacityUsed: number; // %
  layoutZones: { zoneCode: string; description: string; currentLayout: string }[];
}

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Main Civil Area Depot',
    code: 'WH-CIV-01',
    location: 'Sector A site boundaries gate #1',
    manager: 'Khalid Al-Asiri',
    capacityUsed: 68,
    layoutZones: [
      { zoneCode: 'ZONE-A1', description: 'Heavy cements bulk bins', currentLayout: 'Racks 1 to 5' },
      { zoneCode: 'ZONE-A2', description: 'Steel bars stack yards', currentLayout: 'Depot floor' },
      { zoneCode: 'ZONE-B1', description: 'Chemical waterproofing silos', currentLayout: 'Cool chambers' }
    ]
  },
  {
    id: 'wh-2',
    name: 'Mechanical Yard Open Store',
    code: 'WH-MEP-02',
    location: 'Sector B building substation basement side',
    manager: 'Faris Al-Otaibi',
    capacityUsed: 42,
    layoutZones: [
      { zoneCode: 'ZONE-E1', description: 'Coils, conduits and cabling trays', currentLayout: 'Bins A-F' },
      { zoneCode: 'ZONE-E2', description: 'Transformer holding bins', currentLayout: 'Floor pads' }
    ]
  }
];

export interface MaterialIssue {
  id: string;
  voucherNo: string;
  issueDate: string;
  issuedBy: string;
  issuedTo: string; // Site engineer
  warehouseId: string;
  warehouseName: string;
  taskAllocationId: string; // Task ID linked
  taskName: string;
  boqItemCode: string; // Linked BOQ
  totalAmount: number;
  status: 'Draft' | 'Issued' | 'Returned';
  items: { code: string; name: string; unit: string; issuedQty: number; consumedQty: number; wastageQty: number; rate: number; returnQty: number }[];
}

export const MOCK_MATERIAL_ISSUES: MaterialIssue[] = [
  {
    id: 'issue-1',
    voucherNo: 'ISV-2026-0189',
    issueDate: '2026-05-18',
    issuedBy: 'Khalid Al-Asiri',
    issuedTo: 'Robert Chen',
    warehouseId: 'wh-1',
    warehouseName: 'Main Civil Area Depot',
    taskAllocationId: 'task-1-3',
    taskName: 'Foundation Concrete (RC 25)',
    boqItemCode: '3.1.A.1',
    totalAmount: 2975,
    status: 'Issued',
    items: [
      { code: 'MAT-CM-01', name: 'Portland Cement Type I (50kg)', unit: 'Bag', issuedQty: 350, consumedQty: 335, wastageQty: 15, rate: 8.5, returnQty: 0 }
    ]
  }
];

export interface StockTransfer {
  id: string;
  transferNo: string;
  requestDate: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  requestedBy: string;
  status: 'Requested' | 'In Transit' | 'Approved_Received' | 'Rejected';
  items: { code: string; name: string; unit: string; qty: number }[];
}

export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'trans-1',
    transferNo: 'TRN-2026-004',
    requestDate: '2026-05-14',
    sourceWarehouseId: 'wh-1',
    sourceWarehouseName: 'Main Civil Area Depot',
    targetWarehouseId: 'wh-2',
    targetWarehouseName: 'Mechanical Yard Open Store',
    requestedBy: 'Faris Al-Otaibi',
    status: 'Approved_Received',
    items: [
      { code: 'MAT-PL-09', name: 'PVC Pipe Heavy Duty Class 5 110mm', unit: 'Meter', qty: 100 }
    ]
  }
];

export interface EquipmentPlant {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'In Use' | 'Idle' | 'Under Maintenance' | 'Breakdown';
  utilizationPercentage: number;
  plannedHours: number;
  actualHours: number;
  fuelConsumedLiters: number;
  operatorName: string;
  maintenanceDueDate: string;
  lockedInTask?: string;
  historyLogs: { date: string; hourQty: number; event: string; status: string }[];
}

export const MOCK_EQUIPMENT_PLANT: EquipmentPlant[] = [
  {
    id: 'eq-1',
    code: 'EQP-EX-01',
    name: 'Excavator Heavy Duty CAT-320D',
    category: 'Earthworks Excavators',
    status: 'In Use',
    utilizationPercentage: 88,
    plannedHours: 120,
    actualHours: 128,
    fuelConsumedLiters: 1540,
    operatorName: 'Ali Al-Hassan',
    maintenanceDueDate: '2026-06-15',
    lockedInTask: 'Bulk Excavation',
    historyLogs: [
      { date: '2026-05-10', hourQty: 8, event: 'Foundation Trenching excavating block A', status: 'In Use' },
      { date: '2026-05-12', hourQty: 10, event: 'Foundation pile trenching', status: 'In Use' },
    ]
  },
  {
    id: 'eq-2',
    code: 'EQP-CR-02',
    name: 'Tower Crane Liebherr 150 EC-B',
    category: 'Cranes & Lifting',
    status: 'In Use',
    utilizationPercentage: 74,
    plannedHours: 160,
    actualHours: 155,
    fuelConsumedLiters: 0, // Electrical
    operatorName: 'Stephen Cole',
    maintenanceDueDate: '2026-05-24', // Maintenance Due Soon
    lockedInTask: 'Phase 2: Superstructure Lift',
    historyLogs: []
  },
  {
    id: 'eq-3',
    code: 'EQP-MX-01',
    name: 'Mobile Concrete Mixer Truck Hino',
    category: 'Transit Concrete Mixers',
    status: 'Idle',
    utilizationPercentage: 35,
    plannedHours: 40,
    actualHours: 32,
    fuelConsumedLiters: 560,
    operatorName: 'Bassem Abdulrazzaq',
    maintenanceDueDate: '2026-06-25',
    historyLogs: []
  },
  {
    id: 'eq-4',
    code: 'EQP-GE-05',
    name: 'Diesel Power Generator Cummins 250kVA',
    category: 'Generators & Power',
    status: 'Breakdown',
    utilizationPercentage: 0,
    plannedHours: 80,
    actualHours: 42,
    fuelConsumedLiters: 780,
    operatorName: 'Michael Brown (Support)',
    maintenanceDueDate: '2026-05-18', // Past Due / Breakdown
    historyLogs: [
      { date: '2026-05-18', hourQty: 0, event: 'Alternator overheat reported on Site', status: 'Breakdown' }
    ]
  }
];
