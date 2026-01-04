/**
 * Web Monitoring SDK
 * 轻量级前端数据采集SDK
 */

interface WebMonitoringConfig {
  key: string;
  apiUrl?: string;
  autoTrack?: boolean;
  trackPerformance?: boolean;
}

interface PageViewData {
  sessionId: string;
  pageUrl: string;
  pageTitle?: string;
  referrer: string;
  userAgent: string;
  screenInfo?: {
    width: number;
    height: number;
    colorDepth: number;
  };
  browserInfo?: {
    name: string;
    version: string;
  };
  osInfo?: {
    name: string;
    version: string;
  };
}

interface PerformanceData {
  sessionId: string;
  pageUrl: string;
  pageLoadTime?: number;
  domContentLoadedTime?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  resourceCount?: number;
  errorCount?: number;
  resources?: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
  errors?: Array<{
    message: string;
    source: string;
    line: number;
    col: number;
  }>;
}

class WebMonitoring {
  private config: WebMonitoringConfig;
  private sessionId: string;
  private apiUrl: string;
  private isInitialized: boolean = false;
  private errors: Array<{ message: string; source: string; line: number; col: number }> = [];

  constructor(config: WebMonitoringConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || this.extractApiUrl();
    this.sessionId = this.generateSessionId();
  }

  private extractApiUrl(): string {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    if (currentScript && currentScript.src) {
      return `${new URL(currentScript.src).origin}/track`;
    }
    return '/track';
  }

  private generateSessionId(): string {
    let sessionId = sessionStorage.getItem('wm_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('wm_session_id', sessionId);
    }
    return sessionId;
  }

  private detectBrowser(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Firefox')) {
      name = 'Firefox';
      version = ua.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Chrome')) {
      name = 'Chrome';
      version = ua.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari')) {
      name = 'Safari';
      version = ua.match(/Version\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edge')) {
      name = 'Edge';
      version = ua.match(/Edge\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
      name = 'Internet Explorer';
      version = ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || 'Unknown';
    }

    return { name, version };
  }

  private detectOS(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Windows')) {
      name = 'Windows';
      version = ua.match(/Windows NT ([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Mac OS X')) {
      name = 'macOS';
      version = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
    } else if (ua.includes('Linux')) {
      name = 'Linux';
    } else if (ua.includes('Android')) {
      name = 'Android';
      version = ua.match(/Android ([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
      name = 'iOS';
      version = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
    }

    return { name, version };
  }

  private getScreenInfo(): { width: number; height: number; colorDepth: number } {
    return {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
    };
  }

  private async sendPageView(data: PageViewData): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/pageview?key=${this.config.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[Web Monitoring] Failed to send page view:', error);
    }
  }

  private async sendPerformance(data: PerformanceData): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/performance?key=${this.config.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[Web Monitoring] Failed to send performance:', error);
    }
  }

  private trackPageView(): void {
    const data: PageViewData = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenInfo: this.getScreenInfo(),
      browserInfo: this.detectBrowser(),
      osInfo: this.detectOS(),
    };

    this.sendPageView(data);
  }

  private trackPerformance(): void {
    if (!this.config.trackPerformance) return;

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      this.collectPerformanceData();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectPerformanceData(), 0);
      });
    }
  }

  private collectPerformanceData(): void {
    const perfData = window.performance.timing;
    const navigationStart = perfData.navigationStart;

    const pageLoadTime = perfData.loadEventEnd - navigationStart;
    const domContentLoadedTime = perfData.domContentLoadedEventEnd - navigationStart;

    // Get Paint Timing API
    const paintEntries = performance.getEntriesByType('paint');
    let firstPaint: number | undefined;
    let firstContentfulPaint: number | undefined;

    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        firstContentfulPaint = entry.startTime;
      }
    });

    // Get resource data
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resources = resourceEntries.map((entry) => ({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: entry.initiatorType,
    }));

    const data: PerformanceData = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      pageLoadTime: pageLoadTime > 0 ? pageLoadTime : undefined,
      domContentLoadedTime: domContentLoadedTime > 0 ? domContentLoadedTime : undefined,
      firstPaint,
      firstContentfulPaint,
      resourceCount: resourceEntries.length,
      errorCount: this.errors.length,
      resources,
      errors: this.errors.length > 0 ? this.errors : undefined,
    };

    this.sendPerformance(data);
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.errors.push({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        col: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        source: 'Promise',
        line: 0,
        col: 0,
      });
    });
  }

  public init(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // Auto track page view
    if (this.config.autoTrack !== false) {
      this.trackPageView();
    }

    // Track performance
    if (this.config.trackPerformance !== false) {
      this.trackPerformance();
    }

    // Setup error tracking
    this.setupErrorTracking();

    // Track SPA navigation changes
    this.trackNavigation();
  }

  private trackNavigation(): void {
    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackNavigationChange = () => {
      setTimeout(() => {
        this.trackPageView();
      }, 0);
    };

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      trackNavigationChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      trackNavigationChange();
    };

    // Listen to popstate events
    window.addEventListener('popstate', () => {
      trackNavigationChange();
    });

    // Listen to hashchange events
    window.addEventListener('hashchange', () => {
      trackNavigationChange();
    });
  }

  public trackEvent(eventName: string, properties?: Record<string, any>): void {
    // Custom event tracking (to be implemented)
    console.log('[Web Monitoring] Event:', eventName, properties);
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Initialize SDK from script tag
declare global {
  interface Window {
    WebMonitoringConfig?: WebMonitoringConfig;
  }
}

// Auto-initialize when script loads
function initSDK() {
  const scriptTags = document.getElementsByTagName('script');
  const currentScript = scriptTags[scriptTags.length - 1] as HTMLScriptElement;

  if (currentScript && currentScript.src) {
    const url = new URL(currentScript.src);
    const key = url.searchParams.get('key');

    if (key) {
      const config: WebMonitoringConfig = {
        key,
        apiUrl: `${url.origin}/track`,
        autoTrack: true,
        trackPerformance: true,
      };

      const sdk = new WebMonitoring(config);
      sdk.init();

      // Expose to global scope
      (window as any).WebMonitoring = sdk;
    } else {
      console.error('[Web Monitoring] Missing API key. Please provide ?key=YOUR_PROJECT_KEY');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSDK);
} else {
  initSDK();
}

export default WebMonitoring;
