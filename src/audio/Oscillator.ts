import { audioEngine } from './AudioEngine';
import type { OscillatorType } from './types';

export class Oscillator {
    private oscNode: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private isRunning: boolean = false;

    constructor() { }

    public start(type: OscillatorType, frequency: number, amplitude: number, channel: 1 | 2 = 1) {
        if (this.oscNode) this.stop();

        const context = audioEngine.getContext();
        this.oscNode = context.createOscillator();
        this.gainNode = context.createGain();

        this.oscNode.type = type;
        this.oscNode.frequency.setValueAtTime(frequency, context.currentTime);
        this.gainNode.gain.setValueAtTime(amplitude, context.currentTime);

        this.oscNode.connect(this.gainNode);
        // We don't connect to destination here, we let AudioEngine handle routing

        this.oscNode.start();
        this.isRunning = true;

        // Connect to engine
        audioEngine.connectSource(this.gainNode, channel);
    }

    public stop() {
        if (this.oscNode) {
            try {
                this.oscNode.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            this.oscNode.disconnect();
            this.oscNode = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        this.isRunning = false;
    }

    public setFrequency(freq: number) {
        if (this.oscNode) {
            const context = audioEngine.getContext();
            this.oscNode.frequency.setTargetAtTime(freq, context.currentTime, 0.01);
        }
    }

    public setType(type: OscillatorType) {
        if (this.oscNode) {
            this.oscNode.type = type;
        }
    }

    public setAmplitude(gain: number) {
        if (this.gainNode) {
            const context = audioEngine.getContext();
            this.gainNode.gain.setTargetAtTime(gain, context.currentTime, 0.01);
        }
    }
}
