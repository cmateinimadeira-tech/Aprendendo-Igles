// ---------- Estado salvo ----------
const $ = (sel) => document.querySelector(sel);
const KEY = "ingles-leitura-v1";
const PASS = 0.8; // 80% para avançar
const INTERVALS = [0, 1, 3, 7, 14, 30]; // dias entre revisões, por caixa
const DAY = 86400000;

let S = { placement: null, done: {}, srs: {}, notes: {}, updatedAt: 0 };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}

// O progresso fica no aparelho (localStorage) e, quando o app está aberto
// pelo claude.ai com login, também numa área privada da conta (capability db).
let cloud = null, cloudTimer = null;
function setSync(txt) { const el = $("#sync"); if (el) el.textContent = txt; }
function save() {
  S.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  if (cloud) {
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => {
      cloud.set({ state: JSON.stringify(S), updatedAt: S.updatedAt })
        .then(() => setSync("✓ salvo na conta"))
        .catch(() => setSync("salvo neste aparelho"));
    }, 800);
  }
}
async function initCloud() {
  setSync("salvo neste aparelho");
  if (!window.claude || !window.claude.use) return;
  try {
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    const ref = db.doc("data/users/" + uid + "/progress");
    const snap = await Promise.race([ref.get(), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 10000))]);
    cloud = ref;
    const remote = snap.exists ? snap.data() : null;
    if (remote && remote.state && (remote.updatedAt || 0) > (S.updatedAt || 0)) {
      Object.assign(S, JSON.parse(remote.state));
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
      route();
      setSync("✓ salvo na conta");
    } else if (S.updatedAt) {
      await ref.set({ state: JSON.stringify(S), updatedAt: S.updatedAt });
      setSync("✓ salvo na conta");
    } else {
      setSync("✓ conta conectada");
    }
  } catch (e) { cloud = null; }
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = () => $("#view");

// ---------- Regras de progresso ----------
function startLevel() { return S.placement ? Math.max(1, Math.min(S.placement.level, 4)) : 1; }
function passed(id) { return (S.done[id] || 0) >= PASS; }
const NEED = 2; // lições concluídas no nível anterior para liberar o próximo
function levelOpen(lv) {
  return lv <= startLevel() || LESSONS.filter((l) => l.level === lv - 1 && passed(l.id)).length >= NEED;
}
function unlocked(idx) { return levelOpen(LESSONS[idx].level); }
function nextLesson() {
  const open = LESSONS.filter((l, i) => unlocked(i) && !passed(l.id));
  return open.find((l) => l.level >= startLevel()) || open[0];
}
function dueCards() { const now = Date.now(); return Object.entries(S.srs).filter(([, c]) => c.due <= now); }

// ---------- Áudio opcional (voz do navegador) ----------
function speak(lines) {
  if (!("speechSynthesis" in window)) { showSheet("Este navegador não tem leitura em voz alta."); return; }
  speechSynthesis.cancel();
  lines.forEach((t) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "en-GB"; u.rate = 0.9;
    speechSynthesis.speak(u);
  });
}

// ---------- Faixa inferior (significado de palavras, avisos) ----------
let sheetTimer = null;
function showSheet(html) {
  const sh = $("#sheet");
  $("#sheetText").innerHTML = html;
  sh.hidden = false;
  clearTimeout(sheetTimer);
  sheetTimer = setTimeout(() => (sh.hidden = true), 5000);
}

// ---------- Texto com palavras clicáveis ----------
function markVocab(str, vocab) {
  if (!vocab.length) return esc(str);
  const terms = vocab.map((v) => v[0]).sort((a, b) => b.length - a.length);
  const re = new RegExp("\\b(" + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b", "gi");
  return esc(str).replace(re, (m) => {
    const v = vocab.find((x) => x[0].toLowerCase() === m.toLowerCase());
    return `<span class="w" data-pt="${esc(v[1])}" data-en="${esc(v[0])}">${m}</span>`;
  });
}
// Quebra os parágrafos em linhas fixas (como na prova) para poder citar "line N".
const WRAP = 72;
function examLines(item) {
  if (item._lines) return item._lines;
  const lines = [];
  item.paras.forEach((para) => {
    let cur = "", first = true;
    para.split(" ").forEach((w) => {
      if (cur && (cur + " " + w).length > WRAP) { lines.push({ text: cur, ind: first }); cur = w; first = false; }
      else cur = cur ? cur + " " + w : w;
    });
    if (cur) lines.push({ text: cur, ind: first });
  });
  return (item._lines = lines);
}
// Encontra a linha onde aparece um trecho (mesmo que quebre entre duas linhas).
function lineOf(item, phrase) {
  const lines = examLines(item);
  let joined = "", starts = [];
  lines.forEach((l) => { starts.push(joined.length); joined += l.text + " "; });
  const pos = joined.toLowerCase().indexOf(phrase.toLowerCase());
  if (pos < 0) return "?";
  let n = 0; while (n + 1 < starts.length && starts[n + 1] <= pos) n++;
  return n + 1;
}
function resolveLines(str, item, word) {
  return item && item.paras ? str.replace(/\{\{(.+?)\}\}/g, (m, ph) => `${word} ${lineOf(item, ph)}`) : str;
}

function renderReading(item, vocab = []) {
  if (item.paras) {
    return `<div class="lined">${examLines(item).map((l, i) =>
      `<div class="ln ${l.ind ? "ind" : ""}"><i class="${(i + 1) % 5 === 0 ? "five" : ""}">${i + 1}</i><span>${markVocab(l.text, vocab)}</span></div>`).join("")}
      ${item.source ? `<p class="src">${esc(item.source)}</p>` : ""}</div>`;
  }
  if (item.radio) {
    return `<div class="radio">${item.radio.map(([who, line]) =>
      `<p class="${who === "Driver" ? "drv" : "eng"}"><b>${who === "Driver" ? "Piloto" : "Engenheiro"}</b>${markVocab(line, vocab)}</p>`).join("")}</div>`;
  }
  return `<p class="prose">${markVocab(item.text, vocab)}</p>`;
}
function readingLines(item) { return item.radio ? item.radio.map((r) => r[1]) : item.paras ? item.paras : [item.text]; }

function questionsHTML(qs, prefix, item) {
  return qs.map((q, i) => `
    <fieldset class="q" id="${prefix}${i}">
      <legend>${i + 1}. ${esc(resolveLines(q.q, item, "line"))}${q.qpt ? `<span class="qpt">${esc(resolveLines(q.qpt, item, "linha"))}</span>` : ""}</legend>
      ${q.t ? `<button type="button" class="qt" data-tip="${esc(QTYPES[q.t].tip)}">${QTYPES[q.t].name} ⓘ</button>` : ""}
      ${q.opts.map((o, j) => `<label><input type="radio" name="${prefix}${i}" value="${j}"> ${q.opts.length === 5 ? "ABCDE"[j] + ") " : ""}${esc(o)}</label>`).join("")}
      <p class="why hidden"></p>
    </fieldset>`).join("");
}
function grade(qs, prefix) {
  let ok = 0, blank = 0; const byType = [];
  qs.forEach((q, i) => {
    const sel = document.querySelector(`input[name="${prefix}${i}"]:checked`);
    const box = $("#" + prefix + i);
    box.classList.remove("right", "wrong");
    if (!sel) { blank++; return; }
    const right = +sel.value === q.a;
    if (right) ok++;
    if (q.t) byType.push([q.t, right]);
    box.classList.add(right ? "right" : "wrong");
    if (q.why) {
      const w = box.querySelector(".why");
      w.textContent = (right ? "✔ " : "✘ ") + q.why + (!right && q.t ? ` Dica: ${QTYPES[q.t].tip}` : "");
      w.classList.remove("hidden");
    }
  });
  return { ok, blank, byType };
}

// Desempenho por tipo de habilidade de leitura (primeira correção de cada lição).
function recordSkills(byType) {
  S.skills = S.skills || {};
  byType.forEach(([t, right]) => {
    const k = (S.skills[t] = S.skills[t] || { ok: 0, total: 0 });
    k.total++; if (right) k.ok++;
  });
}
function skillsHTML() {
  const sk = S.skills || {};
  const rows = Object.keys(QTYPES).filter((t) => sk[t] && sk[t].total);
  if (!rows.length) return "";
  const pct = (t) => sk[t].ok / sk[t].total;
  const weak = rows.filter((t) => sk[t].total >= 2).sort((a, b) => pct(a) - pct(b))[0];
  return `<section class="card">
    <p class="muted">Suas habilidades de leitura</p>
    <table>${rows.map((t) => `<tr><td>${QTYPES[t].name}</td><td style="width:45%"><div class="bar"><div style="width:${pct(t) * 100}%"></div></div></td><td class="muted">${Math.round(pct(t) * 100)}%</td></tr>`).join("")}</table>
    ${weak && pct(weak) < 0.8 ? `<p><b>Ponto a melhorar: ${QTYPES[weak].name}.</b> ${QTYPES[weak].tip}</p>` : ""}
  </section>`;
}

// ---------- Telas ----------
function home() {
  const n = nextLesson(), due = dueCards().length;
  if (!S.placement) {
    view().innerHTML = `
      <section class="card">
        <h2>Bem-vindo</h2>
        <p>Este curso é focado em <b>ler e entender</b> inglês: mensagens de rádio da Fórmula 1 e textos curtos do dia a dia. A gramática aparece só quando ajuda a entender o texto.</p>
        <p>Primeiro, um teste rápido de leitura (4 textos curtos, cerca de 5 minutos) para descobrir de onde partir.</p>
        <a class="btn primary" href="#teste">Fazer o teste de leitura</a>
      </section>`;
    return;
  }
  const doneCount = LESSONS.filter((l) => passed(l.id)).length;
  view().innerHTML = `
    <section class="card">
      <p class="muted">Seu nível de leitura</p>
      <div class="level">Nível ${S.placement.level}${LEVELS[S.placement.level] ? ` <span class="cefr">≈ ${LEVELS[S.placement.level].cefr}</span>` : ""}</div>
      <p>${S.placement.level ? "No teste você mostrou que: " + esc(LEVELS[S.placement.level].can.charAt(0).toLowerCase() + LEVELS[S.placement.level].can.slice(1)) : "Vamos começar do básico, pelo nível 1 (≈ A1)."}</p>
      <p class="muted">Nível de partida das lições: ${startLevel()} (≈ ${LEVELS[startLevel()].cefr}). <a href="#guia">O que significa cada nível?</a></p>
      <div class="bar"><div style="width:${doneCount / LESSONS.length * 100}%"></div></div>
      <p class="muted">${doneCount} de ${LESSONS.length} lições concluídas</p>
    </section>
    ${n ? `<section class="card"><p class="muted">Próxima lição recomendada</p><h3>${esc(n.title)}</h3><p class="muted">${THEME_LABEL[n.theme]} · nível ${n.level}</p><a class="btn primary block" href="#l-${n.id}">Começar</a></section>`
        : `<section class="card"><h3>Você concluiu todas as lições disponíveis!</h3><p>Novas lições serão adicionadas.</p></section>`}
    <section class="card">
      <p class="muted">Revisão de vocabulário</p>
      <p>${due ? `<b>${due}</b> palavra(s) para revisar hoje.` : "Nada para revisar agora."}</p>
      ${due ? `<a class="btn" href="#revisao">Revisar</a>` : ""}
    </section>
    ${skillsHTML()}
    <p><button class="link" id="redo">Refazer o teste de nivelamento</button></p>`;
  $("#redo").onclick = (e) => {
    if (e.target.dataset.armed) { S.placement = null; save(); location.hash = "#teste"; return; }
    e.target.dataset.armed = 1;
    e.target.textContent = "Toque de novo para confirmar (as lições concluídas continuam salvas)";
  };
}

function test() {
  let step = 0; const scores = [];
  const draw = () => {
    const t = PLACEMENT[step];
    view().innerHTML = `
      <section class="card">
        <div class="bar"><div style="width:${step / PLACEMENT.length * 100}%"></div></div>
        <p class="muted">Texto ${step + 1} de ${PLACEMENT.length}. Responda o que conseguir; se não souber, deixe em branco.</p>
        ${renderReading(t)}
        ${questionsHTML(t.questions, "p")}
        <button class="btn primary block" id="go">${step === PLACEMENT.length - 1 ? "Ver resultado" : "Próximo texto"}</button>
      </section>`;
    $("#go").onclick = () => {
      scores[step] = grade(t.questions, "p").ok;
      if (step < PLACEMENT.length - 1) { step++; draw(); scrollTo(0, 0); return; }
      // nível = último texto em sequência com pelo menos 2 de 3 acertos
      let level = 0;
      for (let i = 0; i < PLACEMENT.length; i++) { if (scores[i] >= 2) level = PLACEMENT[i].level; else break; }
      S.placement = { level, scores }; save();
      location.hash = "#inicio";
    };
  };
  draw();
}

function lessonList() {
  const f = S.filter || "Todos";
  const chips = ["Todos", ...THEMES].map((t) =>
    `<button class="chip ${t === f ? "on" : ""}" data-t="${t}">${t === "Todos" ? "Todos" : THEME_LABEL[t]}</button>`).join("");
  let html = `<h2>Lições</h2><div class="chips">${chips}</div>`;
  Object.keys(LEVELS).map(Number).forEach((lv) => {
    const items = LESSONS.map((l, i) => [l, i]).filter(([l]) => l.level === lv && (f === "Todos" || l.theme === f));
    if (!items.length) return;
    const open = levelOpen(lv);
    html += `<h3 class="lvh">Nível ${lv} <span class="cefr">≈ ${LEVELS[lv].cefr}</span> ${open ? "" : `<span class="muted">🔒 conclua ${NEED} lições do nível ${lv - 1}</span>`}</h3>`;
    html += items.map(([l]) => {
      const sc = S.done[l.id];
      return `<a class="card row ${open ? "" : "locked"}" ${open ? `href="#l-${l.id}"` : ""}>
        <span><b>${esc(l.title)}</b><br><span class="muted">${THEME_LABEL[l.theme]}</span></span>
        <span class="tag">${passed(l.id) ? "✔ " + Math.round(sc * 100) + "%" : open ? (sc != null ? Math.round(sc * 100) + "%" : "Abrir") : "🔒"}</span>
      </a>`;
    }).join("");
  });
  html += `<p class="muted">Escolha os temas que preferir. Uma lição conta como concluída com 80% ou mais de acertos.</p>`;
  view().innerHTML = html;
  view().querySelectorAll(".chip").forEach((b) => b.onclick = () => { S.filter = b.dataset.t; save(); lessonList(); });
}

function lesson(id) {
  const l = LESSONS.find((x) => x.id === id);
  if (!l) { location.hash = "#licoes"; return; }
  view().innerHTML = `
    <p class="muted">${THEME_LABEL[l.theme]} · nível ${l.level}</p>
    <h2>${esc(l.title)}</h2>

    <section class="card">
      <h3>1. Antes de ler</h3>
      <p>${esc(l.context)}</p>
      <p><i>${esc(l.predict)}</i></p>
      ${l.strategy ? `<div class="strat"><b>Estratégia desta lição: ${STRATEGIES[l.strategy].name}</b><br>${esc(STRATEGIES[l.strategy].how)}</div>` : ""}
      <details><summary>Ver cognatos (palavras parecidas com o português)</summary><p>${l.cognates.map(esc).join(" · ")}</p></details>
    </section>

    <section class="card">
      <h3>2. Leia</h3>
      <p class="muted">Primeiro leia tudo uma vez, sem parar. Depois, toque nas palavras sublinhadas para ver o significado, mas só depois de tentar adivinhar pelo contexto.</p>
      ${renderReading(l, l.vocab)}
      <button class="btn" id="listen">🔊 Ouvir (opcional)</button>
    </section>

    <section class="card">
      <h3>3. Entendeu?</h3>
      <p class="muted">Cuidado: a alternativa que repete palavras do texto nem sempre é a certa. Confira o sentido.</p>
      ${l.exam ? `<p class="muted">Formato ANPAD: perguntas em inglês. Tente primeiro sem tradução.</p><label class="muted"><input type="checkbox" id="pt"> Mostrar perguntas em português</label>` : ""}
      ${questionsHTML(l.questions, "q", l)}
      <button class="btn primary block" id="check">Corrigir</button>
      <div id="res"></div>
    </section>

    <section class="card">
      <details><summary><b>4. Ponto-chave:</b> ${esc(l.grammar.title)}</summary>
        <p>${esc(l.grammar.body)}</p>
        <ul>${l.grammar.examples.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
      </details>
    </section>

    <section class="card">
      <h3>5. Palavras da lição</h3>
      <table>${l.vocab.map((v) => `<tr><td><b>${esc(v[0])}</b></td><td>${esc(v[1])}</td></tr>`).join("")}</table>
      <p class="muted">Ao concluir a lição, estas palavras entram na sua revisão.</p>
    </section>

    <section class="card">
      <details><summary><b>6. Extra (opcional):</b> escrever uma frase</summary>
        <p>${esc(l.write)}</p>
        <textarea id="note" rows="3" placeholder="Escreva aqui…">${esc(S.notes[l.id] || "")}</textarea>
      </details>
    </section>`;

  const looked = new Set();
  const words = readingLines(l).join(" ").split(/\s+/).length;
  view().querySelectorAll(".w").forEach((el) => el.onclick = () => {
    looked.add(el.dataset.en.toLowerCase());
    el.classList.add("seen");
    showSheet(`<b>${esc(el.dataset.en)}</b> = ${esc(el.dataset.pt)}`);
  });
  $("#listen").onclick = () => speak(readingLines(l));
  document.body.classList.remove("show-pt");
  const pt = $("#pt"); if (pt) pt.onchange = () => document.body.classList.toggle("show-pt", pt.checked);
  $("#note").oninput = (e) => { S.notes[l.id] = e.target.value; save(); };
  $("#check").onclick = () => {
    const { ok, blank, byType } = grade(l.questions, "q");
    if (blank) { $("#res").innerHTML = `<p class="muted">Responda todas as perguntas (faltam ${blank}).</p>`; return; }
    S.attempted = S.attempted || {};
    if (!S.attempted[l.id]) { S.attempted[l.id] = 1; recordSkills(byType); }
    // Cobertura de vocabulário: a pesquisa sobre leitura (Nation) indica que
    // a leitura fica fluente quando se conhece cerca de 95–98% das palavras.
    const cov = Math.round((1 - looked.size / words) * 100);
    const covMsg = `<p class="muted">Você consultou ${looked.size} palavra(s) em um texto de ~${words}: entendeu cerca de ${cov}% sozinho.${cov < 95 ? " Abaixo de 95% a leitura fica pesada; é normal no começo, e a revisão ajuda." : ""}</p>`;
    const sc = ok / l.questions.length;
    S.done[l.id] = Math.max(S.done[l.id] || 0, sc);
    let msg;
    if (sc >= PASS) {
      l.vocab.forEach(([en, pt, ex]) => { if (!S.srs[en]) S.srs[en] = { pt, ex, box: 0, due: Date.now() }; });
      const n = nextLesson();
      msg = `<p class="ok">Muito bem: ${ok} de ${l.questions.length}. Lição concluída.</p>` + (n ? `<a class="btn primary block" href="#l-${n.id}">Próxima: ${esc(n.title)}</a>` : "");
    } else {
      msg = `<p class="bad">${ok} de ${l.questions.length}. Releia o texto prestando atenção nas explicações acima e tente de novo. Sem pressa.</p><button class="btn block" id="retry">Tentar de novo</button>`;
    }
    save(); updateBadge();
    $("#res").innerHTML = msg + covMsg;
    $("#res").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    const r = $("#retry"); if (r) r.onclick = () => lesson(id);
  };
}

function review() {
  const due = dueCards();
  if (!due.length) {
    const total = Object.keys(S.srs).length;
    view().innerHTML = `<section class="card"><h2>Revisão</h2><p>${total ? "Tudo revisado por hoje. Volte amanhã!" : "Conclua uma lição para começar a revisar palavras."}</p><a class="btn" href="#inicio">Início</a></section>`;
    return;
  }
  const [en, c] = due[0];
  view().innerHTML = `
    <section class="card center">
      <p class="muted">${due.length} para revisar</p>
      <p class="big">${esc(en)}</p>
      ${c.ex ? `<p class="muted">“${esc(c.ex)}”</p>` : ""}
      <div id="back" class="hidden"><p class="big2">${esc(c.pt)}</p>
        <div class="duo"><button class="btn bad-b" id="no">Não lembrei</button><button class="btn primary" id="yes">Lembrei</button></div></div>
      <button class="btn primary block" id="show">Mostrar significado</button>
    </section>`;
  $("#show").onclick = () => { $("#back").classList.remove("hidden"); $("#show").classList.add("hidden"); };
  const answer = (ok) => {
    c.box = ok ? Math.min(c.box + 1, INTERVALS.length - 1) : 0;
    c.due = ok ? Date.now() + INTERVALS[c.box] * DAY : Date.now() + 60000;
    save(); updateBadge(); review();
  };
  $("#yes").onclick = () => answer(true);
  $("#no").onclick = () => answer(false);
}

function glossary() {
  view().innerHTML = `<h2>Glossário do rádio da F1</h2>
    <p class="muted">Expressões que aparecem nas mensagens transcritas na TV.</p>
    <section class="card"><table>${GLOSSARY.map(([en, pt]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(pt)}</td></tr>`).join("")}</table></section>`;
}

function guide() {
  view().innerHTML = `<h2>Guia do curso</h2>
    <p class="muted">Como o curso organiza a progressão, com base no Quadro Europeu Comum de Referência (CEFR) e em programas de Inglês Instrumental de institutos e universidades federais.</p>

    <section class="card"><h3>Níveis</h3>
      ${Object.entries(LEVELS).map(([n, L]) => `<p><b>Nível ${n} (≈ ${L.cefr})</b><br>${esc(L.can)}<br><span class="muted">Textos de ${L.size}. Foco: ${esc(L.skills)}</span></p>`).join("")}
      <p class="muted">Avanço: uma lição conta como concluída com 80% de acertos; cada nível é liberado com ${NEED} lições do nível anterior. As palavras novas voltam para revisão após 1, 3, 7, 14 e 30 dias.</p>
    </section>

    <section class="card"><h3>Estratégias de leitura</h3>
      <table>${Object.values(STRATEGIES).map((x) => `<tr><td><b>${x.name}</b></td><td>${esc(x.how)}</td></tr>`).join("")}</table>
    </section>

    <section class="card"><h3>Tipos de pergunta</h3>
      <table>${Object.values(QTYPES).map((x) => `<tr><td><b>${x.name}</b></td><td>${esc(x.tip)}</td></tr>`).join("")}</table>
    </section>

    <section class="card"><h3>Prova de Inglês da ANPAD (nível 5)</h3>
      <p>${esc(ANPAD_PROFILE.texts)}</p><p>${esc(ANPAD_PROFILE.format)}</p>
      <table>${ANPAD_PROFILE.types.map(([a, b]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join("")}</table>
      <p><b>Dicas</b></p><ul>${ANPAD_PROFILE.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </section>

    <section class="card"><h3>Falsos cognatos</h3>
      <table>${FALSE_FRIENDS.map(([en, pt, no]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(pt)}<br><span class="muted">${esc(no)}</span></td></tr>`).join("")}</table>
    </section>`;
}

// ---------- Navegação ----------
function updateBadge() {
  const due = dueCards().length, b = $("#dueBadge");
  if (b) { b.hidden = !due; b.textContent = due; }
}
// Endereços simples (#inicio, #licoes, #l-<id-da-lição>) para funcionar
// dentro do claude.ai, que só repassa #nome.
function route() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const h = location.hash.slice(1);
  const isLesson = h.startsWith("l-");
  const page = isLesson ? "licoes" : ({ teste: "inicio" }[h] || h || "inicio");
  document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === page));
  updateBadge();
  $("#sheet").hidden = true;
  if (isLesson) lesson(h.slice(2));
  else ({ teste: test, licoes: lessonList, revisao: review, glossario: glossary, guia: guide }[h] || home)();
  scrollTo(0, 0);
}
addEventListener("hashchange", route);
// Toque no tipo de pergunta mostra a dica (no celular não existe "passar o mouse").
document.addEventListener("click", (e) => {
  const t = e.target.closest(".qt");
  if (t) showSheet(`<b>${esc(t.textContent.replace(" ⓘ", ""))}:</b> ${esc(t.dataset.tip)}`);
  if (e.target.closest("#sheet")) $("#sheet").hidden = true;
});
route();
initCloud();
