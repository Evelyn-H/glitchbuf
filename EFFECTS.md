# glitchbuf effects reference

All effects are available as glitchsp ops.

---

## Audio effects

These treat pixel bytes as audio samples (mapped to -1..1), apply the effect, then map back.

### `bitcrush bits`

`bits` — bit depth (1–8)

Quantises each byte to 2^n discrete levels by zeroing the lower bits. Low values (1–3) produce harsh banding; higher values are subtler.

### `noise db`

`db` — amplitude in decibels (e.g. -30 = subtle, -6 = heavy)

Adds gaussian noise scaled by the given amplitude. Seeded — same seed gives identical noise pattern.

### `echo delay gain`

`delay` — delay length (0–100, percent of buffer length)
`gain` — echo amplitude in dB (negative = quieter)

Single echo: copies the signal forward by `delay` and mixes it in at `gain` dB. Stacking multiple `echo` calls produces multi-tap effects.

### `reverb size dampening`

`size` — room size (0–1)
`dampening` — high-frequency damping (Hz)

Freeverb plate reverb. Smears bytes across the buffer with a spatialised tail. Freeverb is a deterministic algorithm — output is fully reproducible given the same parameters. Use `mix` to blend with the original.

### `tremolo rate depth`

`rate` — number of LFO oscillations across the buffer
`depth` — modulation depth (0–1; 0 = no effect, 1 = full swing)

Sinusoidal amplitude modulation. Creates periodic bright/dark banding patterns.

### `distort drive`

`drive` — saturation amount (~1 = clean, ~10 = heavy crunch)

Soft-clip via tanh. Compresses extreme byte values and adds harmonic-like distortion to the pixel data.

### `chorus rate depth wet`

`rate` — LFO oscillation count
`depth` — modulation width (0–100)
`wet` — wet/dry mix (0–1)

Mixes the signal with a time-shifted copy modulated by an LFO. Produces wavy, doubled-image effects.

### `pitchshift semitones`

`semitones` — pitch shift amount (e.g. -12 to 12)

Time-preserving pitch shift via Tone.js. Stretches or compresses frequency content without changing buffer length.

### `phaser freq octaves base`

`freq` — LFO rate in Hz
`octaves` — sweep width in octaves
`base` — center frequency in Hz

All-pass filter cascade swept by an LFO. Creates sweeping phase-cancellation patterns.

### `freqshift freq`

`freq` — shift amount in Hz (positive = up, negative = down)

Shifts all frequencies up or down by a fixed Hz amount. Unlike pitchshift, this is not harmonic — it warps tonal relationships.

### `vibrato freq depth`

`freq` — LFO rate in Hz
`depth` — modulation depth (0–1)

LFO pitch wobble via delay modulation. Produces wavy, unstable distortion across the image.

### `chebyshev order`

`order` — harmonic order (1–100; 1 = clean, ~50 = harsh)

Chebyshev waveshaper — adds nth-order harmonics. Higher orders produce increasingly complex, aliased-looking patterns.

### `autowah base octave sensitivity`

`base` — center frequency in Hz
`octave` — sweep range in octaves
`sensitivity` — envelope follower sensitivity in dB

Envelope-follower sweeps a bandpass filter based on signal amplitude. Produces dynamic, reactive distortion.

### `feedbackdelay delay feedback`

`delay` — delay time (0–100, percent of buffer length)
`feedback` — feedback amount (0–1)

Recirculating delay with feedback. Builds up repeating echoes that accumulate across the buffer.

---

## Byte effects & transforms

Operate directly on the raw byte stream.

### `invert`

No arguments.

Inverts every byte (`255 - x`). Produces a photographic negative effect.

### `reverse`

No arguments.

Reverses the entire byte stream. Flips the image data end-to-end (not a mirror — RGB triples are split across the boundary).

### `copy start end destination`

`start` — source start (0–100)
`end` — source end (0–100)
`destination` — destination start (0–100)

Copies the byte slice `[start, end)` to `destination`, overwriting whatever is there. Useful for duplicating regions or creating glitch repetitions.

### `quantize n`

`n` — number of discrete levels (any integer ≥ 2)

Quantises each byte to n evenly-spaced levels across 0–255. Lower values produce more pronounced posterisation.

### `fold drive`

`drive` — fold amount (≤0.5 = passthrough, ~1 = one fold, higher = chaotic)

Wavefolder: reflects byte values back at the 0 and 255 boundaries. Low drive is subtle; high drive creates recursive folding patterns.

### `solarize threshold`

`threshold` — inversion threshold (0–1 fraction of 255)

Inverts bytes above the threshold, leaving others unchanged. Mimics the darkroom solarization technique.

### `xor value`

`value` — XOR mask (0–255)

XORs every byte against the given value. `85` (01010101) and `170` (10101010) produce structured checkerboard-like bit patterns.

---

## Pixel effects & transforms

Operate on whole RGB pixels or 2D image structure.

### `sort threshold`

`threshold` — luma threshold (-100 to 100)

Sorts pixels by luminance within each row. Positive threshold: sorts runs of pixels brighter than `threshold`%. Negative: sorts runs darker than `abs(threshold)`%. Creates the classic pixel-sorting glitch look.

### `sortvertical threshold`

`threshold` — luma threshold (-100 to 100)

Same as `sort` but operates on columns instead of rows.

### `smear amount decay`

`amount` — smear length (0–100, percent of pixel count)
`decay` — how much the peak value persists (0 = no smear, 1 = hold forever)

Peak-follower smear: propagates the running maximum value forward with exponential decay, per channel. Creates horizontal streaking/bleeding.

### `shuffle amount`

`amount` — fraction of pixels to swap (0–100)

Randomly swaps whole RGB pixels. Seeded — same seed gives the same shuffle. Higher values approach full randomisation.

### `transpose channel dx dy`

`channel` — channel to shift (`R`, `G`, or `B`)
`dx` — horizontal shift (percent of image width; negative shifts left)
`dy` — vertical shift (percent of image height; negative shifts up)

Shifts one colour channel by `dx`/`dy`, wrapping toroidally. Displacing R, G, and B by different amounts creates chromatic aberration.

### `rescale width height` / `resize width height`

`width` — target width in pixels
`height` — target height in pixels (optional — omit to preserve aspect ratio)

Resizes the image to `w × h`. The new dimensions become the working buffer for all subsequent ops.
