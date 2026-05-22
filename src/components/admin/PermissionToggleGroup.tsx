import React from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Check, Info } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface PermissionToggleGroupProps {
  moduleKey: string;
  allPermissionIdsInModule: string[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  isReadOnly?: boolean;
}

export const PermissionToggleGroup = ({
  moduleKey,
  allPermissionIdsInModule,
  selectedPermissions,
  onChange,
  isReadOnly = false
}: PermissionToggleGroupProps) => {

  const checkedIds = allPermissionIdsInModule.filter(id => selectedPermissions.includes(id));
  const isAllChecked = checkedIds.length === allPermissionIdsInModule.length;
  const isSomeChecked = checkedIds.length > 0 && checkedIds.length < allPermissionIdsInModule.length;

  const handleToggleAll = () => {
    if (isReadOnly) return;
    if (isAllChecked) {
      // Uncheck all of these module items
      const updated = selectedPermissions.filter(id => !allPermissionIdsInModule.includes(id));
      onChange(updated);
    } else {
      // Check all of these module items
      const uniqueNew = allPermissionIdsInModule.filter(id => !selectedPermissions.includes(id));
      onChange([...selectedPermissions, ...uniqueNew]);
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all font-sans text-xs w-full select-none">
      <div className="space-y-0.5">
        <h5 className="font-bold text-zentrix-blue uppercase tracking-wider font-mono text-[11px] flex items-center gap-1">
          <Sparkles size={11} className="text-primary-500" />
          {moduleKey} Module Group
        </h5>
        <p className="text-[11.5px] text-slate-400 font-semibold leading-relaxed">
          {checkedIds.length} of {allPermissionIdsInModule.length} privileges granted
        </p>
      </div>

      <button
        type="button"
        disabled={isReadOnly}
        onClick={handleToggleAll}
        className={cn(
          "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50",
          isAllChecked 
            ? "bg-slate-900 border-slate-900 text-white" 
            : isSomeChecked
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-white hover:bg-slate-50 text-slate-650 border-slate-200"
        )}
      >
        {isAllChecked ? (
          <>
            <ToggleRight size={15} className="text-emerald-400 shrink-0" />
            <span>Fully Enabled</span>
          </>
        ) : (
          <>
            <ToggleLeft size={15} className="text-slate-400 shrink-0" />
            <span>{isSomeChecked ? 'Partially Granted' : 'Fully Disabled'}</span>
          </>
        )}
      </button>

    </div>
  );
};
export default PermissionToggleGroup;
