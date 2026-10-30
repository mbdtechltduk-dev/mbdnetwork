'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Coin {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/news', label: 'News' },
  { href: '/learn', label: 'Learn' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/global-markets', label: 'Global' },
  { href: '/blog', label: 'Blog' },
];

const INTELLIGENCE_LINKS = [
  { href: '/intelligence/fear-greed', label: '😨 Fear & Greed Index' },
  { href: '/intelligence/bubbles', label: '🔵 Crypto Bubbles' },
    { href: '/intelligence/exchanges', label: '🏦 Exchange Comparison' },
  { href: '/intelligence/risk-calculator', label: '⚖️ Risk Calculator' },
];

export default function SiteHeader({ coins = [] }: { coins?: Coin[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();

  const fmt = (n: number) =>
    n >= 1000
      ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const doubled = [...coins, ...coins];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/coin?type=search&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(data.coins?.slice(0, 8) || []);
      } catch {}
      setSearchLoading(false);
    }, 350);
  };

  return (
    <>
      {/* Live Ticker */}
      {coins.length > 0 && (
        <div className="ticker-bar">
          <div className="ticker-track">
            {doubled.map((c, i) => (
              <Link href={`/coin/${c.id}`} className="ticker-item" key={`${c.id}-${i}`} style={{ textDecoration: 'none' }}>
                <span className="ticker-sym">{c.symbol.toUpperCase()}</span>
                <span className="ticker-price">{fmt(c.current_price)}</span>
                <span className={c.price_change_percentage_24h >= 0 ? 'up' : 'dn'} style={{ fontSize: 11 }}>
                  {c.price_change_percentage_24h >= 0 ? '▲' : '▼'}
                  {Math.abs(c.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
                <span style={{ color: 'var(--border2)', marginLeft: 4 }}>•</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}><img src="/images/mbdnetwork-logo-v1.png" alt="MBD Network" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} /><span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>MBDNetwork</span></Link>

        <div className="nav-links">
          {NAV_LINKS.map(l =>
            l.label === 'Intelligence' ? (
              <div key="intel" style={{ position: 'relative' }}
                onMouseEnter={() => setIntelOpen(true)}
                onMouseLeave={() => setIntelOpen(false)}>
                <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Intelligence <span style={{ fontSize: 9 }}>▼</span>
                </span>
                {intelOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, width: 240,
                    background: 'rgba(11,20,40,0.98)', border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius-lg)', padding: '8px 0', zIndex: 200,
                    backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-lg)',
                  }}>
                    <div style={{ padding: '4px 14px 8px', fontSize: 10, color: 'var(--text4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px' }}>Market Intelligence Hub</div>
                    {INTELLIGENCE_LINKS.map(il => (
                      <Link key={il.href} href={il.href}
                        style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: 'var(--text2)', textDecoration: 'none', transition: 'all .15s' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(30,110,245,0.08)', e.currentTarget.style.color = 'var(--text)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'var(--text2)')}>
                        {il.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            )
          )}
        </div>

        {/* Search bar */}
        <div ref={searchRef} style={{ position: 'relative', marginLeft: 'auto', marginRight: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--navy3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>
            <span style={{ color: 'var(--text4)', fontSize: 13 }}>🔍</span>
            <input
              placeholder="Search coins…"
              value={searchQuery}
              onChange={e => { setSearchOpen(true); handleSearch(e.target.value); }}
              onFocus={() => setSearchOpen(true)}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: 140, fontFamily: 'var(--font-body)' }}
            />
          </div>
          {searchOpen && (searchResults.length > 0 || searchLoading) && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: 280, background: 'rgba(11,20,40,0.98)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: 8, zIndex: 200, backdropFilter: 'blur(20px)', marginTop: 6, boxShadow: 'var(--shadow-lg)' }}>
              {searchLoading && <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text3)', fontSize: 13 }}>Searching…</div>}
              {searchResults.map((r: any) => (
                <Link key={r.id} href={`/coin/${r.id}`}
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', transition: 'background .15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(30,110,245,0.1)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  {r.thumb && <img src={r.thumb} alt={r.name} width={22} height={22} style={{ borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase' }}>{r.symbol}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text4)' }}>#{r.market_cap_rank}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}
          className="mobile-menu-btn" aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: coins.length > 0 ? 95 : 62, left: 0, right: 0, bottom: 0, background: 'rgba(6,13,30,0.99)', borderBottom: '1px solid var(--border)', padding: '16px 24px', zIndex: 98, backdropFilter: 'blur(20px)', overflowY: 'auto' }}>
          <input className="form-input" placeholder="🔍 Search coins…" value={searchQuery}
            onChange={e => handleSearch(e.target.value)} style={{ marginBottom: 16 }} />
          {searchResults.map((r: any) => (
            <Link key={r.id} href={`/coin/${r.id}`} onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid var(--border3)' }}>
              {r.thumb && <img src={r.thumb} alt={r.name} width={20} height={20} style={{ borderRadius: '50%' }} />}
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{r.name}</span>
              <span style={{ color: 'var(--text4)', fontSize: 12 }}>{r.symbol.toUpperCase()}</span>
            </Link>
          ))}
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'block', fontSize: 16, padding: '12px 0', borderBottom: '1px solid var(--border3)' }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Intelligence Hub</div>
            {INTELLIGENCE_LINKS.map(il => (
              <Link key={il.href} href={il.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', color: 'var(--text2)', fontSize: 14, padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid var(--border3)' }}>
                {il.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
