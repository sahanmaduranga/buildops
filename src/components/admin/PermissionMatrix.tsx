import React, { useState } from 'react';
import { ShieldCheck, Info, Sparkles, Columns } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

// Complete schema metadata of enterprise permissions
export const ALL_PERMISSIONS_DEFINITION = [
  {
    module: 'BOQ Management',
    key: 'BOQ',
    description: 'Quantity takeoff, estimators, revision baselines and bill structures.',
    items: [
      { id: 'BOQ.View', name: 'View BOQ List & Schedules', desc: 'Allows browsing of project-level Bills of Quantities schedules.' },
      { id: 'BOQ.Create', name: 'Create BOQ Draft Structures', desc: 'Allows adding new schedules, sheets, sections, or items.' },
      { id: 'BOQ.Edit', name: 'Edit BOQ Quantities & Items', desc: 'Allows editing description fields, provisional status, and remarks.' },
      { id: 'BOQ.Delete', name: 'Delete BOQ Schedules & Drafts', desc: 'Allows permanent deletions of draft worksheets.' },
      { id: 'BOQ.Approve', name: 'Approve BOQ & Lock Baselines', desc: 'Allows baseline signoff, pushing revision to production.' }
    ]
  },
  {
    module: 'Rate Analysis',
    key: 'Rate',
    description: 'Unit rate breakdowns, materials waste, and labour helper productivity ratios.',
    items: [
      { id: 'Rate.View', name: 'View Rate Analyses', desc: 'Allows browsing formulas and overhead percentages.' },
      { id: 'Rate.Create', name: 'Create Rate Calculations', desc: 'Allows spawning custom analysis item codes.' },
      { id: 'Rate.Edit', name: 'Edit Formula Costing', desc: 'Allows editing profit margins, taxes, or wastage factors.' },
      { id: 'Rate.Delete', name: 'Archive Analysis Templates', desc: 'Allows permanent purging of obsolete analyses.' },
      { id: 'Rate.Approve', name: 'Certify Cost Rates', desc: 'Allows locking of critical rates as corporate references.' }
    ]
  },
  {
    module: 'Resource Ledger',
    key: 'Resources',
    description: 'Master items catalogs, material suppliers, and unit rate pricing matrix.',
    items: [
      { id: 'Resources.View', name: 'View Master Materials Ledger', desc: 'Allows viewing specifications lists and price index history.' },
      { id: 'Resources.Create', name: 'Add Catalog Suppliers & Items', desc: 'Allows adding new supplier cards or materials.' },
      { id: 'Resources.Edit', name: 'Modify Base Rates & Unit Matrix', desc: 'Allows editing suppliers and matrix rates.' },
      { id: 'Resources.Delete', name: 'Archive Resource Codes', desc: 'Allows removing unused item codes from index.' }
    ]
  },
  {
    module: 'Project Workspaces',
    key: 'Projects',
    description: 'Baseline dates, project director controls, and location metadata.',
    items: [
      { id: 'Projects.View', name: 'Access Project Workspaces', desc: 'Allows viewing project dashboard summaries.' },
      { id: 'Projects.Create', name: 'Spawn New Construction Projects', desc: 'Allows using the creation wizard or cloning template baselines.' },
      { id: 'Projects.Edit', name: 'Modify Budget Allocation Schemes', desc: 'Allows updating project configurations.' },
      { id: 'Projects.Archive', name: 'Archive or Suspend Projects', desc: 'Allows changing active project operation flag to Archived.' }
    ]
  },
  {
    module: 'Billing & IPC Management',
    key: 'Billing',
    description: 'Client billing cycles, contractor claims, and advance recovery trackers.',
    items: [
      { id: 'Billing.View', name: 'View Invoices & IPCs', desc: 'Allows audit views of payment trackers and client logs.' },
      { id: 'Billing.Create', name: 'Draft Client/Contractor Billing', desc: 'Allows calculating retention amounts and drafting IPC sheets.' },
      { id: 'Billing.Edit', name: 'Modify Variation Claims', desc: 'Allows editing draft bill amounts.' },
      { id: 'Billing.Approve', name: 'Certify Interim Payment Certificates', desc: 'Allows high-level signing off on certified cash flows.' }
    ]
  },
  {
    module: 'Progress Tracking',
    key: 'Progress',
    description: 'Daily construction logs, delay categories, productivity analytics, and site photos.',
    items: [
      { id: 'Progress.View', name: 'View Progress S-Curves & Photos', desc: 'Allows tracking delay logs and EVA charts.' },
      { id: 'Progress.Create', name: 'Submit Daily Field Reports', desc: 'Allows site supervisors to input work logs.' },
      { id: 'Progress.Edit', name: 'Record Site Delays & photos', desc: 'Allows editing reported field activities.' },
      { id: 'Progress.Approve', name: 'Certify Daily Progress Logs', desc: 'Allows PM approval of logs and updating S-curve models.' }
    ]
  },
  {
    module: 'Procurement & Inventory',
    key: 'Procurement',
    description: 'Supplier RFQs, purchase orders, goods receipt notes (GRN), and warehouse stock control.',
    items: [
      { id: 'Procurement.View', name: 'View Procurement Status & GRNs', desc: 'Allows checking stock balances or PR statuses.' },
      { id: 'Procurement.Create', name: 'Spawn Purchase Orders & RFQs', desc: 'Allows drafting requests or issuing quotes request.' },
      { id: 'Procurement.Edit', name: 'Maintain Warehouse Stock Values', desc: 'Allows logging physical inventory arrivals.' },
      { id: 'Procurement.Approve', name: 'Approve Material Sourcing POs', desc: 'Allows signing off on supplier PO payments.' }
    ]
  },
  {
    module: 'System Administration',
    key: 'Admin',
    description: 'Authentication setups, user details management, audit reviews, and security policies.',
    items: [
      { id: 'Admin.View', name: 'Browse Organization Settings & Logs', desc: 'Allows reading audit data, session directories, and policies.' },
      { id: 'Admin.Edit', name: 'Modify IAM Core Directory & Roles', desc: 'Allows modifying user accounts, changing roles, and security policies.' }
    ]
  }
];

interface PermissionMatrixProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  isReadOnly?: boolean;
}

export const PermissionMatrix = ({ selectedPermissions, onChange, isReadOnly = false }: PermissionMatrixProps) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const handleToggle = (permissionId: string) => {
    if (isReadOnly) return;
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter(id => id !== permissionId));
    } else {
      onChange([...selectedPermissions, permissionId]);
    }
  };

  const handleToggleAllModule = (moduleKey: string, selectAll: boolean) => {
    if (isReadOnly) return;
    const moduleDef = ALL_PERMISSIONS_DEFINITION.find(d => d.key === moduleKey);
    if (!moduleDef) return;

    const moduleItemIds = moduleDef.items.map(item => item.id);
    if (selectAll) {
      // Add all moduleItemIds that are not already present
      const uniqueNew = moduleItemIds.filter(id => !selectedPermissions.includes(id));
      onChange([...selectedPermissions, ...uniqueNew]);
    } else {
      // Remove all moduleItemIds
      onChange(selectedPermissions.filter(id => !moduleItemIds.includes(id)));
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row h-full font-sans text-[13px]">
      
      {/* Sidebar navigation for grouping modules */}
      <div className="w-full md:w-[240px] bg-white border-b md:border-b-0 md:border-r border-slate-200 shrink-0 flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="font-extrabold text-zentrix-blue flex items-center gap-1.5 leading-none">
            <Columns size={14} className="text-primary-600" />
            Modules Index
          </h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Role Access Schema Scope</p>
        </div>

        <div className="p-1.5 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
          {ALL_PERMISSIONS_DEFINITION.map((group, idx) => {
            const indexIsActive = idx === activeModuleIndex;
            const checkedCount = group.items.filter(item => selectedPermissions.includes(item.id)).length;
            const totalCount = group.items.length;

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setActiveModuleIndex(idx)}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-left font-bold cursor-pointer transition-colors shrink-0 flex items-center justify-between gap-2.5",
                  indexIsActive 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span className="truncate">{group.module}</span>
                <span className={cn(
                  "text-[10.5px] px-1.5 py-0.5 rounded-full font-extrabold whitespace-nowrap",
                  indexIsActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                )}>
                  {checkedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist View Frame */}
      <div className="flex-1 bg-white p-6 flex flex-col overflow-y-auto">
        {(() => {
          const activeGroup = ALL_PERMISSIONS_DEFINITION[activeModuleIndex];
          const allCheckedInModule = activeGroup.items.every(item => selectedPermissions.includes(item.id));
          
          return (
            <div className="h-full flex flex-col gap-5">
              
              {/* Header Info */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-zentrix-blue flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    {activeGroup.module} Controls
                  </h3>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-lg">
                    {activeGroup.description}
                  </p>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 w-fit shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAllModule(activeGroup.key, true)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAllModule(activeGroup.key, false)}
                      className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      Revoke All
                    </button>
                  </div>
                )}
              </div>

              {/* Permission Item Checklist */}
              <div className="flex-1 space-y-3">
                {activeGroup.items.map((item) => {
                  const isChecked = selectedPermissions.includes(item.id);

                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={cn(
                        "p-4 border border-slate-100 bg-slate-50/50 rounded-xl hover:border-slate-300 transition-colors cursor-pointer flex gap-4 items-start select-none",
                        isChecked ? "border-primary-200 bg-primary-500/[0.01]" : ""
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        disabled={isReadOnly}
                        className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0 cursor-pointer"
                        id={`perm-chk-${item.id}`}
                      />
                      
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-zentrix-blue text-[13px]">{item.name}</span>
                          <span className="font-mono text-[9.5px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            {item.id}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pro Tip Callout */}
              <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-lg flex gap-2.5 items-start text-xs text-orange-850 mt-4 leading-normal font-medium">
                <Info size={14} className="text-orange-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Security Policy:</strong> Changes will apply instantly to all active workspace users matched to this target role. Check twice before revoking modules in production.
                </p>
              </div>

            </div>
          );
        })()}
      </div>

    </div>
  );
};
export default PermissionMatrix;
