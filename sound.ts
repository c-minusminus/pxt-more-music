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
     * Creates a single drum configuration step.
     * @param waveform The basic oscillator wave shape for this step.
     * @param frequency The target frequency (pitch) for this step.
     * @param volume The target volume level (0-1024) for this step.
     * @param duration How long this step lasts in milliseconds.
     */
    //% blockId=music_create_drum_step
    //% block="shape %waveform freq %frequency vol %volume duration %duration ms"
    //% blockNamespace=music
    //% inlineInputMode=inline
    //% waveform.defl=Waveshape.Noise
    //% frequency.defl=100
    //% volume.defl=1024
    //% duration.defl=50
    //% weight=90
    //% group="Custom Sounds"
    export function createDrumStep(waveform: Waveshape, frequency: number, volume: number, duration: number): music.sequencer.DrumStep {
        let step = new music.sequencer.DrumStep();
        step.waveform = waveform;
        step.frequency = frequency;
        step.volume = volume;
        step.duration = duration;
        return step;
    }

    /**
     * Combines an array of drum steps into a single DrumInstrument hit.
     * @param startFreq The initial frequency when the drum is first struck.
     * @param startVol The initial starting volume of the punch (0-1024).
     * @param steps The array of sequential drum envelope modification steps.
     */
    //% blockId=music_create_drum
    //% block="create drum hit starting freq %startFreq vol %startVol steps %steps"
    //% blockNamespace=music
    //% startFreq.defl=200
    //% startVol.defl=1024
    //% steps.shadow="lists_create_with"
    //% steps.defl="music_create_drum_step"
    //% weight=91
    //% group="Custom Sounds"
    export function createDrum(
        startFreq: number,
        startVol: number,
        steps: music.sequencer.DrumStep[]
    ): music.sequencer.DrumInstrument {
        if (!steps || steps.length === 0) {
            steps = [createDrumStep(Waveshape.Noise, 40, 0, 100)];
        }

        let totalBytes = 5 + (steps.length * 7);
        let buf = control.createBuffer(totalBytes);

        buf[0] = steps.length & 0xFF;
        buf.setNumber(NumberFormat.UInt16LE, 1, startFreq);
        buf.setNumber(NumberFormat.UInt16LE, 3, startVol);

        for (let i = 0; i < steps.length; i++) {
            let offset = 5 + (i * 7);
            buf[offset] = steps[i].waveform & 0xFF;
            buf.setNumber(NumberFormat.UInt16LE, offset + 1, steps[i].frequency);
            buf.setNumber(NumberFormat.UInt16LE, offset + 3, steps[i].volume);
            buf.setNumber(NumberFormat.UInt16LE, offset + 5, steps[i].duration);
        }

        return new music.sequencer.DrumInstrument(buf, 0);
    }

    /**
     * Combines multiple individual drum noises into a comprehensive Drum Kit array.
     * @param drums An array of your custom designed drum hits.
     */
    //% blockId=music_create_drum_kit
    //% block="create drum kit with drums %drums"
    //% blockNamespace=music
    //% drums.shadow="lists_create_with"
    //% drums.defl="music_create_drum"
    //% weight=92
    //% group="Custom Sounds"
    export function createDrumKit(drums: music.sequencer.DrumInstrument[]): music.sequencer.DrumInstrument[] {
        return drums;
    }

    /**
     * Iterates through a sequenced timeline tracker grid and fires drum hits.
     * @param drums The collection array of custom drum sounds to choose from.
     * @param notes A 2D array matrix containing drum triggers and line timing: [[drum, drum, ... timeTillNext], ...].
     */
    //% blockId=music_play_drum_notes
    //% block="play drum kit %drums pattern %notes"
    //% blockNamespace=music
    //% drums.shadow="variables_get"
    //% drums.defl="myDrumKit"
    //% notes.shadow="lists_create_with"
    //% weight=78
    //% group="Custom Sounds"
    export function playDrumNotes(drums: music.sequencer.DrumInstrument[], notes: number[][]) {
        let time = 0;
        for (const note of notes) {
            for (let i = 0; i < note.length - 1; i++)
                music.playInstructions(
                    time,
                    music.sequencer.renderDrumInstrument(drums[note[i]], 1024)
                );

            time += note[note.length - 1];
        }
    }



















    /**
     * Helper function for making an LFO (low frequency oscillator).
     * @param attack The time it takes for the signal to rise from zero to its absolute maximum level.
     * @param decay The time it takes for the signal to fall from its peak level down to the sustain level.
     * @param sustain The constant level the signal maintains for as long as the input remains active.
     * @param release The time it takes for the signal to fade back down to zero after the input stops (e.g., letting go of a key).
     * @param peak The maximum level or highest value the signal reaches at the very end of the attack phase.
     */
    //% blockId=music_env
    //% block="attack %attack decay %decay sustain %sustain release %release peak %peak"
    //% blockNamespace=music
    //% attack.defl=0
    //% decay.defl=0
    //% sustain.defl=1024
    //% release.defl=5
    //% peak.defl=1024
    //% weight=75
    //% group="Custom Sounds"
    export function envelope(attack: number, decay: number, sustain: number, release: number, peak: number): number[] {
        return [attack, decay, sustain, release, peak]
    }

    /**
     * Helper function for making an LFO (low frequency oscillator).
     * @param frequency How fast the oscillator repeats.
     * @param amplitude How big the oscillator is.
     */
    //% blockId=music_lfo
    //% block="frequency %frequency amplitude %amplitude"
    //% blockNamespace=music
    //% frequency.defl=0
    //% amplitude.defl=0
    //% weight=75
    //% group="Custom Sounds"
    export function lfo(frequency: number, amplitude: number): number[] {
        return [frequency, amplitude]
    }


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
    //% ampEnv.defl="music_env"
    //% pitchEnv.defl="music_env"
    //% ampLfo.defl="music_lfo"
    //% pitchLfo.defl="music_lfo"
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
        buf[0] = waveform;

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
                        music.playInstructions(timeOffset, music.sequencer.renderInstrument(
                            instrument,
                            music.lookupFrequency(pitch + instrument.octave * 12),
                            currentNote._dur,
                            currentNote._vol
                        ))
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