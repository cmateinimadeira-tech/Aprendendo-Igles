// ---------- Estado salvo ----------
const $ = (sel) => document.querySelector(sel);
const KEY = "ingles-leitura-v1";
const PASS = 0.8; // 80% para avançar
const INTERVALS = [0, 1, 3, 7, 14, 30]; // dias entre revisões, por caixa
const DAY = 86400000;
LESSONS.sort((a, b) => a.level - b.level); // inclui as lições de lessons/level-*.js

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
      Object.assign(S, JSON.parse(remote.state)); gameInit();
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
// Ajuste automático: se as duas primeiras lições feitas no nível de partida
// ficaram abaixo de 80% na primeira tentativa, sugere descer um nível.
function adjustHTML() {
  const L = startLevel();
  if (L <= 1 || (S.adjustKept || {})[L]) return "";
  const firsts = LESSONS.filter((l) => l.level === L && S.first && S.first[l.id] != null).map((l) => S.first[l.id]);
  if (firsts.length < 2 || firsts.filter((x) => x < PASS).length < 2) return "";
  return `<section class="card">
    <p class="eyebrow">Ajuste de nível</p>
    <p>Nas primeiras lições do nível ${L} você ficou abaixo de 80% na primeira tentativa. Isso indica que o nível ${L - 1} é um ponto de partida melhor agora. Você não perde nada do que já fez.</p>
    <div class="duo"><button class="btn" id="lvKeep">Manter nível ${L}</button><button class="btn primary" id="lvDown">Ir para o nível ${L - 1}</button></div>
  </section>`;
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
        <p>Primeiro, um teste rápido de leitura (4 textos curtos, 20 perguntas, cerca de 10 a 15 minutos) para descobrir de onde partir.</p>
        <a class="btn primary" href="#teste">Fazer o teste de leitura</a>
      </section>
      ${installHTML()}
      ${backupHTML()}
      ${versionHTML()}`;
    bindHomeExtras();
    return;
  }
  const doneCount = LESSONS.filter((l) => passed(l.id)).length;
  view().innerHTML = `
    ${todayHTML()}
    <section class="card">
      <p class="muted">Seu nível de leitura</p>
      <div class="level">Nível ${S.placement.level}${LEVELS[S.placement.level] ? ` <span class="cefr">≈ ${LEVELS[S.placement.level].cefr}</span>` : ""}</div>
      <p>${S.placement.adjusted ? "Nível ajustado pelo seu desempenho nas lições. " : ""}${S.placement.level ? (S.placement.adjusted ? "Neste nível você: " : "No teste você mostrou que: ") + esc(LEVELS[S.placement.level].can.charAt(0).toLowerCase() + LEVELS[S.placement.level].can.slice(1)) : "Vamos começar do básico, pelo nível 1 (≈ A1)."}</p>
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
    ${!S.placement.results ? `<section class="card"><p class="eyebrow">Teste atualizado</p><p>O teste de nivelamento ficou mais preciso: mais perguntas, 4 alternativas, opção “Não sei” e perguntas em inglês nos textos mais difíceis. Refaça para confirmar seu nível. Suas lições continuam salvas.</p><a class="btn primary block" href="#teste">Refazer o teste</a></section>` : ""}
    ${adjustHTML()}
    ${fluencyPanelHTML()}
    ${skillsHTML()}
    ${installHTML()}
    ${backupHTML()}
    <p><button class="link" id="redo">Refazer o teste de nivelamento</button></p>
    ${versionHTML()}`;
  bindHomeExtras();
  const down = $("#lvDown"), keep = $("#lvKeep");
  if (down) down.onclick = () => { S.placement.level = startLevel() - 1; S.placement.adjusted = true; save(); home(); };
  if (keep) keep.onclick = () => { S.adjustKept = S.adjustKept || {}; S.adjustKept[startLevel()] = true; save(); home(); };
  $("#redo").onclick = (e) => {
    if (e.target.dataset.armed) { S.placement = null; save(); location.hash = "#teste"; return; }
    e.target.dataset.armed = 1;
    e.target.textContent = "Toque de novo para confirmar (as lições concluídas continuam salvas)";
  };
}

// ---------- Teste de nivelamento ----------
// Embaralha as alternativas a cada aplicação (sem padrão de posição e sem
// decorar ao refazer). Cada resposta pede "entendi no texto" ou "deduzi/chutei".
function shuffled(q) {
  const idx = q.opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, opts: idx.map((i) => q.opts[i]), a: idx.indexOf(q.a) };
}
function test() {
  let step = 0; const results = [];
  const draw = () => {
    const t = PLACEMENT[step];
    const qs = t.questions.map(shuffled);
    view().innerHTML = `
      <section class="card">
        <p class="eyebrow">Teste de nivelamento · texto ${step + 1} de ${PLACEMENT.length}</p>
        <div class="bar"><div style="width:${step / PLACEMENT.length * 100}%"></div></div>
        ${step === 0 ? `<p class="muted">Responda com honestidade: escolha <b>Não sei</b> quando não souber e diga se entendeu a resposta no texto ou se deduziu. Assim o nível sai fiel ao que você realmente lê.</p>` : ""}
        ${t.lang === "en" ? `<p class="muted">Neste texto as perguntas são em inglês, como na prova ANPAD.</p>` : ""}
        ${renderReading(t)}
      </section>
      ${qs.map((q, i) => `
        <fieldset class="q" id="p${i}">
          <legend>${i + 1}. ${esc(q.q)}</legend>
          ${q.opts.map((o, j) => `<label><input type="radio" name="p${i}" value="${j}"> ${esc(o)}</label>`).join("")}
          <label class="dunno"><input type="radio" name="p${i}" value="-1"> Não sei</label>
          <div class="sure" hidden>
            <span class="muted">Como você chegou à resposta?</span>
            <div class="duo">
              <label><input type="radio" name="s${i}" value="1"> Entendi no texto</label>
              <label><input type="radio" name="s${i}" value="0"> Deduzi ou chutei</label>
            </div>
          </div>
        </fieldset>`).join("")}
      <p id="msg" class="bad"></p>
      <button class="btn primary block" id="go">${step === PLACEMENT.length - 1 ? "Ver resultado" : "Próximo texto"}</button>`;

    qs.forEach((q, i) => document.querySelectorAll(`input[name="p${i}"]`).forEach((r) => r.onchange = () => {
      $(`#p${i} .sure`).hidden = r.value === "-1";
    }));

    $("#go").onclick = () => {
      let score = 0, sure = 0, deduced = 0, dunno = 0, missing = 0;
      qs.forEach((q, i) => {
        const sel = document.querySelector(`input[name="p${i}"]:checked`);
        if (!sel) { missing++; return; }
        if (sel.value === "-1") { dunno++; return; }
        const s = document.querySelector(`input[name="s${i}"]:checked`);
        if (!s) { missing++; return; }
        const right = +sel.value === q.a, isSure = s.value === "1";
        if (right && isSure) { score += 1; sure++; }
        if (right && !isSure) { score += 0.5; deduced++; }
      });
      if (missing) { $("#msg").textContent = `Falta responder ${missing} pergunta(s), incluindo como você chegou à resposta.`; return; }
      results[step] = { level: t.level, score, sure, deduced, dunno, total: qs.length };
      if (step < PLACEMENT.length - 1) { step++; draw(); scrollTo(0, 0); return; }
      let level = 0;
      for (const r of results) { if (r.score >= PLACEMENT_PASS) level = r.level; else break; }
      S.placement = { level, results, at: Date.now() };
      save();
      testResult();
    };
  };
  draw();
}
function testResult() {
  const P = S.placement, next = P.results.find((r) => r.level === P.level + 1);
  const transition = next && next.score >= 2.5;
  view().innerHTML = `
    <section class="card">
      <p class="eyebrow">Resultado do teste</p>
      <div class="level">Nível ${P.level || 1}${LEVELS[P.level || 1] ? ` <span class="cefr">≈ ${LEVELS[P.level || 1].cefr}</span>` : ""}</div>
      <p>${P.level ? esc(LEVELS[P.level].can) : "Vamos começar do básico, pelo nível 1."}</p>
      ${transition ? `<p class="muted">Você ficou perto do nível ${P.level + 1}: comece pelo nível ${P.level || 1} e avance assim que as lições ficarem fáceis.</p>` : ""}
    </section>
    <section class="card">
      <h3>Seu desempenho por texto</h3>
      <table>
        <tr class="muted"><td>Texto</td><td>Pontos</td><td>Certeza</td><td>Dedução</td><td>Não sei</td></tr>
        ${P.results.map((r) => `<tr><td>Nível ${r.level}</td><td><b>${String(r.score).replace(".", ",")}</b>/${r.total}</td><td>${r.sure}</td><td>${r.deduced}</td><td>${r.dunno}</td></tr>`).join("")}
      </table>
      <p class="muted">Acerto com certeza vale 1 ponto, acerto por dedução vale 0,5. Cada nível pede 3,5 pontos de 5.</p>
    </section>
    <a class="btn primary block" href="#inicio">Começar as lições</a>`;
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
        <span class="tag">${passed(l.id) ? (mastered(l.id) ? "★ " : "✔ ") + Math.round(sc * 100) + "%" : open ? (sc != null ? Math.round(sc * 100) + "%" : "Abrir") : "🔒"}</span>
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
  // Alternativas embaralhadas a cada abertura (exceto ANPAD, cujas explicações citam letras).
  const qs = l.exam ? l.questions : l.questions.map(shuffled);
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

    <section class="card" id="readCard">
      <h3>2. Leia</h3>
      <p class="muted">Primeiro leia tudo uma vez, sem parar. Depois, toque nas palavras sublinhadas para ver o significado, mas só depois de tentar adivinhar pelo contexto. O tempo de leitura é medido (só enquanto o app está aberto).</p>
      ${renderReading(l, l.vocab)}
      <button class="btn" id="listen">🔊 Ouvir (opcional)</button>
    </section>

    <section class="card" id="qCard">
      <h3>3. Entendeu?</h3>
      <p class="muted">Cuidado: a alternativa que repete palavras do texto nem sempre é a certa. Confira o sentido.</p>
      ${l.exam ? `<p class="muted">Formato ANPAD: perguntas em inglês. Tente primeiro sem tradução.</p><label class="muted"><input type="checkbox" id="pt"> Mostrar perguntas em português</label>` : ""}
      ${questionsHTML(qs, "q", l)}
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
  const track = startTracking(l);
  document.body.classList.remove("show-pt");
  const pt = $("#pt"); if (pt) pt.onchange = () => document.body.classList.toggle("show-pt", pt.checked);
  $("#note").oninput = (e) => { S.notes[l.id] = e.target.value; save(); };
  $("#check").onclick = () => {
    const { ok, blank, byType } = grade(qs, "q");
    if (blank) { $("#res").innerHTML = `<p class="muted">Responda todas as perguntas (faltam ${blank}).</p>`; return; }
    S.attempted = S.attempted || {};
    const firstTry = !S.attempted[l.id];
    let timeMsg = "";
    if (!S.attempted[l.id]) {
      S.attempted[l.id] = 1; recordSkills(byType); S.first = S.first || {}; S.first[l.id] = ok / l.questions.length;
      const t = track.finish(words, l.questions.length);
      S.timing = S.timing || {}; S.timing[l.id] = { ...t, level: l.level, ok: ok / l.questions.length >= PASS, at: Date.now() };
      timeMsg = timingHTML(S.timing[l.id]);
    } else track.stop();
    // Cobertura de vocabulário: a pesquisa sobre leitura (Nation) indica que
    // a leitura fica fluente quando se conhece cerca de 95–98% das palavras.
    const cov = Math.round((1 - looked.size / words) * 100);
    const covMsg = `<p class="muted">Você consultou ${looked.size} palavra(s) em um texto de ~${words}: entendeu cerca de ${cov}% sozinho.${cov < 95 ? " Abaixo de 95% a leitura fica pesada; é normal no começo, e a revisão ajuda." : ""}</p>`;
    const sc = ok / l.questions.length;
    const wasPassed = passed(l.id);
    S.done[l.id] = Math.max(S.done[l.id] || 0, sc);
    const gain = awardLesson(l.id, ok, firstTry, sc >= PASS);
    let msg;
    if (sc >= PASS) {
      l.vocab.forEach(([en, pt, ex]) => { if (!S.srs[en]) S.srs[en] = { pt, ex, box: 0, due: Date.now() }; });
      const n = nextLesson();
      msg = `<p class="ok">Muito bem: ${ok} de ${l.questions.length}. Lição concluída.</p>` + (n ? `<a class="btn primary block" href="#l-${n.id}">Próxima: ${esc(n.title)}</a>` : "");
    } else {
      msg = `<p class="bad">${ok} de ${l.questions.length}. Releia o texto prestando atenção nas explicações acima e tente de novo. Sem pressa.</p><button class="btn block" id="retry">Tentar de novo</button>`;
    }
    save(); updateBadge();
    $("#res").innerHTML = `<p class="xpgain">+${gain} XP${firstTry ? "" : " (refazendo vale menos)"}</p>` + msg + timeMsg + covMsg;
    afterEvent();
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
    awardReview(ok);
    save(); updateBadge(); afterEvent(); review();
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

    <a class="card row" href="#glossario"><span><b>Glossário do rádio da F1</b><br><span class="muted">Expressões das mensagens transcritas na TV</span></span><span class="tag">Abrir</span></a>

    <section class="card"><h3>Como o curso funciona</h3>
      <p><b>1. Teste de nivelamento (uma vez, ou quando quiser conferir).</b> Quatro textos, cinco perguntas cada. Mede de onde começar. Acerto por dedução vale meio ponto.</p>
      <p><b>2. Lições (o dia a dia).</b> Cada lição ensina e avalia ao mesmo tempo: estratégia de leitura, texto, perguntas com explicação, um ponto-chave e vocabulário. A primeira tentativa de cada lição é a medida real do seu nível.</p>
      <p><b>3. Revisão espaçada.</b> As palavras das lições concluídas voltam após 1, 3, 7, 14 e 30 dias.</p>
      <p><b>4. Ajuste contínuo.</b> 80% libera a lição; 2 lições concluídas liberam o nível seguinte. Se as duas primeiras lições do seu nível ficarem abaixo de 80% na primeira tentativa, o app sugere descer um nível. O painel de habilidades aponta o tipo de pergunta mais difícil para você.</p>
    </section>

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


// ---------- Tempo de leitura e idas e vindas ao texto ----------
// Conta só o tempo ativo: app visível, e pausas de mais de 90 s sem tocar na
// tela contam como 90 s (celular esquecido na mesa não estraga a medida).
// "Leitura" = do início da lição até a primeira resposta marcada.
// "Voltas ao texto" = vezes que o texto volta à tela (ou é aberto pelo botão
// "Ver texto") depois que você começou a responder.
const FLUENCY_WPM = { 1: 40, 2: 60, 3: 80, 4: 100, 5: 120 }; // metas internas do curso
let currentTrack = null;
function startTracking(l) {
  if (currentTrack) currentTrack.stop();
  let active = 0, readActive = 0, last = Date.now(), readMs = null, looks = 0, answering = false, textOnScreen = true, textVisible = false, stopped = false;
  // readActive só conta enquanto o texto em inglês está visível e você ainda não começou a responder.
  const tick = () => {
    const now = Date.now();
    if (!document.hidden) { const dt = Math.min(now - last, 90000); active += dt; if (textVisible && !answering) readActive += dt; }
    last = now;
  };
  const onVis = () => { if (document.hidden) tick(); else last = Date.now(); };
  const evs = ["scroll", "touchstart", "click", "keydown", "change"];
  evs.forEach((e) => addEventListener(e, tick, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", onVis);
  const card = $("#readCard"), fab = $("#textFab");
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.target === card) {
      if (en.isIntersecting && !textOnScreen && answering) looks++;
      textOnScreen = en.isIntersecting;
    }
    fab.hidden = textOnScreen || !$("#qCard");
  }), { threshold: 0.15 });
  io.observe(card);
  const textEl = card.querySelector(".radio, .prose, .lined");
  const io2 = new IntersectionObserver((entries) => entries.forEach((en) => {
    tick();
    textVisible = en.isIntersecting && en.intersectionRect.height >= Math.min(innerHeight * 0.35, en.boundingClientRect.height * 0.5);
  }), { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
  if (textEl) io2.observe(textEl);
  document.querySelectorAll('#qCard input[type="radio"]').forEach((r) => r.addEventListener("change", () => {
    if (!answering) { tick(); readMs = readActive; answering = true; }
  }));
  fab.onclick = () => { if (answering) looks++; openTextSheet(l); };
  const t = (currentTrack = {
    stop() {
      if (stopped) return; stopped = true;
      evs.forEach((e) => removeEventListener(e, tick, { capture: true }));
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect(); io2.disconnect(); fab.hidden = true;
    },
    finish(words, nq) {
      tick(); t.stop();
      const r = readMs != null ? readMs : readActive;
      return { ms: active, readMs: r, wpm: Math.round(words / Math.max(r / 60000, 0.1)), looks, nq, rv: 2 };
    },
  });
  return t;
}
function fmtTime(ms) { const s = Math.round(ms / 1000); return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`; }
function fluency(t) {
  const goal = FLUENCY_WPM[t.level] || 80;
  if (t.wpm >= goal && t.looks <= t.nq) return { key: "fluente", label: "Leitura fluente", goal };
  if (t.wpm >= goal * 0.6 && t.looks <= t.nq * 2) return { key: "dev", label: "Fluência em desenvolvimento", goal };
  return { key: "lenta", label: "Leitura ainda lenta", goal };
}
function timingHTML(t) {
  const f = fluency(t);
  return `<div class="timing">
    <p><b>⏱ ${fmtTime(t.ms)}</b> no total · leitura ≈ <b>${t.wpm}</b> palavras/min (meta do nível: ${f.goal}) · voltou ao texto <b>${t.looks}</b> ${t.looks === 1 ? "vez" : "vezes"} em ${t.nq} perguntas</p>
    <p class="flu ${f.key}">${f.label}${t.ok && f.key === "fluente" ? " · ★ lição dominada" : ""}</p>
    <p class="muted">${f.key === "fluente" ? "Você entendeu e leu no ritmo esperado para o nível." : "Voltar ao texto para conferir é uma boa estratégia (scanning). Com a prática e a revisão do vocabulário, o número de voltas e o tempo diminuem."}</p>
  </div>`;
}
function mastered(id) { const t = (S.timing || {})[id]; return !!(t && t.ok && fluency(t).key === "fluente"); }
function fluencyPanelHTML() {
  // Medições novas (rv 2) contam só o tempo com o texto em inglês na tela; as antigas incluíam a parte em português.
  const all = Object.values(S.timing || {}).sort((a, b) => a.at - b.at);
  const list = all.some((t) => t.rv === 2) ? all.filter((t) => t.rv === 2) : all;
  if (!list.length) return "";
  const last = list.slice(-5);
  const avg = (arr, f) => Math.round(arr.reduce((s, x) => s + f(x), 0) / arr.length);
  const wpm = avg(last, (t) => t.wpm), lpq = (last.reduce((s, t) => s + t.looks, 0) / last.reduce((s, t) => s + t.nq, 0)).toFixed(1).replace(".", ",");
  const goal = FLUENCY_WPM[startLevel()];
  let trend = "";
  if (list.length >= 4) {
    const h = Math.floor(list.length / 2), a = avg(list.slice(0, h), (t) => t.wpm), b = avg(list.slice(h), (t) => t.wpm);
    trend = b > a ? `subindo (de ${a} para ${b} palavras/min)` : b < a ? `caindo (de ${a} para ${b}); normal ao mudar de nível` : "estável";
  }
  const dom = LESSONS.filter((l) => mastered(l.id)).length;
  return `<section class="card">
    <p class="eyebrow">Fluência de leitura</p>
    <p>${last.length === 1 ? "Última lição" : `Últimas ${last.length} lições`}: <b>${wpm}</b> palavras/min (meta do nível ${startLevel()}: ${goal}) · <b>${lpq}</b> voltas ao texto por pergunta.</p>
    <div class="bar"><div style="width:${Math.min(100, (wpm / goal) * 100)}%"></div></div>
    ${trend ? `<p class="muted">Tendência: ${trend}.</p>` : ""}
    <p class="muted">${dom} ${dom === 1 ? "lição dominada" : "lições dominadas"} (★ = 80% de acertos com leitura fluente na primeira tentativa).</p>
  </section>`;
}
// Texto numa folha sobreposta, para conferir sem rolar a página inteira.
function openTextSheet(l) {
  const ts = $("#textSheet");
  $("#textSheetBody").innerHTML = renderReading(l, l.vocab);
  $("#textSheetBody").querySelectorAll(".w").forEach((el) => el.onclick = () => showSheet(`<b>${esc(el.dataset.en)}</b> = ${esc(el.dataset.pt)}`));
  ts.hidden = false;
  $("#textSheetClose").focus();
}


// ---------- App instalável (PWA) ----------
// Só vale fora do claude.ai (lá a página roda num quadro sem service worker).
const PWA_URL = "https://cmateinimadeira-tech.github.io/Aprendendo-Igles/";
const APP_VERSION = "9"; // mostrado no app para conferir se a atualização chegou
const inFrame = (() => { try { return window.top !== window; } catch (e) { return true; } })();
const isStandalone = matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
let installEvent = null;
if (!inFrame && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((r) => r.update()).catch(() => {}));
  // Quando uma versão nova assume, recarrega se você estiver na tela inicial; senão, avisa.
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    if (!location.hash || location.hash === "#inicio") { reloaded = true; location.reload(); }
    else showSheet("Versão nova do app disponível. Volte ao Início para atualizar.");
  });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; if (!location.hash || location.hash === "#inicio") home(); });
addEventListener("appinstalled", () => { installEvent = null; showSheet("App instalado. Abra pelo ícone “Inglês” na tela inicial."); });

function installHTML() {
  if (isStandalone) return "";
  if (inFrame) {
    return `<section class="card"><p class="eyebrow">Instalar no celular</p>
      <p>Para usar em tela cheia, como um app, abra o endereço abaixo no navegador do celular (Chrome no Android, Safari no iPhone) e instale. Antes, copie seu progresso em “Transferir progresso”, no fim desta tela.</p>
      <p><a href="${PWA_URL}" target="_blank" rel="noopener">${PWA_URL}</a></p></section>`;
  }
  if (installEvent) {
    return `<section class="card"><p class="eyebrow">Instalar no celular</p><p>Instale para abrir em tela cheia, pelo ícone na tela inicial, e usar mesmo sem internet.</p>
      <button class="btn primary block" id="installBtn">Instalar app</button></section>`;
  }
  return `<section class="card"><p class="eyebrow">Instalar no celular</p>
    ${isIOS ? `<ol class="install-steps"><li>No Safari, toque em <b>Compartilhar</b> (quadrado com seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li><li>Toque em <b>Adicionar</b>. O app abre em tela cheia pelo ícone “Inglês”.</li></ol>`
            : `<ol class="install-steps"><li>No Chrome, toque no menu <b>⋮</b>.</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li><li>Abra pelo ícone “Inglês”.</li></ol>`}
  </section>`;
}

async function forceUpdate() {
  try {
    const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
    await Promise.all(regs.map((r) => r.unregister()));
    if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); }
  } catch (e) {}
  location.reload();
}
function versionHTML() {
  const mode = ["fullscreen", "standalone", "minimal-ui", "browser"].find((m) => matchMedia(`(display-mode: ${m})`).matches) || "?";
  const probe = $("#probe"), inset = probe ? Math.round(parseFloat(getComputedStyle(probe).paddingTop) || 0) : 0;
  return `<p class="muted center">Versão ${APP_VERSION}${!inFrame ? ` · <button class="link" id="updBtn">Atualizar app</button>` : ""}</p>
    <p class="muted center diag">Tela ${screen.width}×${screen.height} · app ${innerWidth}×${innerHeight} · área da câmera ${inset} px · modo ${mode}${document.fullscreenElement ? " (API)" : ""}</p>`;
}

// ---------- Transferir progresso ----------
// O progresso fica em cada navegador ou app separadamente; este código leva o
// progresso de um lugar para outro (por exemplo, do claude.ai para o app instalado).
function exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function backupHTML() {
  return `<details class="card backup"><summary><b>Transferir progresso</b></summary>
    <p class="muted">Copie o código aqui e cole no outro lugar onde você usa o app (por exemplo, no app instalado).</p>
    <textarea id="bkOut" rows="3" readonly>${exportCode()}</textarea>
    <button class="btn block" id="bkCopy">Copiar código</button>
    <p class="muted" style="margin-top:16px">Recebeu um código? Cole abaixo. Isso substitui o progresso deste aparelho.</p>
    <textarea id="bkIn" rows="3" placeholder="Cole o código aqui"></textarea>
    <button class="btn block" id="bkImport">Importar progresso</button>
    <p id="bkMsg" class="muted"></p>
  </details>`;
}
function bindHomeExtras() {
  const ub = $("#updBtn");
  if (ub) ub.onclick = () => { ub.textContent = "Atualizando…"; forceUpdate(); };
  const ib = $("#installBtn");
  if (ib) ib.onclick = async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; home(); };
  const copy = $("#bkCopy");
  if (copy) copy.onclick = () => {
    const ta = $("#bkOut");
    const done = () => ($("#bkMsg").textContent = "Código copiado.");
    const fallback = () => { ta.focus(); ta.select(); $("#bkMsg").textContent = "Código selecionado: use Copiar do celular."; };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (e) { fallback(); }
  };
  const imp = $("#bkImport");
  if (imp) imp.onclick = (e) => {
    let data;
    try { data = JSON.parse(decodeURIComponent(escape(atob($("#bkIn").value.trim())))); } catch (err) { $("#bkMsg").textContent = "Código inválido. Copie o código inteiro e tente de novo."; return; }
    if (!data || typeof data !== "object" || !("done" in data)) { $("#bkMsg").textContent = "Código inválido."; return; }
    if (!e.target.dataset.armed) { e.target.dataset.armed = 1; e.target.textContent = "Toque de novo para substituir o progresso"; return; }
    S = Object.assign({ placement: null, done: {}, srs: {}, notes: {} }, data);
    gameInit(); save(); updateBadge(); home();
    showSheet("Progresso importado.");
  };
}


// ---------- Tela cheia ----------
// O Chrome no Android nem sempre respeita "fullscreen" do manifesto; a API de
// tela cheia funciona, mas só depois de um toque. Então, com a preferência
// ligada (padrão no app instalado), o primeiro toque coloca o app em tela cheia.
// Ao sair e voltar para o app, o próximo toque faz de novo.
const FS_KEY = "ingles-fs";
function fsPref() { try { const v = localStorage.getItem(FS_KEY); return v == null ? isStandalone : v === "1"; } catch (e) { return isStandalone; } }
function setFsPref(on) { try { localStorage.setItem(FS_KEY, on ? "1" : "0"); } catch (e) {} }
const canFS = !inFrame && !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
function enterFS() { if (canFS && !document.fullscreenElement) document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {}); }
function updateFsBtn() {
  document.documentElement.classList.toggle("fs", !!document.fullscreenElement || matchMedia("(display-mode: fullscreen)").matches);
  const b = $("#fsBtn"); if (!b) return; b.hidden = !canFS || (matchMedia("(display-mode: fullscreen)").matches && !document.fullscreenElement); b.textContent = document.fullscreenElement ? "✕" : "⛶"; b.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia"); }
document.addEventListener("click", (e) => { if (fsPref() && !matchMedia("(display-mode: fullscreen)").matches && !e.target.closest("#fsBtn")) enterFS(); }, true);
// Em tela cheia, o cabeçalho some ao rolar para baixo e volta ao rolar para cima.
let lastY = 0;
addEventListener("scroll", () => {
  const y = scrollY, top = $(".top");
  if (!top) return;
  if (!document.documentElement.classList.contains("fs") || y < 60) top.classList.remove("away");
  else if (y > lastY + 6) top.classList.add("away");
  else if (y < lastY - 6) top.classList.remove("away");
  lastY = y;
}, { passive: true });
document.addEventListener("fullscreenchange", updateFsBtn);
addEventListener("load", () => {
  updateFsBtn();
  const b = $("#fsBtn");
  if (b) b.onclick = () => {
    if (document.fullscreenElement) { setFsPref(false); document.exitFullscreen().catch(() => {}); }
    else { setFsPref(true); enterFS(); }
  };
});

// ---------- Navegação ----------
function updateBadge() {
  const due = dueCards().length, b = $("#dueBadge");
  if (b) { b.hidden = !due; b.textContent = due; }
}
// Endereços simples (#inicio, #licoes, #l-<id-da-lição>) para funcionar
// dentro do claude.ai, que só repassa #nome.
function route() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (currentTrack) currentTrack.stop();
  $("#textSheet").hidden = true;
  const h = location.hash.slice(1);
  const isLesson = h.startsWith("l-");
  const page = isLesson ? "licoes" : ({ teste: "inicio", glossario: "guia" }[h] || h || "inicio");
  document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === page));
  updateBadge();
  $("#sheet").hidden = true;
  if (isLesson) lesson(h.slice(2));
  else ({ teste: test, licoes: lessonList, revisao: review, glossario: glossary, guia: guide, metas: goals }[h] || home)();
  scrollTo(0, 0);
}
addEventListener("hashchange", route);
// Toque no tipo de pergunta mostra a dica (no celular não existe "passar o mouse").
document.addEventListener("click", (e) => {
  if (e.target.closest("#textSheetClose")) $("#textSheet").hidden = true;
  const t = e.target.closest(".qt");
  if (t) showSheet(`<b>${esc(t.textContent.replace(" ⓘ", ""))}:</b> ${esc(t.dataset.tip)}`);
  if (e.target.closest("#sheet")) $("#sheet").hidden = true;
});
gameInit();
route();
initCloud();
