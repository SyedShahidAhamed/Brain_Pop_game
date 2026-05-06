import dayjs from "dayjs";
import { generateDailyPuzzles } from "./puzzleGenerator";
import { readUserData, saveUserData } from "./userStorage";

function saveDailyState(email, state) {
  saveUserData("progress", state, email);
}

function readStoredState(email) {
  return readUserData("progress", null, email);
}

function calculateProgress(state) {
  const totalQuestions = state.puzzles.length;
  const solvedQuestions = new Set(state.completedPuzzles).size;
  const remainingQuestions = Math.max(totalQuestions - solvedQuestions, 0);
  const completionPercentage = totalQuestions
    ? Math.round((solvedQuestions / totalQuestions) * 100)
    : 0;

  return {
    totalQuestions,
    solvedQuestions,
    remainingQuestions,
    completionPercentage
  };
}

function createNewDailyState(email, today) {
  const puzzles = generateDailyPuzzles(email, today);
  const newState = {
    date: today,
    puzzles,
    currentPuzzleIndex: 0,
    score: 0,
    hintUsed: false,
    completedPuzzles: [],
    skippedPuzzles: []
  };

  saveDailyState(email, newState);
  return newState;
}

function normalizeState(state) {
  const completedPuzzles = Array.isArray(state.completedPuzzles)
    ? [...new Set(state.completedPuzzles)]
    : [];
  const skippedPuzzles = Array.isArray(state.skippedPuzzles)
    ? [...new Set(state.skippedPuzzles)]
    : [];

  return {
    ...state,
    completedPuzzles,
    skippedPuzzles,
    currentPuzzleIndex: Math.min(state.currentPuzzleIndex || 0, state.puzzles.length),
    score: completedPuzzles.length * 10,
    hintUsed: Boolean(state.hintUsed)
  };
}

function getDailyState(email) {
  const today = dayjs().format("YYYY-MM-DD");
  const storedState = readStoredState(email);

  // Each user gets an independent daily state key, so accounts never share progress.
  if (!storedState || storedState.date !== today) {
    return createNewDailyState(email, today);
  }

  const normalizedState = normalizeState(storedState);
  saveDailyState(email, normalizedState);
  return normalizedState;
}

export function completeCurrentPuzzle(email) {
  const state = getDailyState(email);
  const currentIndex = state.currentPuzzleIndex;
  const completedPuzzles = [...new Set([...state.completedPuzzles, currentIndex])];
  const newState = {
    ...state,
    completedPuzzles,
    score: completedPuzzles.length * 10,
    currentPuzzleIndex: Math.min(currentIndex + 1, state.puzzles.length)
  };

  saveDailyState(email, newState);
  return getGameState(email);
}

export function skipCurrentPuzzle(email) {
  const state = getDailyState(email);
  const currentIndex = state.currentPuzzleIndex;
  const newState = {
    ...state,
    skippedPuzzles: [...new Set([...state.skippedPuzzles, currentIndex])],
    currentPuzzleIndex: Math.min(currentIndex + 1, state.puzzles.length)
  };

  saveDailyState(email, newState);
  return getGameState(email);
}

export function markHintUsed(email) {
  const state = getDailyState(email);
  const newState = {
    ...state,
    hintUsed: true
  };

  saveDailyState(email, newState);
  return getGameState(email);
}

export function getGameState(email) {
  const state = getDailyState(email);
  const currentIndex = state.currentPuzzleIndex;
  const isComplete = currentIndex >= state.puzzles.length;
  const progress = calculateProgress(state);

  return {
    ...progress,
    date: state.date,
    puzzles: state.puzzles,
    currentPuzzle: isComplete ? null : state.puzzles[currentIndex],
    currentIndex,
    score: state.score,
    solved: progress.solvedQuestions,
    hintUsed: state.hintUsed,
    completedPuzzles: state.completedPuzzles,
    skippedPuzzles: state.skippedPuzzles,
    isComplete,
    hintAvailable: !state.hintUsed
  };
}
