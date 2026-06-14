import os
from dotenv import find_dotenv, load_dotenv
from agents.llm_client import llm
from schemas.pitch_deck import PitchDeck

load_dotenv(find_dotenv(), override=True)

def generate_pitch_deck_content(state: dict) -> PitchDeck:
    """
    Using the entire state of the workflow outputs, generate a compelling 
    investor-ready 14-slide pitch deck narrative (Cover + 13 body slides) 
    with comprehensive details and visual instructions.
    """
    challenge = state.get("challenge_statement", "N/A")
    hackathon = state.get("hackathon_name", "N/A")
    sponsors = state.get("sponsors", [])
    tracks = state.get("tracks", [])
    problem_analysis = state.get("problem_analysis", {})
    opportunity_analysis = state.get("opportunity_analysis", {})
    selected_idea = state.get("selected_idea", {})
    solution_blueprint = state.get("solution_blueprint", {})

    prompt = f"""
You are exHacker's Principal Pitch Deck Strategist & Storyteller, trained by Y-Combinator partners and top-tier presentation directors.

Your job is to transform all raw workflow outputs of a hackathon solution into a professional, investor-grade startup pitch deck narrative.
The narrative must tell a highly persuasive, emotional, and logically rigorous story. It should feel like a startup founder pitching on stage, NOT a dry technical report.

Here are the complete workflow outputs:

=== CONTEXT ===
Hackathon Name: {hackathon}
Challenge Statement: {challenge}
Sponsors: {sponsors}
Tracks: {tracks}

=== PROBLEM ANALYSIS ===
{problem_analysis}

=== OPPORTUNITY ANALYSIS ===
{opportunity_analysis}

=== SELECTED WINNING IDEA ===
{selected_idea}

=== TECHNICAL SOLUTION BLUEPRINT ===
{solution_blueprint}

=========================

IMPORTANT RULES:
1. Do NOT copy raw report sections directly into slides. Rewrite them for presentation format.
2. Use concise, high-impact, slide-friendly language. No paragraphs on slides.
3. Every slide must contain between 6 to 10 meaningful bullet points. Keep each bullet point detailed and clear.
4. Deliver executive-level messaging emphasizing business value, technical advantage, and market readiness.
5. Create a storytelling arc from slide 1 to slide 14.
6. Provide a detailed, creative image prompt if the slide's visual_type is 'image'.
7. First, determine the startup category: SaaS, AI, Cybersecurity, Fintech, Healthcare, Education, Agriculture, Logistics, ClimateTech, or E-Commerce.

GENERATE EXACTLY 14 SLIDES IN THIS ORDER:
1. Cover (Title Slide) -> visual_type: "comparison" (or default). Set title to project name, subtitle to a compelling elevator pitch, bullets empty.
2. Problem -> visual_type: "image". Set image_prompt to represent the user frustration or problem statement.
3. Market Opportunity -> visual_type: "chart". Bullet points should explain target size (TAM/SAM/SOM).
4. Current Pain -> visual_type: "image". Focus on current manual inefficiencies and acute frustrations.
5. Why Existing Solutions Fail -> visual_type: "comparison". Detail competitor product limitations.
6. Our Solution -> visual_type: "image". Represent the smart, futuristic AI solution in action.
7. Product -> visual_type: "image". Highlight core product layout/mockup concept.
8. Technology -> visual_type: "architecture". Details on code, system layers, database/endpoints.
9. Business Model -> visual_type: "diagram". Details on monetization plans and value flow.
10. Go-To-Market -> visual_type: "funnel". Detail target user adoption and acquisition funnel.
11. Competitive Advantage -> visual_type: "comparison". Detail key competitive moats and positioning.
12. Roadmap -> visual_type: "timeline". Detail linear milestone roadmap (Phase 1, Phase 2, Phase 3).
13. Vision -> visual_type: "image". Inspiring vision of scale and global impact.
14. Closing Pitch -> visual_type: "image". Final presentation closing pitch, contact details, Q&A call to action.

VISUAL TYPES ALLOWED:
- "image" (for slide 2, 4, 6, 7, 8, 13, 14) - requires image_prompt
- "chart" (for slide 3) - creates native PowerPoint column chart showing TAM/SAM/SOM market sizes
- "timeline" (for slide 12) - draws horizontal milestone timeline
- "architecture" (for slide 8) - draws tech-stack architecture block diagram
- "comparison" (for slide 5, 11) - draws a competitive matrix table
- "funnel" (for slide 10) - draws GTM funnel diagrams
- "diagram" (for slide 9) - draws business model monetization diagrams

For each slide, return:
- slide_number (1-14)
- title (strong header)
- subtitle (summarizing caption or elevator pitch)
- executive_summary (2 to 4 sentences summarizing the slide context in high-end language)
- bullets (6 to 10 meaningful, detailed slide-friendly bullet points)
- key_insight (single-sentence strategic insight)
- investor_takeaway (single-sentence investor value takeaway)
- image_prompt (detailed description for generating visual illustrations. Suffix with style settings automatically inside backend)
- visual_type (one of: 'image', 'chart', 'timeline', 'architecture', 'comparison', 'funnel', 'diagram')
- speaker_notes (80-150 words script)
"""
    result = llm.with_structured_output(PitchDeck).invoke(prompt)
    return result
