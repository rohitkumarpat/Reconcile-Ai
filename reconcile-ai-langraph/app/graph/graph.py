from langgraph.graph import StateGraph, END

from app.graph.state import AgentState
from app.graph.nodes import categorize_node, analyze_node


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("categorize", categorize_node)
    graph.add_node("analyze", analyze_node)

    graph.set_entry_point("categorize")
    graph.add_edge("categorize", "analyze")
    graph.add_edge("analyze", END)

    return graph.compile()


agent_graph = build_graph()