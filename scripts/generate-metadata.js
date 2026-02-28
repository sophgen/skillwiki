const fs = require('fs');
const path = require('path');

// Resolve modules from website/node_modules since this script runs from root
const matter = require(path.join(__dirname, '..', 'website', 'node_modules', 'gray-matter'));

const skillsDir = path.join(__dirname, '..', 'skills');
const outputDir = path.join(__dirname, '..', 'website', 'public');

// Centralized GitHub config - keep in sync with website/src/lib/config.ts
const GITHUB_REPO = 'skillwiki/catalog';
const GITHUB_BRANCH = 'main';
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`;

function flattenMetadata(data) {
  if (!data) return {};
  const flat = { ...data };
  if (data.metadata && typeof data.metadata === 'object') {
    Object.assign(flat, data.metadata);
    delete flat.metadata;
  }
  return flat;
}

function validateSkill(skillId, data, content) {
  const errors = [];
  const name = data?.name;

  if (!name || typeof name !== 'string') {
    errors.push(`Missing or invalid 'name' field`);
  } else {
    if (name !== skillId) {
      errors.push(`name "${name}" does not match directory "${skillId}"`);
    }
    if (name.length < 1 || name.length > 64) {
      errors.push(`name must be 1-64 characters (got ${name.length})`);
    }
    if (name !== name.toLowerCase()) {
      errors.push(`name must be lowercase (got "${name}")`);
    }
    if (/--/.test(name)) {
      errors.push(`name must not contain consecutive hyphens`);
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      errors.push(`name must be alphanumeric + hyphens only`);
    }
  }

  const desc = data?.description;
  if (!desc || typeof desc !== 'string') {
    errors.push(`Missing or invalid 'description' field`);
  } else if (desc.length < 1 || desc.length > 1024) {
    errors.push(`description must be 1-1024 characters (got ${desc.length})`);
  }

  return errors;
}

function parseSkills() {
  const skills = [];
  let hasErrors = false;

  if (!fs.existsSync(skillsDir)) {
    console.error(`ERROR: Skills directory not found: ${skillsDir}`);
    process.exit(1);
  }

  const skillDirs = fs.readdirSync(skillsDir).filter((d) => !d.startsWith('_'));

  skillDirs.forEach((skillId) => {
    const skillPath = path.join(skillsDir, skillId, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      console.warn(`WARN: Skipping ${skillId} - no SKILL.md found`);
      return;
    }

    try {
      const fileContent = fs.readFileSync(skillPath, 'utf-8');
      const { data, content } = matter(fileContent);
      const validationErrors = validateSkill(skillId, data, content);

      if (validationErrors.length > 0) {
        console.error(`ERROR: skills/${skillId}/SKILL.md validation failed:`);
        validationErrors.forEach((e) => console.error(`  - ${e}`));
        hasErrors = true;
        return;
      }

      const flatMetadata = flattenMetadata(data);

      skills.push({
        id: skillId,
        metadata: flatMetadata,
        contentPreview: (content || '').substring(0, 200),
      });
    } catch (err) {
      console.error(`ERROR: Failed to parse skills/${skillId}/SKILL.md:`, err.message);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    process.exit(1);
  }

  return skills;
}

function generateXML(skills) {
  const xmlItems = skills
    .map(
      (skill) => `  <skill>
    <name>${escapeXml(skill.metadata.name)}</name>
    <description>${escapeXml(skill.metadata.description)}</description>
    <location>${RAW_BASE}/skills/${skill.id}/SKILL.md</location>
  </skill>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<available_skills>
${xmlItems}
</available_skills>`;
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  console.log('Parsing skills...');
  const skills = parseSkills();

  console.log(`Found ${skills.length} skills`);

  // Generate JSON index
  fs.writeFileSync(
    path.join(outputDir, 'skills.json'),
    JSON.stringify(skills, null, 2)
  );
  console.log('Generated skills.json');

  // Generate XML for agents
  const xml = generateXML(skills);
  fs.writeFileSync(path.join(outputDir, 'available-skills.xml'), xml);
  console.log('Generated available-skills.xml');
}

main();
