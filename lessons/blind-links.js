// Versão às cegas (sem gabarito) dos bancos de ligação, para revisão independente:
// node lessons/blind-links.js lessons/links-a.js [...]  |  com --key, só o gabarito.
const fs = require("fs"), vm = require("vm");
const args = process.argv.slice(2), key = args.includes("--key");
for (const f of args.filter((a) => a !== "--key")) {
  const ctx = { LINK_WORDS: [], LINK_ITEMS: [] }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx);
  for (const i of ctx.LINK_ITEMS) {
    if (key) { console.log(`${i.id}: ${"ABCD"[i.a]} — ${i.why}`); continue; }
    console.log(`\n${i.id} [${i.kind}, nível ${i.level}]`);
    console.log(i.s);
    if (i.q) console.log("Pergunta: " + i.q);
    i.opts.forEach((o, j) => console.log(`   ${"ABCD"[j]}) ${o}`));
  }
}
