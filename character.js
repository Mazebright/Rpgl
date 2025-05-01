// === Character Functions ===
let player = null;

async function checkCharacter() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showPage('auth');
    return;
  }

  const { data, error } = await supabase.from('characters').select('*').eq('id', user.id).single();
  if (error || !data) {
    startCreation();
  } else {
    player = data;
    showPage('dashboard');
    switchTab('info');
  }
}

function startCreation() {
  const options = attributeList.map(attr => `<option value="${attr}">${attr}</option>`).join('');
  document.getElementById('boost1').innerHTML = options;
  document.getElementById('boost2').innerHTML = options;
  document.getElementById('boost3').innerHTML = options;
  showPage('creation');
}

async function confirmCharacter() {
  const name = document.getElementById('charName').value.trim();
  const race = document.getElementById('charRace').value;
  const boosts = [document.getElementById('boost1').value, document.getElementById('boost2').value, document.getElementById('boost3').value];

  if (!name || new Set(boosts).size < 3) {
    alert('Please enter a name and 3 different boosts.');
    return;
  }

  player = {
    name,
    race,
    attributes: {},
    skills: {},
    inventory: ['Wooden Stick'],
    gold: 10,
    renown: 1,
    health: 10,
    energy: 100,
    lastEnergyCheck: Date.now(),
    training: null,
    trainingsToday: 2,
    lastTrainingDate: new Date().toDateString(),
    task: null,
    completedTaskToday: false,
    activityLog: []
  };

  attributeList.forEach(attr => {
    player.attributes[attr] = { level: 1, xp: 0 };
  });

  boosts.forEach(attr => {
    player.attributes[attr].level = 4;
    player.attributes[attr].xp = 550;
  });

  await savePlayer();
  showPage('dashboard');
  switchTab('info');
}

async function savePlayer() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('characters').upsert({
    id: user.id,
    name: player.name,
    race: player.race,
    attributes: player.attributes,
    skills: player.skills,
    inventory: player.inventory,
    gold: player.gold,
    renown: player.renown,
    health: player.health,
    energy: player.energy,
    lastEnergyCheck: player.lastEnergyCheck,
    training: player.training,
    trainingsToday: player.trainingsToday,
    lastTrainingDate: player.lastTrainingDate,
    task: player.task,
    completedTaskToday: player.completedTaskToday,
    activityLog: player.activityLog
  });

  if (error) {
    console.error('Save Error:', error.message);
  } else {
    console.log('Character saved successfully!');
  }
}

async function deleteCharacter() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('characters').delete().eq('id', user.id);
  if (error) {
    alert('Error deleting character: ' + error.message);
  } else {
    alert('Character deleted. Logging out.');
    logout();
  }
}