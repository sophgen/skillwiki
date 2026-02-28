# SkillWiki Agent Catalog Design

**Date:** 2026-02-28
**Domain:** skillwiki.ai
**Project:** Agent Skills Marketplace Catalog

---

## Overview

A static webpage marketplace catalog for discovering, exploring, and integrating pre-built agent skills. The catalog covers multiple domains (education, trading, workflow automation) with 20 initial skills following the [agentskills.io specification](https://agentskills.io/specification).

**Key Goals:**
- Enable humans to browse and discover skills through a marketplace UI
- Enable agents to programmatically discover and integrate skills
- Maintain all content in git-friendly, version-controlled format
- Deploy as static site to GitHub Pages with future hosting flexibility

---

## Architecture

### Data Structure (agentskills.io Standard)

Skills are organized as directories containing `SKILL.md` files:

```
skills/
├── python-basics-101/
│   ├── SKILL.md           # Skill metadata + instructions
│   ├── scripts/           # Optional executable code
│   │   └── example.py
│   └── references/        # Optional detailed documentation
│       └── REFERENCE.md
├── stock-analysis/
│   ├── SKILL.md
│   ├── scripts/
│   │   └── analyzer.py
│   └── assets/
└── ... (18 more skills)
```

Each `SKILL.md` contains YAML frontmatter with metadata:

```yaml
---
name: python-basics-101
description: Learn fundamental Python concepts...
metadata:
  author: Jane Doe
  difficulty: beginner
  rating: 4.8
  domain: education
  useCases: ["Learn programming", "Interview prep"]
  featured: true
---

# Skill instructions and content here...
```

**Metadata Fields:**
- `name`: skill identifier (required, agentskills.io standard)
- `description`: what the skill does (required)
- `metadata.author`: creator name
- `metadata.difficulty`: beginner | intermediate | advanced
- `metadata.rating`: 0-5 star rating
- `metadata.domain`: education | trading | workflow
- `metadata.useCases`: array of use case descriptions
- `metadata.featured`: boolean for homepage highlighting
- `metadata.tags`: array of category tags

---

## User Interface & Components

### Homepage
- Hero section with site title and search bar
- Featured skills carousel/grid (featured=true)
- Main skills grid with filtering sidebar
- Filter options: domain, difficulty, rating, featured toggle
- Sort options: newest, highest rated, most popular, alphabetical

### Skill Card Component
Displays on homepage and search results:
- Skill name
- Short description (truncated)
- Domain badge
- Difficulty badge
- Star rating
- Author name
- Tags
- "Copy" and "Install" buttons

### Individual Skill Page
Accessible via `/skills/[id]`:
- Full SKILL.md content rendered as markdown
- Skill metadata sidebar
- Copy/download buttons
- Related skills navigation
- GitHub source link

### Navigation
- Header with skillwiki.ai logo
- Site-wide search bar
- Domain category links (education, trading, workflow)
- GitHub repository link

---

## Discovery & Integration

### For Humans
**On the website:**
- Search: full-text across name, description, tags, author
- Filters: multi-select domain, difficulty; single-select rating
- Sorting: recent, rated, popular, alphabetical
- URL state: query params preserve filtered views (bookmarkable)
- Copy to clipboard: entire SKILL.md ready to paste into agent platforms
- GitHub links: direct access to skill source

### For Agents
**Programmatic discovery:**
1. Generate `available-skills.xml` at build time:
   ```xml
   <available_skills>
     <skill>
       <name>python-basics-101</name>
       <description>Learn fundamental Python concepts...</description>
       <location>https://raw.githubusercontent.com/skillwiki/catalog/main/skills/python-basics-101/SKILL.md</location>
     </skill>
     <!-- ... 19 more -->
   </available_skills>
   ```

2. Agents fetch `available-skills.xml` to discover catalog
3. Extract metadata (name, description) for agent prompts
4. Load full `SKILL.md` from GitHub raw content when activated
5. Access scripts/references via relative GitHub paths

**Agent Integration Documentation:**
- Instructions page explaining how to add skillwiki.ai catalog to agent skill paths
- XML format specification
- Example agent prompt inclusion
- URL to `available-skills.xml`

---

## Technology Stack

**Frontend:**
- Next.js (static export to GitHub Pages)
- React for components
- TailwindCSS or CSS modules for styling

**Build Process:**
1. Parse all `SKILL.md` files → extract metadata
2. Generate `available-skills.xml` for agents
3. Generate skills JSON index for frontend
4. Next.js static export → HTML/CSS/JS
5. Deploy to GitHub Pages

**Build Commands:**
- `npm run build:metadata` — Parse skills → generate metadata files
- `npm run build:next` — Next.js static export
- `npm run build` — Combined production build
- `npm run dev` — Local development server

**Key Dependencies:**
- next
- react
- front-matter (YAML parsing)
- markdown-it (markdown rendering)

---

## File Structure

```
skillwiki-catalog/
├── skills/                      # Skill directories
│   ├── python-basics-101/
│   ├── stock-analysis/
│   └── ... (18 more)
├── website/                     # Next.js application
│   ├── pages/
│   │   ├── index.tsx           # Homepage
│   │   ├── skills/[id].tsx     # Skill detail page
│   │   ├── integrate.tsx       # Agent integration guide
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── components/
│   │   ├── SkillCard.tsx
│   │   ├── SkillGrid.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterSidebar.tsx
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── skills.ts           # Parse SKILL.md files
│   │   ├── search.ts           # Search/filter logic
│   │   └── types.ts            # TypeScript types
│   ├── public/                 # Static files
│   │   └── available-skills.xml (generated)
│   ├── styles/
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
├── scripts/
│   └── generate-metadata.js    # Parse skills → metadata
├── docs/
│   └── plans/
│       └── 2026-02-28-skillwiki-catalog-design.md
├── .gitignore
├── README.md
└── package.json (root)
```

---

## Build & Deployment

### Local Development
```bash
npm install
npm run dev          # Starts dev server on localhost:3000
```

### Production Build
```bash
npm run build        # Runs both metadata and Next.js build
npm run export       # Next.js static export
```

### Deployment
- Push to GitHub repository
- Enable GitHub Pages from `/docs` folder or GitHub Actions
- Static files deployed automatically

### GitHub Actions (Optional)
Automated build and deploy on push to main:
1. Run `npm run build`
2. Deploy build output to GitHub Pages

---

## Success Criteria

- [ ] 20 skills available in catalog
- [ ] Humans can browse, search, filter, and copy skills
- [ ] Agents can discover skills via XML metadata file
- [ ] Site renders on GitHub Pages as static site
- [ ] All skills follow agentskills.io specification
- [ ] URL state preserves search/filter state (bookmarkable)
- [ ] Mobile responsive design
- [ ] Fast load times (static site)

---

## Future Enhancements

- Backend for skill submissions and ratings
- Direct platform integration (Claude SDK, etc.)
- Skill validation and quality scoring
- Analytics on skill usage
- Community ratings and reviews
- Skill versioning
- Multi-language support

