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

    // Domain filter — use metadata.domain or path-derived skill.domain (no hardcoding)
    const effectiveDomain = meta.domain ?? skill.domain;
    if (filters.domains.length > 0 && effectiveDomain) {
      if (!filters.domains.includes(effectiveDomain)) return false;
    }

    // Difficulty filter
    if (filters.difficulties.length > 0 && meta.difficulty) {
      if (!filters.difficulties.includes(meta.difficulty)) return false;
    }

    return true;
  });
}

export function sortSkills(
  skills: Skill[],
  sortBy: 'default' | 'alphabetical' = 'default'
): Skill[] {
  const sorted = [...skills];

  switch (sortBy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    case 'default':
    default:
      return sorted;
  }
}

export function getUniqueDomains(skills: Skill[]): string[] {
  const domains = new Set<string>();
  skills.forEach((skill) => {
    const effectiveDomain = skill.metadata.domain ?? skill.domain;
    if (effectiveDomain) {
      domains.add(effectiveDomain);
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
