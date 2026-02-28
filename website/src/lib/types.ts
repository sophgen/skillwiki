export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  domain?: string;
  useCases?: string[];
  featured?: boolean;
  tags?: string[];
  [key: string]: unknown;
}

export interface Skill {
  id: string;
  metadata: SkillMetadata;
  content: string;
  rawContent?: string; // Original SKILL.md file content for accurate copy
}

export interface SearchFilters {
  domains: string[];
  difficulties: string[];
  rating?: number;
  featured?: boolean;
  query?: string;
}
