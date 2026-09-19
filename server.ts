import 'dotenv/config';
import express from 'express';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const app = express();
const PORT = 3000;

// Setup Neon client
const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Simple in-memory state for the current execution
let dbState = {
  bookings: [],
  reservedProductIds: [],
  productOverrides: {},
  deletedProductIds: [],
  addedProducts: [],
  addedAccessories: [],
  lastUpdated: Date.now(),
  version: 1,
};

let isNeonConnected = false;
let lastNeonError = !DATABASE_URL ? 'Variable DATABASE_URL manquante dans Vercel' : '';

// Middleware to ensure DB is initialized
async function ensureDb() {
  if (!sql) {
    isNeonConnected = false;
    lastNeonError = 'Variable DATABASE_URL manquante';
    return;
  }
  if (isNeonConnected) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS app_database (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        version INT NOT NULL DEFAULT 1,
        last_updated BIGINT NOT NULL
      );
    `;
    
    const rows = await sql`SELECT data, version, last_updated FROM app_database WHERE id = ${'main'}`;
    if (rows.length > 0) {
      const row: any = rows[0];
      const remoteData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      dbState = {
        bookings: Array.isArray(remoteData.bookings) ? remoteData.bookings : [],
        reservedProductIds: Array.isArray(remoteData.reservedProductIds) ? remoteData.reservedProductIds : [],
        productOverrides: remoteData.productOverrides || {},
        deletedProductIds: Array.isArray(remoteData.deletedProductIds) ? remoteData.deletedProductIds : [],
        addedProducts: Array.isArray(remoteData.addedProducts) ? remoteData.addedProducts : [],
        addedAccessories: Array.isArray(remoteData.addedAccessories) ? remoteData.addedAccessories : [],
        lastUpdated: Number(row.last_updated) || Date.now(),
        version: parseInt(row.version, 10) || 1,
      };
    }
    isNeonConnected = true;
    lastNeonError = '';
  } catch (err: any) {
    console.error('[Neon] Error:', err);
    lastNeonError = err.message || 'DB Error';
    isNeonConnected = false;
  }
}

app.use(express.json({ limit: '50mb' }));

// CORS & Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await ensureDb();
    if (sql) {
      await sql`SELECT 1`; // Real test query
      isNeonConnected = true;
      lastNeonError = '';
    }
  } catch (err: any) {
    isNeonConnected = false;
    lastNeonError = err.message || 'Erreur de test Neon';
  }
  res.json({ status: 'ok', neon: isNeonConnected, error: lastNeonError });
});

// GET database
app.get('/api/database', async (req, res) => {
  try {
    await ensureDb();
    if (sql) {
      const rows = await sql`SELECT data, version, last_updated FROM app_database WHERE id = ${'main'}`;
      isNeonConnected = true;
      lastNeonError = '';
      if (rows.length > 0) {
        const row: any = rows[0];
        const remoteData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        dbState = {
          bookings: Array.isArray(remoteData.bookings) ? remoteData.bookings : [],
          reservedProductIds: Array.isArray(remoteData.reservedProductIds) ? remoteData.reservedProductIds : [],
          productOverrides: remoteData.productOverrides || {},
          deletedProductIds: Array.isArray(remoteData.deletedProductIds) ? remoteData.deletedProductIds : [],
          addedProducts: Array.isArray(remoteData.addedProducts) ? remoteData.addedProducts : [],
          addedAccessories: Array.isArray(remoteData.addedAccessories) ? remoteData.addedAccessories : [],
          lastUpdated: Number(row.last_updated) || Date.now(),
          version: parseInt(row.version, 10) || 1,
        };
      }
    }
  } catch (err: any) {
    console.error('[Neon Fetch Error]:', err);
    isNeonConnected = false;
    lastNeonError = err.message || 'Erreur lors de la récupération des données';
  }

  res.json({ success: isNeonConnected, data: dbState, neonConnected: isNeonConnected, neonError: lastNeonError });
});

// POST update
app.post('/api/database/update', async (req, res) => {
  await ensureDb();
  if (!sql) return res.status(500).json({ success: false, error: 'No DB URL' });

  try {
    const updates = req.body;
    // Simple merge logic
    Object.assign(dbState, updates);
    dbState.lastUpdated = Date.now();
    dbState.version++;

    await sql`
      INSERT INTO app_database (id, data, version, last_updated)
       VALUES (${'main'}, ${JSON.stringify(dbState)}, ${dbState.version}, ${dbState.lastUpdated})
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, version = EXCLUDED.version, last_updated = EXCLUDED.last_updated;
    `;

    res.json({ success: true, version: dbState.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST sync-all
app.post('/api/database/sync-all', async (req, res) => {
  await ensureDb();
  if (!sql) return res.status(500).json({ success: false, error: 'No DB URL' });

  try {
    const fullState = req.body;
    dbState = {
      bookings: Array.isArray(fullState.bookings) ? fullState.bookings : [],
      reservedProductIds: Array.isArray(fullState.reservedProductIds) ? fullState.reservedProductIds : [],
      productOverrides: fullState.productOverrides || {},
      deletedProductIds: Array.isArray(fullState.deletedProductIds) ? fullState.deletedProductIds : [],
      addedProducts: Array.isArray(fullState.addedProducts) ? fullState.addedProducts : [],
      addedAccessories: Array.isArray(fullState.addedAccessories) ? fullState.addedAccessories : [],
      lastUpdated: Date.now(),
      version: dbState.version + 1
    };

    await sql`
      INSERT INTO app_database (id, data, version, last_updated)
       VALUES (${'main'}, ${JSON.stringify(dbState)}, ${dbState.version}, ${dbState.lastUpdated})
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, version = EXCLUDED.version, last_updated = EXCLUDED.last_updated;
    `;

    res.json({ success: true, version: dbState.version });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  app.listen(PORT, '0.0.0.0', () => console.log(`Server on ${PORT}`));
} else if (process.env.NODE_ENV !== 'production') {
  // Dynamic import for Vite in dev
  const startDev = async () => {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => console.log(`Dev: http://localhost:${PORT}`));
  };
  startDev();
}

export default app;
