import json
from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import GEMINI_API_KEY
from app.graph.state import AgentState
from app.schemas import CategorizedTransaction
import time
from datetime import datetime
from collections import defaultdict
from app.schemas import DuplicateFlag, SubscriptionResult, AnomalyResult,RecommendationResult,DraftResult


llm = ChatGoogleGenerativeAI(
    model="gemini-3.7-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0,
)


CATEGORIES = [
    "Food",
    "Shopping",
    "Transport",
    "Entertainment",
    "Bills",
    "Subscriptions",
    "Education",
    "Healthcare",
    "Other",
]


def categorize_node(state: AgentState) -> AgentState:
    """LLM node: assign a category + confidence to each transaction."""

    items = [
        {
            "id": t.id,
            "merchant": t.merchant,
            "amount": t.amount,
        }
        for t in state["transactions"]
    ]

    prompt = f"""Categorize each transaction into exactly one of: {CATEGORIES}.

Return ONLY JSON:
{{"results": [{{"id": "string", "category": "string", "confidence": 0.0}}]}}

Transactions:
{json.dumps(items)}
"""

    start = time.time()

    response = llm.invoke(prompt)

    print(f"Gemini took {time.time() - start:.2f} seconds")
    print("GEMINI RESPONSE:")
   
    text = response.text.strip()
    if text.startswith("```"):
     text = text.replace("```json", "").replace("```", "").strip()

    parsed = json.loads(text)

    categorized = [
        CategorizedTransaction(
            id=r["id"],
            category=r["category"],
            confidence=r["confidence"],
        )
        for r in parsed["results"]
    ]

    return {
        **state,
        "categorized": categorized,
    }


def analyze_node(state: AgentState) -> AgentState:
    """Deterministic node: aggregate spend by category."""

    totals: dict[str, float] = {}
    by_id = {t.id: t for t in state["transactions"]}

    for c in state["categorized"]:
        txn = by_id[c.id]
        totals[c.category] = totals.get(c.category, 0) + txn.amount

    summary = {
        "total_spend": sum(totals.values()),
        "by_category": totals,
        "transaction_count": len(state["transactions"]),
    }

    return {
        **state,
        "summary": summary,
    }


def duplicate_detection_node(state: AgentState) -> AgentState:
    """Deterministic: same merchant + same amount within 3 days = likely duplicate."""
    txns = sorted(state["transactions"], key=lambda t: t.date)
    duplicates = []

    for i, t1 in enumerate(txns):
        for t2 in txns[i + 1:]:
            d1 = datetime.fromisoformat(t1.date)
            d2 = datetime.fromisoformat(t2.date)

            if (t1.merchant == t2.merchant and t1.amount == t2.amount
                    and abs((d2 - d1).days) <= 3):
                duplicates.append(DuplicateFlag(
                    transaction_id=t2.id,
                    duplicate_of_id=t1.id,
                    confidence=0.9
                ))

    return {**state, "duplicates": duplicates}


def subscription_detection_node(state: AgentState) -> AgentState:
    """Deterministic: same merchant + same amount recurring ~monthly (3+ occurrences)."""
    by_merchant: dict[tuple[str, float], list[str]] = defaultdict(list)
    dates_by_key: dict[tuple[str, float], list[datetime]] = defaultdict(list)

    for t in state["transactions"]:
        key = (t.merchant, t.amount)
        by_merchant[key].append(t.id)
        dates_by_key[key].append(datetime.fromisoformat(t.date))

    subscriptions = []

    for (merchant, amount), ids in by_merchant.items():
        if len(ids) < 3:
            continue

        dates = sorted(dates_by_key[(merchant, amount)])
        gaps = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
        avg_gap = sum(gaps) / len(gaps)

        if 25 <= avg_gap <= 35:
            frequency = "monthly"
        elif 6 <= avg_gap <= 8:
            frequency = "weekly"
        elif 350 <= avg_gap <= 380:
            frequency = "yearly"
        else:
            continue

        subscriptions.append(SubscriptionResult(
            merchant=merchant,
            amount=amount,
            frequency=frequency,
            transaction_ids=ids
        ))

    return {**state, "subscriptions": subscriptions}



def anomaly_detection_node(state: AgentState) -> AgentState:
    """Deterministic: flag transactions > 2x the user's average for that category."""
    by_category: dict[str, list[float]] = defaultdict(list)
    cat_by_txn_id = {c.id: c.category for c in state["categorized"]}

    for t in state["transactions"]:
        cat = cat_by_txn_id.get(t.id, "Other")
        by_category[cat].append(t.amount)

    averages = {
        cat: sum(amts) / len(amts)
        for cat, amts in by_category.items()
    }

    anomalies = []

    for t in state["transactions"]:
        cat = cat_by_txn_id.get(t.id, "Other")
        avg = averages.get(cat, 0)

        if avg > 0 and t.amount > avg * 2:
            anomalies.append(AnomalyResult(
                transaction_id=t.id,
                type="UNUSUAL_SPENDING",
                explanation="",
                confidence=min(t.amount / (avg * 2), 1.0) if avg else 0.5,
            ))

    return {**state, "anomalies": anomalies}



def explain_anomalies_node(state: AgentState) -> AgentState:
    """LLM node: only runs when anomalies exist — generates human-readable explanations."""
    if not state["anomalies"]:
        return state

    by_id = {t.id: t for t in state["transactions"]}
    items = [
        {
            "id": a.transaction_id,
            "merchant": by_id[a.transaction_id].merchant,
            "amount": by_id[a.transaction_id].amount
        }
        for a in state["anomalies"]
    ]

    prompt = f"""For each flagged transaction, write a one-sentence plain-English explanation
of why it's unusual spending, in the style of a financial assistant. Return ONLY JSON:
{{"explanations": [{{"id": str, "explanation": str}}]}}

Transactions:
{json.dumps(items)}
"""

    response = llm.invoke(prompt)
  
    parsed = json.loads(response.content[0]["text"])
    explanation_map = {
        e["id"]: e["explanation"]
        for e in parsed["explanations"]
    }

    updated_anomalies = [
        AnomalyResult(
            transaction_id=a.transaction_id,
            type=a.type,
            explanation=explanation_map.get(
                a.transaction_id,
                "Unusual spending detected."
            ),
            confidence=a.confidence,
        )
        for a in state["anomalies"]
    ]

    return {**state, "anomalies": updated_anomalies}


def recommend_node(subscriptions: list, anomalies: list) -> list[RecommendationResult]:
    items = (
        [{"index": i, "kind": "subscription", "merchant": s.merchant, "amount": s.amount, "frequency": s.frequency} for i, s in enumerate(subscriptions)]
        + [{"index": i + len(subscriptions), "kind": "anomaly", "transaction_id": a.transaction_id, "explanation": a.explanation} for i, a in enumerate(anomalies)]
    )
    if not items:
        return []

    prompt = f"""For each item, write a one-sentence recommendation and choose an action_type.
Return ONLY JSON: {{"results": [{{"source_index": int, "subject_merchant": str, "text": str, "action_type": "CANCELLATION_EMAIL" or "NEGOTIATION_MESSAGE"}}]}}
"source_index" must exactly match the "index" field of the item you're responding to.

Items:
{json.dumps(items)}
"""
    response = llm.invoke(prompt)
    parsed = json.loads(response.content[0]["text"])
    return [RecommendationResult(**r) for r in parsed["results"]]



def draft_node(recommendations: list[RecommendationResult]) -> list[DraftResult]:
    """LLM: generate the actual draft message text. Never sent — draft only."""
    if not recommendations:
        return []

    items = [
        {
            "i": i,
            "merchant": r.subject_merchant,
            "type": r.action_type
        }
        for i, r in enumerate(recommendations)
    ]

    prompt = f"""Write a polite, concise cancellation or negotiation message for each item, addressed
to the merchant's support team. Return ONLY JSON: {{"drafts": [{{"recommendation_index": int, "draft_text": str}}]}}

Items:
{json.dumps(items)}
"""

    response = llm.invoke(prompt)
    parsed = json.loads(response.content[0]["text"])

    return [DraftResult(**d) for d in parsed["drafts"]]