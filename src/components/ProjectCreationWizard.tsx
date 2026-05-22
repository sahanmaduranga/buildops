import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { Project } from '../types.ts';
import { 
  X, 
  Info, 
  Users, 
  DollarSign, 
  Calendar, 
  Sliders, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  Shield,
  Briefcase,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectCreationWizard = ({ isOpen, onClose }: ProjectCreationWizardProps) => {
  const { addProject } = useProject();
  const [activeStep, setActiveStep] = useState(0);

  // Comprehensive state covering all required enterprise fields
  const [formData, setFormData] = useState({
    code: 'PRJ-MM-004',
    name: 'Metro Mall Construction',
    shortName: 'Metro Mall',
    description: 'Structure and finishing works for a 3-storey lifestyle retail mall. Includes underground parking, central food halls, a futuristic domed glass skybridge, and outdoor event amphitheaters.',
    type: 'Commercial Retail',
    sector: 'Real Estate & Infrastructure',
    client: 'Al-Futtaim Development PJSC',
    consultant: 'Dar Al-Handasah',
    contractor: 'BuildOps Construction Corp',
    status: 'Planning' as Project['status'],
    
    // Location
    country: 'Saudi Arabia',
    state: 'Riyadh Province',
    city: 'Riyadh',
    address: 'King Abdullah Block, Gate 12',
    gpsCoordinates: '24.7258° N, 46.7214° E',
    
    // Financials
    contractValue: 48000000,
    currency: 'USD',
    budget: 44000000,
    estimatedCost: 43500000,
    
    // Timeline
    startDate: '2026-06-01',
    plannedFinishDate: '2027-12-30',
    baselineStartDate: '2026-06-01',
    baselineFinishDate: '2027-12-30',
    
    // Organization
    projectDirector: 'Faisal Al-Rashed',
    projectManager: 'Sarah Johnson',
    qsManager: 'Robert Chen',
    planningEngineer: 'Youhana Mikhail',
    siteEngineers: ['Sarah Johnson', 'Michael Brown'],
    
    // Configuration
    workingCalendar: 'Standard 6-Day' as Project['workingCalendar'],
    timeZone: 'UTC+3 (AST)',
    defaultCurrency: 'USD',
    measurementSystem: 'Metric' as Project['measurementSystem'],
    
    // Advanced
    riskLevel: 'Medium' as Project['riskLevel'],
    priority: 'High' as Project['priority'],
    tags: 'Commercial, Retail, Riyadh, Fast-Track',
    bannerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
  });

  if (!isOpen) return null;

  const steps = [
    { label: 'General', icon: Briefcase, desc: 'Project Identifiers' },
    { label: 'Organization', icon: Users, desc: 'Staffing & Managers' },
    { label: 'Financials', icon: DollarSign, desc: 'Budgets & Values' },
    { label: 'Schedule', icon: Calendar, desc: 'Key Dates & Milestones' },
    { label: 'Configuration', icon: Sliders, desc: 'Rule Sets & Calendars' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedTags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const projectToSubmit: Omit<Project, 'id' | 'tenant_id'> = {
      ...formData,
      tags: parsedTags,
      contractValue: Number(formData.contractValue),
      budget: Number(formData.budget),
      estimatedCost: Number(formData.estimatedCost),
    };

    addProject(projectToSubmit);
    onClose();
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-zentrix-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zentrix-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-black italic shadow">W</div>
            <div>
              <h3 className="text-md font-bold text-zentrix-blue">Create Enterprise Project</h3>
              <p className="text-[11px] text-slate-400">Initialize a workspace container for the full construction lifecycle.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="border-b border-zentrix-border bg-slate-50/50 px-6 py-3 scrollbar-hide overflow-x-auto flex justify-between items-center gap-3">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = activeStep === idx;
            const isCompleted = activeStep > idx;
            
            return (
              <React.Fragment key={step.label}>
                <button 
                  onClick={() => setActiveStep(idx)}
                  className="flex items-center gap-2 text-left shrink-0 transition-all outline-none"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow ring-4 ring-primary-100' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? <Check size={14} /> : idx + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-bold leading-none ${isActive ? 'text-primary-600' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`hidden sm:block h-0.5 flex-1 mx-3 ${idx < activeStep ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-[13px] text-slate-600">
          {activeStep === 0 && (
            <div className="space-y-4 animate-slide-in">
              <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Basic Project Identifiers & Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Project Code <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-500">Official Project Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Short Name (Workspace display)</label>
                  <input 
                    type="text" 
                    value={formData.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Project Type</label>
                  <input 
                    type="text" 
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Industry Sector</label>
                  <select 
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className="w-full px-3 py-2.5 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  >
                    <option value="Real Estate & Infrastructure">Real Estate / Luxury Housing</option>
                    <option value="Logistics & Infrastructure">Industrial & Logistics Estates</option>
                    <option value="Public Roads & Transport">Infrastructure & Civil Transportation</option>
                    <option value="Tourism & Housing">Hospitality & Tourism Development</option>
                    <option value="Utilities & Leisure">Heavy Utilities Grid</option>
                    <option value="Heritage & Hospitality">Cultural Heritage Restorations</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Project Scope / Technical Description</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Employer / Client Agency</label>
                  <input 
                    type="text" 
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Supervising Consultant</label>
                  <input 
                    type="text" 
                    value={formData.consultant}
                    onChange={(e) => handleInputChange('consultant', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Lead Contractor Office</label>
                  <input 
                    type="text" 
                    value={formData.contractor}
                    onChange={(e) => handleInputChange('contractor', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
              </div>

              <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-2 pt-2">Location Coordinates</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Country</label>
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">State / Region</label>
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">City</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Web GIS / GPS Coordinates</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 24.7136° N, 46.6753° E"
                    value={formData.gpsCoordinates}
                    onChange={(e) => handleInputChange('gpsCoordinates', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-4">
                  <label className="font-bold text-slate-500">Site Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4 animate-slide-in">
              <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Organizational Chart & Leadership</h4>
              <p className="text-[11px] text-slate-400 -mt-2">Assign credentialed leads in matching roles to direct workflows & reviews.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 flex items-center gap-1">
                    <span>Executive Project Director</span>
                    <Info size={12} className="text-slate-400" title="Main sponsor at the corporate cluster level" />
                  </label>
                  <input 
                    type="text" 
                    value={formData.projectDirector}
                    onChange={(e) => handleInputChange('projectDirector', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 flex items-center gap-1">
                    <span>Resident Project Manager (PM)</span>
                    <Info size={12} className="text-slate-400" title="Resident leader executing active on-site plans" />
                  </label>
                  <input 
                    type="text" 
                    value={formData.projectManager}
                    onChange={(e) => handleInputChange('projectManager', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 flex items-center gap-1">
                    <span>Lead Quantity Surveyor (QS)</span>
                    <Info size={12} className="text-slate-400" title="Responsible for direct cost control, variations, and BOQ audits" />
                  </label>
                  <input 
                    type="text" 
                    value={formData.qsManager}
                    onChange={(e) => handleInputChange('qsManager', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 flex items-center gap-1">
                    <span>Planning Engineer</span>
                    <Info size={12} className="text-slate-400" title="Drafts and structures SOT base calendars, tasks, and sequence networks" />
                  </label>
                  <input 
                    type="text" 
                    value={formData.planningEngineer}
                    onChange={(e) => handleInputChange('planningEngineer', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 flex gap-3 text-slate-500 text-xs">
                <Users size={20} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-zentrix-blue">Auto-Provisioning Members</h5>
                  <p className="mt-0.5 leading-relaxed">By default, BuildOps will also secure workspace permissions of these individuals with <strong>Admin/Read-Write</strong> keys inside the newly created project container automatically to let them begin planning.</p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4 animate-slide-in">
              <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Financial Accounting Boundaries</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Signed Contract Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={formData.contractValue}
                      onChange={(e) => handleInputChange('contractValue', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Primary Bookkeeping Currency</label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2.5 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="USD">USD - United States Dollar ($)</option>
                    <option value="SAR">SAR - Saudi Riyal (SR)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Allocated Cost Budget Boundary</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white text-zentrix-blue font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Engineering Estimated Construction Cost (ECC)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-xs">
                <AlertOctagon size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Budget Buffer & Margin Alert</h5>
                  <p className="mt-0.5 leading-relaxed">The cost budget boundary is configured at <strong>${(Number(formData.budget) / 1000000).toFixed(1)}M</strong> against a contract value of <strong>${(Number(formData.contractValue) / 1000000).toFixed(1)}M</strong>. This establishes a planned net profit margin of <strong>{(((Number(formData.contractValue) - Number(formData.budget)) / Number(formData.contractValue)) * 100).toFixed(1)}%</strong> ($4.0M) for contingency management.</p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 animate-slide-in">
              <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Schedule Milestones & Baseline Timeline</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Physical mobilization / Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Contractual Planned Finish Date</label>
                  <input 
                    type="date" 
                    value={formData.plannedFinishDate}
                    onChange={(e) => handleInputChange('plannedFinishDate', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Schedule Baseline Start Date</label>
                  <input 
                    type="date" 
                    value={formData.baselineStartDate}
                    onChange={(e) => handleInputChange('baselineStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono text-slate-400"
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Schedule Baseline Finish Date</label>
                  <input 
                    type="date" 
                    value={formData.baselineFinishDate}
                    onChange={(e) => handleInputChange('baselineFinishDate', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono text-slate-400"
                    disabled
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 flex items-center gap-2">
                <Info size={16} className="text-slate-400" />
                <span>Baseline schedules freeze contractual target lines automatically on project launch.</span>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4 animate-slide-in">
              <h4 className="font-bold text-zentrix-blue border-b border-dashed border-slate-100 pb-2">Regional Rulesets & Work Calendars</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Working Calendar Standard</label>
                  <select 
                    value={formData.workingCalendar}
                    onChange={(e) => handleInputChange('workingCalendar', e.target.value)}
                    className="w-full px-3 py-2.5 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="Standard 6-Day">Standard 6-Day Work Week (Sun - Thu, Sat)</option>
                    <option value="5-Day Week">Standard 5-Day Week (Sun - Thu)</option>
                    <option value="7-Day Continuous">7-Day Continuous (Rest periods on site shifts)</option>
                    <option value="Custom">Custom Holiday Calendar Exclusions</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Operational Time Zone</label>
                  <input 
                    type="text" 
                    value={formData.timeZone}
                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Default Weights/Measurement Standard</label>
                  <select 
                    value={formData.measurementSystem}
                    onChange={(e) => handleInputChange('measurementSystem', e.target.value)}
                    className="w-full px-3 py-2.5 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="Metric">Metric System (m3, meters, tons, m2)</option>
                    <option value="Imperial">Imperial System (cy, yards, lbs, sqft)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Risk Profile Classification</label>
                  <select 
                    value={formData.riskLevel}
                    onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                    className="w-full px-3 py-2.5 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-bold"
                  >
                    <option value="Low">Low Risk Profile</option>
                    <option value="Medium">Medium Risk Profile</option>
                    <option value="High">High Risk Level</option>
                    <option value="Critical">Critical High-Risk Infrastructure</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Workspace Execution Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2.5 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-bold"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Immediate">Immediate Execution (Critical Path)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Tags / Labels (Separator comma)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. High-Rise, Commercial, Riyadh"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Cover Banner Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.bannerImage}
                  onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zentrix-border bg-slate-50 flex justify-between items-center whitespace-nowrap">
          <button 
            type="button"
            disabled={activeStep === 0}
            onClick={prevStep}
            className={`flex items-center gap-1.5 px-4 py-2 border border-zentrix-border rounded-lg font-bold text-xs ${activeStep === 0 ? 'opacity-40 cursor-not-allowed text-slate-300' : 'text-slate-600 hover:bg-slate-100 bg-white'}`}
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zentrix-border bg-white text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            {activeStep < steps.length - 1 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg hover:bg-primary-700"
              >
                Next Step <ChevronRight size={14} />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-md transition-all"
              >
                Launch Workspace <Check size={14} className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
