from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.judges.orchestrator import JudgeOutcome, aggregate
from app.models import JudgeResult, Rubric, Submission
from app.schemas import JudgeResponse, JudgeResultOut, SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/submissions", tags=["submissions"])

DEFAULT_CRITERIA = [
    {"name": "answer_correctness", "description": "Factual accuracy and correctness of the response.", "weight": 0.25, "scale": 10},
    {"name": "relevance", "description": "How relevant and focused the response is to the subject.", "weight": 0.15, "scale": 10},
    {"name": "query_alignment", "description": "How accurately the response addresses the original user query.", "weight": 0.20, "scale": 10},
    {"name": "semantic_similarity", "description": "How closely the response matches the meaning of the reference answer.", "weight": 0.15, "scale": 10},
    {"name": "tone", "description": "Clarity, professionalism, and suitability of communication.", "weight": 0.10, "scale": 10},
    {"name": "tool_calling", "description": "Appropriateness and successful execution of tool calls.", "weight": 0.15, "scale": 10},
]


@router.post("", response_model=SubmissionOut)
async def create_submission(payload: SubmissionCreate, db: AsyncSession = Depends(get_db)):
    submission = Submission(
        content=payload.content,
        query=payload.query,
        reference_answer=payload.reference_answer,
        tool_trace=payload.tool_trace,
        content_type=payload.content_type,
        rubric_id=payload.rubric_id,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


@router.get("/{submission_id}/evaluation", response_model=JudgeResponse)
async def get_saved_evaluation(submission_id: str, db: AsyncSession = Depends(get_db)):
    """Return persisted judge outputs and recompute aggregate metrics without calling any LLM provider."""
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(404, "Submission not found")

    result = await db.execute(
        select(JudgeResult)
        .where(JudgeResult.submission_id == submission_id)
        .order_by(JudgeResult.created_at.asc(), JudgeResult.id.asc())
    )
    saved_results = result.scalars().all()
    if not saved_results:
        raise HTTPException(404, "No saved judge results exist for this submission")

    criteria = DEFAULT_CRITERIA
    if submission.rubric_id:
        rubric = await db.get(Rubric, submission.rubric_id)
        if rubric:
            criteria = rubric.criteria
    criterion_weights = {item["name"]: item["weight"] for item in criteria}

    history_result = await db.execute(
        select(JudgeResult.score)
        .where(JudgeResult.submission_id != submission.id)
        .order_by(JudgeResult.created_at.desc(), JudgeResult.id.desc())
        .limit(200)
    )
    historical_scores = [row[0] for row in history_result.all()]

    outcomes = [
        JudgeOutcome(
            item.model_name,
            item.score,
            item.reasoning,
            item.criterion_scores or {},
            item.confidence,
            item.latency_ms or 0,
        )
        for item in saved_results
    ]
    metrics = aggregate(outcomes, historical_scores, criterion_weights)

    return JudgeResponse(
        submission_id=submission.id,
        results=[JudgeResultOut.model_validate(item) for item in saved_results],
        failed_judges=[],
        aggregate_score=metrics["aggregate_score"],
        agreement=metrics["agreement"],
        flagged_disagreement=metrics["flagged_disagreement"],
        jaccard=metrics["jaccard"],
        cosine=metrics["cosine"],
        z_score=metrics["z_score"],
        score_std=metrics["score_std"],
        num_valid_judges=metrics["num_valid_judges"],
    )


@router.get("/{submission_id}", response_model=SubmissionOut)
async def get_submission(submission_id: str, db: AsyncSession = Depends(get_db)):
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(404, "Not found")
    return submission
