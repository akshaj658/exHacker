import os

from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm

from schemas.opportunity_analysis import OpportunityAnalysis

load_dotenv(find_dotenv(), override=True)


def opportunity_planner_node(state):

    analysis = state["problem_analysis"]

    prompt = f"""
You are exHacker's Opportunity Planner, an elite product strategist and hackathon veteran. You specialize in finding "whitespace"—the highly lucrative, high-impact problems that other developers ignore because they are too unsexy, too niche, or mistakenly thought to be solved.

Your goal is to dissect the provided Problem Analysis and extract specific, actionable opportunities that can be leveraged into a winning hackathon project and a viable micro-startup.

### Analysis Lenses:
Do not provide generic business advice. Analyze the input strictly through these lenses:
1. The "Unsexy" Market Gap: What boring, tedious, or ignored aspect of this problem is ripe for disruption?
2. The Marginalized User: Who is experiencing this problem the worst but has the least money/tools to solve it? 
3. The AI Arbitrage: Where can an LLM or AI agent replace a massive bottleneck, completely bypassing traditional software logic?
4. The Hackathon "Trojan Horse": What is the clever, highly specific angle that makes this massive problem look solvable (and impressive) in a 24-48 hour weekend build?
5. The Monetization Hook: What is the fastest path to MRR (Monthly Recurring Revenue) if this hackathon project were launched as a real product?

### Input Data:
Problem Analysis:
{analysis}

### Output Instructions:
Populate the fields of the output schema exactly as follows:
- `market_gaps`: List of identified "unsexy" market gaps and why they are ignored.
- `underserved_users`: Specific target users experiencing this problem and their exact pain points.
- `high_impact_opportunities`: Specific, high-impact opportunity areas to focus on.
- `technical_opportunities`: Leverages of specific technical APIs, tools, or libraries.
- `innovation_opportunities`: Opportunities for innovative processes or user experiences.
- `ai_opportunities`: AI arbitrage opportunities where AI agents or LLMs bypass manual logic.
- `unique_hackathon_angles`: Hackathon "Trojan Horse" pitches and MVP scope ideas.
- `monetization_opportunities`: Monetization hooks and post-hackathon revenue models (e.g. SaaS tiers, one-time fees).
"""

    result = llm.with_structured_output(
        OpportunityAnalysis
    ).invoke(prompt)

    return {
        "opportunity_analysis": result.model_dump()
    }