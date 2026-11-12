/**
 * GERADOR DE ÁUDIO PROCEDURAL (Web Audio API)
 * Gera efeitos sonoros e ambientação estilo chiptune retrô sem carregar MP3s externos.
 */
class ChiptuneAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.1) {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    sfxFootstep() {
        this.playTone(120, 'triangle', 0.04, 0.04);
    }

    sfxInteract() {
        this.playTone(440, 'sine', 0.08, 0.1);
        setTimeout(() => this.playTone(660, 'sine', 0.12, 0.1), 70);
    }

    sfxComplete() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 'triangle', 0.25, 0.15), i * 110);
        });
    }

    sfxError() {
        this.playTone(200, 'sawtooth', 0.15, 0.12);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.2, 0.12), 120);
    }

    sfxFanfare() {
        const melody = [523, 523, 523, 659, 783, 659, 783, 1046];
        melody.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 'square', 0.35, 0.18), i * 160);
        });
    }
}

// Instância global de áudio compartilhada
const audio = new ChiptuneAudio();

