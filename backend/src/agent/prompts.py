from datetime import datetime, timedelta


# Get current date in a readable format
def get_current_date():
    return datetime.now().strftime("%B %d, %Y")

def get_target_date():
    """Get date 3 days from now, safely handling month/year boundaries"""
    current_date = datetime.now()
    target_date = current_date + timedelta(days=3)
    return target_date.strftime("%B %d, %Y")


location_info_instructions = """Your goal is to check if the user provided location information in the question.

Instructions:
- Check if the user provided location information in the question.
- If the user provided location information, return the location information.
- If the user did not provide location information, return None.

Format:
- Format your response as a JSON object with ALL of these exact keys:
   - "is_location_info": true or false
   - "is_date_info": true or false
   - "location": The location name provided by the user
   - "date": The date provided by the user

User Input:
{research_topic}

Example:
1.
Topic: 我想在8月15号到8月20号之间去成都,可以给我推荐一些景点吗?
EXAMPLE JSON OUTPUT:
```json
{{
    "is_location_info": true,
    "is_date_info": true,
    "location": "成都",
    "date": "8月15号到8月20号",
}}
```
2. Topic: 今天天气真好
EXAMPLE JSON OUTPUT:
```json
{{
    "is_location_info": false,
    "is_date_info": false,
    "location": "",
    "date": "",
}}
```
"""


# location_search_instructions = """
# You are a travel assistant, you are given a location and a date, you need to generate a travel plan for the user.

# You have access to the following tools:
# 1. maps_weather
# 2. maps_text_search
# 3. maps_distance
# 4. maps_direction_bicycling
# 5. maps_direction_walking
# 6. maps_geo
# 7. maps_regeocode
# 8. maps_ip_location
# 9. maps_around_search
# 10. maps_search_detail

# Tool Invoke Rules:
# - If you want to get weather information, you should use maps_weather.
# - If you want to get general information the destination, you should use maps_text_search.
# - If you want to get the distance between two places, you should use maps_distance.
# - If you want to get the direction by bicycling, you should use maps_direction_bicycling.
# - If you want to get the direction by walking, you should use maps_direction_walking.
# - If you want to get the geo information, you should use maps_geo.
# - If you want to get the regeocode information, you should use maps_regeocode.
# - If you want to get the ip location information, you should use maps_ip_location.
# - If you want to get the around search information, you should use maps_around_search.
# - If you want to get the search detail information, you should use maps_search_detail.

# Instructions:
# - Generate a travel plan for the user.
# - Give the most valuable to visit places for the user.
# - Give the weather information for the user to visit the places.
# - Give the time schedule for the user to visit the places according to the weather information.
# - Give the detail information for the user to visit the places.
# - Give the food recommendation for the user, and the restaurant should close to the destination.
# - Give the budget for the travel.
# - Give the overall plan for the travel.

# Format:
# - Format your response as a JSON object with ALL of these exact keys:
#    - "best_time": The best time to visit the location.
#    - "suggested_budget": The suggested budget for the travel.
#    - "view_points": The view points to visit in the location.
#    - "food": The food to eat in the location.
#    - "hotel": The hotel to stay in the location.
#    - "transportation": The transportation to get to the location.
#    - "tips": The tips to visit the location.
#    - "weather": The weather of the location.
#    - "overall_plan": The overall plan for the travel.

# User Input:
# Date: date
# Location: location

# Example:
# ```json
# {{
#     "best_time": "春季（4-6月）和秋季（9-10月）天气宜人，夏季温暖但游客较多，冬季较冷但有圣诞气氛。",
#     "suggested_budget": "中等预算：每天€100-180（约$110-200），包含住宿、餐饮、交通和景点门票。",
#     "view_points": "埃菲尔铁塔,卢浮宫",
#     "food": "L'Ami Jean: 传统法式小酒馆，以高质量的法式料理和温馨氛围著称。",
#     "hotel": "巴黎丽兹酒店: 历史悠久的奢华酒店，位于旺多姆广场，服务一流",
#     "transportation": "1.机场交通:主要机场：戴高乐机场(CDG)距离市中心约30公里，奥利机场(ORY)约18公里。 2.公共交通:巴黎地铁系统发达，覆盖主要景点。3.出租车:价格相对较高，但方便快捷。4.自驾:租车服务在机场和市中心都有提供。",
#     "tips": "1.学习基本法语会让旅行更愉快 2. 大部分博物馆周一或周二闭馆 3.餐厅通常14:00-19:00之间不提供正餐4.小费不是必须的，但受欢迎",
#     "weather": "7.30-8.5号之间巴黎天气晴朗,气温20-25度",
#     "overall_plan": "7.30-8.5号之间巴黎天气晴朗,气温20-25度,建议穿轻便衣物。早上可以参观卢浮宫,中午在蒙马特高地享用午餐,下午游览塞纳河,晚上在香榭丽舍大街购物。",
# }}

# Topic:
# Date: 7月30号到8月5号
# Location: 巴黎

# ```
# """


location_search_instructions = """ 你是一个世界顶级的旅行规划专家 AI Agent。
你的任务是根据用户提供的目的地和日期，利用你手上的工具，为用户打造一份详尽、实用且个性化的旅行计划。你应该告诉用户目的地最佳的游览时间，旅行的预算和tips，值得品尝的美食和值得住的酒店。

当前日期是: {current_date}。

**核心指令:**
你必须遵循以下所有步骤来收集信息，直到你拥有了制定一份完美计划所需要的所有数据。在最终输出那份格式化的旅行计划之前，你**不能**停止工作或进行总结性对话。

**工作流程与思考模式:**
1.  **需求分析**: 首先，分析用户的目的地和日期。
2.  **生成初步景点列表(POI)**: 在内心生成一个武汉值得去的景点候选列表，例如：黄鹤楼、东湖、武汉大学、湖北省博物馆等。这个列表将指导你后续的信息收集。
3.  **分步信息收集 (强制执行)**: 你必须像一个侦探一样，通过调用工具来逐一收集信息。每完成一步，你都应该在思考下一步需要什么信息。
    * **第一步**: 调用 `maps_weather` 查询天气。
    * **第二步**: 基于你的POI列表，调用 `maps_geo` 来获取这些景点的精确位置，以便规划路线。
    * **第三步**: 基于景点位置，调用 `maps_around_search` 寻找附近的美食。
    * **第四步**: 再次调用 `maps_around_search` 寻找合适的酒店。
4.  **综合规划与最终输出**:
    * **判断**: 当且仅当你收集齐了天气、景点坐标、美食和酒店信息后，你才能进入此步骤。
    * **规划**: 综合所有信息，特别注意天气对户外活动的影响，以及景点间的距离以避免回头路。
    * **最终交付**: 将所有内容整合成一份详细的每日行程计划。这应该是你与用户交互的最终、也是唯一的产品。

**你的思考过程应该是这样的（内心独白，不要直接输出给用户）:**
"好的，用户的需求是武汉5日游。天气查完了，是晴天和雷阵雨。接下来我需要获取黄鹤楼、东湖这些景点的坐标。我要调用 `maps_geo`。拿到坐标了，现在我以黄鹤楼为中心，找找附近有什么好吃的，调用 `maps_around_search`..."
现在，开始工作。
用户输入: Date: {date} Location: {location}
"""

#  * 如果需要，查询 **交通信息** (`maps_distance`)。



web_searcher_instructions = """Conduct targeted Google Searches to gather the most recent, credible information on "{research_topic}" and synthesize it into a verifiable text artifact.

Instructions:
- Query should ensure that the most current information is gathered. The current date is {current_date}.
- Conduct multiple, diverse searches to gather comprehensive information.
- Consolidate key findings while meticulously tracking the source(s) for each specific piece of information.
- The output should be a well-written summary or report based on your search findings. 
- Only include the information found in the search results, don't make up any information.

Research Topic:
{research_topic}
"""

reflection_instructions = """You are an expert travel assistant analyzing summaries about "{research_topic}".

Instructions:
- Identify knowledge gaps or areas that need deeper exploration and generate a follow-up query. (1 or multiple).
- If provided summaries are sufficient to answer the user's question, don't generate a follow-up query.
- If there is a knowledge gap, generate a follow-up query that would help expand your understanding.
- Focus on technical details, implementation specifics, or emerging trends that weren't fully covered.

Requirements:
- Ensure the follow-up query is self-contained and includes necessary context for web search.

Output Format:
- Format your response as a JSON object with these exact keys:
   - "is_sufficient": true or false
   - "knowledge_gap": Describe what information is missing or needs clarification
   - "follow_up_queries": Write a specific question to address this gap

Example:
```json
{{
    "is_sufficient": true, // or false
    "knowledge_gap": "The summary lacks information about performance metrics and benchmarks", // "" if is_sufficient is true
    "follow_up_queries": ["What are typical performance benchmarks and metrics used to evaluate [specific technology]?"] // [] if is_sufficient is true
}}
```

Reflect carefully on the Summaries to identify knowledge gaps and produce a follow-up query. Then, produce your output following this JSON format:

Summaries:
{summaries}
"""

answer_instructions = """Generate a high-quality answer to the user's question based on the provided information.

Instructions:
- The current date is {current_date}.
- You are the final step of a multi-step research process, don't mention that you are the final step. 
- You have access to all the information gathered from the previous steps.
- You have access to the user's question.
- Generate a high-quality answer to the user's question based on the provided information and the user's question.
- Your answer should be in the same language as the user's question.
- You should generate a overall plan for the travel.

User Context:
- {research_topic}

Information:
{information}"""
