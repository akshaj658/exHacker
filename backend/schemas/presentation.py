from pydantic import BaseModel


from pydantic import BaseModel


class Slide(BaseModel):
    slide_number: int

    title: str

    headline: str

    objective: str

    content: list[str]

    presentation_script: str

    visual_suggestion: str

    image_prompt: str

    layout_type: str


class Presentation(BaseModel):
    slides: list[Slide]