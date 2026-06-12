from typing import TypedDict


class AgentState(TypedDict):

    challenge_statement: str
    hackathon_name: str
    sponsors: list[str]
    tracks: list[str]
    problem_analysis: dict
    opportunity_analysis: dict
    ideas: list
    ranked_ideas: list
    selected_idea: dict
    solution_blueprint: dict
    slides: list
    ppt_design: dict
    pitch_30s: str
    pitch_2min: str
    pitch_5min: str
    final_report: str
    prd_document: str
    vision_document: str