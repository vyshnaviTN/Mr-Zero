import { AnimatePresence, motion } from "framer-motion";

interface SpeechBubbleProps {
  message: string | null;
  side?: "left" | "right";
}

export function SpeechBubble({ message, side = "left" }: SpeechBubbleProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative max-w-xs"
        >
          <div className="glass-card rounded-3xl px-5 py-4 text-sm font-medium text-foreground shadow-lg">
            {message}
          </div>
          <div
            className={`absolute -bottom-2 h-4 w-4 rotate-45 glass-card border-r border-b ${
              side === "left" ? "left-8" : "right-8"
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1.15;
    u.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const friendly = voices.find((v) => /female|samantha|zira|google us/i.test(v.name));
    if (friendly) u.voice = friendly;
    window.speechSynthesis.speak(u);
  } catch {}
}
