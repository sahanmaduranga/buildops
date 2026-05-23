import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProject } from './ProjectContext.tsx';
import { useBOQ } from './BOQContext.tsx';

import { 
  type Subcontractor, 
  type SubcontractBOQAllocation, 
  type SubcontractPackage, 
  type SubcontractAgreement, 
  type SubcontractIPCItem, 
  type SubcontractIPC, 
  type SubcontractVariation 
} from '../types.ts';

export type { 
  Subcontractor, 
  SubcontractBOQAllocation, 
  SubcontractPackage, 
  SubcontractAgreement, 
  SubcontractIPCItem, 
  SubcontractIPC, 
  SubcontractVariation 
};

import {
  MOCK_SUBCONTRACTORS,
  MOCK_SUBCONTRACT_PACKAGES,
  MOCK_SUBCONTRACT_AGREEMENTS,
  MOCK_SUBCONTRACT_IPCS,
  MOCK_SUBCONTRACT_VARIATIONS
} from '../mockData.ts';

const SEED_SUBCONTRACTORS = MOCK_SUBCONTRACTORS;
const SEED_PACKAGES = MOCK_SUBCONTRACT_PACKAGES;
const SEED_AGREEMENTS = MOCK_SUBCONTRACT_AGREEMENTS;
const SEED_IPCS = MOCK_SUBCONTRACT_IPCS;
const SEED_VARIATIONS = MOCK_SUBCONTRACT_VARIATIONS;

interface SubcontractContextType {
  subcontractors: Subcontractor[];
  packages: SubcontractPackage[];
  agreements: SubcontractAgreement[];
  ipcs: SubcontractIPC[];
  variations: SubcontractVariation[];
  addSubcontractor: (s: Omit<Subcontractor, 'id' | 'activeProjectsCount'>) => void;
  updateSubcontractor: (id: string, s: Partial<Subcontractor>) => void;
  deleteSubcontractor: (id: string) => void;
  addPackage: (p: Omit<SubcontractPackage, 'id' | 'revisedContractValue' | 'originalContractValue'>) => void;
  updatePackage: (id: string, p: Partial<SubcontractPackage>) => void;
  deletePackage: (id: string) => void;
  addAgreement: (a: Omit<SubcontractAgreement, 'id' | 'documents'>) => void;
  updateAgreement: (id: string, a: Partial<SubcontractAgreement>) => void;
  addAgreementDocument: (agreementId: string, doc: { name: string; fileType: string }) => void;
  deleteAgreement: (id: string) => void;
  addIPC: (ipc: Omit<SubcontractIPC, 'id'>) => void;
  updateIPC: (id: string, ipc: Partial<SubcontractIPC>) => void;
  approveIPC: (id: string) => void;
  deleteIPC: (id: string) => void;
  addVariation: (v: Omit<SubcontractVariation, 'id'>) => void;
  updateVariation: (id: string, v: Partial<SubcontractVariation>) => void;
  deleteVariation: (id: string) => void;
  getBOQAllocatedTotalQty: (boqItemId: string, excludePackageId?: string) => number;
}

const SubcontractContext = createContext<SubcontractContextType | undefined>(undefined);

export const SubcontractProvider = ({ children }: { children: React.ReactNode }) => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(() => {
    const saved = localStorage.getItem('buildops_subcontractors');
    return saved ? JSON.parse(saved) : SEED_SUBCONTRACTORS;
  });

  const [packages, setPackages] = useState<SubcontractPackage[]>(() => {
    const saved = localStorage.getItem('buildops_sub_packages');
    return saved ? JSON.parse(saved) : SEED_PACKAGES;
  });

  const [agreements, setAgreements] = useState<SubcontractAgreement[]>(() => {
    const saved = localStorage.getItem('buildops_sub_agreements');
    return saved ? JSON.parse(saved) : SEED_AGREEMENTS;
  });

  const [ipcs, setIpcs] = useState<SubcontractIPC[]>(() => {
    const saved = localStorage.getItem('buildops_sub_ipcs');
    return saved ? JSON.parse(saved) : SEED_IPCS;
  });

  const [variations, setVariations] = useState<SubcontractVariation[]>(() => {
    const saved = localStorage.getItem('buildops_sub_variations');
    return saved ? JSON.parse(saved) : SEED_VARIATIONS;
  });

  // Re-sync values when variations are approved or packages are changed
  useEffect(() => {
    localStorage.setItem('buildops_subcontractors', JSON.stringify(subcontractors));
  }, [subcontractors]);

  useEffect(() => {
    localStorage.setItem('buildops_sub_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('buildops_sub_agreements', JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem('buildops_sub_ipcs', JSON.stringify(ipcs));
  }, [ipcs]);

  useEffect(() => {
    localStorage.setItem('buildops_sub_variations', JSON.stringify(variations));
  }, [variations]);

  // Recalculate revised package values when variations change
  useEffect(() => {
    setPackages(prev => 
      prev.map(pkg => {
        const approvedVarAmt = variations
          .filter(v => v.packageId === pkg.id && v.status === 'Approved')
          .reduce((sum, v) => sum + v.amount, 0);

        const originalVal = pkg.allocations.reduce((sum, item) => sum + (item.allocatedQty * item.rate), 0);
        return {
          ...pkg,
          originalContractValue: originalVal,
          revisedContractValue: originalVal + approvedVarAmt
        };
      })
    );
  }, [variations]);

  // Global Subcontractor registry interactions
  const addSubcontractor = (s: Omit<Subcontractor, 'id' | 'activeProjectsCount'>) => {
    const newSub: Subcontractor = {
      ...s,
      id: `sub-con-${Date.now()}`,
      activeProjectsCount: 0
    };
    setSubcontractors(prev => [newSub, ...prev]);
  };

  const updateSubcontractor = (id: string, s: Partial<Subcontractor>) => {
    setSubcontractors(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
  };

  const deleteSubcontractor = (id: string) => {
    setSubcontractors(prev => prev.filter(item => item.id !== id));
  };

  // Helper validation rule: Checks total allocated quantity of a BOQ item across packages (excluding edit target optionally)
  const getBOQAllocatedTotalQty = (boqItemId: string, excludePackageId?: string) => {
    return packages
      .filter(pkg => !excludePackageId || pkg.id !== excludePackageId)
      .reduce((total, pkg) => {
        const match = pkg.allocations.find(a => a.boqItemId === boqItemId);
        return total + (match ? match.allocatedQty : 0);
      }, 0);
  };

  // Packages management
  const addPackage = (p: Omit<SubcontractPackage, 'id' | 'revisedContractValue' | 'originalContractValue'>) => {
    const id = `pkg-${Date.now()}`;
    const origVal = p.allocations.reduce((sum, item) => sum + (item.allocatedQty * item.rate), 0);
    const newPkg: SubcontractPackage = {
      ...p,
      id,
      originalContractValue: origVal,
      revisedContractValue: origVal
    };
    setPackages(prev => [newPkg, ...prev]);
  };

  const updatePackage = (id: string, p: Partial<SubcontractPackage>) => {
    setPackages(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...p };
        const origVal = merged.allocations.reduce((sum, alloc) => sum + (alloc.allocatedQty * alloc.rate), 0);
        const approvedVarAmt = variations
          .filter(v => v.packageId === id && v.status === 'Approved')
          .reduce((sum, v) => sum + v.amount, 0);

        return {
          ...merged,
          originalContractValue: origVal,
          revisedContractValue: origVal + approvedVarAmt
        };
      }
      return item;
    }));
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(item => item.id !== id));
    setAgreements(prev => prev.filter(item => item.packageId !== id));
    setIpcs(prev => prev.filter(item => item.packageId !== id));
    setVariations(prev => prev.filter(item => item.packageId !== id));
  };

  // Agreements management
  const addAgreement = (a: Omit<SubcontractAgreement, 'id' | 'documents'>) => {
    const newAg: SubcontractAgreement = {
      ...a,
      id: `agr-${Date.now()}`,
      documents: []
    };
    setAgreements(prev => [newAg, ...prev]);
  };

  const updateAgreement = (id: string, a: Partial<SubcontractAgreement>) => {
    setAgreements(prev => prev.map(item => item.id === id ? { ...item, ...a } : item));
  };

  const addAgreementDocument = (agreementId: string, doc: { name: string; fileType: string }) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: doc.name,
      version: '1.0',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Robert Chen',
      fileType: doc.fileType
    };
    setAgreements(prev => prev.map(item => item.id === agreementId ? {
      ...item,
      documents: [...item.documents, newDoc]
    } : item));
  };

  const deleteAgreement = (id: string) => {
    setAgreements(prev => prev.filter(item => item.id !== id));
  };

  // IPC Module
  const addIPC = (ipc: Omit<SubcontractIPC, 'id'>) => {
    const newIpc: SubcontractIPC = {
      ...ipc,
      id: `ipc-${Date.now()}`
    };
    setIpcs(prev => [newIpc, ...prev]);
  };

  const updateIPC = (id: string, ipc: Partial<SubcontractIPC>) => {
    setIpcs(prev => prev.map(item => item.id === id ? { ...item, ...ipc } : item));
  };

  const approveIPC = (id: string) => {
    setIpcs(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Approved' as const
        };
      }
      return item;
    }));
  };

  const deleteIPC = (id: string) => {
    setIpcs(prev => prev.filter(item => item.id !== id));
  };

  // Variations
  const addVariation = (v: Omit<SubcontractVariation, 'id'>) => {
    const newV: SubcontractVariation = {
      ...v,
      id: `var-${Date.now()}`
    };
    setVariations(prev => [newV, ...prev]);
  };

  const updateVariation = (id: string, v: Partial<SubcontractVariation>) => {
    setVariations(prev => prev.map(item => item.id === id ? { ...item, ...v } : item));
  };

  const deleteVariation = (id: string) => {
    setVariations(prev => prev.filter(item => item.id !== id));
  };

  return (
    <SubcontractContext.Provider value={{
      subcontractors,
      packages,
      agreements,
      ipcs,
      variations,
      addSubcontractor,
      updateSubcontractor,
      deleteSubcontractor,
      addPackage,
      updatePackage,
      deletePackage,
      addAgreement,
      updateAgreement,
      addAgreementDocument,
      deleteAgreement,
      addIPC,
      updateIPC,
      approveIPC,
      deleteIPC,
      addVariation,
      updateVariation,
      deleteVariation,
      getBOQAllocatedTotalQty
    }}>
      {children}
    </SubcontractContext.Provider>
  );
};

export const useSubcontract = () => {
  const context = useContext(SubcontractContext);
  if (!context) {
    throw new Error('useSubcontract must be used within a SubcontractProvider');
  }
  return context;
};
