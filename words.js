// ---------- Prioridade do vocabulário e treino de palavras de ligação ----------
// Base: para quem fala português, substantivos de origem latina costumam ser
// cognatos (cerca de 70–75% da Academic Word List), enquanto conectivos,
// palavras de função e phrasal verbs são o gargalo da leitura. Por isso:
//  - palavras "fáceis" não entram na revisão; cognatos entram com intervalos maiores;
//  - palavras fundamentais (prioridade 1) vêm primeiro na revisão;
//  - há um treino próprio de palavras de ligação (banco em lessons/links-*.js);
//  - as palavras de ligação são destacadas nos textos das lições.
// Carregado antes de app.js; só usa S, save etc. quando chamado.

const LINK_WORDS = [];
const LINK_ITEMS = [];
const CAT_LABEL = {
  ligacao: "palavra de ligação", funcao: "palavra de função", phrasal: "phrasal verb", verbo: "verbo",
  adjadv: "adjetivo/advérbio", substantivo: "substantivo", expressao: "expressão",
};
const PRI_LABEL = { 1: "fundamental", 2: "importante", 3: "secundária" };

function tagOf(term) {
  const t = (typeof VOCAB_TAGS !== "undefined" && VOCAB_TAGS[String(term).toLowerCase()]) || null;
  return t || { cat: "", tipo: "normal", pri: 2 };
}

// Coloca uma palavra da lição na revisão, conforme a prioridade.
function addToSrs(en, pt, ex) {
  if (S.srs[en]) return;
  const t = tagOf(en);
  if (t.tipo === "facil") return; // não ocupa a revisão
  if (t.tipo === "cognato" && t.pri === 3) S.srs[en] = { pt, ex, box: 2, due: Date.now() + INTERVALS[2] * DAY };
  else S.srs[en] = { pt, ex, box: 0, due: Date.now() };
}

// Uma vez: tira da fila as palavras fáceis e espaça os cognatos já existentes.
function migrateSrs() {
  if (S.srsV2 || typeof VOCAB_TAGS === "undefined") return;
  for (const [en, c] of Object.entries(S.srs || {})) {
    const t = tagOf(en);
    if (t.tipo === "facil") c.skip = true;
    else if (t.tipo === "cognato" && t.pri === 3 && c.box < 2) { c.box = 2; c.due = Math.max(c.due, Date.now() + INTERVALS[2] * DAY); }
  }
  S.srsV2 = 1;
}

function catChip(term) {
  const t = tagOf(term);
  const parts = [];
  if (t.cat) parts.push(CAT_LABEL[t.cat] || t.cat);
  if (t.tipo === "cognato") parts.push("cognato");
  if (t.tipo === "falso") parts.push("falso cognato");
  if (t.tipo === "facil") parts.push("fácil");
  return parts.length ? `<span class="wchip p${t.pri}">${t.pri === 1 ? "★ " : ""}${esc(parts.join(" · "))}</span>` : "";
}

// ---------- Palavras de ligação nos textos ----------
// As muito básicas não são destacadas (and, but, so…).
const LINK_SKIP = new Set(["and", "but", "or", "so", "if", "when", "then", "too", "also", "first", "finally", "after", "before", "only", "just", "because", "and also", "after that", "as"]);
function linkTermsFor(level) {
  return LINK_WORDS.filter((w) => !LINK_SKIP.has(w.w.toLowerCase()) && w.level <= Math.max(level + 1, 3) && !w.w.includes("…"));
}
function linkWordInfo(w) { return LINK_WORDS.find((x) => x.w.toLowerCase() === String(w).toLowerCase()); }

// ---------- Treino de palavras de ligação ----------
const LINK_PROMPT = {
  lacuna: "Qual palavra completa a frase?",
  relacao: "Que relação a palavra destacada cria?",
  equivalente: "Qual palavra pode substituir a destacada sem mudar o sentido?",
};
function linkPool() {
  const scope = S.linkScope || "auto";
  const lv = startLevel();
  return LINK_ITEMS.filter((i) => scope === "todos" ? true
    : scope === "avancado" ? i.level >= 4
    : scope === "basico" ? i.level <= 3
    : i.level <= Math.max(3, lv + 1));
}
function linkMastered() { return Object.values(S.links || {}).filter((x) => x.box >= 3).length; }
function linkDue() { const now = Date.now(); return linkPool().filter((i) => (S.links || {})[i.id] && S.links[i.id].due <= now).length; }
function pickLinkSession(n = 8) {
  S.links = S.links || {};
  const now = Date.now(), pool = linkPool();
  const due = pool.filter((i) => S.links[i.id] && S.links[i.id].due <= now).sort((a, b) => S.links[a.id].due - S.links[b.id].due);
  const fresh = pool.filter((i) => !S.links[i.id]);
  for (let k = fresh.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [fresh[k], fresh[j]] = [fresh[j], fresh[k]]; }
  const out = [];
  const used = new Set();
  for (const i of [...due, ...fresh]) { if (out.length >= n) break; if (used.has(i.w) && out.length < n - 1 && fresh.length + due.length > n) continue; out.push(i); used.add(i.w); }
  return out.map(shuffled);
}
function highlightWord(s, w) {
  const word = String(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("…", ".*?");
  return esc(s).replace(new RegExp("\\b(" + word + ")\\b", "i"), "<mark>$1</mark>");
}

function linksTraining() {
  if (!LINK_ITEMS.length) { view().innerHTML = `<section class="card"><h2>Treino de ligação</h2><p>O banco de questões ainda não foi carregado.</p></section>`; return; }
  const scopes = { auto: "Meu nível", basico: "Básico", avancado: "Avançado (ANPAD)", todos: "Todos" };
  const items = pickLinkSession();
  let k = 0, okCount = 0, xp = 0;
  const draw = () => {
    if (k >= items.length) {
      view().innerHTML = `<section class="card center">
        <p class="eyebrow">Treino concluído</p>
        <div class="level">${okCount}/${items.length}</div>
        <p class="xpgain">+${xp} XP</p>
        <p class="muted">${linkMastered()} palavras de ligação dominadas · ${linkDue()} para revisar</p>
        <button class="btn primary block" id="again">Mais 8 questões</button>
        <a class="btn block" href="#inicio">Voltar ao início</a>
      </section>`;
      $("#again").onclick = () => linksTraining();
      return;
    }
    const it = items[k], info = linkWordInfo(it.w) || {};
    const showMark = it.kind !== "lacuna";
    view().innerHTML = `
      <p class="eyebrow">Treino de palavras de ligação · ${k + 1} de ${items.length}</p>
      <div class="chips">${Object.entries(scopes).map(([v, t]) => `<button class="chip ${(S.linkScope || "auto") === v ? "on" : ""}" data-scope="${v}">${t}</button>`).join("")}</div>
      <div class="bar"><div style="width:${(k / items.length) * 100}%"></div></div>
      <section class="card">
        <p class="prose">${showMark ? highlightWord(it.s, it.w) : esc(it.s).replace("___", '<span class="blank">_____</span>')}</p>
        <fieldset class="q" id="L0">
          <legend>${esc(it.q || LINK_PROMPT[it.kind] || "Escolha:")}</legend>
          ${it.opts.map((o, j) => `<label><input type="radio" name="L0" value="${j}"> ${esc(o)}</label>`).join("")}
          <p class="why hidden"></p>
        </fieldset>
        <div id="lres"></div>
        <button class="btn primary block" id="lgo">Conferir</button>
      </section>`;
    view().querySelectorAll("[data-scope]").forEach((b) => b.onclick = () => { S.linkScope = b.dataset.scope; save(); linksTraining(); });
    $("#lgo").onclick = () => {
      const sel = document.querySelector('input[name="L0"]:checked');
      if (!sel) return;
      const right = +sel.value === it.a, box = $("#L0");
      box.classList.add(right ? "right" : "wrong");
      const w = box.querySelector(".why"); w.textContent = (right ? "✔ " : "✘ Resposta: " + it.opts[it.a] + ". ") + it.why; w.classList.remove("hidden");
      $("#lres").innerHTML = info.w ? `<div class="wordcard"><b>${esc(info.w)}</b> = ${esc(info.pt)} <span class="wchip p1">${esc(info.rel)}</span><p class="muted">${esc(info.tip || "")}</p></div>` : "";
      // revisão espaçada do item e pontos
      S.links = S.links || {};
      const st = S.links[it.id] || { box: 0, due: 0 }, isNew = !S.links[it.id];
      st.box = right ? Math.min(st.box + 1, INTERVALS.length - 1) : 0;
      st.due = Date.now() + (right ? INTERVALS[st.box] : 0) * DAY + (right ? 0 : 10 * 60000);
      S.links[it.id] = st;
      if (right) okCount++;
      const g = right ? (isNew ? 5 : 3) : 1; xp += g;
      awardReview(right); today().xp += g - (right ? XP.reviewOk : XP.reviewMiss);
      save(); afterEvent();
      $("#lgo").textContent = k === items.length - 1 ? "Ver resultado" : "Próxima";
      $("#lgo").onclick = () => { k++; draw(); scrollTo(0, 0); };
      view().querySelectorAll('input[name="L0"]').forEach((r) => (r.disabled = true));
    };
  };
  draw();
}

function linksCardHTML() {
  if (!LINK_ITEMS.length) return "";
  const due = linkDue(), m = linkMastered();
  return `<a class="card row" href="#treino"><span><b>Treino de palavras de ligação</b><br><span class="muted">${m} dominadas${due ? ` · ${due} para revisar` : ""} · however, although, unless, while…</span></span><span class="tag">Treinar</span></a>`;
}
