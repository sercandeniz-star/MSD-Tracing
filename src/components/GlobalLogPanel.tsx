import React, { useState, useEffect, useMemo } from 'react';
import { ScrollText, ChevronDown, ChevronUp, History, Clock, Search, X } from 'lucide-react';

interface LogEntry {
  id: string;
  name: string;
  text: string;
  time: string;
  sortableTime?: string;
}

interface GlobalLogPanelProps {
  logs: LogEntry[];
}

export default function GlobalLogPanel({ logs }: GlobalLogPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);

  // Memoized filtered and sorted logs
  const allFilteredLogs = React.useMemo(() => {
    let baseLogs = [...logs].sort((a, b) => {
      const timeA = a.sortableTime || a.time;
      const timeB = b.sortableTime || b.time;
      return timeB.localeCompare(timeA);
    });
    if (search.length >= 2) {
      baseLogs = baseLogs.filter(log => log.name.toLowerCase().includes(search.toLowerCase()));
    }
    return baseLogs;
  }, [logs, search]);

  const displayedLogs = allFilteredLogs.slice(0, visibleCount);
  const hasMore = allFilteredLogs.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  // Reset counters when panel closes or search changes
  useEffect(() => {
    if (!isOpen) {
      setVisibleCount(20);
    }
  }, [isOpen]);

  useEffect(() => {
    setVisibleCount(20);
  }, [search]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                <History className="w-4 h-4 text-blue-400" /> Aktivite Geçmişi
              </h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  {search.length >= 2 ? `Sonuç: ${allFilteredLogs.length}` : `Toplam: ${logs.length}`}
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5">Gösterilen: {displayedLogs.length}</span>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Bileşen adına göre ara..."
                className="w-full bg-slate-700/50 border border-slate-600 text-white text-xs rounded-lg py-2 pl-9 pr-8 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {displayedLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                <ScrollText className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">{search ? 'Sonuç bulunamadı' : 'Henüz bir aktivite yok'}</p>
              </div>
            ) : (
              <>
                {displayedLogs.map((entry, idx) => (
                  <div key={`${entry.id}-${idx}`} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-blue-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {entry.time}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {entry.text}
                    </p>
                  </div>
                ))}

                {hasMore && (
                  <button 
                    onClick={handleLoadMore}
                    className="w-full py-3 text-[11px] font-bold text-blue-600 hover:bg-blue-100/50 border border-dashed border-blue-200 rounded-xl transition-all"
                  >
                    Daha Fazla Kayıt Yükle ({allFilteredLogs.length - visibleCount} kayıt kaldı)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${
          isOpen 
            ? 'bg-slate-800 text-white shadow-slate-300' 
            : 'bg-white text-slate-800 border border-slate-200 shadow-slate-200'
        }`}
      >
        <History className={`w-5 h-5 ${isOpen ? 'text-blue-400' : 'text-blue-600'}`} />
        <span className="text-sm">Log Paneli</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
}
