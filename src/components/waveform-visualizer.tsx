'use client';

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  url: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function WaveformVisualizer({
  url,
  height = 100,
  color = '#3b82f6',
  backgroundColor = '#1f2937'
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawWaveform = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);
      const amp = canvas.height / 2;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      for (let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }

      ctx.stroke();
    };

    drawWaveform();
  }, [url, height, color, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      className="w-full rounded-lg"
      style={{ height }}
    />
  );
}