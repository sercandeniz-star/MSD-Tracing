import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { ComponentData, CabinetType } from '../types';
import { BAKE_TABLE_60C, FLOOR_LIFE_HOURS, SHELF_LIFE_HOURS } from '../constants';
import { getTimestamp } from '../lib/utils';

export const socket = io();

// Constants must match server logic
const HOUR_MS = 3600000;

export function useMSD() {
  const [serverComponents, setServerComponents] = useState<ComponentData[]>([]);
  const [components, setComponents] = useState<ComponentData[]>([]);
  
  const [selectedCabinet, setSelectedCabinet] = useState<CabinetType>('uretim-nem');
  const [selectedArea, setSelectedArea] = useState<'uretim' | 'depo'>('uretim');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHicModal, setShowHicModal] = useState<string | null>(null);
  const [rebakeWarningId, setRebakeWarningId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [productionWarningId, setProductionWarningId] = useState<string | null>(null);
  const [packageSelectionId, setPackageSelectionId] = useState<string | null>(null);
  const [dryCabinetSelectionId, setDryCabinetSelectionId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [newCompName, setNewCompName] = useState('');
  const [newCompThickness, setNewCompThickness] = useState('<=1.4');
  const [newCompMsl, setNewCompMsl] = useState('3');
  const [initialStatus, setInitialStatus] = useState('DRY_CABINET');
  const [newCompLocation, setNewCompLocation] = useState<CabinetType>('uretim-nem');
  const [formError, setFormError] = useState('');

  const [solderType, setSolderType] = useState<'Kurşunlu' | 'Kurşunsuz'>('Kurşunsuz');
  const [solderModel, setSolderModel] = useState<'CVP-390' | 'OM-5100'>('CVP-390');
  const [solderExpiry, setSolderExpiry] = useState('');

  const [consumeCompName, setConsumeCompName] = useState('');
  const [consumeError, setConsumeError] = useState('');
  const [consumeSuccess, setConsumeSuccess] = useState('');

  // 1. WebSocket data received
  useEffect(() => {
    socket.on("components-updated", (data: ComponentData[]) => {
      setServerComponents(data);
    });
    return () => {
      socket.off("components-updated");
    };
  }, []);

  // 2. NETWORK OPTIMIZATION: Frontend Ticker for UI computation
  // Gelen salt (durağan) zaman damgası nesnelerini, UI için dinamik hesaplıyoruz 
  useEffect(() => {
    const updateUI = () => {
      const now = Date.now();
      const mapped = serverComponents.map(c => {
         // Fırınlama süresi
         const bakeElapsed = c.bakeElapsedTotalMs + (c.bakeStartTimeMs ? now - c.bakeStartTimeMs : 0);
         // Taban ömrü süresi
         const floorElapsed = c.floorLifeElapsedTotalMs + (c.floorLifeStartTimeMs ? now - c.floorLifeStartTimeMs : 0);
         // Raf ömrü
         const shelfElapsed = c.shelfLifeElapsedTotalMs + (c.shelfLifeStartTimeMs ? now - c.shelfLifeStartTimeMs : 0);
         // Fazla bekleme
         const overtimeElapsed = c.overtimeElapsedTotalMs + (c.overtimeStartTimeMs ? now - c.overtimeStartTimeMs : 0);
         const onShelfElapsed = (c.timeOnShelfStartTimeMs ? now - c.timeOnShelfStartTimeMs : 0);
         
         const ret = {
           ...c,
           targetTime: c.targetTimeMs / HOUR_MS,
           elapsedTime: bakeElapsed / HOUR_MS,
           floorLifeTotal: c.floorLifeTotalMs / HOUR_MS,
           floorLifeElapsed: floorElapsed / HOUR_MS,
           shelfLifeTotal: c.shelfLifeTotalMs / HOUR_MS,
           shelfLifeElapsed: shelfElapsed / HOUR_MS,
           overtime: overtimeElapsed / HOUR_MS,
           timeOnShelf: onShelfElapsed / HOUR_MS,
         };
         
         // Sınır güvenliği (Ekranda eksilere düşmemek için)
         if (ret.elapsedTime! > ret.targetTime!) ret.elapsedTime = ret.targetTime;
         if (ret.floorLifeElapsed! > ret.floorLifeTotal!) ret.floorLifeElapsed = ret.floorLifeTotal;
         if (ret.shelfLifeElapsed! > ret.shelfLifeTotal!) ret.shelfLifeElapsed = ret.shelfLifeTotal;
         
         return ret;
      });
      setComponents(mapped);
    };

    updateUI(); // First run
    const timer = setInterval(updateUI, 1000); // 1 sn aralıklarla UI yenilenir
    return () => clearInterval(timer);
  }, [serverComponents]);

  const handleAccordionToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;

    if (comp.isSolder && comp.status === 'IN_PRODUCTION' && !comp.isReady) {
      alert(`HATA: "${comp.name}" şu anda ısınma aşamasındadır. Isınma tamamlanmadan sistemden düşülemez!`);
      return;
    }

    if (comp.status !== 'IN_PRODUCTION' && !comp.status.includes('EXPIRED')) {
      alert(`HATA: "${comp.name}" şu anda "${comp.status}" durumunda. Sadece Üretimde olan veya Süresi Dolan bileşenler tüketilebilir!`);
      return;
    }
    setDeleteConfirmId(id);
  }, [components]);

  const executeDelete = useCallback(() => {
    socket.emit("action", { type: "executeDelete", payload: deleteConfirmId });
    setDeleteConfirmId(null);
  }, [deleteConfirmId]);

  const handleStartBaking = useCallback((id: string) => {
    socket.emit("action", { type: "handleStartBaking", payload: id });
    setRebakeWarningId(null);
  }, []);

  const handleRebakeRequest = useCallback((id: string) => {
    const comp = components.find(c => c.id === id);
    if (comp && comp.bakeCount >= 1) {
      setRebakeWarningId(id);
    } else {
      handleStartBaking(id);
    }
  }, [components, handleStartBaking]);

  const handlePackage = useCallback((id: string, context: string) => {
    setPackageSelectionId(id);
  }, []);

  const executePackage = useCallback((id: string, cabinet: 'uretim-raf' | 'depo-raf') => {
    socket.emit("action", { type: "executePackage", payload: { id, cabinet } });
    setPackageSelectionId(null);
  }, []);

  const handleTakeToDryCabinet = useCallback((id: string) => {
    setDryCabinetSelectionId(id);
  }, []);

  const executeTakeToDryCabinet = useCallback((id: string, cabinet: 'uretim-nem' | 'depo-nem') => {
    socket.emit("action", { type: "executeTakeToDryCabinet", payload: { id, cabinet } });
    setDryCabinetSelectionId(null);
  }, []);

  const executeTakeToProduction = useCallback((id: string) => {
    socket.emit("action", { type: "executeTakeToProduction", payload: id });
    setProductionWarningId(null);
  }, []);

  const handleProductionRequest = useCallback((id: string) => {
    const comp = components.find(c => c.id === id);
    if (comp && comp.bakeCount >= 2) {
      setProductionWarningId(id);
    } else {
      executeTakeToProduction(id);
    }
  }, [components, executeTakeToProduction]);

  const handleResumeBaking = useCallback((id: string) => {
    socket.emit("action", { type: "handleResumeBaking", payload: id });
  }, []);

  const handleTransferToUretimNem = useCallback((id: string) => {
    socket.emit("action", { type: "handleTransferToUretimNem", payload: id });
  }, []);

  const handleTransferToUretimRaf = useCallback((id: string) => {
    socket.emit("action", { type: "handleTransferToUretimRaf", payload: id });
  }, []);

  const handleSolderProductionRequest = useCallback((id: string) => {
    socket.emit("action", { type: "handleSolderProductionRequest", payload: id });
  }, []);

  const handleReturnToSolderCabinet = useCallback((id: string) => {
    socket.emit("action", { type: "handleReturnToSolderCabinet", payload: id });
  }, []);

  const processHicDecision = useCallback((isBlue: boolean) => {
    if (!showHicModal) return;
    socket.emit("action", { type: "processHicDecision", payload: { id: showHicModal, isBlue } });
    setShowHicModal(null);
  }, [showHicModal]);

  const handleAddComponent = useCallback((e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!newCompName.trim()) return;
    
    if (initialStatus === 'SOLDER' && !solderExpiry) {
      setFormError('Lütfen son kullanma tarihini seçin!');
      return;
    }

    const calculatedTargetTime = BAKE_TABLE_60C[newCompThickness]?.[newCompMsl] || 0;
    const isSolder = initialStatus === 'SOLDER';

    const newComponent: Partial<ComponentData> = {
      id: Date.now().toString(),
      name: newCompName.trim(),
      thickness: isSolder ? 'N/A' : newCompThickness,
      msl: isSolder ? 'N/A' : newCompMsl,
      cabinet: newCompLocation,
      status: initialStatus,
      targetTime: isSolder ? 0 : calculatedTargetTime,
      floorLifeTotal: isSolder ? (14 * 24) : (FLOOR_LIFE_HOURS[newCompMsl] || 0),
      shelfLifeTotal: SHELF_LIFE_HOURS,
      bakeCount: 0,
      history: [
        `${getTimestamp()} Sisteme kaydedildi. Durum: ${
          isSolder ? 'Lehim Dolabı' : 
          initialStatus === 'BAKING' ? 'Fırınlanıyor' : 
          initialStatus === 'DRY_CABINET' ? 'Nem Dolabı' : 
          'Paketli'
        }`
      ],
      isSolder: isSolder,
      solderType: isSolder ? solderType : undefined,
      solderModel: isSolder ? solderModel : undefined,
      expiryDate: isSolder ? solderExpiry : undefined,
      returnCount: 0,
      isReady: isSolder && initialStatus !== 'IN_PRODUCTION',
    };

    if (isSolder) {
      newComponent.history!.push(`${getTimestamp()} Tip: ${solderType}, Model: ${solderModel}, SKT: ${solderExpiry}`);
    }
    if (initialStatus === 'BAKING') newComponent.history!.push(`${getTimestamp()} 1. Fırınlama başlatıldı.`);

    socket.emit("action", { type: "addComponent", payload: newComponent }, (res: any) => {
      if (res.error) {
        setFormError(res.error);
      } else {
        setNewCompName('');
        setFormError('');
        setIsAddModalOpen(false);
        setExpandedId(newComponent.id!); 
      }
    });
  }, [newCompName, newCompThickness, newCompMsl, initialStatus, newCompLocation, solderExpiry, solderType, solderModel]);

  const handleConsumeComponent = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setConsumeError('');
    setConsumeSuccess('');

    if (!consumeCompName.trim()) return;

    socket.emit("action", { type: "consumeComponent", payload: consumeCompName.trim() }, (res: any) => {
      if (res.error) {
        setConsumeError(res.error);
      } else {
        setConsumeSuccess(`[${getTimestamp()}] ${consumeCompName} başarıyla tüketildi.`);
        setConsumeCompName('');
        setTimeout(() => {
          setConsumeSuccess('');
        }, 5000);
      }
    });
  }, [consumeCompName]);

  const handleTransferToDepoRaf = useCallback((id: string) => {
    socket.emit("action", { type: "handleTransferToDepoRaf", payload: id });
  }, []);

  return {
    components,
    selectedCabinet, setSelectedCabinet,
    selectedArea, setSelectedArea,
    searchTerm, setSearchTerm,
    expandedId, setExpandedId,
    showHicModal, setShowHicModal,
    rebakeWarningId, setRebakeWarningId,
    deleteConfirmId, setDeleteConfirmId,
    productionWarningId, setProductionWarningId,
    packageSelectionId, setPackageSelectionId,
    dryCabinetSelectionId, setDryCabinetSelectionId,
    isAddModalOpen, setIsAddModalOpen,
    showOnlyErrors, setShowOnlyErrors,
    currentPage, setCurrentPage,
    itemsPerPage,
    
    newCompName, setNewCompName,
    newCompThickness, setNewCompThickness,
    newCompMsl, setNewCompMsl,
    initialStatus, setInitialStatus,
    newCompLocation, setNewCompLocation,
    formError,
    
    solderType, setSolderType,
    solderModel, setSolderModel,
    solderExpiry, setSolderExpiry,

    consumeCompName, setConsumeCompName,
    consumeError, setConsumeError,
    consumeSuccess, setConsumeSuccess,

    // Actions
    handleAccordionToggle,
    handleDeleteRequest,
    executeDelete,
    handleStartBaking,
    handleRebakeRequest,
    handlePackage,
    executePackage,
    handleTakeToDryCabinet,
    executeTakeToDryCabinet,
    handleProductionRequest,
    executeTakeToProduction,
    handleResumeBaking,
    handleTransferToUretimNem,
    handleTransferToUretimRaf,
    handleSolderProductionRequest,
    handleReturnToSolderCabinet,
    processHicDecision,
    handleAddComponent,
    handleConsumeComponent,
    handleTransferToDepoRaf
  };
}
