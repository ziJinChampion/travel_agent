import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI旅游助手</h1>
              <p className="text-sm text-gray-500">智能生成个性化旅行攻略</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI驱动</span>
          </div>
        </div>
      </div>
    </header>
  );
}