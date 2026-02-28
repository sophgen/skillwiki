const fs = require('fs');
const path = require('path');

// Resolve modules from website/node_modules since this script runs from root
const matter = require(path.join(__dirname, '..', 'website', 'node_modules', 'gray-matter'));

const skillsDir = path.join(__dirname, '..', 'skills');
const outputDir = path.join(__dirname, '..', 'website', 'public');

function parseSkills() {
  const skills = [];
  const skillDirs = fs.readdirSync(skillsDir);

  skillDirs.forEach((skillId) => {
    const skillPath = path.join(skillsDir, skillId, 'SKILL.md');

    if (fs.existsSync(skillPath)) {
      const fileContent = fs.readFileSync(skillPath, 'utf-8');
      const { data, content } = matter(fileContent);

      skills.push({
        id: skillId,
        metadata: data,
        contentPreview: content.substring(0, 200),
      });
    }
  });

  return skills;
}

function generateXML(skills) {
  const xmlItems = skills
    .map(
      (skill) => `  <skill>
    <name>${escapeXml(skill.metadata.name)}</name>
    <description>${escapeXml(skill.metadata.description)}</description>
    <location>https://raw.githubusercontent.com/skillwiki/catalog/main/skills/${skill.id}/SKILL.md</location>
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
