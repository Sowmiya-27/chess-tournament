<script>
  import Players from './lib/Players.svelte';
  import Tournaments from './lib/Tournaments.svelte';
  import TournamentDetail from './lib/TournamentDetail.svelte';
  import { view } from './lib/stores.js';
</script>

<main>
  <h1>♟️ Chess Tournament Manager</h1>

  <nav>
    <button
      class:active={$view.page === 'players'}
      on:click={() => view.set({ page: 'players', tournamentId: null })}
    >Players</button>
    <button
      class:active={$view.page === 'tournaments' || $view.page === 'tournamentDetail'}
      on:click={() => view.set({ page: 'tournaments', tournamentId: null })}
    >Tournaments</button>
  </nav>

  <div class="content">
    {#if $view.page === 'players'}
      <Players />
    {:else if $view.page === 'tournaments'}
      <Tournaments />
    {:else if $view.page === 'tournamentDetail'}
      <button class="secondary" on:click={() => view.set({ page: 'tournaments', tournamentId: null })}>
        &larr; Back to tournaments
      </button>
      <TournamentDetail tournamentId={$view.tournamentId} />
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
  }
  h1 { text-align: center; }
  nav {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 20px;
  }
  nav button.active {
    background: #16a085;
  }
  .content {
    background: transparent;
  }
</style>