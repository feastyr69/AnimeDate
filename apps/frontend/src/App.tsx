import { useState, useMemo, useRef } from 'react';
import WaifuSprite from './components/WaifuSprite';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from './components/AnimatedText';

type Message = {
  id: string;
  sender: 'user' | 'waifu';
  text: string;
};

function App() {
  const [emotion, setEmotion] = useState('normal');
  const [isTalking, setIsTalking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRizzed, setIsRizzed] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  const sessionId = useMemo(() => Math.random().toString(36).substring(7), []);

  const handleClearMemory = async () => {
    if (!window.confirm("Are you sure you want to clear her memory?")) return;
    try {
      await fetch('http://localhost:8000/api/clear-memory', { method: 'POST' });
      setMessages([]);
      alert("Memory wiped!");
    } catch (e) {
      console.error(e);
      alert("Failed to clear memory");
    }
  };



  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTalking || isThinking) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setIsRizzed(false); // Reset rizz on next turn

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, session_id: sessionId })
      });
      const data = await res.json();

      setEmotion(data.emotion);
      setIsRizzed(data.is_rizzed || false);

      if (data.is_rizzed && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }

      const waifuResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'waifu',
        text: data.reply
      };
      setMessages(prev => [...prev, waifuResponse]);
      setIsTalking(true); // Start talking when text appears
    } catch (error) {
      console.error("Error communicating with AI:", error);
      // Fallback if AI fails
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'waifu',
        text: 'Sorry, I got disconnected! Try again~'
      }]);
      setIsTalking(true);
    } finally {
      setIsThinking(false); // Done thinking
    }
  };

  const latestWaifuMessage = [...messages].reverse().find(m => m.sender === 'waifu');

  return (
    <div className="flex flex-col md:flex-row h-screen bg-pink-100 bg-gradient-to-br from-pink-50 to-purple-100 overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <audio ref={audioRef} src="/rizz.mp3" preload="auto" />

      <button
        onClick={handleClearMemory}
        className="absolute top-4 right-4 z-50 bg-red-400 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded-full shadow-md transition-all"
      >
        Clear Memory
      </button>

      {/* Main Area: Waifu Sprite & Input Box */}
      <div className="flex-1 flex flex-col items-center justify-end relative z-10">

        {/* Reply Text above Waifu's Head */}
        <div className="w-full flex justify-center z-40 px-4 min-h-[4rem] -mb-12">
          <AnimatePresence mode="wait">
            {isThinking ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 items-center justify-center mt-6"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-3 h-3 bg-pink-400 rounded-full shadow-sm" />
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-3 h-3 bg-pink-400 rounded-full shadow-sm" />
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-3 h-3 bg-pink-400 rounded-full shadow-sm" />
              </motion.div>
            ) : latestWaifuMessage ? (
              <AnimatedText
                key={latestWaifuMessage.id}
                text={latestWaifuMessage.text}
                onComplete={() => setIsTalking(false)}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {/* Waifu Sprite */}
        <div className="flex flex-col items-center justify-end w-full">
          <WaifuSprite emotion={emotion} isTalking={isTalking} isThinking={isThinking} isRizzed={isRizzed} />
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


    </div>
  );
}

export default App;
