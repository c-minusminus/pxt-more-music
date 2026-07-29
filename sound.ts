enum Waveshape {
    // basic waves
    //% block="sine"
    Sine = 3,
    //% block="triangle"
    Triangle = 1,
    //% block="square 50"
    Square50 = 15,
    //% block="sawtooth"
    Sawtooth = 2,
    //% block="tuned noise"
    TunedNoise = 4,

    // complex waves
    //% block="noise"
    Noise = 5,
    //% block="square 10"
    Square10 = 11,
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
    //% weight=13
    //% group="Custom Sounds"
    export function createDrumStep(waveform: Waveshape, frequency: number, volume: number, duration: number): sequencer.DrumStep {
        let step = new sequencer.DrumStep();
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
    //% weight=12
    //% group="Custom Sounds"
    export function createDrum(
        startFreq: number,
        startVol: number,
        steps: sequencer.DrumStep[]
    ): sequencer.DrumInstrument {
        let totalBytes = 5 + (steps.length * 7);
        let buf = control.createBuffer(totalBytes);

        buf[0] = steps.length;
        buf.setNumber(NumberFormat.UInt16LE, 1, startFreq);
        buf.setNumber(NumberFormat.UInt16LE, 3, startVol);

        for (let i = 0; i < steps.length; i++) {
            let offset = 5 + (i * 7);
            buf[offset] = steps[i].waveform;
            buf.setNumber(NumberFormat.UInt16LE, offset + 1, steps[i].frequency);
            buf.setNumber(NumberFormat.UInt16LE, offset + 3, steps[i].volume);
            buf.setNumber(NumberFormat.UInt16LE, offset + 5, steps[i].duration);
        }

        return new sequencer.DrumInstrument(buf, 0);
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
    //% weight=11
    //% group="Custom Sounds"
    export function createDrumKit(drums: sequencer.DrumInstrument[]): sequencer.DrumInstrument[] {
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
    //% notes.defl="lists_create_with"
    //% weight=10
    //% group="Custom Sounds"
    export function playDrumNotes(drums: sequencer.DrumInstrument[], notes: number[][]) {
        let time = 0;
        for (const note of notes) {
            for (let i = 0; i < note.length - 1; i++)
                playInstructions(
                    time,
                    sequencer.renderDrumInstrument(drums[note[i]], 1024)
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
    //% weight=4
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
    //% weight=5
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
    //% weight=3
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
    //% weight=1
    //% group="Custom Sounds"
    export function createInstrument(
        waveform: Waveshape,
        ampEnv: number[], pitchEnv: number[],
        ampLfo: number[], pitchLfo: number[],
        octave: number
    ): sequencer.Instrument {
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

        return new sequencer.Instrument(buf);
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
    //% weight=0
    //% group="Custom Sounds"
    export function playNotes(
        instrument: sequencer.Instrument,
        notes: SongNote[]
    ) {
        let timeOffset = 0
        for (let i = 0; i < notes.length; i++) {
            let currentNote = notes[i];

            if (currentNote._notes && currentNote._notes.length > 0) {
                for (const pitch of currentNote._notes) {
                    if (pitch > -1) {
                        playInstructions(timeOffset, sequencer.renderInstrument(
                            instrument,
                            lookupFrequency(pitch + instrument.octave * 12),
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
    //% weight=2
    //% group="Custom Sounds"
    export function createNote(notes: number[], duration: number, volume: number): SongNote {
        return new SongNote(notes, duration, volume);
    }

    /**
         * Plays a sequence of notes with full ADSR volume envelopes while smoothly 
         * sliding pitch from each note to the next.
         * * @param instrument The synth voice workspace configuration.
         * @param notes Array of SongNotes to play sequentially.
         */
    //% blockId=music_play_slide_sequence
    //% block="play slide sequence on %instrument notes %notes"
    //% blockNamespace=music
    //% instrument.shadow="variables_get"
    //% instrument.defl="myInstrument"
    //% notes.shadow="lists_create_with"
    //% notes.defl="music_create_note"
    //% weight=81
    //% group="Custom Sounds"
    export function playSlideSequence(instrument: sequencer.Instrument, notes: SongNote[]) {
        if (!notes || notes.length < 2) return;
    
        let timeOffset = 0;
    
        for (let i = 0; i < notes.length - 1; i++) {
            let current = notes[i];
            let nextNote = notes[i + 1];
    
            let startPitch = (current.notes && current.notes.length > 0) ? current.notes[0] : -1;
            let endPitch = (nextNote && nextNote.notes && nextNote.notes.length > 0) ? nextNote.notes[0] : startPitch;
    
            let startVol = current.vol;
            let endVol = (nextNote && nextNote.vol !== undefined) ? nextNote.vol : startVol;
    
            // Only render if note duration is valid and not a rest (-1)
            if (current.dur > 0 && startPitch > -1) {
                let startFreq = lookupFrequency(startPitch + instrument.octave * 12);
                let endFreq = (endPitch > -1)
                    ? lookupFrequency(endPitch + instrument.octave * 12)
                    : startFreq;
    
                // Render the note with ADSR volume envelopes + linear pitch AND volume glides!
                let buf = renderSlideNote(
                    instrument,
                    startFreq,
                    endFreq,
                    current.dur,
                    startVol,
                    endVol
                );
    
                playInstructions(timeOffset, buf);
            }
    
            timeOffset += current.dur;
        }
    }

    /**
     * Renders a note instruction buffer with full ADSR volume envelopes AND pitch sliding.
     */
    export function renderSlideNote(
        instrument: sequencer.Instrument,
        startFreq: number,
        endFreq: number,
        gateLength: number,
        startVol: number,
        endVol: number
    ): Buffer {
        const totalDuration = gateLength + instrument.ampEnvelope.release;
    
        const ampLFOInterval = instrument.ampLFO.amplitude ? Math.max(500 / instrument.ampLFO.frequency, 50) : 50;
        const pitchLFOInterval = instrument.pitchLFO.amplitude ? Math.max(500 / instrument.pitchLFO.frequency, 50) : 50;
    
        let timePoints = [0];
    
        let nextAETime = instrument.ampEnvelope.attack;
        let nextPETime = instrument.pitchEnvelope.amplitude ? instrument.pitchEnvelope.attack : totalDuration;
        let nextPLTime = instrument.pitchLFO.amplitude ? pitchLFOInterval : totalDuration;
        let nextALTime = instrument.ampLFO.amplitude ? ampLFOInterval : totalDuration;
    
        let time = 0;
        while (time < totalDuration) {
            if (nextAETime <= nextPETime && nextAETime <= nextPLTime && nextAETime <= nextALTime) {
                time = nextAETime;
                timePoints.push(nextAETime);
                if (time < instrument.ampEnvelope.attack + instrument.ampEnvelope.decay && instrument.ampEnvelope.attack + instrument.ampEnvelope.decay < gateLength) {
                    nextAETime = instrument.ampEnvelope.attack + instrument.ampEnvelope.decay;
                } else if (time < gateLength) {
                    nextAETime = gateLength;
                } else {
                    nextAETime = totalDuration;
                }
            } else if (nextPETime <= nextPLTime && nextPETime <= nextALTime && nextPETime < totalDuration) {
                time = nextPETime;
                timePoints.push(nextPETime);
                if (time < instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay && instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay < gateLength) {
                    nextPETime = instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay;
                } else if (time < gateLength) {
                    nextPETime = gateLength;
                } else if (time < gateLength + instrument.pitchEnvelope.release) {
                    nextPETime = Math.min(totalDuration, gateLength + instrument.pitchEnvelope.release);
                } else {
                    nextPETime = totalDuration;
                }
            } else if (nextPLTime <= nextALTime && nextPLTime < totalDuration) {
                time = nextPLTime;
                timePoints.push(nextPLTime);
                nextPLTime += pitchLFOInterval;
            } else if (nextALTime < totalDuration) {
                time = nextALTime;
                timePoints.push(nextALTime);
                nextALTime += ampLFOInterval;
            } else if (time < gateLength) {
                time = gateLength;
                timePoints.push(gateLength);
            } else {
                time = totalDuration;
                timePoints.push(totalDuration);
            }
    
            if (time >= totalDuration) break;
    
            if (nextAETime <= time) {
                if (time < instrument.ampEnvelope.attack + instrument.ampEnvelope.decay && instrument.ampEnvelope.attack + instrument.ampEnvelope.decay < gateLength) {
                    nextAETime = instrument.ampEnvelope.attack + instrument.ampEnvelope.decay;
                } else if (time < gateLength) {
                    nextAETime = gateLength;
                } else {
                    nextAETime = totalDuration;
                }
            }
            if (nextPETime <= time) {
                if (time < instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay && instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay < gateLength) {
                    nextPETime = instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay;
                } else if (time < gateLength) {
                    nextPETime = gateLength;
                } else if (time < gateLength + instrument.pitchEnvelope.release) {
                    nextPETime = Math.min(totalDuration, gateLength + instrument.pitchEnvelope.release);
                } else {
                    nextPETime = totalDuration;
                }
            }
            while (nextALTime <= time) nextALTime += ampLFOInterval;
            while (nextPLTime <= time) nextPLTime += pitchLFOInterval;
        }
    
        // Dynamic pitch interpolation helper
        let getBaseFreq = (t: number) => {
            let progress = Math.min(1, Math.max(0, t / gateLength));
            return startFreq + (endFreq - startFreq) * progress;
        };
    
        // Dynamic volume interpolation helper
        let getBaseVol = (t: number) => {
            let progress = Math.min(1, Math.max(0, t / gateLength));
            return startVol + (endVol - startVol) * progress;
        };
    
        let prevAmp = instrumentVolumeAtTime(instrument, gateLength, 0, getBaseVol(0)) | 0;
        let prevPitch = instrumentPitchAtTime(instrument, getBaseFreq(0), gateLength, 0) | 0;
        let prevTime = 0;
    
        let nextAmp: number;
        let nextPitch: number;
        let ptr = 0;
        const out = control.createBuffer(12 * timePoints.length + 1);
    
        for (let i = 1; i < timePoints.length; i++) {
            if (timePoints[i] - prevTime < 5) continue;
    
            let curTime = timePoints[i];
    
            // Calculate pitch & volume at curTime using interpolated baseline!
            nextAmp = instrumentVolumeAtTime(instrument, gateLength, curTime, getBaseVol(curTime)) | 0;
            nextPitch = instrumentPitchAtTime(instrument, getBaseFreq(curTime), gateLength, curTime) | 0;
    
            ptr = addNote(
                out,
                ptr,
                (curTime - prevTime) | 0,
                prevAmp,
                nextAmp,
                instrument.waveform,
                prevPitch,
                255,
                nextPitch
            );
    
            prevAmp = nextAmp;
            prevPitch = nextPitch;
            prevTime = curTime;
        }
    
        if (prevAmp > 0) {
            ptr = addNote(
                out,
                ptr,
                10,
                prevAmp,
                0,
                instrument.waveform,
                prevPitch,
                255,
                prevPitch
            );
        }
    
        return out;
    }




    
    // these ar already defined in music, but they are not exported
    export function instrumentPitchAtTime(instrument: sequencer.Instrument, noteFrequency: number, gateLength: number, time: number) {
        let mod = 0;
        if (instrument.pitchEnvelope.amplitude) {
            mod += envelopeValueAtTime(instrument.pitchEnvelope, time, gateLength)
        }
        if (instrument.pitchLFO.amplitude) {
            mod += lfoValueAtTime(instrument.pitchLFO, time)
        }
        return Math.max(noteFrequency + mod, 0);
    }

    export function instrumentVolumeAtTime(instrument: sequencer.Instrument, gateLength: number, time: number, maxVolume: number) {
        let mod = 0;
        if (instrument.ampEnvelope.amplitude) {
            mod += envelopeValueAtTime(instrument.ampEnvelope, time, gateLength)
        }
        if (instrument.ampLFO.amplitude) {
            mod += lfoValueAtTime(instrument.ampLFO, time)
        }
        return ((Math.max(Math.min(mod, instrument.ampEnvelope.amplitude), 0) / 1024) * maxVolume) | 0;
    }

    export function envelopeValueAtTime(envelope: sequencer.Envelope, time: number, gateLength: number): number {
        // ADSR envelopes consist of 4 stages. They are (in order):
        //     1. The attack stage, where the value starts at 0 and rises to the maximum value
        //     2. The decay stage, where the value falls from the maximum value to the sustain value
        //     3. The sustain stage, where the value holds steady at the sustain value until the gate length ends
        //     4. The release stage, where the value falls to 0 after the gate length ends
        // If the gate length ends before the sustain stage, we immediately skip to the release stage. All stages
        // use a linear function for the value
        const adjustedSustain = (envelope.sustain / 1024) * envelope.amplitude;

        // First check to see if we are already in the release stage
        if (time > gateLength) {
            if (time - gateLength > envelope.release) return 0;
            else {
                const releaseStartLevel = envelopeValueAtTime(envelope, gateLength, gateLength);
                return releaseStartLevel - (releaseStartLevel / envelope.release) * (time - gateLength)
            }
        }
        else if (time < envelope.attack) {
            return (envelope.amplitude / envelope.attack) * time
        }
        else if (time < envelope.attack + envelope.decay) {
            return envelope.amplitude - ((envelope.amplitude - adjustedSustain) / envelope.decay) * (time - envelope.attack)
        }
        else {
            return adjustedSustain;
        }
    }

    /**
     * Calculates the value of the LFO at the given time.
     *
     * TODO: might be nice to give options to shift the phase of the LFO or let it run free
     *
     * @param lfo The LFO to calculate the value of
     * @param time The time to calculate the value at
     */
    export function lfoValueAtTime(lfo: sequencer.LFO, time: number) {
        // Use cosine to smooth out the value somewhat
        return Math.cos(((time / 1000) * lfo.frequency) * 2 * Math.PI) * lfo.amplitude
    }
}
