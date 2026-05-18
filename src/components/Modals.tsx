import React from 'react';
import { Trash2, Factory, Flame, AlertTriangle, Archive, Package, ThermometerSun, Plus, X, Cpu } from 'lucide-react';

export function DeleteConfirmModal({ deleteConfirmId, setDeleteConfirmId, executeDelete }: any) {
  if (!deleteConfirmId) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Trash2 className="text-red-600 w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Bileşeni Sil</h2>
        <p className="text-slate-600 text-sm mb-6">Bu malzemeyi ve tüm işlem geçmişini sistemden kalıcı olarak silmek istediğinize emin misiniz?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded hover:bg-slate-200 transition">İptal</button>
          <button onClick={executeDelete} className="flex-1 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition">Evet, Sil</button>
        </div>
      </div>
    </div>
  );
}

export function ProductionWarningModal({ comp, productionWarningId, setProductionWarningId, executeTakeToProduction }: any) {
  if (!productionWarningId) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-200 border-t-4 border-purple-500">
        <div className="p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Factory className="text-purple-600 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Üretime Alma Uyarısı</h2>
          <div className="bg-purple-50 text-purple-800 p-3 rounded text-sm text-center font-medium mb-4">
            DİKKAT: Bu ürün hattan önce {comp?.bakeCount} defa kürlenmiştir.
          </div>
          <p className="text-center text-slate-600 text-sm mb-6">
            {comp?.bakeCount}. defa kürlenen bu ürünü üretime alıyorsunuz. Lehimlenebilirlik (solderability) performansı düşmüş olabilir. İşleme devam etmek istediğinize emin misiniz?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setProductionWarningId(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded hover:bg-slate-200 transition">İptal Et</button>
            <button onClick={() => executeTakeToProduction(productionWarningId)} className="flex-1 py-2 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition">Üretime Al</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RebakeWarningModal({ comp, rebakeWarningId, setRebakeWarningId, handleStartBaking }: any) {
  if (!rebakeWarningId) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-200 border-t-4 border-red-500">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto"><Flame className="text-red-600 w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Çoklu Kürleme Uyarısı</h2>
          <div className="bg-red-50 text-red-800 p-3 rounded text-sm text-center font-medium mb-4">Bu bileşen daha önce {comp?.bakeCount} kez fırınlandı.</div>
          <p className="text-center text-slate-600 text-sm mb-6">Defalarca fırınlamak oksidasyona yol açabilir. Yine de fırınlamayı başlatmak istiyor musunuz?</p>
          <div className="flex gap-3">
            <button onClick={() => setRebakeWarningId(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded hover:bg-slate-200">İptal Et</button>
            <button onClick={() => handleStartBaking(rebakeWarningId)} className="flex-1 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700">Riskleri Kabul Et</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HicCheckModal({ showHicModal, setShowHicModal, processHicDecision }: any) {
  if (!showHicModal) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto"><AlertTriangle className="text-blue-600 w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Ambalajı Aç (HIC Kontrolü)</h2>
          <div className="space-y-3 mt-4">
            <button onClick={() => processHicDecision(true)} className="w-full flex justify-between p-4 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50">
              <div className="text-left"><span className="block font-bold text-blue-700">MAVİ (Güvenli)</span></div>
              <div className="w-6 h-6 rounded-full bg-blue-500"></div>
            </button>
            <button onClick={() => processHicDecision(false)} className="w-full flex justify-between p-4 bg-white border-2 border-pink-500 rounded-lg hover:bg-pink-50">
              <div className="text-left"><span className="block font-bold text-pink-700">PEMBE (İhlal)</span></div>
              <div className="w-6 h-6 rounded-full bg-pink-500"></div>
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
          <button onClick={() => setShowHicModal(null)} className="text-sm font-medium text-slate-500 hover:text-slate-800">İptal Et</button>
        </div>
      </div>
    </div>
  );
}

export function ShelfSelectionModal({ packageSelectionId, setPackageSelectionId, executePackage, components }: any) {
  if (!packageSelectionId) return null;
  const comp = components?.find((c: any) => c.id === packageSelectionId);
  const canGoToDepoRaf = comp?.cabinet?.startsWith('depo') || comp?.cabinet === 'uretim-nem';
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border-t-4 border-emerald-500">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center text-slate-800 mb-4">Raf Seçimi Yapın</h2>
          <p className="text-center text-slate-600 text-sm mb-6">Bileşen hangi rafa kaldırılacak?</p>
          <div className="space-y-3">
            <button 
              onClick={() => executePackage(packageSelectionId, 'uretim-raf')} 
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              Üretim Rafı
            </button>
            {canGoToDepoRaf && (
              <button 
                onClick={() => executePackage(packageSelectionId, 'depo-raf')} 
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                Depo Rafı
              </button>
            )}
            <button 
              onClick={() => setPackageSelectionId(null)} 
              className="w-full py-2 text-slate-500 font-medium hover:text-slate-800 transition"
            >
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DryCabinetSelectionModal({ dryCabinetSelectionId, setDryCabinetSelectionId, executeTakeToDryCabinet }: any) {
  if (!dryCabinetSelectionId) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border-t-4 border-cyan-500">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center text-slate-800 mb-4">Nem Dolabı Seçimi</h2>
          <p className="text-center text-slate-600 text-sm mb-6">Hangi nem dolabına kaldırılacak?</p>
          <div className="space-y-3">
            <button 
              onClick={() => executeTakeToDryCabinet(dryCabinetSelectionId, 'uretim-nem')} 
              className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition"
            >
              Üretim Nem Dolabı
            </button>
            <button 
              onClick={() => executeTakeToDryCabinet(dryCabinetSelectionId, 'depo-nem')} 
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
            >
              Depo Nem Dolabı
            </button>
            <button 
              onClick={() => setDryCabinetSelectionId(null)} 
              className="w-full py-2 text-slate-500 font-medium hover:text-slate-800 transition"
            >
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddComponentModal({
  isOpen,
  onClose,
  newCompName,
  setNewCompName,
  newCompThickness,
  setNewCompThickness,
  newCompMsl,
  setNewCompMsl,
  initialStatus,
  setInitialStatus,
  newCompLocation,
  setNewCompLocation,
  formError,
  handleAddComponent,
  solderType,
  setSolderType,
  solderModel,
  setSolderModel,
  solderExpiry,
  setSolderExpiry
}: any) {
  if (!isOpen) return null;

  const isSolder = initialStatus === 'SOLDER';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" /> Yeni {isSolder ? 'Lehim' : 'Bileşen'} Kaydı
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{isSolder ? 'LOT / Barkod' : 'Bileşen Adı / Barkod'}</label>
                <input 
                  type="text" required 
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all ${formError ? 'border-red-500 focus:ring-red-500 ring-red-100' : 'border-slate-200 focus:ring-blue-500 ring-blue-100'}`} 
                  value={newCompName} 
                  onChange={(e) => setNewCompName(e.target.value)} 
                  placeholder={isSolder ? "Lehim LOT numarasını girin..." : "Barkod okutun veya isim girin..."}
                />
                {formError && <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1"> {formError}</p>}
              </div>

              {!isSolder ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Paket Kalınlığı</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" 
                      value={newCompThickness} 
                      onChange={(e) => setNewCompThickness(e.target.value)}
                    >
                      <option value="<=1.4">≤ 1.4 mm</option>
                      <option value=">1.4_<=2.0">&gt; 1.4 mm - 2.0 mm</option>
                      <option value=">2.0_<=4.5">&gt; 2.0 mm - 4.5 mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">MSL Seviyesi</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" 
                      value={newCompMsl} 
                      onChange={(e) => setNewCompMsl(e.target.value)}
                    >
                      <option value="2">MSL 2</option>
                      <option value="2a">MSL 2a</option>
                      <option value="3">MSL 3</option>
                      <option value="4">MSL 4</option>
                      <option value="5">MSL 5</option>
                      <option value="5a">MSL 5a</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lehim Türü (Otomatik)</label>
                      <input 
                        type="text" 
                        readOnly
                        className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-700 cursor-not-allowed" 
                        value={solderType} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lehim Modeli</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" 
                        value={solderModel} 
                        onChange={(e) => {
                          const model = e.target.value;
                          setSolderModel(model);
                          // Auto set type based on model
                          if (model === 'CVP-390') setSolderType('Kurşunsuz');
                          if (model === 'OM-5100') setSolderType('Kurşunlu');
                        }}
                      >
                        <option value="CVP-390">CVP-390</option>
                        <option value="OM-5100">OM-5100</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Son Kullanma Tarihi</label>
                    <input 
                      type="date" required 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" 
                      value={solderExpiry} 
                      onChange={(e) => setSolderExpiry(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">İşlem ve Lokasyon Seçimi</label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Option 4: Lehim Dolabı (New) */}
                  <div 
                    onClick={() => { setInitialStatus('SOLDER'); setNewCompLocation('lehim'); }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${initialStatus === 'SOLDER' ? 'border-rose-500 bg-rose-50 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${initialStatus === 'SOLDER' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${initialStatus === 'SOLDER' ? 'text-rose-900' : 'text-slate-700'}`}>Lehim Dolabı</p>
                        <p className="text-[11px] text-slate-500 font-medium">Krem lehim saklama ve warm-up takibi.</p>
                      </div>
                    </div>
                  </div>

                  {/* Option 1: Dry Cabinet */}
                  <div 
                    onClick={() => { setInitialStatus('DRY_CABINET'); setNewCompLocation('uretim-nem'); }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${initialStatus === 'DRY_CABINET' ? 'border-cyan-500 bg-cyan-50 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${initialStatus === 'DRY_CABINET' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Archive className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${initialStatus === 'DRY_CABINET' ? 'text-cyan-900' : 'text-slate-700'}`}>Nem Dolabı (Dry Cabinet)</p>
                        <p className="text-[11px] text-slate-500 font-medium">Bileşen korumalı ortamda saklanacak.</p>
                      </div>
                    </div>
                    {initialStatus === 'DRY_CABINET' && (
                      <div className="mt-4 pt-4 border-t border-cyan-100 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setNewCompLocation('uretim-nem'); }}
                          className={`py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${newCompLocation === 'uretim-nem' ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'}`}
                        >
                          Üretim Nem
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setNewCompLocation('depo-nem'); }}
                          className={`py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${newCompLocation === 'depo-nem' ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'}`}
                        >
                          Depo Nem
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Baking */}
                  <div 
                    onClick={() => { setInitialStatus('BAKING'); setNewCompLocation('uretim-kurleme'); }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${initialStatus === 'BAKING' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${initialStatus === 'BAKING' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Flame className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${initialStatus === 'BAKING' ? 'text-orange-900' : 'text-slate-700'}`}>Kürlemeye Başla</p>
                        <p className="text-[11px] text-slate-500 font-medium">Sisteme girer girmez fırınlama başlayacak.</p>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: MBB Packaged */}
                  <div 
                    onClick={() => { setInitialStatus('PACKAGED'); setNewCompLocation('uretim-raf'); }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${initialStatus === 'PACKAGED' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${initialStatus === 'PACKAGED' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${initialStatus === 'PACKAGED' ? 'text-blue-900' : 'text-slate-700'}`}>Vakumlu Paket (MBB)</p>
                        <p className="text-[11px] text-slate-500 font-medium">Raf ömrü takibi için rafa kaldırılacak.</p>
                      </div>
                    </div>
                    {initialStatus === 'PACKAGED' && (
                      <div className="mt-4 pt-4 border-t border-blue-100 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setNewCompLocation('uretim-raf'); }}
                          className={`py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${newCompLocation === 'uretim-raf' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'}`}
                        >
                          Üretim Rafı
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setNewCompLocation('depo-raf'); }}
                          className={`py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${newCompLocation === 'depo-raf' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'}`}
                        >
                          Depo Rafı
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                onClick={handleAddComponent}
                className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-slate-200 transition"
              >
                Kaydı Tamamla
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
