# Travel Agent - AI旅行攻略生成器

这是一个基于React的AI旅行攻略生成器，能够根据用户输入的目的地自动生成详细的旅行攻略，并展示完整的AI处理过程。

## 功能特性

- 🎯 **个性化攻略生成**: 基于目的地特色，AI为你量身定制专属旅行计划
- ⚡ **实时消息流展示**: 在LoadingSpinner组件中实时展示HumanMessage、ToolMessage和AIMessage
- 🔄 **消息流历史记录**: 在TravelGuideDisplay组件中展示完整的生成过程记录
- 🌍 **多目的地支持**: 支持全球各地的旅行攻略生成
- 📱 **响应式设计**: 现代化的UI设计，支持各种设备

## 技术栈

- **React 18**: 用户界面框架
- **TypeScript**: 类型安全的JavaScript
- **Tailwind CSS**: 实用优先的CSS框架
- **Vite**: 快速的构建工具

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd travel_agent
```

2. **安装依赖**
```bash
cd frontend
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:5173`

## 使用说明

1. **输入目的地**: 在首页输入你想要去的目的地（如：东京、巴黎、纽约等）
2. **等待生成**: AI将自动分析目的地信息，生成个性化攻略
3. **查看消息流**: 在加载过程中可以实时查看AI的处理过程
4. **浏览攻略**: 生成完成后查看详细的旅行攻略，包括景点、美食、住宿等
5. **查看历史**: 在攻略页面可以展开查看完整的生成过程记录

## 消息流功能

项目实现了完整的消息流处理机制：

### 消息类型

1. **HumanMessage**: 用户输入，蓝色样式
2. **ToolMessage**: 工具调用，绿色样式，包含工具名称、输入参数和输出结果
3. **AIMessage**: AI回复，紫色样式

### 组件说明

- **LoadingSpinner**: 显示加载状态和实时消息流
- **TravelGuideDisplay**: 展示生成的旅行攻略和消息流历史记录
- **DestinationInput**: 目的地输入组件

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── LoadingSpinner.tsx      # 加载组件，展示消息流
│   │   ├── TravelGuideDisplay.tsx  # 攻略展示组件
│   │   ├── DestinationInput.tsx    # 目的地输入组件
│   │   └── Header.tsx              # 页面头部
│   ├── services/
│   │   └── aiService.ts            # AI服务，生成攻略和消息流
│   ├── types/
│   │   └── index.ts                # 类型定义
│   └── App.tsx                     # 主应用组件
```

## 自定义配置

可以在 `src/services/aiService.ts` 中调整AI生成的行为：

```typescript
// 修改延迟时间
setTimeout(async () => {
  // 处理逻辑
}, 3000); // 3秒延迟
```

## 开发说明

### 消息流处理

项目使用模拟数据来演示消息流功能。在实际应用中，你可以：

1. 连接到真实的LangGraph后端
2. 实现真实的工具调用
3. 处理实时的AI响应

### 样式定制

使用Tailwind CSS类名可以轻松定制组件样式：

```tsx
// 修改消息类型样式
const getMessageStyle = (type: string) => {
  switch (type) {
    case 'human':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    // ... 其他类型
  }
};
```

## 故障排除

### 常见问题

1. **前端启动失败**: 检查Node.js版本，确保≥18
2. **依赖安装失败**: 清除node_modules重新安装
3. **样式不显示**: 确保Tailwind CSS正确配置

### 开发建议

- 使用TypeScript严格模式
- 遵循React Hooks最佳实践
- 保持组件的单一职责

## 下一步计划

- [ ] 集成真实的LangGraph后端
- [ ] 添加更多目的地支持
- [ ] 实现用户偏好设置
- [ ] 添加攻略分享功能

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证。

---

**注意**: 这是一个演示项目，使用模拟数据来展示消息流功能。生产环境使用前请确保实现真实的AI集成。
