export type AudioSourceType = 'mic' | 'file' | 'oscillator';

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface AudioEngineState {
    isPlaying: boolean;
    sourceType: AudioSourceType;
    sampleRate: number;
}
