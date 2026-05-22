import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HelpCircle,
  FileCheck2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { type RateAnalysis, type Resource, ResourceType } from '../../types.ts';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface ImportExportViewProps {
  analyses: RateAnalysis[];
  onBulkImport: (importedAnalyses: RateAnalysis[]) => void;
}

export const ImportExportView = ({ analyses, onBulkImport }: ImportExportViewProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ row: number, item: string, error: string, type: 'critical' | 'warn' }>>([]);
  const [importReport, setImportReport] = useState<{ importedCount: number, duplicatesSkipped: number } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Trigger spreadsheet validation simulation
  const handleValidateSheetSimulated = (fileName: string) => {
    setIsLoading(true);
    setValidationErrors([]);
    setImportReport(null);

    setTimeout(() => {
      setIsLoading(false);
      
      // Simulate real QA validation checks
      if (fileName.includes('error') || fileName.includes('corrupted')) {
        setValidationErrors([
          { row: 4, item: 'GEN-EXC-01', error: 'Duplicate Item Code identifies: Code structural collision in target project Riyadh Central', type: 'critical' },
          { row: 7, item: 'CONC-GRADE-45', error: 'Invalid Resource Code MAT-ST-999: Resource does not exist in master catalog ledger', type: 'critical' },
          { row: 11, item: 'MASON-01', error: 'Invalid rate unit "sqf": Target measurement system is currently strictly sets metric ("m2")', type: 'warn' },
          { row: 15, item: 'EARTH-FILLING', error: 'Missing Quantity values: quantity is required on line item resource coefficients', type: 'critical' }
        ]);
      } else {
        // Success run scenario
        setValidationErrors([
          { row: 9, item: 'EST-FIN-TILES', error: 'Overhead percentage above default threshold (set at 25%)', type: 'warn' }
        ]);
        setImportReport({
          importedCount: 3,
          duplicatesSkipped: 1
        });
      }
    }, 1500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleValidateSheetSimulated(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleValidateSheetSimulated(file.name);
    }
  };

  const handleLoadSuccessDemo = () => {
    const dummyFile = new File(["dummy"], "bulk_costing_q2_riyadh.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    setSelectedFile(dummyFile);
    handleValidateSheetSimulated("bulk_costing_q2_riyadh.xlsx");
  };

  const handleLoadErrorDemo = () => {
    const dummyFile = new File(["dummy"], "riyadh_civil_draft_with_errors.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    setSelectedFile(dummyFile);
    handleValidateSheetSimulated("riyadh_civil_draft_with_errors.xlsx");
  };

  const triggerRealImport = () => {
    if (importReport) {
      // Simulate adding the successfully imported rows to context analyses bank
      // Creating a new bulk analysis items list
      const dummyImported: RateAnalysis[] = [
        {
          id: 'imported-1',
          code: 'RA-EXT-PLAS',
          description: 'External Tyrolean Plastering 15mm',
          unit: 'm2',
          categoryId: 'finishing',
          resources: [
            { id: 'rai-imp-1', resourceId: 'res-1', resourceName: 'Portland Cement', resourceType: ResourceType.MATERIAL, quantity: 0.15, unit: 'Bag', rate: 8.5, amount: 1.275, wasteFactor: 0.05 },
            { id: 'rai-imp-2', resourceId: 'res-3', resourceName: 'Skilled Mason', resourceType: ResourceType.LABOR, quantity: 0.1, unit: 'Day', rate: 45.0, amount: 4.5 }
          ],
          totalMaterialCost: 1.34,
          totalLaborCost: 4.5,
          totalEquipmentCost: 0,
          subtotal: 5.84,
          overheadPercentage: 10,
          profitPercentage: 5,
          taxPercentage: 15,
          netRate: 6.72,
          finalRate: 7.73
        }
      ];

      onBulkImport(dummyImported);
      alert(`Import successfully processed! 3 rate analyses added to active library ledger. Item: RA-EXT-PLAS loaded.`);
      setSelectedFile(null);
      setImportReport(null);
      setValidationErrors([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-600 text-[13px]">
      
      {/* Header Context Bar */}
      <div>
        <h3 className="text-lg font-black text-zentrix-blue tracking-tight leading-none">Bulk Spreadsheet Integrator</h3>
        <p className="text-[11px] text-slate-400 mt-1">Ingest bulk unit rates, templates, or price matrices directly from Microsoft Excel or standardized CSV schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* DRAG AND DROP PANELS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-zentrix-blue text-[14px]">Ingestion Pipeline</h4>
              <div className="flex gap-2">
                <button 
                  onClick={handleLoadSuccessDemo}
                  className="px-2.5 py-1 text-[10px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer font-bold leading-none"
                >
                  Load Clean Import Draft
                </button>
                <button 
                  onClick={handleLoadErrorDemo}
                  className="px-2.5 py-1 text-[10px] bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 cursor-pointer font-bold leading-none"
                >
                  Load Collision Error Draft
                </button>
              </div>
            </div>

            {/* Ingestion Drop Zone */}
            <div 
              onDragEnter={handleDrag} 
              onDragOver={handleDrag} 
              onDragLeave={handleDrag} 
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer relative shadow-inner flex flex-col items-center justify-center min-h-[220px]",
                dragActive ? "border-primary-500 bg-primary-50/40" : "border-slate-200 bg-slate-50/50 hover:bg-white"
              )}
            >
              <input 
                id="file-upload-input"
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-white border border-slate-205 rounded-full flex items-center justify-center text-primary-600 mb-4 shadow-sm">
                  <Upload size={20} />
                </div>
                {selectedFile ? (
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-zentrix-blue">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB • Click to replace spreadsheet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">Drag & drop bulk Excel or CSV file here</p>
                    <p className="text-[11px] text-slate-400">Or browse local sheets (Recommended template: QS_Standard_Rates.xlsx)</p>
                  </div>
                )}
              </label>
            </div>

            {/* Running Loader */}
            {isLoading && (
              <div className="p-8 text-center text-slate-500 font-semibold flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 rounded-lg shadow-inner">
                <FileSpreadsheet className="animate-bounce text-primary-600" size={24} />
                <span>Running index constraints and duplicate code recursions validation checks...</span>
              </div>
            )}

            {/* Validation Feedback Module (Green or Red warnings) */}
            {selectedFile && !isLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100 font-bold">
                  <span>File Validation Statement</span>
                  <span className={cn(
                    "text-[10px] uppercase font-black px-2 py-0.5 rounded leading-none",
                    validationErrors.some(e => e.type === 'critical') ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  )}>
                    {validationErrors.some(e => e.type === 'critical') ? 'Validation Failed' : 'Validation Success'}
                  </span>
                </div>

                <div className="space-y-2">
                  {validationErrors.map((err, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "p-3 rounded-lg flex items-start gap-2.5 border shadow-inner text-[12px] leading-relaxed",
                        err.type === 'critical' ? "bg-red-50/50 border-red-150 text-red-800" : "bg-amber-50/50 border-amber-150 text-amber-800"
                      )}
                    >
                      {err.type === 'critical' ? (
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600 animate-pulse" />
                      ) : (
                        <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                      )}
                      <div>
                        <span className="font-bold underline">Row {err.row} ({err.item})</span>: {err.error}
                      </div>
                    </div>
                  ))}
                  
                  {validationErrors.length === 0 && (
                    <div className="p-4 bg-emerald-50/40 border border-emerald-150 text-emerald-800 rounded-lg flex items-center gap-2 font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Excel structure validated perfectly! Zero duplicate codes or invalid measurements identified.</span>
                    </div>
                  )}
                </div>

                {importReport && (
                  <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-zentrix-blue">Excel file contains valid rate blocks ready to be ingested:</p>
                      <p className="text-[11px] text-slate-400 mt-1">• {importReport.importedCount} new analyses found • Overwrote {importReport.duplicatesSkipped} existing record with revised coefficients</p>
                    </div>
                    <button 
                      onClick={triggerRealImport}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs leading-none shadow transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                      Approve & Bulk Import Rate analyses
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* REUSE TEMPLATES & DOWNLOAD EXPORTS SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-white border border-zentrix-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-zentrix-blue text-[14px]">Download Master Templates</h4>
            <p className="text-[12px] text-slate-500 leading-normal">Download our standard formatted Excel spreadsheets to streamline bulk data entries and validation passes.</p>
            
            <div className="space-y-2.5">
              <button 
                onClick={() => alert('Downloaded standard formatted Microsoft Excel rates sheet template.')}
                className="w-full py-2.5 border border-slate-200 hover:border-slate-355 rounded-xl bg-slate-50/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs text-slate-700"
              >
                <Download size={14} className="text-primary-600" /> Standard Rates Sheet (.XLSX)
              </button>
              <button 
                onClick={() => alert('Downloaded direct pricing database template.')}
                className="w-full py-2.5 border border-slate-200 hover:border-slate-355 rounded-xl bg-slate-50/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs text-slate-700"
              >
                <Download size={14} className="text-amber-500" /> Price Matrix Schedule Template (.XLSX)
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-950 text-white rounded-xl p-5 shadow-lg space-y-3 font-sans">
            <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-wider text-yellow-400">
              <FileCheck2 size={16} /> Import Schema Rules
            </div>
            <ul className="text-[11.5px] text-slate-400 space-y-2 leading-relaxed">
              <li>• Unique <strong>Analysis Code</strong> is mandatory on column 1. Duplicate codes flag collision failures.</li>
              <li>• Resource references must exactly correspond to active <strong>Master Resources</strong> codes.</li>
              <li>• Measurement symbols are cases-sensitive and must conform to project units setup.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
