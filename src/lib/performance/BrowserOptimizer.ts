import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';
import { MemoryManager } from '../core/MemoryManager';

export class BrowserOptimizer {
  private static instance: BrowserOptimizer;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private memoryManager: MemoryManager;

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
    this.memoryManager = MemoryManager.getInstance();
    this.initializeOptimizations();
  }

  static getInstance(): BrowserOptimizer {
    if (!BrowserOptimizer.instance) {
      BrowserOptimizer.instance = new BrowserOptimizer();
    }
    return BrowserOptimizer.instance;
  }

  private async initializeOptimizations() {
    // Detect browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      await this.optimizeSafari();
    } else {
      await this.optimizeOtherBrowsers();
    }

    // Common optimizations
    this.setupLazyLoading();
    this.setupPreloading();
    this.setupMemoryManagement();
  }

  private async optimizeSafari() {
    // Safari-specific optimizations
    document.documentElement.style.webkitFontSmoothing = 'antialiased';
    
    // Enable hardware acceleration
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
      }
    `;
    document.head.appendChild(style);

    // Setup Safari-specific polyfills
    if (!window.ResizeObserver) {
      await import('resize-observer-polyfill');
    }

    // Optimize audio context
    document.addEventListener('touchstart', () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContext();
      context.resume();
    }, { once: true });
  }

  private async optimizeOtherBrowsers() {
    // Enable advanced features for modern browsers
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img').forEach(img => {
        if (img.loading !== 'lazy') {
          img.loading = 'lazy';
        }
      });
    }

    // Setup performance observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.optimizeLCP(entry);
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private setupLazyLoading() {
    // Implement intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            if (element.hasAttribute('data-src')) {
              element.setAttribute('src', element.getAttribute('data-src')!);
              element.removeAttribute('data-src');
              observer.unobserve(element);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    document.querySelectorAll('[data-src]').forEach(element => {
      observer.observe(element);
    });
  }

  private setupPreloading() {
    // Preload critical resources
    const criticalResources = [
      '/models/core-audio.wasm',
      '/static/fonts/inter.woff2'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.wasm') ? 'fetch' : 'font';
      document.head.appendChild(link);
    });
  }

  private setupMemoryManagement() {
    // Monitor memory usage
    setInterval(() => {
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
          this.memoryManager.performCleanup();
        }
      }
    }, 30000);

    // Clear unused models periodically
    setInterval(() => {
      this.memoryManager.cleanupUnusedModels();
    }, 300000);
  }

  private optimizeLCP(entry: PerformanceEntry) {
    const target = (entry as any).element;
    if (target && target.tagName === 'IMG') {
      // Optimize image loading
      target.fetchPriority = 'high';
      target.decoding = 'async';
    }
  }
}