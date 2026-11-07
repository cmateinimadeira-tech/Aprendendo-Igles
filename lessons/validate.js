// Valida o conteúdo das lições: node lessons/validate.js
// Carrega data.js, anpad.js e lessons/level-*.js no mesmo contexto e confere
// estrutura, ids únicos, chaves válidas, vocabulário presente no texto e
// trechos {{...}} presentes no texto.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const files = ["data.js", "anpad.js", ...fs.readdirSync(__dirname).filter((f) => /^level-\d+\.js$/.test(f)).sort().map((f) => "lessons/" + f)];
const ctx = {};
vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
const { LESSONS, STRATEGIES, QTYPES, THEMES } = vm.runInContext("({ LESSONS, STRATEGIES, QTYPES, THEMES })", ctx);

const errors = [], warns = [], seen = new Set();
const textOf = (l) => (l.paras ? l.paras.join(" ") : l.radio ? l.radio.map((r) => r[1]).join(" ") : l.text || "");
for (const l of LESSONS) {
  const E = (m) => errors.push(`${l.id}: ${m}`), W = (m) => warns.push(`${l.id}: ${m}`);
  if (seen.has(l.id)) E("id repetido"); seen.add(l.id);
  for (const k of ["id", "level", "theme", "title", "context", "predict", "cognates", "questions", "grammar", "vocab", "write"]) if (l[k] == null) E("falta " + k);
  if (!THEMES.includes(l.theme)) E("tema inválido " + l.theme);
  if (l.strategy && !STRATEGIES[l.strategy]) E("estratégia inválida " + l.strategy);
  const txt = textOf(l), low = txt.toLowerCase();
  if (!txt) E("sem texto");
  const words = txt.split(/\s+/).length;
  const nOpts = l.exam ? 5 : l.level <= 2 ? 3 : 4;
  const pos = [];
  (l.questions || []).forEach((q, i) => {
    if (!QTYPES[q.t]) E(`pergunta ${i + 1}: tipo inválido ${q.t}`);
    if (!Array.isArray(q.opts) || q.opts.length < 3) E(`pergunta ${i + 1}: alternativas`);
    if (!(q.a >= 0 && q.a < q.opts.length)) E(`pergunta ${i + 1}: índice da resposta fora do intervalo`);
    if (!q.why) E(`pergunta ${i + 1}: sem explicação`);
    if (l.exam && !q.qpt) E(`pergunta ${i + 1}: sem qpt`);
    (q.q.match(/\{\{(.+?)\}\}/g) || []).forEach((m) => { const ph = m.slice(2, -2).toLowerCase(); if (!low.includes(ph)) E(`pergunta ${i + 1}: trecho ${m} não está no texto`); });
    pos.push(q.a);
  });
  (l.vocab || []).forEach(([t]) => { if (!new RegExp("\\b" + t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(low)) E(`vocab "${t}" não aparece no texto`); });
  if (l.questions && l.questions.length) {
    const max = Math.max(...[0, 1, 2, 3, 4].map((k) => pos.filter((p) => p === k).length));
    if (max / pos.length > 0.6) W(`respostas concentradas numa posição (${pos.join(",")})`);
  }
  W.length; // noop
  if (process.argv.includes("-v")) console.log(`${l.level} ${l.theme.padEnd(10)} ${l.id.padEnd(28)} ${words} palavras, ${l.questions.length} perguntas, respostas ${pos.join("")}`);
}
const byLevel = {};
LESSONS.forEach((l) => (byLevel[l.level] = (byLevel[l.level] || 0) + 1));
console.log("Lições por nível:", JSON.stringify(byLevel), "total", LESSONS.length);
warns.forEach((w) => console.log("aviso:", w));
errors.forEach((e) => console.log("ERRO:", e));
process.exit(errors.length ? 1 : 0);
