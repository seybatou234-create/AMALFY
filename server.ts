import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/api.js';
import { cyberShield } from './server/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Hardened Security Headers (OWASP Top 10, anti-sniffing, anti-XSS)
  app.use(cyberShield.securityHeadersMiddleware());

  // 2. Body Parser with payload limit protection (supports multi-image base64 uploads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 3. Cyber Shield WAF & Anti-DDoS Rate Limiting
  app.use(cyberShield.rateLimiterMiddleware());
  app.use(cyberShield.cyberShieldMiddleware());
  app.use(cyberShield.inputSanitizerMiddleware());

  // 4. API Routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      name: 'LEPP 2.0 Backend',
      shield: 'Actif',
      threatDefense: 'Opérationnelle'
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LEPP 2.0] Serveur opérationnel sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
  process.exit(1);
});
