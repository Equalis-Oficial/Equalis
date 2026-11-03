/**
 * Configuração de Banco de Dados — MySQL 8
 * Gerencia a conexão com o container Docker equalis_mysql (porta 3306)
 * e realiza a inicialização automática das tabelas e do seed DDL/DML.
 */
const fs = require('fs');
const path = require('path');

const SCHEMA_SQL_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const SEED_SQL_PATH = path.join(__dirname, '..', '..', 'database', 'seed.sql');

let mysqlPool = null;
let isConnecting = false;

async function initMySQLConnection() {
  if (isConnecting) return false;
  isConnecting = true;
  try {
    const mysql = require('mysql2/promise');
    if (!mysqlPool) {
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'equalis_db',
        waitForConnections: true,
        connectionLimit: 10,
        multipleStatements: true,
      });
    }

    const conn = await mysqlPool.getConnection();

    // Executa schema DDL se necessário sem derrubar a conexão se já existir
    if (fs.existsSync(SCHEMA_SQL_PATH)) {
      try {
        const schemaSql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf-8');
        await conn.query(schemaSql);
      } catch (schemaErr) {
        console.warn('ℹ [MySQL Schema]:', schemaErr.message);
      }
    }

    // Garante compatibilidade de colunas em tabelas existentes
    try {
      await conn.query(`
        ALTER TABLE Candidato
          ADD COLUMN cidade VARCHAR(50) DEFAULT 'Guarulhos',
          ADD COLUMN estado CHAR(2) DEFAULT 'SP',
          ADD COLUMN area_atuacao VARCHAR(100) DEFAULT 'Marketing',
          ADD COLUMN usa_tela_acessivel TINYINT(1) DEFAULT 0;
      `);
    } catch (_) {}
    try {
      await conn.query(`
        ALTER TABLE Vaga
          ADD COLUMN requerimentos TEXT,
          ADD COLUMN categoria VARCHAR(50) DEFAULT 'Atendimento',
          ADD COLUMN carga_horaria VARCHAR(30) DEFAULT '6 horas',
          ADD COLUMN link_externo VARCHAR(255);
      `);
    } catch (_) {}
    try {
      await conn.query(`
        ALTER TABLE Mensagem
          ADD COLUMN remetente_id INT NULL,
          ADD COLUMN remetente_tipo VARCHAR(20) DEFAULT 'CANDIDATO',
          ADD COLUMN destinatario_id INT NULL,
          ADD COLUMN destinatario_tipo VARCHAR(20) DEFAULT 'CANDIDATO';
      `);
    } catch (_) {}

    // Executa seed DML inicial se necessário
    if (fs.existsSync(SEED_SQL_PATH)) {
      try {
        const seedSql = fs.readFileSync(SEED_SQL_PATH, 'utf-8');
        await conn.query(seedSql);
      } catch (seedErr) {
        console.warn('ℹ [MySQL Seed]:', seedErr.message);
      }
    }

    conn.release();
    console.log('✔ [MySQL 8] Conectado com sucesso ao banco equalis_db (porta 3306) e sincronizado para o DBeaver!');
    isConnecting = false;
    return true;
  } catch (err) {
    mysqlPool = null;
    isConnecting = false;
    console.error('❌ [MySQL Connection Error]:', err.message || err);
    return false;
  }
}

async function execMySQL(sql, params = []) {
  if (!mysqlPool) {
    await initMySQLConnection();
  }
  if (!mysqlPool) return null;
  try {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  } catch (err) {
    console.warn('[MySQL Query Warning]:', err.message);
    return null;
  }
}

function isMySQLConnected() {
  return Boolean(mysqlPool);
}

module.exports = {
  initMySQLConnection,
  execMySQL,
  isMySQLConnected,
};

