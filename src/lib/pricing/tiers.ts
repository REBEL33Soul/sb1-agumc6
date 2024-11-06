export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    limits: {
      songsPerMonth: 5,
      maxDuration: 300, // 5 minutes in seconds
      videoQuality: '720p',
      storage: 500 * 1024 * 1024, // 500MB in bytes
      modelQuality: 'standard'
    },
    features: [
      'Basic audio restoration',
      'Standard quality models',
      'Basic support',
      '720p video export'
    ]
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: {
      monthly: 15,
      yearly: 150
    },
    limits: {
      songsPerMonth: 20,
      maxDuration: 900, // 15 minutes
      videoQuality: '1080p',
      storage: 2 * 1024 * 1024 * 1024, // 2GB
      modelQuality: 'high',
      voiceCloning: 2
    },
    features: [
      'Advanced audio restoration',
      'High quality models',
      'Email support',
      '1080p video export',
      'Voice cloning (2 voices)'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Professional',
    price: {
      monthly: 35,
      yearly: 350
    },
    limits: {
      songsPerMonth: 50,
      maxDuration: 1800, // 30 minutes
      videoQuality: '4k',
      storage: 10 * 1024 * 1024 * 1024, // 10GB
      modelQuality: 'ultra',
      voiceCloning: 5,
      apiCalls: 10000
    },
    features: [
      'Professional audio restoration',
      'Ultra quality models',
      'Priority support',
      '4K video export',
      'Voice cloning (5 voices)',
      'API access'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    limits: {
      songsPerMonth: Infinity,
      maxDuration: Infinity,
      videoQuality: '8k',
      storage: Infinity,
      modelQuality: 'custom',
      voiceCloning: Infinity,
      apiCalls: Infinity
    },
    features: [
      'Custom model training',
      'Dedicated support',
      'Unlimited voice cloning',
      '8K video export',
      'Custom API limits',
      'Custom storage'
    ]
  }
};