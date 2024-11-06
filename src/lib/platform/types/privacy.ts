export interface PrivacyRequirements {
  dataCollected: string[];
  dataPurpose: string[];
  dataProtection: string[];
  userRights: string[];
  thirdPartySharing: {
    analytics: string[];
    processing: string[];
    storage: string[];
  };
}

export interface DataUsage {
  type: string;
  purpose: string;
  retention: string;
  sharing: string[];
  userControl: string[];
}