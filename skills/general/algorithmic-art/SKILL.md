---
name: algorithmic-art
description: Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.
license: Complete terms in LICENSE.txt
metadata:
  author: Anthropic
  difficulty: intermediate
  rating: "4.5"
  domain: general
  use-cases: "generative-art, p5js-art, flow-fields, particle-systems, algorithmic-design"
  featured: "false"
  tags: "art, p5js, generative, algorithmic, interactive, particles, animation"
---

# Algorithmic Art

Algorithmic philosophies are computational aesthetic movements that are then expressed through code. Output .md files (philosophy), .html files (interactive viewer), and .js files (generative algorithms).

This happens in two steps:
1. Algorithmic Philosophy Creation (.md file)
2. Express by creating p5.js generative art (.html + .js files)

## Algorithmic Philosophy Creation

To begin, create an ALGORITHMIC PHILOSOPHY (not static images or templates) that will be interpreted through:
- Computational processes, emergent behavior, mathematical beauty
- Seeded randomness, noise fields, organic systems
- Particles, flows, fields, forces
- Parametric variation and controlled chaos

### The Critical Understanding
- What is received: Some subtle input or instructions by the user
- What is created: An algorithmic philosophy/generative aesthetic movement
- What happens next: The same version receives the philosophy and EXPRESSES IT IN CODE — creating p5.js sketches that are 90% algorithmic generation, 10% essential parameters

### How to Generate an Algorithmic Philosophy

**Name the movement** (1-2 words): "Organic Turbulence" / "Quantum Harmonics" / "Emergent Stillness"

**Articulate the philosophy** (4-6 paragraphs — concise but complete), expressing how the philosophy manifests through:
- Computational processes and mathematical relationships
- Noise functions and randomness patterns
- Particle behaviors and field dynamics
- Temporal evolution and system states
- Parametric variation and emergent complexity

**Critical Guidelines:**
- **Avoid redundancy**: Each algorithmic aspect should be mentioned once
- **Emphasize craftsmanship REPEATEDLY**: The philosophy MUST stress that the final algorithm should appear as though it took countless hours to develop
- **Leave creative space**: Be specific about the algorithmic direction, but concise enough to allow interpretive implementation choices

## Deducing the Conceptual Seed

**CRITICAL STEP**: Before implementing the algorithm, identify the subtle conceptual thread from the original request.

The concept is a **subtle, niche reference embedded within the algorithm itself** — not always literal, always sophisticated. Someone familiar with the subject should feel it intuitively, while others simply experience a masterful generative composition.

## P5.JS Implementation

### ⚠️ Step 0: Read the Template First ⚠️

**CRITICAL: BEFORE writing any HTML:**
1. **Read** `templates/viewer.html` using the Read tool
2. **Study** the exact structure, styling, and Anthropic branding
3. **Use that file as the LITERAL STARTING POINT**

### Technical Requirements

**Seeded Randomness (Art Blocks Pattern)**:
```javascript
// ALWAYS use a seed for reproducibility
let seed = 12345;
randomSeed(seed);
noiseSeed(seed);
```

**Parameter Structure:**
```javascript
let params = {
  seed: 12345,  // Always include seed for reproducibility
  // colors
  // Add parameters that control YOUR algorithm:
  // - Quantities (how many?)
  // - Scales (how big? how fast?)
  // - Probabilities (how likely?)
  // - Ratios (what proportions?)
  // - Angles (what direction?)
};
```

**Canvas Setup:**
```javascript
function setup() {
  createCanvas(1200, 1200);
  // Initialize your system
}

function draw() {
  // Your generative algorithm
  // Can be static (noLoop) or animated
}
```

### Interactive Artifact Creation

Create a single, self-contained HTML artifact. The template's structure has:

**FIXED (always include exactly as shown):**
- Layout structure (header, sidebar, main canvas area)
- Anthropic branding (UI colors, fonts, gradients)
- Seed section: Seed display, Previous/Next/Random/Jump buttons
- Actions section: Regenerate and Reset buttons

**VARIABLE (customize for each artwork):**
- The entire p5.js algorithm (setup/draw/classes)
- The parameters object
- The Parameters section in sidebar (sliders, inputs)
- Colors section (optional)

### Craftsmanship Requirements

Create algorithms that feel like they emerged through countless iterations by a master generative artist. Tune every parameter carefully. Ensure every pattern emerges with purpose.

- **Balance**: Complexity without visual noise, order without rigidity
- **Color Harmony**: Thoughtful palettes, not random RGB values
- **Composition**: Even in randomness, maintain visual hierarchy and flow
- **Performance**: Smooth execution, optimized for real-time if animated
- **Reproducibility**: Same seed ALWAYS produces identical output

### Output Format

Output:
1. **Algorithmic Philosophy** — As a .md file explaining the generative aesthetic
2. **Single HTML Artifact** — Self-contained interactive generative art built from `templates/viewer.html`

## Resources

- **templates/viewer.html**: REQUIRED STARTING POINT for all HTML artifacts
- **templates/generator_template.js**: Reference for p5.js best practices and code structure principles

> **Source**: This skill is sourced from [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/algorithmic-art) on GitHub. Templates are bundled in the full skill download.
