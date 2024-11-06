export interface Platform {
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'web';
  browser: 'chrome' | 'safari' | 'firefox' | 'edge' | 'unknown';
  isMobile: boolean;
  supportsWebGL: boolean;
  supportsWasm: boolean;
}

export interface DeviceCapabilities {
  memory: number;
  cores: number;
  gpu: 'supported' | 'unsupported';
  powerPreference: 'high-performance' | 'balanced' | 'low-power';
}

export interface ModelConfig {
  batchSize: number;
  quantization: boolean;
  useWebGL: boolean;
  useWasm: boolean;
  cacheSize: number;
}