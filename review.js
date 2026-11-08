// ---------- Reforço de palavras difíceis ("sanguessugas") ----------
// Depois de esquecer a palavra em 4 dias diferentes (ou se o aluno tocar em "Difícil"), ela sai da revisão normal e vai para o
// reforço: 4 exercícios montados na hora com frases reais do acervo do app
// (lições, textos e treino de ligação) em que a palavra — ou outra forma dela — aparece.
// Acertando 3 de 4, ela volta à revisão normal. Palavras com poucas frases ficam
// listadas em S.needSent para receberem frases sob medida (review/extra.js).

const LEECH_AT = 4;

let _corpus = null, _byRank = null;
function corpus() {
  if (_corpus) return _corpus;
  const texts = [
    ...LESSONS.flatMap((l) => (l.paras ? l.paras : l.radio ? l.radio.map((r) => r[1]) : [l.text])),
    ...(typeof READINGS !== "undefined" ? READINGS.flatMap((r) => r.paras) : []),
    ...(typeof LINK_ITEMS !== "undefined" ? LINK_ITEMS.filter((i) => i.kind !== "lacuna").map((i) => i.s) : []),
  ];
  _corpus = [...new Set(texts.flatMap((t) => t.split(/(?<=[.!?])\s+/)).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 5 && s.length <= 220))];
  return _corpus;
}
// Formas da mesma palavra (mesma posição na NGSL = mesma família).
function formsOf(term) {
  const t = String(term).toLowerCase();
  if (t.includes(" ") || typeof NGSL_RANK === "undefined") return [t];
  if (!_byRank) { _byRank = {}; for (const [w, r] of Object.entries(NGSL_RANK)) (_byRank[r] = _byRank[r] || []).push(w); }
  const lem = typeof rLemma === "function" ? rLemma(t) : t, rank = NGSL_RANK[lem];
  return [...new Set([t, ...(rank ? _byRank[rank] : [])])];
}
const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function sentencesFor(term) {
  const forms = formsOf(term).sort((a, b) => b.length - a.length);
  const re = new RegExp("\\b(" + forms.map(reEsc).join("|") + ")\\b", "i");
  const extra = (typeof EXTRA_SENTENCES !== "undefined" && EXTRA_SENTENCES[String(term).toLowerCase()]) || [];
  const found = [...extra, ...corpus().filter((s) => re.test(s))];
  return { list: [...new Set(found)], re };
}

function leeches() { return Object.entries(S.srs || {}).filter(([, c]) => c.leech && !c.skip); }
// Conta no máximo uma falha por dia: "4 vezes" = esquecer a palavra em 4 dias diferentes.
function markLapse(en, c) {
  const k = dayKey();
  if (c.lapseDay === k) return false;
  c.lapseDay = k;
  c.lapses = (c.lapses || 0) + 1;
  if (c.lapses >= LEECH_AT && !c.leech) {
    c.leech = true;
    if (sentencesFor(en).list.length < 2) { S.needSent = S.needSent || {}; S.needSent[en] = 1; }
    return true;
  }
  return false;
}

function pickDistractors(en, field, n = 3) {
  const t = tagOf(en);
  const pool = Object.entries(S.srs || {}).filter(([k, c]) => k !== en && !c.skip && (field !== "pt" || c.pt));
  const same = pool.filter(([k]) => tagOf(k).cat === t.cat);
  const src = (same.length >= n ? same : pool).map(([k, c]) => (field === "pt" ? c.pt : k));
  const out = [];
  const ans = String(field === "pt" ? S.srs[en].pt : en).toLowerCase();
  for (const x of src.sort(() => Math.random() - 0.5)) {
    if (out.length >= n) break;
    const lx = String(x).toLowerCase();
    if (out.includes(x) || lx === ans || ans.includes(lx) || lx.includes(ans)) continue; // evita "must" contra "must not"
    out.push(x);
  }
  return out;
}
function mcq(answer, distractors) {
  const opts = [answer, ...distractors].sort(() => Math.random() - 0.5);
  return { opts, a: opts.indexOf(answer) };
}

function buildDrill(en, c) {
  const { list, re } = sentencesFor(en);
  const sents = list.length ? list.sort(() => Math.random() - 0.5) : (c.ex ? [c.ex] : []);
  const ex = [];
  const s1 = sents[0], s2 = sents[1] || sents[0];
  if (s1) ex.push({ kind: "sentido", s: s1, re, ...mcq(c.pt, pickDistractors(en, "pt")), prompt: "O que a palavra destacada significa nesta frase?" });
  for (const s of [s2, sents[2] || c.ex].filter(Boolean).slice(0, 2)) {
    if (!re.test(s)) continue;
    const m = s.match(re)[0];
    ex.push({ kind: "lacuna", s: s.replace(re, "_____"), shown: m, ...mcq(m.toLowerCase() === en.toLowerCase() ? en : m, pickDistractors(en, "en")), prompt: "Qual palavra completa a frase?" });
  }
  ex.push({ kind: "ouvir", say: en, ...mcq(en, pickDistractors(en, "en")), prompt: "Ouça e escolha a palavra que foi dita." });
  return ex.slice(0, 4);
}

function reinforce() {
  const list = leeches();
  if (!list.length) { location.hash = "#revisao"; return; }
  const [en, c] = list[0];
  const drill = buildDrill(en, c);
  let k = 0, wrong = 0;
  const draw = () => {
    if (k >= drill.length) {
      const ok = wrong <= Math.max(0, drill.length - 3);
      if (ok) { c.leech = false; c.lapses = 2; c.box = 1; c.due = Date.now() + INTERVALS[1] * DAY; }
      else { c.due = Date.now() + 10 * 60000; }
      today().xp += ok ? 10 : 3; save(); afterEvent(); updateBadge();
      view().innerHTML = `<section class="card center">
        <p class="eyebrow">Reforço: ${esc(en)}</p>
        <div class="level">${drill.length - wrong}/${drill.length}</div>
        <p class="${ok ? "ok" : "bad"}">${ok ? "Palavra reforçada! Ela volta para a revisão normal amanhã." : "Ainda difícil. Ela volta para o reforço daqui a pouco, com outras frases."}</p>
        <p><b>${esc(en)}</b> = ${esc(c.pt)}</p>
        ${S.needSent && S.needSent[en] ? `<p class="muted">Esta palavra tem poucas frases no app. Ela está na lista para receber frases sob medida no próximo lote.</p>` : ""}
        ${leeches().length ? `<button class="btn primary block" id="nextLeech">Próxima palavra difícil (${leeches().length})</button>` : ""}
        <a class="btn block" href="#revisao">Voltar à revisão</a></section>`;
      const nb = $("#nextLeech"); if (nb) nb.onclick = () => reinforce();
      return;
    }
    const e = drill[k];
    const sentence = e.kind === "sentido" ? esc(e.s).replace(new RegExp(e.re.source, "i"), (m) => `<mark>${m}</mark>`) : e.kind === "lacuna" ? esc(e.s).replace("_____", '<span class="blank">_____</span>') : "";
    view().innerHTML = `
      <p class="eyebrow">Reforço de palavra difícil · ${k + 1} de ${drill.length}</p>
      <div class="bar"><div style="width:${(k / drill.length) * 100}%"></div></div>
      <section class="card">
        ${sentence ? `<p class="prose">${sentence}</p>` : `<button type="button" class="btn primary block" data-say="${esc(e.say)}">🔊 Ouvir</button>`}
        <fieldset class="q" id="R0"><legend>${esc(e.prompt)}</legend>
          ${e.opts.map((o, j) => `<label><input type="radio" name="R0" value="${j}"> ${esc(o)}</label>`).join("")}
          <p class="why hidden"></p></fieldset>
        <button class="btn primary block" id="rgo">Conferir</button>
      </section>`;
    if (e.kind === "ouvir") setTimeout(() => say(e.say), 300);
    $("#rgo").onclick = () => {
      const sel = document.querySelector('input[name="R0"]:checked'); if (!sel) return;
      const right = +sel.value === e.a; if (!right) wrong++;
      const box = $("#R0"); box.classList.add(right ? "right" : "wrong");
      const w = box.querySelector(".why");
      w.textContent = right ? `✔ ${en} = ${c.pt}` : `✘ Resposta: ${e.opts[e.a]}. (${en} = ${c.pt})`; w.classList.remove("hidden");
      view().querySelectorAll('input[name="R0"]').forEach((r) => (r.disabled = true));
      today().wordRev = (today().wordRev || 0) + 1; save();
      if (e.kind !== "ouvir") say(en);
      $("#rgo").textContent = k === drill.length - 1 ? "Ver resultado" : "Próximo";
      $("#rgo").onclick = () => { k++; draw(); scrollTo(0, 0); };
    };
  };
  draw();
}

function leechCardHTML() {
  const n = leeches().length;
  return n ? `<a class="card row leech" href="#reforco"><span><b>🧩 Reforço de palavras difíceis</b><br><span class="muted">${n} ${n === 1 ? "palavra difícil" : "palavras difíceis"} · exercícios com frases</span></span><span class="tag">Treinar</span></a>` : "";
}

// Envio manual para o reforço (botão "Difícil" na revisão).
function sendToReinforce(en) {
  const c = S.srs[en]; if (!c) return;
  c.leech = true; c.lapses = Math.max(c.lapses || 0, LEECH_AT); c.manualLeech = true;
  if (sentencesFor(en).list.length < 2) { S.needSent = S.needSent || {}; S.needSent[en] = 1; }
  save(); updateBadge();
}
