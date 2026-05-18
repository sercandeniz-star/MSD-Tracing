import React, { useEffect, useState, useMemo } from 'react';
import { Download, Search, LayoutList, Flame, Package, Clock, Filter, AlertTriangle, FileSpreadsheet, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ComponentData } from '../types';

interface ConsumedHistoryPageProps {
  onBack: () => void;
}

export default function ConsumedHistoryPage({ onBack }: ConsumedHistoryPageProps) {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Tümü' | 'MSD Bileşen' | 'Lehim'>('Tümü');
  const [dateFilter, setDateFilter] = useState<'Bu Ay' | 'Bu Yıl' | 'Tümü'>('Tümü');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedComp, setSelectedComp] = useState<ComponentData | null>(null);

  useEffect(() => {
    fetchConsumed();
  }, []);

  const fetchConsumed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/consumed');
      if (!res.ok) throw new Error('Veriler alınamadı');
      const data = await res.json();
      setComponents(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonthStr = new Date().toLocaleDateString('tr-TR', { month: '2-digit', year: 'numeric' }); // MM.YYYY
  const currentYearStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric' }); // YYYY

  // Filter Logic
  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      // Search Box
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Type Filter
      if (typeFilter === 'Lehim' && !c.isSolder) return false;
      if (typeFilter === 'MSD Bileşen' && c.isSolder) return false;

      // Date Filter
      if (dateFilter !== 'Tümü' && c.consumedAt) {
        // consumedAt is like: [18.05.2026 14:32:10]
        const match = c.consumedAt.match(/^\[(\d{2})\.(\d{2})\.(\d{4})\s+/);
        if (match) {
          const [, dd, mm, yyyy] = match;
          if (dateFilter === 'Bu Ay' && `${mm}.${yyyy}` !== currentMonthStr) return false;
          if (dateFilter === 'Bu Yıl' && yyyy !== currentYearStr) return false;
        } else {
            return false; // could not parse date
        }
      }

      return true;
    });
  }, [components, searchTerm, typeFilter, dateFilter, currentMonthStr, currentYearStr]);

  const paginatedComponents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComponents.slice(start, start + itemsPerPage);
  }, [filteredComponents, currentPage]);

  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage);

  // Stats
  const totalConsumed = components.length;
  const totalMsd = components.filter(c => !c.isSolder).length;
  const totalSolder = components.filter(c => c.isSolder).length;
  const thisMonthConsumed = components.filter(c => {
    if (!c.consumedAt) return false;
    const match = c.consumedAt.match(/^\[(\d{2})\.(\d{2})\.(\d{4})\s+/);
    if (!match) return false;
    return `${match[2]}.${match[3]}` === currentMonthStr;
  }).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium tracking-wide">Geçmiş veriler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center max-w-lg mx-auto mt-10 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Bağlantı Hatası</h3>
        <p className="text-red-600/80 mb-4">{error}</p>
        <button onClick={fetchConsumed} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">Tekrar Dene</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Toplam Tüketilen</div>
          <div className="text-3xl font-black text-slate-800">{totalConsumed}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">MSD Bileşen</div>
          <div className="text-3xl font-black text-blue-600">{totalMsd}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Lehim</div>
          <div className="text-3xl font-black text-emerald-600">{totalSolder}</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Bu Ay Tüketilen</div>
          <div className="text-3xl font-black text-purple-600">{thisMonthConsumed}</div>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Barkod veya isim ara..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-lg self-stretch w-full md:w-auto">
            {(['Tümü', 'MSD Bileşen', 'Lehim'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setCurrentPage(1); }}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  typeFilter === type 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-lg self-stretch w-full md:w-auto">
            {(['Tümü', 'Bu Ay', 'Bu Yıl'] as const).map(date => (
              <button
                key={date}
                onClick={() => { setDateFilter(date); setCurrentPage(1); }}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  dateFilter === date 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        <a 
          href="/api/consumed/export-csv" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full xl:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold transition-colors"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>CSV İndir</span>
        </a>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredComponents.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Bu kriterlere uygun tüketim kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Barkod / İsİm</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tİp</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">MSL</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kürleme</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tüketİm Tarİhİ</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComponents.map((c, i) => (
                  <tr key={c.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} border-b border-slate-100 hover:bg-blue-50/30 transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${c.isSolder ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {c.isSolder ? 'LEHİM' : 'MSD'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-600">
                        {c.isSolder ? `${c.solderType || ''} / ${c.solderModel || ''}` : `${c.thickness || 'N/A'}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-600">{c.isSolder ? '-' : (c.msl || 'N/A')}</span>
                    </td>
                    <td className="p-4">
                      {!c.isSolder && c.bakeCount > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded ${c.bakeCount >= 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                          {c.bakeCount}
                          {c.bakeCount >= 2 && <Flame className="w-3.5 h-3.5" />}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {c.consumedAt || '-'}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedComp(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Detay"
                      >
                        <LayoutList className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>
          
          <div className="text-sm font-bold text-slate-500">
            Sayfa <span className="text-slate-800">{currentPage}</span> / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedComp && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  {selectedComp.name}
                </h2>
                <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider flex items-center gap-2">
                  {selectedComp.isSolder ? 'Lehim Pastası' : 'MSD Bileşen'}
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  Tüketim: {selectedComp.consumedAt}
                </div>
              </div>
              <button 
                onClick={() => setSelectedComp(null)}
                className="w-8 h-8 flex flex-col items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">MSL</div>
                  <div className="font-bold text-slate-800">{selectedComp.isSolder ? '-' : (selectedComp.msl || 'N/A')}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">{selectedComp.isSolder ? "Tip / Model" : "Kalınlık"}</div>
                  <div className="font-bold text-slate-800">{selectedComp.isSolder ? `${selectedComp.solderType}/${selectedComp.solderModel}` : (selectedComp.thickness || 'N/A')}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Fırınlama</div>
                  <div className="font-bold text-slate-800">{selectedComp.bakeCount || '0'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Son Durum</div>
                  <div className="font-bold text-emerald-600">TÜKETİLDİ</div>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-slate-400" />
                İşlem Geçmişi
              </h3>
              
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {[...selectedComp.history].reverse().map((log, index) => {
                  const match = log.match(/^\[(.*?)\]\s*(.*)$/);
                  const isWarning = log.toLowerCase().includes('dikkat') || log.toLowerCase().includes('hata');
                  
                  return (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${isWarning ? 'bg-red-500' : 'bg-blue-500'}`}>
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:bg-slate-100 hover:shadow-md m-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">
                            {match ? match[1] : ''}
                          </span>
                          <span className={`text-sm font-medium ${isWarning ? 'text-red-700' : 'text-slate-700'}`}>
                            {match ? match[2] : log}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
