import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithMrZero } from "@/lib/chat.functions";
import { speak } from "./SpeechBubble";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function MrZeroChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const chat = useServerFn(chatWithMrZero);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("p0_chat");
    if (raw) {
      try {
        setMsgs(JSON.parse(raw));
      } catch {}
    } else {
      setMsgs([
        {
          role: "assistant",
          content: "Hey, I'm Mr. Zero. Ask me anything — concepts, your plan, motivation. I'm here.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("p0_chat", JSON.stringify(msgs.slice(-30)));
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setBusy(true);
    try {
      const goals = localStorage.getItem("p0_goals");
      const roadmap = localStorage.getItem("p0_roadmap");
      const reply = await chat({
        data: {
          history: next.slice(-10),
          context: {
            goals: goals ? JSON.parse(goals) : null,
            roadmapSummary: roadmap ? (JSON.parse(roadmap).summary ?? null) : null,
          },
        },
      });
      setMsgs((m) => [...m, { role: "assistant", content: reply.message }]);
      speak(reply.message);
    } catch (e) {
      console.error(e);
      setMsgs((m) => [...m, { role: "assistant", content: "I hit a snag. Try once more?" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40"
        aria-label="Chat with Mr. Zero"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-3xl border border-border bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-border/60 bg-primary/10 px-4 py-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">0</div>
              <div>
                <div className="text-sm font-bold">Mr. Zero</div>
                <div className="text-[10px] text-muted-foreground">always here</div>
              </div>
            </div>
            <div ref={scroller} className="flex-1 space-y-2.5 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-secondary/50 px-3.5 py-2 text-sm text-muted-foreground">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                      thinking…
                    </motion.span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-border/60 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Mr. Zero…"
                className="flex-1 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
