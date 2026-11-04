'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { SiteSettings } from '@/app/actions/settings';
import { useSettings } from '@/context/SettingsContext';

interface PixelScriptsProps {
  settings?: SiteSettings;
}

/**
 * Composant client pour l'injection dynamique :
 * 1. Pixels officiels : Meta Pixel (fbq), TikTok Pixel (ttq), Snapchat Pixel (snaptr), Google Analytics 4 (gtag)
 * 2. Code d'en-tête (<head>) personnalisé : Support <script>, <meta>, <style>, etc.
 * 3. Code de pied de page (<body>) personnalisé : Scripts de chat, pixels additionnels, etc.
 */
export default function PixelScripts({ settings: propsSettings }: PixelScriptsProps) {
  const { settings: contextSettings } = useSettings();
  const settings = propsSettings || contextSettings;

  const {
    fb_pixel_id,
    tiktok_pixel_id,
    snapchat_pixel_id,
    google_analytics_id,
    custom_header_code,
    custom_footer_code,
  } = settings || {};

  // Injection dynamique des scripts personnalisés (<head> et <body>)
  useEffect(() => {
    // 1. Code personnalisé pour <head>
    if (custom_header_code && custom_header_code.trim()) {
      const headerHolder = document.createElement('div');
      headerHolder.id = 'bls-custom-head-wrapper';
      headerHolder.innerHTML = custom_header_code;

      const scripts = Array.from(headerHolder.querySelectorAll('script'));
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      while (headerHolder.firstChild) {
        document.head.appendChild(headerHolder.firstChild);
      }
    }

    // 2. Code personnalisé pour <body>
    if (custom_footer_code && custom_footer_code.trim()) {
      const footerHolder = document.createElement('div');
      footerHolder.id = 'bls-custom-body-wrapper';
      footerHolder.innerHTML = custom_footer_code;

      const scripts = Array.from(footerHolder.querySelectorAll('script'));
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      while (footerHolder.firstChild) {
        document.body.appendChild(footerHolder.firstChild);
      }
    }
  }, [custom_header_code, custom_footer_code]);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. META / FACEBOOK PIXEL                                   */}
      {/* ========================================================= */}
      {fb_pixel_id && fb_pixel_id.trim() && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fb_pixel_id.trim()}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fb_pixel_id.trim()}&ev=PageView&noscript=1`}
              alt="Meta Pixel"
            />
          </noscript>
        </>
      )}

      {/* ========================================================= */}
      {/* 2. TIKTOK PIXEL                                           */}
      {/* ========================================================= */}
      {tiktok_pixel_id && tiktok_pixel_id.trim() && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
                ttq.load('${tiktok_pixel_id.trim()}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 3. SNAPCHAT PIXEL                                         */}
      {/* ========================================================= */}
      {snapchat_pixel_id && snapchat_pixel_id.trim() && (
        <Script
          id="snapchat-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
              a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
              r.src=n;var u=t.getElementsByTagName(s)[0];
              u.parentNode.insertBefore(r,u);})(window,document,
              'https://sc-static.net/scevent.min.js');
              snaptr('init', '${snapchat_pixel_id.trim()}');
              snaptr('track', 'PAGE_VIEW');
            `,
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 4. GOOGLE ANALYTICS 4 (GA4)                               */}
      {/* ========================================================= */}
      {google_analytics_id && google_analytics_id.trim() && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${google_analytics_id.trim()}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${google_analytics_id.trim()}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
