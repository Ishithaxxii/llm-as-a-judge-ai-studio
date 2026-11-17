import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import LiquidChromeText from "./LiquidChromeText";

const easeCurve = [0.16, 1, 0.3, 1];

const EVALUATION_DIMENSIONS = [
  {
    key: "answer_correctness",
    index: "01",
    name: "Answer Correctness",
    weight: 25,
    description:
      "Does the response contain accurate and factually correct information?",
    availability: "Always evaluated",
    accent: "#54D9FF",
    secondary: "#3B5780",
    glow: "radial-gradient(ellipse 80% 75% at 18% 24%, rgba(84, 217, 255, 0.16) 0%, rgba(59, 87, 128, 0.1) 52%, transparent 80%)",
    spanClass: "lg:col-span-7",
    offsetClass: "",
  },
  {
    key: "relevance",
    index: "02",
    name: "Relevance",
    weight: 15,
    description: "Does the response stay focused on what matters?",
    availability: "Always evaluated",
    accent: "#702CFF",
    secondary: "#54D9FF",
    glow: "radial-gradient(ellipse 80% 75% at 80% 24%, rgba(112, 44, 255, 0.2) 0%, rgba(50, 18, 111, 0.14) 55%, transparent 80%)",
    spanClass: "lg:col-span-5",
    offsetClass: "lg:translate-y-8",
  },
  {
    key: "query_alignment",
    index: "03",
    name: "Query Alignment",
    weight: 20,
    description: "Does the response actually answer the user's request?",
    availability: "Evaluated when query is supplied",
    accent: "#E344C5",
    secondary: "#702CFF",
    glow: "radial-gradient(ellipse 80% 75% at 22% 28%, rgba(227, 68, 197, 0.16) 0%, rgba(112, 44, 255, 0.12) 52%, transparent 80%)",
    spanClass: "lg:col-span-7",
    offsetClass: "",
  },
  {
    key: "semantic_similarity",
    index: "04",
    name: "Semantic Similarity",
    weight: 15,
    description:
      "How closely does the response match the reference answer in meaning?",
    availability: "Optional — requires a reference answer",
    optionalHint: "Omitted when no reference answer is provided (never scored 0)",
    accent: "#54D9FF",
    secondary: "#702CFF",
    glow: "radial-gradient(ellipse 80% 75% at 78% 30%, rgba(59, 87, 128, 0.24) 0%, rgba(84, 217, 255, 0.12) 52%, transparent 80%)",
    spanClass: "lg:col-span-5",
    offsetClass: "lg:translate-y-6",
  },
  {
    key: "tone",
    index: "05",
    name: "Tone",
    weight: 10,
    description:
      "Is the response appropriate in tone, clarity and communication?",
    availability: "Always evaluated",
    accent: "#FF815D",
    secondary: "#54D9FF",
    glow: "radial-gradient(ellipse 80% 75% at 24% 32%, rgba(255, 129, 93, 0.14) 0%, rgba(84, 217, 255, 0.1) 52%, transparent 80%)",
    spanClass: "lg:col-span-5",
    offsetClass: "",
  },
  {
    key: "tool_calling",
    index: "06",
    name: "Tool Calling",
    weight: 15,
    description:
      "Were tools selected and used appropriately when required?",
    availability: "Optional — requires a tool trace",
    optionalHint: "Omitted when no tool execution trace is provided (never scored 0)",
    accent: "#FF815D",
    secondary: "#E344C5",
    glow: "radial-gradient(ellipse 80% 75% at 78% 32%, rgba(255, 129, 93, 0.16) 0%, rgba(227, 68, 197, 0.1) 52%, transparent 80%)",
    spanClass: "lg:col-span-7",
    offsetClass: "lg:translate-y-6",
  },
];

const FILAMENT_PATHS = [
  {
    key: "answer_correctness",
    d: "M 720 0 C 660 85, 340 120, 290 225",
    color: "#54D9FF",
  },
  {
    key: "query_alignment",
    d: "M 720 0 C 780 95, 1080 135, 1120 250",
    color: "#E344C5",
  },
  {
    key: "relevance",
    d: "M 290 225 C 260 365, 295 430, 320 515",
    color: "#702CFF",
  },
  {
    key: "semantic_similarity",
    d: "M 1120 250 C 1100 375, 1020 445, 980 535",
    color: "#54D9FF",
  },
  {
    key: "tool_calling",
    d: "M 320 515 C 345 640, 390 725, 420 820",
    color: "#FF815D",
  },
  {
    key: "tone",
    d: "M 980 535 C 995 660, 1040 740, 1060 835",
    color: "#FF815D",
  },
];

function computeLiveDimensionSummary(dimensionKey, results) {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const perJudge = results.map((r) => {
    const raw = r?.criterion_scores?.[dimensionKey];
    const isValid =
      raw !== null &&
      raw !== undefined &&
      raw !== "" &&
      !Number.isNaN(Number(raw));
    return {
      modelName: r?.model_name || "Judge",
      score: isValid ? Number(raw) : null,
    };
  });

  const validValues = perJudge
    .filter((entry) => entry.score !== null)
    .map((entry) => entry.score);

  if (validValues.length === 0) {
    return { unavailable: true, average: null, perJudge };
  }

  const avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  return { unavailable: false, average: avg, perJudge };
}

export default function SixDimensions({ evaluation = null }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState(null);

  const totalWeight = EVALUATION_DIMENSIONS.reduce(
    (sum, dim) => sum + dim.weight,
    0
  );

  const liveResults = evaluation?.results ?? null;

  return (
    <section
      id="dimensions"
      aria-labelledby="dimensions-heading"
      className="relative w-full overflow-hidden bg-[#080910] pb-24 pt-16 sm:pb-32 sm:pt-24"
    >
      {/* Seamless Ambient Light Continuation from Mission 02 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 64% 34% at 50% 0%, rgba(84, 217, 255, 0.1) 0%, rgba(112, 44, 255, 0.12) 38%, transparent 74%),
            radial-gradient(ellipse 52% 42% at 15% 42%, rgba(112, 44, 255, 0.11) 0%, transparent 72%),
            radial-gradient(ellipse 52% 42% at 85% 56%, rgba(227, 68, 197, 0.09) 0%, transparent 72%),
            radial-gradient(ellipse 58% 36% at 50% 100%, rgba(255, 129, 93, 0.08) 0%, transparent 72%)
          `,
        }}
      />

      {/* Animated Harmonic SVG Connections linking Dimensions */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[210px] bottom-[40px] hidden lg:block"
      >
        <svg
          viewBox="0 0 1440 960"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="dimConvergenceOut" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#702CFF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#54D9FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF815D" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {FILAMENT_PATHS.map((filament, idx) => {
            const isHighlighted = activeKey === filament.key;
            const isDimmed = activeKey !== null && !isHighlighted;
            return (
              <g
                key={filament.key}
                style={{
                  opacity: isDimmed ? 0.28 : isHighlighted ? 1 : 0.65,
                  transition: "opacity 220ms ease",
                }}
              >
                <path
                  d={filament.d}
                  fill="none"
                  stroke={filament.color}
                  strokeOpacity={isHighlighted ? 0.85 : 0.32}
                  strokeWidth={isHighlighted ? "2.4" : "1.35"}
                />
                {!shouldReduceMotion ? (
                  <motion.path
                    d={filament.d}
                    fill="none"
                    stroke={filament.color}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray="48 340"
                    animate={{ strokeDashoffset: [388, 0] }}
                    transition={{
                      duration: 6.5 + idx * 0.7,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : null}
              </g>
            );
          })}

          {/* Outgoing convergence filaments leading into Final Verdict */}
          <path
            d="M 420 820 C 480 895, 650 925, 720 960"
            fill="none"
            stroke="url(#dimConvergenceOut)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <path
            d="M 1060 835 C 985 900, 800 925, 720 960"
            fill="none"
            stroke="url(#dimConvergenceOut)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* CONTENT CONTAINER */}
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
              className="h-px w-7 bg-gradient-to-r from-[#54D9FF] to-[#E344C5]"
            />
            <span className="font-mono text-xs font-medium tracking-[0.22em] text-[#A6ADBF]">
              SIX EVALUATION DIMENSIONS · {totalWeight}% RUBRIC WEIGHT
            </span>
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-[#E344C5] to-[#FF815D]"
            />
          </div>

          <h2
            id="dimensions-heading"
            className="font-heading text-[clamp(2.25rem,4.4vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.03em] text-[#F5F1F0] [text-wrap:balance]"
          >
            Intelligence is{" "}
            <LiquidChromeText variant="subtle" className="tracking-[-0.02em]">
              multidimensional.
            </LiquidChromeText>
          </h2>

          <p className="mx-auto mt-6 max-w-[56ch] font-body text-base leading-[1.7] text-[#F5F1F0]/75 sm:text-lg">
            One score can never tell the whole story. We evaluate AI responses
            across six dimensions.
          </p>
        </motion.header>

        {/* Staggered Liquid-Glass Dimension Layers (Non-uniform organic composition) */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
          {EVALUATION_DIMENSIONS.map((dim, idx) => {
            const isHovered = activeKey === dim.key;
            const liveSummary = computeLiveDimensionSummary(dim.key, liveResults);

            return (
              <motion.article
                key={dim.key}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.08,
                  ease: easeCurve,
                }}
                onMouseEnter={() => setActiveKey(dim.key)}
                onMouseLeave={() => setActiveKey(null)}
                className={`group relative overflow-hidden rounded-3xl p-7 backdrop-blur-xl transition-all duration-200 sm:p-8 ${dim.spanClass} ${dim.offsetClass}`}
                style={{
                  background:
                    "linear-gradient(155deg, rgba(16, 17, 32, 0.74) 0%, rgba(8, 9, 16, 0.86) 100%)",
                  border: `1px solid ${
                    isHovered
                      ? `${dim.accent}88`
                      : "rgba(245, 241, 240, 0.09)"
                  }`,
                  transform:
                    isHovered && !shouldReduceMotion
                      ? "translateY(-3px)"
                      : undefined,
                }}
              >
                {/* Dimension Atmospheric Liquid Reflection */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: dim.glow,
                    opacity: isHovered ? 1 : 0.72,
                  }}
                />

                {/* Top Specular Rim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${dim.accent}99 45%, ${dim.secondary}77 80%, transparent 100%)`,
                  }}
                />

                <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                  <div>
                    {/* Index, Availability & Weight */}
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-center gap-3 font-mono text-xs text-[#A6ADBF]">
                        <span style={{ color: dim.accent }}>{dim.index}</span>
                        <span aria-hidden="true">·</span>
                        <span>{dim.availability}</span>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="font-heading text-2xl font-bold tabular-nums text-[#F5F1F0] sm:text-3xl">
                          {dim.weight}%
                        </span>
                      </div>
                    </div>

                    {/* Dimension Title & Core Question */}
                    <h3 className="mt-4 font-heading text-2xl font-bold tracking-[-0.02em] text-[#F5F1F0]">
                      {dim.name}
                    </h3>
                    <p className="mt-2.5 max-w-[52ch] font-body text-sm leading-relaxed text-[#F5F1F0]/75 sm:text-base">
                      {dim.description}
                    </p>
                  </div>

                  {/* Proportional Weight Horizon Bar + Optional/Live Readout */}
                  <div className="space-y-3 border-t border-[#F5F1F0]/10 pt-4">
                    <div className="flex items-center justify-between gap-3 font-mono text-xs">
                      <span className="text-[#A6ADBF]">
                        {liveSummary
                          ? liveSummary.unavailable
                            ? "N/A — omitted from weighted average"
                            : `Observed avg: ${liveSummary.average.toFixed(1)} / 10`
                          : dim.optionalHint || "Included in weighted overall score"}
                      </span>
                      <span
                        className="shrink-0 tabular-nums"
                        style={{ color: dim.accent }}
                      >
                        {liveSummary && !liveSummary.unavailable
                          ? `${liveSummary.average.toFixed(1)} / 10`
                          : `Weight ${dim.weight}%`}
                      </span>
                    </div>

                    {liveSummary ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#A6ADBF]">
                        {liveSummary.perJudge.map((entry) => (
                          <span key={entry.modelName} className="tabular-nums">
                            {entry.modelName}:{" "}
                            <span className="text-[#F5F1F0]">
                              {entry.score !== null
                                ? `${entry.score.toFixed(1)}`
                                : "N/A"}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="h-1 w-full overflow-hidden rounded-full bg-[#F5F1F0]/10">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            liveSummary && !liveSummary.unavailable
                              ? Math.max(
                                  0,
                                  Math.min(100, (liveSummary.average / 10) * 100)
                                )
                              : (dim.weight / 25) * 100
                          }%`,
                          background: `linear-gradient(90deg, ${dim.secondary}, ${dim.accent})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Weight Composition Summary Strip */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: easeCurve }}
          className="mx-auto mt-12 flex max-w-4xl flex-col items-center justify-between gap-3 border-t border-[#F5F1F0]/10 pt-6 text-center font-mono text-xs text-[#A6ADBF] sm:flex-row sm:text-left lg:mt-16"
        >
          <span>
            Dynamic weighted normalization: excluded null criteria never penalize
            or score zero.
          </span>
          <span className="shrink-0 tabular-nums text-[#F5F1F0]">
            Total rubric allocation: {totalWeight}%
          </span>
        </motion.div>
      </div>
    </section>
  );
}
