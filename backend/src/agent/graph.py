import os
import logging
import uuid
import time
import json

from agent.tools_and_schemas import SearchQueryList, Reflection, LocationInfo, TravelPlan
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.types import Send
from langgraph.graph import StateGraph
from langgraph.graph import START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.runnables import RunnableConfig
from google.genai import Client
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.tools import StructuredTool
from langchain_core.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from agent.state import (
    OverallState,
    LocationInfoState,
    ReflectionState,
    LocationSearchState,
)
from agent.configuration import Configuration
from agent.prompts import (
    get_current_date,
    get_target_date,
    location_info_instructions,
    location_search_instructions,
    reflection_instructions,
    answer_instructions,
)
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from agent.utils import (
    get_research_topic,
)

load_dotenv()


if os.getenv("GEMINI_API_KEY") is None:
    raise ValueError("GEMINI_API_KEY is not set")

# Used for Google Search API
genai_client = Client(api_key=os.getenv("GEMINI_API_KEY"))
amap_client = MultiServerMCPClient({
    "amap": {
        "transport": "streamable_http",
        "url": f"https://mcp.amap.com/mcp?key={os.getenv('AMAP_API_KEY')}",
    }
})

# Cache for tools fetched from amap_client
_CACHED_TOOLS: list[StructuredTool] | None = None



# Initialize tools cache at import time so it runs once at startup
def _initialize_tools_cache() -> None:
    global _CACHED_TOOLS
    if _CACHED_TOOLS is not None:
        return
    import asyncio
    
    async def _get_tools_async():
        try:
            return await amap_client.get_tools()
        except Exception as e:
            print(f"Error getting tools from amap_client during init: {e}")
            return []
    
    try:
        try:
            loop = asyncio.get_running_loop()
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, _get_tools_async())
                _CACHED_TOOLS = future.result()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            _CACHED_TOOLS = loop.run_until_complete(_get_tools_async())
            loop.close()
    except Exception as e:
        print(f"Error initializing tools cache: {e}")
        _CACHED_TOOLS = []

_initialize_tools_cache()


# def continue_to_location_research(state: LocationInfoState):
#     if state["is_location_info"] == False:
#         return "finalize_answer"
#     elif state["is_date_info"] == False:
#         state["date"] = f"{get_current_date()} to {get_target_date()}"
#         return Send("search_loaction", {"date": state["date"], "location": state["location"]})
#     else:
#         return Send("search_loaction", {"date": state["date"], "location": state["location"]})


def get_tools() -> list[StructuredTool]:
    """获取工具列表（使用启动时缓存）"""
    global _CACHED_TOOLS
    if _CACHED_TOOLS is None:
        _initialize_tools_cache()
    return _CACHED_TOOLS or []
tools = get_tools()
tool_node = ToolNode(tools) # <--- 直接用 ToolNode 创建节点
llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=1.0,
        max_retries=2,
        api_key=os.getenv("GEMINI_API_KEY"),
    )
LLM_WITH_TOOLS = llm.bind_tools(tools)

# Nodes
async def check_location_info(state: OverallState, config: RunnableConfig) -> LocationInfoState:
    configurable = Configuration.from_runnable_config(config)

    # check for custom initial search query count
    if state.get("initial_search_query_count") is None:
        state["initial_search_query_count"] = configurable.number_of_initial_queries

    structured_llm = llm.with_structured_output(LocationInfo)

    # Format the prompt
    current_date = get_current_date()
    formatted_prompt = location_info_instructions.format(
        research_topic=get_research_topic(state["messages"]),
    )
    # Generate the search queries
    result = structured_llm.invoke(formatted_prompt)
    return {"is_location_info": result.is_location_info, "is_date_info": result.is_date_info, "location": result.location, "date": result.date}

def continue_to_location_research(state: LocationInfoState) -> str:
    if not state.get("is_location_info"):
        return "end_without_plan" 
    else:
        return "start_agent_loop" 

def prepare_agent_loop(state: LocationInfoState) -> OverallState:
    """将预处理的结果格式化为Agent循环的初始输入"""
    location = state.get("location")
    date = state.get("date")
    if not date:
        date = f"{get_current_date()} to {get_target_date()}"
    
    return {
        "messages": [HumanMessage(content=location_search_instructions.format(
            current_date=get_current_date(),
            date=date,
            location=location
        )), HumanMessage(content=f"目的地: {location}, 日期: {date}")],
        "mcp_result": [],
        "best_time": "",
        "suggested_budget": "",
        "view_points": "",
        "food": "",
        "hotel": "",
        "transportation": "",
        "tips": "",
        "weather": "",
        "overall_plan": ""
    }

async def agent_node(state: OverallState, config: RunnableConfig) -> dict:
    """Agent的大脑，决定下一步行动"""
    print("---AGENT NODE---")
    response = await LLM_WITH_TOOLS.ainvoke(state['messages'], {"recursion_limit": 100})
    return {"messages": [response]}


async def logging_tool_node(state: OverallState) -> dict:
    last_message = state['messages'][-1]
    
    # 确保是AI消息并且有工具调用
    if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
        return {}
        
    conversation_id = uuid.uuid4() 
    
    start_time = time.time()
    result = await tool_node.ainvoke(state)
    end_time = time.time()
    
    # 记录每一次工具调用的详细信息
    for i, tool_call in enumerate(last_message.tool_calls):
        log_entry = {
            "conversation_id": conversation_id,
            "tool_name": tool_call['name'],
            "tool_input": tool_call['args'],
            "tool_output": result['messages'][i].content, # ToolNode的返回结果是ToolMessage列表
            "status": "success",
            "latency_ms": round((end_time - start_time) * 1000, 2)
        }
        if state["mcp_result"] is None:
            state["mcp_result"] = []
        state["mcp_result"].append(log_entry)
    return result
    

async def finalize_answer(state: OverallState, config: RunnableConfig):
    mcp_result = state["mcp_result"]
    food = []
    hotel = []
    for mcp_item in mcp_result:
        if mcp_item["tool_name"] == "maps_around_search":
            if mcp_item["tool_input"]["keywords"] == "美食":
                food.append(mcp_item["tool_output"])
            elif mcp_item["tool_input"]["keywords"] == "酒店":
                hotel.append(mcp_item["tool_output"])
    result = await llm.with_structured_output(TravelPlan).ainvoke(state["messages"][-1].content)
    print("result------------->", result)
    
    # 将Pydantic模型转换为字典，然后序列化
    result_dict = result.model_dump() if hasattr(result, 'model_dump') else result.dict()
    
    return {
    
        "food": food,
        "hotel": hotel,
        "best_time": result.best_time,
        "suggested_budget": result.suggested_budget,
        "view_points": result.view_points,
        "transportation": result.transportation,
        "tips": result.tips,
        "weather": result.weather,
        "overall_plan": result.overall_plan,
    }


builder = StateGraph(OverallState, config_schema=Configuration)

builder.add_node("check_location_info", check_location_info)
builder.add_node("agent", agent_node) 
builder.add_node("tool_executor", logging_tool_node) 
builder.add_node("prepare_agent_loop", prepare_agent_loop)
builder.add_node("end_without_plan", lambda state: {"messages": [AIMessage("抱歉，我需要明确的地点信息才能为您规划。")]})
builder.add_node("finalize_answer", finalize_answer)

builder.add_edge(START, "check_location_info")
builder.add_conditional_edges(
    "check_location_info",
    continue_to_location_research,
    {"start_agent_loop": "prepare_agent_loop", "end_without_plan": "end_without_plan"},
)
builder.add_edge("prepare_agent_loop", "agent")
builder.add_conditional_edges(
    "agent",
    tools_condition, 
    {"tools": "tool_executor", END: "finalize_answer"},
)
builder.add_edge("tool_executor", "agent") 
builder.add_edge("end_without_plan", END)
builder.add_edge("finalize_answer", END)

graph = builder.compile(name="travel-agent")
