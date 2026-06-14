import asyncio
import traceback
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

import os
from dotenv import load_dotenv

# Deterministically load the .env file from the root directory with override=True
api_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(api_dir)
root_dir = os.path.dirname(backend_dir)
env_path = os.path.join(root_dir, ".env")
load_dotenv(dotenv_path=env_path, override=True)


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph.workflow import graph
from schemas.project_request import ProjectRequest

from workflow.session_store import create_session, get_session, save_session
from workflow.executor import execute_step
from workflow.steps import STEPS, get_step, get_next_step


app = FastAPI(title="exHacker API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Production frontend
        "https://ex-hacker.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# Thread pool for legacy /generate endpoint
_executor = ThreadPoolExecutor(max_workers=4)


# ─── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "exHacker API Running", "version": "2.0.0"}


# ─── Legacy one-shot endpoint (kept for backwards compatibility) ───────────────

@app.post("/generate")
async def generate(data: ProjectRequest):
    """
    Legacy endpoint: runs all agents sequentially and returns the full result.
    Kept so the old /results page still works.
    """
    initial_state = {
        "challenge_statement": data.challenge_statement,
        "hackathon_name": data.hackathon_name,
        "sponsors": data.sponsors,
        "tracks": data.tracks,
        "problem_analysis": {},
        "opportunity_analysis": {},
        "ideas": [],
        "ranked_ideas": [],
        "selected_idea": {},
        "solution_blueprint": {},
        "slides": [],
        "ppt_design": {},
        "pitch_30s": "",
        "pitch_2min": "",
        "pitch_5min": "",
        "final_report": "",
        "prd_document": "",
        "vision_document": "",
    }
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_executor, graph.invoke, initial_state)
        return result
    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[/generate ERROR]\n{tb}")
        raise HTTPException(status_code=500, detail=str(exc))


# ─── HITL Workflow — Request models ───────────────────────────────────────────

class WorkflowStartRequest(BaseModel):
    challenge_statement: str
    hackathon_name: str = ""
    sponsors: list[str] = []
    tracks: list[str] = []


class WorkflowContinueRequest(BaseModel):
    session_id: str


class WorkflowSelectIdeaRequest(BaseModel):
    session_id: str
    idea_index: int
    idea: Optional[dict] = None   # Optional: user-edited idea fields override the ranked idea


class WorkflowUpdateOutputRequest(BaseModel):
    session_id: str
    step: str
    updates: dict


# ─── HITL Workflow — Endpoints ─────────────────────────────────────────────────

@app.post("/workflow/start")
async def workflow_start(data: WorkflowStartRequest):
    """
    Create a new workflow session and immediately run the first step (Problem Analyst).
    Returns: session_id + first step output.
    """
    initial_state = {
        "challenge_statement": data.challenge_statement,
        "hackathon_name": data.hackathon_name,
        "sponsors": data.sponsors,
        "tracks": data.tracks,
        "problem_analysis": {},
        "opportunity_analysis": {},
        "ideas": [],
        "ranked_ideas": [],
        "selected_idea": {},
        "solution_blueprint": {},
        "slides": [],
        "ppt_design": {},
        "pitch_30s": "",
        "pitch_2min": "",
        "pitch_5min": "",
        "final_report": "",
        "prd_document": "",
        "vision_document": "",
    }
    session_id = create_session(initial_state)

    try:
        result = await execute_step(session_id, "problem_analyst")
        return result
    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[/workflow/start ERROR]\n{tb}")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/workflow/continue")
async def workflow_continue(data: WorkflowContinueRequest):
    """
    Run the next pending agent step for an existing session.
    Blocks until the agent completes, then returns its output.
    Returns 400 if the current step is 'select_idea' (user must select via /workflow/select-idea first).
    """
    session = get_session(data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    current_step = session.get("current_step")

    if current_step is None:
        return {"done": True, "message": "Workflow is already complete"}

    step_meta = get_step(current_step)
    if step_meta and step_meta.get("is_select_step"):
        raise HTTPException(
            status_code=400,
            detail="This step requires manual idea selection. Use POST /workflow/select-idea instead.",
        )

    try:
        result = await execute_step(data.session_id, current_step)
        return result
    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[/workflow/continue ERROR]\n{tb}")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/workflow/select-idea")
async def workflow_select_idea(data: WorkflowSelectIdeaRequest):
    """
    User manually selects (and optionally edits) an idea from the ranked list.
    Advances current_step → solution_architect.
    """
    session = get_session(data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.get("current_step") != "select_idea":
        raise HTTPException(
            status_code=400,
            detail=f"Expected step 'select_idea', current step is '{session.get('current_step')}'",
        )

    state: dict = session["state"]
    ranked_ideas: list = state.get("ranked_ideas", [])
    ideas: list = state.get("ideas", [])

    if not ranked_ideas:
        raise HTTPException(status_code=400, detail="No ranked ideas in session state")

    if not (0 <= data.idea_index < len(ranked_ideas)):
        raise HTTPException(
            status_code=400,
            detail=f"idea_index {data.idea_index} is out of range (0–{len(ranked_ideas) - 1})",
        )

    if data.idea:
        # User provided custom / edited idea
        selected_idea = data.idea
    else:
        # Merge ranked idea with original idea (by title) for richer context
        ranked = ranked_ideas[data.idea_index]
        title = ranked.get("title", "")
        original = next((i for i in ideas if i.get("title") == title), {})
        selected_idea = {**original, **ranked}

    state["selected_idea"] = selected_idea

    next_step = get_next_step("select_idea")   # → "solution_architect"
    session["current_step"] = next_step
    session["completed_steps"].append("select_idea")
    session["step_outputs"]["select_idea"] = {"selected_idea": selected_idea}
    session["state"] = state
    save_session(data.session_id, session)

    next_meta = get_step(next_step)

    return {
        "session_id": data.session_id,
        "completed_step": "select_idea",
        "completed_step_label": "Idea Selection",
        "selected_idea": selected_idea,
        "next_step": next_step,
        "next_step_label": next_meta["label"] if next_meta else None,
        "next_is_select_step": False,
        "done": next_step is None,
    }


@app.post("/workflow/update-output")
async def workflow_update_output(data: WorkflowUpdateOutputRequest):
    """
    Allow the user to edit a completed step's output before continuing.
    Updates both the cached step output and the running AgentState.
    """
    session = get_session(data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if data.step not in session["completed_steps"]:
        raise HTTPException(
            status_code=400,
            detail=f"Step '{data.step}' has not been completed yet",
        )

    session["step_outputs"][data.step].update(data.updates)
    session["state"].update(data.updates)
    save_session(data.session_id, session)

    return {"ok": True, "step": data.step, "updated_keys": list(data.updates.keys())}


@app.get("/workflow/state/{session_id}")
async def workflow_state(session_id: str):
    """
    Return the full session: AgentState + completed steps + step outputs + step metadata.
    Used by the frontend to restore state after a page reload.
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "state": session["state"],
        "current_step": session["current_step"],
        "completed_steps": session["completed_steps"],
        "step_outputs": session["step_outputs"],
        "steps_meta": STEPS,
        "done": session["current_step"] is None,
    }


@app.get("/workflow/current-step/{session_id}")
async def workflow_current_step(session_id: str):
    """Return metadata for the current (next pending) step."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    current = session["current_step"]
    return {
        "session_id": session_id,
        "current_step": current,
        "step_meta": get_step(current),
        "completed_steps": session["completed_steps"],
        "done": current is None,
    }


@app.get("/workflow/output/{session_id}")
async def workflow_output(session_id: str):
    """Return the output of the most recently completed step."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    completed: list = session["completed_steps"]
    if not completed:
        return {"step": None, "output": None}

    last = completed[-1]
    return {
        "step": last,
        "step_meta": get_step(last),
        "output": session["step_outputs"].get(last),
    }


@app.get("/workflow/download-pptx/{session_id}")
async def download_pptx(session_id: str):
    """
    Generate and download a professional, styled 13-slide pitch deck (pptx) 
    based on the strategy session output.
    """
    from fastapi.responses import StreamingResponse
    from agents.pitch_deck_generator import generate_pitch_deck_content
    from services.pptx_generator import build_pptx_presentation

    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    state = session.get("state") or {}
    selected_idea = state.get("selected_idea")
    if not selected_idea:
        raise HTTPException(
            status_code=400, 
            detail="Session has not selected an idea. Complete the strategy workflow first."
        )

    try:
        # Run pitch deck narrative agent
        loop = asyncio.get_event_loop()
        deck_data = await loop.run_in_executor(
            None, generate_pitch_deck_content, state
        )
        
        # Load Gemini Imagen API Key from environment variables
        api_key = os.getenv("GEMINI_IMAGEN_API_KEY")
        
        # Build PowerPoint with session cache and Imagen integrations
        stream = await loop.run_in_executor(
            None, build_pptx_presentation, deck_data, state, session_id, api_key
        )
        
        project_name = selected_idea.get("title", "Project").replace(" ", "_")
        filename = f"{project_name}_Pitch_Deck.pptx"

        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[/workflow/download-pptx ERROR]\n{tb}")
        raise HTTPException(status_code=500, detail=str(exc))