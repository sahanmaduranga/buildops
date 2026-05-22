import { ResourceType } from '../../types.ts';

export interface EnhancedResource {
  id: string;
  code: string;
  name: string;
  category: string;
  type: ResourceType;
  unit: string;
  currency: string;
  supplier: string;
  baseRate: number;
  specifications?: string;
  lastUpdated: string;
  status: 'Active' | 'Inactive' | 'Archived' | 'Draft';
  usageCount: number;
  linkedRateAnalysisCount: number;
  remarks?: string;
  attachments?: string[];
  currentRegionPrice?: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  status: 'Active' | 'Inactive';
  isPreferred: boolean;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  description: string;
  status: 'Active' | 'Archived';
}

export interface ResourcePrice {
  id: string;
  resourceId: string;
  resourceName: string;
  regionId: string;
  regionName: string;
  supplierId: string;
  supplierName: string;
  effectiveDate: string;
  fiscalPeriod: string;
  unitRate: number;
  currency: string;
  status: 'Active' | 'Deactivated';
}

export interface ResourceUsage {
  id: string;
  resourceId: string;
  resourceName: string;
  type: 'Rate Analysis' | 'BOQ Item' | 'Procurement' | 'Inventory' | 'Cost Tracking';
  code: string;
  name: string;
  quantity?: number;
  unit?: string;
  amount?: number;
  date?: string;
}

// Initial mock Categories tree with hierarchy
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-mat', code: 'CAT-MAT', name: 'Materials', parentId: null, description: 'Bulk physical building materials', status: 'Active' },
  { id: 'cat-cem', code: 'CAT-CEM', name: 'Cement', parentId: 'cat-mat', description: 'Portland cement and structural mixes', status: 'Active' },
  { id: 'cat-st', code: 'CAT-ST', name: 'Steel', parentId: 'cat-mat', description: 'Reinforcement bars, beams, and rods', status: 'Active' },
  { id: 'cat-agg', code: 'CAT-AGG', name: 'Aggregate', parentId: 'cat-mat', description: 'Fine sand, gravel, and crushed stone', status: 'Active' },
  { id: 'cat-lab', code: 'CAT-LAB', name: 'Labor', parentId: null, description: 'Human resources and construction crews', status: 'Active' },
  { id: 'cat-sk', code: 'CAT-SK', name: 'Skilled', parentId: 'cat-lab', description: 'Masons, electricians, welders, and carpentors', status: 'Active' },
  { id: 'cat-usk', code: 'CAT-USK', name: 'Unskilled', parentId: 'cat-lab', description: 'General helpers and site cleanup crews', status: 'Active' },
  { id: 'cat-eqp', code: 'CAT-EQP', name: 'Equipment', parentId: null, description: 'Yellow machinery, power tools, and fuel', status: 'Active' },
  { id: 'cat-hvy', code: 'CAT-HVY', name: 'Heavy Machinery', parentId: 'cat-eqp', description: 'Excavators, cranes, bulk dump trucks', status: 'Active' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', code: 'SUP-LAF', name: 'LafargeHolcim', contactPerson: 'Arnaud van de Kamp', email: 'arnaud@lafarge.com', phone: '+966-11-456-1122', address: 'Olaya District, Riyadh, KSA', taxNumber: 'VAT-918231', status: 'Active', isPreferred: true },
  { id: 'sup-2', code: 'SUP-ARC', name: 'ArcelorMittal Steel', contactPerson: 'Karim Al-Harbi', email: 'sales@arcelor.sa', phone: '+966-13-890-4400', address: 'Industrial Area Phase II, Dammam, KSA', taxNumber: 'VAT-887711', status: 'Active', isPreferred: true },
  { id: 'sup-3', code: 'SUP-CEM', name: 'CEMEX Saudi', contactPerson: 'Rodrigo Gomez', email: 'rodrigo@cemex.sa', phone: '+966-12-650-9900', address: 'Prince Sultan Rd, Jeddah, KSA', taxNumber: 'VAT-554123', status: 'Active', isPreferred: false },
  { id: 'sup-4', code: 'SUP-CAT', name: 'CAT Rental KSA', contactPerson: 'Marcus Vance', email: 'marcus@catrental.com.sa', phone: '+966-50-222-3434', address: 'Exit 17 Malik Rd, Riyadh, KSA', taxNumber: 'VAT-100293', status: 'Active', isPreferred: true },
  { id: 'sup-5', code: 'SUP-ALR', name: 'Al-Rashed Wood', contactPerson: 'Fahad Al-Rashed', email: 'fahad@alrashed.com.sa', phone: '+966-13-581-2900', address: 'Hofuf Main St, Al-Ahsa, KSA', taxNumber: 'VAT-239102', status: 'Active', isPreferred: false },
  { id: 'sup-6', code: 'SUP-SAE', name: 'Saudi Electro-Mechanical', contactPerson: 'Tariq Fawzi', email: 'tfawzi@saudielectro.com', phone: '+966-11-203-9000', address: 'Salah Al-Din Rd, Riyadh, KSA', taxNumber: 'VAT-773344', status: 'Active', isPreferred: true },
];

export const INITIAL_RESOURCES: EnhancedResource[] = [
  {
    id: 'res-1',
    code: 'MAT-CM-01',
    name: 'Portland Cement Type I',
    category: 'Cement',
    type: ResourceType.MATERIAL,
    unit: 'Bag (50kg)',
    currency: 'USD',
    supplier: 'LafargeHolcim',
    baseRate: 8.5,
    specifications: 'Standard Grade 42.5N complying with SASO GSO 1917 standards. Suitable for non-sulfate concrete structures.',
    lastUpdated: '2026-05-18',
    status: 'Active',
    usageCount: 12,
    linkedRateAnalysisCount: 3,
    remarks: 'Regular high-volume cement batch. Price trends up slightly as summer demand peaks.',
    attachments: ['saso_certificate_2026.pdf', 'cement_type1_specsheet.pdf'],
    currentRegionPrice: 8.5,
  },
  {
    id: 'res-2',
    code: 'MAT-ST-20',
    name: 'Reinforcement Steel 20mm',
    category: 'Steel',
    type: ResourceType.MATERIAL,
    unit: 'Ton',
    currency: 'USD',
    supplier: 'ArcelorMittal Steel',
    baseRate: 720.0,
    specifications: 'High-yield deformable bars, Grade 60 (420 MPa). Conforms perfectly to ASTM A615 specification.',
    lastUpdated: '2026-05-20',
    status: 'Active',
    usageCount: 22,
    linkedRateAnalysisCount: 5,
    remarks: 'Managed via long-term supply agreement. Rate updated monthly according to LME steel index.',
    attachments: ['mill_test_report_st20.pdf'],
    currentRegionPrice: 720.0,
  },
  {
    id: 'res-3',
    code: 'LAB-SK-01',
    name: 'Skilled Mason',
    category: 'Skilled',
    type: ResourceType.LABOR,
    unit: 'Day',
    currency: 'USD',
    supplier: 'Internal',
    baseRate: 45.0,
    specifications: 'Multi-skilled mason certified in high-precision structural concrete blockwork and exterior cladding installation.',
    lastUpdated: '2026-05-15',
    status: 'Active',
    usageCount: 15,
    linkedRateAnalysisCount: 4,
    remarks: 'Subject to hot weather peak period shifts.',
    attachments: [],
    currentRegionPrice: 45.0,
  },
  {
    id: 'res-4',
    code: 'EQP-EX-01',
    name: 'Excavator 20T',
    category: 'Heavy Machinery',
    type: ResourceType.EQUIPMENT,
    unit: 'Hour',
    currency: 'USD',
    supplier: 'CAT Rental KSA',
    baseRate: 65.0,
    specifications: 'Caterpillar 320 GC hydraulic excavator with 1.2 cubic meter bucket, GPS grading system integrated.',
    lastUpdated: '2026-05-10',
    status: 'Active',
    usageCount: 8,
    linkedRateAnalysisCount: 2,
    remarks: 'Weekly inspection log required. Fuel surcharge indexed separately.',
    attachments: ['cat_320_manual.pdf', 'operator_licensing_requirements.pdf'],
    currentRegionPrice: 65.0,
  },
  {
    id: 'res-5',
    code: 'MAT-SND-01',
    name: 'Fine Silica Sand (Conform M-Type)',
    category: 'Aggregate',
    type: ResourceType.MATERIAL,
    unit: 'm³',
    currency: 'USD',
    supplier: 'CEMEX Saudi',
    baseRate: 25.0,
    specifications: 'Double-washed local red sand, free from plastic clay materials and organic impurities. F.M. range 2.3 to 2.8.',
    lastUpdated: '2026-04-12',
    status: 'Active',
    usageCount: 4,
    linkedRateAnalysisCount: 1,
    remarks: 'Available in high supply, but logistics add 10% premium in remote NEOM zones.',
    currentRegionPrice: 25.0,
  },
  {
    id: 'res-6',
    code: 'MAT-AGG-20',
    name: 'Crushed Coarse Aggregate 20mm',
    category: 'Aggregate',
    type: ResourceType.MATERIAL,
    unit: 'm³',
    currency: 'USD',
    supplier: 'CEMEX Saudi',
    baseRate: 35.0,
    specifications: 'Hard stone gravel, crushed and screened. Sieve size 10mm to 20mm. Max water absorption limits 1.5%.',
    lastUpdated: '2026-05-02',
    status: 'Active',
    usageCount: 6,
    linkedRateAnalysisCount: 1,
    remarks: 'Tested weekly for alkali-silica reactivity.',
    currentRegionPrice: 35.0,
  },
  {
    id: 'res-7',
    code: 'MAT-BR-01',
    name: 'Red Clay Solid Bricks Group 2',
    category: 'Aggregate',
    type: ResourceType.MATERIAL,
    unit: 'Nos',
    currency: 'USD',
    supplier: 'LafargeHolcim',
    baseRate: 0.25,
    specifications: 'Fired clay structural brick. Load capacity greater than 15 MPa. Under 8% moisture intake.',
    lastUpdated: '2026-05-11',
    status: 'Active',
    usageCount: 3,
    linkedRateAnalysisCount: 1,
    remarks: 'Secured via regional block agreement.',
    currentRegionPrice: 0.25,
  },
  {
    id: 'res-8',
    code: 'LAB-HP-02',
    name: 'General Helper Rate 2',
    category: 'Unskilled',
    type: ResourceType.LABOR,
    unit: 'Day',
    currency: 'USD',
    supplier: 'Internal',
    baseRate: 25.0,
    specifications: 'Safety-inducted general site worker. Handles material hauling, simple tools and cleanup crew functions.',
    lastUpdated: '2026-05-01',
    status: 'Active',
    usageCount: 30,
    linkedRateAnalysisCount: 3,
    remarks: 'Minimum wage aligned to local standard labor guidelines.',
    currentRegionPrice: 25.0,
  },
  {
    id: 'res-9',
    code: 'MAT-WD-10',
    name: 'Marine Plywood 18mm',
    category: 'Aggregate', // Using placeholder
    type: ResourceType.MATERIAL,
    unit: 'Nos',
    currency: 'USD',
    supplier: 'Al-Rashed Wood',
    baseRate: 48.0,
    specifications: 'E0 grade waterproofing glue, core quality red hardwood layers, 18mm continuous calibration sheeting.',
    lastUpdated: '2026-04-30',
    status: 'Inactive',
    usageCount: 0,
    linkedRateAnalysisCount: 0,
    remarks: 'Temporary storage dry stock. Re-negotiation of volume pricing upcoming.',
    currentRegionPrice: 48.0,
  },
  {
    id: 'res-10',
    code: 'MAT-SC-01',
    name: 'Raw Scaffolding Steel Tube',
    category: 'Steel',
    type: ResourceType.MATERIAL,
    unit: 'MT',
    currency: 'USD',
    supplier: 'Saudi Steel Corp',
    baseRate: 810.0,
    specifications: 'Hot dip galvanized tubes, OD 48.3mm with thickness 3.2mm conforming to structural BS 1139 standard.',
    lastUpdated: '2026-03-05',
    status: 'Draft',
    usageCount: 0,
    linkedRateAnalysisCount: 0,
    remarks: 'Awaiting commercial team approval of rate index prior to publishing to live workspace estimates.',
    currentRegionPrice: 810.0,
  },
];

export const INITIAL_PRICES: ResourcePrice[] = [
  // Portland Cement
  { id: 'p-1', resourceId: 'res-1', resourceName: 'Portland Cement Type I', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-1', supplierName: 'LafargeHolcim', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 8.5, currency: 'USD', status: 'Active' },
  { id: 'p-2', resourceId: 'res-1', resourceName: 'Portland Cement Type I', regionId: '4', regionName: 'NEOM District', supplierId: 'sup-1', supplierName: 'LafargeHolcim', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 9.75, currency: 'USD', status: 'Active' },
  { id: 'p-3', resourceId: 'res-1', resourceName: 'Portland Cement Type I', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-1', supplierName: 'LafargeHolcim', effectiveDate: '2025-07-01', fiscalPeriod: '2025 Q3', unitRate: 8.35, currency: 'USD', status: 'Deactivated' },
  { id: 'p-4', resourceId: 'res-1', resourceName: 'Portland Cement Type I', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-1', supplierName: 'LafargeHolcim', effectiveDate: '2025-10-01', fiscalPeriod: '2025 Q4', unitRate: 8.42, currency: 'USD', status: 'Deactivated' },

  // Steel
  { id: 'p-5', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-2', supplierName: 'ArcelorMittal Steel', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 720.0, currency: 'USD', status: 'Active' },
  { id: 'p-6', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', regionId: '3', regionName: 'Dammam Eastern', supplierId: 'sup-2', supplierName: 'ArcelorMittal Steel', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 708.0, currency: 'USD', status: 'Active' },
  { id: 'p-7', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', regionId: '4', regionName: 'NEOM District', supplierId: 'sup-2', supplierName: 'ArcelorMittal Steel', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 825.0, currency: 'USD', status: 'Active' },
  { id: 'p-8', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-2', supplierName: 'ArcelorMittal Steel', effectiveDate: '2025-07-01', fiscalPeriod: '2025 Q3', unitRate: 695.0, currency: 'USD', status: 'Deactivated' },
  { id: 'p-9', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-2', supplierName: 'ArcelorMittal Steel', effectiveDate: '2025-10-01', fiscalPeriod: '2025 Q4', unitRate: 710.0, currency: 'USD', status: 'Deactivated' },

  // Excavator
  { id: 'p-10', resourceId: 'res-4', resourceName: 'Excavator 20T', regionId: '1', regionName: 'Riyadh Central', supplierId: 'sup-4', supplierName: 'CAT Rental KSA', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 65.0, currency: 'USD', status: 'Active' },
  { id: 'p-11', resourceId: 'res-4', resourceName: 'Excavator 20T', regionId: '4', regionName: 'NEOM District', supplierId: 'sup-4', supplierName: 'CAT Rental KSA', effectiveDate: '2026-01-01', fiscalPeriod: '2026 Q1', unitRate: 78.0, currency: 'USD', status: 'Active' },
];

export const INITIAL_RESOURCE_USAGES: ResourceUsage[] = [
  // Portland Cement Usages
  { id: 'ru-1', resourceId: 'res-1', resourceName: 'Portland Cement Type I', type: 'Rate Analysis', code: 'RA-CONC-25', name: 'Concrete Grade 25 (1:2:4)', quantity: 7.5, unit: 'Bag' },
  { id: 'ru-2', resourceId: 'res-1', resourceName: 'Portland Cement Type I', type: 'BOQ Item', code: 'BOQ-CIV-002', name: 'Structural Raft Slab foundations - Concrete m³', quantity: 1540, unit: 'Bag' },
  { id: 'ru-3', resourceId: 'res-1', resourceName: 'Portland Cement Type I', type: 'Procurement', code: 'PO-2026-014', name: 'Riyadh Cement batch supplier release No 4', amount: 13175, date: '2026-02-15' },
  { id: 'ru-4', resourceId: 'res-1', resourceName: 'Portland Cement Type I', type: 'Inventory', code: 'INV-WH-31', name: 'Main City Center Site Warehouse - Raw Storage', quantity: 950, unit: 'Bag' },

  // Steel Usages
  { id: 'ru-5', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', type: 'Rate Analysis', code: 'RA-REBAR-02', name: 'Steel rebar heavy fabrication and tying', quantity: 1.05, unit: 'Ton' },
  { id: 'ru-6', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', type: 'BOQ Item', code: 'BOQ-STR-104', name: 'Column Reinforcement steel grade 60 (20mm diam)', quantity: 48, unit: 'Ton' },
  { id: 'ru-7', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', type: 'Procurement', code: 'PO-2026-009', name: 'A-Mittal core rebar delivery sched Nov', amount: 34560, date: '2026-04-10' },
  { id: 'ru-8', resourceId: 'res-2', resourceName: 'Reinforcement Steel 20mm', type: 'Cost Tracking', code: 'CTR-REBAR-G', name: 'Structural Slab Rebar cost package', amount: 33400 },

  // Helper Usages
  { id: 'ru-9', resourceId: 'res-8', resourceName: 'General Helper Rate 2', type: 'Rate Analysis', code: 'RA-MAS-01', name: 'Brick masonry wall construction helper crew', quantity: 0.2, unit: 'Day' },
  { id: 'ru-10', resourceId: 'res-8', resourceName: 'General Helper Rate 2', type: 'BOQ Item', code: 'BOQ-CIV-301', name: 'Site clearing, soil grading and backfill loading', quantity: 120, unit: 'Day' },
];

export const MOCK_PRICING_HISTORY = {
  'res-1': [
    { period: '2025 Q1', rate: 8.10 },
    { period: '2025 Q2', rate: 8.32 },
    { period: '2025 Q3', rate: 8.35 },
    { period: '2025 Q4', rate: 8.42 },
    { period: '2026 Q1', rate: 8.50 },
  ],
  'res-2': [
    { period: '2025 Q1', rate: 690.0 },
    { period: '2025 Q2', rate: 695.0 },
    { period: '2025 Q3', rate: 710.0 },
    { period: '2025 Q4', rate: 715.0 },
    { period: '2026 Q1', rate: 720.0 },
  ],
  'res-3': [
    { period: '2025 Q1', rate: 42.0 },
    { period: '2025 Q2', rate: 43.5 },
    { period: '2025 Q3', rate: 44.0 },
    { period: '2025 Q4', rate: 45.0 },
    { period: '2026 Q1', rate: 45.0 },
  ],
  'res-4': [
    { period: '2025 Q1', rate: 60.0 },
    { period: '2025 Q2', rate: 62.0 },
    { period: '2025 Q3', rate: 63.5 },
    { period: '2025 Q4', rate: 65.0 },
    { period: '2026 Q1', rate: 65.0 },
  ],
};
