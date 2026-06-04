import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const profileSchema = z.object({
  goal: z.string().min(2).max(500),
  duration: z.string().min(1).max(100),
  hours: z.string().min(1).max(100),
  skillLevel: z.string().max(100).optional().default("Beginner"),
  experience: z.string().max(1000).optional().default(""),
  weakAreas: z.string().max(1000).optional().default(""),
  learningStyle: z.string().max(200).optional().default("Mixed"),
  adaptation: z
    .object({
      note: z.string().max(500),
      completed: z.array(z.string()).max(200).optional().default([]),
      missedDays: z.number().int().min(0).max(365).optional().default(0),
    })
    .optional(),
});

export type RoadmapProfile = z.infer<typeof profileSchema>;

export interface Mission {
  title: string;
  type: "learn" | "practice" | "project" | "revision" | "assessment";
  hours: number;
}
export interface DayPlan {
  day: number;
  focus: string;
  missions: Mission[];
}
export interface WeekPlan {
  week: number;
  theme: string;
  goals: string[];
  days: DayPlan[];
}
export interface TopicEffort {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  hours: number;
}
export interface Roadmap {
  summary: string;
  totalHours: number;
  topics: TopicEffort[];
  weeks: WeekPlan[];
  encouragement: string;
}

const SYSTEM = `You are Mr. Zero, a planning engine that builds *dynamic*, personalized learning roadmaps.

HARD RULES:
- Never use a predefined or generic template. Decompose the user's specific goal into the sub-skills it actually requires.
- Identify prerequisites and order topics by dependency.
- Classify each topic difficulty (Easy | Medium | Hard) and allocate hours proportionally — harder topics get more time.
- Total allocated hours must roughly equal duration_days * daily_hours. Do not overload.
- Build weekly themes and concrete DAILY missions. Each mission must be small, measurable, action-verb-led (e.g. "Watch ES6 arrow functions lesson", "Solve 5 array problems", "Build a tip calculator"). Never vague ("Study X").
- Mix mission types: learn, practice, project, revision, assessment.
- Respect the user's skill level, experience, weak areas, and learning style.
- If an "adaptation" note is present (finished early / missed days / topic is hard), REBALANCE the plan accordingly.
- Prioritize consistency over intensity. Realistic > perfect.

Respond with ONLY a JSON object, no prose, no markdown fences, matching:
{
  "summary": string,
  "totalHours": number,
  "topics": [{ "name": string, "difficulty": "Easy"|"Medium"|"Hard", "hours": number }],
  "weeks": [{
    "week": number,
    "theme": string,
    "goals": [string],
    "days": [{ "day": number, "focus": string, "missions": [{ "title": string, "type": "learn"|"practice"|"project"|"revision"|"assessment", "hours": number }] }]
  }],
  "encouragement": string
}`;

export const generateRoadmap = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data }): Promise<Roadmap> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const userPrompt = `Build a dynamic roadmap for this learner.

Goal: ${data.goal}
Duration: ${data.duration}
Daily hours available: ${data.hours}
Current skill level: ${data.skillLevel}
Existing experience: ${data.experience || "(none provided)"}
Weak areas: ${data.weakAreas || "(none provided)"}
Preferred learning style: ${data.learningStyle}
${
  data.adaptation
    ? `\nADAPTATION REQUEST: ${data.adaptation.note}\nCompleted so far: ${data.adaptation.completed?.join(", ") || "none"}\nMissed days: ${data.adaptation.missedDays ?? 0}\nRebalance the remaining plan.`
    : ""
}

Steps you must perform internally:
1. Decompose the goal into required sub-skills (dynamic, not a template).
2. Order them by prerequisites.
3. Score difficulty and distribute total hours = duration * daily hours.
4. Produce weekly themes + concrete daily missions.
Keep the plan realistic and achievable.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    let parsed: Roadmap;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned non-JSON response");
      parsed = JSON.parse(match[0]);
    }
    return parsed;
  });
