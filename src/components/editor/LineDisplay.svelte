<script lang="ts">
  import { tokenizeForDisplay, findParamAtOffset, sLog, sExp, ParamType } from '../../editor';

  let {
    block,
    onenteredit,
    oneffectclick,
    onblockchange,
  }: {
    block: string;
    onenteredit: (point?: { x: number; y: number }) => void;
    oneffectclick: (name: string, offset: number) => void;
    onblockchange: (newBlock: string, commit: boolean) => void;
  } = $props();

  const toks = $derived(tokenizeForDisplay(block));

  let pendingEffectClick: { name: string; offset: number } | null = null;

  function startScrub(e: PointerEvent, spanEl: HTMLElement): void {
    const origText = spanEl.textContent!;
    const origVal = parseFloat(origText);
    if (isNaN(origVal)) return;

    const offset = parseInt(spanEl.dataset.offset!);
    const origLen = parseInt(spanEl.dataset.origLen!);
    const blockBefore = block.slice(0, offset);
    const blockAfter = block.slice(offset + origLen);

    const param = findParamAtOffset(block, offset);
    const isLog = param?.type === ParamType.log;
    const step = param?.step;
    const abs = Math.abs(origVal);
    const scale = abs >= 100 ? 1 : abs >= 1 ? 0.1 : 0.01;
    const logScale = isLog ? (sLog(param!.max) - sLog(param!.min)) / 768 : 0;
    const decimals =
      step !== undefined
        ? (String(step).split('.')[1] ?? '').length
        : (origText.split('.')[1] ?? '').length;

    const startX = e.clientX;
    let moved = false;
    let lastBlock = block;

    spanEl.setPointerCapture(e.pointerId);

    function onMove(me: PointerEvent) {
      if (Math.abs(me.clientX - startX) > 3) moved = true;
      if (!moved) return;
      let v: number;
      if (isLog) {
        v = sExp(sLog(origVal) + (me.clientX - startX) * logScale);
        v = Math.max(param!.min, Math.min(param!.max, v));
        v = parseFloat(v.toPrecision(3));
      } else {
        v = origVal + (me.clientX - startX) * scale;
        if (step !== undefined) v = Math.round(v / step) * step;
        if (param) v = Math.max(param.min, Math.min(param.max, v));
        v = decimals === 0 ? Math.round(v) : parseFloat(v.toFixed(decimals));
      }
      const newStr = String(v);
      spanEl.textContent = newStr;
      lastBlock = blockBefore + newStr + blockAfter;
      onblockchange(lastBlock, false);
    }

    function onUp() {
      spanEl.removeEventListener('pointermove', onMove);
      spanEl.removeEventListener('pointerup', onUp);
      if (!moved) {
        onenteredit();
      } else {
        onblockchange(lastBlock, true);
      }
    }

    spanEl.addEventListener('pointermove', onMove);
    spanEl.addEventListener('pointerup', onUp);
  }

  function handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;

    if (target.classList.contains('tok-num')) {
      e.preventDefault();
      startScrub(e, target);
      return;
    }

    if (target.classList.contains('tok-effect')) {
      e.preventDefault();
      pendingEffectClick = {
        name: target.textContent!.toLowerCase(),
        offset: parseInt(target.dataset.offset!),
      };
      return;
    }

    e.preventDefault();
    onenteredit({ x: e.clientX, y: e.clientY });
  }

  function handlePointerUp() {
    if (pendingEffectClick !== null) {
      const { name, offset } = pendingEffectClick;
      pendingEffectClick = null;
      oneffectclick(name, offset);
    }
  }

  function handlePointerCancel() {
    pendingEffectClick = null;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') return;
    if (e.key === 'Enter' || (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1)) {
      e.preventDefault();
      onenteredit();
    }
  }

  function handleFocus() {
    onenteredit();
  }
</script>

<div
  class="line-display"
  tabindex="0"
  role="textbox"
  aria-multiline="true"
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
  onkeydown={handleKeyDown}
  onfocus={handleFocus}
>
  {#if !block.trim()}
    &#x200b;
  {:else}
    {#each toks as tok (tok.offset)}
      {#if tok.type === 'plain'}
        {tok.text}
      {:else if tok.type === 'num'}
        <span class="tok-num" data-offset={tok.offset} data-orig-len={tok.text.length}
          >{tok.text}</span
        >
      {:else if tok.type === 'effect'}
        <span class="tok-effect" data-offset={tok.offset}>{tok.text}</span>
      {:else}
        <span class={`tok-${tok.type}`}>{tok.text}</span>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .line-display {
    white-space: pre-wrap;
    word-break: break-all;
    min-height: 1.5em;
    outline: none;
    cursor: text;
  }

  .tok-effect {
    cursor: pointer;
    border-bottom: 1px dotted var(--fg-dim);
  }

  .tok-effect:hover {
    border-bottom-color: var(--fg);
  }

  .tok-num {
    cursor: ew-resize;
    color: #8ab4d4;
  }

  .tok-num:hover {
    color: var(--accent);
  }

  .tok-paren {
    color: var(--fg-dim);
  }

  .tok-comment {
    color: var(--fg-dim);
    font-style: italic;
  }
</style>
