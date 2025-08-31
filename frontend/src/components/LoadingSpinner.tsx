import React from "react";
import {
  Plane,
  Globe,
  User,
  Bot,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { MessageStreamItem } from "../types";

interface LoadingSpinnerProps {
  destination: string;
  messageStream?: MessageStreamItem[];
  aiMessage?: string;
}

export function LoadingSpinner({
  destination,
  messageStream = [],
  aiMessage,
}: LoadingSpinnerProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息流更新时自动滚动
  React.useEffect(() => {
    scrollToBottom();
  }, [messageStream]);

  // 工作流程步骤
  const workflowSteps = [
    { id: 1, name: "检查位置信息", description: "验证目的地信息的有效性" },
    { id: 2, name: "准备搜索", description: "初始化搜索参数和工具" },
    { id: 3, name: "AI分析", description: "AI代理分析用户需求" },
    { id: 4, name: "工具执行", description: "调用地图API获取信息" },
    { id: 5, name: "生成攻略", description: "整理信息生成最终攻略" },
  ];

  // 根据消息流判断当前步骤
  const getCurrentStep = () => {
    if (messageStream.length === 0) return 1;

    const hasToolCalls = messageStream.some((msg) => msg.type === "tool");
    const hasToolResults = messageStream.some((msg) => msg.toolOutput);
    const hasAIResponse = messageStream.some(
      (msg) => msg.type === "ai" && msg.content.length > 50
    );

    if (hasAIResponse && hasToolResults) return 5;
    if (hasToolResults) return 4;
    if (hasToolCalls) return 3;
    return 2;
  };

  const currentStep = getCurrentStep();

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "human":
        return <User className="h-4 w-4 text-blue-500" />;
      case "tool":
        return <Wrench className="h-4 w-4 text-green-500" />;
      case "ai":
        return <Bot className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case "human":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "tool":
        return "bg-green-50 border-green-200 text-green-900";
      case "ai":
        return "bg-purple-50 border-purple-200 text-purple-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getMessageTitle = (type: string, toolName?: string) => {
    switch (type) {
      case "human":
        return "用户输入";
      case "tool":
        return `工具调用: ${toolName || "未知工具"}`;
      case "ai":
        return "AI回复";
      default:
        return "消息";
    }
  };

  return (
    <div className="text-center py-16">
      {/* 工作流程进度 */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
            <Globe className="h-5 w-5 text-sky-500 mr-2" />
            正在为 {destination} 生成旅行攻略
          </h3>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mb-6">
            {workflowSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id <= currentStep
                      ? "bg-sky-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.id < currentStep ? "✓" : step.id}
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center max-w-20">
                  {step.name}
                </div>
              </div>
            ))}
          </div>

          {/* 当前步骤描述 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              当前步骤：{workflowSteps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* 加载动画 */}
      <div className="mb-8">
        <div className="inline-block p-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full mb-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <Plane className="h-8 w-8 text-sky-500 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          正在生成 {destination} 的旅行攻略
        </h2>
        <p className="text-gray-600">
          请稍候，AI正在为您分析目的地信息并生成个性化攻略...
        </p>
      </div>

      {/* 消息流展示 */}
      {messageStream.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                实时思考过程
              </h4>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>收起</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>展开</span>
                  </>
                )}
              </button>
            </div>

            <div
              className={`space-y-3 ${
                isExpanded
                  ? "max-h-96 overflow-y-auto"
                  : "max-h-32 overflow-hidden"
              }`}
            >
              {messageStream.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`p-3 rounded-lg border ${getMessageStyle(
                    message.type
                  )} transition-all duration-200`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {getMessageTitle(message.type, message.toolName)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">{message.content}</div>
                      {message.type === "ai" && message.toolInput && (
                        <div className="mt-2 text-xs">
                          <details className="text-gray-600">
                            <summary className="cursor-pointer hover:text-gray-800">
                              工具参数
                            </summary>
                            <pre className="mt-1 p-1 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(message.toolInput, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                      {message.type === "tool" && message.toolOutput && (
                        <div className="mt-2 text-xs">
                          <details className="text-gray-600">
                            <summary className="cursor-pointer hover:text-gray-800">
                              工具输出
                            </summary>
                            <pre className="mt-1 p-1 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(message.toolOutput, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {aiMessage && (
                <div
                  key={"ai-message"}
                  className={`p-3 rounded-lg border ${getMessageStyle(
                    "ai"
                  )} transition-all duration-200`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon("ai")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {getMessageTitle("ai")}
                        </span>
                      </div>
                      <div className="text-sm">{aiMessage}</div>
                    </div>
                  </div>
                </div>
              )}
              {/* 自动滚动目标元素 */}
              <div ref={messagesEndRef} />
            </div>

            {!isExpanded && messageStream.length > 2 && (
              <div className="text-center mt-3">
                <span
                  className="text-sm text-gray-500"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  消息太长被隐藏，点击展开查看全部
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
