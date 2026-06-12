from pydantic import BaseModel


class DeckTheme(BaseModel):
    style: str
    primary_color: str
    secondary_color: str
    background_style: str
    font_family: str


class SlideDesign(BaseModel):
    slide_number: int
    layout: str
    needs_image: bool
    visual_focus: str
    image_prompt: str


class PPTDesign(BaseModel):
    deck_theme: DeckTheme
    slide_designs: list[SlideDesign]