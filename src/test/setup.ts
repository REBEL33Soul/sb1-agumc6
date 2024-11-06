import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Web Audio API
window.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn(),
  createOscillator: vi.fn(),
  createAnalyser: vi.fn(),
  createBufferSource: vi.fn(),
  decodeAudioData: vi.fn(),
}));

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return {
      getExtension: vi.fn(),
      getParameter: vi.fn(),
      getShaderPrecisionFormat: vi.fn(),
    };
  }
  return null;
});