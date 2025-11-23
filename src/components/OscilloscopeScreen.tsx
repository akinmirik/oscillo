import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { findTriggerPoint } from '../utils/trigger';

interface OscilloscopeScreenProps {
    timePerDiv: number; // ms
    voltsPerDiv: number; // gain factor (1 = normal)
    verticalOffset: number;
    horizontalOffset: number;

    timePerDiv2: number;
    voltsPerDiv2: number;
    verticalOffset2: number;
    horizontalOffset2: number;

    triggerLevel: number;
    triggerSlope: 'rising' | 'falling';
    triggerSource: 'CH1' | 'CH2';
    isRunning: boolean;
    frequency: number;
    showCH1: boolean;
    showCH2: boolean;
    isSplitScreen: boolean;
}

const OscilloscopeScreen: React.FC<OscilloscopeScreenProps> = ({
    timePerDiv,
    voltsPerDiv,
    verticalOffset,
    horizontalOffset,
    timePerDiv2,
    voltsPerDiv2,
    verticalOffset2,
    horizontalOffset2,
    triggerLevel,
    triggerSlope,
    triggerSource,
    isRunning,
    frequency,
    showCH1,
    showCH2,
    isSplitScreen
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paramsRef = useRef({
        timePerDiv, voltsPerDiv, verticalOffset, horizontalOffset,
        timePerDiv2, voltsPerDiv2, verticalOffset2, horizontalOffset2,
        triggerLevel, triggerSlope, triggerSource, showCH1, showCH2, isSplitScreen
    });
    const dataArrayCH1Ref = useRef<Float32Array>(new Float32Array(32768));
    const dataArrayCH2Ref = useRef<Float32Array>(new Float32Array(32768));
    const animationIdRef = useRef<number | undefined>(undefined);
    const [vpp1, setVpp1] = useState(0);
    const [vpp2, setVpp2] = useState(0);

    // Update refs
    useEffect(() => {
        paramsRef.current = {
            timePerDiv, voltsPerDiv, verticalOffset, horizontalOffset,
            timePerDiv2, voltsPerDiv2, verticalOffset2, horizontalOffset2,
            triggerLevel, triggerSlope, triggerSource, showCH1, showCH2, isSplitScreen
        };
    }, [
        timePerDiv, voltsPerDiv, verticalOffset, horizontalOffset,
        timePerDiv2, voltsPerDiv2, verticalOffset2, horizontalOffset2,
        triggerLevel, triggerSlope, triggerSource, showCH1, showCH2, isSplitScreen
    ]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, isSplit: boolean) => {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Vertical lines (Time)
        const numDivX = 10;
        const pixelsPerDivX = width / numDivX;
        for (let i = 0; i <= numDivX; i++) {
            const x = i * pixelsPerDivX;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        // Horizontal lines (Voltage)
        const numDivY = 8;
        const pixelsPerDivY = height / numDivY;
        for (let i = 0; i <= numDivY; i++) {
            const y = i * pixelsPerDivY;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        ctx.stroke();

        // Center axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (isSplit) {
            // Split Screen Axes
            // Top Half (CH1)
            ctx.moveTo(0, height / 4);
            ctx.lineTo(width, height / 4);

            // Bottom Half (CH2)
            ctx.moveTo(0, (height / 4) * 3);
            ctx.lineTo(width, (height / 4) * 3);

            // Divider
            ctx.strokeStyle = '#fff'; // White divider
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
        } else {
            // Normal Axes
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
        }
        ctx.stroke();
    };

    const drawWaveform = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        dataArray: Float32Array,
        color: string,
        startIndex: number,
        channel: 1 | 2,
        calculateVpp: boolean
    ) => {
        const {
            voltsPerDiv, verticalOffset, timePerDiv,
            voltsPerDiv2, verticalOffset2, timePerDiv2,
            isSplitScreen
        } = paramsRef.current;

        // Select params based on channel
        const vPerDiv = channel === 1 ? voltsPerDiv : voltsPerDiv2;
        const vOffset = channel === 1 ? verticalOffset : verticalOffset2;
        const tPerDiv = channel === 1 ? timePerDiv : timePerDiv2;

        // Calculate Vpp
        if (calculateVpp) {
            let min = 1, max = -1;
            for (let i = 0; i < dataArray.length; i++) {
                if (dataArray[i] < min) min = dataArray[i];
                if (dataArray[i] > max) max = dataArray[i];
            }
            if (channel === 1) setVpp1(max - min);
            else setVpp2(max - min);
        }

        // Drawing Setup
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.beginPath();

        const numDivX = 10;
        const sampleRate = audioEngine.getSampleRate();
        const samplesPerDiv = (tPerDiv / 1000) * sampleRate;
        const totalSamplesToDraw = numDivX * samplesPerDiv;
        const pixelsPerSample = width / totalSamplesToDraw;

        const numDivY = 8;
        const pixelsPerDivY = height / numDivY;

        // Calculate Y-axis mapping
        let zeroY = height / 2; // Default center

        if (isSplitScreen) {
            // In split screen, each channel gets half height
            if (channel === 1) {
                zeroY = height / 4; // Center of top half
            } else {
                zeroY = (height / 4) * 3; // Center of bottom half
            }
        }

        // Vertical Offset (in divisions)
        // In split screen, divisions are effectively half-height if we keep 8 divs total?
        // Or do we keep 4 divs per half? Let's assume 8 divs total for screen, so 4 divs per channel in split.
        // So pixelsPerDivY remains same.
        const pixelOffsetY = vOffset * pixelsPerDivY;

        for (let x = 0; x < width; x++) {
            const sampleIdx = Math.floor(startIndex + x / pixelsPerSample);

            if (sampleIdx >= 0 && sampleIdx < dataArray.length) {
                const sample = dataArray[sampleIdx];

                // y = zeroY - (sample / vPerDiv) * pixelsPerDivY - pixelOffsetY
                let y = zeroY - (sample / vPerDiv) * pixelsPerDivY - pixelOffsetY;

                // Clip to channel area in split screen (optional but good for polish)
                if (isSplitScreen) {
                    if (channel === 1) {
                        if (y > height / 2) y = height / 2;
                        if (y < 0) y = 0;
                    } else {
                        if (y > height) y = height;
                        if (y < height / 2) y = height / 2;
                    }
                }

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const {
            showCH1, showCH2, triggerLevel, triggerSlope, triggerSource,
            horizontalOffset, horizontalOffset2, timePerDiv, timePerDiv2, isSplitScreen
        } = paramsRef.current;

        ctx.clearRect(0, 0, width, height);
        drawGrid(ctx, width, height, isSplitScreen);

        // Fetch Data
        let hasDataCH1 = false;
        let hasDataCH2 = false;

        if (showCH1) {
            try {
                const analyser1 = audioEngine.getAnalyser(1);
                // @ts-ignore
                analyser1.getFloatTimeDomainData(dataArrayCH1Ref.current);
                hasDataCH1 = true;
            } catch (e) { }
        }

        if (showCH2) {
            try {
                const analyser2 = audioEngine.getAnalyser(2);
                // @ts-ignore
                analyser2.getFloatTimeDomainData(dataArrayCH2Ref.current);
                hasDataCH2 = true;
            } catch (e) { }
        }

        // Determine Trigger
        let triggerIdx = 0;
        let triggerData: Float32Array | null = null;

        if (triggerSource === 'CH1' && hasDataCH1) {
            triggerData = dataArrayCH1Ref.current;
        } else if (triggerSource === 'CH2' && hasDataCH2) {
            triggerData = dataArrayCH2Ref.current;
        } else if (hasDataCH1) {
            // Fallback to CH1 if CH2 trigger selected but not available
            triggerData = dataArrayCH1Ref.current;
        } else if (hasDataCH2) {
            triggerData = dataArrayCH2Ref.current;
        }

        if (triggerData) {
            triggerIdx = findTriggerPoint(triggerData, { level: triggerLevel, slope: triggerSlope });
        }

        // Calculate Start Indices
        const sampleRate = audioEngine.getSampleRate();

        // CH1 Start Index
        const samplesPerDiv1 = (timePerDiv / 1000) * sampleRate;
        const offsetSamples1 = horizontalOffset * samplesPerDiv1;
        const startIndex1 = triggerIdx - offsetSamples1;

        // CH2 Start Index (Independent Horizontal)
        const samplesPerDiv2 = (timePerDiv2 / 1000) * sampleRate;
        const offsetSamples2 = horizontalOffset2 * samplesPerDiv2;
        // If triggering on CH1, CH2 should ideally be phase locked if it's related.
        // But if we have independent timebases, we just use the trigger index as reference.
        const startIndex2 = triggerIdx - offsetSamples2;

        // Draw Traces
        if (showCH1 && hasDataCH1) {
            drawWaveform(ctx, width, height, dataArrayCH1Ref.current, '#00ff00', startIndex1, 1, true);
        }

        if (showCH2 && hasDataCH2) {
            drawWaveform(ctx, width, height, dataArrayCH2Ref.current, '#00ccff', startIndex2, 2, true);
        }

        animationIdRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isRunning) {
            animationIdRef.current = requestAnimationFrame(animate);
        } else {
            // Draw grid once when stopped
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const { width, height } = canvas;
                    const { isSplitScreen } = paramsRef.current;
                    ctx.clearRect(0, 0, width, height);
                    drawGrid(ctx, width, height, isSplitScreen);
                }
            }
            if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        }
        return () => {
            if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        };
    }, [isRunning]);

    // Initial draw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { width, height } = canvas;
                const { isSplitScreen } = paramsRef.current;
                drawGrid(ctx, width, height, isSplitScreen);
            }
        }
    }, []);

    return (
        <div className="glass-panel" style={{ width: '100%', height: '100%', position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/* Info Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                padding: '10px 20px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderTop: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '14px',
                boxSizing: 'border-box',
                pointerEvents: 'none' // Let clicks pass through to canvas if needed
            }}>
                {/* Channel 1 Info */}
                {showCH1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#00ff00', color: '#000', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold' }}>CH1</span>
                        <span style={{ color: '#00ff00' }}>{voltsPerDiv.toFixed(2)}V</span>
                        <span style={{ color: '#aaa', marginLeft: '5px' }}>{timePerDiv}ms</span>
                        <span style={{ color: '#aaa', marginLeft: '5px' }}>Vpp: {vpp1.toFixed(2)}V</span>
                    </div>
                )}

                {/* Channel 2 Info */}
                {showCH2 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#00ccff', color: '#000', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold' }}>CH2</span>
                        <span style={{ color: '#00ccff' }}>{voltsPerDiv2.toFixed(2)}V</span>
                        <span style={{ color: '#aaa', marginLeft: '5px' }}>{timePerDiv2}ms</span>
                        <span style={{ color: '#aaa', marginLeft: '5px' }}>Vpp: {vpp2.toFixed(2)}V</span>
                    </div>
                )}

                {/* Frequency Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fff' }}>Trig: {triggerSource}</span>
                    <span style={{ color: '#00ffcc' }}>{frequency.toFixed(1)}Hz</span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OscilloscopeScreen);
