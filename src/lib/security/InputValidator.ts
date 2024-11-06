export class InputValidator {
  static validateAudioParams(params: any): boolean {
    const required = ['duration', 'sampleRate', 'channels'];
    const numeric = ['duration', 'sampleRate', 'channels', 'bitrate'];
    
    // Check required fields
    for (const field of required) {
      if (!(field in params)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate numeric fields
    for (const field of numeric) {
      if (field in params && !Number.isFinite(params[field])) {
        throw new Error(`Invalid numeric value for ${field}`);
      }
    }

    // Validate ranges
    if (params.duration <= 0 || params.duration > 300) {
      throw new Error('Duration must be between 0 and 300 seconds');
    }

    if (params.sampleRate < 8000 || params.sampleRate > 192000) {
      throw new Error('Sample rate must be between 8000 and 192000 Hz');
    }

    if (params.channels < 1 || params.channels > 8) {
      throw new Error('Channels must be between 1 and 8');
    }

    return true;
  }

  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .slice(0, 1000); // Limit length
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}