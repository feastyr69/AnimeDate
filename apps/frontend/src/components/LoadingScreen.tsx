import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress: number; // 0 to 100
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
          animate={{ scale: [1, 1.15, 1], x: [0, -25, 0], y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 w-56 h-56 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated heart */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="text-6xl select-none drop-shadow-lg"
          >
            💖
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 font-sans text-center select-none"
        >
          My Imaginary GF &lt;3
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-pink-400 text-sm font-medium tracking-wide select-none"
        >
          Loading her up for you~
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="w-64 md:w-80"
        >
          <div className="h-2 bg-pink-200/60 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-full shadow-sm"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="text-xs text-pink-400 mt-2 text-center font-medium"
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        {/* Bouncing dots */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-pink-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
