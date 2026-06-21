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
    C  = 1,
    //% block="C#"
    Cs = 2,
    //% block="D"
    D  = 3,
    //% block="D#"
    Ds = 4,
    //% block="E"
    E  = 5,
    //% block="F"
    F  = 6,
    //% block="F#"
    Fs = 7,
    //% block="G"
    G  = 8,
    //% block="G#"
    Gs = 9,
    //% block="A"
    A  = 10,
    //% block="A#"
    As = 11,
    //% block="B"
    B  = 12
}

//% blockNamespace=music
class SongNote {
    _notes: number[];
    _dur: number;
    _vol: number;

    constructor(notes: number[], dur: number, vol: number) {
        this._notes = notes;
        this._dur = dur;
        this._vol = vol;
    }
    //% group="Custom Sounds" blockSetVariable="myNote"
    //% block="notes"
    set notes(val: number[]) { this._notes = val }
    //% group="Custom Sounds" blockSetVariable="myNote"
    //% block="notes"
    get notes(): number[] { return this._notes }

    //% group="Custom Sounds" blockSetVariable="myNote"
    //% block="dur"
    set dur(val: number) { this._dur = val }
    //% group="Custom Sounds" blockSetVariable="myNote"
    //% block="dur"
    get dur(): number { return this._dur }

    //% group="Custom Sounds" blockSetVariable="myNote"
    //% block="vol"
    set vol(val: number) { this._vol = val }
    //% group="Custom Sounds" blockSetVariable="myNote"
    //% block="vol"
    get vol(): number { return this._vol }
}

namespace music {
    /**
     * Helper function to turn a Key selection and an Octave into a precise pitch value.
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
     * Renders an instrument configuration into a 28-byte synthesizer structure.
     */
    //% block="create instrument with waveform %waveform||ampEnv %ampEnv pitchEnv %pitchEnv ampLfo %ampLfo pitchLfo %pitchLfo octave %octave"
    //% blockNamespace=music
    //% inlineInputMode=inline
    //% weight=100
    //% group="Custom Sounds"
    export function createInstrument(
        waveform: Waveshape,
        ampEnv: number[], pitchEnv: number[],
        ampLfo: number[], pitchLfo: number[],
        octave: number
    ): music.sequencer.Instrument {
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
     * Iterates through an array of structured Note objects and plays them sequentially.
     */
    //% block="play notes on %instrument notes %sequence"
    //% blockNamespace=music
    //% instrument.shadow=myInstrument
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
     */
    //% block="note with keys %notes duration %duration ms volume %volume"
    //% blockNamespace=music
    //% notes.shadow="lists_create_with"
    //% notes.defl="music_create_key"
    //% duration.defl=200 volume.defl=1024
    //% weight=95
    //% group="Custom Sounds"
    export function createNote(notes: number[], duration: number, volume: number): SongNote {
        return new SongNote(notes, duration, volume);
    }
}
