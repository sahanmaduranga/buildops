import React from 'react';
import { SecuritySettings } from '../../mockIAMData.ts';
import { Shield, Lock, Eye, Key, HelpCircle, Save, Check } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface SecurityCardProps {
  settings: SecuritySettings;
  onUpdate: (settings: Partial<SecuritySettings>) => void;
}

export const SecurityCard = ({ settings, onUpdate }: SecurityCardProps) => {
  const [successMsg, setSuccessMsg] = React.useState('');

  const handleToggleMFA = (val: SecuritySettings['mfaEnforcement']) => {
    onUpdate({ mfaEnforcement: val });
    triggerToast('MFA Enforcement Policy modified successfully.');
  };

  const handleComplexityChange = (val: SecuritySettings['passwordComplexity']) => {
    onUpdate({ passwordComplexity: val });
    triggerToast('Password Complexity Standards modified.');
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 font-sans text-[13px]">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 z-50 text-xs shrink-0 animate-slide-up">
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check size={10} />
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      <div>
        <h4 className="text-base font-extrabold text-zentrix-blue flex items-center gap-2">
          <Lock size={18} className="text-primary-600" />
          Tenant Workspace Security Rules
        </h4>
        <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-lg mt-1">
          Enforce password policy intervals, restrict login attempts, manage second-factor requirements and sessions expiry timeouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Policy Section: Password Rules */}
        <div className="p-5 border border-slate-150 bg-slate-50/50 rounded-xl space-y-4">
          <h5 className="font-bold text-zentrix-blue flex items-center gap-1.5 border-b border-dashed border-slate-200 pb-2.5">
            <Key size={14} className="text-slate-500" />
            Complexity & Expiry Standards
          </h5>

          {/* Complexity Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Validation Complexity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Simple', 'Medium', 'Strict'] as const).map((level) => {
                const isActive = settings.passwordComplexity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleComplexityChange(level)}
                    className={cn(
                      "py-2 px-2.5 border rounded-lg text-xs font-bold cursor-pointer transition-all text-center shrink-0 shadow-sm",
                      isActive 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
              {settings.passwordComplexity === 'Simple' && '• Minimum 6 characters. No character class requirement.'}
              {settings.passwordComplexity === 'Medium' && '• Minimum 8 characters. Requires at least 1 number and 1 letter.'}
              {settings.passwordComplexity === 'Strict' && '• Minimum 8 characters. Must contain Numbers, Capitals, and Special characters (#!$).'}
            </p>
          </div>

          {/* Password Age */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">Credential Lifespan (Days)</label>
              <span className="text-xs font-bold text-primary-600">{settings.passwordExpiryDays} Days</span>
            </div>
            <input
              type="range"
              min={30}
              max={180}
              step={30}
              value={settings.passwordExpiryDays}
              onChange={(e) => { onUpdate({ passwordExpiryDays: Number(e.target.value) }); }}
              className="w-full accent-primary-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Forces credentials rotation at set intervals. Range values limit to a 6-month cycle.
            </p>
          </div>
        </div>

        {/* Policy Section: MFA Requirements */}
        <div className="p-5 border border-slate-150 bg-slate-50/50 rounded-xl space-y-4">
          <h5 className="font-bold text-zentrix-blue flex items-center gap-1.5 border-b border-dashed border-slate-200 pb-2.5">
            <Shield size={14} className="text-slate-500" />
            Two-Factor Authenticator (MFA)
          </h5>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Enforcement Scope</label>
            <div className="grid grid-cols-3 gap-2 col-span-3">
              {(['None', 'Admin', 'All'] as const).map((level) => {
                const isActive = settings.mfaEnforcement === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleToggleMFA(level)}
                    className={cn(
                      "py-2 px-2.5 border rounded-lg text-xs font-bold cursor-pointer transition-all text-center shrink-0 shadow-sm",
                      isActive 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    {level === 'None' ? 'Optional' : level === 'Admin' ? 'Admins Only' : 'Enforced All'}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              {settings.mfaEnforcement === 'None' && '• MFA enrollment is left to employee choice.'}
              {settings.mfaEnforcement === 'Admin' && '• Multi-factor TOTP is strictly required for Tenant & System Admins.'}
              {settings.mfaEnforcement === 'All' && '• Entire team must confirm a verified Google / MS authenticator on next login.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">Inactivity Timeout (Minutes)</label>
              <span className="text-xs font-bold text-primary-600">{settings.sessionTimeoutMinutes} Minutes</span>
            </div>
            <input
              type="range"
              min={15}
              max={240}
              step={15}
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => { onUpdate({ sessionTimeoutMinutes: Number(e.target.value) }); }}
              className="w-full accent-primary-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[10px] text-slate-400 font-semibold">
              Automated workspace token logout when no cursor or scroll is registered.
            </p>
          </div>
        </div>

        {/* Policy Section: Failure Limit Controls */}
        <div className="p-5 border border-slate-150 bg-slate-50/50 rounded-xl space-y-4 md:col-span-2">
          <h5 className="font-bold text-zentrix-blue flex items-center gap-1.5 border-b border-dashed border-slate-350 border-slate-200 pb-2.5">
            <Lock size={14} className="text-slate-500" />
            Lockout Thresholds & Failure Window
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Max Failed Login Attempts</label>
              <select
                value={settings.lockoutAttempts}
                onChange={(e) => { onUpdate({ lockoutAttempts: Number(e.target.value) }); triggerToast('Failure attempt limit modified.'); }}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-2 px-3 w-full focus:outline-none shadow-sm"
              >
                <option value={3}>3 Failed Attempts</option>
                <option value={5}>5 Failed Attempts (Standard)</option>
                <option value={10}>10 Failed Attempts</option>
              </select>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Accounts exceeding limits shift instantly to a Locked status.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Lockout Duration (Minutes)</label>
              <select
                value={settings.lockoutMinutes}
                onChange={(e) => { onUpdate({ lockoutMinutes: Number(e.target.value) }); triggerToast('Lockout durations modified.'); }}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-2 px-3 w-full focus:outline-none shadow-sm"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={1440}>24 Hours</option>
              </select>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                A locked account recovers online status autonomously after time expirations elapsed.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
