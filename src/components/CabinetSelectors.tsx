import React from 'react';
import { CabinetType } from '../types';
import { Droplets, Flame, Archive, Cpu, Layers } from 'lucide-react';

export const CABINET_INFO: Record<CabinetType, { title: string, color: string, activeClass: string, icon: any }> = {
  'uretim-nem': { title: 'Üretim Nem Dolabı', color: 'text-cyan-600', activeClass: 'bg-cyan-100 border-cyan-500 shadow-sm ring-1 ring-cyan-500 z-10', icon: Droplets },
  'uretim-kurleme': { title: 'Üretim Kürleme Dolabı', color: 'text-orange-600', activeClass: 'bg-orange-100 border-orange-500 shadow-sm ring-1 ring-orange-500 z-10', icon: Flame },
  'uretim-raf': { title: 'Üretim Raf', color: 'text-teal-600', activeClass: 'bg-teal-100 border-teal-500 shadow-sm ring-1 ring-teal-500 z-10', icon: Layers },
  'depo-nem': { title: 'Depo Nem Dolabı', color: 'text-indigo-600', activeClass: 'bg-indigo-100 border-indigo-500 shadow-sm ring-1 ring-indigo-500 z-10', icon: Archive },
  'depo-raf': { title: 'Depo Raf', color: 'text-emerald-600', activeClass: 'bg-emerald-100 border-emerald-500 shadow-sm ring-1 ring-emerald-500 z-10', icon: Layers },
  'lehim': { title: 'Lehim Dolabı', color: 'text-rose-600', activeClass: 'bg-rose-100 border-rose-500 shadow-sm ring-1 ring-rose-500 z-10', icon: Cpu },
};

interface AreaSelectorProps {
  selectedArea: 'uretim' | 'depo';
  setSelectedArea: (area: 'uretim' | 'depo') => void;
  setSelectedCabinet: (cabinet: CabinetType) => void;
}

export function AreaSelector({ selectedArea, setSelectedArea, setSelectedCabinet }: AreaSelectorProps) {
  return (
    <div className="flex bg-slate-200 p-1 rounded-xl w-fit mb-4">
      <button
        onClick={() => { setSelectedArea('uretim'); setSelectedCabinet('uretim-nem'); }}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
          selectedArea === 'uretim' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Üretim Alanı
      </button>
      <button
        onClick={() => { setSelectedArea('depo'); setSelectedCabinet('depo-nem'); }}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
          selectedArea === 'depo' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Depo Alanı
      </button>
    </div>
  );
}

interface CabinetTabsProps {
  selectedArea: 'uretim' | 'depo';
  selectedCabinet: CabinetType;
  setSelectedCabinet: (cabinet: CabinetType) => void;
}

export function CabinetTabs({ selectedArea, selectedCabinet, setSelectedCabinet }: CabinetTabsProps) {
  return (
    <div className="space-y-4">
      {selectedArea === 'uretim' && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Üretim Alanı Dolapları</h2>
          <div className="flex flex-wrap gap-2 md:gap-0 md:flex-nowrap bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {(['uretim-nem', 'uretim-kurleme', 'uretim-raf', 'lehim'] as CabinetType[]).map((key) => {
              const cab = CABINET_INFO[key];
              const isActive = selectedCabinet === key;
              const Icon = cab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCabinet(key)}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-3 bg-white text-sm font-semibold transition-all border-b-2 md:border-b-0 md:border-r last:border-0 border-transparent md:border-slate-100 rounded-lg md:rounded-none first:rounded-l-lg last:rounded-r-lg ${
                    isActive ? cab.activeClass : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? cab.color : 'text-slate-400'}`} />
                  <span className={isActive ? cab.color : ''}>{cab.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedArea === 'depo' && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Depo Alanı Dolapları</h2>
          <div className="flex flex-wrap gap-2 md:gap-0 md:flex-nowrap bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {(['depo-nem', 'depo-raf'] as CabinetType[]).map((key) => {
              const cab = CABINET_INFO[key];
              const isActive = selectedCabinet === key;
              const Icon = cab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCabinet(key)}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-3 bg-white text-sm font-semibold transition-all border-b-2 md:border-b-0 md:border-r last:border-0 border-transparent md:border-slate-100 rounded-lg md:rounded-none first:rounded-l-lg last:rounded-r-lg ${
                    isActive ? cab.activeClass : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? cab.color : 'text-slate-400'}`} />
                  <span className={isActive ? cab.color : ''}>{cab.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
