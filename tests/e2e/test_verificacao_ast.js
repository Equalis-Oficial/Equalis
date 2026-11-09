/**
 * SCRIPT DE VALIDAÇÃO SINTÁTICA FORMAL VIA BABEL AST — EQUALIS
 * Requisito R4 / Feature F14: Verificação de 100% dos arquivos JavaScript/JSX do projeto.
 */

const fs = require('fs');
const path = require('path');

const CODEBASE_ROOT = fs.existsSync('C:\\Users\\nicol\\OneDrive\\Documentos\\Projetagem\\Equalis')
  ? 'C:\\Users\\nicol\\OneDrive\\Documentos\\Projetagem\\Equalis'
  : path.join(__dirname, '..', '..');

let babelParser;
try {
  babelParser = require(path.join(CODEBASE_ROOT, 'mobile', 'node_modules', '@babel', 'parser'));
} catch (e) {
  try {
    babelParser = require('@babel/parser');
  } catch (err) {
    console.error('❌ Não foi possível carregar o @babel/parser:', err.message);
    process.exit(1);
  }
}

const ROOT_DIRS = [
  path.join(CODEBASE_ROOT, 'backend', 'src'),
  path.join(CODEBASE_ROOT, 'mobile', 'src'),
];

let totalArquivos = 0;
let arquivosComErro = 0;
const erros = [];

function coletarArquivosJS(diretorio) {
  let arquivos = [];
  if (!fs.existsSync(diretorio)) return arquivos;

  const itens = fs.readdirSync(diretorio, { withFileTypes: true });
  for (const item of itens) {
    const caminhoCompleto = path.join(diretorio, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== '.expo') {
        arquivos = arquivos.concat(coletarArquivosJS(caminhoCompleto));
      }
    } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.jsx'))) {
      arquivos.push(caminhoCompleto);
    }
  }
  return arquivos;
}

console.log('====================================================================');
console.log('     VARREDURA SINTÁTICA BABEL AST — EQUALIS (BACKEND & MOBILE)     ');
console.log('====================================================================\n');

for (const dir of ROOT_DIRS) {
  const arquivos = coletarArquivosJS(dir);
  for (const arquivo of arquivos) {
    totalArquivos++;
    const relPath = path.relative(CODEBASE_ROOT, arquivo);
    try {
      const codigo = fs.readFileSync(arquivo, 'utf-8');
      babelParser.parse(codigo, {
        sourceType: 'unambiguous',
        plugins: [
          'jsx',
          'asyncGenerators',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'dynamicImport',
          'exportDefaultFrom',
          'nullishCoalescingOperator',
          'optionalChaining',
          'objectRestSpread',
        ],
      });
      console.log(`  ✔ [AST OK] ${relPath}`);
    } catch (err) {
      arquivosComErro++;
      erros.push({ arquivo: relPath, erro: err.message, loc: err.loc });
      console.error(`  ✖ [AST ERRO] ${relPath} (Linha ${err.loc ? err.loc.line : '?'})`);
    }
  }
}

console.log('\n====================================================================');
console.log('                       RESULTADO DA VARREDURA                       ');
console.log('====================================================================');
console.log(`  Total de Arquivos Analisados: ${totalArquivos}`);
console.log(`  Arquivos Sintaticamente Válidos: ${totalArquivos - arquivosComErro}`);
console.log(`  Arquivos com Falha de Parsing: ${arquivosComErro}`);

if (arquivosComErro > 0) {
  console.error('\n❌ Falhas encontradas:');
  erros.forEach((e) => console.error(` - ${e.arquivo}: ${e.erro}`));
  process.exit(1);
} else {
  console.log('\n✔ 100% DOS ARQUIVOS JAVASCRIPT/JSX POSSUEM SINTAXE VÁLIDA NO BABEL AST!');
  process.exit(0);
}
