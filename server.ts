import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface DatabaseSchema {
  bookings: any[];
  reservedProductIds: string[];
  productOverrides: Record<string, any>;
  deletedProductIds: string[];
  addedProducts: any[];
  addedAccessories: any[];
  lastUpdated: number;
  version: number;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data_db.json');
const DB_TMP_PATH = path.join(process.cwd(), 'data_db.json.tmp');

// Default initial state
const defaultDb: DatabaseSchema = {
  bookings: [],
  reservedProductIds: [],
  productOverrides: {},
  deletedProductIds: [],
  addedProducts: [],
  addedAccessories: [],
  lastUpdated: Date.now(),
  version: 1,
};

// Load database from file or initialize
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        reservedProductIds: Array.isArray(parsed.reservedProductIds) ? parsed.reservedProductIds : [],
        productOverrides: parsed.productOverrides && typeof parsed.productOverrides === 'object' ? parsed.productOverrides : {},
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        addedProducts: Array.isArray(parsed.addedProducts) ? parsed.addedProducts : [],
        addedAccessories: Array.isArray(parsed.addedAccessories) ? parsed.addedAccessories : [],
        lastUpdated: parsed.lastUpdated || Date.now(),
        version: parsed.version || 1,
      };
    }
  } catch (err) {
    console.error('[Database] Failed to read database file, initializing default:', err);
  }
  return { ...defaultDb };
}

let dbState: DatabaseSchema = loadDatabase();

// Atomic write to disk to prevent corrupted JSON reads
function saveDatabase() {
  try {
    dbState.lastUpdated = Date.now();
    dbState.version = (dbState.version || 0) + 1;
    const serialized = JSON.stringify(dbState, null, 2);
    fs.writeFileSync(DB_TMP_PATH, serialized, 'utf-8');
    fs.renameSync(DB_TMP_PATH, DB_FILE_PATH);
  } catch (err) {
    console.error('[Database] Failed to write database to disk:', err);
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
    } catch (fallbackErr) {
      console.error('[Database] Direct write fallback also failed:', fallbackErr);
    }
  }
}

// Initial save to guarantee data_db.json exists on container startup
saveDatabase();

// Server-Sent Events (SSE) subscribers for instant multi-device sync
const sseClients = new Set<express.Response>();

function broadcastDatabaseUpdate() {
  const payload = `data: ${JSON.stringify(dbState)}\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.write(payload);
      if (typeof (client as any).flush === 'function') {
        (client as any).flush();
      }
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON parsing
  app.use(express.json({ limit: '50mb' }));

  // Global CORS & Cache-Control headers for API
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: dbState.version,
      lastUpdated: dbState.lastUpdated,
      connectedClients: sseClients.size,
      time: new Date().toISOString(),
    });
  });

  // GET Current full database state with anti-caching headers
  app.get('/api/database', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      success: true,
      data: dbState,
    });
  });

  // Realtime stream via Server-Sent Events (SSE)
  // CRITICAL: X-Accel-Buffering: no prevents Cloud Run / Nginx from buffering SSE events
  app.get('/api/database/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform, no-store');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    // Send initial snapshot immediately upon connecting
    res.write(`data: ${JSON.stringify(dbState)}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    sseClients.add(res);

    // Heartbeat every 15 seconds to keep cellular/proxy connections alive
    const interval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      } catch (e) {
        clearInterval(interval);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
      sseClients.delete(res);
    });
  });

  // POST update partial or full database
  app.post('/api/database/update', (req, res) => {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid payload' });
      }

      let hasChanges = false;

      if (Array.isArray(updates.bookings)) {
        dbState.bookings = updates.bookings;
        hasChanges = true;
      }
      if (Array.isArray(updates.reservedProductIds)) {
        dbState.reservedProductIds = updates.reservedProductIds;
        hasChanges = true;
      }
      if (updates.productOverrides && typeof updates.productOverrides === 'object') {
        // Deep merge or replace
        dbState.productOverrides = {
          ...dbState.productOverrides,
          ...updates.productOverrides,
        };
        hasChanges = true;
      }
      if (Array.isArray(updates.deletedProductIds)) {
        dbState.deletedProductIds = updates.deletedProductIds;
        hasChanges = true;
      }
      if (Array.isArray(updates.addedProducts)) {
        dbState.addedProducts = updates.addedProducts;
        hasChanges = true;
      }
      if (Array.isArray(updates.addedAccessories)) {
        dbState.addedAccessories = updates.addedAccessories;
        hasChanges = true;
      }

      if (hasChanges) {
        saveDatabase();
        broadcastDatabaseUpdate();
      }

      res.json({
        success: true,
        data: dbState,
        version: dbState.version,
        lastUpdated: dbState.lastUpdated,
      });
    } catch (err: any) {
      console.error('[API] Error updating database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST force sync entire database from admin (authoritative upload)
  app.post('/api/database/sync-all', (req, res) => {
    try {
      const fullState = req.body;
      if (!fullState || typeof fullState !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid payload' });
      }

      if (Array.isArray(fullState.bookings)) dbState.bookings = fullState.bookings;
      if (Array.isArray(fullState.reservedProductIds)) dbState.reservedProductIds = fullState.reservedProductIds;
      if (fullState.productOverrides && typeof fullState.productOverrides === 'object') {
        dbState.productOverrides = fullState.productOverrides;
      }
      if (Array.isArray(fullState.deletedProductIds)) dbState.deletedProductIds = fullState.deletedProductIds;
      if (Array.isArray(fullState.addedProducts)) dbState.addedProducts = fullState.addedProducts;
      if (Array.isArray(fullState.addedAccessories)) dbState.addedAccessories = fullState.addedAccessories;

      saveDatabase();
      broadcastDatabaseUpdate();

      console.log(`[Database] Full sync performed from admin. Version: ${dbState.version}`);

      res.json({
        success: true,
        data: dbState,
        version: dbState.version,
        lastUpdated: dbState.lastUpdated,
      });
    } catch (err: any) {
      console.error('[API] Error in sync-all:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jes Fashion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
