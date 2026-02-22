type ThemeConfig = {
  tempoMs: number;
  notes: number[];
  waveform: OscillatorType;
};

const THEMES: Record<string, ThemeConfig> = {
  'market-theme': {
    tempoMs: 320,
    notes: [220, 277, 330, 392, 330, 277],
    waveform: 'triangle',
  },
  'metro-theme': {
    tempoMs: 260,
    notes: [196, 247, 294, 247, 196, 175, 147],
    waveform: 'sawtooth',
  },
  'port-theme': {
    tempoMs: 300,
    notes: [165, 220, 247, 220, 196, 175, 147, 131],
    waveform: 'square',
  },
};

export class AudioMixer {
  private readonly context =
    typeof window !== 'undefined'
      ? new (
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()
      : null;

  private readonly masterGain: GainNode | null = this.context?.createGain() ?? null;
  private readonly musicGain: GainNode | null = this.context?.createGain() ?? null;
  private readonly sfxGain: GainNode | null = this.context?.createGain() ?? null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private currentThemeKey: string | null = null;

  constructor() {
    if (!this.context || !this.masterGain || !this.musicGain || !this.sfxGain) {
      return;
    }
    this.masterGain.gain.value = 0.8;
    this.musicGain.gain.value = 0.22;
    this.sfxGain.gain.value = 0.32;
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
  }

  unlock(): void {
    if (!this.context) {
      return;
    }
    void this.context.resume();
  }

  playMusic(themeKey: string): void {
    if (!this.context || !this.musicGain) {
      return;
    }
    if (this.currentThemeKey === themeKey) {
      return;
    }
    this.stopMusic();
    const theme = THEMES[themeKey] ?? THEMES['market-theme'];
    this.currentThemeKey = themeKey;
    this.musicStep = 0;
    this.musicTimer = window.setInterval(() => {
      this.playTone(theme.notes[this.musicStep % theme.notes.length], theme.waveform, 0.22, 0.18);
      this.musicStep += 1;
    }, theme.tempoMs);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.currentThemeKey = null;
  }

  playSfx(sfxKey: string, volume = 1): void {
    if (!this.context || !this.sfxGain) {
      return;
    }
    if (sfxKey === 'hit-light') {
      this.playTone(180, 'square', 0.05, 0.09 * volume, this.sfxGain);
      this.playTone(90, 'triangle', 0.07, 0.08 * volume, this.sfxGain);
      return;
    }
    if (sfxKey === 'hit-heavy') {
      this.playTone(130, 'sawtooth', 0.08, 0.14 * volume, this.sfxGain);
      this.playTone(60, 'triangle', 0.1, 0.1 * volume, this.sfxGain);
      return;
    }
    if (sfxKey === 'special') {
      this.playTone(440, 'sine', 0.18, 0.18 * volume, this.sfxGain);
      this.playTone(660, 'sine', 0.22, 0.12 * volume, this.sfxGain);
      return;
    }
    if (sfxKey === 'step') {
      this.playTone(90, 'triangle', 0.03, 0.03 * volume, this.sfxGain);
      return;
    }
    if (sfxKey === 'ui-click') {
      this.playTone(620, 'square', 0.03, 0.05 * volume, this.sfxGain);
      return;
    }
    this.playTone(220, 'sine', 0.05, 0.05 * volume, this.sfxGain);
  }

  duckMusic(durationMs = 120): void {
    if (!this.context || !this.musicGain) {
      return;
    }
    const start = this.context.currentTime;
    this.musicGain.gain.cancelScheduledValues(start);
    this.musicGain.gain.setValueAtTime(0.08, start);
    this.musicGain.gain.linearRampToValueAtTime(0.22, start + durationMs / 1000);
  }

  private playTone(
    frequency: number,
    waveform: OscillatorType,
    durationSeconds: number,
    volume: number,
    destination = this.musicGain,
  ): void {
    if (!this.context || !destination) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(destination);

    const startAt = this.context.currentTime;
    gainNode.gain.setValueAtTime(volume, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + durationSeconds);
    oscillator.start(startAt);
    oscillator.stop(startAt + durationSeconds + 0.01);
  }
}
