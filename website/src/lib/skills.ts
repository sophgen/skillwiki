import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Skill, SkillMetadata } from './types';

// process.cwd() is website/ when build runs from website/; SKILLS_DIR overrides for CI
const skillsDir = process.env.SKILLS_DIR || path.join(process.cwd(), '..', 'skills');

function flattenMetadata(data: Record<string, unknown>): SkillMetadata {
  if (!data) return {} as SkillMetadata;
  const flat = { ...data } as Record<string, unknown>;
  if (data.metadata && typeof data.metadata === 'object') {
    Object.assign(flat, data.metadata as Record<string, unknown>);
    delete flat.metadata;
  }

  // Coerce string values from quoted SKILL.md frontmatter to proper types
  if (typeof flat.tags === 'string') {
    flat.tags = (flat.tags as string).split(',').map((t) => t.trim()).filter(Boolean);
  }
  const useCasesRaw = flat['use-cases'] ?? flat.useCases;
  if (typeof useCasesRaw === 'string') {
    const arr = (useCasesRaw as string).split(',').map((t) => t.trim()).filter(Boolean);
    flat.useCases = arr;
    delete flat['use-cases'];
  } else if (Array.isArray(flat['use-cases'])) {
    flat.useCases = flat['use-cases'] as string[];
    delete flat['use-cases'];
  }

  return flat as SkillMetadata;
}

export function getSkillIds(): string[] {
  try {
    const ids: string[] = [];
    const domainDirs = fs.readdirSync(skillsDir).filter((d) => !d.startsWith('_'));

    for (const domainDir of domainDirs) {
      const domainPath = path.join(skillsDir, domainDir);
      if (!fs.statSync(domainPath).isDirectory()) continue;

      const skillDirs = fs.readdirSync(domainPath);
      for (const skillName of skillDirs) {
        const skillPath = path.join(skillsDir, domainDir, skillName, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          ids.push(`${domainDir}/${skillName}`);
        }
      }
    }
    return ids;
  } catch {
    return [];
  }
}

export function getSkillByIdSync(id: string): Skill | null {
  try {
    const skillPath = path.join(skillsDir, id, 'SKILL.md');
    if (!fs.existsSync(skillPath)) return null;

    const fileContent = fs.readFileSync(skillPath, 'utf-8');
    const { data, content } = matter(fileContent);
    const flatMetadata = flattenMetadata(data as Record<string, unknown>);

    const parts = id.split('/');
    const domain = parts.length >= 2 ? parts[0] : undefined;
    const slug = parts.length >= 2 ? parts.slice(1).join('/') : id;

    return {
      id,
      metadata: flatMetadata,
      content,
      rawContent: fileContent,
      domain,
      slug,
    };
  } catch (error) {
    console.error(`Error reading skill ${id}:`, error);
    return null;
  }
}

export function getAllSkills(): Skill[] {
  const ids = getSkillIds();
  return ids
    .map((id) => getSkillByIdSync(id))
    .filter((skill) => skill !== null) as Skill[];
}

export function getSkillMetadata(id: string): SkillMetadata | null {
  const skill = getSkillByIdSync(id);
  return skill ? skill.metadata : null;
}

