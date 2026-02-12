"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Local reaction (no LLM API call) ───
const LOCAL_REACTIONS = [
  "なるほど！",
  "ありがとうございます！",
  "了解です！",
  "OK！次いきますね",
  "承知しました！",
];

function getLocalReaction(currentQ, answer) {
  if (!answer || (Array.isArray(answer) && answer.length === 0)) return null;
  const idx = Math.abs(hashCode(currentQ.id + String(answer))) % LOCAL_REACTIONS.length;
  return LOCAL_REACTIONS[idx];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

// ─── Skip logic (conditional branching) ───
function evaluateSkipIf(skipIf, answers) {
  if (!skipIf) return false;
  const answer = answers[skipIf.questionId];
  if (answer === undefined) return false;
  if (skipIf.equals !== undefined) {
    return Array.isArray(answer) ? answer.includes(skipIf.equals) : answer === skipIf.equals;
  }
  if (skipIf.notEquals !== undefined) {
    return Array.isArray(answer) ? !answer.includes(skipIf.notEquals) : answer !== skipIf.notEquals;
  }
  return false;
}

function shouldSkip(q, allQuestions, answers) {
  // Direct skipIf on the question itself
  if (q.skipIf) return evaluateSkipIf(q.skipIf, answers);
  // Non-section questions inherit skipIf from their parent section
  if (q.type !== "section") {
    const idx = allQuestions.indexOf(q);
    for (let i = idx - 1; i >= 0; i--) {
      if (allQuestions[i].type === "section") {
        return allQuestions[i].skipIf ? evaluateSkipIf(allQuestions[i].skipIf, answers) : false;
      }
    }
  }
  return false;
}

function countEffectiveQuestions(questions, answers) {
  let count = 0;
  let sectionSkipped = false;
  for (const q of questions) {
    if (q.type === "section") {
      sectionSkipped = q.skipIf ? evaluateSkipIf(q.skipIf, answers) : false;
      continue;
    }
    if (sectionSkipped) continue;
    if (q.skipIf && evaluateSkipIf(q.skipIf, answers)) continue;
    count++;
  }
  return count;
}

// ─── Submit helpers ───
async function submitSurvey(config, answers, email) {
  // Google Form submission
  if (config.submitToGoogleForm && config.resolvedUrl) {
    const submitUrl = config.resolvedUrl.replace("/viewform", "/formResponse");
    const params = new URLSearchParams();
    for (const q of config.questions) {
      if (q.type === "section" || !q.entryId) continue;
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") continue;
      if (Array.isArray(a)) {
        a.forEach((v) => params.append(`entry.${q.entryId}`, v));
      } else {
        params.set(`entry.${q.entryId}`, String(a));
      }
    }
    const pageCount = config.questions.filter((q) => q.type === "section").length + 1;
    params.set("pageHistory", Array.from({ length: pageCount }, (_, i) => i).join(","));
    params.set("fvv", "1");
    try {
      await fetch(submitUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    } catch { /* no-cors — ignore */ }
  }
  // Custom API submission
  if (config.submitUrl) {
    // Use form email field as fallback if initialEmail is empty
    const effectiveEmail = email || answers["entry_1243761143"] || undefined;
    try {
      await fetch(config.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: config.sourceUrl || config.title,
          answers,
          submittedAt: new Date().toISOString(),
          email: effectiveEmail,
        }),
      });
    } catch { /* network error — ignore for now */ }
  }
}

// ─── Style constants (Light theme) ───
const s = {
  accent: "#0031D8",
  teal: "var(--aicu-teal, #41C9B4)",
  bg: "#f8f9fa",
  cardBg: "#ffffff",
  text: "#1a1a2e",
  textSub: "#666",
  textDim: "#999",
  border: "rgba(0,0,0,0.08)",
};

// ─── Message components ───
function Typing() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "16px 20px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "rgba(0,0,0,0.2)",
          animation: `lgf-tb 1.2s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Bot({ text, typing, canGoBack, onGoBack }) {
  return (
    <div
      onClick={canGoBack ? onGoBack : undefined}
      style={{
        marginBottom: 14, marginRight: "auto", animation: "lgf-fi 0.3s ease both",
        cursor: canGoBack ? "pointer" : "default",
      }}
    >
      <div style={{
        padding: "15px 20px", borderRadius: "20px 20px 20px 6px",
        fontSize: 16, lineHeight: 1.7,
        background: canGoBack ? "rgba(65,201,180,0.12)" : "rgba(65,201,180,0.06)",
        border: `1px solid ${canGoBack ? "rgba(65,201,180,0.3)" : "rgba(65,201,180,0.15)"}`,
        color: s.text, transition: "all 0.2s",
        whiteSpace: "pre-line",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: s.teal, marginRight: 6 }}>Q</span>
        {typing ? <Typing /> : text}
        {canGoBack && <div style={{ fontSize: 11, color: "rgba(65,201,180,0.6)", marginTop: 4 }}>← タップで戻る</div>}
      </div>
    </div>
  );
}

function Reaction({ text }) {
  return (
    <div style={{ maxWidth: 360, marginBottom: 14, marginRight: "auto", animation: "lgf-fi 0.3s ease both" }}>
      <div style={{
        padding: "10px 16px", borderRadius: "16px 16px 16px 6px",
        background: "rgba(0,49,216,0.08)", border: "1px solid rgba(0,49,216,0.15)",
        fontSize: 15, lineHeight: 1.5, color: s.accent,
      }}>
        {text}
      </div>
    </div>
  );
}

function User({ text }) {
  return (
    <div style={{ maxWidth: 420, marginBottom: 14, marginLeft: "auto", animation: "lgf-fi 0.3s ease both" }}>
      <div style={{
        padding: "15px 20px", borderRadius: "20px 20px 6px 20px",
        background: "rgba(0,49,216,0.1)", border: "1px solid rgba(0,49,216,0.2)",
        color: s.text, fontSize: 16, lineHeight: 1.6,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: s.accent, marginRight: 6 }}>A</span>
        {text}
      </div>
    </div>
  );
}

function renderWithLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: s.accent, textDecoration: "underline" }}>{part}</a>
      : part
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div style={{
      margin: "24px 0 14px", padding: "18px 22px", borderRadius: 18,
      background: "rgba(0,49,216,0.05)", border: "1px solid rgba(0,49,216,0.12)",
      animation: "lgf-fi 0.3s ease both",
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: s.accent, letterSpacing: "0.02em" }}>
        {title}
      </div>
      {desc && <div style={{ fontSize: 14, color: s.textSub, marginTop: 6, lineHeight: 1.6, whiteSpace: "pre-line" }}>{renderWithLinks(desc)}</div>}
    </div>
  );
}

// ─── Input controls ───
const inputBase = {
  flex: 1, padding: "14px 18px", borderRadius: 24,
  background: "#fff", border: "1px solid rgba(0,0,0,0.12)",
  color: s.text, fontSize: 16, fontFamily: "inherit", outline: "none",
  resize: "none", minHeight: 48, lineHeight: 1.5, transition: "all 0.2s",
};
const focusStyle = {
  background: "#fff",
  borderColor: "rgba(0,49,216,0.4)",
  boxShadow: "0 0 0 3px rgba(0,49,216,0.15)",
};

function TextInput({ q, onSubmit, initialValue }) {
  const [v, setV] = useState(initialValue || "");
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const ta = q.type === "textarea";

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (q.required && !v.trim()) return;
    onSubmit(v.trim() || "");
  };

  const handleKeyDown = (e) => {
    if (ta) {
      // Textarea: Ctrl+Enter to submit, Enter adds newline
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
    } else {
      // Text input: Enter to submit
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    }
  };

  const Tag = ta ? "textarea" : "input";
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <Tag
          ref={ref} value={v} rows={ta ? 3 : undefined} type={ta ? undefined : "text"}
          placeholder={q.placeholder || "入力してください..."}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...inputBase, ...(ta && { maxHeight: 140 }), ...(focused ? focusStyle : {}) }}
        />
        <button onClick={submit} disabled={q.required && !v.trim()} style={{
          width: 48, height: 48, borderRadius: 24, border: "none",
          background: s.accent, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: q.required && !v.trim() ? 0.3 : 1, flexShrink: 0, transition: "all 0.15s",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div style={{ fontSize: 12, color: s.textDim, marginTop: 6, paddingLeft: 4 }}>
        {ta ? "Ctrl+Enter\u3067送信" : "Enter\u3067送信"}{!q.required && " / スキップ可"}
      </div>
    </div>
  );
}

// Strip example text like （例：Midjourney, DALL·E...） from pill display
function shortLabel(text) {
  return text.replace(/[（(]例[：:].*?[）)]/g, "").replace(/[（(][^）)]*[）)]\s*$/, "").trim();
}

// Split "主テキスト（補足）" into { main, note }
function splitAnnotation(text) {
  const m = text.match(/^(.+?)\s*[（(](.+?)[）)]$/);
  return m ? { main: m[1].trim(), note: m[2] } : { main: text, note: null };
}

const choiceBtnStyle = (selected) => ({
  padding: "10px 18px", borderRadius: 20,
  background: selected ? "rgba(0,49,216,0.12)" : "#fff",
  border: `1.5px solid ${selected ? "rgba(0,49,216,0.4)" : "rgba(0,0,0,0.12)"}`,
  color: selected ? s.accent : s.text,
  fontSize: 15, fontFamily: "inherit", cursor: "pointer",
  transition: "all 0.15s", textAlign: "left", lineHeight: 1.4,
});

const choiceWrap = { display: "flex", flexWrap: "wrap", gap: 8 };

function SingleChoice({ q, onSubmit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {q.options.map((o) => {
        const { main, note } = splitAnnotation(o);
        return (
          <button key={o} onClick={() => onSubmit(o)} className="lgf-choice" style={{
            ...choiceBtnStyle(false), display: "flex", alignItems: "center", gap: 10, width: "100%",
          }}>
            <span>{main}</span>
            {note && <span style={{ fontSize: 12, color: s.textDim, fontWeight: 400 }}>{note}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Dropdown({ q, onSubmit }) {
  const [v, setV] = useState("");

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <select
        value={v}
        onChange={(e) => setV(e.target.value)}
        style={{
          flex: 1, padding: "12px 14px", borderRadius: 16,
          background: "#fff", border: "1px solid rgba(0,0,0,0.12)",
          color: s.text, fontSize: 16, fontFamily: "inherit",
          appearance: "auto", WebkitAppearance: "menulist",
        }}
      >
        <option value="">選択してください</option>
        {q.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <button
        onClick={() => v && onSubmit(v)}
        disabled={q.required && !v}
        style={{
          width: 48, height: 48, borderRadius: 24, border: "none",
          background: s.accent, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: q.required && !v ? 0.3 : 1, flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  );
}

function MultiChoice({ q, onSubmit }) {
  const [sel, setSel] = useState(new Set());
  const [otherText, setOtherText] = useState("");
  const toggle = (o) => setSel((p) => { const n = new Set(p); n.has(o) ? n.delete(o) : n.add(o); return n; });

  const otherOption = q.options.find((o) => o.startsWith("その他"));
  const otherSelected = otherOption && sel.has(otherOption);

  const doSubmit = () => {
    let result = Array.from(sel);
    if (otherOption && sel.has(otherOption) && otherText.trim()) {
      result = result.map((o) => o === otherOption ? `その他: ${otherText.trim()}` : o);
    }
    onSubmit(result.length > 0 ? result : []);
  };

  // 2-option: auto-submit on tap
  if (q.options.length <= 2) {
    return (
      <div style={choiceWrap}>
        {q.options.map((o) => (
          <button key={o} onClick={() => onSubmit([o])} className="lgf-choice" style={choiceBtnStyle(false)}>{shortLabel(o)}</button>
        ))}
      </div>
    );
  }

  // Large option sets (>15) use searchable UI with optional popularOptions
  if (q.options.length > 15) {
    return <SearchableMulti q={q} onSubmit={onSubmit} />;
  }

  return (
    <div>
      <div style={choiceWrap}>
        {q.options.map((o) => (
          <button key={o} onClick={() => toggle(o)} className="lgf-choice" style={choiceBtnStyle(sel.has(o))}>{shortLabel(o)}</button>
        ))}
      </div>
      {otherSelected && (
        <div style={{ marginTop: 8 }}>
          <input
            type="text" value={otherText} placeholder="具体的に記入してください..."
            onChange={(e) => setOtherText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doSubmit(); } }}
            autoFocus
            style={{ ...inputBase, width: "100%", padding: "10px 14px", borderRadius: 16 }}
          />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button
          onClick={doSubmit}
          disabled={q.required && sel.size === 0}
          className="lgf-submit"
          style={{
            padding: "10px 20px", borderRadius: 20, border: "none",
            background: s.accent, color: "#fff", fontSize: 14,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            opacity: q.required && sel.size === 0 ? 0.3 : 1,
          }}
        >
          {sel.size > 0 ? `${sel.size}件選択して次へ` : "次へ"}
        </button>
      </div>
    </div>
  );
}

function SearchableMulti({ q, onSubmit }) {
  const [sel, setSel] = useState(new Set());
  const [customItems, setCustomItems] = useState([]);
  const [filter, setFilter] = useState("");
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const toggle = (o) => setSel((p) => {
    const n = new Set(p);
    n.has(o) ? n.delete(o) : n.add(o);
    return n;
  });

  const addCustom = (text) => {
    const trimmed = text.trim();
    if (!trimmed || sel.has(trimmed) || q.options.includes(trimmed)) return;
    setCustomItems((p) => [...p, trimmed]);
    setSel((p) => new Set([...p, trimmed]));
  };

  const lower = filter.toLowerCase();
  const filtered = filter
    ? q.options.filter((o) => o.toLowerCase().includes(lower))
    : [];
  const unselectedFiltered = filtered.filter((o) => !sel.has(o));

  // Popular options — always visible, selected items removed
  const popular = q.popularOptions || [];
  const unselectedPopular = popular.filter((o) => !sel.has(o));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (unselectedFiltered.length > 0) {
        // Select the first match
        toggle(unselectedFiltered[0]);
        setFilter("");
        ref.current?.focus();
      } else if (filter.trim()) {
        // No match: register as custom entry
        addCustom(filter);
        setFilter("");
        ref.current?.focus();
      }
    }
  };

  return (
    <div>
      {/* Popular quick-select buttons — always visible */}
      {unselectedPopular.length > 0 && !filter && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: s.textDim, marginBottom: 6 }}>よく選ばれています</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {unselectedPopular.map((o) => (
              <button key={o} onClick={() => toggle(o)} className="lgf-choice" style={{
                ...choiceBtnStyle(false),
                background: "rgba(0,49,216,0.06)",
                borderColor: "rgba(0,49,216,0.25)",
                fontWeight: 600,
              }}>{shortLabel(o)}</button>
            ))}
          </div>
        </div>
      )}

      {/* Selected tags */}
      {sel.size > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {Array.from(sel).map((o) => (
            <button key={o} onClick={() => {
              toggle(o);
              setCustomItems((p) => p.filter((c) => c !== o));
            }} style={{
              padding: "5px 12px", borderRadius: 16,
              background: "rgba(0,49,216,0.1)", border: "1px solid rgba(0,49,216,0.3)",
              color: s.accent, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {shortLabel(o)}
              <span style={{ fontSize: 11, opacity: 0.7 }}>✕</span>
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      <input
        ref={ref}
        value={filter}
        placeholder="サービス名を入力（Enterで追加）..."
        onChange={(e) => setFilter(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          ...inputBase, width: "100%", marginBottom: 8,
          padding: "12px 16px", borderRadius: 20,
        }}
      />

      {/* Matching options */}
      {filter && (
        <div style={{
          maxHeight: 200, overflowY: "auto",
          display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8,
        }}>
          {unselectedFiltered.length > 0 ? (
            unselectedFiltered.map((o) => (
              <button key={o} onClick={() => { toggle(o); setFilter(""); ref.current?.focus(); }} className="lgf-choice" style={choiceBtnStyle(false)}>
                {shortLabel(o)}
              </button>
            ))
          ) : (
            <div style={{ fontSize: 13, color: s.textDim, padding: "8px 4px" }}>
              該当なし — Enterで「{filter}」を追加
            </div>
          )}
        </div>
      )}

      {/* Hint + submit */}
      {!filter && sel.size === 0 && unselectedPopular.length === 0 && (
        <div style={{ fontSize: 12, color: s.textDim, marginBottom: 8, paddingLeft: 4 }}>
          {q.options.length}件の候補から検索できます
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onSubmit(sel.size > 0 ? Array.from(sel) : [])}
          disabled={q.required && sel.size === 0}
          className="lgf-submit"
          style={{
            padding: "10px 20px", borderRadius: 20, border: "none",
            background: s.accent, color: "#fff", fontSize: 14,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            opacity: q.required && sel.size === 0 ? 0.3 : 1,
          }}
        >
          {sel.size > 0 ? `${sel.size}件選択して次へ` : "次へ"}
        </button>
      </div>
    </div>
  );
}

// ─── localStorage persistence (7-day TTL) ───
const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function loadProgress(surveyId) {
  try {
    const raw = localStorage.getItem(`lgf_${surveyId}`);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (Date.now() - saved.ts > STORAGE_TTL_MS) {
      localStorage.removeItem(`lgf_${surveyId}`);
      return null;
    }
    return saved;
  } catch { return null; }
}

function saveProgress(surveyId, step, answers) {
  try {
    localStorage.setItem(`lgf_${surveyId}`, JSON.stringify({ step, answers, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

function clearProgress(surveyId) {
  try { localStorage.removeItem(`lgf_${surveyId}`); } catch { /* ignore */ }
}

// ─── Main component ───
export default function LiquidGlassForm({ formConfig, onComplete = null, initialEmail = "", surveyLabel = "" }) {
  const surveyId = formConfig.sourceUrl || formConfig.title;
  const saved = useRef(loadProgress(surveyId));

  // If initialEmail provided, pre-fill the reward email question
  const initialAnswers = (() => {
    const base = saved.current?.answers || {};
    if (initialEmail && formConfig.questions) {
      const emailQ = formConfig.questions.find(q => q.id === "entry_1243761143");
      if (emailQ && !base[emailQ.id]) {
        base[emailQ.id] = initialEmail;
      }
    }
    return base;
  })();

  const [msgs, setMsgs] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showInput, setShowInput] = useState(false);
  const [phase, setPhase] = useState("chat"); // chat | complete
  const chatRef = useRef(null);
  const ansRef = useRef(initialAnswers);

  const questions = formConfig.questions;
  const effectiveTotal = countEffectiveQuestions(questions, answers);
  const totalQ = effectiveTotal || questions.filter((q) => q.type !== "section").length;
  const answeredCount = Object.keys(ansRef.current).length;

  const scroll = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  }, []);

  const addMsg = useCallback(async (type, text, delay = 500, meta) => {
    const typingId = Date.now();
    if (type === "bot" || type === "reaction") {
      setMsgs((p) => [...p, { type: "typing", id: typingId }]);
      scroll();
      await new Promise((r) => setTimeout(r, type === "reaction" ? 350 : delay));
    }
    setMsgs((p) => [
      ...p.filter((m) => m.id !== typingId),
      { type, text, id: Date.now() + Math.random(), ...meta },
    ]);
    scroll();
  }, [scroll]);

  // Init — restore progress or start fresh
  useEffect(() => {
    (async () => {
      const restored = saved.current;

      // GTAG: survey start
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "survey_start", { survey_id: surveyLabel || surveyId });
      }

      if (restored && Object.keys(restored.answers).length > 0) {
        let i = 0;
        while (i < questions.length && i < restored.step) {
          const q = questions[i];
          // Skip questions that should be skipped based on answers so far
          if (shouldSkip(q, questions, restored.answers)) { i++; continue; }
          if (q.type === "section") {
            await addMsg("section", q, 100);
          } else {
            await addMsg("bot", q.question, 100, { qStep: i });
            const a = restored.answers[q.id];
            if (a !== undefined) {
              const display = Array.isArray(a)
                ? (a.length > 0 ? a.map(v => shortLabel(v)).join(", ") : "(スキップ)")
                : (a ? shortLabel(a) : "(スキップ)");
              await addMsg("user", display, 0);
            }
          }
          i++;
        }
        // Advance past skipped sections/questions to find the next active question
        while (i < questions.length) {
          if (shouldSkip(questions[i], questions, restored.answers)) { i++; continue; }
          if (questions[i].type === "section") {
            await addMsg("section", questions[i], 100);
            i++;
            continue;
          }
          break;
        }
        if (i < questions.length) {
          setStep(i);
          await addMsg("bot", questions[i].question, 300, { qStep: i });
          setShowInput(true);
        }
        setAnswers(restored.answers);
      } else {
        let i = 0;
        while (i < questions.length) {
          if (shouldSkip(questions[i], questions, {})) { i++; continue; }
          if (questions[i].type === "section") {
            await addMsg("section", questions[i], 300);
            i++;
            continue;
          }
          break;
        }
        if (i < questions.length) {
          setStep(i);
          await addMsg("bot", questions[i].question, 500, { qStep: i });
          setShowInput(true);
        }
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(async (answer) => {
    setShowInput(false);
    const q = questions[step];
    const display = Array.isArray(answer)
      ? (answer.length > 0 ? answer.map(a => shortLabel(a)).join(", ") : "(スキップ)")
      : (answer ? shortLabel(answer) : "(スキップ)");

    await addMsg("user", display, 0);

    const newAns = { ...ansRef.current, [q.id]: answer };
    ansRef.current = newAns;
    setAnswers(newAns);

    // GTAG: survey progress
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "survey_progress", {
        survey_id: surveyLabel || surveyId,
        question_id: q.id,
        question_index: step,
        total_questions: totalQ,
      });
    }

    let next = step + 1;

    saveProgress(surveyId, next, newAns);

    if (q.id !== "entry_1127213393" && answer) {
      const reaction = getLocalReaction(q, answer);
      if (reaction) await addMsg("reaction", reaction);
    }

    // Advance past sections and skipped questions
    while (next < questions.length) {
      const nextQ = questions[next];
      if (shouldSkip(nextQ, questions, newAns)) { next++; continue; }
      if (nextQ.type === "section") {
        await addMsg("section", nextQ, 200);
        next++;
        continue;
      }
      break;
    }

    if (next >= questions.length) {
      await addMsg("bot", "回答を送信しています...", 400);
      await submitSurvey(formConfig, newAns, initialEmail);
      clearProgress(surveyId);
      // GTAG: survey complete
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "survey_complete", { survey_id: surveyLabel || surveyId });
      }
      await new Promise((r) => setTimeout(r, 600));
      setPhase("complete");
      if (onComplete) onComplete(newAns);
    } else {
      setStep(next);
      await addMsg("bot", questions[next].question, 500, { qStep: next });
      setShowInput(true);
    }
  }, [step, questions, addMsg, formConfig, onComplete, surveyId, initialEmail]);

  const progress = Math.round((answeredCount / totalQ) * 100);
  const currentQ = step < questions.length ? questions[step] : null;

  const prevQStep = (() => {
    for (let i = step - 1; i >= 0; i--) {
      if (questions[i].type !== "section") return i;
    }
    return -1;
  })();

  const goBack = useCallback(() => {
    if (prevQStep < 0) return;
    setShowInput(false);

    setMsgs((prev) => {
      const idx = prev.findIndex((m) => m.qStep === prevQStep);
      const retained = idx >= 0 ? prev.slice(0, idx) : prev;
      return [...retained, {
        type: "bot", text: questions[prevQStep].question,
        id: Date.now() + Math.random(), qStep: prevQStep,
      }];
    });

    // Keep old answer in ansRef so TextInput can use it as initialValue
    // It will be overwritten when user re-answers
    setStep(prevQStep);
    saveProgress(surveyId, prevQStep, ansRef.current);
    setShowInput(true);
    scroll();
  }, [prevQStep, questions, surveyId, scroll]);

  const isTextType = (q) => q.type === "text" || q.type === "textarea";

  const getInitialValue = (q) => {
    if (initialEmail && q.id === "entry_1243761143") return initialEmail;
    return ansRef.current[q.id] || "";
  };

  const renderInput = (q) => {
    switch (q.type) {
      case "text": case "textarea": return <TextInput key={step} q={q} onSubmit={handleAnswer} initialValue={getInitialValue(q)} />;
      case "single_choice": return <SingleChoice key={step} q={q} onSubmit={handleAnswer} />;
      case "multi_choice": return <MultiChoice key={step} q={q} onSubmit={handleAnswer} />;
      case "dropdown": return <Dropdown key={step} q={q} onSubmit={handleAnswer} />;
      default: return <TextInput key={step} q={q} onSubmit={handleAnswer} initialValue={getInitialValue(q)} />;
    }
  };

  const reward = formConfig.reward || "10,000 AICUポイント";

  return (
    <div style={{
      height: "100dvh", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif",
      background: s.bg, color: s.text, display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: `1px solid ${s.border}`, zIndex: 2,
        background: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
            color: s.teal,
          }}>
            AICU
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: s.text }}>
            Research
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {surveyLabel && (
            <span style={{ fontSize: 12, fontWeight: 600, color: s.textDim, letterSpacing: "0.03em" }}>
              {surveyLabel}
            </span>
          )}
          <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, background: s.accent,
              width: `${phase === "complete" ? 100 : progress}%`,
              transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <span style={{ fontSize: 12, color: s.textDim, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {phase === "complete" ? "完了" : (() => {
              const est = formConfig.estimatedMinutes || 5;
              const remaining = Math.max(1, Math.ceil(est * (1 - progress / 100)));
              return `残り約${remaining}分`;
            })()}
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{
        flex: 1, overflowY: "auto",
        padding: phase === "chat" && showInput && currentQ && isTextType(currentQ)
          ? "20px 16px 180px" : "20px 16px 100px",
        scrollBehavior: "smooth", zIndex: 1,
      }}>
        {phase === "complete" ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", textAlign: "center", padding: "48px 20px",
            animation: "lgf-fi 0.5s ease both", minHeight: "60vh",
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: 20,
              background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, marginBottom: 20, color: "#34d399",
            }}>&#10003;</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 10, color: s.text }}>
              ご回答ありがとうございました
            </h2>
            <p style={{ fontSize: 15, color: s.textSub, lineHeight: 1.8, maxWidth: 340 }}>
              謝礼 {reward} は{" "}
              <a href="https://p.aicu.jp" target="_blank" rel="noopener" style={{ color: s.accent, textDecoration: "underline", fontWeight: 600 }}>p.aicu.jp</a>
              {" "}で確認できます
            </p>
            <p style={{ fontSize: 14, color: s.textDim, lineHeight: 1.7, maxWidth: 340, marginTop: 10 }}>
              AICUマガジンやAmazonギフト券など商品交換は
              <a href="https://www.aicu.blog/category/all-products" target="_blank" rel="noopener" style={{ color: s.accent, textDecoration: "underline" }}>こちら</a>
            </p>
            <div style={{ marginTop: 20, fontSize: 13, color: s.textDim, lineHeight: 1.6 }}>
              <a href="https://corp.aicu.ai/ja/privacy" target="_blank" rel="noopener" style={{ color: s.textDim, textDecoration: "underline" }}>プライバシーポリシー</a>
              {" / "}
              <a href="https://www.aicu.blog/terms/plan-free" target="_blank" rel="noopener" style={{ color: s.textDim, textDecoration: "underline" }}>利用規約</a>
            </div>
            <div style={{
              marginTop: 24, padding: "12px 22px", borderRadius: 14,
              background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 13, color: s.textDim,
            }}>
              Powered by{" "}
              <span style={{ fontFamily: "'Outfit', sans-serif", color: s.teal, fontWeight: 700 }}>AICU</span>
              {" "}Research
            </div>
          </div>
        ) : (<>
          {msgs.map((m) => {
            if (m.type === "typing") return <Bot key={m.id} text="" typing />;
            if (m.type === "bot") {
              const isPrev = showInput && m.qStep !== undefined && m.qStep === prevQStep;
              return <Bot key={m.id} text={m.text} canGoBack={isPrev} onGoBack={isPrev ? goBack : undefined} />;
            }
            if (m.type === "reaction") return <Reaction key={m.id} text={m.text} />;
            if (m.type === "user") return <User key={m.id} text={m.text} />;
            if (m.type === "section") return <SectionHeader key={m.id} title={m.text.title} desc={m.text.description} />;
            return null;
          })}
          {/* Inline choices — directly below the question bubble */}
          {showInput && currentQ && !isTextType(currentQ) && (
            <div style={{
              marginBottom: 14, marginTop: -6,
              padding: "12px 16px 16px", borderRadius: "4px 4px 20px 20px",
              background: currentQ.type === "multi_choice" ? "rgba(0,49,216,0.025)" : "rgba(0,0,0,0.015)",
              border: `1px solid ${currentQ.type === "multi_choice" ? "rgba(0,49,216,0.08)" : "rgba(0,0,0,0.04)"}`,
              animation: "lgf-fi 0.3s ease both",
            }}>
              {currentQ.type === "multi_choice" && currentQ.options?.length > 2 && (
                <div style={{ fontSize: 11, color: s.textDim, marginBottom: 8 }}>
                  複数選択可
                </div>
              )}
              {renderInput(currentQ)}
            </div>
          )}
        </>)}
      </div>

      {/* Fixed bottom input — only for text/textarea */}
      {phase === "chat" && showInput && currentQ && isTextType(currentQ) && (
        <div style={{
          flexShrink: 0, padding: "12px 16px 16px",
          borderTop: `1px solid ${s.border}`,
          background: "rgba(248,249,250,0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 2,
          position: "fixed", bottom: 0, left: 0, right: 0,
        }}>
          {renderInput(currentQ)}
        </div>
      )}

      <style>{`
        @keyframes lgf-fi { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lgf-tb { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        .lgf-choice {
          transition: all 0.15s ease !important;
        }
        .lgf-choice:hover {
          transform: scale(1.03);
          border-color: rgba(0,49,216,0.5) !important;
          box-shadow: 0 2px 12px rgba(0,49,216,0.12);
          background: rgba(0,49,216,0.04) !important;
        }
        .lgf-choice:active {
          transform: scale(0.97);
        }
        .lgf-submit:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(0,49,216,0.25);
        }
      `}</style>
    </div>
  );
}
