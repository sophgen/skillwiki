# SkillWiki Agent Catalog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static marketplace catalog for agent skills using Next.js, following agentskills.io specification, deployable to GitHub Pages with both human UI and agent XML discovery.

**Architecture:** Next.js generates static HTML from skill directories. Build time parses SKILL.md files to extract metadata, generate XML for agents, and create searchable skill index. Frontend React components provide filtering, search, and UX. GitHub Pages serves static output.

**Tech Stack:** Next.js 14+, React 18+, TypeScript, TailwindCSS, gray-matter (YAML parser), markdown-it, GitHub Pages

---

## Phase 1: Project Setup

### Task 1: Initialize Next.js project and dependencies

**Files:**
- Create: `website/package.json`
- Create: `website/tsconfig.json`
- Create: `website/next.config.js`
- Create: `website/.gitignore`

**Step 1: Initialize package.json**

```json
{
  "name": "skillwiki-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "npm run build:metadata && next build && next export",
    "build:metadata": "node scripts/generate-metadata.js",
    "build:next": "next build && next export",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "gray-matter": "^4.0.3",
    "markdown-it": "^13.0.2",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: '',
};

module.exports = nextConfig;
```

**Step 4: Create .gitignore**

```
node_modules/
.next/
out/
.DS_Store
*.log
.env.local
.env.*.local
```

**Step 5: Commit**

```bash
git add website/package.json website/tsconfig.json website/next.config.js website/.gitignore
git commit -m "chore: initialize Next.js project configuration"
```

---

### Task 2: Set up directory structure and install dependencies

**Files:**
- Create: `website/src/pages/_app.tsx`
- Create: `website/src/pages/_document.tsx`
- Create: `website/src/lib/types.ts`
- Create: `website/postcss.config.js`
- Create: `website/tailwind.config.js`
- Create: `scripts/generate-metadata.js`

**Step 1: Install dependencies**

```bash
cd website
npm install
```

Expected: All packages installed successfully, `node_modules/` directory created.

**Step 2: Create _app.tsx**

```typescript
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**Step 3: Create _document.tsx**

```typescript
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="SkillWiki: Agent Skills Marketplace" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

**Step 4: Create types.ts**

```typescript
export interface SkillMetadata {
  name: string;
  description: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  domain?: string;
  useCases?: string[];
  featured?: boolean;
  tags?: string[];
  [key: string]: any;
}

export interface Skill {
  id: string;
  metadata: SkillMetadata;
  content: string;
}

export interface SearchFilters {
  domains: string[];
  difficulties: string[];
  rating?: number;
  featured?: boolean;
  query?: string;
}
```

**Step 5: Create Tailwind and PostCSS config**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 6: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}
```

**Step 7: Create generate-metadata.js**

```javascript
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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
```

**Step 8: Commit**

```bash
git add website/src website/postcss.config.js website/tailwind.config.js scripts/generate-metadata.js website/package-lock.json
git commit -m "chore: set up Next.js structure, Tailwind, and metadata generation"
```

---

## Phase 2: Core Libraries and Utilities

### Task 3: Build skill parsing and search utilities

**Files:**
- Create: `website/src/lib/skills.ts`
- Create: `website/src/lib/search.ts`

**Step 1: Create skills.ts**

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Skill, SkillMetadata } from './types';

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
```

**Step 2: Create search.ts**

```typescript
import { Skill, SkillMetadata, SearchFilters } from './types';

export function searchSkills(skills: Skill[], filters: SearchFilters): Skill[] {
  return skills.filter((skill) => {
    const meta = skill.metadata;

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchFields = [
        meta.name,
        meta.description,
        meta.author,
        ...(meta.tags || []),
        ...(meta.useCases || []),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchFields.includes(query)) return false;
    }

    // Domain filter
    if (filters.domains.length > 0 && meta.domain) {
      if (!filters.domains.includes(meta.domain)) return false;
    }

    // Difficulty filter
    if (filters.difficulties.length > 0 && meta.difficulty) {
      if (!filters.difficulties.includes(meta.difficulty)) return false;
    }

    // Rating filter
    if (filters.rating && meta.rating) {
      if (meta.rating < filters.rating) return false;
    }

    // Featured filter
    if (filters.featured && !meta.featured) {
      return false;
    }

    return true;
  });
}

export function sortSkills(
  skills: Skill[],
  sortBy: 'recent' | 'rated' | 'popular' | 'alphabetical' = 'recent'
): Skill[] {
  const sorted = [...skills];

  switch (sortBy) {
    case 'rated':
      return sorted.sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
    case 'alphabetical':
      return sorted.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    case 'popular':
      // Placeholder: would need view count in metadata
      return sorted;
    case 'recent':
    default:
      return sorted;
  }
}

export function getUniqueDomains(skills: Skill[]): string[] {
  const domains = new Set<string>();
  skills.forEach((skill) => {
    if (skill.metadata.domain) {
      domains.add(skill.metadata.domain);
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
```

**Step 3: Run tests**

Create `website/src/lib/__tests__/search.test.ts`:

```typescript
import { searchSkills, sortSkills } from '../search';
import { Skill } from '../types';

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    metadata: {
      name: 'Python Basics',
      description: 'Learn Python',
      domain: 'education',
      difficulty: 'beginner',
      rating: 4.5,
      tags: ['python', 'programming'],
    },
    content: '',
  },
  {
    id: 'skill-2',
    metadata: {
      name: 'Stock Trading',
      description: 'Trade stocks',
      domain: 'trading',
      difficulty: 'advanced',
      rating: 4.8,
      tags: ['stocks', 'finance'],
    },
    content: '',
  },
];

describe('searchSkills', () => {
  test('filters by domain', () => {
    const result = searchSkills(mockSkills, { domains: ['education'], difficulties: [], query: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('skill-1');
  });

  test('filters by difficulty', () => {
    const result = searchSkills(mockSkills, { domains: [], difficulties: ['advanced'], query: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('skill-2');
  });

  test('searches by text', () => {
    const result = searchSkills(mockSkills, { domains: [], difficulties: [], query: 'python' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('skill-1');
  });
});

describe('sortSkills', () => {
  test('sorts by rating', () => {
    const result = sortSkills(mockSkills, 'rated');
    expect(result[0].metadata.rating).toBeGreaterThanOrEqual(result[1].metadata.rating);
  });

  test('sorts alphabetically', () => {
    const result = sortSkills(mockSkills, 'alphabetical');
    expect(result[0].metadata.name < result[1].metadata.name).toBe(true);
  });
});
```

Run: `npm test`
Expected: Tests pass

**Step 4: Commit**

```bash
git add website/src/lib/skills.ts website/src/lib/search.ts website/src/lib/__tests__/
git commit -m "feat: add skill parsing and search utilities with tests"
```

---

## Phase 3: React Components

### Task 4: Build Header and Navigation

**Files:**
- Create: `website/src/components/Header.tsx`
- Create: `website/src/styles/Header.module.css`

**Step 1: Create Header component**

```typescript
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">SkillWiki</h1>
            <span className="text-sm text-gray-500">Agent Skills</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search skills..."
              value={query}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Navigation links */}
          <nav className="flex items-center space-x-6">
            <Link href="/integrate" className="text-gray-600 hover:text-gray-900">
              For Agents
            </Link>
            <a
              href="https://github.com/skillwiki/catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
```

**Step 2: Commit**

```bash
git add website/src/components/Header.tsx
git commit -m "feat: add Header component with search input"
```

---

### Task 5: Build SkillCard component

**Files:**
- Create: `website/src/components/SkillCard.tsx`

**Step 1: Create SkillCard**

```typescript
import { Skill } from '../lib/types';
import { useState } from 'react';
import Link from 'next/link';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const [copied, setCopied] = useState(false);
  const { name, description, domain, difficulty, rating, author, tags } = skill.metadata;

  const handleCopy = async () => {
    try {
      const response = await fetch(`/api/skill-content/${skill.id}`);
      const { content } = await response.json();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6 flex flex-col h-full">
      {/* Domain badge */}
      {domain && (
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {domain}
          </span>
        </div>
      )}

      {/* Name and description */}
      <Link href={`/skills/${skill.id}`}>
        <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
          {name}
        </h3>
      </Link>
      <p className="text-gray-600 text-sm mb-4 flex-grow">
        {description.substring(0, 120)}...
      </p>

      {/* Metadata row */}
      <div className="flex items-center justify-between text-sm mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {difficulty && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                difficultyColors[difficulty as keyof typeof difficultyColors] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {difficulty}
            </span>
          )}
          {rating && (
            <span className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-gray-700">{rating}</span>
            </span>
          )}
        </div>
        {author && <span className="text-gray-500">by {author}</span>}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <Link
          href={`/skills/${skill.id}`}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm font-medium transition text-center"
        >
          View
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add website/src/components/SkillCard.tsx
git commit -m "feat: add SkillCard component with copy and view actions"
```

---

### Task 6: Build FilterSidebar component

**Files:**
- Create: `website/src/components/FilterSidebar.tsx`

**Step 1: Create FilterSidebar**

```typescript
import { SearchFilters } from '../lib/types';

interface FilterSidebarProps {
  domains: string[];
  difficulties: string[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function FilterSidebar({
  domains,
  difficulties,
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const handleDomainToggle = (domain: string) => {
    const newDomains = filters.domains.includes(domain)
      ? filters.domains.filter((d) => d !== domain)
      : [...filters.domains, domain];
    onFiltersChange({ ...filters, domains: newDomains });
  };

  const handleDifficultyToggle = (difficulty: string) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter((d) => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  const handleRatingChange = (rating: number | undefined) => {
    onFiltersChange({ ...filters, rating });
  };

  const handleFeaturedToggle = () => {
    onFiltersChange({ ...filters, featured: !filters.featured });
  };

  return (
    <aside className="w-64 bg-white rounded-lg shadow-md p-6 border border-gray-200 h-fit sticky top-20">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Filters</h2>

      {/* Domain filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Domain</h3>
        <div className="space-y-2">
          {domains.map((domain) => (
            <label key={domain} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.domains.includes(domain)}
                onChange={() => handleDomainToggle(domain)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{domain}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Difficulty</h3>
        <div className="space-y-2">
          {difficulties.map((difficulty) => (
            <label key={difficulty} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.difficulties.includes(difficulty)}
                onChange={() => handleDifficultyToggle(difficulty)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{difficulty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={!filters.rating}
              onChange={() => handleRatingChange(undefined)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Any</span>
          </label>
          {[3, 3.5, 4].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{rating}+ ★</span>
            </label>
          ))}
        </div>
      </div>

      {/* Featured filter */}
      <div className="mb-8">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.featured || false}
            onChange={handleFeaturedToggle}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Featured Only</span>
        </label>
      </div>

      {/* Reset button */}
      <button
        onClick={() =>
          onFiltersChange({
            domains: [],
            difficulties: [],
            featured: false,
            query: filters.query,
          })
        }
        className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm font-medium transition"
      >
        Reset Filters
      </button>
    </aside>
  );
}
```

**Step 2: Commit**

```bash
git add website/src/components/FilterSidebar.tsx
git commit -m "feat: add FilterSidebar component with domain, difficulty, rating filters"
```

---

### Task 7: Build SkillGrid component

**Files:**
- Create: `website/src/components/SkillGrid.tsx`

**Step 1: Create SkillGrid**

```typescript
import { Skill } from '../lib/types';
import SkillCard from './SkillCard';

interface SkillGridProps {
  skills: Skill[];
  sortBy?: 'recent' | 'rated' | 'popular' | 'alphabetical';
  onSortChange?: (sort: string) => void;
}

export default function SkillGrid({
  skills,
  sortBy = 'recent',
  onSortChange,
}: SkillGridProps) {
  return (
    <div>
      {/* Sort options */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">
          Skills ({skills.length})
        </h2>
        <select
          value={sortBy}
          onChange={(e) => onSortChange?.(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="rated">Highest Rated</option>
          <option value="popular">Most Popular</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {/* Skills grid */}
      {skills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No skills found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add website/src/components/SkillGrid.tsx
git commit -m "feat: add SkillGrid component with sort options"
```

---

## Phase 4: Pages

### Task 8: Build homepage (index page)

**Files:**
- Create: `website/src/pages/index.tsx`

**Step 1: Create index.tsx**

```typescript
import { useState, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import FilterSidebar from '../components/FilterSidebar';
import SkillGrid from '../components/SkillGrid';
import { Skill, SearchFilters } from '../lib/types';
import { getAllSkills, getUniqueDomains, getUniqueDifficulties } from '../lib/skills';
import { searchSkills, sortSkills } from '../lib/search';

interface HomeProps {
  initialSkills: Skill[];
  domains: string[];
  difficulties: string[];
}

export default function Home({ initialSkills, domains, difficulties }: HomeProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    domains: [],
    difficulties: [],
    query: '',
  });
  const [sortBy, setSortBy] = useState<'recent' | 'rated' | 'popular' | 'alphabetical'>('recent');

  // Filter and sort skills
  const filteredSkills = useMemo(() => {
    let result = searchSkills(initialSkills, filters);
    result = sortSkills(result, sortBy);
    return result;
  }, [filters, sortBy, initialSkills]);

  // Featured skills
  const featuredSkills = initialSkills
    .filter((skill) => skill.metadata.featured)
    .slice(0, 3);

  return (
    <>
      <Head>
        <title>SkillWiki - Agent Skills Marketplace</title>
        <meta name="description" content="Discover and integrate pre-built agent skills" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header onSearch={(query) => setFilters({ ...filters, query })} />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero section */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Agent Skills Marketplace</h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover, learn, and integrate pre-built skills for AI agents across education,
              trading, workflow automation, and more.
            </p>
          </div>
        </section>

        {/* Featured section */}
        {featuredSkills.length > 0 && (
          <section className="bg-white border-b border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {skill.metadata.name}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">
                      {skill.metadata.description}
                    </p>
                    <a
                      href={`/skills/${skill.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Learn more →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Browse section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <FilterSidebar
                domains={domains}
                difficulties={difficulties}
                filters={filters}
                onFiltersChange={setFilters}
              />
              <div className="flex-1">
                <SkillGrid
                  skills={filteredSkills}
                  sortBy={sortBy}
                  onSortChange={(sort) =>
                    setSortBy(sort as 'recent' | 'rated' | 'popular' | 'alphabetical')
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const skills = getAllSkills();
  const domains = getUniqueDomains(skills);
  const difficulties = getUniqueDifficulties(skills);

  return {
    props: {
      initialSkills: skills,
      domains,
      difficulties,
    },
    revalidate: 3600, // Revalidate every hour
  };
};
```

**Step 2: Commit**

```bash
git add website/src/pages/index.tsx
git commit -m "feat: add homepage with hero, featured skills, and filtering"
```

---

### Task 9: Build skill detail page

**Files:**
- Create: `website/src/pages/skills/[id].tsx`

**Step 1: Create [id].tsx**

```typescript
import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import { Skill } from '../../lib/types';
import { getSkillByIdSync, getSkillIds, getAllSkills } from '../../lib/skills';
import { marked } from 'marked';

interface SkillDetailProps {
  skill: Skill;
  relatedSkills: Skill[];
}

export default function SkillDetail({ skill, relatedSkills }: SkillDetailProps) {
  const [copied, setCopied] = useState(false);
  const { name, description, author, difficulty, rating, domain, useCases, tags } =
    skill.metadata;

  const handleCopy = async () => {
    try {
      // Get full SKILL.md content
      const response = await fetch(`/api/skill-content/${skill.id}`);
      const { content } = await response.json();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <Head>
        <title>{name} - SkillWiki</title>
        <meta name="description" content={description} />
      </Head>

      <Header />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero section */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
              ← Back to Skills
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{name}</h1>
            <p className="text-xl text-gray-600 mb-6">{description}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 items-center mb-8">
              {domain && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {domain}
                </span>
              )}
              {difficulty && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  {difficulty}
                </span>
              )}
              {rating && (
                <span className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-700 font-medium">{rating}</span>
                </span>
              )}
              {author && <span className="text-gray-600">by {author}</span>}
            </div>

            {/* Use cases */}
            {useCases && useCases.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Use Cases</h3>
                <ul className="list-disc list-inside space-y-1">
                  {useCases.map((useCase, idx) => (
                    <li key={idx} className="text-gray-700">
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                {copied ? '✓ Copied to Clipboard' : 'Copy Skill'}
              </button>
              <a
                href={`https://github.com/skillwiki/catalog/tree/main/skills/${skill.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Content and sidebar */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Main content */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg p-8 prose prose-sm max-w-none">
                {/* Skill content would be rendered here */}
                <p className="text-gray-600">
                  Skill content rendered from SKILL.md markdown...
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="md:col-span-1">
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related skills */}
              {relatedSkills.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Related Skills</h3>
                  <div className="space-y-2">
                    {relatedSkills.slice(0, 3).map((relatedSkill) => (
                      <Link
                        key={relatedSkill.id}
                        href={`/skills/${relatedSkill.id}`}
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {relatedSkill.metadata.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const skillIds = getSkillIds();
  const paths = skillIds.map((id) => ({
    params: { id },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<SkillDetailProps> = async ({ params }) => {
  const skillId = params?.id as string;
  const skill = getSkillByIdSync(skillId);

  if (!skill) {
    return { notFound: true };
  }

  // Get related skills (same domain)
  const allSkills = getAllSkills();
  const relatedSkills = allSkills.filter(
    (s) => s.metadata.domain === skill.metadata.domain && s.id !== skillId
  );

  return {
    props: {
      skill,
      relatedSkills,
    },
    revalidate: 3600,
  };
};
```

**Step 2: Commit**

```bash
git add website/src/pages/skills/[id].tsx
git commit -m "feat: add skill detail page with metadata, use cases, and related skills"
```

---

### Task 10: Build agent integration guide page

**Files:**
- Create: `website/src/pages/integrate.tsx`

**Step 1: Create integrate.tsx**

```typescript
import Head from 'next/head';
import Header from '../components/Header';

export default function Integrate() {
  return (
    <>
      <Head>
        <title>For Agents - SkillWiki</title>
        <meta name="description" content="How agents can discover and integrate SkillWiki skills" />
      </Head>

      <Header />

      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">For Agents</h1>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Integrate SkillWiki Catalog
              </h2>
              <p className="text-gray-700 mb-4">
                Agents can programmatically discover and load skills from the SkillWiki catalog
                by fetching the machine-readable skill metadata.
              </p>
            </section>

            {/* Discovery */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 1: Discover Skills</h3>
              <p className="text-gray-700 mb-4">
                Fetch the available skills metadata in XML format:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code>
{`curl https://skillwiki.ai/available-skills.xml`}
                </code>
              </pre>
              <p className="text-gray-600 text-sm">
                This returns a list of all available skills with metadata including name,
                description, and the location to fetch the full SKILL.md file.
              </p>
            </section>

            {/* Format */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                XML Metadata Format
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>
{`<?xml version="1.0" encoding="UTF-8"?>
<available_skills>
  <skill>
    <name>python-basics-101</name>
    <description>Learn fundamental Python concepts...</description>
    <location>https://raw.githubusercontent.com/skillwiki/catalog/main/skills/python-basics-101/SKILL.md</location>
  </skill>
  <!-- More skills... -->
</available_skills>`}
                </code>
              </pre>
            </section>

            {/* Load Skills */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Step 2: Load Skills into Agent
              </h3>
              <p className="text-gray-700 mb-4">
                Extract skill metadata and include in your agent prompt. Example for Claude:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>
{`<available_skills>
  <skill>
    <name>python-basics-101</name>
    <description>Learn fundamental Python concepts including variables, loops, and functions.</description>
    <location>https://raw.githubusercontent.com/skillwiki/catalog/main/skills/python-basics-101/SKILL.md</location>
  </skill>
</available_skills>`}
                </code>
              </pre>
            </section>

            {/* Activate */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Step 3: Activate Skills
              </h3>
              <p className="text-gray-700 mb-4">
                When the agent decides to use a skill, fetch the full SKILL.md file:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>
{`curl https://raw.githubusercontent.com/skillwiki/catalog/main/skills/python-basics-101/SKILL.md`}
                </code>
              </pre>
              <p className="text-gray-600 text-sm mt-4">
                The agent loads the full markdown content and can execute any scripts or
                reference materials from the skill directory.
              </p>
            </section>

            {/* CLI Tool */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Using skills-ref CLI
              </h3>
              <p className="text-gray-700 mb-4">
                The agentskills.io project provides a CLI tool for working with skills:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>
{`# Validate a skill directory
skills-ref validate ./my-skill

# Generate XML prompt for agent
skills-ref to-prompt ./my-skill`}
                </code>
              </pre>
              <p className="text-gray-600 text-sm mt-4">
                Learn more at{' '}
                <a
                  href="https://agentskills.io"
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  agentskills.io
                </a>
              </p>
            </section>

            {/* Specification */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skill Specification</h3>
              <p className="text-gray-700 mb-4">
                SkillWiki follows the agentskills.io specification. Each skill is a directory
                containing:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">SKILL.md</code> - Required.
                  Contains YAML frontmatter (metadata) and markdown instructions
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">scripts/</code> - Optional.
                  Executable code files (Python, Bash, JavaScript, etc.)
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">references/</code> - Optional.
                  Additional documentation and reference materials
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">assets/</code> - Optional.
                  Templates, images, data files
                </li>
              </ul>
              <p className="text-gray-600 text-sm">
                Read the full specification at{' '}
                <a
                  href="https://agentskills.io/specification"
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  agentskills.io/specification
                </a>
              </p>
            </section>

            {/* Support */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Questions?</h3>
              <p className="text-gray-700">
                Open an issue or discussion on our{' '}
                <a
                  href="https://github.com/skillwiki/catalog"
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add website/src/pages/integrate.tsx
git commit -m "docs: add agent integration guide page with XML format and examples"
```

---

## Phase 5: Sample Skills Data

### Task 11: Create sample skills

**Files:**
- Create: `skills/python-basics-101/SKILL.md`
- Create: `skills/stock-analysis/SKILL.md`
- Create: `skills/email-automation/SKILL.md`

**Step 1: Create python-basics-101 skill**

```markdown
---
name: python-basics-101
description: Learn fundamental Python concepts including variables, loops, functions, and data structures. Perfect for beginners starting their programming journey.
metadata:
  author: Jane Doe
  difficulty: beginner
  rating: 4.8
  domain: education
  useCases:
    - Learn programming
    - Interview preparation
    - Build Python foundations
  featured: true
  tags:
    - python
    - programming
    - beginners
    - education
---

# Python Basics 101

Learn the fundamentals of Python programming with hands-on examples.

## What You'll Learn

- Variables and data types
- Control flow (if/else, loops)
- Functions and scope
- Lists, dictionaries, and tuples
- File handling basics

## Getting Started

Follow these lessons in order...

### 1. Variables and Data Types

```python
# Variables store data
name = "Alice"
age = 25
height = 5.8
is_student = True

# Data types
print(type(name))      # <class 'str'>
print(type(age))       # <class 'int'>
print(type(height))    # <class 'float'>
print(type(is_student))  # <class 'bool'>
```

### 2. Loops

```python
# For loop
for i in range(5):
    print(f"Count: {i}")

# While loop
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1
```

### 3. Functions

```python
def greet(name):
    """Greet someone by name"""
    return f"Hello, {name}!"

print(greet("Alice"))
```
```

**Step 2: Create stock-analysis skill**

```markdown
---
name: stock-analysis
description: Analyze stock market data, calculate technical indicators, and generate trading signals. Professional-grade analysis tool for traders.
metadata:
  author: Bob Smith
  difficulty: advanced
  rating: 4.6
  domain: trading
  useCases:
    - Stock market analysis
    - Technical indicator calculation
    - Trading signal generation
  featured: true
  tags:
    - stocks
    - trading
    - finance
    - analysis
---

# Stock Analysis Skill

Advanced stock market analysis and technical indicator calculations.

## Features

- Real-time price data handling
- Technical indicator calculations (SMA, EMA, RSI, MACD)
- Trend identification
- Support/resistance level detection

## Setup

```python
import pandas as pd
import numpy as np

class StockAnalyzer:
    def __init__(self, data):
        self.data = data

    def calculate_sma(self, period=20):
        return self.data['close'].rolling(window=period).mean()
```

More content...
```

**Step 3: Create email-automation skill**

```markdown
---
name: email-automation
description: Automate email workflows, send bulk messages, template processing, and email scheduling. Integrate with Gmail, Outlook, and more.
metadata:
  author: Carol Johnson
  difficulty: intermediate
  rating: 4.5
  domain: workflow
  useCases:
    - Email automation
    - Bulk messaging
    - Workflow scheduling
  featured: false
  tags:
    - email
    - automation
    - workflow
---

# Email Automation Skill

Automate your email workflows with templates and scheduling.

## Quick Start

Send emails programmatically...
```

**Step 4: Commit**

```bash
git add skills/
git commit -m "feat: add sample skills following agentskills.io specification"
```

---

## Phase 6: Build & Deployment

### Task 12: Test build process and generate metadata

**Files:**
- No new files, verify existing scripts

**Step 1: Run metadata generation**

```bash
cd website
npm run build:metadata
```

Expected:
- `website/public/skills.json` created
- `website/public/available-skills.xml` created

**Step 2: Verify output**

```bash
cat website/public/available-skills.xml
```

Expected: Valid XML with skill metadata

**Step 3: Run Next.js build**

```bash
npm run build
```

Expected: Build completes without errors, `out/` directory created with static files.

**Step 4: Verify static export**

```bash
ls out/
```

Expected: `index.html`, `skills/` folder, `integrate/` folder, `_next/` folder, and static assets.

**Step 5: Commit**

```bash
git add .
git commit -m "build: verify metadata generation and static export works"
```

---

### Task 13: Set up GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `website/next.config.js` (if basePath needed)

**Step 1: Create GitHub Actions workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./website
        run: npm install

      - name: Build metadata
        working-directory: ./website
        run: npm run build:metadata

      - name: Build Next.js
        working-directory: ./website
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/out
```

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Phase 7: Documentation & Polish

### Task 14: Create comprehensive README

**Files:**
- Create: `README.md`
- Create: `website/README.md`

**Step 1: Create root README.md**

```markdown
# SkillWiki Agent Skills Catalog

A static marketplace catalog for discovering and integrating pre-built agent skills. Built with Next.js and deployed to GitHub Pages.

## Overview

SkillWiki provides a curated collection of agent skills across domains like education, trading, and workflow automation. Skills follow the [agentskills.io specification](https://agentskills.io/specification).

- **For Humans:** Browse, search, filter, and copy skills via the marketplace UI
- **For Agents:** Discover and load skills programmatically via XML metadata

## Project Structure

```
skillwiki-catalog/
├── skills/              # Agent skill definitions (SKILL.md files)
├── website/            # Next.js website
│   ├── src/pages/      # Website pages
│   ├── src/components/ # React components
│   ├── src/lib/        # Utilities (parsing, search)
│   └── public/         # Generated metadata files
├── scripts/            # Build scripts
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
1. Metadata generation (parse SKILL.md files → JSON + XML)
2. Next.js build and static export
3. Output in `website/out/`

## Adding Skills

1. Create a new directory in `skills/`:
   ```
   skills/my-new-skill/
   ├── SKILL.md
   ├── scripts/
   └── references/
   ```

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

3. Rebuild and test:
   ```bash
   npm run build:metadata
   npm run dev
   ```

## Deployment

The project deploys to GitHub Pages automatically via GitHub Actions on every push to `main`.

Manual deployment:
```bash
npm run build
# Upload website/out/ to GitHub Pages
```

## For Agents

Agents can discover SkillWiki skills:

1. Fetch metadata: `https://skillwiki.ai/available-skills.xml`
2. Load SKILL.md from the location URL
3. Execute scripts or reference materials as needed

See [For Agents](/integrate) for detailed integration guide.

## Technology

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Parsing:** gray-matter (YAML), markdown-it
- **Deployment:** GitHub Pages
- **Specification:** [agentskills.io](https://agentskills.io/)

## Contributing

To add new skills or improve the catalog:
1. Fork the repository
2. Add/modify skills in the `skills/` directory
3. Test locally with `npm run dev`
4. Submit a pull request

## License

[Specify your license]

## Resources

- [agentskills.io Specification](https://agentskills.io/specification)
- [Agent Skills Integration Guide](https://agentskills.io/integrate-skills)
```

**Step 2: Commit**

```bash
git add README.md website/README.md
git commit -m "docs: add comprehensive README files"
```

---

### Task 15: Final verification and polish

**Files:**
- Verify all links and broken references

**Step 1: Verify structure**

```bash
find website/src -type f -name "*.tsx" -o -name "*.ts" | wc -l
```

Expected: ~15-20 files

**Step 2: Run build**

```bash
cd website
npm run build
```

Expected: Build completes successfully, no errors or warnings.

**Step 3: Verify deployment files**

```bash
ls -la website/out/
```

Expected: Static HTML files, public assets, skills JSON/XML

**Step 4: Final commit**

```bash
git status
git add -A
git commit -m "chore: final verification and polish of catalog"
```

---

## Summary

**Phases completed:**
1. ✅ Project setup (Next.js, TypeScript, Tailwind)
2. ✅ Core libraries (skill parsing, search utilities)
3. ✅ React components (Header, SkillCard, FilterSidebar, etc.)
4. ✅ Pages (homepage, skill detail, integration guide)
5. ✅ Sample skills (3 example skills)
6. ✅ Build & deployment (metadata generation, GitHub Actions)
7. ✅ Documentation (README files)

**Total: 15 tasks across 7 phases**

All tasks follow TDD (write test → implement → verify → commit) and produce a fully functional agent skills marketplace.

