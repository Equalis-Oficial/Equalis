# ♿ EQUALIS — Plataforma Mobile de Empregabilidade e Controle de Vagas PcD

> **Projeto Integrado de Desenvolvimento Mobile — UNICEPLAC 2026**  
> **Conformidade Legal:** Lei de Cotas nº 8.213/91 e Lei Brasileira de Inclusão nº 13.146/15 (LBI)  
> **Padrão de Acessibilidade:** Diretrizes Internacionais WCAG 2.2 Nível AAA  
> **ODS 10 da ONU:** Redução das Desigualdades  

O **Equalis** é uma plataforma mobile completa para inclusão e empregabilidade de Pessoas com Deficiência (PcD), conectando candidatos capacitados a empresas comprometidas com a acessibilidade universal.

---

## 🚀 Como Executar em Outra Máquina (Guia Rápido)

### 📋 Pré-requisitos
Certifique-se de ter instalado na máquina:
1. **Node.js** (versão 18, 20 ou superior) & `npm`
2. **Docker & Docker Compose** (com o serviço do Docker ativo)
3. **App Expo Go** instalado no seu celular ([Android na Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS na App Store](https://apps.apple.com/app/expo-go/id982107779))

---

### ⚡ Inicialização em 1 Único Comando

Clone o repositório, entre na pasta e execute o script unificado:

```bash
git clone https://github.com/Equalis-Oficial/Equalis.git
cd Equalis
git checkout develop
./start.sh
```

O script `./start.sh` cuidará automaticamente de:
1. Instalar as dependências (`npm install`) no backend e no mobile se for o primeiro clone.
2. Iniciar o container do **MySQL 8.0** via Docker (`docker compose up -d`) e carregar o schema oficial e os dados base.
3. Subir a **API REST Express** na porta `3333` e validar o healthcheck.
4. Iniciar o **Expo com Túnel Cloud** (`--tunnel`) e proxy reverso `/api` no Metro.
5. Exibir o **QR Code** no terminal: basta apontar a câmera do celular ou o app Expo Go para abrir o sistema!

---

### 🛠️ Inicialização Manual Passo a Passo (Opcional)

Se preferir rodar cada serviço em um terminal separado:

```bash
# 1. Instalar dependências
npm run install:all

# 2. Iniciar o Banco de Dados MySQL 8.0
docker compose up -d

# 3. Iniciar a API Backend Express (Porta 3333)
cd backend && npm start

# 4. Em outro terminal, iniciar o Mobile (com Túnel para conectar no celular)
cd mobile && npx expo start --tunnel -c
```

---

## 🧪 Bateria de Testes Automatizados

Para executar toda a suíte de testes (validações algorítmicas de CPF/CNPJ, criptografia scrypt, JWT e **todas as 24 rotas da API integradas ao MySQL 8**):

```bash
# Na raiz do projeto:
npm test

# Ou diretamente na pasta backend:
cd backend && npm test
```

---

## 🏛️ Arquitetura do Sistema

```
Equalis/
├── backend/                       # API REST Express (Porta 3333)
│   ├── database/                  # DDL schema.sql e DML seed.sql (12 tabelas MER)
│   └── src/
│       ├── config/                # Pool de conexões MySQL 8 (mysql2)
│       ├── controllers/           # Camada fina HTTP (8 controllers)
│       ├── services/              # Regras de negócio e casos de uso (8 services)
│       ├── repositories/          # Queries SQL parametrizadas (7 repositories)
│       ├── middlewares/           # Autenticação JWT, tratamento global de erros
│       ├── routes/                # Definição e roteamento REST
│       └── tests/                 # Suíte com 24 testes ponta a ponta
│
├── mobile/                        # Aplicativo React Native (Expo SDK 58)
│   ├── assets/figma/              # 27 imagens e ilustrações oficiais do Figma
│   ├── metro.config.js            # Proxy reverso /api integrado ao Metro (porta 8081)
│   └── src/
│       ├── components/            # Componentes modulares (feed, jobs, profile, common)
│       ├── context/               # AuthAndDataContext e AccessibilityContext (WCAG AAA)
│       ├── hooks/                 # Hooks customizados de filtragem e estado
│       ├── screens/               # 36 telas (Padrão e Acessível Simplificada)
│       ├── services/              # Cliente HTTP resiliente (apiClient) e dados iniciais
│       └── theme/                 # Paleta corporativa, tipografia e assets oficiais
│
├── docker-compose.yml             # Orquestração do MySQL 8.0 (container equalis_mysql)
├── start.sh                       # Script de inicialização unificada com healthcheck
└── package.json                   # Scripts gerais da raiz do projeto
```

---

## 🔑 Contas de Acesso para Demonstração

O banco de dados já inicializa com as contas oficiais da banca avaliadora:

| Perfil | E-mail | Senha | Descrição |
|---|---|---|---|
| **Candidata PcD** | `maria@equalis.com.br` | `equalis123` | Perfil de Marketing Digital com acessibilidade e laudo homologado |
| **Empresa Parceira** | `rh@uniceplac.edu.br` | `equalis123` | Perfil corporativo institucional do Centro Universitário UNICEPLAC |

*Você também pode criar novos usuários livremente através da tela de cadastro do aplicativo.*

---

## ♿ Recursos de Acessibilidade (WCAG 2.2 AAA)
- **Modo Padrão & Modo Acessível**: Alternância dinâmica com 1 toque no ícone `♿` do cabeçalho.
- **Síntese de Voz (Text-to-Speech)**: Leitura em voz alta objetiva em todas as telas via `expo-speech` / Web Speech API.
- **Alto Contraste & Escala Tipográfica**: Ajuste de contraste para fundo escuro e fontes em 100%, 120% e 140%.
