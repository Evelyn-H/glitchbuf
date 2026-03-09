# glitchbuf — using the app

## loading an image

click **choose file** and pick any image. the canvas updates immediately after loading.

## the seed field

the seed drives every random decision in your script (`rand`, `shuffle`, `noise`, etc.). two runs with the same seed and the same script produce identical output.

- edit the seed manually to pin a value and get reproducible results.
- click **randomise** to randomise the seed and re-run — useful for exploring variations.

## run button

click **run** (or press **Ctrl+Enter**) to force a re-run of the current script. this is also the fastest way to surface errors — they appear in the status bar below the script.

the canvas updates automatically as you type whenever the script is valid, so you only need **run** to force a re-run or to see why something errored.

## script editor

write glitchsp code in the text area. see [GLITCHSP.md](GLITCHSP.md) for the language reference and [EFFECTS.md](EFFECTS.md) for all available effects.

**Ctrl+/** toggles line comments on the selected lines (or the current line if nothing is selected). lines that are already commented get uncommented; uncommented lines get a `#` prefix added.

## canvas

the canvas on the right shows the processed image. it scales to fill the available space — the underlying pixel data is not affected by display size.
