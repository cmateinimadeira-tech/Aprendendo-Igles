// ---------- Estado salvo no navegador ----------
const KEY = "ingles-leitura-v1";
const PASS = 0.8; // 80% para avançar
const INTERVALS = [0, 1, 3, 7, 14, 30]; // dias entre revisões, por caixa
const DAY = 86400000;

let S = { placement: null, done: {}, srs: {}, notes: {} };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

const $ = (sel) => document.querySelector(sel);
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
  if (!("speechSynthesis" in window)) { alert("Seu navegador não tem leitura em voz alta."); return; }
  speechSynthesis.cancel();
  lines.forEach((t) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "en-GB"; u.rate = 0.9;
    speechSynthesis.speak(u);
  });
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
function renderReading(item, vocab = []) {
  if (item.radio) {
    return `<div class="radio">${item.radio.map(([who, line]) =>
      `<p class="${who === "Driver" ? "drv" : "eng"}"><b>${who === "Driver" ? "Piloto" : "Engenheiro"}</b>${markVocab(line, vocab)}</p>`).join("")}</div>`;
  }
  return `<p class="prose">${markVocab(item.text, vocab)}</p>`;
}
function readingLines(item) { return item.radio ? item.radio.map((r) => r[1]) : [item.text]; }

function questionsHTML(qs, prefix) {
  return qs.map((q, i) => `
    <fieldset class="q" id="${prefix}${i}">
      <legend>${i + 1}. ${esc(q.q)}</legend>
      ${q.opts.map((o, j) => `<label><input type="radio" name="${prefix}${i}" value="${j}"> ${esc(o)}</label>`).join("")}
      <p class="why hidden"></p>
    </fieldset>`).join("");
}
function grade(qs, prefix) {
  let ok = 0, blank = 0;
  qs.forEach((q, i) => {
    const sel = document.querySelector(`input[name="${prefix}${i}"]:checked`);
    const box = $("#" + prefix + i);
    box.classList.remove("right", "wrong");
    if (!sel) { blank++; return; }
    const right = +sel.value === q.a;
    if (right) ok++;
    box.classList.add(right ? "right" : "wrong");
    if (q.why) { const w = box.querySelector(".why"); w.textContent = (right ? "✔ " : "✘ ") + q.why; w.classList.remove("hidden"); }
  });
  return { ok, blank };
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
      <div class="level">Nível ${S.placement.level}</div>
      <p>${["Vamos começar do básico.", "Você entende frases simples.", "Você entende mensagens curtas do dia a dia.", "Você entende textos curtos com boa segurança.", "Você lê bem; o foco é ganhar vocabulário e velocidade."][S.placement.level]}</p>
      <div class="bar"><div style="width:${doneCount / LESSONS.length * 100}%"></div></div>
      <p class="muted">${doneCount} de ${LESSONS.length} lições concluídas</p>
    </section>
    ${n ? `<section class="card"><p class="muted">Próxima lição recomendada</p><h3>${esc(n.title)}</h3><p class="muted">${THEME_LABEL[n.theme]} · nível ${n.level}</p><a class="btn primary" href="#licao/${n.id}">Começar</a></section>`
        : `<section class="card"><h3>Você concluiu todas as lições disponíveis!</h3><p>Novas lições serão adicionadas.</p></section>`}
    <section class="card">
      <p class="muted">Revisão de vocabulário</p>
      <p>${due ? `<b>${due}</b> palavra(s) para revisar hoje.` : "Nada para revisar agora."}</p>
      ${due ? `<a class="btn" href="#revisao">Revisar</a>` : ""}
    </section>
    <p><button class="link" id="redo">Refazer o teste de nivelamento</button></p>`;
  $("#redo").onclick = () => { if (confirm("Refazer o teste? Suas lições concluídas continuam salvas.")) { S.placement = null; save(); location.hash = "#teste"; } };
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
        <button class="btn primary" id="go">${step === PLACEMENT.length - 1 ? "Ver resultado" : "Próximo texto"}</button>
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
  [1, 2, 3, 4].forEach((lv) => {
    const items = LESSONS.map((l, i) => [l, i]).filter(([l]) => l.level === lv && (f === "Todos" || l.theme === f));
    if (!items.length) return;
    const open = levelOpen(lv);
    html += `<h3 class="lvh">Nível ${lv} ${open ? "" : `<span class="muted">🔒 conclua ${NEED} lições do nível ${lv - 1}</span>`}</h3>`;
    html += items.map(([l]) => {
      const sc = S.done[l.id];
      return `<a class="card row ${open ? "" : "locked"}" ${open ? `href="#licao/${l.id}"` : ""}>
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
      <details><summary>Ver cognatos (palavras parecidas com o português)</summary><p>${l.cognates.map(esc).join(" · ")}</p></details>
    </section>

    <section class="card">
      <h3>2. Leia</h3>
      <p class="muted">Primeiro leia tudo uma vez, sem parar. Depois, toque nas palavras sublinhadas para ver o significado, mas só depois de tentar adivinhar pelo contexto.</p>
      ${renderReading(l, l.vocab)}
      <p id="gloss" class="gloss muted">&nbsp;</p>
      <button class="btn" id="listen">🔊 Ouvir (opcional)</button>
    </section>

    <section class="card">
      <h3>3. Entendeu?</h3>
      ${questionsHTML(l.questions, "q")}
      <button class="btn primary" id="check">Corrigir</button>
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

  view().querySelectorAll(".w").forEach((el) => el.onclick = () => { $("#gloss").innerHTML = `<b>${esc(el.dataset.en)}</b> = ${esc(el.dataset.pt)}`; });
  $("#listen").onclick = () => speak(readingLines(l));
  $("#note").oninput = (e) => { S.notes[l.id] = e.target.value; save(); };
  $("#check").onclick = () => {
    const { ok, blank } = grade(l.questions, "q");
    if (blank) { $("#res").innerHTML = `<p class="muted">Responda todas as perguntas (faltam ${blank}).</p>`; return; }
    const sc = ok / l.questions.length;
    S.done[l.id] = Math.max(S.done[l.id] || 0, sc);
    let msg;
    if (sc >= PASS) {
      l.vocab.forEach(([en, pt, ex]) => { if (!S.srs[en]) S.srs[en] = { pt, ex, box: 0, due: Date.now() }; });
      const n = nextLesson();
      msg = `<p class="ok">Muito bem: ${ok} de ${l.questions.length}. Lição concluída.</p>` + (n ? `<a class="btn primary" href="#licao/${n.id}">Próxima: ${esc(n.title)}</a>` : "");
    } else {
      msg = `<p class="bad">${ok} de ${l.questions.length}. Releia o texto prestando atenção nas explicações acima e tente de novo. Sem pressa.</p><button class="btn" id="retry">Tentar de novo</button>`;
    }
    save();
    $("#res").innerHTML = msg;
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
        <button class="btn bad-b" id="no">Não lembrei</button> <button class="btn primary" id="yes">Lembrei</button></div>
      <button class="btn" id="show">Mostrar significado</button>
    </section>`;
  $("#show").onclick = () => { $("#back").classList.remove("hidden"); $("#show").classList.add("hidden"); };
  const answer = (ok) => {
    c.box = ok ? Math.min(c.box + 1, INTERVALS.length - 1) : 0;
    c.due = ok ? Date.now() + INTERVALS[c.box] * DAY : Date.now() + 60000;
    save(); review();
  };
  $("#yes").onclick = () => answer(true);
  $("#no").onclick = () => answer(false);
}

function glossary() {
  view().innerHTML = `<h2>Glossário do rádio da F1</h2>
    <p class="muted">Expressões que aparecem nas mensagens transcritas na TV.</p>
    <section class="card"><table>${GLOSSARY.map(([en, pt]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(pt)}</td></tr>`).join("")}</table></section>`;
}

// ---------- Navegação ----------
function route() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const [page, arg] = location.hash.slice(1).split("/");
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + (page || "inicio")));
  ({ teste: test, licoes: lessonList, licao: () => lesson(arg), revisao: review, glossario: glossary }[page] || home)();
  scrollTo(0, 0);
}
addEventListener("hashchange", route);
route();
