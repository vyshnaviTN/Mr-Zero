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

// Persistent voice selection — picked once, reused forever.
let chosenVoice: SpeechSynthesisVoice | null = null;
let voiceReady = false;

export function setVoiceGender(gender: "male" | "female") {
  localStorage.setItem("p0_voice_gender", gender);
  chosenVoice = null; // force repick
}

export function getVoiceGender(): "male" | "female" {
  if (typeof window === "undefined") return "male";
  return (localStorage.getItem("p0_voice_gender") as "male" | "female") || "male";
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const gender = getVoiceGender();

  let preferred: SpeechSynthesisVoice | undefined;

  if (gender === "female") {
    preferred =
      voices.find((v) => /samantha|zira|jenny|aria|female/i.test(v.name) && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang === "en-US" && /female/i.test(v.name));
  } else {
    preferred =
      voices.find((v) => /david|mark|guy|male/i.test(v.name) && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang === "en-US" && /male/i.test(v.name) && !/female/i.test(v.name));
  }

  // Fallback if specific gender not found
  if (!preferred) {
    preferred = voices.find((v) => v.lang === "en-US") || voices[0];
  }

  return preferred ?? null;
}

function ensureVoice(): SpeechSynthesisVoice | null {
  if (chosenVoice) return chosenVoice;
  chosenVoice = pickVoice();
  if (!chosenVoice && !voiceReady && typeof window !== "undefined" && window.speechSynthesis) {
    voiceReady = true;
    window.speechSynthesis.onvoiceschanged = () => {
      chosenVoice = pickVoice();
    };
  }
  return chosenVoice;
}

export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1.15;
    u.lang = "en-US";
    const v = ensureVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {}
}

export async function speakSequence(lines: string[], gap = 350) {
  for (const line of lines) {
    speak(line);
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!window.speechSynthesis.speaking) resolve();
        else setTimeout(check, 120);
      };
      setTimeout(check, 200);
    });
    await new Promise((r) => setTimeout(r, gap));
  }
}
