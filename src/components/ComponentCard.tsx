import React from 'react';
import { 
  Play, 
  Package, 
  AlertTriangle, 
  Factory,
  AlertOctagon,
  Archive,
  Flame,
  Droplets,
  Layers,
  BellRing,
  ChevronDown,
  ChevronUp,
  Trash2,
  Box,
  Cpu,
  CheckCircle,
  ThermometerSun,
  Timer,
  Clock,
  Calendar
} from 'lucide-react';
import { getStatusConfig, getFutureTimestampDisplay } from '../lib/utils';
import { ComponentData } from '../types';

interface ComponentCardProps {
  key?: any;
  comp: ComponentData;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDeleteRequest: (id: any) => void;
  actions: any;
}

export default function ComponentCard({
  comp,
  isExpanded,
  onToggleExpand,
  onDeleteRequest,
  actions
}: ComponentCardProps) {
  const statusCfg = getStatusConfig(comp.status);
  
  const bakeProgress = Math.min(100, (comp.targetTime > 0 ? (comp.elapsedTime / comp.targetTime) * 100 : 0));
  const floorRemainingHours = Math.max(0, comp.floorLifeTotal - comp.floorLifeElapsed);
  const floorRemainingPercent = Math.max(0, (floorRemainingHours / comp.floorLifeTotal) * 100);
  const shelfRemainingHours = Math.max(0, comp.shelfLifeTotal - comp.shelfLifeElapsed);
  const shelfRemainingPercent = Math.max(0, (shelfRemainingHours / comp.shelfLifeTotal) * 100);
  
  const isErrorComponent = comp.status === 'EXPIRED' || comp.status === 'EXPIRED_IN_DRY_CABINET' || comp.status === 'EXPIRED_SOLDER' || (comp.status === 'COMPLETED' && comp.overtime > 0);
  const isBakingFinished = comp.elapsedTime >= comp.targetTime;
  const isConsumed = comp.status === 'CONSUMED';

  const getStatusColor = (hoursRemaining: number, warningThreshold: number) => {
    if (isErrorComponent || hoursRemaining <= 0) return 'text-red-600 font-black';
    if (hoursRemaining <= warningThreshold) return 'text-orange-600 font-extrabold';
    return 'text-emerald-700 font-extrabold';
  };

  const renderTime = (remainingHours: number, startTimeMs: number | null | undefined, prefix: string) => {
    if (startTimeMs) return `${prefix}: ${getFutureTimestampDisplay(remainingHours)}`;
    return `Kalan: ${Number(remainingHours).toFixed(2)} Saat (Beklemede)`;
  };

  return (
    <div className={`rounded-xl border-l-4 shadow-sm transition-all duration-300 ${isConsumed ? 'bg-slate-50 border-l-slate-300 opacity-60 grayscale' : statusCfg.color.split(' ')[1]} ${isErrorComponent ? 'border-l-[6px] border-red-500 shadow-red-100 shadow-md ring-1 ring-red-100' : ''} ${isExpanded ? 'ring-2 ring-blue-300' : ''}`}>
      <div 
        className={`p-4 flex items-center justify-between transition-colors ${isExpanded ? 'border-b border-slate-100 bg-slate-50/50' : ''} cursor-pointer hover:bg-slate-50`}
        onClick={() => onToggleExpand(comp.id)}
      >
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {isErrorComponent && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
            {comp.name}
            {comp.bakeCount >= 2 && (
              <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1" title="Çoklu Kürleme Uyarısı">
                <Flame className="w-3 h-3"/> {comp.bakeCount} Kez Kürlendi
              </span>
            )}
          </h3>
          {!isExpanded && (
            <div className="flex items-center gap-2 mt-1">
              {comp.isSolder ? (
                <>
                  <span className="text-xs text-slate-500 font-medium">{comp.solderModel} ({comp.solderType})</span>
                  <span className="text-slate-300">•</span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${isErrorComponent ? 'text-red-600' : (comp.status === 'IN_PRODUCTION' && !comp.isReady ? 'text-amber-600' : 'text-slate-600')}`}>
                    {comp.status === 'IN_PRODUCTION' && !comp.isReady ? <><Timer className="w-3 h-3" /> {renderTime(comp.targetTime! - comp.elapsedTime!, comp.bakeStartTimeMs, 'Hazır Olacağı Zaman')}</> : 
                     comp.status === 'IN_PRODUCTION' && comp.isReady ? <><Clock className="w-3 h-3" /> {renderTime(floorRemainingHours, comp.floorLifeStartTimeMs, 'Son Kullanım')}</> :
                     <><Calendar className="w-3 h-3" /> SKT: {comp.expiryDate}</>}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-500 font-medium">MSL {comp.msl}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${isErrorComponent ? 'text-red-600' : (comp.status === 'BAKING' ? 'text-amber-600' : 'text-slate-600')}`}>
                    {comp.status === 'BAKING' ? <><Timer className="w-3 h-3" /> {renderTime(comp.targetTime! - comp.elapsedTime!, comp.bakeStartTimeMs, 'Fırından Çıkış Zamanı')}</> : 
                     comp.status === 'PACKAGED' ? <><Calendar className="w-3 h-3" /> {renderTime(shelfRemainingHours, comp.shelfLifeStartTimeMs, 'MBB SKT')}</> : 
                     (comp.status === 'DRY_CABINET' || comp.status === 'EXPIRED_IN_DRY_CABINET') ? <><Archive className="w-3 h-3" /> Nem Dolabında (Donduruldu)</> :
                     <><Clock className="w-3 h-3" /> {renderTime(floorRemainingHours, comp.floorLifeStartTimeMs, 'Ömür Dolum Zamanı')}</>}
                  </span>
                </>
              )}
              {comp.overtime > 0 && comp.status === 'COMPLETED' && (
                <span className="text-xs font-black text-red-600 ml-2">(+{Number(comp.overtime).toFixed(2)} S Fazla Bekleme!)</span>
              )}
              {(comp.status === 'EXPIRED' || comp.status === 'EXPIRED_IN_DRY_CABINET' || comp.status === 'EXPIRED_SOLDER') && (
                <span className="text-xs font-black text-red-600 ml-2 pl-2 border-l border-red-200">(Ömür Bitti!)</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${statusCfg.color}`}>
            {statusCfg.icon} <span className="hidden sm:inline">{statusCfg.label}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteRequest(comp.id); }}
            className={`p-2 transition rounded-lg ${(comp.status === 'IN_PRODUCTION' || comp.status.includes('EXPIRED')) && !isConsumed ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-300 opacity-50 cursor-not-allowed'}`}
            title={comp.status === 'IN_PRODUCTION' || comp.status.includes('EXPIRED') ? "Tüketime Çıkar / Sil" : "Silinemez"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="text-slate-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-white rounded-b-xl animate-in slide-in-from-top-2 fade-in duration-200">
          
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-slate-500">
            {isConsumed ? (
              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-300 font-bold">
                TÜKETİLDİ: {comp.consumedAt}
              </span>
            ) : comp.isSolder ? (
              <>
                <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded border border-rose-200">Model: {comp.solderModel}</span>
                <span className="bg-slate-100 px-2 py-1 rounded border">Tip: {comp.solderType}</span>
                <span className="bg-slate-100 px-2 py-1 rounded border text-red-600 font-bold">SKT: {comp.expiryDate}</span>
                {comp.returnCount && comp.returnCount > 0 ? (
                   <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">1 Kez Dolaba Geri Döndü</span>
                ) : (
                   <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">Hala Dolaba Dönüş Hakkı Var</span>
                )}
              </>
            ) : (
              <>
                <span className="bg-slate-100 px-2 py-1 rounded border">MSL {comp.msl}</span>
                <span className="bg-slate-100 px-2 py-1 rounded border">{comp.thickness} mm Kalınlık</span>
                {comp.status === 'PACKAGED' ? (
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">Toplam Raf Ömrü: 1 Yıl (8760 S)</span>
                ) : (
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">Toplam Taban Ömrü: {Number(comp.floorLifeTotal).toFixed(2)} Saat</span>
                )}
              </>
            )}
          </div>

          {comp.status === 'COMPLETED' && comp.overtime > 0 && (
            <div className="bg-red-600 text-white p-3 rounded-lg flex items-center justify-between animate-pulse mb-4 shadow-md border border-red-800">
              <div className="flex items-center gap-3">
                <BellRing className="w-8 h-8 animate-bounce text-yellow-300" />
                <div>
                  <span className="block font-black text-lg tracking-wider">DİKKAT: FIRINDAN ALIN!</span>
                  <span className="block text-xs text-red-100">Fazla kürleme (Overbake) riski oluşuyor.</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-black text-2xl drop-shadow-md">+{Number(comp.overtime).toFixed(2)} S</span>
                <span className="block text-[10px] uppercase font-bold text-red-200">Fazla Bekleme</span>
              </div>
            </div>
          )}
          
          {comp.status === 'IN_PRODUCTION' && comp.isSolder && comp.isReady && (
            <div className="bg-green-600 text-white p-3 rounded-lg flex items-center justify-between mb-4 shadow-md border border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <div>
                  <span className="block font-black text-lg tracking-wider">KULLANIMA HAZIR!</span>
                  <span className="block text-xs text-green-100">Warm-up süreci tamamlandı, lehimleme yapılabilir.</span>
                </div>
              </div>
            </div>
          )}

          {comp.status === 'IN_PRODUCTION' && comp.isSolder && !comp.isReady && (
            <div className="bg-amber-500 text-white p-3 rounded-lg flex items-center justify-between mb-4 shadow-md border border-amber-600">
              <div className="flex items-center gap-3">
                <ThermometerSun className="w-8 h-8 text-white animate-spin-slow" />
                <div>
                  <span className="block font-black text-lg tracking-wider">ISINIYOR (WARM-UP)</span>
                  <span className="block text-xs text-amber-50">Lütfen {Number(comp.targetTime).toFixed(2)} saatlik ısınma süresini bekleyin.</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-black text-2xl">{Number(comp.elapsedTime).toFixed(2)} / {Number(comp.targetTime).toFixed(2)} S</span>
              </div>
            </div>
          )}

          {comp.status === 'EXPIRED_SOLDER' && (
            <div className="bg-red-600 text-white p-3 rounded-lg flex items-center justify-between mb-4 shadow-md border border-red-800">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-8 h-8 text-white" />
                <div>
                  <span className="block font-black text-lg tracking-wider">ÖMRÜ DOLDU / SKT GEÇTİ!</span>
                  <span className="block text-xs text-red-100">Bu lehimin kullanımı yasaktır. Atık kutusuna ayırın.</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            {comp.isSolder ? (
              <div>
                {comp.status === 'IN_PRODUCTION' ? (
                   <div className={`flex flex-col gap-3 p-4 rounded-xl border-2 ${!comp.isReady ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                     <div className="flex items-center gap-3">
                       {!comp.isReady ? <Timer className="w-6 h-6 text-amber-600" /> : <Clock className="w-6 h-6 text-rose-600" />}
                       <div className="flex-1">
                         <div className="flex justify-between items-end mb-1">
                           <span className="block text-xs uppercase tracking-wider font-bold opacity-70">{!comp.isReady ? 'Isınma Aşamasında' : 'Üretimde (Dış Ortam)'}</span>
                           <span className="font-bold text-xs">{!comp.isReady ? `${bakeProgress.toFixed(1)}%` : `${floorRemainingPercent.toFixed(1)}%`} ({!comp.isReady ? Number(comp.elapsedTime).toFixed(2) + '/' + Number(comp.targetTime).toFixed(2) : Number(comp.floorLifeElapsed).toFixed(2) + '/' + Number(comp.floorLifeTotal).toFixed(2)} S)</span>
                         </div>
                         <span className={`block font-black text-lg ${!comp.isReady ? getStatusColor(comp.targetTime! - comp.elapsedTime!, 1) : getStatusColor(floorRemainingHours, 1)}`}>
                            {!comp.isReady ? renderTime(comp.targetTime! - comp.elapsedTime!, comp.bakeStartTimeMs, 'Kullanıma Hazır Olacağı Zaman') : renderTime(floorRemainingHours, comp.floorLifeStartTimeMs, 'Son Kullanım')}
                         </span>
                       </div>
                     </div>
                     <div className="w-full bg-slate-200/60 rounded-full h-2">
                       <div className={`h-2 rounded-full transition-all duration-1000 ${!comp.isReady ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${!comp.isReady ? bakeProgress : floorRemainingPercent}%` }}></div>
                     </div>
                   </div>
                ) : (
                  <div className="text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border-2 border-slate-200/60 text-center italic flex items-center justify-center gap-2">
                    <Archive className="w-5 h-5" /> Lehim dolap içerisinde koruma altındadır.
                  </div>
                )}
              </div>
            ) : comp.status === 'PACKAGED' ? (
              <div className="flex flex-col gap-3 p-4 rounded-xl border-2 bg-blue-50 border-blue-200 text-blue-800">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-1">
                       <span className="block text-xs uppercase tracking-wider font-bold opacity-70">Raf Ömrü Devam Ediyor</span>
                       <span className="font-bold text-xs">{shelfRemainingPercent.toFixed(1)}% ({Number(comp.shelfLifeElapsed).toFixed(2)}/{Number(comp.shelfLifeTotal).toFixed(2)} S)</span>
                     </div>
                     <span className={`block font-black text-lg ${getStatusColor(shelfRemainingHours, 168)}`}>{renderTime(shelfRemainingHours, comp.shelfLifeStartTimeMs, 'MBB SKT')}</span>
                  </div>
                </div>
                <div className="w-full bg-blue-200/50 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${shelfRemainingPercent < 20 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${shelfRemainingPercent}%` }}></div>
                </div>
              </div>
            ) : ['IN_PRODUCTION', 'EXPIRED', 'DRY_CABINET', 'EXPIRED_IN_DRY_CABINET'].includes(comp.status) ? (
              <div className={`flex flex-col gap-3 p-4 rounded-xl border-2 ${isErrorComponent ? 'bg-red-50 border-red-300 text-red-900 shadow-sm shadow-red-100' : comp.status === 'DRY_CABINET' ? 'bg-cyan-50 border-cyan-300 text-cyan-900' : 'bg-purple-50 border-purple-300 text-purple-900'}`}>
                <div className="flex items-center gap-3">
                  {isErrorComponent ? <AlertTriangle className="w-6 h-6 text-red-600" /> : (comp.status === 'DRY_CABINET' ? <Archive className="w-6 h-6 text-cyan-600" /> : <Clock className="w-6 h-6 text-purple-600" />)}
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-1">
                       <span className="block text-xs uppercase tracking-wider font-bold opacity-70">Taban Ömrü Süreci</span>
                       <span className="font-bold text-xs">{floorRemainingPercent.toFixed(1)}% ({Number(comp.floorLifeElapsed).toFixed(2)}/{Number(comp.floorLifeTotal).toFixed(2)} S)</span>
                     </div>
                     <span className={`block py-0.5 font-black text-lg flex items-center gap-2 ${getStatusColor(floorRemainingHours, 4)}`}>
                        {renderTime(floorRemainingHours, comp.floorLifeStartTimeMs, 'Ömür Dolum Zamanı')}
                        {comp.status === 'DRY_CABINET' && <span className="text-[10px] bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-300 font-extrabold ml-1 text-cyan-800 tracking-wider">DONDURULDU</span>}
                     </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${(comp.status === 'EXPIRED' || comp.status === 'EXPIRED_IN_DRY_CABINET') ? 'bg-red-500' : floorRemainingPercent < 20 ? 'bg-amber-500' : (comp.status === 'DRY_CABINET' || comp.status === 'EXPIRED_IN_DRY_CABINET') ? 'bg-cyan-500' : 'bg-purple-500'}`} style={{ width: `${floorRemainingPercent}%` }}></div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col gap-3 p-4 rounded-xl border-2 ${comp.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-orange-50 border-orange-300 text-orange-900'}`}>
                <div className="flex items-center gap-3">
                  {comp.status === 'COMPLETED' ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <Timer className="w-6 h-6 text-orange-600" />}
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-1">
                       <span className="block text-xs uppercase tracking-wider font-bold opacity-70">Kürleme (Fırınlama) Süreci</span>
                       <span className="font-bold text-xs">{bakeProgress.toFixed(1)}% ({Number(comp.elapsedTime).toFixed(2)}/{Number(comp.targetTime).toFixed(2)} S)</span>
                     </div>
                     <span className={`block font-black text-lg ${getStatusColor(comp.targetTime! - comp.elapsedTime!, 1)}`}>
                        {renderTime(comp.targetTime! - comp.elapsedTime!, comp.bakeStartTimeMs, 'Fırından Çıkış Zamanı')}
                     </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${comp.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${bakeProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            
            {comp.isSolder && (comp.status === 'SOLDER' || comp.status === 'EXPIRED_SOLDER') && (
              <>
                {comp.status !== 'EXPIRED_SOLDER' && (
                  <button onClick={() => actions.handleSolderProductionRequest(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white text-sm rounded hover:bg-rose-600 transition shadow-sm">
                    <Factory className="w-4 h-4" /> Üretime Al (Isınma Başlat)
                  </button>
                )}
              </>
            )}

            {comp.isSolder && comp.status === 'IN_PRODUCTION' && (
               <>
                  {(comp.returnCount || 0) < 1 ? (
                    <button onClick={() => actions.handleReturnToSolderCabinet(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                      <Archive className="w-4 h-4" /> Dolaba Geri Koy (1 Hak)
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-sm rounded border border-slate-200 cursor-not-allowed">
                      <Archive className="w-4 h-4 inline mr-1" /> Dolaba Dönüş Hakkı Bitti
                    </span>
                  )}
               </>
            )}

            {!comp.isSolder && comp.status === 'EXPIRED_IN_DRY_CABINET' && (
              <>
                <button onClick={() => actions.handleRebakeRequest(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition shadow-sm">
                  <Play className="w-4 h-4" /> Yeniden Kürlemeye Al
                </button>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-sm rounded border border-slate-200 cursor-not-allowed" title="Ömrü bitmiş ürün üretime alınamaz!">
                  <Factory className="w-4 h-4 inline mr-1" /> Üretime Alınamaz (Önce Kürleyin)
                </span>
              </>
            )}

            {!comp.isSolder && comp.status === 'EXPIRED' && (
              <>
                <button onClick={() => actions.handleRebakeRequest(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition shadow-sm">
                  <Play className="w-4 h-4" /> Yeniden Kürlemeye Al
                </button>
                <button onClick={() => actions.handleTakeToDryCabinet(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                  <Archive className="w-4 h-4" /> Nem Dolabına Kaldır (Geçici)
                </button>
              </>
            )}
            
            {!comp.isSolder && comp.status === 'IDLE' && (
              <button onClick={() => actions.handleStartBaking(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition shadow-sm">
                <Play className="w-4 h-4" /> Fırınlamayı Başlat
              </button>
            )}

            {!comp.isSolder && comp.status === 'BAKING' && (
              <>
                <button onClick={() => actions.handlePackage(comp.id, 'Kürleme')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition shadow-sm">
                  <Package className="w-4 h-4" /> Duraklat & MBB'ye
                </button>
                <button onClick={() => actions.handleTakeToDryCabinet(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                  <Archive className="w-4 h-4" /> Nem Dolabına Aktar
                </button>
              </>
            )}

            {!comp.isSolder && comp.status === 'COMPLETED' && (
              <>
                <button onClick={() => actions.handleProductionRequest(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition shadow-sm">
                  <Factory className="w-4 h-4" /> Üretime Al
                </button>
                <button onClick={() => actions.handleTakeToDryCabinet(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                  <Archive className="w-4 h-4" /> Nem Dolabına Aktar
                </button>
                <button onClick={() => actions.handlePackage(comp.id, 'Kürleme Sonrası')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition shadow-sm">
                  <Package className="w-4 h-4" /> Paketle (Rafa Kaldır)
                </button>
              </>
            )}

            {!comp.isSolder && comp.status === 'IN_PRODUCTION' && (
              <>
                <button onClick={() => actions.handleTakeToDryCabinet(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                  <Archive className="w-4 h-4" /> Nem Dolabına Koy
                </button>
                <button onClick={() => actions.handlePackage(comp.id, 'Üretim')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition shadow-sm">
                  <Package className="w-4 h-4" /> Paketle (Rafa Kaldır)
                </button>
              </>
            )}

            {!comp.isSolder && comp.status === 'DRY_CABINET' && (
              <>
                {isBakingFinished ? (
                  <button onClick={() => actions.handleProductionRequest(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition shadow-sm">
                    <Factory className="w-4 h-4" /> Üretime Al
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-sm rounded border border-slate-200 cursor-not-allowed" title="Önce kürleme işlemi tamamlanmalıdır!">
                    <Factory className="w-4 h-4 inline mr-1" /> Üretime Alınamaz (Yarım Kürleme)
                  </span>
                )}
                
                {!isBakingFinished && (
                   <button onClick={() => actions.handleResumeBaking(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition shadow-sm">
                     <Play className="w-4 h-4" /> Kürlemeye Devam Et
                   </button>
                )}
                {comp.cabinet === 'uretim-nem' && (
                  <button onClick={() => actions.executeTakeToDryCabinet(comp.id, 'depo-nem')} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-700 text-white text-sm rounded hover:bg-cyan-800 transition shadow-sm">
                    <Archive className="w-4 h-4" /> Depo Nem Dolabına Aktar
                  </button>
                )}
                {comp.cabinet === 'depo-nem' && (
                  <button onClick={() => actions.executeTakeToDryCabinet(comp.id, 'uretim-nem')} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-700 text-white text-sm rounded hover:bg-cyan-800 transition shadow-sm">
                    <Droplets className="w-4 h-4" /> Üretim Nem Dolabına Aktar
                  </button>
                )}
                <button onClick={() => actions.handlePackage(comp.id, 'Nem Dolabı')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition shadow-sm">
                  <Package className="w-4 h-4" /> Paketle (Rafa Kaldır)
                </button>
              </>
            )}

            {!comp.isSolder && comp.status === 'PACKAGED' && (
              <>
                {comp.cabinet === 'uretim-raf' && (
                  <>
                    <button onClick={() => actions.executeTakeToDryCabinet(comp.id, 'uretim-nem')} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                      <Box className="w-4 h-4" /> Ambalaj Aç (Nem Dolabına Al)
                    </button>
                    <button onClick={() => actions.handleTransferToDepoRaf(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition shadow-sm">
                      <Layers className="w-4 h-4" /> Depo Raf'a Gönder
                    </button>
                  </>
                )}
                {comp.cabinet === 'depo-raf' && (
                  <>
                    <button onClick={() => actions.executeTakeToDryCabinet(comp.id, 'depo-nem')} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition shadow-sm">
                      <Archive className="w-4 h-4" /> Ambalaj Aç (Nem Dolabına Al)
                    </button>
                    <button onClick={() => actions.handleTransferToUretimRaf(comp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition shadow-sm">
                      <Layers className="w-4 h-4" /> Üretim Raf'a Al
                    </button>
                  </>
                )}
              </>
            )}

          </div>
          
          <div className="mt-4 bg-slate-50 p-3 rounded text-xs text-slate-500 border border-slate-100 h-28 overflow-y-auto">
            <strong className="block mb-1 text-slate-700">İşlem Geçmişi:</strong>
            <ul className="space-y-1">
              {comp.history.map((log: string, idx: number) => {
                const isWarning = log.includes('DİKKAT') || log.includes('UYARI');
                const isSuccess = log.includes('KAYIT');
                return (
                  <li key={idx} className={`flex gap-2 ${isWarning ? 'text-red-600 font-medium' : isSuccess ? 'text-green-700 font-medium' : ''}`}>
                    <span className={isWarning ? 'text-red-400' : 'text-slate-400'}>►</span> {log}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
