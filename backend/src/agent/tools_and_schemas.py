from typing import List
from pydantic import BaseModel, Field


class SearchQueryList(BaseModel):
    query: List[str] = Field(
        description="A list of search queries to be used for web research."
    )
    rationale: str = Field(
        description="A brief explanation of why these queries are relevant to the research topic."
    )


class Reflection(BaseModel):
    is_sufficient: bool = Field(
        description="Whether the provided summaries are sufficient to answer the user's question."
    )
    knowledge_gap: str = Field(
        description="A description of what information is missing or needs clarification."
    )
    follow_up_queries: List[str] = Field(
        description="A list of follow-up queries to address the knowledge gap."
    )

class LocationInfo(BaseModel):
    is_location_info: bool = Field(
        description="Whether user provided location name in the question."
    )
    is_date_info: bool = Field(
        description="Whether user provided date in the question."
    )
    location: str = Field(
        description="The location name provided by the user."
    )
    date: str = Field(
        description="The date provided by the user."
    )


class TravelPlan(BaseModel):
    best_time: str = Field(
        description="The best time to visit the location."
    )
    suggested_budget: str = Field(
        description="The suggested budget for the travel."
    )
    view_points: str = Field(
        description="The view points to visit in the location."
    )
    food: str = Field(
        description="The food to eat in the location."
    )
    hotel: str = Field(
        description="The hotel to stay in the location."
    )
    transportation: str = Field(
        description="The transportation to get to the location."
    )
    tips: str = Field(
        description="The tips to visit the location."
    )
    weather: str = Field(
        description="The weather of the location."
    )
    overall_plan: str = Field(
        description="The overall plan for the travel."
    )