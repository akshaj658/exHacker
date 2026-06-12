from langgraph.graph import StateGraph
from langgraph.graph import END

from schemas.state import AgentState

from agents.problem_analyst import problem_analyst_node
from agents.idea_generator import idea_generator_node
from agents.idea_validator import idea_validator_node
from agents.idea_selector import idea_selector_node
from agents.solution_architect import solution_architect_node
from agents.presentation_agent import presentation_agent_node
from agents.ppt_designer import ppt_designer_node
from agents.pitch_agent import pitch_agent_node
from agents.report_generator import report_generator_node
from agents.opportunity_planner import opportunity_planner_node

builder = StateGraph(AgentState)

# Nodes

builder.add_node(
    "problem_analyst",
    problem_analyst_node
)

builder.add_node(
    "opportunity_planner",
    opportunity_planner_node
)

builder.add_node(
    "idea_generator",
    idea_generator_node
)

builder.add_node(
    "idea_validator",
    idea_validator_node
)

builder.add_node(
    "idea_selector",
    idea_selector_node
)

builder.add_node(
    "solution_architect",
    solution_architect_node
)

builder.add_node(
    "presentation_agent",
    presentation_agent_node
)

builder.add_node(
    "ppt_designer",
    ppt_designer_node
)

builder.add_node(
    "pitch_agent",
    pitch_agent_node
)

builder.add_node(
    "report_generator",
    report_generator_node
)

# Entry Point

builder.set_entry_point(
    "problem_analyst"
)

# Edges

builder.add_edge(
    "problem_analyst",
    "opportunity_planner"
)

builder.add_edge(
    "opportunity_planner",
    "idea_generator"
)

builder.add_edge(
    "idea_generator",
    "idea_validator"
)

builder.add_edge(
    "idea_validator",
    "idea_selector"
)

builder.add_edge(
    "idea_selector",
    "solution_architect"
)

builder.add_edge(
    "solution_architect",
    "presentation_agent"
)

builder.add_edge(
    "presentation_agent",
    "ppt_designer"
)

builder.add_edge(
    "ppt_designer",
    "pitch_agent"
)

builder.add_edge(
    "pitch_agent",
    "report_generator"
)

builder.add_edge(
    "report_generator",
    END
)

# Compile Graph

graph = builder.compile()