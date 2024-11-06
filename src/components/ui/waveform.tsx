import { useEffect, useRef } from 'react';
import { theme } from './theme';

export function Waveform({ data, className }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform with glow effect
    ctx.strokeStyle = theme.colors.accent.blue;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = theme.colors.accent.blue;

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / data.length) * canvas.width;
      const y = (point + 1) * (canvas.height / 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data]);

  return (
    <canvas 
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' }}
    />
  );
}