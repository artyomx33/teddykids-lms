#!/usr/bin/env node

/**
 * 🧪 HIRING WIDGET BUILD SCRIPT
 * Builds standalone embeddable widget for external websites
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Build configuration
const buildConfig = {
  entryPoints: ['src/components/hiring/EmbeddableWidget.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2015'],
  format: 'iife',
  globalName: 'TeddyKidsHiringWidget',
  outfile: 'dist/widget/teddykids-hiring-widget.js',
  external: [], // Bundle everything for standalone use
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'window',
  },
  inject: ['scripts/widget-polyfills.js'],
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
  },
  plugins: [
    {
      name: 'external-deps',
      setup(build) {
        // Resolve React dependencies for embedding
        build.onResolve({ filter: /^react$/ }, () => ({
          path: require.resolve('react'),
        }));
        build.onResolve({ filter: /^react-dom/ }, () => ({
          path: require.resolve('react-dom'),
        }));
      },
    },
  ],
};

// CSS build configuration
const cssConfig = {
  entryPoints: ['src/styles/widget.css'],
  bundle: true,
  minify: true,
  outfile: 'dist/widget/teddykids-hiring-widget.css',
};

async function buildWidget() {
  try {
    console.log('🧪 Building TeddyKids Hiring Widget...');

    // Ensure output directory exists
    const outputDir = path.dirname(buildConfig.outfile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build JavaScript bundle
    console.log('📦 Building JavaScript bundle...');
    await esbuild.build(buildConfig);

    // Build CSS bundle
    console.log('🎨 Building CSS bundle...');
    await esbuild.build(cssConfig);

    // Generate integration examples
    console.log('📄 Generating integration examples...');
    generateIntegrationExamples();

    // Generate embed code generator
    console.log('⚡ Generating embed code generator...');
    generateEmbedCodeGenerator();

    console.log('✅ Widget build completed successfully!');
    console.log(`📁 Output files:`);
    console.log(`   - ${buildConfig.outfile}`);
    console.log(`   - ${cssConfig.outfile}`);
    console.log(`   - dist/widget/examples/`);
    console.log(`   - dist/widget/embed-generator.html`);

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function generateIntegrationExamples() {
  const examplesDir = 'dist/widget/examples';
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  // Basic HTML example
  const basicExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeddyKids Careers - Basic Widget Example</title>
    <link rel="stylesheet" href="../teddykids-hiring-widget.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 40px;
        }
        .widget-container {
            margin: 40px 0;
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>Join the TeddyKids Team</h1>
        <p>Creating exceptional childcare experiences together</p>
        <button id="apply-btn" class="btn btn-primary">Apply Now</button>
    </div>

    <div class="widget-container">
        <div id="hiring-widget"></div>
    </div>

    <script src="../teddykids-hiring-widget.js"></script>
    <script>
        // Initialize widget
        const widget = new TeddyKidsHiringWidget({
            supabaseUrl: 'https://your-project.supabase.co',
            supabaseAnonKey: 'your-anon-key',
            theme: 'light',
            title: 'Join Our Team',
            subtitle: 'Start your career in quality childcare',
            onComplete: function(data) {
                alert('Application submitted successfully!');
                console.log('Application data:', data);
            },
            onError: function(error) {
                alert('An error occurred. Please try again.');
                console.error('Widget error:', error);
            }
        });

        // Initialize in container
        widget.init('hiring-widget');

        // Optional: Show widget when apply button is clicked
        document.getElementById('apply-btn').addEventListener('click', function() {
            document.getElementById('hiring-widget').scrollIntoView({
                behavior: 'smooth'
            });
        });
    </script>
</body>
</html>`;

  // Modal example
  const modalExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeddyKids Careers - Modal Widget Example</title>
    <link rel="stylesheet" href="../teddykids-hiring-widget.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .careers-section {
            text-align: center;
            padding: 80px 20px;
        }
        .apply-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .apply-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="careers-section">
        <h1>Ready to Join TeddyKids?</h1>
        <p>We're always looking for passionate childcare professionals</p>
        <button class="apply-btn apply-now-trigger">Apply Now</button>
    </div>

    <div id="hiring-widget-modal"></div>

    <script src="../teddykids-hiring-widget.js"></script>
    <script>
        const widget = new TeddyKidsHiringWidget({
            supabaseUrl: 'https://your-project.supabase.co',
            supabaseAnonKey: 'your-anon-key',
            triggerSelector: '.apply-now-trigger',
            autoOpen: true,
            theme: 'light',
            logoUrl: 'https://your-site.com/logo.png',
            onComplete: function(data) {
                // Redirect to thank you page
                window.location.href = '/thank-you';
            }
        });

        widget.init('hiring-widget-modal');
    </script>
</body>
</html>`;

  // WordPress example
  const wordpressExample = `<!-- WordPress Shortcode Implementation -->
<?php
// Add to functions.php
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
            // Load widget script if not already loaded
            var script = document.createElement('script');
            script.src = 'https://cdn.teddykids.nl/widget/teddykids-hiring-widget.js';
            script.onload = function() {
                initWidget();
            };
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
                title: '<?php echo esc_js($atts['title']); ?>',
                trackingId: 'WP-<?php echo get_current_blog_id(); ?>'
            });

            widget.init('<?php echo esc_js($atts['container_id']); ?>');
        }
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('teddykids_hiring', 'teddykids_hiring_widget_shortcode');

// Usage: [teddykids_hiring theme="dark" title="Join TeddyKids"]
?>`;

  // Write example files
  fs.writeFileSync(path.join(examplesDir, 'basic.html'), basicExample);
  fs.writeFileSync(path.join(examplesDir, 'modal.html'), modalExample);
  fs.writeFileSync(path.join(examplesDir, 'wordpress.php'), wordpressExample);
}

function generateEmbedCodeGenerator() {
  const embedGenerator = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeddyKids Hiring Widget - Embed Code Generator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        input, select, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        .code-output {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .preview {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 20px;
            background: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 TeddyKids Hiring Widget Generator</h1>
        <p>Generate embed code for your website</p>

        <form id="widget-form">
            <div class="form-group">
                <label>Supabase URL *</label>
                <input type="url" id="supabaseUrl" required placeholder="https://your-project.supabase.co">
            </div>

            <div class="form-group">
                <label>Supabase Anon Key *</label>
                <input type="text" id="supabaseKey" required placeholder="eyJ...">
            </div>

            <div class="form-group">
                <label>Theme</label>
                <select id="theme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            <div class="form-group">
                <label>Widget Title</label>
                <input type="text" id="title" placeholder="Join Our Team">
            </div>

            <div class="form-group">
                <label>Widget Subtitle</label>
                <input type="text" id="subtitle" placeholder="Start your career in quality childcare">
            </div>

            <div class="form-group">
                <label>Logo URL</label>
                <input type="url" id="logoUrl" placeholder="https://your-site.com/logo.png">
            </div>

            <div class="form-group">
                <label>Container ID</label>
                <input type="text" id="containerId" value="hiring-widget" placeholder="hiring-widget">
            </div>

            <div class="form-group">
                <label>Widget Type</label>
                <select id="widgetType">
                    <option value="inline">Inline</option>
                    <option value="modal">Modal (with trigger)</option>
                </select>
            </div>

            <div class="form-group" id="triggerGroup" style="display: none;">
                <label>Trigger Selector</label>
                <input type="text" id="triggerSelector" placeholder=".apply-now-btn">
            </div>

            <button type="button" class="btn" onclick="generateCode()">Generate Embed Code</button>
        </form>

        <div style="margin-top: 30px;">
            <h3>Generated Embed Code</h3>
            <div class="code-output" id="output">
                Fill out the form above to generate your embed code.
            </div>
            <button type="button" class="btn" onclick="copyCode()" style="margin-top: 10px;">Copy to Clipboard</button>
        </div>
    </div>

    <script>
        document.getElementById('widgetType').addEventListener('change', function() {
            const triggerGroup = document.getElementById('triggerGroup');
            triggerGroup.style.display = this.value === 'modal' ? 'block' : 'none';
        });

        function generateCode() {
            const form = document.getElementById('widget-form');
            const formData = new FormData(form);

            const config = {
                supabaseUrl: document.getElementById('supabaseUrl').value,
                supabaseAnonKey: document.getElementById('supabaseKey').value,
                theme: document.getElementById('theme').value,
                title: document.getElementById('title').value,
                subtitle: document.getElementById('subtitle').value,
                logoUrl: document.getElementById('logoUrl').value,
                containerId: document.getElementById('containerId').value,
                widgetType: document.getElementById('widgetType').value,
                triggerSelector: document.getElementById('triggerSelector').value
            };

            let code = generateEmbedCode(config);
            document.getElementById('output').textContent = code;
        }

        function generateEmbedCode(config) {
            const widgetConfig = {
                supabaseUrl: config.supabaseUrl,
                supabaseAnonKey: config.supabaseAnonKey,
                theme: config.theme || 'light'
            };

            if (config.title) widgetConfig.title = config.title;
            if (config.subtitle) widgetConfig.subtitle = config.subtitle;
            if (config.logoUrl) widgetConfig.logoUrl = config.logoUrl;
            if (config.widgetType === 'modal') {
                widgetConfig.triggerSelector = config.triggerSelector || '.apply-now-btn';
                widgetConfig.autoOpen = true;
            }

            const configString = JSON.stringify(widgetConfig, null, 2)
                .replace(/"/g, "'")
                .replace(/\\n/g, '\\n');

            return \`<!-- TeddyKids Hiring Widget -->
<link rel="stylesheet" href="https://cdn.teddykids.nl/widget/teddykids-hiring-widget.css">

<!-- Widget Container -->
<div id="\${config.containerId}"></div>

<!-- Widget Script -->
<script src="https://cdn.teddykids.nl/widget/teddykids-hiring-widget.js"></script>
<script>
    const widget = new TeddyKidsHiringWidget(\${configString});
    widget.init('\${config.containerId}');
</script>\`;
        }

        function copyCode() {
            const output = document.getElementById('output');
            navigator.clipboard.writeText(output.textContent).then(() => {
                alert('Code copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('dist/widget/embed-generator.html', embedGenerator);
}

// Create polyfills file for older browsers
function createPolyfills() {
  const polyfills = `
// Essential polyfills for older browsers
if (!window.Promise) {
  window.Promise = require('es6-promise').Promise;
}

if (!window.fetch) {
  window.fetch = require('whatwg-fetch').fetch;
}

if (!Object.assign) {
  Object.assign = require('object-assign');
}
`;

  fs.writeFileSync('scripts/widget-polyfills.js', polyfills);
}

// Main execution
if (require.main === module) {
  createPolyfills();
  buildWidget();
}

module.exports = { buildWidget };