/** Shapes returned by the portfolio API. */

export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  views?: number;
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
