// server.js — SAP CAP + Express + MongoDB + CORS + PWA + Logging + Azure-ready
import express from 'express';
import cds from '@sap/cds';
import cors from 'cors';
import env from './srv/config/dotenvXConfig.js';
import { connectToMongo } from './srv/config/connectToMongo.js';
import respPWA from './srv/middlewares/respPWA.handler.js'; // ahora sí activo

export default async function startServer(o = {}) {
  console.log('🚀 Iniciando servidor SAP CAP + Express...');

  try {
    // 1️⃣ Conexión a Mongo
    console.log('🔌 Conectando a MongoDB...');
    await connectToMongo();
    console.log('✅ MongoDB ok');

    // 2️⃣ Configuración de Express
    const app = express();
    app.express = express;

    const isProd = env.NODE_ENV === 'production';
    app.use(cors({ origin: isProd ? '*' : 'http://localhost:5173' }));
    app.use(express.json({ limit: '1mb' }));
    app.use(respPWA);

    // --- Logging middleware ---
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`
        );
      });
      next();
    });

    // Healthcheck
    app.get('/health', (_, res) =>
      res.json({ ok: true, service: 'SAP CAP + Express', time: new Date().toISOString() })
    );

    // 3️⃣ Inyectar Express en CAP
    o.app = app;

    // 4️⃣ Iniciar CAP
    console.log('⚙️ Iniciando CAP...');
    const httpServer = await cds.server(o);
    o.app.httpServer = httpServer;
    console.log('✅ CAP activo');

    // 5️⃣ Rutas REST personalizadas (opcional)
    // const { router: ztRouter } = await import('./srv/api/routes/zterrorlog-service.js');
    // app.use('/api/v1/zterrorlog', ztRouter);

    // 6️⃣ Compatibilidad con el FrontEnd actual
    app.all('/zterrorlog/crud', (_, res) =>
      res.redirect(307, '/odata/v4/api/error/crud')
    );

    // 7️⃣ Middleware de 404
    app.use((req, res) => {
      res.status(404).json({
        ok: false,
        message: `Ruta no encontrada: ${req.originalUrl}`,
      });
    });

    // 8️⃣ Global error handler
    app.use((err, req, res, next) => {
      console.error('💥 Error interno:', err);
      res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        details: err.message,
      });
    });

    // Log final
    const PORT = env.PORT || cds.env.port || 3333;
    console.log(`✅ Servidor CAP+Express en http://localhost:${PORT}`);
    console.log(`   OData ➜ http://localhost:${PORT}/odata/v4/`);
    console.log(`   Health ➜ http://localhost:${PORT}/health`);

    return httpServer;
  } catch (err) {
    console.error('❌ Error al iniciar CAP:', err);
    process.exit(1);
  }
}

// Autoejecución si se lanza directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}
