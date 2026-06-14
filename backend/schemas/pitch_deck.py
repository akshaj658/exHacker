from pydantic import BaseModel, Field


class PitchDeckSlide(BaseModel):
    slide_number: int
    title: str = Field(default="", description="Visual, strong title of the slide.")
    subtitle: str = Field(default="", description="Sub-header or elevator caption summarizing the slide concept.")
    executive_summary: str = Field(default="", description="Executive Summary (2-4 sentences) summarizing the slide context in high-end language.")
    bullets: list[str] = Field(default_factory=list, description="6 to 10 meaningful, detailed slide-friendly bullet points. Executive-level language. No paragraphs.")
    key_insight: str = Field(default="", description="A single-sentence key strategic insight for the slide.")
    investor_takeaway: str = Field(default="", description="A single-sentence key takeaway for investors (focus on ROI, defensibility, or growth).")
    image_prompt: str = Field(default="", description="Detailed image prompt for Gemini Imagen if visual_type is 'image'. Empty otherwise.")
    visual_type: str = Field(default="image", description="Visual type: 'image', 'chart', 'timeline', 'architecture', 'comparison', 'funnel', or 'diagram'")
    speaker_notes: str = Field(default="", description="Charismatic, engaging spoken script for the presenter (80-150 words).")


class PitchDeck(BaseModel):
    category: str = Field(default="SaaS", description="Startup category: SaaS, AI, Cybersecurity, Fintech, Healthcare, Education, Agriculture, Logistics, ClimateTech, or E-Commerce")
    slides: list[PitchDeckSlide] = Field(default_factory=list, description="Exactly 14 slides (Cover + 13 body slides).")

