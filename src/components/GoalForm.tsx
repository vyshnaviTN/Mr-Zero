// GoalData is the shared profile shape used across discovery, generation, and dashboard.
export interface GoalData {
  goal: string;
  duration: string;
  hours: string;
  skillLevel: string;
  experience: string;
  weakAreas: string;
  learningStyle: string;

  // Placement-prep extended profile
  target?: string;
  dsaLevel?: string;
  leetcode?: string;
  projects?: string[];
  communication?: string;
  hasResume?: string;
  aptitude?: string;
  weakSkills?: string[];

  // Chosen daily focus pillars (max 3)
  pillars?: string[];
}
