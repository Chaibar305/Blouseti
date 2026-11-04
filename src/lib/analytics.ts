'use client';

/**
 * Envoie un événement de tracking analytique vers /api/analytics/event
 */
export function trackEvent(eventName: string, metadata: Record<string, any> = {}) {
  try {
    if (typeof window === 'undefined') return;

    const payload = JSON.stringify({
      event_name: eventName,
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer || null,
        timestamp: new Date().toISOString(),
      },
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/event', blob);
    } else {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    console.debug('Analytics tracking ignored:', err);
  }
}
