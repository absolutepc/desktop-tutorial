(() => {
  const COLORS = [
    { name: "Красный", hex: "#ff4d6d" },
    { name: "Синий", hex: "#4cc9f0" },
    { name: "Зелёный", hex: "#3ecf8e" },
    { name: "Жёлтый", hex: "#ffd166" },
    { name: "Оранжевый", hex: "#ff8a3d" },
    { name: "Бирюзовый", hex: "#2ec4b6" },
  ];

  const ROLES = {
    crewmate: {
      id: "crewmate",
      name: "Член экипажа",
      team: "Экипаж",
      teamKey: "crew",
      badge: "Э",
      short: "Экипаж",
      desc: "Твоя цель — выполнить задачи станции и вычислить импостера на голосовании.",
      tips: [
        "Делай задания у жёлтых маркеров",
        "Сообщай о телах (Действие / E)",
        "На собрании голосуй за подозрительных",
      ],
      canKill: false,
      killLabel: "",
    },
    sheriff: {
      id: "sheriff",
      name: "Шериф",
      team: "Экипаж",
      teamKey: "crew",
      badge: "Ш",
      short: "Шериф",
      desc: "Ты защищаешь экипаж. Можешь выстрелить в подозреваемого. Если ошибёшься — погибнешь сам.",
      tips: [
        "Выстрел: Q или кнопка «Выстрел»",
        "Попал в импостера — он погибает",
        "Попал в невинного — погибаешь ты",
      ],
      canKill: true,
      killLabel: "Выстрел",
    },
    engineer: {
      id: "engineer",
      name: "Инженер",
      team: "Экипаж",
      teamKey: "crew",
      badge: "И",
      short: "Инженер",
      desc: "Ты чинишь станцию быстрее остальных и видишь стрелку к ближайшей задаче.",
      tips: [
        "Задачи засчитываются быстрее",
        "Следуй за стрелкой на карте",
        "Помоги довести прогресс станции до 100%",
      ],
      canKill: false,
      killLabel: "",
    },
    impostor: {
      id: "impostor",
      name: "Импостер",
      team: "Предатели",
      teamKey: "impostor",
      badge: "П",
      short: "Импостер",
      desc: "Устраняй экипаж так, чтобы вас стало не меньше, чем живых членов команды.",
      tips: [
        "Убивай без свидетелей (Q / «Убить»)",
        "Стой у задач, чтобы выглядеть занятым",
        "Можешь сам сообщить о теле",
      ],
      canKill: true,
      killLabel: "Убить",
    },
  };

  const WALLS = [
    { x: 20, y: 20, w: 920, h: 18 },
    { x: 20, y: 502, w: 920, h: 18 },
    { x: 20, y: 20, w: 18, h: 500 },
    { x: 922, y: 20, w: 18, h: 500 },
    { x: 220, y: 20, w: 18, h: 120 },
    { x: 220, y: 200, w: 18, h: 80 },
    { x: 380, y: 140, w: 160, h: 18 },
    { x: 20, y: 260, w: 160, h: 18 },
    { x: 160, y: 260, w: 18, h: 120 },
    { x: 220, y: 340, w: 180, h: 18 },
    { x: 380, y: 340, w: 18, h: 180 },
    { x: 20, y: 380, w: 100, h: 18 },
    { x: 540, y: 20, w: 18, h: 160 },
    { x: 540, y: 240, w: 18, h: 120 },
    { x: 540, y: 420, w: 18, h: 100 },
    { x: 700, y: 140, w: 240, h: 18 },
    { x: 700, y: 140, w: 18, h: 220 },
    { x: 700, y: 420, w: 18, h: 100 },
    { x: 540, y: 300, w: 120, h: 18 },
  ];

  const ROOM_ZONES = [
    { name: "Кафе", x: 38, y: 38, w: 180, h: 210, color: "#3ecf8e" },
    { name: "Медблок", x: 38, y: 278, w: 140, h: 100, color: "#4cc9f0" },
    { name: "Реактор", x: 38, y: 400, w: 140, h: 100, color: "#ff8a3d" },
    { name: "Электрика", x: 240, y: 360, w: 140, h: 140, color: "#ffd166" },
    { name: "Админ", x: 400, y: 40, w: 140, h: 120, color: "#ff4d6d" },
    { name: "Склад", x: 400, y: 360, w: 140, h: 140, color: "#9b5de5" },
    { name: "Охрана", x: 560, y: 180, w: 130, h: 110, color: "#2ec4b6" },
    { name: "Навигация", x: 720, y: 160, w: 200, h: 240, color: "#00bbf9" },
  ];

  const WAYPOINTS = [
    { x: 120, y: 160 },
    { x: 300, y: 160 },
    { x: 460, y: 160 },
    { x: 620, y: 160 },
    { x: 800, y: 260 },
    { x: 300, y: 280 },
    { x: 460, y: 280 },
    { x: 620, y: 260 },
    { x: 100, y: 320 },
    { x: 100, y: 450 },
    { x: 300, y: 450 },
    { x: 460, y: 450 },
    { x: 620, y: 450 },
    { x: 800, y: 450 },
  ];

  const TASK_DEFS = [
    { id: "wires", type: "wires", label: "Починить провода", x: 300, y: 450, room: "Электрика", weight: 18 },
    { id: "scan", type: "hold", label: "Медсканер", x: 90, y: 320, room: "Медблок", weight: 16 },
    { id: "fuel", type: "tap", label: "Заправить двигатель", x: 90, y: 450, room: "Реактор", weight: 16 },
    { id: "chart", type: "sequence", label: "Проложить курс", x: 820, y: 250, room: "Навигация", weight: 18 },
    { id: "upload", type: "hold", label: "Загрузить данные", x: 470, y: 100, room: "Админ", weight: 16 },
    { id: "boxes", type: "tap", label: "Разобрать ящики", x: 470, y: 450, room: "Склад", weight: 16 },
  ];

  const EMERGENCY = { x: 120, y: 120, r: 28 };
  const KILL_RANGE = 46;
  const REPORT_RANGE = 52;
  const TASK_RANGE = 40;
  const PLAYER_R = 14;
  const SPEED = 150;
  const BOT_SPEED = 112;
  const KILL_CD = 11;
  const SHERIFF_CD = 14;
  const MEETING_INTRO = 4;
  const TOTAL_PLAYERS = 6;
  const STATION_GOAL = 100;

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
    cdLabel: document.getElementById("cd-label"),
    meeting: document.getElementById("meeting"),
    meetingReason: document.getElementById("meeting-reason"),
    meetingTimer: document.getElementById("meeting-timer"),
    voteGrid: document.getElementById("vote-grid"),
    meetingLog: document.getElementById("meeting-log"),
    result: document.getElementById("result"),
    resultEyebrow: document.getElementById("result-eyebrow"),
    resultTitle: document.getElementById("result-title"),
    resultDesc: document.getElementById("result-desc"),
    resultRoles: document.getElementById("result-roles"),
    startBtn: document.getElementById("start-btn"),
    againBtn: document.getElementById("again-btn"),
    touchControls: document.getElementById("touch-controls"),
    joystick: document.getElementById("joystick"),
    joystickKnob: document.getElementById("joystick-knob"),
    btnUse: document.getElementById("btn-use"),
    btnKill: document.getElementById("btn-kill"),
    roleReveal: document.getElementById("role-reveal"),
    revealCard: document.getElementById("reveal-card"),
    revealBadge: document.getElementById("reveal-badge"),
    revealTitle: document.getElementById("reveal-title"),
    revealTeam: document.getElementById("reveal-team"),
    revealDesc: document.getElementById("reveal-desc"),
    revealTips: document.getElementById("reveal-tips"),
    revealOk: document.getElementById("reveal-ok"),
    roleSideText: document.getElementById("role-side-text"),
    stationBar: document.getElementById("station-bar"),
    stationPct: document.getElementById("station-pct"),
    taskModal: document.getElementById("task-modal"),
    taskModalRoom: document.getElementById("task-modal-room"),
    taskModalTitle: document.getElementById("task-modal-title"),
    taskModalHelp: document.getElementById("task-modal-help"),
    taskModalBody: document.getElementById("task-modal-body"),
    taskCancel: document.getElementById("task-cancel"),
  };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const keys = new Set();
  const touch = { dx: 0, dy: 0, use: false, pointerId: null };
  let state = null;
  let lastTs = 0;
  let animId = 0;
  let activeMinigame = null;
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
    const nx = entity.x + dx * step;
    const ny = entity.y + dy * step;
    if (!blocked(nx, entity.y)) entity.x = nx;
    if (!blocked(entity.x, ny)) entity.y = ny;
    entity.x = Math.max(40, Math.min(920, entity.x));
    entity.y = Math.max(40, Math.min(500, entity.y));
  }

  function nearestWaypoint(from, toward) {
    let best = WAYPOINTS[0];
    let bestScore = Infinity;
    WAYPOINTS.forEach((wp) => {
      const score = dist(from, wp) + dist(wp, toward) * 0.85;
      if (score < bestScore) {
        bestScore = score;
        best = wp;
      }
    });
    return best;
  }

  function moveTowardSmart(entity, goal, dt, speed) {
    if (!goal) return;
    let target = goal;
    if (dist(entity, goal) > 90) {
      const wp = nearestWaypoint(entity, goal);
      if (dist(entity, wp) > 18) target = wp;
    }
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const len = Math.hypot(dx, dy) || 1;
    entity.facing = dx >= 0 ? 1 : -1;
    tryMove(entity, dx / len, dy / len, dt, speed);
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

  function assignRoles() {
    // Always 1 impostor, 1 sheriff, 1 engineer, rest crewmates
    const bag = ["impostor", "sheriff", "engineer", "crewmate", "crewmate", "crewmate"];
    return shuffle(bag);
  }

  function createGame() {
    const colors = shuffle(COLORS).slice(0, TOTAL_PLAYERS);
    const spawns = shuffle(spawnPoints());
    const roleIds = assignRoles();

    const players = colors.map((color, i) => {
      const role = ROLES[roleIds[i]];
      return {
        id: i,
        name: color.name,
        color: color.hex,
        x: spawns[i].x,
        y: spawns[i].y,
        alive: true,
        isBot: i !== 0,
        roleId: role.id,
        isImpostor: role.id === "impostor",
        taskProgress: 0,
        targetTask: null,
        wander: null,
        suspicion: 0,
        killCd: role.id === "sheriff" ? SHERIFF_CD : KILL_CD,
        facing: 1,
        mode: "task",
        modeT: 0,
        fakeTask: null,
        shotUsed: false,
      };
    });

    const taskPool = shuffle(TASK_DEFS);
    const humanTasks = taskPool.slice(0, 4).map((t) => ({ ...t, done: false }));

    players.forEach((p) => {
      if (p.isBot && !p.isImpostor) {
        p.botTasks = shuffle(TASK_DEFS).slice(0, 3).map((t) => ({ ...t, done: false, progress: 0 }));
      }
      if (p.isBot && p.isImpostor) {
        p.fakeTasks = shuffle(TASK_DEFS).slice(0, 4).map((t) => ({ ...t }));
      }
    });

    return {
      phase: "reveal", // reveal | play | meeting | result | task
      players,
      human: players[0],
      bodies: [],
      tasks: humanTasks,
      stationProgress: 0,
      meeting: null,
      time: 0,
      flash: 0,
      message: "",
      messageT: 0,
      camShake: 0,
      pulses: 0,
    };
  }

  function roleOf(p) {
    return ROLES[p.roleId] || ROLES.crewmate;
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

  function addStationProgress(amount) {
    state.stationProgress = Math.min(STATION_GOAL, state.stationProgress + amount);
    els.stationBar.style.transform = `scaleX(${state.stationProgress / STATION_GOAL})`;
    els.stationPct.textContent = `${Math.floor(state.stationProgress)}%`;
    checkWin();
  }

  function showRoleReveal() {
    const role = roleOf(state.human);
    els.revealCard.className = `reveal-card ${role.teamKey === "impostor" ? "impostor" : role.id}`;
    els.revealBadge.textContent = role.badge;
    els.revealTitle.textContent = role.name;
    els.revealTeam.textContent = `Команда: ${role.team}`;
    els.revealTeam.style.color = role.teamKey === "impostor" ? "#ff8aa0" : "#7be7b4";
    els.revealDesc.textContent = role.desc;
    els.revealTips.innerHTML = "";
    role.tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      els.revealTips.appendChild(li);
    });
    els.roleReveal.classList.remove("hidden");
  }

  function beginPlay() {
    els.roleReveal.classList.add("hidden");
    if (state.phase === "reveal") {
      state.phase = "play";
      showMessage(`Ты — ${roleOf(state.human).name}`, 3);
    }
    els.revealOk.textContent = "Понятно, начать";
    updateHud();
  }

  function openRoleCard(initial) {
    showRoleReveal();
    els.revealOk.textContent = initial ? "Понятно, начать" : "Закрыть";
  }

  function updateHud() {
    if (!state) return;
    const human = state.human;
    const role = roleOf(human);

    els.rolePill.textContent = role.name;
    els.rolePill.className =
      "hud-pill role-btn " + (role.teamKey === "impostor" ? "impostor" : role.id === "sheriff" ? "sheriff" : role.id === "engineer" ? "engineer" : "crewmate");
    els.taskPill.textContent = `Станция ${Math.floor(state.stationProgress)}%`;
    els.alivePill.textContent = `Живы ${alivePlayers().length}/${state.players.length}`;
    els.roleSideText.textContent = `${role.name} · ${role.team}. ${role.desc}`;

    els.taskList.innerHTML = "";
    if (human.isImpostor) {
      ["Саботируй незаметно", "Убивай без свидетелей", "Имитируй задачи"].forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        els.taskList.appendChild(li);
      });
    } else {
      state.tasks.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = `${t.done ? "✓ " : ""}${t.label} · ${t.room}`;
        if (t.done) li.classList.add("done");
        els.taskList.appendChild(li);
      });
    }

    const near = nearestInteractable();
    const useLabel = prefersTouch ? "Действие" : "E";
    if (!human.alive) {
      els.hint.textContent = "Ты выбыл. Жди собрания или конца раунда.";
    } else if (near?.type === "body") {
      els.hint.textContent = `${useLabel} — сообщить о теле`;
    } else if (near?.type === "emergency") {
      els.hint.textContent = `${useLabel} — экстренное собрание`;
    } else if (near?.type === "task" && !human.isImpostor) {
      els.hint.textContent = `${useLabel} — открыть задание`;
    } else if (role.canKill) {
      els.hint.textContent =
        human.killCd > 0
          ? `${role.killLabel} через ${human.killCd.toFixed(1)}с`
          : `${role.killLabel}: подойди и нажми ${prefersTouch ? "кнопку" : "Q"}`;
    } else {
      els.hint.textContent = "Иди к жёлтым маркерам задач";
    }

    const cdMax = human.roleId === "sheriff" ? SHERIFF_CD : KILL_CD;
    const ready = Math.max(0, 1 - human.killCd / cdMax);
    els.killBar.style.transform = `scaleX(${role.canKill ? ready : 0})`;
    els.cdLabel.textContent = role.killLabel || "Кулдаун";

    if (role.canKill && human.alive) {
      els.cooldownBlock.classList.remove("hidden");
      els.btnKill.classList.remove("hidden");
      els.btnKill.textContent = role.killLabel;
      els.btnKill.disabled = human.killCd > 0 || state.phase !== "play" || (human.roleId === "sheriff" && human.shotUsed);
    } else {
      els.cooldownBlock.classList.add("hidden");
      els.btnKill.classList.add("hidden");
    }

    els.stationBar.style.transform = `scaleX(${state.stationProgress / STATION_GOAL})`;
    els.stationPct.textContent = `${Math.floor(state.stationProgress)}%`;
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
    if (de < EMERGENCY.r + 12 && de < bestD) {
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

  function nearestAlive(from, filterFn = () => true) {
    return alivePlayers()
      .filter((p) => p.id !== from.id && filterFn(p))
      .map((p) => ({ p, d: dist(from, p) }))
      .sort((a, b) => a.d - b.d)[0];
  }

  function useAction() {
    if (!state || state.phase !== "play" || !state.human.alive) return;
    const inter = nearestInteractable();
    if (!inter) return;
    if (inter.type === "body") {
      const body = inter.ref;
      const killer = state.players.find((p) => p.id === body.killerId);
      if (killer && killer.alive) killer.suspicion += 0.85;
      if (state.human.isImpostor) state.human.suspicion += 0.15;
      alivePlayers().forEach((p) => {
        if (dist(p, body) < 140) p.suspicion += 0.1;
      });
      startMeeting(`Тело: ${body.name}`, state.human);
    } else if (inter.type === "emergency") {
      startMeeting("Экстренное собрание", state.human);
    } else if (inter.type === "task") {
      openTaskMinigame(inter.ref);
    }
  }

  function openTaskMinigame(task) {
    if (task.done || state.human.isImpostor) return;
    activeMinigame = { task };
    state.phase = "task";
    els.taskModal.classList.remove("hidden");
    els.taskModalRoom.textContent = task.room;
    els.taskModalTitle.textContent = task.label;
    els.taskModalBody.innerHTML = "";

    if (task.type === "wires") setupWires(task);
    else if (task.type === "tap") setupTap(task);
    else if (task.type === "sequence") setupSequence(task);
    else setupHold(task);
  }

  function closeTaskModal() {
    els.taskModal.classList.add("hidden");
    activeMinigame = null;
    if (state && state.phase === "task") state.phase = "play";
  }

  function completeTask(task) {
    if (task.done) return;
    task.done = true;
    const role = roleOf(state.human);
    const bonus = role.id === "engineer" ? 1.35 : 1;
    addStationProgress(task.weight * bonus);
    showMessage(`Задача выполнена: ${task.label}`);
    closeTaskModal();
    updateHud();
  }

  function setupWires(task) {
    els.taskModalHelp.textContent = "Соедини одинаковые цвета слева и справа.";
    const colors = shuffle([
      { id: "r", name: "Красный", hex: "#ff4d6d" },
      { id: "g", name: "Зелёный", hex: "#3ecf8e" },
      { id: "b", name: "Синий", hex: "#4cc9f0" },
      { id: "y", name: "Жёлтый", hex: "#ffd166" },
    ]).slice(0, 3);
    const left = shuffle(colors);
    const right = shuffle(colors);
    let selected = null;
    const matched = new Set();

    const grid = document.createElement("div");
    grid.className = "wire-grid";
    const leftCol = document.createElement("div");
    leftCol.className = "wire-side";
    const rightCol = document.createElement("div");
    rightCol.className = "wire-side";

    function render() {
      leftCol.innerHTML = "";
      rightCol.innerHTML = "";
      left.forEach((c) => {
        const btn = document.createElement("button");
        btn.className = "wire-btn" + (selected === c.id ? " selected" : "");
        btn.style.background = c.hex;
        btn.textContent = matched.has(c.id) ? "✓" : c.name;
        btn.disabled = matched.has(c.id);
        btn.onclick = () => {
          selected = c.id;
          render();
        };
        leftCol.appendChild(btn);
      });
      right.forEach((c) => {
        const btn = document.createElement("button");
        btn.className = "wire-btn";
        btn.style.background = c.hex;
        btn.textContent = matched.has(c.id) ? "✓" : c.name;
        btn.disabled = matched.has(c.id);
        btn.onclick = () => {
          if (!selected) return;
          if (selected === c.id) {
            matched.add(c.id);
            selected = null;
            if (matched.size >= colors.length) completeTask(task);
            else render();
          } else {
            selected = null;
            showMessage("Неверный провод");
            render();
          }
        };
        rightCol.appendChild(btn);
      });
    }

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    els.taskModalBody.appendChild(grid);
    render();
  }

  function setupTap(task) {
    const need = roleOf(state.human).id === "engineer" ? 6 : 8;
    let count = 0;
    els.taskModalHelp.textContent = `Нажми кнопку ${need} раз.`;
    const wrap = document.createElement("div");
    wrap.className = "tap-pad";
    const btn = document.createElement("button");
    btn.textContent = `Нажми · 0/${need}`;
    btn.onclick = () => {
      count += 1;
      btn.textContent = `Нажми · ${count}/${need}`;
      if (count >= need) completeTask(task);
    };
    wrap.appendChild(btn);
    els.taskModalBody.appendChild(wrap);
  }

  function setupHold(task) {
    const duration = roleOf(state.human).id === "engineer" ? 1.4 : 2.2;
    els.taskModalHelp.textContent = "Удерживай кнопку, пока шкала не заполнится.";
    const wrap = document.createElement("div");
    wrap.className = "tap-pad";
    const bar = document.createElement("div");
    bar.className = "progress-task";
    const fill = document.createElement("i");
    bar.appendChild(fill);
    const btn = document.createElement("button");
    btn.textContent = "Удерживать";
    let holding = false;
    let prog = 0;
    let raf = 0;
    let last = 0;

    function tick(ts) {
      if (!holding) return;
      const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
      last = ts;
      prog += dt;
      fill.style.width = `${Math.min(100, (prog / duration) * 100)}%`;
      if (prog >= duration) {
        holding = false;
        completeTask(task);
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    const startHold = (e) => {
      e.preventDefault();
      holding = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const endHold = (e) => {
      e.preventDefault();
      holding = false;
      cancelAnimationFrame(raf);
      prog = Math.max(0, prog - 0.25);
      fill.style.width = `${Math.min(100, (prog / duration) * 100)}%`;
    };

    btn.addEventListener("mousedown", startHold);
    btn.addEventListener("mouseup", endHold);
    btn.addEventListener("mouseleave", endHold);
    btn.addEventListener("touchstart", startHold, { passive: false });
    btn.addEventListener("touchend", endHold);
    wrap.appendChild(bar);
    wrap.appendChild(btn);
    els.taskModalBody.appendChild(wrap);
  }

  function setupSequence(task) {
    const len = roleOf(state.human).id === "engineer" ? 3 : 4;
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 3));
    let step = 0;
    let showing = true;
    els.taskModalHelp.textContent = "Запомни вспышки и повтори порядок.";
    const pad = document.createElement("div");
    pad.className = "seq-pad";
    const buttons = [0, 1, 2].map((i) => {
      const b = document.createElement("button");
      b.textContent = String(i + 1);
      b.disabled = true;
      b.onclick = () => {
        if (showing) return;
        if (seq[step] === i) {
          step += 1;
          if (step >= seq.length) completeTask(task);
        } else {
          step = 0;
          showMessage("Ошибка — смотри снова");
          playSeq();
        }
      };
      pad.appendChild(b);
      return b;
    });
    els.taskModalBody.appendChild(pad);

    async function playSeq() {
      showing = true;
      buttons.forEach((b) => (b.disabled = true));
      for (const idx of seq) {
        await wait(280);
        buttons[idx].classList.add("lit");
        await wait(320);
        buttons[idx].classList.remove("lit");
      }
      showing = false;
      buttons.forEach((b) => (b.disabled = false));
    }
    playSeq();
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function attackNearest() {
    const h = state.human;
    if (!h.alive || state.phase !== "play") return;
    const role = roleOf(h);
    if (!role.canKill || h.killCd > 0) return;
    if (h.roleId === "sheriff" && h.shotUsed) {
      showMessage("Выстрел уже использован");
      return;
    }

    const targetInfo = nearestAlive(h);
    if (!targetInfo || targetInfo.d > KILL_RANGE) {
      showMessage("Никого рядом");
      return;
    }
    const target = targetInfo.p;

    if (h.isImpostor) {
      doKill(h, target, "kill");
      return;
    }

    // sheriff shot
    h.shotUsed = true;
    h.killCd = SHERIFF_CD;
    if (target.isImpostor) {
      doKill(h, target, "sheriff");
      showMessage(`Шериф поразил импостера (${target.name})!`, 3);
    } else {
      // misfire: sheriff dies
      h.alive = false;
      state.bodies.push({
        x: h.x,
        y: h.y,
        color: h.color,
        name: h.name,
        id: h.id,
        killerId: h.id,
        age: 0,
      });
      state.flash = 0.3;
      showMessage(`${target.name} был невиновен. Шериф погиб.`, 3.5);
      checkWin();
    }
  }

  function doKill(killer, victim, kind = "kill") {
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
    killer.killCd = killer.roleId === "sheriff" ? SHERIFF_CD : KILL_CD;
    state.flash = 0.25;
    state.camShake = 0.35;
    if (kind === "kill") {
      // witnesses bump suspicion
      alivePlayers().forEach((p) => {
        if (p.id !== killer.id && dist(p, victim) < 100) killer.suspicion += 0.55;
      });
    }
    if (victim.id === state.human.id) showMessage("Тебя устранили...", 3);
    else if (killer.id === state.human.id && kind === "kill") showMessage(`${victim.name} устранён`);
    checkWin();
  }

  function startMeeting(reason, reporter) {
    if (state.phase !== "play" && state.phase !== "task") return;
    closeTaskModal();
    state.phase = "meeting";
    state.bodies = [];
    const votes = {};
    alivePlayers().forEach((p) => {
      votes[p.id] = null;
    });

    state.players.forEach((p) => {
      if (!p.alive) return;
      if (reason.startsWith("Тело")) p.suspicion += Math.random() * 0.35;
      if (p.isImpostor) p.suspicion += 0.2;
    });

    state.meeting = {
      reason,
      reporter,
      intro: MEETING_INTRO,
      votes,
      voted: false,
      resolved: false,
    };

    els.meeting.classList.remove("hidden");
    els.meetingReason.textContent = reason;
    els.meetingLog.textContent = reporter ? `${reporter.name} вызвал собрание.` : "Экипаж собрался.";
    renderVoteButtons();
    els.meetingTimer.textContent = `Обсуждение: ${MEETING_INTRO}с`;
  }

  function renderVoteButtons() {
    els.voteGrid.innerHTML = "";
    alivePlayers().forEach((p) => {
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
    els.meetingTimer.textContent = state.human.alive ? "Голосуй сейчас" : "Ты мёртв — ждут ботов";
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
    alivePlayers()
      .filter((p) => p.isBot)
      .forEach((bot) => {
        if (state.meeting.votes[bot.id] != null) return;
        const others = alivePlayers().filter((p) => p.id !== bot.id);
        let choice = "skip";
        if (bot.isImpostor) {
          const crews = others.filter((p) => !p.isImpostor);
          choice = Math.random() < 0.75 && crews.length ? rand(crews).id : "skip";
        } else if (bot.roleId === "sheriff") {
          const ranked = [...others].sort((a, b) => b.suspicion - a.suspicion);
          choice = ranked[0] && ranked[0].suspicion > 0.7 ? ranked[0].id : ranked[0]?.id || "skip";
          if (Math.random() < 0.25) choice = "skip";
        } else {
          const ranked = [...others].sort(
            (a, b) => b.suspicion + Math.random() * 0.4 - (a.suspicion + Math.random() * 0.4)
          );
          if (ranked[0] && ranked[0].suspicion + Math.random() > 0.6) choice = ranked[0].id;
          else if (Math.random() < 0.3) choice = rand(others).id;
          else choice = "skip";
        }
        state.meeting.votes[bot.id] = choice;
      });
  }

  function maybeResolveMeeting() {
    if (!state.meeting || state.meeting.resolved) return;
    if (!state.human.alive || state.meeting.voted) castBotVotes();
    if (alivePlayers().every((p) => state.meeting.votes[p.id] != null)) resolveMeeting();
  }

  function resolveMeeting() {
    if (state.meeting.resolved) return;
    state.meeting.resolved = true;
    const tally = {};
    Object.values(state.meeting.votes).forEach((v) => {
      const key = String(v);
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
      } else if (n === best) tie = true;
    });

    let text;
    if (tie || winner === "skip") text = "Никого не изгнали.";
    else {
      const ejected = state.players.find((p) => p.id === Number(winner));
      if (ejected?.alive) {
        ejected.alive = false;
        text = `${ejected.name} изгнан. Роль: ${roleOf(ejected).name}.`;
        if (ejected.isImpostor) {
          els.meetingLog.textContent = text;
          setTimeout(() => endGame(true, "Импостер изгнан. Экипаж победил!"), 1100);
          return;
        }
      } else text = "Голос не сработал.";
    }
    els.meetingLog.textContent = text;
    setTimeout(() => {
      els.meeting.classList.add("hidden");
      state.phase = "play";
      state.meeting = null;
      state.players.forEach((p) => {
        if (roleOf(p).canKill) p.killCd = Math.max(p.killCd, 5);
      });
      checkWin();
      updateHud();
    }, 1500);
  }

  function checkWin() {
    if (!state || state.phase === "result" || state.phase === "reveal") return;
    if (aliveImp().length === 0) {
      endGame(true, "Все импостеры устранены. Экипаж победил!");
      return;
    }
    if (aliveImp().length >= aliveCrew().length) {
      endGame(false, "Импостеры захватили станцию.");
      return;
    }
    if (state.stationProgress >= STATION_GOAL) {
      endGame(true, "Станция полностью восстановлена. Экипаж победил!");
    }
  }

  function endGame(crewWin, desc) {
    state.phase = "result";
    closeTaskModal();
    els.meeting.classList.add("hidden");
    els.result.classList.remove("hidden");
    const human = state.human;
    const humanCrew = !human.isImpostor;
    const humanWins = (humanCrew && crewWin) || (!humanCrew && !crewWin);
    els.resultEyebrow.textContent = humanWins ? "Победа" : "Поражение";
    els.resultTitle.textContent = humanWins ? "Ты победил!" : "Ты проиграл";
    els.resultDesc.textContent = desc;
    els.resultRoles.innerHTML = "";
    state.players.forEach((p) => {
      const row = document.createElement("div");
      const role = roleOf(p);
      row.innerHTML = `<span><span class="swatch" style="background:${p.color}"></span>${p.name}${
        p.id === human.id ? " (ты)" : ""
      }</span><span>${role.name}${p.alive ? "" : " · вне игры"}</span>`;
      els.resultRoles.appendChild(row);
    });
  }

  function updateBots(dt) {
    state.players.forEach((bot) => {
      if (!bot.isBot || !bot.alive || state.phase !== "play") return;
      bot.killCd = Math.max(0, bot.killCd - dt);
      bot.modeT = Math.max(0, bot.modeT - dt);

      // report bodies
      for (const body of state.bodies) {
        if (dist(bot, body) < REPORT_RANGE) {
          bot.sawBody = body;
          if (!bot.isImpostor && Math.random() < 0.035) {
            const killer = state.players.find((p) => p.id === body.killerId);
            if (killer?.alive) killer.suspicion += 1.0;
            startMeeting(`Тело: ${body.name}`, bot);
            return;
          }
          if (bot.isImpostor && Math.random() < 0.01) {
            startMeeting(`Тело: ${body.name}`, bot);
            return;
          }
        }
      }

      if (bot.isImpostor) {
        updateImpostorBot(bot, dt);
        return;
      }
      if (bot.roleId === "sheriff") {
        updateSheriffBot(bot, dt);
        return;
      }
      updateCrewBot(bot, dt);
    });
  }

  function updateImpostorBot(bot, dt) {
    const crews = aliveCrew();
    const isolated = crews
      .map((c) => ({
        c,
        d: dist(bot, c),
        witnesses: alivePlayers().filter((p) => p.id !== bot.id && p.id !== c.id && dist(p, c) < 120).length,
      }))
      .filter((x) => x.d < 200 && x.witnesses === 0)
      .sort((a, b) => a.d - b.d)[0];

    if (isolated && bot.killCd <= 0) {
      if (isolated.d <= KILL_RANGE) {
        doKill(bot, isolated.c);
        bot.mode = "flee";
        bot.modeT = 2.5;
        bot.wander = rand(WAYPOINTS);
        return;
      }
      moveTowardSmart(bot, isolated.c, dt, BOT_SPEED * 1.05);
      return;
    }

    if (bot.mode === "flee" && bot.modeT > 0) {
      if (!bot.wander || dist(bot, bot.wander) < 24) bot.wander = rand(WAYPOINTS);
      moveTowardSmart(bot, bot.wander, dt, BOT_SPEED);
      return;
    }

    // fake tasks
    if (!bot.fakeTask || Math.random() < 0.002) bot.fakeTask = rand(bot.fakeTasks || TASK_DEFS);
    if (dist(bot, bot.fakeTask) > 24) moveTowardSmart(bot, bot.fakeTask, dt, BOT_SPEED * 0.95);
    else bot.taskProgress = (bot.taskProgress || 0) + dt;
  }

  function updateSheriffBot(bot, dt) {
    const sus = alivePlayers()
      .filter((p) => p.id !== bot.id)
      .sort((a, b) => b.suspicion - a.suspicion)[0];

    if (sus && sus.suspicion > 1.2 && bot.killCd <= 0 && !bot.shotUsed && dist(bot, sus) < KILL_RANGE) {
      bot.shotUsed = true;
      if (sus.isImpostor) {
        doKill(bot, sus, "sheriff");
      } else {
        // sheriff misfires rarely with high bar - still can be wrong
        bot.alive = false;
        state.bodies.push({
          x: bot.x,
          y: bot.y,
          color: bot.color,
          name: bot.name,
          id: bot.id,
          killerId: bot.id,
          age: 0,
        });
        showMessage(`Шериф (${bot.name}) ошибся и погиб`, 2.5);
        checkWin();
      }
      return;
    }

    updateCrewBot(bot, dt);
  }

  function updateCrewBot(bot, dt) {
    if (!bot.botTasks) return;
    let task = bot.botTasks.find((t) => !t.done);
    if (!task) {
      // contribute smaller ambient progress by "maintenance"
      bot.wander = bot.wander && dist(bot, bot.wander) > 20 ? bot.wander : rand(WAYPOINTS);
      moveTowardSmart(bot, bot.wander, dt, BOT_SPEED * 0.9);
      bot.taskProgress = (bot.taskProgress || 0) + dt;
      if (bot.taskProgress > 8) {
        bot.taskProgress = 0;
        addStationProgress(3);
      }
      return;
    }

    if (dist(bot, task) > 24) {
      moveTowardSmart(bot, task, dt, BOT_SPEED);
      return;
    }

    const speed = bot.roleId === "engineer" ? 1.35 : 1;
    task.progress = (task.progress || 0) + dt * speed;
    if (task.progress > 2.8) {
      task.done = true;
      bot.taskProgress = 0;
      addStationProgress(task.weight * 0.55);
    }
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
      tryMove(h, dx / len, dy / len, dt, SPEED);
      h.facing = dx >= 0 ? 1 : -1;
    }

    h.killCd = Math.max(0, h.killCd - dt);
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
    m.auto = (m.auto || 0) + dt;
    if (!m.voted && state.human.alive && m.auto > 12) castHumanVote("skip");
    if (!state.human.alive || m.voted) maybeResolveMeeting();
  }

  function draw() {
    const shakeX = state.camShake > 0 ? (Math.random() - 0.5) * 7 : 0;
    const shakeY = state.camShake > 0 ? (Math.random() - 0.5) * 7 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    ctx.fillStyle = "#0c1526";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // room floors
    ROOM_ZONES.forEach((r) => {
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = r.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(232,238,248,0.55)";
      ctx.font = "700 12px IBM Plex Sans";
      ctx.fillText(r.name, r.x + 8, r.y + 18);
    });

    // subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    WALLS.forEach((w) => {
      ctx.fillStyle = "#2a3d5c";
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = "rgba(255,138,61,0.2)";
      ctx.fillRect(w.x, w.y, w.w, Math.min(3, w.h));
    });

    // emergency
    ctx.beginPath();
    ctx.arc(EMERGENCY.x, EMERGENCY.y, EMERGENCY.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4d6d";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffd0d8";
    ctx.stroke();
    ctx.fillStyle = "#1a0d05";
    ctx.font = "700 11px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText("SOS", EMERGENCY.x, EMERGENCY.y + 4);

    // tasks
    state.tasks.forEach((t) => {
      if (t.done || state.human.isImpostor) return;
      const pulse = 1 + Math.sin(state.time * 4 + t.x) * 0.08;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 11 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd166";
      ctx.fill();
      ctx.strokeStyle = "#fff3c4";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,243,196,0.9)";
      ctx.font = "600 10px IBM Plex Sans";
      ctx.textAlign = "center";
      ctx.fillText(t.room, t.x, t.y - 16);
    });

    // engineer arrow
    if (state.human.alive && state.human.roleId === "engineer" && !state.human.isImpostor) {
      const next = state.tasks.find((t) => !t.done);
      if (next) {
        const ang = Math.atan2(next.y - state.human.y, next.x - state.human.x);
        const ax = state.human.x + Math.cos(ang) * 34;
        const ay = state.human.y + Math.sin(ang) * 34;
        ctx.strokeStyle = "#3ecf8e";
        ctx.fillStyle = "#3ecf8e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.human.x, state.human.y - 26);
        ctx.lineTo(ax, ay - 26);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax, ay - 26);
        ctx.lineTo(ax - Math.cos(ang - 0.4) * 10, ay - 26 - Math.sin(ang - 0.4) * 10);
        ctx.lineTo(ax - Math.cos(ang + 0.4) * 10, ay - 26 - Math.sin(ang + 0.4) * 10);
        ctx.closePath();
        ctx.fill();
      }
    }

    // bodies
    state.bodies.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(-0.45);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#ff4d6d";
      ctx.font = "700 10px IBM Plex Sans";
      ctx.textAlign = "center";
      ctx.fillText("ТЕЛО", b.x, b.y - 16);
    });

    [...state.players]
      .filter((p) => p.alive)
      .sort((a, b) => a.y - b.y)
      .forEach(drawCrew);

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255,77,109,${state.flash})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (state.messageT > 0) {
      ctx.fillStyle = "rgba(10,16,28,0.8)";
      ctx.fillRect(canvas.width / 2 - 180, 14, 360, 40);
      ctx.strokeStyle = "rgba(255,138,61,0.45)";
      ctx.strokeRect(canvas.width / 2 - 180, 14, 360, 40);
      ctx.fillStyle = "#e8eef8";
      ctx.font = "600 14px IBM Plex Sans";
      ctx.textAlign = "center";
      ctx.fillText(state.message, canvas.width / 2, 40);
    }

    const inter = nearestInteractable();
    if (inter && state.human.alive && state.phase === "play") {
      const label =
        inter.type === "body" ? "Донос" : inter.type === "emergency" ? "Собрание" : "Задача";
      ctx.fillStyle = "#ffd166";
      ctx.font = "700 13px IBM Plex Sans";
      ctx.textAlign = "center";
      ctx.fillText(label, state.human.x, state.human.y - 34);
    }

    ctx.textAlign = "left";
    ctx.restore();
  }

  function drawCrew(p) {
    const x = p.x;
    const y = p.y;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.color;
    roundRect(x - 14, y - 18, 28, 34, 12);
    ctx.fillStyle = "rgba(220,245,255,0.92)";
    roundRect(x - 4, y - 10, 16, 12, 6);
    ctx.fillStyle = shade(p.color, -28);
    roundRect(x - 18, y - 8, 8, 16, 4);

    // role pip for self only
    if (p.id === state.human.id) {
      const role = roleOf(p);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = role.teamKey === "impostor" ? "#ff4d6d" : "#3ecf8e";
      ctx.beginPath();
      ctx.arc(x + 12, y - 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b1220";
      ctx.font = "700 8px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(role.badge, x + 12, y - 13);
    }

    ctx.fillStyle = "rgba(232,238,248,0.92)";
    ctx.font = "600 11px IBM Plex Sans";
    ctx.textAlign = "center";
    ctx.fillText(p.name, x, y + 30);
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
    const num = parseInt(hex.replace("#", ""), 16);
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
    closeTaskModal();
    state = createGame();
    els.menu.classList.add("hidden");
    els.result.classList.add("hidden");
    els.meeting.classList.add("hidden");
    els.gameWrap.classList.remove("hidden");
    els.hud.classList.remove("hidden");
    document.body.classList.add("playing");
    els.touchControls.classList.add("active");
    els.touchControls.setAttribute("aria-hidden", "false");
    showRoleReveal();
    els.revealOk.textContent = "Понятно, начать";
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
    const maxRadius = 34;
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
      if (e.touches) point = [...e.touches].find((t) => t.identifier === touch.pointerId) || e.touches[0];
      if (point) moveJoystick(point);
    };
    const onJoyUp = (e) => {
      if (e.touches && e.touches.length > 0) return;
      resetJoystickKnob();
    };
    function moveJoystick(point) {
      const base = els.joystick.querySelector(".joystick-base") || els.joystick;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = point.clientX - cx;
      let dy = point.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, maxRadius);
      dx = (dx / len) * clamped;
      dy = (dy / len) * clamped;
      els.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      if (clamped < 8) {
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
      if (touch.pointerId === "mouse") onJoyMove(e);
    });
    window.addEventListener("mouseup", () => {
      if (touch.pointerId === "mouse") resetJoystickKnob();
    });

    const press = (btn, on, off) => {
      const startP = (e) => {
        e.preventDefault();
        btn.classList.add("pressed");
        on();
      };
      const endP = (e) => {
        e.preventDefault();
        btn.classList.remove("pressed");
        off();
      };
      btn.addEventListener("touchstart", startP, { passive: false });
      btn.addEventListener("touchend", endP);
      btn.addEventListener("touchcancel", endP);
      btn.addEventListener("mousedown", startP);
      btn.addEventListener("mouseup", endP);
      btn.addEventListener("mouseleave", endP);
    };

    press(els.btnUse, () => useAction(), () => {});
    press(els.btnKill, () => attackNearest(), () => {});
  }

  // HUD class extras
  const styleBoost = document.createElement("style");
  styleBoost.textContent = `
    .hud-pill.sheriff { color:#fff1c2; border-color:rgba(255,209,102,.55); background:rgba(255,209,102,.14); }
    .hud-pill.engineer { color:#d7fff0; border-color:rgba(62,207,142,.45); background:rgba(62,207,142,.12); }
  `;
  document.head.appendChild(styleBoost);

  window.addEventListener("keydown", (e) => {
    keys.add(e.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyQ") attackNearest();
    if (e.code === "KeyE" || e.code === "Space") {
      if (state?.phase === "play") useAction();
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));

  bindTouchControls();
  els.startBtn.addEventListener("click", start);
  els.againBtn.addEventListener("click", start);
  els.revealOk.addEventListener("click", beginPlay);
  els.taskCancel.addEventListener("click", closeTaskModal);
  els.rolePill.addEventListener("click", () => {
    if (!state || state.phase === "reveal") return;
    openRoleCard(false);
  });
})();
