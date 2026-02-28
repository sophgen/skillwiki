export interface SkillMetadata {
  name: string;
  description: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  domain?: string;
  useCases?: string[];
  featured?: boolean;
  tags?: string[];
  [key: string]: any;
}

export interface Skill {
  id: string;
  metadata: SkillMetadata;
  content: string;
}

export interface SearchFilters {
  domains: string[];
  difficulties: string[];
  rating?: number;
  featured?: boolean;
  query?: string;
}
