#!/usr/bin/env node
/**
 * Sync skills from anthropics/skills repo into this project.
 * Maps Anthropic's flat structure to our domain-based structure:
 *   general, workflow, development, education, trading, automation
 *
 * Run: node scripts/sync-anthropics-skills.js [--clone]
 *   --clone: Clone anthropics/skills to /tmp first (default: expects it at /tmp/anthropics-skills)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ANTHROPICS_SKILLS = process.env.ANTHROPICS_SKILLS || '/tmp/anthropics-skills/skills';
const TARGET_SKILLS = path.join(__dirname, '..', 'skills');

// Mapping: anthropic skill name -> our domain folder
const ANTHROPIC_TO_DOMAIN = {
  'algorithmic-art': 'general',
  'brand-guidelines': 'general',
  'canvas-design': 'general',
  'theme-factory': 'general',
  'doc-coauthoring': 'workflow',
  'docx': 'workflow',
  'internal-comms': 'workflow',
  'pdf': 'workflow',
  'pptx': 'workflow',
  'slack-gif-creator': 'workflow',
  'xlsx': 'workflow',
  'frontend-design': 'development',
  'mcp-builder': 'development',
  'skill-creator': 'development',
  'web-artifacts-builder': 'development',
  'webapp-testing': 'development',
};

function ensureDomainInFrontmatter(skillPath) {
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) return;

  let content = fs.readFileSync(skillMdPath, 'utf-8');
  const parts = path.relative(TARGET_SKILLS, skillPath).split(path.sep);
  const targetDomain = parts[0];

  const metadataMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!metadataMatch) return;

  const frontmatter = metadataMatch[1];

  // If domain already exists (top-level or under metadata), update it
  if (/^domain:\s*\S+/m.test(frontmatter)) {
    content = content.replace(/^domain:\s*\S+/m, `domain: ${targetDomain}`);
    fs.writeFileSync(skillMdPath, content);
    return;
  }
  if (/^  domain:\s*\S+/m.test(frontmatter)) {
    content = content.replace(/^  domain:\s*\S+/m, `  domain: ${targetDomain}`);
    fs.writeFileSync(skillMdPath, content);
    return;
  }

  // Add domain: prefer under metadata block if present
  if (frontmatter.includes('metadata:') && /^  \w+:/m.test(frontmatter)) {
    content = content.replace(
      /(metadata:\s*\n)/,
      `$1  domain: ${targetDomain}\n`
    );
  } else {
    content = content.replace(
      /^(---\r?\n)/,
      `$1domain: ${targetDomain}\n`
    );
  }
  fs.writeFileSync(skillMdPath, content);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  Skip: ${src} not found`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      copyDirRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--clone')) {
    console.log('Cloning anthropics/skills...');
    execSync(
      'git clone --depth 1 https://github.com/anthropics/skills.git /tmp/anthropics-skills',
      { stdio: 'inherit' }
    );
  }

  const srcBase = process.env.ANTHROPICS_SKILLS || '/tmp/anthropics-skills/skills';
  if (!fs.existsSync(srcBase)) {
    console.error(`ERROR: Anthropic skills not found at ${srcBase}`);
    console.error('Run with --clone or set ANTHROPICS_SKILLS');
    process.exit(1);
  }

  console.log(`Syncing from ${srcBase} to ${TARGET_SKILLS}\n`);

  for (const [skillName, domain] of Object.entries(ANTHROPIC_TO_DOMAIN)) {
    const src = path.join(srcBase, skillName);
    const dest = path.join(TARGET_SKILLS, domain, skillName);

    if (!fs.existsSync(src)) {
      console.warn(`  Skip ${skillName}: not in Anthropic repo`);
      continue;
    }

    console.log(`  ${domain}/${skillName}`);
    copyDirRecursive(src, dest);
    ensureDomainInFrontmatter(dest);
  }

  console.log('\nDone. Run `cd website && npm run build:metadata` to regenerate zips and skills.json');
}

main();
