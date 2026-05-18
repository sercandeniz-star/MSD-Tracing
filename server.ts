import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import Database from "better-sqlite3";
import { ComponentData } from "./src/types";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});
const PORT = 3000;

app.use(express.json());

// 1. DATA INTEGRITY: SQLite Entegrasyonu
const LOGS_DIR = path.join(process.cwd(), "logs");
const DB_FILE = path.join(process.cwd(), "msd_track.db");

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

// Tabloyu oluştur (eğer yoksa)
db.exec(`
  CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    thickness TEXT,
    msl TEXT,
    cabinet TEXT NOT NULL,
    status TEXT NOT NULL,
    
    targetTimeMs INTEGER,
    bakeStartTimeMs INTEGER,
    bakeElapsedTotalMs INTEGER,
    
    floorLifeTotalMs INTEGER,
    floorLifeStartTimeMs INTEGER,
    floorLifeElapsedTotalMs INTEGER,
    
    shelfLifeTotalMs INTEGER,
    shelfLifeStartTimeMs INTEGER,
    shelfLifeElapsedTotalMs INTEGER,
    
    overtimeStartTimeMs INTEGER,
    overtimeElapsedTotalMs INTEGER,
    
    timeOnShelfStartTimeMs INTEGER,
    
    bakeCount INTEGER,
    history TEXT,
    
    consumedAt TEXT,
    
    isSolder INTEGER,
    solderType TEXT,
    solderModel TEXT,
    expiryDate TEXT,
    returnCount INTEGER,
    isReady INTEGER
  );
`);

// Zaman faktörü (Üretim simülasyonu / test için 1 Saat = 1000ms. Gerçek kurumsal yapıda 3600000ms kullanılmalıdır)
const HOUR_MS = 3600000;

const countResult = db.prepare("SELECT COUNT(*) as c FROM components").get() as { c: number };
if (countResult.c === 0) {
  const dbJsonPath = path.join(process.cwd(), 'db.json');
  if (fs.existsSync(dbJsonPath)) {
    try {
      const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
      const insertStart = db.prepare(`
        INSERT INTO components (
          id, name, thickness, msl, cabinet, status, targetTimeMs, bakeStartTimeMs, bakeElapsedTotalMs,
          floorLifeTotalMs, floorLifeStartTimeMs, floorLifeElapsedTotalMs, shelfLifeTotalMs, shelfLifeStartTimeMs,
          shelfLifeElapsedTotalMs, overtimeStartTimeMs, overtimeElapsedTotalMs, timeOnShelfStartTimeMs,
          bakeCount, history, consumedAt, isSolder, solderType, solderModel, expiryDate, returnCount, isReady
        ) VALUES (
          @id, @name, @thickness, @msl, @cabinet, @status, @targetTimeMs, @bakeStartTimeMs, @bakeElapsedTotalMs,
          @floorLifeTotalMs, @floorLifeStartTimeMs, @floorLifeElapsedTotalMs, @shelfLifeTotalMs, @shelfLifeStartTimeMs,
          @shelfLifeElapsedTotalMs, @overtimeStartTimeMs, @overtimeElapsedTotalMs, @timeOnShelfStartTimeMs,
          @bakeCount, @history, @consumedAt, @isSolder, @solderType, @solderModel, @expiryDate, @returnCount, @isReady
        )
      `);
      db.transaction(() => {
        for (const item of dbData) {
          insertStart.run({
            id: item.id,
            name: item.name,
            thickness: item.thickness || null,
            msl: item.msl || null,
            cabinet: item.cabinet,
            status: item.status,
            targetTimeMs: (item.targetTime || 0) * HOUR_MS,
            bakeStartTimeMs: null,
            bakeElapsedTotalMs: (item.elapsedTime || 0) * HOUR_MS,
            floorLifeTotalMs: (item.floorLifeTotal || 0) * HOUR_MS,
            floorLifeStartTimeMs: null,
            floorLifeElapsedTotalMs: (item.floorLifeElapsed || 0) * HOUR_MS,
            shelfLifeTotalMs: (item.shelfLifeTotal || 0) * HOUR_MS,
            shelfLifeStartTimeMs: null,
            shelfLifeElapsedTotalMs: (item.shelfLifeElapsed || 0) * HOUR_MS,
            overtimeStartTimeMs: null,
            overtimeElapsedTotalMs: (item.overtime || 0) * HOUR_MS,
            timeOnShelfStartTimeMs: null,
            bakeCount: item.bakeCount || 0,
            history: JSON.stringify(item.history || []),
            consumedAt: null,
            isSolder: item.isSolder ? 1 : 0,
            solderType: item.solderType || null,
            solderModel: item.solderModel || null,
            expiryDate: item.expiryDate || null,
            returnCount: item.returnCount || 0,
            isReady: item.isReady ? 1 : 0
          });
        }
      })();
      console.log("Seeded database with db.json data");
    } catch (err) {
      console.error("Error seeding database:", err);
    }
  }
}

const getTimestamp = () => {
  const now = new Date();
  return `[${now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`;
};

// Veritabanı yardımcı fonksiyonları 
const insertComponent = db.prepare(`
  INSERT INTO components (
    id, name, thickness, msl, cabinet, status, targetTimeMs, bakeStartTimeMs, bakeElapsedTotalMs,
    floorLifeTotalMs, floorLifeStartTimeMs, floorLifeElapsedTotalMs, shelfLifeTotalMs, shelfLifeStartTimeMs,
    shelfLifeElapsedTotalMs, overtimeStartTimeMs, overtimeElapsedTotalMs, timeOnShelfStartTimeMs,
    bakeCount, history, consumedAt, isSolder, solderType, solderModel, expiryDate, returnCount, isReady
  ) VALUES (
    @id, @name, @thickness, @msl, @cabinet, @status, @targetTimeMs, @bakeStartTimeMs, @bakeElapsedTotalMs,
    @floorLifeTotalMs, @floorLifeStartTimeMs, @floorLifeElapsedTotalMs, @shelfLifeTotalMs, @shelfLifeStartTimeMs,
    @shelfLifeElapsedTotalMs, @overtimeStartTimeMs, @overtimeElapsedTotalMs, @timeOnShelfStartTimeMs,
    @bakeCount, @history, @consumedAt, @isSolder, @solderType, @solderModel, @expiryDate, @returnCount, @isReady
  )
`);

const updateComponentDb = db.prepare(`
  UPDATE components SET
    name=@name, thickness=@thickness, msl=@msl, cabinet=@cabinet, status=@status, 
    targetTimeMs=@targetTimeMs, bakeStartTimeMs=@bakeStartTimeMs, bakeElapsedTotalMs=@bakeElapsedTotalMs,
    floorLifeTotalMs=@floorLifeTotalMs, floorLifeStartTimeMs=@floorLifeStartTimeMs, floorLifeElapsedTotalMs=@floorLifeElapsedTotalMs, 
    shelfLifeTotalMs=@shelfLifeTotalMs, shelfLifeStartTimeMs=@shelfLifeStartTimeMs, shelfLifeElapsedTotalMs=@shelfLifeElapsedTotalMs, 
    overtimeStartTimeMs=@overtimeStartTimeMs, overtimeElapsedTotalMs=@overtimeElapsedTotalMs, timeOnShelfStartTimeMs=@timeOnShelfStartTimeMs,
    bakeCount=@bakeCount, history=@history, consumedAt=@consumedAt, isSolder=@isSolder, solderType=@solderType, 
    solderModel=@solderModel, expiryDate=@expiryDate, returnCount=@returnCount, isReady=@isReady
  WHERE id=@id
`);

function parseRow(row: any): ComponentData {
  return {
    ...row,
    history: JSON.parse(row.history),
    isSolder: Boolean(row.isSolder),
    isReady: Boolean(row.isReady),
  };
}

function serializeRow(comp: ComponentData): any {
  return {
    id: comp.id ?? null,
    name: comp.name ?? null,
    thickness: comp.thickness ?? null,
    msl: comp.msl ?? null,
    cabinet: comp.cabinet ?? null,
    status: comp.status ?? null,
    targetTimeMs: comp.targetTimeMs ?? 0,
    bakeStartTimeMs: comp.bakeStartTimeMs ?? null,
    bakeElapsedTotalMs: comp.bakeElapsedTotalMs ?? 0,
    floorLifeTotalMs: comp.floorLifeTotalMs ?? 0,
    floorLifeStartTimeMs: comp.floorLifeStartTimeMs ?? null,
    floorLifeElapsedTotalMs: comp.floorLifeElapsedTotalMs ?? 0,
    shelfLifeTotalMs: comp.shelfLifeTotalMs ?? 0,
    shelfLifeStartTimeMs: comp.shelfLifeStartTimeMs ?? null,
    shelfLifeElapsedTotalMs: comp.shelfLifeElapsedTotalMs ?? 0,
    overtimeStartTimeMs: comp.overtimeStartTimeMs ?? null,
    overtimeElapsedTotalMs: comp.overtimeElapsedTotalMs ?? 0,
    timeOnShelfStartTimeMs: comp.timeOnShelfStartTimeMs ?? null,
    bakeCount: comp.bakeCount ?? 0,
    history: JSON.stringify(comp.history ?? []),
    consumedAt: comp.consumedAt ?? null,
    isSolder: comp.isSolder ? 1 : 0,
    solderType: comp.solderType ?? null,
    solderModel: comp.solderModel ?? null,
    expiryDate: comp.expiryDate ?? null,
    returnCount: comp.returnCount ?? 0,
    isReady: comp.isReady ? 1 : 0
  };
}

function loadAllComponents(): ComponentData[] {
  const rows = db.prepare("SELECT * FROM components").all();
  return rows.map(parseRow);
}

function saveComponent(comp: ComponentData) {
  const serialized = serializeRow(comp);
  const existing = db.prepare("SELECT id FROM components WHERE id=?").get(comp.id);
  if (existing) {
    updateComponentDb.run(serialized);
  } else {
    insertComponent.run(serialized);
  }
}

function deleteComponentDb(id: string) {
    db.prepare("DELETE FROM components WHERE id=?").run(id);
}

// 4. PAYLOAD VALIDATION & GUARD
function isValidId(id: any): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 128;
}

function emitAll() {
  io.emit("components-updated", loadAllComponents());
}

// ZAMAN DAMGASI (Timestamp) MANTIĞI: Arka Planda Hedefleri Kontrol Eden Optimize İşçi
setInterval(() => {
  let hasChanges = false;
  const now = Date.now();
  const components = loadAllComponents();

  components.forEach(comp => {
    if (comp.status === 'CONSUMED') return;
    let compChanged = false;

    if (comp.status === 'BAKING' && comp.bakeStartTimeMs) {
      const currentElapsed = comp.bakeElapsedTotalMs + (now - comp.bakeStartTimeMs);
      if (currentElapsed >= comp.targetTimeMs) {
        comp.status = 'COMPLETED';
        comp.bakeElapsedTotalMs = comp.targetTimeMs;
        comp.bakeStartTimeMs = null;
        comp.bakeCount += 1;
        
        comp.overtimeStartTimeMs = now;
        comp.overtimeElapsedTotalMs = 0;
        
        comp.history.push(`${getTimestamp()} [KAYIT] ${comp.bakeCount}. Kürleme başarıyla tamamlandı.`);
        compChanged = true;
      }
    }

    if (comp.isSolder && comp.status === 'IN_PRODUCTION' && !comp.isReady && comp.bakeStartTimeMs) {
      const currentElapsed = comp.bakeElapsedTotalMs + (now - comp.bakeStartTimeMs);
      if (currentElapsed >= comp.targetTimeMs) {
        comp.bakeElapsedTotalMs = comp.targetTimeMs;
        comp.bakeStartTimeMs = null;
        comp.isReady = true;
        comp.history.push(`${getTimestamp()} [KAYIT] Lehim ısınma süresi tamamlandı. Kullanıma hazır.`);
        compChanged = true;
      }
    }

    if (comp.isSolder && comp.status === 'IN_PRODUCTION' && comp.floorLifeStartTimeMs) {
      const floorElapsed = comp.floorLifeElapsedTotalMs + (now - comp.floorLifeStartTimeMs);
      if (floorElapsed >= comp.floorLifeTotalMs) {
        comp.status = 'EXPIRED_SOLDER';
        comp.floorLifeElapsedTotalMs = comp.floorLifeTotalMs;
        comp.floorLifeStartTimeMs = null;
        comp.history.push(`${getTimestamp()} DİKKAT: Dış ortamda kalma süresi (2 hafta) doldu!`);
        compChanged = true;
      }
    }

    if (!comp.isSolder && comp.status === 'IN_PRODUCTION' && comp.floorLifeStartTimeMs) {
      const floorElapsed = comp.floorLifeElapsedTotalMs + (now - comp.floorLifeStartTimeMs);
      if (floorElapsed >= comp.floorLifeTotalMs) {
         comp.status = 'EXPIRED';
         comp.floorLifeElapsedTotalMs = comp.floorLifeTotalMs;
         comp.floorLifeStartTimeMs = null;
         comp.history.push(`${getTimestamp()} DİKKAT: Taban ömrü doldu!`);
         compChanged = true;
      }
    }

    if (comp.isSolder && comp.expiryDate && comp.status !== 'EXPIRED_SOLDER' && comp.status !== 'CONSUMED') {
      const expDate = new Date(comp.expiryDate).getTime();
      if (now > expDate) {
         comp.status = 'EXPIRED_SOLDER';
         comp.history.push(`${getTimestamp()} DİKKAT: Son kullanma tarihi doldu!`);
         compChanged = true;
      }
    }

    if (compChanged) {
      saveComponent(comp);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    emitAll(); // NETWORK OPTIMIZATION
  }

}, 5000); 

io.on("connection", (socket) => {
  socket.emit("components-updated", loadAllComponents());

  socket.on("action", (data, callback) => {
    // 4. PAYLOAD VALIDATION
    if (!data || typeof data !== 'object') {
       if (callback) callback({ error: "Invalid socket action payload." });
       return;
    }

    const { type, payload } = data;
    const now = Date.now();
    let err = "";

    const processTx = (actionBlock: () => void) => {
       const runDbTx = db.transaction(() => {
          actionBlock();
       });
       try {
         runDbTx();
         emitAll();
       } catch (e: any) {
         err = e?.message || "Internal server error";
       }
    };

    switch (type) {
      case "executeDelete":
        if (!isValidId(payload)) return callback && callback({ error: "Invalid ID" });
        processTx(() => {
          const comp = loadAllComponents().find(c => c.id === payload);
          if (comp) {
            comp.status = 'CONSUMED';
            comp.cabinet = comp.isSolder ? 'lehim' : 'uretim-raf';
            comp.consumedAt = getTimestamp();
            comp.bakeStartTimeMs = null;
            comp.floorLifeStartTimeMs = null;
            comp.history.push(`${getTimestamp()} Üretimde tüketildi/Sistemden düşüldü.`);
            saveComponent(comp);
          }
        });
        break;
        
      case "handleStartBaking":
        if (!isValidId(payload)) return callback && callback({ error: "Invalid ID" });
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload);
          if (c) {
            const bakeLog = `${c.bakeCount + 1}. Fırınlama döngüsü başlatıldı. Yer: Üretim Kürleme Dolabı`;
            c.status = 'BAKING';
            c.cabinet = 'uretim-kurleme';
            
            c.bakeElapsedTotalMs = 0;
            c.bakeStartTimeMs = now;
            
            c.floorLifeElapsedTotalMs = 0;
            c.floorLifeStartTimeMs = null;
            
            c.shelfLifeElapsedTotalMs = 0;
            c.shelfLifeStartTimeMs = null;
            
            c.overtimeElapsedTotalMs = 0;
            c.overtimeStartTimeMs = null;
            
            c.history.push(`${getTimestamp()} ${bakeLog}`);
            saveComponent(c);
          }
        });
        break;

      case "executePackage":
        if (!payload || !isValidId(payload.id) || !['uretim-raf', 'depo-raf'].includes(payload.cabinet)) {
           return callback && callback({ error: "Invalid payload for executePackage" });
        }
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload.id);
          if (c) {
            if (c.floorLifeStartTimeMs) {
                c.floorLifeElapsedTotalMs += (now - c.floorLifeStartTimeMs);
                c.floorLifeStartTimeMs = null;
            }
            c.status = 'PACKAGED';
            c.cabinet = payload.cabinet;
            
            c.overtimeStartTimeMs = null;
            c.overtimeElapsedTotalMs = 0;
            
            c.shelfLifeStartTimeMs = now;
            c.shelfLifeElapsedTotalMs = 0;

            const cabinetTitle = payload.cabinet === 'uretim-raf' ? 'Üretim Raf' : 'Depo Raf';
            c.history.push(`${getTimestamp()} MBB ambalaja alındı ve ${cabinetTitle} alanına kaldırıldı.`);
            saveComponent(c);
          }
        });
        break;

      case "executeTakeToDryCabinet":
        if (!payload || !isValidId(payload.id) || !['uretim-nem', 'depo-nem'].includes(payload.cabinet)) {
           return callback && callback({ error: "Invalid payload for executeTakeToDryCabinet" });
        }
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload.id);
          if (c) {
            const cabinetTitle = payload.cabinet === 'uretim-nem' ? 'Üretim Nem Dolabı' : 'Depo Nem Dolabı';
            
            if (c.floorLifeStartTimeMs) {
                c.floorLifeElapsedTotalMs += (now - c.floorLifeStartTimeMs);
                c.floorLifeStartTimeMs = null;
            }
            if (c.shelfLifeStartTimeMs) {
                c.shelfLifeElapsedTotalMs += (now - c.shelfLifeStartTimeMs);
                c.shelfLifeStartTimeMs = null;
            }

            if (c.status === 'EXPIRED') {
                 c.status = 'EXPIRED_IN_DRY_CABINET';
                 c.cabinet = payload.cabinet;
                 c.history.push(`${getTimestamp()} Ömrü dolmuş (EXPIRED) malzeme ${cabinetTitle} alanına kaldırıldı.`);
            } else {
                 c.status = 'DRY_CABINET';
                 c.cabinet = payload.cabinet;
                 c.history.push(`${getTimestamp()} ${cabinetTitle} konumuna (<%5 RH) koyuldu.`);
            }
            c.overtimeStartTimeMs = null;
            c.overtimeElapsedTotalMs = 0;
            saveComponent(c);
          }
        });
        break;

      case "executeTakeToProduction":
        if (!isValidId(payload)) return callback && callback({ error: "Invalid ID" });
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload);
          if (c) {
            c.status = 'IN_PRODUCTION';
            c.cabinet = 'uretim-raf';
            c.overtimeStartTimeMs = null;
            c.overtimeElapsedTotalMs = 0;
            
            c.floorLifeStartTimeMs = now;

            c.history.push(`${getTimestamp()} Üretime alındı. Üretim Rafına taşındı. Taban ömrü sayacı başladı.`);
            saveComponent(c);
          }
        });
        break;

      case "handleResumeBaking":
        if (!isValidId(payload)) return callback && callback({ error: "Invalid ID" });
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload);
          if (c) {
            c.status = 'BAKING';
            c.cabinet = 'uretim-kurleme';
            c.bakeStartTimeMs = now;
            c.history.push(`${getTimestamp()} Kürleme devam ediyor. Yer: Üretim Kürleme Dolabı`);
            saveComponent(c);
          }
        });
        break;

      case "handleSolderProductionRequest":
        if (!isValidId(payload)) return callback && callback({ error: "Invalid ID" });
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload);
          if (c) {
            const warmUpHours = c.solderModel === 'CVP-390' ? 4 : 8;
            c.status = 'IN_PRODUCTION';
            c.cabinet = 'lehim';
            c.targetTimeMs = warmUpHours * HOUR_MS;
            
            c.bakeElapsedTotalMs = 0;
            c.bakeStartTimeMs = now;
            
            c.floorLifeElapsedTotalMs = 0;
            c.floorLifeStartTimeMs = now;
            
            c.isReady = false;
            c.history.push(`${getTimestamp()} Üretime alındı (Dolaptan çıkarıldı). ${warmUpHours} saat ısınma süreci başladı.`);
            saveComponent(c);
          }
        });
        break;

      case "handleReturnToSolderCabinet":
        if (!isValidId(payload)) return callback && callback({ error: "Invalid ID" });
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload);
          if (c) {
            c.status = 'SOLDER';
            c.cabinet = 'lehim';
            c.isReady = false;
            c.bakeStartTimeMs = null;
            c.bakeElapsedTotalMs = 0;
            
            if (c.floorLifeStartTimeMs) {
                c.floorLifeElapsedTotalMs += (now - c.floorLifeStartTimeMs);
                c.floorLifeStartTimeMs = null;
            }

            c.returnCount = (c.returnCount || 0) + 1;
            c.history.push(`${getTimestamp()} Dolaba geri konuldu (Dönüş Hak No: ${c.returnCount}).`);
            saveComponent(c);
          }
        });
        break;

      case "processHicDecision":
        if (!payload || !isValidId(payload.id) || typeof payload.isBlue !== 'boolean') return callback && callback({ error: "Invalid HIC payload" });
        processTx(() => {
          const c = loadAllComponents().find(c => c.id === payload.id);
          if (c) {
            if (payload.isBlue) {
              if ((c.bakeElapsedTotalMs + (c.bakeStartTimeMs ? now - c.bakeStartTimeMs : 0)) < c.targetTimeMs) {
                c.status = 'BAKING';
                c.bakeStartTimeMs = now;
                c.history.push(`${getTimestamp()} HIC: MAVİ. Kürlemeye devam ediyor.`);
              } else {
                c.status = 'DRY_CABINET';
                c.bakeStartTimeMs = null;
                c.history.push(`${getTimestamp()} HIC: MAVİ. Malzeme güvenli. Nem Dolabına alındı.`);
              }
            } else {
              c.status = 'EXPIRED_IN_DRY_CABINET';
              c.bakeElapsedTotalMs = 0;
              c.bakeStartTimeMs = null;
              c.floorLifeElapsedTotalMs = 0;
              c.shelfLifeElapsedTotalMs = 0;
              c.history.push(`${getTimestamp()} [UYARI] HIC PEMBE! Süreler sıfırlandı. Kürlenmesi şart. Nem Dolabına kaldırıldı.`);
            }
            saveComponent(c);
          }
        });
        break;

      case "addComponent":
        const newComp = payload as ComponentData;
        if (!newComp || !newComp.name || !isValidId(newComp.id)) {
            err = "Invalid component data";
        } else {
            const allComps = loadAllComponents();
            if (allComps.some(c => c.name.toLowerCase() === newComp.name.toLowerCase())) {
              err = 'Bu barkod/isim ile kayıtlı bir malzeme zaten mevcut!';
            } else {
              processTx(() => {
                newComp.targetTimeMs = ((newComp as any).targetTime || 0) * HOUR_MS;
                newComp.floorLifeTotalMs = ((newComp as any).floorLifeTotal || 0) * HOUR_MS;
                newComp.shelfLifeTotalMs = ((newComp as any).shelfLifeTotal || 0) * HOUR_MS;
                
                newComp.bakeElapsedTotalMs = 0;
                newComp.floorLifeElapsedTotalMs = 0;
                newComp.shelfLifeElapsedTotalMs = 0;
                newComp.overtimeElapsedTotalMs = 0;
                
                const initialStatus = newComp.status;
                if (initialStatus === 'BAKING') {
                    newComp.bakeStartTimeMs = now;
                } else if (initialStatus === 'DRY_CABINET') {
                    newComp.bakeElapsedTotalMs = newComp.targetTimeMs; 
                }

                saveComponent(newComp);
              });
            }
        }
        break;

      case "consumeComponent":
        if (typeof payload !== 'string') return callback && callback({ error: "Invalid payload" });
        processTx(() => {
          const comps = loadAllComponents();
          const compIndex = comps.findIndex(c => c.name.toLowerCase() === payload.toLowerCase());
          if (compIndex === -1) {
            err = 'Sistemde bu isim/barkodda aktif bir bileşen bulunamadı.';
          } else {
            const consumedComp = comps[compIndex];
            if (consumedComp.isSolder && consumedComp.status === 'IN_PRODUCTION' && !consumedComp.isReady) {
              err = `HATA: "${consumedComp.name}" şu anda ısınma aşamasındadır. Isınma tamamlanmadan sistemden düşülemez!`;
            } else if (consumedComp.status !== 'IN_PRODUCTION' && !consumedComp.status.includes('EXPIRED')) {
              err = `HATA: "${consumedComp.name}" şu anda "${consumedComp.status}" durumunda. Sadece Üretimde olan veya Süresi Dolan bileşenler tüketilebilir!`;
            } else {
              consumedComp.status = 'CONSUMED';
              consumedComp.cabinet = consumedComp.isSolder ? 'lehim' : 'uretim-raf';
              consumedComp.consumedAt = getTimestamp();
              consumedComp.history.push(`${getTimestamp()} Barkod okutularak tüketildi.`);
              
              if (consumedComp.floorLifeStartTimeMs) consumedComp.floorLifeElapsedTotalMs += (now - consumedComp.floorLifeStartTimeMs);
              consumedComp.bakeStartTimeMs = null;
              consumedComp.floorLifeStartTimeMs = null;
              consumedComp.shelfLifeStartTimeMs = null;

              saveComponent(consumedComp);
            }
          }
        });
        break;
        
      case "handleTransferToUretimNem":
         if (!isValidId(payload)) return;
         processTx(() => {
            const c = loadAllComponents().find(c => c.id === payload);
            if(c) { c.cabinet = 'uretim-nem'; c.history.push(`${getTimestamp()} Transferred to Üretim Nem.`); saveComponent(c); }
         }); break;
      case "handleTransferToUretimRaf":
         if (!isValidId(payload)) return;
         processTx(() => {
            const c = loadAllComponents().find(c => c.id === payload);
            if(c) { c.cabinet = 'uretim-raf'; c.history.push(`${getTimestamp()} Transferred to Üretim Raf.`); saveComponent(c); }
         }); break;
      case "handleTransferToDepoRaf":
         if (!isValidId(payload)) return;
         processTx(() => {
            const c = loadAllComponents().find(c => c.id === payload);
            if(c) { c.cabinet = 'depo-raf'; c.history.push(`${getTimestamp()} Transferred to Depo Raf.`); saveComponent(c); }
         }); break;
    }
    
    if (callback) {
      callback(err ? { error: err } : { success: true });
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
