import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import LiquidChromeText from "./LiquidChromeText";

const easeCurve = [0.16, 1, 0.3, 1];

const EVALUATION_CRITERIA = [
  "Answer Correctness",
  "Relevance",
  "Query Alignment",
  "Semantic Similarity",
  "Tone",
  "Tool Calling",
];

const JUDGES = [
  {
    id: "gemini",
    code: "GEMINI — INDEPENDENT JUDGE 01",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    streamTone: "violet",
    accentColor: "#E344C5",
    secondaryColor: "#702CFF",
    glowBg:
      "radial-gradient(ellipse 85% 75% at 22% 28%, rgba(112, 44, 255, 0.22) 0%, rgba(227, 68, 197, 0.12) 48%, transparent 78%)",
    borderIdle: "rgba(112, 44, 255, 0.28)",
    borderHover: "rgba(227, 68, 197, 0.58)",
    items: [
      {
        label: "Independent evaluation",
        detail:
          "Assesses the submission in complete isolation without access to other judges.",
      },
      {
        label: "Response analysis",
        detail:
          "Examines factual accuracy, contextual focus, and clarity against available evidence.",
      },
      {
        label: "Reasoning",
        detail:
          "Outputs structured, evidence-grounded justification explaining every score.",
      },
    ],
  },
  {
    id: "groq",
    code: "GROQ — INDEPENDENT JUDGE 02",
    provider: "Groq",
    model: "openai/gpt-oss-20b",
    streamTone: "cyan",
    accentColor: "#54D9FF",
    secondaryColor: "#FF815D",
    glowBg:
      "radial-gradient(ellipse 85% 75% at 78% 28%, rgba(84, 217, 255, 0.18) 0%, rgba(255, 129, 93, 0.11) 48%, transparent 78%)",
    borderIdle: "rgba(84, 217, 255, 0.26)",
    borderHover: "rgba(84, 217, 255, 0.56)",
    items: [
      {
        label: "Independent evaluation",
        detail:
          "Evaluates the identical prompt and response concurrently on a distinct model family.",
      },
      {
        label: "Response analysis",
        detail:
          "Audits query adherence, semantic fidelity, and tool execution traces when supplied.",
      },
      {
        label: "Reasoning",
        detail:
          "Produces an independent JSON rationale for cross-model comparison.",
      },
    ],
  },
];

function matchJudgeResult(judgeId, results) {
  if (!Array.isArray(results)) return null;
  const target = judgeId.toLowerCase();
  return (
    results.find((r) => {
      const name = String(r?.model_name || "").toLowerCase();
      return name.startsWith(`${target}:`) || name.includes(target);
    }) || null
  );
}

export default function IntelligenceEngine({
  status = "idle",
  evaluation = null,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredJudge, setHoveredJudge] = useState(null);
  const isEvaluating = status === "evaluating";
  const liveResults = evaluation?.results ?? null;

  return (
    <section
      id="engine"
      aria-labelledby="engine-heading"
      className="relative w-full overflow-hidden bg-[#080910] pb-28 pt-20 sm:pb-36 sm:pt-28"
    >
      {/* Seamless Atmospheric Continuation from Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 68% 36% at 50% 0%, rgba(50, 18, 111, 0.28) 0%, transparent 72%),
            radial-gradient(ellipse 54% 48% at 18% 58%, rgba(112, 44, 255, 0.14) 0%, transparent 72%),
            radial-gradient(ellipse 54% 48% at 82% 60%, rgba(84, 217, 255, 0.12) 0%, transparent 72%),
            radial-gradient(ellipse 42% 32% at 78% 82%, rgba(255, 129, 93, 0.08) 0%, transparent 72%)
          `,
        }}
      />

      {/* FULL-WIDTH FLOWING DUAL-STREAM LIQUID SVG ENVIRONMENT (Desktop & Tablet) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[210px] bottom-[90px] hidden lg:block"
      >
        <svg
          viewBox="0 0 1440 820"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            {/* Shared Entry Stream Gradient */}
            <linearGradient id="sharedOriginGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F1F0" stopOpacity="0" />
              <stop offset="45%" stopColor="#F5F1F0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#702CFF" stopOpacity="0.75" />
            </linearGradient>

            {/* Left Stream: Deep Violet -> Electric Purple -> Magenta */}
            <linearGradient id="geminiStreamGrad" x1="50%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F1F0" stopOpacity="0.68" />
              <stop offset="28%" stopColor="#702CFF" stopOpacity="0.88" />
              <stop offset="68%" stopColor="#E344C5" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#32126F" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="geminiRibbonFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#32126F" stopOpacity="0.32" />
              <stop offset="52%" stopColor="#702CFF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#E344C5" stopOpacity="0.26" />
            </linearGradient>

            {/* Right Stream: Electric Cyan -> Steel Blue -> Subtle Peach */}
            <linearGradient id="groqStreamGrad" x1="50%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F1F0" stopOpacity="0.68" />
              <stop offset="30%" stopColor="#54D9FF" stopOpacity="0.88" />
              <stop offset="70%" stopColor="#3B5780" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#FF815D" stopOpacity="0.76" />
            </linearGradient>
            <linearGradient id="groqRibbonFill" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#54D9FF" stopOpacity="0.24" />
              <stop offset="55%" stopColor="#3B5780" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FF815D" stopOpacity="0.18" />
            </linearGradient>

            <filter id="streamGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* Shared Trunk from Hero Submission Origin */}
          <path
            d="M 720 0 C 720 65, 720 105, 720 148"
            fill="none"
            stroke="url(#sharedOriginGrad)"
            strokeWidth="3"
          />
          <path
            d="M 720 0 C 720 65, 720 105, 720 148"
            fill="none"
            stroke="#F5F1F0"
            strokeOpacity="0.25"
            strokeWidth="16"
            filter="url(#streamGlow)"
          />

          {/* STREAM 01 (LEFT — GEMINI: Violet, Purple, Magenta) */}
          <g
            style={{
              opacity: hoveredJudge === "groq" ? 0.52 : 1,
              transition: "opacity 240ms ease",
            }}
          >
            {/* Broad Liquid Membrane Glow */}
            <path
              d="M 720 146 C 635 190, 290 198, 224 358 C 168 494, 248 648, 694 744"
              fill="none"
              stroke="url(#geminiRibbonFill)"
              strokeWidth="62"
              strokeLinecap="round"
              filter="url(#streamGlow)"
            />
            {/* Secondary Silk Fold Ribbon */}
            <path
              d="M 720 146 C 605 212, 342 232, 272 372 C 212 492, 316 630, 698 744"
              fill="none"
              stroke="url(#geminiStreamGrad)"
              strokeOpacity="0.28"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Primary Crisp Stream Spine */}
            <path
              d="M 720 146 C 635 190, 290 198, 224 358 C 168 494, 248 648, 694 744"
              fill="none"
              stroke="url(#geminiStreamGrad)"
              strokeWidth={hoveredJudge === "gemini" || isEvaluating ? "2.6" : "1.8"}
              strokeLinecap="round"
            />
            {/* Independent Flowing Energy Pulse (11s cadence) */}
            {!shouldReduceMotion ? (
              <motion.path
                d="M 720 146 C 635 190, 290 198, 224 358 C 168 494, 248 648, 694 744"
                fill="none"
                stroke="#E344C5"
                strokeWidth={isEvaluating ? "3.2" : "2.6"}
                strokeLinecap="round"
                strokeDasharray="110 920"
                animate={{ strokeDashoffset: [1030, 0] }}
                transition={{
                  duration: isEvaluating ? 4.2 : 10.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ) : null}
          </g>

          {/* STREAM 02 (RIGHT — GROQ: Electric Cyan, Steel Blue, Warm Peach) */}
          <g
            style={{
              opacity: hoveredJudge === "gemini" ? 0.52 : 1,
              transition: "opacity 240ms ease",
            }}
          >
            {/* Broad Liquid Membrane Glow */}
            <path
              d="M 720 146 C 805 190, 1150 218, 1214 384 C 1268 524, 1178 656, 746 744"
              fill="none"
              stroke="url(#groqRibbonFill)"
              strokeWidth="62"
              strokeLinecap="round"
              filter="url(#streamGlow)"
            />
            {/* Secondary Silk Fold Ribbon */}
            <path
              d="M 720 146 C 835 212, 1094 252, 1164 398 C 1220 516, 1112 636, 742 744"
              fill="none"
              stroke="url(#groqStreamGrad)"
              strokeOpacity="0.28"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Primary Crisp Stream Spine */}
            <path
              d="M 720 146 C 805 190, 1150 218, 1214 384 C 1268 524, 1178 656, 746 744"
              fill="none"
              stroke="url(#groqStreamGrad)"
              strokeWidth={hoveredJudge === "groq" || isEvaluating ? "2.6" : "1.8"}
              strokeLinecap="round"
            />
            {/* Independent Flowing Energy Pulse (8.2s distinct cadence) */}
            {!shouldReduceMotion ? (
              <motion.path
                d="M 720 146 C 805 190, 1150 218, 1214 384 C 1268 524, 1178 656, 746 744"
                fill="none"
                stroke="#54D9FF"
                strokeWidth={isEvaluating ? "3.2" : "2.6"}
                strokeLinecap="round"
                strokeDasharray="96 940"
                animate={{ strokeDashoffset: [1036, 0] }}
                transition={{
                  duration: isEvaluating ? 3.5 : 8.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ) : null}
          </g>

          {/* Bifurcation Node Anchor */}
          <circle cx="720" cy="146" r="5" fill="#F5F1F0" fillOpacity="0.92" />
          <circle
            cx="720"
            cy="146"
            r="14"
            fill="none"
            stroke="#F5F1F0"
            strokeOpacity="0.28"
            strokeWidth="1"
          />

          {/* Convergence Node Anchor */}
          <circle cx="720" cy="744" r="5" fill="#F5F1F0" fillOpacity="0.9" />
          <circle
            cx="720"
            cy="744"
            r="16"
            fill="none"
            stroke="#54D9FF"
            strokeOpacity="0.32"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* SECTION CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
        {/* Editorial Header */}
        <motion.header
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: easeCurve }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-[#702CFF] to-[#54D9FF]"
            />
            <span className="font-mono text-xs font-medium tracking-[0.22em] text-[#A6ADBF]">
              THE INTELLIGENCE ENGINE
            </span>
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-[#54D9FF] to-[#FF815D]"
            />
          </div>

          <h2
            id="engine-heading"
            className="font-heading text-[clamp(2.25rem,4.4vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.03em] text-[#F5F1F0] [text-wrap:balance]"
          >
            Two minds.{" "}
            <LiquidChromeText variant="subtle" className="tracking-[-0.02em]">
              Independent judgment.
            </LiquidChromeText>
          </h2>

          <p className="mx-auto mt-6 max-w-[54ch] font-body text-base leading-[1.7] text-[#F5F1F0]/75 sm:text-lg">
            One response. Multiple perspectives. A deeper understanding of AI
            quality.
          </p>
        </motion.header>

        {/* Shared Submission Origin Anchor */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeCurve }}
          className="relative mx-auto mt-14 max-w-md text-center lg:mt-16"
        >
          <div className="inline-flex flex-col items-center px-6 py-4">
            <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-[#F5F1F0]/55">
              {isEvaluating
                ? "LIVE STREAM · DISPATCHED TO PARALLEL JUDGES"
                : liveResults
                  ? `EVALUATED SUBMISSION · ${liveResults.length} MODEL${liveResults.length === 1 ? "" : "S"} RETURNED`
                  : "SHARED INPUT STREAM"}
            </span>
            <p className="mt-1.5 font-heading text-lg font-semibold tracking-[-0.01em] text-[#F5F1F0]">
              Single AI-Generated Submission
            </p>
            <p className="mt-1 font-body text-xs text-[#A6ADBF]">
              Response text · Prompt context · Evaluation rubric
            </p>
          </div>

          {/* Mobile/Tablet Flowing Dual-Stream Bifurcation */}
          <div
            aria-hidden="true"
            className="mx-auto mt-1 h-16 w-64 lg:hidden"
          >
            <svg viewBox="0 0 260 64" className="h-full w-full overflow-visible">
              <path
                d="M 130 0 C 130 28, 56 26, 46 64"
                fill="none"
                stroke="#E344C5"
                strokeOpacity="0.65"
                strokeWidth="1.75"
              />
              <path
                d="M 130 0 C 130 28, 204 26, 214 64"
                fill="none"
                stroke="#54D9FF"
                strokeOpacity="0.65"
                strokeWidth="1.75"
              />
              {!shouldReduceMotion ? (
                <>
                  <motion.path
                    d="M 130 0 C 130 28, 56 26, 46 64"
                    fill="none"
                    stroke="#702CFF"
                    strokeWidth="2.4"
                    strokeDasharray="24 90"
                    animate={{ strokeDashoffset: [114, 0] }}
                    transition={{
                      duration: isEvaluating ? 1.9 : 4.2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.path
                    d="M 130 0 C 130 28, 204 26, 214 64"
                    fill="none"
                    stroke="#FF815D"
                    strokeWidth="2.4"
                    strokeDasharray="24 90"
                    animate={{ strokeDashoffset: [114, 0] }}
                    transition={{
                      duration: isEvaluating ? 1.6 : 3.4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </>
              ) : null}
              <circle cx="130" cy="4" r="3.5" fill="#F5F1F0" />
            </svg>
          </div>
        </motion.div>

        {/* Dual Stream Independent Judge Stations */}
        <div className="mt-8 grid gap-8 lg:mt-28 lg:grid-cols-2 lg:gap-16">
          {JUDGES.map((judge, index) => {
            const isHovered = hoveredJudge === judge.id;
            const isDimmed = hoveredJudge !== null && !isHovered;
            const liveResult = matchJudgeResult(judge.id, liveResults);
            const hasValidScore =
              liveResult &&
              liveResult.score !== null &&
              liveResult.score !== undefined &&
              !Number.isNaN(Number(liveResult.score));

            const streamStateLabel = isEvaluating
              ? "Evaluating live…"
              : liveResults
                ? liveResult
                  ? hasValidScore
                    ? `Score ${Number(liveResult.score).toFixed(1)} / 10`
                    : "Returned (score N/A)"
                  : "Not returned"
                : "Parallel Stream";

            return (
              <motion.article
                key={judge.id}
                aria-label={judge.code}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: index === 0 ? -24 : 24,
                        y: 16,
                      }
                }
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.14,
                  ease: easeCurve,
                }}
                onMouseEnter={() => setHoveredJudge(judge.id)}
                onMouseLeave={() => setHoveredJudge(null)}
                onFocus={() => setHoveredJudge(judge.id)}
                onBlur={() => setHoveredJudge(null)}
                className={`group relative overflow-hidden rounded-3xl p-7 backdrop-blur-xl transition-all duration-200 sm:p-9 ${
                  index === 1 ? "lg:mt-10" : "lg:mb-10"
                }`}
                style={{
                  background:
                    "linear-gradient(155deg, rgba(16, 17, 32, 0.78) 0%, rgba(8, 9, 16, 0.88) 100%)",
                  border: `1px solid ${
                    isHovered || isEvaluating ? judge.borderHover : judge.borderIdle
                  }`,
                  opacity: isDimmed ? 0.72 : 1,
                  transform:
                    isHovered && !shouldReduceMotion
                      ? "translateY(-4px)"
                      : "translateY(0px)",
                }}
              >
                {/* Internal Liquid-Glass Reflection Wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: judge.glowBg,
                    opacity: isHovered || isEvaluating ? 1 : 0.72,
                  }}
                />

                {/* Top Stream Rim Line */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${judge.secondaryColor} 35%, ${judge.accentColor} 70%, transparent 100%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Judge Stream Eyebrow */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="font-mono text-xs font-medium tracking-[0.18em]"
                      style={{ color: judge.accentColor }}
                    >
                      {judge.code}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[#A6ADBF]">
                      {streamStateLabel}
                    </span>
                  </div>

                  {/* Provider & Configured/Returned Model */}
                  <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#F5F1F0]/10 pb-5">
                    <div>
                      <span className="block font-body text-xs text-[#A6ADBF]">
                        Model provider
                      </span>
                      <h3 className="mt-1 font-heading text-3xl font-bold tracking-[-0.02em] text-[#F5F1F0]">
                        {judge.provider}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="block font-body text-xs text-[#A6ADBF]">
                        {liveResult ? "Returned model" : "Configured model"}
                      </span>
                      <span className="mt-1 inline-block font-mono text-sm text-[#F5F1F0]/90">
                        {liveResult?.model_name || judge.model}
                      </span>
                    </div>
                  </div>

                  {/* Evaluation Stages along Stream */}
                  <dl className="mt-6 space-y-5">
                    {judge.items.map((item) => (
                      <div key={item.label}>
                        <dt className="font-heading text-base font-semibold tracking-[-0.01em] text-[#F5F1F0]">
                          {item.label}
                        </dt>
                        <dd className="mt-1 font-body text-sm leading-relaxed text-[#A6ADBF]">
                          {item.detail}
                        </dd>
                      </div>
                    ))}

                    <div>
                      <dt className="font-heading text-base font-semibold tracking-[-0.01em] text-[#F5F1F0]">
                        Evaluation criteria
                      </dt>
                      <dd className="mt-2 font-mono text-xs leading-6 text-[#F5F1F0]/80">
                        {EVALUATION_CRITERIA.join(" · ")}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Convergence & Comparison Bridge */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, delay: 0.15, ease: easeCurve }}
          className="relative mx-auto mt-14 max-w-2xl border-t border-[#F5F1F0]/10 pt-8 text-center lg:mt-24"
        >
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-[#54D9FF]">
            CONVERGENCE &amp; COMPARISON
          </span>
          <h3 className="mt-2 font-heading text-2xl font-bold tracking-[-0.02em] text-[#F5F1F0]">
            Independent verdicts converge into measurable consensus
          </h3>
          <p className="mt-3 font-body text-sm leading-relaxed text-[#A6ADBF] sm:text-base">
            Weighted score aggregation · Cross-model score agreement · Reasoning
            similarity (Jaccard &amp; cosine) · Disagreement detection
          </p>
        </motion.div>
      </div>
    </section>
  );
}
