import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProject } from './ProjectContext.tsx';
import { useBOQ } from './BOQContext.tsx';
import { BOQItem, Project } from '../types.ts';

export interface TenderOpportunity {
  id: string;
  tenderNo: string;
  name: string;
  client: string;
  consultant: string;
  location: string;
  tenderType: 'Building' | 'Infrastructure' | 'Road' | 'Electrical' | 'MEP' | 'Interior' | 'Civil' | 'Renovation';
  status: 'Draft' | 'Reviewing' | 'Estimating' | 'Submitted' | 'Awarded' | 'Lost' | 'Cancelled';
  submissionDate: string;
  estimatedValue: number;
  assignedEstimator: string;
  currency: string;
  description: string;
  submissionMethod: 'Electronic Portal' | 'Physical Envelope' | 'Joint Submission' | 'Two-Stage Bidding';
  notes: string;
  dateCreated: string;
  convertedProjectId?: string;
  marginPercent: number; // profit margin
  overheadPercent: number; // site overheads
}

export interface TenderBOQItem {
  id: string;
  tenderId: string;
  type: 'SECTION' | 'ITEM';
  code: string;
  description: string;
  unit?: string;
  quantity?: number;
  rate?: number; // Estimated base rate or built-up rate
  amount?: number;
  parentId?: string;
  remarks?: string;
  rateAnalysisId?: string; // Links to existing Rate Analysis screen
}

export interface SupplierQuotation {
  id: string;
  tenderId: string;
  supplier: string;
  materialCategory: string;
  amount: number;
  currency: string;
  quotationDate: string;
  deliveryPeriod: string;
  status: 'Requested' | 'Received' | 'Approved' | 'Rejected';
  remarks: string;
  attachmentName?: string;
}

export interface SubcontractorQuotation {
  id: string;
  tenderId: string;
  subcontractor: string;
  workCategory: string;
  quotedValue: number;
  currency: string;
  submissionDate: string;
  duration: string;
  status: 'Requested' | 'Submitted' | 'Evaluated' | 'Selected' | 'Rejected';
  remarks: string;
  attachmentName?: string;
}

export interface TenderRevision {
  id: string;
  tenderId: string;
  revisionNo: string;
  description: string;
  date: string;
  revisedBy: string;
  status: 'Draft' | 'Active' | 'Superseded';
  revisedEstimate: number;
}

export interface BidSubmission {
  id: string;
  tenderId: string;
  submissionNo: string;
  submittedDate: string;
  submittedAmount: number;
  discountPercent: number;
  finalBidAmount: number;
  notes: string;
  attachmentName?: string;
  status: 'Pending' | 'Awarded' | 'Lost' | 'Withdrawn';
}

interface TenderContextType {
  tenders: TenderOpportunity[];
  tenderBoqs: Record<string, TenderBOQItem[]>;
  supplierQuotations: SupplierQuotation[];
  subcontractorQuotations: SubcontractorQuotation[];
  tenderRevisions: TenderRevision[];
  bidSubmissions: BidSubmission[];
  selectedTenderId: string | null;
  setSelectedTenderId: (id: string | null) => void;
  addTender: (tender: Omit<TenderOpportunity, 'id' | 'dateCreated'>) => string;
  updateTender: (id: string, fields: Partial<TenderOpportunity>) => void;
  deleteTender: (id: string) => void;
  updateTenderBoq: (tenderId: string, items: TenderBOQItem[]) => void;
  addSupplierQuotation: (quotation: Omit<SupplierQuotation, 'id'>) => void;
  updateSupplierQuotation: (id: string, fields: Partial<SupplierQuotation>) => void;
  addSubcontractorQuotation: (quotation: Omit<SubcontractorQuotation, 'id'>) => void;
  updateSubcontractorQuotation: (id: string, fields: Partial<SubcontractorQuotation>) => void;
  addTenderRevision: (revision: Omit<TenderRevision, 'id'>) => void;
  updateTenderRevision: (id: string, fields: Partial<TenderRevision>) => void;
  addBidSubmission: (submission: Omit<BidSubmission, 'id'>) => void;
  updateBidSubmission: (id: string, fields: Partial<BidSubmission>) => void;
  convertTenderToProject: (tenderId: string) => { projectId: string; boqId: string } | null;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

// Core Mock Data matching Sri Lanka and Middle East markets
const DEFAULT_TENDERS: TenderOpportunity[] = [
  {
    id: 'tender-1',
    tenderNo: 'TND-2026-COL-089',
    name: 'Colombo Port Access Elevated Highway (C3)',
    client: 'Road Development Authority (RDA) - Sri Lanka',
    consultant: 'CEC / Oriental Consultants Joint Venture',
    location: 'Port Limit, Colombo 01',
    tenderType: 'Road',
    status: 'Estimating',
    submissionDate: '2026-06-15',
    estimatedValue: 18450000,
    assignedEstimator: 'Suren Jayasinghe (QS)',
    currency: 'LKR',
    description: 'Construction of a 3.2km dual-two lane elevated highway on concrete piers connecting Galle Face to the port gateway, including portal frames, precast prestressed concrete girders, asphalt paving and toll structures.',
    submissionMethod: 'Two-Stage Bidding',
    notes: 'Requires bid security guarantee of 1.5% from BOC/People\'s Bank Sri Lanka. Pre-qualification successfully completed.',
    dateCreated: '2026-05-10',
    marginPercent: 12,
    overheadPercent: 8,
  },
  {
    id: 'tender-2',
    tenderNo: 'TND-2026-DXB-552',
    name: 'Dubai South Aviation Logistics Hangar 4B',
    client: 'Dubai Aviation Engineering Projects (DAEP)',
    consultant: 'Dar Al-Handasah Shair & Partners',
    location: 'Al Maktoum International (DWC), Dubai',
    tenderType: 'Infrastructure',
    status: 'Submitted',
    submissionDate: '2026-05-20',
    estimatedValue: 24500000,
    assignedEstimator: 'Amir Al-Mansoori',
    currency: 'AED',
    description: 'Design-Build Package for a heavy-handling steel-framed wide-body maintenance hangar. Includes underground utilities ducting, fire suppression deluge systems, heavy epoxy floors, and high-security defense wall fencing.',
    submissionMethod: 'Electronic Portal',
    notes: 'Joint Venture bid with Al Shehab Contractors under 60-40 split framework.',
    dateCreated: '2026-04-18',
    marginPercent: 10,
    overheadPercent: 6,
  },
  {
    id: 'tender-3',
    tenderNo: 'TND-2026-KTY-0051',
    name: 'Kandy Heritage Palace Waterfront Walkway',
    client: 'Urban Development Authority (UDA) - Sri Lanka',
    consultant: 'State Engineering Corporation (SEC)',
    location: 'Lake Round Road, Kandy',
    tenderType: 'Civil',
    status: 'Awarded',
    submissionDate: '2026-05-02',
    estimatedValue: 3400000,
    assignedEstimator: 'Sanduni De Silva (QS)',
    currency: 'LKR',
    description: 'Consolidation, soil stabilization, pre-bored micro-piling, decorative heavy timber boardwalk construction matching ancient Kandyan architecture, and scenic low-lux LED strip illumination surrounding the Temple of the Tooth corridor.',
    submissionMethod: 'Physical Envelope',
    notes: 'Award letter received Ref: UDA/KND/HER/2026/04. Waiting for contract signoff scheduled next Monday.',
    dateCreated: '2026-04-01',
    marginPercent: 15,
    overheadPercent: 10,
  }
];

const DEFAULT_TENDER_BOQS: Record<string, TenderBOQItem[]> = {
  'tender-1': [
    { id: 't1-sec-1', tenderId: 'tender-1', type: 'SECTION', code: 'A', description: 'PRELIMINARIES & GENERAL OBLIGATIONS' },
    { id: 't1-item-1', tenderId: 'tender-1', type: 'ITEM', code: 'A.1', description: 'Provide and maintain Contractor\'s fully furnished site laboratory & main office complexes', unit: 'LS', quantity: 1, rate: 450000, amount: 450000, parentId: 't1-sec-1' },
    { id: 't1-item-2', tenderId: 'tender-1', type: 'ITEM', code: 'A.2', description: 'Performance Bond and Comprehensive Health & Safety third party insurance coverage policies', unit: 'LS', quantity: 1, rate: 120000, amount: 120000, parentId: 't1-sec-1' },
    
    { id: 't1-sec-2', tenderId: 'tender-1', type: 'SECTION', code: 'B', description: 'SUBSTRUCTURE & HEAVY SUBGRADE WORKS' },
    { id: 't1-item-3', tenderId: 'tender-1', type: 'ITEM', code: 'B.1', description: 'Heavy earthworks, excavation in rock/hard soil for pier foundations down to bed rock depth', unit: 'm3', quantity: 12500, rate: 180, amount: 2250000, parentId: 't1-sec-2', rateAnalysisId: 'ra-ex-rock' },
    { id: 't1-item-4', tenderId: 'tender-1', type: 'ITEM', code: 'B.2', description: 'Supply and cast Grade 35 bulk concrete in reinforce foundations & pile caps structural elements', unit: 'm3', quantity: 4500, rate: 16500, amount: 74250000, parentId: 't1-sec-2', rateAnalysisId: 'ra-con-g35' },
    { id: 't1-item-5', tenderId: 'tender-1', type: 'ITEM', code: 'B.3', description: 'Deformed high-tensile steel bars reinforcement (T16, T25, T32) including fixing and bending', unit: 'Ton', quantity: 850, rate: 110000, amount: 93500000, parentId: 't1-sec-2', rateAnalysisId: 'ra-steel-rebar' }
  ],
  'tender-2': [
    { id: 't2-sec-1', tenderId: 'tender-2', type: 'SECTION', code: '1', description: 'SUBSTRUCTURE AND PRE CAST CONCRETE PAVING' },
    { id: 't2-item-1', tenderId: 'tender-2', type: 'ITEM', code: '1.1', description: 'Dredge sand excavation and dynamic deep compaction testing for soil density bearing of hangar floor', unit: 'm2', quantity: 18000, rate: 22, amount: 396000, parentId: 't2-sec-1' },
    { id: 't2-item-2', tenderId: 'tender-2', type: 'ITEM', code: '1.2', description: 'Epoxy dustproof dense floor topping coat (5mm thick heavy duty aviation grade finish)', unit: 'm2', quantity: 15500, rate: 85, amount: 1317500, parentId: 't2-sec-1' }
  ],
  'tender-3': [
    { id: 't3-sec-1', tenderId: 'tender-3', type: 'SECTION', code: 'A', description: 'PREPARATORY SITE CLEARANCE & PILE SHIFTING' },
    { id: 't3-item-1', tenderId: 'tender-3', type: 'ITEM', code: 'A.1', description: 'Manual clearance of vegetations, roots, and cart away from historic sacred Temple boundary', unit: 'LS', quantity: 1, rate: 85000, amount: 85000, parentId: 't3-sec-1' },
    { id: 't3-item-2', tenderId: 'tender-3', type: 'ITEM', code: 'A.2', description: 'Rotary diamond-head micro-piling 300mm diameter in lakebed water including temporary steel casings', unit: 'm', quantity: 450, rate: 4500, amount: 2025000, parentId: 't3-sec-1' },
    { id: 't3-item-3', tenderId: 'tender-3', type: 'ITEM', code: 'A.3', description: 'Hand-rubbed seasoned Sri Lankan Teak wooden planks deck covering complete with protective marine oil coats', unit: 'm2', quantity: 280, rate: 3800, amount: 1064000, parentId: 't3-sec-1' }
  ]
};

const DEFAULT_SUPPLIER_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'sq-1',
    tenderId: 'tender-1',
    supplier: 'Tokyo Cement Group PLC',
    materialCategory: 'Cement / Bulk Aggregates',
    amount: 14200000,
    currency: 'LKR',
    quotationDate: '2026-05-18',
    deliveryPeriod: 'Ready-mix supply within 4 hours from plant',
    status: 'Approved',
    remarks: 'Preferred premium price deal offered based on guaranteed offtake of 4,000+ m3 for Colombo Central piers. Grade 35 OPC concrete.',
    attachmentName: 'Tokyo_Cement_ElevatedLKR_Rev2.pdf'
  },
  {
    id: 'sq-2',
    tenderId: 'tender-1',
    supplier: 'Lanwa Sanstha Wany (Steel Corp)',
    materialCategory: 'Reinforcement Rebar Steel',
    amount: 88500000,
    currency: 'LKR',
    quotationDate: '2026-05-15',
    deliveryPeriod: '21 Working days from LC confirmation',
    status: 'Received',
    remarks: 'Rebar price volatile; quote valid for 30 days only. Ex-factory Colombo.',
    attachmentName: 'LANWA_Rebar_TND_Pricing_May26.pdf'
  },
  {
    id: 'sq-3',
    tenderId: 'tender-2',
    supplier: 'Jotun UAE Paints Trading',
    materialCategory: 'Epoxy Resins & Fire Paints',
    amount: 1250000,
    currency: 'AED',
    quotationDate: '2026-05-12',
    deliveryPeriod: 'Ex-stock Dubai Warehouse',
    status: 'Approved',
    remarks: 'Special grade aviation fuel resistant epoxy coating. Backed by Jotun technical inspection warranty.',
    attachmentName: 'Jotun_AviationEpoxy_DWC_Approved.pdf'
  }
];

const DEFAULT_SUBCONTRACTOR_QUOTATIONS: SubcontractorQuotation[] = [
  {
    id: 'subq-1',
    tenderId: 'tender-1',
    subcontractor: 'Nawaloka Piling (Pvt) Ltd',
    workCategory: 'Bored Piling Operations',
    quotedValue: 4850000,
    currency: 'LKR',
    submissionDate: '2026-05-19',
    duration: '2 Months',
    status: 'Selected',
    remarks: 'Lowest bid for piling with reliable heavy rig equipment. Underwritten Sri Lanka structural references.',
    attachmentName: 'Nawaloka_PortLoop_Piling_Quote.pdf'
  },
  {
    id: 'subq-2',
    tenderId: 'tender-2',
    subcontractor: 'Emirates Steel Erectors LLC',
    workCategory: 'Hangar Portal Steel Frame Fabrication',
    quotedValue: 12400000,
    currency: 'AED',
    submissionDate: '2026-05-16',
    duration: '4 Months',
    status: 'Submitted',
    remarks: 'Highly skilled steel erector team based in Jebel Ali. Performance safety records attached.',
    attachmentName: 'EmiratesSteel_DWC_HangarLayout4.pdf'
  }
];

const DEFAULT_REVISIONS: TenderRevision[] = [
  {
    id: 'tr-1',
    tenderId: 'tender-1',
    revisionNo: 'Addendum 01',
    description: 'Revised realignment of piling corridor under Colombo Port expansion interface limit. Shifts foundations coordinates.',
    date: '2026-05-19',
    revisedBy: 'Sarah Johnson (Lead PM)',
    status: 'Active',
    revisedEstimate: 18450000
  },
  {
    id: 'tr-2',
    tenderId: 'tender-2',
    revisionNo: 'Addendum 02',
    description: 'Changes deluge valve room dimensions and integrates high-capacity foam tanks.',
    date: '2026-05-14',
    revisedBy: 'Amir Al-Mansoori',
    status: 'Active',
    revisedEstimate: 24500000
  }
];

const DEFAULT_SUBMISSIONS: BidSubmission[] = [
  {
    id: 'bs-1',
    tenderId: 'tender-2',
    submissionNo: 'SUB-A-2026-0091',
    submittedDate: '2026-05-20',
    submittedAmount: 24500000,
    discountPercent: 2.5,
    finalBidAmount: 23887500,
    notes: 'Submitted on time via DAEP Tejarat portal. Package is locked for technical board audit.',
    attachmentName: 'DubaiAviation_HangarBidSubmission.zip',
    status: 'Pending'
  },
  {
    id: 'bs-2',
    tenderId: 'tender-3',
    submissionNo: 'SUB-B-2026-0044',
    submittedDate: '2026-05-02',
    submittedAmount: 3400000,
    discountPercent: 0,
    finalBidAmount: 3400000,
    notes: 'Awarded without further discounts. Mobilization to start right away.',
    attachmentName: 'KandyWalkway_UDA_Envelope_Submission.zip',
    status: 'Awarded'
  }
];

export const TenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addProject } = useProject();
  const { createNewBOQ, updateBOQItems } = useBOQ();

  // LocalStorage keys for pre-contract data
  const [tenders, setTenders] = useState<TenderOpportunity[]>(() => {
    const saved = localStorage.getItem('buildops_tenders');
    return saved ? JSON.parse(saved) : DEFAULT_TENDERS;
  });

  const [tenderBoqs, setTenderBoqs] = useState<Record<string, TenderBOQItem[]>>(() => {
    const saved = localStorage.getItem('buildops_tender_boqs');
    return saved ? JSON.parse(saved) : DEFAULT_TENDER_BOQS;
  });

  const [supplierQuotations, setSupplierQuotations] = useState<SupplierQuotation[]>(() => {
    const saved = localStorage.getItem('buildops_tender_supplier_quotes');
    return saved ? JSON.parse(saved) : DEFAULT_SUPPLIER_QUOTATIONS;
  });

  const [subcontractorQuotations, setSubcontractorQuotations] = useState<SubcontractorQuotation[]>(() => {
    const saved = localStorage.getItem('buildops_tender_subcon_quotes');
    return saved ? JSON.parse(saved) : DEFAULT_SUBCONTRACTOR_QUOTATIONS;
  });

  const [tenderRevisions, setTenderRevisions] = useState<TenderRevision[]>(() => {
    const saved = localStorage.getItem('buildops_tender_revisions');
    return saved ? JSON.parse(saved) : DEFAULT_REVISIONS;
  });

  const [bidSubmissions, setBidSubmissions] = useState<BidSubmission[]>(() => {
    const saved = localStorage.getItem('buildops_tender_submissions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBMISSIONS;
  });

  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(() => {
    const saved = localStorage.getItem('buildops_selected_tender_id');
    return saved || null;
  });

  // Automatically save to localstorage when changes occur
  useEffect(() => {
    localStorage.setItem('buildops_tenders', JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem('buildops_tender_boqs', JSON.stringify(tenderBoqs));
  }, [tenderBoqs]);

  useEffect(() => {
    localStorage.setItem('buildops_tender_supplier_quotes', JSON.stringify(supplierQuotations));
  }, [supplierQuotations]);

  useEffect(() => {
    localStorage.setItem('buildops_tender_subcon_quotes', JSON.stringify(subcontractorQuotations));
  }, [subcontractorQuotations]);

  useEffect(() => {
    localStorage.setItem('buildops_tender_revisions', JSON.stringify(tenderRevisions));
  }, [tenderRevisions]);

  useEffect(() => {
    localStorage.setItem('buildops_tender_submissions', JSON.stringify(bidSubmissions));
  }, [bidSubmissions]);

  useEffect(() => {
    if (selectedTenderId) {
      localStorage.setItem('buildops_selected_tender_id', selectedTenderId);
    } else {
      localStorage.removeItem('buildops_selected_tender_id');
    }
  }, [selectedTenderId]);

  // Methods
  const addTender = (tender: Omit<TenderOpportunity, 'id' | 'dateCreated'>) => {
    const tenderId = `tender-${Date.now()}`;
    const newTender: TenderOpportunity = {
      ...tender,
      id: tenderId,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setTenders(prev => [newTender, ...prev]);
    setTenderBoqs(prev => ({
      ...prev,
      [tenderId]: [] // Initial empty BOQ list
    }));
    setSelectedTenderId(tenderId);
    return tenderId;
  };

  const updateTender = (id: string, fields: Partial<TenderOpportunity>) => {
    setTenders(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
  };

  const deleteTender = (id: string) => {
    setTenders(prev => prev.filter(t => t.id !== id));
    setTenderBoqs(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (selectedTenderId === id) {
      setSelectedTenderId(null);
    }
  };

  const updateTenderBoq = (tenderId: string, items: TenderBOQItem[]) => {
    setTenderBoqs(prev => ({
      ...prev,
      [tenderId]: items
    }));

    // Re-verify the estimated value by summing actual items in Tender BOQ
    const totalSum = items
      .filter(item => item.type === 'ITEM')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    setTenders(prev => prev.map(t => t.id === tenderId ? {
      ...t,
      estimatedValue: totalSum > 0 ? totalSum : t.estimatedValue
    } : t));
  };

  const addSupplierQuotation = (quotation: Omit<SupplierQuotation, 'id'>) => {
    const newQuote: SupplierQuotation = {
      ...quotation,
      id: `sq-${Date.now()}`
    };
    setSupplierQuotations(prev => [newQuote, ...prev]);
  };

  const updateSupplierQuotation = (id: string, fields: Partial<SupplierQuotation>) => {
    setSupplierQuotations(prev => prev.map(q => q.id === id ? { ...q, ...fields } : q));
  };

  const addSubcontractorQuotation = (quotation: Omit<SubcontractorQuotation, 'id'>) => {
    const newQuote: SubcontractorQuotation = {
      ...quotation,
      id: `subq-${Date.now()}`
    };
    setSubcontractorQuotations(prev => [newQuote, ...prev]);
  };

  const updateSubcontractorQuotation = (id: string, fields: Partial<SubcontractorQuotation>) => {
    setSubcontractorQuotations(prev => prev.map(q => q.id === id ? { ...q, ...fields } : q));
  };

  const addTenderRevision = (revision: Omit<TenderRevision, 'id'>) => {
    const newRev: TenderRevision = {
      ...revision,
      id: `tr-${Date.now()}`
    };
    setTenderRevisions(prev => [newRev, ...prev]);
  };

  const updateTenderRevision = (id: string, fields: Partial<TenderRevision>) => {
    setTenderRevisions(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const addBidSubmission = (submission: Omit<BidSubmission, 'id'>) => {
    const newSub: BidSubmission = {
      ...submission,
      id: `bs-${Date.now()}`
    };
    setBidSubmissions(prev => [newSub, ...prev]);
  };

  const updateBidSubmission = (id: string, fields: Partial<BidSubmission>) => {
    setBidSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  const convertTenderToProject = (tenderId: string) => {
    const tender = tenders.find(t => t.id === tenderId);
    if (!tender) return null;

    // 1. Mark Tender as Awarded
    updateTender(tenderId, { status: 'Awarded' });

    // 2. Add Project to ProjectContext
    const currencySignMap: Record<string, string> = { LKR: 'LKR', AED: 'AED', USD: 'USD', SAR: 'SAR' };
    const country = tender.currency === 'AED' ? 'United Arab Emirates' : tender.currency === 'SAR' ? 'Saudi Arabia' : 'Sri Lanka';
    const state = tender.currency === 'AED' ? 'Dubai Emirate' : tender.currency === 'SAR' ? 'Riyadh Province' : 'Western Province';

    const projectFields: Omit<Project, 'id' | 'tenant_id'> = {
      code: tender.tenderNo.replace('TND', 'PRJ'),
      name: tender.name,
      shortName: tender.name.slice(0, 15),
      description: `Formally converted from awarded Tender Reference ${tender.tenderNo}. Description: ${tender.description}`,
      type: `${tender.tenderType} Enterprise`,
      sector: 'Infrastructure Operations',
      client: tender.client,
      consultant: tender.consultant,
      contractor: 'BuildOps Construction Corp',
      status: 'Planning', // Created as Planning
      avatarColor: 'bg-indigo-600',
      country,
      state,
      city: tender.location,
      address: tender.location,
      contractValue: tender.estimatedValue,
      currency: tender.currency,
      budget: tender.estimatedValue * (1 - (tender.marginPercent / 100)), // budgeted cost
      estimatedCost: tender.estimatedValue * (1 - ((tender.marginPercent + tender.overheadPercent) / 100)),
      spentToDate: 0,
      startDate: new Date().toISOString().split('T')[0],
      plannedFinishDate: '2027-12-31',
      projectDirector: 'Suren Jayasinghe',
      projectManager: tender.assignedEstimator,
      qsManager: 'Robert Chen',
      planningEngineer: 'Youhana Mikhail',
      siteEngineers: [],
      workingCalendar: 'Standard 6-Day',
      timeZone: tender.currency === 'AED' ? 'UTC+4 (GST)' : 'UTC+5:30 (SLST)',
      defaultCurrency: tender.currency,
      measurementSystem: 'Metric',
      riskLevel: 'Medium',
      priority: 'High',
      tags: [tender.tenderType, 'Awarded', 'Converted-PreContract']
    };

    // A project ID is randomly generated in addProject inside ProjectContext.
    // However, to capture and return the created ID, let's inject it into the context or inspect how addProject operates.
    // Wait! Let's check: in ProjectContext lines 399-424, addProject creates "proj-Date.now()" and sets selectedProjectId.
    // Let's mimic the EXACT ID derivation: it uses `proj-${Date.now()}`. We can use a deterministic ID based on the tenderId to sync it!
    // Wait, let's see how `ProjectContext` stores the list of projects. In `addProject`, it generates:
    // `const generatedId = "proj-" + Date.now()`
    // Can we predict this or check how we can link?
    // Since we are running on local react state, we can simulate creating the project ID.
    // Let's create the Project ID as `proj-tnd-${tender.id.slice(-6)}` or simply predict `proj-${Date.now()}`. Wait!
    // Since addProject in ProjectContext is inside our code block, we can just call `addProject` which internally adds it.
    // Wait, let's check: can we just write the conversion logic beautifully?
    // To ensure a robust binding, let's retrieve the projects again, find the newest project, and link the BOQ!
    // Wait, when `convertTenderToProject` finishes, let's look at `createNewBOQ(name, code)` inside `BOQContext`!
    // `createNewBOQ` creates a BOQ Header:
    // projectId: currentProject?.id || 'proj-1'
    // Let's observe how BOQProvider maps BOQ items. Yes, we can update the items list!
    // Let's look at what ID is generated. Since we can obtain the newest project from `projects` after calling `addProject`,
    // wait, we can't instantly read the updated state of `projects` within the SAME tick because React setProjects is asynchronous.
    // Instead of completely relying on the async state update, we can generate a unique project ID deterministic or pass the ID to `addProject` if we edit `addProject` later, or we can just make `convertTenderToProject` edit the projects and boq keys in localStorage directly!
    // localStorage.setItem('buildops_projects', ...)
    // localStorage.setItem('buildops_boqs', ...)
    // localStorage.setItem('buildops_boq_items_map', ...)
    // Writing directly to localStorage AND updating the states is the absolute most Bulletproof, synchronous pattern! Let's do it!
    
    const newProjId = `proj-tender-${tender.id}`;
    const newProj: Project = {
      ...projectFields,
      id: newProjId,
      tenant_id: 'tenant-1'
    };

    // 1. Add to projects list sync
    const savedProjects = localStorage.getItem('buildops_projects');
    const projectsList: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
    
    // De-duplicate if already exists
    if (!projectsList.some(p => p.id === newProjId)) {
      projectsList.unshift(newProj);
      localStorage.setItem('buildops_projects', JSON.stringify(projectsList));
    }

    // 2. Create the BOQ Header in post-contract BOQ and populate its items
    const newBoqId = `boq-tender-${tender.id}`;
    const tenderItems = tenderBoqs[tenderId] || [];
    
    const totalAmount = tenderItems
      .filter(i => i.type === 'ITEM')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const newBoqHeader = {
      id: newBoqId,
      name: `${tender.name} - Converted BOQ`,
      code: `BOQ-${tender.tenderNo.split('-')[2] || 'CONV'}-001`,
      regionId: '1',
      periodId: '2',
      totalAmount,
      status: 'Approved' as const,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      createdBy: tender.assignedEstimator,
      revisionNo: 1,
      projectId: newProjId,
      discipline: tender.tenderType,
      revisionNotes: `Converted from Tender ${tender.tenderNo}`
    };

    const savedHeaders = localStorage.getItem('buildops_boqs');
    const boqsList = savedHeaders ? JSON.parse(savedHeaders) : [];
    if (!boqsList.some((b: any) => b.id === newBoqId)) {
      boqsList.unshift(newBoqHeader);
      localStorage.setItem('buildops_boqs', JSON.stringify(boqsList));
    }

    // Convert TenderBOQItem to BOQItem
    const convertedItems: BOQItem[] = tenderItems.map(item => ({
      id: `item-conv-${item.id}`,
      type: item.type === 'SECTION' ? 'SECTION' : 'ITEM',
      code: item.code,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      parentId: item.parentId ? `item-conv-${item.parentId}` : undefined,
      remarks: item.remarks,
      rateAnalysisId: item.rateAnalysisId
    }));

    const savedMap = localStorage.getItem('buildops_boq_items_map');
    const itemsMap = savedMap ? JSON.parse(savedMap) : {};
    itemsMap[newBoqId] = convertedItems;
    localStorage.setItem('buildops_boq_items_map', JSON.stringify(itemsMap));

    // Force React State updates
    updateTender(tenderId, { status: 'Awarded', convertedProjectId: newProjId });
    
    // We can trigger a full page reload or let react-context load variables on next cycle
    // Let's also update the in-memory states by dispatching or reloading.
    // Instead of reloading, we will let the window know or trigger updates if needed, but since we are modifying state in React Contexts, let's also update the context values.
    // In order for the active state to be set, we can just select the newly created project!
    setTimeout(() => {
      // Reload current context states so they fetch the newly saved localStorage items synchronously!
      window.location.reload();
    }, 1500);

    return { projectId: newProjId, boqId: newBoqId };
  };

  return (
    <TenderContext.Provider value={{
      tenders,
      tenderBoqs,
      supplierQuotations,
      subcontractorQuotations,
      tenderRevisions,
      bidSubmissions,
      selectedTenderId,
      setSelectedTenderId,
      addTender,
      updateTender,
      deleteTender,
      updateTenderBoq,
      addSupplierQuotation,
      updateSupplierQuotation,
      addSubcontractorQuotation,
      updateSubcontractorQuotation,
      addTenderRevision,
      updateTenderRevision,
      addBidSubmission,
      updateBidSubmission,
      convertTenderToProject
    }}>
      {children}
    </TenderContext.Provider>
  );
};

export const useTender = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error('useTender must be used within a TenderProvider');
  }
  return context;
};
