import os

from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm

from schemas.problem_analysis import ProblemAnalysis

load_dotenv(find_dotenv(), override=True)


def problem_analyst_node(state):

    challenge = state["challenge_statement"]
    
    hackathon_name = state.get("hackathon_name", "")

    sponsors = state.get("sponsors", [])

    tracks = state.get("tracks", [])

    prompt = f"""
You are the Problem Analysis Agent of exHacker.

Your ONLY responsibility is to deeply analyze the challenge.

Do NOT generate project ideas.
Do NOT generate architecture.
Do NOT recommend technologies.
Do NOT create implementation plans.

Analyze the challenge and extract:

1. Core problem statement
2. Challenge summary
3. Pain points
4. Stakeholders
5. Constraints
6. Assumptions
7. Success metrics
8. Opportunities
9. AI opportunities
10. Innovation opportunities
11. Unique hackathon angles
12. Suggested features
13. Technical challenges
14. Judging criteria alignment
15. Feasibility assessment
16. Estimated complexity (1-10)
17. Recommended project scope

Challenge:

{challenge}

Hackathon:

{hackathon_name}

Sponsors:

{sponsors}

Tracks:

{tracks}
"""

    result = llm.with_structured_output(
        ProblemAnalysis
    ).invoke(prompt)
    
    print(type(result))

    return {
        "problem_analysis": result.model_dump()
    }