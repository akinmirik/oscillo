import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { findTriggerPoint } from '../utils/trigger';

interface OscilloscopeScreenProps {
    timePerDiv: number; // ms
    voltsPerDiv: number; // gain factor (1 = normal)
    triggerLevel: number;
    triggerSlope: 'rising' | 'falling';
    isRunning: boolean;
    frequency: number;
    verticalOffset: number;
    horizontalOffset: number;
}

const OscilloscopeScreen: React.FC<OscilloscopeScreenProps> = ({
    timePerDiv,
    voltsPerDiv,
    triggerLevel,
    triggerSlope,
    isRunning,
    frequency,
    verticalOffset,
    horizontalOffset
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(undefined);
    const dataArrayRef = useRef<Float32Array>(new Float32Array(32768));
    const [vpp, setVpp] = React.useState(0);
    const lastVppUpdateRef = useRef(0);

    // Refs for animation loop to avoid restarting it on prop changes
    const paramsRef = useRef({
        timePerDiv,
        voltsPerDiv,
        triggerLevel,
        triggerSlope,
        verticalOffset,
        horizontalOffset
    });

    // Update refs when props change
    useEffect(() => {
        paramsRef.current = {
            timePerDiv,
            voltsPerDiv,
            triggerLevel,
            triggerSlope,
            verticalOffset,
            horizontalOffset
        };
    }, [timePerDiv, voltsPerDiv, triggerLevel, triggerSlope, verticalOffset, horizontalOffset]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Vertical lines (Time) - 10 divisions
        const xStep = width / 10;
        for (let i = 1; i < 10; i++) {
            const x = i * xStep;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        // Horizontal lines (Voltage) - 8 divisions
        const yStep = height / 8;
        for (let i = 1; i < 8; i++) {
            const y = i * yStep;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Center axes
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    };

    const drawWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const analyser = audioEngine.getAnalyser();
        // @ts-ignore - Float32Array type mismatch between lib versions
        analyser.getFloatTimeDomainData(dataArrayRef.current);
        const data = dataArrayRef.current;

        const { timePerDiv, voltsPerDiv, triggerLevel, triggerSlope, verticalOffset, horizontalOffset } = paramsRef.current;

        // Calculate Vpp (Peak-to-Peak)
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < data.length; i++) {
            const val = data[i];
            if (val < min) min = val;
            if (val > max) max = val;
        }
        const currentVpp = max - min;

        // Throttle Vpp update to avoid excessive re-renders (every 100ms)
        const now = performance.now();
        if (now - lastVppUpdateRef.current > 100) {
            setVpp(currentVpp);
            lastVppUpdateRef.current = now;
        }

        // Triggering
        let startIndex = 0;
        const triggerIndex = findTriggerPoint(data, { level: triggerLevel, slope: triggerSlope });

        if (triggerIndex !== -1) {
            startIndex = triggerIndex;
        }

        // Apply Horizontal Offset
        // 1 division = timePerDiv ms
        // offset in ms = horizontalOffset * timePerDiv
        // offset in samples = (offset in ms / 1000) * sampleRate
        const sampleRate = audioEngine.getSampleRate();
        const offsetSamples = Math.floor((horizontalOffset * timePerDiv / 1000) * sampleRate);

        // Subtract offset because positive X position usually moves signal right (which means looking at earlier data? No, moving signal right means we see earlier data at the trigger point... wait.)
        // If I want to move the signal to the RIGHT, I need to start drawing from an EARLIER index.
        // So startIndex should be DECREASED.
        startIndex -= offsetSamples;

        // Clamp startIndex to be safe? 
        // Actually, if it's negative, we might index out of bounds.
        // But we check bounds in the loop: `if (sampleIdx >= data.length) break;`
        // We also need to handle `sampleIdx < 0`.

        // Let's just let it be, and handle the loop carefully.

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00ffcc';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00ffcc';
        ctx.beginPath();

        const totalTimeMs = timePerDiv * 10;
        const totalSamplesToDraw = Math.floor((totalTimeMs / 1000) * sampleRate);

        const samplesPerPixel = totalSamplesToDraw / width;
        const pixelsPerDiv = height / 8;

        let started = false;

        // Optimization: Downsample if samplesPerPixel < 1 (zoomed in a lot)
        // or skip samples if samplesPerPixel > 1 (zoomed out)

        for (let i = 0; i < width; i++) {
            const sampleIdx = Math.floor(startIndex + i * samplesPerPixel);

            // Check bounds
            if (sampleIdx < 0 || sampleIdx >= data.length) {
                // If out of bounds, we just don't draw this point, or break if we are past the end
                if (sampleIdx >= data.length) break;
                continue;
            }

            const sampleValue = data[sampleIdx];
            // Apply Vertical Offset: move signal by N divisions
            // y = center - (value * pixelsPerVolt) - (offset * pixelsPerDiv)
            const y = height / 2 - (sampleValue / voltsPerDiv) * pixelsPerDiv - (verticalOffset * pixelsPerDiv);

            if (!started) {
                ctx.moveTo(i, y);
                started = true;
            } else {
                ctx.lineTo(i, y);
            }
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    };

    const animate = () => {
        // Note: We don't check isRunning here because we want to control the loop via useEffect
        // But we need to know if we should draw.
        // Actually, if we stop the loop via useEffect, this function won't run.

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { width, height } = canvas;
                ctx.clearRect(0, 0, width, height);

                drawGrid(ctx, width, height);

                try {
                    // Only draw if audio engine is ready
                    drawWaveform(ctx, width, height);
                } catch (e) {
                    // Audio engine might not be init yet
                }
            }
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            // Draw grid once when stopped
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const { width, height } = canvas;
                    ctx.clearRect(0, 0, width, height);
                    drawGrid(ctx, width, height);
                }
            }
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isRunning]); // Only restart loop if isRunning changes

    // Initial draw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { width, height } = canvas;
                drawGrid(ctx, width, height);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#ffff00', color: '#000', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold' }}>CH1</span>
                    <span style={{ color: '#ffff00' }}>{voltsPerDiv.toFixed(2)}V</span>
                    <span style={{ color: '#aaa', marginLeft: '10px' }}>Vpp: {vpp.toFixed(2)}V</span>
                </div>

                {/* Timebase Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fff' }}>M {timePerDiv}ms</span>
                </div>

                {/* Frequency Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#00ffcc' }}>{frequency.toFixed(1)}Hz</span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OscilloscopeScreen);
