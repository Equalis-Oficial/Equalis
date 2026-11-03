#!/usr/bin/env bash
# ====================================================================
# EQUALIS — SCRIPT DE INICIALIZAÇÃO UNIFICADA
# Inicia o Docker MySQL, o Servidor Backend e o Expo Mobile (SDK 58)
# ====================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "======================================================="
echo " ♿ EQUALIS — PLATAFORMA DE EMPREGABILIDADE PCD (2026)"
echo "======================================================="

# 1. Inicia o container do MySQL 8 no Docker caso não esteja rodando
if ! docker ps | grep -q equalis_mysql; then
  echo "▶ Iniciando o container MySQL 8 no Docker (equalis_mysql)..."
  docker compose up -d
  sleep 2
fi

# 2. Inicia o Backend em segundo plano
echo "▶ Iniciando a API Backend (porta 3333)..."
(cd "$ROOT_DIR/backend" && npm start) &
BACKEND_PID=$!

cleanup() {
  echo ""
  echo "Encerrando servidores do Equalis..."
  kill "$BACKEND_PID" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

sleep 1

# 3. Inicia o Expo Mobile (repassando argumentos como --tunnel ou --web, com proxy /api embutido no Metro)
echo "▶ Iniciando o Expo Mobile (com proxy reverso /api integrado ao Metro)..."
cd "$ROOT_DIR/mobile"
npx expo start -c "$@"