import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import ImageAnalyzer from './components/ImageAnalyzer';
import StoryGenerator from './components/StoryGenerator';
import Icon from './components/common/Icon';

type Feature = 'chat' | 'analyze' | 'story';

const features: { id: Feature, name: string, icon: string }[] = [
  { id: 'chat', name: 'AI Chatbot', icon: 'voice_chat' },
  { id: 'analyze', name: 'Analyze Image', icon: 'document_scanner' },
  { id: 'story', name: 'Creative Writer', icon: 'audio_spark' },
];

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('chat');

  const renderFeature = () => {
    switch (activeFeature) {
      case 'chat':
        return <Chatbot />;
      case 'analyze':
        return <ImageAnalyzer />;
      case 'story':
        return <StoryGenerator />;
      default:
        return <Chatbot />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">Gemini</span> Multi-Tool
            </h1>
          </div>
          <nav>
            <ul className="flex items-center space-x-2 md:space-x-4 border-b border-gray-800">
              {features.map((feature) => (
                <li key={feature.id}>
                  <button
                    onClick={() => setActiveFeature(feature.id)}
                    className={`flex items-center gap-2 px-3 py-3 text-sm md:text-base font-medium transition-colors duration-200 ${
                      activeFeature === feature.id
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon name={feature.icon} />
                    <span>{feature.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {renderFeature()}
      </main>
      
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-800">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;
