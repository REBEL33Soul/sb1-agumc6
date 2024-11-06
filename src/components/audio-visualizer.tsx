import React, { useEffect, useRef } from 'react';
import { Card } from './ui/card';

interface AudioVisualizerProps {
  audioData: Float32Array;
  type: 'waveform' | 'spectrum';
}

export function AudioVisualizer({ audioData, type }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (type === 'waveform') {
        drawWaveform(ctx, audioData, canvas.width, canvas.height);
      } else {
        drawSpectrum(ctx, audioData, canvas.width, canvas.height);
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [audioData, type]);

  return (
    <Card className="p-4 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full"
      />
    </Card>
  );
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  data: Float32Array,
  width: number,
  height: number
) {
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  for (let i = 0; i < width; i++) {
    const min = Math.min(...data.slice(i * step, (i + 1) * step));
    const max = Math.max(...data.slice(i * step, (i + 1) * step));

    ctx.moveTo(i, (1 + min) * amp);
    ctx.lineTo(i, (1 + max) * amp);
  }

  ctx.stroke();
}

function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: Float32Array,
  width: number,
  height: number
) {
  const barWidth = width / data.length;
  const multiplier = height / Math.max(...data);

  ctx.fillStyle = '#3b82f6';

  for (let i = 0; i < data.length; i++) {
    const barHeight = data[i] * multiplier;
    ctx.fillRect(
      i * barWidth,
      height - barHeight,
      barWidth - 1,
      barHeight
    );
  }
}