export async function initWasm(): Promise<{
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
}> {
  // Create memory
  const memory = new WebAssembly.Memory({
    initial: 1,
    maximum: 10,
    shared: true
  });

  // Import object
  const imports = {
    env: { memory }
  };

  // Compile and instantiate module
  const response = await fetch('/wasm/audioProcessor.wasm');
  const wasmBytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(wasmBytes, imports);

  return { instance, memory };
}