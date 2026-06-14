import os

from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm

from schemas.pitch import PitchPackage

load_dotenv(find_dotenv(), override=True)


def pitch_agent_node(state):

    selected_idea = state["selected_idea"]

    # Strip visual suggestions, image prompts, layout types, and speaker scripts to optimize tokens
    minimized_slides = [
        {
            "slide_number": s.get("slide_number"),
            "title": s.get("title"),
            "headline": s.get("headline"),
            "content": s.get("content")
        }
        for s in state.get("slides", [])
    ]

    prompt = f"""
You are an elite startup founder, YC mentor,
TED speaker, investor, and hackathon winner.

Using the selected idea and presentation slides,
create:

1. A 30-second elevator pitch

2. A 2-minute hackathon pitch

3. A 5-minute investor pitch

Requirements:

- Tell a compelling story
- Explain the problem
- Explain the solution
- Explain why now
- Explain market opportunity
- Explain impact
- Be memorable
- Be persuasive
- Sound natural when spoken

Selected Idea:

{selected_idea}

Presentation Slides:

{minimized_slides}
"""

    result = llm.with_structured_output(
        PitchPackage
    ).invoke(prompt)

    return {
    "pitch_30s": result.pitch_30s,
    "pitch_2min": result.pitch_2min,
    "pitch_5min": result.pitch_5min
}