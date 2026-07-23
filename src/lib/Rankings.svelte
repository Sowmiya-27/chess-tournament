<script>
  export let tournament;

  $: finalRound = tournament?.rounds?.[tournament.rounds.length - 1];
  $: finalMatch = finalRound?.[0];
  $: first = finalMatch?.winner;
  $: second = finalMatch?.loser;
  $: third = tournament?.thirdPlaceMatch?.winner;
</script>

{#if tournament?.status === 'completed'}
  <div class="rankings">
    <h3>🏆 Final Rankings</h3>
    <ol>
      <li class="gold">🥇 1st Place: {first?.name ?? '-'}</li>
      <li class="silver">🥈 2nd Place: {second?.name ?? '-'}</li>
      <li class="bronze">🥉 3rd Place: {third ? third.name : 'N/A (not enough players)'}</li>
    </ol>
  </div>
{/if}

<style>
  .rankings {
    background: white;
    border-radius: 8px;
    padding: 16px 20px;
    margin-top: 20px;
  }
  ol { list-style: none; padding: 0; }
  li { padding: 6px 0; font-size: 16px; }
  .gold { color: #b8860b; font-weight: bold; }
  .silver { color: #777; font-weight: bold; }
  .bronze { color: #a0522d; font-weight: bold; }
</style>