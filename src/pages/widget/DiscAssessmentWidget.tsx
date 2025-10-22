/**
 * 🎯 STANDALONE DISC ASSESSMENT WIDGET PAGE
 * Public-facing widget that can be embedded in external websites
 * No authentication required - for www.teddykids.nl/team
 */

import { useEffect } from "react";
import DiscAssessmentWidget from "@/modules/talent-acquisition/components/DiscAssessmentWidget";

export default function StandaloneDiscWidget() {
  useEffect(() => {
    // Send height updates to parent window for auto-resizing iframe
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage(
        { type: 'teddykids-widget-resize', height },
        '*'
      );
    };

    // Send initial height
    sendHeight();

    // Update height when content changes
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Update on window resize
    window.addEventListener('resize', sendHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sendHeight);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <DiscAssessmentWidget
        isPreview={false}
        onComplete={(result) => {
          console.log('✅ Assessment submitted from embedded widget:', result);
          // Show success message
          window.parent.postMessage(
            { type: 'teddykids-widget-complete', data: result },
            '*'
          );
        }}
        onClose={() => {
          // Notify parent window
          window.parent.postMessage(
            { type: 'teddykids-widget-close' },
            '*'
          );
        }}
      />
    </div>
  );
}

