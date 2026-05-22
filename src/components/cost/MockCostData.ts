import { useState, useEffect } from 'react';

// Budget Entity Definition
export interface Budget {
  id: string;
  projectId: string;
  code: string;
  name: string;
  category: 'Materials' | 'Labor' | 'Equipment' | 'Subcontract' | 'Site Expenses' | 'General Expenses';
  amount: number;
  actualAmount: number;
  remainingAmount: number;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Approved' | 'Revised' | 'Under Review';
  updatedAt: string;
}

// Cost Tracking Entity Definition
export interface CostItem {
  id: string;
  projectId: string;
  reference: string;
  costType: 'Purchase Order' | 'Material Issue' | 'IPC / Billing' | 'Manual Expenses';
  sourceModule: 'Procurement' | 'Inventory' | 'Billing' | 'Manual Entry';
  date: string;
  amount: number;
  category: 'Materials' | 'Labor' | 'Equipment' | 'Subcontract' | 'Site Expenses' | 'General Expenses';
  linkedDoc: string; // Document Reference
  status: 'Approved' | 'Pending' | 'Rejected';
}

// Cash Flow Entity Definition
export interface CashFlowRecord {
  id: string;
  projectId: string;
  month: string; // e.g. "2026-01", "2026-02"
  inflow: number;  // Incoming payments
  outflow: number; // Outgoing payments
  balance: number; // Net
}

// Forecasting Entity Definition
export interface ForecastRecord {
  projectId: string;
  category: string;
  budgetAmount: number;
  actualCost: number;
  committedCost: number; // For forecast formula: Actual + Committed = Forecast Final Cost
  forecastFinalCost: number;
  variance: number;
}

// Default initial datasets for our workspace projects
const INITIAL_BUDGETS: Budget[] = [
  // Skyline Residence Towers (proj-1) - Total Budget: $42,000,000
  {
    id: 'bgt-1',
    projectId: 'proj-1',
    code: 'BGT-MAT-001',
    name: 'Structural Concrete & Rebar Materials',
    category: 'Materials',
    amount: 14000000,
    actualAmount: 4800000,
    remainingAmount: 9200000,
    description: 'Bulk grade 40 concrete procurement and high-tensile steel reinforcing rebar rods.',
    startDate: '2024-06-01',
    endDate: '2025-06-30',
    status: 'Approved',
    updatedAt: '2026-04-10T11:20:00Z'
  },
  {
    id: 'bgt-2',
    projectId: 'proj-1',
    code: 'BGT-LAB-002',
    name: 'Formwork Carpentry & Concrete Placement',
    category: 'Labor',
    amount: 8000000,
    actualAmount: 2500000,
    remainingAmount: 5500000,
    description: 'Direct trades civil labor, climbing scaffold installation, and shuttering.',
    startDate: '2024-06-15',
    endDate: '2025-12-30',
    status: 'Approved',
    updatedAt: '2026-05-15T08:00:00Z'
  },
  {
    id: 'bgt-3',
    projectId: 'proj-1',
    code: 'BGT-EQP-003',
    name: 'Heavy Luffing Tower Cranes & Pumps',
    category: 'Equipment',
    amount: 6000000,
    actualAmount: 2200000,
    remainingAmount: 3800000,
    description: 'Leasing of high-capacity luffing jib tower cranes and high-pressure concrete placing booms.',
    startDate: '2024-06-01',
    endDate: '2025-10-30',
    status: 'Approved',
    updatedAt: '2026-03-24T14:45:00Z'
  },
  {
    id: 'bgt-4',
    projectId: 'proj-1',
    code: 'BGT-SUB-004',
    name: 'MEP Fit-Out & Substructure Contracting',
    category: 'Subcontract',
    amount: 9000000,
    actualAmount: 3400000,
    remainingAmount: 5600000,
    description: 'Subcontracted electrical risers, HVAC chillers distribution, and firefighting networks.',
    startDate: '2024-08-01',
    endDate: '2025-12-30',
    status: 'Revised',
    updatedAt: '2026-05-20T10:30:00Z'
  },
  {
    id: 'bgt-5',
    projectId: 'proj-1',
    code: 'BGT-STE-005',
    name: 'Site Supervision & Temporary Utilities',
    category: 'Site Expenses',
    amount: 3000000,
    actualAmount: 1100000,
    remainingAmount: 1900000,
    description: 'Site office caravans, temporary water/power hookups, HSE safety rails, and direct site management salaries.',
    startDate: '2024-06-01',
    endDate: '2025-12-30',
    status: 'Approved',
    updatedAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'bgt-6',
    projectId: 'proj-1',
    code: 'BGT-GEN-006',
    name: 'Insurance, Permits & Authority Approvals',
    category: 'General Expenses',
    amount: 2000000,
    actualAmount: 1250000, // Very high! Almost over-budget warning level
    remainingAmount: 750000,
    description: 'Riyadh Municipality construction licenses, third-party liability insurance, and utility connection fees.',
    startDate: '2024-05-01',
    endDate: '2025-12-30',
    status: 'Approved',
    updatedAt: '2026-04-01T15:10:00Z'
  },

  // Industrial Park Development (proj-2)
  {
    id: 'bgt-7',
    projectId: 'proj-2',
    code: 'BGT-MAT-101',
    name: 'Steel Framing & Insulation Materials',
    category: 'Materials',
    amount: 32000000,
    actualAmount: 2450000,
    remainingAmount: 29550000,
    description: 'PEB steel frames and double skin insulation sheets.',
    startDate: '2024-09-01',
    endDate: '2025-12-31',
    status: 'Approved',
    updatedAt: '2026-04-18T10:00:00Z'
  },
  {
    id: 'bgt-8',
    projectId: 'proj-2',
    code: 'BGT-LAB-102',
    name: 'Structural Assembly & Cladding Labor',
    category: 'Labor',
    amount: 15000000,
    actualAmount: 1100000,
    remainingAmount: 13900000,
    description: 'Cladding labor and erection works.',
    startDate: '2024-10-01',
    endDate: '2025-12-31',
    status: 'Approved',
    updatedAt: '2026-04-20T11:00:00Z'
  },
  {
    id: 'bgt-9',
    projectId: 'proj-2',
    code: 'BGT-SUB-104',
    name: 'Grade-Slab Concrete Subcontracting',
    category: 'Subcontract',
    amount: 25000000,
    actualAmount: 26000000, // OVER BUDGET!
    remainingAmount: -1000000,
    description: 'Floor leveling and fiber reinforced grade slab casting subcontracts.',
    startDate: '2024-08-15',
    endDate: '2025-10-31',
    status: 'Under Review',
    updatedAt: '2026-05-19T13:40:00Z'
  }
];

const INITIAL_COST_ITEMS: CostItem[] = [
  // Skyline Residence Towers (proj-1)
  {
    id: 'cost-1',
    projectId: 'proj-1',
    reference: 'PO-2026-0219',
    costType: 'Purchase Order',
    sourceModule: 'Procurement',
    date: '2026-03-12',
    amount: 1450000,
    category: 'Materials',
    linkedDoc: 'PO_STRUCT_REBAR_08.pdf',
    status: 'Approved'
  },
  {
    id: 'cost-2',
    projectId: 'proj-1',
    reference: 'MAT-ISS-0144',
    costType: 'Material Issue',
    sourceModule: 'Inventory',
    date: '2026-04-05',
    amount: 450000,
    category: 'Materials',
    linkedDoc: 'MAT_REQ_CONC_77.xlsx',
    status: 'Approved'
  },
  {
    id: 'cost-3',
    projectId: 'proj-1',
    reference: 'IPC-004-CLIENT',
    costType: 'IPC / Billing',
    sourceModule: 'Billing',
    date: '2026-05-14',
    amount: 3400000,
    category: 'Subcontract',
    linkedDoc: 'IPC_SUB_MEP_REV2.pdf',
    status: 'Approved'
  },
  {
    id: 'cost-4',
    projectId: 'proj-1',
    reference: 'EXP-MNC-0511',
    costType: 'Manual Expenses',
    sourceModule: 'Manual Entry',
    date: '2026-05-18',
    amount: 24000,
    category: 'Site Expenses',
    linkedDoc: 'REC_FUEL_GENERATOR_MAY.pdf',
    status: 'Approved'
  },
  {
    id: 'cost-5',
    projectId: 'proj-1',
    reference: 'PO-2026-0305',
    costType: 'Purchase Order',
    sourceModule: 'Procurement',
    date: '2026-05-20',
    amount: 600000,
    category: 'Equipment',
    linkedDoc: 'PO_CRANE_RENTAL_Q2.pdf',
    status: 'Approved'
  },
  {
    id: 'cost-6',
    projectId: 'proj-1',
    reference: 'EXP-TUT-4309',
    costType: 'Manual Expenses',
    sourceModule: 'Manual Entry',
    date: '2026-05-19',
    amount: 45000,
    category: 'General Expenses',
    linkedDoc: 'REC_PERMIT_WATER_CONN.pdf',
    status: 'Approved'
  },
  {
    id: 'cost-7',
    projectId: 'proj-1',
    reference: 'PO-2026-0412',
    costType: 'Purchase Order',
    sourceModule: 'Procurement',
    date: '2026-05-21',
    amount: 80000,
    category: 'Materials',
    linkedDoc: 'PO_MASONRY_BLOCK_04.pdf',
    status: 'Pending'
  },

  // Industrial Park (proj-2)
  {
    id: 'cost-8',
    projectId: 'proj-2',
    reference: 'IPC-002-VAL',
    costType: 'IPC / Billing',
    sourceModule: 'Billing',
    date: '2026-05-02',
    amount: 26000000,
    category: 'Subcontract',
    linkedDoc: 'IPC_SLAB_VAL-02.pdf',
    status: 'Approved'
  },
  {
    id: 'cost-9',
    projectId: 'proj-2',
    reference: 'PO-2026-0091',
    costType: 'Purchase Order',
    sourceModule: 'Procurement',
    date: '2026-05-15',
    amount: 1100000,
    category: 'Labor',
    linkedDoc: 'PO_CONTR_ERECT_01.pdf',
    status: 'Approved'
  }
];

const INITIAL_CASH_FLOW: CashFlowRecord[] = [
  // Skyline Residence Towers (proj-1)
  { id: 'cf-1', projectId: 'proj-1', month: '2026-01', inflow: 2500000, outflow: 1800000, balance: 700000 },
  { id: 'cf-2', projectId: 'proj-1', month: '2026-02', inflow: 3100000, outflow: 2400000, balance: 700000 },
  { id: 'cf-3', projectId: 'proj-1', month: '2026-03', inflow: 1800000, outflow: 2100000, balance: -300000 },
  { id: 'cf-4', projectId: 'proj-1', month: '2026-04', inflow: 3800000, outflow: 2900000, balance: 900000 },
  { id: 'cf-5', projectId: 'proj-1', month: '2026-05', inflow: 4500000, outflow: 3750000, balance: 750000 },
  { id: 'cf-6', projectId: 'proj-1', month: '2026-06', inflow: 5000000, outflow: 4100000, balance: 900000 },

  // Industrial Park (proj-2)
  { id: 'cf-7', projectId: 'proj-2', month: '2026-01', inflow: 500000, outflow: 800000, balance: -300000 },
  { id: 'cf-8', projectId: 'proj-2', month: '2026-02', inflow: 1200000, outflow: 1000000, balance: 200000 },
  { id: 'cf-9', projectId: 'proj-2', month: '2026-03', inflow: 800000, outflow: 1400000, balance: -600000 },
  { id: 'cf-10', projectId: 'proj-2', month: '2026-04', inflow: 2000000, outflow: 1800000, balance: 200000 },
  { id: 'cf-11', projectId: 'proj-2', month: '2026-05', inflow: 3500000, outflow: 2600000, balance: 900000 }
];

const INITIAL_FORECASTS: ForecastRecord[] = [
  // Formula: Actual + Committed = Forecast Final Cost.
  // committedCost represents outstanding materials on order, subcontracts unbilled, etc.
  {
    projectId: 'proj-1',
    category: 'Materials',
    budgetAmount: 14000000,
    actualCost: 4800000,
    committedCost: 8500000,
    forecastFinalCost: 13300000, // Budget 14M, forecast looks healthy
    variance: 700000 // Under budget
  },
  {
    projectId: 'proj-1',
    category: 'Labor',
    budgetAmount: 8000000,
    actualCost: 2500000,
    committedCost: 5600000,
    forecastFinalCost: 8100000, // Budget 8M, slightly over budget
    variance: -100000
  },
  {
    projectId: 'proj-1',
    category: 'Equipment',
    budgetAmount: 6000000,
    actualCost: 2200000,
    committedCost: 3500000,
    forecastFinalCost: 5700000,
    variance: 300000
  },
  {
    projectId: 'proj-1',
    category: 'Subcontract',
    budgetAmount: 9000000,
    actualCost: 3400000,
    committedCost: 5800000,
    forecastFinalCost: 9200000, // Budget 9M, forecast 9.2M, slightly high (orange warning)
    variance: -200000
  },
  {
    projectId: 'proj-1',
    category: 'Site Expenses',
    budgetAmount: 3000000,
    actualCost: 1100000,
    committedCost: 1700000,
    forecastFinalCost: 2800000,
    variance: 200000
  },
  {
    projectId: 'proj-1',
    category: 'General Expenses',
    budgetAmount: 2000000,
    actualCost: 1250000,
    committedCost: 900000,
    forecastFinalCost: 2150000, // Over budget! (Red warning)
    variance: -150000
  }
];

// In-Memory database manager that acts as service layer
const STORAGE_BUDGETS_KEY = 'buildops_cost_budgets';
const STORAGE_COSTS_KEY = 'buildops_cost_actuals';
const STORAGE_CASH_KEY = 'buildops_cost_cashflow';
const STORAGE_ROLE_KEY = 'buildops_user_role';

export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_BUDGETS_KEY)) {
    localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(INITIAL_BUDGETS));
  }
  if (!localStorage.getItem(STORAGE_COSTS_KEY)) {
    localStorage.setItem(STORAGE_COSTS_KEY, JSON.stringify(INITIAL_COST_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_CASH_KEY)) {
    localStorage.setItem(STORAGE_CASH_KEY, JSON.stringify(INITIAL_CASH_FLOW));
  }
  if (!localStorage.getItem(STORAGE_ROLE_KEY)) {
    localStorage.setItem(STORAGE_ROLE_KEY, 'Finance Manager'); // Default role
  }
}

// SIMULATING REACT QUERY / TANSTACK QUERY HOOKS (GET/POST / PLACEHOLDERS)
// This implements react-query-like states: data, isLoading, refetch, isMutating
export function useBudgets(projectId: string) {
  const [data, setData] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = () => {
    try {
      setIsLoading(true);
      initializeStorage();
      const all: Budget[] = JSON.parse(localStorage.getItem(STORAGE_BUDGETS_KEY) || '[]');
      const filtered = all.filter(b => b.projectId === projectId);
      
      // Fallback generator for un-budgeted projects
      if (filtered.length === 0) {
        const generated: Budget[] = [
          {
            id: `bgt-gen-${projectId}-1`,
            projectId,
            code: 'BGT-MAT-AUTO',
            name: 'Generated Base Materials Blanket',
            category: 'Materials',
            amount: 5000000,
            actualAmount: 430000,
            remainingAmount: 4570000,
            description: 'Placeholder baseline budget allocation.',
            startDate: '2024-01-01',
            endDate: '2026-12-31',
            status: 'Approved',
            updatedAt: new Date().toISOString()
          },
          {
            id: `bgt-gen-${projectId}-2`,
            projectId,
            code: 'BGT-LAB-AUTO',
            name: 'Generated Workforce Allocation',
            category: 'Labor',
            amount: 3000000,
            actualAmount: 120000,
            remainingAmount: 2880000,
            description: 'Placeholder baseline labor budget allocation.',
            startDate: '2024-01-01',
            endDate: '2026-12-31',
            status: 'Approved',
            updatedAt: new Date().toISOString()
          }
        ];
        const updatedAll = [...all, ...generated];
        localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(updatedAll));
        setData(generated);
      } else {
        setData(filtered);
      }
    } catch (e: any) {
      setError(e.message || 'Failed load');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [projectId]);

  const addBudget = (newBudget: Omit<Budget, 'id' | 'projectId' | 'actualAmount' | 'remainingAmount' | 'updatedAt'>) => {
    const all: Budget[] = JSON.parse(localStorage.getItem(STORAGE_BUDGETS_KEY) || '[]');
    const completeBudget: Budget = {
      ...newBudget,
      id: `bgt-${Date.now()}`,
      projectId,
      actualAmount: 0,
      remainingAmount: newBudget.amount,
      updatedAt: new Date().toISOString()
    };
    const updated = [completeBudget, ...all];
    localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(updated));
    setData(prev => [completeBudget, ...prev]);
    return completeBudget;
  };

  return { data, isLoading, error, refetch: fetchBudgets, addBudget };
}

export function useCosts(projectId: string) {
  const [data, setData] = useState<CostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCosts = () => {
    try {
      setIsLoading(true);
      initializeStorage();
      const all: CostItem[] = JSON.parse(localStorage.getItem(STORAGE_COSTS_KEY) || '[]');
      const filtered = all.filter(c => c.projectId === projectId);
      setData(filtered);
    } catch (e: any) {
      setError(e.message || 'Failed cost fetch');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [projectId]);

  const addCost = (newCost: Omit<CostItem, 'id' | 'projectId'>) => {
    const all: CostItem[] = JSON.parse(localStorage.getItem(STORAGE_COSTS_KEY) || '[]');
    const completeCost: CostItem = {
      ...newCost,
      id: `cost-${Date.now()}`,
      projectId
    };
    const updated = [completeCost, ...all];
    localStorage.setItem(STORAGE_COSTS_KEY, JSON.stringify(updated));
    
    // Auto-update budget actual amount inside storage as well to integrate BOQ/Procurement with Budgets!
    const budgetsAll: Budget[] = JSON.parse(localStorage.getItem(STORAGE_BUDGETS_KEY) || '[]');
    const targetedBudget = budgetsAll.find(b => b.projectId === projectId && b.category === newCost.category);
    if (targetedBudget && newCost.status === 'Approved') {
      targetedBudget.actualAmount += newCost.amount;
      targetedBudget.remainingAmount = targetedBudget.amount - targetedBudget.actualAmount;
      targetedBudget.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(budgetsAll));
    }

    setData(prev => [completeCost, ...prev]);
    return completeCost;
  };

  return { data, isLoading, error, refetch: fetchCosts, addCost };
}

export function useCashflow(projectId: string) {
  const [data, setData] = useState<CashFlowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCF = () => {
    setIsLoading(true);
    initializeStorage();
    const all: CashFlowRecord[] = JSON.parse(localStorage.getItem(STORAGE_CASH_KEY) || '[]');
    const filtered = all.filter(cf => cf.projectId === projectId);
    
    // Mock generate if empty
    if (filtered.length === 0) {
      const generated: CashFlowRecord[] = [
        { id: `cf-g-${projectId}-1`, projectId, month: '2026-01', inflow: 120000, outflow: 100000, balance: 20000 },
        { id: `cf-g-${projectId}-2`, projectId, month: '2026-02', inflow: 150000, outflow: 160000, balance: -10000 },
        { id: `cf-g-${projectId}-3`, projectId, month: '2026-03', inflow: 200000, outflow: 140000, balance: 60000 }
      ];
      setData(generated);
    } else {
      setData(filtered);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCF();
  }, [projectId]);

  return { data, isLoading, refetch: fetchCF };
}

export function useForecast(projectId: string, budgets: Budget[], costs: CostItem[]) {
  const [data, setData] = useState<ForecastRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Real dynamic calculation from our budgets and actual costs
    // Forecast Final Cost = Actual Cost + Committed Cost
    // Committed costs can be simulated as pending transactions or unfulfilled PO values (e.g., 25% of remaining budget)
    const categories: Budget['category'][] = ['Materials', 'Labor', 'Equipment', 'Subcontract', 'Site Expenses', 'General Expenses'];
    
    const calculated: ForecastRecord[] = categories.map(cat => {
      const catBudgets = budgets.filter(b => b.category === cat);
      const budgetAmount = catBudgets.reduce((acc, curr) => acc + curr.amount, 0);
      const actualCost = costs.filter(c => c.category === cat && c.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);
      
      // Let's assume committed cost comprises pending POs + 40% of standard remaining budget on order
      const pendingCost = costs.filter(c => c.category === cat && c.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
      const standardRemaining = Math.max(0, budgetAmount - actualCost);
      const committedCost = parseFloat((pendingCost + standardRemaining * 0.45).toFixed(0));
      
      const forecastFinalCost = actualCost + committedCost;
      const variance = budgetAmount - forecastFinalCost;

      return {
        projectId,
        category: cat,
        budgetAmount,
        actualCost,
        committedCost,
        forecastFinalCost,
        variance
      };
    });

    setData(calculated);
    setIsLoading(false);
  }, [projectId, budgets, costs]);

  return { data, isLoading };
}

// User role management hook for Role-Based Access Control
export function useUserRole() {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_ROLE_KEY) || 'Finance Manager');

  const updateRole = (newRole: string) => {
    localStorage.setItem(STORAGE_ROLE_KEY, newRole);
    setRole(newRole);
  };

  return { role, updateRole };
}
