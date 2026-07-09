import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  sender: 'user' | 'waifu';
  text: string;
};

type ChatInterfaceProps = {
  onEmotionChange: (emotion: string) => void;
};



const ChatInterface: React.FC<ChatInterfaceProps> = ({ onEmotionChange }) => {
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

  const determineEmotion = (userText: string): string => {
    const lower = userText.toLowerCase();
    if (lower.includes('happy') || lower.includes('cute')) return 'Delighted';
    if (lower.includes('joke') || lower.includes('funny')) return 'Laugh';
    if (lower.includes('sad') || lower.includes('mean')) return 'Sad';
    if (lower.includes('mad') || lower.includes('angry')) return 'Annoyed';
    if (lower.includes('wow') || lower.includes('surprise')) return 'Shocked';
    if (lower.includes('sleep') || lower.includes('tired')) return 'Sleepy';
    if (lower.includes('heh')) return 'Smug';
    
    // Random fallback if no keyword matches
    const randomEmotions = ['normal', 'Smile', 'Smile 2', 'Smug', 'Delighted'];
    return randomEmotions[Math.floor(Math.random() * randomEmotions.length)];
  };

  const getWaifuResponse = (emotion: string): string => {
    const responses: Record<string, string[]> = {
      Delighted: ['Aww, thank you! You are so sweet~', 'Hehe, that makes me so happy!'],
      Laugh: ['Ahaha! That is so funny!', 'Pfft... you always know how to make me laugh!'],
      Sad: ['Oh no... please do not say that...', 'That makes me a little sad...'],
      Annoyed: ['Hmph! You can be so mean sometimes!', 'I am ignoring you for a whole minute now!'],
      Shocked: ['W-what?! Really?!', 'I had no idea! That is so surprising!'],
      Sleepy: ['*yawn*... I think it is time for a nap...', 'I am getting a bit sleepy...'],
      Smug: ['Heh, I knew that all along!', 'Of course! I am pretty smart, you know~'],
      Smile: ['That is nice to hear.', 'I see! Tell me more!'],
      'Smile 2': ['Hehe, okay!', 'Sounds good to me~'],
      normal: ['Hmm, I see.', 'Oh, really?']
    };
    
    const possibleResponses = responses[emotion] || responses.normal;
    return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
  };

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
      onEmotionChange(nextEmotion);
      
      const waifuResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'waifu',
        text: getWaifuResponse(nextEmotion)
      };
      setMessages(prev => [...prev, waifuResponse]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-pink-50/80 backdrop-blur-md rounded-3xl shadow-xl border border-pink-200 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-300 to-purple-300 p-4 text-white text-center font-bold text-xl tracking-wide shadow-md z-10">
        ✨ Waifu Chat ✨
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}
          >
            <div 
              className={`max-w-[75%] p-3 rounded-2xl text-md ${
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

      <form onSubmit={handleSend} className="p-4 bg-white/50 border-t border-pink-100 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something cute..."
            className="flex-1 bg-white px-4 py-3 rounded-full border-2 border-pink-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all text-gray-700 placeholder-pink-300"
          />
          <button 
            type="submit"
            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 transition-all focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90 translate-x-0.5 translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
