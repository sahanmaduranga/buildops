import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useProgress } from './ProgressContext.tsx';
import { useProject } from './ProjectContext.tsx';

// ==========================================
// TYPES DEFINITIONS
// ==========================================

export type IPCStatus = 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Rejected' | 'Overdue';
export type ApprovalStepStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IPCApprovalStep {
  role: 'Site Engineer' | 'QS Engineer' | 'Project Manager' | 'Commercial Manager' | 'Finance';
  name: string;
  status: ApprovalStepStatus;
  timestamp?: string;
  comment?: string;
  avatar?: string;
}

export interface IPCLineItem {
  id: string;
  boqCode: string;
  description: string;
  unit: string;
  contractQty: number;
  previousQty: number;
  currentQty: number;
  totalQty: number;
  remainingQty: number;
  rate: number;
  currentAmount: number;
  totalAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  taxPercent: number;
  taxAmount: number;
  netAmount: number;
  section?: string;
}

export interface IPCComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface IPCAttachment {
  id: string;
  name: string;
  size: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface IPC {
  id: string;
  ipcNumber: string;
  projectId: string;
  billingPeriod: string;
  contractor: string;
  billingType: 'Client Progress Billing' | 'Contractor Payment Claim' | 'Subcontractor IPC';
  certifiedAmount: number; // gross current amount
  retentionRate: number; // e.g., 0.10 (10%)
  retentionAmount: number;
  taxRate: number; // e.g., 0.15 (15%)
  taxAmount: number;
  advanceRecoveryRate: number; // e.g., 0.05
  advanceRecoveryAmount: number;
  deductionsAmount: number;
  netAmount: number; // net payable
  status: IPCStatus;
  approvalStatus: 'Draft' | 'In Progress' | 'Approved' | 'Rejected';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  createdDate: string;
  remarks?: string;
  lineItems: IPCLineItem[];
  approvalChain: IPCApprovalStep[];
  attachments: IPCAttachment[];
  comments: IPCComment[];
  auditHistory: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }[];
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  ipcId?: string;
  invoiceDate: string;
  dueDate: string;
  invoiceType: 'Progress Invoice' | 'Tax Invoice' | 'Variation Invoice' | 'Final Invoice';
  subject: string;
  certifiedAmount: number;
  retentionAmount: number;
  taxAmount: number;
  netPayable: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Overdue' | 'Rejected';
  notes?: string;
}

export interface VariationsOrder {
  id: string;
  voNumber: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  requestedBy: string;
  approvedBy?: string;
  approvedDate?: string;
  originalValue: number;
  variationValue: number; // revised added/omitted net value
  revisedValue: number;
  boqComparison: {
    boqCode: string;
    description: string;
    unit: string;
    originalQty: number;
    revisedQty: number;
    changeQty: number;
    rate: number;
    originalAmount: number;
    revisedAmount: number;
    changeAmount: number;
  }[];
}

export interface RetentionEntry {
  id: string;
  projectId: string;
  ipcId: string;
  ipcNumber: string;
  contractor: string;
  retainedAmount: number;
  releasedAmount: number;
  pendingBalance: number;
  releaseStatus: 'Retained' | 'Partial Release' | 'Released';
  releaseDate?: string;
  remarks?: string;
}

export interface AdvanceRecoverySchedule {
  id: string;
  projectId: string;
  description: string;
  advanceAmount: number;
  recoveringRule: 'Mobilization Advance' | 'Fixed Percentage' | 'Rule Based';
  recoveryRatePercent: number; // e.g. 10% per IPC
  recoveredToDate: number;
  remainingBalance: number;
  history: {
    ipcNumber: string;
    recoveredAmount: number;
    recoveredDate: string;
  }[];
}

export interface PaymentRecord {
  id: string;
  projectId: string;
  refNumber: string;
  invoiceOrIpcNumber: string;
  payee: string;
  payer: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'ACH' | 'Letter of Credit' | 'Cheque';
  status: 'Cleared' | 'Pending' | 'Failed';
  remarks?: string;
}

export interface DelayClaim {
  id: string;
  projectId: string;
  claimNumber: string;
  title: string;
  type: 'EOT Delay Claim' | 'Acceleration Claim' | 'Disruption' | 'Force Majeure';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Disputed' | 'Rejected';
  valueClaimed: number;
  valueApproved?: number;
  daysEOTClaimed: number;
  daysEOTApproved?: number;
  submittedDate: string;
  resolvedDate?: string;
  description: string;
  attachments: string[];
}

// ==========================================
// CONTEXT CONTRACT
// ==========================================

interface CommercialContextType {
  ipcs: IPC[];
  invoices: ClientInvoice[];
  variations: VariationsOrder[];
  retentions: RetentionEntry[];
  advances: AdvanceRecoverySchedule[];
  payments: PaymentRecord[];
  claims: DelayClaim[];
  
  // Mutations & API Simulation
  getIpcsQuery: { data: IPC[]; isLoading: boolean; refetch: () => void };
  getPaymentsQuery: { data: PaymentRecord[]; isLoading: boolean };
  getRetentionsQuery: { data: RetentionEntry[]; isLoading: boolean };
  getVariationsQuery: { data: VariationsOrder[]; isLoading: boolean };
  getClaimsQuery: { data: DelayClaim[]; isLoading: boolean };
  getInvoicesQuery: { data: ClientInvoice[]; isLoading: boolean };
  getAdvancesQuery: { data: AdvanceRecoverySchedule[]; isLoading: boolean };

  createIPCMutation: { mutateAsync: (ipc: Omit<IPC, 'id'>) => Promise<IPC> };
  updateIPCMutation: { mutateAsync: (id: string, updates: Partial<IPC>) => Promise<IPC> };
  deleteIPCMutation: { mutateAsync: (id: string) => Promise<void> };
  approveIPCStep: (ipcId: string, role: string, comment?: string, action?: 'Approved' | 'Rejected') => void;
  
  createVOMutation: { mutateAsync: (vo: Omit<VariationsOrder, 'id'>) => Promise<VariationsOrder> };
  updateVOMutation: { mutateAsync: (id: string, updates: Partial<VariationsOrder>) => Promise<VariationsOrder> };
  
  createClaimMutation: { mutateAsync: (claim: Omit<DelayClaim, 'id'>) => Promise<DelayClaim> };
  updateClaimMutation: { mutateAsync: (id: string, updates: Partial<DelayClaim>) => Promise<DelayClaim> };
  
  addPaymentRecord: (record: Omit<PaymentRecord, 'id'>) => void;
  releaseRetention: (retentionId: string, amountToRelease: number) => void;
}

const CommercialContext = createContext<CommercialContextType | undefined>(undefined);

// ==========================================
// PROVIDER IMPLEMENTATION WITH REALISTIC DATA
// ==========================================

export const CommercialProvider = ({ children }: { children: ReactNode }) => {
  const { currentProject } = useProject();
  const { progressUpdates, tasks } = useProgress();

  const [ipcs, setIpcs] = useState<IPC[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [variations, setVariations] = useState<VariationsOrder[]>([]);
  const [retentions, setRetentions] = useState<RetentionEntry[]>([]);
  const [advances, setAdvances] = useState<AdvanceRecoverySchedule[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [claims, setClaims] = useState<DelayClaim[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize realistic Mock Billing data for existing projects
  useEffect(() => {
    setIsLoading(true);

    const mockIPCOneLineItems: IPCLineItem[] = [
      { id: '1-1', boqCode: 'CIV-01', description: 'Site Excavation and Clearing in Rock', unit: 'm3', contractQty: 12000, previousQty: 0, currentQty: 7500, totalQty: 7500, remainingQty: 4500, rate: 32.50, currentAmount: 243750, totalAmount: 243750, retentionPercent: 10, retentionAmount: 24375, taxPercent: 15, taxAmount: 36562.50, netAmount: 255937.50, section: 'Excavation & Substructure' },
      { id: '1-2', boqCode: 'CIV-02', description: 'Concrete Pile Cap Reinforcement Grade 40', unit: 'm3', contractQty: 450, previousQty: 0, currentQty: 180, totalQty: 180, remainingQty: 270, rate: 170.60, currentAmount: 30708, totalAmount: 30708, retentionPercent: 10, retentionAmount: 3070.80, taxPercent: 15, taxAmount: 4606.20, netAmount: 32243.40, section: 'Concrete Works' },
      { id: '1-3', boqCode: 'FIN-01', description: 'Hollow Block Masonry Wall 200mm Thick', unit: 'm2', contractQty: 2300, previousQty: 0, currentQty: 450, totalQty: 450, remainingQty: 1850, rate: 37.30, currentAmount: 16785, totalAmount: 16785, retentionPercent: 10, retentionAmount: 1678.50, taxPercent: 15, taxAmount: 2517.75, netAmount: 17624.25, section: 'Finishing Works' },
    ];

    const mockIPCTwoLineItems: IPCLineItem[] = [
      { id: '2-1', boqCode: 'CIV-01', description: 'Site Excavation and Clearing in Rock', unit: 'm3', contractQty: 12000, previousQty: 7500, currentQty: 3200, totalQty: 10700, remainingQty: 1300, rate: 32.50, currentAmount: 104000, totalAmount: 347750, retentionPercent: 10, retentionAmount: 10400, taxPercent: 15, taxAmount: 15600, netAmount: 109200, section: 'Excavation & Substructure' },
      { id: '2-2', boqCode: 'CIV-02', description: 'Concrete Pile Cap Reinforcement Grade 40', unit: 'm3', contractQty: 450, previousQty: 180, currentQty: 120, totalQty: 300, remainingQty: 150, rate: 170.60, currentAmount: 20472, totalAmount: 51180, retentionPercent: 10, retentionAmount: 2047.20, taxPercent: 15, taxAmount: 3070.80, netAmount: 21495.60, section: 'Concrete Works' },
      { id: '2-3', boqCode: 'FIN-01', description: 'Hollow Block Masonry Wall 200mm Thick', unit: 'm2', contractQty: 2300, previousQty: 450, currentQty: 800, totalQty: 1250, remainingQty: 1050, rate: 37.30, currentAmount: 29840, totalAmount: 46625, retentionPercent: 10, retentionAmount: 2984, taxPercent: 15, taxAmount: 4476, netAmount: 31332, section: 'Finishing Works' },
    ];

    const mockIPCs: IPC[] = [
      {
        id: 'ipc-1',
        ipcNumber: 'PROJ1-IPC-001',
        projectId: 'proj-1',
        billingPeriod: 'April 2026',
        contractor: 'Vertex Heavy Engineering',
        billingType: 'Client Progress Billing',
        certifiedAmount: 291243,
        retentionRate: 0.10,
        retentionAmount: 29124.30,
        taxRate: 0.15,
        taxAmount: 43686.45,
        advanceRecoveryRate: 0.05,
        advanceRecoveryAmount: 14562.15,
        deductionsAmount: 0,
        netAmount: 291243 - 29124.30 - 14562.15 + 43686.45,
        status: 'Paid',
        approvalStatus: 'Approved',
        paymentStatus: 'Paid',
        createdDate: '2026-04-20',
        remarks: 'First progress billing for substructure and site grading works.',
        lineItems: mockIPCOneLineItems,
        approvalChain: [
          { role: 'Site Engineer', name: 'James Carter', status: 'Approved', timestamp: '2026-04-18 10:30', comment: 'Quantities surveyed and verified on site.', avatar: 'JC' },
          { role: 'QS Engineer', name: 'Robert Chen', status: 'Approved', timestamp: '2026-04-18 14:15', comment: 'SOT alignments check out.', avatar: 'RC' },
          { role: 'Project Manager', name: 'Sarah Jenkins', status: 'Approved', timestamp: '2026-04-19 09:00', comment: 'Milestone 1 reached successfully.', avatar: 'SJ' },
          { role: 'Commercial Manager', name: 'Michael Thorne', status: 'Approved', timestamp: '2026-04-19 16:45', comment: 'Contract clauses applied.', avatar: 'MT' },
          { role: 'Finance', name: 'Sophia Kowalski', status: 'Approved', timestamp: '2026-04-20 11:20', comment: 'VAT and Retention accounted for.', avatar: 'SK' },
        ],
        attachments: [
          { id: 'att-1-1', name: 'IPC-001-Signed-Certificate.pdf', size: '2.4 MB', fileType: 'pdf', uploadedAt: '2026-04-19', uploadedBy: 'Robert Chen' },
          { id: 'att-1-2', name: 'MeasurementSheet_April2026.xlsx', size: '580 KB', fileType: 'xlsx', uploadedAt: '2026-04-18', uploadedBy: 'Robert Chen' }
        ],
        comments: [
          { id: 'c-1-1', author: 'James Carter', text: 'Concrete aggregate quantities match site logs exactly.', timestamp: '2026-04-18 10:31', avatar: 'JC' },
          { id: 'c-1-2', author: 'Michael Thorne', text: 'Retention conforms to the 10% contract standard.', timestamp: '2026-04-19 16:46', avatar: 'MT' }
        ],
        auditHistory: [
          { id: 'aud-1-1', action: 'Created', user: 'Robert Chen', timestamp: '2026-04-17 11:00', details: 'Initial draft compiled from approved progress updates.' },
          { id: 'aud-1-2', action: 'Submit', user: 'James Carter', timestamp: '2026-04-18 10:30', details: 'Submitted to workflow chain.' },
          { id: 'aud-1-3', action: 'Approve', user: 'Sophia Kowalski', timestamp: '2026-04-20 11:20', details: 'Final audit complete. Certificate generated.' }
        ]
      },
      {
        id: 'ipc-2',
        ipcNumber: 'PROJ1-IPC-002',
        projectId: 'proj-1',
        billingPeriod: 'May 2026',
        contractor: 'Vertex Heavy Engineering',
        billingType: 'Client Progress Billing',
        certifiedAmount: 154312,
        retentionRate: 0.10,
        retentionAmount: 15431.20,
        taxRate: 0.15,
        taxAmount: 23146.80,
        advanceRecoveryRate: 0.05,
        advanceRecoveryAmount: 7715.60,
        deductionsAmount: 1200, // safety penalty
        netAmount: 154312 - 15431.20 - 7715.60 + 23146.80 - 1200,
        status: 'Approved',
        approvalStatus: 'Approved',
        paymentStatus: 'Unpaid',
        createdDate: '2026-05-15',
        remarks: 'Second progress billing. Superstructure and brickwork works initiated.',
        lineItems: mockIPCTwoLineItems,
        approvalChain: [
          { role: 'Site Engineer', name: 'James Carter', status: 'Approved', timestamp: '2026-05-12 11:10', comment: 'Concrete pours logged and verified with cylinder breaks.', avatar: 'JC' },
          { role: 'QS Engineer', name: 'Robert Chen', status: 'Approved', timestamp: '2026-05-12 15:40', comment: 'Quantities matching approved logs.', avatar: 'RC' },
          { role: 'Project Manager', name: 'Sarah Jenkins', status: 'Approved', timestamp: '2026-05-13 10:15', comment: 'Approved. Minor delay penalty applied.', avatar: 'SJ' },
          { role: 'Commercial Manager', name: 'Michael Thorne', status: 'Approved', timestamp: '2026-05-14 14:00', comment: 'Calculations vetted.', avatar: 'MT' },
          { role: 'Finance', name: 'Sophia Kowalski', status: 'Approved', timestamp: '2026-05-15 16:30', comment: 'Certified. Ready for billing invoice.', avatar: 'SK' },
        ],
        attachments: [
          { id: 'att-2-1', name: 'IPC-002-Certified-Copy.pdf', size: '3.1 MB', fileType: 'pdf', uploadedAt: '2026-05-15', uploadedBy: 'Sophia Kowalski' },
          { id: 'att-2-2', name: 'SafetyDeductionDetail.pdf', size: '120 KB', fileType: 'pdf', uploadedAt: '2026-05-13', uploadedBy: 'Sarah Jenkins' }
        ],
        comments: [
          { id: 'c-2-1', author: 'Sarah Jenkins', text: 'Safety deduction of $1,200 is due to scaffolding infraction in Zone B.', timestamp: '2026-05-13 10:16', avatar: 'SJ' }
        ],
        auditHistory: [
          { id: 'aud-2-1', action: 'Created', user: 'Robert Chen', timestamp: '2026-05-10 16:00', details: 'SOT baseline compare completed.' },
          { id: 'aud-2-2', action: 'Submitted', user: 'Robert Chen', timestamp: '2026-05-11 09:00', details: 'Transmitted to site engine team.' }
        ]
      },
      {
        id: 'ipc-3',
        ipcNumber: 'PROJ1-IPC-003',
        projectId: 'proj-1',
        billingPeriod: 'June 2026',
        contractor: 'Vertex Heavy Engineering',
        billingType: 'Client Progress Billing',
        certifiedAmount: 185000,
        retentionRate: 0.10,
        retentionAmount: 18500,
        taxRate: 0.15,
        taxAmount: 27750,
        advanceRecoveryRate: 0.05,
        advanceRecoveryAmount: 9250,
        deductionsAmount: 0,
        netAmount: 185000 - 18500 - 9250 + 27750,
        status: 'Submitted',
        approvalStatus: 'In Progress',
        paymentStatus: 'Unpaid',
        createdDate: '2026-05-20',
        remarks: 'Draft compiled from current June progress items. Ready for PM approval.',
        lineItems: mockIPCTwoLineItems.map(l => ({ ...l, id: '3-' + l.id.split('-')[1], currentQty: Math.round(l.currentQty * 1.25), currentAmount: Math.round(l.currentAmount * 1.25) })),
        approvalChain: [
          { role: 'Site Engineer', name: 'James Carter', status: 'Approved', timestamp: '2026-05-19 11:10', comment: 'Surveyed. Approved.', avatar: 'JC' },
          { role: 'QS Engineer', name: 'Robert Chen', status: 'Approved', timestamp: '2026-05-20 10:40', comment: 'Agreed on certified quantities.', avatar: 'RC' },
          { role: 'Project Manager', name: 'Sarah Jenkins', status: 'Pending', comment: 'Reviewing scheduling alignments.', avatar: 'SJ' },
          { role: 'Commercial Manager', name: 'Michael Thorne', status: 'Pending', avatar: 'MT' },
          { role: 'Finance', name: 'Sophia Kowalski', status: 'Pending', avatar: 'SK' },
        ],
        attachments: [],
        comments: [],
        auditHistory: [
          { id: 'aud-3-1', action: 'Created', user: 'Robert Chen', timestamp: '2026-05-18 09:12', details: 'Interim automated quantities pull.' }
        ]
      }
    ];

    const mockInvoices: ClientInvoice[] = [
      {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        projectId: 'proj-1',
        ipcId: 'ipc-1',
        invoiceDate: '2026-04-21',
        dueDate: '2026-05-21',
        invoiceType: 'Progress Invoice',
        subject: 'Progress Invoice for Interim Certificate #1',
        certifiedAmount: 291243,
        retentionAmount: 29124.30,
        taxAmount: 43686.45,
        netPayable: 291243 - 29124.30 - 14562.15 + 43686.45,
        paidAmount: 291243 - 29124.30 - 14562.15 + 43686.45,
        balanceDue: 0,
        status: 'Paid',
        notes: 'Thank you for your business.'
      },
      {
        id: 'inv-2',
        invoiceNumber: 'INV-2026-002',
        projectId: 'proj-1',
        ipcId: 'ipc-2',
        invoiceDate: '2026-05-16',
        dueDate: '2026-06-16',
        invoiceType: 'Progress Invoice',
        subject: 'Progress Invoice for Interim Certificate #2',
        certifiedAmount: 154312,
        retentionAmount: 15431.20,
        taxAmount: 23146.80,
        netPayable: 154312 - 15431.20 - 7715.60 + 23146.80 - 1200,
        paidAmount: 0,
        balanceDue: 154312 - 15431.20 - 7715.60 + 23146.80 - 1200,
        status: 'Submitted',
        notes: 'Pending bank settlement confirmation.'
      }
    ];

    const mockVariations: VariationsOrder[] = [
      {
        id: 'vo-1',
        voNumber: 'VO-2026-001',
        projectId: 'proj-1',
        title: 'Reinforcement Steel Spec Change',
        description: 'Upgrade reinforcement steel to 22mm due to geotechnical foundation amendments.',
        status: 'Approved',
        requestedBy: 'Client representative Arthur Dent',
        approvedBy: 'Sarah Jenkins',
        approvedDate: '2026-04-12',
        originalValue: 120000,
        variationValue: 32000,
        revisedValue: 152000,
        boqComparison: [
          { boqCode: 'CIV-02', description: 'Concrete Pile Cap Reinforcement Grade 40', unit: 'm3', originalQty: 450, revisedQty: 520, changeQty: 70, rate: 170.60, originalAmount: 76770, revisedAmount: 88712, changeAmount: 11942 }
        ]
      },
      {
        id: 'vo-2',
        voNumber: 'VO-2026-002',
        projectId: 'proj-1',
        title: 'Add Area Zone C Safety Barriers',
        description: 'Provision of extra safety netting, scaffolding guards, and access walkways for Zone C.',
        status: 'Submitted',
        requestedBy: 'Robert Chen (QS)',
        originalValue: 0,
        variationValue: 14500,
        revisedValue: 14500,
        boqComparison: []
      }
    ];

    const mockRetentions: RetentionEntry[] = [
      { id: 'ret-1', projectId: 'proj-1', ipcId: 'ipc-1', ipcNumber: 'PROJ1-IPC-001', contractor: 'Vertex Heavy Engineering', retainedAmount: 29124.30, releasedAmount: 0, pendingBalance: 29124.30, releaseStatus: 'Retained', remarks: 'Standard 10% deduction held.' },
      { id: 'ret-2', projectId: 'proj-1', ipcId: 'ipc-2', ipcNumber: 'PROJ1-IPC-002', contractor: 'Vertex Heavy Engineering', retainedAmount: 15431.20, releasedAmount: 0, pendingBalance: 15431.20, releaseStatus: 'Retained', remarks: 'Standard 10% deduction held.' }
    ];

    const mockAdvances: AdvanceRecoverySchedule[] = [
      {
        id: 'adv-1',
        projectId: 'proj-1',
        description: 'Initial Mobilization Advance',
        advanceAmount: 250000,
        recoveringRule: 'Mobilization Advance',
        recoveryRatePercent: 5, // 5% of gross per IPC
        recoveredToDate: 14562.15 + 7715.60,
        remainingBalance: 250000 - (14562.15 + 7715.60),
        history: [
          { ipcNumber: 'PROJ1-IPC-001', recoveredAmount: 14562.15, recoveredDate: '2026-04-20' },
          { ipcNumber: 'PROJ1-IPC-002', recoveredAmount: 7715.60, recoveredDate: '2026-05-15' }
        ]
      }
    ];

    const mockPayments: PaymentRecord[] = [
      {
        id: 'pay-1',
        projectId: 'proj-1',
        refNumber: 'TX-ACH-892348',
        invoiceOrIpcNumber: 'PROJ1-IPC-001',
        payee: 'Vertex Heavy Engineering',
        payer: 'BuildOps Capital Holding Ltd',
        amountPaid: 291243 - 29124.30 - 14562.15 + 43686.45,
        paymentDate: '2026-04-25',
        paymentMethod: 'Bank Transfer',
        status: 'Cleared',
        remarks: 'Cleared and approved by Treasury.'
      }
    ];

    const mockClaims: DelayClaim[] = [
      {
        id: 'cl-1',
        projectId: 'proj-1',
        claimNumber: 'CLM-001',
        title: 'Geotechnical Soil Unforeseen Hard Rock Delay',
        type: 'EOT Delay Claim',
        status: 'Submitted',
        valueClaimed: 45000,
        daysEOTClaimed: 14,
        submittedDate: '2026-05-02',
        description: 'Encountered unexpected metamorphic hard rock stratum during excavation which stalled drilling works and triggered additional excavator fuel and blade wear requirements.',
        attachments: ['soil_test_anomaly_report.pdf', 'daily_excavator_downtime_logs.xlsx']
      }
    ];

    setIpcs(mockIPCs);
    setInvoices(mockInvoices);
    setVariations(mockVariations);
    setRetentions(mockRetentions);
    setAdvances(mockAdvances);
    setPayments(mockPayments);
    setClaims(mockClaims);
    
    setIsLoading(false);
  }, []);

  // ==========================================
  // BUSINESS MUTATIONS
  // ==========================================

  const createIPC = async (newIpc: Omit<IPC, 'id'>) => {
    setIsLoading(true);
    const ipcId = `ipc-${Date.now()}`;
    const ipc: IPC = {
      ...newIpc,
      id: ipcId,
      createdDate: new Date().toISOString().split('T')[0],
      approvalChain: [
        { role: 'Site Engineer', name: 'James Carter', status: 'Pending', comment: '', avatar: 'JC' },
        { role: 'QS Engineer', name: 'Robert Chen', status: 'Pending', comment: '', avatar: 'RC' },
        { role: 'Project Manager', name: 'Sarah Jenkins', status: 'Pending', comment: '', avatar: 'SJ' },
        { role: 'Commercial Manager', name: 'Michael Thorne', status: 'Pending', comment: '', avatar: 'MT' },
        { role: 'Finance', name: 'Sophia Kowalski', status: 'Pending', comment: '', avatar: 'SK' },
      ],
      attachments: [],
      comments: [],
      auditHistory: [
        { id: `aud-${Date.now()}`, action: 'Created', user: 'Robert Chen', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), details: 'Manual IPC draft initiated.' }
      ]
    };

    setIpcs(prev => [ipc, ...prev]);

    // Create a matching Client Invoice if Approved immediately or submitted
    const invId = `inv-${Date.now()}`;
    const newInvoice: ClientInvoice = {
      id: invId,
      invoiceNumber: 'INV-' + ipc.ipcNumber.split('-').pop(),
      projectId: ipc.projectId,
      ipcId: ipcId,
      invoiceDate: ipc.createdDate,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoiceType: 'Progress Invoice',
      subject: `Progress Invoice for IPC ${ipc.ipcNumber}`,
      certifiedAmount: ipc.certifiedAmount,
      retentionAmount: ipc.retentionAmount,
      taxAmount: ipc.taxAmount,
      netPayable: ipc.netAmount,
      paidAmount: 0,
      balanceDue: ipc.netAmount,
      status: ipc.status === 'Approved' ? 'Approved' : 'Draft',
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Add retention entry
    const retId = `ret-${Date.now()}`;
    const newRetention: RetentionEntry = {
      id: retId,
      projectId: ipc.projectId,
      ipcId: ipcId,
      ipcNumber: ipc.ipcNumber,
      contractor: ipc.contractor,
      retainedAmount: ipc.retentionAmount,
      releasedAmount: 0,
      pendingBalance: ipc.retentionAmount,
      releaseStatus: 'Retained',
      remarks: 'Automated retention placeholder.'
    };
    setRetentions(prev => [newRetention, ...prev]);

    // Increment Advances Recovery if recovery amount > 0
    if (ipc.advanceRecoveryAmount > 0) {
      setAdvances(prev => prev.map(adv => {
        if (adv.projectId === ipc.projectId) {
          const newRecovered = adv.recoveredToDate + ipc.advanceRecoveryAmount;
          return {
            ...adv,
            recoveredToDate: newRecovered,
            remainingBalance: adv.advanceAmount - newRecovered,
            history: [
              ...adv.history,
              { ipcNumber: ipc.ipcNumber, recoveredAmount: ipc.advanceRecoveryAmount, recoveredDate: ipc.createdDate }
            ]
          };
        }
        return adv;
      }));
    }

    setIsLoading(false);
    return ipc;
  };

  const updateIPC = async (id: string, updates: Partial<IPC>) => {
    let updatedIpc: IPC | null = null;
    setIpcs(prev => prev.map(ipc => {
      if (ipc.id === id) {
        updatedIpc = { ...ipc, ...updates } as IPC;
        return updatedIpc;
      }
      return ipc;
    }));

    // Audit logs
    if (updatedIpc) {
      const target = updatedIpc as IPC;
      setIpcs(prev => prev.map(ipc => {
        if (ipc.id === id) {
          return {
            ...ipc,
            auditHistory: [
              ...ipc.auditHistory,
              {
                id: `aud-${Date.now()}`,
                action: 'Updated',
                user: 'Robert Chen',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                details: `Financial update parameters applied. Status: ${target.status}`
              }
            ]
          };
        }
        return ipc;
      }));

      // Update invoice as well if status updated
      setInvoices(prev => prev.map(inv => {
        if (inv.ipcId === id) {
          return {
            ...inv,
            status: target.status === 'Approved' ? 'Approved' : target.status === 'Paid' ? 'Paid' : inv.status
          };
        }
        return inv;
      }));
    }

    return updatedIpc || {} as IPC;
  };

  const deleteIPC = async (id: string) => {
    setIpcs(prev => prev.filter(ipc => ipc.id !== id));
    setInvoices(prev => prev.filter(inv => inv.ipcId !== id));
    setRetentions(prev => prev.filter(r => r.ipcId !== id));
  };

  const approveIPCStep = (ipcId: string, role: string, comment?: string, action: 'Approved' | 'Rejected' = 'Approved') => {
    setIpcs(prev => prev.map(ipc => {
      if (ipc.id === ipcId) {
        // Update specific step in approval chain
        const updatedChain = ipc.approvalChain.map(step => {
          if (step.role === role) {
            return {
              ...step,
              status: action as ApprovalStepStatus,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              comment: comment || 'Approved in system portal.'
            };
          }
          return step;
        });

        // Determine if entire IPC is fully approved (if all steps except pending are approved, etc.)
        // For simplicity: If last step (Finance) is approved, Status -> 'Approved' or if Commercial approved status turns to approved
        const financeStep = updatedChain.find(s => s.role === 'Finance');
        const isFullyApproved = financeStep && financeStep.status === 'Approved';
        
        let newStatus = ipc.status;
        if (isFullyApproved) {
          newStatus = 'Approved';
        } else if (action === 'Rejected') {
          newStatus = 'Rejected';
        } else {
          newStatus = 'Submitted';
        }

        return {
          ...ipc,
          approvalChain: updatedChain,
          status: newStatus,
          auditHistory: [
            ...ipc.auditHistory,
            {
              id: `aud-${Date.now()}`,
              action: action,
              user: 'Robert Chen',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              details: `Approval node updated for: ${role}. Comments: ${comment || 'None'}`
            }
          ]
        };
      }
      return ipc;
    }));
  };

  const createVO = async (newVo: Omit<VariationsOrder, 'id'>) => {
    const vo: VariationsOrder = {
      ...newVo,
      id: `vo-${Date.now()}`,
      voNumber: newVo.voNumber || `VO-2026-00${variations.length + 1}`
    };
    setVariations(prev => [vo, ...prev]);
    return vo;
  };

  const updateVO = async (id: string, updates: Partial<VariationsOrder>) => {
    let updatedVO = {} as VariationsOrder;
    setVariations(prev => prev.map(vo => {
      if (vo.id === id) {
        updatedVO = { ...vo, ...updates };
        return updatedVO;
      }
      return vo;
    }));
    return updatedVO;
  };

  const createClaim = async (newClaim: Omit<DelayClaim, 'id'>) => {
    const claim: DelayClaim = {
      ...newClaim,
      id: `cl-${Date.now()}`,
      claimNumber: newClaim.claimNumber || `CLM-00${claims.length + 1}`
    };
    setClaims(prev => [claim, ...prev]);
    return claim;
  };

  const updateClaim = async (id: string, updates: Partial<DelayClaim>) => {
    let updatedClaim = {} as DelayClaim;
    setClaims(prev => prev.map(cl => {
      if (cl.id === id) {
        updatedClaim = { ...cl, ...updates };
        return updatedClaim;
      }
      return cl;
    }));
    return updatedClaim;
  };

  const addPaymentRecord = (record: Omit<PaymentRecord, 'id'>) => {
    const pay: PaymentRecord = {
      ...record,
      id: `pay-${Date.now()}`,
      refNumber: record.refNumber || `TX-ACH-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setPayments(prev => [pay, ...prev]);

    // If payment recorded, mark corresponding invoice or IPC as Paid
    setIpcs(prev => prev.map(ipc => {
      if (ipc.ipcNumber === record.invoiceOrIpcNumber) {
        return {
          ...ipc,
          status: 'Paid',
          paymentStatus: 'Paid'
        };
      }
      return ipc;
    }));

    setInvoices(prev => prev.map(inv => {
      if (inv.invoiceNumber === record.invoiceOrIpcNumber || (inv.ipcId && ipcs.find(i=>i.id === inv.ipcId)?.ipcNumber === record.invoiceOrIpcNumber)) {
        return {
          ...inv,
          status: 'Paid',
          paidAmount: inv.netPayable,
          balanceDue: 0
        };
      }
      return inv;
    }));
  };

  const releaseRetention = (retentionId: string, amountToRelease: number) => {
    setRetentions(prev => prev.map(ret => {
      if (ret.id === retentionId) {
        const newReleased = ret.releasedAmount + amountToRelease;
        const remaining = Math.max(0, ret.retainedAmount - newReleased);
        const status = remaining === 0 ? 'Released' : newReleased > 0 ? 'Partial Release' : 'Retained';
        return {
          ...ret,
          releasedAmount: newReleased,
          pendingBalance: remaining,
          releaseStatus: status,
          releaseDate: new Date().toISOString().split('T')[0]
        };
      }
      return ret;
    }));
  };

  // ==========================================
  // API SIMULATION HOOKS (LIKE REACT QUERY)
  // ==========================================

  const getIpcsQuery = {
    data: ipcs.filter(ipc => !currentProject || ipc.projectId === currentProject.id),
    isLoading,
    refetch: () => console.log('Simulated IPC Refetch triggered')
  };

  const getPaymentsQuery = {
    data: payments.filter(p => !currentProject || p.projectId === currentProject.id),
    isLoading
  };

  const getRetentionsQuery = {
    data: retentions.filter(r => !currentProject || r.projectId === currentProject.id),
    isLoading
  };

  const getVariationsQuery = {
    data: variations.filter(v => !currentProject || v.projectId === currentProject.id),
    isLoading
  };

  const getClaimsQuery = {
    data: claims.filter(c => !currentProject || c.projectId === currentProject.id),
    isLoading
  };

  const getInvoicesQuery = {
    data: invoices.filter(inv => !currentProject || inv.projectId === currentProject.id),
    isLoading
  };

  const getAdvancesQuery = {
    data: advances.filter(adv => !currentProject || adv.projectId === currentProject.id),
    isLoading
  };

  const createIPCMutation = {
    mutateAsync: createIPC
  };

  const updateIPCMutation = {
    mutateAsync: updateIPC
  };

  const deleteIPCMutation = {
    mutateAsync: deleteIPC
  };

  const createVOMutation = {
    mutateAsync: createVO
  };

  const updateVOMutation = {
    mutateAsync: updateVO
  };

  const createClaimMutation = {
    mutateAsync: createClaim
  };

  const updateClaimMutation = {
    mutateAsync: updateClaim
  };

  return (
    <CommercialContext.Provider value={{
      ipcs,
      invoices,
      variations,
      retentions,
      advances,
      payments,
      claims,
      getIpcsQuery,
      getPaymentsQuery,
      getRetentionsQuery,
      getVariationsQuery,
      getClaimsQuery,
      getInvoicesQuery,
      getAdvancesQuery,
      createIPCMutation,
      updateIPCMutation,
      deleteIPCMutation,
      approveIPCStep,
      createVOMutation,
      updateVOMutation,
      createClaimMutation,
      updateClaimMutation,
      addPaymentRecord,
      releaseRetention
    }}>
      {children}
    </CommercialContext.Provider>
  );
};

export const useCommercial = () => {
  const context = useContext(CommercialContext);
  if (!context) {
    throw new Error('useCommercial must be used within a CommercialProvider');
  }
  return context;
};
