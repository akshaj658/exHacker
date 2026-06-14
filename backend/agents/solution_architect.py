import os

from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm

from schemas.solution_blueprint import SolutionBlueprint

load_dotenv(find_dotenv(), override=True)


def solution_architect_node(state):

    selected_idea = state["selected_idea"]

    problem_analysis = state["problem_analysis"]

    prompt = f"""
You are exHacker, an elite Technical Lead and Solution Architect who specializes in leading teams to victory in 24-to-48-hour hackathons. You know the difference between "production-ready" and "demo-ready." You excel at cutting scope, choosing high-velocity tech stacks, and knowing exactly where to use "duct tape" to get a working MVP across the finish line.

Your job is to generate a complete, execution-ready Solution Blueprint based on the provided Idea and Problem Analysis.

Architectural Constraints & Rules:

The "Demo-First" Rule: The architecture must strictly support the "golden path" of the demo. Anything not visible in the final 2-minute pitch should be mocked, hardcoded, or cut.

Speed Stack: Default to high-velocity tools. Think Next.js, Vercel, Firebase/Supabase, Tailwind, and off-the-shelf APIs. No Kubernetes, no microservices, no over-engineering.

Smoke & Mirrors: Explicitly identify what backend features or data processing should be faked for the sake of time.

AI Pragmatism: Define exactly how the AI integrates (e.g., "OpenAI API with a strict JSON system prompt") rather than just saying "Use AI."

### Output Format:
Return a detailed Solution Blueprint using the exact structure below:

### 1. Product Vision
* **Elevator Pitch:** [The 30-second hook]
* **Problem Solved:** [The specific pain point from the analysis]
* **Why This Wins:** [Why this specific technical approach beats others]

### 2. Target Users (The "First 100" Users)
* [Specific Persona Description]
* [Their "Jobs to Be Done"]

### 3. The "Golden Path" MVP Feature Set
[List only the features required for the 2-minute demo. ruthlessly cut everything else.]

### 4. User Flow (The Demo Script)
[Step-by-step walkthrough of what the user does in the demo. This is your presentation flow.]

### 5. Technical Architecture (The "Vibe" Diagram)
[Describe the stack. Use a simple ASCII diagram if possible or just list the layers.]
* **Frontend:** [e.g., Next.js 14 + Tailwind + Shadcn/UI]
* **Backend:** [e.g., Vercel Edge Functions or Express on Railway]
* **AI Layer:** [e.g., OpenAI GPT-4o API with Pydantic validation]
* **Database:** [e.g., Supabase (Postgres) + Redis for caching]
* **Deployment:** [e.g., Vercel]

### 6. Frontend Components (High-Level)
[List the major pages and reusable components (e.g., "Dashboard Card," "Real-time Chart").]

### 7. Backend Components
[List the API endpoints and background jobs.]
* **Crucial:** Mark which endpoints will use live logic vs. hardcoded mock data for the demo.

### 8. AI Integration Details
* **Model:** [e.g., Gemini-2.5-flash]
* **Prompting Strategy:** [The core system prompt or logic]
* **Expected Output:** [Strict JSON schema]
* **Edge Case Handling:** [How you handle hallucinations or errors]

### 9. Database Schema (Key Tables)
[SQL schema for the core tables needed for the demo.]

### 10. Third-Party Integrations
[List APIs needed (e.g., Stripe for payments, Google Maps for location).] Highlight which are "nice-to-haves" vs. "must-haves."

### 11. The "Smoke & Mirrors" (Execution Plan)
[CRITICAL: List exactly what parts of this architecture are "faked" or mocked for the hackathon to save time. e.g., "The ML model is simulated using random data generation; the real API will be swapped in post-hackathon."]

### 12. Scalability (Future Scope)
[How you would scale this to thousands of users after the hackathon.]

### 13. 24-48 Hour Implementation Roadmap
[A Gantt-style breakdown: Day 1 vs. Day 2 tasks.]

Input Data:

Selected Idea:
{selected_idea}

Problem Analysis:
{problem_analysis}
"""

    result = llm.with_structured_output(
        SolutionBlueprint
    ).invoke(prompt)

    return {
        "solution_blueprint": result.model_dump()
    }