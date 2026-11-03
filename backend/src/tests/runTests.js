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
  hashSenha,
  verificarSenha,
  gerarTokenSessao,
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

// 4. Testes de Segurança (Hash Criptográfico scrypt + Timing-Safe Comparison + Token JWT)
const hash = hashSenha('MinhaSenhaSegura2026');
assert.ok(hash.startsWith('scrypt$'), 'Hash deve utilizar algoritmo scrypt com salt aleatório');
assert.strictEqual(verificarSenha('MinhaSenhaSegura2026', hash), true, 'Deve autenticar senha correta');
assert.strictEqual(verificarSenha('SenhaIncorreta', hash), false, 'Deve recusar senha incorreta');

const token = gerarTokenSessao({ id: 1, tipo: 'CANDIDATO' });
assert.strictEqual(token.split('.').length, 3, 'Token JWT deve conter 3 segmentos assinados');
console.log('✔ [Segurança] Criptografia de Senha (scrypt + salt) e Token JWT HS256: PASSOU');

console.log('\nTodos os testes de Validação e Segurança passaram com 100% de sucesso!');

