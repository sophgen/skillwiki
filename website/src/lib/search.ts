import { Skill, SkillMetadata, SearchFilters } from './types';

export function searchSkills(skills: Skill[], filters: SearchFilters): Skill[] {
  return skills.filter((skill) => {
    const meta = skill.metadata;

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchFields = [
        meta.name,
        meta.description,
        meta.author,
        ...(meta.tags || []),
        ...(meta.useCases || []),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchFields.includes(query)) return false;
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
  sortBy: 'recent' | 'rated' | 'popular' | 'alphabetical' = 'recent'
): Skill[] {
  const sorted = [...skills];

  switch (sortBy) {
    case 'rated':
      return sorted.sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
    case 'alphabetical':
      return sorted.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    case 'popular':
      // Placeholder: would need view count in metadata
      return sorted;
    case 'recent':
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
