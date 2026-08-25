from typing import TypedDict
from app.schemas import TransactionIn, CategorizedTransaction


class AgentState(TypedDict):
    transactions: list[TransactionIn]
    categorized: list[CategorizedTransaction]
    summary: dict