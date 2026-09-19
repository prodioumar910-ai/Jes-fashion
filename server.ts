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
      connectionTimeoutMillis: 10000, // Increased for cold starts
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
let lastNeonError = '';

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
    if (process.env.NODE_ENV === 'production') return;
    fs.writeFileSync(DB_TMP_PATH, serialized, 'utf-8');
    fs.renameSync(DB_TMP_PATH, DB_FILE_PATH);
  } catch (err) {
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
      lastNeonError = '';
    } catch (err: any) {
      console.error('[Neon PostgreSQL] Failed to save to Neon:', err);
      isNeonConnected = false;
      lastNeonError = err.message || 'Error saving to Neon';
    }
  }

  if (triggerBroadcast) {
    broadcastDatabaseUpdate();
  }
}

// Fetch latest state from Neon
async function syncFromNeon(): Promise<boolean> {
  if (!pool) return false;
  try {
    const res = await pool.query('SELECT data, version, last_updated FROM app_database WHERE id = $1', ['main']);
    isNeonConnected = true;
    lastNeonError = '';
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const remoteVersion = parseInt(row.version, 10) || 1;
      const remoteLastUpdated = Number(row.last_updated) || 0;
      
      if (remoteVersion !== (dbState.version || 0) || remoteLastUpdated > (dbState.lastUpdated || 0)) {
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
  } catch (err: any) {
    console.error('[Neon PostgreSQL] Error checking remote state:', err);
    isNeonConnected = false;
    lastNeonError = err.message || 'Connection error';
  }
  return false;
}

// Initialize Neon table
async function initNeonDatabase() {
  if (!pool) return;
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
    lastNeonError = '';
    await syncFromNeon();
  } catch (err: any) {
    console.error('[Neon PostgreSQL] Initialization error:', err);
    isNeonConnected = false;
    lastNeonError = err.message || 'Initialization failed';
  }
}

// SSE Subscribers
const sseClients = new Set<express.Response>();
function broadcastDatabaseUpdate() {
  const payload = `data: ${JSON.stringify(dbState)}\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.write(payload);
      if (typeof (client as any).flush === 'function') (client as any).flush();
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Middleware to ensure DB is connected
let isInitializing = false;
async function ensureDb() {
  if (isNeonConnected || !pool || isInitializing) return;
  isInitializing = true;
  try {
    await initNeonDatabase();
  } finally {
    isInitializing = false;
  }
}

app.use('/api', async (req, res, next) => {
  await ensureDb();
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    neonConnected: isNeonConnected,
    version: dbState.version,
    lastUpdated: dbState.lastUpdated,
    neonError: lastNeonError
  });
});

app.get('/api/database', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  await syncFromNeon().catch(() => {});
  res.json({
    success: true,
    data: dbState,
    neonConnected: isNeonConnected,
    neonError: lastNeonError,
  });
});

app.get('/api/database/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform, no-store');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify(dbState)}\n\n`);
  if (typeof (res as any).flush === 'function') (res as any).flush();
  sseClients.add(res);
  const interval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
      if (typeof (res as any).flush === 'function') (res as any).flush();
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

app.post('/api/database/update', async (req, res) => {
  try {
    const updates = req.body;
    await syncFromNeon().catch(() => {});
    
    if (Array.isArray(updates.bookings)) dbState.bookings = updates.bookings;
    if (Array.isArray(updates.reservedProductIds)) dbState.reservedProductIds = updates.reservedProductIds;
    if (updates.productOverrides && typeof updates.productOverrides === 'object') {
      dbState.productOverrides = { ...dbState.productOverrides, ...updates.productOverrides };
    }
    if (Array.isArray(updates.deletedProductIds)) dbState.deletedProductIds = updates.deletedProductIds;
    if (Array.isArray(updates.addedProducts)) dbState.addedProducts = updates.addedProducts;
    if (Array.isArray(updates.addedAccessories)) dbState.addedAccessories = updates.addedAccessories;

    await persistState(true);
    res.json({ success: true, version: dbState.version, neonConnected: isNeonConnected });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/database/sync-all', async (req, res) => {
  try {
    const fullState = req.body;
    dbState.bookings = Array.isArray(fullState.bookings) ? fullState.bookings : [];
    dbState.reservedProductIds = Array.isArray(fullState.reservedProductIds) ? fullState.reservedProductIds : [];
    dbState.productOverrides = fullState.productOverrides && typeof fullState.productOverrides === 'object' ? fullState.productOverrides : {};
    dbState.deletedProductIds = Array.isArray(fullState.deletedProductIds) ? fullState.deletedProductIds : [];
    dbState.addedProducts = Array.isArray(fullState.addedProducts) ? fullState.addedProducts : [];
    dbState.addedAccessories = Array.isArray(fullState.addedAccessories) ? fullState.addedAccessories : [];

    await persistState(true);
    res.json({ success: true, version: dbState.version, neonConnected: isNeonConnected });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deployment logic
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    createViteServer({ server: { middlewareMode: true }, appType: 'spa' }).then(vite => {
      app.use(vite.middlewares);
      app.listen(PORT, '0.0.0.0', () => console.log(`Dev Server: http://localhost:${PORT}`));
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    app.listen(PORT, '0.0.0.0', () => console.log(`Prod Server: http://localhost:${PORT}`));
  }
}

export default app;
