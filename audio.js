/**
 * ============================================================================
 * PIP'S DREAM ENGINE — WEB AUDIO API SYNTHESIZER
 * Zero-dependency procedural sound generator for haX.baby hackathon.
 * Features:
 *  - Pentatonic music box chime synthesizer
 *  - Soothing generative lullaby sequences
 *  - Wood rattle & bubble click sounds
 *  - Mandatory Hackathon Accessible Mute Toggle (synced to localStorage)
 *  - Real-time audio analyser hook for canvas visualizer
 * ============================================================================
 */

class DreamAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isMuted = false;
    this.isPlayingLullaby = false;
    this.lullabyTimer = null;
    this.currentMelodyIndex = 0;
    this.noteStep = 0;

    // Load initial mute preference
    const savedMute = localStorage.getItem('pip_audio_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }

    // Pentatonic scale frequencies in Hz (sweet, soothing, never clashes)
    this.scale = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.00, 'A4': 440.00,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00,
      'C6': 1046.50
    };

    // Melodies composed by Pip the Dream Engineer
    this.melodies = [
      {
        id: 'midnight',
        title: 'Midnight Nursery Lullaby',
        notes: ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'E5', 'D5', 'C5', 'G4', 'C5']
      },
      {
        id: 'starlight',
        title: 'Starlight Dream Waltz',
        notes: ['C5', 'E5', 'G5', 'C6', 'A5', 'G5', 'E5', 'D5', 'E5', 'G5', 'C5', 'D5', 'C5']
      },
      {
        id: 'rooftop',
        title: 'Rooftop Cloud Drift',
        notes: ['G4', 'C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5', 'A4', 'C5', 'D5', 'C5']
      }
    ];
  }

  // Lazy initialize AudioContext on user gesture
  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.audioCtx.currentTime);

      // Real-time analyser node for canvas visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    localStorage.setItem('pip_audio_muted', String(mute));

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.audioCtx.currentTime);
    }

    if (this.isMuted && this.isPlayingLullaby) {
      this.stopLullaby();
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Synthesize a chime / bell tone with gentle harmonic overtones
   */
  playChime(noteName, duration = 1.2) {
    if (this.isMuted) return;
    this.init();

    const freq = typeof noteName === 'number' ? noteName : (this.scale[noteName] || 523.25);
    const now = this.audioCtx.currentTime;

    // Primary bell tone (sine wave)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Warm overtone harmonic (triangle wave one octave higher)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // ADSR Envelope: Instant crystalline attack, smooth logarithmic decay
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.7));

    // Connect nodes
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * Sound effect: Wooden nursery block tap
   */
  playWoodBlock() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Sound effect: Gentle UI bubble click
   */
  playBubbleClick() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Sound effect: Music box winding ratchet sound
   */
  playWindingRatchet() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const clickTime = now + (i * 0.04);
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + (i * 100), clickTime);

      gain.gain.setValueAtTime(0.08, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.02);
    }
  }

  /**
   * Sound effect: Realistic vintage book page turn / paper rustle
   */
  playPageFlip() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    // Generate pinkish noise buffer for paper swoosh
    const bufferSize = this.audioCtx.sampleRate * 0.22;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.25;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter to simulate soft parchment friction
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.2);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.22);
  }

  /**
   * Sound effect: Antique pull-chain night lamp switch (click-clack)
   */
  playLampClick() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    
    // First click: metallic snap
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1800, now);
    osc1.frequency.exponentialRampToValueAtTime(350, now + 0.035);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.035);

    // Second clack: brass release
    const clickTime = now + 0.06;
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(820, clickTime);
    osc2.frequency.exponentialRampToValueAtTime(180, clickTime + 0.05);
    gain2.gain.setValueAtTime(0.25, clickTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.05);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(clickTime);
    osc2.stop(clickTime + 0.05);
  }

  /**
   * Sound effect: Vintage mechanical odometer drum ratchet tick
   */
  playMechanicalClick() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Sound effect: Delicate brass compass needle tick
   */
  playCompassTick() {
    if (this.isMuted) return;
    this.init();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.02);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Sound effect: Easter Egg Star Burst
   */
  playSecretCelebration() {
    if (this.isMuted) return;
    this.init();

    const notes = ['C5', 'E5', 'G5', 'C6', 'E6'];
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playChime(note, 1.8);
      }, index * 85);
    });
  }

  /**
   * Start generative music box lullaby
   */
  startLullaby(melodyIndex = 0) {
    if (this.isMuted) return;
    this.init();
    this.stopLullaby();

    this.isPlayingLullaby = true;
    this.currentMelodyIndex = melodyIndex % this.melodies.length;
    this.noteStep = 0;

    const melody = this.melodies[this.currentMelodyIndex];

    const playNext = () => {
      if (!this.isPlayingLullaby) return;

      const note = melody.notes[this.noteStep];
      this.playChime(note, 1.4);

      this.noteStep = (this.noteStep + 1) % melody.notes.length;
      this.lullabyTimer = setTimeout(playNext, 620);
    };

    playNext();
  }

  stopLullaby() {
    this.isPlayingLullaby = false;
    if (this.lullabyTimer) {
      clearTimeout(this.lullabyTimer);
      this.lullabyTimer = null;
    }
  }

  toggleLullaby(melodyIndex = 0) {
    if (this.isPlayingLullaby) {
      this.stopLullaby();
      return false;
    } else {
      this.startLullaby(melodyIndex);
      return true;
    }
  }
}

// Global instance
window.pipAudio = new DreamAudioEngine();
