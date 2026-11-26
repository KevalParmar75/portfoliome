import rawSnapshot from "./portfolioSnapshot.json";
import type { About, Experience, Project, Skill, Social } from "../types";

export interface PortfolioSnapshot {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  about: About;
  socials: Social[];
}

export const portfolioSnapshot: PortfolioSnapshot = rawSnapshot as PortfolioSnapshot;

export function getSnapshotProjectBySlug(slug?: string): Project | null {
  if (!slug) return null;
  return portfolioSnapshot.projects.find((p) => p.slug === slug) ?? null;
}

export function getSnapshotRecommendedProject(slug?: string): Project | null {
  const others = portfolioSnapshot.projects.filter((p) => p.slug !== slug);
  if (others.length === 0) return null;
  return [...others].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
}
