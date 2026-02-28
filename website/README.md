# SkillWiki Website

Next.js application for the SkillWiki agent skills marketplace.

## Overview

This directory contains the website frontend for SkillWiki, a static marketplace catalog built with Next.js and deployed to GitHub Pages.

## Structure

```
website/
├── src/
│   ├── pages/
│   │   ├── index.tsx           # Homepage with filtering
│   │   ├── integrate.tsx       # Agent integration guide
│   │   ├── skills/[id].tsx     # Individual skill pages
│   │   ├── _app.tsx            # App wrapper
│   │   └── _document.tsx       # HTML structure
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── SkillCard.tsx       # Skill preview card
│   │   ├── SkillGrid.tsx       # Skills grid layout
│   │   └── FilterSidebar.tsx   # Search & filter controls
│   ├── lib/
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── skills.ts           # Skill parsing utilities
│   │   └── search.ts           # Search & filter logic
│   └── styles/
│       └── globals.css         # Global styles with Tailwind
├── public/
│   ├── skills.json             # Metadata index (generated)
│   └── available-skills.xml    # Agent discovery (generated)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config (static export)
├── tailwind.config.js          # Tailwind CSS config
└── postcss.config.js           # PostCSS config
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens http://localhost:3000

### Production Build

```bash
npm run build
```

Runs:
1. `build:metadata` - Parse SKILL.md files from `../skills/`
2. `next build` - Build Next.js
3. `next export` - Export as static HTML to `out/`

### View Static Export

```bash
# After npm run build, static files are in out/
ls out/
open out/index.html
```

## Key Files

### Pages

**`pages/index.tsx`**
- Homepage with hero section
- Featured skills carousel
- Full-text search
- Domain/difficulty/rating filters
- Sort options (recent, rated, popular, alphabetical)

**`pages/integrate.tsx`**
- Documentation for agents
- XML metadata format
- Integration examples
- Skills CLI documentation

**`pages/skills/[id].tsx`**
- Individual skill detail page
- Full skill content
- Metadata sidebar
- Related skills suggestions
- Copy to clipboard button

### Components

**`components/Header.tsx`**
- Navigation bar with logo
- Search input
- Links to /integrate and GitHub

**`components/SkillCard.tsx`**
- Skill preview card
- Metadata badges (domain, difficulty, rating)
- Copy button
- View link

**`components/SkillGrid.tsx`**
- Responsive grid layout
- Sort dropdown
- Empty state message
- Maps skills to SkillCard components

**`components/FilterSidebar.tsx`**
- Domain multi-select
- Difficulty multi-select
- Rating radio buttons
- Featured toggle
- Reset button

### Utilities

**`lib/types.ts`**
- `SkillMetadata` - Skill metadata interface
- `Skill` - Full skill with content
- `SearchFilters` - Filter state

**`lib/skills.ts`**
- `getSkillIds()` - Get all skill directory names
- `getSkillByIdSync()` - Load single skill SKILL.md
- `getAllSkills()` - Load all skills
- `getUniqueDomains()` - Extract domain options
- `getUniqueDifficulties()` - Extract difficulty options

**`lib/search.ts`**
- `searchSkills()` - Filter by query, domain, difficulty, rating
- `sortSkills()` - Sort by recent/rated/popular/alphabetical
- `getUniqueDomains()` - Domain aggregation
- `getUniqueDifficulties()` - Difficulty aggregation

## Build Process

### Metadata Generation

`scripts/generate-metadata.js` (in root):
1. Reads all `skills/*/SKILL.md` files
2. Parses YAML frontmatter with gray-matter
3. Generates:
   - `website/public/skills.json` - Metadata index
   - `website/public/available-skills.xml` - Agent discovery file

### Next.js Build

Next.js static export with:
- `output: 'export'` in next.config.js
- Static page generation (SSG with getStaticProps)
- Pre-rendered HTML for all skill pages
- CSS-in-JS with Tailwind

### Static Export Output

```
out/
├── index.html                  # Homepage
├── integrate/index.html        # Agent guide
├── skills/
│   ├── python-basics-101/index.html
│   ├── stock-analysis/index.html
│   └── email-automation/index.html
├── 404.html                    # Error page
├── _next/                      # Next.js chunks
├── available-skills.xml        # Agent discovery
└── skills.json                 # Metadata
```

## Configuration

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`

### Tailwind (`tailwind.config.js`)
- Content scanning for `src/**/*.{jsx,tsx}`
- Default theme extended

### Next.js (`next.config.js`)
- `output: 'export'` - Static export to GitHub Pages
- `trailingSlash: true` - URLs with trailing slashes
- Unoptimized images for static export

## Development Tips

### Adding a New Skill

1. Create directory: `../skills/my-skill/`
2. Create `SKILL.md` with frontmatter
3. Run: `npm run build:metadata`
4. New skill appears on homepage

### Modifying Filters

Edit `components/FilterSidebar.tsx` to add/remove filter options.

### Changing Styles

- Global styles: `src/styles/globals.css`
- Tailwind classes in components
- Dark mode available via Tailwind config

### Testing Search/Filter Logic

See `src/lib/__tests__/search.test.ts` for example tests.

## Deployment

### GitHub Pages (Automatic)

GitHub Actions automatically builds and deploys on push to `main`.

See `.github/workflows/deploy.yml`.

### Manual Deployment

```bash
npm run build
# Upload website/out/ contents to GitHub Pages or other host
```

## Troubleshooting

### Build Fails: "Cannot find SKILL.md"
- Ensure `../skills/` has valid skill directories
- Check SKILL.md exists in each skill directory

### Pages Don't Show Skills
- Run `npm run build:metadata` first
- Check `public/skills.json` exists
- Verify `getAllSkills()` returns skills

### Styles Not Applied
- Ensure `src/styles/globals.css` imports Tailwind
- Check Tailwind config includes `src/` paths
- Rebuild with `npm run build`

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Full production build
npm run build:metadata   # Generate metadata only
npm run build:next       # Build & export only
npm run start            # Start production server
npm run lint             # Run Next.js linter
```

## Dependencies

- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - Styling
- **gray-matter** - YAML frontmatter parsing
- **markdown-it** - Markdown rendering

## Environment

- Node.js 18+
- npm or yarn

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Static Exports](https://nextjs.org/docs/advanced-features/static-html-export)
- [Tailwind CSS](https://tailwindcss.com/)
- [agentskills.io](https://agentskills.io/)
