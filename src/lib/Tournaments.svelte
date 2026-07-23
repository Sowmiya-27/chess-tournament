<script>
  import { tournaments } from './stores.js';
  import { view } from './stores.js';
  import { uid } from './utils.js';

  let name = '';
  let date = '';
  let editingId = null;

  function resetForm() {
    name = '';
    date = '';
    editingId = null;
  }

  function addOrUpdate() {
    if (!name.trim()) return;
    if (editingId) {
      tournaments.update((all) =>
        all.map((t) => (t.id === editingId ? { ...t, name, date } : t))
      );
    } else {
      tournaments.update((all) => [
        ...all,
        { id: uid(), name, date, status: 'pending', playerIds: [], rounds: [], thirdPlaceMatch: null }
      ]);
    }
    resetForm();
  }

  function edit(t) {
    editingId = t.id;
    name = t.name;
    date = t.date;
  }

  function remove(id) {
    if (!confirm('Delete this tournament?')) return;
    tournaments.update((all) => all.filter((t) => t.id !== id));
  }

  function open(id) {
    view.set({ page: 'tournamentDetail', tournamentId: id });
  }
</script>

<section>
  <h2>Tournaments</h2>

  <form on:submit|preventDefault={addOrUpdate} class="t-form">
    <input placeholder="Tournament name" bind:value={name} required />
    <input type="date" bind:value={date} />
    <button type="submit">{editingId ? 'Update' : 'Create'} Tournament</button>
    {#if editingId}
      <button type="button" class="secondary" on:click={resetForm}>Cancel</button>
    {/if}
  </form>

  {#if $tournaments.length === 0}
    <p>No tournaments yet. Create one above.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Name</th><th>Date</th><th>Players</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {#each $tournaments as t (t.id)}
          <tr>
            <td>{t.name}</td>
            <td>{t.date || '-'}</td>
            <td>{t.playerIds.length}</td>
            <td>{t.status}</td>
            <td>
              <button on:click={() => open(t.id)}>Open</button>
              <button class="secondary" on:click={() => edit(t)}>Edit</button>
              <button class="danger" on:click={() => remove(t.id)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<style>
  .t-form {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
</style>