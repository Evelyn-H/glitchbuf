# glitchbuf effects reference

all effects are available as glitchsp ops.

---

## audio effects

these treat pixel bytes as audio samples (mapped to -1..1), apply the effect, then map back.

### `bitcrush bits`

`bits` — bit depth (1–8)

quantises each byte to 2^n discrete levels by zeroing the lower bits. low values (1–3) produce harsh banding; higher values are subtler.

### `noise db`

`db` — amplitude in decibels (e.g. -30 = subtle, -6 = heavy)

adds gaussian noise scaled by the given amplitude. seeded — same seed gives identical noise pattern.

### `echo delay gain`

`delay` — delay length (0–100, percent of buffer length)
`gain` — echo amplitude in dB (negative = quieter)

single echo: copies the signal forward by `delay` and mixes it in at `gain` dB. stacking multiple `echo` calls produces multi-tap effects.

### `reverb size dampening`

`size` — room size (0–1)
`dampening` — high-frequency damping (Hz)

Freeverb plate reverb. smears bytes across the buffer with a spatialised tail. Freeverb is a deterministic algorithm — output is fully reproducible given the same parameters. use `mix` to blend with the original.

### `tremolo rate depth`

`rate` — number of LFO oscillations across the buffer
`depth` — modulation depth (0–1; 0 = no effect, 1 = full swing)

sinusoidal amplitude modulation. creates periodic bright/dark banding patterns.

### `distort drive`

`drive` — saturation amount (~1 = clean, ~10 = heavy crunch)

soft-clip via tanh. compresses extreme byte values and adds harmonic-like distortion to the pixel data.

### `chorus rate depth`

`rate` — LFO oscillation count
`depth` — modulation width (0–100)

replaces the signal with a time-shifted copy modulated by an LFO. produces wavy, doubled-image effects.

### `pitchshift semitones`

`semitones` — pitch shift amount (e.g. -12 to 12)

time-preserving pitch shift via Tone.js. stretches or compresses frequency content without changing buffer length.

### `phaser freq octaves base`

`freq` — LFO rate in Hz
`octaves` — sweep width in octaves
`base` — center frequency in Hz

all-pass filter cascade swept by an LFO. creates sweeping phase-cancellation patterns.

### `freqshift freq`

`freq` — shift amount in Hz (positive = up, negative = down)

shifts all frequencies up or down by a fixed Hz amount. unlike pitchshift, this is not harmonic — it warps tonal relationships.

### `vibrato freq depth`

`freq` — LFO rate in Hz
`depth` — modulation depth (0–1)

LFO pitch wobble via delay modulation. produces wavy, unstable distortion across the image.

### `chebyshev order`

`order` — positive = odd harmonic orders (0→1, 1→3, 2→5…), negative = even (−1→2, −2→4…)

chebyshev waveshaper — adds upper harmonics. odd orders are asymmetric and saturating; even orders are symmetric and more aliased. higher magnitude = more complex patterns.

### `autowah base octave sensitivity`

`base` — center frequency in Hz
`octave` — sweep range in octaves
`sensitivity` — envelope follower sensitivity in dB

envelope-follower sweeps a bandpass filter based on signal amplitude. produces dynamic, reactive distortion.

### `feedbackdelay delay feedback`

`delay` — delay time (0–100, percent of buffer length)
`feedback` — feedback amount (0–1)

recirculating delay with feedback. builds up repeating echoes that accumulate across the buffer.

---

## byte effects & transforms

operate directly on the raw byte stream.

### `invert`

no arguments.

inverts every byte (`255 - x`). produces a photographic negative effect.

### `reverse`

no arguments.

reverses the entire byte stream. flips the image data end-to-end (not a mirror — RGB triples are split across the boundary).

### `copy start end destination`

`start` — source start (0–100)
`end` — source end (0–100)
`destination` — destination start (0–100)

copies the byte slice `[start, end)` to `destination`, overwriting whatever is there. useful for duplicating regions or creating glitch repetitions.

### `quantize n`

`n` — number of discrete levels (any integer ≥ 2)

quantises each byte to n evenly-spaced levels across 0–255. lower values produce more pronounced posterisation.

### `fold drive`

`drive` — fold amount (≤0.5 = passthrough, ~1 = one fold, higher = chaotic)

wavefolder: reflects byte values back at the 0 and 255 boundaries. low drive is subtle; high drive creates recursive folding patterns.

### `solarize threshold`

`threshold` — inversion threshold (0–1 fraction of 255)

inverts bytes above the threshold, leaving others unchanged. mimics the darkroom solarization technique.

### `xor value`

`value` — XOR mask (0–255)

XORs every byte against the given value. `85` (01010101) and `170` (10101010) produce structured checkerboard-like bit patterns.

---

## pixel effects & transforms

operate on whole RGB pixels or 2D image structure.

### `sort threshold`

`threshold` — luma threshold (-100 to 100)

sorts pixels by luminance within each row. positive threshold: sorts runs of pixels brighter than `threshold`%. negative: sorts runs darker than `abs(threshold)`%. creates the classic pixel-sorting glitch look.

### `sortvertical threshold`

`threshold` — luma threshold (-100 to 100)

same as `sort` but operates on columns instead of rows.

### `smear amount decay`

`amount` — smear length (0–100, percent of pixel count)
`decay` — how much the peak value persists (0 = no smear, 1 = hold forever)

peak-follower smear: propagates the running maximum value forward with exponential decay, per channel. creates horizontal streaking/bleeding.

### `shuffle amount`

`amount` — fraction of pixels to swap (0–100)

randomly swaps whole RGB pixels. seeded — same seed gives the same shuffle. higher values approach full randomisation.

### `transpose channel dx dy`

`channel` — channel to shift (`R`, `G`, or `B`)
`dx` — horizontal shift (percent of image width; negative shifts left)
`dy` — vertical shift (percent of image height; negative shifts up)

shifts one colour channel by `dx`/`dy`, wrapping toroidally. displacing R, G, and B by different amounts creates chromatic aberration.

### `rescale width height` / `resize width height`

`width` — target width in pixels
`height` — target height in pixels (optional — omit to preserve aspect ratio)

resizes the image to `w × h`. the new dimensions become the working buffer for all subsequent ops.
