# pxt-more-music

A MakeCode extension that expands the native `music` namespace. It provides low-level control over the synthesizer engine, allowing you to build custom instruments using envelopes, LFOs, and custom wave shapes, as well as handle polyphonic chords.

## Usage

### Custom Sound Blocks

#### Envelope
`music.envelope(attack, decay, sustain, release, peak)`
Creates a volume or pitch modulation envelope.
* `attack`: The time (ms) it takes for the signal to rise from zero to its absolute maximum level. Default: `0`
* `decay`: The time (ms) it takes for the signal to fall from its peak level down to the sustain level. Default: `0`
* `sustain`: The constant level the signal maintains while active (0-1024). Default: `1024`
* `release`: The time (ms) it takes for the signal to fade back down to zero after stopping. Default: `5`
* `peak`: The highest amplitude value reached at the end of the attack phase (0-1024). Default: `1024`

#### LFO (Low Frequency Oscillator)
`music.lfo(frequency, amplitude)`
Creates an oscillator to modulate volume or pitch.
* `frequency`: How fast the oscillator repeats. Default: `0`
* `amplitude`: How big the modulation wave is. Default: `0`

#### Key
`music.key(key, octave)`
Converts a chosen piano roll key and octave register into a raw pitch value.
* `key`: The target key (C through B, or None for rests).
* `octave`: The numeric octave position. Default: `4`

#### Create Instrument
`music.createInstrument(waveform, ampEnv, pitchEnv, ampLfo, pitchLfo, octave)`
Compiles your parameters into a 28-byte synthesizer data structure compatible with MakeCode's audio sequencer.
* `waveform`: Selection from the `Waveshape` menu (e.g., Sine, Triangle, Sawtooth, Tuned Noise).
* `ampEnv`: A `music.envelope` array for volume.
* `pitchEnv`: A `music.envelope` array for pitch.
* `ampLfo`: A `music.lfo` array for tremolo.
* `pitchLfo`: A `music.lfo` array for vibrato.
* `octave`: Base pitch shift modifier. Default: `0`

#### Create Note
`music.createNote(notes, duration, volume)`
Generates a structured `SongNote` tracking object that contains custom MIDI pitch values for a single note or layered chord.
* `notes`: An array of numeric pitch values (generated via `music.key`).
* `duration`: Lifespan window of the playback in milliseconds. Default: `200`
* `volume`: Master gain scaling value (0-1024). Default: `1024`

#### Play Notes
`music.playNotes(instrument, notes)`
Iterates sequentially through an array of `SongNote` blocks, triggering notes or stacked polyphonic chords over time on your custom instrument.

---

## TypeScript Example

```typescript
// 1. Create a custom instrument (Triangle wave with a fast attack)
let myAmpEnv = music.envelope(10, 50, 800, 100, 1024)
let noPitchEnv = music.envelope(0, 0, 0, 0, 0)
let noLfo = music.lfo(0, 0)

let synthVoice = music.createInstrument(
    Waveshape.Triangle,
    myAmpEnv,
    noPitchEnv,
    noLfo,
    noLfo,
    0
)

// 2. Build individual notes and chords
let note1 = music.createNote([music.key(Key.C, 4)], 200, 1024)
let chord1 = music.createNote([music.key(Key.C, 4), music.key(Key.E, 4), music.key(Key.G, 4)], 400, 800)

// 3. Play the sequence
music.playNotes(synthVoice, [note1, chord1])
```

## Supported Targets

* for PXT/microbit
* for PXT/arcade

## License

MIT
