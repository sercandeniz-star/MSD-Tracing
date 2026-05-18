import React from 'react';
import { AlertTriangle, FilterX } from 'lucide-react';
import { ComponentData } from '../types';

interface AlertDashboardProps {
  errorComponents: ComponentData[];
  showOnlyErrors: boolean;
  setShowOnlyErrors: (show: boolean) => void;
  setExpandedId: (id: string | null) => void;
}

export default function AlertDashboard({
  errorComponents,
  showOnlyErrors,
  setShowOnlyErrors,
  setExpandedId
}: AlertDashboardProps) {
  return (
    <>
      {errorComponents.length > 0 && !showOnlyErrors && (
        <div 
          onClick={() => { setShowOnlyErrors(true); setExpandedId(null); }}
          className="bg-red-600 text-white p-4 rounded-xl shadow-md border-2 border-red-700 flex items-center justify-between cursor-pointer hover:bg-red-700 transition animate-pulse-slow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-800 p-2 rounded-full">
              <AlertTriangle className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-wide">DİKKAT! MÜDAHALE GEREKİYOR</h3>
              <p className="text-red-100 text-sm mt-0.5 font-medium">
                {errorComponents.length} adet malzemede sorun var (Ömür ihlali veya Fazla Bekleme).
              </p>
            </div>
          </div>
          <div className="bg-white text-red-700 px-4 py-2 rounded-lg font-bold shadow-sm">
            Sorunluları Göster
          </div>
        </div>
      )}

      {showOnlyErrors && (
        <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <FilterX className="w-5 h-5 text-amber-400" />
            <span className="font-medium">Sadece düzeltilmesi gereken (sorunlu) malzemeleri görüyorsunuz.</span>
          </div>
          <button 
            onClick={() => setShowOnlyErrors(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition"
          >
            Tüm Listeyi Göster
          </button>
        </div>
      )}
    </>
  );
}
