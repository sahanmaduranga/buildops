import React, { createContext, useContext, useState, useEffect } from 'react';
import { type BOQItem, type Resource, type RateAnalysis } from '../types.ts';
import { useProject } from './ProjectContext.tsx';
import { MOCK_BOQ, MOCK_REGIONS, MOCK_PERIODS } from '../mockData.ts';

export interface BOQHeader {
  id: string;
  name: string;
  code: string;
  regionId: string;
  periodId: string;
  totalAmount: number;
  status: 'Draft' | 'Approved' | 'Review' | 'Revised' | 'Archived' | 'Active';
  lastUpdated: string;
  createdDate: string;
  createdBy: string;
  revisionNo: number;
  parentRevisionId?: string;
  revisionNotes?: string;
  projectId: string;
  discipline?: string;
}

interface BOQContextType {
  boqs: BOQHeader[];
  boqItemsMap: Record<string, BOQItem[]>;
  selectedBOQId: string;
  setSelectedBOQId: (id: string) => void;
  createNewBOQ: (name?: string, code?: string) => string;
  createRevision: (boqId: string, notes: string) => void;
  duplicateBOQ: (boqId: string) => void;
  archiveBOQ: (boqId: string) => void;
  approveBOQ: (boqId: string) => void;
  submitForReview: (boqId: string) => void;
  deleteBOQ: (boqId: string) => void;
  updateBOQItems: (boqId: string, items: BOQItem[]) => void;
  updateBOQMetadata: (boqId: string, name: string, code: string, description?: string) => void;
  restoreVersion: (boqId: string) => void;
  importBOQ: (boqId: string, items: BOQItem[]) => { success: boolean; errors: string[] };
}

const BOQContext = createContext<BOQContextType | undefined>(undefined);

const DEFAULT_BOQ_HEADERS: BOQHeader[] = [
  {
    id: 'boq-1',
    name: 'Main Structural Works',
    code: 'BOQ-STR-001',
    regionId: '1', // Matches 'Riyadh Central' or 'reg-1'
    periodId: '2', // Matches '2024 Q2'
    totalAmount: 1450250.00,
    status: 'Approved',
    createdDate: '2024-02-10',
    lastUpdated: '2024-03-15',
    createdBy: 'Robert Chen',
    revisionNo: 1,
    projectId: 'proj-1',
    discipline: 'Structural',
    revisionNotes: 'Initial Approved Structural Baseline'
  },
  {
    id: 'boq-1-rev2',
    name: 'Main Structural Works',
    code: 'BOQ-STR-001-R2',
    regionId: '1',
    periodId: '2',
    totalAmount: 1465500.00,
    status: 'Draft',
    createdDate: '2024-05-10',
    lastUpdated: '2024-05-18',
    createdBy: 'Robert Chen',
    revisionNo: 2,
    parentRevisionId: 'boq-1',
    projectId: 'proj-1',
    discipline: 'Structural',
    revisionNotes: 'Added additional Grade 25 concrete pour requirements for Block B foundation reinforcement.'
  },
  {
    id: 'boq-2',
    name: 'Architectural Finishing',
    code: 'BOQ-ARC-005',
    regionId: '1',
    periodId: '2',
    totalAmount: 890400.50,
    status: 'Review',
    createdDate: '2024-03-01',
    lastUpdated: '2024-03-18',
    createdBy: 'Robert Chen',
    revisionNo: 1,
    projectId: 'proj-1',
    discipline: 'Architectural'
  },
  {
    id: 'boq-3',
    name: 'MEP Installation - Tower A',
    code: 'BOQ-MEP-012',
    regionId: '2', // Jeddah Coastal
    periodId: '2',
    totalAmount: 2100500.00,
    status: 'Draft',
    createdDate: '2024-03-15',
    lastUpdated: '2024-03-20',
    createdBy: 'Robert Chen',
    revisionNo: 1,
    projectId: 'proj-1',
    discipline: 'Mechanical/Electrical/Plumbing'
  },
  {
    id: 'boq-sub-1',
    name: 'Concrete Substructure & Foundations',
    code: 'BOQ-STR-002',
    regionId: '1',
    periodId: '2',
    totalAmount: 325850.00,
    status: 'Approved',
    createdDate: '2024-04-01',
    lastUpdated: '2024-04-10',
    createdBy: 'Robert Chen',
    revisionNo: 1,
    projectId: 'proj-1',
    discipline: 'Structural',
    revisionNotes: 'Seeded substructure and pile cap details.'
  },
  {
    id: 'boq-elec-2',
    name: 'Main Electrical Infrastructure & Substation',
    code: 'BOQ-MEP-014',
    regionId: '3',
    periodId: '2',
    totalAmount: 224000.00,
    status: 'Approved',
    createdDate: '2024-04-15',
    lastUpdated: '2024-04-20',
    createdBy: 'Anas Al-Ghamdi',
    revisionNo: 1,
    projectId: 'proj-2',
    discipline: 'Mechanical/Electrical/Plumbing',
    revisionNotes: 'Baseline electrical packages for Industrial Park PL-2.'
  },
  {
    id: 'boq-land-1',
    name: 'External Landscaping & Civil Paving',
    code: 'BOQ-CIV-008',
    regionId: '1',
    periodId: '2',
    totalAmount: 137250.00,
    status: 'Draft',
    createdDate: '2024-05-01',
    lastUpdated: '2024-05-05',
    createdBy: 'Sarah Johnson',
    revisionNo: 1,
    projectId: 'proj-1',
    discipline: 'Civil',
    revisionNotes: 'Initial draft for outdoor curbs and interlocking tiles.'
  },
  {
    id: 'boq-steel-2',
    name: 'Warehouse Steel Superstructure Package',
    code: 'BOQ-IND-012',
    regionId: '3',
    periodId: '2',
    totalAmount: 1742900.00,
    status: 'Review',
    createdDate: '2024-04-22',
    lastUpdated: '2024-04-28',
    createdBy: 'David Miller',
    revisionNo: 1,
    projectId: 'proj-2',
    discipline: 'Structural',
    revisionNotes: 'Portal frames structural package.'
  },
  {
    id: 'boq-earth-3',
    name: 'Highway Grading, Earthworks & Sub-base',
    code: 'BOQ-CIV-021',
    regionId: '4',
    periodId: '2',
    totalAmount: 8970000.00,
    status: 'Approved',
    createdDate: '2024-03-10',
    lastUpdated: '2024-03-25',
    createdBy: 'Ali Bashara',
    revisionNo: 1,
    projectId: 'proj-3',
    discipline: 'Civil',
    revisionNotes: 'Highway bulk excavation and subgrade baseline.'
  }
];

export const BOQProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentProject } = useProject();
  
  // Use localStorage to persist BOQ list
  const [boqs, setBoqs] = useState<BOQHeader[]>(() => {
    const saved = localStorage.getItem('buildops_boqs');
    let list = saved ? JSON.parse(saved) : [...DEFAULT_BOQ_HEADERS];
    
    // Automatically inject missing default sample BOQs (so user doesn't have to clear localStorage)
    const existingIds = list.map((b: any) => b.id);
    const missingDefaults = DEFAULT_BOQ_HEADERS.filter(b => !existingIds.includes(b.id));
    if (missingDefaults.length > 0) {
      list = [...list, ...missingDefaults];
    }
    return list;
  });

  // Keep a map of BOQ items for each BOQ
  const [boqItemsMap, setBoqItemsMap] = useState<Record<string, BOQItem[]>>(() => {
    const saved = localStorage.getItem('buildops_boq_items_map');
    const currentMap = saved ? JSON.parse(saved) : {};

    const seedMap: Record<string, BOQItem[]> = {
      'boq-1': [...MOCK_BOQ].map(item => ({ ...item })),
      'boq-1-rev2': [...MOCK_BOQ].map(item => {
        const copy = { ...item };
        if (copy.id === 'item-2-2-a-1') {
          copy.quantity = 1500;
          copy.amount = (copy.rate || 0) * 1500;
        }
        if (copy.id === 'item-3-1-a-1') {
          copy.quantity = 180;
          copy.amount = (copy.rate || 0) * 180;
        }
        return copy;
      }),
      'boq-2': [
        { id: 'b2-bill-1', type: 'BILL', code: 'BILL 01', description: 'ARCHITECTURAL MASONRY' },
        { id: 'b2-sec-1', type: 'SECTION', code: '1.1', description: 'Internal Walls', parentId: 'b2-bill-1' },
        { id: 'b2-item-1', type: 'ITEM', code: '1.1.1', description: 'Internal partitioning brick walls', unit: 'm2', quantity: 1200, rate: 37.30, amount: 44760, parentId: 'b2-sec-1' },
        { id: 'b2-item-2', type: 'ITEM', code: '1.1.2', description: 'Plastering works for internal brick walls', unit: 'm2', quantity: 2400, rate: 12.00, amount: 28800, parentId: 'b2-sec-1' }
      ],
      'boq-3': [
        { id: 'b3-bill-1', type: 'BILL', code: 'BILL 01', description: 'ELECTRICAL INSTALLATIONS' },
        { id: 'b3-sec-1', type: 'SECTION', code: '1.1', description: 'Cabling & Conduiting', parentId: 'b3-bill-1' },
        { id: 'b3-item-1', type: 'ITEM', code: '1.1.1', description: 'PVC conduit piping 25mm', unit: 'm', quantity: 5000, rate: 2.50, amount: 12500, parentId: 'b3-sec-1' },
        { id: 'b3-item-2', type: 'ITEM', code: '1.1.2', description: 'Copper conductor wire XLPE 4mm2', unit: 'm', quantity: 10000, rate: 4.80, amount: 48000, parentId: 'b3-sec-1' }
      ],
      'boq-sub-1': [
        { id: 'bsub-bill-1', type: 'BILL', code: 'BILL 01', description: 'SUBSTRUCTURE CONCRETE' },
        { id: 'bsub-sec-1', type: 'SECTION', code: '1.1', description: 'Pile Caps & Foundation', parentId: 'bsub-bill-1' },
        { id: 'bsub-item-1', type: 'ITEM', code: '1.1.1', description: 'Excavated soil backfill and compaction', unit: 'm3', quantity: 2500, rate: 12.50, amount: 31250, parentId: 'bsub-sec-1' },
        { id: 'bsub-item-2', type: 'ITEM', code: '1.1.2', description: 'Reinforced Concrete Grade 35 in pile caps', unit: 'm3', quantity: 1500, rate: 110.00, amount: 165000, parentId: 'bsub-sec-1' },
        { id: 'bsub-item-3', type: 'ITEM', code: '1.1.3', description: 'High tensile steel reinforcement', unit: 'Ton', quantity: 180, rate: 720.00, amount: 129600, parentId: 'bsub-sec-1' }
      ],
      'boq-elec-2': [
        { id: 'belec-bill-1', type: 'BILL', code: 'BILL 01', description: 'HV TRANSFORMERS & TRUNKING' },
        { id: 'belec-sec-1', type: 'SECTION', code: '1.1', description: 'Primary Substation', parentId: 'belec-bill-1' },
        { id: 'belec-item-1', type: 'ITEM', code: '1.1.1', description: 'Supply and install 1500kVA oil-cooled transformer', unit: 'Nos', quantity: 2, rate: 85000.00, amount: 170000, parentId: 'belec-sec-1' },
        { id: 'belec-item-2', type: 'ITEM', code: '1.1.2', description: 'Excavation and brick lining for cable trenches', unit: 'm', quantity: 1200, rate: 45.00, amount: 54000, parentId: 'belec-sec-1' }
      ],
      'boq-land-1': [
        { id: 'bland-bill-1', type: 'BILL', code: 'BILL 01', description: 'HARD LANDSCAPING' },
        { id: 'bland-sec-1', type: 'SECTION', code: '1.1', description: 'Paving & Curbs', parentId: 'bland-bill-1' },
        { id: 'bland-item-1', type: 'ITEM', code: '1.1.1', description: 'Precast concrete curb stone installation', unit: 'm', quantity: 1500, rate: 18.00, amount: 27000, parentId: 'bland-sec-1' },
        { id: 'bland-item-2', type: 'ITEM', code: '1.1.2', description: 'Interlocking decorative paving tiles 80mm', unit: 'm2', quantity: 4500, rate: 24.50, amount: 110250, parentId: 'bland-sec-1' }
      ],
      'boq-steel-2': [
        { id: 'bsteel-bill-1', type: 'BILL', code: 'BILL 01', description: 'STRUCTURAL STEEL PACKAGE' },
        { id: 'bsteel-sec-1', type: 'SECTION', code: '1.1', description: 'Portal Frame Members', parentId: 'bsteel-bill-1' },
        { id: 'bsteel-item-1', type: 'ITEM', code: '1.1.1', description: 'Fabricated steel portal frame rafters I-beams', unit: 'Ton', quantity: 850, rate: 1850.00, amount: 1572500, parentId: 'bsteel-sec-1' },
        { id: 'bsteel-item-2', type: 'ITEM', code: '1.1.2', description: 'Galvanized roof purlins Z-sections', unit: 'm', quantity: 12000, rate: 14.20, amount: 170400, parentId: 'bsteel-sec-1' }
      ],
      'boq-earth-3': [
        { id: 'bearth-bill-1', type: 'BILL', code: 'BILL 01', description: 'CUT AND FILL EXCAVATIONS' },
        { id: 'bearth-sec-1', type: 'SECTION', code: '1.1', description: 'Bulk Site Excavation', parentId: 'bearth-bill-1' },
        { id: 'bearth-item-1', type: 'ITEM', code: '1.1.1', description: 'Bulk excavation in hard rock using heavy hydraulic breakers', unit: 'm3', quantity: 140000, rate: 35.00, amount: 4900000, parentId: 'bearth-sec-1' },
        { id: 'bearth-item-2', type: 'ITEM', code: '1.1.2', description: 'Subgrade surface compaction and 150mm sub-base layer', unit: 'm2', quantity: 220000, rate: 18.50, amount: 4070000, parentId: 'bearth-sec-1' }
      ]
    };

    // Merge missing seeds into saved context dynamically
    Object.keys(seedMap).forEach(key => {
      if (!currentMap[key]) {
        currentMap[key] = seedMap[key];
      }
    });

    return currentMap;
  });

  const [selectedBOQId, setSelectedBOQId] = useState<string>(() => {
    return localStorage.getItem('buildops_selected_boq_id') || 'boq-1';
  });

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('buildops_boqs', JSON.stringify(boqs));
  }, [boqs]);

  useEffect(() => {
    localStorage.setItem('buildops_boq_items_map', JSON.stringify(boqItemsMap));
  }, [boqItemsMap]);

  useEffect(() => {
    localStorage.setItem('buildops_selected_boq_id', selectedBOQId);
  }, [selectedBOQId]);

  // Actions
  const createNewBOQ = (name = 'New Bill of Quantities', code = `BOQ-NEW-${Math.floor(100 + Math.random() * 900)}`) => {
    const newId = `boq-${Date.now()}`;
    const newBOQ: BOQHeader = {
      id: newId,
      name,
      code,
      regionId: '1',
      periodId: '2',
      totalAmount: 0,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      createdBy: 'Sarah Johnson',
      revisionNo: 1,
      projectId: currentProject?.id || 'proj-1',
      revisionNotes: 'Fresh workspace'
    };

    setBoqs(prev => [...prev, newBOQ]);
    setBoqItemsMap(prev => ({
      ...prev,
      [newId]: [] // STRICTLY EMPTY for fresh entries!
    }));

    setSelectedBOQId(newId);
    return newId;
  };
  const createRevision = (boqId: string, notes: string) => {
    const parentBOQ = boqs.find(b => b.id === boqId);
    if (!parentBOQ) return;

    const nextRevNo = parentBOQ.revisionNo + 1;
    const newId = `${parentBOQ.id}-rev${nextRevNo}`;

    // Mark previous as Revised if it was Active or Approved, or keep
    const updatedBOQs = boqs.map(b => {
      if (b.id === boqId && b.status === 'Approved') {
        return { ...b, status: 'Revised' as const };
      }
      return b;
    });

    const newBOQ: BOQHeader = {
      ...parentBOQ,
      id: newId,
      code: `${parentBOQ.code.split('-R')[0]}-R${nextRevNo}`,
      revisionNo: nextRevNo,
      revisionNotes: notes,
      status: 'Draft',
      parentRevisionId: boqId,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      createdBy: 'Robert Chen'
    };

    setBoqs([...updatedBOQs, newBOQ]);
    
    // Copy all associated items
    const parentItems = boqItemsMap[boqId] || [];
    const clonedItems = parentItems.map(item => ({ ...item }));
    setBoqItemsMap(prev => ({
      ...prev,
      [newId]: clonedItems
    }));

    setSelectedBOQId(newId);
  };

  const duplicateBOQ = (boqId: string) => {
    const sourceBOQ = boqs.find(b => b.id === boqId);
    if (!sourceBOQ) return;

    const newId = `boq-${Date.now()}`;
    const newBOQ: BOQHeader = {
      ...sourceBOQ,
      id: newId,
      name: `${sourceBOQ.name} (Copy)`,
      code: `${sourceBOQ.code}-COPY`,
      revisionNo: 1,
      status: 'Draft',
      parentRevisionId: undefined,
      revisionNotes: 'Duplicated from ' + sourceBOQ.name,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      createdBy: 'Robert Chen'
    };

    setBoqs([...boqs, newBOQ]);
    
    const sourceItems = boqItemsMap[boqId] || [];
    setBoqItemsMap(prev => ({
      ...prev,
      [newId]: sourceItems.map(i => ({ ...i }))
    }));

    setSelectedBOQId(newId);
  };

  const archiveBOQ = (boqId: string) => {
    setBoqs(prev => prev.map(b => b.id === boqId ? { ...b, status: 'Archived', lastUpdated: new Date().toISOString().split('T')[0] } : b));
  };

  const approveBOQ = (boqId: string) => {
    setBoqs(prev => prev.map(b => b.id === boqId ? { ...b, status: 'Approved', lastUpdated: new Date().toISOString().split('T')[0] } : b));
  };

  const submitForReview = (boqId: string) => {
    setBoqs(prev => prev.map(b => b.id === boqId ? { ...b, status: 'Review', lastUpdated: new Date().toISOString().split('T')[0] } : b));
  };

  const deleteBOQ = (boqId: string) => {
    setBoqs(prev => prev.filter(b => b.id !== boqId));
    setBoqItemsMap(prev => {
      const copy = { ...prev };
      delete copy[boqId];
      return copy;
    });
    if (selectedBOQId === boqId) {
      setSelectedBOQId('boq-1');
    }
  };

  const updateBOQItems = (boqId: string, items: BOQItem[]) => {
    // Calculative details
    const totalAmount = items
      .filter(i => i.type === 'ITEM')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    setBoqItemsMap(prev => ({
      ...prev,
      [boqId]: items
    }));

    setBoqs(prev => prev.map(b => b.id === boqId ? { 
      ...b, 
      totalAmount, 
      lastUpdated: new Date().toISOString().split('T')[0] 
    } : b));
  };

  const updateBOQMetadata = (boqId: string, name: string, code: string, description?: string) => {
    setBoqs(prev => prev.map(b => b.id === boqId ? {
      ...b,
      name,
      code,
      revisionNotes: description || b.revisionNotes,
      lastUpdated: new Date().toISOString().split('T')[0]
    } : b));
  };

  const restoreVersion = (boqId: string) => {
    const historicalBOQ = boqs.find(b => b.id === boqId);
    if (!historicalBOQ) return;

    // Create a new draft based on this restored copy
    const newId = `boq-${Date.now()}`;
    const newBOQ: BOQHeader = {
      ...historicalBOQ,
      id: newId,
      name: `${historicalBOQ.name} (Restored V${historicalBOQ.revisionNo})`,
      code: `${historicalBOQ.code}-RST`,
      revisionNo: historicalBOQ.revisionNo + 1,
      status: 'Draft',
      revisionNotes: `Restored from Revision ${historicalBOQ.revisionNo} which was created on ${historicalBOQ.createdDate}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      createdBy: 'Robert Chen'
    };

    setBoqs([...boqs, newBOQ]);
    const histItems = boqItemsMap[boqId] || [];
    setBoqItemsMap(prev => ({
      ...prev,
      [newId]: histItems.map(i => ({ ...i }))
    }));

    setSelectedBOQId(newId);
  };

  const importBOQ = (boqId: string, importedItems: BOQItem[]) => {
    // Validate duplicate item codes
    const errors: string[] = [];
    const itemCodes = new Set<string>();
    
    importedItems.forEach((item, index) => {
      if (item.type === 'ITEM' && item.code) {
        if (itemCodes.has(item.code)) {
          errors.push(`Row ${index + 1}: Duplicate Item Code "${item.code}" found in uploaded sheet.`);
        }
        itemCodes.add(item.code);

        // Validate quantites
        if (item.quantity === undefined || item.quantity <= 0) {
          errors.push(`Row ${index + 1}: Item "${item.code}" contains an invalid or zero quantity.`);
        }

        // Validate units
        const validUnits = ['m', 'm2', 'm3', 'kg', 'Ton', 'LS', 'Nos', 'Bag', 'Day', 'Hour'];
        if (!item.unit || !validUnits.includes(item.unit)) {
          errors.push(`Row ${index + 1}: Item "${item.code}" uses an unrecognized unit "${item.unit || 'EMPTY'}". Accepted: ${validUnits.join(', ')}.`);
        }

        // If rate analysis ref exists, check or log note
        if (item.rateAnalysisId && !item.rateAnalysisId.startsWith('RA-') && !item.rateAnalysisId.startsWith('ra-')) {
          errors.push(`Row ${index + 1}: Item "${item.code}" references a malformed Rate Analysis ID "${item.rateAnalysisId}". Must match standard pattern.`);
        }
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Success - update items map
    updateBOQItems(boqId, importedItems);
    return { success: true, errors: [] };
  };

  return (
    <BOQContext.Provider value={{
      boqs,
      boqItemsMap,
      selectedBOQId,
      setSelectedBOQId,
      createNewBOQ,
      createRevision,
      duplicateBOQ,
      archiveBOQ,
      approveBOQ,
      submitForReview,
      deleteBOQ,
      updateBOQItems,
      updateBOQMetadata,
      restoreVersion,
      importBOQ
    }}>
      {children}
    </BOQContext.Provider>
  );
};

export const useBOQ = () => {
  const context = useContext(BOQContext);
  if (!context) {
    throw new Error('useBOQ must be used within a BOQProvider');
  }
  return context;
};
