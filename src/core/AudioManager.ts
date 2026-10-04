export class AudioManager {
    private ctx: AudioContext | null = null;
    private isInitialized: boolean = false;
    private osc1: OscillatorNode | null = null;
    private osc2: OscillatorNode | null = null;
    private engineGain: GainNode | null = null;
    private engineFilter: BiquadFilterNode | null = null;
    private screechGain: GainNode | null = null;
    private windGain: GainNode | null = null;
    private windFilter: BiquadFilterNode | null = null;
    private cityAmbienceGain: GainNode | null = null;
    private hornCooldown: number = 8.0;
    private masterGain: GainNode | null = null;
    private rainGain: GainNode | null = null;
    public init() {
        if (this.isInitialized)
            return;
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as {
                webkitAudioContext: typeof AudioContext;
            }).webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.engineGain = this.ctx.createGain();
            this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            this.engineFilter = this.ctx.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
            this.osc1 = this.ctx.createOscillator();
            this.osc1.type = 'sawtooth';
            this.osc1.frequency.setValueAtTime(32, this.ctx.currentTime);
            this.osc2 = this.ctx.createOscillator();
            this.osc2.type = 'triangle';
            this.osc2.frequency.setValueAtTime(64, this.ctx.currentTime);
            this.osc1.connect(this.engineFilter);
            this.osc2.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.masterGain);
            this.osc1.start();
            this.osc2.start();
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const screechSource = this.ctx.createBufferSource();
            screechSource.buffer = noiseBuffer;
            screechSource.loop = true;
            const screechFilter = this.ctx.createBiquadFilter();
            screechFilter.type = 'bandpass';
            screechFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
            screechFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);
            this.screechGain = this.ctx.createGain();
            this.screechGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
            screechSource.connect(screechFilter);
            screechFilter.connect(this.screechGain);
            this.screechGain.connect(this.masterGain);
            screechSource.start();
            const windSource = this.ctx.createBufferSource();
            windSource.buffer = noiseBuffer;
            windSource.loop = true;
            this.windFilter = this.ctx.createBiquadFilter();
            this.windFilter.type = 'lowpass';
            this.windFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
            this.windGain = this.ctx.createGain();
            this.windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
            windSource.connect(this.windFilter);
            this.windFilter.connect(this.windGain);
            this.windGain.connect(this.masterGain);
            windSource.start();
            const ambSource = this.ctx.createBufferSource();
            ambSource.buffer = noiseBuffer;
            ambSource.loop = true;
            const ambFilter = this.ctx.createBiquadFilter();
            ambFilter.type = 'lowpass';
            ambFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
            this.cityAmbienceGain = this.ctx.createGain();
            this.cityAmbienceGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            ambSource.connect(ambFilter);
            ambFilter.connect(this.cityAmbienceGain);
            this.cityAmbienceGain.connect(this.masterGain);
            ambSource.start();
            const rainSource = this.ctx.createBufferSource();
            rainSource.buffer = noiseBuffer;
            rainSource.loop = true;
            const rainFilter = this.ctx.createBiquadFilter();
            rainFilter.type = 'bandpass';
            rainFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
            rainFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);
            this.rainGain = this.ctx.createGain();
            this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
            rainSource.connect(rainFilter);
            rainFilter.connect(this.rainGain);
            this.rainGain.connect(this.masterGain);
            rainSource.start();
            this.isInitialized = true;
        }
        catch {
        }
    }
    public update(rpm: number, isBraking: boolean, speedMps: number, dt: number) {
        if (!this.isInitialized || !this.ctx)
            return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        const t = this.ctx.currentTime;
        const speedKmh = Math.abs(speedMps * 3.6);
        const baseFreq = (rpm / 60) * 1.8;
        if (this.osc1 && this.osc2 && this.engineFilter) {
            this.osc1.frequency.setTargetAtTime(baseFreq, t, 0.04);
            this.osc2.frequency.setTargetAtTime(baseFreq * 2.2, t, 0.04);
            const filterCutoff = 350 + (rpm / 8500) * 3200;
            this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.04);
        }
        if (this.screechGain) {
            const isScreeching = isBraking && Math.abs(speedMps) > 4.5;
            const targetGain = isScreeching ? 0.08 : 0.0;
            this.screechGain.gain.setTargetAtTime(targetGain, t, 0.06);
        }
        if (this.windGain && this.windFilter) {
            const windVolume = Math.min(0.09, (speedKmh / 220) * 0.09);
            this.windGain.gain.setTargetAtTime(windVolume, t, 0.1);
            this.windFilter.frequency.setTargetAtTime(200 + speedKmh * 6, t, 0.1);
        }
        this.hornCooldown -= dt;
        if (this.hornCooldown <= 0) {
            this.hornCooldown = 15.0 + Math.random() * 20.0;
            this.playDistantHorn();
        }
    }
    public playDistantHorn() {
        if (!this.ctx)
            return;
        try {
            const t = this.ctx.currentTime;
            const dur = 0.35 + Math.random() * 0.25;
            const oscA = this.ctx.createOscillator();
            const oscB = this.ctx.createOscillator();
            oscA.type = 'sawtooth';
            oscB.type = 'sawtooth';
            oscA.frequency.setValueAtTime(360, t);
            oscB.frequency.setValueAtTime(435, t);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.0, t);
            gain.gain.linearRampToValueAtTime(0.025, t + 0.05);
            gain.gain.setValueAtTime(0.025, t + dur - 0.05);
            gain.gain.linearRampToValueAtTime(0.0, t + dur);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, t);
            oscA.connect(gain);
            oscB.connect(gain);
            gain.connect(filter);
            filter.connect(this.ctx.destination);
            oscA.start(t);
            oscB.start(t);
            oscA.stop(t + dur);
            oscB.stop(t + dur);
        }
        catch {
        }
    }
    private nitroGain: GainNode | null = null;
    private nitroFilter: BiquadFilterNode | null = null;
    public setNitroBoostSound(isBoosting: boolean) {
        if (!this.ctx)
            return;
        try {
            const t = this.ctx.currentTime;
            if (!this.nitroGain) {
                this.nitroGain = this.ctx.createGain();
                this.nitroGain.gain.setValueAtTime(0, t);
                this.nitroFilter = this.ctx.createBiquadFilter();
                this.nitroFilter.type = 'bandpass';
                this.nitroFilter.frequency.setValueAtTime(1400, t);
                this.nitroFilter.Q.setValueAtTime(1.8, t);
                const bufferSize = this.ctx.sampleRate;
                const buf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufferSize; i++)
                    data[i] = Math.random() * 2 - 1;
                const src = this.ctx.createBufferSource();
                src.buffer = buf;
                src.loop = true;
                src.connect(this.nitroFilter);
                this.nitroFilter.connect(this.nitroGain);
                this.nitroGain.connect(this.ctx.destination);
                src.start();
            }
            this.nitroGain.gain.setTargetAtTime(isBoosting ? 0.14 : 0.0, t, 0.08);
        }
        catch { }
    }
    public playCashChime() {
        if (!this.ctx)
            return;
        try {
            const t = this.ctx.currentTime;
            [880, 1320, 1760].forEach((freq, idx) => {
                const osc = this.ctx!.createOscillator();
                const gain = this.ctx!.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + idx * 0.06);
                gain.gain.setValueAtTime(0.09, t + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx!.destination);
                osc.start(t + idx * 0.06);
                osc.stop(t + idx * 0.06 + 0.35);
            });
        }
        catch { }
    }
    public playCheckpointChime() {
        if (!this.ctx)
            return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, t);
            osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.18);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.4);
        }
        catch { }
    }
    public playSpeedTrapClick() {
        if (!this.ctx)
            return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1800, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
        }
        catch { }
    }
    public playVictoryFanfare() {
        if (!this.ctx)
            return;
        try {
            const t = this.ctx.currentTime;
            const chord = [523.25, 659.25, 783.99, 1046.5];
            chord.forEach((freq, i) => {
                const osc = this.ctx!.createOscillator();
                const gain = this.ctx!.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t + i * 0.08);
                gain.gain.setValueAtTime(0.1, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
                osc.connect(gain);
                gain.connect(this.masterGain || this.ctx!.destination);
                osc.start(t + i * 0.08);
                osc.stop(t + 1.2);
            });
        }
        catch { }
    }
    public setMasterVolume(vol: number) {
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.0, vol)), this.ctx.currentTime, 0.05);
        }
    }
    public setRainSound(active: boolean) {
        if (this.rainGain && this.ctx) {
            this.rainGain.gain.setTargetAtTime(active ? 0.08 : 0.0, this.ctx.currentTime, 0.2);
        }
    }
    public playCountdownBeep(highTone: boolean = false) {
        if (!this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(highTone ? 880 : 440, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + (highTone ? 0.35 : 0.18));
            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);
            osc.start(t);
            osc.stop(t + (highTone ? 0.35 : 0.18));
        } catch {}
    }
    public playCollisionSound(intensity: number = 1.0) {
        if (!this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(90, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
            gain.gain.setValueAtTime(Math.min(0.35, 0.15 * intensity), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
        } catch {}
    }
    private musicGain: GainNode | null = null;
    private musicTimer: any = null;
    private musicStep: number = 0;
    public startMusic(mode: 'menu' | 'race' | 'garage' | 'freedrive' = 'race') {
        if (!this.ctx) return;
        this.stopMusic();
        try {
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain || this.ctx.destination);

            const bpm = mode === 'race' ? 128 : 108;
            const stepDuration = (60 / bpm) / 4;
            const bassline = mode === 'race' 
                ? [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83]
                : [82.41, 82.41, 110, 98, 82.41, 82.41, 123.47, 110];

            this.musicTimer = setInterval(() => {
                if (!this.ctx || !this.musicGain) return;
                const t = this.ctx.currentTime;
                const note = bassline[this.musicStep % bassline.length];

                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450, t);

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(note, t);
                noteGain.gain.setValueAtTime(0.09, t);
                noteGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

                osc.connect(filter);
                filter.connect(noteGain);
                noteGain.connect(this.musicGain);

                osc.start(t);
                osc.stop(t + stepDuration * 0.9);

                if (this.musicStep % 4 === 0) {
                    const kickOsc = this.ctx.createOscillator();
                    const kickGain = this.ctx.createGain();
                    kickOsc.type = 'sine';
                    kickOsc.frequency.setValueAtTime(140, t);
                    kickOsc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
                    kickGain.gain.setValueAtTime(0.18, t);
                    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                    kickOsc.connect(kickGain);
                    kickGain.connect(this.musicGain);
                    kickOsc.start(t);
                    kickOsc.stop(t + 0.12);
                }

                this.musicStep++;
            }, stepDuration * 1000);
        } catch {}
    }
    public stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }
    public setMusicVolume(vol: number) {
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(0.2, vol * 0.2)), this.ctx.currentTime, 0.05);
        }
    }
}

