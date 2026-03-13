<script lang="ts">
  import { getAppContext } from '../context';

  const ctx = getAppContext();

  function randomise(): void {
    ctx.state.seed = String(Math.floor(Math.random() * 0x100000000) >>> 0);
    ctx.runImage(true);
  }
</script>

<div class="field seed-row">
  <label for="seed">seed</label>
  <input id="seed" type="text" spellcheck="false" bind:value={ctx.state.seed} />
  <button type="button" onclick={randomise}>randomise</button>
</div>

<style>
  .seed-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 3px 6px;
  }

  label {
    grid-column: 1 / -1;
  }
</style>
