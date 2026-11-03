/**
 * Testes Automatizados de Todas as Rotas da API REST do Equalis
 * Verifica persistência, códigos HTTP, integridade dos payloads e segurança.
 */
const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createServer } = require('../server');

const STORE_PATH = path.join(__dirname, '..', '..', 'database', 'local_store.json');

async function run() {
  const storeBackup = fs.existsSync(STORE_PATH) ? fs.readFileSync(STORE_PATH, 'utf-8') : null;
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(
        url,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  console.log('========================================================');
  console.log(' INICIANDO VALIDAÇÃO DE TODAS AS ROTAS DO BACKEND EQUALIS');
  console.log('========================================================');

  try {
    // 1. Healthcheck
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'ok');
    console.log('✔ [1/17] Healthcheck GET /api/health: OK');

    // 2. Login com sucesso (Empresa parceira UNICEPLAC)
    const loginOk = await request('POST', '/api/auth/login', {
      email: 'rh@uniceplac.edu.br',
      senha: 'equalis123',
      tipo: 'EMPRESA',
    });
    assert.strictEqual(loginOk.status, 200);
    assert.ok(loginOk.data.token);
    console.log('✔ [2/17] Login Válido POST /api/auth/login: OK');

    // 3. Login com erro (senha errada)
    const loginErr = await request('POST', '/api/auth/login', {
      email: 'rh@uniceplac.edu.br',
      senha: 'senhaIncorreta',
      tipo: 'EMPRESA',
    });
    assert.strictEqual(loginErr.status, 401);
    console.log('✔ [3/17] Rejeição de Credenciais Inválidas (401): OK');

  // 4. Recuperação de Senha
  const recOk = await request('POST', '/api/auth/recuperar-senha', {
    email: 'maria@equalis.com.br',
  });
  assert.strictEqual(recOk.status, 200);
  assert.ok(recOk.data.sucesso);
  console.log('✔ [4/17] Recuperação de Senha POST /api/auth/recuperar-senha: OK');

  // 5. Autenticação SSO
  const ssoOk = await request('POST', '/api/auth/sso', {
    provedor: 'Gov.br',
    email: 'maria@equalis.com.br',
    tipo: 'CANDIDATO',
  });
  assert.strictEqual(ssoOk.status, 200);
  assert.strictEqual(ssoOk.data.usuario.ssoProvedor, 'Gov.br');
  console.log('✔ [5/17] Autenticação Federada POST /api/auth/sso: OK');

  // 6. Atualização de Perfil de Candidato
  const perfilPut = await request('PUT', '/api/candidatos/1/perfil', {
    nome: 'Maria Ledentsova Atualizada',
    area_atuacao: 'Marketing e Acessibilidade Digital',
  });
  assert.strictEqual(perfilPut.status, 200);
  assert.strictEqual(perfilPut.data.candidato.nome, 'Maria Ledentsova Atualizada');
  await request('PUT', '/api/candidatos/1/perfil', {
    nome: 'Maria Ledentsova',
    area_atuacao: 'Marketing',
  });
  console.log('✔ [6/17] Atualização de Perfil PUT /api/candidatos/1/perfil: OK');

  // 7. Upload de Laudo CID
  const docOk = await request('POST', '/api/candidatos/1/documentos', {
    tipo: 'LAUDO',
    nome_arquivo: 'laudo_medico_cid_h54.pdf',
    tamanho_bytes: 204800,
    tipo_mime: 'application/pdf',
    deficiencia_id: 2,
  });
  assert.strictEqual(docOk.status, 201);
  assert.strictEqual(docOk.data.documento.nome_arquivo, 'laudo_medico_cid_h54.pdf');
  console.log('✔ [7/17] Homologação de Laudo CID POST /api/candidatos/1/documentos: OK');

  // 8. Criação de Publicação
  const pubNova = await request('POST', '/api/publicacoes', {
    autor_tipo: 'CANDIDATO',
    autor_id: 1,
    autor_nome: 'Maria Ledentsova',
    conteudo: 'Publicação de teste automatizado no Equalis!',
  });
  assert.strictEqual(pubNova.status, 201);
  const novaPubId = pubNova.data.id;
  console.log(`✔ [8/17] Criação de Publicação POST /api/publicacoes (ID ${novaPubId}): OK`);

  // 9. Edição de Publicação
  const pubEdit = await request('PUT', `/api/publicacoes/${novaPubId}`, {
    conteudo: 'Publicação editada com sucesso via API REST!',
  });
  assert.strictEqual(pubEdit.status, 200);
  assert.strictEqual(pubEdit.data.publicacao.conteudo, 'Publicação editada com sucesso via API REST!');
  console.log('✔ [9/17] Edição de Publicação PUT /api/publicacoes/:id: OK');

  // 10. Curtir Publicação
  const curtirOk = await request('POST', `/api/publicacoes/${novaPubId}/curtir`);
  assert.strictEqual(curtirOk.status, 200);
  assert.strictEqual(curtirOk.data.curtido, true);
  console.log('✔ [10/17] Curtir Publicação POST /api/publicacoes/:id/curtir: OK');

  // 11. Inserir Comentário
  const comOk = await request('POST', `/api/publicacoes/${novaPubId}/comentarios`, {
    autor_nome: 'Carlos Recrutador',
    texto: 'Excelente publicação! Conte conosco.',
  });
  assert.strictEqual(comOk.status, 201);
  assert.strictEqual(comOk.data.texto, 'Excelente publicação! Conte conosco.');
  console.log('✔ [11/17] Comentário POST /api/publicacoes/:id/comentarios: OK');

  // 12. Obter Comentários
  const comList = await request('GET', `/api/publicacoes/${novaPubId}/comentarios`);
  assert.strictEqual(comList.status, 200);
  assert.ok(comList.data.length >= 1);
  console.log('✔ [12/17] Listar Comentários GET /api/publicacoes/:id/comentarios: OK');

  // 13. Republicar no Feed
  const repOk = await request('POST', `/api/publicacoes/${novaPubId}/republicar`, {
    autor_nome: 'UNICEPLAC Inclusão',
  });
  assert.strictEqual(repOk.status, 201);
  const repId = repOk.data.id;
  console.log('✔ [13/17] Republicar POST /api/publicacoes/:id/republicar: OK');

  // 14. Excluir Publicação
  const delOk = await request('DELETE', `/api/publicacoes/${novaPubId}`);
  if (repId) {
    await request('DELETE', `/api/publicacoes/${repId}`);
  }
  assert.strictEqual(delOk.status, 200);
  assert.strictEqual(delOk.data.sucesso, true);
  console.log('✔ [14/17] Excluir Publicação DELETE /api/publicacoes/:id: OK');

  // 15. Alternar Conexão Profissional
  const conOk = await request('POST', '/api/conexoes/1/conectar');
  assert.strictEqual(conOk.status, 200);
  assert.strictEqual(conOk.data.sucesso, true);
  console.log('✔ [15/17] Alternar Conexão POST /api/conexoes/:id/conectar: OK');

  // 16. Mensagens Diretas
  const msgOk = await request('POST', '/api/mensagens', {
    remetente_id: 1,
    remetente_tipo: 'CANDIDATO',
    destinatario_id: 1,
    destinatario_tipo: 'CANDIDATO',
    remetente_nome: 'Maria Ledentsova',
    remetente_cargo: 'Candidata PcD',
    conteudo: 'Olá, gostaria de confirmar o horário da entrevista acessível.',
  });
  assert.strictEqual(msgOk.status, 201);
  const msgList = await request('GET', '/api/mensagens?usuario_id=1&usuario_tipo=CANDIDATO');
  assert.strictEqual(msgList.status, 200);
  assert.ok(msgList.data.length >= 1);
  if (msgOk.data.id) {
    await request('DELETE', `/api/mensagens/${msgOk.data.id}`);
  }
  console.log('✔ [16/17] Mensagens Diretas (GET & POST /api/mensagens): OK');

  // 17. Sincronização Geral Bootstrap
  const bootOk = await request('GET', '/api/bootstrap');
  assert.strictEqual(bootOk.status, 200);
  assert.ok(bootOk.data.vagas);
  assert.ok(bootOk.data.candidatos);
  console.log('✔ [17/24] Sincronização Global GET /api/bootstrap: OK');

  // 18. Ciclo Completo de Vagas (POST, GET, PUT, DELETE)
  const vagaNova = await request('POST', '/api/vagas', {
    empresa_id: 1,
    titulo: 'Analista de QA Acessibilidade',
    descricao: 'Testes de acessibilidade com leitores de tela e WCAG 2.2.',
    requerimentos: 'Conhecimento em NVDA, TalkBack e leitor de telas.',
    categoria: 'Programador',
    carga_horaria: '6 horas',
    modalidade: 'Home-Office',
    cidade: 'Brasília',
    estado: 'DF',
    salario: 4500,
    acessibilidades_ids: [1, 2],
  });
  assert.strictEqual(vagaNova.status, 201);
  const testVagaId = vagaNova.data.id;
  assert.ok(testVagaId);

  const vagaGet = await request('GET', `/api/vagas/${testVagaId}`);
  assert.strictEqual(vagaGet.status, 200);
  assert.strictEqual(vagaGet.data.titulo, 'Analista de QA Acessibilidade');

  const vagaPut = await request('PUT', `/api/vagas/${testVagaId}`, {
    titulo: 'Analista de QA Sênior em Acessibilidade',
    salario: 5000,
  });
  assert.strictEqual(vagaPut.status, 200);

  console.log(`✔ [18/24] Ciclo Completo de Vagas POST/GET/PUT (ID ${testVagaId}): OK`);

  // 19. Ciclo Completo de Candidatura (POST, GET, PATCH status, DELETE cancelamento)
  const candPost = await request('POST', '/api/candidaturas', {
    candidato_id: 1,
    vaga_id: testVagaId,
  });
  assert.strictEqual(candPost.status, 201);
  const testCandId = candPost.data.id;

  const candList = await request('GET', '/api/candidaturas?candidato_id=1');
  assert.strictEqual(candList.status, 200);
  assert.ok(Array.isArray(candList.data));

  const candPatch = await request('PATCH', `/api/candidaturas/${testCandId}/status`, {
    status_processo: 'ENTREVISTA',
  });
  assert.strictEqual(candPatch.status, 200);

  const candDel = await request('DELETE', `/api/candidaturas/${testVagaId}?candidato_id=1`);
  assert.strictEqual(candDel.status, 200);

  // Soft-delete da vaga de teste
  const vagaDel = await request('DELETE', `/api/vagas/${testVagaId}`);
  assert.strictEqual(vagaDel.status, 200);
  console.log('✔ [19/24] Ciclo Completo de Candidaturas e Exclusão de Vaga: OK');

  // 20. Ciclo de Formação Acadêmica (POST, GET, DELETE)
  const formPost = await request('POST', '/api/candidatos/1/formacoes', {
    instituicao: 'Instituto Federal de Brasília',
    diploma: 'Tecnólogo',
    area_estudo: 'Sistemas para Internet',
    mes_inicio: 'Fevereiro',
    ano_inicio: '2023',
    mes_termino: 'Dezembro',
    ano_termino: '2025',
  });
  assert.strictEqual(formPost.status, 201);
  const testFormId = formPost.data.id || (formPost.data.formacao && formPost.data.formacao.id);

  const formList = await request('GET', '/api/candidatos/1/formacoes');
  assert.strictEqual(formList.status, 200);
  assert.ok(formList.data.length >= 1);

  const formDel = await request('DELETE', `/api/candidatos/1/formacoes/${testFormId}`);
  assert.strictEqual(formDel.status, 200);
  console.log('✔ [20/24] Ciclo de Formação Acadêmica POST/GET/DELETE: OK');

  // 21. Ciclo de Experiência Profissional (POST, GET, DELETE)
  const expPost = await request('POST', '/api/candidatos/1/experiencias', {
    cargo: 'Testador de Software Inclusivo',
    organizacao: 'Inclusiva Tech',
    tipo_emprego: 'CLT',
    localidade: 'Brasília, DF',
    tipo_localidade: 'Remoto',
    mes_inicio: 'Janeiro',
    ano_inicio: '2025',
  });
  assert.strictEqual(expPost.status, 201);
  const testExpId = expPost.data.id || (expPost.data.experiencia && expPost.data.experiencia.id);

  const expList = await request('GET', '/api/candidatos/1/experiencias');
  assert.strictEqual(expList.status, 200);
  assert.ok(expList.data.length >= 1);

  const expDel = await request('DELETE', `/api/candidatos/1/experiencias/${testExpId}`);
  assert.strictEqual(expDel.status, 200);
  console.log('✔ [21/24] Ciclo de Experiência Profissional POST/GET/DELETE: OK');

  // 22. Listagem de Conexões Profissionais
  const conexoesList = await request('GET', '/api/conexoes?candidato_id=1');
  assert.strictEqual(conexoesList.status, 200);
  assert.ok(Array.isArray(conexoesList.data));
  console.log('✔ [22/24] Listagem de Conexões GET /api/conexoes: OK');

  // 23. Marcação de Mensagem como Lida
  const msgNova = await request('POST', '/api/mensagens', {
    remetente_id: 1,
    remetente_tipo: 'EMPRESA',
    destinatario_id: 1,
    destinatario_tipo: 'CANDIDATO',
    remetente_nome: 'Recrutador UNICEPLAC',
    remetente_cargo: 'RH',
    conteudo: 'Sua entrevista foi agendada para amanhã às 14h.',
  });
  assert.strictEqual(msgNova.status, 201);
  const testMsgId = msgNova.data.id;

  const msgLida = await request('PATCH', `/api/mensagens/${testMsgId}/lida`);
  assert.strictEqual(msgLida.status, 200);
  await request('DELETE', `/api/mensagens/${testMsgId}`);
  console.log('✔ [23/24] Marcação de Mensagem como Lida PATCH /api/mensagens/:id/lida: OK');

  // 24. Gestão de Perfil de Empresa
  const empGet = await request('GET', '/api/empresas/1');
  assert.strictEqual(empGet.status, 200);
  assert.ok(empGet.data.nome_fantasia);

  const empPut = await request('PUT', '/api/empresas/1/perfil', {
    nome_fantasia: 'Centro Universitário UNICEPLAC',
    descricao: 'Centro Universitário do Planalto Central com infraestrutura 100% acessível.',
  });
  assert.strictEqual(empPut.status, 200);
  console.log('✔ [24/24] Gestão de Perfil Institucional GET/PUT /api/empresas/:id: OK');

    console.log('========================================================');
    console.log(' TODAS AS 24 ROTAS DA API PASSARAM COM 100% DE SUCESSO!');
    console.log('========================================================');
  } finally {
    if (storeBackup !== null) {
      fs.writeFileSync(STORE_PATH, storeBackup, 'utf-8');
      console.log('✔ Banco de dados local restaurado com sucesso (sem poluição de testes).');
    }
    server.close();
  }
}

run().catch((err) => {
  console.error('❌ Falha nos testes de rotas:', err);
  process.exit(1);
});
