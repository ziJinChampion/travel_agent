import os

from agent.tools_and_schemas import SearchQueryList, Reflection, LocationInfo, TravelPlan
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
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
    AgentState,
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


# Nodes
async def check_location_info(state: OverallState, config: RunnableConfig) -> LocationInfoState:
    configurable = Configuration.from_runnable_config(config)

    # check for custom initial search query count
    if state.get("initial_search_query_count") is None:
        state["initial_search_query_count"] = configurable.number_of_initial_queries

    # init Gemini 2.0 Flash
    llm = ChatGoogleGenerativeAI(
        model=configurable.query_generator_model,
        temperature=1.0,
        max_retries=2,
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    structured_llm = llm.with_structured_output(LocationInfo)

    # Format the prompt
    current_date = get_current_date()
    formatted_prompt = location_info_instructions.format(
        research_topic=get_research_topic(state["messages"]),
    )
    # Generate the search queries
    result = structured_llm.invoke(formatted_prompt)
    return {"is_location_info": result.is_location_info, "is_date_info": result.is_date_info, "location": result.location, "date": result.date}


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

async def agent_node(state: AgentState, config: RunnableConfig) -> dict:
    """Agent的大脑，决定下一步行动"""
    print("---AGENT NODE---")
    response = await LLM_WITH_TOOLS.ainvoke(state['messages'])
    return {"messages": [response]}



def prepare_agent_loop(state: OverallState) -> AgentState:
    """将预处理的结果格式化为Agent循环的初始输入"""
    location = state.get("location")
    date = state.get("date")
    if not date:
        date = f"{get_current_date()} to {get_target_date()}"
    
    user_info = f"目的地: {location}, 日期: {date}"
    formatted_prompt = location_search_instructions.format(
        current_date=get_current_date(),
        date=date,
        location=location
    )
    return {"messages": [HumanMessage(content=formatted_prompt + "\n" + user_info)]}

def continue_to_location_research(state: LocationInfoState) -> str:
    if not state.get("is_location_info"):
        # 如果没有地点信息，可以设计一个专门的节点来向用户提问
        return "end_without_plan" 
    else:
        return "start_agent_loop"
    

async def search_loaction(state: LocationInfoState, config: RunnableConfig) -> OverallState:
    """搜索位置信息并生成旅行计划"""
    try:
        # Configure
        print("search_loaction-state------------->", state)
        print("State keys:", list(state.keys()))

        # 直接获取工具
        structured_tools = get_tools()
        print(f"Got {len(structured_tools)} tools")
        
        if not structured_tools:
            print("Warning: No tools available, returning default response")
            return {
                "best_time": "需要更多信息",
                "suggested_budget": "需要更多信息",
                "view_points": "需要更多信息",
                "food": "需要更多信息",
                "hotel": "需要更多信息",
                "transportation": "需要更多信息",
                "tips": "无法获取工具信息",
                "weather": "需要更多信息",
                "overall_plan": "工具暂时不可用，请稍后重试",
            }
        
        configurable = Configuration.from_runnable_config(config)

        # 创建正确的提示模板 - 使用 input 变量来避免冲突
        prompt = ChatPromptTemplate.from_messages([
            ("system", location_search_instructions.format(current_date=get_current_date())),
            ("user", "{input}"),
            ("assistant", "{agent_scratchpad}"),
        ])

        llm = ChatGoogleGenerativeAI(
            model=configurable.query_generator_model,
            temperature=0.0,
            max_retries=2,
            api_key=os.getenv("GEMINI_API_KEY"),
        )
        
        print("Creating agent...")
        agent = create_openai_functions_agent(llm, structured_tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=structured_tools, verbose=True)
        
        print("Invoking agent...")
        input_text = f"Date: {state['date']} Location: {state['location']}"
        
        raw_result = await agent_executor.ainvoke({"input": input_text})
        print("raw_result->>>>--------------", raw_result)
        
        print("Processing result...")
        result = llm.with_structured_output(TravelPlan).invoke(str(raw_result))

        return {
            "best_time": result.best_time,
            "suggested_budget": result.suggested_budget,
            "view_points": result.view_points,
            "food": result.food,
            "hotel": result.hotel,
            "transportation": result.transportation,
            "tips": result.tips,
            "weather": result.weather,
            "overall_plan": result.overall_plan,
        }
        
    except Exception as e:
        print(f"Error in search_loaction: {e}")
        import traceback
        traceback.print_exc()
        
        # 返回错误信息
        return {
            "best_time": f"错误: {str(e)}",
            "suggested_budget": "处理失败",
            "view_points": "处理失败",
            "food": "处理失败",
            "hotel": "处理失败",
            "transportation": "处理失败",
            "tips": f"发生错误: {str(e)}",
            "weather": "处理失败",
            "overall_plan": f"处理过程中发生错误: {str(e)}",
        }


def finalize_answer(state: OverallState, config: RunnableConfig):
    print("finalize_answer-state------------->", state)
    configurable = Configuration.from_runnable_config(config)
    reasoning_model = state.get("reasoning_model") or configurable.answer_model
    information = f"""
    Best time: {state["best_time"]}
    Suggested budget: {state["suggested_budget"]}
    View points: {state["view_points"]}
    Food: {state["food"]}
    Hotel: {state["hotel"]}
    """
    information += f"""
    Transportation: {state["transportation"]}
    Tips: {state["tips"]}
    Weather: {state["weather"]}
    Overall plan: {state["overall_plan"]}
    """

    # Format the prompt
    current_date = get_current_date()
    formatted_prompt = answer_instructions.format(
        current_date=current_date,
        research_topic=get_research_topic(state["messages"]),
        information=information,
    )

    # init Reasoning Model, default to Gemini 2.5 Flash
    llm = ChatGoogleGenerativeAI(
        model=reasoning_model,
        temperature=0,
        max_retries=2,
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    result = llm.invoke(formatted_prompt)

    return {
        "messages": [AIMessage(content=result.content)],
        "best_time": state["best_time"],
        "suggested_budget": state["suggested_budget"],
        "view_points": state["view_points"],
        "food": state["food"],
        "hotel": state["hotel"],
        "transportation": state["transportation"],
        "tips": state["tips"],
        "weather": state["weather"],
        "overall_plan": state["overall_plan"],
    }


builder = StateGraph(OverallState, config_schema=Configuration)

builder.add_node("check_location_info", check_location_info)
builder.add_node("agent", agent_node) 
builder.add_node("tool_executor", tool_node) 
builder.add_node("prepare_agent_loop", prepare_agent_loop)
builder.add_node("end_without_plan", lambda state: {"messages": [AIMessage("抱歉，我需要明确的地点信息才能为您规划。")]})

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
    {"tools": "tool_executor", END: END},
)
builder.add_edge("tool_executor", "agent") 
builder.add_edge("end_without_plan", END)

# builder.add_node("check_location_info", check_location_info)
# builder.add_node("search_loaction", search_loaction)
# builder.add_node("finalize_answer", finalize_answer)
# builder.add_node("agent_node", agent_node)
# builder.add_node("tool_executor_node", tool_executor_node)

# builder.add_edge(START, "check_location_info")
# builder.add_conditional_edges(
#     "check_location_info", continue_to_location_research, ["search_loaction", "finalize_answer"]
# )
# builder.add_edge("search_loaction", "finalize_answer")
# builder.add_edge("finalize_answer", END)

graph = builder.compile(name="travel-agent")
