import Link from 'next/link';
import { getTally } from '@/lib/db';
import { EVENT_LABEL, GRILL, MAIN, PASTA, RICE } from '@/lib/options';

export const dynamic = 'force-dynamic';

// 주인용 표 수 화면 — 어디에도 링크하지 않는다
export const metadata = { title: '투표 현황', robots: { index: false, follow: false } };

// 표 수 내림차순, 같으면 원래 순서
function ranked(list, counts) {
  return list
    .map((o, i) => ({ ...o, votes: counts[o.value] || 0, i }))
    .sort((a, b) => b.votes - a.votes || a.i - b.i);
}

export default function VotesPage() {
  const tally = getTally();
  const items = { pasta: PASTA, rice: RICE };
  const meals = ranked(MAIN, tally.main).map((m) => ({
    ...m,
    items: ranked(items[m.value], tally[m.value]),
  }));

  return (
    <section className="card menu">
      <header className="menu-head">
        <p className="eyebrow">{EVENT_LABEL}</p>
        <h1>VOTES</h1>
        <p className="lead">응답 {tally.total}명 · 주인용</p>
      </header>

      {tally.total === 0 ? (
        <p className="empty">아직 응답이 없어요.</p>
      ) : (
        <>
          <h2 className="menu-section">식사</h2>
          {meals.map((m) => (
            <div key={m.value} className="menu-group">
              <Line label={m.menu} votes={m.votes} unit="명" strong />
              {m.items.map((o) => (
                <Line key={o.value} label={o.menu} votes={o.votes} />
              ))}
            </div>
          ))}
          {tally.main.pasta > 0 && <p className="hint">파스타 재료는 여러 개 고를 수 있어 표 수 합이 인원보다 많을 수 있어요.</p>}

          <h2 className="menu-section">구이</h2>
          <div className="menu-group">
            {ranked(GRILL, tally.grill).map((o) => (
              <Line key={o.value} label={o.menu} votes={o.votes} />
            ))}
          </div>
        </>
      )}

      <Link href="/" className="ghost">
        ← 설문으로
      </Link>
    </section>
  );
}

function Line({ label, votes, unit = '표', strong }) {
  return (
    <p className={`menu-line${strong ? ' strong' : ''}${votes === 0 ? ' zero' : ''}`}>
      <span>{label}</span>
      <span className="dots" aria-hidden="true" />
      <span className="votes">
        {votes}
        {unit}
      </span>
    </p>
  );
}
