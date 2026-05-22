import React from 'react';
import { IAMSession } from '../../mockIAMData.ts';
import { Laptop, Smartphone, Tablet, XCircle, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface SessionGridProps {
  sessions: IAMSession[];
  onTerminate: (sessionId: string) => void;
  activeSessionId: string | null;
}

export const SessionGrid = ({ sessions, onTerminate, activeSessionId }: SessionGridProps) => {
  const getDeviceIcon = (deviceType: string) => {
    const dLower = deviceType.toLowerCase();
    if (dLower.includes('iphone') || dLower.includes('mobile') || dLower.includes('phone')) {
      return <Smartphone size={18} className="text-emerald-500" />;
    }
    if (dLower.includes('ipad') || dLower.includes('tablet')) {
      return <Tablet size={18} className="text-indigo-500" />;
    }
    return <Laptop size={18} className="text-slate-600" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col font-sans text-[13px]">
      
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-zentrix-blue leading-none">Logged Devices Activity ({sessions.filter(s => s.isActive).length})</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Audit active session tokens</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-white border rounded px-2.5 py-1">
          <ShieldAlert size={12} className="text-primary-500" />
          <span>Real-time Socket Enabled</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {sessions.map((session) => {
          const isThisSession = session.id === activeSessionId;

          return (
            <div 
              key={session.id}
              className={cn(
                "p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors",
                !session.isActive ? "opacity-60 bg-slate-200/20" : ""
              )}
            >
              <div className="flex gap-3.5 items-start">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200/70 shrink-0 shadow-inner">
                  {getDeviceIcon(session.device)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zentrix-blue text-[13px]">{session.device}</span>
                    {isThisSession && (
                      <span className="bg-primary-650 bg-primary-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Current
                      </span>
                    )}
                    {session.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full font-bold">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">
                        {session.lastActivity}
                      </span>
                    )}
                  </div>

                  <p className="text-[12px] text-slate-500 font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>{session.userName}</span>
                    <span className="text-slate-350">•</span>
                    <span className="font-semibold text-slate-400 font-mono text-[11px]">{session.browser}</span>
                    <span className="text-slate-350">•</span>
                    <span className="font-semibold text-slate-400 font-mono text-[11px]">IP: {session.ipAddress}</span>
                  </p>

                  <p className="text-[11.5px] text-slate-400 font-medium">
                    📍 Located: {session.location} • Active on Token Session ID <span className="font-mono text-[10px]">{session.id}</span>
                  </p>
                </div>
              </div>

              {session.isActive && (
                <button
                  onClick={() => {
                    const phrase = isThisSession ? 'Are you sure you want to log yourself out?' : 'Do you want to remotely terminate this active device token?';
                    if (confirm(phrase)) {
                      onTerminate(session.id);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 border hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center gap-1.5 shadow-sm",
                    isThisSession 
                      ? "text-rose-600 border-rose-200 hover:bg-rose-50" 
                      : "text-slate-600 border-slate-200"
                  )}
                >
                  <LogOut size={12} />
                  {isThisSession ? 'Sign Out Location' : 'Terminate Link'}
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
