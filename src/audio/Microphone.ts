import { audioEngine } from './AudioEngine';

export class Microphone {
    private stream: MediaStream | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private gainNode: GainNode | null = null;

    public async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                },
                video: false
            });
            const context = audioEngine.getContext();
            this.sourceNode = context.createMediaStreamSource(this.stream);
            this.gainNode = context.createGain();
            this.gainNode.gain.value = 1; // Default gain

            this.sourceNode.connect(this.gainNode);
            audioEngine.connectSource(this.gainNode);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            throw error;
        }
    }

    public setGain(value: number) {
        if (this.gainNode) {
            this.gainNode.gain.setTargetAtTime(value, audioEngine.getContext().currentTime, 0.01);
        }
    }

    public stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
    }
}
