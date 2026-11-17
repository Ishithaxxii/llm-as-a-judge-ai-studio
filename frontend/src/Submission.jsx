import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

const CONTENT_TYPES = [
  { value: "text", label: "Text" },
  { value: "code", label: "Code" },
  { value: "essay", label: "Essay" },
];

function parseOptionalToolTrace(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { value: null, error: null };
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      value: null,
      error:
        'Tool trace must be valid JSON (e.g. [{"tool": "search", "output": "..."}]).',
    };
  }

  if (
    !Array.isArray(parsed) ||
    parsed.some(
      (entry) => !entry || typeof entry !== "object" || Array.isArray(entry)
    )
  ) {
    return {
      value: null,
      error:
        "Tool trace must be a JSON array of objects matching the backend list[dict] schema.",
    };
  }

  return { value: parsed, error: null };
}

export default function Submission({
  onSubmitted,
  disabled = false,
  status = "idle",
}) {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text");
  const [query, setQuery] = useState("");
  const [referenceAnswer, setReferenceAnswer] = useState("");
  const [toolTraceRaw, setToolTraceRaw] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isBusy = submitting || disabled;

  async function handleSubmit(e) {
    e.preventDefault();
    if (isBusy) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setValidationError(
        "Enter the AI-generated response you want the judges to evaluate."
      );
      return;
    }

    const { value: parsedToolTrace, error: traceError } =
      parseOptionalToolTrace(toolTraceRaw);
    if (traceError) {
      setValidationError(traceError);
      setShowOptional(true);
      return;
    }

    setValidationError(null);
    setSubmitting(true);

    try {
      await onSubmitted({
        content: trimmedContent,
        content_type: contentType,
        query: query.trim() || null,
        reference_answer: referenceAnswer.trim() || null,
        tool_trace: parsedToolTrace,
      });
    } catch (err) {
      setValidationError(
        err?.message || "Failed to submit response for evaluation."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const buttonLabel =
    status === "submitting" || submitting
      ? "Creating Submission…"
      : status === "evaluating" || disabled
        ? "Judges Evaluating…"
        : "Run Evaluation";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      {/* Content Type Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#A6ADBF]">
          Submission format
        </span>

        <div
          role="group"
          aria-label="Submission content type"
          className="inline-flex items-center gap-1 rounded-full border border-[#F5F1F0]/12 bg-[#080910]/70 p-1"
        >
          {CONTENT_TYPES.map((type) => {
            const active = contentType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                disabled={isBusy}
                onClick={() => setContentType(type.value)}
                className={`min-h-[36px] whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-xs transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF] ${
                  active
                    ? "bg-[#F5F1F0] font-semibold text-[#080910]"
                    : "text-[#A6ADBF] hover:text-[#F5F1F0]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Required: AI-Generated Response */}
      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-4">
          <label
            htmlFor="submission-content"
            className="font-heading text-base font-semibold text-[#F5F1F0]"
          >
            AI-generated response{" "}
            <span className="font-mono text-xs font-normal text-[#54D9FF]">
              Required
            </span>
          </label>
          <span className="font-mono text-xs tabular-nums text-[#A6ADBF]">
            {content.length.toLocaleString()} chars
          </span>
        </div>

        <textarea
          id="submission-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (validationError) setValidationError(null);
          }}
          rows={7}
          disabled={isBusy}
          placeholder={
            contentType === "code"
              ? "Paste the model-generated code or implementation to evaluate..."
              : contentType === "essay"
                ? "Paste the model-generated essay or analytical prose to evaluate..."
                : "Paste the AI-generated response to evaluate across independent judges..."
          }
          className="w-full rounded-2xl border border-[#F5F1F0]/12 bg-[#080910]/75 px-5 py-4 font-body text-sm leading-relaxed text-[#F5F1F0] placeholder:text-[#A6ADBF]/45 transition focus:border-[#54D9FF]/65 focus:outline-none focus:ring-2 focus:ring-[#54D9FF]/25 disabled:cursor-not-allowed disabled:opacity-65 sm:text-base"
        />
      </div>

      {/* Optional Context Toggle (Query, Reference Answer, Tool Trace) */}
      <div className="border-t border-[#F5F1F0]/10 pt-5">
        <button
          type="button"
          onClick={() => setShowOptional((prev) => !prev)}
          aria-expanded={showOptional}
          className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-[#54D9FF] transition hover:text-[#F5F1F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF]"
        >
          <span>
            {showOptional
              ? "Hide optional evaluation context"
              : "Add optional query, reference answer, or tool trace"}
          </span>
          {showOptional ? (
            <ChevronUp size={15} aria-hidden="true" />
          ) : (
            <ChevronDown size={15} aria-hidden="true" />
          )}
        </button>

        {showOptional ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* Optional Original Query */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <label
                  htmlFor="submission-query"
                  className="font-heading text-sm font-semibold text-[#F5F1F0]"
                >
                  Original user query
                </label>
                <span className="font-mono text-[11px] text-[#A6ADBF]">
                  Enables Query Alignment (20%)
                </span>
              </div>
              <input
                id="submission-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isBusy}
                placeholder="Optional: paste the original prompt or question given to the model..."
                className="w-full rounded-xl border border-[#F5F1F0]/12 bg-[#080910]/75 px-4 py-3 font-body text-sm text-[#F5F1F0] placeholder:text-[#A6ADBF]/45 transition focus:border-[#E344C5]/65 focus:outline-none focus:ring-2 focus:ring-[#E344C5]/25 disabled:cursor-not-allowed disabled:opacity-65"
              />
            </div>

            {/* Optional Reference Answer */}
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <label
                  htmlFor="submission-reference"
                  className="font-heading text-sm font-semibold text-[#F5F1F0]"
                >
                  Reference answer
                </label>
                <span className="font-mono text-[11px] text-[#A6ADBF]">
                  Enables Semantic Similarity (15%)
                </span>
              </div>
              <textarea
                id="submission-reference"
                value={referenceAnswer}
                onChange={(e) => setReferenceAnswer(e.target.value)}
                rows={4}
                disabled={isBusy}
                placeholder="Optional: provide a ground-truth or expected answer..."
                className="w-full rounded-xl border border-[#F5F1F0]/12 bg-[#080910]/75 px-4 py-3 font-body text-sm leading-relaxed text-[#F5F1F0] placeholder:text-[#A6ADBF]/45 transition focus:border-[#54D9FF]/65 focus:outline-none focus:ring-2 focus:ring-[#54D9FF]/25 disabled:cursor-not-allowed disabled:opacity-65"
              />
            </div>

            {/* Optional Tool Trace (JSON list[dict]) */}
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <label
                  htmlFor="submission-tool-trace"
                  className="font-heading text-sm font-semibold text-[#F5F1F0]"
                >
                  Tool execution trace (JSON array)
                </label>
                <span className="font-mono text-[11px] text-[#A6ADBF]">
                  Enables Tool Calling (15%)
                </span>
              </div>
              <textarea
                id="submission-tool-trace"
                value={toolTraceRaw}
                onChange={(e) => {
                  setToolTraceRaw(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                rows={4}
                disabled={isBusy}
                placeholder='Optional JSON array, e.g. [{"tool": "lookup", "args": {"id": 1}, "output": "ok"}]'
                className="w-full rounded-xl border border-[#F5F1F0]/12 bg-[#080910]/75 px-4 py-3 font-mono text-xs leading-relaxed text-[#F5F1F0] placeholder:text-[#A6ADBF]/45 transition focus:border-[#FF815D]/65 focus:outline-none focus:ring-2 focus:ring-[#FF815D]/25 disabled:cursor-not-allowed disabled:opacity-65"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Inline Validation Message */}
      {validationError ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#E344C5]/45 bg-[#32126F]/35 px-5 py-3.5 font-body text-sm text-[#F5F1F0]"
        >
          {validationError}
        </div>
      ) : null}

      {/* Submit Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="font-mono text-xs text-[#A6ADBF]">
          Omitted optional fields are excluded from weighted scoring, never
          scored zero.
        </p>

        <button
          type="submit"
          disabled={isBusy || !content.trim()}
          className="group inline-flex min-h-[48px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#F5F1F0] px-7 py-3.5 font-body text-sm font-semibold text-[#080910] shadow-[0_12px_36px_rgba(8,9,16,0.55)] transition duration-200 hover:bg-[#54D9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080910] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[#F5F1F0]"
        >
          {isBusy ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-[#080910]/30 border-t-[#080910]"
            />
          ) : null}
          <span>{buttonLabel}</span>
          {!isBusy ? (
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          ) : null}
        </button>
      </div>
    </form>
  );
}
