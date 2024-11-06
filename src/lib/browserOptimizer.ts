export class BrowserOptimizer {
  private static instance: BrowserOptimizer;
  private audioContext: AudioContext | null = null;
  private mediaCapabilities: MediaCapabilities | null = null;

  private constructor() {
    this.mediaCapabilities = 'mediaCapabilities' in navigator ? 
      navigator.mediaCapabilities : null;
  }

  static getInstance(): BrowserOptimizer {
    if (!BrowserOptimizer.instance) {
      BrowserOptimizer.instance = new BrowserOptimizer();
    }
    return BrowserOptimizer.instance;
  }

  async initialize() {
    await this.setupAudioContext();
    await this.setupMediaCapabilities();
    this.setupPerformanceOptimizations();
    this.setupBrowserSpecificFixes();
  }

  private async setupAudioContext() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const unlockAudio = async () => {
        if (!this.audioContext) {
          this.audioContext = new AudioContextClass({
            latencyHint: 'interactive',
            sampleRate: await this.getOptimalSampleRate(),
          });
        }
        if (this.audioContext.state !== 'running') {
          await this.audioContext.resume();
        }
        document.removeEventListener('click', unlockAudio);
      };
      document.addEventListener('click', unlockAudio);
    }
  }

  private async setupMediaCapabilities() {
    if (this.mediaCapabilities) {
      const audioConfig = {
        type: 'file',
        audio: {
          contentType: 'audio/wav',
          channels: 2,
          bitrate: 128000,
          samplerate: 48000,
        },
      };

      try {
        const result = await this.mediaCapabilities.decodingInfo(audioConfig);
        if (!result.supported) {
          console.warn('Advanced audio features may not be fully supported');
        }
      } catch (error) {
        console.error('Media capabilities check failed:', error);
      }
    }
  }

  private async getOptimalSampleRate(): Promise<number> {
    if (this.mediaCapabilities) {
      const sampleRates = [48000, 44100, 96000];
      for (const rate of sampleRates) {
        const result = await this.mediaCapabilities.decodingInfo({
          type: 'file',
          audio: {
            contentType: 'audio/wav',
            channels: 2,
            bitrate: 128000,
            samplerate: rate,
          },
        });
        if (result.supported && result.smooth) {
          return rate;
        }
      }
    }
    return 48000; // Default to 48kHz
  }

  private setupPerformanceOptimizations() {
    // Optimize rendering performance
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.deferNonEssentialOperations();
      });
    }

    // Enable hardware acceleration
    document.body.style.transform = 'translateZ(0)';
    
    // Optimize event listeners
    const passiveSupported = this.checkPassiveSupport();
    if (passiveSupported) {
      window.addEventListener('scroll', () => {}, { passive: true });
      window.addEventListener('touchstart', () => {}, { passive: true });
    }
  }

  private checkPassiveSupport(): boolean {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
          return true;
        }
      });
      window.addEventListener('testPassive', null as any, opts);
      window.removeEventListener('testPassive', null as any, opts);
    } catch (e) {}
    return supportsPassive;
  }

  private setupBrowserSpecificFixes() {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/safari/.test(ua) && !/chrome/.test(ua)) {
      this.applySafariFixes();
    } else if (/firefox/.test(ua)) {
      this.applyFirefoxFixes();
    } else if (/chrome/.test(ua)) {
      this.applyChromeFixes();
    }
  }

  private applySafariFixes() {
    // Fix Safari audio issues
    document.addEventListener('touchstart', () => {
      if (this.audioContext) {
        this.audioContext.resume();
      }
    }, { once: true });

    // Add Safari-specific CSS fixes
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-backface-visibility: hidden;
        -webkit-tap-highlight-color: transparent;
      }
      audio::-webkit-media-controls-timeline,
      video::-webkit-media-controls-timeline {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  private applyFirefoxFixes() {
    // Firefox-specific optimizations
    const style = document.createElement('style');
    style.textContent = `
      * {
        scrollbar-width: thin;
      }
      @supports (-moz-appearance: none) {
        audio, video {
          will-change: transform;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private applyChromeFixes() {
    // Chrome-specific optimizations
    if ('chrome' in window) {
      // Enable hardware acceleration hints
      document.documentElement.style.contain = 'paint';
    }
  }

  private deferNonEssentialOperations() {
    // Implement deferred loading of non-critical resources
    const deferredElements = document.querySelectorAll('[data-defer]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          if (element.hasAttribute('data-src')) {
            element.setAttribute('src', element.getAttribute('data-src')!);
            element.removeAttribute('data-src');
          }
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    deferredElements.forEach(element => observer.observe(element));
  }
}