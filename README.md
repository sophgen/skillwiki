# SkillWiki Agent Skills Catalog

A static marketplace catalog for discovering and integrating pre-built agent skills. Built with Next.js and deployed to GitHub Pages.

## Overview

SkillWiki provides a curated collection of agent skills across domains like education, trading, and workflow automation. Skills follow the [agentskills.io specification](https://agentskills.io/specification).

- **For Humans:** Browse, search, filter, and copy skills via the marketplace UI at [skillwiki.ai](https://skillwiki.ai)
- **For Agents:** Discover and load skills programmatically via XML metadata

## Project Structure

```
skillwiki-catalog/
├── skills/              # Agent skill definitions (SKILL.md files), organized by domain
│   ├── education/
│   │   └── python-basics-101/
│   ├── trading/
│   │   └── stock-analysis/
│   └── workflow/
│       └── email-automation/
├── website/            # Next.js website application
│   ├── src/
│   │   ├── pages/      # Website pages (index, [id], integrate)
│   │   ├── components/ # React components (Header, SkillCard, etc.)
│   │   ├── lib/        # Utilities (skills.ts, search.ts, types.ts)
│   │   └── styles/     # Global styles with Tailwind
│   ├── public/         # Generated metadata (skills.json, available-skills.xml)
│   └── package.json    # Dependencies and build scripts
├── scripts/            # Build scripts (generate-metadata.js)
├── .github/workflows/  # GitHub Actions deployment
└── docs/plans/         # Design and implementation plans
```

## Quick Start

### Local Development

```bash
cd website
npm install
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
```

This runs:
1. `build:metadata` - Parse SKILL.md files → generate JSON + XML
2. `next build` - Next.js build for production
3. `next export` - Static HTML export to `out/` directory

Output in `website/out/` ready for GitHub Pages.

## Features

### For Humans
- **Browse Marketplace:** Explore 20+ skills across 3 domains
- **Search & Filter:** Full-text search, domain/difficulty/rating filters
- **Skill Cards:** Quick preview with metadata, ratings, and tags
- **Skill Details:** Full content, use cases, related skills
- **Copy to Clipboard:** One-click copy for easy integration
- **Responsive Design:** Works on desktop and mobile

### For Agents
- **XML Metadata Discovery:** Fetch `available-skills.xml` for all skills
- **Machine-Readable Format:** Standard XML structure for parsing
- **Direct Links:** Raw GitHub URLs for fetching SKILL.md files
- **Integration Guide:** Detailed `/integrate` page with examples

## Adding Skills

1. Create a skill directory under a domain folder:
   ```
   skills/{domain}/my-new-skill/
   ├── SKILL.md
   ├── scripts/ (optional)
   └── references/ (optional)
   ```
   Valid domains: `automation`, `education`, `trading`, `development`, `workflow`, `general`

2. Create `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: my-new-skill
   description: What this skill does...
   metadata:
     author: Your Name
     difficulty: beginner|intermediate|advanced
     rating: 4.5
     domain: education|trading|workflow
     featured: false
     tags: [tag1, tag2]
   ---

   # Your Skill Content
   ```

3. Build and test locally:
   ```bash
   npm run build:metadata
   npm run dev
   ```

## Deployment

### Automatic (GitHub Actions)

On every push to `main`:
1. GitHub Actions triggers the workflow
2. Builds metadata and Next.js
3. Deploys to GitHub Pages

See `.github/workflows/deploy.yml` for details.

### Manual

```bash
npm run build
# Upload website/out/ to GitHub Pages or your hosting
```

## Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Parsing:** gray-matter (YAML), markdown-it
- **Build:** Node.js scripts for metadata generation
- **Deployment:** GitHub Pages via GitHub Actions
- **Specification:** [agentskills.io](https://agentskills.io/)

## Skills Included

### Featured Skills
- **python-basics-101** (Education, Beginner)
  - Learn Python fundamentals: variables, loops, functions, data structures

- **stock-analysis** (Trading, Advanced)
  - Technical indicators, trend analysis, trading signals

- **email-automation** (Workflow, Intermediate)
  - Email templates, bulk operations, scheduling

## For Agents

Agents can integrate SkillWiki skills:

```bash
# Fetch metadata
curl https://skillwiki.ai/available-skills.xml

# Load skill
curl https://raw.githubusercontent.com/sophgen/skillwiki/main/skills/education/python-basics-101/SKILL.md
```

Example integration with Claude:

```xml
<available_skills>
  <skill>
    <name>python-basics-101</name>
    <description>Learn Python fundamentals...</description>
    <location>https://raw.githubusercontent.com/sophgen/skillwiki/main/skills/education/python-basics-101/SKILL.md</location>
  </skill>
</available_skills>
```

See `/integrate` page for detailed instructions.

## Development

### Install Dependencies
```bash
cd website
npm install
```

### Development Server
```bash
npm run dev
```

### Build Locally
```bash
npm run build
```

### Verify Static Export
```bash
ls website/out/
```

## Project Status

- ✅ Core infrastructure (Next.js, Tailwind, TypeScript)
- ✅ Skill parsing and utilities
- ✅ React components (Header, SkillCard, FilterSidebar, SkillGrid)
- ✅ Pages (homepage, skill details, agent integration guide)
- ✅ Sample skills (3 example skills)
- ✅ Metadata generation (JSON + XML)
- ✅ Static export for GitHub Pages
- ✅ GitHub Actions deployment

## Contributing

To add new skills or improve the catalog:

1. Fork the repository
2. Add/modify skills in the `skills/` directory
3. Test locally: `npm run dev`
4. Submit a pull request

All skills must follow the [agentskills.io specification](https://agentskills.io/specification).

## Resources

- [agentskills.io](https://agentskills.io/) - Skill specification
- [Next.js Documentation](https://nextjs.org/docs) - Framework docs
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - YAML parsing

## License

[Add your license here - e.g., MIT, Apache 2.0, etc.]

## Support

- Questions? Check the [/integrate](https://skillwiki.ai/integrate) page
- Issues? Open a GitHub issue
- Want to add skills? See Contributing section above

---

Built with ❤️ for the agent community using [agentskills.io](https://agentskills.io/) specification.
