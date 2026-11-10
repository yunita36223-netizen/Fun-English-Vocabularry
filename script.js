/* ================= DATA ================= */
const WORDS = [
  { emoji: '⏰', en: 'Wake up',        id: 'Bangun tidur' },
  { emoji: '🪥', en: 'Brush teeth',    id: 'Menyikat gigi' },
  { emoji: '🛁', en: 'Take a bath',    id: 'Mandi' },
  { emoji: '🍳', en: 'Eat breakfast',  id: 'Sarapan' },
  { emoji: '🏫', en: 'Go to school',   id: 'Pergi ke sekolah' },
  { emoji: '📖', en: 'Study',          id: 'Belajar' },
  { emoji: '⚽', en: 'Play',           id: 'Bermain' },
  { emoji: '🍱', en: 'Eat lunch',      id: 'Makan siang' },
  { emoji: '✏️', en: 'Do homework',    id: 'Mengerjakan PR' },
  { emoji: '📺', en: 'Watch TV',       id: 'Menonton TV' },
  { emoji: '🍽️', en: 'Have dinner',    id: 'Makan malam' },
  { emoji: '🛏️', en: 'Go to bed',      id: 'Tidur' }
];

const QUIZ = [
  { q: 'What do you do in the morning when the alarm rings?', options: ['Wake up', 'Go to bed', 'Have dinner'], answer: 'Wake up' },
  { q: 'Apa bahasa Inggris dari "Menyikat gigi"?', options: ['Take a bath', 'Brush teeth', 'Study'], answer: 'Brush teeth' },
  { q: 'You eat food at 7 AM. It is...', options: ['Eat breakfast', 'Have dinner', 'Eat lunch'], answer: 'Eat breakfast' },
  { q: 'Apa arti "Do homework"?', options: ['Bermain', 'Menonton TV', 'Mengerjakan PR'], answer: 'Mengerjakan PR' },
  { q: 'Before sleeping at night, you...', options: ['Go to bed', 'Go to school', 'Eat breakfast'], answer: 'Go to bed' }
];

/* ================= HELPERS ================= */
const $ = (id) => document.getElementById(id);
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* ================= NAVIGATION ================= */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('is-visible', p.id === id));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('is-active', b.dataset.target === id));
  window.scrollTo(0, 0);
  if (id === 'practice') startPractice();
  if (id === 'game') startGame();
  if (id === 'quiz') startQuiz();
}
document.querySelectorAll('[data-target]').forEach(el =>
  el.addEventListener('click', () => showPage(el.dataset.target)));

/* ================= VOCABULARY ================= */
const PER_PAGE = 6;
let vocabPage = 0;
const totalVocabPages = Math.ceil(WORDS.length / PER_PAGE);

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function renderVocab() {
  const grid = $('vocab-grid');
  grid.innerHTML = '';
  WORDS.slice(vocabPage * PER_PAGE, (vocabPage + 1) * PER_PAGE).forEach(w => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="emoji">${w.emoji}</div>
      <div class="en">${w.en}</div>
      <div class="id">${w.id}</div>
      <button class="speak">🔊 Listen</button>`;
    card.querySelector('.speak').addEventListener('click', () => speak(w.en));
    grid.appendChild(card);
  });
  $('vocab-info').textContent = `Page ${vocabPage + 1} of ${totalVocabPages}`;
  $('vocab-back').disabled = vocabPage === 0;
  $('vocab-next').disabled = vocabPage === totalVocabPages - 1;
  $('vocab-back').style.opacity = vocabPage === 0 ? .4 : 1;
  $('vocab-next').style.opacity = vocabPage === totalVocabPages - 1 ? .4 : 1;
}
$('vocab-back').addEventListener('click', () => { if (vocabPage > 0) { vocabPage--; renderVocab(); } });
$('vocab-next').addEventListener('click', () => { if (vocabPage < totalVocabPages - 1) { vocabPage++; renderVocab(); } });

/* ================= PRACTICE ================= */
const PRACTICE_TOTAL = 4;
let practiceItems = [], practiceIndex = 0;

function startPractice() {
  practiceItems = shuffle(WORDS).slice(0, PRACTICE_TOTAL);
  practiceIndex = 0;
  renderPractice();
}

function renderPractice() {
  const item = practiceItems[practiceIndex];
  $('practice-count').textContent = `Question ${practiceIndex + 1}/${PRACTICE_TOTAL}`;
  $('practice-bar').style.width = ((practiceIndex + 1) / PRACTICE_TOTAL * 100) + '%';
  $('practice-media').textContent = item.emoji;
  $('practice-question').textContent = 'What is this activity in English?';
  $('practice-feedback').hidden = true;
  $('practice-next').hidden = true;

  const wrongs = shuffle(WORDS.filter(w => w.en !== item.en)).slice(0, 2).map(w => w.en);
  const box = $('practice-options');
  box.innerHTML = '';
  shuffle([item.en, ...wrongs]).forEach(opt => {
    const b = document.createElement('button');
    b.className = 'option';
    b.textContent = opt;
    b.addEventListener('click', () => answerPractice(b, opt, item.en));
    box.appendChild(b);
  });
}

function answerPractice(btn, chosen, correct) {
  document.querySelectorAll('#practice-options .option').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
  });
  const fb = $('practice-feedback');
  if (chosen === correct) {
    fb.textContent = '🎉 Correct! Great job!';
  } else {
    btn.classList.add('wrong');
    fb.textContent = `❌ Not quite. The answer is "${correct}".`;
  }
  fb.hidden = false;
  $('practice-next').textContent = practiceIndex === PRACTICE_TOTAL - 1 ? 'Finish' : 'Next';
  $('practice-next').hidden = false;
}

$('practice-next').addEventListener('click', () => {
  if (practiceIndex < PRACTICE_TOTAL - 1) { practiceIndex++; renderPractice(); }
  else showPage('game');
});

/* ================= GAME ================= */
let selectedEn = null, matchedCount = 0;
const GAME_PAIRS = 5;

function startGame() {
  const pairs = shuffle(WORDS).slice(0, GAME_PAIRS);
  selectedEn = null;
  matchedCount = 0;
  $('game-feedback').hidden = true;

  const enList = $('game-en'), idList = $('game-id');
  enList.innerHTML = ''; idList.innerHTML = '';

  shuffle(pairs).forEach(p => enList.appendChild(makeMatchItem(p.en, p.en, 'en')));
  shuffle(pairs).forEach(p => idList.appendChild(makeMatchItem(p.id, p.en, 'id')));
}

function makeMatchItem(text, key, side) {
  const li = document.createElement('li');
  li.className = 'match-item';
  li.textContent = text;
  li.dataset.key = key;
  li.addEventListener('click', () => onMatchClick(li, side));
  return li;
}

function onMatchClick(li, side) {
  if (side === 'en') {
    document.querySelectorAll('#game-en .match-item').forEach(x => x.classList.remove('selected'));
    li.classList.add('selected');
    selectedEn = li;
    return;
  }
  if (!selectedEn) {
    const fb = $('game-feedback');
    fb.textContent = 'Pilih kata Inggris dulu ya 🙂';
    fb.hidden = false;
    return;
  }
  if (selectedEn.dataset.key === li.dataset.key) {
    selectedEn.classList.remove('selected');
    selectedEn.classList.add('matched');
    li.classList.add('matched');
    selectedEn = null;
    matchedCount++;
    const fb = $('game-feedback');
    fb.hidden = false;
    fb.textContent = matchedCount === GAME_PAIRS ? '🏆 Amazing! All words matched!' : '✅ Correct!';
  } else {
    li.classList.add('shake');
    setTimeout(() => li.classList.remove('shake'), 450);
    const fb = $('game-feedback');
    fb.textContent = '❌ Try again!';
    fb.hidden = false;
  }
}
$('game-restart').addEventListener('click', startGame);

/* ================= QUIZ ================= */
let quizIndex = 0, quizScore = 0;

function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

function renderQuiz() {
  const item = QUIZ[quizIndex];
  $('quiz-count').textContent = `Question ${quizIndex + 1}/${QUIZ.length}`;
  $('quiz-bar').style.width = ((quizIndex + 1) / QUIZ.length * 100) + '%';
  $('quiz-question').textContent = item.q;
  const box = $('quiz-options');
  box.innerHTML = '';
  shuffle(item.options).forEach(opt => {
    const b = document.createElement('button');
    b.className = 'option';
    b.textContent = opt;
    b.addEventListener('click', () => answerQuiz(b, opt, item.answer));
    box.appendChild(b);
  });
}

function answerQuiz(btn, chosen, correct) {
  document.querySelectorAll('#quiz-options .option').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
  });
  if (chosen === correct) quizScore++;
  else btn.classList.add('wrong');

  setTimeout(() => {
    if (quizIndex < QUIZ.length - 1) { quizIndex++; renderQuiz(); }
    else showResult();
  }, 900);
}

function showResult() {
  const score = Math.round(quizScore / QUIZ.length * 100);
  $('result-score').textContent = score;
  $('result-score-text').textContent = `${score} (${quizScore}/${QUIZ.length} benar)`;
  showPage('result');
}

/* ================= INIT ================= */
renderVocab();/* Practice: rekam suara & cek pengucapan (Web Speech API) */
(function () {
  'use strict';

  // Daftar kata latihan — silakan ubah/tambah sesuai materi Vocabulary.
  var WORDS = [
    { en: 'wake up',       id: 'bangun tidur',    icon: '⏰' },
    { en: 'brush teeth',   id: 'menyikat gigi',   icon: '🪥' },
    { en: 'eat breakfast', id: 'sarapan',         icon: '🍳' },
    { en: 'go to school',  id: 'pergi ke sekolah', icon: '🏫' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    count: $('speech-count'), bar: $('speech-bar'), play: $('speech-play'),
    icon: $('speech-icon'), word: $('speech-word'), meaning: $('speech-meaning'),
    listen: $('speech-listen'), record: $('speech-record'),
    heard: $('speech-heard'), feedback: $('speech-feedback'),
    next: $('speech-next'), summary: $('speech-summary'),
    scoreText: $('speech-score-text'), restart: $('speech-restart'),
    unsupported: $('speech-unsupported')
  };
  if (!el.count) return;

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var index = 0, score = 0, passed = false, listening = false, rec = null;

  function normalize(s) {
    return String(s).toLowerCase().replace(/[^a-z\s']/g, '').replace(/\s+/g, ' ').trim();
  }

  function similarity(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    var prev = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return 1 - prev[b.length] / Math.max(a.length, b.length);
  }

  function isCorrect(heardList, target) {
    var t = normalize(target);
    for (var i = 0; i < heardList.length; i++) {
      var h = normalize(heardList[i]);
      if (h === t || h.indexOf(t) !== -1 || similarity(h, t) >= 0.8) return true;
    }
    return false;
  }

  function showFeedback(text, ok) {
    el.feedback.hidden = false;
    el.feedback.textContent = text;
    el.feedback.className = 'feedback ' + (ok ? 'is-correct correct' : 'is-wrong wrong');
  }

  function setRecordUI(on) {
    listening = on;
    el.record.textContent = on ? '⏹ Listening... (klik untuk berhenti)' : '🎤 Record';
    el.record.classList.toggle('is-recording', on);
  }

  function render() {
    var w = WORDS[index];
    passed = false;
    el.summary.hidden = true;
    el.play.hidden = false;
    el.count.textContent = 'Question ' + (index + 1) + '/' + WORDS.length;
    el.bar.style.width = ((index + 1) / WORDS.length * 100) + '%';
    el.icon.textContent = w.icon;
    el.word.textContent = w.en;
    el.meaning.textContent = '(' + w.id + ')';
    el.heard.hidden = true;
    el.feedback.hidden = true;
    el.next.hidden = true;
    el.next.textContent = index === WORDS.length - 1 ? 'Finish' : 'Next';
    setRecordUI(false);
  }

  function speak() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(WORDS[index].en);
    u.lang = 'en-US';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }

  function startRecording() {
    if (!SR) { el.unsupported.hidden = false; return; }
    if (listening && rec) { rec.stop(); return; }

    rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;

    rec.onstart = function () {
      setRecordUI(true);
      el.heard.hidden = true;
      el.feedback.hidden = true;
    };

    rec.onresult = function (e) {
      var alts = [];
      var res = e.results[0];
      for (var i = 0; i < res.length; i++) alts.push(res[i].transcript);

      el.heard.hidden = false;
      el.heard.textContent = 'Kamu mengucapkan: "' + alts[0] + '"';

      if (isCorrect(alts, WORDS[index].en)) {
        if (!passed) { passed = true; score++; }
        showFeedback('✅ Benar! Pengucapanmu sudah tepat. Great job!', true);
      } else {
        showFeedback('❌ Belum tepat. Dengarkan lagi dengan tombol Listen, lalu coba ucapkan lagi.', false);
      }
      el.next.hidden = false;
    };

    rec.onerror = function (e) {
      var msg = 'Terjadi kesalahan. Coba lagi.';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg = '🎤 Izin mikrofon ditolak. Izinkan akses mikrofon di browser, lalu coba lagi.';
      } else if (e.error === 'no-speech') {
        msg = 'Suaramu tidak terdengar. Coba lagi dan ucapkan lebih jelas.';
      } else if (e.error === 'audio-capture') {
        msg = 'Mikrofon tidak ditemukan. Periksa perangkatmu.';
      } else if (e.error === 'network') {
        msg = 'Koneksi internet dibutuhkan untuk memeriksa suara. Periksa koneksimu.';
      }
      showFeedback(msg, false);
    };

    rec.onend = function () { setRecordUI(false); };

    try { rec.start(); } catch (err) { setRecordUI(false); }
  }

  function finish() {
    el.play.hidden = true;
    el.summary.hidden = false;
    el.scoreText.textContent = score + ' / ' + WORDS.length;
  }

  el.listen.addEventListener('click', speak);
  el.record.addEventListener('click', startRecording);
  el.next.addEventListener('click', function () {
    if (rec && listening) rec.stop();
    if (index < WORDS.length - 1) { index++; render(); } else { finish(); }
  });
  el.restart.addEventListener('click', function () {
    index = 0; score = 0; render();
  });

  if (!SR) el.unsupported.hidden = false;
  render();
})();