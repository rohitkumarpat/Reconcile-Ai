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


