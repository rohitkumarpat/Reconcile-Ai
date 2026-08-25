from typing import TypedDict
from app.schemas import TransactionIn, CategorizedTransaction, DuplicateFlag, SubscriptionResult, AnomalyResult


class AgentState(TypedDict):
    transactions: list[TransactionIn]
    categorized: list[CategorizedTransaction]
    summary: dict
    duplicates: list[DuplicateFlag]
    subscriptions: list[SubscriptionResult]
    anomalies: list[AnomalyResult]