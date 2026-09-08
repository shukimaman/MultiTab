const STORAGE_KEY = "multitab-state";

const OPERATIONS = {
  add: { symbol: "+", label: "חיבור", title: "לוח החיבור", emoji: "➕" },
  sub: { symbol: "−", label: "חיסור", title: "לוח החיסור", emoji: "➖" },
  mul: { symbol: "×", label: "כפל", title: "לוח הכפל", emoji: "✖️" },
  div: { symbol: "÷", label: "חילוק", title: "לוח החילוק", emoji: "➗" },
};

const state = loadState();

const pageTitleEl = document.getElementById("pageTitle");
const pageSubtitleEl = document.getElementById("pageSubtitle");
const questionEl = document.getElementById("question");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const feedbackEl = document.getElementById("feedback");
const correctCountEl = document.getElementById("correctCount");
const wrongCountEl = document.getElementById("wrongCount");
const totalCountEl = document.getElementById("totalCount");
const historyListEl = document.getElementById("historyList");
const operationSelect = document.getElementById("operationSelect");
const rangeSelect = document.getElementById("rangeSelect");
const resetBtn = document.getElementById("resetBtn");

let currentA = 1;
let currentB = 1;
let currentOp = state.op;
let currentAnswer = 1;

operationSelect.value = state.op;
rangeSelect.value = String(state.range);

init();

function init() {
  renderStats();
  renderHistory();
  applyOperation();
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
        op: OPERATIONS[parsed.op] ? parsed.op : "mul",
      };
    }
  } catch (e) {
    console.warn("Failed to load saved state", e);
  }
  return { correct: 0, wrong: 0, history: [], range: 10, op: "mul" };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
}

function applyOperation() {
  const opConf = OPERATIONS[state.op];
  pageTitleEl.textContent = `${opConf.title} ${opConf.emoji}`;
  pageSubtitleEl.textContent = `תרגלו ${opConf.label} וראו את ההתקדמות שלכם`;
  document.title = opConf.title;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextQuestion() {
  const range = Number(rangeSelect.value);
  currentOp = state.op;

  if (currentOp === "add") {
    currentA = randomInt(1, range);
    currentB = randomInt(1, range);
    currentAnswer = currentA + currentB;
  } else if (currentOp === "sub") {
    const x = randomInt(1, range);
    const y = randomInt(1, range);
    currentA = Math.max(x, y);
    currentB = Math.min(x, y);
    currentAnswer = currentA - currentB;
  } else if (currentOp === "div") {
    currentB = randomInt(1, range);
    const quotient = randomInt(1, range);
    currentA = currentB * quotient;
    currentAnswer = quotient;
  } else {
    currentA = randomInt(1, range);
    currentB = randomInt(1, range);
    currentAnswer = currentA * currentB;
  }

  questionEl.textContent = `${currentA} ${OPERATIONS[currentOp].symbol} ${currentB} = ?`;
  answerInput.value = "";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userAnswer = Number(answerInput.value);
  const isCorrect = userAnswer === currentAnswer;

  if (isCorrect) {
    state.correct += 1;
    feedbackEl.textContent = "נכון מאוד! 🎉";
    feedbackEl.className = "feedback correct";
  } else {
    state.wrong += 1;
    feedbackEl.textContent = `לא נכון, התשובה הנכונה היא ${currentAnswer}`;
    feedbackEl.className = "feedback wrong";
  }

  state.history.unshift({
    op: currentOp,
    a: currentA,
    b: currentB,
    correctAnswer: currentAnswer,
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

operationSelect.addEventListener("change", () => {
  state.op = operationSelect.value;
  saveState();
  applyOperation();
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
      const symbol = OPERATIONS[item.op] ? OPERATIONS[item.op].symbol : "×";
      return `
        <div class="history-item ${statusClass}">
          <span class="expr">${item.a} ${symbol} ${item.b} = ${item.correctAnswer}</span>
          <span class="given-answer">ענית: ${item.givenAnswer}</span>
          <span class="badge">${badgeText}</span>
        </div>
      `;
    })
    .join("");
}
