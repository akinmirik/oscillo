import React from 'react';
import type { AudioSourceType, OscillatorType } from '../audio/types';

interface ControlsProps {
    // Vertical
    voltsPerDiv: number;
    setVoltsPerDiv: (val: number) => void;
    verticalOffset: number;
    setVerticalOffset: (val: number) => void;

    // Horizontal
    timePerDiv: number;
    setTimePerDiv: (val: number) => void;
    horizontalOffset: number;
    setHorizontalOffset: (val: number) => void;

    // Trigger
    triggerLevel: number;
    setTriggerLevel: (val: number) => void;
    triggerSlope: 'rising' | 'falling';
    setTriggerSlope: (val: 'rising' | 'falling') => void;

    // Source
    sourceType: AudioSourceType;
    setSourceType: (val: AudioSourceType) => void;

    // Generator
    oscFrequency: number;
    setOscFrequency: (val: number) => void;
    oscAmplitude: number;
    setOscAmplitude: (val: number) => void;
    oscType: OscillatorType;
    setOscType: (val: OscillatorType) => void;
    micGain: number;
    setMicGain: (val: number) => void;
    audioCurrentTime: number;
    audioDuration: number;
    isAudioPlaying: boolean;
    onAudioPlayPause: () => void;
    onAudioSeek: (time: number) => void;

    // System
    isRunning: boolean;
    setIsRunning: (val: boolean) => void;
    isMuted: boolean;
    setIsMuted: (val: boolean) => void;
    onFileLoad: (file: File) => void;
    onReset: () => void;
}

const ControlSection = ({ title, children, color = 'var(--accent-primary)' }: { title: string, children: React.ReactNode, color?: string }) => (
    <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        position: 'relative'
    }}>
        <h3 style={{
            margin: '0 0 15px 0',
            color: color,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            <span style={{ width: '8px', height: '8px', background: color, borderRadius: '2px' }}></span>
            {title}
        </h3>
        {children}
    </div>
);

const KnobRow = ({ label, value, children }: { label: string, value?: string | number, children: React.ReactNode }) => (
    <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px', color: '#888' }}>
            <span>{label}</span>
            {value !== undefined && <span style={{ color: '#ccc' }}>{value}</span>}
        </div>
        {children}
    </div>
);

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Controls: React.FC<ControlsProps> = ({
    voltsPerDiv, setVoltsPerDiv,
    verticalOffset, setVerticalOffset,
    timePerDiv, setTimePerDiv,
    horizontalOffset, setHorizontalOffset,
    triggerLevel, setTriggerLevel,
    triggerSlope, setTriggerSlope,
    sourceType, setSourceType,
    oscFrequency, setOscFrequency,
    oscAmplitude, setOscAmplitude,
    oscType, setOscType,
    micGain, setMicGain,
    audioCurrentTime, audioDuration, isAudioPlaying, onAudioPlayPause, onAudioSeek,
    isRunning, setIsRunning,
    isMuted, setIsMuted,
    onFileLoad,
    onReset
}) => {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileLoad(file);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
            {/* Main Power / Status */}
            <div style={{ padding: '20px', background: '#181818', borderBottom: '1px solid #333', display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    style={{
                        flex: 2,
                        padding: '12px',
                        background: isRunning ? '#ff0055' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: isRunning ? '0 0 15px rgba(255, 0, 85, 0.4)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isRunning ? 'STOP ACQUISITION' : 'RUN ACQUISITION'}
                </button>
                <button
                    onClick={onReset}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: '#333',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#aaa',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    RESET
                </button>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: isMuted ? '#ffaa00' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        color: isMuted ? 'black' : '#aaa',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Input Source */}
                <ControlSection title="Input Channel">
                    <KnobRow label="Source">
                        <select
                            value={sourceType}
                            onChange={(e) => setSourceType(e.target.value as AudioSourceType)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: '#111',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        >
                            <option value="oscillator">Signal Generator</option>
                            <option value="mic">Microphone Input</option>
                            <option value="file">Audio File</option>
                        </select>
                    </KnobRow>

                    {sourceType === 'file' && (
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            style={{ fontSize: '11px', color: '#888', width: '100%' }}
                        />
                    )}
                </ControlSection>

                {/* File Player Controls */}
                {sourceType === 'file' && (
                    <ControlSection title="File Player" color="#ff00ff">
                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={onAudioPlayPause}
                                style={{
                                    padding: '5px 10px',
                                    background: isAudioPlaying ? '#ff00ff' : '#333',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isAudioPlaying ? 'PAUSE' : 'PLAY'}
                            </button>
                            <span style={{ color: '#aaa', fontSize: '12px' }}>
                                {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={audioDuration || 100}
                            value={audioCurrentTime}
                            onChange={(e) => onAudioSeek(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#ff00ff' }}
                        />
                    </ControlSection>
                )}
                {/* Generator Controls */}
                {sourceType === 'oscillator' && (
                    <ControlSection title="Signal Generator" color="#00ccff">
                        <KnobRow label="Waveform">
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setOscType(type)}
                                        style={{
                                            flex: 1,
                                            padding: '8px 0',
                                            background: oscType === type ? '#00ccff' : '#222',
                                            color: oscType === type ? '#000' : '#666',
                                            border: 'none',
                                            borderRadius: '3px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {type.substr(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </KnobRow>
                        <KnobRow label="Amplitude" value={`${oscAmplitude.toFixed(2)}`}>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={oscAmplitude}
                                onChange={(e) => setOscAmplitude(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#00ccff' }}
                            />
                        </KnobRow>
                        <KnobRow label="Frequency" value={`${oscFrequency} Hz`}>
                            <input
                                type="range"
                                min="20"
                                max="2000"
                                value={oscFrequency}
                                onChange={(e) => setOscFrequency(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#00ccff' }}
                            />
                        </KnobRow>
                    </ControlSection>
                )}

                {/* Microphone Controls */}
                {sourceType === 'mic' && (
                    <ControlSection title="Microphone Input" color="#00ccff">
                        <KnobRow label="Input Gain" value={`x${micGain.toFixed(1)}`}>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={micGain}
                                onChange={(e) => setMicGain(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#00ccff' }}
                            />
                        </KnobRow>
                    </ControlSection>
                )}

                {/* Vertical System */}
                <ControlSection title="Vertical System" color="#ffcc00">
                    <KnobRow label="Scale (Volts/Div)" value={`x${voltsPerDiv.toFixed(1)}`}>
                        <input
                            type="range"
                            min="0.1"
                            max="4.0"
                            step="0.1"
                            value={voltsPerDiv}
                            onChange={(e) => setVoltsPerDiv(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#ffcc00' }}
                        />
                    </KnobRow>
                    <KnobRow label="Position (Div)" value={`${verticalOffset.toFixed(1)}`}>
                        <input
                            type="range"
                            min="-4"
                            max="4"
                            step="0.1"
                            value={verticalOffset}
                            onChange={(e) => setVerticalOffset(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#ffcc00' }}
                        />
                    </KnobRow>
                </ControlSection>

                {/* Horizontal System */}
                <ControlSection title="Horizontal System" color="#00ff99">
                    <KnobRow label="Timebase (Time/Div)" value={`${timePerDiv} ms`}>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={timePerDiv}
                            onChange={(e) => setTimePerDiv(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#00ff99' }}
                        />
                    </KnobRow>
                    <KnobRow label="Position (Div)" value={`${horizontalOffset.toFixed(1)}`}>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={horizontalOffset}
                            onChange={(e) => setHorizontalOffset(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#00ff99' }}
                        />
                    </KnobRow>
                </ControlSection>

                {/* Trigger System */}
                <ControlSection title="Trigger" color="#ff5500">
                    <KnobRow label="Level" value={triggerLevel.toFixed(2)}>
                        <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            value={triggerLevel}
                            onChange={(e) => setTriggerLevel(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#ff5500' }}
                        />
                    </KnobRow>
                    <KnobRow label="Slope">
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setTriggerSlope('rising')}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    background: triggerSlope === 'rising' ? '#ff5500' : '#222',
                                    color: triggerSlope === 'rising' ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                RISING ↑
                            </button>
                            <button
                                onClick={() => setTriggerSlope('falling')}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    background: triggerSlope === 'falling' ? '#ff5500' : '#222',
                                    color: triggerSlope === 'falling' ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                FALLING ↓
                            </button>
                        </div>
                    </KnobRow>
                </ControlSection>
            </div>

            <div style={{ padding: '15px', textAlign: 'center', color: '#444', fontSize: '10px', borderTop: '1px solid #333' }}>
                OSCILLO v1.0
            </div>
        </div>
    );
};

export default React.memo(Controls);
