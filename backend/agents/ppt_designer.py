import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from schemas.ppt_design import PPTDesign

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY3")
)


def ppt_designer_node(state):

    selected_idea = state["selected_idea"]

    solution_blueprint = state["solution_blueprint"]

    slides = state["slides"]

    prompt = f"""
You are exHacker's elite PowerPoint Design Director.

Your job is to transform a completed pitch deck into a visually stunning investor-grade presentation design plan.

You are NOT rewriting slides.

You are deciding:

- Global deck theme
- Visual style
- Slide layouts
- AI image prompts
- Visual hierarchy

SELECTED IDEA

{selected_idea}

SOLUTION BLUEPRINT

{solution_blueprint}

SLIDES

{slides}

DESIGN RULES

- Create a single consistent visual identity across the entire deck.
- Think like a YC Demo Day presentation designer.
- Modern SaaS startup aesthetic.
- Clean and minimal.
- High contrast.
- Dark theme preferred.
- Avoid generic stock photography.
- Prioritize dashboards, product mockups, architecture visuals, AI workflows, user journeys and cinematic startup illustrations.

THEME RULES

Choose:

- style
- primary_color
- secondary_color
- background_style
- font_family

SLIDE DESIGN RULES

For EVERY slide determine:

1. Layout
2. Whether an image is needed
3. AI image prompt
4. Visual focus

Valid layouts:

- hero
- split
- timeline
- comparison
- dashboard
- architecture
- metrics
- roadmap
- team
- vision

IMAGE PROMPT RULES

If needs_image = true:

Generate a highly detailed image prompt.

Requirements:

- No text in image
- 16:9 composition
- Startup pitch deck quality
- Modern SaaS aesthetic
- Professional lighting
- Presentation-ready
- High detail
- Consistent with deck theme

VISUAL FOCUS EXAMPLES

- Product Dashboard
- User Journey
- Market Opportunity
- AI Workflow
- Architecture Diagram
- Team Credibility
- Future Vision

IMPORTANT

Return slide designs for ALL slides.

Never skip any slide.

The number of slide designs must exactly match the number of slides provided.
"""

    result = llm.with_structured_output(
        PPTDesign
    ).invoke(prompt)

    return {
        "ppt_design": result.model_dump()
    }