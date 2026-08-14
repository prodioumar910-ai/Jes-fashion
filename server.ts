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
}

const DB_FILE_PATH = path.join(process.cwd(), 'data_db.json');

// Default initial state
const defaultDb: DatabaseSchema = {
  bookings: [],
  reservedProductIds: [],
  productOverrides: {},
  deletedProductIds: [],
  addedProducts: [],
  addedAccessories: [],
  lastUpdated: Date.now(),
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
      };
    }
  } catch (err) {
    console.error('[Database] Failed to read database file, initializing default:', err);
  }
  return { ...defaultDb };
}

let dbState: DatabaseSchema = loadDatabase();

// Save database to disk
function saveDatabase() {
  try {
    dbState.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to write database to disk:', err);
  }
}

// Server-Sent Events (SSE) subscribers for instant multi-device sync
const sseClients = new Set<express.Response>();

function broadcastDatabaseUpdate() {
  const payload = `data: ${JSON.stringify(dbState)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // GET Current full database state
  app.get('/api/database', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      success: true,
      data: dbState,
    });
  });

  // Realtime stream via Server-Sent Events (SSE)
  app.get('/api/database/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    // Send initial snapshot immediately upon connecting
    res.write(`data: ${JSON.stringify(dbState)}\n\n`);

    sseClients.add(res);

    // Heartbeat to keep connection alive
    const interval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(interval);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(interval);
      sseClients.delete(res);
    });
  });

  // POST update full or partial database
  app.post('/api/database/update', (req, res) => {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid payload' });
      }

      if (Array.isArray(updates.bookings)) dbState.bookings = updates.bookings;
      if (Array.isArray(updates.reservedProductIds)) dbState.reservedProductIds = updates.reservedProductIds;
      if (updates.productOverrides && typeof updates.productOverrides === 'object') {
        dbState.productOverrides = updates.productOverrides;
      }
      if (Array.isArray(updates.deletedProductIds)) dbState.deletedProductIds = updates.deletedProductIds;
      if (Array.isArray(updates.addedProducts)) dbState.addedProducts = updates.addedProducts;
      if (Array.isArray(updates.addedAccessories)) dbState.addedAccessories = updates.addedAccessories;

      saveDatabase();
      broadcastDatabaseUpdate();

      res.json({ success: true, data: dbState });
    } catch (err: any) {
      console.error('[API] Error updating database:', err);
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
