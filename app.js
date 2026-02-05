(function () {
  "use strict";

  // ── State ──
  let totalScore = 0;

  // ── Navigation ──
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

  document.querySelectorAll(".exercise-card").forEach((card) => {
    card.addEventListener("click", () => {
      const exercise = card.dataset.exercise;
      showScreen(exercise + "-screen");
      if (exercise === "pattern") patternNew();
      if (exercise === "scramble") scrambleNew();
    });
  });

  document.querySelectorAll(".back-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showScreen(btn.dataset.target);
      stopAllTimers();
    });
  });

  function addScore(points) {
    totalScore += points;
    document.getElementById("total-score").textContent = "Total Score: " + totalScore;
  }

  // ── Timers ──
  let activeTimers = [];

  function stopAllTimers() {
    activeTimers.forEach((t) => clearInterval(t));
    activeTimers = [];
  }

  function startCountdown(elementId, seconds, onEnd) {
    const el = document.getElementById(elementId);
    let remaining = seconds;
    el.textContent = remaining + "s";
    el.classList.remove("warning");

    const id = setInterval(() => {
      remaining--;
      el.textContent = remaining + "s";
      if (remaining <= 5) el.classList.add("warning");
      if (remaining <= 0) {
        clearInterval(id);
        onEnd();
      }
    }, 1000);
    activeTimers.push(id);
    return id;
  }

  // ── Utility ──
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Helper: show feedback then clear
  function flash(el, text, className, duration) {
    el.textContent = text;
    el.className = "feedback " + className;
    setTimeout(() => {
      el.textContent = "";
      el.className = "feedback";
    }, duration || 1200);
  }

  // ============================
  //  1. MATH QUICK FIRE
  // ============================
  const mathProblem = document.getElementById("math-problem");
  const mathAnswer = document.getElementById("math-answer");
  const mathSubmit = document.getElementById("math-submit");
  const mathFeedback = document.getElementById("math-feedback");
  const mathScoreEl = document.getElementById("math-score");
  const mathStart = document.getElementById("math-start");

  let mathCorrectAnswer = 0;
  let mathScore = 0;
  let mathActive = false;

  function generateMathProblem() {
    const ops = ["+", "-", "\u00d7", "\u00f7"];
    const op = ops[rand(0, 3)];
    let a, b, answer;

    switch (op) {
      case "+":
        a = rand(2, 99);
        b = rand(2, 99);
        answer = a + b;
        break;
      case "-":
        a = rand(10, 99);
        b = rand(2, a);
        answer = a - b;
        break;
      case "\u00d7":
        a = rand(2, 12);
        b = rand(2, 12);
        answer = a * b;
        break;
      case "\u00f7":
        b = rand(2, 12);
        answer = rand(2, 12);
        a = b * answer;
        break;
    }

    mathProblem.textContent = a + " " + op + " " + b;
    mathCorrectAnswer = answer;
    mathAnswer.value = "";
    mathAnswer.focus();
  }

  function mathCheck() {
    if (!mathActive) return;
    const val = parseInt(mathAnswer.value, 10);
    if (isNaN(val)) return;

    if (val === mathCorrectAnswer) {
      mathScore++;
      mathScoreEl.textContent = mathScore;
      addScore(1);
      flash(mathFeedback, "Correct!", "correct", 600);
    } else {
      flash(mathFeedback, "Nope! " + mathCorrectAnswer, "wrong", 800);
    }
    generateMathProblem();
  }

  mathSubmit.addEventListener("click", mathCheck);
  mathAnswer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") mathCheck();
  });

  mathStart.addEventListener("click", () => {
    mathScore = 0;
    mathScoreEl.textContent = 0;
    mathActive = true;
    mathStart.style.display = "none";
    mathSubmit.style.display = "";
    mathAnswer.style.display = "";
    generateMathProblem();

    startCountdown("math-timer", 30, () => {
      mathActive = false;
      mathProblem.textContent = "Time's up! Score: " + mathScore;
      mathAnswer.style.display = "none";
      mathSubmit.style.display = "none";
      mathStart.style.display = "";
      mathStart.textContent = "Play Again";
    });
  });

  // Hide input/submit until started
  mathAnswer.style.display = "none";
  mathSubmit.style.display = "none";

  // ============================
  //  2. PATTERN RECOGNITION
  // ============================
  const patternSequence = document.getElementById("pattern-sequence");
  const patternAnswer = document.getElementById("pattern-answer");
  const patternSubmit = document.getElementById("pattern-submit");
  const patternFeedback = document.getElementById("pattern-feedback");
  const patternScoreEl = document.getElementById("pattern-score");
  const patternNext = document.getElementById("pattern-next");

  let patternCorrect = 0;
  let patternScore = 0;

  function patternNew() {
    patternFeedback.textContent = "";
    patternFeedback.className = "feedback";
    patternAnswer.value = "";

    // Generate a pattern type
    const type = rand(0, 3);
    let nums = [];
    let missingIdx;
    let missingVal;

    switch (type) {
      case 0: {
        // Arithmetic: a, a+d, a+2d, ...
        const a = rand(1, 20);
        const d = rand(2, 8);
        for (let i = 0; i < 6; i++) nums.push(a + d * i);
        break;
      }
      case 1: {
        // Geometric-ish: multiply by factor
        const a = rand(1, 5);
        const f = rand(2, 3);
        let v = a;
        for (let i = 0; i < 6; i++) {
          nums.push(v);
          v *= f;
        }
        break;
      }
      case 2: {
        // Squares
        const start = rand(1, 5);
        for (let i = 0; i < 6; i++) nums.push((start + i) * (start + i));
        break;
      }
      case 3: {
        // Add-increasing: +1, +2, +3, +4 ...
        const a = rand(1, 10);
        nums.push(a);
        for (let i = 1; i < 6; i++) nums.push(nums[i - 1] + i);
        break;
      }
    }

    missingIdx = rand(1, 4); // don't hide first or last for clarity
    missingVal = nums[missingIdx];
    patternCorrect = missingVal;

    // Render
    patternSequence.innerHTML = "";
    nums.forEach((n, i) => {
      const div = document.createElement("div");
      div.className = "seq-num" + (i === missingIdx ? " missing" : "");
      div.textContent = i === missingIdx ? "?" : n;
      patternSequence.appendChild(div);
    });

    patternAnswer.focus();
  }

  function patternCheck() {
    const val = parseInt(patternAnswer.value, 10);
    if (isNaN(val)) return;

    if (val === patternCorrect) {
      patternScore++;
      patternScoreEl.textContent = patternScore;
      addScore(2);
      flash(patternFeedback, "Correct! +2", "correct");
    } else {
      flash(patternFeedback, "Wrong! Answer: " + patternCorrect, "wrong");
    }
    setTimeout(patternNew, 1000);
  }

  patternSubmit.addEventListener("click", patternCheck);
  patternAnswer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") patternCheck();
  });
  patternNext.addEventListener("click", patternNew);

  // ============================
  //  3. WORD SCRAMBLE
  // ============================
  const WORDS = [
    { word: "BRAIN", hint: "Inside your skull" },
    { word: "THINK", hint: "Use your mind" },
    { word: "LOGIC", hint: "Reasoning skill" },
    { word: "PUZZLE", hint: "A problem to solve" },
    { word: "FOCUS", hint: "Concentration" },
    { word: "MEMORY", hint: "Recall ability" },
    { word: "CLEVER", hint: "Quick-witted" },
    { word: "RIDDLE", hint: "A tricky question" },
    { word: "WISDOM", hint: "Deep knowledge" },
    { word: "QUARTZ", hint: "A mineral" },
    { word: "PLANET", hint: "Earth is one" },
    { word: "MARKET", hint: "Where you buy things" },
    { word: "JUNGLE", hint: "Dense tropical forest" },
    { word: "KNIGHT", hint: "Medieval warrior" },
    { word: "BRIDGE", hint: "Crosses a river" },
    { word: "SILVER", hint: "A shiny metal" },
    { word: "CASTLE", hint: "A fortified building" },
    { word: "GARDEN", hint: "Grow flowers here" },
    { word: "FROZEN", hint: "Very cold" },
    { word: "PYTHON", hint: "A snake or language" },
    { word: "CIPHER", hint: "Secret code" },
    { word: "BREEZE", hint: "Gentle wind" },
    { word: "TROPHY", hint: "Winner's prize" },
    { word: "PIRATE", hint: "Sails the seas" },
    { word: "ROCKET", hint: "Goes to space" },
  ];

  const scrambleWord = document.getElementById("scramble-word");
  const scrambleHint = document.getElementById("scramble-hint");
  const scrambleAnswer = document.getElementById("scramble-answer");
  const scrambleSubmit = document.getElementById("scramble-submit");
  const scrambleFeedback = document.getElementById("scramble-feedback");
  const scrambleScoreEl = document.getElementById("scramble-score");
  const scrambleHintBtn = document.getElementById("scramble-hint-btn");
  const scrambleNextBtn = document.getElementById("scramble-next");

  let scrambleTarget = "";
  let scrambleScore = 0;
  let scrambleHintText = "";

  function scrambleNew() {
    scrambleFeedback.textContent = "";
    scrambleFeedback.className = "feedback";
    scrambleAnswer.value = "";
    scrambleHint.textContent = "";

    const entry = WORDS[rand(0, WORDS.length - 1)];
    scrambleTarget = entry.word;
    scrambleHintText = entry.hint;

    // Scramble until different from original
    let scrambled = scrambleTarget;
    let attempts = 0;
    while (scrambled === scrambleTarget && attempts < 20) {
      scrambled = shuffle(scrambleTarget.split("")).join("");
      attempts++;
    }

    scrambleWord.textContent = scrambled;
    scrambleAnswer.focus();
  }

  function scrambleCheck() {
    const val = scrambleAnswer.value.trim().toUpperCase();
    if (!val) return;

    if (val === scrambleTarget) {
      scrambleScore++;
      scrambleScoreEl.textContent = scrambleScore;
      addScore(2);
      flash(scrambleFeedback, "Correct! +2", "correct");
      setTimeout(scrambleNew, 1000);
    } else {
      flash(scrambleFeedback, "Not quite, try again!", "wrong");
    }
  }

  scrambleSubmit.addEventListener("click", scrambleCheck);
  scrambleAnswer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") scrambleCheck();
  });
  scrambleHintBtn.addEventListener("click", () => {
    scrambleHint.textContent = "Hint: " + scrambleHintText;
  });
  scrambleNextBtn.addEventListener("click", scrambleNew);

  // ============================
  //  4. MEMORY CHALLENGE
  // ============================
  const memoryDisplay = document.getElementById("memory-display");
  const memoryAnswer = document.getElementById("memory-answer");
  const memorySubmit = document.getElementById("memory-submit");
  const memoryFeedback = document.getElementById("memory-feedback");
  const memoryScoreEl = document.getElementById("memory-score");
  const memoryLevelEl = document.getElementById("memory-level");
  const memoryStart = document.getElementById("memory-start");
  const memoryInstruction = document.getElementById("memory-instruction");

  let memoryNums = [];
  let memoryScore = 0;
  let memoryLevel = 3;

  function memoryGenerate() {
    memoryNums = [];
    for (let i = 0; i < memoryLevel; i++) {
      memoryNums.push(rand(0, 9));
    }
  }

  function memoryShowNumbers() {
    memoryFeedback.textContent = "";
    memoryFeedback.className = "feedback";
    memoryGenerate();

    // Show numbers
    memoryDisplay.innerHTML = "";
    memoryNums.forEach((n) => {
      const div = document.createElement("div");
      div.className = "mem-num";
      div.textContent = n;
      memoryDisplay.appendChild(div);
    });

    memoryInstruction.textContent = "Memorize these numbers!";
    memoryStart.style.display = "none";
    memoryAnswer.style.display = "none";
    memorySubmit.style.display = "none";

    // Hide after delay based on level
    const showTime = 1200 + memoryLevel * 400;
    setTimeout(() => {
      // Hide the numbers
      document.querySelectorAll(".mem-num").forEach((el) => {
        el.classList.add("hidden");
      });
      memoryInstruction.textContent = "Now type the numbers you saw (no spaces):";
      memoryAnswer.style.display = "";
      memorySubmit.style.display = "";
      memoryAnswer.value = "";
      memoryAnswer.focus();
    }, showTime);
  }

  function memoryCheck() {
    const val = memoryAnswer.value.trim();
    const correct = memoryNums.join("");

    if (val === correct) {
      memoryScore++;
      memoryScoreEl.textContent = memoryScore;
      addScore(memoryLevel);
      memoryLevel++;
      memoryLevelEl.textContent = memoryLevel;
      flash(memoryFeedback, "Correct! Level up! +" + (memoryLevel - 1), "correct");
    } else {
      if (memoryLevel > 3) memoryLevel--;
      memoryLevelEl.textContent = memoryLevel;
      flash(memoryFeedback, "Wrong! It was " + correct, "wrong");
    }

    memoryAnswer.style.display = "none";
    memorySubmit.style.display = "none";
    memoryDisplay.innerHTML = "";
    memoryStart.style.display = "";
    memoryStart.textContent = "Next Round";
  }

  memorySubmit.addEventListener("click", memoryCheck);
  memoryAnswer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") memoryCheck();
  });
  memoryStart.addEventListener("click", memoryShowNumbers);

  // ============================
  //  5. STROOP TEST
  // ============================
  const COLORS = [
    { name: "red", hex: "#e74c3c" },
    { name: "blue", hex: "#3498db" },
    { name: "green", hex: "#2ecc71" },
    { name: "yellow", hex: "#f1c40f" },
    { name: "purple", hex: "#9b59b6" },
    { name: "orange", hex: "#e67e22" },
  ];

  const stroopWord = document.getElementById("stroop-word");
  const stroopOptions = document.getElementById("stroop-options");
  const stroopFeedback = document.getElementById("stroop-feedback");
  const stroopScoreEl = document.getElementById("stroop-score");
  const stroopStart = document.getElementById("stroop-start");

  let stroopCorrectColor = "";
  let stroopScore = 0;
  let stroopActive = false;

  function stroopGenerate() {
    if (!stroopActive) return;

    // Pick a word (color name) and a DIFFERENT display color
    const wordIdx = rand(0, COLORS.length - 1);
    let colorIdx = rand(0, COLORS.length - 1);
    while (colorIdx === wordIdx) colorIdx = rand(0, COLORS.length - 1);

    const word = COLORS[wordIdx].name;
    const displayColor = COLORS[colorIdx];

    stroopWord.textContent = word;
    stroopWord.style.color = displayColor.hex;
    stroopCorrectColor = displayColor.name;

    // Generate 4 options including the correct one
    const optionSet = new Set([displayColor.name]);
    while (optionSet.size < 4) {
      optionSet.add(COLORS[rand(0, COLORS.length - 1)].name);
    }

    const options = shuffle([...optionSet]);
    stroopOptions.innerHTML = "";
    options.forEach((colorName) => {
      const btn = document.createElement("button");
      btn.className = "stroop-btn";
      btn.textContent = colorName;
      btn.addEventListener("click", () => stroopCheck(colorName));
      stroopOptions.appendChild(btn);
    });
  }

  function stroopCheck(chosen) {
    if (!stroopActive) return;

    if (chosen === stroopCorrectColor) {
      stroopScore++;
      stroopScoreEl.textContent = stroopScore;
      addScore(1);
      flash(stroopFeedback, "Correct!", "correct", 500);
    } else {
      flash(stroopFeedback, "Wrong! It was " + stroopCorrectColor, "wrong", 700);
    }
    setTimeout(stroopGenerate, 400);
  }

  stroopStart.addEventListener("click", () => {
    stroopScore = 0;
    stroopScoreEl.textContent = 0;
    stroopActive = true;
    stroopStart.style.display = "none";
    stroopGenerate();

    startCountdown("stroop-timer", 30, () => {
      stroopActive = false;
      stroopWord.textContent = "Time's up! Score: " + stroopScore;
      stroopWord.style.color = "var(--text)";
      stroopOptions.innerHTML = "";
      stroopStart.style.display = "";
      stroopStart.textContent = "Play Again";
    });
  });
})();
