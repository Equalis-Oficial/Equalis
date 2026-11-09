-- ====================================================================
-- EQUALIS - SCHEMA OFICIAL DE BANCO DE DADOS (MYSQL 8)
-- Baseado no Modelo de Entidade-Relacionamento (MER) do Relatório Parcial
-- Projeto Integrado de Desenvolvimento Mobile - UNICEPLAC 2026
-- ====================================================================

CREATE DATABASE IF NOT EXISTS equalis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE equalis_db;

-- ====================================================================
-- NÚCLEO OFICIAL DO MER (PÁGINA 11 DO RELATÓRIO PARCIAL)
-- ====================================================================

-- 1. Tabela Empresa (UC-14, RN-002, RN-018, RN-019)
CREATE TABLE IF NOT EXISTS Empresa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_fantasia VARCHAR(100) NOT NULL,
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  descricao TEXT,
  setor VARCHAR(100) NULL,
  localizacao VARCHAR(150) NULL,
  site VARCHAR(255) NULL,
  telefone VARCHAR(30) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB;

-- 2. Tabela Candidato
CREATE TABLE IF NOT EXISTS Candidato (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NULL UNIQUE,
  resumo_profissional TEXT,
  url_curriculo TEXT,
  cidade VARCHAR(50) DEFAULT '',
  estado CHAR(2) DEFAULT '',
  area_atuacao VARCHAR(100) DEFAULT '',
  usa_tela_acessivel TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB;

-- 3. Tabela Deficiencia
CREATE TABLE IF NOT EXISTS Deficiencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT
) ENGINE=InnoDB;

-- 4. Tabela Associativa Candidato_Deficiencia (Lei nº 8.213/91 & LBI)
CREATE TABLE IF NOT EXISTS Candidato_Deficiencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT NOT NULL,
  deficiencia_id INT NOT NULL,
  cid VARCHAR(20) NULL,
  url_laudo_medico TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidato_id) REFERENCES Candidato(id) ON DELETE CASCADE,
  FOREIGN KEY (deficiencia_id) REFERENCES Deficiencia(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabela Vaga (RN-026, RN-027 - Acessibilidade Obrigatória)
CREATE TABLE IF NOT EXISTS Vaga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  requerimentos TEXT,
  categoria VARCHAR(50) DEFAULT 'Atendimento',
  carga_horaria VARCHAR(30) DEFAULT '6 horas',
  modalidade VARCHAR(20) NOT NULL DEFAULT 'Presencial',
  cidade VARCHAR(50),
  estado CHAR(2),
  salario DECIMAL(10,2),
  link_externo VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ABERTA',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (empresa_id) REFERENCES Empresa(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabela Associativa Vaga_Acessibilidade (RN-026, RN-027)
CREATE TABLE IF NOT EXISTS Vaga_Acessibilidade (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vaga_id INT NOT NULL,
  deficiencia_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vaga_id) REFERENCES Vaga(id) ON DELETE CASCADE,
  FOREIGN KEY (deficiencia_id) REFERENCES Deficiencia(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabela Candidatura (Máquina de 4 Estados e Notificação Reativa)
CREATE TABLE IF NOT EXISTS Candidatura (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT NOT NULL,
  vaga_id INT NOT NULL,
  status_processo VARCHAR(50) DEFAULT 'ENVIADA',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_candidato_vaga (candidato_id, vaga_id),
  FOREIGN KEY (candidato_id) REFERENCES Candidato(id) ON DELETE CASCADE,
  FOREIGN KEY (vaga_id) REFERENCES Vaga(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- TABELAS COMPLEMENTARES DO PROTÓTIPO FIGMA (PERFIL, CURRÍCULO E REDE)
-- ====================================================================

-- 8. Tabela Formacao_Academica (Telas FORMAÇÃO ACADÊMICA #196:419 / #365:423)
CREATE TABLE IF NOT EXISTS Formacao_Academica (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT NOT NULL,
  instituicao VARCHAR(150) NOT NULL,
  diploma VARCHAR(100),
  area_estudo VARCHAR(100),
  mes_inicio VARCHAR(20),
  ano_inicio VARCHAR(4),
  mes_termino VARCHAR(20),
  ano_termino VARCHAR(4),
  atividades_grupos TEXT,
  descricao TEXT,
  competencias VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidato_id) REFERENCES Candidato(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Tabela Experiencia_Profissional (Telas CARGO #201:476 / #405:438)
CREATE TABLE IF NOT EXISTS Experiencia_Profissional (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  organizacao VARCHAR(150) NOT NULL,
  tipo_emprego VARCHAR(50),
  localidade VARCHAR(100),
  tipo_localidade VARCHAR(50),
  mes_inicio VARCHAR(20),
  ano_inicio VARCHAR(4),
  descricao TEXT,
  competencias VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidato_id) REFERENCES Candidato(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Tabela Publicacao (Telas HOME #125:3790, PUBLICAR #272:959, VER PUBLICAÇÕES #426:267)
CREATE TABLE IF NOT EXISTS Publicacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor_tipo ENUM('CANDIDATO', 'EMPRESA') NOT NULL DEFAULT 'CANDIDATO',
  autor_id INT NOT NULL,
  autor_nome VARCHAR(100) NOT NULL,
  autor_subtitulo VARCHAR(150),
  conteudo TEXT NOT NULL,
  vaga_id INT NULL,
  curtidas INT DEFAULT 0,
  comentarios INT DEFAULT 0,
  compartilhamentos INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. Tabela Conexao (Telas REDE #232:168 / #372:616)
CREATE TABLE IF NOT EXISTS Conexao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT NOT NULL,
  nome_contato VARCHAR(100) NOT NULL,
  cargo_contato VARCHAR(150) NOT NULL,
  conexoes_em_comum INT DEFAULT 15,
  total_conexoes INT DEFAULT 312,
  status VARCHAR(20) DEFAULT 'SUGERIDO',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidato_id) REFERENCES Candidato(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Tabela Mensagem (Tela MENSAGENS #441:276)
CREATE TABLE IF NOT EXISTS Mensagem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  remetente_id INT NULL,
  remetente_tipo VARCHAR(20) DEFAULT 'CANDIDATO',
  destinatario_id INT NULL,
  destinatario_tipo VARCHAR(20) DEFAULT 'CANDIDATO',
  remetente_nome VARCHAR(100) NOT NULL,
  remetente_cargo VARCHAR(100),
  conteudo TEXT NOT NULL,
  horario VARCHAR(20) DEFAULT '10:12',
  nao_lida TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. Tabela Notificacao (UC-22 & RN-031 - Central de Notificações Acessível)
CREATE TABLE IF NOT EXISTS Notificacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  usuario_tipo ENUM('CANDIDATO', 'EMPRESA') NOT NULL DEFAULT 'CANDIDATO',
  tipo_evento VARCHAR(50) NOT NULL DEFAULT 'CANDIDATURA',
  titulo VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  referencia_id INT NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notificacao_usuario (usuario_id),
  INDEX idx_notificacao_lida (lida),
  INDEX idx_notificacao_usuario_lida (usuario_id, usuario_tipo, lida)
) ENGINE=InnoDB;
