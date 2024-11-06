import { config } from '../../config/environment';
import { RateLimiter } from '../security/RateLimiter';
import { InputValidator } from '../security/InputValidator';

export class ApiClient {
  private static instance: ApiClient;
  private rateLimiter: RateLimiter;
  private controller: AbortController;

  private constructor() {
    this.rateLimiter = RateLimiter.getInstance();
    this.controller = new AbortController();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const clientId = this.getClientIdentifier();
    
    if (!(await this.rateLimiter.checkLimit(clientId))) {
      throw new Error('Rate limit exceeded');
    }

    const url = `${config.api.baseUrl}/${config.api.version}${endpoint}`;
    
    if (!InputValidator.validateUrl(url)) {
      throw new Error('Invalid URL');
    }

    const headers = new Headers(options.headers);
    headers.set('X-Client-ID', clientId);
    headers.set('Content-Type', 'application/json');

    const timeoutId = setTimeout(() => this.controller.abort(), config.api.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private getClientIdentifier(): string {
    // Generate a unique client identifier
    return crypto.randomUUID();
  }

  abort(): void {
    this.controller.abort();
    this.controller = new AbortController();
  }
}