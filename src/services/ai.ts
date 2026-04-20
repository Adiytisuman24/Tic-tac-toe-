
export type AIDifficulty = 'easy' | 'moderate' | 'hard';

export function findBestMove(board: (string | null)[], difficulty: AIDifficulty = 'hard'): number {
  // Tic-Tac-Toe board: 0-8
  // AI is O, Player is X
  
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const emptyIndices = board.map((c, i) => c === null ? i : null).filter(i => i !== null) as number[];
  
  if (difficulty === 'easy') {
    // 80% chance of random move, 20% minimax
    if (Math.random() < 0.8) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
  } else if (difficulty === 'moderate') {
    // 100% minimax as per user requirement "human cant win"
  }

  function checkWinner(b: (string | null)[]): string | null {
    for (const [a, b1, c] of winningCombinations) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return b[a];
      }
    }
    if (b.every(cell => cell !== null)) return 'draw';
    return null;
  }

  function minimax(b: (string | null)[], depth: number, isMaximizing: boolean): number {
    const winner = checkWinner(b);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = 'O';
          const score = minimax(b, depth + 1, false);
          b[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = 'X';
          const score = minimax(b, depth + 1, true);
          b[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  let bestMove = -1;
  let bestScore = -Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}
