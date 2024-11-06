export interface UsageMetrics {
  projectId: string;
  userId: string;
  appType: 'restoration' | 'mastering' | 'generation';
  processingTime: number;
  storageUsed: number;
  inputFileSize: number;
  outputFileSize: number;
  features: string[];
  timestamp: Date;
}

export interface FinancialMetrics {
  revenue: number;
  costs: {
    processing: number;
    storage: number;
    bandwidth: number;
    overhead: number;
  };
  taxes: {
    salesTax: number;
    vatTax: number;
  };
  profit: number;
}

export interface UserMetrics {
  totalProjects: number;
  activeProjects: number;
  storageUsed: number;
  processingTimeUsed: number;
  subscriptionType: string;
  subscriptionStatus: string;
  revenue: number;
}

export interface ReportingPeriod {
  start: Date;
  end: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}