import { ContentRating } from './types/content';
import { PrivacyRequirements } from './types/privacy';
import { PlatformRequirements } from './types/platform';
import { ErrorManager } from '../core/ErrorManager';

export class AppStoreCompliance {
  private static instance: AppStoreCompliance;
  private errorManager: ErrorManager;

  private constructor() {
    this.errorManager = ErrorManager.getInstance();
  }

  static getInstance(): AppStoreCompliance {
    if (!AppStoreCompliance.instance) {
      AppStoreCompliance.instance = new AppStoreCompliance();
    }
    return AppStoreCompliance.instance;
  }

  validateContentRating(): ContentRating {
    return {
      rating: '12+',
      descriptors: [
        'Infrequent/Mild Profanity or Crude Humor',
        'Infrequent/Mild Mature/Suggestive Themes'
      ],
      restrictions: [
        'Content rights verification required',
        'User-generated content must be moderated'
      ],
      categories: {
        violence: 'none',
        language: 'mild',
        gambling: 'none',
        socialInteraction: 'moderated'
      }
    };
  }

  getPrivacyRequirements(): PrivacyRequirements {
    return {
      dataCollected: [
        'Email address',
        'Usage data',
        'Audio files'
      ],
      dataPurpose: [
        'App functionality',
        'Analytics',
        'Product personalization'
      ],
      dataProtection: [
        'Encryption in transit and at rest',
        'Data retention policies',
        'User consent requirements'
      ],
      userRights: [
        'Data export',
        'Data deletion',
        'Privacy controls'
      ],
      thirdPartySharing: {
        analytics: ['Usage statistics'],
        processing: ['Audio processing services'],
        storage: ['Cloud storage providers']
      }
    };
  }

  getPlatformRequirements(platform: 'ios' | 'android' | 'macos' | 'windows'): PlatformRequirements {
    const requirements: Record<string, PlatformRequirements> = {
      ios: {
        capabilities: [
          'Audio',
          'Background processing',
          'iCloud',
          'In-App Purchase'
        ],
        frameworks: [
          'AVFoundation',
          'CoreAudio',
          'Metal'
        ],
        permissions: [
          'NSMicrophoneUsageDescription',
          'NSDocumentsFolderUsageDescription'
        ],
        entitlements: [
          'com.apple.security.device.audio-input',
          'com.apple.security.files.user-selected.read-write'
        ],
        appStoreMetadata: {
          requiredDeviceCapabilities: ['arm64', 'metal'],
          supportedInterfaceOrientations: ['portrait', 'landscape'],
          minimumOSVersion: '14.0'
        }
      },
      android: {
        permissions: [
          'RECORD_AUDIO',
          'WRITE_EXTERNAL_STORAGE',
          'INTERNET'
        ],
        features: [
          'android.hardware.audio.pro',
          'android.hardware.audio.low_latency'
        ],
        metadata: {
          targetSdkVersion: 33,
          minSdkVersion: 26
        },
        playStoreMetadata: {
          contentRating: 'PEGI-12',
          category: 'AUDIO',
          inAppProducts: true
        }
      },
      macos: {
        capabilities: [
          'Audio',
          'Hardware acceleration',
          'File system access'
        ],
        entitlements: [
          'com.apple.security.audio',
          'com.apple.security.files.user-selected.read-write'
        ],
        frameworks: [
          'CoreAudio',
          'Metal',
          'AVFoundation'
        ],
        macAppStoreMetadata: {
          category: 'Music',
          minimumSystemVersion: '11.0',
          architectures: ['arm64', 'x86_64']
        }
      },
      windows: {
        capabilities: [
          'Audio',
          'Storage',
          'Internet access'
        ],
        frameworks: [
          'Windows.Media',
          'Windows.Storage'
        ],
        msStoreMetadata: {
          targetPlatform: 'Windows.Desktop',
          minVersion: '10.0.19041.0',
          architectures: ['x64', 'arm64']
        }
      }
    };

    return requirements[platform];
  }

  async validateCompliance(platform: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];

      // Validate content rating
      const contentRating = this.validateContentRating();
      if (!this.isValidContentRating(contentRating)) {
        issues.push('Invalid content rating configuration');
      }

      // Validate privacy requirements
      const privacyReqs = this.getPrivacyRequirements();
      if (!this.isValidPrivacyRequirements(privacyReqs)) {
        issues.push('Privacy requirements not met');
      }

      // Validate platform-specific requirements
      const platformReqs = this.getPlatformRequirements(platform as any);
      if (!this.isValidPlatformRequirements(platformReqs)) {
        issues.push('Platform requirements not met');
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'compliance_validation',
        platform
      });
      return {
        valid: false,
        issues: ['Compliance validation failed']
      };
    }
  }

  private isValidContentRating(rating: ContentRating): boolean {
    return !!(
      rating.rating &&
      rating.descriptors?.length > 0 &&
      rating.restrictions?.length > 0 &&
      rating.categories
    );
  }

  private isValidPrivacyRequirements(requirements: PrivacyRequirements): boolean {
    return !!(
      requirements.dataCollected?.length > 0 &&
      requirements.dataPurpose?.length > 0 &&
      requirements.dataProtection?.length > 0 &&
      requirements.userRights?.length > 0
    );
  }

  private isValidPlatformRequirements(requirements: PlatformRequirements): boolean {
    return !!(
      requirements.capabilities?.length > 0 &&
      requirements.frameworks?.length > 0
    );
  }
}