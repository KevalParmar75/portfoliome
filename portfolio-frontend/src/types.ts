/** Shapes returned by the portfolio API. */

export interface ProjectImage {
  id: number;
  image: string;
  caption?: string | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  detailed_description?: string;
  tech_stack?: string;
  github_url?: string | null;
  live_url?: string | null;
  views?: number;
  images?: ProjectImage[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  description: string;
  start_date: string;
  end_date: string | null;
  currently_working: boolean;
}

export interface About {
  headline: string;
  bio: string;
}

export interface Social {
  id: number;
  name: string;
  url: string;
}
