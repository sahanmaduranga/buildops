import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.tsx';
import { ProjectCalendarEvent } from '../types.ts';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProjectCalendar = () => {
  const { currentProject, projectEvents, addProjectEvent } = useProject();
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  // Add Event Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('2026-05-20');
  const [type, setType] = useState<ProjectCalendarEvent['type']>('Inspection');

  if (!currentProject) {
    return (
      <div className="bg-white border border-zentrix-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
        <Calendar size={48} className="text-slate-300 mb-2" />
        <h4 className="text-md font-bold text-zentrix-blue">No Workspace Active</h4>
        <p className="text-slate-400 text-xs">Please select an active project to view calendar timelines.</p>
      </div>
    );
  }

  const events = projectEvents.filter(e => e.projectId === currentProject.id);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addProjectEvent({
      projectId: currentProject.id,
      title,
      description: desc,
      startDate: `${date}T08:00:00Z`,
      endDate: `${date}T10:00:00Z`,
      type
    });

    setTitle('');
    setDesc('');
    setIsOpenAddModal(false);
  };

  const getEventBadgeClass = (t: ProjectCalendarEvent['type']) => {
    switch (t) {
      case 'Milestone':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Inspection':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Delivery':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Meeting':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Review':
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  // Days of May 2026 grid calculation
  // May 1st 2026 starts on a Friday
  const startOffsetDays = 5; // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5
  const mayDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const calendarCells = [...Array(startOffsetDays).fill(null), ...mayDays];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in text-[13px] text-slate-600">
      
      {/* Monthly Interactive Calendar Grid */}
      <div className="lg:col-span-2 bg-white border border-zentrix-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-md text-zentrix-blue">May 2026</h3>
            <p className="text-[11px] text-slate-400">All scheduled site events and material delivery channels</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-1 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 leading-none cursor-pointer" onClick={() => setIsOpenAddModal(true)}>
              <Plus size={14} /> Schedule Action
            </button>
          </div>
        </div>

        {/* Week Days Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days Grid cells */}
        <div className="grid grid-cols-7 gap-1.5 mt-2">
          {calendarCells.map((day, idx) => {
            const hasEvents = day ? events.filter(e => {
              const eDate = new Date(e.startDate);
              return eDate.getFullYear() === 2026 && eDate.getMonth() === 4 && eDate.getDate() === day;
            }) : [];

            const isToday = day === 20; // 2026-05-20 from metadata

            return (
              <div 
                key={idx} 
                className={`min-h-[75px] border border-slate-100 rounded-lg p-1.5 flex flex-col justify-between transition-all relative ${day ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/50 opacity-40'} ${isToday ? 'bg-primary-50/40 border-primary-300' : ''}`}
              >
                {day && (
                  <span className={`text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center ${isToday ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500'}`}>
                    {day}
                  </span>
                )}

                {/* mini dot indicator */}
                {day && hasEvents.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 text-[9px] overflow-hidden max-h-[45px]">
                    {hasEvents.map(e => (
                      <div key={e.id} className={`truncate px-1 py-0.5 rounded border leading-none font-bold scale-[0.95] translate-y-[-2px] ${getEventBadgeClass(e.type)}`} title={`${e.title}: ${e.description}`}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events detail list */}
      <div className="flex flex-col gap-4">
        <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 font-mono">May Timeline Feed</h4>
        
        <div className="bg-white border border-zentrix-border rounded-xl p-4.5 shadow-sm flex flex-col gap-4 max-h-[450px] overflow-y-auto">
          {events.map((e) => (
            <div 
              key={e.id}
              className="border-l-4 border-primary-500 bg-slate-50 rounded-r-xl p-3.5 flex flex-col gap-2 relative shadow-inner"
            >
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded ${getEventBadgeClass(e.type)}`}>
                  {e.type}
                </span>
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                  {e.startDate.split('T')[0]}
                </span>
              </div>

              <h4 className="font-bold text-zentrix-blue">{e.title}</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {e.description}
              </p>

              <div className="flex items-center gap-3 text-[10px] text-slate-400 border-t border-dashed border-slate-200/50 pt-2 mt-1">
                <div className="flex items-center gap-1 font-bold">
                  <Clock size={11} /> {e.startDate.split('T')[1].substring(0, 5)}
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={11} /> Project Scope ID
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <p className="text-center py-6 text-slate-400">No scheduled events found for May.</p>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {isOpenAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-zentrix-border animate-fade-in text-[13px] text-slate-600">
            <div className="px-5 py-4 bg-slate-50 border-b border-zentrix-border flex items-center justify-between">
              <h3 className="font-bold text-zentrix-blue">Schedule Action Event</h3>
              <button onClick={() => setIsOpenAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Event Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Concrete Pour Tier 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Event Scope Details</label>
                <textarea 
                  rows={2}
                  placeholder="Notes, inspect checklists or instructions..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Scheduled Date</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Action Type</label>
                  <select 
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3.5 py-2 border border-zentrix-border rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="Inspection">Consultant Joint Inspection</option>
                    <option value="Milestone">SOT Milestone Pour/Lock</option>
                    <option value="Delivery">Material Cargo Delivery</option>
                    <option value="Meeting">Weekly Coordination Meeting</option>
                    <option value="Review">Design & RFI Review</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <CheckCircle2 size={15} /> Save Scheduled Action
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
