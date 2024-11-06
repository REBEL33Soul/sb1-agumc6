/// <reference lib="webworker" />

import { initWasm } from '../lib/wasm/init';

let wasmInstance: WebAssembly.Instance;
let memory: WebAssembly.Memory;

// Initialize WebAssembly module
async function init() {
  const { instance, memory: wasmMemory } = await initWasm();
  wasmInstance = instance;
  memory = wasmMemory;
}

// Process audio data
async function processAudio(audioData: Float32Array) {
  // Copy input data to WASM memory
  const inputPtr = wasmInstance.exports.__heap_base;
  const inputArray = new Float32Array(memory.buffer, inputPtr, audioData.length);
  inputArray.set(audioData);

  // Process audio using WASM
  (wasmInstance.exports.processAudio as Function)(inputPtr, audioData.length * 4);

  // Copy processed data back
  return inputArray.slice();
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent) => {
  switch (e.data.type) {
    case 'init':
      await init();
      self.postMessage({ type: 'initialized' });
      break;

    case 'process':
      try {
        const processedData = await processAudio(e.data.audioData);
        self.postMessage(
          { type: 'processed', data: processedData },
          [processedData.buffer]
        );
      } catch (error) {
        self.postMessage({
          type: 'error',
          error: error instanceof Error ? error.message : 'Processing failed'
        });
      }
      break;
  }
};