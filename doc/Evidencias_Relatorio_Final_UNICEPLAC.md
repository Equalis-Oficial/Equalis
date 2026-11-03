# EVIDÊNCIAS DE TESTE E DOCUMENTAÇÃO TÉCNICA — RELATÓRIO FINAL EQUALIS
**Curso:** Engenharia de Software / Análise e Desenvolvimento de Sistemas — UNICEPLAC 2026  
**Disciplina:** Projeto Integrado de Desenvolvimento Mobile  
**Orientador:** Prof. Romulo Valadares  
**Equipe:** Nicolas Fernandes Santiago, Anilton Lima de Oliveira, Breno Gabriel de Oliveira Barreto, Gabriel Ribeiro Couto, Guilherme Ferreira Menezes, Kaio Guilherme Morais Pires da Cruz.

---

## 1. Mapeamento das Telas do Sistema (Para a Página 21 do Relatório)

O protótipo do Figma (`VcMPiZPmrPYgFWdjswKuDZ`) contou com 36 frames mapeados, organizados no aplicativo em **26 telas funcionais** distribuídas em 4 fluxos principais:

| Módulo / Fluxo | Arquivo no Projeto | Descrição e Acessibilidade |
| :--- | :--- | :--- |
| **Onboarding & Autenticação** | `mobile/src/screens/auth/TelaInicialScreen.js` | Apresentação institucional, botões de ação e atalho direto para a Tela Acessível. |
| **Onboarding** | `mobile/src/screens/auth/IntroducaoAppScreen.js` | Carrossel acessível em 3 passos com leitor de áudio para cada slide. |
| **Cadastro** | `mobile/src/screens/auth/OpcoesCadastroScreen.js` | Escolha entre perfil Candidato PcD e Empresa parceira. |
| **Login** | `mobile/src/screens/auth/LoginScreen.js` | Autenticação com validação de formato de e-mail e exibição de senha. |
| **Registro Candidato** | `mobile/src/screens/auth/RegistroCandidatoScreen.js` | Cadastro com validação algorítmica de CPF (11 dígitos) e labels fixos. |
| **Registro Empresa** | `mobile/src/screens/auth/RegistroEmpresaScreen.js` | Cadastro com validação algorítmica de CNPJ (14 dígitos). |
| **Termos de Uso** | `mobile/src/screens/auth/TermosScreen.js` | Termos estruturados com foco no Art. 11 da LGPD (Dados Sensíveis de Saúde) e Lei de Cotas. |
| **Acessibilidade Inicial** | `mobile/src/screens/auth/EscolhaDeficienciaScreen.js` | Seleção das categorias de deficiência (Física, Visual, Auditiva, Intelectual, Psicossocial) e anexo de laudo (CID). |
| **Modo Acessível (Confirmação)** | `mobile/src/screens/accessible/ConfirmacaoAcessivelScreen.js` | Escolha consciente entre o Modo Padrão e o Modo Tela Acessível Simplificada com botões de alto contraste. |
| **Modo Acessível (Hub)** | `mobile/src/screens/accessible/TelaAcessivelScreen.js` | Interface com 4 blocos ampliados (Procurar Vagas, Configurar Perfil, Conexões, Publicações) e leitor TTS. |
| **Vagas & Oportunidades** | `mobile/src/screens/jobs/EmpregoScreen.js` | Mural de vagas com busca por localidade, categorias e filtro por tipo de deficiência atendida. |
| **Detalhes da Vaga (Padrão)** | `mobile/src/screens/jobs/DetalhesVagaScreen.js` | Descrição da vaga, infraestrutura adaptada da empresa e ação real de **Candidatura**. |
| **Detalhes da Vaga (Acessível)** | `mobile/src/screens/accessible/DetalhesVagaAcessivelScreen.js` | Versão simplificada com síntese de voz (TTS) completa e botões ampliados (mínimo 56dp). |
| **Publicar Vaga (Empresa)** | `mobile/src/screens/jobs/PublicarVagaScreen.js` | Cadastro de vaga com vinculação explícita de `Vaga_Acessibilidade` e recursos assistivos. |
| **Gestão de Candidaturas** | `mobile/src/screens/jobs/MinhasCandidaturasScreen.js` | Acompanhamento dos status da tabela `Candidatura` (Enviada, Em análise, Entrevista, Aprovada). |
| **Feed Social** | `mobile/src/screens/network/HomeScreen.js` | Feed comunitário com post da UNICEPLAC, curtir dinâmico e recomendação de vagas. |
| **Perfil Profissional** | `mobile/src/screens/profile/PerfilCandidatoScreen.js` | Perfil completo com serviços, formação acadêmica, experiências e publicações. |
| **Gerenciamento do Perfil** | `mobile/src/screens/profile/AdicionarSecaoScreen.js` | Central para adicionar Sobre, Formações e Cargos. |
| **Seção Sobre** | `mobile/src/screens/profile/SecaoSobreScreen.js` | Resumo profissional com competências e contador de caracteres. |
| **Formação Acadêmica** | `mobile/src/screens/profile/FormacaoAcademicaScreen.js` | Registro de cursos com notificação para a rede. |
| **Cargo / Experiência** | `mobile/src/screens/profile/CargoScreen.js` | Registro de experiências profissionais anteriores. |
| **Edição de Perfil** | `mobile/src/screens/profile/EditarPerfilScreen.js` | Atualização de foto inclusiva, banner e dados de contato. |
| **Rede de Conexões** | `mobile/src/screens/network/RedeScreen.js` | Networking com profissionais e recrutadores (suporta Modo Padrão e Acessível). |
| **Publicações** | `mobile/src/screens/network/PublicarPostScreen.js` | Criação de postagens com audiodescrição (#PraCegoVer) e vínculo a vagas. |
| **Gerenciar Publicações** | `mobile/src/screens/network/VerPublicacoesScreen.js` | Histórico de publicações com opções de edição e exclusão. |
| **Mensagens** | `mobile/src/screens/network/MensagensScreen.js` | Mensagens de recrutadores PcD com resposta rápida e leitura em voz alta. |

---

## 2. Evidências de Teste (Para as Páginas 22 e 23 do Relatório)

### A. Evidências de Teste — Responsividade
* **Escalonamento Tipográfico Dinâmico:** O aplicativo implementa a função `getThemeTokens` (`mobile/src/theme/tokens.js`), permitindo alternar a escala de fonte em tempo real entre **100% (Normal)**, **120% (Grande)** e **140% (Extra Grande)** sem quebra de leiaute ou sobreposição de textos.
* **Tamanhos Mínimos de Alvo de Toque (Target Size - WCAG 2.2 AA/AAA):** Todos os elementos interativos possuem área mínima de clique de **48x48dp no Modo Padrão** e **56x56dp no Modo Tela Acessível**, garantindo conforto e usabilidade para pessoas com tremores ou deficiências motoras.
* **Multiplataforma (Android, iOS e Web):** O código foi projetado em React Native modular, executando de forma idêntica em telas móveis verticais e em navegadores desktop/web (`React Native for Web`).

### B. Evidências de Teste — Segurança
* **Criptografia de Senhas (LGPD / Proteção de Dados):** As senhas não são armazenadas em texto plano. O backend utiliza o algoritmo de derivação criptográfica `scrypt` com *salt* aleatório de 16 bytes gerado via `crypto.randomBytes` (`backend/src/utils/validators.js`), mitigando ataques de dicionário e tabelas rainbow.
* **Autenticação e Sessão com Tokens:** Geração de tokens de sessão no padrão `HS256` assinados digitalmente para validação de identidade dos usuários (Candidato vs. Empresa).
* **Proteção contra Injeção e XSS:** Implementação da função `sanitizarTexto()` para escape de tags e caracteres reservados antes de persistência no banco relacional.

### C. Evidências de Teste — Validações
* **Validação Algorítmica de CPF (Receita Federal):** Cálculo matemático dos dois dígitos verificadores (módulo 11) com rejeição automática de CPFs com todos os dígitos iguais e aplicação de máscara `000.000.000-00`.
* **Validação Algorítmica de CNPJ:** Cálculo dos dois dígitos verificadores com pesos 5 a 2 e aplicação de máscara `00.000.000/0000-00`.
* **Validação de E-mail e Complexidade de Senha:** Bloqueio de e-mails fora da especificação RFC 5322 e exigência de senha mínima de 6 caracteres com confirmação idêntica.
* **Prevenção de Duplicidade de Candidaturas:** O método `aplicarParaVaga()` valida no banco e no estado se o candidato já se inscreveu para a vaga, prevenindo candidaturas duplicadas e retornando código HTTP `409 Conflict`.
* **Resultado dos Testes Automatizados (`node backend/src/tests/runTests.js`):**
  ```text
  ======================================================
   SUÍTE DE TESTES AUTOMATIZADOS — EQUALIS (UNICEPLAC)  
  ======================================================

  ✔ [Validação] Algoritmo de CPF (dígitos verificadores e máscara): PASSOU
  ✔ [Validação] Algoritmo de CNPJ (dígitos verificadores e máscara): PASSOU
  ✔ [Validação] E-mail e complexidade mínima de senha: PASSOU
  ✔ [Segurança] Criptografia de Senha (scrypt + salt) e Token JWT HS256: PASSOU

  Todos os testes de Validação e Segurança passaram com 100% de sucesso!
  ```

---

## 3. Conformidade com o Modelo de Entidade-Relacionamento (MER)

O banco de dados relacional (MySQL 8) e a API conectam rigorosamente as **7 entidades do MER**:
1. `Empresa` publica `Vaga` (1:N)
2. `Vaga` recebe `Candidatura` (1:N)
3. `Candidato` aplica para `Candidatura` (1:N)
4. `Deficiencia` classifica `Candidato_Deficiencia` e atende `Vaga_Acessibilidade` (N:N)
5. `Candidato_Deficiencia` armazena o laudo médico e dados de apoio à Lei de Cotas.

