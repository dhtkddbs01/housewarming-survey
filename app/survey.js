'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EVENT_LABEL, GRILL, MAIN, NAME_MAX, PASTA, RICE } from '@/lib/options';

// name → main → (pasta | rice) → grill → done
const PREV = { main: 'name', pasta: 'main', rice: 'main' };
const QUESTION_NO = { main: 1, pasta: 2, rice: 2, grill: 3 };

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

  const trimmed = name.trim();

  function go(next) {
    setError('');
    setStep(next);
  }

  function back() {
    go(step === 'grill' ? main : PREV[step]);
  }

  function pickMain(value) {
    setMain(value);
    go(value);
  }

  function togglePasta(value) {
    setPasta((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));
  }

  function pickRice(value) {
    setRice(value);
    go('grill');
  }

  async function pickGrill(value) {
    if (saving) return;
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
            if (trimmed) go('main');
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
      <section className="card center">
        <p className="eyebrow">{EVENT_LABEL} 집들이</p>
        <h1>{trimmed}님, 고마워요!</h1>
        <p className="lead">{updated ? '이전 답을 새 답으로 바꿨어요.' : '답이 저장됐어요.'}</p>
        <Link href="/menu" className="primary">
          메뉴판 보기
        </Link>
        <button type="button" className="ghost" onClick={restart}>
          답 바꾸기
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="top">
        <button type="button" className="back" onClick={back} disabled={saving}>
          ← 이전
        </button>
        <span className="progress">질문 {QUESTION_NO[step]}/3</span>
      </div>

      {step === 'main' && (
        <Question title="면이랑 밥 중에 어떤 게 좋으세요?">
          {MAIN.map((o) => (
            <Choice key={o.value} selected={main === o.value} onClick={() => pickMain(o.value)}>
              {o.label}
            </Choice>
          ))}
        </Question>
      )}

      {step === 'pasta' && (
        <Question title="파스타에 무엇을 넣을까요?" note="여러 개 골라도 돼요">
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
        <Question title="어떤 밥이 좋으세요?">
          {RICE.map((o) => (
            <Choice key={o.value} selected={rice === o.value} onClick={() => pickRice(o.value)}>
              {o.label}
            </Choice>
          ))}
        </Question>
      )}

      {step === 'grill' && (
        <Question title="생선구이와 고기구이 중에는요?">
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

function Question({ title, note, children }) {
  return (
    <>
      <h2>{title}</h2>
      {note && <p className="hint">{note}</p>}
      <div className="choices">{children}</div>
    </>
  );
}

function Choice({ selected, multi, children, ...props }) {
  return (
    <button
      type="button"
      className={`choice${selected ? ' selected' : ''}`}
      aria-pressed={multi ? selected : undefined}
      {...props}
    >
      {multi && <span className="check" aria-hidden="true">{selected ? '✓' : ''}</span>}
      {children}
    </button>
  );
}
