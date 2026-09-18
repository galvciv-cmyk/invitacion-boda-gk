/**
 * Audio Engine para la Boda Real G&K (Estilo Luis XV)
 * Genera ambiente sonoro barroco y efectos realistas usando Web Audio API
 */

class RoyalAudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlayingMusic = false;
        this.musicInterval = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.noteIndex = 0;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        if (!this.ctx) this.init();
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    // Sonido majestuoso de apertura de puerta de palacio
    playDoorOpenSound() {
        this.init();
        if (this.isMuted) return;

        const now = this.ctx.currentTime;

        // 1. Resonancia grave de la madera maciza (sub-bass / rumble)
        const rumbleOsc = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        rumbleOsc.type = 'triangle';
        rumbleOsc.frequency.setValueAtTime(65, now);
        rumbleOsc.frequency.exponentialRampToValueAtTime(32, now + 1.8);

        rumbleGain.gain.setValueAtTime(0.01, now);
        rumbleGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        rumbleOsc.connect(rumbleGain);
        rumbleGain.connect(this.sfxGain);
        rumbleOsc.start(now);
        rumbleOsc.stop(now + 2.2);

        // 2. Chime celestial / arpa dorada ascendente
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C, E, G, C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteTime = now + 0.15 + (idx * 0.12);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(0.001, noteTime);
            gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.6);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(noteTime);
            osc.stop(noteTime + 1.6);
        });
    }

    // Efecto de sellado de lacre real (estampado mecánico con calor)
    playWaxSealSound() {
        this.init();
        if (this.isMuted) return;

        const now = this.ctx.currentTime;

        // Golpe sordo de bronce
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.5);

        // Chisporroteo suave de lacre caliente
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1800;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
    }

    // Campanilla dorada para clics y micro-interacciones
    playChime() {
        this.init();
        if (this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1318.51, now); // E6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.9);
    }

    // Suite barroca estilo Versalles (Minueto en Sol Mayor / Suite Rococó en Arpa & Cuerdas)
    startRoyalMusic() {
        this.init();
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;

        // Progresión armónica barroca de corte:
        // C - G/B - Am - Em/G - F - C/E - Dm7 - G - C
        const melody = [
            // Compás 1
            { note: 523.25, dur: 0.5 }, { note: 659.25, dur: 0.5 }, { note: 783.99, dur: 0.5 }, { note: 659.25, dur: 0.5 },
            // Compás 2
            { note: 493.88, dur: 0.5 }, { note: 587.33, dur: 0.5 }, { note: 783.99, dur: 0.5 }, { note: 587.33, dur: 0.5 },
            // Compás 3
            { note: 440.00, dur: 0.5 }, { note: 523.25, dur: 0.5 }, { note: 659.25, dur: 0.5 }, { note: 523.25, dur: 0.5 },
            // Compás 4
            { note: 392.00, dur: 0.5 }, { note: 493.88, dur: 0.5 }, { note: 659.25, dur: 0.5 }, { note: 493.88, dur: 0.5 },
            // Compás 5
            { note: 349.23, dur: 0.5 }, { note: 440.00, dur: 0.5 }, { note: 523.25, dur: 0.5 }, { note: 440.00, dur: 0.5 },
            // Compás 6
            { note: 329.63, dur: 0.5 }, { note: 392.00, dur: 0.5 }, { note: 523.25, dur: 0.5 }, { note: 392.00, dur: 0.5 },
            // Compás 7 (cadencia)
            { note: 293.66, dur: 0.5 }, { note: 349.23, dur: 0.5 }, { note: 440.00, dur: 0.5 }, { note: 392.00, dur: 0.5 },
            // Compás 8 (resolución real)
            { note: 523.25, dur: 1.0 }, { note: 659.25, dur: 0.5 }, { note: 783.99, dur: 1.0 }
        ];

        const bassNotes = [
            130.81, 123.47, 110.00, 98.00, 87.31, 82.41, 73.42, 65.41
        ];

        let index = 0;
        let bassIndex = 0;
        const stepTime = 380; // ms por nota

        this.musicInterval = setInterval(() => {
            if (!this.isPlayingMusic || !this.ctx || this.ctx.state === 'suspended') return;

            const item = melody[index % melody.length];
            this.playHarpNote(item.note, item.dur);

            // Bajo continuo barroco cada 4 notas
            if (index % 4 === 0) {
                const bassFreq = bassNotes[bassIndex % bassNotes.length];
                this.playBassViol(bassFreq, 1.4);
                bassIndex++;
            }

            index++;
        }, stepTime);
    }

    playHarpNote(freq, duration = 0.6) {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Armónico dulce tipo arpa / clavecín
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.4);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + duration + 0.45);
    }

    playBassViol(freq, duration = 1.2) {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + duration + 0.05);
    }

    stopRoyalMusic() {
        this.isPlayingMusic = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

window.royalAudio = new RoyalAudioEngine();
