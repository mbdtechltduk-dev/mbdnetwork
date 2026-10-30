import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  originalUrl: string;
  publishedAt: string | Date;
  imageUrl?: string | null;
  category: string;
  trustScore: number;
  impactScore: number;
  isFeatured: boolean;
  relatedCoins: string[];
}

function timeAgo(date: string | Date) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

const CAT_COLORS: Record<string, string> = {
  bitcoin: '#F7931A', ethereum: '#627EEA', defi: '#00D084',
  regulation: '#FF6B6B', nft: '#A78BFA', security: '#FF4757',
  etf: '#00B4D8', macro: '#FFB300', altcoin: '#7ED6DF', general: '#6B7694',
};

export default function NewsGrid({ items, compact = false }: { items: NewsItem[]; compact?: boolean }) {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
        <p>No news items yet. News is fetched automatically every 15 minutes.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(auto-fill,minmax(300px,1fr))' : 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
      {items.map((item, idx) => (
        <a
          key={item.id}
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <article className="card hoverable" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Featured image */}
            {item.imageUrl && !compact && (
              <div style={{ height: 160, borderRadius: 8, overflow: 'hidden', background: 'var(--navy3)', marginBottom: 4 }}>
                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Category & trust */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                letterSpacing: '.5px', textTransform: 'uppercase',
                background: `${CAT_COLORS[item.category] || '#6B7694'}1a`,
                color: CAT_COLORS[item.category] || 'var(--text3)',
                border: `1px solid ${CAT_COLORS[item.category] || '#6B7694'}33`,
              }}>{item.category}</span>
              {item.isFeatured && <span className="badge badge-amber">⭐ Featured</span>}
              {item.relatedCoins?.slice(0, 2).map(c => (
                <span key={c} className="badge badge-blue" style={{ fontSize: 10 }}>{c}</span>
              ))}
            </div>

            {/* Title */}
            <h3 style={{ fontSize: compact ? 14 : 15, fontWeight: 600, lineHeight: 1.4, color: 'var(--text)', flex: 1 }}>
              {item.title}
            </h3>

            {/* Summary */}
            {!compact && (
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.summary}
              </p>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>{item.source}</span>
                <span style={{ fontSize: 11, color: 'var(--text4)' }}>•</span>
                <span style={{ fontSize: 11, color: 'var(--text4)' }}>{timeAgo(item.publishedAt)}</span>
              </div>
              {item.trustScore >= 9 && (
                <span style={{ fontSize: 10, color: 'var(--green2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  ✓ Trusted
                </span>
              )}
            </div>
          </article>
        </a>
      ))}
    </div>
  );
}
