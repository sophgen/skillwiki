import { Skill, SkillMetadata, SearchFilters } from './types';

export function searchSkills(skills: Skill[], filters: SearchFilters): Skill[] {
  return skills.filter((skill) => {
    const meta = skill.metadata;

    // Text search: split query into tokens, match any token
    if (filters.query) {
      const tokens = filters.query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);
      if (tokens.length > 0) {
        const searchFields = [
          meta.name,
          meta.description,
          meta.author,
          ...(meta.tags || []),
          ...(meta.useCases || []),
        ]
          .join(' ')
          .toLowerCase();
        const matchesAll = tokens.every((token) => searchFields.includes(token));
        if (!matchesAll) return false;
      }
    }

    // Domain filter
    if (filters.domains.length > 0 && meta.domain) {
      if (!filters.domains.includes(meta.domain)) return false;
    }

    // Difficulty filter
    if (filters.difficulties.length > 0 && meta.difficulty) {
      if (!filters.difficulties.includes(meta.difficulty)) return false;
    }

    // Rating filter
    if (filters.rating && meta.rating) {
      if (meta.rating < filters.rating) return false;
    }

    // Featured filter
    if (filters.featured && !meta.featured) {
      return false;
    }

    return true;
  });
}

export function sortSkills(
  skills: Skill[],
  sortBy: 'default' | 'rated' | 'popular' | 'alphabetical' = 'default'
): Skill[] {
  const sorted = [...skills];

  switch (sortBy) {
    case 'rated':
      return sorted.sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
    case 'alphabetical':
      return sorted.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    case 'popular':
      // Use rating as proxy for popularity until view count is available
      return sorted.sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
    case 'default':
    default:
      return sorted;
  }
}

export function getUniqueDomains(skills: Skill[]): string[] {
  const domains = new Set<string>();
  skills.forEach((skill) => {
    if (skill.metadata.domain) {
      domains.add(skill.metadata.domain);
    }
  });
  return Array.from(domains).sort();
}

export function getUniqueDifficulties(skills: Skill[]): string[] {
  const difficulties = new Set<string>();
  skills.forEach((skill) => {
    if (skill.metadata.difficulty) {
      difficulties.add(skill.metadata.difficulty);
    }
  });
  return Array.from(difficulties).sort();
}
