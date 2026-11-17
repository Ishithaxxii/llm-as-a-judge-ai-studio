import { useRef, useState } from "react";
import { api } from "./api/client";
import Hero from "./Hero";
import IntelligenceEngine from "./IntelligenceEngine";
import EvaluationWorkspace from "./EvaluationWorkspace";
import SixDimensions from "./SixDimensions";
import FinalVerdict from "./FinalVerdict";

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });
}

export default function Landing() {
  const [status, setStatus] = useState("idle");
  const [submissionId, setSubmissionId] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const inFlightRef = useRef(false);

  async function runJudgeForSubmission(id) {
    setStatus("evaluating");
    const judged = await api.judge({ submission_id: id });
    if (!judged || !Array.isArray(judged.results)) {
      throw new Error("Backend returned an unexpected judge payload.");
    }
    setEvaluation(judged);
    setStatus("success");
    scrollToSection("verdict");
  }

  async function handleSubmitted(payload) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setError(null);
    setEvaluation(null);
    setSubmissionId(null);
    setStatus("submitting");

    try {
      const created = await api.createSubmission(payload);
      if (!created?.id) {
        throw new Error("Submission endpoint did not return a submission ID.");
      }
      setSubmissionId(created.id);
      await runJudgeForSubmission(created.id);
    } catch (err) {
      setError(err?.message || "Failed to evaluate submission.");
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }

  async function handleRetryJudge() {
    if (inFlightRef.current || !submissionId) return;
    inFlightRef.current = true;
    setError(null);

    try {
      await runJudgeForSubmission(submissionId);
    } catch (err) {
      setError(err?.message || "Failed to run judges for this submission.");
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }

  function handleReset() {
    if (inFlightRef.current) return;
    setStatus("idle");
    setSubmissionId(null);
    setEvaluation(null);
    setError(null);
    setResetKey((prev) => prev + 1);
    scrollToSection("workspace");
  }

  return (
    <>
      <Hero />
      <IntelligenceEngine status={status} evaluation={evaluation} />
      <EvaluationWorkspace
        status={status}
        submissionId={submissionId}
        evaluation={evaluation}
        error={error}
        resetKey={resetKey}
        onSubmitted={handleSubmitted}
        onRetryJudge={handleRetryJudge}
        onReset={handleReset}
      />
      <SixDimensions evaluation={evaluation} />
      <FinalVerdict
        evaluation={evaluation}
        status={status}
        onReset={handleReset}
      />
    </>
  );
}