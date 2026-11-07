// Gera uma versão "às cegas" (sem gabarito) de arquivos de lições, para revisão
// independente: node lessons/blind.js lessons/level-2b.js [...] > saida.txt
// e o gabarito separado com --key.
const fs = require("fs"), vm = require("vm");
const args = process.argv.slice(2), key = args.includes("--key");
for (const f of args.filter((a) => a !== "--key")) {
  const ctx = { LESSONS: [] }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx);
  for (const l of ctx.LESSONS) {
    console.log(`\n=== ${l.id} (nível ${l.level}, ${l.theme}) — ${l.title}`);
    if (!key) {
      console.log(l.paras ? l.paras.join("\n") : l.radio ? l.radio.map((r) => `${r[0]}: ${r[1]}`).join("\n") : l.text);
      l.questions.forEach((q, i) => {
        console.log(`\n${i + 1}. [${q.t}] ${q.q}`);
        q.opts.forEach((o, j) => console.log(`   ${"ABCDE"[j]}) ${o}`));
      });
    } else l.questions.forEach((q, i) => console.log(`${i + 1}. ${"ABCDE"[q.a]} — ${q.why}`));
  }
}
