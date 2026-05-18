import React from 'react';
import { 
  Package, 
  CheckCircle, 
  ThermometerSun, 
  Factory,
  AlertOctagon,
  Archive,
  Pause,
  Cpu
} from 'lucide-react';
import { ComponentData } from '../types';

export const getTimestamp = () => {
  const now = new Date();
  return `[${now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`;
};

export const getFutureTimestampDisplay = (remainingHours: number) => {
  const futureMs = Date.now() + remainingHours * 3600000;
  const futureDate = new Date(futureMs);
  return futureDate.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + futureDate.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const extractOvertimeLog = (comp: ComponentData) => {
  if (comp.overtime && comp.overtime > 0) return `(Fazla Bekleme: ${Number(comp.overtime).toFixed(2)} Saat)`;
  return '';
};

export const getStatusConfig = (status: string) => {
  switch (status) {
    case 'BAKING': return { color: 'bg-orange-100 border-orange-500 text-orange-700', icon: <ThermometerSun className="w-4 h-4 animate-pulse" />, label: 'Fırında' };
    case 'DRY_CABINET': return { color: 'bg-cyan-100 border-cyan-500 text-cyan-800', icon: <Archive className="w-4 h-4" />, label: 'Nem Dolabında' };
    case 'PACKAGED': return { color: 'bg-blue-50 border-blue-400 text-blue-800', icon: <Package className="w-4 h-4" />, label: 'Paketli' };
    case 'COMPLETED': return { color: 'bg-green-100 border-green-500 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Kürleme Bitti' };
    case 'IN_PRODUCTION': return { color: 'bg-purple-100 border-purple-500 text-purple-800', icon: <Factory className="w-4 h-4" />, label: 'Üretimde' };
    case 'EXPIRED': return { color: 'bg-red-100 border-red-500 text-red-800', icon: <AlertOctagon className="w-4 h-4 animate-bounce" />, label: 'Süre İhlali!' };
    case 'EXPIRED_IN_DRY_CABINET': return { color: 'bg-red-100 border-red-500 text-red-800', icon: <Archive className="w-4 h-4" />, label: 'Süresi Bitik (Dolapta)!' };
    case 'SOLDER': return { color: 'bg-rose-100 border-rose-500 text-rose-800', icon: <Cpu className="w-4 h-4" />, label: 'Lehim Dolabında' };
    case 'EXPIRED_SOLDER': return { color: 'bg-red-100 border-red-500 text-red-800', icon: <AlertOctagon className="w-4 h-4 animate-bounce" />, label: 'Lehim SKT Geçti!' };
    case 'CONSUMED': return { color: 'bg-slate-100 border-slate-400 text-slate-500', icon: <Archive className="w-4 h-4" />, label: 'Tüketildi' };
    default: return { color: 'bg-gray-100 border-gray-300 text-gray-700', icon: <Pause className="w-4 h-4" />, label: 'Beklemede' };
  }
};
