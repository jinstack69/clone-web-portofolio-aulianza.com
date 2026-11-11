export interface Project {
  slug: string;
  title: string;
  description: string;
  tagline?: string;
  image?: string;
  stacks: string[];
  color: string;
  year: number;
  client?: string;
  featured?: boolean;
  services?: string[];
  deliverables?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  views: number;
  topics: string[];
  coverImage?: string;
  featured?: boolean;
}

export interface ServiceStage {
  id: string;
  stepNumber: string;
  title: string;
  badge: string;
  description: string;
  builtWith: string[];
}

export interface QuranReminder {
  id: number;
  arabicText: string;
  translation: string;
  reference: string;
  index: string;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  category: 'Workspace' | 'Devices & Monitors' | 'Input Devices' | 'Audio Setup' | 'Video & Streaming' | 'Software & Apps';
  isOnDesk: boolean;
  deskX?: number;
  deskY?: number;
  tag: string;
}

export interface DeveloperTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
}
