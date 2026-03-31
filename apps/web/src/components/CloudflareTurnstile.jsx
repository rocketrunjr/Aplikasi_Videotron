import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Cloudflare Turnstile captcha widget.
 * Props:
 *   siteKey: string — Cloudflare Turnstile site key
 *   onVerify: (token: string) => void — called when captcha is solved
 *   onExpire?: () => void — called when token expires
 *   theme?: 'light' | 'dark' | 'auto'
 */
const CloudflareTurnstile = ({ siteKey, onVerify, onExpire, theme = 'auto' }) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [loaded, setLoaded] = useState(!!window.turnstile);

    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onVerifyRef.current = onVerify;
        onExpireRef.current = onExpire;
    }, [onVerify, onExpire]);

    const renderWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile || !siteKey) return;
        // Clean up previous widget
        if (widgetIdRef.current !== null) {
            try { window.turnstile.remove(widgetIdRef.current); } catch { /* cleanup */ }
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => onVerifyRef.current?.(token),
            'expired-callback': () => onExpireRef.current?.(),
            theme,
        });
    }, [siteKey, theme]);

    useEffect(() => {
        // If no siteKey, auto-verify in dev/fallback mode
        if (!siteKey) {
            console.warn('[Turnstile] No siteKey provided, auto-verifying (dev mode)');
            onVerifyRef.current?.('dev-mode-no-captcha');
            return;
        }

        // Check if script already loaded
        if (window.turnstile) {
            return;
        }

        // Load Turnstile script
        const existing = document.querySelector('script[src*="turnstile"]');
        if (existing) {
            existing.addEventListener('load', () => setLoaded(true));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);
    }, [siteKey]);

    useEffect(() => {
        if (loaded && siteKey) renderWidget();
    }, [loaded, siteKey, renderWidget]);

    useEffect(() => {
        return () => {
            if (widgetIdRef.current !== null && window.turnstile) {
                try { window.turnstile.remove(widgetIdRef.current); } catch { /* cleanup */ }
            }
        };
    }, []);

    if (!siteKey) {
        return <div className="text-xs text-amber-500 p-2">⚠️ Captcha tidak tersedia</div>;
    }

    return <div ref={containerRef} className="cf-turnstile" />;
};

export default CloudflareTurnstile;
