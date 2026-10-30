'use client';
import { useState } from 'react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
  market_cap_rank: number;
}

interface GlobalStats {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
  active_cryptocurrencies: number;
}

interface TrendingCoin {
  item: { id: string; name: string; symbol: string; thumb: string; data?: { price_change_percentage_24h?: { usd: number } } };
}

interface Props {
  coins: Coin[];
  globalStats?: GlobalStats;
  trending?: TrendingCoin[];
}

function fmtPrice(n: number) {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
}

function fmtBig(n: number) {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  return '$' + n.toFixed(0);
}

function MiniSparkline({ prices }: { prices: number[] }) {
  if (!prices || prices.length < 2) return null;
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const w = 64, h = 24;
  const pts = prices.map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`).join(' ');
  const isUp = prices[prices.length - 1] >= prices[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={isUp ? 'var(--green2)' : 'var(--red)'} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function MarketDashboard({ coins, globalStats, trending }: Props) {
  const [tab, setTab] = useState<'top' | 'gainers' | 'losers' | 'trending'>('top');
  const [search, setSearch] = useState('');
  const [fromAmt, setFromAmt] = useState('1');
  const [fromSym, setFromSym] = useState('bitcoin');
  const [toSym, setToSym] = useState('usd');
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const change24h = globalStats?.market_cap_change_percentage_24h_usd ?? 0;

  const filtered = coins.filter(c =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const gainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 8);
  const losers = [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 8);

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await fetch(`/api/market?type=convert&amount=${fromAmt}&from=${fromSym}&to=${toSym}`);
      const data = await res.json();
      setConvertResult(data.result?.toLocaleString('en-US', { maximumFractionDigits: 8 }) ?? 'N/A');
    } catch {
      setConvertResult('Error');
    } finally {
      setConverting(false);
    }
  };

  const displayCoins = tab === 'gainers' ? gainers : tab === 'losers' ? losers : filtered.slice(0, 50);

  return (
    <section>
      {/* Global Stats */}
      {globalStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Global Market Cap', value: fmtBig(globalStats.total_market_cap.usd), change: change24h },
            { label: '24h Volume', value: fmtBig(globalStats.total_volume.usd), change: null },
            { label: 'BTC Dominance', value: (globalStats.market_cap_percentage.btc).toFixed(1) + '%', change: null },
            { label: 'ETH Dominance', value: (globalStats.market_cap_percentage.eth).toFixed(1) + '%', change: null },
            { label: 'Active Coins', value: globalStats.active_cryptocurrencies.toLocaleString(), change: null },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--text)' }}>{s.value}</div>
              {s.change !== null && (
                <div style={{ fontSize: 11, color: s.change >= 0 ? 'var(--green2)' : 'var(--red)', marginTop: 3 }}>
                  {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}% 24h
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Price Table + Converter layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
        {/* Price Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Tabs & Search */}
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="tabs">
              {(['top', 'gainers', 'losers'] as const).map(t => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'top' ? '📊 Top' : t === 'gainers' ? '🚀 Gainers' : '📉 Losers'}
                </button>
              ))}
            </div>
            {tab === 'top' && (
              <input className="form-input" placeholder="🔍 Search coins…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 180, padding: '7px 12px', fontSize: 13 }} />
            )}
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--navy3)', zIndex: 1 }}>
                <tr>
                  <th>#</th>
                  <th>Coin</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>24h %</th>
                  <th style={{ textAlign: 'right' }}>Market Cap</th>
                  <th style={{ textAlign: 'right' }}>7d Chart</th>
                </tr>
              </thead>
              <tbody>
                {displayCoins.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{c.market_cap_rank}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {c.image && <img src={c.image} alt={c.name} width={26} height={26} style={{ borderRadius: '50%' }} />}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>{c.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13 }}>{fmtPrice(c.current_price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ color: c.price_change_percentage_24h >= 0 ? 'var(--green2)' : 'var(--red)', fontSize: 13, fontWeight: 600 }}>
                        {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text3)' }}>{fmtBig(c.market_cap)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {c.sparkline_in_7d?.price && <MiniSparkline prices={c.sparkline_in_7d.price} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <a href="/markets" style={{ fontSize: 13, color: 'var(--blue3)', fontWeight: 600 }}>View full market data →</a>
          </div>
        </div>

        {/* Sidebar: Trending + Converter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Trending */}
          {trending && trending.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔥 Trending
              </div>
              {trending.slice(0, 7).map((t, i) => {
                const ch = t.item.data?.price_change_percentage_24h?.usd;
                return (
                  <div key={t.item.id} style={{ padding: '9px 16px', borderBottom: '1px solid var(--border3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text4)', width: 16, textAlign: 'center' }}>{i + 1}</span>
                    {t.item.thumb && <img src={t.item.thumb} alt={t.item.name} width={20} height={20} style={{ borderRadius: '50%' }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.item.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{t.item.symbol}</div>
                    </div>
                    {ch != null && (
                      <span style={{ fontSize: 11, color: ch >= 0 ? 'var(--green2)' : 'var(--red)', fontWeight: 600 }}>
                        {ch >= 0 ? '+' : ''}{ch.toFixed(1)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Converter */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚡ Converter
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input className="form-input" type="number" value={fromAmt} onChange={e => setFromAmt(e.target.value)} min="0" step="any" />
            </div>
            <div className="form-group">
              <label className="form-label">From</label>
              <select className="form-select" value={fromSym} onChange={e => setFromSym(e.target.value)}>
                {['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano'].map(id => (
                  <option key={id} value={id}>{id.charAt(0).toUpperCase() + id.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <select className="form-select" value={toSym} onChange={e => setToSym(e.target.value)}>
                {['usd', 'eur', 'gbp', 'bitcoin', 'ethereum'].map(id => (
                  <option key={id} value={id}>{id.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleConvert} disabled={converting}>
              {converting ? 'Converting…' : 'Convert'}
            </button>
            {convertResult && (
              <div style={{ marginTop: 12, textAlign: 'center', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--green2)', background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.15)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                {fromAmt} {fromSym.toUpperCase()} = {convertResult} {toSym.toUpperCase()}
              </div>
            )}
            <p style={{ fontSize: 10, color: 'var(--text4)', marginTop: 8, lineHeight: 1.5 }}>
              For reference only. Not financial advice. Real-time rates via CoinGecko.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .market-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
