<script>
  import { players } from './stores.js';
  import { uid } from './utils.js';

  let name = '';
  let email = '';
  let rating = 1200;
  let editingId = null;

  function resetForm() {
    name = '';
    email = '';
    rating = 1200;
    editingId = null;
  }

  function addOrUpdate() {
    if (!name.trim()) return;
    if (editingId) {
      players.update((all) =>
        all.map((p) => (p.id === editingId ? { ...p, name, email, rating: Number(rating) } : p))
      );
    } else {
      players.update((all) => [...all, { id: uid(), name, email, rating: Number(rating) }]);
    }
    resetForm();
  }

  function edit(p) {
    editingId = p.id;
    name = p.name;
    email = p.email;
    rating = p.rating;
  }

  function remove(id) {
    if (!confirm('Delete this player?')) return;
    players.update((all) => all.filter((p) => p.id !== id));
  }
</script>

<section>
  <h2>Players</h2>

  <form on:submit|preventDefault={addOrUpdate} class="player-form">
    <input placeholder="Name" bind:value={name} required />
    <input placeholder="Email" type="email" bind:value={email} />
    <input placeholder="Rating" type="number" bind:value={rating} min="0" />
    <button type="submit">{editingId ? 'Update' : 'Add'} Player</button>
    {#if editingId}
      <button type="button" class="secondary" on:click={resetForm}>Cancel</button>
    {/if}
  </form>

  {#if $players.length === 0}
    <p>No players yet. Add one above.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Rating</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {#each $players as p (p.id)}
          <tr>
            <td>{p.name}</td>
            <td>{p.email || '-'}</td>
            <td>{p.rating}</td>
            <td>
              <button class="secondary" on:click={() => edit(p)}>Edit</button>
              <button class="danger" on:click={() => remove(p.id)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<style>
  .player-form {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
</style>