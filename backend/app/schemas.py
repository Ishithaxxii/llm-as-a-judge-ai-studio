from datetime import datetime
from pydantic import BaseModel, Field

class Criterion(BaseModel):
    name: str
    description: str
    weight: float = 1.0
    scale: int = 10

class RubricCreate(BaseModel):
    name: str
    domain: str
    criteria: list[Criterion]

class RubricOut(RubricCreate):
    id: str
    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    content: str
    query: str | None = None
    reference_answer: str | None = None
    tool_trace: list[dict] | None = None
    content_type: str = "text"
    rubric_id: str | None = None


class SubmissionOut(BaseModel):
    id: str
    content: str
    query: str | None = None
    reference_answer: str | None = None
    tool_trace: list[dict] | None = None
    content_type: str
    rubric_id: str | None
    created_at: datetime | None = None
    model_config = {"from_attributes": True}


class JudgeRequest(BaseModel):
    submission_id: str
    judges: list[str] | None = None

class JudgeResultOut(BaseModel):
    model_name: str
    score: float
    reasoning: str
    criterion_scores: dict[str, float | None]
    confidence: float | None
    latency_ms: int | None
    model_config = {"from_attributes": True}

class FailedJudgeOut(BaseModel):
    model_name: str
    error: str

class JudgeResponse(BaseModel):
    submission_id: str
    results: list[JudgeResultOut]
    failed_judges: list[FailedJudgeOut] = Field(default_factory=list)
    aggregate_score: float
    flagged_disagreement: bool = False
    agreement: float | None = None
    jaccard: float | None = None
    cosine: float | None = None
    z_score: float | None = None
    score_std: float = 0.0
    num_valid_judges: int = 0
