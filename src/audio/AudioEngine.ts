// AudioSourceType removed

class AudioEngine {
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private masterGain: GainNode | null = null;

    // Sources
    private currentSourceNode: AudioNode | null = null;

    constructor() {
        // Context is initialized on user interaction
    }

    public init() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.analyser = this.context.createAnalyser();
            this.masterGain = this.context.createGain();

            // Configuration
            this.analyser.fftSize = 32768; // Max size for longer time window
            this.analyser.smoothingTimeConstant = 0; // No smoothing for oscilloscope

            // Routing: Source -> Analyser -> MasterGain -> Destination
            // (Note: We might want to disconnect MasterGain from Destination if we don't want to hear it, 
            // or provide a mute toggle. For now, we connect it.)
            this.analyser.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);
        }

        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    public getContext(): AudioContext {
        if (!this.context) throw new Error("AudioContext not initialized");
        return this.context;
    }

    public getAnalyser(): AnalyserNode {
        if (!this.analyser) throw new Error("Analyser not initialized");
        return this.analyser;
    }

    public connectSource(node: AudioNode) {
        if (!this.analyser) this.init();

        // Disconnect previous source
        if (this.currentSourceNode) {
            this.currentSourceNode.disconnect();
        }

        this.currentSourceNode = node;
        this.currentSourceNode.connect(this.analyser!);
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
