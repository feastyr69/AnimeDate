import { useState, useRef, useEffect } from 'react';
import WaifuSprite from './components/WaifuSprite';
import { motion, AnimatePresence } from 'framer-motion';
import { determineEmotion, getWaifuResponse } from './utils/chat';

type Message = {
  id: string;
  sender: 'user' | 'waifu';
  text: string;
};

function App() {
  const [emotion, setEmotion] = useState('normal');
  const [isTalking, setIsTalking] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'waifu', text: 'H-hello there! I am ready to chat~' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate thinking and auto-change emotion based on input
    setTimeout(() => {
      const nextEmotion = determineEmotion(userMessage.text);
      setEmotion(nextEmotion);
      setIsTalking(true);
      
      const waifuResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'waifu',
        text: getWaifuResponse(nextEmotion)
      };
      setMessages(prev => [...prev, waifuResponse]);

      // Stop talking after a short delay
      setTimeout(() => setIsTalking(false), 2000);
    }, 800);
  };

  const latestWaifuMessage = [...messages].reverse().find(m => m.sender === 'waifu');

  return (
    <div className="flex flex-col md:flex-row h-screen bg-pink-100 bg-gradient-to-br from-pink-50 to-purple-100 overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Area: Waifu Sprite & Input Box */}
      <div className="flex-1 flex flex-col items-center justify-end relative z-10">
        
        {/* Reply Text above Waifu's Head */}
        <div className="absolute top-8 md:top-12 left-0 w-full flex justify-center z-40 px-4">
          <AnimatePresence mode="wait">
            {latestWaifuMessage && (
              <motion.p
                key={latestWaifuMessage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-pink-600 font-bold text-xl md:text-2xl text-center leading-snug drop-shadow-[0_0_15px_rgba(255,255,255,1)] max-w-md"
              >
                {latestWaifuMessage.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Waifu Sprite */}
        <div className="flex flex-col items-center justify-end w-full">
          <WaifuSprite emotion={emotion} isTalking={isTalking} />
        </div>

        {/* Text Input Box (Bottom Middle) */}
        <div className="w-full max-w-md px-4 -mt-2 mb-6 z-20">
          <form onSubmit={handleSend} className="flex gap-2 p-2 bg-white/90 backdrop-blur-md border border-pink-300 rounded-full shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say something cute..."
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-gray-700 placeholder-pink-400 font-medium"
            />
            <button 
              type="submit"
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 transition-all focus:outline-none flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90 translate-x-0.5 translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar: Chat History */}
      <div className="w-full md:w-80 lg:w-96 bg-white/50 backdrop-blur-md border-l border-pink-200 flex flex-col h-1/2 md:h-full shadow-2xl z-20 transition-all">
        <div className="bg-gradient-to-r from-pink-300 to-purple-300 p-4 text-white text-center font-bold text-xl tracking-wide shadow-sm z-10 flex-shrink-0">
          ✨ Chat History ✨
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}
            >
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-md ${
                  msg.sender === 'user' 
                    ? 'bg-purple-400 text-white rounded-br-sm shadow-md' 
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-md border border-pink-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
