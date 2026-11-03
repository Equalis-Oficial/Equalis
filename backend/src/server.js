/**
 * Servidor Backend API REST — Equalis (UNICEPLAC 2026)
 * Inicialização do servidor Express conectado ao MySQL 8 (Docker).
 * Escuta em 0.0.0.0:3333 permitindo conexões diretas do emulador, Web e dispositivos físicos (Expo Go).
 */
const http = require('http');
const app = require('./app');
const { initMySQLConnection } = require('./config/database');
const { INITIAL_DATA } = require('./models/dataStore');

function createServer() {
  return http.createServer(app);
}

if (require.main === module) {
  const PORT = process.env.PORT || 3333;

  initMySQLConnection().then((connected) => {
    if (!connected) {
      console.log('⏳ [MySQL] Tentando reconectar periodicamente ao container equalis_mysql...');
      const interval = setInterval(async () => {
        const ok = await initMySQLConnection();
        if (ok) {
          console.log('✔ [MySQL] Reconectado com sucesso em segundo plano!');
          clearInterval(interval);
        }
      }, 3000);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================================');
    console.log(` ✔ [Equalis API] Servidor Express (MVC) rodando em http://0.0.0.0:${PORT}`);
    console.log(' ✔ Acessível na rede local pelo Expo Go e no navegador Web');
    console.log('====================================================================');
  });
}

module.exports = {
  app,
  createServer,
  INITIAL_DATA,
};
