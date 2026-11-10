# Equalis

**Plataforma Mobile de Empregabilidade para Pessoas com Deficiência (PcD)**

Projeto Integrado de Desenvolvimento Mobile — UNICEPLAC | 2026

O **Equalis** é um aplicativo desenvolvido para facilitar a conexão entre Pessoas com Deficiência (PcD) que procuram oportunidades de emprego e empresas que desejam contratar profissionais de forma mais inclusiva.

A plataforma permite que candidatos encontrem vagas, gerenciem seus perfis e tenham acesso a recursos de acessibilidade. Para as empresas, o sistema oferece funcionalidades para divulgação e gerenciamento de oportunidades.

O desenvolvimento considera a Lei de Cotas (Lei nº 8.213/91), a Lei Brasileira de Inclusão (Lei nº 13.146/15) e as recomendações de acessibilidade WCAG 2.2.

## Tecnologias utilizadas

| Área | Tecnologias |
|---|---|
| Mobile | React Native, Expo SDK 58 |
| Backend | Node.js, Express |
| Banco de dados | MySQL 8.0 |
| Autenticação | JWT, scrypt |
| Infraestrutura | Docker, Docker Compose |
| Testes | Testes automatizados e de integração |

## Como executar

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js 18 ou superior e npm
- Docker e Docker Compose
- Expo Go no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Instalação rápida

Clone o repositório:

```bash
git clone https://github.com/Equalis-Oficial/Equalis.git
cd Equalis
git checkout develop
```

Execute o script de inicialização:

```bash
./start.sh
```

O script realiza a instalação das dependências, inicia o MySQL pelo Docker, executa a API e abre o Expo.

Ao finalizar a inicialização, um QR Code será exibido no terminal. Escaneie com o Expo Go para acessar o aplicativo pelo celular.

### Inicialização manual

Também é possível iniciar os serviços separadamente.

**1. Instale as dependências**

```bash
npm run install:all
```

**2. Inicie o banco de dados**

```bash
docker compose up -d
```

**3. Inicie o backend**

```bash
cd backend
npm start
```

A API será executada na porta `3333`.

**4. Inicie o aplicativo**

Em outro terminal, a partir da raiz do projeto:

```bash
cd mobile
npx expo start --tunnel -c
```

Abra o Expo Go e escaneie o QR Code.

## Estrutura do projeto

```text
Equalis/
├── backend/
│   ├── database/         # Estrutura e dados do MySQL
│   └── src/
│       ├── config/       # Configuração do banco
│       ├── controllers/  # Requisições HTTP
│       ├── services/     # Regras de negócio
│       ├── repositories/ # Consultas SQL
│       ├── middlewares/  # Autenticação e erros
│       ├── routes/       # Rotas da API
│       └── tests/        # Testes automatizados
│
├── mobile/
│   ├── assets/           # Imagens e recursos visuais
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── context/      # Estados globais
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── screens/      # Telas do aplicativo
│   │   ├── services/     # Comunicação com a API
│   │   └── theme/        # Cores e tipografia
│   └── metro.config.js
│
├── docker-compose.yml
├── start.sh
└── package.json
```

## Funcionalidades

**Para candidatos**
- Cadastro e autenticação
- Criação e gerenciamento de perfil
- Visualização e busca de vagas
- Recursos de acessibilidade
- Interface padrão e simplificada

**Para empresas**
- Cadastro e autenticação empresarial
- Divulgação de oportunidades
- Gerenciamento de vagas
- Acesso às funcionalidades de recrutamento

**Acessibilidade**
- Alternância entre modo padrão e acessível
- Leitura de textos em voz alta
- Modo de alto contraste
- Ajuste do tamanho da fonte em 100%, 120% e 140%

## Contas para demonstração

O banco de dados possui duas contas de teste para facilitar a apresentação do sistema.

| Perfil | E-mail | Senha |
|---|---|---|
| Candidata PcD | `maria@equalis.com.br` | `equalis123` |
| Empresa | `rh@uniceplac.edu.br` | `equalis123` |

Também é possível criar novas contas pelo aplicativo.

> **Observação:** essas credenciais são destinadas apenas ao ambiente de demonstração e não devem ser utilizadas em produção.

## Testes automatizados

O projeto possui uma suíte de testes que verifica o funcionamento de funcionalidades do backend, incluindo:

- Validação de CPF e CNPJ
- Criptografia de senhas com scrypt
- Autenticação com JWT
- Integração das rotas da API com o MySQL

Para executar os testes, utilize na raiz do projeto:

```bash
npm test
```

Ou diretamente no backend:

```bash
cd backend
npm test
```

A suíte contempla 24 testes de integração.

## Objetivo do projeto

O Equalis foi desenvolvido como parte do Projeto Integrado de Desenvolvimento Mobile da UNICEPLAC, com o propósito de aplicar conhecimentos de desenvolvimento de software na criação de uma solução voltada à inclusão profissional.

O projeto também se relaciona ao **ODS 10 — Redução das Desigualdades**, da Organização das Nações Unidas.

---

**Equalis — UNICEPLAC, 2026.**
