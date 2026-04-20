
import { describe, it, expect } from 'vitest';
import { findBestMove } from './ai';

describe('AI Logic', () => {
  it('should take the winning move', () => {
    const board = [
      'X', 'X', null,
      'O', 'O', null,
      'X', null, null
    ];
    const move = findBestMove(board as (string | null)[]);
    expect(move).toBe(5);
  });

  it('should block the player from winning', () => {
    const board = [
      'X', 'X', null,
      null, 'O', null,
      null, null, null
    ];
    const move = findBestMove(board as (string | null)[]);
    expect(move).toBe(2);
  });

  it('should take the center if available on first move', () => {
    const board = [
      'X', null, null,
      null, null, null,
      null, null, null
    ];
    const move = findBestMove(board as (string | null)[]);
    expect(move).toBe(4);
  });
});
