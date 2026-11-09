/**
 * Máscaras e Validações Client-Side Acessíveis — Equalis Mobile
 * Atende aos requisitos de Validação e Segurança do Relatório Final (UNICEPLAC)
 * e Regras de Negócio RN-001, RN-002, RN-018, RN-019, RN-026, RN-027.
 */

export const MENSAGENS = {
  MSG_001: 'Todos os campos são obrigatórios.',
  MSG_002: 'Digite um e-mail ou CPF valido (ex. contato@email.com, 123456789-09).',
  MSG_012: 'O campo Site Institucional deve seguir um formato de URL válido (ex. www.empresa.com).',
  MSG_013: 'Insira um número de telefone válido.',
  MSG_020: 'Preencha todos os campos obrigatórios para anunciar a vaga.',
};

export const MSG_001 = MENSAGENS.MSG_001;
export const MSG_002 = MENSAGENS.MSG_002;
export const MSG_012 = MENSAGENS.MSG_012;
export const MSG_013 = MENSAGENS.MSG_013;
export const MSG_020 = MENSAGENS.MSG_020;

export function limparDigitos(valor = '') {
  return String(valor).replace(/\D/g, '');
}

export function formatarCPF(valor = '') {
  const d = limparDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function formatarCNPJ(valor = '') {
  const d = limparDigitos(valor).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export function validarCPF(cpfInput = '') {
  const cpf = limparDigitos(cpfInput);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9), 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10), 10);
}

export function validarCNPJ(cnpjInput = '') {
  const cnpj = limparDigitos(cnpjInput);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcularDigito = (base, pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) {
      soma += parseInt(base.charAt(i), 10) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcularDigito(cnpj.substring(0, 12), pesos1);
  const d2 = calcularDigito(cnpj.substring(0, 12) + d1, pesos2);

  return (
    d1 === parseInt(cnpj.charAt(12), 10) &&
    d2 === parseInt(cnpj.charAt(13), 10)
  );
}

export function validarEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

/**
 * Validação de URL institucional/corporativa (RN-018 / MSG-012)
 * Aceita URLs com protocolo (http:// ou https://) ou simplificadas (www.empresa.com ou empresa.com.br)
 * Bloqueia estritamente tags de script, caracteres perigosos (< > " ' \ \0 e caracteres de controle) e esquemas não-http/https.
 */
export function validarSite(siteInput = '') {
  if (!siteInput || typeof siteInput !== 'string') return false;
  const str = siteInput.trim();
  if (str.length < 4 || str.length > 255) return false;

  // 1. Bloqueio imediato de tags <script>, espaços e caracteres perigosos/controle
  if (/<script/i.test(str)) return false;
  if (/[\s<>'"`\\|^}{\x00-\x1f\x7f]/.test(str)) return false;

  // 2. Bloqueio estrito de qualquer esquema que não seja http:// ou https://
  // Ex: ftp:, javascript:, data:, file:, ws:, wss:, blob:, tel:, etc.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(str) && !/^https?:\/\//i.test(str)) {
    return false;
  }
  // Bloqueio de protocolos malformados (ex: http:empresa.com, https:empresa.com, http//..., https//...)
  if (/^https?:/i.test(str) && !/^https?:\/\//i.test(str)) {
    return false;
  }
  if (/^https?\/\//i.test(str)) {
    return false;
  }

  // 3. Validação estrutural de Hostname e Caminho
  // - Hostname: labels alfanuméricos com hífens internos, separados por pontos.
  //   Não pode iniciar nem terminar com ponto ou hífen. Pelo menos um ponto obrigatório.
  // - TLD: 2 a 10 caracteres alfabéticos.
  // - Porta opcional (:d+).
  // - Caminho opcional com caracteres seguros de URI.
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,10}(:\d{1,5})?(\/[-a-zA-Z0-9@:%_+.~#?&=]*)*$/i;
  if (!urlPattern.test(str)) return false;

  // Validação do intervalo de porta TCP se especificada
  const portMatch = str.match(/:(\d+)(?:\/|$)/);
  if (portMatch) {
    const port = parseInt(portMatch[1], 10);
    if (port < 1 || port > 65535) return false;
  }

  return true;
}

/**
 * Validação de Telefone corporativo/pessoal brasileiro com DDD (RN-019 / MSG-013)
 * Aceita fixo (10 dígitos) e celular (11 dígitos), com ou sem máscara, e DDI +55 opcional.
 * Rejeita qualquer caractere fora do conjunto seguro [0-9()\s+-].
 */
export function validarTelefone(telefoneInput = '') {
  if (!telefoneInput || typeof telefoneInput !== 'string') return false;
  const str = telefoneInput.trim();
  if (str.length < 8 || str.length > 30) return false;

  // 1. Rejeita qualquer caractere que não pertença a ^[0-9()\s+-]+$ antes de extrair os dígitos
  if (!/^[0-9()\s+-]+$/.test(str)) return false;

  // 2. Extrai os dígitos
  const digitos = str.replace(/\D/g, '');

  // Trata DDI +55 nacional (12 ou 13 dígitos começando com +55)
  let digitosBR = digitos;
  if ((digitos.length === 12 || digitos.length === 13) && str.startsWith('+55')) {
    digitosBR = digitos.slice(2);
  }

  if (digitosBR.length !== 10 && digitosBR.length !== 11) return false;

  // Rejeita sequência com todos os dígitos iguais
  if (/^(\d)\1+$/.test(digitosBR)) return false;

  // DDD válido (11 a 99, primeiro dígito 1 a 9, segundo dígito 1 a 9)
  if (digitosBR.charAt(0) === '0' || digitosBR.charAt(1) === '0') return false;

  if (digitosBR.length === 11) {
    // Celular: nono dígito (terceiro da string) obrigatório 9
    return digitosBR.charAt(2) === '9';
  } else {
    // Fixo (10 dígitos): primeiro dígito após DDD deve ser entre 2 e 5
    const primDigito = digitosBR.charAt(2);
    return /^[2-5]$/.test(primDigito);
  }
}

/**
 * Formatação canônica de telefone brasileiro com máscara
 * (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatarTelefone(telefoneInput = '') {
  let d = String(telefoneInput || '').replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && String(telefoneInput || '').trim().startsWith('+55')) {
    d = d.slice(2);
  }
  d = d.slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}
