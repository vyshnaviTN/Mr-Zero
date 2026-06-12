import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
  context: z
    .object({
      goals: z.any().optional().nullable(),
      roadmapSummary: z.string().max(2000).optional().nullable(),
    })
    .optional(),
});

export const chatWithMrZero = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }): Promise<{ message: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY missing — add it to your .env file.");

    const sys = `You are Mr. Zero — a warm, slightly playful AI accountability companion for a student.
Speak in short, encouraging sentences. Be specific, never generic.
You may explain concepts, suggest schedule changes, motivate, or answer questions.
${
  data.context?.goals
    ? `User context — goal: ${data.context.goals.goal}, duration: ${data.context.goals.duration}, hours/day: ${data.context.goals.hours}, level: ${data.context.goals.skillLevel}.`
    : ""
}
${data.context?.roadmapSummary ? `Roadmap summary: ${data.context.roadmapSummary}` : ""}
Keep responses under 4 sentences unless asked for detail.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: sys }, ...data.history],
        temperature: 0.8,
        max_tokens: 512,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Groq API error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const message: string = json?.choices?.[0]?.message?.content ?? "I'm here.";
    return { message };
  });
