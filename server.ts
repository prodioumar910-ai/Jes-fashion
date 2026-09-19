import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
const { Pool } = pg;

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

// Neon PostgreSQL Connection (configured via process.env.DATABASE_URL)
const DATABASE_URL = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;
if (DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[Neon PostgreSQL] Unexpected error on idle client:', err);
    });
  } catch (err) {
    console.error('[Neon PostgreSQL] Error initializing connection pool:', err);
    pool = null;
  }
}

let isNeonConnected = false;

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

// Atomic local disk cache save (Optional on read-only filesystems like Vercel)
function saveLocalDiskCache() {
  try {
    const serialized = JSON.stringify(dbState, null, 2);
    // On Vercel/Cloud Run, the filesystem is read-only. We only use this as an emergency backup.
    // If it fails, we ignore it because Neon is our primary source of truth.
    if (process.env.NODE_ENV === 'production') {
      console.log('[Database] Running in production, skipping local disk write.');
      return;
    }
    fs.writeFileSync(DB_TMP_PATH, serialized, 'utf-8');
    fs.renameSync(DB_TMP_PATH, DB_FILE_PATH);
  } catch (err) {
    // Silently ignore disk errors in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Database] Failed to write local cache to disk:', err);
    }
  }
}

// Save state to Neon PostgreSQL and update local cache
async function persistState(triggerBroadcast = true) {
  dbState.lastUpdated = Date.now();
  dbState.version = (dbState.version || 0) + 1;
  saveLocalDiskCache();

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO app_database (id, data, version, last_updated)
         VALUES ('main', $1, $2, $3)
         ON CONFLICT (id) DO UPDATE
         SET data = EXCLUDED.data,
             version = EXCLUDED.version,
             last_updated = EXCLUDED.last_updated;`,
        [JSON.stringify(dbState), dbState.version, dbState.lastUpdated]
      );
      isNeonConnected = true;
      console.log(`[Neon PostgreSQL] State version ${dbState.version} saved successfully.`);
    } catch (err) {
      console.error('[Neon PostgreSQL] Failed to save to Neon, cached locally:', err);
      isNeonConnected = false;
    }
  }

  if (triggerBroadcast) {
    broadcastDatabaseUpdate();
  }
}

// Fetch latest state from Neon if version is different or timestamp is newer
async function syncFromNeon(): Promise<boolean> {
  if (!pool) return false;
  try {
    const res = await pool.query('SELECT data, version, last_updated FROM app_database WHERE id = $1', ['main']);
    isNeonConnected = true;
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const remoteVersion = parseInt(row.version, 10) || 1;
      const remoteLastUpdated = Number(row.last_updated) || 0;
      
      // If remote is different (higher version OR newer timestamp), we sync it.
      // This is more robust than just checking for "greater than" version.
      if (remoteVersion !== (dbState.version || 0) || remoteLastUpdated > (dbState.lastUpdated || 0)) {
        console.log(`[Neon PostgreSQL] Synchronizing memory state with Neon (v${remoteVersion}, last_updated: ${remoteLastUpdated})`);
        const remoteData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        dbState = {
          bookings: Array.isArray(remoteData.bookings) ? remoteData.bookings : [],
          reservedProductIds: Array.isArray(remoteData.reservedProductIds) ? remoteData.reservedProductIds : [],
          productOverrides: remoteData.productOverrides && typeof remoteData.productOverrides === 'object' ? remoteData.productOverrides : {},
          deletedProductIds: Array.isArray(remoteData.deletedProductIds) ? remoteData.deletedProductIds : [],
          addedProducts: Array.isArray(remoteData.addedProducts) ? remoteData.addedProducts : [],
          addedAccessories: Array.isArray(remoteData.addedAccessories) ? remoteData.addedAccessories : [],
          lastUpdated: remoteLastUpdated,
          version: remoteVersion,
        };
        saveLocalDiskCache();
        broadcastDatabaseUpdate();
        return true;
      }
    }
  } catch (err) {
    console.error('[Neon PostgreSQL] Error checking remote state:', err);
    isNeonConnected = false;
  }
  return false;
}

// Initialize Neon table and seed if needed
async function initNeonDatabase() {
  if (!pool) {
    console.log('[Neon PostgreSQL] No DATABASE_URL provided. Operating in local storage mode.');
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_database (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        version INT NOT NULL DEFAULT 1,
        last_updated BIGINT NOT NULL
      );
    `);
    isNeonConnected = true;
    console.log('[Neon PostgreSQL] Verified table "app_database".');

    const res = await pool.query('SELECT data, version, last_updated FROM app_database WHERE id = $1', ['main']);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const remoteData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      dbState = {
        bookings: Array.isArray(remoteData.bookings) ? remoteData.bookings : [],
        reservedProductIds: Array.isArray(remoteData.reservedProductIds) ? remoteData.reservedProductIds : [],
        productOverrides: remoteData.productOverrides && typeof remoteData.productOverrides === 'object' ? remoteData.productOverrides : {},
        deletedProductIds: Array.isArray(remoteData.deletedProductIds) ? remoteData.deletedProductIds : [],
        addedProducts: Array.isArray(remoteData.addedProducts) ? remoteData.addedProducts : [],
        addedAccessories: Array.isArray(remoteData.addedAccessories) ? remoteData.addedAccessories : [],
        lastUpdated: Number(row.last_updated) || Date.now(),
        version: parseInt(row.version, 10) || 1,
      };
      saveLocalDiskCache();
      console.log(`[Neon PostgreSQL] Loaded existing database from Neon (v${dbState.version}).`);
    } else {
      // Seed Neon with current state
      await pool.query(
        `INSERT INTO app_database (id, data, version, last_updated)
         VALUES ('main', $1, $2, $3);`,
        [JSON.stringify(dbState), dbState.version || 1, dbState.lastUpdated || Date.now()]
      );
      console.log('[Neon PostgreSQL] Seeded initial database into Neon.');
    }

    // Start periodic background synchronization with Neon every 3 seconds
    setInterval(() => {
      syncFromNeon().catch(() => {});
    }, 3000);
  } catch (err) {
    console.error('[Neon PostgreSQL] Initialization error:', err);
  }
}

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
      dbProvider: 'neon-postgresql',
      neonConnected: isNeonConnected,
      version: dbState.version,
      lastUpdated: dbState.lastUpdated,
      connectedClients: sseClients.size,
      time: new Date().toISOString(),
    });
  });

  // GET Current full database state with anti-caching headers
  app.get('/api/database', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Check Neon to ensure we have the absolute latest state
    await syncFromNeon().catch(() => {});

    res.json({
      success: true,
      data: dbState,
      neonConnected: isNeonConnected,
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
  app.post('/api/database/update', async (req, res) => {
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
        await persistState(true);
      }

      res.json({
        success: true,
        data: dbState,
        version: dbState.version,
        lastUpdated: dbState.lastUpdated,
        neonConnected: isNeonConnected,
      });
    } catch (err: any) {
      console.error('[API] Error updating database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST force sync entire database from admin (authoritative upload)
  app.post('/api/database/sync-all', async (req, res) => {
    console.log('[API] Received sync-all request');
    try {
      const fullState = req.body;
      if (!fullState || typeof fullState !== 'object') {
        console.warn('[API] sync-all: Invalid payload received');
        return res.status(400).json({ success: false, error: 'Invalid payload' });
      }

      console.log('[API] sync-all: Updating memory state...');
      if (Array.isArray(fullState.bookings)) dbState.bookings = fullState.bookings;
      if (Array.isArray(fullState.reservedProductIds)) dbState.reservedProductIds = fullState.reservedProductIds;
      if (fullState.productOverrides && typeof fullState.productOverrides === 'object') {
        dbState.productOverrides = fullState.productOverrides;
      }
      if (Array.isArray(fullState.deletedProductIds)) dbState.deletedProductIds = fullState.deletedProductIds;
      if (Array.isArray(fullState.addedProducts)) dbState.addedProducts = fullState.addedProducts;
      if (Array.isArray(fullState.addedAccessories)) dbState.addedAccessories = fullState.addedAccessories;

      console.log('[API] sync-all: Persisting to database...');
      await persistState(true);

      console.log(`[API] sync-all: SUCCESS. Version: ${dbState.version}, Neon: ${isNeonConnected}`);

      res.json({
        success: true,
        data: dbState,
        version: dbState.version,
        lastUpdated: dbState.lastUpdated,
        neonConnected: isNeonConnected,
      });
    } catch (err: any) {
      console.error('[API] CRITICAL error in sync-all:', err);
      // Ensure we always return JSON
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: `Internal server error: ${err.message || 'Unknown error'}` 
        });
      }
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

  // Initialize Neon database before listening
  await initNeonDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jes Fashion Server with Neon PostgreSQL running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
