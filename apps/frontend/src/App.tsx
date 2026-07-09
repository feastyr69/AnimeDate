import { useState } from 'react';
import WaifuSprite from './components/WaifuSprite';
import ChatInterface from './components/ChatInterface';

function App() {
  const [emotion, setEmotion] = useState('normal');
  const [isTalking, setIsTalking] = useState(false);

  const handleEmotionChange = (nextEmotion: string) => {
    setEmotion(nextEmotion);
    setIsTalking(true);

    // Stop talking after the response has been "delivered"
    setTimeout(() => setIsTalking(false), 2000);
  };

  return (
    <div className="min-h-screen bg-pink-100 bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-16 z-10">
        {/* Waifu Section */}
        <div className="flex-1 w-full max-w-sm md:max-w-none">
          <WaifuSprite emotion={emotion} isTalking={isTalking} />
        </div>

        {/* Chat Section */}
        <div className="flex-1 w-full max-w-sm md:max-w-none">
          <ChatInterface onEmotionChange={handleEmotionChange} />
        </div>
      </div>
    </div>
  );
}

export default App;
