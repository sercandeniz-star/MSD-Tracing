import React from 'react';
import { CheckSquare, LogOut } from 'lucide-react';

export function ConsumeComponentForm({
  consumeCompName,
  setConsumeCompName,
  consumeError,
  consumeSuccess,
  handleConsumeComponent
}: any) {
  return (
    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-sm">
      <h2 className="text-lg font-semibold text-emerald-800 mb-2 flex items-center gap-2">
        <CheckSquare className="w-5 h-5" /> Tüketim (Çıkış) İşlemi
      </h2>
      <p className="text-xs text-emerald-700 mb-4 font-medium">
        Kullanımı tamamlanan ve hattan çekilen bileşeni listeden düşmek için adını veya barkodunu girin.
      </p>
      
      <form onSubmit={handleConsumeComponent} className="space-y-3">
        <div>
          <div className="relative w-full">
            <LogOut className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 w-4 h-4" />
            <input 
              type="text" 
              className={`w-full pl-9 pr-4 py-2 border rounded focus:ring-2 focus:outline-none text-sm ${consumeError ? 'border-red-500 focus:ring-red-500' : 'border-emerald-300 focus:ring-emerald-500'}`} 
              placeholder="Barkod Okut veya Yaz..."
              value={consumeCompName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setConsumeCompName(e.target.value)}
            />
          </div>
          {consumeError && <p className="text-red-500 text-xs mt-1 font-medium">{consumeError}</p>}
          {consumeSuccess && <p className="text-emerald-600 text-xs mt-1 font-bold">{consumeSuccess}</p>}
        </div>
        
        <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition text-sm flex items-center justify-center gap-2">
          Sistemden Düş (Tüketildi)
        </button>
      </form>
    </div>
  );
}
