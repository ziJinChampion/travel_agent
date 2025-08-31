import { TravelGuide, MessageStreamItem } from "../types";

// 模拟AI生成攻略的服务
export class AITravelService {
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async generateTravelGuide(destination: string): Promise<TravelGuide> {
    // 模拟API调用延迟
    await this.delay(2000 + Math.random() * 1000);

    // 生成模拟消息流数据
    const mockMessageStream: MessageStreamItem[] = [
      {
        id: "msg-1",
        type: "human",
        content: `请为我去${destination}旅行生成一份详细的攻略`,
        timestamp: new Date(Date.now() - 10000),
        status: "success",
      },
      {
        id: "msg-2",
        type: "ai",
        content: `好的，我来为您生成${destination}的旅行攻略。首先让我分析一下目的地信息。`,
        timestamp: new Date(Date.now() - 8000),
        status: "success",
      },
      {
        id: "msg-3",
        type: "tool",
        content: "正在搜索目的地信息...",
        timestamp: new Date(Date.now() - 6000),
        toolName: "maps_text_search",
        toolInput: { keywords: destination, city: "全国" },
        toolOutput: { results: ["找到多个相关地点"] },
        status: "success",
      },
      {
        id: "msg-4",
        type: "tool",
        content: "正在获取景点信息...",
        timestamp: new Date(Date.now() - 4000),
        toolName: "maps_around_search",
        toolInput: { keywords: "景点", location: "30.5928,114.3055" },
        toolOutput: { pois: ["黄鹤楼", "东湖", "户部巷"] },
        status: "success",
      },
      {
        id: "msg-5",
        type: "ai",
        content: `我已经收集了${destination}的相关信息，现在为您生成详细的旅行攻略。`,
        timestamp: new Date(Date.now() - 2000),
        status: "success",
      },
    ];

    // 这里在真实环境中会调用AI API，现在使用模拟数据
    const mockGuides: Record<string, Partial<TravelGuide>> = {
      东京: {
        destination: "东京",
        country: "日本",
        overview:
          "东京是日本的首都和最大城市，融合了传统文化与现代科技。这里有古老的寺庙、现代的摩天大楼、世界级的美食和独特的流行文化。",
        attractions: [
          {
            name: "浅草寺",
            description:
              "东京最古老的佛教寺庙，拥有1400年历史，是体验传统日本文化的绝佳场所。",
            rating: 4.5,
            estimatedTime: "2-3小时",
            ticketPrice: "免费",
            category: "historical",
          },
          {
            name: "东京塔",
            description:
              "333米高的红白色铁塔，可俯瞰整个东京城市景观，夜景尤其壮观。",
            rating: 4.3,
            estimatedTime: "1-2小时",
            ticketPrice: "¥1200-3000",
            category: "entertainment",
          },
          {
            name: "明治神宫",
            description:
              "供奉明治天皇的神社，被茂密的森林包围，是城市中的绿洲。",
            rating: 4.4,
            estimatedTime: "1-2小时",
            ticketPrice: "免费",
            category: "cultural",
          },
        ],
        restaurants: [
          {
            name: "数寄屋桥次郎",
            cuisine: "寿司",
            description: "世界知名的寿司店，米其林三星，提供极致的寿司体验。",
            rating: 4.9,
            priceRange: "$$$$",
            mustTry: ["金枪鱼寿司", "海胆寿司", "主厨特选套餐"],
          },
          {
            name: "一兰拉面",
            cuisine: "拉面",
            description: "著名的豚骨拉面连锁店，以个人用餐空间和浓郁汤头闻名。",
            rating: 4.2,
            priceRange: "$$",
            mustTry: ["经典豚骨拉面", "半熟鸡蛋", "叉烧"],
          },
        ],
        hotels: [
          {
            name: "东京丽思卡尔顿酒店",
            category: "luxury",
            description: "位于六本木的奢华酒店，享有富士山和东京湾的壮丽景色。",
            rating: 4.8,
            estimatedPrice: "¥50,000-80,000/晚",
            amenities: ["spa", "健身房", "米其林餐厅", "礼宾服务"],
          },
          {
            name: "东京新宿华盛顿酒店",
            category: "mid-range",
            description: "位置便利的商务酒店，距离新宿站步行5分钟，设施完善。",
            rating: 4.1,
            estimatedPrice: "¥12,000-18,000/晚",
            amenities: ["免费WiFi", "24小时前台", "餐厅", "便利店"],
          },
        ],
        transportation: {
          airport:
            "主要机场：成田国际机场(NRT)和羽田机场(HND)。成田机场距离市中心约60公里，羽田机场距离约30公里。",
          publicTransport: [
            "JR山手线：环绕东京主要区域的重要线路",
            "地下铁：覆盖全市的便捷地铁系统",
            "都营线：连接各个区域的公共交通",
          ],
          taxi: "起步价约¥500，市内短途约¥1000-3000。建议使用JapanTaxi应用叫车。",
          tips: [
            "购买一日券或多日券更经济",
            "高峰时段避免乘坐，非常拥挤",
            "使用Google Maps或Hyperdia查询路线",
          ],
        },
        tips: [
          "学习基本的日语问候语会很有帮助",
          "随身携带现金，很多地方不接受信用卡",
          "遵守当地礼仪，如排队、安静乘车等",
          "提前预订热门餐厅和景点",
          "购买JR Pass可以节省交通费用",
        ],
        bestTimeToVisit:
          "春季（3-5月）樱花盛开，秋季（9-11月）红叶美丽，是最佳旅游季节。夏季炎热潮湿，冬季寒冷但少雪。",
        estimatedBudget:
          "中等预算：每天¥8,000-15,000（约$60-110），包含住宿、餐饮、交通和景点门票。",
      },
      巴黎: {
        destination: "巴黎",
        country: "法国",
        overview:
          '巴黎是法国的首都，被誉为"光之城"和"浪漫之都"。这里有世界著名的博物馆、历史建筑、时尚购物和精致美食。',
        attractions: [
          {
            name: "埃菲尔铁塔",
            description:
              "巴黎的标志性建筑，324米高的铁塔提供城市全景，夜晚灯光秀非常壮观。",
            rating: 4.6,
            estimatedTime: "2-3小时",
            ticketPrice: "€29-35",
            category: "historical",
          },
          {
            name: "卢浮宫",
            description:
              "世界最大的艺术博物馆，收藏了《蒙娜丽莎》等无价艺术品。",
            rating: 4.7,
            estimatedTime: "4-6小时",
            ticketPrice: "€17",
            category: "cultural",
          },
        ],
        restaurants: [
          {
            name: "L'Ami Jean",
            cuisine: "法式",
            description: "传统法式小酒馆，以高质量的法式料理和温馨氛围著称。",
            rating: 4.5,
            priceRange: "$$$",
            mustTry: ["鹅肝", "牛排", "法式洋葱汤"],
          },
        ],
        hotels: [
          {
            name: "巴黎丽兹酒店",
            category: "luxury",
            description: "历史悠久的奢华酒店，位于旺多姆广场，服务一流。",
            rating: 4.9,
            estimatedPrice: "€800-1500/晚",
            amenities: ["spa", "米其林餐厅", "礼宾服务", "健身房"],
          },
        ],
        transportation: {
          airport:
            "主要机场：戴高乐机场(CDG)距离市中心约30公里，奥利机场(ORY)约18公里。",
          publicTransport: [
            "地铁：14条线路覆盖全市",
            "RER：连接郊区和机场",
            "公交：补充地铁网络",
          ],
          taxi: "起步价约€7，市内约€15-30。推荐使用Uber或G7应用。",
          tips: [
            "购买Navigo周票更划算",
            "避开高峰时段",
            "注意扒手，保管好贵重物品",
          ],
        },
        tips: [
          "学习基本法语会让旅行更愉快",
          "大部分博物馆周一或周二闭馆",
          "餐厅通常14:00-19:00之间不提供正餐",
          "小费不是必须的，但受欢迎",
          "提前预订热门餐厅和景点",
        ],
        bestTimeToVisit:
          "春季（4-6月）和秋季（9-10月）天气宜人，夏季温暖但游客较多，冬季较冷但有圣诞气氛。",
        estimatedBudget:
          "中等预算：每天€100-180（约$110-200），包含住宿、餐饮、交通和景点门票。",
      },
    };

    const guide = mockGuides[destination.toLowerCase()] || mockGuides["东京"];

    return {
      id: `guide-${Date.now()}`,
      destination: destination,
      country: guide.country || "未知",
      overview:
        guide.overview ||
        `${destination}是一个美丽的旅游目的地，拥有丰富的文化和自然景观。`,
      attractions: guide.attractions || [],
      restaurants: guide.restaurants || [],
      hotels: guide.hotels || [],
      transportation: guide.transportation || {
        airport: "请查询当地机场信息",
        publicTransport: ["当地公共交通"],
        taxi: "当地出租车服务",
        tips: ["使用当地交通应用"],
      },
      tips: guide.tips || ["提前做好旅行规划", "了解当地文化和习俗"],
      bestTimeToVisit:
        guide.bestTimeToVisit || "全年皆宜，根据个人喜好选择季节。",
      estimatedBudget: guide.estimatedBudget || "根据个人需求制定预算。",
      createdAt: new Date(),
      messageStream: mockMessageStream, // 添加模拟消息流
    };
  }
}
