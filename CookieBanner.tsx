'use client';
import { useState, useEffect } from 'react';

const CONSENT_KEY = 'mbd_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, advertising: false, affiliate: true, functional: true });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) setVisible(true);
    } catch { setVisible(true); }
  }, []);

  const save = (all: boolean) => {
    const consent = all ? { analytics: true, advertising: true, affiliate: true, functional: true } : prefs;
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, essential: true, ts: Date.now() })); } catch {}
    setVisible(false);
    // Post to server
    fetch('/api/contact', { method: 'OPTIONS' }).catch(() => {});
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div style={{ flex: 1, maxWidth: 520 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)' }}>🍪 Cookie Settings</strong> — We use essential cookies to keep MBDNetwork secure and improve your experience. <a href="/legal/cookie-policy" style={{ color: 'var(--blue3)' }}>Learn more</a>.
        </p>

        {showDetail && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {[
              { key: 'analytics', label: 'Analytics', desc: 'Google Analytics' },
              { key: 'advertising', label: 'Advertising', desc: 'Google AdSense' },
              { key: 'affiliate', label: 'Affiliate', desc: 'Partner tracking' },
              { key: 'functional', label: 'Functional', desc: 'Preferences' },
            ].map(p => (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={prefs[p.key as keyof typeof prefs]}
                  onChange={e => setPrefs(prev => ({ ...prev, [p.key]: e.target.checked }))} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                  <strong>{p.label}</strong> <span style={{ color: 'var(--text4)' }}>({p.desc})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowDetail(!showDetail)}>
          {showDetail ? 'Hide' : 'Customize'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => save(false)}>
          {showDetail ? 'Save Preferences' : 'Essential Only'}
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => save(true)}>Accept All</button>
      </div>
    </div>
  );
}
