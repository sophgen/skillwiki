---
# TEMPLATE FILE: Not a real skill. Copy to skills/{domain}/your-skill-name/ and update.
# Required: Must match the skill directory name (e.g., your-skill-name), NOT the full path.
# Place under a domain folder (e.g. development, automation, general — any lowercase name works).
name: your-skill-name-here

# Required: 1-1024 characters. Describe what the skill does AND when to use it.
# Include specific keywords that help agents identify relevant tasks.
description: A clear description of what this skill does. Use when a user wants to [specific task], needs help with [topic], or asks about [keywords].

# Optional: License name or reference to a bundled license file.
license: MIT

# Optional: Only include if your skill has specific environment requirements.
# Examples: "Requires git, docker, jq" or "Designed for Claude Code"
# Omit this field if the skill works in any environment.
# compatibility: Requires python3 and pip

# Optional: A map of string keys to string values (per agentskills.io spec).
# All values must be strings — use quotes around numbers, booleans, and lists.
metadata:
  author: Your Name
  difficulty: beginner  # beginner | intermediate | advanced
  rating: "4.0"
  domain: your-domain    # Must match the parent directory name under skills/
  use-cases: "use-case-1, use-case-2"
  featured: "false"
  tags: "tag1, tag2"
---

# Skill Title

Introduction to your skill. Explain what it does and how to use it.

## Features

- Feature 1
- Feature 2

## Usage

Step-by-step instructions for using this skill.

## Examples

Provide concrete examples with code if applicable.
