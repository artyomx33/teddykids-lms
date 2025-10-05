# 🧪 TeddyKids Hiring Widget Embedding Guide

## Overview

The TeddyKids Hiring Widget is a complete hiring solution that can be embedded on any website. It provides:

- **Multi-step application form** with validation
- **Skills assessments** with automatic scoring
- **File uploads** for CVs and portfolios
- **GDPR compliance** with consent management
- **Real-time analytics** and conversion tracking
- **Mobile-responsive design** with light/dark themes

## Quick Start

### 1. Basic Inline Widget

```html
<!-- Include widget CSS -->
<link rel="stylesheet" href="https://cdn.teddykids.nl/widget/teddykids-hiring-widget.css">

<!-- Widget container -->
<div id="hiring-widget"></div>

<!-- Include widget script -->
<script src="https://cdn.teddykids.nl/widget/teddykids-hiring-widget.js"></script>
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    theme: 'light',
    title: 'Join Our Team',
    subtitle: 'Start your career in quality childcare'
  });

  widget.init('hiring-widget');
</script>
```

### 2. Modal Widget with Trigger

```html
<!-- Trigger button -->
<button class="apply-now-btn">Apply Now</button>

<!-- Modal container -->
<div id="hiring-widget-modal"></div>

<!-- Widget configuration -->
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    triggerSelector: '.apply-now-btn',
    autoOpen: true,
    theme: 'light'
  });

  widget.init('hiring-widget-modal');
</script>
```

## Configuration Options

### Required Configuration

| Option | Type | Description |
|--------|------|-------------|
| `supabaseUrl` | string | Your Supabase project URL |
| `supabaseAnonKey` | string | Your Supabase anonymous key |

### Appearance Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | 'light' | Widget theme ('light' or 'dark') |
| `title` | string | - | Custom widget title |
| `subtitle` | string | - | Custom widget subtitle |
| `logoUrl` | string | - | Company logo URL |
| `customStyles` | string | - | Custom CSS styles |
| `containerClass` | string | - | Additional CSS class for container |

### Behavior Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoOpen` | boolean | false | Open widget automatically |
| `triggerSelector` | string | - | CSS selector for trigger elements |
| `enableAssessments` | boolean | true | Enable skills assessments |
| `enableFileUploads` | boolean | true | Enable file uploads |
| `requirePrivacyConsent` | boolean | true | Require GDPR consent |

### Analytics & Tracking

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trackingId` | string | - | Custom tracking identifier |
| `gtmId` | string | - | Google Tag Manager ID |
| `onAnalytics` | function | - | Analytics event callback |
| `onComplete` | function | - | Application completion callback |
| `onError` | function | - | Error handling callback |

## Integration Examples

### WordPress Integration

#### Method 1: Shortcode (Recommended)

Add to your theme's `functions.php`:

```php
function teddykids_hiring_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'theme' => 'light',
        'title' => 'Join Our Team',
        'container_id' => 'hiring-widget-' . uniqid()
    ), $atts);

    ob_start();
    ?>
    <div id="<?php echo esc_attr($atts['container_id']); ?>"></div>

    <script>
    (function() {
        if (typeof TeddyKidsHiringWidget === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.js';
            script.onload = function() { initWidget(); };
            document.head.appendChild(script);

            var css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.css';
            document.head.appendChild(css);
        } else {
            initWidget();
        }

        function initWidget() {
            var widget = new TeddyKidsHiringWidget({
                supabaseUrl: '<?php echo get_option('teddykids_supabase_url'); ?>',
                supabaseAnonKey: '<?php echo get_option('teddykids_supabase_key'); ?>',
                theme: '<?php echo esc_js($atts['theme']); ?>',
                title: '<?php echo esc_js($atts['title']); ?>'
            });
            widget.init('<?php echo esc_js($atts['container_id']); ?>');
        }
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('teddykids_hiring', 'teddykids_hiring_widget_shortcode');
```

Usage in posts/pages:
```
[teddykids_hiring theme="dark" title="Join TeddyKids"]
```

#### Method 2: Widget Block

Create a custom Gutenberg block for the widget.

### React/Next.js Integration

```tsx
import { useEffect } from 'react';

declare global {
  interface Window {
    TeddyKidsHiringWidget: any;
  }
}

export function HiringWidget() {
  useEffect(() => {
    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.js';
    script.onload = () => {
      const widget = new window.TeddyKidsHiringWidget({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        theme: 'light',
        onComplete: (data) => {
          // Handle completion
          router.push('/thank-you');
        }
      });

      widget.init('hiring-widget');
    };
    document.head.appendChild(script);

    // Load CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.css';
    document.head.appendChild(css);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(css);
    };
  }, []);

  return <div id="hiring-widget" />;
}
```

### Shopify Integration

```html
<!-- In your theme's template file -->
<div id="hiring-widget"></div>

<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.js';
    script.onload = function() {
      var widget = new TeddyKidsHiringWidget({
        supabaseUrl: '{{ settings.teddykids_supabase_url }}',
        supabaseAnonKey: '{{ settings.teddykids_supabase_key }}',
        theme: '{{ settings.widget_theme | default: "light" }}',
        title: '{{ settings.widget_title | default: "Join Our Team" }}'
      });

      widget.init('hiring-widget');
    };
    document.head.appendChild(script);

    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.css';
    document.head.appendChild(css);
  })();
</script>
```

## Advanced Configuration

### Custom Styling

```html
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    customStyles: `
      .hiring-widget-container {
        max-width: 800px;
        margin: 0 auto;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }

      .hiring-widget-container .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
      }

      .hiring-widget-container .progress-bar {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
    `,
    containerClass: 'my-custom-widget'
  });

  widget.init('hiring-widget');
</script>
```

### Analytics Integration

```html
<script>
  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    trackingId: 'TK-WIDGET-001',
    gtmId: 'GTM-XXXXXXX',
    onAnalytics: function(event) {
      // Send to Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'hiring_widget_event', {
          event_category: 'Hiring',
          event_label: event.event_type,
          custom_parameter: event.session_id
        });
      }

      // Send to custom analytics
      if (typeof analytics !== 'undefined') {
        analytics.track('Hiring Widget Event', event);
      }
    },
    onComplete: function(data) {
      // Conversion tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
        });
      }

      // Redirect to thank you page
      window.location.href = '/thank-you?ref=' + data.application.id;
    },
    onError: function(error) {
      // Error tracking
      if (typeof Sentry !== 'undefined') {
        Sentry.captureException(error);
      }

      console.error('Widget error:', error);
    }
  });

  widget.init('hiring-widget');
</script>
```

### Multi-language Support

```html
<script>
  // Detect user language
  const userLang = navigator.language || navigator.userLanguage;
  const isDutch = userLang.startsWith('nl');

  const widget = new TeddyKidsHiringWidget({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    title: isDutch ? 'Word lid van ons team' : 'Join Our Team',
    subtitle: isDutch ?
      'Begin je carrière in kwaliteitskinderopvang' :
      'Start your career in quality childcare',
    language: isDutch ? 'nl' : 'en'
  });

  widget.init('hiring-widget');
</script>
```

## API Methods

### Widget Instance Methods

```javascript
const widget = new TeddyKidsHiringWidget(config);

// Initialize widget
widget.init('container-id');

// Show widget (for modal mode)
widget.show();

// Hide widget
widget.hide();

// Update configuration
widget.updateConfig({
  theme: 'dark',
  title: 'New Title'
});

// Destroy widget
widget.destroy();
```

## Event Callbacks

### onComplete Callback

Triggered when a candidate successfully completes their application:

```javascript
onComplete: function(data) {
  console.log('Application completed:', data);
  // data.candidate - candidate information
  // data.application - application details

  // Example: Redirect to thank you page
  window.location.href = '/thank-you?id=' + data.application.id;
}
```

### onAnalytics Callback

Triggered for various widget events:

```javascript
onAnalytics: function(event) {
  console.log('Analytics event:', event);
  // event.event_type - type of event
  // event.session_id - unique session identifier
  // event.event_data - additional event data

  // Send to your analytics platform
  analytics.track('Hiring Widget', event);
}
```

### onError Callback

Triggered when errors occur:

```javascript
onError: function(error) {
  console.error('Widget error:', error);

  // Send to error tracking service
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(error);
  }

  // Show user-friendly message
  alert('Something went wrong. Please try again.');
}
```

## Event Types

The widget tracks these analytics events:

- `widget_load` - Widget loaded on page
- `form_start` - User started filling the form
- `form_step` - User progressed to next step
- `form_complete` - User completed application form
- `form_abandon` - User left without completing
- `assessment_start` - User started skills assessment
- `assessment_complete` - User completed assessment
- `file_upload` - User uploaded a file

## Security Considerations

### GDPR Compliance

The widget includes built-in GDPR compliance features:

- **Consent checkboxes** for data processing and marketing
- **Data retention policies** with automatic cleanup
- **Right to withdrawal** via unsubscribe links
- **Privacy policy integration** with customizable links

### Data Security

- All data is transmitted over HTTPS
- Supabase handles authentication and authorization
- Row Level Security (RLS) policies protect candidate data
- File uploads are scanned for malware

### Content Security Policy

Add these CSP directives to allow the widget:

```
script-src 'self' https://cdn.teddykids.nl;
style-src 'self' https://cdn.teddykids.nl;
connect-src 'self' https://your-project.supabase.co;
img-src 'self' data: https:;
```

## Browser Support

The widget supports:

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile browsers**: iOS Safari 12+, Chrome Mobile 60+
- **Legacy support**: IE 11+ (with polyfills)

## Performance

- **Bundle size**: ~150KB gzipped (including React)
- **Load time**: < 500ms on 3G networks
- **Lazy loading**: Non-critical assets loaded on demand
- **CDN delivery**: Global edge network for fast loading

## Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check console for JavaScript errors
   - Verify CDN URLs are accessible
   - Ensure container element exists

2. **Styling conflicts**
   - Use `containerClass` for custom scoping
   - Check for CSS conflicts in developer tools
   - Consider using `customStyles` for overrides

3. **Supabase connection errors**
   - Verify Supabase URL and anon key
   - Check CORS settings in Supabase dashboard
   - Ensure RLS policies allow anonymous access

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const widget = new TeddyKidsHiringWidget({
  // ... other config
  debug: true
});
```

### Support

For technical support:
- Email: tech@teddykids.nl
- Documentation: https://docs.teddykids.nl/widget
- Issues: https://github.com/teddykids/hiring-widget/issues

## Deployment Checklist

Before deploying the widget:

- [ ] Configure Supabase project and credentials
- [ ] Set up RLS policies for candidate data
- [ ] Configure email notifications
- [ ] Test widget on target website
- [ ] Set up analytics and error tracking
- [ ] Configure GDPR compliance settings
- [ ] Test file upload functionality
- [ ] Verify mobile responsiveness
- [ ] Test in target browsers
- [ ] Set up monitoring and alerts