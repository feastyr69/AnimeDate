import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import WaifuSprite from './components/WaifuSprite';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from './components/AnimatedText';
import LoadingScreen from './components/LoadingScreen';

type Message = {
  id: string;
  sender: 'user' | 'waifu';
  text: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Asset preloading config ─────────────────────────────────────────────────
const BASE = '/assets_model1';
const OUTFITS = [
  'Hoodie 1', 'PE uniform', 'Pajama', 'Sswimsuit',
  'Summer Dress', 'Towel', 'Winter outfit', 'seifuku 1', 'seifuku 2',
];
const HAIR_COLORS = ['blonde', 'brown', 'dark', 'pink', 'silver'];
const EMOTIONS_WITH_STATES = ['normal', 'smile', 'sad', 'annoyed', 'bored', 'smug'];
const EMOTIONS_SINGLE = ['Angry', 'Shocked'];

function getAllImagePaths(): string[] {
  const paths: string[] = [];

  // Base body
  paths.push(`${BASE}/Base Body.png`);

  // Hair (front + back for each color)
  for (const color of HAIR_COLORS) {
    paths.push(`${BASE}/${color}-back.png`);
    paths.push(`${BASE}/${color}-front.png`);
  }

  // Outfits
  for (const outfit of OUTFITS) {
    paths.push(`${BASE}/${outfit}.png`);
  }

  // Blush
  paths.push(`${BASE}/blush-high.png`);
  paths.push(`${BASE}/blush-less.png`);

  // Expressions with open/close states
  for (const emo of EMOTIONS_WITH_STATES) {
    paths.push(`${BASE}/${emo}-open.png`);
    paths.push(`${BASE}/${emo}-close.png`);
  }

  // Single-state expressions
  for (const emo of EMOTIONS_SINGLE) {
    paths.push(`${BASE}/${emo}.png`);
  }

  return paths;
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't block on missing images
    img.src = src;
  });
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const [emotion, setEmotion] = useState('normal');
  const [isTalking, setIsTalking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRizzed, setIsRizzed] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  const sessionId = useMemo(() => Math.random().toString(36).substring(7), []);

  // ─── Preload all sprite images on mount ──────────────────────────────────
  const preloadAll = useCallback(async () => {
    const allPaths = getAllImagePaths();
    let loaded = 0;

    const promises = allPaths.map((src) =>
      preloadImage(src).then(() => {
        loaded++;
        setLoadProgress((loaded / allPaths.length) * 100);
      })
    );

    await Promise.all(promises);

    // Small delay so the user sees 100% and the animation finishes
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    preloadAll();
  }, [preloadAll]);

  const handleClearMemory = async () => {
    if (!window.confirm("Are you sure you want to clear her memory?")) return;
    try {
      await fetch(`${API_URL}/api/clear-memory`, { method: 'POST' });
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

    if (userText.toLowerCase() === "/clearmemory") {
      handleClearMemory();
      return;
    }

    try {

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, session_id: sessionId })
      });
      const data = await res.json();

      if (data.error === 'rate_limit_exceeded') {
        window.alert("Rate Limit Exceeded Warning!\n\nThe waifu is tired of talking and needs rest.");
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'waifu',
          text: 'Zzz... I am too tired to talk right now...'
        }]);
        setEmotion('bored');
        setIsTalking(true);
        return;
      }

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
    <>
      {/* Loading screen with fade-out */}
      <AnimatePresence>
        {isLoading && <LoadingScreen progress={loadProgress} />}
      </AnimatePresence>

      {/* Main app – fades in once loading is done */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="flex flex-col md:flex-row h-screen bg-pink-100 bg-gradient-to-br from-pink-50 to-purple-100 overflow-hidden font-sans"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <audio ref={audioRef} src="/rizz.mp3" preload="auto" />

        {/* Clear Memory BUTTON HERE -----------------------------------------------> */}

        {/* <button
          onClick={handleClearMemory}
          className="absolute top-4 right-4 z-50 bg-red-400 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded-full shadow-md transition-all"
        >
          Clear Memory
        </button> */}

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


      </motion.div>
    </>
  );
}

export default App;

