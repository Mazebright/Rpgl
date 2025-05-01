// === Global Tab Switcher ===
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(div => div.classList.remove('active'));
  document.getElementById(tab).classList.add('active');

  if (tab === 'info') loadInfo();
  if (tab === 'skills') loadSkills();
  if (tab === 'inventory') loadInventory();
  if (tab === 'actions') loadActions();
}
window.switchTab = switchTab;

// === Constants ===
const attributeList = [
  "Charisma", "Dexterity", "Endurance", "Intelligence",
  "Knowledge", "Nature", "Strength", "Willpower"
];

const allTasks = [
  { name: "Help lumberjacks carry timber", attr1: "Strength", attr2: "Endurance" },
  { name: "Tend to livestock", attr1: "Knowledge", attr2: "Nature" },
  { name: "Transcribe old scrolls", attr1: "Knowledge", attr2: "Intelligence" },
  { name: "Barter with travelling merchants for village necessities", attr1: "Charisma", attr2: "Intelligence" },
  { name: "Weave linen", attr1: "Dexterity", attr2: "Willpower" }
];

let sortMode = "alphabetical";
let skillSortMode = "alphabetical";

// === XP Utility ===
function cumulativeXPNeeded(level) {
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += 100 + (i - 1) * 150;
  }
  return xp;
}

// === Load Info Tab ===
function loadInfo() {
  updateEnergy();
  let updated = false;

  Object.keys(player.attributes).forEach(attr => {
    const totalXP = player.attributes[attr].xp;
    let level = 1;
    while (totalXP >= cumulativeXPNeeded(level + 1)) level++;
    if (player.attributes[attr].level !== level) {
      player.attributes[attr].level = level;
      updated = true;
      if (!player.activityLog) player.activityLog = [];
      player.activityLog.push(`Attribute leveled up: ${attr} is now Level ${level}!`);
    }
  });

  if (updated) savePlayer();

  let html = `<h3>${player.name} the ${player.race}</h3>
              <p>Health: ${player.health}</p>
              <p>Renown: ${player.renown}</p>
              <p>Energy: ${player.energy}/100</p>
              <h3>Attributes</h3>
              <label for="sortSelect">Sort by:</label>
              <select id="sortSelect" onchange="loadInfo()">
                <option value="alphabetical" ${sortMode === "alphabetical" ? "selected" : ""}>A–Z</option>
                <option value="level" ${sortMode === "level" ? "selected" : ""}>Level (desc)</option>
              </select>
              <table border="1" cellpadding="6" style="margin-top:10px;">
              <thead><tr><th>Attribute</th><th>Level</th><th>XP</th></tr></thead><tbody>`;

  let attributes = Object.entries(player.attributes).map(([name, data]) => {
    const level = data.level;
    const xp = data.xp;
    const nextXP = cumulativeXPNeeded(level + 1);
    return { name, level, xp, nextXP };
  });

  if (document.getElementById("sortSelect")) {
    sortMode = document.getElementById("sortSelect").value;
  }

  if (sortMode === "level") {
    attributes.sort((a, b) => b.level - a.level);
  } else {
    attributes.sort((a, b) => a.name.localeCompare(b.name));
  }

  attributes.forEach(attr => {
    html += `<tr><td>${attr.name}</td><td>${attr.level}</td><td>${attr.xp}/${attr.nextXP} XP</td></tr>`;
  });

  html += `</tbody></table><br>
           <button onclick="deleteCharacter()">Delete Character</button>
           <button onclick="logout()">Logout</button>`;

  document.getElementById('info').innerHTML = html;
}

// === Load Skills Tab ===
function loadSkills() {
  const skillDefinitions = {
    "Alchemy": ["Knowledge", "Nature", "Intelligence"],
    "Armed Combat": ["Strength", "Dexterity", "Endurance"],
    "Beast Taming": ["Nature", "Charisma", "Willpower"],
    "Crafting": ["Knowledge", "Dexterity", "Nature"],
    "Defense": ["Strength", "Endurance", "Dexterity"],
    "Enchanting": ["Knowledge", "Intelligence", "Dexterity"],
    "Elemental Magic": ["Knowledge", "Intelligence", "Willpower"],
    "Farming": ["Nature", "Endurance", "Knowledge"],
    "Hand to Hand": ["Strength", "Dexterity", "Willpower"],
    "Healing Magic": ["Knowledge", "Nature", "Willpower"],
    "Herbalism": ["Nature", "Knowledge", "Dexterity"],
    "Illusion Magic": ["Intelligence", "Charisma", "Willpower"],
    "Intimidation": ["Charisma", "Strength", "Willpower"],
    "Leadership": ["Charisma", "Intelligence", "Endurance"],
    "Lockpicking": ["Dexterity", "Intelligence", "Knowledge"],
    "Necromancy": ["Knowledge", "Willpower", "Intelligence"],
    "Persuasion": ["Charisma", "Intelligence", "Willpower"],
    "Stealth": ["Dexterity", "Endurance", "Intelligence"],
    "Survival": ["Nature", "Endurance", "Dexterity"],
    "Thrown Weapons": ["Dexterity", "Strength", "Endurance"],
    "Archery": ["Dexterity", "Intelligence", "Strength"]
  };

  if (!player.skills) player.skills = {};

  let skillData = Object.entries(skillDefinitions).map(([skill, attrs]) => {
    const xp = (player.attributes[attrs[0]].xp * 0.45) +
               (player.attributes[attrs[1]].xp * 0.35) +
               (player.attributes[attrs[2]].xp * 0.20);
    const level = Math.floor(Math.sqrt(xp) / 10);
    const nextXP = (level + 1) * (level + 1) * 100;
    const oldLevel = player.skills[skill] || 0;

    if (level > oldLevel) {
      player.skills[skill] = level;
      if (!player.activityLog) player.activityLog = [];
      player.activityLog.push(`Skill leveled up: ${skill} is now Level ${level}!`);
    }

    return { name: skill, level, xp: Math.floor(xp), nextXP };
  });

  if (document.getElementById("skillSortSelect")) {
    skillSortMode = document.getElementById("skillSortSelect").value;
  }

  if (skillSortMode === "level") {
    skillData.sort((a, b) => b.level - a.level);
  } else {
    skillData.sort((a, b) => a.name.localeCompare(b.name));
  }

  let html = `<h3>Skills</h3>
              <label for="skillSortSelect">Sort by:</label>
              <select id="skillSortSelect" onchange="loadSkills()">
                <option value="alphabetical" ${skillSortMode === "alphabetical" ? "selected" : ""}>A–Z</option>
                <option value="level" ${skillSortMode === "level" ? "selected" : ""}>Level (desc)</option>
              </select>
              <table border="1" cellpadding="6" style="margin-top:10px;">
              <thead><tr><th>Skill</th><th>Level</th><th>XP</th></tr></thead><tbody>`;

  skillData.forEach(skill => {
    html += `<tr><td>${skill.name}</td><td>${skill.level}</td><td>${skill.xp}/${skill.nextXP} XP</td></tr>`;
  });

  html += '</tbody></table>';
  savePlayer();
  document.getElementById('skills').innerHTML = html;
}

// === Load Inventory Tab ===
function loadInventory() {
  let html = `<h3>Inventory</h3><ul>${player.inventory.map(item => `<li>${item}</li>`).join('')}</ul>`;
  document.getElementById('inventory').innerHTML = html;
}

// === Load Actions Tab ===
function loadActions() {
  updateEnergy();

  const today = new Date().toDateString();
  if (player.lastTrainingDate !== today) {
    player.trainingsToday = 2;
    player.completedTaskToday = false;
    player.lastTrainingDate = today;
    if (!player.activityLog) player.activityLog = [];
    player.activityLog.push("A new day begins. Task and training limits reset.");
    savePlayer();
  }

  const trainings = player.trainingsToday ?? 2;
  let html = `<h3>Training (${trainings}/2 left)</h3>`;

  if (player.training) {
    const minutes = Math.ceil((player.training.end - Date.now()) / 60000);
    html += `<p>Training ${player.training.attribute}. Time left: ${minutes} min</p>`;
  } else if (trainings > 0) {
    html += `<select id="trainSelect">` + attributeList.map(attr => `<option value="${attr}">${attr}</option>`).join('') + `</select>`;
    html += `<button onclick="startTraining()">Start Training (10 energy)</button>`;
  } else {
    html += "<p>No trainings remaining today.</p>";
  }

  html += `<h3>Daily Task</h3>`;
  if (player.task) {
    const minutes = Math.ceil((player.task.end - Date.now()) / 60000);
    html += `<p>Task '${player.task.name}' in progress. Time left: ${minutes} min</p>`;
  } else if (!player.completedTaskToday) {
    html += `<select id="taskSelect">`;
    getTodayTasks().forEach(task => {
      html += `<option value="${task.name}">${task.name}</option>`;
    });
    html += `</select><button onclick="startTask()">Start Task (25 energy)</button>`;
  } else {
    html += "<p>Task already completed today.</p>";
  }

  html += `<h3>Activity Log</h3><ul>`;
  const log = (player.activityLog || []);
  log.slice(-5).reverse().forEach(entry => {
    html += `<li>${entry}</li>`;
  });
  html += `</ul>`;

  document.getElementById('actions').innerHTML = html;
}