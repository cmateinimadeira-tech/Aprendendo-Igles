// ---------- Plano do dia (≈ 20 minutos) e subníveis ----------
// Ciclo de 5 dias de estudo: 3 lições + 1 texto + revisão de palavras.
// Fica-se bastante tempo nos níveis 1 e 2; o nível 3 entra só no 5º dia do ciclo.
// O plano é montado no primeiro acesso de cada dia, com as próximas lições ainda
// não feitas de cada subnível; quando um subnível acaba, entram as lições em que
// o aluno ficou abaixo de 80% na primeira tentativa (reforço).

const PLAN_CYCLE = [
  { lessons: ["1", "2.1", "2.2"], read: "2.1" },
  { lessons: ["1", "2.1", "2.2"], read: "2.1" },
  { lessons: ["2.1", "2.2", "2.2"], read: "2.2" },
  { lessons: ["1", "2.1", "2.2"], read: "2.2" },
  { lessons: ["2.2", "3.1", "3.1"], read: "3.1", l3: true },
];
const SUB_LABEL = { "1": "Nível 1", "2.1": "Nível 2.1", "2.2": "Nível 2.2", "3.1": "Nível 3.1", "3.2": "Nível 3.2", "4": "Nível 4", "5": "Nível 5 (ANPAD)" };
const SUB_ORDER = ["1", "2.1", "2.2", "3.1", "3.2", "4", "5"];

// Subnível de cada lição: o campo `sub` ou, nas lições antigas, um valor derivado.
function assignSubs() {
  const l3 = LESSONS.filter((l) => l.level === 3 && !l.sub)
    .map((l) => ({ l, n: (l.radio ? l.radio.map((r) => r[1]).join(" ") : l.text || "").split(/\s+/).length }))
    .sort((a, b) => a.n - b.n);
  l3.forEach((x, i) => { x.l.sub = i < Math.ceil(l3.length / 2) ? "3.1" : "3.2"; });
  for (const l of LESSONS) if (!l.sub) l.sub = l.level === 1 ? "1" : l.level === 2 ? "2.1" : String(l.level);
  if (typeof READINGS !== "undefined") for (const r of READINGS) if (!r.sub) r.sub = r.level === 2 ? "2.1" : r.level === 3 ? "3.1" : String(r.level);
}
const subOf = (l) => l.sub;

function planToday() {
  S.plan = S.plan || { days: [] };
  const k = dayKey(), days = S.plan.days;
  if (days.length && days[days.length - 1].date === k) return days[days.length - 1];
  const n = days.length, cyc = PLAN_CYCLE[n % PLAN_CYCLE.length];
  const planned = new Set(days.flatMap((d) => d.lessons));
  const pick = (sub) => {
    const pool = LESSONS.filter((l) => l.sub === sub && !l.exam);
    const fresh = pool.find((l) => !(S.attempted || {})[l.id] && !planned.has(l.id));
    if (fresh) return fresh;
    // reforço: lições do mesmo subnível que ficaram abaixo de 80% na primeira tentativa
    const weak = pool.find((l) => (S.first || {})[l.id] < PASS && !passed(l.id) && !planned.has(l.id));
    return weak || null;
  };
  const lessons = [];
  for (const sub of cyc.lessons) {
    let l = pick(sub);
    if (!l) for (const alt of ["2.2", "2.1", "1", "3.1"]) { if ((l = pick(alt))) break; }
    if (l) { lessons.push(l.id); planned.add(l.id); }
  }
  const readPool = READINGS.filter((r) => r.sub === cyc.read && !readsOf(r.id).length && !days.some((d) => d.reading === r.id));
  const reading = (readPool[0] || READINGS.find((r) => rereadDue(r.id)) || READINGS.find((r) => r.level === 2 && !readsOf(r.id).length) || {}).id || null;
  const day = { n: n + 1, date: k, lessons, reading, l3: !!cyc.l3 };
  days.push(day);
  save();
  return day;
}
function planStatus(day = planToday(), d = today()) {
  const tasks = day.lessons.map((id) => {
    const l = LESSONS.find((x) => x.id === id);
    return { kind: "lesson", id, label: l ? `${SUB_LABEL[l.sub]}: ${l.title}` : id, href: `#l-${id}`, done: !!(S.attempted || {})[id] };
  });
  if (day.reading) { const r = READINGS.find((x) => x.id === day.reading); tasks.push({ kind: "read", id: day.reading, label: `Texto: ${r ? r.title : ""}`, href: `#ler-${day.reading}`, done: readsOf(day.reading).some((x) => dayKey(x.at) === day.date) }); }
  tasks.push({ kind: "review", id: "rev", label: "Revisão de palavras (até 15)", href: "#revisao", done: (d.wordRev || 0) >= 15 || dueCards().length === 0 });
  return { tasks, done: tasks.every((t) => t.done), next: tasks.find((t) => !t.done) };
}
function inPlanToday(id) { return !!S.plan && planToday().lessons.includes(id); }

// Quantos dias de estudo o conteúdo atual ainda cobre (simulação do plano).
function planRunway() {
  const used = new Set([...Object.keys(S.attempted || {}), ...(S.plan ? S.plan.days.flatMap((d) => d.lessons) : [])]);
  const left = {}; for (const l of LESSONS) if (!l.exam && !used.has(l.id)) left[l.sub] = (left[l.sub] || 0) + 1;
  let n = (S.plan ? S.plan.days.length : 0), days = 0;
  while (days < 60) {
    const cyc = PLAN_CYCLE[n % PLAN_CYCLE.length]; let got = 0;
    for (const sub of cyc.lessons) {
      const s = [sub, "2.2", "2.1", "1"].find((x) => left[x] > 0);
      if (s) { left[s]--; got++; }
    }
    if (got < 2) break;
    days++; n++;
  }
  return days;
}

function planCardHTML() {
  if (!S.placement) return "";
  const day = planToday(), st = planStatus(day);
  return `<section class="card plan">
    <p class="eyebrow">Plano do dia ${day.n}${day.l3 ? " · dia de nível 3" : ""} · ≈ 20 min</p>
    <ul class="ptasks">${st.tasks.map((t) => `<li class="${t.done ? "ok" : ""}"><a href="${t.href}">${t.done ? "✅" : "⬜"} ${esc(t.label)}</a></li>`).join("")}</ul>
    ${st.next ? `<a class="btn primary block" href="${st.next.href}">${st.tasks.some((t) => t.done) ? "Continuar" : "Começar o plano"}</a>` : `<p class="ok">Plano do dia concluído. Se quiser mais, faça o treino de ligação ou registre minutos fora do app.</p>`}
  </section>`;
}
