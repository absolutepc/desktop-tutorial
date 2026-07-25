(() => {
  const COLORS = [
    { name: "Красный", hex: "#ff4d6d" },
    { name: "Синий", hex: "#4cc9f0" },
    { name: "Зелёный", hex: "#3ecf8e" },
    { name: "Жёлтый", hex: "#ffd166" },
    { name: "Оранжевый", hex: "#ff8a3d" },
    { name: "Бирюзовый", hex: "#2ec4b6" },
  ];

  const WALLS = [
    // outer
    { x: 20, y: 20, w: 920, h: 18 },
    { x: 20, y: 502, w: 920, h: 18 },
    { x: 20, y: 20, w: 18, h: 500 },
    { x: 922, y: 20, w: 18, h: 500 },
    // cafeteria left/right/top internals
    { x: 220, y: 20, w: 18, h: 120 },
    { x: 220, y: 200, w: 18, h: 80 },
    { x: 380, y: 140, w: 160, h: 18 },
    // medbay
    { x: 20, y: 260, w: 160, h: 18 },
    { x: 160, y: 260, w: 18, h: 120 },
    // electrical
    { x: 220, y: 340, w: 180, h: 18 },
    { x: 380, y: 340, w: 18, h: 180 },
    // reactor
    { x: 20, y: 380, w: 100, h: 18 },
    // storage / admin divider
    { x: 540, y: 20, w: 18, h: 160 },
    { x: 540, y: 240, w: 18, h: 120 },
    { x: 540, y: 420, w: 18, h: 100 },
    // navigation
    { x: 700, y: 140, w: 240, h: 18 },
    { x: 700, y: 140, w: 18, h: 220 },
    { x: 700, y: 420, w: 18, h: 100 },
    // security
    { x: 540, y: 300, w: 120, h: 18 },
  ];

  const ROOMS = [
    { name: "Кафе", x: 40, y: 50 },
    { name: "Медблок", x: 40, y: 300 },
    { name: "Реактор", x: 40, y: 430 },
    { name: "Электрика", x: 250, y: 380 },
    { name: "Админ", x: 430, y: 80 },
    { name: "Склад", x: 430, y: 380 },
    { name: "Охрана", x: 580, y: 220 },
    { name: "Навигация", x: 760, y: 200 },
  ];

  const TASK_DEFS = [
    { id: "wires", label: "Починить провода", x: 300, y: 450, room: "Электрика" },
    { id: "scan", label: "Медсканер", x: 90, y: 320, room: "Медблок" },
    { id: "fuel", label: "Заправить двигатель", x: 90, y: 450, room: "Реактор" },
    { id: "chart", label: "Проложить курс", x: 820, y: 250, room: "Навигация" },
    { id: "upload", label: "Загрузить данные", x: 470, y: 100, room: "Админ" },
    { id: "boxes", label: "Разобрать ящики", x: 470, y: 450, room: "Склад" },
  ];

  const EMERGENCY = { x: 120, y: 120, r: 28 };
  const KILL_RANGE = 42;
  const REPORT_RANGE = 48;
  const TASK_RANGE = 36;
  const PLAYER_R = 14;
  const SPEED = 150;
  const BOT_SPEED = 105;
  const KILL_CD = 12;
  const MEETING_INTRO = 4;
  const TOTAL_PLAYERS = 6;

  const els = {
    menu: document.getElementById("menu"),
    gameWrap: document.getElementById("game-wrap"),
    hud: document.getElementById("hud"),
    rolePill: document.getElementById("role-pill"),
    taskPill: document.getElementById("task-pill"),
    alivePill: document.getElementById("alive-pill"),
    taskList: document.getElementById("task-list"),
    hint: document.getElementById("hint"),
    killBar: document.getElementById("kill-bar"),
    cooldownBlock: document.getElementById("cooldown-block"),
    meeting: document.getElementById("meeting"),
    meetingReason: document.getElementById("meeting-reason"),
    meetingTimer: document.getElementById("meeting-timer"),
    voteGrid: document.getElementById("vote-grid"),
    meetingLog: document.getElementById("meeting-log"),
    result: document.getElementById("result"),
    resultEyebrow: document.getElementById("result-eyebrow"),
    resultTitle: document.getElementById("result-title"),
    resultDesc: document.getElementById("result-desc"),
    startBtn: document.getElementById("start-btn"),
    againBtn: document.getElementById("again-btn"),
    touchControls: document.getElementById("touch-controls"),
    joystick: document.getElementById("joystick"),
    joystickKnob: document.getElementById("joystick-knob"),
    btnUse: document.getElementById("btn-use"),
    btnKill: document.getElementById("btn-kill"),
  };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const keys = new Set();
  const touch = {
    dx: 0,
    dy: 0,
    use: false,
    pointerId: null,
  };
  let state = null;
  let lastTs = 0;
  let animId = 0;
  const prefersTouch =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 860px)").matches;

  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function circleRect(cx, cy, r, rect) {
    const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
  }

  function blocked(x, y, r = PLAYER_R) {
    return WALLS.some((w) => circleRect(x, y, r, w));
  }

  function tryMove(entity, dx, dy, dt, speed) {
    const step = speed * dt;
    let nx = entity.x + dx * step;
    let ny = entity.y + dy * step;
    if (!blocked(nx, entity.y)) entity.x = nx;
    if (!blocked(entity.x, ny)) entity.y = ny;
    entity.x = Math.max(40, Math.min(920, entity.x));
    entity.y = Math.max(40, Math.min(500, entity.y));
  }

  function spawnPoints() {
    return [
      { x: 120, y: 180 },
      { x: 280, y: 120 },
      { x: 450, y: 200 },
      { x: 620, y: 160 },
      { x: 780, y: 280 },
      { x: 320, y: 280 },
    ];
  }

  function createGame() {
    const colors = shuffle(COLORS).slice(0, TOTAL_PLAYERS);
    const spawns = shuffle(spawnPoints());
    const impostorIndex = Math.floor(Math.random() * TOTAL_PLAYERS);
    const players = colors.map((color, i) => ({
      id: i,
      name: color.name,
      color: color.hex,
      x: spawns[i].x,
      y: spawns[i].y,
      alive: true,
      isBot: i !== 0,
      isImpostor: i === impostorIndex,
      taskProgress: 0,
      targetTask: null,
      wander: null,
      suspicion: 0,
      killCd: KILL_CD,
      facing: 1,
    }));

    const taskPool = shuffle(TASK_DEFS);
    const humanTasks = taskPool.slice(0, 4).map((t) => ({ ...t, done: false, progress: 0 }));

    // bots get their own fake/real task routes
    players.forEach((p) => {
      if (p.isBot) {
        p.botTasks = shuffle(TASK_DEFS).slice(0, 3).map((t) => ({ ...t, done: false }));
      }
    });

    return {
      phase: "play", // play | meeting | result
      players,
      human: players[0],
      bodies: [],
      tasks: humanTasks,
      completedTasks: 0,
      totalTasks: humanTasks.length,
      meeting: null,
      time: 0,
      flash: 0,
      message: "",
      messageT: 0,
      camShake: 0,
    };
  }

  function showMessage(text, t = 2.2) {
    state.message = text;
    state.messageT = t;
  }

  function alivePlayers() {
    return state.players.filter((p) => p.alive);
  }

  function aliveCrew() {
    return alivePlayers().filter((p) => !p.isImpostor);
  }

  function aliveImp() {
    return alivePlayers().filter((p) => p.isImpostor);
  }

  function updateHud() {
    const human = state.human;
    els.rolePill.textContent = human.isImpostor ? "Импостер" : "Член экипажа";
    els.rolePill.className = "hud-pill " + (human.isImpostor ? "impostor" : "crewmate");
    const done = state.tasks.filter((t) => t.done).length;
    els.taskPill.textContent = human.isImpostor
      ? "Саботируй незаметно"
      : `Задачи ${done}/${state.tasks.length}`;
    els.alivePill.textContent = `Живы ${alivePlayers().length}/${state.players.length}`;

    els.taskList.innerHTML = "";
    if (human.isImpostor) {
      const tips = [
        "Убивай вдали от свидетелей",
        "Притворяйся, что делаешь задачи",
        "Сообщай о телах, если выгодно",
      ];
      tips.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        els.taskList.appendChild(li);
      });
      els.cooldownBlock.classList.remove("hidden");
    } else {
      state.tasks.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = `${t.label} · ${t.room}`;
        if (t.done) li.classList.add("done");
        els.taskList.appendChild(li);
      });
      els.cooldownBlock.classList.add("hidden");
    }

    const nearTask = nearestInteractable();
    const useLabel = prefersTouch ? "Действие" : "E";
    const killLabel = prefersTouch ? "Убить" : "Q";
    if (!human.alive) {
      els.hint.textContent = "Ты выбыл. Наблюдай и жди собрания.";
    } else if (nearTask?.type === "body") {
      els.hint.textContent = `${useLabel} — сообщить о теле`;
    } else if (nearTask?.type === "emergency") {
      els.hint.textContent = `${useLabel} — экстренное собрание`;
    } else if (nearTask?.type === "task" && !human.isImpostor) {
      els.hint.textContent = `Удерживай «${useLabel}» — выполнить задачу`;
    } else if (human.isImpostor) {
      els.hint.textContent = human.killCd > 0
        ? `Убийство через ${human.killCd.toFixed(1)}с`
        : `${killLabel} — убить ближайшего`;
    } else {
      els.hint.textContent = "Иди к жёлтым маркерам задач";
    }

    const ready = Math.max(0, 1 - human.killCd / KILL_CD);
    els.killBar.style.transform = `scaleX(${human.isImpostor ? ready : 0})`;

    if (human.isImpostor && human.alive) {
      els.btnKill.classList.remove("hidden");
      els.btnKill.disabled = human.killCd > 0 || state.phase !== "play";
    } else {
      els.btnKill.classList.add("hidden");
    }
  }

  function nearestInteractable() {
    const h = state.human;
    if (!h.alive) return null;

    let best = null;
    let bestD = Infinity;

    for (const b of state.bodies) {
      const d = dist(h, b);
      if (d < REPORT_RANGE && d < bestD) {
        bestD = d;
        best = { type: "body", ref: b };
      }
    }

    const de = dist(h, EMERGENCY);
    if (de < EMERGENCY.r + 10 && de < bestD) {
      best = { type: "emergency" };
      bestD = de;
    }

    if (!h.isImpostor) {
      for (const t of state.tasks) {
        if (t.done) continue;
        const d = dist(h, t);
        if (d < TASK_RANGE && d < bestD) {
          bestD = d;
          best = { type: "task", ref: t };
        }
      }
    }

    return best;
  }

  function killNearest() {
    const h = state.human;
    if (!h.alive || !h.isImpostor || h.killCd > 0 || state.phase !== "play") return;
    const victims = aliveCrew()
      .filter((p) => p.id !== h.id)
      .map((p) => ({ p, d: dist(h, p) }))
      .filter((x) => x.d <= KILL_RANGE)
      .sort((a, b) => a.d - b.d);
    if (!victims.length) {
      showMessage("Никого рядом");
      return;
    }
    doKill(h, victims[0].p);
  }

  function doKill(killer, victim) {
    victim.alive = false;
    state.bodies.push({
      x: victim.x,
      y: victim.y,
      color: victim.color,
      name: victim.name,
      id: victim.id,
      killerId: killer.id,
      age: 0,
    });
    killer.killCd = KILL_CD;
    state.flash = 0.25;
    state.camShake = 0.35;
    if (victim.id === state.human.id) {
      showMessage("Тебя убили...", 3);
    } else if (killer.id === state.human.id) {
      showMessage(`${victim.name} устранён`);
    }
    checkWin();
  }

  function startMeeting(reason, reporter) {
    if (state.phase !== "play") return;
    state.phase = "meeting";
    state.bodies = [];
    const living = alivePlayers();
    const votes = {};
    living.forEach((p) => {
      votes[p.id] = null;
    });

    // suspicion heuristic
    state.players.forEach((p) => {
      if (!p.alive) return;
      if (reason.startsWith("Тело") && reporter) {
        // slight suspicion on people far from cafe / near corpse area is hard; bump random + impostor noise
        p.suspicion += Math.random() * 0.4;
      }
      if (p.isImpostor) p.suspicion += 0.15;
    });

    state.meeting = {
      reason,
      reporter,
      intro: MEETING_INTRO,
      votes,
      voted: false,
      resolved: false,
      resultText: "",
    };

    els.meeting.classList.remove("hidden");
    els.meetingReason.textContent = reason;
    els.meetingLog.textContent = reporter
      ? `${reporter.name} вызвал собрание.`
      : "Экипаж собрался.";
    renderVoteButtons();
    els.meetingTimer.textContent = `Обсуждение: ${MEETING_INTRO.toFixed(0)}с`;
  }

  function renderVoteButtons() {
    const m = state.meeting;
    els.voteGrid.innerHTML = "";
    const living = alivePlayers();
    living.forEach((p) => {
      const btn = document.createElement("button");
      btn.className = "vote-btn";
      btn.disabled = true;
      btn.innerHTML = `<span class="swatch" style="background:${p.color}"></span>${p.name}${
        p.id === state.human.id ? " (ты)" : ""
      }`;
      btn.addEventListener("click", () => castHumanVote(p.id));
      els.voteGrid.appendChild(btn);
    });
    const skip = document.createElement("button");
    skip.className = "vote-btn";
    skip.disabled = true;
    skip.textContent = "Пропустить";
    skip.addEventListener("click", () => castHumanVote("skip"));
    els.voteGrid.appendChild(skip);
  }

  function enableVotes() {
    [...els.voteGrid.querySelectorAll("button")].forEach((b) => {
      b.disabled = !state.human.alive || state.meeting.voted;
    });
    els.meetingTimer.textContent = state.human.alive
      ? "Голосуй сейчас"
      : "Ты мёртв — ждут голоса ботов";
  }

  function castHumanVote(target) {
    if (!state.meeting || state.meeting.voted || !state.human.alive) return;
    state.meeting.votes[state.human.id] = target;
    state.meeting.voted = true;
    [...els.voteGrid.querySelectorAll("button")].forEach((b) => (b.disabled = true));
    els.meetingLog.textContent = "Голос принят. Ждём остальных...";
    castBotVotes();
    maybeResolveMeeting();
  }

  function castBotVotes() {
    const living = alivePlayers().filter((p) => p.isBot);
    living.forEach((bot) => {
      if (state.meeting.votes[bot.id] != null) return;
      const others = alivePlayers().filter((p) => p.id !== bot.id);
      // prefer highest suspicion, with noise; impostor avoids self and may skip or frame
      let choice = "skip";
      if (bot.isImpostor) {
        const crews = others.filter((p) => !p.isImpostor);
        if (Math.random() < 0.7 && crews.length) choice = rand(crews).id;
        else choice = "skip";
      } else {
        const ranked = [...others].sort(
          (a, b) => b.suspicion + Math.random() * 0.5 - (a.suspicion + Math.random() * 0.5)
        );
        if (ranked[0] && ranked[0].suspicion + Math.random() > 0.55) choice = ranked[0].id;
        else if (Math.random() < 0.35) choice = rand(others).id;
        else choice = "skip";
      }
      state.meeting.votes[bot.id] = choice;
    });
  }

  function maybeResolveMeeting() {
    if (!state.meeting || state.meeting.resolved) return;
    if (!state.human.alive || state.meeting.voted) {
      castBotVotes();
    }
    const ready = alivePlayers().every((p) => state.meeting.votes[p.id] != null);
    if (ready) resolveMeeting();
  }

  function resolveMeeting() {
    if (state.meeting.resolved) return;
    state.meeting.resolved = true;
    const tally = {};
    Object.values(state.meeting.votes).forEach((v) => {
      const key = v == null ? "skip" : String(v);
      tally[key] = (tally[key] || 0) + 1;
    });
    let winner = "skip";
    let best = -1;
    let tie = false;
    Object.entries(tally).forEach(([k, n]) => {
      if (n > best) {
        best = n;
        winner = k;
        tie = false;
      } else if (n === best) {
        tie = true;
      }
    });

    let text;
    if (tie || winner === "skip") {
      text = "Никого не изгнали.";
    } else {
      const id = Number(winner);
      const ejected = state.players.find((p) => p.id === id);
      if (ejected && ejected.alive) {
        ejected.alive = false;
        text = `${ejected.name} изгнан. ${
          ejected.isImpostor ? "Он был импостером!" : "Он был невиновен."
        }`;
        if (ejected.isImpostor) {
          els.meetingLog.textContent = text;
          setTimeout(() => endGame(true, text), 1200);
          return;
        }
      } else {
        text = "Голос не сработал.";
      }
    }
    els.meetingLog.textContent = text;
    setTimeout(() => {
      els.meeting.classList.add("hidden");
      state.phase = "play";
      state.meeting = null;
      // reset kill cds a bit
      state.players.forEach((p) => {
        if (p.isImpostor) p.killCd = Math.max(p.killCd, 6);
      });
      checkWin();
      updateHud();
    }, 1600);
  }

  function checkWin() {
    if (state.phase === "result") return;
    if (aliveImp().length === 0) {
      endGame(true, "Все импостеры изгнаны. Экипаж победил!");
      return;
    }
    if (aliveImp().length >= aliveCrew().length) {
      endGame(false, "Импостеры захватили станцию.");
      return;
    }
    if (!state.human.isImpostor) {
      const done = state.tasks.every((t) => t.done);
      if (done) {
        endGame(true, "Все задачи выполнены. Экипаж победил!");
      }
    }
  }

  function endGame(crewWin, desc) {
    state.phase = "result";
    els.meeting.classList.add("hidden");
    els.result.classList.remove("hidden");
    const human = state.human;
    const humanWins =
      (human.isImpostor && !crewWin) || (!human.isImpostor && crewWin);
    els.resultEyebrow.textContent = humanWins ? "Победа" : "Поражение";
    els.resultTitle.textContent = humanWins ? "Ты победил!" : "Ты проиграл";
    const imp = state.players.find((p) => p.isImpostor);
    els.resultDesc.textContent = `${desc} Импостер: ${imp.name}.`;
  }

  function updateBots(dt) {
    state.players.forEach((bot) => {
      if (!bot.isBot || !bot.alive || state.phase !== "play") return;

      bot.killCd = Math.max(0, bot.killCd - dt);

      if (bot.isImpostor) {
        // hunt isolated crew or fake tasks
        const crews = aliveCrew().filter((c) => c.id !== bot.id);
        const nearbyWitnesses = (target) =>
          alivePlayers().filter(
            (p) => p.id !== bot.id && p.id !== target.id && dist(p, target) < 110
          ).length;

        let target = null;
        for (const c of crews) {
          const d = dist(bot, c);
          if (d < 160 && nearbyWitnesses(c) === 0) {
            target = c;
            break;
          }
        }

        if (target && bot.killCd <= 0 && dist(bot, target) <= KILL_RANGE) {
          doKill(bot, target);
          return;
        }

        const goal = target || bot.wander || rand(TASK_DEFS);
        if (!bot.wander || dist(bot, bot.wander) < 20) {
          bot.wander = { x: goal.x + (Math.random() * 40 - 20), y: goal.y + (Math.random() * 40 - 20) };
        }
        moveToward(bot, bot.wander, dt, BOT_SPEED);

        // sometimes report own kill if another body nearby and witnesses exist — skip for simplicity
        return;
      }

      // crewmate AI: do tasks then wander
      if (!bot.botTasks) return;
      let task = bot.botTasks.find((t) => !t.done);
      if (!task) {
        bot.botTasks.forEach((t) => (t.done = false));
        task = bot.botTasks[0];
      }
      if (dist(bot, task) > 22) {
        moveToward(bot, task, dt, BOT_SPEED);
      } else {
        // "work"
        bot.taskProgress = (bot.taskProgress || 0) + dt;
        if (bot.taskProgress > 2.5) {
          task.done = true;
          bot.taskProgress = 0;
        }
      }

      // report bodies
      for (const body of state.bodies) {
        if (dist(bot, body) < REPORT_RANGE && Math.random() < 0.02) {
          // bump suspicion on killer if somehow; otherwise random nearby
          const killer = state.players.find((p) => p.id === body.killerId);
          if (killer && killer.alive) killer.suspicion += 0.8;
          startMeeting(`Тело: ${body.name}`, bot);
          return;
        }
      }
    });
  }

  function moveToward(entity, goal, dt, speed) {
    const dx = goal.x - entity.x;
    const dy = goal.y - entity.y;
    const len = Math.hypot(dx, dy) || 1;
    entity.facing = dx >= 0 ? 1 : -1;
    tryMove(entity, dx / len, dy / len, dt, speed);
  }

  function updateHuman(dt) {
    const h = state.human;
    if (!h.alive || state.phase !== "play") return;

    let dx = touch.dx;
    let dy = touch.dy;
    if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      h.facing = dx >= 0 ? 1 : -1;
      tryMove(h, dx, dy, dt, SPEED);
    }

    h.killCd = Math.max(0, h.killCd - dt);

    const inter = nearestInteractable();
    const using = keys.has("KeyE") || keys.has("Space") || touch.use;
    if (using) {
      if (inter?.type === "body") {
        const body = inter.ref;
        const killer = state.players.find((p) => p.id === body.killerId);
        if (killer && killer.alive) killer.suspicion += 0.6;
        if (h.isImpostor) h.suspicion += 0.2;
        startMeeting(`Тело: ${body.name}`, h);
        keys.delete("KeyE");
        keys.delete("Space");
        touch.use = false;
      } else if (inter?.type === "emergency") {
        startMeeting("Экстренное собрание", h);
        keys.delete("KeyE");
        keys.delete("Space");
        touch.use = false;
      } else if (inter?.type === "task" && !h.isImpostor) {
        const t = inter.ref;
        t.progress += dt;
        if (t.progress >= 1.6) {
          t.done = true;
          t.progress = 1.6;
          showMessage(`Задача: ${t.label}`);
          checkWin();
        }
      }
    } else if (inter?.type === "task" && inter.ref.progress > 0 && !inter.ref.done) {
      inter.ref.progress = Math.max(0, inter.ref.progress - dt * 0.6);
    }
  }

  function updateMeeting(dt) {
    const m = state.meeting;
    if (!m || m.resolved) return;
    if (m.intro > 0) {
      m.intro -= dt;
      els.meetingTimer.textContent = `Обсуждение: ${Math.max(0, Math.ceil(m.intro))}с`;
      if (m.intro <= 0) {
        enableVotes();
        if (!state.human.alive) {
          castBotVotes();
          maybeResolveMeeting();
        }
      }
      return;
    }
    // auto-resolve if human never votes
    m.auto = (m.auto || 0) + dt;
    if (!m.voted && state.human.alive && m.auto > 12) {
      castHumanVote("skip");
    }
    if (!state.human.alive) {
      castBotVotes();
      maybeResolveMeeting();
    } else if (m.voted) {
      maybeResolveMeeting();
    }
  }

  function draw() {
    const shakeX = state.camShake > 0 ? (Math.random() - 0.5) * 8 : 0;
    const shakeY = state.camShake > 0 ? (Math.random() - 0.5) * 8 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // floor
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#15233a");
    grad.addColorStop(1, "#0d1728");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // room tint blocks
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#3ecf8e";
    ctx.fillRect(38, 38, 180, 210);
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(38, 278, 140, 100);
    ctx.fillStyle = "#ff8a3d";
    ctx.fillRect(38, 400, 140, 100);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(240, 360, 140, 140);
    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(400, 40, 140, 120);
    ctx.fillStyle = "#2ec4b6";
    ctx.fillRect(720, 160, 200, 240);
    ctx.globalAlpha = 1;

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // walls
    WALLS.forEach((w) => {
      ctx.fillStyle = "#243552";
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = "rgba(255,138,61,0.15)";
      ctx.fillRect(w.x, w.y, w.w, 3);
    });

    // room labels
    ctx.fillStyle = "rgba(232,238,248,0.45)";
    ctx.font = "600 12px IBM Plex Sans";
    ROOMS.forEach((r) => ctx.fillText(r.name, r.x, r.y));

    // emergency button
    ctx.beginPath();
    ctx.arc(EMERGENCY.x, EMERGENCY.y, EMERGENCY.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4d6d";
    ctx.fill();
    ctx.strokeStyle = "#ffd0d8";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#1a0d05";
    ctx.font = "700 11px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText("SOS", EMERGENCY.x, EMERGENCY.y + 4);
    ctx.textAlign = "left";

    // tasks
    state.tasks.forEach((t) => {
      if (t.done) return;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd166";
      ctx.fill();
      ctx.strokeStyle = "#fff3c4";
      ctx.stroke();
      if (t.progress > 0 && !t.done) {
        ctx.strokeStyle = "#3ecf8e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 16, -Math.PI / 2, -Math.PI / 2 + (t.progress / 1.6) * Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    });

    // bodies
    state.bodies.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(-0.4);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(-8, -4, 18, 6);
      ctx.restore();
      ctx.fillStyle = "rgba(255,77,109,0.9)";
      ctx.font = "700 10px IBM Plex Sans";
      ctx.fillText("ТЕЛО", b.x - 14, b.y - 16);
    });

    // players
    const ordered = [...state.players].sort((a, b) => a.y - b.y);
    ordered.forEach((p) => {
      if (!p.alive) return;
      drawCrew(p);
    });

    // flash
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255,77,109,${state.flash})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // message
    if (state.messageT > 0) {
      ctx.fillStyle = "rgba(10,16,28,0.75)";
      ctx.fillRect(canvas.width / 2 - 160, 16, 320, 36);
      ctx.strokeStyle = "rgba(255,138,61,0.4)";
      ctx.strokeRect(canvas.width / 2 - 160, 16, 320, 36);
      ctx.fillStyle = "#e8eef8";
      ctx.font = "600 14px IBM Plex Sans";
      ctx.textAlign = "center";
      ctx.fillText(state.message, canvas.width / 2, 40);
      ctx.textAlign = "left";
    }

    // minimap interaction prompt
    const inter = nearestInteractable();
    if (inter && state.human.alive && state.phase === "play") {
      const label =
        inter.type === "body"
          ? prefersTouch ? "Донос" : "[E] Донос"
          : inter.type === "emergency"
            ? prefersTouch ? "Собрание" : "[E] Собрание"
            : prefersTouch ? "Задача" : "[E] Задача";
      ctx.fillStyle = "rgba(255,208,61,0.95)";
      ctx.font = "700 13px IBM Plex Sans";
      ctx.fillText(label, state.human.x - 28, state.human.y - 28);
    }

    ctx.restore();
  }

  function drawCrew(p) {
    const x = p.x;
    const y = p.y;
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = p.color;
    roundRect(x - 14, y - 18, 28, 34, 12);
    // visor
    ctx.fillStyle = "rgba(220,245,255,0.9)";
    roundRect(x - 4, y - 10, 16, 12, 6);
    // backpack
    ctx.fillStyle = shade(p.color, -25);
    roundRect(x - 18, y - 8, 8, 16, 4);

    if (p.id === state.human.id) {
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(232,238,248,0.9)";
    ctx.font = "600 11px IBM Plex Sans";
    ctx.textAlign = "center";
    ctx.fillText(p.name, x, y + 30);
    ctx.textAlign = "left";
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function shade(hex, amt) {
    const n = hex.replace("#", "");
    const num = parseInt(n, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  function loop(ts) {
    if (!state) return;
    const dt = Math.min(0.033, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;
    state.time += dt;
    state.flash = Math.max(0, state.flash - dt);
    state.camShake = Math.max(0, state.camShake - dt);
    state.messageT = Math.max(0, state.messageT - dt);

    if (state.phase === "play") {
      updateHuman(dt);
      updateBots(dt);
    } else if (state.phase === "meeting") {
      updateMeeting(dt);
    }

    updateHud();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(animId);
    state = createGame();
    els.menu.classList.add("hidden");
    els.result.classList.add("hidden");
    els.meeting.classList.add("hidden");
    els.gameWrap.classList.remove("hidden");
    els.hud.classList.remove("hidden");
    document.body.classList.add("playing");
    els.touchControls.classList.add("active");
    els.touchControls.setAttribute("aria-hidden", "false");
    const role = state.human.isImpostor ? "Ты импостер. Устраняй экипаж." : "Ты член экипажа. Делай задачи.";
    showMessage(role, 3.5);
    updateHud();
    lastTs = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function resetJoystickKnob() {
    els.joystickKnob.style.transform = "translate(0px, 0px)";
    touch.dx = 0;
    touch.dy = 0;
    touch.pointerId = null;
  }

  function bindTouchControls() {
    const maxRadius = 38;

    const onJoyDown = (e) => {
      e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      touch.pointerId = point.identifier ?? "mouse";
      moveJoystick(point);
    };

    const onJoyMove = (e) => {
      if (touch.pointerId == null) return;
      e.preventDefault();
      let point = e;
      if (e.touches) {
        point = [...e.touches].find((t) => t.identifier === touch.pointerId) || e.touches[0];
      }
      if (!point) return;
      moveJoystick(point);
    };

    const onJoyUp = (e) => {
      if (e.touches && e.touches.length > 0) return;
      resetJoystickKnob();
    };

    function moveJoystick(point) {
      const rect = els.joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = point.clientX - cx;
      let dy = point.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, maxRadius);
      dx = (dx / len) * clamped;
      dy = (dy / len) * clamped;
      els.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      const dead = 8;
      if (clamped < dead) {
        touch.dx = 0;
        touch.dy = 0;
      } else {
        touch.dx = dx / maxRadius;
        touch.dy = dy / maxRadius;
      }
    }

    els.joystick.addEventListener("touchstart", onJoyDown, { passive: false });
    els.joystick.addEventListener("touchmove", onJoyMove, { passive: false });
    els.joystick.addEventListener("touchend", onJoyUp);
    els.joystick.addEventListener("touchcancel", onJoyUp);
    els.joystick.addEventListener("mousedown", onJoyDown);
    window.addEventListener("mousemove", (e) => {
      if (touch.pointerId !== "mouse") return;
      onJoyMove(e);
    });
    window.addEventListener("mouseup", () => {
      if (touch.pointerId === "mouse") resetJoystickKnob();
    });

    const press = (btn, on, off) => {
      const start = (e) => {
        e.preventDefault();
        btn.classList.add("pressed");
        on();
      };
      const end = (e) => {
        e.preventDefault();
        btn.classList.remove("pressed");
        off();
      };
      btn.addEventListener("touchstart", start, { passive: false });
      btn.addEventListener("touchend", end);
      btn.addEventListener("touchcancel", end);
      btn.addEventListener("mousedown", start);
      btn.addEventListener("mouseup", end);
      btn.addEventListener("mouseleave", end);
    };

    press(
      els.btnUse,
      () => {
        touch.use = true;
      },
      () => {
        touch.use = false;
      }
    );
    press(
      els.btnKill,
      () => {
        killNearest();
      },
      () => {}
    );
  }

  window.addEventListener("keydown", (e) => {
    keys.add(e.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === "KeyQ") killNearest();
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));

  bindTouchControls();
  els.startBtn.addEventListener("click", start);
  els.againBtn.addEventListener("click", start);
})();
