from app.graph.graph import agent_graph
from app.schemas import TransactionIn


transactions = [
    {
        "id": "t1",
        "merchant": "Netflix",
        "amount": 500,
        "date": "2026-08-01",
    },
    {
        "id": "t2",
        "merchant": "Netflix",
        "amount": 500,
        "date": "2026-08-02",
    },
    {
        "id": "t3",
        "merchant": "Netflix",
        "amount": 500,
        "date": "2026-09-01",
    },
    {
        "id": "t4",
        "merchant": "Netflix",
        "amount": 500,
        "date": "2026-10-01",
    },
    {
        "id": "t5",
        "merchant": "Food Shop",
        "amount": 100,
        "date": "2026-08-01",
    },
    {
        "id": "t6",
        "merchant": "Food Shop",
        "amount": 120,
        "date": "2026-08-02",
    },
    {
        "id": "t7",
        "merchant": "Food Shop",
        "amount": 150,
        "date": "2026-08-03",
    },
    {
        "id": "t8",
        "merchant": "Food Shop",
        "amount": 1000,
        "date": "2026-08-04",
    },
]


result = agent_graph.invoke({
    "transactions": [TransactionIn(**t) for t in transactions],
    "categorized": [],
    "summary": {},
    "duplicates": [],
    "subscriptions": [],
    "anomalies": [],
})

print("\n========== DAY 6 TEST ==========")

print("\nDUPLICATES:")
print(result["duplicates"])

print("\nSUBSCRIPTIONS:")
print(result["subscriptions"])

print("\nANOMALIES:")
print(result["anomalies"])