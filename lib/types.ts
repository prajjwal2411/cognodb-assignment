// Client-safe copies of the API response shapes (kept separate from
// lib/queries.ts, which imports the Neo4j driver and must stay server-only).

export interface PersonSummary {
  name: string;
  currentTitle: string;
}

export interface JobSummary {
  title: string;
  level: string;
}

export interface SkillSummary {
  name: string;
  category: string;
}

export interface CareerPathResponse {
  found: boolean;
  path: { title: string; level: string }[];
  hops: number;
}

export interface SkillGapResponse {
  missingSkills: { name: string; importance: number }[];
  suggestedNextSkills: { from: string; to: string; strength: number }[];
}

export interface SimilarPerson {
  name: string;
  currentTitle: string;
  sharedSkillCount: number;
  sharedSkills: string[];
}

export interface CompanyRecommendation {
  company: string;
  industry: string;
  connectedVia: string[];
}
