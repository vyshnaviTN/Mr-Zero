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

  // Placement-prep extended profile (optional — only present when branch was taken)
  target: z.string().max(200).optional(),
  dsaLevel: z.string().max(100).optional(),
  leetcode: z.string().max(100).optional(),
  projects: z.array(z.string().max(200)).max(20).optional(),
  communication: z.string().max(100).optional(),
  hasResume: z.string().max(20).optional(),
  aptitude: z.string().max(100).optional(),
  weakSkills: z.array(z.string().max(200)).max(20).optional(),

  // Exactly 4 daily focus pillars
  pillars: z.array(z.string().max(100)).max(8).optional(),
  pillarLevels: z.record(z.string(), z.string().max(50)).optional(),
  weakestPillar: z.string().max(200).optional(),
  strongestPillar: z.string().max(200).optional(),
  projectStatus: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),

  adaptation: z
    .object({
      note: z.string().max(500),
      completed: z.array(z.string()).max(500).optional().default([]),
      missedDays: z.number().int().min(0).max(365).optional().default(0),
    })
    .optional(),
});

export type RoadmapProfile = z.infer<typeof profileSchema>;

export interface Mission {
  title: string;
  type: "learn" | "practice" | "project" | "revision" | "assessment";
  hours: number;
  details: string; // Highly detailed instructions (resources, specific problems, etc)
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
  percent: number; // % of total time
  reason: string;  // why this allocation
}
export interface Roadmap {
  summary: string;
  totalHours: number;
  topics: TopicEffort[];
  weeks: WeekPlan[];
  encouragement: string;
}

const SYSTEM = `You are Mr. Zero, a planning engine that builds *dynamic*, weakness-weighted, personalized learning roadmaps.

HARD RULES:
- Never use a predefined template. Decompose the user's specific goal into the sub-skills it actually requires.
- Identify prerequisites and order topics by dependency.
- Classify each topic difficulty (Easy | Medium | Hard).
- TIME ALLOCATION IS NOT EQUAL. It is weighted by WEAKNESS. Strong areas get less time, weak areas get more time.
  Example for placement prep: if DSA is weak, Communication is average, Projects are strong, Resume not created, Interview is weak:
    DSA 45% / Interview 20% / Communication 15% / Resume 10% / Projects 10%.
  Generate the distribution dynamically from the user's actual profile — do not copy that example.
- Total allocated hours must roughly equal duration_days * daily_hours. Each topic must include both "hours" and "percent".
- For each topic include a short "reason" explaining WHY it got that share (e.g. "DSA marked weak + 0-25 LeetCode solved").
- Build weekly themes and concrete DAILY missions. Each mission must be small, measurable, action-verb-led. 
- HIGHLY DETAILED MISSIONS: Telling the user to "Solve coding problems" is unacceptable. You MUST provide a "details" field for each mission that tells them exactly what to do. Example: "Solve Two Sum and Best Time to Buy and Sell Stock on LeetCode. Focus on O(n) time complexity using HashMaps."
- Mix mission types: learn, practice, project, revision, assessment.
- If the user picked focus pillars (max 3), make those the spine of every day — each day's missions should advance those pillars.
- Respect skill level, experience, projects already in progress, weak areas, and learning style.
- If an "adaptation" note is present (finished early / missed days / topic is hard / priority changed), REBALANCE the remaining plan accordingly without forcing a full restart.
- Prioritize consistency over intensity. Realistic > perfect.

Respond with ONLY a JSON object, no prose, no markdown fences, matching:
{
  "summary": string,
  "totalHours": number,
  "topics": [{ "name": string, "difficulty": "Easy"|"Medium"|"Hard", "hours": number, "percent": number, "reason": string }],
  "weeks": [{
    "week": number,
    "theme": string,
    "goals": [string],
    "days": [{ "day": number, "focus": string, "missions": [{ "title": string, "type": "learn"|"practice"|"project"|"revision"|"assessment", "hours": number, "details": string }] }]
  }],
  "encouragement": string
}`;

export const generateRoadmap = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data }): Promise<Roadmap> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY missing — add it to your .env file.");

    const placementBlock = data.target
      ? `\nPlacement profile:\n- Target: ${data.target}\n- DSA level: ${data.dsaLevel ?? "unknown"}\n- LeetCode solved: ${data.leetcode ?? "unknown"}\n- Active projects: ${(data.projects ?? []).join(", ") || "none"}\n- Communication: ${data.communication ?? "unknown"}\n- Has resume: ${data.hasResume ?? "unknown"}\n- Aptitude comfort: ${data.aptitude ?? "unknown"}\n- Self-reported weak skills: ${(data.weakSkills ?? []).join(", ") || "none"}`
      : "";

    const pillarBlock = data.pillars && data.pillars.length
      ? `\nDaily focus pillars (must drive every day's missions): ${data.pillars.join(" · ")}`
      : "";

    const levelsBlock = data.pillarLevels && Object.keys(data.pillarLevels).length
      ? `\nPer-pillar current level:\n${Object.entries(data.pillarLevels)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n")}`
      : "";

    const focusBlock = `${data.weakestPillar ? `\nWeakest pillar (allocate more time): ${data.weakestPillar}` : ""}${data.strongestPillar ? `\nStrongest pillar (allocate less time): ${data.strongestPillar}` : ""}${data.projectStatus ? `\nProject status: ${data.projectStatus}` : ""}${data.communication ? `\nCommunication level: ${data.communication}` : ""}${data.notes ? `\nExtra notes: ${data.notes}` : ""}`;

    const userPrompt = `Build a dynamic, weakness-weighted roadmap for this learner.

Goal: ${data.goal}
Duration: ${data.duration}
Daily hours available: ${data.hours}
Current skill level: ${data.skillLevel}
Existing experience: ${data.experience || "(none provided)"}
Weak areas: ${data.weakAreas || "(none provided)"}
Preferred learning style: ${data.learningStyle}${placementBlock}${pillarBlock}${levelsBlock}${focusBlock}
${
  data.adaptation
    ? `\nADAPTATION REQUEST: ${data.adaptation.note}\nCompleted so far: ${data.adaptation.completed?.join(", ") || "none"}\nMissed days: ${data.adaptation.missedDays ?? 0}\nRebalance the REMAINING plan — never force a restart.`
    : ""
}

Steps you must perform internally:
1. Decompose the goal into required sub-skills. Even if the goal is completely custom or unusual, construct a logical learning path.
2. Order them by prerequisites.
3. WEIGHT time by weakness (strong areas get less, weak areas get more). Output explicit "percent" and "reason" per topic.
4. Estimate total hours based on duration and daily hours.
5. Make daily missions revolve around the user's chosen pillars when provided.
Keep the plan realistic and achievable. YOU MUST RETURN VALID JSON.`;

    let lastError: Error | unknown;
    
    // Retry up to 3 times for resilience against AI hallucination
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: Math.min(0.7 + (attempt * 0.1), 1.0), // slightly increase creativity on retries
            max_tokens: 8192,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Groq API error ${res.status}: ${text.slice(0, 300)}`);
        }
        const json = await res.json();
        const content: string = json?.choices?.[0]?.message?.content ?? "";
        let parsed: Roadmap;
        try {
          parsed = JSON.parse(content);
        } catch {
          // Fallback: try to extract JSON from any surrounding text
          const match = content.match(/\{[\s\S]*\}/);
          if (!match) throw new Error("AI returned a non-JSON response.");
          parsed = JSON.parse(match[0]);
        }
        
        // Basic sanity check to ensure it matches Roadmap interface roughly
        if (!parsed.weeks || !Array.isArray(parsed.weeks) || !parsed.topics || !Array.isArray(parsed.topics)) {
          throw new Error("Missing required Roadmap fields in JSON");
        }
        
        return parsed;
      } catch (err) {
        lastError = err;
        console.warn(`[Project Zero] AI Generation attempt ${attempt} failed:`, err);
      }
    }
    
    throw lastError;
  });
