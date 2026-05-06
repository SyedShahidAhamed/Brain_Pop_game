import dayjs from "dayjs";
import { getCurrentUser, readUserData, saveUserData } from "./userStorage";

export const SCORE_PER_CORRECT_ANSWER = 10;
export const DAILY_QUIZ_SIZE = 5;
const DAILY_QUIZ_STORAGE_KEY = "dailyQuiz";
const DEVICE_ID_KEY = "dailyQuizDeviceId";

export const PUZZLE_BANK = [
  {
    id: "m-01",
    question: "What is 45 + 27 - 12?",
    answer: 60,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Add 45 and 27 first, then subtract 12."
  },
  {
    id: "m-02",
    question: "If you have $150 and spend 40%, how much is left?",
    answer: 90,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "40% of 150 is 60. Subtract 60 from 150."
  },
  {
    id: "m-03",
    question: "What number is 25% of 240?",
    answer: 60,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "25% means one quarter."
  },
  {
    id: "m-04",
    question: "A rectangle has length 12 and width 7. What is its area?",
    answer: 84,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Area is length multiplied by width."
  },
  {
    id: "m-05",
    question: "What is the missing number: 8, 16, 24, ?, 40",
    answer: 32,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "The sequence increases by 8 each time."
  },
  {
    id: "m-06",
    question: "If 9 teams each have 6 players, how many players are there?",
    answer: 54,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply teams by players per team."
  },
  {
    id: "m-07",
    question: "What is 72 ÷ 8 + 15?",
    answer: 24,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Divide first, then add."
  },
  {
    id: "m-08",
    question: "What is 30% of 200?",
    answer: 60,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "30% means 30/100."
  },
  {
    id: "m-09",
    question: "What is the missing number: 5, 10, 20, 40, ?",
    answer: 80,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Each number doubles."
  },
  {
    id: "m-10",
    question: "If a book costs $25, how much do 4 books cost?",
    answer: 100,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply 25 by 4."
  },
  {
    id: "m-11",
    question: "What is 9² (9 squared)?",
    answer: 81,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply 9 by itself."
  },
  {
    id: "m-12",
    question: "A number increased by 15 equals 40. What is the number?",
    answer: 25,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Subtract 15 from 40."
  },
  {
    id: "m-13",
    question: "What is 144 ÷ 12 + 6?",
    answer: 18,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Divide first, then add."
  },
  {
    id: "m-14",
    question: "What is 20% of 350?",
    answer: 70,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "20% means one-fifth."
  },
  {
    id: "m-15",
    question: "Find the missing number: 3, 9, 27, ?, 243",
    answer: 81,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply by 3 each time."
  },
  {
    id: "m-16",
    question: "If 7 notebooks cost $56, what is the cost of 1 notebook?",
    answer: 8,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Divide total cost by quantity."
  },
  {
    id: "m-17",
    question: "What is 13 × 4 + 8?",
    answer: 60,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply first, then add."
  },
  {
    id: "m-18",
    question: "A triangle has base 10 and height 6. What is its area?",
    answer: 30,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Area = 1/2 × base × height."
  },
  {
    id: "m-19",
    question: "What is the missing number: 11, 22, 33, ?, 55",
    answer: 44,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Add 11 each time."
  },
  {
    id: "m-20",
    question: "If a number is divided by 5 and equals 9, what is the number?",
    answer: 45,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply 9 by 5."
  },
  {
    id: "m-21",
    question: "What is 64 ÷ 8 × 5?",
    answer: 40,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Divide first, then multiply."
  },
  {
    id: "m-22",
    question: "What is 15% of 200?",
    answer: 30,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "15% = 15/100."
  },
  {
    id: "m-23",
    question: "Find the missing number: 6, 12, 18, ?, 30",
    answer: 24,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Add 6 each time."
  },
  {
    id: "m-24",
    question: "A box has 9 rows with 8 apples each. Total apples?",
    answer: 72,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply rows by apples per row."
  },
  {
    id: "m-25",
    question: "What is 14 × 3 + 2?",
    answer: 44,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Multiply first."
  },
  {
    id: "m-26",
    question: "If 5 pens cost $25, what is cost of 1 pen?",
    answer: 5,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Divide total cost by number of pens."
  },
  {
    id: "m-27",
    question: "What is 100 - (25 + 35)?",
    answer: 40,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Solve inside brackets first."
  },
  {
    id: "m-28",
    question: "What is 7² + 3?",
    answer: 52,
    difficulty: "medium",
    difficultyLabel: "Medium",
    hint: "Square first."
  },
  {
    id: "h-01",
    question: "I am a number between 1 and 50. I am divisible by both 5 and 7. What am I?",
    answer: 35,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Find the common multiple of 5 and 7 that is less than 50."
  },
  {
    id: "h-02",
    question: "A sequence goes: 2, 5, 10, 17, 26, ? What is the next number?",
    answer: 37,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "The differences are 3, 5, 7, and 9. The next difference is 11."
  },
  {
    id: "h-03",
    question: "If 3 cats catch 3 mice in 3 minutes, how many mice will 10 cats catch in 10 minutes?",
    answer: 100,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Each cat catches 1 mouse per minute, so multiply 10 by 10."
  },
  {
    id: "h-04",
    question: "What is the next number: 1, 4, 9, 16, 25, ?",
    answer: 36,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "These are square numbers."
  },
  {
    id: "h-05",
    question: "A train travels 180 km in 3 hours. What is its speed in km/h?",
    answer: 60,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Speed equals distance divided by time."
  },
  {
    id: "h-06",
    question: "If x + 18 = 45 and x is doubled, what is the result?",
    answer: 54,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Find x first, then multiply it by 2."
  },
  {
    id: "h-07",
    question: "What is 11 x 12 - 25?",
    answer: 107,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Multiply before subtracting."
  },
  {
    id: "h-08",
    question: "A code doubles a number and adds 5. If the output is 31, what was the input?",
    answer: 13,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Subtract 5 first, then divide by 2."
  },
  {
    id: "h-09",
    question: "What is the smallest number divisible by 3, 4, and 5?",
    answer: 60,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Look for the least common multiple."
  },
  {
    id: "h-10",
    question: "What is the next number: 3, 6, 18, 72, ?",
    answer: 360,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Multiply by increasing numbers (×2, ×3, ×4, ×5)."
  },
  {
    id: "h-11",
    question: "If 5 machines make 5 items in 5 minutes, how long will 100 machines take to make 100 items?",
    answer: 5,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Each machine works independently."
  },
  {
    id: "h-12",
    question: "What is the next number: 2, 3, 5, 9, 17, ?",
    answer: 33,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Pattern: multiply by 2 and subtract 1."
  },
  {
    id: "h-13",
    question: "If a number is multiplied by 4 and then reduced by 6, the result is 34. What is the number?",
    answer: 10,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Solve: 4x - 6 = 34."
  },
  {
    id: "h-14",
    question: "A person walks 5 km north, then 3 km east. What is the shortest distance back to the start?",
    answer: 5.83,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Use Pythagoras theorem."
  },
  {
    id: "h-15",
    question: "What is 15% of 240 plus 10?",
    answer: 46,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Find 15% first, then add 10."
  },
  {
    id: "h-16",
    question: "If x² = 144, what is x?",
    answer: 12,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Find the square root of 144."
  },
  {
    id: "h-17",
    question: "What is the next number: 7, 14, 28, 56, ?",
    answer: 112,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Each number doubles."
  },
  {
    id: "h-18",
    question: "What is the next number: 4, 9, 19, 39, 79, ?",
    answer: 159,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Pattern: multiply by 2 and add 1."
  },
  {
    id: "h-19",
    question: "If 8 workers can complete a task in 6 days, how many days will 4 workers take?",
    answer: 12,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Work is inversely proportional."
  },
  {
    id: "h-20",
    question: "What is the next number: 1, 1, 2, 3, 5, 8, ?",
    answer: 13,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Each number is sum of previous two."
  },
  {
    id: "h-21",
    question: "If x/3 + 5 = 11, what is x?",
    answer: 18,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Subtract 5, then multiply by 3."
  },
  {
    id: "h-22",
    question: "A car travels at 80 km/h for 2.5 hours. What distance does it cover?",
    answer: 200,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Distance = speed × time."
  },
  {
    id: "h-23",
    question: "What is 18² - 100?",
    answer: 224,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Square 18 first."
  },
  {
    id: "h-24",
    question: "If a number is increased by 25% and becomes 125, what was the original number?",
    answer: 100,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "125% of x = 125."
  },
  {
    id: "h-25",
    question: "What is the next number: 10, 20, 40, 80, ?",
    answer: 160,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Each number doubles."
  },
  {
    id: "h-26",
    question: "What is the next number: 5, 10, 20, 40, 80, ?",
    answer: 160,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Each number doubles."
  },
  {
    id: "h-27",
    question: "If 6 men can do a job in 4 days, how many days will 3 men take?",
    answer: 8,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Less workers → more time."
  },
  {
    id: "h-28",
    question: "What is the next number: 1, 3, 6, 10, 15, ?",
    answer: 21,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Add increasing numbers: +2, +3, +4..."
  },
  {
    id: "h-29",
    question: "If x - 7 = 20, what is x?",
    answer: 27,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Add 7 to both sides."
  },
  {
    id: "h-30",
    question: "A train moves 90 km in 1.5 hours. Speed?",
    answer: 60,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Speed = distance ÷ time."
  },
  {
    id: "h-31",
    question: "What is 25² - 125?",
    answer: 500,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Square 25 first."
  },
  {
    id: "h-32",
    question: "If a number is tripled and becomes 81, what is the number?",
    answer: 27,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Divide 81 by 3."
  },
  {
    id: "h-33",
    question: "What is the next number: 2, 6, 7, 21, 22, ?",
    answer: 66,
    difficulty: "hard",
    difficultyLabel: "Hard",
    hint: "Pattern: ×3, +1, ×3, +1..."
  }
];

const lastPuzzleByDifficulty = new Map();

function assertValidDifficulty(difficulty) {
  if (!["medium", "hard"].includes(difficulty)) {
    throw new Error(`Unsupported difficulty "${difficulty}". Use "medium" or "hard".`);
  }
}

function clonePuzzle(puzzle) {
  return puzzle ? { ...puzzle } : null;
}

export function getPuzzlesByDifficulty(difficulty) {
  assertValidDifficulty(difficulty);
  return PUZZLE_BANK.filter((puzzle) => puzzle.difficulty === difficulty).map(clonePuzzle);
}

export function getRandomPuzzle(difficulty) {
  assertValidDifficulty(difficulty);

  const matchingPuzzles = PUZZLE_BANK.filter((puzzle) => puzzle.difficulty === difficulty);
  const previousPuzzleId = lastPuzzleByDifficulty.get(difficulty);
  const selectablePuzzles =
    matchingPuzzles.length > 1
      ? matchingPuzzles.filter((puzzle) => puzzle.id !== previousPuzzleId)
      : matchingPuzzles;
  const selectedPuzzle = selectablePuzzles[Math.floor(Math.random() * selectablePuzzles.length)];

  lastPuzzleByDifficulty.set(difficulty, selectedPuzzle.id);
  return clonePuzzle(selectedPuzzle);
}

export function validateAnswer(userAnswer, correctAnswer) {
  if (userAnswer === null || userAnswer === undefined || userAnswer === "") {
    return false;
  }

  const parsedUserAnswer = Number(String(userAnswer).trim());
  const parsedCorrectAnswer = Number(correctAnswer);

  if (!Number.isFinite(parsedUserAnswer) || !Number.isFinite(parsedCorrectAnswer)) {
    return false;
  }

  // Small tolerance keeps decimal answers friendly without accepting meaningfully wrong values.
  return Math.abs(parsedUserAnswer - parsedCorrectAnswer) < 0.001;
}

export function getHint(puzzle) {
  return puzzle?.hint ?? "";
}

export function shufflePuzzles(puzzles = PUZZLE_BANK) {
  const shuffledPuzzles = puzzles.map(clonePuzzle);

  for (let index = shuffledPuzzles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledPuzzles[index], shuffledPuzzles[swapIndex]] = [
      shuffledPuzzles[swapIndex],
      shuffledPuzzles[index]
    ];
  }

  return shuffledPuzzles;
}

function getTodayDateString() {
  return dayjs().format("YYYY-MM-DD");
}

function normalizeUserId(userId) {
  return String(userId || "anonymous").trim().toLowerCase();
}

function getOrCreateDeviceId() {
  if (typeof localStorage === "undefined") {
    return "server-device";
  }

  const existingDeviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const newDeviceId = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
  return newDeviceId;
}

function getDefaultUserId() {
  const currentUser = getCurrentUser();
  return currentUser?.email || currentUser?.username || getOrCreateDeviceId();
}

function getQuestionKey(puzzle) {
  return puzzle?.id ?? puzzle?.question;
}

function getUniquePuzzles(puzzles) {
  const seenQuestionKeys = new Set();
  const uniquePuzzles = [];

  for (const puzzle of puzzles) {
    const questionKey = getQuestionKey(puzzle);

    if (!questionKey || seenQuestionKeys.has(questionKey)) {
      continue;
    }

    seenQuestionKeys.add(questionKey);
    uniquePuzzles.push(puzzle);
  }

  return uniquePuzzles;
}

function hasValidDailyQuiz(quiz) {
  if (!quiz || typeof quiz.date !== "string" || !Array.isArray(quiz.questions)) {
    return false;
  }

  if (quiz.questions.length !== DAILY_QUIZ_SIZE) {
    return false;
  }

  const uniqueQuestionKeys = new Set(quiz.questions.map(getQuestionKey));
  return uniqueQuestionKeys.size === DAILY_QUIZ_SIZE;
}

export function generateSeed(date, userId) {
  const seedInput = `${date}:${normalizeUserId(userId)}`;
  let hash = 2166136261;

  // FNV-1a hash gives a fast, stable 32-bit seed for date + user variation.
  for (let index = 0; index < seedInput.length; index += 1) {
    hash ^= seedInput.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function seededRandom(seed) {
  let state = seed >>> 0;

  return function random() {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed(array, seed) {
  const shuffledArray = array.map(clonePuzzle);
  const random = seededRandom(seed);

  for (let index = shuffledArray.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffledArray[index], shuffledArray[swapIndex]] = [
      shuffledArray[swapIndex],
      shuffledArray[index]
    ];
  }

  return shuffledArray;
}

export function getDailyQuiz(
  puzzles = PUZZLE_BANK,
  userId = getDefaultUserId(),
  date = getTodayDateString()
) {
  const uniquePuzzles = getUniquePuzzles(puzzles);

  if (uniquePuzzles.length < DAILY_QUIZ_SIZE) {
    throw new Error(`Daily quiz requires at least ${DAILY_QUIZ_SIZE} unique questions.`);
  }

  const storedQuiz = readUserData(DAILY_QUIZ_STORAGE_KEY, null, userId);

  if (storedQuiz?.date === date && hasValidDailyQuiz(storedQuiz)) {
    return {
      date: storedQuiz.date,
      questions: storedQuiz.questions.map(clonePuzzle)
    };
  }

  const seed = generateSeed(date, userId);
  const questions = shuffleWithSeed(uniquePuzzles, seed).slice(0, DAILY_QUIZ_SIZE);
  const dailyQuiz = {
    date,
    questions
  };

  saveUserData(DAILY_QUIZ_STORAGE_KEY, dailyQuiz, userId);
  return {
    date: dailyQuiz.date,
    questions: dailyQuiz.questions.map(clonePuzzle)
  };
}

export function calculateScore(isCorrect, currentScore = 0) {
  return isCorrect ? currentScore + SCORE_PER_CORRECT_ANSWER : currentScore;
}

export function createGameState(difficulty = "medium") {
  return {
    currentPuzzle: getRandomPuzzle(difficulty),
    score: 0,
    puzzlesSolved: 0
  };
}

export function resolveAnswer(gameState, userAnswer, difficulty = "medium") {
  const isCorrect = validateAnswer(userAnswer, gameState.currentPuzzle?.answer);

  return {
    currentPuzzle: getRandomPuzzle(difficulty),
    score: calculateScore(isCorrect, gameState.score),
    puzzlesSolved: isCorrect ? gameState.puzzlesSolved + 1 : gameState.puzzlesSolved,
    isCorrect
  };
}

function readQuestionHistory(email) {
  return readUserData("questionHistory", {}, email);
}

function saveQuestionHistory(email, date, puzzleIds) {
  const history = readQuestionHistory(email);
  history[date] = puzzleIds;
  saveUserData("questionHistory", history, email);
}

function getDateSeed(date) {
  return dayjs(date).diff(dayjs("2024-01-01"), "day");
}

function pickDailyPuzzles(pool, count, seed, avoidIds = []) {
  const availablePool = pool.filter((puzzle) => !avoidIds.includes(puzzle.id));
  const sourcePool = availablePool.length >= count ? availablePool : pool;
  const selected = [];

  for (let i = 0; i < count; i += 1) {
    const index = (seed + i * 3) % sourcePool.length;
    selected.push(sourcePool[index]);
  }

  return selected;
}

function selectPuzzlesForDate(date, avoidIds = []) {
  const seed = getDateSeed(date);
  const mediumPuzzles = PUZZLE_BANK.filter((puzzle) => puzzle.difficulty === "medium");
  const hardPuzzles = PUZZLE_BANK.filter((puzzle) => puzzle.difficulty === "hard");

  return [
    ...pickDailyPuzzles(mediumPuzzles, 2, seed, avoidIds),
    ...pickDailyPuzzles(hardPuzzles, 3, seed * 2, avoidIds)
  ].map((puzzle) => ({ ...puzzle }));
}

export function generateDailyPuzzles(email, date = dayjs().format("YYYY-MM-DD")) {
  const { questions: puzzles } = getDailyQuiz(PUZZLE_BANK, email, date);

  saveQuestionHistory(email, date, puzzles.map((puzzle) => puzzle.id));
  return puzzles;
}
