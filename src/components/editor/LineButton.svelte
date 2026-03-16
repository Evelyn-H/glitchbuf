<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  let {
    class: className = '',
    onpointerdown = (e: PointerEvent) => e.preventDefault(),
    children,
    ...rest
  }: Omit<HTMLButtonAttributes, 'type'> & { children: Snippet } = $props();
</script>

<button type="button" class="line-btn {className}" {onpointerdown} {...rest}
  >{@render children()}</button
>

<style>
  .line-btn {
    background: none;
    border: none;
    color: var(--fg-dim);
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    width: 1.2rem;
    height: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex-shrink: 0;
    user-select: none;
  }

  :global(.editor-line:hover) .line-btn {
    opacity: 0.7;
  }

  .line-btn:hover {
    opacity: 1 !important;
    color: var(--fg);
    background: var(--btn-hover);
  }
</style>
