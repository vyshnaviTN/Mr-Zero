import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type MrZeroMood = "idle" | "happy" | "think" | "celebrate" | "sad";

interface MrZeroProps {
  size?: number;
  speaking?: boolean;
  waving?: boolean;
  mood?: MrZeroMood;
  /** Enables cursor tracking + click reactions. */
  interactive?: boolean;
  /** Fires when Mr. Zero is clicked/tapped. Receives the chosen reaction text. */
  onPoke?: (reaction: string) => void;
  /** Fires on hover start with a hover one-liner. */
  onHoverMessage?: (msg: string) => void;
}

const POKE_REACTIONS = [
  "Hey — careful, I'm fragile.",
  "Boop received.",
  "I felt that. Now go finish a task.",
  "Save your energy for the streak.",
  "One more poke and I file a complaint.",
  "I'm here. What's the move?",
  "Less poking. More building.",
];

const HOVER_REACTIONS = [
  "Keep building.",
  "One task at a time.",
  "Protect your streak.",
  "Consistency beats intensity.",
  "Today's effort becomes tomorrow's confidence.",
];

export function MrZero({
  size = 280,
  speaking = false,
  waving = false,
  mood = "idle",
  interactive = false,
  onPoke,
  onHoverMessage,
}: MrZeroProps) {
  const [blink, setBlink] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [burst, setBurst] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Smooth pupil tracking via motion values
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 22 });
  const sy = useSpring(py, { stiffness: 220, damping: 22 });
  const pupilXL = useTransform(sx, (v) => 80 + v);
  const pupilYL = useTransform(sy, (v) => 95 + v);
  const pupilXR = useTransform(sx, (v) => 120 + v);
  const pupilYR = useTransform(sy, (v) => 95 + v);

  // Blink loop
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);

  // Cursor tracking
  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Clamp eye travel to ~4px in SVG units
      const max = 4;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (dx / len) * Math.min(max, Math.abs(dx) / 60);
      const ny = (dy / len) * Math.min(max, Math.abs(dy) / 60);
      px.set(nx);
      py.set(ny);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, px, py]);

  // Celebration sparkle burst
  useEffect(() => {
    if (mood === "celebrate") {
      setBurst((b) => b + 1);
    }
  }, [mood]);

  const handlePoke = () => {
    setBounce(true);
    setBurst((b) => b + 1);
    setTimeout(() => setBounce(false), 600);
    const r = POKE_REACTIONS[Math.floor(Math.random() * POKE_REACTIONS.length)];
    onPoke?.(r);
  };

  const handleHover = () => {
    if (!interactive || !onHoverMessage) return;
    const r = HOVER_REACTIONS[Math.floor(Math.random() * HOVER_REACTIONS.length)];
    onHoverMessage(r);
  };

  // Mouth shape changes with mood
  const isHappy = mood === "happy" || mood === "celebrate";
  const isSad = mood === "sad";
  const isThink = mood === "think";

  // Eye color shifts subtly by mood
  const eyeColor =
    mood === "celebrate"
      ? "#FFE066"
      : mood === "sad"
      ? "#9FB7D9"
      : mood === "think"
      ? "#FFC1D6"
      : "#FFB8D4";

  return (
    <motion.div
      ref={wrapRef}
      style={{ width: size, height: size }}
      className={`relative select-none ${interactive ? "cursor-pointer" : ""}`}
      animate={{
        y: bounce ? [0, -28, 0, -8, 0] : [0, -14, 0],
        rotate: bounce ? [0, -6, 6, -3, 0] : 0,
      }}
      transition={{
        duration: bounce ? 0.6 : 4,
        repeat: bounce ? 0 : Infinity,
        ease: "easeInOut",
      }}
      onClick={interactive ? handlePoke : undefined}
      onHoverStart={handleHover}
      whileHover={interactive ? { scale: 1.04 } : undefined}
      whileTap={interactive ? { scale: 0.94 } : undefined}
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          opacity: speaking ? [0.55, 0.95, 0.55] : isHappy ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
          scale: speaking ? [1, 1.1, 1] : [0.95, 1.02, 0.95],
        }}
        transition={{ duration: speaking ? 0.7 : 3, repeat: Infinity }}
        style={{
          background:
            "radial-gradient(circle, #FF4D94 0%, rgba(255,77,148,0.3) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Floating shadow */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-pink-400/30 blur-md"
        style={{ bottom: -10, width: size * 0.55, height: 14 }}
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.4, 0.25, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sparkle burst (celebrate / poke) */}
      <AnimatePresence>
        {burst > 0 && (
          <SparkleBurst key={burst} size={size} />
        )}
      </AnimatePresence>

      {/* Thinking bubble dots */}
      {isThink && (
        <motion.div
          className="absolute -right-2 -top-2 z-20 flex gap-1 rounded-full bg-white/90 px-2.5 py-1.5 shadow-md"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      )}

      <motion.svg
        viewBox="0 0 200 220"
        width={size}
        height={size}
        className="relative z-10 drop-shadow-[0_10px_30px_rgba(255,77,148,0.4)]"
        animate={{ scale: speaking ? [1, 1.03, 1] : 1 }}
        transition={{ duration: 0.6, repeat: speaking ? Infinity : 0 }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD1E0" />
            <stop offset="50%" stopColor="#FF9EC2" />
            <stop offset="100%" stopColor="#FF4D94" />
          </linearGradient>
          <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE3EE" />
            <stop offset="100%" stopColor="#FF85B5" />
          </linearGradient>
          <radialGradient id="cheek" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FF4D94" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF4D94" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Antenna */}
        <line x1="100" y1="30" x2="100" y2="48" stroke="#FF4D94" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="100"
          cy="26"
          r="6"
          fill={mood === "celebrate" ? "#FFE066" : "#FF4D94"}
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.25, 1] }}
          transition={{ duration: mood === "celebrate" ? 0.7 : 1.6, repeat: Infinity }}
        />

        {/* Head */}
        <rect x="40" y="48" width="120" height="100" rx="38" fill="url(#headGrad)" stroke="#FF4D94" strokeWidth="2" />

        {/* Screen / face panel */}
        <rect x="55" y="65" width="90" height="68" rx="26" fill="#2A1424" />

        {/* Eyes — sclera */}
        <motion.g animate={{ scaleY: blink ? 0.1 : 1 }} style={{ transformOrigin: "100px 95px" }}>
          <circle cx="80" cy="95" r="9" fill={eyeColor} />
          <circle cx="120" cy="95" r="9" fill={eyeColor} />
          {/* Pupils that track */}
          <motion.circle r="3.4" fill="#fff" cx={pupilXL as unknown as number} cy={pupilYL as unknown as number} />
          <motion.circle r="3.4" fill="#fff" cx={pupilXR as unknown as number} cy={pupilYR as unknown as number} />
        </motion.g>

        {/* Mouth — mood-aware */}
        {isHappy ? (
          <motion.path
            d="M85 115 Q100 130 115 115"
            stroke="#FF4D94"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={{ d: speaking ? ["M85 115 Q100 130 115 115", "M85 117 Q100 124 115 117", "M85 115 Q100 130 115 115"] : "M85 115 Q100 130 115 115" }}
            transition={{ duration: 0.4, repeat: speaking ? Infinity : 0 }}
          />
        ) : isSad ? (
          <path d="M85 122 Q100 110 115 122" stroke="#FF4D94" strokeWidth="4" strokeLinecap="round" fill="none" />
        ) : (
          <motion.rect
            x="90"
            y="115"
            width="20"
            height={speaking ? 8 : 3}
            rx="2"
            fill="#FF4D94"
            animate={{ height: speaking ? [3, 9, 4, 8, 3] : 3 }}
            transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
          />
        )}

        {/* Cheeks */}
        <circle cx="58" cy="115" r="9" fill="url(#cheek)" />
        <circle cx="142" cy="115" r="9" fill="url(#cheek)" />

        {/* Body */}
        <rect x="55" y="148" width="90" height="55" rx="28" fill="url(#bodyGrad)" stroke="#FF4D94" strokeWidth="2" />
        <circle cx="100" cy="175" r="6" fill="#fff" opacity="0.7" />

        {/* Arms */}
        <motion.g
          style={{ transformOrigin: "45px 160px" }}
          animate={
            waving || mood === "celebrate"
              ? { rotate: [0, -40, 10, -40, 0] }
              : { rotate: [0, 8, 0] }
          }
          transition={{ duration: waving || mood === "celebrate" ? 1 : 3, repeat: Infinity }}
        >
          <rect x="28" y="155" width="22" height="14" rx="7" fill="url(#bodyGrad)" stroke="#FF4D94" strokeWidth="2" />
          <circle cx="28" cy="162" r="10" fill="#FFD1E0" stroke="#FF4D94" strokeWidth="2" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "155px 160px" }}
          animate={
            mood === "celebrate"
              ? { rotate: [0, 40, -10, 40, 0] }
              : { rotate: [0, -8, 0] }
          }
          transition={{ duration: mood === "celebrate" ? 1 : 3, repeat: Infinity }}
        >
          <rect x="150" y="155" width="22" height="14" rx="7" fill="url(#bodyGrad)" stroke="#FF4D94" strokeWidth="2" />
          <circle cx="172" cy="162" r="10" fill="#FFD1E0" stroke="#FF4D94" strokeWidth="2" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}

function SparkleBurst({ size }: { size: number }) {
  const N = 10;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {Array.from({ length: N }).map((_, i) => {
        const angle = (i / N) * Math.PI * 2;
        const dist = size * 0.45;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#FF4D94]"
            initial={{ x: -4, y: -4, scale: 0.6, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist - 4,
              y: Math.sin(angle) * dist - 4,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </motion.div>
  );
}
