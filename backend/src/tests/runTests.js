/**
 * Suíte Automatizada de Testes — Equalis (Validações, Segurança e Regras de Negócio)
 * Gera evidências de teste para o Relatório Final (UNICEPLAC).
 */
const assert = require('assert');
const {
  validarCPF,
  validarCNPJ,
  validarEmail,
  validarSenhaForte,
  validarSite,
  validarTelefone,
  formatarTelefone,
  hashSenha,
  verificarSenha,
  gerarTokenSessao,
  MENSAGENS,
} = require('../utils/validators');

console.log('======================================================');
console.log(' SUÍTE DE TESTES AUTOMATIZADOS — EQUALIS (UNICEPLAC)  ');
console.log('======================================================\n');

// 1. Testes de Validação de CPF
assert.strictEqual(validarCPF('529.982.247-25'), true, 'Deve aprovar CPF válido com máscara');
assert.strictEqual(validarCPF('111.111.111-11'), false, 'Deve rejeitar CPF com dígitos repetidos');
assert.strictEqual(validarCPF('52998224700'), false, 'Deve rejeitar CPF com dígito verificador incorreto');
console.log('✔ [Validação] Algoritmo de CPF (dígitos verificadores e máscara): PASSOU');

// 2. Testes de Validação de CNPJ
assert.strictEqual(validarCNPJ('00.394.460/0058-87'), true, 'Deve aprovar CNPJ válido');
assert.strictEqual(validarCNPJ('00.000.000/0000-00'), false, 'Deve rejeitar CNPJ zerado');
assert.strictEqual(validarCNPJ('11.222.333/0001-99'), false, 'Deve rejeitar CNPJ com dígito inválido');
console.log('✔ [Validação] Algoritmo de CNPJ (dígitos verificadores e máscara): PASSOU');

// 3. Testes de E-mail e Senha
assert.strictEqual(validarEmail('maria@equalis.com.br'), true, 'E-mail válido');
assert.strictEqual(validarEmail('email-invalido@'), false, 'E-mail inválido');
assert.strictEqual(validarSenhaForte('12345').valida, false, 'Deve bloquear senha curta (<6 chars)');
assert.strictEqual(validarSenhaForte('equalis123').valida, true, 'Deve aprovar senha válida');
console.log('✔ [Validação] E-mail e complexidade mínima de senha: PASSOU');

// 4. Testes de Validação de Site Institucional (RN-018 / MSG-012)
assert.strictEqual(validarSite('https://uniceplac.edu.br'), true, 'Deve aceitar URL com https');
assert.strictEqual(validarSite('http://empresa.com.br/vagas'), true, 'Deve aceitar URL com subpasta');
assert.strictEqual(validarSite('www.empresa.com.br'), true, 'Deve aceitar URL iniciando com www');
assert.strictEqual(validarSite('empresa.com.br'), true, 'Deve aceitar domínio simples sem protocolo');
assert.strictEqual(validarSite('empresa'), false, 'Deve rejeitar string sem TLD');
assert.strictEqual(validarSite('http//invalido'), false, 'Deve rejeitar protocolo malformado');
assert.strictEqual(validarSite(''), false, 'Deve rejeitar string vazia');
assert.strictEqual(validarSite(null), false, 'Deve rejeitar valor nulo');
// Bateria adversarial de site: esquemas perigosos, injeção e malformações
const sitesAtaque = [
  'ftp://empresa.com',
  'ftp:empresa.com',
  'javascript:alert(1)',
  'javascript:void.com',
  'data:text/html.com',
  'file:///etc/passwd',
  'http//empresa.com',
  'https//empresa.com',
  'http:empresa.com',
  '.empresa.com',
  'empresa..com',
  '-empresa.com',
  'empresa.',
  'http://localhost',
  'https://com',
  '<script>alert(1)</script>',
  'https://empresa.com/<script>alert(1)</script>',
  'https://empresa.com/\x00',
  'ws://empresa.com',
  'wss://empresa.com',
  12345,
  true,
  {},
  ['https://empresa.com'],
];
for (const site of sitesAtaque) {
  assert.strictEqual(validarSite(site), false, `Deve rejeitar site malicioso/malformado: ${JSON.stringify(site)}`);
}
console.log('✔ [Validação] URL de Site Institucional (RN-018 / MSG-012): PASSOU');

// 5. Testes de Validação de Telefone (RN-019 / MSG-013)
assert.strictEqual(validarTelefone('(61) 98765-4321'), true, 'Deve aceitar celular mascarado');
assert.strictEqual(validarTelefone('61987654321'), true, 'Deve aceitar celular sem máscara');
assert.strictEqual(validarTelefone('(61) 3035-3900'), true, 'Deve aceitar telefone fixo mascarado');
assert.strictEqual(validarTelefone('6130353900'), true, 'Deve aceitar telefone fixo sem máscara');
assert.strictEqual(validarTelefone('+55 (61) 98765-4321'), true, 'Deve aceitar telefone com DDI +55');
assert.strictEqual(validarTelefone('+5561987654321'), true, 'Deve aceitar telefone com DDI +55 sem máscara');
assert.strictEqual(validarTelefone('619999'), false, 'Deve rejeitar telefone incompleto');
assert.strictEqual(validarTelefone('(00) 98765-4321'), false, 'Deve rejeitar DDD inválido');
assert.strictEqual(validarTelefone('11111111111'), false, 'Deve rejeitar sequência repetida');
// Bateria adversarial de telefone: SQL injection, scripts, letras, DDI inválido
const telefonesAtaque = [
  '61-98765-4321; DROP TABLE Empresa;',
  'abc61987654321xyz',
  '<script>alert(1)</script>',
  'tel:61987654321',
  '987654321',
  '30353900',
  '01987654321',
  '10987654321',
  '6198765432',
  '6112345678',
  '6162345678',
  '123456789012',
  '1234567890123',
];
for (const tel of telefonesAtaque) {
  assert.strictEqual(validarTelefone(tel), false, `Deve rejeitar telefone malicioso/malformado: ${JSON.stringify(tel)}`);
}
assert.strictEqual(formatarTelefone('61987654321'), '(61) 98765-4321', 'Deve formatar celular corretamente');
assert.strictEqual(formatarTelefone('6130353900'), '(61) 3035-3900', 'Deve formatar fixo corretamente');
assert.strictEqual(formatarTelefone('+55 (61) 98765-4321'), '(61) 98765-4321', 'Deve formatar telefone com +55');
console.log('✔ [Validação] Telefone com DDD e máscara (RN-019 / MSG-013): PASSOU');

// 6. Testes de Constantes e Mensagens Oficiais
assert.strictEqual(MENSAGENS.MSG_001, 'Todos os campos são obrigatórios.');
assert.strictEqual(MENSAGENS.MSG_002, 'Digite um e-mail ou CPF valido (ex. contato@email.com, 123456789-09).');
assert.strictEqual(MENSAGENS.MSG_012, 'O campo Site Institucional deve seguir um formato de URL válido (ex. www.empresa.com).');
assert.strictEqual(MENSAGENS.MSG_013, 'Insira um número de telefone válido.');
assert.strictEqual(MENSAGENS.MSG_020, 'Preencha todos os campos obrigatórios para anunciar a vaga.');
console.log('✔ [Mensagens] Constantes Oficiais MSG-001 a MSG-020: PASSOU');

// 7. Testes de Segurança (Hash Criptográfico scrypt + Timing-Safe Comparison + Token JWT)
const hash = hashSenha('MinhaSenhaSegura2026');
assert.ok(hash.startsWith('scrypt$'), 'Hash deve utilizar algoritmo scrypt com salt aleatório');
assert.strictEqual(verificarSenha('MinhaSenhaSegura2026', hash), true, 'Deve autenticar senha correta');
assert.strictEqual(verificarSenha('SenhaIncorreta', hash), false, 'Deve recusar senha incorreta');

const token = gerarTokenSessao({ id: 1, tipo: 'CANDIDATO' });
assert.strictEqual(token.split('.').length, 3, 'Token JWT deve conter 3 segmentos assinados');
console.log('✔ [Segurança] Criptografia de Senha (scrypt + salt) e Token JWT HS256: PASSOU');

console.log('\nTodos os testes de Validação e Segurança passaram com 100% de sucesso!');
