import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import LiquidChromeText from "./LiquidChromeText";
import Submission from "./Submission";

const easeCurve = [0.16, 1, 0.3, 1];

export default function EvaluationWorkspace({
  status = "idle",
  submissionId = null,
  evaluation = null,
  error = null,
  resetKey = 0,
  onSubmitted,
  onRetryJudge,
  onReset,
  history = [],
  historyLoading = false,
  historyError = null,
  onRefreshHistory,
  onSelectHistory,
}) {

const shouldReduceMotion = useReducedMotion();
const isBusy =
  status === "submitting" ||
  status === "evaluating" ||
  status === "loading-history";

const successfulJudges = Array.isArray(evaluation?.results)
  ? evaluation.results
  : [];

  return (
    <section
      id="workspace"
      aria-labelledby="workspace-heading"
      className="relative w-full overflow-hidden bg-[#080910] py-20 sm:py-28"
    >
      {/* Subtle Ambient Light Continuity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 44% at 50% 15%, rgba(112, 44, 255, 0.14) 0%, transparent 72%),
            radial-gradient(ellipse 46% 38% at 20% 75%, rgba(227, 68, 197, 0.08) 0%, transparent 72%),
            radial-gradient(ellipse 46% 38% at 82% 70%, rgba(84, 217, 255, 0.09) 0%, transparent 72%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Workspace Header */}
        <motion.header
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: easeCurve }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-[#702CFF] to-[#54D9FF]"
            />
            <span className="font-mono text-xs font-medium tracking-[0.22em] text-[#54D9FF]">
              LIVE EVALUATION WORKSPACE
            </span>
            <span
              aria-hidden="true"
              className="h-px w-7 bg-gradient-to-r from-[#54D9FF] to-[#FF815D]"
            />
          </div>

          <h2
            id="workspace-heading"
            className="font-heading text-[clamp(2rem,3.8vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-[#F5F1F0] [text-wrap:balance]"
          >
            Submit once.{" "}
            <LiquidChromeText variant="subtle" className="tracking-[-0.02em]">
              Run the judges.
            </LiquidChromeText>
          </h2>

          <p className="mx-auto mt-4 max-w-[52ch] font-body text-sm leading-[1.7] text-[#F5F1F0]/75 sm:text-base">
            Creates a persisted submission via{" "}
            <code className="font-mono text-xs text-[#54D9FF]">
              POST /submissions
            </code>{" "}
            and dispatches independent models via{" "}
            <code className="font-mono text-xs text-[#E344C5]">POST /judge</code>
            .
          </p>
        </motion.header>

        {/* Liquid-Glass Workspace Vessel */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, delay: 0.08, ease: easeCurve }}
          className="relative mt-12 overflow-hidden rounded-3xl border border-[#F5F1F0]/12 p-6 backdrop-blur-2xl sm:p-9"
          style={{
            background:
              "linear-gradient(155deg, rgba(16, 17, 32, 0.82) 0%, rgba(8, 9, 16, 0.92) 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #702CFF 25%, #54D9FF 55%, #E344C5 80%, transparent 100%)",
            }}
          />

          <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-[#54D9FF]/20 bg-[#080910]/65 p-4 lg:sticky lg:top-8">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div><span className="font-mono text-[10px] tracking-[0.2em] text-[#54D9FF]">YOUR RUNS</span><h3 className="mt-1 font-heading text-lg font-semibold text-[#F5F1F0]">History</h3></div>
                <button type="button" onClick={onRefreshHistory} disabled={historyLoading} className="rounded-full border border-[#F5F1F0]/15 px-2.5 py-1.5 font-mono text-[10px] text-[#A6ADBF] transition hover:border-[#54D9FF]/50 hover:text-[#54D9FF] disabled:opacity-50">{historyLoading ? "Loading…" : "Refresh"}</button>
              </div>
              {historyError ? <p role="alert" className="mb-3 text-xs leading-relaxed text-[#FF815D]">{historyError}</p> : null}
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {history.length === 0 && !historyLoading ? <p className="rounded-xl border border-dashed border-[#F5F1F0]/15 px-3 py-5 text-center font-body text-xs leading-relaxed text-[#A6ADBF]">Your completed evaluations will appear here.</p> : null}
                {history.map((item) => {
                  const active = item.id === submissionId;
                  const preview = (item.query || item.content || "Untitled evaluation").replace(/\s+/g, " ").trim();
                  return <button key={item.id} type="button" onClick={() => onSelectHistory?.(item)} disabled={isBusy} className={active ? "block w-full rounded-xl border border-[#54D9FF]/60 bg-[#32126F]/35 px-3 py-3 text-left transition" : "block w-full rounded-xl border border-[#F5F1F0]/10 bg-[#101120]/65 px-3 py-3 text-left transition hover:border-[#54D9FF]/35 hover:bg-[#17172a]"}>
                    <span className="block font-mono text-[10px] text-[#54D9FF]">{item.created_at ? new Date(item.created_at).toLocaleString() : "Saved submission"}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#F5F1F0]/85">{preview.length > 76 ? preview.slice(0, 76) + "…" : preview}</span>
                    <span className="mt-2 block font-mono text-[9px] text-[#A6ADBF]">{item.content_type || "text"} · {item.id.slice(0, 8)}</span>
                  </button>;
                })}
              </div>
              <p className="mt-4 border-t border-[#F5F1F0]/10 pt-3 font-body text-[10px] leading-relaxed text-[#A6ADBF]">Selecting a saved run loads stored results only. No judge API calls are made.</p>
            </aside>
            <div className="min-w-0">
          {/* Status & Submission ID Header Bar */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F1F0]/10 pb-5 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#A6ADBF]">
                State:{" "}
                <span className="text-[#F5F1F0]">
                  {status === "idle"
                    ? "Ready"
                    : status === "submitting"
                      ? "Creating submission"
                      : status === "evaluating"
                        ? "Independent judges deliberating"
                        : status === "success"
                          ? "Evaluation complete"
                          : status === "loading-history"
                            ? "Restoring saved evaluation"
                            : "Request failed"}
                </span>
              </span>

              {submissionId ? (
                <>
                  <span aria-hidden="true" className="text-[#F5F1F0]/25">
                    ·
                  </span>
                  <span className="tabular-nums text-[#54D9FF]">
                    Submission ID: {submissionId}
                  </span>
                </>
              ) : null}
            </div>

            {status === "success" || status === "error" || submissionId ? (
              <button
                type="button"
                onClick={onReset}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F1F0]/20 px-3.5 py-1.5 text-xs text-[#F5F1F0] transition hover:border-[#54D9FF]/60 hover:bg-[#32126F]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Start Fresh Evaluation</span>
              </button>
            ) : null}
          </div>

          {/* Cinematic Evaluation-In-Progress Banner */}
          {status === "submitting" || status === "evaluating" ? (
            <div
              role="status"
              aria-live="polite"
              className="mb-7 overflow-hidden rounded-2xl border border-[#54D9FF]/30 bg-[#121024]/80 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs tracking-[0.18em] text-[#54D9FF]">
                    {status === "submitting"
                      ? "PHASE 1 · PERSISTING SUBMISSION"
                      : "PHASE 2 · PARALLEL INDEPENDENT DELIBERATION"}
                  </span>
                  <p className="mt-1.5 font-body text-sm text-[#F5F1F0]/85">
                    {status === "submitting"
                      ? "Sending submission payload to FastAPI and awaiting persisted submission ID…"
                      : "Independent model streams are evaluating the submission across applicable rubric dimensions…"}
                  </p>
                </div>
              </div>

              {/* Flowing dual-stream progress indicator */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#702CFF]/35 bg-[#080910]/65 px-4 py-3">
                  <span className="block font-mono text-[11px] text-[#E344C5]">
                    STREAM 01 · GEMINI
                  </span>
                  <span className="mt-1 block font-body text-xs text-[#A6ADBF]">
                    {status === "submitting"
                      ? "Waiting for submission ID"
                      : "Independent evaluation in progress"}
                  </span>
                </div>
                <div className="rounded-xl border border-[#54D9FF]/35 bg-[#080910]/65 px-4 py-3">
                  <span className="block font-mono text-[11px] text-[#54D9FF]">
                    STREAM 02 · GROQ
                  </span>
                  <span className="mt-1 block font-body text-xs text-[#A6ADBF]">
                    {status === "submitting"
                      ? "Waiting for submission ID"
                      : "Independent evaluation in progress"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Backend / Judging Error Banner */}
          {status === "error" && error ? (
            <div
              role="alert"
              className="mb-7 rounded-2xl border border-[#E344C5]/45 bg-[#32126F]/35 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs tracking-[0.16em] text-[#FF815D]">
                    EVALUATION ERROR
                  </span>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-[#F5F1F0]">
                    {error}
                  </p>
                </div>

                {submissionId && onRetryJudge ? (
                  <button
                    type="button"
                    onClick={onRetryJudge}
                    className="shrink-0 rounded-full border border-[#54D9FF]/50 bg-[#080910]/70 px-4 py-2 font-mono text-xs text-[#54D9FF] transition hover:bg-[#54D9FF] hover:text-[#080910] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF]"
                  >
                    Retry Judging ({submissionId.slice(0, 8)}…)
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Live Success Summary Strip (Points directly to Dimensions & Verdict below) */}
          {status === "success" && evaluation ? (
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#54D9FF]/35 bg-[#080910]/65 px-5 py-4">
              <div>
                <span className="font-mono text-xs text-[#54D9FF]">
                  JUDGING COMPLETE · {evaluation.num_valid_judges ?? evaluation.results?.length ?? 0} VALID JUDGES
                </span>
                <p className="mt-1 font-body text-sm text-[#F5F1F0]/85">
                  Returned models:{" "}
                  <span className="font-mono text-xs text-[#F5F1F0]">
                    {successfulJudges.map((r) => r.model_name).join(" · ") || "None"}
                  </span>
                </p>
              </div>

              <a
                href="#verdict"
                className="rounded-full bg-[#F5F1F0]/10 px-4 py-2 font-mono text-xs text-[#F5F1F0] transition hover:bg-[#54D9FF] hover:text-[#080910] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF]"
              >
                Jump to Verdict ↓
              </a>
            </div>
          ) : null}

          {status === "loading-history" ? <div role="status" className="mb-5 rounded-xl border border-[#54D9FF]/25 bg-[#121024]/70 px-4 py-3 font-mono text-xs text-[#54D9FF]">RESTORING SAVED EVALUATION · NO LLM CALLS</div> : null}
          <Submission key={resetKey} onSubmitted={onSubmitted} disabled={isBusy || status === "loading-history"} status={status} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
