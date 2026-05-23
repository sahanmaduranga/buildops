/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ResourceType {
  MATERIAL = 'Material',
  LABOR = 'Labor',
  EQUIPMENT = 'Equipment',
  SUBCONTRACTOR = 'Subcontractor',
}

export interface Resource {
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
}

export interface RateAnalysisItem {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  formula?: string;
  productivityFactor?: number;
  wasteFactor?: number;
}

export interface RateAnalysis {
  id: string;
  code: string;
  description: string;
  unit: string;
  categoryId?: string;
  resources: RateAnalysisItem[];
  overheadPercentage: number;
  profitPercentage: number;
  taxPercentage: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalEquipmentCost: number;
  subtotal: number;
  netRate: number;
  finalRate: number;
}

export interface BOQItem {
  id: string;
  type: 'BILL' | 'SECTION' | 'SUB_SECTION' | 'ITEM';
  code: string;
  description: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  parentId?: string;
  rateAnalysisId?: string;
  resourceId?: string; // For direct resource usage
  isProvisional?: boolean;
  baseRate?: number;
  remarks?: string;
  tags?: string;
  attachments?: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Future';
}

export interface PriceMatrixEntry {
  resourceId: string;
  regionId: string;
  periodId: string;
  rate: number;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export enum SOTStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived',
}

export enum TaskType {
  MILESTONE = 'Milestone',
  TASK = 'Task',
  SUMMARY = 'Summary',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum DependencyType {
  FS = 'Finish-to-Start',
  SS = 'Start-to-Start',
  FF = 'Finish-to-Finish',
  SF = 'Start-to-Finish',
}

export interface TaskDependency {
  id: string;
  predecessorId: string;
  type: DependencyType;
  lagDays: number;
}

export interface TaskResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  plannedQty: number;
  actualQty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface TaskBOQAllocation {
  id: string;
  boqItemId: string;
  boqItemCode: string;
  description: string;
  unit: string;
  boqQty: number;
  allocatedQty: number;
  actualQty?: number; // Made optional
  rate: number;
}

export interface ProgressUpdate {
  id: string;
  taskId: string;
  taskName?: string; // Added to avoid joins in simple log views
  date: string;
  actualQty: number;
  unit: string;
  workforceCount?: number;
  equipmentUsed?: string[];
  weather?: string;
  shift?: 'Day' | 'Night';
  notes?: string;
  recordedBy: string; // Original field
  reportedBy?: string; // Matching component usage
  attachments?: string[];
  photos?: string[];
  delayReason?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  approvalWorkflow?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  role: string;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
  comment?: string;
}

export interface SitePhoto {
  id: string;
  taskId: string;
  url: string;
  caption: string;
  uploadedAt: string;
  uploadedBy: string;
  location?: string;
  beforeAfterGroup?: string;
}

export interface DelayRecord {
  id: string;
  taskId: string;
  reason: string;
  category: 'Weather' | 'Design' | 'Logistics' | 'Subcontractor' | 'Client' | 'Other';
  impactDays: number;
  startDate: string;
  endDate?: string;
  mitigationPlan?: string;
  status: 'Active' | 'Resolved';
  responsibleParty: string;
}

export interface ProductivityMetric {
  id: string;
  taskId: string;
  resourceId: string;
  date: string;
  outputQty: number;
  inputHours: number;
  efficiency: number; // output/input
  targetEfficiency: number;
}

export interface Task {
  id: string;
  parentId?: string;
  code: string;
  name: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualFinish?: string;
  forecastFinish?: string;
  duration: number; // in days
  progressPercentage: number;
  plannedQty?: number;
  actualQty?: number;
  totalRemainingQty?: number;
  amount?: number;
  varianceQty?: number;
  variancePercentage?: number;
  delayDays?: number;
  productivityRate?: number; // e.g. qty/day
  assignedTo?: string;
  responsibleEngineer?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed' | 'Critical' | 'At Risk';
  dependencies: TaskDependency[];
  resourceAllocations: TaskResourceAllocation[];
  boqAllocations: TaskBOQAllocation[];
  isCritical?: boolean;
  history?: ProgressUpdate[];
}

export interface SOT {
  id: string;
  code: string;
  description: string;
  projectId: string;
  projectName: string;
  boqId: string;
  revisionNo: number;
  status: SOTStatus;
  startDate: string;
  endDate: string;
  duration: number;
  progressPercentage: number;
  totalBudget: number;
  remarks?: string;
  tasks: Task[];
  baseLineId?: string;
}

export interface SOTBaseline {
  id: string;
  sotId: string;
  name: string;
  description: string;
  createdAt: string;
  tasks: Task[]; // Snapshot of tasks
}

export interface Project {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  type: string;
  sector: string;
  client: string;
  consultant: string;
  contractor: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Delayed' | 'Completed' | 'Archived';
  avatarColor?: string;
  bannerImage?: string;
  
  // Location
  country: string;
  state: string;
  city: string;
  address: string;
  gpsCoordinates?: string;
  
  // Financials
  contractValue: number;
  currency: string;
  budget: number;
  estimatedCost: number;
  spentToDate?: number;
  
  // Timeline
  startDate: string;
  plannedFinishDate: string;
  actualFinishDate?: string;
  baselineStartDate?: string;
  baselineFinishDate?: string;
  
  // Organization
  projectDirector: string;
  projectManager: string;
  qsManager: string;
  planningEngineer: string;
  siteEngineers: string[];
  
  // Configuration
  workingCalendar: 'Standard 6-Day' | '5-Day Week' | '7-Day Continuous' | 'Custom';
  timeZone: string;
  defaultCurrency: string;
  measurementSystem: 'Metric' | 'Imperial';
  
  // Advanced
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Immediate';
  tags: string[];
  metadata?: Record<string, string>;
  logo?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: 'Project Director' | 'Project Manager' | 'QS Engineer' | 'Planning Engineer' | 'Site Engineer' | 'Commercial Manager' | 'Client Viewer';
  status: 'Active' | 'Pending' | 'Inactive';
  avatar?: string;
  permissionLevel: 'Admin' | 'Write' | 'Read-Only';
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: 'Drawings' | 'Contracts' | 'BOQ' | 'SOT' | 'Site Photos' | 'QA/QC' | 'Daily Logs' | 'Correspondence';
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  fileType: string;
}

export interface ProjectCalendarEvent {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'Milestone' | 'Inspection' | 'Delivery' | 'Meeting' | 'Review';
}

export interface RateCategory {
  id: string;
  label: string;
  parentId?: string;
  count?: number;
}

export interface Subcontractor {
  id: string;
  code: string;
  name: string;
  registrationNumber: string;
  taxNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  specialty: string; // Civil, Electrical, HVAC, etc.
  bankName: string;
  bankAccountNumber: string;
  notes: string;
  status: 'Active' | 'Inactive';
  rating: number; // 1-5
  activeProjectsCount: number;
}

export interface SubcontractBOQAllocation {
  boqItemId: string;
  allocatedQty: number;
  rate: number;
  amount: number;
}

export interface SubcontractPackage {
  id: string;
  code: string;
  name: string;
  projectId: string;
  subcontractorId: string;
  packageType: string; // e.g. Civil, Structural
  startDate: string;
  endDate: string;
  originalContractValue: number;
  revisedContractValue: number;
  retentionPercentage: number;
  advancePercentage: number;
  recoveryPercentage: number; // e.g. 15% recovery per IPC until advance is paid off
  status: 'Draft' | 'Active' | 'On Hold' | 'Completed' | 'Closed';
  description: string;
  allocations: SubcontractBOQAllocation[];
}

export interface SubcontractAgreement {
  id: string;
  agreementNo: string;
  agreementDate: string;
  packageId: string;
  subcontractorId: string;
  projectId: string;
  contractValue: number;
  retentionPercentage: number;
  advancePercentage: number;
  recoveryPercentage: number;
  paymentTerms: string;
  remarks: string;
  status: 'Draft' | 'Signed' | 'Active' | 'Closed' | 'Terminated';
  documents: {
    id: string;
    name: string;
    version: string;
    uploadedAt: string;
    uploadedBy: string;
    fileType: string;
  }[];
}

export interface SubcontractIPCItem {
  boqItemId: string;
  previousQty: number;
  currentQty: number;
  totalQty: number;
  rate: number;
}

export interface SubcontractIPC {
  id: string;
  ipcNo: string;
  packageId: string;
  subcontractorId: string;
  projectId: string;
  period: string; // e.g. "May 2026"
  date: string;
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved' | 'Paid';
  items: SubcontractIPCItem[];
  certifiedAmount: number; // Sum of current progress amounts itemized
  grossProgressAmount?: number; // Cumulative total progress value
  previousCertifiedAmount?: number; // Total previous certified
  retentionAmount: number; // Certified * Ret %
  advanceRecoveryAmount: number; // Certified * Recovery %
  otherDeductions: number;
  deductionNotes?: string;
  netAmount: number; // Net Payable = certified - retention - advanceRecovery - otherDeductions
  attachments: { id: string; name: string; fileType: string }[];
}

export interface SubcontractVariation {
  id: string;
  voNumber: string;
  packageId: string;
  subcontractorId: string;
  projectId: string;
  description: string;
  reason: string;
  amount: number;
  boqReferenceCode?: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  submittedDate: string;
  approvedDate: string;
  attachment?: { name: string; fileType: string };
}


