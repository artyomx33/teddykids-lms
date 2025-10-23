# 🎯 TeddyKids DISC Assessment Widget - Embed Code

## For Your Website

Copy and paste this code into your website where you want the application form to appear:

### Option 1: Inline Embed (Recommended)

```html
<!-- TeddyKids Talent Acquisition Widget -->
<div id="teddykids-widget-container"></div>

<script>
  (function() {
    const container = document.getElementById('teddykids-widget-container');
    const iframe = document.createElement('iframe');
    
    // Configure iframe
    iframe.src = 'https://app.teddykids.nl/widget/disc-assessment';
    iframe.width = '100%';
    iframe.height = '900';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    iframe.title = 'TeddyKids Application Form';
    iframe.allow = 'camera; microphone'; // If you need these permissions
    
    container.appendChild(iframe);
    
    // Auto-resize iframe based on content
    window.addEventListener('message', function(e) {
      if (e.data.type === 'teddykids-widget-resize') {
        iframe.style.height = e.data.height + 'px';
      }
    });
  })();
</script>
```

### Option 2: Simple iFrame Embed

```html
<!-- TeddyKids Application Widget -->
<iframe 
  src="https://app.teddykids.nl/widget/disc-assessment"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  title="TeddyKids Application Form"
></iframe>
```

### Option 3: Button/Modal Trigger

```html
<!-- Button to open widget in modal -->
<button id="apply-now-btn" style="
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
">
  Apply Now
</button>

<!-- Modal Container -->
<div id="widget-modal" style="
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 9999;
  align-items: center;
  justify-content: center;
">
  <div style="
    position: relative;
    width: 90%;
    max-width: 800px;
    height: 90%;
    background: white;
    border-radius: 12px;
    overflow: hidden;
  ">
    <button id="close-modal" style="
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 18px;
      cursor: pointer;
      z-index: 10000;
    ">×</button>
    
    <iframe 
      id="widget-iframe"
      src=""
      width="100%"
      height="100%"
      frameborder="0"
      style="border: none;"
    ></iframe>
  </div>
</div>

<script>
  const applyBtn = document.getElementById('apply-now-btn');
  const modal = document.getElementById('widget-modal');
  const closeBtn = document.getElementById('close-modal');
  const iframe = document.getElementById('widget-iframe');
  
  applyBtn.addEventListener('click', function() {
    iframe.src = 'https://YOUR-DOMAIN.com/widget/disc-assessment';
    modal.style.display = 'flex';
  });
  
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    iframe.src = ''; // Stop loading when closed
  });
  
  // Close on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      iframe.src = '';
    }
  });
</script>
```

---

## 📋 Widget Features

When embedded, your widget will include:

✅ **DISC Personality Assessment**
- Comprehensive 24-question assessment
- Automatic D-I-S-C profile calculation
- Visual personality radar chart

✅ **Candidate Information Capture**
- Full name, email, phone
- Position applying for
- Availability and preferences

✅ **Auto-Save to Database**
- Saves directly to your Supabase `candidates` table
- Real-time updates in your Talent Acquisition dashboard
- Automatic candidate tracking

✅ **Modern UI**
- Beautiful purple/gradient design
- Mobile responsive
- Progress tracking
- Instant feedback

---

## 🔧 Configuration Options

### Update Your Domain

Domain configured:
- **Development**: `http://localhost:5173`
- **Production**: `https://app.teddykids.nl`

### Customize Widget URL

The widget is available at:
```
/widget/disc-assessment
```

### Set Widget Height

Default heights by content:
- **DISC Assessment**: `900px` (recommended)
- **With full form**: `1200px`
- **Compact mode**: `700px`

---

## 🎨 Styling Tips

### Match Your Brand Colors

Add this to your website CSS:

```css
/* Custom widget container styling */
#teddykids-widget-container {
  margin: 40px auto;
  max-width: 800px;
  padding: 20px;
}

/* Add subtle animation */
#teddykids-widget-container iframe {
  transition: box-shadow 0.3s ease;
}

#teddykids-widget-container iframe:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}
```

---

## 📊 Tracking Conversions

Monitor applications in real-time:

1. **Dashboard**: Go to `/labs/talent-acquisition`
2. **View Applications**: Candidates tab shows all submissions
3. **Real-time Updates**: New applications appear instantly
4. **Analytics**: Track conversion rates and sources

---

## 🔐 Security Notes

1. **CORS Setup**: Ensure your domain is allowed in Supabase settings
2. **RLS Policies**: Widget submissions should work with public access
3. **Rate Limiting**: Consider adding rate limits to prevent spam
4. **Validation**: All fields validated client-side and server-side

---

## 🚀 Quick Start Checklist

- [ ] Copy embed code to your website
- [ ] Update domain URLs to match your environment
- [ ] Test submission creates candidate in dashboard
- [ ] Verify real-time updates work
- [ ] Customize styling to match brand
- [ ] Add Google Analytics tracking (optional)
- [ ] Monitor first submissions!

---

## 💡 Pro Tips

1. **Pre-fill Data**: Add URL parameters to pre-fill fields
   ```
   /widget/disc-assessment?position=Childcare%20Professional&source=facebook
   ```

2. **Track Sources**: Use UTM parameters
   ```
   /widget/disc-assessment?utm_source=website&utm_medium=careers-page
   ```

3. **A/B Testing**: Create multiple embed buttons with different CTAs

4. **Mobile Optimization**: The widget is fully responsive!

---

## 📞 Support

If you need help:
1. Check browser console for errors
2. Verify Supabase connection
3. Test with `npm run dev` locally first
4. Check `candidates` table in Supabase

---

*Widget Embed Guide*  
*TeddyKids LMS - Talent Acquisition*  
*October 2025*

