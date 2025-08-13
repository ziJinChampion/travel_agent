from langgraph_mcp import MCPTool
from typing import List, Dict, Any

class MCPToolManager:
    def __init__(self):
        self.mcp_tools = {}
    
    def register_mcp_tool(self, name: str, mcp_config: Dict[str, Any]):
        """注册MCP工具"""
        tool = MCPTool.from_config(mcp_config)
        self.mcp_tools[name] = tool
    
    def get_tool(self, name: str):
        """获取MCP工具"""
        return self.mcp_tools.get(name)
    
    def list_available_tools(self) -> List[str]:
        """列出可用的MCP工具"""
        return list(self.mcp_tools.keys())
