/* SE Primer — arayüz ve durum makinesi.
 * Durumlar: onboarding → scene → decision(i) → outcome(i) → … → ending. */
(function () {
  const S = window.SEStory;
  const T = window.SETutor;
  const root = document.getElementById("app");

  const state = {
    screen: "onboarding", // onboarding | scene | decision | outcome | ending
    profile: { level: null, role: null, goal: null },
    index: 0, // aktif karar
    choices: {},
    timerLeft: 0,
    timerId: null,
    hintShown: false,
    tutorLog: [],
  };

  const h = (html) => { root.innerHTML = html; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function stopTimer() { if (state.timerId) { clearInterval(state.timerId); state.timerId = null; } }

  /* ---------- Ekran 1: Giriş (3 soru) ---------- */
  function renderOnboarding() {
    const group = (key, title, map) => `
      <fieldset>
        <legend>${title}</legend>
        ${Object.entries(map).map(([id, v]) =>
          `<button type="button" class="choice" data-testid="${key}-${id}" data-key="${key}" data-id="${id}" aria-pressed="${state.profile[key] === id}">${esc(v.label)}</button>`
        ).join("")}
      </fieldset>`;
    const ready = state.profile.level && state.profile.role && state.profile.goal;
    h(`
      <div class="tag">SE PRIMER</div>
      <h1>Nöbetçi sensin.</h1>
      <p class="sub">Üç soru: hikâye sana göre şekillenecek.</p>
      ${group("level", "1. Seviyen ne?", S.LEVELS)}
      ${group("role", "2. Rolün ne?", S.ROLES)}
      ${group("goal", "3. Hedefin ne?", S.GOALS)}
      <button class="primary" data-testid="start-btn" ${ready ? "" : "disabled"}>Nöbete başla</button>
    `);
    root.querySelectorAll(".choice").forEach((b) =>
      b.addEventListener("click", () => { state.profile[b.dataset.key] = b.dataset.id; renderOnboarding(); }));
    root.querySelector("[data-testid=start-btn]").addEventListener("click", () => {
      state.screen = "scene"; state.index = 0; state.choices = {}; state.tutorLog = [];
      render();
    });
  }

  /* ---------- Ekran 2a: Sahne ---------- */
  function renderScene() {
    const role = S.ROLES[state.profile.role];
    h(`
      <div class="tag">${S.START.time} · ${S.START.title.toUpperCase()}</div>
      <div class="card">
        <p data-testid="scene-text">${esc(S.START.text)}</p>
        <p class="sub" data-testid="role-intro">${esc(role.intro)}</p>
      </div>
      <button class="primary" data-testid="scene-next">Karar ver</button>
    `);
    root.querySelector("[data-testid=scene-next]").addEventListener("click", () => { state.screen = "decision"; startDecision(); });
  }

  /* ---------- Ekran 2b: Karar ---------- */
  function startDecision() {
    stopTimer();
    state.hintShown = false;
    state.tutorLog = [];
    const beh = S.levelBehavior(state.profile.level);
    state.timerLeft = beh.timer;
    if (beh.timer) {
      state.timerId = setInterval(() => {
        state.timerLeft -= 1;
        const el = root.querySelector("[data-testid=timer]");
        if (el) { el.textContent = state.timerLeft + " sn"; el.classList.toggle("low", state.timerLeft <= 10); }
        if (state.timerLeft <= 0) { stopTimer(); choose("B", true); }
      }, 1000);
    }
    render();
  }

  function renderDecision() {
    const d = S.DECISIONS[state.index];
    const beh = S.levelBehavior(state.profile.level);
    const showHint = beh.hints === "always" || state.hintShown;
    h(`
      <div class="progress">Karar ${state.index + 1} / ${S.DECISIONS.length}
        ${beh.timer ? `· <span class="timer" data-testid="timer" role="timer">${state.timerLeft} sn</span>` : ""}</div>
      <div class="tag">${esc(d.tag)}</div>
      <h2 data-testid="prompt">${esc(d.prompt)}</h2>
      ${Object.entries(d.options).map(([k, o]) =>
        `<button class="choice" data-testid="option-${k}" data-opt="${k}">${k}) ${esc(o.label)}</button>`).join("")}
      ${beh.hints === "onDemand" && !state.hintShown ? `<button class="ghost" data-testid="hint-btn">İpucu</button>` : ""}
      ${showHint ? `<div class="hint" data-testid="hint-text">${esc(d.hint)}</div>` : ""}
      ${tutorHTML()}
    `);
    root.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => choose(b.dataset.opt, false)));
    const hb = root.querySelector("[data-testid=hint-btn]");
    if (hb) hb.addEventListener("click", () => { state.hintShown = true; renderDecision(); });
    bindTutor();
  }

  function choose(opt, timedOut) {
    stopTimer();
    const d = S.DECISIONS[state.index];
    state.choices[d.id] = opt;
    state.timedOut = !!timedOut;
    state.screen = "outcome";
    render();
  }

  /* ---------- Tutor paneli ---------- */
  function tutorHTML() {
    const log = state.tutorLog.map((m) =>
      `<div class="bubble" data-testid="tutor-${m.who}"><small>${m.who === "me" ? "Sen" : "Tutor"}</small>${esc(m.text)}</div>`).join("");
    return `
      <section class="tutor card" aria-label="AI tutor">
        <div class="tag">AI TUTOR</div>
        <form data-testid="tutor-form">
          <input data-testid="tutor-input" placeholder="Düşünceni yaz…" aria-label="Tutora mesaj" autocomplete="off" />
          <button class="ghost" data-testid="tutor-send">Sor</button>
        </form>
        <div data-testid="tutor-log">${log}</div>
      </section>`;
  }

  function bindTutor() {
    const form = root.querySelector("[data-testid=tutor-form]");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      state.tutorLog.push({ who: "me", text });
      const d = S.DECISIONS[state.index];
      let apiKey = null;
      try { apiKey = localStorage.getItem("gemini_key"); } catch (_) { /* depolama kapalı */ }
      const r = await T.reply({ decisionId: d.id, text }, { apiKey });
      state.tutorLog.push({ who: "tutor", text: r.text });
      renderDecision();
    });
  }

  /* ---------- Sonuç: ne oldu, neden oldu ---------- */
  function renderOutcome() {
    const d = S.DECISIONS[state.index];
    const o = d.options[state.choices[d.id]];
    const last = state.index === S.DECISIONS.length - 1;
    h(`
      <div class="progress">Karar ${state.index + 1} / ${S.DECISIONS.length}</div>
      <div class="tag">${esc(d.tag)} · SONUÇ</div>
      ${state.timedOut ? `<div class="hint" data-testid="timeout-note">Süre doldu: acele karar verildi → ${esc(o.label)}.</div>` : ""}
      <div class="card">
        <p><strong>Seçimin:</strong> <span data-testid="chosen">${state.choices[d.id]}) ${esc(o.label)}</span></p>
        <dl class="outcome">
          <dt>Ne oldu</dt><dd data-testid="outcome-what">${esc(o.what)}</dd>
          <dt>Neden oldu</dt><dd data-testid="outcome-why">${esc(o.why)}</dd>
        </dl>
      </div>
      <button class="primary" data-testid="continue-btn">${last ? "Sonu gör" : "Sonraki karar"}</button>
    `);
    root.querySelector("[data-testid=continue-btn]").addEventListener("click", () => {
      if (last) { state.screen = "ending"; render(); }
      else { state.index += 1; state.screen = "decision"; startDecision(); }
    });
  }

  /* ---------- Ekran 3: Son ---------- */
  function renderEnding() {
    const id = S.computeEnding(state.choices);
    const e = S.ENDINGS[id];
    const goal = S.GOALS[state.profile.goal];
    const recap = S.DECISIONS.map((d) => {
      const k = state.choices[d.id];
      return `<li>${esc(d.tag.split("·")[1].trim())}: ${k}) ${esc(d.options[k].label)} ${d.options[k].safe ? "✓" : "✗"}</li>`;
    }).join("");
    const reasons = id === "B" ? S.badReasons(state.choices) : [];
    h(`
      <div class="card ending-${e.kind}">
        <div class="tag" data-testid="ending-title">${e.title}</div>
        <p data-testid="ending-text">${esc(e.time)} — ${esc(e.text)}</p>
        <ul class="recap" data-testid="recap">${recap}</ul>
        ${reasons.length ? `<p><strong>Bedel:</strong></p><ul class="recap" data-testid="reasons">${reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
        <p class="sub" data-testid="goal-note">${esc(goal.closing)}</p>
      </div>
      <button class="primary" data-testid="replay-btn">Tekrar oyna</button>
    `);
    root.querySelector("[data-testid=replay-btn]").addEventListener("click", () => {
      state.screen = "onboarding"; state.profile = { level: null, role: null, goal: null }; render();
    });
  }

  function render() {
    ({ onboarding: renderOnboarding, scene: renderScene, decision: renderDecision, outcome: renderOutcome, ending: renderEnding })[state.screen]();
    window.scrollTo(0, 0);
  }

  window.__SEPrimerState = state; // test ve hata ayıklama için
  render();
})();
