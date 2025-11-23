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
    const [isSplitScreen, setIsSplitScreen] = useState(false);

    // Display Params CH1
    const [voltsPerDiv, setVoltsPerDiv] = useState(1);
    const [verticalOffset, setVerticalOffset] = useState(0); // divisions
    const [timePerDiv, setTimePerDiv] = useState(10); // ms
    const [horizontalOffset, setHorizontalOffset] = useState(0); // divisions

    // Display Params CH2
    const [voltsPerDiv2, setVoltsPerDiv2] = useState(1);
    const [verticalOffset2, setVerticalOffset2] = useState(0); // divisions
    const [timePerDiv2, setTimePerDiv2] = useState(10); // ms
    const [horizontalOffset2, setHorizontalOffset2] = useState(0); // divisions

    // Trigger Params
    const [triggerLevel, setTriggerLevel] = useState(0);
    const [triggerSlope, setTriggerSlope] = useState<'rising' | 'falling'>('rising');
    const [triggerSource, setTriggerSource] = useState<'CH1' | 'CH2'>('CH1');

    // Generator Params CH1
    const [oscFrequency, setOscFrequency] = useState(440);
    const [oscAmplitude, setOscAmplitude] = useState(1);
    const [oscType, setOscType] = useState<OscillatorType>('sine');

    // Generator Params CH2
    const [osc2Frequency, setOsc2Frequency] = useState(440);
    const [osc2Amplitude, setOsc2Amplitude] = useState(1);
    const [osc2Type, setOsc2Type] = useState<OscillatorType>('sine');

    // Channel Visibility
    const [showCH1, setShowCH1] = useState(false);
    const [showCH2, setShowCH2] = useState(false);

    // Microphone Params
    const [micGain, setMicGain] = useState(1);

    // Audio Player Params
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Audio Objects
    const oscillatorRef = useRef<Oscillator>(new Oscillator());
    const oscillator2Ref = useRef<Oscillator>(new Oscillator());
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

            // Start source CH1
            if (showCH1) {
                if (sourceType === 'oscillator') {
                    oscillatorRef.current.start(oscType, oscFrequency, oscAmplitude, 1);
                } else if (sourceType === 'mic') {
                    microphoneRef.current.start();
                } else if (sourceType === 'file') {
                    audioPlayerRef.current.play();
                }
            }

            // Start source CH2 (Always oscillator for now)
            if (showCH2) {
                oscillator2Ref.current.start(osc2Type, osc2Frequency, osc2Amplitude, 2);
            }

        } else {
            // Stop sources
            oscillatorRef.current.stop();
            oscillator2Ref.current.stop();
            microphoneRef.current.stop();
            audioPlayerRef.current.pause();
        }
    }, [isRunning, showCH1, showCH2]); // Re-run if visibility changes

    // Handle Source Switching (CH1)
    useEffect(() => {
        if (!isRunning) return;

        // Stop all CH1 sources
        oscillatorRef.current.stop();
        microphoneRef.current.stop();
        audioPlayerRef.current.pause();

        // Start new CH1 if visible
        if (showCH1) {
            if (sourceType === 'oscillator') {
                oscillatorRef.current.start(oscType, oscFrequency, oscAmplitude, 1);
            } else if (sourceType === 'mic') {
                microphoneRef.current.start();
            } else if (sourceType === 'file') {
                audioPlayerRef.current.play();
            }
        }
    }, [sourceType, showCH1]);

    // Update Oscillator Params CH1
    useEffect(() => {
        if (sourceType === 'oscillator' && isRunning && showCH1) {
            oscillatorRef.current.setFrequency(oscFrequency);
            oscillatorRef.current.setAmplitude(oscAmplitude);
            oscillatorRef.current.setType(oscType);
        }
        if (sourceType === 'mic' && isRunning && showCH1) {
            microphoneRef.current.setGain(micGain);
        }
    }, [oscFrequency, oscAmplitude, oscType, micGain, sourceType, isRunning, showCH1]);

    // Update Oscillator Params CH2
    useEffect(() => {
        if (showCH2 && isRunning) {
            oscillator2Ref.current.setFrequency(osc2Frequency);
            oscillator2Ref.current.setAmplitude(osc2Amplitude);
            oscillator2Ref.current.setType(osc2Type);
        } else {
            oscillator2Ref.current.stop();
        }
    }, [osc2Frequency, osc2Amplitude, osc2Type, showCH2, isRunning]);

    // Handle Mute
    useEffect(() => {
        audioEngine.setVolume(isMuted ? 0 : 1);
    }, [isMuted]);

    const handleFileLoad = async (file: File) => {
        await audioPlayerRef.current.loadFile(file);
        setAudioDuration(audioPlayerRef.current.getDuration());
        if (isRunning && sourceType === 'file' && showCH1) {
            setIsAudioPlaying(true);
        }
    };

    const handleReset = () => {
        setVoltsPerDiv(1);
        setVerticalOffset(0);
        setTimePerDiv(10);
        setHorizontalOffset(0);

        setVoltsPerDiv2(1);
        setVerticalOffset2(0);
        setTimePerDiv2(10);
        setHorizontalOffset2(0);

        setTriggerLevel(0);
        setTriggerSlope('rising');
        setTriggerSource('CH1');

        setOscFrequency(440);
        setOscAmplitude(1);
        setOscType('sine');

        setOsc2Frequency(440);
        setOsc2Amplitude(1);
        setOsc2Type('sine');

        setSourceType('oscillator');
        setMicGain(1);
        setIsMuted(false);
        setIsSplitScreen(false);
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
                maxWidth: '1600px', // Increased width
                height: '100%',
                maxHeight: '800px', // Increased height
                background: '#222',
                borderRadius: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
                display: 'flex',
                overflow: 'hidden',
                border: '1px solid #333'
            }}>
                {/* Screen Section */}
                <div className="screen-section" style={{
                    flex: 2,
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
                                verticalOffset={verticalOffset}
                                horizontalOffset={horizontalOffset}

                                timePerDiv2={timePerDiv2}
                                voltsPerDiv2={voltsPerDiv2}
                                verticalOffset2={verticalOffset2}
                                horizontalOffset2={horizontalOffset2}

                                triggerLevel={triggerLevel}
                                triggerSlope={triggerSlope}
                                triggerSource={triggerSource}
                                isRunning={isRunning}
                                frequency={oscFrequency}
                                showCH1={showCH1}
                                showCH2={showCH2}
                                isSplitScreen={isSplitScreen}
                            />
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="controls-section" style={{
                    flex: 1,
                    minWidth: '500px', // Increased width for side-by-side controls
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

                        voltsPerDiv2={voltsPerDiv2} setVoltsPerDiv2={setVoltsPerDiv2}
                        verticalOffset2={verticalOffset2} setVerticalOffset2={setVerticalOffset2}
                        timePerDiv2={timePerDiv2} setTimePerDiv2={setTimePerDiv2}
                        horizontalOffset2={horizontalOffset2} setHorizontalOffset2={setHorizontalOffset2}

                        triggerLevel={triggerLevel} setTriggerLevel={setTriggerLevel}
                        triggerSlope={triggerSlope} setTriggerSlope={setTriggerSlope}
                        triggerSource={triggerSource} setTriggerSource={setTriggerSource}
                        sourceType={sourceType} setSourceType={setSourceType}
                        oscFrequency={oscFrequency} setOscFrequency={setOscFrequency}
                        oscAmplitude={oscAmplitude} setOscAmplitude={setOscAmplitude}
                        oscType={oscType} setOscType={setOscType}
                        osc2Frequency={osc2Frequency} setOsc2Frequency={setOsc2Frequency}
                        osc2Amplitude={osc2Amplitude} setOsc2Amplitude={setOsc2Amplitude}
                        osc2Type={osc2Type} setOsc2Type={setOsc2Type}
                        showCH1={showCH1} setShowCH1={setShowCH1}
                        showCH2={showCH2} setShowCH2={setShowCH2}
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
                        isSplitScreen={isSplitScreen}
                        setIsSplitScreen={setIsSplitScreen}
                    />
                </div>
            </div>
        </div>
    );
};

export default Oscilloscope;
