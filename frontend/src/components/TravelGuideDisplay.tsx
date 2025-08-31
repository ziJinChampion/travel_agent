import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Camera,
  Utensils,
  Hotel,
  Car,
  Lightbulb,
  User,
  Bot,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { TravelGuide, MessageStreamItem } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TravelGuideDisplayProps {
  guide: TravelGuide;
  onBack: () => void;
  aiMessage: string;
}

export function TravelGuideDisplay({
  guide,
  onBack,
  aiMessage,
}: TravelGuideDisplayProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "attractions" | "restaurants" | "hotels" | "transport" | "tips"
  >("overview");
  const [isMessageStreamExpanded, setIsMessageStreamExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息流更新时自动滚动
  useEffect(() => {
    if (isMessageStreamExpanded) {
      scrollToBottom();
    }
  }, [guide.messageStream, isMessageStreamExpanded]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "human":
        return <User className="h-4 w-4 text-blue-500" />;
      case "tool":
        return <Wrench className="h-4 w-4 text-green-500" />;
      case "ai":
        return <Bot className="h-4 w-4 text-purple-500" />;
      case "chunk":
        return <Bot className="h-4 w-4 text-purple-500 animate-pulse" />;
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
      case "chunk":
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
      case "chunk":
        return "AI正在生成...";
      default:
        return "消息";
    }
  };

  // 渲染攻略内容 - 使用Markdown渲染
  const renderGuideContent = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义标题样式
              h1: ({ ...props }) => (
                <h1
                  className="text-3xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2"
                  {...props}
                />
              ),
              h2: ({ ...props }) => (
                <h2
                  className="text-3xl font-semibold text-gray-800 mb-3 mt-6"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className="text-xl font-semibold text-gray-700 mb-2 mt-5"
                  {...props}
                />
              ),
              h4: ({ ...props }) => (
                <h4
                  className="text-lg font-medium text-gray-600 mb-2 mt-4"
                  {...props}
                />
              ),
              // 自定义段落样式
              p: ({ ...props }) => (
                <p className="text-gray-700 leading-relaxed mb-4" {...props} />
              ),
              // 自定义列表样式
              ul: ({ ...props }) => (
                <ul
                  className="list-disc list-inside text-gray-700 mb-4 space-y-1"
                  {...props}
                />
              ),
              ol: ({ ...props }) => (
                <ol
                  className="list-decimal list-inside text-gray-700 mb-4 space-y-1"
                  {...props}
                />
              ),
              li: ({ ...props }) => <li className="text-gray-700" {...props} />,
              // 自定义代码块样式
              code: ({ ...props }) => {
                const { inline, ...restProps } = props as {
                  inline?: boolean;
                  [key: string]: unknown;
                };
                return inline ? (
                  <code
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
                    {...restProps}
                  />
                ) : (
                  <code
                    className="block bg-gray-100 text-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto"
                    {...restProps}
                  />
                );
              },
              pre: ({ ...props }) => (
                <pre
                  className="bg-gray-100 text-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4"
                  {...props}
                />
              ),
              // 自定义表格样式
              table: ({ ...props }) => (
                <table
                  className="min-w-full border border-gray-200 rounded-lg overflow-hidden mb-4"
                  {...props}
                />
              ),
              thead: ({ ...props }) => (
                <thead className="bg-gray-50" {...props} />
              ),
              tbody: ({ ...props }) => (
                <tbody className="bg-white" {...props} />
              ),
              tr: ({ ...props }) => (
                <tr className="border-b border-gray-200" {...props} />
              ),
              th: ({ ...props }) => (
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                  {...props}
                />
              ),
              td: ({ ...props }) => (
                <td className="px-4 py-3 text-sm text-gray-700" {...props} />
              ),
              // 自定义引用样式
              blockquote: ({ ...props }) => (
                <blockquote
                  className="border-l-4 border-sky-500 pl-4 italic text-gray-600 mb-4"
                  {...props}
                />
              ),
              // 自定义链接样式
              a: ({ ...props }) => (
                <a
                  className="text-sky-600 hover:text-sky-800 underline"
                  {...props}
                />
              ),
              // 自定义强调样式
              strong: ({ ...props }) => (
                <strong className="font-semibold text-gray-900" {...props} />
              ),
              em: ({ ...props }) => (
                <em className="italic text-gray-800" {...props} />
              ),
            }}
          >
            {aiMessage}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  const tabs = [
    {
      id: "overview",
      name: "概览",
      icon: <MapPin className="h-5 w-5" />,
      content: renderGuideContent(),
    },
    {
      id: "attractions",
      name: "景点",
      icon: <Camera className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              景点推荐
            </h3>
            <p className="text-gray-600">景点信息正在生成中，请稍候...</p>
          </div>
        </div>
      ),
    },
    {
      id: "restaurants",
      name: "美食",
      icon: <Utensils className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              美食推荐
            </h3>
            <p className="text-gray-600">美食信息正在生成中，请稍候...</p>
          </div>
        </div>
      ),
    },
    {
      id: "hotels",
      name: "住宿",
      icon: <Hotel className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              住宿建议
            </h3>
            <p className="text-gray-600">住宿信息正在生成中，请稍候...</p>
          </div>
        </div>
      ),
    },
    {
      id: "transport",
      name: "交通",
      icon: <Car className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              交通信息
            </h3>
            <p className="text-gray-600">交通信息正在生成中，请稍候...</p>
          </div>
        </div>
      ),
    },
    {
      id: "tips",
      name: "贴士",
      icon: <Lightbulb className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              旅行贴士
            </h3>
            <p className="text-gray-600">旅行贴士正在生成中，请稍候...</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <button
          onClick={onBack}
          className="mb-4 text-white/80 hover:text-white transition-colors"
        >
          ← 返回搜索
        </button>
        <h1 className="text-4xl font-bold mb-2">
          {guide.destination.length > 30
            ? guide.destination.substring(0, 30) + "..."
            : guide.destination}
        </h1>
      </div>

      {guide.messageStream && guide.messageStream.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 text-sky-500 mr-2" />
              思考过程
            </h3>
            <button
              onClick={() =>
                setIsMessageStreamExpanded(!isMessageStreamExpanded)
              }
              className="flex items-center space-x-1 text-sm text-sky-600 hover:text-sky-700 transition-colors"
            >
              {isMessageStreamExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>收起</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>展开查看</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`space-y-2 ${
              isMessageStreamExpanded
                ? "max-h-96 overflow-y-auto"
                : "max-h-20 overflow-hidden"
            }`}
          >
            {(guide.messageStream as MessageStreamItem[]).map(
              (message, index) => (
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
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {!isMessageStreamExpanded && (
            <div className="text-center mt-3">
              <span
                className="text-sm text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() =>
                  setIsMessageStreamExpanded(!isMessageStreamExpanded)
                }
              >
                消息太长被隐藏，点击展开查看全部
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "overview"
                    | "attractions"
                    | "restaurants"
                    | "hotels"
                    | "transport"
                    | "tips"
                )
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}
