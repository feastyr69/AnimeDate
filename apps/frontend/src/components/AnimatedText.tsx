import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  onComplete?: () => void;
}

export default function AnimatedText({ text, onComplete }: AnimatedTextProps) {
  // Split the text into sentences to act as "lines"
  const lines = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset when text changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [text]);

  const line = lines[currentIndex];

  const lineVariant = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.03, // delay between characters fading in
      },
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      transition: { duration: 0.3 } 
    },
  };

  const charVariant = {
    hidden: { opacity: 0, x: -5 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.1 },
    },
  };

  if (!line) return null;

  return (
    <div className="text-pink-600 font-bold text-xl md:text-2xl text-center leading-snug drop-shadow-[0_0_15px_rgba(255,255,255,1)] max-w-lg mx-auto h-16 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={lineVariant}
          initial="hidden"
          animate="show"
          exit="exit"
          onAnimationComplete={() => {
            if (currentIndex < lines.length - 1) {
              setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
              }, 1200); // Wait 1.2s after line finishes before fading out
            } else {
              if (onComplete) {
                onComplete();
              }
            }
          }}
        >
          {line.split(/(\s+)/).map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block">
              {word.split("").map((char, charIndex) => (
                <motion.span
                  key={`${wordIndex}-${charIndex}`}
                  variants={charVariant}
                  className="inline-block"
                  style={{ whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
