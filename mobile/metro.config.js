/**
 * Configuração do Metro Bundler — Equalis (UNICEPLAC 2026)
 * Inclui proxy reverso integrado para `/api/*` via `enhanceMiddleware`.
 * Isso permite que o Expo Go em modo `--tunnel` (*.on.expo.app / *.exp.direct),
 * LAN ou Web acesse a API Backend e o banco MySQL 8 através do próprio túnel do Metro,
 * sem precisar expor a porta 3333 separadamente na rede.
 */
const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

// Inicializa o backend Express + MySQL automaticamente caso ainda não esteja rodando na porta 3333
let embeddedApp = null;
try {
  embeddedApp = require('../backend/src/app');
  const { initMySQLConnection } = require('../backend/src/config/database');
  const probe = http.get({ hostname: '127.0.0.1', port: 3333, path: '/api/health', timeout: 800 }, (res) => {
    res.resume();
  });
  probe.on('error', () => {
    const server = http.createServer(embeddedApp);
    server.on('error', () => {
      // Porta 3333 já está em uso por outro processo do backend
    });
    server.listen(3333, '0.0.0.0', () => {
      console.log(' ✔ [Metro -> Equalis API] Backend Express iniciado automaticamente na porta 3333');
      initMySQLConnection().catch(() => {});
    });
  });
} catch (err) {
  console.warn('ℹ [Metro Config] Backend embutido não carregado:', err.message);
}

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      if (req.url && (req.url === '/api' || req.url.startsWith('/api/'))) {
        const options = {
          hostname: '127.0.0.1',
          port: 3333,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: '127.0.0.1:3333',
          },
        };

        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', () => {
          // Fallback em memória/processo se a porta 3333 não responder a tempo
          if (embeddedApp) {
            return embeddedApp(req, res, next);
          }
          res.writeHead(502, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ erro: 'Servidor Backend indisponível na porta 3333.' }));
        });

        req.pipe(proxyReq, { end: true });
        return;
      }

      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;

