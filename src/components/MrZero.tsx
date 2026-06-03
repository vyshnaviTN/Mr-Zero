import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MrZeroProps {
  size?: number;
  speaking?: boolean;
  waving?: boolean;
}

export function MrZero({ size = 280, speaking = false, waving = false }: MrZeroProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3200 + Math.random() * 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative select-none"
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          opacity: speaking ? [0.5, 0.9, 0.5] : [0.3, 0.5, 0.3],
          scale: speaking ? [1, 1.08, 1] : [0.95, 1, 0.95],
        }}
        transition={{ duration: speaking ? 0.8 : 3, repeat: Infinity }}
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
          fill="#FF4D94"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />

        {/* Head */}
        <rect x="40" y="48" width="120" height="100" rx="38" fill="url(#headGrad)" stroke="#FF4D94" strokeWidth="2" />

        {/* Screen / face panel */}
        <rect x="55" y="65" width="90" height="68" rx="26" fill="#2A1424" />

        {/* Eyes */}
        <motion.g animate={{ scaleY: blink ? 0.1 : 1 }} style={{ transformOrigin: "100px 95px" }}>
          <circle cx="80" cy="95" r="8" fill="#FFB8D4" />
          <circle cx="120" cy="95" r="8" fill="#FFB8D4" />
          <circle cx="82" cy="93" r="2.5" fill="#fff" />
          <circle cx="122" cy="93" r="2.5" fill="#fff" />
        </motion.g>

        {/* Mouth */}
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

        {/* Cheeks */}
        <circle cx="58" cy="115" r="9" fill="url(#cheek)" />
        <circle cx="142" cy="115" r="9" fill="url(#cheek)" />

        {/* Body */}
        <rect x="55" y="148" width="90" height="55" rx="28" fill="url(#bodyGrad)" stroke="#FF4D94" strokeWidth="2" />
        <circle cx="100" cy="175" r="6" fill="#fff" opacity="0.7" />

        {/* Arms */}
        <motion.g
          style={{ transformOrigin: "45px 160px" }}
          animate={waving ? { rotate: [0, -35, 10, -35, 0] } : { rotate: [0, 8, 0] }}
          transition={{ duration: waving ? 1.2 : 3, repeat: Infinity }}
        >
          <rect x="28" y="155" width="22" height="14" rx="7" fill="url(#bodyGrad)" stroke="#FF4D94" strokeWidth="2" />
          <circle cx="28" cy="162" r="10" fill="#FFD1E0" stroke="#FF4D94" strokeWidth="2" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "155px 160px" }}
          animate={{ rotate: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <rect x="150" y="155" width="22" height="14" rx="7" fill="url(#bodyGrad)" stroke="#FF4D94" strokeWidth="2" />
          <circle cx="172" cy="162" r="10" fill="#FFD1E0" stroke="#FF4D94" strokeWidth="2" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
