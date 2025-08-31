export interface Destination {
  id: string;
  name: string;
  country: string;
  createdAt: Date;
}

export interface TravelGuide {
  id: string;
  destination: string;
  country: string;
  overview: string;
  attractions: Attraction[];
  restaurants: Restaurant[];
  hotels: Hotel[];
  transportation: Transportation;
  tips: string[];
  bestTimeToVisit: string;
  estimatedBudget: string;
  createdAt: Date;
  messageStream?: MessageStreamItem[]; // 添加消息流支持
}

export interface Attraction {
  name: string;
  description: string;
  rating: number;
  estimatedTime: string;
  ticketPrice: string;
  category: "historical" | "cultural" | "nature" | "entertainment" | "shopping";
}

export interface Restaurant {
  name: string;
  cuisine: string;
  description: string;
  rating: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  mustTry: string[];
}

export interface Hotel {
  name: string;
  category: "budget" | "mid-range" | "luxury";
  description: string;
  rating: number;
  estimatedPrice: string;
  amenities: string[];
}

export interface Transportation {
  airport: string;
  publicTransport: string[];
  taxi: string;
  tips: string[];
}

// 消息流相关类型定义
export interface MessageStreamItem {
  id: string;
  type: "human" | "tool" | "ai" | "chunk";
  content: string;
  timestamp: Date;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  status?: "success" | "error" | "pending";
  isStreaming?: boolean;
  chunks?: string[];
}
