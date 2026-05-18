export type CabinetType = 'uretim-nem' | 'uretim-kurleme' | 'uretim-raf' | 'depo-nem' | 'depo-raf' | 'lehim';

export interface ComponentData {
  id: string;
  name: string;
  thickness: string;
  msl: string;
  cabinet: CabinetType;
  status: string;

  // Timing fields in milliseconds
  targetTimeMs: number;
  bakeStartTimeMs: number | null;
  bakeElapsedTotalMs: number;

  floorLifeTotalMs: number;
  floorLifeStartTimeMs: number | null;
  floorLifeElapsedTotalMs: number;

  shelfLifeTotalMs: number;
  shelfLifeStartTimeMs: number | null;
  shelfLifeElapsedTotalMs: number;

  overtimeStartTimeMs: number | null;
  overtimeElapsedTotalMs: number;

  timeOnShelfStartTimeMs: number | null;

  bakeCount: number;
  history: string[];

  consumedAt?: string;

  // Computed properties for UI (filled by useMSD hook)
  targetTime?: number;
  elapsedTime?: number;
  floorLifeTotal?: number;
  floorLifeElapsed?: number;
  shelfLifeTotal?: number;
  shelfLifeElapsed?: number;
  timeOnShelf?: number;
  overtime?: number;

  // Solder specific fields
  isSolder?: boolean;
  solderType?: 'Kurşunlu' | 'Kurşunsuz';
  solderModel?: 'CVP-390' | 'OM-5100';
  expiryDate?: string;
  returnCount?: number;
  isReady?: boolean;
}

