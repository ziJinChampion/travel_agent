from __future__ import annotations

from dataclasses import dataclass, field
from typing import TypedDict

from langgraph.graph import add_messages
from typing_extensions import Annotated
from pydantic import BaseModel
from agent.tools_and_schemas import TravelPlan

import operator

class AgentState(TypedDict):
    messages: Annotated[list, lambda x, y: x + y]

class TravelPlanTool(TravelPlan, BaseModel):
    """用于格式化并最终输出完整旅行计划的工具。"""
    pass

class OverallState(TypedDict):
    messages: Annotated[list, add_messages]
    mcp_result: list[str]
    best_time: str
    suggested_budget: str
    view_points: str
    food: str
    hotel: str
    transportation: str
    tips: str
    weather: str
    overall_plan: str

class TravelPlanState(TypedDict):
    messages: Annotated[list, add_messages]
    best_time: str
    suggested_budget: str
    view_points: str
    food: str
    hotel: str
    transportation: str
    tips: str
    weather: str
    overall_plan: str


class ReflectionState(TypedDict):
    is_sufficient: bool
    knowledge_gap: str
    follow_up_queries: Annotated[list, operator.add]
    research_loop_count: int
    number_of_ran_queries: int


class Query(TypedDict):
    query: str
    rationale: str


class QueryGenerationState(TypedDict):
    search_query: list[Query]

class LocationInfoState(TypedDict):
    is_location_info: bool
    is_date_info: bool
    location: str
    date: str

class LocationSearchState(TypedDict):
    date: str
    location: str


class WebSearchState(TypedDict):
    search_query: str
    id: str


@dataclass(kw_only=True)
class SearchStateOutput:
    running_summary: str = field(default=None)  # Final report
