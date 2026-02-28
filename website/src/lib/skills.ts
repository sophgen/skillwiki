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
  return flat as SkillMetadata;
}

export function getSkillIds(): string[] {
  try {
    return fs.readdirSync(skillsDir).filter((d) => !d.startsWith('_'));
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

    return {
      id,
      metadata: flatMetadata,
      content,
      rawContent: fileContent,
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

