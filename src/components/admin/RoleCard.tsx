import React from 'react';
import { IAMRole } from '../../mockIAMData.ts';
import { Users, Shield, Copy, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface RoleCardProps {
  role: IAMRole;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, isActive, onSelect, onEdit, onDuplicate, onDelete }) => {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "bg-white border text-[13px] rounded-xl p-5 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 font-sans relative group overflow-hidden border-slate-200",
        isActive ? "ring-2 ring-primary-500 border-primary-500 bg-primary-500/[0.01]" : ""
      )}
    >
      {/* Scope Badge Ribbon */}
      <span className={cn(
        "absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-bl-lg border-l border-b text-slate-500 border-slate-100 bg-slate-50",
        role.scope === 'Global' && "bg-violet-50 text-violet-700 border-violet-100",
        role.scope === 'Tenant' && "bg-emerald-50 text-emerald-700 border-emerald-100",
        role.scope === 'Project-Specific' && "bg-blue-50 text-blue-700 border-blue-100"
      )}>
        {role.scope} Scope
      </span>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center border",
            isActive ? "bg-primary-50 border-primary-200 text-primary-600" : "bg-slate-50 border-slate-100 text-slate-500"
          )}>
            <Shield size={16} />
          </div>
          <h3 className="font-bold text-zentrix-blue text-[14px] truncate max-w-[150px] group-hover:text-primary-600 transition-colors">
            {role.name}
          </h3>
        </div>

        <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed font-medium">
          {role.description}
        </p>
      </div>

      <div className="border-t border-dashed border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users size={13} className="text-slate-400" />
            <span className="font-bold text-slate-700">{role.userCount}</span>
            <span className="text-slate-400 text-[11px]">user{role.userCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-1">
            <Shield size={13} className="text-slate-400" />
            <span className="font-bold text-slate-700">{role.permissionCount}</span>
            <span className="text-slate-400 text-[11px]">rules</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            title="Duplicate Role Settings"
          >
            <Copy size={12} />
          </button>
          
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded text-slate-400 hover:text-primary-600 transition-all cursor-pointer"
            title="Edit Role Schema Name"
          >
            <Edit2 size={12} />
          </button>

          {role.id !== 'role-syst-admin' && role.id !== 'role-ten-admin' && (
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 hover:bg-red-50 border border-transparent hover:border-red-100 rounded text-slate-400 hover:text-red-600 transition-all cursor-pointer"
              title="Archive Custom Role"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
