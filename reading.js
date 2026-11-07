// ---------- Leitura extensiva, releitura e minutos fora do app ----------
// Leitura extensiva: textos para ler com fluência, escolhidos para que o aluno
// conheça ~95–98% das palavras (Nation). "Conhecidas" = palavras da NGSL até a
// faixa do nível + palavras já aprendidas na revisão + cognatos transparentes.
// Releitura espaçada (leitura repetida melhora a fluência): o texto volta em
// alguns dias e o app compara a velocidade.

const NUM_WORDS = new Set("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion first second third fourth fifth half".split(" "));
const READ_BAND = { 1: 600, 2: 1000, 3: 1600, 4: 2200, 5: 2809 };
const EXT_ACTS = { f1: "🏎️ F1 / rádio", serie: "🎬 Série ou filme", podcast: "🎧 Podcast ou vídeo", noticia: "📰 Notícia ou artigo", conversa: "💬 Conversa", outro: "✍️ Outro" };

function rLemma(w) {
  if (NGSL_RANK[w]) return w;
  if (NUM_WORDS.has(w)) return "one";
  const c = w.replace(/n't$|'ll$|'re$|'ve$|'d$|'m$/, ""); if (c !== w) return NGSL_RANK[c] ? c : c === "ca" || c === "wo" || c === "sha" ? "will" : (NGSL_RANK[c.replace(/'s$/, "")] ? c.replace(/'s$/, "") : c);
  const t = [w.replace(/'s$/, ""), w.replace(/s$/, ""), w.replace(/es$/, ""), w.replace(/ies$/, "y"), w.replace(/ed$/, ""), w.replace(/d$/, ""),
    w.replace(/ing$/, ""), w.replace(/ing$/, "e"), w.replace(/ly$/, ""), w.replace(/er$/, ""), w.replace(/est$/, ""), w.replace(/ied$/, "y")];
  return t.find((x) => NGSL_RANK[x]) || w;
}
const rCognate = (w) => /(tion|sion|ity|ment|ence|ance|ical|ic|ive|ous|al|ism|ist|ize|ise|ary|ory)s?$/.test(w) && w.length > 5;

// Palavras que o aluno já aprendeu (revisão no 3º estágio ou mais, palavras fáceis e das lições concluídas).
function learnedWords() {
  const set = new Set();
  for (const [en, c] of Object.entries(S.srs || {})) if (c.skip || c.box >= 2) en.toLowerCase().split(/\s+/).forEach((w) => set.add(w));
  for (const l of LESSONS) if (passed(l.id)) l.vocab.forEach(([en]) => { if (!en.includes(" ")) set.add(en.toLowerCase()); });
  for (const it of LINK_ITEMS) if ((S.links || {})[it.id]?.box >= 2) it.w.toLowerCase().split(/\s+/).forEach((w) => set.add(w));
  return set;
}
function readLevel() { return Math.max(2, startLevel()); }
function coverageOf(r, learned = learnedWords()) {
  const band = READ_BAND[Math.max(readLevel(), 1)];
  const gl = new Set((r.gloss || []).map((g) => g[0].toLowerCase()));
  const full = r.paras.join(" ");
  const toks = [...full.matchAll(/[A-Za-z][A-Za-z'’-]*/g)];
  const tokens = toks.map((m) => m[0]);
  // começo de frase: antes da palavra só há espaço/aspas e, antes disso, . ! ? : ou o início do texto
  const startsSentence = (i) => { const before = full.slice(0, toks[i].index).replace(/[\s"“‘(]+$/, ""); return !before || /[.!?:]$/.test(before); };
  let known = 0; const unknown = new Set();
  tokens.forEach((t, i) => {
    const w = t.toLowerCase().replace(/’/g, "'");
    const ok = w.split("-").every((p) => (NGSL_RANK[rLemma(p)] || 9999) <= band || learned.has(p) || learned.has(rLemma(p)))
      || rCognate(w) || (/^[A-Z]/.test(t) && !startsSentence(i));
    if (ok) known++; else unknown.add(w);
  });
  return { cov: tokens.length ? known / tokens.length : 1, unknown, words: tokens.length, gl };
}
function readsOf(id) { return ((S.reads || {})[id] || []); }
function rereadDue(id) { const r = readsOf(id); return r.length && r[r.length - 1].next && r[r.length - 1].next <= Date.now(); }

// Recomenda: primeiro releituras vencidas; depois um texto novo do nível com cobertura mais perto de 96%.
function recommendReading() {
  if (!READINGS.length) return null;
  const due = READINGS.filter((r) => rereadDue(r.id));
  if (due.length) return { r: due[0], reread: true };
  const learned = learnedWords(), lv = readLevel();
  const fresh = READINGS.filter((r) => !readsOf(r.id).length && r.level >= lv - 1 && r.level <= lv + 1)
    .map((r) => ({ r, c: coverageOf(r, learned).cov }))
    .sort((a, b) => Math.abs(a.c - 0.965) - Math.abs(b.c - 0.965) || Math.abs(a.r.level - lv) - Math.abs(b.r.level - lv));
  return fresh.length ? { r: fresh[0].r, reread: false } : null;
}

function markReading(text, r, info) {
  const links = linkTermsFor(r.level);
  const glossMap = new Map((r.gloss || []).map((g) => [g[0].toLowerCase(), g[1]]));
  const terms = [...glossMap.keys(), ...links.map((w) => w.w.toLowerCase())].sort((a, b) => b.length - a.length);
  const esc2 = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = terms.length ? new RegExp("\\b(" + terms.map(esc2).join("|") + ")\\b", "gi") : null;
  let html = esc(text);
  if (re) html = html.replace(re, (m) => {
    const k = m.toLowerCase();
    if (glossMap.has(k)) return `<span class="w" data-pt="${esc(glossMap.get(k))}" data-en="${esc(m)}">${m}</span>`;
    const lw = links.find((w) => w.w.toLowerCase() === k);
    return `<span class="w lk" data-pt="${esc(lw.pt + " (" + lw.rel + ")")}" data-en="${esc(m)}">${m}</span>`;
  });
  return html;
}

function readingList() {
  if (!READINGS.length) { view().innerHTML = `<h2>Leitura</h2><section class="card"><p>Os textos de leitura ainda não foram carregados.</p></section>${extHTML()}`; bindExt(); return; }
  const learned = learnedWords(), rec = recommendReading();
  const f = S.readTopic || "Todos";
  const topics = ["Todos", ...new Set(READINGS.map((r) => r.topic))];
  const rows = READINGS.filter((r) => f === "Todos" || r.topic === f).map((r) => ({ r, c: coverageOf(r, learned).cov, reads: readsOf(r.id) }))
    .sort((a, b) => a.r.level - b.r.level || b.c - a.c);
  view().innerHTML = `<h2>Leitura</h2>
    <p class="muted">Textos curtos para ler com fluência, sem perguntas difíceis. Cada um recicla as palavras mais frequentes do inglês e as palavras de ligação. O ideal é conhecer 95% das palavras ou mais.</p>
    ${rec ? `<a class="card" href="#ler-${rec.r.id}"><p class="eyebrow">${rec.reread ? "Releitura do dia" : "Recomendado para você"}</p><h3>${esc(rec.r.title)}</h3>
      <p class="muted">${esc(rec.r.topic)} · nível ${rec.r.level} · você conhece ~${Math.round(coverageOf(rec.r, learned).cov * 100)}% das palavras</p><span class="btn primary block">${rec.reread ? "Reler" : "Ler agora"}</span></a>` : ""}
    ${extHTML()}
    <div class="chips">${topics.map((t) => `<button class="chip ${t === f ? "on" : ""}" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>
    ${rows.map(({ r, c, reads }) => `<a class="card row" href="#ler-${r.id}"><span><b>${esc(r.title)}</b><br><span class="muted">${esc(r.topic)} · nível ${r.level} · ${Math.round(c * 100)}% conhecidas</span></span>
      <span class="tag">${reads.length ? (rereadDue(r.id) ? "Reler" : `✓ ${reads[reads.length - 1].wpm} ppm`) : "Ler"}</span></a>`).join("")}`;
  view().querySelectorAll("[data-t]").forEach((b) => b.onclick = () => { S.readTopic = b.dataset.t; save(); readingList(); });
  bindExt();
}

function readText(id) {
  const r = READINGS.find((x) => x.id === id);
  if (!r) { location.hash = "#leitura"; return; }
  const info = coverageOf(r), prev = readsOf(id), reread = prev.length > 0;
  const chk = r.check ? shuffled(r.check) : null; // alternativas embaralhadas a cada leitura
  view().innerHTML = `
    <p class="muted">${esc(r.topic)} · nível ${r.level} · ${info.words} palavras · você conhece ~${Math.round(info.cov * 100)}%</p>
    <h2>${esc(r.title)}</h2>
    ${reread ? `<p class="strat">Releitura: na última vez você leu a <b>${prev[prev.length - 1].wpm} palavras/min</b>. Leia com calma e veja se fica mais fluido.</p>` : `<p class="muted">Leia sem parar para traduzir. Palavras sublinhadas em vermelho são de ligação; as pontilhadas têm tradução ao toque.</p>`}
    <section class="card" id="readCard">${r.paras.map((p) => `<p class="prose">${markReading(p, r, info)}</p>`).join("")}</section>
    <button class="btn primary block" id="doneRead">Terminei de ler</button>
    <div id="after"></div>`;
  view().querySelectorAll(".w").forEach((el) => el.onclick = () => showSheet(`<b>${esc(el.dataset.en)}</b> = ${esc(el.dataset.pt)}`));
  // cronômetro de tempo ativo (pausas longas contam como 90 s; app em segundo plano não conta)
  let active = 0, last = Date.now();
  const tick = () => { const now = Date.now(); if (!document.hidden) active += Math.min(now - last, 90000); last = now; };
  const evs = ["scroll", "touchstart", "click", "keydown"];
  evs.forEach((e) => addEventListener(e, tick, { passive: true, capture: true }));
  const onVis = () => { if (document.hidden) tick(); else last = Date.now(); };
  document.addEventListener("visibilitychange", onVis);
  const stop = () => { evs.forEach((e) => removeEventListener(e, tick, { capture: true })); document.removeEventListener("visibilitychange", onVis); };
  currentTrack = { stop, finish() {} };
  $("#doneRead").onclick = () => {
    tick(); stop();
    const wpm = Math.round(info.words / Math.max(active / 60000, 0.1));
    $("#doneRead").hidden = true;
    $("#after").innerHTML = `
      <section class="card">
        <p><b>⏱ ${fmtTime(active)}</b> · ${wpm} palavras/min${reread ? ` (antes: ${prev[prev.length - 1].wpm})` : ""}</p>
        ${chk ? `<fieldset class="q" id="rc"><legend>${esc(chk.q)}</legend>${chk.opts.map((o, j) => `<label><input type="radio" name="rc" value="${j}"> ${esc(o)}</label>`).join("")}<p class="why hidden"></p></fieldset>` : ""}
        <p class="muted">Como foi a leitura?</p>
        <div class="chips">${[["facil", "Fácil"], ["bom", "Bom, entendi quase tudo"], ["dificil", "Difícil"]].map(([k, t]) => `<button class="chip" data-rate="${k}">${t}</button>`).join("")}</div>
      </section>`;
    $("#after").scrollIntoView({ behavior: "smooth", block: "start" });
    view().querySelectorAll("[data-rate]").forEach((b) => b.onclick = () => {
      const sel = document.querySelector('input[name="rc"]:checked');
      const ok = chk ? (sel ? +sel.value === chk.a : null) : null;
      const rate = b.dataset.rate;
      const days = rate === "dificil" ? 2 : rate === "bom" ? 4 : (reread ? 0 : 10);
      S.reads = S.reads || {};
      (S.reads[id] = S.reads[id] || []).push({ at: Date.now(), wpm, ms: active, rate, ok, next: days ? Date.now() + days * DAY : null });
      const d = today();
      d.reads = (d.reads || 0) + 1; if (reread) d.rereads = (d.rereads || 0) + 1;
      d.readMs = (d.readMs || 0) + active;
      const gain = (reread ? 8 : 15) + (ok ? 5 : 0); d.xp += gain;
      save(); afterEvent();
      $("#after").innerHTML = `<section class="card center">
        <p class="xpgain">+${gain} XP</p>
        ${ok === false ? `<p class="bad">A ideia principal era: ${esc(chk.opts[chk.a])}</p>` : ok ? `<p class="ok">Ideia principal certa.</p>` : ""}
        ${reread && wpm > prev[prev.length - 1].wpm ? `<p class="ok">Leitura ${Math.round((wpm / prev[prev.length - 1].wpm - 1) * 100)}% mais rápida que antes.</p>` : ""}
        <p class="muted">${days ? `Este texto volta para releitura em ${days} dias.` : "Texto concluído."}</p>
        <a class="btn primary block" href="#leitura">Outros textos</a></section>`;
    });
  };
}

// ---------- Minutos de inglês fora do app ----------
function extToday() { const d = today(); d.ext = d.ext || { min: 0, acts: {} }; return d.ext; }
function extWeek() { let s = 0; for (let i = 0; i < 7; i++) s += (((S.log || {})[dayKey(Date.now() - i * DAY)] || {}).ext || {}).min || 0; return s; }
function extHTML() {
  const e = extToday();
  return `<section class="card" id="extCard">
    <h3>Inglês fora do app</h3>
    <p class="muted">Assistiu F1 em inglês, uma série, um vídeo, leu uma notícia? Registre os minutos. Hoje: <b>${e.min} min</b> · semana: <b>${extWeek()} min</b></p>
    <div class="chips">${Object.entries(EXT_ACTS).map(([k, t]) => `<button class="chip ${S.extAct === k ? "on" : ""}" data-act="${k}">${t}</button>`).join("")}</div>
    <div class="duo4">${[5, 10, 15, 30].map((m) => `<button class="btn" data-min="${m}">+${m} min</button>`).join("")}</div>
  </section>`;
}
function bindExt() {
  document.querySelectorAll("[data-act]").forEach((b) => b.onclick = () => { S.extAct = b.dataset.act; save(); document.querySelectorAll("[data-act]").forEach((x) => x.classList.toggle("on", x === b)); });
  document.querySelectorAll("[data-min]").forEach((b) => b.onclick = () => {
    const m = +b.dataset.min, e = extToday(), act = S.extAct || "outro";
    const before = e.min; e.min += m; e.acts[act] = (e.acts[act] || 0) + m;
    const gain = Math.max(0, Math.min(60, e.min) - Math.min(60, before)); // 1 XP por minuto, até 60 por dia
    today().xp += gain;
    save(); afterEvent();
    showSheet(`+${m} min de inglês (${EXT_ACTS[act]})${gain ? ` · +${gain} XP` : ""}`);
    const card = $("#extCard"); if (card) { card.outerHTML = extHTML(); bindExt(); }
  });
}
