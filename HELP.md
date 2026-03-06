# glitchbuf — using the app

## Loading an image

Click **Choose File** and pick any image. The canvas updates immediately after loading.

## The seed field

The seed drives every random decision in your script (`rand`, `shuffle`, `noise`, etc.). Two runs with the same seed and the same script produce identical output.

- Edit the seed manually to pin a value and get reproducible results.
- Click **New** to randomise the seed and re-run — useful for exploring variations.

## Run button

Click **Run** (or press **Ctrl+Enter**) to force a re-run of the current script. This is also the fastest way to surface errors — they appear in the status bar below the script.

The canvas updates automatically as you type whenever the script is valid, so you only need **Run** to force a re-run or to see why something errored.

## New button

Randomises the seed and re-runs the script. Equivalent to changing the seed by hand and hitting Run.

## Script editor

Write glitchsp code in the text area. See [GLITCHSP.md](GLITCHSP.md) for the language reference and [EFFECTS.md](EFFECTS.md) for all available effects.

**Ctrl+/** toggles line comments on the selected lines (or the current line if nothing is selected). Lines that are already commented get uncommented; uncommented lines get a `#` prefix added.

## Canvas

The canvas on the right shows the processed image. It scales to fill the available space — the underlying pixel data is not affected by display size.
