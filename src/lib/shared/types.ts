export interface AppFeatures {
  restoration?: {
    enabled: boolean;
    maxProjects: number;
    batchProcessing: boolean;
  };
  mastering?: {
    enabled: boolean;
    maxTracks: number;
    referenceMatching: boolean;
  };
  generation?: {
    enabled: boolean;
    maxGenerations: number;
    customModels: boolean;
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  apps: AppFeatures;
  stripeCustomerId: string;
  stripePriceId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: {
    monthly: number;
    yearly: number;
  };
  limits: {
    storage: number;
    processing: number;
    exports: number;
  };
}