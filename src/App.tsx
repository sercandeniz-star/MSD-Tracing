import React, { useMemo, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import Header from './components/Header';
import AlertDashboard from './components/AlertDashboard';
import SearchBar from './components/SearchBar';
import ComponentCard from './components/ComponentCard';
import GlobalLogPanel from './components/GlobalLogPanel';
import { ConsumeComponentForm } from './components/Forms';
import { 
  DeleteConfirmModal, 
  ProductionWarningModal, 
  RebakeWarningModal, 
  HicCheckModal,
  ShelfSelectionModal,
  DryCabinetSelectionModal,
  AddComponentModal
} from './components/Modals';
import { AreaSelector, CabinetTabs, CABINET_INFO } from './components/CabinetSelectors';
import { useMSD } from './hooks/useMSD';

export default function MSDManagementSystem() {
  const msd = useMSD();

  const errorComponents = msd.components.filter(c => 
    c.cabinet === msd.selectedCabinet &&
    (c.status === 'EXPIRED' || 
    c.status === 'EXPIRED_IN_DRY_CABINET' || 
    c.status === 'EXPIRED_SOLDER' ||
    (c.status === 'COMPLETED' && c.overtime > 0))
  );

  const globalErrorComponents = useMemo(() => {
    return msd.components.filter(c => 
      c.status === 'EXPIRED' || 
      c.status === 'EXPIRED_IN_DRY_CABINET' || 
      c.status === 'EXPIRED_SOLDER' ||
      (c.status === 'COMPLETED' && c.overtime > 0)
    );
  }, [msd.components]);
  
  useEffect(() => {
    msd.setCurrentPage(1);
  }, [msd.selectedCabinet, msd.selectedArea, msd.searchTerm, msd.showOnlyErrors, msd.setCurrentPage]);

  const sortedAndFilteredComponents = useMemo(() => {
    let result = msd.components.filter(comp => comp.cabinet === msd.selectedCabinet);
    if (msd.showOnlyErrors) result = result.filter(c => 
      c.status === 'EXPIRED' || 
      c.status === 'EXPIRED_IN_DRY_CABINET' || 
      c.status === 'EXPIRED_SOLDER' ||
      (c.status === 'COMPLETED' && c.overtime > 0)
    );
    result = result.filter(comp => comp.name.toLowerCase().includes(msd.searchTerm.toLowerCase()));

    return result.sort((a, b) => {
      if (a.status === 'CONSUMED' && b.status !== 'CONSUMED') return 1;
      if (a.status !== 'CONSUMED' && b.status === 'CONSUMED') return -1;

      const isAError = a.status === 'EXPIRED' || a.status === 'EXPIRED_IN_DRY_CABINET' || a.status === 'EXPIRED_SOLDER' || (a.status === 'COMPLETED' && a.overtime > 0);
      const isBError = b.status === 'EXPIRED' || b.status === 'EXPIRED_IN_DRY_CABINET' || b.status === 'EXPIRED_SOLDER' || (b.status === 'COMPLETED' && b.overtime > 0);
      
      if (isAError && !isBError) return -1;
      if (!isAError && isBError) return 1; 
      return 0;
    });
  }, [msd.components, msd.searchTerm, msd.showOnlyErrors, msd.selectedCabinet]);

  const paginatedComponents = useMemo(() => {
    const startIndex = (msd.currentPage - 1) * msd.itemsPerPage;
    return sortedAndFilteredComponents.slice(startIndex, startIndex + msd.itemsPerPage);
  }, [sortedAndFilteredComponents, msd.currentPage, msd.itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredComponents.length / msd.itemsPerPage);

  const globalLogs = useMemo(() => {
    const logs: { id: string; name: string; text: string; time: string; sortableTime: string }[] = [];
    msd.components.forEach(comp => {
      comp.history.forEach(logText => {
        const timeMatch = logText.match(/^\[(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2}:\d{2})\]\s*(.*)$/);
        if (timeMatch) {
          const [_, date, time, text] = timeMatch;
          const [day, month, year] = date.split('.');
          logs.push({
            id: comp.id,
            name: comp.name,
            time: `${date} ${time}`,
            sortableTime: `${year}-${month}-${day} ${time}`,
            text: text
          });
        } else {
          logs.push({
            id: comp.id,
            name: comp.name,
            time: '00:00:00',
            sortableTime: '0000-00-00 00:00:00',
            text: logText
          });
        }
      });
    });
    return logs;
  }, [msd.components]);

  const cardActions = {
    handleRebakeRequest: msd.handleRebakeRequest,
    handleTakeToDryCabinet: msd.handleTakeToDryCabinet,
    executeTakeToDryCabinet: msd.executeTakeToDryCabinet,
    handleStartBaking: msd.handleStartBaking,
    handlePackage: msd.handlePackage,
    handleProductionRequest: msd.handleProductionRequest,
    handleResumeBaking: msd.handleResumeBaking,
    setShowHicModal: msd.setShowHicModal,
    handleTransferToUretimNem: msd.handleTransferToUretimNem,
    handleTransferToUretimRaf: msd.handleTransferToUretimRaf,
    handleTransferToDepoRaf: msd.handleTransferToDepoRaf,
    handleSolderProductionRequest: msd.handleSolderProductionRequest,
    handleReturnToSolderCabinet: msd.handleReturnToSolderCabinet,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <Header globalErrorCount={globalErrorComponents.length} />

        {/* GENEL UYARI SİSTEMİ */}
        {globalErrorComponents.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm animate-pulse-slow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-red-800">
                  SİSTEM GENELİNDE KRİTİK UYARI: Toplam {globalErrorComponents.length} malzemede sorun tespit edildi.
                </p>
                <p className="text-xs text-red-700 mt-1 italic">
                  Lütfen ilgili dolapları kontrol edin: {Array.from(new Set(globalErrorComponents.map(c => CABINET_INFO[c.cabinet]?.title))).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <AreaSelector 
          selectedArea={msd.selectedArea} 
          setSelectedArea={msd.setSelectedArea} 
          setSelectedCabinet={msd.setSelectedCabinet} 
        />

        <CabinetTabs 
          selectedArea={msd.selectedArea} 
          selectedCabinet={msd.selectedCabinet} 
          setSelectedCabinet={msd.setSelectedCabinet} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            
            <AlertDashboard 
              errorComponents={errorComponents} 
              showOnlyErrors={msd.showOnlyErrors} 
              setShowOnlyErrors={msd.setShowOnlyErrors} 
              setExpandedId={msd.setExpandedId} 
            />

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <SearchBar searchTerm={msd.searchTerm} setSearchTerm={msd.setSearchTerm} />
              </div>
              <button 
                onClick={() => msd.setIsAddModalOpen(true)}
                className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Yeni Bileşen Ekle</span>
              </button>
            </div>
            
            {paginatedComponents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 font-medium">
                Kayıt veya sorunu olan malzeme bulunamadı.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedComponents.map(comp => (
                    <ComponentCard 
                      key={comp.id} 
                      comp={comp} 
                      isExpanded={msd.expandedId === comp.id} 
                      onToggleExpand={msd.handleAccordionToggle} 
                      onDeleteRequest={msd.handleDeleteRequest} 
                      actions={cardActions} 
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <button
                      onClick={() => msd.setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={msd.currentPage === 1}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Önceki
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => msd.setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                            msd.currentPage === page 
                              ? 'bg-slate-900 text-white' 
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => msd.setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={msd.currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <ConsumeComponentForm 
              consumeCompName={msd.consumeCompName}
              setConsumeCompName={msd.setConsumeCompName}
              consumeError={msd.consumeError}
              consumeSuccess={msd.consumeSuccess}
              handleConsumeComponent={msd.handleConsumeComponent}
            />
          </div>
        </div>
      </div>

      <DeleteConfirmModal 
        deleteConfirmId={msd.deleteConfirmId} 
        setDeleteConfirmId={msd.setDeleteConfirmId} 
        executeDelete={msd.executeDelete} 
      />

      <ProductionWarningModal 
        comp={msd.components.find(c => c.id === msd.productionWarningId)} 
        productionWarningId={msd.productionWarningId} 
        setProductionWarningId={msd.setProductionWarningId} 
        executeTakeToProduction={msd.executeTakeToProduction} 
      />

      <RebakeWarningModal 
        comp={msd.components.find(c => c.id === msd.rebakeWarningId)} 
        rebakeWarningId={msd.rebakeWarningId} 
        setRebakeWarningId={msd.setRebakeWarningId} 
        handleStartBaking={msd.handleStartBaking} 
      />

      <HicCheckModal 
        showHicModal={msd.showHicModal} 
        setShowHicModal={msd.setShowHicModal} 
        processHicDecision={msd.processHicDecision} 
      />

      <ShelfSelectionModal 
        packageSelectionId={msd.packageSelectionId} 
        setPackageSelectionId={msd.setPackageSelectionId} 
        executePackage={msd.executePackage} 
        components={msd.components}
      />

      <DryCabinetSelectionModal 
        dryCabinetSelectionId={msd.dryCabinetSelectionId} 
        setDryCabinetSelectionId={msd.setDryCabinetSelectionId} 
        executeTakeToDryCabinet={msd.executeTakeToDryCabinet} 
      />

      <AddComponentModal 
        isOpen={msd.isAddModalOpen}
        onClose={() => msd.setIsAddModalOpen(false)}
        newCompName={msd.newCompName}
        setNewCompName={msd.setNewCompName}
        newCompThickness={msd.newCompThickness}
        setNewCompThickness={msd.setNewCompThickness}
        newCompMsl={msd.newCompMsl}
        setNewCompMsl={msd.setNewCompMsl}
        initialStatus={msd.initialStatus}
        setInitialStatus={msd.setInitialStatus}
        newCompLocation={msd.newCompLocation}
        setNewCompLocation={msd.setNewCompLocation}
        formError={msd.formError}
        handleAddComponent={msd.handleAddComponent}
        solderType={msd.solderType}
        setSolderType={msd.solderType}
        solderModel={msd.solderModel}
        setSolderModel={msd.setSolderModel}
        solderExpiry={msd.solderExpiry}
        setSolderExpiry={msd.setSolderExpiry}
      />

      <GlobalLogPanel logs={globalLogs} />
    </div>
  );
}
