enum Waveshape {
    //% block="triangle"
    Triangle = 1,
    //% block="sawtooth"
    Sawtooth = 2,
    //% block="sine"
    Sine = 3,
    //% block="tuned noise"
    TunedNoise = 4,
    //% block="noise"
    Noise = 5,
    //% block="square 10"
    Square10 = 11,
    //% block="square 50"
    Square50 = 15,
    //% block="square cycle 16"
    SquareCycle16 = 16,
    //% block="square cycle 32"
    SquareCycle32 = 17,
    //% block="square cycle 64"
    SquareCycle64 = 18
}

enum Key {
    //% block="None"
    None = -1,
    //% block="C"
    C = 1,
    //% block="C#"
    Cs = 2,
    //% block="D"
    D = 3,
    //% block="D#"
    Ds = 4,
    //% block="E"
    E = 5,
    //% block="F"
    F = 6,
    //% block="F#"
    Fs = 7,
    //% block="G"
    G = 8,
    //% block="G#"
    Gs = 9,
    //% block="A"
    A = 10,
    //% block="A#"
    As = 11,
    //% block="B"
    B = 12
}

namespace music {
    /**
     * A structured data container representing a single note or polyphonic chord.
     */
    export class SongNote {
        _notes: number[];
        _dur: number;
        _vol: number;

        /**
         * @param notes An array of numerical MIDI-style pitches.
         * @param dur The duration of the note in milliseconds.
         * @param vol The amplitude volume scaling value (typically 0-1024).
         */
        constructor(notes: number[], dur: number, vol: number) {
            this._notes = notes;
            this._dur = dur;
            this._vol = vol;
        }

        get notes(): number[] { return this._notes }
        set notes(val: number[]) { this._notes = val }

        get dur(): number { return this._dur }
        set dur(val: number) { this._dur = val }

        get vol(): number { return this._vol }
        set vol(val: number) { this._vol = val }
    }

    /**
     * Helper function to turn a Key selection and an Octave into a precise pitch value.
     * @param key The piano roll key offset selection (C through B, or None for rests).
     * @param octave The numeric octave register positioning (defaults to 4).
     */
    //% blockId=music_create_key
    //% block="%key %octave"
    //% blockNamespace=music
    //% octave.defl=4
    //% weight=75
    //% group="Custom Sounds"
    export function key(key: Key, octave: number): number {
        if (key === Key.None) return -1;
        return key + octave * 12;
    }

    /**
     * Renders a custom instrument configuration into a 28-byte synthesizer structure.
     * @param waveform The basic oscillator shape (e.g., Sine, Triangle, Sawtooth).
     * @param ampEnv Volume envelope settings array: [Attack, Decay, Sustain, Release, Peak].
     * @param pitchEnv Pitch modification envelope settings array: [Attack, Decay, Sustain, Release, Peak].
     * @param ampLfo Volume low-frequency oscillator configurations: [Frequency, Amplitude].
     * @param pitchLfo Pitch low-frequency oscillator configurations: [Frequency, Amplitude].
     * @param octave Base pitch shift adjustment multiplier for the instrument.
     */
    //% blockId=music_create_instrument
    //% block="create instrument with waveform %waveform amp envelope %ampEnv pitch envelope %pitchEnv amp LFO %ampLfo pitch LFO %pitchLfo octave %octave"
    //% blockNamespace=music
    //% waveform.defl=Waveshape.Sine
    //% octave.defl=0
    //% ampEnv.shadow="lists_create_with"
    //% pitchEnv.shadow="lists_create_with"
    //% ampLfo.shadow="lists_create_with"
    //% pitchLfo.shadow="lists_create_with"
    //% weight=100
    //% group="Custom Sounds"
    export function createInstrument(
        waveform: Waveshape,
        ampEnv: number[], pitchEnv: number[],
        ampLfo: number[], pitchLfo: number[],
        octave: number
    ): music.sequencer.Instrument {
        if (!ampEnv || ampEnv.length === 0) ampEnv = [0, 0, 1024, 0, 1024];
        if (!pitchEnv || pitchEnv.length === 0) pitchEnv = [0, 0, 0, 0, 0];
        if (!ampLfo || ampLfo.length === 0) ampLfo = [0, 0];
        if (!pitchLfo || pitchLfo.length === 0) pitchLfo = [0, 0];

        let buf = control.createBuffer(28);
        buf[0] = (waveform - 1) & 0xFF;

        buf.setNumber(NumberFormat.UInt16LE, 1, ampEnv[0]);
        buf.setNumber(NumberFormat.UInt16LE, 3, ampEnv[1]);
        buf.setNumber(NumberFormat.UInt16LE, 5, ampEnv[2]);
        buf.setNumber(NumberFormat.UInt16LE, 7, ampEnv[3]);
        buf.setNumber(NumberFormat.UInt16LE, 9, ampEnv[4]);

        buf.setNumber(NumberFormat.UInt16LE, 11, pitchEnv[0]);
        buf.setNumber(NumberFormat.UInt16LE, 13, pitchEnv[1]);
        buf.setNumber(NumberFormat.UInt16LE, 15, pitchEnv[2]);
        buf.setNumber(NumberFormat.UInt16LE, 17, pitchEnv[3]);
        buf.setNumber(NumberFormat.UInt16LE, 19, pitchEnv[4]);

        buf[21] = ampLfo[0] & 0xFF;
        buf.setNumber(NumberFormat.UInt16LE, 22, ampLfo[1]);
        buf[24] = pitchLfo[0] & 0xFF;
        buf.setNumber(NumberFormat.UInt16LE, 25, pitchLfo[1]);
        buf[27] = octave & 0xFF;

        return new music.sequencer.Instrument(buf);
    }

    export function playInstrument(
        instrument: music.sequencer.Instrument,
        freq: number,
        length: number,
        vol: number,
        when: number
    ) {
        music.playInstructions(when, music.sequencer.renderInstrument(
            instrument,
            music.lookupFrequency(freq + instrument.octave * 12),
            length,
            vol
        ))
    }

    /**
     * Iterates through an array of structured SongNote objects and plays them sequentially.
     * @param instrument The synth voice workspace configuration to sound out.
     * @param notes The collection tracking stream of sequential note/chord blocks.
     */
    //% block="play notes on %instrument notes %notes"
    //% blockNamespace=music
    //% instrument.shadow="variables_get"
    //% instrument.defl="myInstrument"
    //% notes.shadow="lists_create_with"
    //% notes.defl="music_create_note"
    //% weight=80
    //% group="Custom Sounds"
    export function playNotes(
        instrument: music.sequencer.Instrument,
        notes: SongNote[]
    ) {
        let timeOffset = 0
        for (let i = 0; i < notes.length; i++) {
            let currentNote = notes[i];

            if (currentNote._notes && currentNote._notes.length > 0) {
                for (const pitch of currentNote._notes) {
                    if (pitch > -1) {
                        playInstrument(
                            instrument,
                            pitch,
                            currentNote._dur,
                            currentNote._vol,
                            timeOffset
                        );
                    }
                }
            }
            timeOffset += currentNote._dur;
        }
    }

    /**
     * Creates a structured note/chord from an array of pitch keys.
     * @param notes Array tracking the stacked pitches assigned to this time step.
     * @param duration The lifespan duration window of the note event (in ms).
     * @param volume Master gain velocity ceiling index for this sound block.
     */
    //% block="note with keys %notes duration %duration ms volume %volume"
    //% blockId=music_create_note
    //% blockNamespace=music
    //% notes.shadow="lists_create_with"
    //% notes.defl="music_create_key"
    //% duration.defl=200
    //% volume.defl=1024
    //% weight=95
    //% group="Custom Sounds"
    export function createNote(notes: number[], duration: number, volume: number): SongNote {
        return new SongNote(notes, duration, volume);
    }
}

/* example code for a song
function treble() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Sine,
            [0, 0, 1024, 0, 1024],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            0
        ), [
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.C, 4)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.C, 4)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),

            new music.SongNote([music.key(Key.D, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),
            new music.SongNote([music.key(Key.D, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
            new music.SongNote([music.key(Key.E, 4)], 500, 128),

            new music.SongNote([music.key(Key.C, 3)], 500, 128),
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.D, 4)], 500, 128),
            new music.SongNote([music.key(Key.C, 3)], 500, 128),
            new music.SongNote([music.key(Key.G, 3)], 500, 128),
            new music.SongNote([music.key(Key.D, 4)], 500, 128),

            new music.SongNote([music.key(Key.A, 2)], 500, 128),
            new music.SongNote([music.key(Key.E, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 2)], 500, 128),
            new music.SongNote([music.key(Key.E, 3)], 500, 128),
            new music.SongNote([music.key(Key.A, 3)], 500, 128),
        ]
    )
}

function bass() {
    music.playNotes(
        music.createInstrument(
            Waveshape.Square50,
            [0, 0, 1024, 5, 1024],
            [0, 0, 0, 0, 0],
            [0, 0],
            [0, 0],
            0
        ), [
            new music.SongNote([music.key(Key.G, 1)], 3000, 128),
            new music.SongNote([music.key(Key.D, 1)], 3000, 128),
            new music.SongNote([music.key(Key.G, 1)], 3000, 128),
            new music.SongNote([music.key(Key.E, 1)], 3000, 128),
        ]
    )
}

let first = false
game.onUpdateInterval(12000, function() {
    treble()

    if (!first) first = true
    else bass()
})
/**/