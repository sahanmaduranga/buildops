import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { Project } from '../types.ts';
import { 
  Settings, 
  ShieldCheck, 
  Workflow, 
  Sliders, 
  Check, 
  Bell, 
  MessageSquare,
  FileSpreadsheet,
  Save,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowRightLeft,
  CalendarDays,
  CheckSquare
} from 'lucide-react';

export const ProjectSettings = () => {
  const { currentProject, updateProjectSettings } = useProject();
  const [activeTab, setActiveTab] = useState<'general' | 'permissions' | 'numbering' | 'approvals' | 'imports'>('general');
  const [isSaved, setIsSaved] = useState(false);

  // Local state tied to current project
  const [name, setName] = useState(currentProject?.name || '');
  const [code, setCode] = useState(currentProject?.code || '');
  const [risk, setRisk] = useState(currentProject?.riskLevel || 'Medium');
  const [workingCalendar, setWorkingCalendar] = useState(currentProject?.workingCalendar || 'Standard 6-Day');
  const [measureSystem, setMeasureSystem] = useState(currentProject?.measurementSystem || 'Metric');

  const rawLog = currentProject ? localStorage.getItem(`buildops_project_import_log_${currentProject.id}`) : null;
  const importLog = rawLog ? JSON.parse(rawLog) : {
    importDate: '2026-05-18',
    resources: {
      importedCount: 12,
      skippedCount: 0,
      withPrices: 'YES',
      importMode: 'all',
      strategy: 'skip',
      library: 'Corporate Master Resource Library v4.5'
    },
    analyses: {
      importedCount: 6,
      skippedCount: 0,
      importMode: 'all',
      strategy: 'duplicate',
      library: 'Corporate Master Rate Analysis Library v4.5'
    }
  };

  if (!currentProject) {
    return (
      <div className="bg-white border border-zentrix-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
        <Settings size={48} className="text-slate-300 mb-2" />
        <h4 className="text-md font-bold text-zentrix-blue">No Workspace Active</h4>
        <p className="text-slate-400 text-xs text-center">Select an active project to access settings drawers.</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectSettings(currentProject.id, {
      name,
      code,
      riskLevel: risk as any,
      workingCalendar: workingCalendar as any,
      measurementSystem: measureSystem as any
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white border border-zentrix-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* Settings Navigation Tabs */}
      <div className="md:w-60 shrink-0 flex flex-col gap-1 border-r border-dashed border-slate-100 pr-5">
        <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-slate-400 pb-2 border-b border-slate-50">Settings Chapters</h4>
        
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${activeTab === 'general' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-50'}`}
        >
          <Sliders size={15} /> General metadata
        </button>

        <button 
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${activeTab === 'permissions' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-50'}`}
        >
          <ShieldCheck size={15} /> Role Permissions
        </button>

        <button 
          onClick={() => setActiveTab('numbering')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${activeTab === 'numbering' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-50'}`}
        >
          <FileSpreadsheet size={15} /> Auto-Numbering Setup
        </button>

        <button 
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${activeTab === 'approvals' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-50'}`}
        >
          <Workflow size={15} /> Approval Workflows
        </button>

        <button 
          onClick={() => setActiveTab('imports')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${activeTab === 'imports' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-slate-50'}`}
        >
          <Archive size={15} /> Imported Master Data
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1">
        {activeTab === 'general' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-bold text-md text-zentrix-blue border-b border-dashed border-slate-100 pb-2">General Metadata & Presets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="font-bold text-slate-500">Official Workspace Project Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Project Workspace Identifier Code</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Calculated Risk Classification Profile</label>
                <select 
                  value={risk}
                  onChange={(e) => setRisk(e.target.value as any)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Low">Low Risk Profile</option>
                  <option value="Medium">Medium Risk Profile</option>
                  <option value="High">High Risk Level</option>
                  <option value="Critical">Immediate Critical Risk Level</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Working Calendar Model</label>
                <select 
                  value={workingCalendar}
                  onChange={(e) => setWorkingCalendar(e.target.value as any)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Standard 6-Day">Standard 6-Day Work Week</option>
                  <option value="5-Day Week">Standard 5-Day Week</option>
                  <option value="7-Day Continuous">7-Day Shifting shifts</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Standard Measuring Metric System</label>
                <select 
                  value={measureSystem}
                  onChange={(e) => setMeasureSystem(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Metric">Metric (m3, tons, km, meters)</option>
                  <option value="Imperial">Imperial (cups, cy, lbs, yards)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button 
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0"
              >
                <Save size={14} /> Update Settings
              </button>
              {isSaved && (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 animate-pulse">
                  <CheckCircle2 size={14} /> Saved project parameters successfully!
                </span>
              )}
            </div>
          </form>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <h3 className="font-bold text-md text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Workspace Permission Rulesets</h3>
            <p className="text-slate-400 -mt-2">Map site engineers, planning engines, and guest viewers with read/write keys.</p>

            <div className="space-y-3">
              {[
                { r: 'Project Director', p: 'Full Admin rights to configure margins, project codes, baselines, and membership locks' },
                { r: 'Project Manager', p: 'Read-write access inside daily logs, SOT planning, site photos, and quantity tracking reviews' },
                { r: 'Planning Engineer', p: 'Read-write access locks to schedule of tasks (SOT), dependencies sequence and baseline logs' },
                { r: 'QS Manager', p: 'Full management locks of cost database matrix and Bill of Quantities (BOQ)' },
                { r: 'Site Engineer', p: 'Quantities reporting, log entries, and site snaps uploads' },
                { r: 'Client Viewer', p: 'Strict audit Read-Only lookouts of dashboards and reports' }
              ].map(x => (
                <div key={x.r} className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-700">{x.r} Role Mapping</h5>
                    <p className="text-slate-400 mt-0.5">{x.p}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700 border border-primary-200">Mapped</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'numbering' && (
          <div className="space-y-4">
            <h3 className="font-bold text-md text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Auto-Numbering Sequences generator</h3>
            <p className="text-slate-400 -mt-2">Set automatic serialization codes configuration for technical sheets.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { sheet: 'Bill Of Quantities (BOQ)', prefix: 'BOQ-PRJ01-', start: '0001' },
                { sheet: 'Schedule of Tasks (SOT)', prefix: 'SOT-PRJ01-', start: '001' },
                { sheet: 'Interim Payment Certificate (IPC)', prefix: 'IPC-PRJ01-BILL-', start: '01' },
                { sheet: 'Daily Site Snaps / Progress Logs', prefix: 'LOG-SITE-', start: '00001' }
              ].map(s => (
                <div key={s.sheet} className="p-3.5 border border-slate-100 rounded-lg flex flex-col gap-2.5 text-xs">
                  <h5 className="font-bold text-zentrix-blue">{s.sheet} Series</h5>
                  <div className="flex gap-2.5">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Code Prefix</span>
                      <input type="text" defaultValue={s.prefix} className="w-full mt-1 px-2.5 py-1 border border-zentrix-border rounded bg-slate-50 font-mono" />
                    </div>
                    <div className="w-20">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Index Start</span>
                      <input type="text" defaultValue={s.start} className="w-full mt-1 px-2.5 py-1 border border-zentrix-border rounded bg-slate-50 font-mono text-center" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="font-bold text-md text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Continuous Workflow Approval matrix</h3>
            <p className="text-slate-400 -mt-2">Enable or enforce mandatory multi-tier signoffs on physical site progress logging.</p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-xs shadow-inner">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Automatic Pre-Approval configuration</h5>
                <p className="mt-0.5 leading-relaxed">Mandatory double-tier validations are currently locked checkmarks. Progress entries uploaded by <strong>Site Engineers</strong> require joint electronic signoff from the active **Project Manager** and the supervising **Consultant Architect** before becoming certified quantities.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'imports' && (
          <div className="space-y-5 animate-slide-in">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-md text-zentrix-blue">Sourced Enterprise Templates</h3>
              <p className="text-slate-400 text-xs mt-0.5">Cloned company resources and standard rate calculators bound to this project workspace container.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importLog.resources && (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-[#f8fafc]/40 space-y-3">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Archive size={16} />
                    <h4 className="font-extrabold text-slate-800 text-xs">Imported Resources Library</h4>
                  </div>
                  <div className="space-y-1.5 text-slate-500 text-[11.5px] font-sans">
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Import Date:</span> <strong className="text-slate-700 font-mono font-medium">{importLog.importDate}</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Cloned Items:</span> <strong className="text-slate-700">{importLog.resources.importedCount} resources</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Skipped Duplicates:</span> <strong className="text-slate-700">{importLog.resources.skippedCount} items</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Sourced Rates:</span> <span className="text-emerald-600 font-bold">{importLog.resources.withPrices}</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Conflict Mode:</span> <strong className="text-slate-700 uppercase tracking-widest text-[9px] font-extrabold">{importLog.resources.strategy}</strong></div>
                    <div className="flex justify-between pt-1"><span>Reference Library:</span> <strong className="text-slate-700">{importLog.resources.library}</strong></div>
                  </div>
                </div>
              )}

              {importLog.analyses && (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-[#f8fafc]/40 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Sliders size={16} />
                    <h4 className="font-extrabold text-slate-800 text-xs">Imported Rate Analysis templates</h4>
                  </div>
                  <div className="space-y-1.5 text-slate-500 text-[11.5px] font-sans">
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Import Date:</span> <strong className="text-slate-700 font-mono font-medium">{importLog.importDate}</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Cloned Items:</span> <strong className="text-slate-700">{importLog.analyses.importedCount} rate parameters</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Conflict Mode:</span> <strong className="text-slate-700 uppercase tracking-widest text-[9px] font-extrabold">{importLog.analyses.strategy}</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Sourcing Scope:</span> <strong className="text-slate-700">{importLog.analyses.importMode}</strong></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1"><span>Linked Dependencies:</span> <span className="text-slate-700 font-bold">Auto Resolved Copy</span></div>
                    <div className="flex justify-between pt-1"><span>Reference Library:</span> <strong className="text-slate-700">{importLog.analyses.library}</strong></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs leading-relaxed flex gap-2 border border-emerald-100 font-sans">
              <CheckSquare size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <h5 className="font-bold">Project Sandbox Integrity Verification</h5>
                <p className="mt-0.5 text-slate-500 text-[11px] leading-relaxed">
                  These records are safely stored inside local workspace indexes. Any subsequent revisions or custom edits you perform in the Resource Matrix or Rate Formulation pages are strictly isolated and contain no retroactive callbacks to the Corporate Master database indices.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
