import { shuffle, uid } from './utils.js';

const BYE = { id: 'BYE', name: 'BYE', isBye: true };

function makeMatch(p1, p2) {
  const match = { id: uid(), player1: p1, player2: p2, winner: null, loser: null };
  // Auto-resolve byes
  if (p1.isBye) {
    match.winner = p2;
    match.loser = p1;
  } else if (p2.isBye) {
    match.winner = p1;
    match.loser = p2;
  }
  return match;
}

/** Randomly pairs all players into round 1 of a single-elimination bracket. */
export function createBracket(playerList) {
  let list = shuffle(playerList);
  if (list.length % 2 !== 0) list.push(BYE); // odd count -> one bye

  const round = [];
  for (let i = 0; i < list.length; i += 2) {
    round.push(makeMatch(list[i], list[i + 1]));
  }
  return [round];
}

/** Randomly picks a winner for one match and records the result. */
export function playMatch(match) {
  if (match.winner) return match; // already decided (e.g. bye)
  const winner = Math.random() < 0.5 ? match.player1 : match.player2;
  const loser = winner.id === match.player1.id ? match.player2 : match.player1;
  return { ...match, winner, loser };
}

/** Plays every undecided match in a round. */
export function playRound(round) {
  return round.map(playMatch);
}

export function roundComplete(round) {
  return round.every((m) => m.winner !== null);
}

/** Builds the next round by pairing up this round's winners. */
export function generateNextRound(round) {
  const winners = round.map((m) => m.winner);
  const nextRound = [];
  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i + 1]) {
      nextRound.push(makeMatch(winners[i], winners[i + 1]));
    } else {
      nextRound.push(makeMatch(winners[i], BYE)); // odd winner out gets a bye
    }
  }
  return nextRound;
}

export function isFinalRound(round) {
  return round.length === 1;
}

/** Builds (and does not play) the 3rd-place match from the semifinal losers. */
export function getThirdPlaceMatch(semifinalRound) {
  if (!semifinalRound || semifinalRound.length !== 2) return null;
  const [m1, m2] = semifinalRound;
  if (!m1.winner || !m2.winner) return null;
  return makeMatch(m1.loser, m2.loser);
}