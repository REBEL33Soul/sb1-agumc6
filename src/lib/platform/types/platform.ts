export interface PlatformRequirements {
  capabilities: string[];
  frameworks: string[];
  permissions?: string[];
  entitlements?: string[];
  metadata?: {
    targetSdkVersion?: number;
    minSdkVersion?: number;
    [key: string]: any;
  };
  appStoreMetadata?: {
    requiredDeviceCapabilities?: string[];
    supportedInterfaceOrientations?: string[];
    minimumOSVersion?: string;
    [key: string]: any;
  };
  playStoreMetadata?: {
    contentRating?: string;
    category?: string;
    inAppProducts?: boolean;
    [key: string]: any;
  };
  macAppStoreMetadata?: {
    category?: string;
    minimumSystemVersion?: string;
    architectures?: string[];
    [key: string]: any;
  };
  msStoreMetadata?: {
    targetPlatform?: string;
    minVersion?: string;
    architectures?: string[];
    [key: string]: any;
  };
}