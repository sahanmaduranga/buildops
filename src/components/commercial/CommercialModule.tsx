import React from 'react';
import { useProject } from '../../context/ProjectContext.tsx';
import { CommercialDashboard } from './CommercialDashboard.tsx';
import { IPCManagement } from './IPCManagement.tsx';
import { ClientBilling } from './ClientBilling.tsx';
import { ContractorBilling } from './ContractorBilling.tsx';
import { RetentionManagement } from './RetentionManagement.tsx';
import { AdvanceRecovery } from './AdvanceRecovery.tsx';
import { VariationsOrders } from './VariationsOrders.tsx';
import { PaymentTracking } from './PaymentTracking.tsx';
import { ClaimsManagement } from './ClaimsManagement.tsx';
import { ForecastBilling } from './ForecastBilling.tsx';
import { CommercialReports } from './CommercialReports.tsx';

interface CommercialModuleProps {
  activeSubTab?: string;
}

export const CommercialModule = ({ activeSubTab = 'commercial-dashboard' }: CommercialModuleProps) => {
  const { currentProject } = useProject();

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-zentrix-border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-zentrix-blue mb-2">No Project Context Selected</h2>
        <p className="text-slate-500 max-w-sm mb-4">Please open a project workspace context from the portfolio directory to access Commercial Management portals.</p>
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (activeSubTab) {
      case 'commercial-dashboard':
        return <CommercialDashboard />;
      case 'commercial-ipc':
        return <IPCManagement />;
      case 'commercial-client-billing':
        return <ClientBilling />;
      case 'commercial-contractor-billing':
        return <ContractorBilling />;
      case 'commercial-retention':
        return <RetentionManagement />;
      case 'commercial-advance-recovery':
        return <AdvanceRecovery />;
      case 'commercial-variations':
        return <VariationsOrders />;
      case 'commercial-payments':
        return <PaymentTracking />;
      case 'commercial-claims':
        return <ClaimsManagement />;
      case 'commercial-forecast':
        return <ForecastBilling />;
      case 'commercial-reports':
        return <CommercialReports />;
      default:
        return <CommercialDashboard />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in text-[13px] text-slate-600">
      {/* Module Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>💰 Commercial Management</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 font-bold tracking-normal">
              Active Contract Account
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Quantity-derived interim certificate accounts, retention schedules, variations, and contract cash flow controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Contract Value</p>
            <p className="text-sm font-black text-zentrix-blue">
              ${(currentProject.contractValue || 12500000).toLocaleString()} {currentProject.currency || 'USD'}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-left">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">QS Lead</p>
            <p className="text-sm font-bold text-slate-700">{currentProject.qsManager || 'Robert Chen'}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Frame */}
      <div className="flex-1 min-h-0">
        {renderActiveScreen()}
      </div>
    </div>
  );
};
