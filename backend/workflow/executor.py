"""
Core HITL execution engine.

Calls individual agent node functions directly (bypassing graph.invoke).
Each call runs one step, updates session state, and returns structured output.
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor

from agents.problem_analyst import problem_analyst_node
from agents.opportunity_planner import opportunity_planner_node
from agents.idea_generator import idea_generator_node
from agents.idea_validator import idea_validator_node
from agents.solution_architect import solution_architect_node
from agents.presentation_agent import presentation_agent_node
from agents.pitch_agent import pitch_agent_node
from agents.report_generator import report_generator_node
from agents.ppt_designer import ppt_designer_node


from workflow.session_store import get_session, save_session
from workflow.steps import get_next_step, get_step

_executor = ThreadPoolExecutor(max_workers=4)

# Maps step key → agent node function
AGENT_NODES: dict = {
    "problem_analyst": problem_analyst_node,
    "opportunity_planner": opportunity_planner_node,
    "idea_generator": idea_generator_node,
    "idea_validator": idea_validator_node,
    "solution_architect": solution_architect_node,
    "presentation_agent": presentation_agent_node,
    "ppt_designer": ppt_designer_node,
    "pitch_agent": pitch_agent_node,
    "report_generator": report_generator_node,
    # "select_idea" is intentionally absent — it's a user action, not an agent
}


async def execute_step(session_id: str, step_key: str) -> dict:
    """
    Execute a single agent step:
      1. Load state from session store
      2. Run the agent node in a thread pool (non-blocking)
      3. Merge agent output back into session state
      4. Persist updated session
      5. Return structured response for the API layer
    """
    session = get_session(session_id)
    if not session:
        raise ValueError(f"Session '{session_id}' not found")

    node_fn = AGENT_NODES.get(step_key)
    if not node_fn:
        raise ValueError(f"No agent registered for step '{step_key}'")

    state: dict = session["state"]

    # Run the blocking LLM call off the asyncio event loop
    loop = asyncio.get_event_loop()
    output: dict = await loop.run_in_executor(_executor, node_fn, state)

    # Merge agent output into the running AgentState
    state.update(output)

    next_step = get_next_step(step_key)

    session["completed_steps"].append(step_key)
    session["step_outputs"][step_key] = output
    session["current_step"] = next_step
    session["state"] = state
    save_session(session_id, session)

    step_meta = get_step(step_key)
    next_meta = get_step(next_step)

    return {
        "session_id": session_id,
        "completed_step": step_key,
        "completed_step_label": step_meta["label"] if step_meta else step_key,
        "output": output,
        "next_step": next_step,
        "next_step_label": next_meta["label"] if next_meta else None,
        "next_is_select_step": next_meta.get("is_select_step", False) if next_meta else False,
        "done": next_step is None,
    }
