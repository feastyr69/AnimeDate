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

// ─── Asset base path ─────────────────────────────────────────────────────────
const BASE = '/assets_model1';

// ─── Native canvas size ──────────────────────────────────────────────────────
// Most layers are 1011×1145, but Base Body is 1011×1186 (tallest).
// We use the tallest dimension so nothing gets squished.
const NATIVE_W = 1011;
const NATIVE_H = 1186; // matches Base Body — tallest layer

// Display size — proportionally scaled
const DISPLAY_WIDTH = 400;
const SCALE = DISPLAY_WIDTH / NATIVE_W;
const DISPLAY_HEIGHT = Math.round(NATIVE_H * SCALE);

// ─── Layer catalogues ────────────────────────────────────────────────────────
const OUTFITS = [
  'Hoodie 1',
  'PE uniform',
  'Pajama',
  'Sswimsuit',
  'Summer Dress',
  'Towel',
  'Winter outfit',
  'seifuku 1',
  'seifuku 2',
];

// Hair now has front + back pairs
const HAIR_COLORS = ['blonde', 'brown', 'dark', 'pink', 'silver'];

// ─── Helper: build a layer style for a specific native height ────────────────
// Each PNG has width=1011 but heights vary slightly (1145, 1147, 1148, 1161, 1186).
// We scale each to its own native height so it isn't stretched, and pin to top-left.
function makeLayerStyle(nativeH: number): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${DISPLAY_WIDTH}px`,
    height: `${Math.round(nativeH * SCALE)}px`,
    maxWidth: 'none',
    display: 'block',
    pointerEvents: 'none',
  };
}

// Pre-compute the common layer styles
const STYLE_1145 = makeLayerStyle(1145);
const STYLE_1147 = makeLayerStyle(1147);
const STYLE_1148 = makeLayerStyle(1148);
const STYLE_1161 = makeLayerStyle(1161);
const STYLE_1186 = makeLayerStyle(1186);

// Map outfit names to their native heights (most are 1145)
const OUTFIT_HEIGHTS: Record<string, React.CSSProperties> = {
  'Hoodie 1': STYLE_1145,
  'PE uniform': STYLE_1145,
  'Pajama': STYLE_1145,
  'Sswimsuit': STYLE_1147,
  'Summer Dress': STYLE_1147,
  'Towel': STYLE_1147,
  'Winter outfit': STYLE_1161,
  'seifuku 1': STYLE_1145,
  'seifuku 2': STYLE_1145,
};

// ─── Component ───────────────────────────────────────────────────────────────
const WaifuSprite: React.FC<WaifuSpriteProps> = ({
  emotion = 'normal',
  isTalking = false,
}) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  // Pick random outfit + hair once on mount
  const outfit = useMemo(
    () => OUTFITS[Math.floor(Math.random() * OUTFITS.length)],
    [],
  );
  const hairColor = useMemo(
    () => HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    [],
  );

  // ── Talking animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isTalking) {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => setMouthOpen((prev) => !prev), 150);
    return () => clearInterval(id);
  }, [isTalking]);

  // ── Image sources ───────────────────────────────────────────────────────
  const bodySrc = `${BASE}/Base Body.png`;
  const hairBackSrc = `${BASE}/${hairColor}-back.png`;
  const hairFrontSrc = `${BASE}/${hairColor}-front.png`;
  const outfitSrc = `${BASE}/${outfit}.png`;
  const eyesSrc = `${BASE}/${emotion}.png`;
  const mouthSrc = `${BASE}/talk-mouth-${mouthOpen ? 'open' : 'close'}.png`;
  const blushSrc = `${BASE}/blush-less.png`;

  // Resolve the correct style for the current outfit
  const outfitStyle = OUTFIT_HEIGHTS[outfit] ?? STYLE_1145;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Sprite canvas — fixed size, overflow hidden to crop any taller layers */}
      <div
        style={{
          position: 'relative',
          width: `${DISPLAY_WIDTH}px`,
          height: `${DISPLAY_HEIGHT}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        {/*
          Layer stacking order (bottom → top):
          z-0   Hair back
          z-5   Body
          z-10  Outfit
          z-20  Hair front
          z-25  Blush
          z-30  Eyes / Expression
          z-40  Mouth
        */}

        {/* z-0  · Hair back (behind the body) */}
        <img src={hairBackSrc} alt="hair back" draggable={false}
          style={{ ...STYLE_1148, zIndex: 0 }} />

        {/* z-5  · Body */}
        <img src={bodySrc} alt="body" draggable={false}
          style={{ ...STYLE_1186, zIndex: 5 }} />

        {/* z-10 · Outfit */}
        <img src={outfitSrc} alt="outfit" draggable={false}
          style={{ ...outfitStyle, zIndex: 10 }} />

        {/* z-20 · Hair front */}
        <img src={hairFrontSrc} alt="hair front" draggable={false}
          style={{ ...STYLE_1145, zIndex: 20 }} />

        {/* z-25 · Blush */}
        <img src={blushSrc} alt="blush" draggable={false}
          style={{ ...STYLE_1145, zIndex: 25 }} />

        {/* z-30 · Eyes / Expression */}
        <img src={eyesSrc} alt={`${emotion} eyes`} draggable={false}
          style={{ ...STYLE_1145, zIndex: 30 }} />

        {/* z-40 · Mouth (talking animation) */}
        {isTalking && (
          <img src={mouthSrc}
            alt={`mouth ${mouthOpen ? 'open' : 'closed'}`}
            draggable={false}
            style={{ ...STYLE_1145, zIndex: 40 }} />
        )}
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
