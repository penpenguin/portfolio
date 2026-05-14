export interface AgentSite {
  name: string;
  url: string;
  description: string;
}

export interface AgentProfile {
  headline: string;
  skills: string[];
  experience: string;
  specialties: string[];
}

export interface AgentProject {
  type: 'project';
  id: string;
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  url: string;
  liveUrl: string | null;
  githubUrl: string | null;
}

export interface AgentBlogPost {
  type: 'blog';
  id: string;
  title: string;
  description: string;
  pubDate: string;
  updatedDate: string | null;
  tags: string[];
  url: string;
}

export interface AgentCareerItem {
  title: string;
  period: string;
  role: string;
  description: string;
  teamSize: string;
  responsibilities: string;
  techStack: string[];
}

export interface AgentContact {
  pageUrl: string;
  githubUrl: string;
  email: string | null;
}

export interface AgentIndex {
  site: AgentSite;
  profile: AgentProfile;
  projects: AgentProject[];
  blog: AgentBlogPost[];
  career: AgentCareerItem[];
  contact: AgentContact;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description?: string;
  invoke: (input: TInput) => TOutput | Promise<TOutput>;
}
