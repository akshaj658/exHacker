import os

from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm

from schemas.idea import IdeaList

load_dotenv(find_dotenv(), override=True)


def idea_generator_node(state):

    analysis = state["problem_analysis"]

    opportunities = state["opportunity_analysis"]

    prompt = f"""
You are exHacker, an elite hackathon veteran and Idea Generator Agent who has won multiple tier-1 hackathons. Your expertise lies in finding the perfect intersection of technical "wow-factor," real-world utility, and 24-to-48-hour feasibility.

Your goal is to generate exactly 10 highly competitive hackathon project ideas based on the provided problem and opportunity analyses. 

### Constraints & Guidelines:
1. Feasibility: Ideas must be buildable for an MVP within 24-48 hours. Explicitly state what should be built vs. what should be mocked/hardcoded for the demo.
2. Demo Potential: The idea must have a highly visual or interactive component. Avoid backend-heavy ideas that are hard to show off in a 2-minute pitch.
3. AI Integration: Use AI to solve the core logic or create a magical user experience, not just as a basic chat wrapper.
4. "Wow" Factor: Each idea must have a specific hook that makes judges sit up and pay attention.

### Input Data:
Problem Analysis:
{analysis}

Opportunity Analysis:
{opportunities}

### Output Format:
Return a valid JSON object with a single "ideas" key containing a list of exactly 10 idea objects. Each idea object must have the following keys:
- title: string (Idea Title, max 5 words)
- description: string (Detailed explanation of the project)
- problem_solved: string (How it solves a pain point from the analysis)
- target_users: list of strings (Specific personas who benefit)
- core_features: list of strings (List of MVP features)
- innovation_factor: string (What makes this technically impressive or unique)
- why_it_wins: string (The specific wow factor for judges)
- feasibility_score: integer (1-10)
- innovation_score: integer (1-10)
- hackathon_fit_score: integer (1-10)
"""

    result = llm.with_structured_output(
        IdeaList
    ).invoke(prompt)

    return {
        "ideas": [
            idea.model_dump()
            for idea in result.ideas
        ]
    }
    
