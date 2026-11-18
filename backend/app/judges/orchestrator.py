import asyncio, json, time
from dataclasses import dataclass
from statistics import mean, pstdev
import httpx
from app.config import get_settings
from app.judges.prompts import build_scoring_prompt
import random
from app.judges.metrics import compute_metrics

settings = get_settings()

def _safe_provider_error(exc: Exception) -> str:
    """Return useful provider diagnostics without exposing raw response details."""

    if isinstance(exc, httpx.HTTPStatusError):
        status = exc.response.status_code

        if status in (401, 403):
            return f"Provider authentication failed (HTTP {status})."
        if status == 429:
            return "Provider rate limit reached (HTTP 429)."
        if status >= 500:
            return f"Provider service unavailable (HTTP {status})."
        return f"Provider rejected the request (HTTP {status})."

    if isinstance(exc, httpx.TimeoutException):
        return "Provider request timed out."

    if isinstance(exc, httpx.RequestError):
        return "Network error while contacting the provider."

    if isinstance(exc, json.JSONDecodeError):
        return "Provider returned invalid JSON."

    if isinstance(exc, KeyError):
        return "Provider response was missing an expected field."

    if isinstance(exc, (ValueError, TypeError, IndexError)):
        return "Provider returned an invalid response format or score."

    return "Unexpected provider error. Check backend logs for details."

@dataclass
class JudgeOutcome:
    model_name: str
    score: float
    reasoning: str
    criterion_scores: dict
    confidence: float | None
    latency_ms: int
    error: str | None = None

async def _call_groq(client, model, prompt, api_key):
    resp = await client.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.0,
            "response_format": {"type": "json_object"},
        },
        timeout=settings.judge_timeout_seconds,
    )
    resp.raise_for_status()
    return json.loads(resp.json()["choices"][0]["message"]["content"])

async def _call_gemini(client, model, prompt, api_key):
    resp = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        headers={"x-goog-api-key": api_key},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.0,
                "responseMimeType": "application/json",
            },
        },
        timeout=settings.judge_timeout_seconds,
    )
    resp.raise_for_status()
    text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)

async def _mock_judge(model_name: str, prompt: str) -> JudgeOutcome:
    """Simulates a judge response instantly, no network call, no API cost.
    Used for testing the request/response flow, aggregation, and caching
    logic in isolation from the actual LLM providers."""
    await asyncio.sleep(0.3)  # simulate a bit of latency so loading states are visible
    score = round(random.uniform(5.0, 9.5), 1)
    return JudgeOutcome(
        model_name=model_name,
        score=score,
        reasoning=f"[MOCK] This is a simulated evaluation from {model_name}, standing in for a real API call during testing.",
        criterion_scores={"overall_quality": score},
        confidence=round(random.uniform(0.6, 0.95), 2),
        latency_ms=300,
    )

async def _run_single_judge(client, model_name, prompt):
    provider, _, model = model_name.partition(":")
    api_key = {"groq": settings.groq_api_key, "gemini": settings.gemini_api_key}.get(provider)
    if not api_key:
        return JudgeOutcome(model_name, 0, "", {}, None, 0, error=f"no API key for {provider}")

    start = time.monotonic()
    try:
        if provider == "groq":
            parsed = await _call_groq(client, model, prompt, api_key)
        elif provider == "gemini":
            parsed = await _call_gemini(client, model, prompt, api_key)
        else:
            return JudgeOutcome(model_name, 0, "", {}, None, 0, error=f"unknown provider {provider}")

        latency_ms = int((time.monotonic() - start) * 1000)
        return JudgeOutcome(
            model_name=model_name,
            score=float(parsed["overall_score"]),
            reasoning=parsed.get("reasoning", ""),
            criterion_scores={
                k: None if v is None else float(v)
                for k, v in parsed.get("criterion_scores", {}).items()
            },
            confidence=parsed.get("confidence"),
            latency_ms=latency_ms,
        )
    except Exception as exc:
        return JudgeOutcome(
            model_name,
            0,
            "",
            {},
            None,
            int((time.monotonic() - start) * 1000),
            error=_safe_provider_error(exc),
        )

# async def run_judges(content, content_type, criteria, judges):
#     judges = judges[: settings.max_judges_per_request]
#     prompt = build_scoring_prompt(content, content_type, criteria)
#     async with httpx.AsyncClient() as client:
#         return await asyncio.gather(*[_run_single_judge(client, j, prompt) for j in judges])

# TEST RUN_JUDGES
async def run_judges(
    content,
    content_type,
    criteria,
    judges,
    query=None,
    reference_answer=None,
    tool_trace=None,
):
    judges = judges[: settings.max_judges_per_request]

    prompt = build_scoring_prompt(
        content=content,
        content_type=content_type,
        criteria=criteria,
        query=query,
        reference_answer=reference_answer,
        tool_trace=tool_trace,
    )

    if settings.mock_judges:
        return await asyncio.gather(
            *[_mock_judge(j, prompt) for j in judges]
        )

    async with httpx.AsyncClient() as client:
        return await asyncio.gather(
            *[
                _run_single_judge(client, j, prompt)
                for j in judges
            ]
        )
    
def aggregate(
    outcomes,
    historical_scores: list[float] | None = None,
    criterion_weights: dict[str, float] | None = None,
):
    return compute_metrics(
        outcomes,
        historical_scores,
        criterion_weights,
    )