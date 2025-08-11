let lang = localStorage.getItem('lang') || 'en';
let coins = parseInt(localStorage.getItem('coins') || '0');
let progress = JSON.parse(localStorage.getItem('progress') || '{}');
let currentTable = 1;
let currentMultiplier = 1;
let correctAnswers = 0;
let lives = 3;
let levelMode = null;

function t(key, ...args) {
  const str = STRINGS[lang][key];
  return typeof str === 'function' ? str(...args) : str;
}

function updateTexts() {
  document.getElementById('language-toggle').textContent = lang.toUpperCase();
  document.getElementById('language-toggle').title = t('languageLabel');
  document.getElementById('welcome').textContent = t('welcome');
  document.getElementById('btn-start').textContent = t('start');
  document.getElementById('btn-learning').textContent = t('learningMode');
  document.getElementById('btn-quiz').textContent = t('quizMode');
  document.getElementById('btn-shop').textContent = t('shop');
  document.getElementById('btn-settings').textContent = t('settings');
  document.getElementById('level-back').textContent = t('back');
  document.getElementById('learning-back').textContent = t('back');
  document.getElementById('quiz-back').textContent = t('back');
  document.getElementById('shop-back').textContent = t('back');
  document.getElementById('settings-back').textContent = t('back');
  document.getElementById('select-level').textContent = t('selectLevel');
  document.getElementById('shop-title').textContent = t('shopTitle');
  document.getElementById('settings-title').textContent = t('settingsTitle');
  document.getElementById('settings-info').textContent = t('settingsInfo');
  document.getElementById('coins').textContent = t('coins', coins);
  if (!document.getElementById('shop-screen').classList.contains('hidden')) {
    renderShop();
  }
  if (!document.getElementById('level-screen').classList.contains('hidden')) {
    renderLevels(levelMode);
  }
  if (!document.getElementById('learning-screen').classList.contains('hidden')) {
    document.getElementById('learning-title').textContent = t('learnTitle', currentTable);
  }
  if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
    document.getElementById('quiz-title').textContent = t('quizTitle', currentTable);
  }
}

document.getElementById('language-toggle').addEventListener('click', () => {
  lang = lang === 'en' ? 'es' : 'en';
  localStorage.setItem('lang', lang);
  updateTexts();
});

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

document.getElementById('btn-start').addEventListener('click', () => {
  renderLevels();
  show('level-screen');
});

document.getElementById('btn-learning').addEventListener('click', () => {
  renderLevels('learn');
  show('level-screen');
});

document.getElementById('btn-quiz').addEventListener('click', () => {
  renderLevels('quiz');
  show('level-screen');
});

document.getElementById('btn-shop').addEventListener('click', () => {
  document.getElementById('coins').textContent = t('coins', coins);
  renderShop();
  show('shop-screen');
});

document.getElementById('btn-settings').addEventListener('click', () => {
  show('settings-screen');
});

document.getElementById('level-back').addEventListener('click', () => show('main-menu'));

document.getElementById('learning-back').addEventListener('click', () => show('level-screen'));

document.getElementById('quiz-back').addEventListener('click', () => show('level-screen'));

document.getElementById('shop-back').addEventListener('click', () => show('main-menu'));

document.getElementById('settings-back').addEventListener('click', () => show('main-menu'));

function renderLevels(mode) {
  levelMode = mode || null;
  const container = document.getElementById('levels');
  container.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const btn = document.createElement('button');
    const levelData = progress[i] || {};
    btn.textContent = i;
    btn.disabled = mode === 'quiz' && !levelData.learned;
    btn.addEventListener('click', () => {
      if (mode === 'quiz') {
        startQuiz(i);
      } else if (mode === 'learn') {
        startLearning(i);
      } else {
        chooseMode(i);
      }
    });
    container.appendChild(btn);
  }
}

function chooseMode(n) {
  const choice = confirm(t('learnPrompt', n));
  if (choice) {
    startLearning(n);
  } else {
    startQuiz(n);
  }
}

function startLearning(n) {
  currentTable = n;
  document.getElementById('learning-title').textContent = t('learnTitle', n);
  const lesson = document.getElementById('lesson');
  lesson.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const row = document.createElement('div');
    row.className = 'lesson-row';
    row.textContent = `${i} × ${n} = ${i * n} `;
    const visual = document.createElement('span');
    for (let g = 0; g < i; g++) {
      const group = document.createElement('span');
      group.className = 'block-group';
      for (let b = 0; b < n; b++) {
        const block = document.createElement('span');
        block.className = 'block';
        group.appendChild(block);
      }
      visual.appendChild(group);
    }
    row.appendChild(visual);
    lesson.appendChild(row);
  }
  progress[n] = progress[n] || {};
  progress[n].learned = true;
  saveProgress();
  show('learning-screen');
}

function startQuiz(n) {
  currentTable = n;
  correctAnswers = 0;
  lives = 3;
  document.getElementById('quiz-title').textContent = t('quizTitle', n);
  document.getElementById('quiz-progress').innerHTML = '';
  askQuestion();
  show('quiz-screen');
}

function askQuestion() {
  currentMultiplier = Math.floor(Math.random() * 12) + 1;
  const product = currentMultiplier * currentTable;
  document.getElementById('question').textContent = `${currentMultiplier} × ${currentTable} = ?`;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  let options = [product];
  while (options.length < 4) {
    const wrong = (Math.floor(Math.random() * 12) + 1) * currentTable;
    if (!options.includes(wrong)) options.push(wrong);
  }
  options.sort(() => Math.random() - 0.5);
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => checkAnswer(opt === product));
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(correct) {
  if (correct) {
    coins++;
    correctAnswers++;
    document.getElementById('quiz-progress').textContent = t('correct', currentMultiplier, currentTable, currentMultiplier * currentTable);
    if (correctAnswers >= 5) {
      progress[currentTable] = progress[currentTable] || {};
      progress[currentTable].learned = true;
      progress[currentTable].quizPassed = true;
      saveProgress();
      alert(t('levelComplete', currentTable));
      show('level-screen');
      return;
    }
  } else {
    lives--;
    document.getElementById('quiz-progress').textContent = t('wrong');
    if (lives <= 0) {
      alert(t('wrong'));
      show('level-screen');
      return;
    }
  }
  askQuestion();
}

const shopItems = [
  { id: 'red', nameKey: 'redNinja', cost: 5 },
  { id: 'blue', nameKey: 'blueNinja', cost: 5 }
];
let ownedItems = JSON.parse(localStorage.getItem('items') || '[]');
let activeItem = localStorage.getItem('activeItem') || '';

function renderShop() {
  const itemsDiv = document.getElementById('items');
  itemsDiv.innerHTML = '';
  shopItems.forEach(item => {
    const btn = document.createElement('button');
    const name = t(item.nameKey);
    btn.textContent = `${name} - ${item.cost}`;
    if (ownedItems.includes(item.id)) {
      btn.textContent = `${name} ✓`;
    }
    btn.addEventListener('click', () => {
      if (ownedItems.includes(item.id)) {
        activeItem = item.id;
        localStorage.setItem('activeItem', activeItem);
        alert(t('equipped', name));
      } else if (coins >= item.cost) {
        coins -= item.cost;
        ownedItems.push(item.id);
        localStorage.setItem('items', JSON.stringify(ownedItems));
        document.getElementById('coins').textContent = t('coins', coins);
        alert(t('purchased', name));
        renderShop();
      } else {
        alert(t('notEnough'));
      }
    });
    itemsDiv.appendChild(btn);
  });
}

function saveProgress() {
  localStorage.setItem('progress', JSON.stringify(progress));
  localStorage.setItem('coins', coins);
  document.getElementById('coins').textContent = t('coins', coins);
}

updateTexts();
show('main-menu');
