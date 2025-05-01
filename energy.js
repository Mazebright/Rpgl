// === Energy and Timers ===

// Regenerate energy every 5 minutes
function updateEnergy() {
  const now = Date.now();
  const elapsed = now - (player.lastEnergyCheck || 0);
  const minutes = Math.floor(elapsed / 60000);

  if (minutes >= 5) {
    const gain = Math.floor(minutes / 5);
    if (gain > 0) {
      player.energy = Math.min(player.energy + gain, 100);
      player.lastEnergyCheck = now;
      savePlayer();
    }
  }
}

// === Training ===
function startTraining() {
  if (player.task) {
    alert("Cannot train while a task is active.");
    return;
  }

  if (player.energy < 10) {
    alert("Not enough energy to train.");
    return;
  }

  const attr = document.getElementById('trainSelect').value;

  player.energy = Math.max(player.energy - 10, 0);
  player.training = { attribute: attr, end: Date.now() + 10 * 60000 };
  player.trainingsToday = (player.trainingsToday ?? 2) - 1;

  if (!player.activityLog) player.activityLog = [];
  player.activityLog.push(`Started training ${attr}.`);

  savePlayer();
  loadActions();
}

// === Tasks ===
function startTask() {
  if (player.training) {
    alert("Cannot start a task while training is active.");
    return;
  }

  if (player.energy < 25) {
    alert("Not enough energy to start a task.");
    return;
  }

  const taskName = document.getElementById('taskSelect').value;

  player.energy = Math.max(player.energy - 25, 0);
  player.task = { name: taskName, end: Date.now() + 60 * 60000 };
  player.completedTaskToday = true;

  if (!player.activityLog) player.activityLog = [];
  player.activityLog.push(`Started task: ${taskName}.`);

  savePlayer();
  loadActions();
}

// === Daily Task Options ===
function getTodayTasks() {
  const today = new Date().toDateString();
  if (localStorage.getItem('rpglTaskDate') !== today) {
    const shuffled = allTasks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    localStorage.setItem('rpglDailyTasks', JSON.stringify(selected));
    localStorage.setItem('rpglTaskDate', today);
  }
  return JSON.parse(localStorage.getItem('rpglDailyTasks')) || [];
}

// === Timer Handling ===
setInterval(() => {
  if (!player) return;
  updateEnergy();

  // Complete Training
  if (player.training && Date.now() >= player.training.end) {
    const attr = player.training.attribute;
    player.attributes[attr].xp += 50;
    if (!player.activityLog) player.activityLog = [];
    player.activityLog.push(`Completed training ${attr}. +50 XP.`);
    player.training = null;
    savePlayer();
    loadActions();
  }

  // Complete Task
  if (player.task && Date.now() >= player.task.end) {
    const task = allTasks.find(t => t.name === player.task.name);
    if (task) {
      const modifier = 0.75 + Math.random() * 0.5;
      const combinedLevel = player.attributes[task.attr1].level + player.attributes[task.attr2].level;
      const proficiencyBonus = 1 + ((combinedLevel ** 2) / 20);

      const finalXP = Math.round(100 * modifier * proficiencyBonus);
      const finalGold = Math.round(5 * modifier * proficiencyBonus);
      const finalRenown = Math.round(2 * modifier * proficiencyBonus);

      player.attributes[task.attr1].xp += finalXP;
      player.attributes[task.attr2].xp += finalXP;
      player.gold += finalGold;
      player.renown += finalRenown;

      if (!player.activityLog) player.activityLog = [];
      player.activityLog.push(
        `Completed task: ${task.name}. +${finalGold} Gold, +${finalRenown} Renown, +${finalXP} XP to ${task.attr1} and ${task.attr2}.`
      );
    }

    player.task = null;
    savePlayer();
    loadActions();
  }
}, 60000); // Every minute