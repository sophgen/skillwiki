import { Skill, SkillMetadata } from './types';

// Node.js utilities - CommonJS for build-time usage
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const skillsDir = path.join(process.cwd(), '..', 'skills');

export function getSkillIds(): string[] {
  try {
    return fs.readdirSync(skillsDir);
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

    return {
      id,
      metadata: data as SkillMetadata,
      content,
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
