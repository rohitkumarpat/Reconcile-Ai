from langgraph.graph import StateGraph, END

from app.graph.state import AgentState
from app.graph.nodes import categorize_node, analyze_node
from app.graph.nodes import (
    categorize_node,
    analyze_node,
    duplicate_detection_node,
    subscription_detection_node,
    anomaly_detection_node,
    explain_anomalies_node,
)

def route_after_anomaly_detection(state: AgentState) -> str:
    """Conditional edge: only call the LLM explain node if anomalies were actually found."""
    return "explain" if state["anomalies"] else "end"

def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("categorize", categorize_node)
    graph.add_node("analyze", analyze_node)
    graph.add_node("duplicate_detection", duplicate_detection_node)
    graph.add_node("subscription_detection", subscription_detection_node)
    graph.add_node("anomaly_detection", anomaly_detection_node)
    graph.add_node("explain", explain_anomalies_node)

    graph.set_entry_point("categorize")
    graph.add_edge("categorize", "analyze")
    graph.add_edge("analyze", "duplicate_detection")
    graph.add_edge("duplicate_detection", "subscription_detection")
    graph.add_edge("subscription_detection", "anomaly_detection")

    graph.add_conditional_edges(
    "anomaly_detection",
    route_after_anomaly_detection,
    {"explain": "explain", "end": END},
    )

    graph.add_edge("explain", END)

    return graph.compile()


agent_graph = build_graph()