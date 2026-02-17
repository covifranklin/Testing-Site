(function () {
  const STORAGE_KEY = "daily-chores";

  const choreInput = document.getElementById("chore-input");
  const chorePriority = document.getElementById("chore-priority");
  const addBtn = document.getElementById("add-btn");
  const choreList = document.getElementById("chore-list");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const clearCompletedBtn = document.getElementById("clear-completed-btn");
  const resetDayBtn = document.getElementById("reset-day-btn");
  const todayDateEl = document.getElementById("today-date");

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function loadChores() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const today = getTodayKey();
    if (!data[today]) {
      data[today] = [];
    }
    return data;
  }

  function saveChores(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getTodayChores() {
    const data = loadChores();
    return data[getTodayKey()];
  }

  function setTodayChores(chores) {
    const data = loadChores();
    data[getTodayKey()] = chores;
    saveChores(data);
  }

  // Priority sort order: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  function sortChores(chores) {
    return chores.slice().sort(function (a, b) {
      // Completed items go to the bottom
      if (a.done !== b.done) return a.done ? 1 : -1;
      // Then sort by priority
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });
  }

  function updateProgress() {
    const chores = getTodayChores();
    const total = chores.length;
    const completed = chores.filter(function (c) { return c.done; }).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressBar.style.width = pct + "%";
    progressText.textContent = completed + " / " + total + " completed";

    if (total > 0 && completed === total) {
      progressBar.style.background = "#27ae60";
    } else {
      progressBar.style.background = "#4361ee";
    }
  }

  function render() {
    const chores = sortChores(getTodayChores());
    choreList.innerHTML = "";

    if (chores.length === 0) {
      var empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "No chores yet — add one above!";
      choreList.appendChild(empty);
      updateProgress();
      return;
    }

    chores.forEach(function (chore) {
      var li = document.createElement("li");
      li.className = "chore-item" + (chore.done ? " done" : "");
      li.dataset.id = chore.id;

      var checkbox = document.createElement("div");
      checkbox.className = "chore-checkbox";
      checkbox.addEventListener("click", function () {
        toggleChore(chore.id);
      });

      var text = document.createElement("span");
      text.className = "chore-text";
      text.textContent = chore.text;

      var badge = document.createElement("span");
      badge.className = "priority-badge priority-" + chore.priority;
      badge.textContent = chore.priority;

      var deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "&times;";
      deleteBtn.title = "Delete chore";
      deleteBtn.addEventListener("click", function () {
        removeChore(chore.id);
      });

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(badge);
      li.appendChild(deleteBtn);
      choreList.appendChild(li);
    });

    updateProgress();
  }

  function addChore(text, priority) {
    if (!text.trim()) return;
    var chores = getTodayChores();
    chores.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      priority: priority,
      done: false,
    });
    setTodayChores(chores);
    render();
  }

  function toggleChore(id) {
    var chores = getTodayChores();
    chores = chores.map(function (c) {
      if (c.id === id) c.done = !c.done;
      return c;
    });
    setTodayChores(chores);
    render();
  }

  function removeChore(id) {
    var chores = getTodayChores().filter(function (c) {
      return c.id !== id;
    });
    setTodayChores(chores);
    render();
  }

  function clearCompleted() {
    var chores = getTodayChores().filter(function (c) {
      return !c.done;
    });
    setTodayChores(chores);
    render();
  }

  function resetDay() {
    if (!confirm("Reset all chores for today? This cannot be undone.")) return;
    setTodayChores([]);
    render();
  }

  // Event listeners
  addBtn.addEventListener("click", function () {
    addChore(choreInput.value, chorePriority.value);
    choreInput.value = "";
    choreInput.focus();
  });

  choreInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      addChore(choreInput.value, chorePriority.value);
      choreInput.value = "";
    }
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);
  resetDayBtn.addEventListener("click", resetDay);

  // Initialize
  todayDateEl.textContent = formatDate(getTodayKey());
  render();
})();
