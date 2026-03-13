<script lang="ts">
  import type { Snippet } from 'svelte';
  import Dialog from './Dialog.svelte';

  type Ctx = { done: (result: unknown) => void };

  let { msg, body, buttons, onclose, ...rest }: {
    msg?: Snippet;
    body?: Snippet<[Ctx]>;
    buttons: Snippet<[Ctx]>;
    onclose: (result: unknown) => void;
    [key: string]: unknown;
  } = $props();

  function done(result: unknown) {
    onclose(result);
  }
</script>

<Dialog open={true} onclose={() => done(null)} {...rest}>
  {#if msg}<p class="msg">{@render msg()}</p>{/if}
  {#if body}{@render body({ done })}{/if}
  <div class="buttons">{@render buttons({ done })}</div>
</Dialog>

<style>
  .msg { margin: 0 0 12px; }
  .buttons { display: flex; gap: 8px; justify-content: flex-end; }
</style>
