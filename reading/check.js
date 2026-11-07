// Verifica os textos de leitura extensiva: node reading/check.js [-v]
// Para cada texto: cobertura pela NGSL da faixa do nível (+ glossário + cognatos óbvios),
// palavras fora da faixa sem glosa, e palavras de ligação usadas.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {}; vm.createContext(ctx);
const files = ["ngsl.js", "words.js", "lessons/links-a.js", "lessons/links-b.js", "reading/readings.js",
  ...fs.readdirSync(__dirname).filter((f) => /^r-.*\.js$/.test(f)).sort().map((f) => "reading/" + f)];
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8").replace(/^const /gm, "var "), ctx, { filename: f });
const { NGSL_RANK, READINGS, LINK_WORDS } = ctx;
const BAND = { 1: 600, 2: 1000, 3: 1600, 4: 2200, 5: 2809 };
const lemma = (w) => {
  if (NGSL_RANK[w]) return w;
  const tries = [w.replace(/'s$/, ""), w.replace(/s$/, ""), w.replace(/es$/, ""), w.replace(/ies$/, "y"), w.replace(/ed$/, ""), w.replace(/d$/, ""),
    w.replace(/ing$/, ""), w.replace(/ing$/, "e"), w.replace(/ly$/, ""), w.replace(/er$/, ""), w.replace(/est$/, ""), w.replace(/ied$/, "y")];
  return tries.find((t) => NGSL_RANK[t]) || w;
};
const cognate = (w) => /(tion|sion|ity|ment|ence|ance|ical|ic|ive|ous|al|ism|ist|ize|ise|ary|ory)s?$/.test(w) && w.length > 5;
let bad = 0;
for (const r of READINGS) {
  const text = r.paras.join(" ");
  const gl = new Set((r.gloss || []).map((g) => g[0].toLowerCase()));
  const tokens = text.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
  let known = 0; const out = new Map();
  tokens.forEach((t, i) => {
    const w = t.toLowerCase().replace(/’/g, "'");
    const parts = w.split("-");
    const ok = parts.every((p) => (NGSL_RANK[lemma(p)] || 9999) <= BAND[r.level]) || gl.has(w) || cognate(w) || (/^[A-Z]/.test(t) && i > 0 && !/[.!?]$/.test(tokens[i - 1]));
    if (ok) known++; else out.set(w, (out.get(w) || 0) + 1);
  });
  const cov = known / tokens.length;
  const low = text.toLowerCase();
  const links = LINK_WORDS.filter((x) => !x.w.includes("…") && x.level <= r.level + 1 && new RegExp("\\b" + x.w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(low)).map((x) => x.w);
  const unglossed = [...out.keys()].filter((w) => !gl.has(w));
  const problems = [];
  if (cov < 0.95) problems.push(`cobertura ${(cov * 100).toFixed(1)}% < 95%`);
  if (links.length < 4) problems.push(`só ${links.length} palavras de ligação distintas (mínimo 4)`);
  if (r.paras.length < 3 || r.paras.length > 4) problems.push(`${r.paras.length} parágrafos (3 a 4)`);
  if (problems.length) bad++;
  if (process.argv.includes("-v") || problems.length)
    console.log(`${r.level} ${r.id.padEnd(30)} ${tokens.length} palavras · cobertura ${(cov * 100).toFixed(1)}% · ligação: ${links.join(", ")}${unglossed.length ? `\n   fora da faixa sem glosa: ${unglossed.join(", ")}` : ""}${problems.length ? `\n   PROBLEMA: ${problems.join("; ")}` : ""}`);
}
console.log(`Textos: ${READINGS.length}${bad ? ` · com problema: ${bad}` : " · todos ok"}`);
process.exit(bad ? 1 : 0);
