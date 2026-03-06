# glitchsp language reference

glitchsp is a small Lisp that operates on the image's raw byte buffer (RGB, left-to-right, top-to-bottom). There is no explicit buffer argument — every effect implicitly targets the current buffer.

## Syntax

**Bare lines** — a line that doesn't start with `(` is an implicit call:

```
noise -20
bitcrush 4
```

**Parenthesized forms** — use `(op args...)` for nesting:

```
(echo (* 5 (rand)) -6)
```

Both forms can be mixed freely. Multi-line expressions are supported; parentheses are balanced across lines before evaluating.

**Comments** — `#` starts a line comment:

```
# this is a comment
noise -20  # inline comment
```

## Special forms

These are evaluated lazily — their bodies are not evaluated until the form needs them.

### `select start end body`

Apply `body` to the byte sub-slice `[start, end)` where `start` and `end` are 0–100 percentages of the buffer.

```
select 0 50 (invert)
select 20 80 (do
  (noise -20)
  (bitcrush 4))
```

### `repeat n body`

Evaluate `body` n times in sequence.

```
repeat 3 (echo 5 -12)
```

### `channel ch body`

Apply `body` to a single RGB channel. `ch` is 0 (R), 1 (G), or 2 (B) — use the `R`, `G`, `B` constants.

```
channel R (invert)
channel B (bitcrush 3)
```

### `stride size skip body`

Apply `body` to chunks of `size` percent, skipping `skip` chunks between each application. Useful for banded effects.

```
stride 10 1 (invert)   # invert every other 10% band
```

### `mix wet body`

Evaluate `body`, then blend its result with the pre-body snapshot at ratio `wet` (0–1).

```
mix 0.5 (bitcrush 2)   # 50% blend of bitcrushed with original
```

### `do form ...`

Evaluate forms in sequence, return the last value. Useful for grouping multiple ops.

```
select 30 70 (do
  (reverb 0.8 5000)
  (noise -30))
```

### `let [sym val ...] body?`

Without a body, binds names into the current environment — they stay accessible for all subsequent top-level forms. With a body, creates a local scope and evaluates `body` inside it. Multiple bindings are allowed in both forms.

```
# top-level definition — crunch is available afterwards
let [crunch (fn [] (do (bitcrush 4) (noise -30)))]
select 0 50 (crunch)
select 60 90 (crunch)

# scoped — x is only visible inside the echo call
let [x 10 g -6] (echo x g)
```

### `fn [params...] body`

Create a function that closes over the current environment.

```
let [crunch (fn [] (do (bitcrush 4) (noise -30)))]
select 0 50 (crunch)
select 60 90 (crunch)
```

### `if cond then else?`

Conditional. `else` branch is optional (returns null if omitted and condition is false).

```
if (> (rand) 0.5) (bitcrush 4) (noise -20)
```

## Language builtins

### `rand`, `rand n`

Seeded random number. `(rand)` returns 0–1; `(rand n)` returns 0–n. Uses the seed from the seed field — same seed always gives the same sequence.

```
noise (* -10 (rand 3))
if (> (rand) 0.5) (invert) (reverse)
```

### Channel constants

`R` = 0, `G` = 1, `B` = 2. Use with `channel` and `transpose`.

```
channel G (bitcrush 3)
transpose R 10 5
```

### Arithmetic

`+ - * / mod` — standard numeric operations.

```
echo (* 3 (rand 10)) (- 0 6)
```

### Comparison

`< > <= >= =` — return true/false.

```
if (>= (rand) 0.8) (bitcrush 2)
```

### Logic

`not` — negates a boolean.

```
if (not (> (rand) 0.5)) (invert)
```

### `clamp v lo hi`

Clamp a number to the range `[lo, hi]`.

```
noise (clamp (* -5 (rand 8)) -40 -6)
```

## Examples

```
# simple glitch stack
noise -24
bitcrush 3
reverse

# banded distortion with wet mix
mix 0.6 (do
  (select 0 50 (distort 8))
  (select 50 100 (reverb 0.9 3000)))

# channel-split shift
transpose R 5 0
transpose B -5 0

# random effect each run
if (> (rand) 0.5)
  (sort 60)
  (shuffle 30)

# reusable function applied to two regions
let [crunch (fn [] (do (bitcrush 4) (noise -30)))]
select 0 50 (crunch)
select 60 90 (crunch)
```
