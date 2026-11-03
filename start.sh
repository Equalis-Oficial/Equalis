#!/usr/bin/env bash
# ====================================================================
# EQUALIS — SCRIPT DE INICIALIZAÇÃO UNIFICADA (PRODUÇÃO & BANCA)
# Verifica Docker, MySQL 8, API Backend e inicia o Expo com Túnel
# ====================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "======================================================="
echo " ♿ EQUALIS — PLATAFORMA DE EMPREGABILIDADE PCD (2026)"
echo "======================================================="

# --------------------------------------------------------------------
# 1. VERIFICAÇÃO DO DOCKER DAEMON
# --------------------------------------------------------------------
echo "▶ [1/4] Verificando se o serviço do Docker está ativo..."
if ! docker info >/dev/null 2>&1; then
  echo "⚠️  O serviço do Docker não está rodando ou o usuário atual não tem permissão."
  echo "Tentando iniciar o serviço do Docker via systemctl..."
  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start docker 2>/dev/null || true
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "❌ Erro: Não foi possível conectar ao Docker daemon."
    echo "👉 Execute no seu terminal: sudo systemctl start docker"
    echo "👉 E adicione seu usuário ao grupo docker: sudo usermod -aG docker \$USER"
    exit 1
  fi
fi
echo "✔ Docker daemon ativo e operacional."

# --------------------------------------------------------------------
# 2. VERIFICAÇÃO E INICIALIZAÇÃO DO MYSQL 8 (CONTAINER equalis_mysql)
# --------------------------------------------------------------------
echo "▶ [2/4] Verificando container MySQL 8 (equalis_mysql)..."
if ! docker ps --filter "name=equalis_mysql" --format "{{.Names}}" | grep -q "^equalis_mysql$"; then
  echo "▶ Iniciando o container MySQL 8 via docker compose..."
  docker compose up -d
fi

echo "⏳ Aguardando MySQL 8 responder na porta 3306..."
MYSQL_READY=0
for i in {1..20}; do
  if docker exec equalis_mysql mysqladmin -u root -proot ping --silent >/dev/null 2>&1; then
    MYSQL_READY=1
    break
  fi
  sleep 1
done

if [ "$MYSQL_READY" -eq 1 ]; then
  echo "✔ MySQL 8 conectado com sucesso no banco equalis_db (porta 3306)!"
else
  echo "⚠️  MySQL demorou para responder ao ping, prosseguindo com inicialização..."
fi

# --------------------------------------------------------------------
# 3. INICIALIZAÇÃO DA API BACKEND (EXPRESS PORTA 3333)
# --------------------------------------------------------------------
echo "▶ [3/4] Verificando e iniciando a API Backend (porta 3333)..."

# Mata processo anterior na porta 3333 se houver algum processo zumbi
if command -v fuser >/dev/null 2>&1; then
  fuser -k 3333/tcp >/dev/null 2>&1 || true
fi

(cd "$ROOT_DIR/backend" && npm start) &
BACKEND_PID=$!

cleanup() {
  echo ""
  echo "Encerrando servidores do Equalis..."
  kill "$BACKEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Aguarda a API subir e responder no health check
echo "⏳ Aguardando API Express responder na porta 3333..."
for i in {1..15}; do
  if node -e "require('http').get('http://127.0.0.1:3333/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));" >/dev/null 2>&1; then
    echo "✔ API Backend Express online na porta 3333 (http://localhost:3333/api)!"
    break
  fi
  sleep 0.5
done

# --------------------------------------------------------------------
# 4. DETERMINAÇÃO DO MODO DE CONEXÃO DO EXPO (PADRÃO: --tunnel)
# --------------------------------------------------------------------
EXPO_ARGS=("$@")
HAS_NETWORK_FLAG=0

for arg in "$@"; do
  if [[ "$arg" == "--tunnel" || "$arg" == "--lan" || "$arg" == "--localhost" || "$arg" == "--web" ]]; then
    HAS_NETWORK_FLAG=1
    break
  fi
done

# Se o usuário não passou flag de rede, ativa --tunnel por padrão
if [ "$HAS_NETWORK_FLAG" -eq 0 ]; then
  EXPO_ARGS=("--tunnel" "${EXPO_ARGS[@]}")
  echo "🌐 [Modo de Conexão]: TÚNEL ATIVADO POR PADRÃO (--tunnel)"
  echo "📱 Conecte seu celular escaneando o QR Code no app Expo Go (funciona em 4G/5G e qualquer Wi-Fi)!"
else
  echo "🌐 [Modo de Conexão]: Parâmetros informados: ${EXPO_ARGS[*]}"
fi

echo "▶ [4/4] Iniciando o Expo Mobile com proxy reverso /api integrado ao Metro..."
cd "$ROOT_DIR/mobile"
npx expo start -c "${EXPO_ARGS[@]}"
