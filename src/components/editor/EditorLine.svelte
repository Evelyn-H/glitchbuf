<script lang="ts">
  import { tick } from 'svelte';
  import { splitIntoBlocks } from '../../glitchsp';
  import { OP_MAP } from '../../ops';
  import {
    getEditText,
    placeCaretAtEnd,
    placeCaretAtPoint,
    selectionCharOffsets,
    setCaretOffset,
    findExprBounds,
  } from '../../editor';
  import LineDisplay from './LineDisplay.svelte';
  import LineButton from './LineButton.svelte';
  import type { EffectModalApi } from './types';

  let {
    block,
    lineIndex,
    linesCount,
    isDragging,
    isDragOver,
    modal,
    onblockchange,
    ondelete,
    onreplaceblocks,
    oninsertafter,
    onfocusdelta,
    onenterraw,
    ondragstart,
    ondragmove,
    ondragend,
  }: {
    block: string;
    lineIndex: number;
    linesCount: number;
    isDragging: boolean;
    isDragOver: boolean;
    modal: EffectModalApi | null;
    onblockchange: (newBlock: string, commit: boolean) => void;
    ondelete: (focusDir: number) => void;
    onreplaceblocks: (blocks: string[]) => void;
    oninsertafter: (text: string) => void;
    onfocusdelta: (delta: number) => void;
    onenterraw: () => void;
    ondragstart: (idx: number) => void;
    ondragmove: (e: PointerEvent) => void;
    ondragend: () => void;
  } = $props();

  type EditState = 'display' | 'entering' | 'editing' | 'deleting';
  let editState = $state<EditState>('display');
  let editEl = $state<HTMLDivElement | undefined>(undefined);
  let lineEl = $state<HTMLDivElement | undefined>(undefined);

  function enterEdit(point?: { x: number; y: number }): void {
    if (editState === 'editing') {
      if (point && editEl) placeCaretAtPoint(editEl, point.x, point.y);
      return;
    }
    editState = 'entering';
    tick().then(() => {
      editState = 'editing';
      if (!editEl) return;
      // eslint-disable-next-line svelte/no-dom-manipulating
      editEl.textContent = block;
      editEl.focus();
      if (point) placeCaretAtPoint(editEl, point.x, point.y);
      else placeCaretAtEnd(editEl);
    });
  }

  function commitEdit(): void {
    if (editState !== 'editing') return;
    const text = getEditText(editEl!);
    editState = 'display';
    if (text === '' && linesCount > 1) {
      editState = 'deleting';
      ondelete(-1);
      return;
    }
    const blocks = splitIntoBlocks(text).filter((b) => b.trim());
    if (blocks.length > 1) {
      onreplaceblocks(blocks);
      return;
    }
    onblockchange(text || block, true);
  }

  function handleFocusOut(e: FocusEvent): void {
    if (editState !== 'editing') return;
    if (e.relatedTarget !== null && lineEl!.contains(e.relatedTarget as Node)) return;
    commitEdit();
  }

  function handleEffectClick(name: string, offset: number): void {
    const meta = OP_MAP.get(name);
    if (!meta) return;
    const exprRange = findExprBounds(block, offset);
    const currentText = block.slice(exprRange.start, exprRange.end);
    modal?.open({
      kind: 'edit',
      meta,
      currentText,
      onApply: (result) => {
        const newBlock = block.slice(0, exprRange.start) + result + block.slice(exprRange.end);
        onblockchange(newBlock, true);
      },
    });
  }

  function handleWrap(): void {
    modal?.open({
      kind: 'wrap',
      original: block,
      onApply: (wrapped) => onblockchange(wrapped, true),
    });
  }

  function handleDelete(): void {
    editState = 'deleting';
    ondelete(-1);
  }

  function handleEditInput(): void {
    onblockchange(getEditText(editEl!), false);
  }

  function handleEditPaste(e: ClipboardEvent): void {
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData?.getData('text/plain') ?? '');
  }

  function handleEditKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      const text = getEditText(editEl!);
      const atEnd = selectionCharOffsets(editEl!).start >= text.length;
      const singleLine = !text.includes('\n');
      if (singleLine || atEnd) {
        e.preventDefault();
        editState = 'display';
        oninsertafter(text);
      }
      return;
    }

    if (e.key === 'Backspace' && getEditText(editEl!) === '') {
      e.preventDefault();
      editState = 'deleting';
      ondelete(-1);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const text = getEditText(editEl!);
      if (text === '' && linesCount > 1) {
        editState = 'deleting';
        ondelete(e.shiftKey ? -1 : 0);
      } else {
        onblockchange(text, true);
        editState = 'display';
        onfocusdelta(e.shiftKey ? -1 : 1);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      const text = getEditText(editEl!);
      const selText = window.getSelection()?.toString() ?? '';
      if (selText === text) {
        e.preventDefault();
        editState = 'display';
        onenterraw();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const text = getEditText(editEl!);
      const lines = text.split('\n');

      const { start: startChar, end: endChar } = selectionCharOffsets(editEl!);
      let cursorLine = 0,
        cursorCol = 0,
        pos = 0;
      for (let li = 0; li < lines.length; li++) {
        const lineEnd = pos + lines[li].length;
        if (startChar <= lineEnd) {
          cursorLine = li;
          cursorCol = startChar - pos;
          break;
        }
        pos = lineEnd + 1;
      }

      let firstLine = 0,
        lastLine = lines.length - 1;
      pos = 0;
      let foundFirst = false;
      for (let li = 0; li < lines.length; li++) {
        const lineEnd = pos + lines[li].length;
        if (!foundFirst && startChar <= lineEnd) {
          firstLine = li;
          foundFirst = true;
        }
        if (endChar <= lineEnd) {
          lastLine = li;
          break;
        }
        if (li === lines.length - 1) lastLine = li;
        pos = lineEnd + 1;
      }

      const allCommented = lines.slice(firstLine, lastLine + 1).every((l) => /^#/.test(l));
      const newLines = lines.map((l, idx) => {
        if (idx < firstLine || idx > lastLine) return l;
        return allCommented ? l.replace(/^#\s?/, '') : '# ' + l;
      });
      const newText = newLines.join('\n');
      editEl!.textContent = newText;

      let adjustedCol = cursorCol;
      if (cursorLine >= firstLine && cursorLine <= lastLine) {
        if (allCommented) {
          const removed = (lines[cursorLine].match(/^#\s?/) ?? [''])[0].length;
          adjustedCol = Math.max(0, cursorCol - removed);
        } else {
          adjustedCol = cursorCol + 2;
        }
      }
      let newOffset = 0;
      for (let li = 0; li < cursorLine; li++) newOffset += newLines[li].length + 1;
      newOffset += Math.min(adjustedCol, newLines[cursorLine]?.length ?? 0);
      setCaretOffset(editEl!, newOffset);

      onblockchange(newText, false);
      return;
    }
  }
</script>

<div
  class="editor-line"
  class:is-dragging={isDragging}
  class:drag-over={isDragOver}
  data-index={lineIndex}
  bind:this={lineEl}
  onfocusout={handleFocusOut}
>
  <button
    type="button"
    class="drag-handle"
    aria-hidden="true"
    onpointerdown={(e) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      ondragstart(lineIndex);
    }}
    onpointermove={(e) => ondragmove(e)}
    onpointerup={() => ondragend()}>⠿</button
  >

  <LineButton class="wrap-btn" title="wrap in a special form" onclick={handleWrap}>()</LineButton>

  <div class="line-wrap">
    {#if editState === 'display'}
      <LineDisplay
        {block}
        onenteredit={enterEdit}
        oneffectclick={handleEffectClick}
        {onblockchange}
      />
    {:else}
      <div
        class="line-edit"
        role="textbox"
        aria-multiline="true"
        tabindex="0"
        contenteditable="plaintext-only"
        spellcheck={false}
        bind:this={editEl}
        oninput={handleEditInput}
        onpaste={handleEditPaste}
        onkeydown={handleEditKeyDown}
      ></div>
    {/if}
  </div>

  <LineButton class="delete-line-btn" title="remove this block" onclick={handleDelete}>×</LineButton
  >
</div>

<style>
  .editor-line {
    display: flex;
    align-items: flex-start;
    gap: 4px;
  }

  .editor-line.is-dragging {
    opacity: 0.4;
  }

  .editor-line.drag-over {
    border-top: 2px solid var(--fg);
  }

  .drag-handle {
    background: none;
    border: none;
    cursor: grab;
    color: var(--fg-dim);
    padding: 4px 2px;
    user-select: none;
    touch-action: none;
    flex-shrink: 0;
    opacity: 0.4;
  }

  .editor-line:hover .drag-handle {
    opacity: 1;
  }

  .line-wrap {
    flex: 1;
    min-width: 0;
  }

  .line-edit {
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    min-height: 1.5em;
    outline: none;
  }

  .editor-line :global(.wrap-btn) {
    opacity: 0.3;
  }

  .editor-line :global(.delete-line-btn) {
    opacity: 0;
  }
</style>
