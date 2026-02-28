# Contributing to SkillWiki

Thank you for contributing to the SkillWiki catalog! This guide explains how to add a new skill.

## Adding a New Skill

### 1. Create Your Skill Directory

Create a new folder under `skills/{domain}/` with a lowercase, hyphenated name that describes your skill:

```
skills/
  {domain}/
    my-awesome-skill/
      SKILL.md
```

- The skill directory name **must** exactly match the `name` field in your SKILL.md frontmatter.
- The skill must be placed under a valid **domain** folder. Valid domains: `automation`, `education`, `trading`, `development`, `workflow`, `general`.
- The `domain` in your frontmatter must match the domain directory name.

### 2. Use the Template

Copy `skills/_template/SKILL.md` as a starting point. All fields are documented there.

**Required fields:**
- `name` — Must match directory name; 1–64 chars; lowercase; alphanumeric + hyphens only; no consecutive hyphens
- `description` — 1–1024 characters; non-empty

**Recommended (agentskills.io spec):**
- `license` — e.g. `MIT`, `Apache-2.0`
- `compatibility` — e.g. `cursor`, `claude-code`, `generic`

**Optional catalog fields** (under `metadata:`):
- `author`
- `difficulty` — `beginner` | `intermediate` | `advanced`
- `rating` — 0–5
- `domain` — `automation` | `education` | `trading` | `development` | `workflow` | `general`
- `useCases` — list of strings
- `featured` — boolean
- `tags` — list of strings

### 3. Validate Locally

From the repo root:

```bash
cd website && npm run build:metadata
```

If validation fails, fix the reported errors before pushing.

### 4. Submit Your Change

1. `git add skills/{domain}/my-awesome-skill/`
2. `git commit -m "Add my-awesome-skill"`
3. Push to your fork and open a pull request

GitHub Actions will validate all skills, rebuild the site, and deploy on merge to `main`.

## Spec Reference

Skill format follows the [agentskills.io specification](https://agentskills.io/specification).

### SkillWiki Metadata Extension

The agentskills.io spec defines `metadata` as a map of string keys to string values. SkillWiki extends this for catalog usability:

- **Arrays** (`useCases`, `tags`) — used for filtering, search, and display
- **Booleans** (`featured`) — used for homepage curation
- **Numbers** (`rating`) — used for sort and badges

This extension is a pragmatic tradeoff. If strict spec compliance is required for your use case, serialize values as comma-separated strings (e.g. `tags: "python,programming,beginners"`).
