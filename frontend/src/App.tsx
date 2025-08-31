import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { DestinationInput } from "./components/DestinationInput";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { TravelGuideDisplay } from "./components/TravelGuideDisplay";

import { TravelGuide, MessageStreamItem } from "./types";
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<TravelGuide | null>(null);
  const [currentDestination, setCurrentDestination] = useState("");
  const [messageStream, setMessageStream] = useState<MessageStreamItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasFinalizeEventOccurredRef = useRef(false);
  const [aiMessage, setAiMessage] = useState<string>("");

  useEffect(() => {
    console.log("aiMessage", aiMessage);
  }, [aiMessage]);

  const thread = useStream<{
    messages: Message[];
    initial_search_query_count: number;
    max_research_loops: number;
  }>({
    apiUrl: import.meta.env.DEV
      ? "http://localhost:2024"
      : "http://localhost:8123",
    assistantId: "agent",
    messagesKey: "messages",
    onUpdateEvent: (event: Record<string, unknown>) => {
      console.log("event->>>>", event);

      if (event.check_location_info) {
        console.log("check_location_info-------------> from here ");
      } else if (event.prepare_agent_loop) {
        console.log("prepare_agent_loop-------------> from here ");
      } else if (event.reflection) {
        console.log("reflection-------------> from here ");
      } else if (event.finalize_answer) {
        console.log("finalize_answer-------------> from here ");
        hasFinalizeEventOccurredRef.current = true;
      }
    },
    onError: (error: unknown) => {
      setError((error as Error)?.message || "未知错误");
    },
  });

  // 处理消息流更新
  useEffect(() => {
    if (thread.messages && thread.messages.length > 0) {
      console.log("thread.messages", thread.messages);
      const processedMessages = processMessageStream(thread.messages);
      setMessageStream(processedMessages);
      handleFinalPlan(thread.messages);
      // 检查是否有finalize_answer事件，如果有则生成旅行攻略
      if (hasFinalizeEventOccurredRef.current && !currentGuide) {
        handleFinalizeAnswer();
      }
    }
  }, [thread.messages, currentGuide]);

  const handleFinalPlan = useCallback((messages: Message[]) => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.type === "ai" && lastMessage.tool_calls?.length === 0) {
      const aiContent = lastMessage.content as string;
      setAiMessage(aiContent);
    }
  }, []);

  // 处理finalize_answer事件
  const handleFinalizeAnswer = useCallback(async () => {
    if (!currentDestination) return;
    console.log("finalize_answer", thread.messages);
    try {
      // 从消息流中提取攻略信息
      const lastMessage = thread.messages?.[thread.messages.length - 1];

      if (!lastMessage) {
        throw new Error("没有找到AI回复消息");
      }

      // 解析AI的最终回复，提取攻略信息
      const aiContent = lastMessage.content as string;

      // 创建一个基于消息流的攻略对象
      const guide: TravelGuide = {
        id: `guide-${Date.now()}`,
        destination: currentDestination,
        country: "未知", // 可以从消息中解析
        overview: aiContent,
        attractions: [], // 可以从消息中解析
        restaurants: [], // 可以从消息中解析
        hotels: [], // 可以从消息中解析
        transportation: {
          airport: "请查询当地机场信息",
          publicTransport: ["当地公共交通"],
          taxi: "当地出租车服务",
          tips: ["使用当地交通应用"],
        },
        tips: ["提前做好旅行规划", "了解当地文化和习俗"],
        bestTimeToVisit: "全年皆宜，根据个人喜好选择季节。",
        estimatedBudget: "根据个人需求制定预算。",
        createdAt: new Date(),
        messageStream: messageStream, // 使用真实的消息流
      };

      setCurrentGuide(guide);
      setIsLoading(false);
    } catch (error) {
      console.error("生成最终攻略失败:", error);
      setError("生成攻略失败，请重试");
      setIsLoading(false);
    }
  }, [currentDestination, messageStream, thread.messages]);

  // 处理消息流数据，转换为前端需要的格式
  const processMessageStream = (messages: unknown[]): MessageStreamItem[] => {
    return messages
      .map((message, index) => {
        let type: "human" | "tool" | "ai" = "ai";
        let content = "";
        let toolName = "";
        let toolInput = null;
        let toolOutput = null;

        const msg = message as Record<string, unknown>;
        // 过滤掉系统内部消息和values
        if (
          msg.role === "system" ||
          msg.type === "system" ||
          msg.content === "values"
        ) {
          return null;
        }
        if (msg.role === "user" || msg.type === "human") {
          type = "human";
          content = (msg.content as string) || (msg.text as string) || "";
        } else if (msg.type === "ai" && msg.tool_calls) {
          type = "ai";
          if (
            msg.tool_calls &&
            Array.isArray(msg.tool_calls) &&
            msg.tool_calls.length > 0
          ) {
            const toolCall = msg.tool_calls[0] as Record<string, unknown>;
            toolName = (toolCall.name as string) || "";
            toolInput = toolCall.args || {};

            // 根据工具名称生成友好的描述
            if (toolName === "maps_text_search") {
              content = "正在搜索目的地信息...";
            } else if (toolName === "maps_around_search") {
              const keywords = (toolInput as Record<string, unknown>)?.keywords;
              if (keywords === "美食") {
                content = "正在搜索当地美食...";
              } else if (keywords === "酒店") {
                content = "正在搜索住宿选择...";
              } else if (keywords === "景点") {
                content = "正在搜索景点信息...";
              } else {
                content = `正在搜索${keywords}相关信息...`;
              }
            } else if (toolName === "maps_direction_driving") {
              content = "正在规划驾车路线...";
            } else if (toolName === "maps_weather") {
              content = "正在查询天气信息...";
            } else if (toolName === "maps_geo") {
              content = "正在获取景点坐标...";
            } else {
              content = `正在执行${toolName}...`;
            }
          } else {
            content = "正在执行工具调用...";
          }
        } else if (msg.type === "tool") {
          type = "tool";
          if (msg.tool_call_id) {
            const toolResult = msg.content as Record<string, unknown>;
            toolOutput = toolResult;
            toolName = msg.name as string;
            // 根据工具名称格式化输出
            content = `工具${msg.name}执行成功`;
          }
        } else {
          return null;
        }

        // 如果内容为空或只是系统提示，跳过这条消息
        if (!content || content.trim().length === 0) {
          return null;
        }

        return {
          id: (msg.id as string) || `msg-${index}`,
          type,
          content,
          timestamp: new Date(),
          toolName,
          toolInput,
          toolOutput,
          status: "success",
        };
      })
      .filter(Boolean) as MessageStreamItem[]; // 过滤掉null值
  };

  const handleGenerateGuide = async (destination: string) => {
    setIsLoading(true);
    setCurrentDestination(destination);
    setMessageStream([]);
    setError(null);
    hasFinalizeEventOccurredRef.current = false;

    try {
      // 调用真实的LangGraph后端API
      console.log("启动AI处理，目的地:", destination);

      const newMessages: Message[] = [
        ...(thread.messages || []),
        {
          type: "human",
          content: destination,
          id: Date.now().toString(),
        },
      ];

      // 使用thread.submit调用真实的API
      thread.submit({
        messages: newMessages,
      });
    } catch (error) {
      console.error("启动AI处理失败:", error);
      setError("启动AI处理失败，请重试");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentGuide(null);
    setCurrentDestination("");
    setMessageStream([]);
    setError(null);
    hasFinalizeEventOccurredRef.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <LoadingSpinner
            destination={currentDestination}
            messageStream={messageStream}
            aiMessage={aiMessage}
          />
        ) : currentGuide ? (
          <TravelGuideDisplay
            guide={currentGuide}
            onBack={handleBack}
            aiMessage={aiMessage}
          />
        ) : (
          <div className="text-center">
            <div className="mb-12">
              <div className="inline-block p-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
                >
                  清除错误
                </button>
              </div>
            )}

            <DestinationInput
              onGenerate={handleGenerateGuide}
              isLoading={isLoading}
            />

            {/* Features Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  个性化攻略
                </h3>
                <p className="text-gray-600">
                  基于目的地特色，AI为你量身定制专属旅行计划
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  即时生成
                </h3>
                <p className="text-gray-600">
                  几秒钟内获得详细的景点、美食、住宿推荐
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  专业建议
                </h3>
                <p className="text-gray-600">
                  包含交通、预算、最佳时间等实用旅行贴士
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
