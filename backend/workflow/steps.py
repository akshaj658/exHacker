"""
Single source of truth for the ordered workflow steps.

`select_idea` is a synthetic step — it has no agent behind it.
It represents the user's manual idea selection action.
The executor skips it; the API handles it via POST /workflow/select-idea.
"""

from typing import Optional

STEPS: list[dict] = [
    {
        "key": "problem_analyst",
        "label": "Problem Analyst",
        "description": "Deep analysis of the challenge, pain points, and opportunities",
        "output_key": "problem_analysis",
        "is_select_step": False,
        "symbol": "◈",
    },
    {
        "key": "opportunity_planner",
        "label": "Opportunity Planner",
        "description": "Market gaps, AI arbitrage, and monetisation hooks",
        "output_key": "opportunity_analysis",
        "is_select_step": False,
        "symbol": "◉",
    },
    {
        "key": "idea_generator",
        "label": "Idea Generator",
        "description": "10 highly competitive hackathon project ideas",
        "output_key": "ideas",
        "is_select_step": False,
        "symbol": "◆",
    },
    {
        "key": "idea_validator",
        "label": "Idea Validator",
        "description": "Brutal scoring and ranking across 5 dimensions",
        "output_key": "ranked_ideas",
        "is_select_step": False,
        "symbol": "⚖",
    },
    {
        "key": "select_idea",
        "label": "Idea Selection",
        "description": "Choose your winning idea from the ranked list",
        "output_key": "selected_idea",
        "is_select_step": True,
        "symbol": "✦",
    },
    {
        "key": "solution_architect",
        "label": "Solution Architect",
        "description": "Complete technical blueprint and 24–48 h roadmap",
        "output_key": "solution_blueprint",
        "is_select_step": False,
        "symbol": "◉",
    },
    {
        "key": "presentation_agent",
        "label": "Presentation Agent",
        "description": "10-slide pitch deck with full speaker notes",
        "output_key": "slides",
        "is_select_step": False,
        "symbol": "▣",
    },
    {
    "key": "ppt_designer",
    "label": "PPT Designer",
    "description": "Investor-grade deck theme, layouts and image prompts",
    "output_key": "ppt_design",
    "is_select_step": False,
    "symbol": "ss",
    },
    {
        "key": "pitch_agent",
        "label": "Pitch Agent",
        "description": "30-second, 2-minute, and 5-minute pitch scripts",
        "output_key": "pitch_30s",
        "is_select_step": False,
        "symbol": "◎",
    },
    {
        "key": "report_generator",
        "label": "Report Generator",
        "description": "Complete execution report and final deliverable",
        "output_key": "final_report",
        "is_select_step": False,
        "symbol": "▤",
    },
]

STEP_KEYS: list[str] = [s["key"] for s in STEPS]


def get_step(key: Optional[str]) -> Optional[dict]:
    if not key:
        return None
    for s in STEPS:
        if s["key"] == key:
            return s
    return None


def get_next_step(current_key: str) -> Optional[str]:
    try:
        idx = STEP_KEYS.index(current_key)
        return STEP_KEYS[idx + 1] if idx + 1 < len(STEP_KEYS) else None
    except ValueError:
        return None