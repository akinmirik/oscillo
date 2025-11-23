// AudioSourceType removed

class AudioEngine {
    private context: AudioContext | null = null;
    private analyserCH1: AnalyserNode | null = null;
    private analyserCH2: AnalyserNode | null = null;
    private masterGain: GainNode | null = null;

    // Sources
    private sourceCH1: AudioNode | null = null;
    private sourceCH2: AudioNode | null = null;

    constructor() {
        // Context is initialized on user interaction
    }

    public init() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);

            // CH1 Setup
            this.analyserCH1 = this.context.createAnalyser();
            this.analyserCH1.fftSize = 32768;
            this.analyserCH1.smoothingTimeConstant = 0;
            this.analyserCH1.connect(this.masterGain);

            // CH2 Setup
            this.analyserCH2 = this.context.createAnalyser();
            this.analyserCH2.fftSize = 32768;
            this.analyserCH2.smoothingTimeConstant = 0;
            this.analyserCH2.connect(this.masterGain);
        }

        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    public getContext(): AudioContext {
        if (!this.context) throw new Error("AudioContext not initialized");
        return this.context;
    }

    public getAnalyser(channel: 1 | 2 = 1): AnalyserNode {
        if (channel === 2) {
            if (!this.analyserCH2) throw new Error("Analyser CH2 not initialized");
            return this.analyserCH2;
        }
        if (!this.analyserCH1) throw new Error("Analyser CH1 not initialized");
        return this.analyserCH1;
    }

    public connectSource(node: AudioNode, channel: 1 | 2 = 1) {
        if (!this.context) this.init();

        if (channel === 1) {
            if (this.sourceCH1) this.sourceCH1.disconnect();
            this.sourceCH1 = node;
            this.sourceCH1.connect(this.analyserCH1!);
        } else {
            if (this.sourceCH2) this.sourceCH2.disconnect();
            this.sourceCH2 = node;
            this.sourceCH2.connect(this.analyserCH2!);
        }
    }

    public setVolume(value: number) {
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    public getSampleRate(): number {
        return this.context ? this.context.sampleRate : 44100;
    }
}

export const audioEngine = new AudioEngine();
