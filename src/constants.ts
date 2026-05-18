export const BAKE_TABLE_60C: Record<string, Record<string, number>> = {
  '<=1.4': { '2': 72, '2a': 96, '3': 120, '4': 144, '5': 168, '5a': 216 },
  '>1.4_<=2.0': { '2': 240, '2a': 264, '3': 336, '4': 432, '5': 528, '5a': 720 },
  '>2.0_<=4.5': { '2': 720, '2a': 720, '3': 720, '4': 720, '5': 720, '5a': 720 },
};

export const FLOOR_LIFE_HOURS: Record<string, number> = {
  '2': 8760, '2a': 672, '3': 168, '4': 72, '5': 48, '5a': 24,
};

export const SHELF_LIFE_HOURS = 8760; // 1 Yıl
