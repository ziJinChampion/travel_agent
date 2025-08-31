import React, { useState } from 'react';
import { Send, Globe, Loader2 } from 'lucide-react';

interface DestinationInputProps {
  onGenerate: (destination: string) => void;
  isLoading: boolean;
}

export function DestinationInput({ onGenerate, isLoading }: DestinationInputProps) {
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim() && !isLoading) {
      onGenerate(destination.trim());
    }
  };

  const popularDestinations = ['东京', '巴黎', '纽约', '伦敦', '罗马', '悉尼'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          告诉我你想去哪里
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          AI将为你生成专属的详细旅行攻略
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="输入你的目的地，例如：东京、巴黎、纽约..."
            className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition-all duration-200 bg-white shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!destination.trim() || isLoading}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-3 rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
              {isLoading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Send className="h-6 w-6 text-white" />
              )}
            </div>
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-gray-500 mb-4">或选择热门目的地</p>
        <div className="flex flex-wrap justify-center gap-3">
          {popularDestinations.map((dest) => (
            <button
              key={dest}
              onClick={() => !isLoading && onGenerate(dest)}
              disabled={isLoading}
              className="px-6 py-2 bg-white border border-gray-200 rounded-full hover:border-sky-300 hover:bg-sky-50 transition-all duration-200 text-gray-700 hover:text-sky-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}