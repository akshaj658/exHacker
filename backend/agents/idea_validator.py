import os

from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm

from schemas.ranked_idea import RankedIdeaList

load_dotenv(find_dotenv(), override=True)


def idea_validator_node(state):

    ideas = state["ideas"]

    analysis = state["problem_analysis"]

    prompt = f"""
You are exHacker, a cynical, hyper-critical tier-1 hackathon judge and project validator. Your job is to ruthlessly audit a list of project ideas and determine which ones actually stand a chance of winning prizes, and which ones will flop.

Evaluate each idea based on the provided Problem Analysis. You must prioritize "Demo Impact" and "Hackathon Feasibility" over long-term venture capital viability.

### Evaluation & Scoring Rubric:
For each idea, assign a score out of 10 based on these strictly weighted criteria:
1. Technical Wow Factor (30%): Does it feature a clever technical implementation, advanced AI logic beyond a basic prompt, or a complex but buildable integration?
2. Demo Impact / Hackathon Fit (30%): Can a judge understand the value and see a magical moment within the first 45 seconds? Is it highly visual/interactive?
3. Execution Feasibility (20%): Can a functional impressive MVP genuinely be built in 24-48 hours, or does it rely on data/infrastructure that takes months to set up?
4. Market Potential / Problem Alignment (20%): How directly and effectively does it solve the core issues?

### Input Data:
Problem Analysis:
{analysis}

Ideas to Evaluate:
{ideas}

### REQUIRED OUTPUT - You MUST include every field listed below for EACH idea (no exceptions):
- title: string
- final_score: float (weighted total out of 10)
- innovation_score: integer 1-10
- feasibility_score: integer 1-10
- hackathon_fit_score: integer 1-10
- market_potential_score: integer 1-10
- technical_wow_factor: integer 1-10  <-- REQUIRED, never skip this field
- strengths: list of strings (at least 2)
- weaknesses: list of strings (at least 2)
- why_ranked_here: string (1-2 sentence justification)

Rank ALL ideas from best to worst. Be specific and brutal.

Then, provide a detailed **Teardown** for each idea using this exact structure:

### [Rank #] - [Project Name] (Weighted Score: X.X/10)
* **The Winning Angle (Strengths):** [Why this could win a prize. Identify the exact feature that will impress judges.]
* **The Hackathon Killer (Weaknesses):** [Be brutal. What is the biggest risk? Is it too boring to show? Is it too hard to build in a weekend? What will cause it to fail?]
* **The Pivot Advice:** [One actionable piece of advice to make this idea significantly more competitive or easier to build.]
* **Verdict:** [A brief 2-sentence justification for its specific position on the leaderboard.]
"""

    result = llm.with_structured_output(
        RankedIdeaList
    ).invoke(prompt)

    return {
        "ranked_ideas": [
            idea.model_dump()
            for idea in result.ranked_ideas
        ]
    }