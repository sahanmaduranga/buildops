import React, { useState } from 'react';
import { cn } from '../../lib/utils.ts';
import { INITIAL_RESOURCES, INITIAL_SUPPLIERS } from './resourceMockData.ts';
import { 
  Plus, Check, RefreshCw, Upload, Download, FileSpreadsheet, 
  AlertTriangle, ShieldCheck, FileDown, Database, Clipboard, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResourceType } from '../../types.ts';

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'high' | 'medium';
}

export const ImportExport = () => {
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importSummary, setImportSummary] = useState<{
    processed: number;
    valid: number;
    invalid: number;
  } | null>(null);

  const [validationPassed, setValidationPassed] = useState(false);

  // Permitted structural settings
  const VALID_UNITS = ['m²', 'm³', 'kg', 'MT', 'Ltr', 'Nos', 'day', 'RMT', 'Bag (50kg)', 'Hour', 'Ton', 'Day'];
  const VALID_SUPPLIERS = INITIAL_SUPPLIERS.map(s => s.name);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Run bulk validation simulator
  const runValidationSimulator = (fileType: 'resources' | 'pricing') => {
    setValidationPassed(false);
    
    // Simulate some bulk rows loaded
    if (fileType === 'resources') {
      const simulatedErrors: ValidationError[] = [
        { row: 2, field: 'code', value: 'MAT-CM-01', error: 'Duplicate resource code already registered in active database.', severity: 'high' },
        { row: 4, field: 'unit', value: 'Bags', error: 'Invalid Unit format. Permitted units are: m², m³, kg, MT, Ltr, Nos, day, RMT, Ton, Day, Hour.', severity: 'medium' },
        { row: 7, field: 'supplier', value: 'Saudi Cement Corp', error: 'Unregistered supplier. Register the supplier company prior to bulk publishing.', severity: 'high' },
        { row: 9, field: 'name', value: '', error: 'Missing required field. Resource Name cannot be blank.', severity: 'high' },
      ];
      setValidationErrors(simulatedErrors);
      setImportSummary({ processed: 12, valid: 8, invalid: 4 });
    } else {
      const simulatedErrors: ValidationError[] = [
        { row: 3, field: 'unitRate', value: '-12.50', error: 'Pricing rate cannot be a negative value.', severity: 'high' },
        { row: 5, field: 'fiscalPeriod', value: '2027 Q5', error: 'Invalid fiscal period format. Must map to registered active periods.', severity: 'medium' },
      ];
      setValidationErrors(simulatedErrors);
      setImportSummary({ processed: 8, valid: 6, invalid: 2 });
    }
  };

  const handleLoadHealthySample = () => {
    setValidationErrors([]);
    setValidationPassed(true);
    setImportSummary({ processed: 25, valid: 25, invalid: 0 });
  };

  const triggerExportNotification = (format: 'Excel' | 'CSV' | 'PDF', listType: string) => {
    alert(`Successfully compiled and exported BuildOps resource ledger data as: ${listType}.${format.toLowerCase()}. Document generated automatically with SHA-256 seal.`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[13px] text-slate-600">
      
      {/* 📥 IMPORT SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="font-extrabold text-[#111] text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Clipboard size={14} className="text-primary-500" />
            Bulk Spreadsheet Integrator
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Automates bulk resource creation and price indexing. Supported formats: .xlsx, .csv.</p>
        </div>

        {/* Drag and drop zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer shadow-inner relative flex flex-col items-center justify-center",
            dragActive ? "border-primary-500 bg-primary-50/20" : "border-slate-200 bg-slate-50/50 hover:bg-white"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-primary-600 mb-4">
            <Upload size={18} />
          </div>
          <p className="font-bold text-slate-700">Drag & Drop Excel or CSV Template here</p>
          <p className="text-[11px] text-slate-400 mt-1">Or click to select a file from local explorer</p>

          <div className="flex gap-2.5 mt-5">
            <button 
              onClick={() => runValidationSimulator('resources')}
              className="px-4 py-2 bg-primary-600 font-bold text-white text-xs rounded-lg hover:bg-primary-700 transition"
            >
              Simulate Resources Import Upload
            </button>
            <button 
              onClick={() => runValidationSimulator('pricing')}
              className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-900 transition"
            >
              Simulate Rates Matrix Import
            </button>
            <button 
              onClick={handleLoadHealthySample}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs rounded-lg transition"
            >
              Load Healthy Sheet (Passed)
            </button>
          </div>
        </div>

        {/* 📋 VALIDATION PANEL */}
        {importSummary && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                {validationErrors.length > 0 ? (
                  <div className="w-7 h-7 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                )}
                <div>
                  <h5 className="font-extrabold text-[#1a2e40] text-xs">Sheet Schema Audit Complete</h5>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Processed {importSummary.processed} rows.</p>
                </div>
              </div>

              <div className="flex gap-4 text-xs font-bold shrink-0">
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                   Valid: {importSummary.valid}
                </span>
                <span className="text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                   Failed: {importSummary.invalid}
                </span>
              </div>
            </div>

            {/* Error logs */}
            {validationErrors.length > 0 && (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-red-100 rounded-lg text-slate-700 leading-normal flex gap-2">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={13} />
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wide text-red-600 bg-red-50 px-1.5 py-0.2 rounded font-mono">
                        Row {err.row} • {err.field}
                      </span>
                      <p className="font-bold text-slate-800 text-xs mt-1">{err.error}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pasted Row Value: "{err.value || 'BLANK'}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* passed notification */}
            {validationPassed && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-2 text-slate-700 leading-normal">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={15} />
                <div>
                  <h6 className="font-extrabold text-emerald-900">Validations Passed Successfully!</h6>
                  <p className="text-[11px] text-emerald-700 mt-0.5">No duplicate codes or invalid unit formats identified. Loaded 25 rows successfully into project workspace catalog.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 📤 EXPORT SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="font-extrabold text-[#111] text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Download size={14} className="text-indigo-500" />
            Global Export & Backups
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Publish snapshots of resources and prices for archive files.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action: Resource Export Card */}
          <div className="p-4 border border-slate-200 hover:border-indigo-300 rounded-xl bg-slate-50/50 flex items-center justify-between gap-4 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm">
                <FileSpreadsheet size={16} />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-800">Resource Registry List</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">All master ledger items for active division divisions.</p>
              </div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button 
                onClick={() => triggerExportNotification('Excel', 'ResourcesRegistry')}
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded text-xs font-bold cursor-pointer"
                title="Save as Excel Sheet"
              >
                XLSX
              </button>
              <button 
                onClick={() => triggerExportNotification('CSV', 'ResourcesRegistry')}
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded text-xs font-bold cursor-pointer"
                title="Save as Comma-Separated Values CSV"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Action: Price Index Matrix Export Card */}
          <div className="p-4 border border-slate-200 hover:border-indigo-300 rounded-xl bg-slate-50/50 flex items-center justify-between gap-4 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm">
                <Database size={16} />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-800">Historical Rate Matrix</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Region and supplier rate variations matrix list.</p>
              </div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button 
                onClick={() => triggerExportNotification('Excel', 'RegionalCostMatrix')}
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded text-xs font-bold cursor-pointer"
              >
                XLSX
              </button>
              <button 
                onClick={() => triggerExportNotification('CSV', 'RegionalCostMatrix')}
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded text-xs font-bold cursor-pointer"
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
