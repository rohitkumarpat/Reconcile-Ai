from fastapi import FastAPI, Header, HTTPException

from app.schemas import AgentRunRequest, AgentRunResponse
from app.graph.graph import agent_graph
from app.config import NODE_BACKEND_SECRET
from app.schemas import RecommendRequest, RecommendResponse
from app.graph.nodes import recommend_node, draft_node

app = FastAPI(title="ReconcileAI Agent")


def verify_secret(x_internal_secret: str = Header(...)):
    if x_internal_secret != NODE_BACKEND_SECRET:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
        )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/agent/run", response_model=AgentRunResponse)


async def run_agent(
    payload: AgentRunRequest,
    x_internal_secret: str = Header(...),
):
    print("========================================")
    print("START /agent/run")
    print("========================================")

    try:
        # 1. Check secret
        print("Checking internal secret...")
        verify_secret(x_internal_secret)
        print("Internal secret: OK")

        # 2. Check transaction count
        print(f"Number of transactions: {len(payload.transactions)}")

        # 3. Start LangGraph
        print("Starting agent_graph.invoke()...")

        result = agent_graph.invoke({
            "transactions": payload.transactions,
            "categorized": [],
            "summary": {},
            "duplicates": [],
            "subscriptions": [],
            "anomalies": [],
        })

        # 4. LangGraph finished
        print("agent_graph.invoke() completed successfully")

        print("========================================")
        print("END /agent/run - SUCCESS")
        print("========================================")

        # 5. Return result
        return AgentRunResponse(
            categorized=result["categorized"],
            summary=result["summary"],
            duplicates=result["duplicates"],
            subscriptions=result["subscriptions"],
            anomalies=result["anomalies"],
        )

    except Exception as e:
        import traceback

        print("========================================")
        print("ERROR IN /agent/run")
        print("========================================")

        print("Error type:", type(e).__name__)
        print("Error message:", str(e))

        print("Full traceback:")
        traceback.print_exc()

        print("========================================")

        raise HTTPException(
            status_code=500,
            detail=f"Agent execution failed: {str(e)}",
        )

@app.post("/agent/recommend", response_model=RecommendResponse)
async def recommend(
    payload: RecommendRequest,
    x_internal_secret: str = Header(...)
):
    verify_secret(x_internal_secret)

    recommendations = recommend_node(
        payload.subscriptions,
        payload.anomalies
    )

    drafts = draft_node(recommendations)

    return RecommendResponse(
        recommendations=recommendations,
        drafts=drafts
    )