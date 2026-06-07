// GoalData is the shared profile shape used across discovery, generation, and dashboard.
export interface GoalData {
  goal: string;
  duration: string;
  hours: string;
  skillLevel: string;
  experience: string;
  weakAreas: string;
  learningStyle: string;

  // Placement-prep extended profile (optional)
  target?: string;
  dsaLevel?: string;
  leetcode?: string;
  projects?: string[];
  communication?: string;
  hasResume?: string;
  aptitude?: string;
  weakSkills?: string[];

  // Exactly 4 daily focus pillars
  pillars?: string[];

  // Per-pillar level: { "DSA": "Beginner", ... }
  pillarLevels?: Record<string, string>;
  weakestPillar?: string;
  strongestPillar?: string;
  projectStatus?: string; // "No Project" | "Building Project" | "Completed Project"
  notes?: string;
}
