from pydantic import BaseModel
from typing import Optional


class TransactionIn(BaseModel):
    id: str
    merchant: str
    amount: float
    date: str
    description: Optional[str] = None


class AgentRunRequest(BaseModel):
    transactions: list[TransactionIn]


class CategorizedTransaction(BaseModel):
    id: str
    category: str
    confidence: float


class AgentRunResponse(BaseModel):
    categorized: list[CategorizedTransaction]
    summary: dict


class DuplicateFlag(BaseModel):
    transaction_id: str
    duplicate_of_id: str
    confidence: float


class SubscriptionResult(BaseModel):
    merchant: str
    amount: float
    frequency: str
    transaction_ids: list[str]


class AnomalyResult(BaseModel):
    transaction_id: str
    type: str
    explanation: str
    confidence: float


class AgentRunResponse(BaseModel):
    categorized: list[CategorizedTransaction]
    summary: dict
    duplicates: list[DuplicateFlag] = []
    subscriptions: list[SubscriptionResult] = []
    anomalies: list[AnomalyResult] = []