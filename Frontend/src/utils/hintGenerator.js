export function generateHint(puzzle) {
  return {
    hint: puzzle.hint,
    level: puzzle.difficulty === 'hard' ? 'hard' : 'medium'
  };
}