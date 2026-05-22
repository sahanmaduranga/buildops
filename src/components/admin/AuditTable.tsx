import React, { useState } from 'react';
import { IAMAuditLog } from '../../mockIAMData.ts';
import { Search, Calendar, Filter, FileSpreadsheet, ArrowUpDown, Shield } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface AuditTableProps {
  logs: IAMAuditLog[];
}

export const AuditTable = ({ logs }: AuditTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  
  // Sort state
  const [sortBy, setSortBy] = useState<'id' | 'timestamp'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract all users that triggered logs for filter dropdown
  const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ipAddress.includes(searchTerm);
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesUser = userFilter === 'All' || log.user === userFilter;
    const matchesProject = projectFilter === 'All' || (projectFilter === 'None' ? !log.projectId : log.projectId === projectFilter);
    
    return matchesSearch && matchesModule && matchesUser && matchesProject;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleExportCSV = () => {
    // Basic CSV download simulator
    let csvContent = "data:text/csv;charset=utf-8,ID,Timestamp,User,Module,Action,Project,IP Address\n";
    sortedLogs.forEach(l => {
      csvContent += `"${l.id}","${l.timestamp}","${l.user}","${l.module}","${l.action.replace(/"/g, '""')}","${l.project || 'N/A'}","${l.ipAddress}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BuildOps_IAM_AuditLog_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col font-sans text-[13px]">
      
      {/* Search & Filters */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by log activity keyword or IP..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 w-full text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 shadow-sm font-semibold"
              id="search-audit-input"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            CSV Export ({sortedLogs.length} matching)
          </button>
        </div>

        {/* Filter deck */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/50 pt-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-slate-400" />
            <span className="font-bold text-slate-500">Filter By:</span>
          </div>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1 px-2.5 focus:outline-none font-semibold text-slate-700 shadow-sm"
            id="module-filter-select"
          >
            <option value="All">All Modules</option>
            <option value="Authentication">Authentication</option>
            <option value="User Management">User Management</option>
            <option value="Roles & Permissions">Roles & Permissions</option>
            <option value="Project Access">Project Access</option>
            <option value="BOQ">BOQ Management</option>
            <option value="Rate Analysis">Rate Analysis</option>
            <option value="Progress">Progress Tracking</option>
            <option value="Cost Control">Cost Control</option>
            <option value="Procurement">Procurement</option>
            <option value="Billing">Billing & IPC</option>
          </select>

          {/* User filter */}
          <select
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1 px-2.5 focus:outline-none font-semibold text-slate-700 shadow-sm"
            id="user-filter-select"
          >
            <option value="All">All Trigger Users</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          {/* Project override filter */}
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1 px-2.5 focus:outline-none font-semibold text-slate-700 shadow-sm"
            id="audit-project-filter-select"
          >
            <option value="All">All Workspace Contexts</option>
            <option value="proj-1">Skyline Residence Towers</option>
            <option value="proj-2">Industrial Park Development</option>
            <option value="proj-3">NEOM Highway Extension</option>
            <option value="proj-5">Qiddiya Theme Park Grid</option>
            <option value="None">Tenant-Level Only</option>
          </select>
        </div>
      </div>

      {/* Grid table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10.5px] font-black uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-5 py-3 w-[150px] cursor-pointer select-none" onClick={toggleSort}>
                <div className="flex items-center gap-1.5">
                  Timestamp UTC
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="px-5 py-3 w-[160px]">Trigger Agent / User</th>
              <th className="px-5 py-3 w-[140px]">Audit Category</th>
              <th className="px-5 py-3">Logged Activity / Policy Update</th>
              <th className="px-5 py-3 w-[180px]">Enterprise Project</th>
              <th className="px-5 py-3 w-[110px] font-mono">IP Address</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-[12px] text-slate-650 text-slate-600">
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Timestamp */}
                  <td className="px-5 py-3 font-semibold text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </td>

                  {/* Trigger User */}
                  <td className="px-5 py-3 font-bold text-zentrix-blue">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-primary-650 font-bold border flex items-center justify-center text-[10px] uppercase">
                        {log.user.slice(0, 2)}
                      </div>
                      <span className="truncate max-w-[130px]">{log.user}</span>
                    </div>
                  </td>

                  {/* Module Group badge */}
                  <td className="px-5 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded font-black uppercase text-[9.5px] tracking-wide border",
                      log.module === 'Authentication' && "bg-slate-100 text-slate-700 border-slate-200",
                      log.module === 'User Management' && "bg-teal-50 text-teal-700 border-teal-100",
                      log.module === 'Roles & Permissions' && "bg-violet-50 text-violet-700 border-violet-100",
                      log.module === 'Project Access' && "bg-blue-50 text-blue-700 border-blue-100",
                      log.module === 'BOQ' && "bg-orange-50 text-orange-700 border-orange-100",
                      log.module === 'Progress' && "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {log.module}
                    </span>
                  </td>

                  {/* Action Description */}
                  <td className="px-5 py-3 font-medium leading-relaxed max-w-[340px]">
                    {log.action}
                  </td>

                  {/* Project context */}
                  <td className="px-5 py-3 font-semibold text-slate-500 truncate max-w-[150px]">
                    {log.project ? (
                      <span className="text-slate-800">🏢 {log.project}</span>
                    ) : (
                      <span className="text-slate-350 italic">Tenant Level</span>
                    )}
                  </td>

                  {/* IP address */}
                  <td className="px-5 py-3 font-mono text-slate-400 font-semibold select-all">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                  <Shield size={24} className="mx-auto text-slate-300 mb-2" />
                  No system audit records matched your current indices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50">
          <span>Page {currentPage} of {totalPages} ({sortedLogs.length} audit sheets loaded)</span>
          <div className="flex gap-1.1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default AuditTable;
