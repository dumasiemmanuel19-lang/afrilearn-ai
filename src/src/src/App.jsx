import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  MessageCircle,
  Send,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  GraduationCap,
  Sparkles,
  RotateCcw,
  ChevronRight,
  Globe2,
} from "lucide-react";
import AdSlot from "./components/AdSlot.jsx";
import GoProButton from "./components/GoProButton.jsx";
import { isProUser } from "./lib/pro.js";

const LEVEL_PRESETS = [
  "WASSCE / BECE",
  "SAT / ACT",
  "A-Levels",
  "IB",
  "GCSE",
  "University",
];

const BATCH_SIZE = 10;
const QUESTION_COUNTS = [5, 10, 25, 50, 100];

// Calls our own backend (netlify/functions/claude.js), which holds the
// real Anthropic API key server-side. Never call api.anthropic.com
// directly from the browser with a real key.
async function callClaude(messages, system, maxTokens = 1024) {
  const response = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system, max_tokens: maxTokens }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `Request failed (${response.status})`);
  }
  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text;
}

function StampBadge({ children, tone = "ink" }) {
  const tones = {
    ink: "border-[#1F2937] text-[#1F2937]",
    red: "border-[#A7332B] text-[#A7332B]",
    gold: "border-[#8A6425] text-[#8A6425]",
  };
  return (
    <span
      className={`al-mono inline-block border-2 ${tones[tone]} rounded-sm px-2 py-0.5 text-xs tracking-widest uppercase -rotate-2 select-none`}
      style={{ opacity: 0.85 }}
    >
      {children}
    </span>
  );
}

function RuledCard({ children, className = "" }) {
  return (
    <div
      className={`relative bg-[#FBF8F1] border border-[#D8C39A] rounded-sm shadow-sm ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, #E4DCC5 28px)",
        backgroundPosition: "0 8px",
      }}
    >
      <div className="absolute top-0 bottom-0 left-8 w-px bg-[#C05A50] opacity-40" />
      {children}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("quiz");
  const [level, setLevel] = useState("University");
  const [isPro, setIsPro] = useState(() => isProUser());

  return (
    <div className="min-h-screen w-full bg-[#E8DCC0] al-body text-[#1F2937]">
      {/* Header */}
      <header className="border-b-4 border-[#1F2937] bg-[#E8DCC0] px-5 py-6 sm:px-10">
        <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-6 h-6 text-[#A7332B]" strokeWidth={2} />
              <h1 className="al-display text-2xl sm:text-3xl font-semibold tracking-tight">
                AfriLearn AI
              </h1>
            </div>
            <p className="al-mono text-[11px] sm:text-xs tracking-wide text-[#5C5546] uppercase">
              Exam prep for students, anywhere
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StampBadge tone="red">
              <span className="flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> Worldwide
              </span>
            </StampBadge>
            <GoProButton isPro={isPro} onUpgraded={() => setIsPro(true)} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-5">
          <label className="al-mono text-[11px] uppercase tracking-wide text-[#5C5546]">
            Exam or level
          </label>
          <input
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g. WASSCE, A-Levels, University Biology…"
            className="w-full mt-1.5 bg-transparent border-b-2 border-[#1F2937] pb-1.5 outline-none al-body text-sm placeholder:text-[#A39B84]"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {LEVEL_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setLevel(p)}
                className={`al-mono text-[11px] px-2.5 py-1 rounded-sm border transition-colors ${
                  level === p
                    ? "bg-[#1F2937] text-[#F7F4EC] border-[#1F2937]"
                    : "bg-transparent text-[#1F2937] border-[#8A7F63] hover:border-[#1F2937]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-10 mt-6 flex gap-1">
        <TabButton
          active={tab === "quiz"}
          onClick={() => setTab("quiz")}
          icon={<BookOpen className="w-4 h-4" />}
          label="Quiz Generator"
        />
        <TabButton
          active={tab === "chat"}
          onClick={() => setTab("chat")}
          icon={<MessageCircle className="w-4 h-4" />}
          label="Chat Tutor"
        />
      </div>

      <main className="max-w-3xl mx-auto px-5 sm:px-10 pb-16 pt-4">
        {tab === "quiz" ? (
          <QuizGenerator level={level} isPro={isPro} />
        ) : (
          <ChatTutor level={level} isPro={isPro} />
        )}
      </main>

      <footer className="border-t border-[#C9BE9E] px-5 py-6 sm:px-10">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <p className="al-mono text-[10px] uppercase tracking-wide text-[#8A7F63]">
            © {new Date().getFullYear()} AfriLearn AI
          </p>
          <div className="flex gap-4">
            <a
              href="/about.html"
              className="al-mono text-[11px] uppercase tracking-wide text-[#5C5546] hover:text-[#1F2937] underline"
            >
              About
            </a>
            <a
              href="/privacy.html"
              className="al-mono text-[11px] uppercase tracking-wide text-[#5C5546] hover:text-[#1F2937] underline"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`al-mono flex items-center gap-2 text-xs uppercase tracking-wide px-4 py-2.5 border-t border-l border-r rounded-t-sm -mb-px ${
        active
          ? "bg-[#FBF8F1] border-[#1F2937] text-[#1F2937]"
          : "bg-[#DCCFA9] border-transparent text-[#5C5546] hover:text-[#1F2937]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ---------------- Quiz Generator ---------------- */

function QuizGenerator({ level, isPro }) {
  const [topic, setTopic] = useState("");
  const [numQ, setNumQ] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    const levelLabel = level.trim() || "general studies";
    const batches = Math.ceil(numQ / BATCH_SIZE);
    let collected = [];

    try {
      for (let b = 0; b < batches; b++) {
        const remaining = numQ - collected.length;
        const thisBatch = Math.min(BATCH_SIZE, remaining);
        if (thisBatch <= 0) break;

        const recentTitles = collected
          .slice(-15)
          .map((q) => q.question)
          .join(" | ");

        const system = `You write exam practice questions for students preparing for ${levelLabel}. Respond with ONLY a JSON array, no markdown fences, no preamble. Each element: {"question": string, "options": [4 strings], "correctIndex": 0-3 integer, "explanation": short string under 20 words}. Exactly ${thisBatch} questions on the given topic, appropriate difficulty for ${levelLabel}.${
          recentTitles
            ? ` Do not repeat these already-asked questions: ${recentTitles}`
            : ""
        }`;

        const text = await callClaude(
          [{ role: "user", content: `Topic: ${topic}` }],
          system,
          1800
        );
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        collected = collected.concat(parsed);
        setQuestions([...collected]);
        setProgress({ done: collected.length, total: numQ });
      }
    } catch (e) {
      if (collected.length === 0) {
        setError(
          "Couldn't generate the quiz. Try a more specific to
