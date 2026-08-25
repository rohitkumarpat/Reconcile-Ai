import json
from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import GEMINI_API_KEY
from app.graph.state import AgentState
from app.schemas import CategorizedTransaction


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

    response = llm.invoke(prompt)
    parsed = json.loads(response.content)

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