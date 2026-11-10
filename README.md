EQUALIS - Plataforma Mobile de Empregabilidade e Gestão de Vagas para Pessoas com Deficiência (PcD)

Projeto Integrado de Desenvolvimento Mobile — UNICEPLAC 2026
Conformidade Legal: Lei nº 8.213/91 (Lei de Cotas) e Lei nº 13.146/15 (Lei Brasileira de Inclusão — LBI)
Padrão de Acessibilidade: Diretrizes WCAG 2.2 — Nível AAA
Objetivo de Desenvolvimento Sustentável: ODS 10 — Redução das Desigualdades (ONU)

1. Visão Geral do Projeto

O Equalis é uma plataforma mobile desenvolvida para promover a inclusão profissional e ampliar a empregabilidade de Pessoas com Deficiência (PcD).

O sistema estabelece uma conexão entre candidatos qualificados e empresas comprometidas com práticas de inclusão, acessibilidade e diversidade no ambiente corporativo.

A solução disponibiliza recursos para gerenciamento de vagas, administração de perfis profissionais, acompanhamento de candidaturas e controle de oportunidades destinadas a profissionais com deficiência.

O projeto tem como objetivo contribuir para a redução das barreiras de acesso ao mercado de trabalho, promovendo igualdade de oportunidades e conformidade com a legislação brasileira de inclusão.

2. Configuração do Ambiente e Execução
2.1. Pré-requisitos

Antes de iniciar a execução do projeto, é necessário instalar e configurar os seguintes componentes:

Node.js: versão 18, 20 ou superior.
NPM: gerenciador de pacotes do Node.js.
Docker: plataforma de conteinerização.
Docker Compose: ferramenta de orquestração dos serviços.
Expo Go: aplicativo necessário para executar e testar o projeto mobile em dispositivos físicos.
2.2. Inicialização Automatizada

O projeto disponibiliza um script de inicialização responsável por configurar e executar os serviços da aplicação de maneira integrada.

Para iniciar o ambiente, execute os seguintes comandos:

bash
git clone https://github.com/Equalis-Oficial/Equalis.git
cd Equalis
git checkout develop
./start.sh


O script start.sh automatiza as seguintes operações:

Instalação das dependências do backend e do aplicativo mobile por meio do NPM.
Inicialização do banco de dados MySQL 8.0 utilizando Docker Compose.
Carregamento do esquema do banco de dados e dos dados iniciais.
Inicialização da API REST desenvolvida com Express na porta 3333.
Verificação da disponibilidade da API por meio de healthcheck.
Inicialização do ambiente Expo com conexão por túnel.
Configuração do proxy reverso /api integrado ao Metro Bundler.
Geração do QR Code para conexão do dispositivo móvel com a aplicação.

Após a inicialização, utilize o Expo Go para realizar a leitura do QR Code disponibilizado no terminal.

2.3. Inicialização Manual dos Serviços

Também é possível executar cada componente individualmente, permitindo maior controle sobre o ambiente de desenvolvimento.

Etapa 1 — Instalação das dependências

bash
npm run install:all


Etapa 2 — Inicialização do banco de dados

bash
docker compose up -d


Etapa 3 — Inicialização do backend

bash
cd backend && npm start


Etapa 4 — Inicialização do aplicativo mobile

Em um novo terminal:

bash
cd mobile && npx expo start --tunnel -c

3. Testes Automatizados

O projeto possui uma suíte de testes automatizados destinada à validação das regras de negócio, dos mecanismos de segurança e da integração entre a API REST e o banco de dados MySQL 8.0.

A execução completa dos testes pode ser realizada a partir do diretório raiz:

bash
npm test


Alternativamente, é possível executar os testes diretamente no backend:

bash
cd backend && npm test

3.1. Cobertura dos Testes

A suíte contempla 24 testes de integração, abrangendo:

Validação de documentos CPF e CNPJ.
Verificação dos mecanismos de criptografia de senhas utilizando Scrypt.
Autenticação e validação de tokens JWT.
Testes de integração das 24 rotas da API REST.
Comunicação entre a camada de serviços e o banco de dados MySQL 8.0.
Validação dos principais fluxos de processamento e respostas HTTP.
4. Arquitetura do Sistema

O Equalis utiliza uma arquitetura organizada em módulos, com separação de responsabilidades entre a aplicação mobile, a API REST e a camada de persistência de dados.

4.1. Estrutura de Diretórios
text
Equalis/
│
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── middlewares/
│       ├── routes/
│       └── tests/
│
├── mobile/
│   ├── assets/
│   │   └── figma/
│   │
│   ├── metro.config.js
│   │
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── screens/
│       ├── services/
│       └── theme/
│
├── docker-compose.yml
├── start.sh
└── package.json

4.2. Backend

A camada de backend é responsável pelo processamento das requisições, aplicação das regras de negócio, autenticação e comunicação com o banco de dados.

Principais tecnologias e componentes:

Node.js: ambiente de execução JavaScript.
Express: framework para implementação da API REST.
MySQL 8.0: sistema gerenciador de banco de dados relacional.
mysql2: biblioteca de comunicação com o banco de dados.
JWT: mecanismo de autenticação e autorização baseado em tokens.
Scrypt: algoritmo de derivação de chaves utilizado na proteção de senhas.

A organização interna segue uma divisão em camadas:

Controllers: gerenciamento das requisições e respostas HTTP.
Services: implementação das regras de negócio.
Repositories: abstração e execução das consultas SQL parametrizadas.
Middlewares: autenticação, autorização e tratamento de erros.
Routes: definição dos endpoints e organização dos recursos da API.
Tests: validação automatizada dos componentes e fluxos da aplicação.
4.3. Aplicação Mobile

A interface mobile foi desenvolvida utilizando React Native com Expo SDK 58.

Sua estrutura contempla:

Components: componentes reutilizáveis para feed, vagas, perfis e funcionalidades comuns.
Context: gerenciamento global de autenticação, dados e preferências de acessibilidade.
Hooks: encapsulamento de estados e operações de filtragem.
Screens: implementação das 36 telas da aplicação, incluindo versões padrão e acessíveis simplificadas.
Services: comunicação com a API REST e gerenciamento de dados iniciais.
Theme: centralização da identidade visual, tipografia, paleta de cores e recursos gráficos.
5. Credenciais de Acesso para Demonstração

O banco de dados disponibiliza contas previamente configuradas para utilização durante a apresentação e avaliação acadêmica do sistema.

Perfil	E-mail	Senha	Descrição
Candidata PcD	maria@equalis.com.br	equalis123	Perfil profissional na área de Marketing Digital, com recursos de acessibilidade e laudo homologado.
Empresa parceira	rh@uniceplac.edu.br	equalis123	Perfil institucional para gerenciamento de funcionalidades corporativas.

Além das contas disponibilizadas, a plataforma permite o cadastramento de novos usuários por meio da interface de registro.

Observação: as credenciais apresentadas são destinadas exclusivamente ao ambiente de demonstração e avaliação do projeto.

6. Recursos e Implementações de Acessibilidade

A acessibilidade constitui um dos requisitos centrais da arquitetura do Equalis. A aplicação incorpora funcionalidades voltadas à adaptação da interface e à redução de barreiras de interação para diferentes perfis de usuários.

6.1. Modos de Interface

O sistema disponibiliza dois modos de apresentação:

Modo Padrão: interface convencional, mantendo a identidade visual da plataforma.
Modo Acessível: interface simplificada, com adaptações de apresentação e interação.

A alternância entre os modos é realizada diretamente pelo cabeçalho da aplicação.

6.2. Síntese de Voz (Text-to-Speech)

Implementação de recursos de leitura automatizada de conteúdo textual, permitindo que informações da interface sejam reproduzidas por síntese de voz.

Tecnologias utilizadas:

expo-speech, para dispositivos compatíveis com React Native.
Web Speech API, para ambientes web compatíveis.
6.3. Contraste e Escala Tipográfica

A aplicação disponibiliza mecanismos de personalização visual, incluindo:

Modo de alto contraste com utilização de fundo escuro.
Ajuste da escala tipográfica para 100%, 120% e 140%.
Adaptação da apresentação dos elementos para facilitar a leitura e a navegação.
6.4. Diretrizes de Acessibilidade

O desenvolvimento considera as recomendações das diretrizes WCAG 2.2, utilizando como referência o nível AAA.

As implementações buscam contemplar os seguintes princípios:

Perceptível: disponibilização de informações em formatos acessíveis.
Operável: facilitação da navegação e interação com os componentes.
Compreensível: organização consistente e previsível da interface.
Robusto: utilização de tecnologias compatíveis com diferentes dispositivos e recursos assistivos.
7. Fundamentação Legal e Social

O desenvolvimento do Equalis está alinhado a instrumentos legais e diretrizes nacionais e internacionais relacionados à inclusão de Pessoas com Deficiência.

7.1. Lei nº 8.213/91 — Lei de Cotas

Estabelece a obrigatoriedade de reserva de vagas para pessoas com deficiência e beneficiários reabilitados da Previdência Social em empresas com 100 ou mais empregados, conforme os percentuais previstos na legislação.

7.2. Lei nº 13.146/15 — Lei Brasileira de Inclusão

Estabelece direitos e garantias fundamentais para Pessoas com Deficiência, incluindo igualdade de oportunidades, acessibilidade, inclusão social e participação no mercado de trabalho.

7.3. Objetivo de Desenvolvimento Sustentável 10

O projeto está relacionado ao ODS 10 da Organização das Nações Unidas, que estabelece como objetivo a redução das desigualdades.

Nesse contexto, o Equalis busca contribuir para a democratização do acesso às oportunidades profissionais, incentivando práticas corporativas inclusivas e promovendo a participação de Pessoas com Deficiência no mercado de trabalho.

8. Considerações Finais

O Equalis propõe uma solução tecnológica voltada à integração entre profissionais com deficiência e organizações empregadoras, utilizando recursos de desenvolvimento mobile, serviços REST, persistência relacional e mecanismos de acessibilidade digital.

Sua arquitetura modular, os testes automatizados e os recursos de personalização da interface constituem a base técnica para uma plataforma orientada à inclusão profissional.

O projeto demonstra a aplicação prática de conceitos de engenharia de software e desenvolvimento mobile na construção de soluções tecnológicas com impacto social, alinhadas à legislação brasileira e aos princípios de acessibilidade digital.
