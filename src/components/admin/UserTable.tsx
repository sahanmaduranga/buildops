import React, { useState } from 'react';
import { IAMUser, IAMRole } from '../../mockIAMData.ts';
import { Search, SlidersHorizontal, MoreVertical, Eye, Edit2, RotateCcw, ShieldX, CheckCircle, Unlock, ArrowUpDown, ChevronLeft, ChevronRight, UserMinus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface UserTableProps {
  users: IAMUser[];
  roles: IAMRole[];
  onViewDetails: (userId: string) => void;
  onEditUser: (userId: string) => void;
}

export const UserTable = ({ users, roles, onViewDetails, onEditUser }: UserTableProps) => {
  const { updateUser, deleteUser, assignUserProjectRole } = useAuth();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'status' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk Selection 
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Track active row hover / menu dropdown
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Toggle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const activeFiltered = filteredUsers.map(u => u.id);
      setSelectedUserIds(activeFiltered);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    }
  };

  // Perform safe sorting & filters
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    
    const matchedRole = roles.find(r => r.id === u.globalRoleId);
    const matchesRole = roleFilter === 'All' || u.globalRoleId === roleFilter;

    // Project access match
    const matchesProject = projectFilter === 'All' || u.projectAccess.some(pa => pa.projectId === projectFilter);

    return matchesSearch && matchesStatus && matchesRole && matchesProject;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      comparison = nameA.localeCompare(nameB);
    } else if (sortBy === 'email') {
      comparison = a.email.localeCompare(b.email);
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy === 'lastLogin') {
      comparison = a.lastLogin.localeCompare(b.lastLogin);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pages calc
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Bulk Quick Action Handlers
  const handleBulkStatusChange = (status: IAMUser['status']) => {
    selectedUserIds.forEach(id => {
      updateUser(id, { status });
    });
    setSelectedUserIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to permanently delete and archive the ${selectedUserIds.length} selected user profiles?`)) {
      selectedUserIds.forEach(id => deleteUser(id));
      setSelectedUserIds([]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col font-sans">
      
      {/* Table Action Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, employee ID, username..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 w-full text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 shadow-sm"
              id="search-users-input"
            />
          </div>

          {/* Quick Stats Grid inside control header */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">Filter Status:</span>
            {['All', 'Active', 'Suspended', 'Locked', 'Pending'].map((stKey) => {
              const count = stKey === 'All' ? users.length : users.filter(u => u.status === stKey).length;
              const isActive = statusFilter === stKey;
              return (
                <button
                  key={stKey}
                  onClick={() => { setStatusFilter(stKey); setCurrentPage(1); }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border shrink-0",
                    isActive 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 shadow-sm"
                  )}
                >
                  {stKey} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Extended drop-down filters */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/50 pt-3">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Global Role:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-1 px-3 focus:outline-none shadow-sm"
            id="role-filter-select"
          >
            <option value="All">All Global Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Project Context:</span>
          </div>

          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg py-1 px-3 focus:outline-none shadow-sm"
            id="project-filter-select"
          >
            <option value="All">All Projects</option>
            <option value="proj-1">Skyline Residence Towers</option>
            <option value="proj-2">Industrial Park Development</option>
            <option value="proj-3">NEOM Highway Extension</option>
            <option value="proj-4">Jeddah Coastal Villas</option>
            <option value="proj-5">Qiddiya Theme Park Grid</option>
          </select>

          {/* Selected Bulk Actions Ribbon */}
          {selectedUserIds.length > 0 && (
            <div className="ml-auto bg-primary-50 border border-primary-200 rounded-lg px-3 py-1 flex items-center gap-2 text-xs text-primary-700 font-bold shrink-0 animate-fade-in">
              <span>{selectedUserIds.length} Selected</span>
              <span className="text-primary-300">|</span>
              <button onClick={() => handleBulkStatusChange('Active')} className="hover:underline flex items-center gap-1 cursor-pointer">
                <CheckCircle size={12} /> Activate
              </button>
              <button onClick={() => handleBulkStatusChange('Suspended')} className="hover:underline flex items-center gap-1 text-amber-700 cursor-pointer">
                <ShieldX size={12} /> Suspend
              </button>
              <button onClick={handleBulkDelete} className="hover:underline flex items-center gap-1 text-rose-700 cursor-pointer">
                <UserMinus size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Grid Workspace */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.id))}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </th>
              
              <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  User Profile
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>

              <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('email')}>
                <div className="flex items-center gap-1">
                  Enterprise Email
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>

              <th className="px-5 py-3">Global (Fallback) Role</th>
              
              <th className="px-5 py-3">Assigned Workspaces</th>
              
              <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>

              <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('lastLogin')}>
                <div className="flex items-center gap-1">
                  Last Login
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>

              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-600">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => {
                const userFullName = `${user.firstName} ${user.lastName}`;
                const matchedRoleObj = roles.find(r => r.id === user.globalRoleId);
                const projectsCount = user.projectAccess.length;
                const isSelected = selectedUserIds.includes(user.id);

                return (
                  <tr 
                    key={user.id} 
                    className={cn(
                      "hover:bg-slate-50/70 transition-colors group",
                      isSelected ? "bg-primary-50/20" : ""
                    )}
                  >
                    {/* Checkbox Selector */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>

                    {/* Avatar & Ident */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-[13px] shadow-inner uppercase",
                          user.avatarColor
                        )}>
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 
                            className="font-bold text-zentrix-blue hover:text-primary-600 cursor-pointer truncate"
                            onClick={() => onViewDetails(user.id)}
                            title={userFullName}
                          >
                            {userFullName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate tracking-wide uppercase mt-0.5" title={user.designation}>
                            {user.designation}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span className="text-[10px] text-slate-400 font-mono select-all">@{user.username}</span>
                      </div>
                    </td>

                    {/* Global Role */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                        {matchedRoleObj ? matchedRoleObj.name : 'Unknown Role'}
                      </span>
                    </td>

                    {/* Projects Counts */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zentrix-blue bg-indigo-50 border border-indigo-150 rounded-md w-6 h-5.5 flex items-center justify-center shrink-0">
                          {projectsCount}
                        </span>
                        <span className="text-[11.5px] text-slate-400 font-bold">Project{projectsCount !== 1 ? 's' : ''}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold tracking-wide uppercase flex items-center gap-1 w-fit border shadow-inner",
                        user.status === 'Active' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
                        user.status === 'Suspended' && "bg-amber-500/10 text-amber-600 border-amber-500/10",
                        user.status === 'Locked' && "bg-rose-500/10 text-rose-600 border-rose-500/10",
                        user.status === 'Pending' && "bg-slate-500/10 text-slate-500 border-slate-300"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full inline-block",
                          user.status === 'Active' && "bg-emerald-500",
                          user.status === 'Suspended' && "bg-amber-500",
                          user.status === 'Locked' && "bg-rose-500",
                          user.status === 'Pending' && "bg-slate-400"
                        )} />
                        {user.status}
                      </span>
                    </td>

                    {/* Last Login timestamps */}
                    <td className="px-5 py-3.5 font-medium text-slate-500 whitespace-nowrap">
                      {user.lastLogin === '—' ? '—' : new Date(user.lastLogin).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Active Controls */}
                    <td className="px-5 py-3.5 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onViewDetails(user.id)}
                          className="p-1 px-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-500 hover:text-black transition-all cursor-pointer"
                          title="View Tabbed Profile"
                        >
                          <Eye size={14} />
                        </button>
                        
                        <button 
                          onClick={() => onEditUser(user.id)}
                          className="p-1 px-1.5 bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 rounded text-slate-500 transition-all cursor-pointer"
                          title="Edit User Basics"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Inline Dropdown Trigger */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            className="p-1.5 rounded hover:bg-slate-200/50 text-slate-500 cursor-pointer"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {openMenuId === user.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-7 w-[165px] bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex flex-col text-left font-sans animate-slide-up">
                                <button
                                  onClick={() => {
                                    if(confirm('Reset credentials? Sends email password-policy reset trigger.')){
                                      updateUser(user.id, { status: 'Active', failedLoginAttempts: 0 });
                                      alert('Credential dispatch trigger reset successfully.');
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="px-3.5 py-1.5 hover:bg-slate-50 text-left text-xs text-slate-600 flex items-center gap-1 w-full"
                                >
                                  <RotateCcw size={12} /> Reset Password
                                </button>
                                
                                {user.status === 'Active' ? (
                                  <button
                                    onClick={() => { updateUser(user.id, { status: 'Suspended' }); setOpenMenuId(null); }}
                                    className="px-3.5 py-1.5 hover:bg-slate-50 text-left text-xs text-amber-600 font-semibold flex items-center gap-1 w-full"
                                  >
                                    <ShieldX size={12} /> Suspend User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { updateUser(user.id, { status: 'Active', failedLoginAttempts: 0 }); setOpenMenuId(null); }}
                                    className="px-3.5 py-1.5 hover:bg-slate-50 text-left text-xs text-emerald-600 font-semibold flex items-center gap-1 w-full"
                                  >
                                    <Unlock size={12} /> Unlock / Activate
                                  </button>
                                )}

                                <button
                                  onClick={() => { deleteUser(user.id); setOpenMenuId(null); }}
                                  className="px-3.5 py-1.5 hover:bg-red-50 text-left text-xs text-rose-600 font-semibold flex items-center gap-1 w-full border-t border-slate-100 mt-1"
                                >
                                  <UserMinus size={12} /> Archive / Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                  <SlidersHorizontal size={24} className="mx-auto text-slate-300 mb-2.5" />
                  No identities match your current search and parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50">
          <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} employee accounts</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 px-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs",
                  currentPage === i + 1 
                    ? "bg-slate-900 text-white border border-slate-900" 
                    : "border border-slate-200 hover:bg-slate-100 cursor-pointer"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 px-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
