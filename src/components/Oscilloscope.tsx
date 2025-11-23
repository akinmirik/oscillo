import React, { useState, useEffect, useRef } from 'react';
import OscilloscopeScreen from './OscilloscopeScreen';
import Controls from './Controls';
import { audioEngine } from '../audio/AudioEngine';
import { Oscillator } from '../audio/Oscillator';
import { Microphone } from '../audio/Microphone';
import { AudioPlayer } from '../audio/AudioPlayer';
import type { AudioSourceType, OscillatorType } from '../audio/types';

const Oscilloscope: React.FC = () => {
    // State
    const [isRunning, setIsRunning] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [sourceType, setSourceType] = useState<AudioSourceType>('oscillator');

    // Display Params
    const [voltsPerDiv, setVoltsPerDiv] = useState(1);
    const [verticalOffset, setVerticalOffset] = useState(0); // divisions
    const [timePerDiv, setTimePerDiv] = useState(10); // ms
    const [horizontalOffset, setHorizontalOffset] = useState(0); // divisions

    // Trigger Params
    const [triggerLevel, setTriggerLevel] = useState(0);
    const [triggerSlope, setTriggerSlope] = useState<'rising' | 'falling'>('rising');

    // Generator Params
    const [oscFrequency, setOscFrequency] = useState(440);
    const [oscAmplitude, setOscAmplitude] = useState(1);
    const [oscType, setOscType] = useState<OscillatorType>('sine');

    // Microphone Params
    const [micGain, setMicGain] = useState(1);

    // Audio Player Params
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Audio Objects
    const oscillatorRef = useRef<Oscillator>(new Oscillator());
    const microphoneRef = useRef<Microphone>(new Microphone());
    const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());

    // Setup Audio Player Callbacks
    useEffect(() => {
        audioPlayerRef.current.setOnTimeUpdate((time) => {
            setAudioCurrentTime(time);
        });
        // We can also check duration periodically or on load
    }, []);

    // Init Audio Engine on first interaction (Run)
    useEffect(() => {
        if (isRunning) {
            audioEngine.init();

            // Start source
            if (sourceType === 'oscillator') {
                oscillatorRef.current.start(oscType, oscFrequency, oscAmplitude);
            } else if (sourceType === 'mic') {
                microphoneRef.current.start();
            } else if (sourceType === 'file') {
                audioPlayerRef.current.play();
            }
        } else {
            // Stop sources
            oscillatorRef.current.stop();
            microphoneRef.current.stop();
            audioPlayerRef.current.pause();
        }
    }, [isRunning]);

    // Handle Source Switching
    useEffect(() => {
        if (!isRunning) return;

        // Stop all
        oscillatorRef.current.stop();
        microphoneRef.current.stop();
        audioPlayerRef.current.pause();

        // Start new
        if (sourceType === 'oscillator') {
            oscillatorRef.current.start(oscType, oscFrequency, oscAmplitude);
        } else if (sourceType === 'mic') {
            microphoneRef.current.start();
        } else if (sourceType === 'file') {
            audioPlayerRef.current.play();
        }
    }, [sourceType]);

    // Update Oscillator Params
    useEffect(() => {
        if (sourceType === 'oscillator' && isRunning) {
            oscillatorRef.current.setFrequency(oscFrequency);
            oscillatorRef.current.setAmplitude(oscAmplitude);
            oscillatorRef.current.setType(oscType);
        }
        if (sourceType === 'mic' && isRunning) {
            microphoneRef.current.setGain(micGain);
        }
    }, [oscFrequency, oscAmplitude, oscType, micGain, sourceType, isRunning]);

    // Handle Mute
    useEffect(() => {
        audioEngine.setVolume(isMuted ? 0 : 1);
    }, [isMuted]);

    const handleFileLoad = async (file: File) => {
        await audioPlayerRef.current.loadFile(file);
        setAudioDuration(audioPlayerRef.current.getDuration());
        if (isRunning && sourceType === 'file') {
            setIsAudioPlaying(true);
        }
    };

    const handleReset = () => {
        setVoltsPerDiv(1);
        setVerticalOffset(0);
        setTimePerDiv(10);
        setHorizontalOffset(0);
        setTriggerLevel(0);
        setTriggerSlope('rising');
        setOscFrequency(440);
        setOscAmplitude(1);
        setOscType('sine');
        setSourceType('oscillator');
        setMicGain(1);
        setIsMuted(false);
        // We don't reset isRunning, user might want to keep running
    };

    return (
        <div className="oscilloscope-chassis" style={{
            width: '100%',
            height: '100%',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            boxSizing: 'border-box'
        }}>
            <div className="device-frame" style={{
                width: '100%',
                maxWidth: '1400px',
                height: '100%',
                maxHeight: '700px',
                background: '#222',
                borderRadius: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
                display: 'flex',
                overflow: 'hidden',
                border: '1px solid #333'
            }}>
                {/* Screen Section */}
                <div className="screen-section" style={{
                    flex: 3,
                    background: '#000',
                    position: 'relative',
                    borderRight: '2px solid #111',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Bezel/Header */}
                    <div style={{
                        height: '40px',
                        background: '#111',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        color: '#666',
                        fontSize: '12px',
                        letterSpacing: '1px',
                        borderBottom: '1px solid #222'
                    }}>
                        <span>DIGITAL OSCILLOSCOPE</span>
                        <div style={{ flex: 1 }} />
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRunning ? '#0f0' : '#333', boxShadow: isRunning ? '0 0 5px #0f0' : 'none' }} />
                    </div>

                    {/* CRT Screen Area */}
                    <div style={{ flex: 1, position: 'relative', padding: '20px' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: '#050505',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: 'inset 2px #333',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                        }}>
                            <OscilloscopeScreen
                                timePerDiv={timePerDiv}
                                voltsPerDiv={voltsPerDiv}
                                triggerLevel={triggerLevel}
                                triggerSlope={triggerSlope}
                                isRunning={isRunning}
                                frequency={oscFrequency}
                                verticalOffset={verticalOffset}
                                horizontalOffset={horizontalOffset}
                            />
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="controls-section" style={{
                    flex: 1,
                    minWidth: '320px',
                    maxWidth: '360px',
                    background: '#1e1e1e',
                    padding: '0',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Controls
                        voltsPerDiv={voltsPerDiv} setVoltsPerDiv={setVoltsPerDiv}
                        verticalOffset={verticalOffset} setVerticalOffset={setVerticalOffset}
                        timePerDiv={timePerDiv} setTimePerDiv={setTimePerDiv}
                        horizontalOffset={horizontalOffset} setHorizontalOffset={setHorizontalOffset}
                        triggerLevel={triggerLevel} setTriggerLevel={setTriggerLevel}
                        triggerSlope={triggerSlope} setTriggerSlope={setTriggerSlope}
                        sourceType={sourceType} setSourceType={setSourceType}
                        oscFrequency={oscFrequency} setOscFrequency={setOscFrequency}
                        oscAmplitude={oscAmplitude} setOscAmplitude={setOscAmplitude}
                        oscType={oscType} setOscType={setOscType}
                        micGain={micGain} setMicGain={setMicGain}
                        audioCurrentTime={audioCurrentTime}
                        audioDuration={audioDuration}
                        isAudioPlaying={isAudioPlaying}
                        onAudioPlayPause={() => {
                            if (isAudioPlaying) {
                                audioPlayerRef.current.pause();
                                setIsAudioPlaying(false);
                            } else {
                                audioPlayerRef.current.play();
                                setIsAudioPlaying(true);
                            }
                        }}
                        onAudioSeek={(time) => {
                            audioPlayerRef.current.seek(time);
                            setAudioCurrentTime(time);
                        }}
                        isRunning={isRunning}
                        setIsRunning={(val) => {
                            if (val) {
                                audioEngine.init();
                            }
                            setIsRunning(val);
                        }}
                        isMuted={isMuted} setIsMuted={setIsMuted}
                        onFileLoad={handleFileLoad}
                        onReset={handleReset}
                    />
                </div>
            </div>
        </div>
    );
};

export default Oscilloscope;
