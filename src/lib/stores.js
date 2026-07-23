import { writable } from 'svelte/store';

// Persisted store: acts as our "database" layer, backed by localStorage.
function createPersistedStore(key, initial) {
  let data = initial;
  try {
    const stored = localStorage.getItem(key);
    if (stored) data = JSON.parse(stored);
  } catch (e) {
    console.error('Failed to read from storage', e);
  }

  const store = writable(data);

  store.subscribe((value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to storage', e);
    }
  });

  return store;
}

export const players = createPersistedStore('chess_players', []);
export const tournaments = createPersistedStore('chess_tournaments', []);

// Simple in-memory UI router (not persisted)
export const view = writable({ page: 'players', tournamentId: null });