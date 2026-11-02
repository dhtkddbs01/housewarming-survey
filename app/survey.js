'use client';

import { useRef, useState } from 'react';
import { EVENT_LABEL, GRILL, MAIN, NAME_MAX, PASTA, RICE } from '@/lib/options';

// name → main → (pasta | rice) → grill → done
const PREV = { main: 'name', pasta: 'main', rice: 'main' };
const QUESTION_NO = { main: 1, pasta: 2, rice: 2, grill: 3 };

// 질문이 바뀌어도 타일이 같은 자리에 있어서, 두 번 탭하면 다음 질문까지 눌린다.
// 화면이 바뀐 직후 이 시간 동안은 입력을 무시한다.
const INPUT_LOCK_MS = 350;

export default function Survey() {
  const [step, setStep] = useState('name');
  const [name, setName] = useState('');
  const [main, setMain] = useState(null);
  const [pasta, setPasta] = useState([]);
  const [rice, setRice] = useState(null);
  const [grill, setGrill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);

  const lockUntil = useRef(0);

  const trimmed = name.trim();
  const locked = () => Date.now() < lockUntil.current;

  function go(next) {
    lockUntil.current = Date.now() + INPUT_LOCK_MS;
    setError('');
    setStep(next);
  }

  function back() {
    if (locked()) return;
    go(step === 'grill' ? main : PREV[step]);
  }

  function pickMain(value) {
    if (locked()) return;
    setMain(value);
    go(value);
  }

  function togglePasta(value) {
    if (locked()) return;
    setPasta((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));
  }

  function pickRice(value) {
    if (locked()) return;
    setRice(value);
    go('grill');
  }

  async function pickGrill(value) {
    if (saving || locked()) return;
    setGrill(value);
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          main,
          pasta: main === 'pasta' ? pasta : null,
          rice: main === 'rice' ? rice : null,
          grill: value,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '저장하지 못했어요. 다시 눌러 주세요.');
      setUpdated(Boolean(data.updated));
      go('done');
    } catch (err) {
      setError(err.message || '저장하지 못했어요. 다시 눌러 주세요.');
    } finally {
      setSaving(false);
    }
  }

  function restart() {
    if (locked()) return;
    setMain(null);
    setPasta([]);
    setRice(null);
    setGrill(null);
    go('name');
  }

  if (step === 'name') {
    return (
      <section className="card">
        <p className="eyebrow">{EVENT_LABEL} 집들이</p>
        <h1>무엇을 먹고 싶으세요?</h1>
        <p className="lead">질문 3개만 골라 주시면 메뉴에 반영할게요.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed && !locked()) go('main');
          }}
        >
          <label className="field">
            <span>이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="예: 홍길동"
              autoComplete="name"
              enterKeyHint="next"
            />
          </label>
          <p className="hint">같은 이름으로 다시 하면 이전 답이 새 답으로 바뀌어요.</p>
          <button type="submit" className="primary" disabled={!trimmed}>
            시작
          </button>
        </form>
      </section>
    );
  }

  if (step === 'done') {
    return (
      <>
        <CourseMenu name={trimmed} main={main} pasta={pasta} rice={rice} grill={grill} />
        <p className="saved">{updated ? '이전 답을 새 답으로 바꿨어요.' : '답이 저장됐어요. 고마워요!'}</p>
        <button type="button" className="ghost" onClick={restart}>
          답 바꾸기
        </button>
      </>
    );
  }

  const no = QUESTION_NO[step];

  return (
    <section className="card">
      <div className="top">
        <button type="button" className="back" onClick={back} disabled={saving}>
          ← 이전
        </button>
        <span className="progress">
          {no} / 3
        </span>
      </div>
      <div className="bar" aria-hidden="true">
        <span style={{ width: `${(no / 3) * 100}%` }} />
      </div>

      {step === 'main' && (
        <Question no="Q1" title="면이랑 밥 중에 어떤 게 좋으세요?">
          {MAIN.map((o) => (
            <Choice key={o.value} selected={main === o.value} sub={o.sub} onClick={() => pickMain(o.value)}>
              {o.label}
            </Choice>
          ))}
        </Question>
      )}

      {step === 'pasta' && (
        <Question no="Q1-1" title="파스타에 무엇을 넣을까요?" note="여러 개 골라도 돼요">
          {PASTA.map((o) => (
            <Choice key={o.value} selected={pasta.includes(o.value)} onClick={() => togglePasta(o.value)} multi>
              {o.label}
            </Choice>
          ))}
          <button type="button" className="primary" disabled={pasta.length === 0} onClick={() => go('grill')}>
            다음
          </button>
        </Question>
      )}

      {step === 'rice' && (
        <Question no="Q1-2" title="어떤 밥이 좋으세요?">
          {RICE.map((o) => (
            <Choice key={o.value} selected={rice === o.value} onClick={() => pickRice(o.value)}>
              {o.label}
            </Choice>
          ))}
        </Question>
      )}

      {step === 'grill' && (
        <Question no="Q2" title="생선구이와 고기구이 중에는요?">
          {GRILL.map((o) => (
            <Choice key={o.value} selected={grill === o.value} onClick={() => pickGrill(o.value)} disabled={saving}>
              {saving && grill === o.value ? '저장 중…' : o.label}
            </Choice>
          ))}
        </Question>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

// 그 손님이 고른 것만으로 만든 코스 메뉴판 — 서버에서 다시 읽지 않고 화면 상태로 그린다
function CourseMenu({ name, main, pasta, rice, grill }) {
  const find = (list, value) => list.find((o) => o.value === value);
  let meal;
  if (main === 'pasta') {
    const picked = PASTA.filter((o) => pasta.includes(o.value));
    meal = {
      ko: `${picked.map((o) => o.label).join(' · ')} 파스타`,
      en: `${joinEn(picked.map((o) => o.en))} Pasta`,
    };
  } else {
    const r = find(RICE, rice);
    meal = { ko: r.menu, en: r.en };
  }
  const g = find(GRILL, grill);
  const courses = [
    { no: 'I', title: '식사', ...meal },
    { no: 'II', title: '구이', ko: g.menu, en: g.en },
  ];

  return (
    <section className="card course">
      <header className="course-head">
        <h1>COURSE</h1>
        <p className="course-for">{name}님을 위한 코스</p>
        <p className="course-date">{EVENT_LABEL}</p>
      </header>
      {courses.map((c) => (
        <div key={c.no} className="course-item">
          <p className="course-no">
            {c.no}. {c.title}
          </p>
          <p className="course-dish">{c.ko}</p>
          <p className="course-en">{c.en}</p>
        </div>
      ))}
      <p className="course-end" aria-hidden="true">
        ✦
      </p>
    </section>
  );
}

// ['A','B','C'] → 'A, B & C'
function joinEn(words) {
  return words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} & ${words[words.length - 1]}`;
}

function Question({ no, title, note, children }) {
  return (
    <div className="question">
      <p className="qno">{no}</p>
      <h2>{title}</h2>
      {note && <p className="hint">{note}</p>}
      <div className="choices">{children}</div>
    </div>
  );
}

function Choice({ selected, multi, sub, children, ...props }) {
  return (
    <button
      type="button"
      className={`choice${selected ? ' selected' : ''}`}
      aria-pressed={multi ? selected : undefined}
      {...props}
    >
      {multi && <span className="check" aria-hidden="true">{selected ? '✓' : ''}</span>}
      <span className="choice-label">{children}</span>
      {sub && <span className="choice-sub">{sub}</span>}
    </button>
  );
}
