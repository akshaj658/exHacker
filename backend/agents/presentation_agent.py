import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from schemas.presentation import Presentation

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY3")
)


def presentation_agent_node(state):

    selected_idea = state["selected_idea"]

    solution_blueprint = state["solution_blueprint"]

    prompt = f"""
You are exHacker, an elite Pitch Architect, TED-level storyteller, and YC Demo Day coach.

Your job is to create a world-class 10-slide pitch deck that sounds like it is being presented on stage in a hackathon final or investor demo day.

Selected Idea:
{selected_idea}

Solution Blueprint:
{solution_blueprint}

IMPORTANT RULES

SLIDE CONTENT RULES:
- Keep slides minimal.
- Judges should understand the slide within 10 seconds.
- Maximum 4 bullet points.
- Maximum 6 words per bullet.
- Strong headlines.
- No paragraphs on slides.

PRESENTATION SCRIPT RULES:
- The presentation script is NOT a summary.
- The presentation script is NOT a repetition of slide bullets.
- Write as if a charismatic founder is speaking on stage.
- Use storytelling.
- Build emotion and excitement.
- Use persuasive language.
- Sound natural when spoken aloud.
- Never start with "Welcome everyone" or similar generic introductions.
- Never read the bullet points.
- Include pauses when useful.
- Create curiosity for the next slide.
- End with a smooth transition to the next slide.
- 80-150 words per slide.

VISUAL RULES:
- Suggest visuals that would impress hackathon judges.
- Prefer product mockups, diagrams, dashboards, user journeys, AI workflows, architecture visuals, and hero illustrations.
- Avoid generic stock photos.

IMAGE PROMPT RULES:
- Generate a professional AI image prompt for every slide.
- No text in image.
- 16:9 aspect ratio.
- Startup pitch deck quality.
- Modern SaaS style.
- High detail.
- Presentation-ready.

OUTPUT FORMAT

Generate exactly 10 slides.

For each slide return:

Slide [1-10]

Slide Topic:
Headline:
On-Slide Content:
Visual Suggestion:
Image Prompt:
Presentation Script:
Layout Type:

Layout Type must be one of:
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
"""

    result = llm.with_structured_output(
        Presentation
    ).invoke(prompt)

    return {
        "slides": [
            slide.model_dump()
            for slide in result.slides
        ]
    }