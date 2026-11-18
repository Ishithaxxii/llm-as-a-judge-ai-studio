import { useEffect, useRef, useState } from "react";
import { api } from "./api/client";
import Hero from "./Hero";
import IntelligenceEngine from "./IntelligenceEngine";
import EvaluationWorkspace from "./EvaluationWorkspace";
import SixDimensions from "./SixDimensions";
import FinalVerdict from "./FinalVerdict";
import Footer from "./Footer";

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
}

export default function Landing() {
  const [status, setStatus] = useState("idle");
  const [submissionId, setSubmissionId] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const inFlightRef = useRef(false);

  async function refreshHistory() {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const items = await api.listSubmissions(30);
      setHistory(Array.isArray(items) ? items : []);
    } catch (err) {
      setHistoryError(err?.message || "Could not load recent evaluations.");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    refreshHistory();
  }, []);

  async function runJudgeForSubmission(id) {
    setStatus("evaluating");
    const judged = await api.judge({ submission_id: id });
    if (!judged || !Array.isArray(judged.results)) {
      throw new Error("Backend returned an unexpected judge payload.");
    }
    setEvaluation(judged);
    setStatus("success");
    await refreshHistory();
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
      if (!created?.id) throw new Error("Submission endpoint did not return a submission ID.");
      setSubmissionId(created.id);
      await runJudgeForSubmission(created.id);
    } catch (err) {
      setError(err?.message || "Failed to evaluate submission.");
      setStatus("error");
      await refreshHistory();
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

  async function handleSelectHistory(item) {
    if (inFlightRef.current || !item?.id) return;
    inFlightRef.current = true;
    setError(null);
    setStatus("loading-history");
    try {
      const saved = await api.getSavedEvaluation(item.id);
      if (!saved || !Array.isArray(saved.results) || saved.results.length === 0) {
        throw new Error("This submission does not have a saved evaluation yet.");
      }
      setSubmissionId(item.id);
      setEvaluation(saved);
      setStatus("success");
      scrollToSection("verdict");
    } catch (err) {
      setError(err?.message || "Could not restore this saved evaluation.");
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
        history={history}
        historyLoading={historyLoading}
        historyError={historyError}
        onRefreshHistory={refreshHistory}
        onSelectHistory={handleSelectHistory}
        onSubmitted={handleSubmitted}
        onRetryJudge={handleRetryJudge}
        onReset={handleReset}
      />
      <SixDimensions evaluation={evaluation} />
      <FinalVerdict evaluation={evaluation} status={status} onReset={handleReset} onRetryJudge={handleRetryJudge} />
      <Footer />
    </>
  );
}
