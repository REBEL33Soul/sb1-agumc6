export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.audiostudio.dev',
    version: 'v1',
    timeout: 30000,
  },
  cdn: {
    modelEndpoint: 'https://cdn.audiostudio.dev/models',
    audioEndpoint: 'https://cdn.audiostudio.dev/audio',
    region: 'auto',
  },
  storage: {
    bucket: 'audio-studio-assets',
    endpoint: 'https://storage.audiostudio.dev',
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    cors: {
      allowedOrigins: [
        'https://audiostudio.dev',
        'https://app.audiostudio.dev',
      ],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  },
  monitoring: {
    errorReporting: true,
    performanceMonitoring: true,
    analyticsEnabled: true,
  },
};