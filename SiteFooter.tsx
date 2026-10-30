import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  const legal = [
    ['Privacy Policy', '/legal/privacy-policy'],
    ['Cookie Policy', '/legal/cookie-policy'],
    ['Terms & Conditions', '/legal/terms-and-conditions'],
    ['Disclaimer', '/legal/disclaimer'],
    ['Affiliate Disclosure', '/legal/affiliate-disclosure'],
    
    
  ];

  const platform = [
    ['🏠 Home', '/'],
    ['📊 Markets', '/markets'],
    ['📰 News', '/news'],
    ['📚 Learn', '/learn'],
    
    ['🌍 Global Markets', '/global-markets'],
    
    ['✍️ Blog', '/blog'],
    
    
  ];

  const intelligence = [
    ['😨 Fear & Greed', '/intelligence/fear-greed'],
    ['🔵 Crypto Bubbles', '/intelligence/bubbles'],

    ['🏦 Exchanges', '/intelligence/exchanges'],
    ['⚖️ Risk Calculator', '/intelligence/risk-calculator'],
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 200px 200px 200px', gap: 18, paddingBottom: 32, justifyContent: 'center', maxWidth: 980, margin: '0 auto' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, background: 'linear-gradient(135deg, var(--blue), var(--green))',
                borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0
              }}>M</div>
              <span style={{
                fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700,
                background: 'linear-gradient(90deg, var(--blue3), var(--green2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>MBDNetwork</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 16, maxWidth: 220 }}>
              Professional market intelligence, financial news, global markets, and digital asset research.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                ['📘 Facebook', '#', '#0088cc'],
                ['▶️ YouTube', '#', '#25D366'],
                ['📷 Instagram', '#', '#1DA1F2'],
                ['🎵 TikTok', '#', '#1DA1F2'],
              ].map(([label, href, color]) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text2)',
                    textDecoration: 'none', fontWeight: 500
                  }}>{label}</a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="footer-col-title">Platform</div>
            {platform.map(([label, href]) => (
              <Link key={href} href={href} className="footer-link">{label}</Link>
            ))}
          </div>

          {/* Intelligence */}
          <div>
            <div className="footer-col-title">⚡ Intelligence</div>
            {intelligence.map(([label, href]) => (
              <Link key={href} href={href} className="footer-link">{label}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div className="footer-col-title">Legal</div>
            {legal.map(([label, href]) => (
              <Link key={href} href={href} className="footer-link">{label}</Link>
            ))}
            <div className="footer-col-title" style={{ marginTop: 20 }}>Resources</div>
            <a href="/sitemap.xml" className="footer-link">🗺 Sitemap</a>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            © {year} MBDNetwork.com — All rights reserved
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="pulse-dot green" /> Market Data and Intelligence
            </span>
          </div>
        </div>

        <div className="footer-disclaimer">
          <strong style={{ color: 'var(--text3)' }}>⚠ Risk Disclaimer:</strong> Financial markets and digital assets involve risk and market volatility. Nothing on MBDNetwork.com constitutes financial, investment, legal, or tax advice. All content is provided for educational and informational purposes only. We may earn commissions from affiliate partner links. Always conduct your own research and consult a qualified professional before making financial decisions. Past performance is not indicative of future results.
        </div>
      </div>
    </footer>
  );
}
