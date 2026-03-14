# glitchbuf effects reference

all effects are available as glitchsp ops. click any effect badge in the editor to open its parameter dialog — each param has a description, a randomize toggle, and (where applicable) a disable option.

---

## audio effects

these treat pixel bytes as audio samples (mapped to -1..1), apply the effect, then map back.

`bitcrush` `noise` `echo` `reverb` `tremolo` `distort` `chorus` `pitchshift` `phaser` `freqshift` `vibrato` `chebyshev` `autowah` `feedbackdelay`

---

## filter effects

biquad filters treating the pixel buffer as an audio signal.

`lowpass` `highpass` `bandpass` `lowshelf` `highshelf` `notch`

---

## byte effects & transforms

operate directly on the raw byte stream.

`reverse` `copy` `invert` `quantize` `fold` `solarize` `xor`

---

## pixel effects & transforms

operate on whole RGB pixels or 2D image structure.

`sort` `sortvertical` `smear` `shuffle` `transpose` `rescale` / `resize`
