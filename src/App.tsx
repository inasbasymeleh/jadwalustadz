import React, { useState, useEffect, useMemo } from 'react';
import { Home, Calendar, Plus, Archive, User, MapPin, Clock, CheckCircle, Moon, Sun, Upload, Trash2, BookOpen, Edit2, X, Filter, ArrowLeft, List, LayoutGrid, Settings, Mail, CalendarDays, Save } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, query, deleteDoc } from 'firebase/firestore';

// --- Types & Constants ---

type Schedule = {
  id: string;
  category: string;
  masjid: string;
  date: string;
  time: string;
  topic: string;
  status: 'upcoming' | 'completed';
};

type Profile = {
  name: string;
  photo: string | null;
  title?: 'Ustadz' | 'Ustadzah';
};

const DEFAULT_CATEGORIES = [
  { name: 'Kajian Maghrib', defaultTime: '18:15' },
  { name: 'Khutbah Jum\'at', defaultTime: '11:45' },
  { name: 'Kajian Subuh', defaultTime: '05:00' },
  { name: 'Kajian Pagi', defaultTime: '09:00' },
  { name: 'Kajian Sore', defaultTime: '15:30' },
  { name: 'Mengajar', defaultTime: '08:00' },
  { name: 'Undangan', defaultTime: '10:00' },
  { name: '+ Buat baru', defaultTime: '12:00' },
];

// --- Sub-components ---

const HomeTab = ({ profile, theme, toggleTheme, nextSchedule, lastVisit, setActiveTab, handleMarkCompleted, formatDate, agendaBulanIni }: any) => {
  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold-light dark:bg-dark-card border-2 border-gold-primary overflow-hidden flex items-center justify-center">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-gold-primary" size={24} />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assalamu'alaikum,</p>
            <h1 className="text-xl font-bold">{profile.title || 'Ustadz'} {profile.name}</h1>
          </div>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-dark-border text-gold-primary">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div>
        <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-1">
          {todayDate}
        </p>
        <p className="text-gray-500 dark:text-gray-400 italic text-xs">
          "Semoga hari Anda penuh keberkahan dan kemudahan dalam berdakwah."
        </p>
      </div>

      {/* Next Schedule Card */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-lg font-bold">Jadwal Terdekat</h2>
          <button onClick={() => setActiveTab('schedule')} className="text-xs font-bold bg-gold-light dark:bg-dark-border text-gold-primary px-3 py-1.5 rounded-full hover:bg-gold-primary hover:text-white transition-colors flex items-center gap-1">
            Lihat Semua <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>
        
        {nextSchedule ? (
          <div 
            onClick={() => setActiveTab('schedule')}
            className="card-primary-timbul relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          >
            {/* Bokeh Background Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 dark:bg-gold-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute top-20 -right-5 w-24 h-24 bg-white/10 dark:bg-gold-primary/5 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 right-10 w-32 h-32 bg-white/15 dark:bg-gold-primary/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold tracking-wider uppercase">
                {nextSchedule.category || 'Kajian'}
              </span>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Clock size={16} />
                <span>{nextSchedule.time}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2 relative z-10">{nextSchedule.masjid}</h3>
            
            <div className="flex items-center gap-2 text-white/90 mb-4 relative z-10">
              <BookOpen size={18} />
              <span className="font-medium">{nextSchedule.topic}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm relative z-10 mb-6">
              <Calendar size={16} />
              <span>{formatDate(nextSchedule.date)}</span>
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); handleMarkCompleted(nextSchedule.id); }} className="w-full bg-white dark:bg-dark-border text-gold-primary hover:bg-gray-50 dark:hover:bg-gray-700 font-bold py-3 rounded-xl shadow-[0_4px_0_rgba(255,255,255,0.5)] dark:shadow-[0_4px_0_var(--color-dark-shadow)] active:shadow-[0_0px_0_rgba(255,255,255,0.5)] dark:active:shadow-[0_0px_0_var(--color-dark-shadow)] active:translate-y-1 transition-all relative z-10">
              Tandai Selesai
            </button>
          </div>
        ) : (
          <div className="card-timbul text-center py-8">
            <div className="w-16 h-16 bg-gold-light dark:bg-dark-border text-gold-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Belum ada jadwal mendatang.</p>
            <button onClick={() => setActiveTab('add')} className="mt-4 text-gold-primary font-semibold">Tambah Jadwal</button>
          </div>
        )}
      </div>

      {/* Last Visit Info */}
      {nextSchedule && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Clock size={20} className="text-gold-primary" />
            Kunjungan Terakhir
          </h2>
          {lastVisit ? (
            <div className="card-timbul border-l-4 border-l-gold-primary">
              <p className="text-xs text-gold-primary font-bold uppercase tracking-wider mb-1">Topik Sebelumnya</p>
              <h4 className="font-bold text-lg mb-2">{lastVisit.topic}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Disampaikan pada {formatDate(lastVisit.date)} di {lastVisit.masjid}.
              </p>
              <div className="bg-gold-light dark:bg-dark-border p-3 rounded-lg text-sm italic text-gray-700 dark:text-gray-300 flex gap-2">
                <CheckCircle size={16} className="text-gold-primary shrink-0 mt-0.5" />
                <span>Materi ini sudah selesai dibahas. Anda bisa melanjutkan ke materi berikutnya.</span>
              </div>
            </div>
          ) : (
            <div className="card-timbul">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Belum ada riwayat <span className="font-semibold text-gray-700 dark:text-gray-200">{nextSchedule.category || 'Kajian'}</span> di <span className="font-semibold text-gray-700 dark:text-gray-200">{nextSchedule.masjid}</span> yang tersimpan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Box */}
      <div 
        onClick={() => setActiveTab('schedule')}
        className="card-timbul flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Agenda Bulan Ini</p>
          <h3 className="text-3xl font-bold text-gold-primary mt-1">{agendaBulanIni}</h3>
        </div>
        <div className="w-12 h-12 bg-gold-light dark:bg-dark-border rounded-full flex items-center justify-center text-gold-primary">
          <Calendar size={24} />
        </div>
      </div>
    </div>
  );
};

const ScheduleForm = ({ initialData, uniqueMasjids, completedSchedules, allCategories, onSave, onAddCategory, onCancel }: any) => {
  const [category, setCategory] = useState(initialData?.category || allCategories[0].name);
  const [masjid, setMasjid] = useState(initialData?.masjid || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || allCategories[0].defaultTime);
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredMasjids = uniqueMasjids.filter((m: string) => m.toLowerCase().includes(masjid.toLowerCase()) && m !== masjid);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setCategory(newCat);
    if (newCat === '+ Buat baru') {
      setShowNewCategoryInput(true);
    } else {
      setShowNewCategoryInput(false);
      // Smart Default: Auto-fill time based on category if not editing
      if (!initialData) {
        const catObj = allCategories.find((c: any) => c.name === newCat);
        if (catObj) setTime(catObj.defaultTime);
        
        // Smart Suggestion: Auto-fill topic based on last visit for this category and masjid
        if (masjid) {
          const last = completedSchedules.find((s: Schedule) => s.masjid.toLowerCase() === masjid.toLowerCase() && s.category === newCat);
          if (last) {
            setTopic(`Lanjutan: ${last.topic}`);
          }
        }
      }
    }
  };

  const handleMasjidSelect = (selectedMasjid: string) => {
    setMasjid(selectedMasjid);
    setShowSuggestions(false);
    // Smart Suggestion: Auto-fill topic based on last visit if not editing
    if (!initialData) {
      const last = completedSchedules.find((s: Schedule) => s.masjid.toLowerCase() === selectedMasjid.toLowerCase() && s.category === category);
      if (last) {
        setTopic(`Lanjutan: ${last.topic}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCategory = category;
    if (category === '+ Buat baru' && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      if (onAddCategory) {
        onAddCategory({ name: finalCategory, defaultTime: time });
      }
    }
    onSave({ category: finalCategory, masjid, date, time, topic });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{initialData ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
        {onCancel && (
          <button onClick={onCancel} className="p-2 bg-gray-100 dark:bg-dark-card rounded-full text-gray-500">
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="card-timbul">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1">Kategori Agenda</label>
            <select 
              value={category} onChange={handleCategoryChange}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none appearance-none"
            >
              {allCategories.map((c: any) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            {showNewCategoryInput && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <input
                  type="text" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
                  placeholder="Tulis nama kategori baru..."
                />
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Nama Masjid / Lokasi</label>
            <input 
              type="text" required value={masjid} 
              onChange={e => { setMasjid(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
              placeholder="Contoh: Masjid Al-Ikhlas"
            />
            {showSuggestions && filteredMasjids.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl mt-1 shadow-lg max-h-40 overflow-y-auto">
                {filteredMasjids.map((m: string) => (
                  <li key={m} onClick={() => handleMasjidSelect(m)} className="p-3 hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer">
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input 
                type="date" required value={date} onChange={e => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jam</label>
              <input 
                type="time" required value={time} onChange={e => setTime(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Judul Materi</label>
            <input 
              type="text" required value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
              placeholder="Contoh: Fiqih Muamalah"
            />
          </div>

          <button type="submit" className="w-full btn-timbul mt-6">Simpan Jadwal</button>
        </form>
      </div>
    </div>
  );
};

const ScheduleTab = ({ upcomingSchedules, formatDate, handleMarkCompleted, handleDelete, onEdit, setActiveTab }: any) => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Group by month
  const groupedSchedules = useMemo(() => {
    const groups: { month: string, schedules: Schedule[] }[] = [];
    upcomingSchedules.forEach((s: Schedule) => {
      const date = new Date(s.date);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      let group = groups.find(g => g.month === monthYear);
      if (!group) {
        group = { month: monthYear, schedules: [] };
        groups.push(group);
      }
      group.schedules.push(s);
    });
    return groups;
  }, [upcomingSchedules]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Jadwal Mendatang</h2>
        </div>
        <button onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')} className="p-2 rounded-xl bg-white dark:bg-dark-card shadow-sm text-gold-primary border border-gray-100 dark:border-dark-border transition-colors">
          {viewMode === 'card' ? <List size={20} /> : <LayoutGrid size={20} />}
        </button>
      </div>
      {groupedSchedules.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Tidak ada jadwal mendatang.</div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm animate-in fade-in">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-400 border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-gray-50 dark:bg-dark-bg z-10 shadow-[1px_0_0_#e5e7eb] dark:shadow-[1px_0_0_#1A2421]">Hari, Tanggal</th>
                <th className="px-4 py-3">Masjid</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSchedules.map((s: Schedule) => {
                const dateObj = new Date(s.date);
                const hari = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                const tgl = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                return (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-white dark:bg-dark-card z-10 shadow-[1px_0_0_#e5e7eb] dark:shadow-[1px_0_0_#1A2421]">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{hari}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{tgl}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div>{s.masjid}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{s.topic}</div>
                    </td>
                    <td className="px-4 py-3 text-gold-primary text-xs font-bold uppercase">{s.category}</td>
                    <td className="px-4 py-3 font-medium">{s.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleMarkCompleted(s.id)} className="p-1.5 bg-gold-light dark:bg-dark-border text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition-colors" title="Tandai Selesai"><CheckCircle size={16} /></button>
                        <button onClick={() => onEdit(s)} className="p-1.5 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in">
          {groupedSchedules.map(group => (
            <div key={group.month}>
              <h3 className="font-bold text-gray-500 dark:text-gray-400 mb-3 sticky top-[-20px] mx-[-20px] px-5 bg-[#FAFAFA] dark:bg-dark-bg py-3 z-10 border-b border-gray-200 dark:border-dark-border shadow-sm flex items-center gap-2">
                <button onClick={() => setActiveTab('home')} className="p-1 -ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-card transition-colors">
                  <ArrowLeft size={16} />
                </button>
                {group.month}
              </h3>
              <div className="space-y-4">
                {group.schedules.map((s: Schedule) => (
                  <div key={s.id} className="card-timbul flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-primary mb-1 block">
                          {s.category || 'Kajian'}
                        </span>
                        <h3 className="font-bold text-lg leading-tight">{s.masjid}</h3>
                      </div>
                      <span className="text-xs font-semibold bg-gold-light dark:bg-dark-border text-gold-primary px-2 py-1 rounded-md shrink-0 ml-2">
                        {s.time}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <BookOpen size={14} className="shrink-0" /> <span className="truncate">{s.topic}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <Calendar size={14} className="shrink-0" /> {formatDate(s.date)}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => handleMarkCompleted(s.id)} className="flex-1 bg-gold-primary text-white py-2 rounded-lg font-medium shadow-[0_3px_0_var(--color-gold-dark)] active:shadow-[0_0px_0_var(--color-gold-dark)] active:translate-y-1 transition-all text-sm">
                        Selesai
                      </button>
                      <button onClick={() => onEdit(s)} className="p-2 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 rounded-lg shadow-[0_3px_0_#e5e7eb] dark:shadow-[0_3px_0_#1A2421] active:shadow-[0_0px_0_#e5e7eb] active:translate-y-1 transition-all">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg shadow-[0_3px_0_#fca5a5] dark:shadow-[0_3px_0_#7f1d1d] active:shadow-[0_0px_0_#fca5a5] active:translate-y-1 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ArchiveTab = ({ completedSchedules, formatDate, handleDelete, onEdit, uniqueMasjids, allCategories }: any) => {
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterMasjid, setFilterMasjid] = useState('Semua');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const uniqueMonths = useMemo(() => {
    const months = completedSchedules.map((s: Schedule) => {
      const d = new Date(s.date);
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    });
    return Array.from(new Set(months));
  }, [completedSchedules]);

  const filteredSchedules = useMemo(() => {
    return completedSchedules.filter((s: Schedule) => {
      const matchCategory = filterCategory === 'Semua' || s.category === filterCategory;
      const matchMasjid = filterMasjid === 'Semua' || s.masjid === filterMasjid;
      const sMonth = new Date(s.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const matchMonth = filterMonth === 'Semua' || sMonth === filterMonth;
      return matchCategory && matchMasjid && matchMonth;
    });
  }, [completedSchedules, filterCategory, filterMonth, filterMasjid]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Arsip Materi</h2>
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')} className="p-2 rounded-xl bg-white dark:bg-dark-card shadow-sm text-gold-primary border border-gray-100 dark:border-dark-border transition-colors">
            {viewMode === 'card' ? <List size={20} /> : <LayoutGrid size={20} />}
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl ${showFilters ? 'bg-gold-primary text-white' : 'bg-white dark:bg-dark-card text-gold-primary'} shadow-sm border border-gray-100 dark:border-dark-border transition-colors`}>
            <Filter size={20} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card-timbul space-y-3 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Kategori</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-bg outline-none">
              <option value="Semua">Semua Kategori</option>
              {allCategories.filter((c: any) => c.name !== '+ Buat baru').map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Bulan</label>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-bg outline-none">
              <option value="Semua">Semua Bulan</option>
              {uniqueMonths.map((m: any) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Masjid</label>
            <select value={filterMasjid} onChange={e => setFilterMasjid(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-bg outline-none">
              <option value="Semua">Semua Masjid</option>
              {uniqueMasjids.map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      )}

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Tidak ada arsip yang sesuai.</div>
      ) : viewMode === 'table' ? (
        <div className="card-timbul overflow-hidden p-0 animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-dark-border text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="p-3 font-bold sticky left-0 bg-gray-50 dark:bg-dark-border z-10 shadow-[1px_0_0_#e5e7eb] dark:shadow-[1px_0_0_#1A2421]">Tanggal</th>
                  <th className="p-3 font-bold">Masjid</th>
                  <th className="p-3 font-bold">Kategori</th>
                  <th className="p-3 font-bold">Materi</th>
                  <th className="p-3 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {filteredSchedules.map((s: Schedule) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                    <td className="p-3 sticky left-0 bg-white dark:bg-dark-card z-10 shadow-[1px_0_0_#e5e7eb] dark:shadow-[1px_0_0_#1A2421]">
                      {formatDate(s.date)}
                    </td>
                    <td className="p-3 font-medium">{s.masjid}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-primary bg-gold-light dark:bg-dark-border px-2 py-1 rounded-md">
                        {s.category || 'Kajian'}
                      </span>
                    </td>
                    <td className="p-3 truncate max-w-[150px]">{s.topic}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onEdit(s)} className="p-1.5 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 rounded-lg hover:text-gold-primary transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:text-red-700 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((s: Schedule) => (
            <div key={s.id} className="card-timbul opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-primary mb-1 block">
                    {s.category || 'Kajian'}
                  </span>
                  <h3 className="font-bold text-lg leading-tight">{s.masjid}</h3>
                </div>
                <div className="flex gap-2 ml-2 shrink-0">
                  <button onClick={() => onEdit(s)} className="text-gray-400 hover:text-gold-primary">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                <BookOpen size={14} className="shrink-0" /> <span className="truncate">{s.topic}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500 shrink-0" /> Selesai pada {formatDate(s.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileTab = ({ profile, setProfile, theme, toggleTheme, onLogout, currentUser, categories, updateFirestore }: any) => {
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatTime, setEditCatTime] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCategory = (index: number) => {
    if (!editCatName.trim()) return;
    const newCategories = [...categories];
    newCategories[index] = { name: editCatName, defaultTime: editCatTime || '12:00' };
    updateFirestore({ categories: newCategories });
    setEditingCategory(null);
  };

  const deleteCategory = (index: number) => {
    const newCategories = categories.filter((_: any, i: number) => i !== index);
    updateFirestore({ categories: newCategories });
  };

  const addCategory = () => {
    if (editCatName.trim()) {
      const newCategories = [...categories, { name: editCatName, defaultTime: editCatTime || '12:00' }];
      updateFirestore({ categories: newCategories });
      setShowAddCategory(false);
      setEditCatName('');
      setEditCatTime('');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-6">Profil & Pengaturan</h2>
      
      <div className="card-timbul flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gold-light dark:bg-dark-border border-4 border-gold-primary overflow-hidden flex items-center justify-center">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-gold-primary" size={40} />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-gold-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Upload size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        
        <div className="w-full text-left space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Gelar</label>
              <select 
                value={profile.title || 'Ustadz'} 
                onChange={e => setProfile({ ...profile, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none appearance-none"
              >
                <option value="Ustadz">Ustadz</option>
                <option value="Ustadzah">Ustadzah</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Panggilan</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-gold-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Akun Info */}
      <div className="card-timbul space-y-4">
        <h3 className="font-bold mb-2 flex items-center gap-2"><User size={18} className="text-gold-primary"/> Informasi Akun</h3>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
          <div className="w-10 h-10 rounded-full bg-gold-light dark:bg-dark-border flex items-center justify-center text-gold-primary shrink-0">
            <Mail size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email Terdaftar</p>
            <p className="font-semibold truncate">{currentUser?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
          <div className="w-10 h-10 rounded-full bg-gold-light dark:bg-dark-border flex items-center justify-center text-gold-primary shrink-0">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bergabung Sejak</p>
            <p className="font-semibold">{currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
          </div>
        </div>
      </div>

      {/* Pengaturan Kategori */}
      <div className="card-timbul space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold flex items-center gap-2"><Settings size={18} className="text-gold-primary"/> Kelola Kategori</h3>
          <button onClick={() => {
            setShowAddCategory(true);
            setEditCatName('');
            setEditCatTime('12:00');
            setEditingCategory(null);
          }} className="text-xs font-bold text-gold-primary bg-gold-light dark:bg-dark-border px-3 py-1.5 rounded-lg hover:bg-gold-primary hover:text-white transition-colors">
            + Tambah
          </button>
        </div>
        
        <div className="space-y-2">
          {showAddCategory && (
            <div className="flex gap-2 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gold-primary animate-in fade-in">
              <div className="flex-1 space-y-2">
                <input type="text" placeholder="Nama Kategori" value={editCatName} onChange={e => setEditCatName(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-card outline-none" />
                <input type="time" value={editCatTime} onChange={e => setEditCatTime(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-card outline-none" />
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={addCategory} className="p-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark"><Save size={16} /></button>
                <button onClick={() => setShowAddCategory(false)} className="p-2 bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-300 rounded-lg"><X size={16} /></button>
              </div>
            </div>
          )}

          {categories.map((cat: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
              {editingCategory === index ? (
                <div className="flex gap-2 w-full animate-in fade-in">
                  <div className="flex-1 space-y-2">
                    <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-card outline-none" />
                    <input type="time" value={editCatTime} onChange={e => setEditCatTime(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-card outline-none" />
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => saveCategory(index)} className="p-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark"><Save size={16} /></button>
                    <button onClick={() => setEditingCategory(null)} className="p-2 bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-300 rounded-lg"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jam Default: {cat.defaultTime}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => {
                      setEditingCategory(index);
                      setEditCatName(cat.name);
                      setEditCatTime(cat.defaultTime);
                      setShowAddCategory(false);
                    }} className="p-1.5 text-gray-400 hover:text-gold-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteCategory(index)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card-timbul space-y-4">
        <h3 className="font-bold mb-2">Preferensi</h3>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border">
          <span className="font-medium">Mode Gelap</span>
          <button 
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-gold-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full py-3 mt-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { currentUser, logout } = useAuth();
  
  // --- State ---
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [profile, setProfile] = useState<Profile>({ name: 'Ustadz', photo: null, title: 'Ustadz' });
  const [categories, setCategories] = useState<{name: string, defaultTime: string}[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('jadwal_ustadz_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'add' | 'archive' | 'profile'>('home');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<{show: boolean, data: any, conflictMasjid: string} | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data.profile || { name: currentUser.displayName || 'Ustadz', photo: currentUser.photoURL || null, title: 'Ustadz' });
        
        const dbCategories = data.categories || data.customCategories || [];
        if (dbCategories.length === 0 && !data.categoriesInitialized) {
          const initial = DEFAULT_CATEGORIES.filter(c => c.name !== '+ Buat baru');
          setCategories(initial);
          setDoc(userDocRef, { categories: initial, categoriesInitialized: true }, { merge: true });
        } else {
          setCategories(dbCategories);
        }
        
        setSchedules(data.schedules || []);
      } else {
        // Initialize document if it doesn't exist
        const initialCategories = DEFAULT_CATEGORIES.filter(c => c.name !== '+ Buat baru');
        setDoc(userDocRef, {
          profile: { name: currentUser.displayName || 'Ustadz', photo: currentUser.photoURL || null, title: 'Ustadz' },
          categories: initialCategories,
          categoriesInitialized: true,
          schedules: []
        });
      }
      setLoadingData(false);
    }, (error) => {
      console.error("Firestore Error: ", error);
      setLoadingData(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('jadwal_ustadz_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Derived State ---
  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter(s => s.status === 'upcoming')
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [schedules]);

  const completedSchedules = useMemo(() => {
    return schedules
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  }, [schedules]);

  const nextSchedule = upcomingSchedules[0];

  const lastVisit = useMemo(() => {
    if (!nextSchedule) return null;
    return completedSchedules.find(s => s.masjid.toLowerCase() === nextSchedule.masjid.toLowerCase() && s.category === nextSchedule.category);
  }, [nextSchedule, completedSchedules]);

  const uniqueMasjids = useMemo(() => {
    const masjids = schedules.map(s => s.masjid);
    return Array.from(new Set(masjids));
  }, [schedules]);

  const agendaBulanIni = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return schedules.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [schedules]);

  const allCategories = useMemo(() => {
    return [...categories, { name: '+ Buat baru', defaultTime: '12:00' }];
  }, [categories]);

  // --- Handlers ---
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const updateFirestore = async (dataToUpdate: any) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userDocRef, dataToUpdate, { merge: true });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleProfileUpdate = (newProfile: Profile) => {
    updateFirestore({ profile: newProfile });
  };

  const handleAddCategory = (newCat: {name: string, defaultTime: string}) => {
    if (!categories.find(c => c.name === newCat.name)) {
      const updatedCategories = [...categories, newCat];
      updateFirestore({ categories: updatedCategories });
    }
  };

  const handleSaveSchedule = (data: Omit<Schedule, 'id' | 'status'>) => {
    // Check for conflict
    const isConflict = schedules.some(s => s.date === data.date && s.time === data.time && s.id !== editingSchedule?.id && s.status === 'upcoming');
    
    if (isConflict) {
      const conflictSchedule = schedules.find(s => s.date === data.date && s.time === data.time && s.id !== editingSchedule?.id && s.status === 'upcoming');
      setConflictWarning({ show: true, data, conflictMasjid: conflictSchedule?.masjid || '' });
      return;
    }
    
    proceedSaveSchedule(data);
  };

  const proceedSaveSchedule = (data: Omit<Schedule, 'id' | 'status'>) => {
    if (editingSchedule) {
      const updatedSchedules = schedules.map(s => s.id === editingSchedule.id ? { ...s, ...data } : s);
      updateFirestore({ schedules: updatedSchedules });
      setEditingSchedule(null);
    } else {
      const schedule: Schedule = {
        ...data,
        id: Date.now().toString(),
        status: 'upcoming',
      };
      const updatedSchedules = [...schedules, schedule];
      updateFirestore({ schedules: updatedSchedules });
      setActiveTab('schedule');
    }
    setConflictWarning(null);
  };

  const handleMarkCompleted = (id: string) => {
    const updatedSchedules = schedules.map(s => s.id === id ? { ...s, status: 'completed' } : s);
    updateFirestore({ schedules: updatedSchedules });
  };

  const handleDelete = (id: string) => {
    setScheduleToDelete(id);
  };

  const confirmDelete = () => {
    if (scheduleToDelete) {
      const updatedSchedules = schedules.filter(s => s.id !== scheduleToDelete);
      updateFirestore({ schedules: updatedSchedules });
      setScheduleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setScheduleToDelete(null);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-dark-bg flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-dark-bg font-sans flex justify-center">
      <div className="w-full max-w-md h-[100dvh] relative shadow-2xl bg-[#FAFAFA] dark:bg-dark-bg flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 p-5 overflow-y-auto pb-24 relative">
          {editingSchedule ? (
            <ScheduleForm 
              initialData={editingSchedule} 
              uniqueMasjids={uniqueMasjids} 
              completedSchedules={completedSchedules}
              allCategories={allCategories}
              onSave={handleSaveSchedule} 
              onAddCategory={handleAddCategory}
              onCancel={() => setEditingSchedule(null)} 
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeTab 
                  profile={profile} theme={theme} toggleTheme={toggleTheme} 
                  nextSchedule={nextSchedule} lastVisit={lastVisit} 
                  setActiveTab={setActiveTab} handleMarkCompleted={handleMarkCompleted} 
                  formatDate={formatDate} agendaBulanIni={agendaBulanIni}
                />
              )}
              {activeTab === 'schedule' && (
                <ScheduleTab 
                  upcomingSchedules={upcomingSchedules} formatDate={formatDate} 
                  handleMarkCompleted={handleMarkCompleted} handleDelete={handleDelete} 
                  onEdit={handleEdit} setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'add' && (
                <ScheduleForm 
                  uniqueMasjids={uniqueMasjids} 
                  completedSchedules={completedSchedules}
                  allCategories={allCategories}
                  onSave={handleSaveSchedule} 
                  onAddCategory={handleAddCategory}
                />
              )}
              {activeTab === 'archive' && (
                <ArchiveTab 
                  completedSchedules={completedSchedules} formatDate={formatDate} 
                  handleDelete={handleDelete} onEdit={handleEdit} uniqueMasjids={uniqueMasjids}
                  allCategories={allCategories}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileTab profile={profile} setProfile={handleProfileUpdate} theme={theme} toggleTheme={toggleTheme} onLogout={logout} currentUser={currentUser} categories={categories} updateFirestore={updateFirestore} />
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        {!editingSchedule && (
          <div className="absolute bottom-0 w-full bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border z-50">
            <div className="flex justify-around items-center h-16 relative px-2">
              <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 w-16 ${activeTab === 'home' ? 'text-gold-primary' : 'text-gray-400'}`}>
                <Home size={24} />
                <span className="text-[10px] mt-1 font-medium">HOME</span>
              </button>
              <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center p-2 w-16 ${activeTab === 'schedule' ? 'text-gold-primary' : 'text-gray-400'}`}>
                <Calendar size={24} />
                <span className="text-[10px] mt-1 font-medium">JADWAL</span>
              </button>
              
              {/* FAB for Add */}
              <div className="relative -top-6">
                <button 
                  onClick={() => setActiveTab('add')} 
                  className={`text-white p-4 rounded-full shadow-[0_4px_0_var(--color-gold-dark)] active:shadow-[0_0px_0_var(--color-gold-dark)] active:translate-y-1 transition-all ${activeTab === 'add' ? 'bg-gold-dark' : 'bg-gold-primary'}`}
                >
                  <Plus size={28} />
                </button>
              </div>

              <button onClick={() => setActiveTab('archive')} className={`flex flex-col items-center p-2 w-16 ${activeTab === 'archive' ? 'text-gold-primary' : 'text-gray-400'}`}>
                <Archive size={24} />
                <span className="text-[10px] mt-1 font-medium">ARSIP</span>
              </button>
              <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 w-16 ${activeTab === 'profile' ? 'text-gold-primary' : 'text-gray-400'}`}>
                <User size={24} />
                <span className="text-[10px] mt-1 font-medium">PROFIL</span>
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {scheduleToDelete && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl w-[85%] max-w-sm animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Hapus Jadwal?</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                Jadwal yang dihapus tidak dapat dikembalikan lagi.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={cancelDelete}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white shadow-[0_4px_0_#b91c1c] active:translate-y-1 active:shadow-[0_0px_0_#b91c1c] transition-all"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conflict Warning Modal */}
        {conflictWarning && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl w-[85%] max-w-sm animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center mb-4 mx-auto">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Jadwal Bentrok</h3>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
                {profile.title || 'Ustadz'}, Anda sudah punya jadwal di tanggal dan jam yang sama di <span className="font-bold">{conflictWarning.conflictMasjid}</span>. Tetap lanjutkan?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConflictWarning(null)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300"
                >
                  Batal
                </button>
                <button 
                  onClick={() => proceedSaveSchedule(conflictWarning.data)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gold-primary text-white shadow-[0_4px_0_var(--color-gold-dark)] active:translate-y-1 active:shadow-[0_0px_0_var(--color-gold-dark)] transition-all"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
