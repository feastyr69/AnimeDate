import { useState, useEffect, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Emotion =
  | 'normal'
  | 'Smile'
  | 'Delighted'
  | 'Laugh'
  | 'Sad'
  | 'Angry'
  | 'Annoyed'
  | 'Shocked'
  | 'Sleepy'
  | 'Smug';

type WaifuSpriteProps = {
  emotion?: Emotion | string;
  isTalking?: boolean;
};

// ─── Asset Config ────────────────────────────────────────────────────────────
const BASE = '/assets_model1';

// All PNGs share the same native width of 1011px, with top-left origin.
// By setting a fixed display width and `height: auto`, they will perfectly
// align without needing hardcoded heights for each outfit.
const NATIVE_W = 1011;
const NATIVE_H = 1186; // Tallest layer (Base Body) for container bounding

const DISPLAY_WIDTH = 500;
const SCALE = DISPLAY_WIDTH / NATIVE_W;
// Crop more from the bottom (e.g., 60px at display scale)
const DISPLAY_HEIGHT = Math.round(NATIVE_H * SCALE) - 20;

const OUTFITS = [
  'Hoodie 1', 'PE uniform', 'Pajama', 'Sswimsuit',
  'Summer Dress', 'Towel', 'Winter outfit', 'seifuku 1', 'seifuku 2',
];

const HAIR_COLORS = ['blonde', 'brown', 'dark', 'pink', 'silver'];

// Shared style for all layers to guarantee alignment
const layerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: `${DISPLAY_WIDTH}px`,
  height: 'auto',
  maxWidth: 'none',
  display: 'block',
  pointerEvents: 'none',
};

// ─── Component ───────────────────────────────────────────────────────────────
const WaifuSprite: React.FC<WaifuSpriteProps> = ({
  emotion = 'normal',
  isTalking = false,
}) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  // Pick random outfit + hair once on mount
  const outfit = useMemo(() => OUTFITS[Math.floor(Math.random() * OUTFITS.length)], []);
  const hairColor = useMemo(() => HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)], []);

  // Talking animation loop
  useEffect(() => {
    if (!isTalking) {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => setMouthOpen((prev) => !prev), 150);
    return () => clearInterval(id);
  }, [isTalking]);

  // ── Emotion Mapping & Expression ──────────────────────────────────────────
  // Map missing or specific emotions to the actual assets
  const EMOTION_MAP: Record<string, string> = {
    'Delighted': 'Smile',
    'Laugh': 'Smile',
    'Smile 2': 'Smile',
    'normal': 'talk' // 'talk' maps to talk-mouth-open/close
  };
  const mappedEmotion = EMOTION_MAP[emotion as string] || emotion;

  // If the emotion is animated ('Smile' or 'talk'), use the open/close set.
  // Otherwise, use the static expression image.
  let expressionSrc = `${BASE}/${mappedEmotion}.png`;
  if (mappedEmotion === 'Smile' || mappedEmotion === 'talk') {
    const state = (isTalking && mouthOpen) ? 'open' : 'close';
    expressionSrc = `${BASE}/${mappedEmotion}-mouth-${state}.png`;
  }

  // ── Base Images ───────────────────────────────────────────────────────────
  const bodySrc = `${BASE}/Base Body.png`;
  const hairBackSrc = `${BASE}/${hairColor}-back.png`;
  const hairFrontSrc = `${BASE}/${hairColor}-front.png`;
  const outfitSrc = `${BASE}/${outfit}.png`;
  const blushSrc = `${BASE}/blush-less.png`;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Sprite canvas — sized to tallest layer, crops overflow */}
      <div
        style={{
          position: 'relative',
          width: `${DISPLAY_WIDTH}px`,
          height: `${DISPLAY_HEIGHT}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <img src={hairBackSrc} alt="hair back" draggable={false} style={{ ...layerStyle, zIndex: 0 }} />
        <img src={bodySrc} alt="body" draggable={false} style={{ ...layerStyle, zIndex: 5 }} />
        <img src={outfitSrc} alt="outfit" draggable={false} style={{ ...layerStyle, zIndex: 10 }} />
        <img src={hairFrontSrc} alt="hair front" draggable={false} style={{ ...layerStyle, zIndex: 20 }} />
        <img src={blushSrc} alt="blush" draggable={false} style={{ ...layerStyle, zIndex: 25 }} />
        <img src={expressionSrc} alt="expression" draggable={false} style={{ ...layerStyle, zIndex: 30 }} />
      </div>

      {/* Emotion label pill */}
      <div className="mt-4 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-pink-200 shadow-sm">
        <span className="text-sm font-medium text-pink-600 capitalize tracking-wide">
          {emotion}
        </span>
        {isTalking && (
          <span className="ml-2 inline-block text-xs text-purple-500 animate-pulse">
            💬 talking…
          </span>
        )}
      </div>
    </div>
  );
};

export default WaifuSprite;
