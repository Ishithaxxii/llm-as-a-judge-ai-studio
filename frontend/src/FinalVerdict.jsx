import { RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import LiquidChromeText from "./LiquidChromeText";

const easeCurve = [0.16, 1, 0.3, 1];

const CRITERION_LABELS = {
  answer_correctness: "Answer Correctness",
  relevance: "Relevance",
  query_alignment: "Query Alignment",
  semantic_similarity: "Semantic Similarity",
  tone: "Tone",
  tool_calling: "Tool Calling",
};

const CRITERION_KEYS = Object.keys(CRITERION_LABELS);

function isNumeric(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(Number(value))
  );
}

function formatScore(value) {
  if (!isNumeric(value)) {
    return null;
  }
  return Number(value).toFixed(1);
}

function formatAgreement(value) {
  if (!isNumeric(value)) {
    return null;
  }
  return `${Math.round(Number(value) * 100)}%`;
}

function formatZScore(value) {
  if (!isNumeric(value)) {
    return null;
  }
  const num = Number(value);
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}`;
}

export default function FinalVerdict({
  evaluation = null,
  status = "idle",
  onReset = null,
  onRetryJudge = null,
}) {

  const shouldReduceMotion = useReducedMotion();

  const hasEvaluation = Boolean(
    evaluation &&
      Array.isArray(evaluation.results) &&
      evaluation.results.length > 0
  );

  const failedJudges = Array.isArray(evaluation?.failed_judges)
    ? evaluation.failed_judges
    : [];

  const isRetrying = status === "evaluating" && hasEvaluation;

  const aggregateScore = hasEvaluation
    ? formatScore(evaluation.aggregate_score)
    : null;
  const agreementPct = hasEvaluation
    ? formatAgreement(evaluation.agreement)
    : null;
  const scoreStd =
    hasEvaluation && isNumeric(evaluation.score_std)
      ? Number(evaluation.score_std).toFixed(2)
      : null;
  const zScore = hasEvaluation ? formatZScore(evaluation.z_score) : null;
  const numValidJudges =
    hasEvaluation && isNumeric(evaluation.num_valid_judges)
      ? Number(evaluation.num_valid_judges)
      : hasEvaluation
        ? evaluation.results.length
        : null;
  const flaggedDisagreement =
    hasEvaluation && typeof evaluation.flagged_disagreement === "boolean"
      ? evaluation.flagged_disagreement
      : null;
  const jaccardText =
    hasEvaluation && isNumeric(evaluation.jaccard)
      ? `${(Number(evaluation.jaccard) * 100).toFixed(1)}%`
      : null;
  const cosineText =
    hasEvaluation && isNumeric(evaluation.cosine)
      ? `${(Number(evaluation.cosine) * 100).toFixed(1)}%`
      : null;

  return (
    <section
      id="verdict"
      aria-labelledby="verdict-heading"
      className="relative w-full overflow-hidden bg-[#080910] pb-28 pt-16 sm:pb-36 sm:pt-24"
    >
      {/* Converging Liquid-Glass Atmospheric Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 66% 42% at 50% 8%, rgba(255, 129, 93, 0.08) 0%, rgba(112, 44, 255, 0.14) 36%, transparent 74%),
            radial-gradient(ellipse 58% 48% at 50% 52%, rgba(84, 217, 255, 0.09) 0%, rgba(50, 18, 111, 0.18) 44%, transparent 78%),
            radial-gradient(ellipse 46% 36% at 80% 78%, rgba(227, 68, 197, 0.1) 0%, transparent 72%)
          `,
        }}
      />

      {/* Converging Streams SVG Funnel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="verdictConvergeL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#702CFF" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#E344C5" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F5F1F0" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="verdictConvergeR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#54D9FF" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#FF815D" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F5F1F0" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          <path
            d="M 180 0 C 340 120, 560 155, 720 220"
            fill="none"
            stroke="url(#verdictConvergeL)"
            strokeWidth="1.6"
          />
          <path
            d="M 1260 0 C 1100 120, 880 155, 720 220"
            fill="none"
            stroke="url(#verdictConvergeR)"
            strokeWidth="1.6"
          />
          <path
            d="M 720 0 L 720 220"
            fill="none"
            stroke="#54D9FF"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />

          {!shouldReduceMotion ? (
            <>
              <motion.path
                d="M 180 0 C 340 120, 560 155, 720 220"
                fill="none"
                stroke="#E344C5"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="64 560"
                animate={{ strokeDashoffset: [624, 0] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M 1260 0 C 1100 120, 880 155, 720 220"
                fill="none"
                stroke="#54D9FF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="64 560"
                animate={{ strokeDashoffset: [624, 0] }}
                transition={{ duration: 6.4, repeat: Infinity, ease: "linear" }}
              />
            </>
          ) : null}

          <circle cx="720" cy="220" r="4.5" fill="#F5F1F0" />
        </svg>
      </div>

      {/* SECTION CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10 lg:px-14">
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
              className="h-px w-7 bg-gradient-to-r from-[#E344C5] to-[#54D9FF]"
            />
            <span className="font-mono text-xs font-medium tracking-[0.22em] text-[#A6ADBF]">
              THE FINAL VERDICT
            </span>
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-[#54D9FF] to-[#FF815D]"
            />
          </div>

          <h2
            id="verdict-heading"
            className="font-heading text-[clamp(2.25rem,4.4vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.03em] text-[#F5F1F0] [text-wrap:balance]"
          >
            Beyond the score.{" "}
            <LiquidChromeText variant="subtle" className="tracking-[-0.02em]">
              Understand the verdict.
            </LiquidChromeText>
          </h2>

          <p className="mx-auto mt-6 max-w-[54ch] font-body text-base leading-[1.7] text-[#F5F1F0]/75 sm:text-lg">
            Multiple perspectives. Six dimensions. One comprehensive evaluation.
          </p>
        </motion.header>

        {/* FOCAL VERDICT CONTAINER */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1, ease: easeCurve }}
          className="relative mx-auto mt-14 max-w-6xl overflow-hidden rounded-3xl border border-[#F5F1F0]/12 p-7 backdrop-blur-2xl sm:p-10 lg:p-12"
          style={{
            background:
              "linear-gradient(160deg, rgba(18, 17, 36, 0.82) 0%, rgba(8, 9, 16, 0.92) 100%)",
          }}
        >
          {/* Specular Top Rim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #702CFF 24%, #54D9FF 50%, #E344C5 76%, transparent 100%)",
            }}
          />

          {/* Subtle Radial Center Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(112, 44, 255, 0.14) 0%, rgba(84, 217, 255, 0.06) 45%, transparent 78%)",
            }}
          />

          <div className="relative z-10">
            {/* TOP FOCAL ROW: Aggregate Score + Consensus Telemetry Slots */}
            <div className="grid items-center gap-8 border-b border-[#F5F1F0]/10 pb-8 lg:grid-cols-12">
              {/* Primary Aggregate Score Focal Point */}
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium tracking-[0.18em] text-[#54D9FF]">
                    OVERALL VERDICT · AGGREGATE SCORE
                  </span>
                  {hasEvaluation && evaluation.submission_id ? (
                    <span className="font-mono text-[11px] tabular-nums text-[#A6ADBF]">
                      ID {evaluation.submission_id.slice(0, 8)}…
                    </span>
                  ) : null}
                </div>

                {hasEvaluation ? (
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="font-heading text-6xl font-extrabold tabular-nums tracking-[-0.03em] text-[#F5F1F0] sm:text-7xl">
                      {aggregateScore ?? "N/A"}
                    </span>
                    <span className="font-mono text-lg text-[#A6ADBF]">
                      / 10
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#F5F1F0] sm:text-3xl">
                      {status === "evaluating" || status === "submitting"
                        ? "Evaluation in progress…"
                        : "Your evaluation will appear here."}
                    </p>
                    <p className="mt-2 max-w-[42ch] font-body text-sm leading-relaxed text-[#A6ADBF]">
                      {status === "evaluating" || status === "submitting"
                        ? "Independent judges are scoring applicable criteria and generating structured reasoning."
                        : "Submit an AI-generated response to compute the weighted aggregate score, cross-model agreement, and dimension breakdown."}
                    </p>
                  </div>
                )}
              </div>

              {/* Consensus & Divergence Signals */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:col-span-7">
                {/* Judge Agreement */}
                <div className="border-t border-[#F5F1F0]/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <span className="block font-mono text-xs text-[#A6ADBF]">
                    Judge agreement
                  </span>
                  <div className="mt-2 font-heading text-3xl font-bold tabular-nums text-[#F5F1F0]">
                    {agreementPct ?? (hasEvaluation ? "N/A" : "—")}
                  </div>
                  <span className="mt-1 block font-body text-xs text-[#A6ADBF]">
                    {numValidJudges !== null
                      ? `${numValidJudges} valid ${numValidJudges === 1 ? "judge" : "judges"}`
                      : "Pending judge outcomes"}
                  </span>
                </div>

                {/* Score Variation */}
                <div className="border-t border-[#F5F1F0]/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <span className="block font-mono text-xs text-[#A6ADBF]">
                    Score variation (σ)
                  </span>
                  <div className="mt-2 font-heading text-3xl font-bold tabular-nums text-[#F5F1F0]">
                    {scoreStd ?? (hasEvaluation ? "N/A" : "—")}
                  </div>
                  <span className="mt-1 block font-body text-xs text-[#A6ADBF]">
                    Standard deviation across judges
                  </span>
                </div>

                {/* Historical Z-Score */}
                <div className="border-t border-[#F5F1F0]/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <span className="block font-mono text-xs text-[#A6ADBF]">
                    Historical z-score
                  </span>
                  <div className="mt-2 font-heading text-3xl font-bold tabular-nums text-[#F5F1F0]">
                    {zScore ?? (hasEvaluation ? "N/A" : "—")}
                  </div>
                  <span className="mt-1 block font-body text-xs text-[#A6ADBF]">
                    {hasEvaluation && zScore === null
                      ? "Requires ≥ 5 historical runs"
                      : "Relative to prior evaluations"}
                  </span>
                </div>

                {/* Flagged Disagreement */}
                <div className="border-t border-[#F5F1F0]/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <span className="block font-mono text-xs text-[#A6ADBF]">
                    Disagreement flag
                  </span>
                  <div className="mt-2 font-heading text-xl font-bold text-[#F5F1F0]">
                    {flaggedDisagreement === null
                      ? hasEvaluation
                        ? "N/A"
                        : "Awaiting run"
                      : flaggedDisagreement
                        ? "▲ Flagged divergence"
                        : "● Aligned consensus"}
                  </div>
                  <span className="mt-1 block font-body text-xs text-[#A6ADBF]">
                    {flaggedDisagreement === true
                      ? "Judges diverged meaningfully"
                      : "Agreement does not replace evidence"}
                  </span>
                </div>
              </div>
            </div>

            {/* Epistemic Caveat + Reasoning Text Similarity Metrics */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#A6ADBF]">
              <span>
                Convergence measures inter-judge alignment — individual
                criterion evidence and reasoning remain inspectable below.
              </span>
              {hasEvaluation ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tabular-nums text-[#F5F1F0]/80">
                    Reasoning text similarity (lexical, not factual accuracy) ·
                    Jaccard {jaccardText ?? "N/A"} · Cosine{" "}
                    {cosineText ?? "N/A"}
                  </span>
                  {onReset ? (
                    <button
                      type="button"
                      onClick={onReset}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F1F0]/20 px-3.5 py-1.5 text-xs text-[#F5F1F0] transition hover:border-[#54D9FF]/60 hover:bg-[#32126F]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF]"
                    >
                      <RotateCcw size={13} aria-hidden="true" />
                      <span>Start Fresh Evaluation</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Partial Provider Failure & Retry */}
            {hasEvaluation && failedJudges.length > 0 ? (
              <div
                role="alert"
                className="mt-8 rounded-2xl border border-[#FF815D]/40 bg-[#32126F]/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs tracking-[0.16em] text-[#FF815D]">
                      PARTIAL EVALUATION · {failedJudges.length} FAILED{" "}
                      {failedJudges.length === 1 ? "JUDGE" : "JUDGES"}
                    </span>

                    <p className="mt-2 font-body text-sm leading-relaxed text-[#F5F1F0]/85">
                      Some judges could not complete their evaluation. The
                      aggregate score uses successful judge results only.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onRetryJudge}
                    disabled={!onRetryJudge || isRetrying}
                    className="shrink-0 rounded-full border border-[#54D9FF]/50 px-4 py-2 font-mono text-xs text-[#54D9FF] transition hover:bg-[#54D9FF] hover:text-[#080910] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRetrying ? "Retrying failed judge(s)..." : "Retry Failed Judge(s)"}
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {failedJudges.map((judge) => (
                    <div
                      key={judge.model_name}
                      className="rounded-xl border border-[#FF815D]/20 bg-[#080910]/65 px-4 py-3"
                    >
                      <p className="font-mono text-xs text-[#FF815D]">
                        {judge.model_name}
                      </p>
                      <p className="mt-1 font-body text-sm text-[#F5F1F0]/80">
                        {judge.error || "No error details returned."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* INDIVIDUAL JUDGE ASSESSMENTS & REASONING */}
            {hasEvaluation ? (
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {evaluation.results.map((judgeResult) => {
                  const formattedScore = formatScore(judgeResult.score);
                  const confidencePct = isNumeric(judgeResult.confidence)
                    ? `${Math.round(Number(judgeResult.confidence) * 100)}%`
                    : "N/A";
                  const latency = isNumeric(judgeResult.latency_ms)
                    ? `${judgeResult.latency_ms} ms`
                    : "N/A";

                  const scoresMap = judgeResult.criterion_scores || {};
                  const extraKeys = Object.keys(scoresMap).filter(
                    (k) => !CRITERION_KEYS.includes(k)
                  );
                  const allCriterionKeys = [...CRITERION_KEYS, ...extraKeys];

                  return (
                    <article
                      key={judgeResult.model_name}
                      className="rounded-2xl border border-[#F5F1F0]/10 bg-[#080910]/65 p-6"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#F5F1F0]/10 pb-4">
                        <div>
                          <span className="block font-mono text-xs text-[#54D9FF]">
                            INDEPENDENT JUDGE
                          </span>
                          <h3 className="mt-1 font-heading text-xl font-bold text-[#F5F1F0]">
                            {judgeResult.model_name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="font-heading text-3xl font-bold tabular-nums text-[#F5F1F0]">
                            {formattedScore ?? "N/A"}
                          </span>
                          <span className="ml-1 font-mono text-xs text-[#A6ADBF]">
                            / 10
                          </span>
                        </div>
                      </div>

                      {/* Criterion Scores (handles omitted/null dimensions with N/A, never 0) */}
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-b border-[#F5F1F0]/10 pb-4 text-xs">
                        {allCriterionKeys.map((key) => {
                          const scoreText = formatScore(scoresMap[key]);
                          return (
                            <div
                              key={key}
                              className="flex items-baseline justify-between gap-2"
                            >
                              <dt className="font-body text-[#A6ADBF]">
                                {CRITERION_LABELS[key] || key}
                              </dt>
                              <dd className="font-mono tabular-nums text-[#F5F1F0]">
                                {scoreText ?? "N/A"}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>

                      {/* Evaluation Reasoning */}
                      <div className="mt-4">
                        <span className="block font-mono text-xs text-[#A6ADBF]">
                          Evaluation reasoning
                        </span>
                        <p className="mt-2 font-body text-sm leading-relaxed text-[#F5F1F0]/85">
                          {judgeResult.reasoning ||
                            "No reasoning statement returned."}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F5F1F0]/10 pt-3 font-mono text-xs text-[#A6ADBF]">
                        <span className="tabular-nums">
                          Confidence: {confidencePct}
                        </span>
                        <span className="tabular-nums">Latency: {latency}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Structured Empty-State Slots Ready for Live API Response Data */
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-[#F5F1F0]/10 bg-[#080910]/55 p-6">
                  <span className="font-mono text-xs text-[#E344C5]">
                    INDIVIDUAL JUDGE ASSESSMENTS
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-[#F5F1F0]">
                    Per-model scores &amp; confidence
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#A6ADBF]">
                    Individual judge scores, dimension-level breakdowns,
                    confidence, and response latency appear here once an
                    evaluation completes.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F5F1F0]/10 bg-[#080910]/55 p-6">
                  <span className="font-mono text-xs text-[#FF815D]">
                    FLAGGED DIFFERENCES
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-[#F5F1F0]">
                    Disagreements &amp; missing context
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#A6ADBF]">
                    Surfaces significant score variance between models and marks
                    omitted optional dimensions (semantic similarity or tool
                    calling) without defaulting to zero.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F5F1F0]/10 bg-[#080910]/55 p-6">
                  <span className="font-mono text-xs text-[#54D9FF]">
                    EVALUATION REASONING
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-[#F5F1F0]">
                    Evidence-based justification
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#A6ADBF]">
                    Displays each independent judge&apos;s written reasoning
                    alongside Jaccard and cosine reasoning similarity metrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
