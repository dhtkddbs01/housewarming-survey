import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS responses (
  name       TEXT PRIMARY KEY,   -- 같은 이름 재응답은 UPSERT 로 덮어씀
  main       TEXT NOT NULL,      -- pasta | rice
  pasta      TEXT,               -- main = pasta 일 때 재료 JSON 배열
  rice       TEXT,               -- main = rice 일 때 abalone | roe
  grill      TEXT NOT NULL,      -- fish | meat
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

// DB 는 요청 때 처음 연다 — 모듈 최상단에서 열면 next build 가 DB 를 열려다 실패한다.
// 저널 모드는 기본(DELETE) 그대로 둔다. WAL 이면 최근 기록이 -wal 파일에 남아
// `docker cp survey:/data/survey.db` 백업에서 빠질 수 있다.
export function getDb() {
  if (globalThis.__surveyDb) return globalThis.__surveyDb; // dev 핫리로드 때 다시 열지 않게

  const file = process.env.DB_PATH || path.join(process.cwd(), 'data', 'survey.db');
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma('busy_timeout = 5000');
  db.exec(SCHEMA);
  globalThis.__surveyDb = db;
  return db;
}

// 이름당 1행. 이미 있던 이름이면 updated: true
export function saveResponse({ name, main, pasta, rice, grill }) {
  const db = getDb();
  const now = new Date().toISOString();
  const existed = db.prepare('SELECT 1 FROM responses WHERE name = ?').get(name) !== undefined;

  db.prepare(`
    INSERT INTO responses (name, main, pasta, rice, grill, created_at, updated_at)
    VALUES (@name, @main, @pasta, @rice, @grill, @now, @now)
    ON CONFLICT(name) DO UPDATE SET
      main = excluded.main,
      pasta = excluded.pasta,
      rice = excluded.rice,
      grill = excluded.grill,
      updated_at = excluded.updated_at
  `).run({ name, main, pasta: pasta ? JSON.stringify(pasta) : null, rice, grill, now });

  return { updated: existed };
}

// 메뉴판용 집계 — 이름은 밖으로 내보내지 않는다
export function getTally() {
  const rows = getDb().prepare('SELECT main, pasta, rice, grill FROM responses').all();
  const count = (key) => {
    const map = {};
    for (const r of rows) {
      const picked = key === 'pasta' ? (r.pasta ? JSON.parse(r.pasta) : []) : [r[key]];
      for (const v of picked) if (v) map[v] = (map[v] || 0) + 1;
    }
    return map;
  };
  return {
    total: rows.length,
    main: count('main'),
    pasta: count('pasta'),
    rice: count('rice'),
    grill: count('grill'),
  };
}
