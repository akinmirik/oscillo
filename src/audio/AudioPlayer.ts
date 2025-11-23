import { audioEngine } from './AudioEngine';

export class AudioPlayer {
    private audioEl: HTMLAudioElement;
    private sourceNode: MediaElementAudioSourceNode | null = null;

    constructor() {
        this.audioEl = new Audio();
        this.audioEl.loop = true;
        this.audioEl.crossOrigin = "anonymous";
    }

    public async loadFile(file: File) {
        const url = URL.createObjectURL(file);
        this.audioEl.src = url;

        // Setup node if not already
        if (!this.sourceNode) {
            // Wait for context to be ready
            const context = audioEngine.getContext();
            this.sourceNode = context.createMediaElementSource(this.audioEl);
        }

        audioEngine.connectSource(this.sourceNode);
        await this.audioEl.play();
    }

    public play() {
        this.audioEl.play();
    }

    public pause() {
        this.audioEl.pause();
    }

    public seek(time: number) {
        if (this.audioEl.duration) {
            this.audioEl.currentTime = Math.max(0, Math.min(time, this.audioEl.duration));
        }
    }

    public getCurrentTime(): number {
        return this.audioEl.currentTime;
    }

    public getDuration(): number {
        return this.audioEl.duration || 0;
    }

    public setOnTimeUpdate(callback: (time: number) => void) {
        this.audioEl.ontimeupdate = () => {
            callback(this.audioEl.currentTime);
        };
    }

    public setOnEnded(callback: () => void) {
        this.audioEl.onended = callback;
    }
}
