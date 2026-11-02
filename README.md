# housewarming-survey

집들이(2026-11-07 토 13:00) 메뉴를 손님 설문으로 정하는 작은 웹.

- `/` — 이름 입력 → 질문 3개 클릭 → 저장 (같은 이름은 덮어씀)
- `/menu` — 항목별 표 수를 메뉴판 모양으로 (이름은 보여 주지 않음)
- `POST /api/responses` — 서버에서 다시 검증 후 SQLite 에 UPSERT

Next.js 15 (App Router) + better-sqlite3. DB 파일 경로는 `DB_PATH` (기본 `./data/survey.db`).

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

## 배포

`main` 에 push 하면 Actions 가 `ghcr.io/dhtkddbs01/housewarming-survey:latest` 를 만든다. 서버는 이미지만 받는다.

```bash
cd ~/docker/survey && docker compose pull && docker compose up -d
```

백업:

```bash
docker cp survey:/data/survey.db ./survey-backup.db
```

> `data/`, `*.db` 는 커밋하지 않는다 — 손님 이름이 들어 있다.
