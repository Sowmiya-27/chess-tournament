<script>
  export let tournamentId;

  import { tournaments, players } from './stores.js';
  import { deepClone } from './utils.js';
  import Rankings from './Rankings.svelte';
  import {
    createBracket,
    playRound,
    roundComplete,
    generateNextRound,
    isFinalRound,
    getThirdPlaceMatch,
    playMatch
  } from './tournamentEngine.js';

  $: tournament = $tournaments.find((t) => t.id === tournamentId);
  $: tournamentPlayers = $players.filter((p) => tournament?.playerIds.includes(p.id));
  $: availablePlayers = $players.filter((p) => !tournament?.playerIds.includes(p.id));

  let selectedToAdd = [];

  function updateTournament(fn) {
    tournaments.update((all) =>
      all.map((t) => {
        if (t.id !== tournamentId) return t;
        const copy = deepClone(t);
        fn(copy);
        return copy;
      })
    );
  }

  function addSelectedPlayers() {
    if (selectedToAdd.length === 0) return;
    updateTournament((t) => {
      t.playerIds = [...new Set([...t.playerIds, ...selectedToAdd])];
    });
    selectedToAdd = [];
  }

  function removePlayer(id) {
    updateTournament((t) => {
      t.playerIds = t.playerIds.filter((pid) => pid !== id);
    });
  }

  function startTournament() {
    updateTournament((t) => {
      const plist = tournamentPlayers;
      t.rounds = createBracket(plist);
      t.status = 'ongoing';
      t.thirdPlaceMatch = null;
    });
  }

  function resetTournament() {
    if (!confirm('Reset bracket and results?')) return;
    updateTournament((t) => {
      t.rounds = [];
      t.status = 'pending';
      t.thirdPlaceMatch = null;
    });
  }

  function advanceOneRound(t) {
    const idx = t.rounds.length - 1;
    t.rounds[idx] = playRound(t.rounds[idx]);
    const current = t.rounds[idx];

    if (isFinalRound(current) && roundComplete(current)) {
      const semis = t.rounds[idx - 1];
      const tp = getThirdPlaceMatch(semis);
      if (tp) t.thirdPlaceMatch = playMatch(tp);
      t.status = 'completed';
    } else if (roundComplete(current)) {
      t.rounds.push(generateNextRound(current));
    }
  }

  function simulateCurrentRound() {
    updateTournament((t) => advanceOneRound(t));
  }

  function simulateAll() {
    updateTournament((t) => {
      let guard = 0;
      while (t.status !== 'completed' && guard < 25) {
        advanceOneRound(t);
        guard++;
      }
    });
  }

  function playerName(p) {
    return p?.isBye ? 'BYE' : p?.name ?? '-';
  }
</script>

{#if !tournament}
  <p>Tournament not found.</p>
{:else}
  <section>
    <h2>{tournament.name}</h2>
    <p>Date: {tournament.date || '-'} &middot; Status: <strong>{tournament.status}</strong></p>

    {#if tournament.status === 'pending'}
      <div class="players-panel">
        <div>
          <h3>Tournament Players ({tournamentPlayers.length})</h3>
          {#if tournamentPlayers.length === 0}
            <p>No players added yet.</p>
          {:else}
            <ul>
              {#each tournamentPlayers as p (p.id)}
                <li>{p.name} <button class="danger" on:click={() => removePlayer(p.id)}>Remove</button></li>
              {/each}
            </ul>
          {/if}
        </div>

        <div>
          <h3>Add Players</h3>
          {#if availablePlayers.length === 0}
            <p>No more players available. Add players first.</p>
          {:else}
            {#each availablePlayers as p (p.id)}
              <label class="checkbox-row">
                <input type="checkbox" bind:group={selectedToAdd} value={p.id} />
                {p.name}
              </label>
            {/each}
            <button on:click={addSelectedPlayers}>Add Selected Players</button>
          {/if}
        </div>
      </div>

      <div class="actions">
        <button
          disabled={tournamentPlayers.length < 2}
          on:click={startTournament}
        >
          Generate Bracket &amp; Start
        </button>
        {#if tournamentPlayers.length < 2}
          <p class="hint">Add at least 2 players to start.</p>
        {/if}
      </div>
    {/if}

    {#if tournament.status !== 'pending'}
      <div class="actions">
        {#if tournament.status === 'ongoing'}
          <button on:click={simulateCurrentRound}>Simulate Next Round</button>
          <button on:click={simulateAll}>Simulate Entire Tournament</button>
        {/if}
        <button class="secondary" on:click={resetTournament}>Reset Tournament</button>
      </div>

      <div class="bracket">
        {#each tournament.rounds as round, i}
          <div class="round">
            <h4>Round {i + 1}</h4>
            {#each round as match (match.id)}
              <div class="match">
                <span class:winner={match.winner?.id === match.player1.id}>{playerName(match.player1)}</span>
                <span class="vs">vs</span>
                <span class:winner={match.winner?.id === match.player2.id}>{playerName(match.player2)}</span>
                {#if match.winner}
                  <span class="result">→ {playerName(match.winner)} wins</span>
                {/if}
              </div>
            {/each}
          </div>
        {/each}

        {#if tournament.thirdPlaceMatch}
          <div class="round">
            <h4>3rd Place Match</h4>
            <div class="match">
              <span class:winner={tournament.thirdPlaceMatch.winner?.id === tournament.thirdPlaceMatch.player1.id}>
                {playerName(tournament.thirdPlaceMatch.player1)}
              </span>
              <span class="vs">vs</span>
              <span class:winner={tournament.thirdPlaceMatch.winner?.id === tournament.thirdPlaceMatch.player2.id}>
                {playerName(tournament.thirdPlaceMatch.player2)}
              </span>
              <span class="result">→ {playerName(tournament.thirdPlaceMatch.winner)} wins</span>
            </div>
          </div>
        {/if}
      </div>

      <Rankings {tournament} />
    {/if}
  </section>
{/if}

<style>
  .players-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin: 16px 0;
  }
  .checkbox-row { display: block; margin: 4px 0; }
  .actions { margin: 16px 0; display: flex; gap: 10px; align-items: center; }
  .hint { color: #888; font-size: 13px; }
  .bracket { display: flex; gap: 20px; overflow-x: auto; margin: 20px 0; }
  .round {
    background: white;
    border-radius: 8px;
    padding: 12px;
    min-width: 220px;
  }
  .match {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .match .vs { color: #999; margin: 0 6px; }
  .match .winner { font-weight: bold; color: #16a085; }
  .match .result { display: block; margin-top: 4px; color: #2c3e50; font-size: 12px; }
</style>