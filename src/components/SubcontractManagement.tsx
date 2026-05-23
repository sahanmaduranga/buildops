import React from 'react';
import { SubcontractDashboard } from './subcontract/SubcontractDashboard.tsx';
import { SubcontractPackages } from './subcontract/SubcontractPackages.tsx';
import { SubcontractAgreements } from './subcontract/SubcontractAgreements.tsx';
import { SubcontractIPC } from './subcontract/SubcontractIPC.tsx';
import { SubcontractVariations } from './subcontract/SubcontractVariations.tsx';
import { SubcontractProgress } from './subcontract/SubcontractProgress.tsx';
import { SubcontractReports } from './subcontract/SubcontractReports.tsx';
import { Briefcase } from 'lucide-react';

interface SubcontractManagementProps {
  activeSubTab: string;
}

export function SubcontractManagement({ activeSubTab }: SubcontractManagementProps) {
  const renderSubTab = () => {
    switch (activeSubTab) {
      case 'subcontract-dashboard':
        return <SubcontractDashboard />;
      case 'subcontract-packages':
        return <SubcontractPackages />;
      case 'subcontract-agreements':
        return <SubcontractAgreements />;
      case 'subcontract-ipc':
        return <SubcontractIPC />;
      case 'subcontract-variations':
        return <SubcontractVariations />;
      case 'subcontract-progress':
        return <SubcontractProgress />;
      case 'subcontract-reports':
        return <SubcontractReports />;
      default:
        return <SubcontractDashboard />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top context bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in shadow-xs select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-primary-600/10 text-primary-650 px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider">
              Sublet Engineering Workspace Mode
            </span>
            <span className="text-slate-350">|</span>
            <span className="text-[11.5px] text-slate-550 font-bold bg-white border px-2 py-0.5 rounded shadow-2xs">Contractor & SLA Centered</span>
          </div>
          <p className="text-xs text-slate-450 font-medium leading-relaxed">
            Manage global subcontractors SLA databases, apportion package allocations from project BOQs, log variations orders, and certify interims monthly payments.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {renderSubTab()}
      </div>
    </div>
  );
}
