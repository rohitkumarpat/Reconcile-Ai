from fastapi import FastAPI, Header, HTTPException

from app.schemas import AgentRunRequest, AgentRunResponse
from app.graph.graph import agent_graph
from app.config import NODE_BACKEND_SECRET


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
    verify_secret(x_internal_secret)

    result = agent_graph.invoke({
        "transactions": payload.transactions,
        "categorized": [],
        "summary": {},
    })

    return AgentRunResponse(
        categorized=result["categorized"],
        summary=result["summary"],
    )