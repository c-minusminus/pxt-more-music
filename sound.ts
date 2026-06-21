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

namespace music {
    //% blockNamespace=music
    //% block="note %pitch||duration %duration ms volume %volume"
    //% duration.defl=200 volume.defl=1024
    //% weight=100
    //% group="Custom Sounds"
    export class SongNote {
        _pitch: number;
        _dur: number;
        _vol: number;

        constructor(pitch: number, dur: number, vol: number) {
            this._pitch = pitch;
            this._dur = dur;
            this._vol = vol;
        }
        //% block="set pitch to %val"
        set pitch(val: number) { this._pitch = val }
        //% block="get pitch"
        get pitch() { return this._pitch }

        //% block="set duration to %val"
        set dur(val: number) { this._dur = val }
        //% block="get duration"
        get dur() { return this._dur }

        //% block="set volume to %val"
        set vol(val: number) { this._vol = val }
        //% block="get volume"
        get vol() { return this._vol }
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

    /**
     * Packages instrument settings into a configuration buffer and triggers audio playback instantly.
     */
    //% block="play instrument %instrument note index %freq duration %length ms volume %vol delay %when ms"
    //% blockNamespace=music
    //% weight=90
    //% group="Custom Sounds"
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
    //% block="play sequence on %instrument notes %sequence"
    //% blockNamespace=music
    //% weight=80
    //% group="Custom Sounds"
    export function playNotes(
        instrument: music.sequencer.Instrument,
        sequence: SongNote[]
    ) {
        let timeOffset = 0
        for (let i = 0; i < sequence.length; i++) {
            let currentNote = sequence[i];

            if (currentNote.pitch > -1) {
                playInstrument(
                    instrument,
                    currentNote.pitch,
                    currentNote.dur,
                    currentNote.vol,
                    timeOffset
                );
            }
            timeOffset += currentNote.dur;
        }
    }

    /**
     * Creates a new Note object to use inside a sequence block.
     */
    //% block="note index %pitch duration %duration ms volume %volume"
    //% blockNamespace=music
    //% pitch.defl=43 duration.defl=200 volume.defl=1024
    //% weight=95
    //% group="Custom Sounds"
    export function createNote(pitch: number, duration: number, volume: number): SongNote {
        return new SongNote(pitch, duration, volume);
    }
}