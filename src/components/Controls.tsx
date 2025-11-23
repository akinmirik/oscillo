import React from 'react';
import type { AudioSourceType, OscillatorType } from '../audio/types';

interface ControlsProps {
    // Vertical CH1
    voltsPerDiv: number;
    setVoltsPerDiv: (val: number) => void;
    verticalOffset: number;
    setVerticalOffset: (val: number) => void;

    // Horizontal CH1
    timePerDiv: number;
    setTimePerDiv: (val: number) => void;
    horizontalOffset: number;
    setHorizontalOffset: (val: number) => void;

    // Vertical CH2
    voltsPerDiv2: number;
    setVoltsPerDiv2: (val: number) => void;
    verticalOffset2: number;
    setVerticalOffset2: (val: number) => void;

    // Horizontal CH2
    timePerDiv2: number;
    setTimePerDiv2: (val: number) => void;
    horizontalOffset2: number;
    setHorizontalOffset2: (val: number) => void;

    // Trigger
    triggerLevel: number;
    setTriggerLevel: (val: number) => void;
    triggerSlope: 'rising' | 'falling';
    setTriggerSlope: (val: 'rising' | 'falling') => void;
    triggerSource: 'CH1' | 'CH2';
    setTriggerSource: (val: 'CH1' | 'CH2') => void;

    // Source
    sourceType: AudioSourceType;
    setSourceType: (val: AudioSourceType) => void;

    // Generator CH1
    oscFrequency: number;
    setOscFrequency: (val: number) => void;
    oscAmplitude: number;
    setOscAmplitude: (val: number) => void;
    oscType: OscillatorType;
    setOscType: (val: OscillatorType) => void;

    // Generator CH2
    osc2Frequency: number;
    setOsc2Frequency: (val: number) => void;
    osc2Amplitude: number;
    setOsc2Amplitude: (val: number) => void;
    osc2Type: OscillatorType;
    setOsc2Type: (val: OscillatorType) => void;

    // Channels
    showCH1: boolean;
    setShowCH1: (val: boolean) => void;
    showCH2: boolean;
    setShowCH2: (val: boolean) => void;

    // Split Screen
    isSplitScreen: boolean;
    setIsSplitScreen: (val: boolean) => void;

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

const ControlSection = ({ title, children, color = 'var(--accent-primary)', style }: { title: string, children: React.ReactNode, color?: string, style?: React.CSSProperties }) => (
    <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        position: 'relative',
        ...style
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

    voltsPerDiv2, setVoltsPerDiv2,
    verticalOffset2, setVerticalOffset2,
    timePerDiv2, setTimePerDiv2,
    horizontalOffset2, setHorizontalOffset2,

    triggerLevel, setTriggerLevel,
    triggerSlope, setTriggerSlope,
    triggerSource, setTriggerSource,
    sourceType, setSourceType,
    oscFrequency, setOscFrequency,
    oscAmplitude, setOscAmplitude,
    oscType, setOscType,
    osc2Frequency, setOsc2Frequency,
    osc2Amplitude, setOsc2Amplitude,
    osc2Type, setOsc2Type,
    showCH1, setShowCH1,
    showCH2, setShowCH2,
    isSplitScreen, setIsSplitScreen,
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
                    {isRunning ? 'STOP' : 'RUN'}
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
                {/* Channel Visibility & Split Screen */}
                <ControlSection title="Channels">
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button
                            onClick={() => setShowCH1(!showCH1)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: showCH1 ? '#00ff00' : '#222',
                                color: showCH1 ? '#000' : '#666',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            CH1
                        </button>
                        <button
                            onClick={() => setShowCH2(!showCH2)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: showCH2 ? '#00ccff' : '#222',
                                color: showCH2 ? '#000' : '#666',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            CH2
                        </button>
                    </div>
                    <KnobRow label="View Mode">
                        <button
                            onClick={() => setIsSplitScreen(!isSplitScreen)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: isSplitScreen ? '#fff' : '#222',
                                color: isSplitScreen ? '#000' : '#666',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {isSplitScreen ? 'SPLIT SCREEN (DUAL GRID)' : 'OVERLAY (SINGLE GRID)'}
                        </button>
                    </KnobRow>
                </ControlSection>

                {/* Input Source (Global / CH1) */}
                <ControlSection title="Input Source (CH1)">
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
                        <div style={{ marginTop: '10px' }}>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                style={{ fontSize: '11px', color: '#888', width: '100%', marginBottom: '10px' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
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
                        </div>
                    )}

                    {sourceType === 'mic' && (
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
                    )}
                </ControlSection>

                {/* Channel Controls Container */}
                <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>

                    {/* CH1 Controls */}
                    {showCH1 && (
                        <div style={{ flex: 1, borderRight: showCH2 ? '1px solid #333' : 'none' }}>
                            {/* Generator CH1 */}
                            {sourceType === 'oscillator' && (
                                <ControlSection title="Gen CH1" color="#00ff00" style={{ borderBottom: '1px solid #333' }}>
                                    <KnobRow label="Waveform">
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setOscType(type)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '6px 0',
                                                        background: oscType === type ? '#00ff00' : '#222',
                                                        color: oscType === type ? '#000' : '#666',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        fontSize: '9px',
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
                                            style={{ width: '100%', accentColor: '#00ff00' }}
                                        />
                                    </KnobRow>
                                    <KnobRow label="Frequency" value={`${oscFrequency} Hz`}>
                                        <input
                                            type="range"
                                            min="20"
                                            max="2000"
                                            value={oscFrequency}
                                            onChange={(e) => setOscFrequency(Number(e.target.value))}
                                            style={{ width: '100%', accentColor: '#00ff00' }}
                                        />
                                    </KnobRow>
                                </ControlSection>
                            )}

                            {/* Vertical CH1 */}
                            <ControlSection title="Vertical CH1" color="#00ff00" style={{ borderBottom: '1px solid #333' }}>
                                <KnobRow label="Scale (V/Div)" value={`x${voltsPerDiv.toFixed(1)}`}>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="4.0"
                                        step="0.1"
                                        value={voltsPerDiv}
                                        onChange={(e) => setVoltsPerDiv(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ff00' }}
                                    />
                                </KnobRow>
                                <KnobRow label="Position" value={`${verticalOffset.toFixed(1)}`}>
                                    <input
                                        type="range"
                                        min="-4"
                                        max="4"
                                        step="0.1"
                                        value={verticalOffset}
                                        onChange={(e) => setVerticalOffset(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ff00' }}
                                    />
                                </KnobRow>
                            </ControlSection>

                            {/* Horizontal CH1 */}
                            <ControlSection title="Horizontal CH1" color="#00ff00" style={{ borderBottom: 'none' }}>
                                <KnobRow label="Timebase" value={`${timePerDiv} ms`}>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={timePerDiv}
                                        onChange={(e) => setTimePerDiv(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ff00' }}
                                    />
                                </KnobRow>
                                <KnobRow label="Position" value={`${horizontalOffset.toFixed(1)}`}>
                                    <input
                                        type="range"
                                        min="-5"
                                        max="5"
                                        step="0.1"
                                        value={horizontalOffset}
                                        onChange={(e) => setHorizontalOffset(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ff00' }}
                                    />
                                </KnobRow>
                            </ControlSection>
                        </div>
                    )}

                    {/* CH2 Controls */}
                    {showCH2 && (
                        <div style={{ flex: 1 }}>
                            {/* Generator CH2 */}
                            <ControlSection title="Gen CH2" color="#00ccff" style={{ borderBottom: '1px solid #333' }}>
                                <KnobRow label="Waveform">
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setOsc2Type(type)}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 0',
                                                    background: osc2Type === type ? '#00ccff' : '#222',
                                                    color: osc2Type === type ? '#000' : '#666',
                                                    border: 'none',
                                                    borderRadius: '3px',
                                                    fontSize: '9px',
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
                                <KnobRow label="Amplitude" value={`${osc2Amplitude.toFixed(2)}`}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={osc2Amplitude}
                                        onChange={(e) => setOsc2Amplitude(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ccff' }}
                                    />
                                </KnobRow>
                                <KnobRow label="Frequency" value={`${osc2Frequency} Hz`}>
                                    <input
                                        type="range"
                                        min="20"
                                        max="2000"
                                        value={osc2Frequency}
                                        onChange={(e) => setOsc2Frequency(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ccff' }}
                                    />
                                </KnobRow>
                            </ControlSection>

                            {/* Vertical CH2 */}
                            <ControlSection title="Vertical CH2" color="#00ccff" style={{ borderBottom: '1px solid #333' }}>
                                <KnobRow label="Scale (V/Div)" value={`x${voltsPerDiv2.toFixed(1)}`}>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="4.0"
                                        step="0.1"
                                        value={voltsPerDiv2}
                                        onChange={(e) => setVoltsPerDiv2(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ccff' }}
                                    />
                                </KnobRow>
                                <KnobRow label="Position" value={`${verticalOffset2.toFixed(1)}`}>
                                    <input
                                        type="range"
                                        min="-4"
                                        max="4"
                                        step="0.1"
                                        value={verticalOffset2}
                                        onChange={(e) => setVerticalOffset2(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ccff' }}
                                    />
                                </KnobRow>
                            </ControlSection>

                            {/* Horizontal CH2 */}
                            <ControlSection title="Horizontal CH2" color="#00ccff" style={{ borderBottom: 'none' }}>
                                <KnobRow label="Timebase" value={`${timePerDiv2} ms`}>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={timePerDiv2}
                                        onChange={(e) => setTimePerDiv2(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ccff' }}
                                    />
                                </KnobRow>
                                <KnobRow label="Position" value={`${horizontalOffset2.toFixed(1)}`}>
                                    <input
                                        type="range"
                                        min="-5"
                                        max="5"
                                        step="0.1"
                                        value={horizontalOffset2}
                                        onChange={(e) => setHorizontalOffset2(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#00ccff' }}
                                    />
                                </KnobRow>
                            </ControlSection>
                        </div>
                    )}
                </div>

                {/* Trigger System */}
                <ControlSection title="Trigger" color="#ff5500">
                    <KnobRow label="Source">
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setTriggerSource('CH1')}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    background: triggerSource === 'CH1' ? '#ff5500' : '#222',
                                    color: triggerSource === 'CH1' ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                CH1
                            </button>
                            <button
                                onClick={() => setTriggerSource('CH2')}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    background: triggerSource === 'CH2' ? '#ff5500' : '#222',
                                    color: triggerSource === 'CH2' ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                CH2
                            </button>
                        </div>
                    </KnobRow>
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
