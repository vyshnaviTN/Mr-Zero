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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

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

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, ...data.history],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI gateway ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const message: string = json?.choices?.[0]?.message?.content ?? "I'm here.";
    return { message };
  });
