import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Maximize2, 
  Download, 
  Layers, 
  Image as ImageIcon,
  MoreVertical,
  ChevronRight,
  Clock,
  CheckCircle2,
  Columns,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.ts';
import { useProgress } from '../../context/ProgressContext.tsx';

export const SitePhotos = () => {
  const { photos, addPhoto } = useProgress();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newPhoto, setNewPhoto] = useState({
    caption: '',
    location: 'Sector 4, Block A',
    uploadedBy: 'Robert Site Inspector',
    url: 'https://images.unsplash.com/photo-1541913055814-26ee277559c1?q=80&w=2670&auto=format&fit=crop'
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    addPhoto({
      ...newPhoto,
      id: `img-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      tags: ['Execution', 'Civil']
    });
    setIsModalOpen(false);
    setNewPhoto({
      caption: '',
      location: 'Sector 4, Block A',
      uploadedBy: 'Robert Site Inspector',
      url: 'https://images.unsplash.com/photo-1541913055814-26ee277559c1?q=80&w=2670&auto=format&fit=crop'
    });
  };

  const filteredPhotos = photos.filter(p => 
    (p.caption?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (p.location?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Execution Gallery</h2>
          <p className="text-[13px] text-slate-500 font-medium">Visual site documentation and photographic progress evidence</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-[13px] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/20 active:scale-95"
           >
              <Camera size={18} />
              Upload Site Photos
           </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex gap-2">
           <div className="relative w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Search by task, location or tag..." 
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/10 placeholder:text-slate-400 font-medium"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50">
              <Filter size={14} /> Filters
           </button>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 bg-primary-50 text-primary-600 rounded-lg flex items-center gap-2 text-[12px] font-black">
              <ImageIcon size={16} /> Grid View
           </button>
           <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-[12px] font-black">
              <Clock size={16} /> Timeline
           </button>
           <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-[12px] font-black">
              <Columns size={16} /> B/A Comparison
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredPhotos.map((photo) => (
            <motion.div 
               key={photo.id}
               layout
               className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all"
            >
               <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <img 
                    src={photo.url} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-80" 
                    alt={photo.caption} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <div className="flex gap-2">
                        <button className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-md text-white transition-all">
                           <Maximize2 size={16} />
                        </button>
                        <button className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-md text-white transition-all">
                           <Download size={16} />
                        </button>
                     </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur shadow-sm px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-slate-900">
                     BLOCK {photo.location.split(',')[1] || 'GENERAL'}
                  </div>
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex flex-col">
                     <p className="text-[13px] font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">{photo.caption}</p>
                     <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        <MapPin size={10} className="text-primary-500" />
                        {photo.location}
                     </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[9px] border border-slate-200">
                           {photo.uploadedBy.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{photo.uploadedBy}</span>
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </motion.div>
         ))}

         {/* Empty State / Add Photo placeholder */}
         <div 
           onClick={() => setIsModalOpen(true)}
           className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 aspect-[4/3] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-white hover:border-primary-300 transition-all font-black text-slate-400 uppercase tracking-widest leading-tight hover:text-slate-600"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all mb-4">
              <ImageIcon size={24} />
            </div>
            <span>Upload site activity photo</span>
         </div>
      </div>

      {/* Upload Photo Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 p-2 rounded-lg text-white">
                    <Camera size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Upload Progress Photo</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Site Documentation Engine</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption / Description</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    placeholder="e.g. Ground floor slab rebar inspection"
                    value={newPhoto.caption}
                    onChange={e => setNewPhoto({...newPhoto, caption: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    placeholder="e.g. Area 4, Block A"
                    value={newPhoto.location}
                    onChange={e => setNewPhoto({...newPhoto, location: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL (Mock)</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                    value={newPhoto.url}
                    onChange={e => setNewPhoto({...newPhoto, url: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-black hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-xl text-[13px] font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95 uppercase tracking-widest"
                  >
                    Post Gallery
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

