import React from 'react';
import { ThermometerSun, Info } from 'lucide-react';

interface HeaderProps {
  globalErrorCount: number;
}

export default function Header({ globalErrorCount }: HeaderProps) {
  return (
    <header className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ThermometerSun className="text-orange-500" />
          MSD Üretim Hattı Yönetim Paneli
        </h1>
        <p className="text-sm text-slate-500 mt-1">Akıllı Sıralama, Sorun Tespiti ve Tüketim Takibi</p>
      </div>
      
      <div className="flex items-center gap-3">
        {globalErrorCount > 0 && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-bounce shadow-lg shadow-red-200">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{globalErrorCount} PANEL UYARISI</span>
          </div>
        )}
      </div>
    </header>
  );
}
