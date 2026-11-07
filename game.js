// ---------- Gamificação e metas de aprendizagem ----------
// Pontos (XP), meta diária, sequência de dias, conquistas e meta de longo prazo
// com previsão de chegada. Carregado antes de app.js; usa S, save, LESSONS etc.
// só quando chamado (depois que tudo carregou).

const DAILY = {
  plano: { label: "Plano do dia", lessons: 3, reviews: 15, desc: "3 lições + 1 texto + revisão de palavras (≈ 20 min)" },
  leve: { label: "Leve", lessons: 1, reviews: 10, desc: "1 lição + 10 revisões" },
  regular: { label: "Regular", lessons: 2, reviews: 15, desc: "2 lições + 15 revisões" },
  intenso: { label: "Intenso", lessons: 4, reviews: 20, desc: "4 lições + 20 revisões" },
};
const XP = { correctFirst: 10, correctRetry: 2, star: 20, reviewOk: 3, reviewMiss: 1, goal: 25 };
const TARGETS = { 2: "Nível 2 (≈ A2)", 3: "Nível 3 (≈ B1)", 4: "Nível 4 (≈ B2)", 5: "Prova ANPAD (nível 5)" };

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayObj(k) { S.log = S.log || {}; return (S.log[k] = S.log[k] || { xp: 0, lessons: [], reviews: 0, goal: false }); }
function today() { return dayObj(dayKey()); }

// Na primeira vez, reconstrói o histórico a partir das lições já feitas (que têm data).
function gameInit() {
  S.log = S.log || {};
  S.goal = S.goal || { daily: "plano", target: 5, date: "" };
  if (!S.goalV2) { S.goal.daily = "plano"; S.goalV2 = 1; }
  S.badges = S.badges || {};
  if (S.gameInit) return;
  const need = DAILY[S.goal.daily];
  for (const [id, t] of Object.entries(S.timing || {})) {
    if (!t.at) continue;
    const d = dayObj(dayKey(t.at)), f = (S.first || {})[id] || 0;
    d.xp += Math.round(f * t.nq) * XP.correctFirst + (mastered(id) ? XP.star : 0);
    if (f >= PASS && !d.lessons.includes(id)) d.lessons.push(id);
  }
  // Revisões passadas: a última revisão de cada palavra foi em (próxima data − intervalo do estágio).
  for (const c of Object.values(S.srs || {})) {
    if (!(c.box >= 1)) continue;
    const d = dayObj(dayKey(c.due - INTERVALS[c.box] * DAY));
    d.reviews++; d.xp += XP.reviewOk;
  }
  for (const d of Object.values(S.log)) if (!d.goal && d.lessons.length >= need.lessons && d.reviews >= need.reviews) { d.goal = true; d.xp += XP.goal; }
  S.gameInit = 1;
  checkBadges(true);
}

function awardLesson(id, ok, first, passedNow) {
  const d = today();
  let gain = ok * (first ? XP.correctFirst : XP.correctRetry);
  if (first && mastered(id)) gain += XP.star;
  if (passedNow && !d.lessons.includes(id)) d.lessons.push(id);
  d.xp += gain;
  return gain;
}
function awardReview(ok) { const d = today(); d.reviews++; d.xp += ok ? XP.reviewOk : XP.reviewMiss; }

function goalStatus(d = today()) {
  const need = DAILY[S.goal.daily] || DAILY.plano;
  if (S.goal.daily === "plano" && typeof planStatus === "function" && S.placement && d === (S.log || {})[dayKey()]) {
    const st = planStatus();
    const nDone = st.tasks.filter((t) => t.done).length;
    return { need, plan: true, nDone, nAll: st.tasks.length, lessonsOk: st.tasks.filter((t) => t.kind === "lesson").every((t) => t.done), revOk: st.tasks.find((t) => t.kind === "review")?.done, done: st.done };
  }
  const revOk = d.reviews >= need.reviews || (dueCards().length === 0 && d.reviews > 0) || Object.keys(S.srs).length === 0;
  return { need, lessonsOk: d.lessons.length >= need.lessons, revOk, done: d.lessons.length >= need.lessons && revOk };
}
function streak() {
  let n = 0, t = Date.now();
  if (!(S.log || {})[dayKey(t)]?.goal) t -= DAY; // hoje ainda pode ser cumprido
  while ((S.log || {})[dayKey(t)]?.goal) { n++; t -= DAY; }
  return n;
}
function weekXP() { let s = 0; for (let i = 0; i < 7; i++) s += ((S.log || {})[dayKey(Date.now() - i * DAY)] || {}).xp || 0; return s; }
function totalXP() { return Object.values(S.log || {}).reduce((s, d) => s + d.xp, 0); }

// Depois de cada lição ou revisão: confere meta do dia e conquistas, e avisa.
function afterEvent() {
  const msgs = [], d = today(), g = goalStatus(d);
  if (!d.goal && g.done) { d.goal = true; d.xp += XP.goal; msgs.push(`🎯 Meta do dia cumprida! +${XP.goal} XP · 🔥 ${streak()} ${streak() === 1 ? "dia" : "dias"} seguidos`); }
  msgs.push(...checkMissions(d));
  msgs.push(...checkBadges());
  save();
  if (msgs.length) showSheet(msgs.join("<br>"));
}

// ---------- Missões diárias ----------
// Três por dia: ler um texto é fixa; as outras duas variam (sorteio estável pela data).
const MISSIONS = {
  ler: { label: "Ler um texto na aba Leitura", done: (d) => (d.reads || 0) >= 1 },
  licao: { label: "Fazer 1 lição", done: (d) => d.lessons.length >= 1 },
  ligacao: { label: "Treino de ligação: 8 questões", done: (d) => (d.linkItems || 0) >= 8 },
  revisar: { label: "Revisar 15 palavras", done: (d) => (d.wordRev || 0) >= 15 || ((d.wordRev || 0) > 0 && dueCards().length === 0) },
  minutos: { label: "10 min de inglês fora do app", done: (d) => ((d.ext || {}).min || 0) >= 10 },
  reler: { label: "Reler um texto", done: (d) => (d.rereads || 0) >= 1 },
};
const MISSION_XP = 10, MISSION_BONUS = 20;
function dayMissions(d = today()) {
  if (d.missions) return d.missions;
  const pool = ["licao", "ligacao", "revisar", "minutos"];
  if (typeof READINGS !== "undefined" && READINGS.some((r) => typeof rereadDue === "function" && rereadDue(r.id))) pool.push("reler");
  let h = 0; for (const ch of dayKey()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = pool.splice(h % pool.length, 1)[0], b = pool[(h >>> 8) % pool.length];
  d.missions = { ids: ["ler", a, b], done: {}, bonus: false };
  return d.missions;
}
function checkMissions(d) {
  if (S.goal.daily === "plano" && typeof planStatus === "function" && S.placement) {
    const st = planStatus(), msgs = [];
    d.planDone = d.planDone || {};
    for (const t of st.tasks) if (t.done && !d.planDone[t.id]) { d.planDone[t.id] = 1; d.xp += 5; }
    if (st.done && !d.planBonus) { d.planBonus = true; d.xp += 30; msgs.push("📅 Plano do dia concluído! +30 XP"); }
    return msgs;
  }
  const m = dayMissions(d), msgs = [];
  for (const id of m.ids) if (!m.done[id] && MISSIONS[id].done(d)) { m.done[id] = true; d.xp += MISSION_XP; msgs.push(`✅ Missão: ${MISSIONS[id].label} (+${MISSION_XP} XP)`); }
  if (!m.bonus && m.ids.every((id) => m.done[id])) { m.bonus = true; d.xp += MISSION_BONUS; msgs.push(`🎁 Missões do dia completas! +${MISSION_BONUS} XP`); }
  return msgs;
}

// ---------- Conquistas ----------
function levelDone(L) {
  const ls = LESSONS.filter((l) => l.level === L);
  return ls.length > 0 && ls.filter((l) => passed(l.id)).length >= Math.ceil(ls.length * 0.75);
}
const passedCount = () => LESSONS.filter((l) => passed(l.id)).length;
const starCount = () => LESSONS.filter((l) => mastered(l.id)).length;
const memorized = () => Object.values(S.srs || {}).filter((c) => c.box >= 3).length;
const BADGES = [
  { id: "primeira", icon: "🌱", name: "Primeira lição", desc: "Conclua uma lição.", test: () => passedCount() >= 1 },
  { id: "l10", icon: "📘", name: "10 lições", desc: "Conclua 10 lições.", test: () => passedCount() >= 10 },
  { id: "l30", icon: "📚", name: "30 lições", desc: "Conclua 30 lições.", test: () => passedCount() >= 30 },
  { id: "s5", icon: "⭐", name: "5 estrelas", desc: "Domine 5 lições (80% com leitura fluente).", test: () => starCount() >= 5 },
  { id: "s15", icon: "🌟", name: "15 estrelas", desc: "Domine 15 lições.", test: () => starCount() >= 15 },
  { id: "q3", icon: "🔥", name: "3 dias seguidos", desc: "Cumpra a meta do dia 3 dias seguidos.", test: () => streak() >= 3 },
  { id: "q7", icon: "🔥", name: "Semana completa", desc: "Cumpra a meta do dia 7 dias seguidos.", test: () => streak() >= 7 },
  { id: "q30", icon: "🏆", name: "Mês completo", desc: "Cumpra a meta do dia 30 dias seguidos.", test: () => streak() >= 30 },
  { id: "rev0", icon: "🧹", name: "Revisão em dia", desc: "Zere a revisão com 30 ou mais palavras no ciclo.", test: () => Object.keys(S.srs || {}).length >= 30 && dueCards().length === 0 },
  { id: "mem50", icon: "🧠", name: "50 palavras na memória", desc: "Leve 50 palavras ao 4º estágio da revisão (7 dias ou mais).", test: () => memorized() >= 50 },
  { id: "perf3", icon: "🎯", name: "Perfeito no nível 3", desc: "Acerte 100% na 1ª tentativa de uma lição de nível 3 ou acima.", test: () => LESSONS.some((l) => l.level >= 3 && (S.first || {})[l.id] === 1) },
  { id: "flu3", icon: "⚡", name: "Leitura fluente no nível 3", desc: "Domine (★) uma lição de nível 3 ou acima.", test: () => LESSONS.some((l) => l.level >= 3 && mastered(l.id)) },
  { id: "n1", icon: "1️⃣", name: "Nível 1 concluído", desc: "Conclua 75% das lições do nível 1.", test: () => levelDone(1) },
  { id: "n2", icon: "2️⃣", name: "Nível 2 concluído", desc: "Conclua 75% das lições do nível 2.", test: () => levelDone(2) },
  { id: "n3", icon: "3️⃣", name: "Nível 3 concluído", desc: "Conclua 75% das lições do nível 3.", test: () => levelDone(3) },
  { id: "n4", icon: "4️⃣", name: "Nível 4 concluído", desc: "Conclua 75% das lições do nível 4.", test: () => levelDone(4) },
  { id: "lk20", icon: "🔗", name: "20 ligações dominadas", desc: "Domine 20 questões do treino de palavras de ligação.", test: () => linkMastered() >= 20 },
  { id: "lk60", icon: "⛓️", name: "60 ligações dominadas", desc: "Domine 60 questões do treino de palavras de ligação.", test: () => linkMastered() >= 60 },
  { id: "leitor10", icon: "📖", name: "Leitor", desc: "Leia 10 textos na aba Leitura.", test: () => Object.keys(S.reads || {}).length >= 10 },
  { id: "releu", icon: "🔁", name: "Releitura mais rápida", desc: "Releia um texto mais rápido que da primeira vez.", test: () => Object.values(S.reads || {}).some((r) => r.length > 1 && r[r.length - 1].wpm > r[0].wpm) },
  { id: "fora60", icon: "🎧", name: "Uma hora fora do app", desc: "Registre 60 minutos de inglês fora do app em 7 dias.", test: () => typeof extWeek === "function" && extWeek() >= 60 },
  { id: "anpad", icon: "🎓", name: "Primeira ANPAD", desc: "Conclua uma lição no formato ANPAD.", test: () => LESSONS.some((l) => l.exam && passed(l.id)) },
];
function checkBadges(silent) {
  const msgs = [];
  for (const b of BADGES) if (!S.badges[b.id] && b.test()) { S.badges[b.id] = Date.now(); if (!silent) msgs.push(`🏅 Conquista: ${b.icon} ${b.name}`); }
  return msgs;
}

// ---------- Meta de aprendizagem (longo prazo) ----------
// Caminho = concluir 75% das lições de cada nível, do nível atual até o anterior à meta.
function pathInfo() {
  const target = +S.goal.target || 5, from = startLevel();
  const levels = [];
  for (let L = Math.min(from, target - 1); L <= target - 1; L++) {
    const ls = LESSONS.filter((l) => l.level === L), total = ls.length, done = ls.filter((l) => passed(l.id)).length;
    const need = Math.ceil(total * 0.75);
    levels.push({ L, total, done, need, rem: Math.max(0, need - done) });
  }
  const remaining = levels.reduce((s, x) => s + x.rem, 0);
  // ritmo: lições concluídas nos últimos 14 dias
  const ids = new Set();
  for (let i = 0; i < 14; i++) (((S.log || {})[dayKey(Date.now() - i * DAY)] || {}).lessons || []).forEach((id) => ids.add(id));
  const perWeek = ids.size / 2;
  const eta = perWeek > 0 ? new Date(Date.now() + (remaining / perWeek) * 7 * DAY) : null;
  let needPerWeek = null;
  if (S.goal.date) {
    const weeks = Math.max(1, (new Date(S.goal.date + "T23:59:59") - Date.now()) / (7 * DAY));
    needPerWeek = Math.ceil(remaining / weeks);
  }
  return { target, levels, remaining, perWeek, eta, needPerWeek };
}
const fmtDate = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

// ---------- Telas ----------
function todayHTML() {
  const d = today(), g = goalStatus(d), st = streak();
  const lPct = Math.min(100, (d.lessons.length / g.need.lessons) * 100);
  const rPct = g.revOk ? 100 : Math.min(100, (d.reviews / g.need.reviews) * 100);
  if (g.plan) return `<a class="card today" href="#metas">
    <div class="today-top"><span class="streak ${st ? "on" : ""}">🔥 ${st} ${st === 1 ? "dia" : "dias"}</span><span class="xp">${d.xp} XP hoje · ${weekXP()} na semana</span></div>
    <div class="mini"><span>Plano do dia ${g.nDone}/${g.nAll}</span><div class="bar"><div style="width:${(g.nDone / g.nAll) * 100}%"></div></div></div>
    ${typeof extToday === "function" ? `<p class="muted">Inglês fora do app hoje: ${extToday().min} min</p>` : ""}
  </a>`;
  return `<a class="card today" href="#metas">
    <div class="today-top">
      <span class="streak ${st ? "on" : ""}">🔥 ${st} ${st === 1 ? "dia" : "dias"}</span>
      <span class="xp">${d.xp} XP hoje · ${weekXP()} na semana</span>
    </div>
    <p class="muted">${d.goal ? "🎯 Meta do dia cumprida." : `Meta do dia (${DAILY[S.goal.daily].label.toLowerCase()}): ${g.need.desc}`}</p>
    <div class="mini"><span>Lições ${Math.min(d.lessons.length, g.need.lessons)}/${g.need.lessons}</span><div class="bar"><div style="width:${lPct}%"></div></div></div>
    <div class="mini"><span>Revisões ${g.revOk ? "✓" : `${d.reviews}/${g.need.reviews}`}</span><div class="bar"><div style="width:${rPct}%"></div></div></div>
    <p class="eyebrow" style="margin-top:12px">Missões do dia ${dayMissions(d).bonus ? "· 🎁 completas" : ""}</p>
    <ul class="missions">${dayMissions(d).ids.map((id) => `<li class="${dayMissions(d).done[id] ? "ok" : ""}">${dayMissions(d).done[id] ? "✅" : "⬜"} ${MISSIONS[id].label}</li>`).join("")}</ul>
  </a>`;
}

function goals() {
  const p = pathInfo(), st = streak();
  const days = [...Array(7)].map((_, i) => { const t = Date.now() - (6 - i) * DAY, d = (S.log || {})[dayKey(t)] || {}; return { t, d }; });
  const wd = (t) => new Date(t).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  view().innerHTML = `<h2>Metas</h2>
    ${todayHTML()}

    ${typeof extHTML === "function" ? extHTML() : ""}

    <section class="card">
      <h3>Meta diária</h3>
      <div class="chips">${Object.entries(DAILY).map(([k, v]) => `<button class="chip ${S.goal.daily === k ? "on" : ""}" data-daily="${k}">${v.label}</button>`).join("")}</div>
      <p class="muted">${DAILY[S.goal.daily].desc}. Cumprir a meta vale +${XP.goal} XP e mantém sua sequência de dias 🔥.</p>
      ${typeof planRunway === "function" ? (() => { const n = planRunway(); const end = new Date(Date.now() + Math.ceil(n / 5 * 7) * DAY); return `<p class="muted">O conteúdo atual cobre cerca de <b>${n} dias de estudo</b> do plano (estudando 5 dias por semana, até ~${fmtDate(end)}).</p>`; })() : ""}
    </section>

    <section class="card">
      <h3>Meta de aprendizagem</h3>
      <label class="field">Quero chegar a
        <select id="gTarget">${Object.entries(TARGETS).filter(([k]) => +k > 1).map(([k, v]) => `<option value="${k}" ${+S.goal.target === +k ? "selected" : ""}>${v}</option>`).join("")}</select>
      </label>
      <label class="field">Até (opcional)
        <input type="date" id="gDate" value="${S.goal.date || ""}">
      </label>
      ${p.levels.map((x) => `<div class="mini"><span>Nível ${x.L}: ${Math.min(x.done, x.need)}/${x.need}${x.done >= x.need ? " ✓" : ""}</span><div class="bar"><div style="width:${x.need ? Math.min(100, (x.done / x.need) * 100) : 100}%"></div></div></div>`).join("")}
      <p>${p.remaining === 0 ? `<b>Caminho concluído!</b> ${p.target === 5 ? "As lições ANPAD estão liberadas para você." : "Hora de escolher uma meta maior."}`
          : `Faltam <b>${p.remaining}</b> ${p.remaining === 1 ? "lição" : "lições"} para concluir o caminho até ${esc(TARGETS[p.target])}.`}</p>
      ${p.remaining ? `<p class="muted">${p.perWeek > 0 ? `No seu ritmo das últimas 2 semanas (${String(p.perWeek).replace(".", ",")} lições por semana), você chega lá por volta de <b>${fmtDate(p.eta)}</b>.` : "Conclua algumas lições para o app calcular sua previsão de chegada."}
        ${p.needPerWeek != null ? ` Para chegar até ${fmtDate(new Date(S.goal.date + "T12:00:00"))}: <b>${p.needPerWeek} ${p.needPerWeek === 1 ? "lição" : "lições"} por semana</b>.` : ""}</p>` : ""}
      <p class="muted">Concluir um nível = 75% das lições dele com 80% de acertos. Novas lições entram no caminho à medida que são publicadas.</p>
    </section>

    <section class="card">
      <h3>Últimos 7 dias</h3>
      <div class="week">${days.map(({ t, d }) => `<div class="wday ${d.goal ? "met" : ""}"><span class="muted">${wd(t)}</span><b>${d.goal ? "✓" : "·"}</b><span class="muted">${d.xp || 0}</span></div>`).join("")}</div>
      <p class="muted">Sequência atual: 🔥 ${st} ${st === 1 ? "dia" : "dias"} · Total: ${totalXP()} XP</p>
    </section>

    <section class="card">
      <h3>Conquistas <span class="muted">${Object.keys(S.badges).length}/${BADGES.length}</span></h3>
      <div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? "got" : ""}"><span class="bi">${b.icon}</span><b>${esc(b.name)}</b><span class="muted">${esc(b.desc)}</span></div>`).join("")}</div>
    </section>

    <section class="card">
      <h3>Como ganhar XP</h3>
      <table>
        <tr><td>Acerto na 1ª tentativa</td><td>+${XP.correctFirst}</td></tr>
        <tr><td>Acerto ao refazer</td><td>+${XP.correctRetry}</td></tr>
        <tr><td>Lição dominada (★)</td><td>+${XP.star}</td></tr>
        <tr><td>Palavra lembrada na revisão</td><td>+${XP.reviewOk}</td></tr>
        <tr><td>Palavra revisada (não lembrada)</td><td>+${XP.reviewMiss}</td></tr>
        <tr><td>Meta do dia cumprida</td><td>+${XP.goal}</td></tr>
        <tr><td>Texto lido / relido na Leitura</td><td>+15 / +8</td></tr>
        <tr><td>Minuto de inglês fora do app (até 60/dia)</td><td>+1</td></tr>
        <tr><td>Missão do dia / todas as missões</td><td>+${MISSION_XP} / +${MISSION_BONUS}</td></tr>
      </table>
    </section>
    <a class="card row" href="#guia"><span><b>Guia do curso</b><br><span class="muted">Níveis, estratégias, tipos de pergunta, ANPAD</span></span><span class="tag">Abrir</span></a>`;
  if (typeof bindExt === "function") bindExt();
  view().querySelectorAll("[data-daily]").forEach((b) => b.onclick = () => { S.goal.daily = b.dataset.daily; afterEvent(); goals(); });
  $("#gTarget").onchange = (e) => { S.goal.target = +e.target.value; save(); goals(); };
  $("#gDate").onchange = (e) => { S.goal.date = e.target.value; save(); goals(); };
}
