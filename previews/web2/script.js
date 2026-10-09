// 获取页面组件。
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startButton = document.getElementById('start-btn');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const scoreSpan = document.getElementById('score');
const finalScoreSpan = document.getElementById('final-score');
const maxScoreSpan = document.getElementById('max-score');
const resultMessage = document.getElementById('result-message');
const restartButton = document.getElementById('restart-btn');
const progressBar = document.getElementById('progress');
const progressTrack = document.querySelector('.progress-bar');
const answerFeedback = document.getElementById('answer-feedback');

const quizQuestions = [
  {
    question: 'What is the capital of France?',
    answers: [
      { text: 'London', correct: false },
      { text: 'Berlin', correct: false },
      { text: 'Paris', correct: true },
      { text: 'Madrid', correct: false },
    ],
  },
  {
    question: 'Which planet is known as the Red Planet?',
    answers: [
      { text: 'Venus', correct: false },
      { text: 'Mars', correct: true },
      { text: 'Jupiter', correct: false },
      { text: 'Saturn', correct: false },
    ],
  },
  {
    question: 'What is the largest ocean on Earth?',
    answers: [
      { text: 'Atlantic Ocean', correct: false },
      { text: 'Indian Ocean', correct: false },
      { text: 'Arctic Ocean', correct: false },
      { text: 'Pacific Ocean', correct: true },
    ],
  },
  {
    question: 'Which of these is NOT a programming language?',
    answers: [
      { text: 'Java', correct: false },
      { text: 'Python', correct: false },
      { text: 'Banana', correct: true },
      { text: 'JavaScript', correct: false },
    ],
  },
  {
    question: 'What is the chemical symbol for gold?',
    answers: [
      { text: 'Go', correct: false },
      { text: 'Gd', correct: false },
      { text: 'Au', correct: true },
      { text: 'Ag', correct: false },
    ],
  },
];

let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;
let nextQuestionTimer = null;

totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;
progressTrack.setAttribute('aria-valuemax', quizQuestions.length);
startButton.addEventListener('click', startQuiz);
restartButton.addEventListener('click', restartQuiz);

function switchScreen(activeScreen) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.classList.toggle('active', screen === activeScreen);
  });
}

function updateProgress(completed) {
  progressBar.style.width = `${(completed / quizQuestions.length) * 100}%`;
  progressTrack.setAttribute('aria-valuenow', completed);
}

function startQuiz() {
  clearTimeout(nextQuestionTimer);
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = score;
  switchScreen(quizScreen);
  showQuestion();
}

function showQuestion() {
  answersDisabled = false;
  const currentQuestion = quizQuestions[currentQuestionIndex];
  currentQuestionSpan.textContent = currentQuestionIndex + 1;
  updateProgress(currentQuestionIndex);
  questionText.textContent = currentQuestion.question;
  answerFeedback.textContent = '';
  answersContainer.replaceChildren();

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = answer.text;
    button.classList.add('answer-btn');
    button.dataset.correct = answer.correct;
    button.addEventListener('click', selectAnswer);
    answersContainer.appendChild(button);
  });
  questionText.focus();
}

function selectAnswer(event) {
  // 防止在等待下一题时重复点击、重复计分。
  if (answersDisabled) return;
  answersDisabled = true;
  const selectedButton = event.currentTarget;
  const isCorrect = selectedButton.dataset.correct === 'true';

  Array.from(answersContainer.children).forEach((button) => {
    button.disabled = true;
    if (button.dataset.correct === 'true') {
      button.classList.add('correct');
      button.textContent += ' ✓';
    } else if (button === selectedButton) {
      button.classList.add('incorrect');
      button.textContent += ' ✗';
    }
  });

  if (isCorrect) {
    score++;
    scoreSpan.textContent = score;
  }
  const correctAnswer = quizQuestions[currentQuestionIndex].answers.find((answer) => answer.correct);
  answerFeedback.textContent = isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${correctAnswer.text}.`;
  updateProgress(currentQuestionIndex + 1);

  // 展示一秒钟答案反馈，再自动进入下一题或结果页。
  nextQuestionTimer = setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) showQuestion();
    else showResults();
  }, 1000);
}

function showResults() {
  switchScreen(resultScreen);
  finalScoreSpan.textContent = score;
  const percentage = (score / quizQuestions.length) * 100;
  if (percentage === 100) resultMessage.textContent = "Perfect! You're a genius!";
  else if (percentage >= 80) resultMessage.textContent = 'Great job! You know your stuff!';
  else if (percentage >= 60) resultMessage.textContent = 'Good effort! Keep learning!';
  else if (percentage >= 40) resultMessage.textContent = 'Not bad! Try again to improve!';
  else resultMessage.textContent = "Keep studying! You'll get better!";
  document.getElementById('result-title').focus();
}

function restartQuiz() {
  startQuiz();
}
