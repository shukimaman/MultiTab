const STORAGE_KEY = "multitab-state";

const state = loadState();

const questionEl = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const feedbackEl = document.getElementById("feedback");
const correctCountEl = document.getElementById("correctCount");
const wrongCountEl = document.getElementById("wrongCount");
const totalCountEl = document.getElementById("totalCount");
const historyListEl = document.getElementById("historyList");
const rangeSelect = document.getElementById("rangeSelect");
const resetBtn = document.getElementById("resetBtn");

let currentA = 1;
let currentB = 1;

rangeSelect.value = String(state.range);

init();

function init() {
  renderStats();
  renderHistory();
  nextQuestion();
  answerInput.focus();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        correct: parsed.correct ?? 0,
        wrong: parsed.wrong ?? 0,
        history: parsed.history ?? [],
        range: parsed.range ?? 10,
      };
    }
  } catch (e) {
    console.warn("Failed to load saved state", e);
  }
  return { correct: 0, wrong: 0, history: [], range: 10 };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
}

function nextQuestion() {
  const range = Number(rangeSelect.value);
  currentA = randomInt(1, range);
  currentB = randomInt(1, range);
  questionEl.textContent = `${currentA} × ${currentB} = ?`;
  answerInput.value = "";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userAnswer = Number(answerInput.value);
  const correctAnswer = currentA * currentB;
  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect) {
    state.correct += 1;
    feedbackEl.textContent = "נכון מאוד! 🎉";
    feedbackEl.className = "feedback correct";
  } else {
    state.wrong += 1;
    feedbackEl.textContent = `לא נכון, התשובה הנכונה היא ${correctAnswer}`;
    feedbackEl.className = "feedback wrong";
  }

  state.history.unshift({
    a: currentA,
    b: currentB,
    correctAnswer,
    givenAnswer: userAnswer,
    isCorrect,
  });

  renderStats();
  renderHistory();
  saveState();

  setTimeout(() => {
    nextQuestion();
    answerInput.focus();
  }, 900);
});

resetBtn.addEventListener("click", () => {
  if (!confirm("לאפס את כל הנתונים וההיסטוריה?")) return;
  state.correct = 0;
  state.wrong = 0;
  state.history = [];
  renderStats();
  renderHistory();
  saveState();
  nextQuestion();
});

rangeSelect.addEventListener("change", () => {
  state.range = Number(rangeSelect.value);
  saveState();
  nextQuestion();
});

function renderStats() {
  correctCountEl.textContent = state.correct;
  wrongCountEl.textContent = state.wrong;
  totalCountEl.textContent = state.correct + state.wrong;
}

function renderHistory() {
  if (state.history.length === 0) {
    historyListEl.innerHTML = '<p class="empty-history">עדיין לא ביצעתם תרגילים.</p>';
    return;
  }

  historyListEl.innerHTML = state.history
    .map((item) => {
      const statusClass = item.isCorrect ? "correct" : "wrong";
      const badgeText = item.isCorrect ? "נכון" : "טעות";
      return `
        <div class="history-item ${statusClass}">
          <span class="expr">${item.a} × ${item.b} = ${item.correctAnswer}</span>
          <span class="given-answer">ענית: ${item.givenAnswer}</span>
          <span class="badge">${badgeText}</span>
        </div>
      `;
    })
    .join("");
}
