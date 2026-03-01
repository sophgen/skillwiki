export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  domain?: string;
  useCases?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export interface Skill {
  id: string; // Format: {domain}/{skill-name}, e.g. education/python-basics-101
  metadata: SkillMetadata;
  content: string;
  rawContent?: string; // Original SKILL.md file content for accurate copy
  /** Domain from directory path (derived from id) */
  domain?: string;
  /** Skill name without domain prefix, for display */
  slug?: string;
}

export interface SearchFilters {
  domains: string[];
  difficulties: string[];
  query?: string;
}
