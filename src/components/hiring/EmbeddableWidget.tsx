/**
 * 🧪 EMBEDDABLE HIRING WIDGET
 * Standalone widget for embedding on www.teddykids.nl
 */

import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HiringWidget } from "./HiringWidget";
import type { HiringWidgetProps } from "@/types/hiring";

// =============================================
// WIDGET CONFIGURATION INTERFACE
// =============================================

interface EmbeddableWidgetConfig {
  // API Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Widget Behavior
  theme?: 'light' | 'dark';
  autoOpen?: boolean;
  triggerSelector?: string;

  // Styling
  customStyles?: string;
  containerClass?: string;

  // Analytics
  trackingId?: string;
  gtmId?: string;

  // Callbacks
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
  onAnalytics?: (event: any) => void;

  // Content
  title?: string;
  subtitle?: string;
  logoUrl?: string;

  // Features
  enableAssessments?: boolean;
  enableFileUploads?: boolean;
  requirePrivacyConsent?: boolean;
}

// =============================================
// WIDGET WRAPPER COMPONENT
// =============================================

function WidgetWrapper({ config }: { config: EmbeddableWidgetConfig }) {
  const [isOpen, setIsOpen] = useState(config.autoOpen || false);
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client for widget
  useEffect(() => {
    // Dynamic Supabase initialization would go here
    // This allows the widget to connect to the correct instance
    setLoading(false);
  }, [config.supabaseUrl, config.supabaseAnonKey]);

  // Track widget load
  useEffect(() => {
    if (config.onAnalytics) {
      config.onAnalytics({
        event_type: 'widget_load',
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer_url: document.referrer
      });
    }

    // GTM tracking if configured
    if (config.gtmId && typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'hiring_widget_load',
        widget_session_id: sessionId
      });
    }
  }, [config, sessionId]);

  // Handle trigger element clicks
  useEffect(() => {
    if (config.triggerSelector) {
      const elements = document.querySelectorAll(config.triggerSelector);
      const handleClick = (e: Event) => {
        e.preventDefault();
        setIsOpen(true);
      };

      elements.forEach(el => el.addEventListener('click', handleClick));

      return () => {
        elements.forEach(el => el.removeEventListener('click', handleClick));
      };
    }
  }, [config.triggerSelector]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isOpen && config.triggerSelector) {
    return null; // Widget controlled by external triggers
  }

  return (
    <div className={`hiring-widget-container ${config.containerClass || ''}`}>
      {/* Custom Styles */}
      {config.customStyles && (
        <style dangerouslySetInnerHTML={{ __html: config.customStyles }} />
      )}

      {/* Widget Modal Overlay (for modal mode) */}
      {isOpen && config.autoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              ×
            </button>
            <div className="p-6">
              <HiringWidgetContent config={config} sessionId={sessionId} />
            </div>
          </div>
        </div>
      )}

      {/* Inline Widget */}
      {(isOpen || !config.autoOpen) && !config.triggerSelector && (
        <HiringWidgetContent config={config} sessionId={sessionId} />
      )}
    </div>
  );
}

// =============================================
// WIDGET CONTENT COMPONENT
// =============================================

function HiringWidgetContent({ config, sessionId }: {
  config: EmbeddableWidgetConfig;
  sessionId: string;
}) {
  const handleComplete = (candidate: any, application: any) => {
    if (config.onComplete) {
      config.onComplete({ candidate, application });
    }

    // GTM tracking
    if (config.gtmId && typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'hiring_application_complete',
        widget_session_id: sessionId,
        candidate_id: candidate.id
      });
    }
  };

  const handleAnalytics = (event: any) => {
    if (config.onAnalytics) {
      config.onAnalytics({
        ...event,
        tracking_id: config.trackingId
      });
    }
  };

  return (
    <div className="hiring-widget-content">
      {/* Custom Header */}
      {(config.title || config.logoUrl) && (
        <div className="text-center mb-6">
          {config.logoUrl && (
            <img
              src={config.logoUrl}
              alt="Company Logo"
              className="h-12 mx-auto mb-4"
            />
          )}
          {config.title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h1>
          )}
          {config.subtitle && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {config.subtitle}
            </p>
          )}
        </div>
      )}

      <HiringWidget
        theme={config.theme}
        embedded={true}
        sessionId={sessionId}
        onComplete={handleComplete}
        onAnalytics={handleAnalytics}
        className="w-full"
      />
    </div>
  );
}

// =============================================
// WIDGET INITIALIZATION SCRIPT
// =============================================

export class TeddyKidsHiringWidget {
  private config: EmbeddableWidgetConfig;
  private queryClient: QueryClient;
  private container: HTMLElement | null = null;

  constructor(config: EmbeddableWidgetConfig) {
    this.config = {
      theme: 'light',
      autoOpen: false,
      enableAssessments: true,
      enableFileUploads: true,
      requirePrivacyConsent: true,
      ...config
    };

    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
          staleTime: 5 * 60 * 1000, // 5 minutes
        },
      },
    });
  }

  // Initialize widget in specified container
  init(containerId: string) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`TeddyKids Hiring Widget: Container element '${containerId}' not found`);
      return;
    }

    this.render();
  }

  // Render widget in container
  private render() {
    if (!this.container) return;

    const root = createRoot(this.container);

    root.render(
      <QueryClientProvider client={this.queryClient}>
        <WidgetWrapper config={this.config} />
      </QueryClientProvider>
    );
  }

  // Show widget (for modal mode)
  show() {
    if (this.container) {
      this.config.autoOpen = true;
      this.render();
    }
  }

  // Hide widget
  hide() {
    if (this.container) {
      this.config.autoOpen = false;
      this.render();
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<EmbeddableWidgetConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (this.container) {
      this.render();
    }
  }

  // Destroy widget
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

// =============================================
// GLOBAL WIDGET INTERFACE
// =============================================

// Make widget available globally for script tag usage
if (typeof window !== 'undefined') {
  (window as any).TeddyKidsHiringWidget = TeddyKidsHiringWidget;
}

// Export for module usage
export default TeddyKidsHiringWidget;

// =============================================
// USAGE EXAMPLES
// =============================================

/*
// EXAMPLE 1: Basic Inline Widget
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    theme: 'light',
    title: 'Join Our Team',
    subtitle: 'Start your career in quality childcare'
  });

  widget.init('hiring-widget-container');
</script>

// EXAMPLE 2: Modal Widget with Trigger
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    triggerSelector: '.apply-now-btn',
    autoOpen: true,
    theme: 'light',
    onComplete: (data) => {
      console.log('Application completed:', data);
      // Redirect to thank you page
      window.location.href = '/thank-you';
    }
  });

  widget.init('hiring-widget-modal');
</script>

// EXAMPLE 3: Advanced Configuration with Analytics
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    theme: 'dark',
    trackingId: 'TK-HIRING-001',
    gtmId: 'GTM-XXXXXXX',
    logoUrl: '/assets/teddykids-logo.png',
    customStyles: `
      .hiring-widget-container {
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
    `,
    onAnalytics: (event) => {
      // Send to your analytics platform
      analytics.track('Hiring Widget Event', event);
    },
    onError: (error) => {
      console.error('Widget error:', error);
      // Send to error tracking service
      Sentry.captureException(error);
    }
  });

  widget.init('careers-widget');
</script>

// EXAMPLE 4: React/Next.js Integration
import TeddyKidsHiringWidget from '@/components/hiring/EmbeddableWidget';

function CareersPage() {
  useEffect(() => {
    const widget = new TeddyKidsHiringWidget({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      theme: 'light'
    });

    widget.init('careers-widget');

    return () => widget.destroy();
  }, []);

  return <div id="careers-widget" />;
}
*/