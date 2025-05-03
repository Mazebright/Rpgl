// === XP Threshold Tables === const attributeXPTable = Array.from({ length: 100 }, (_, i) => { if (i === 0) return 0; return Math.round(Math.pow((i - 1) * 0.9, 2.5) * 100); });

const skillXPTable = Array.from({ length: 100 }, (_, i) => { if (i === 0) return 0; return Math.round(Math.pow(i - 1, 2.5) * 125); });

function getAttributeLevel(xp) { for (let i = 1; i < attributeXPTable.length; i++) { if (xp < attributeXPTable[i]) return i - 1; } return 99; }

function getSkillLevel(xp) { for (let i = 1; i < skillXPTable.length; i++) { if (xp < skillXPTable[i]) return i - 1; } return 99; }

function xpForNextAttributeLevel(level) { return attributeXPTable[level + 1] || attributeXPTable[attributeXPTable.length - 1]; }

function xpForNextSkillLevel(level) { return skillXPTable[level + 1] || skillXPTable[skillXPTable.length - 1]; }

function switchTab(tab) { document.querySelectorAll('.tab').forEach(div => div.classList.remove('active')); document.getElementById(tab).classList.add('active'); if (tab === 'info') loadInfo(); if (tab === 'skills') loadSkills(); if (tab === 'inventory') loadInventory(); if (tab === 'actions') loadActions(); } window.switchTab = switchTab;

function loadInfo() { updateEnergy(); let updated = false; Object.keys(player.attributes).forEach(attr => { const xp = player.attributes[attr].xp; const level = getAttributeLevel(xp); const nextXP = xpForNextAttributeLevel(level); if (player.attributes[attr].level !== level) { player.attributes[attr].level = level; updated = true; player.activityLog.push(${attr} is now Level ${level}); } }); if (updated) savePlayer();

let html = <h3>${player.name} the ${player.race}</h3> <p>Health: ${player.health}</p> <p>Renown: ${player.renown}</p> <p>Energy: ${player.energy}/100</p> <h3>Attributes</h3> <table border="1" cellpadding="6" style="margin-top:10px;"> <thead><tr><th>Attribute</th><th>Level</th><th>XP</th></tr></thead><tbody>;

for (let attr in player.attributes) { const data = player.attributes[attr]; const level = data.level; const xp = data.xp; const nextXP = xpForNextAttributeLevel(level); html += <tr><td>${attr}</td><td>${level}</td><td>${xp}/${nextXP} XP</td></tr>; }

html += </tbody></table><br> <button onclick="deleteCharacter()">Delete Character</button> <button onclick="logout()">Logout</button>; document.getElementById('info').innerHTML = html; }

function loadSkills() { if (!player.skills) player.skills = {}; let skillData = Object.entries(skillDefinitions).map(([skill, attrs]) => { const xp = (player.attributes[attrs[0]].xp * 0.45) + (player.attributes[attrs[1]].xp * 0.35) + (player.attributes[attrs[2]].xp * 0.20); const level = getSkillLevel(xp); const nextXP = xpForNextSkillLevel(level); const oldLevel = player.skills[skill] || 0; if (level > oldLevel) { player.skills[skill] = level; player.activityLog.push(Skill leveled up: ${skill} is now Level ${level}!); } return { name: skill, level, xp: Math.floor(xp), nextXP }; });

skillData.sort((a, b) => a.name.localeCompare(b.name)); let html = <h3>Skills</h3> <table border="1" cellpadding="6" style="margin-top:10px;"> <thead><tr><th>Skill</th><th>Level</th><th>XP</th></tr></thead><tbody>;

skillData.forEach(skill => { html += <tr><td>${skill.name}</td><td>${skill.level}</td><td>${skill.xp}/${skill.nextXP} XP</td></tr>; });

html += '</tbody></table>'; savePlayer(); document.getElementById('skills').innerHTML = html; }

function loadInventory() { let html = <h3>Inventory</h3><ul>${player.inventory.map(item => <li>${item}</li>).join('')}</ul>; document.getElementById('inventory').innerHTML = html; }

function loadActions() { updateEnergy(); const today = new Date().toDateString();

if (player.lastTrainingDate !== today) { player.trainingsToday = 2; player.completedTaskToday = false; player.lastTrainingDate = today; player.activityLog.push("New day: Training and task limits reset."); savePlayer(); }

if (player.training && Date.now() >= player.training.end) { const attr = player.training.attribute; gainXP(attr, 50); player.activityLog.push(Completed Training '${attr}' (+50 XP)); player.training = null; savePlayer(); }

if (player.task && Date.now() >= player.task.end) { completeTask(); }

const trainings = player.trainingsToday ?? 2; let html = <h3>Training (${trainings}/2 left)</h3>;

if (player.training) { const minutes = Math.max(0, Math.ceil((player.training.end - Date.now()) / 60000)); html += <p>Training ${player.training.attribute}. Time left: ${minutes} min</p>; } else if (trainings > 0) { html += <select id="trainSelect"> + attributeList.map(attr => <option value="${attr}">${attr}</option>).join('') + </select>; html += <button onclick="startTraining()">Start Training (10 energy)</button>; } else { html += "<p>No trainings remaining today.</p>"; }

html += <h3>Daily Task</h3>; if (player.task) { const minutes = Math.max(0, Math.ceil((player.task.end - Date.now()) / 60000)); html += <p>Task '${player.task.name}' in progress. Time left: ${minutes} min</p>; } else if (!player.completedTaskToday) { html += <select id="taskSelect"> + getTodayTasks().map(t => <option value="${t.name}">${t.name}</option>).join('') + </select>; html += <button onclick="startTask()">Start Task (25 energy)</button>; } else { html += "<p>Task already completed today.</p>"; }

html += <h3>Activity Log</h3><ul>; player.activityLog.slice(-5).reverse().forEach(entry => { html += <li>${entry}</li>; }); html += </ul>;

document.getElementById('actions').innerHTML = html; }
