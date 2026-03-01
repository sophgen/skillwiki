/**
 * Dynamic domain styling — works for any domain name discovered at build time.
 *
 * Styling is resolved in order:
 *   1. config.json  DOMAIN_OVERRIDES.{domain}.icon  — lets you pin an emoji per domain
 *   2. Deterministic palette assignment via hash  — automatic, consistent, zero-config
 *
 * Because Tailwind purges classes at build time, all color classes must be declared
 * statically in the palette below. Icon overrides from config.json are safe because
 * emojis are plain text, not class names.
 */

import sharedConfig from '../../../config.json';

export interface DomainStyle {
  /** Tailwind text-color classes for the domain label */
  color: string;
  /** Tailwind background classes for domain badges */
  bg: string;
  /** Emoji icon for the domain */
  icon: string;
  /** Tailwind border-top color class for the skill card accent */
  border: string;
  /** Tailwind border color class for domain badges */
  badgeBorder: string;
  /** Tailwind classes for checked state of filter checkboxes */
  checkboxClass: string;
}

// Static palette — all class strings declared here so Tailwind includes them in the bundle.
const DOMAIN_PALETTE: DomainStyle[] = [
  { color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/20',       icon: '⚡',  border: 'border-t-blue-500',    badgeBorder: 'border-blue-200/50 dark:border-blue-800/50',    checkboxClass: 'peer-checked:bg-blue-600 peer-checked:border-blue-600'    },
  { color: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-900/20',   icon: '💻',  border: 'border-t-purple-500',  badgeBorder: 'border-purple-200/50 dark:border-purple-800/50',  checkboxClass: 'peer-checked:bg-purple-600 peer-checked:border-purple-600'  },
  { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '🌿',  border: 'border-t-emerald-500', badgeBorder: 'border-emerald-200/50 dark:border-emerald-800/50', checkboxClass: 'peer-checked:bg-emerald-600 peer-checked:border-emerald-600' },
  { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     icon: '✨',  border: 'border-t-amber-500',   badgeBorder: 'border-amber-200/50 dark:border-amber-800/50',   checkboxClass: 'peer-checked:bg-amber-600 peer-checked:border-amber-600'   },
  { color: 'text-cyan-600 dark:text-cyan-400',       bg: 'bg-cyan-50 dark:bg-cyan-900/20',       icon: '🔄',  border: 'border-t-cyan-500',    badgeBorder: 'border-cyan-200/50 dark:border-cyan-800/50',    checkboxClass: 'peer-checked:bg-cyan-600 peer-checked:border-cyan-600'    },
  { color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-900/20',       icon: '🔥',  border: 'border-t-rose-500',    badgeBorder: 'border-rose-200/50 dark:border-rose-800/50',    checkboxClass: 'peer-checked:bg-rose-600 peer-checked:border-rose-600'    },
  { color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-50 dark:bg-indigo-900/20',   icon: '🧩',  border: 'border-t-indigo-500',  badgeBorder: 'border-indigo-200/50 dark:border-indigo-800/50',  checkboxClass: 'peer-checked:bg-indigo-600 peer-checked:border-indigo-600'  },
  { color: 'text-teal-600 dark:text-teal-400',       bg: 'bg-teal-50 dark:bg-teal-900/20',       icon: '🛠️',  border: 'border-t-teal-500',    badgeBorder: 'border-teal-200/50 dark:border-teal-800/50',    checkboxClass: 'peer-checked:bg-teal-600 peer-checked:border-teal-600'    },
];

/** Fallback used when domain is unknown / empty */
const FALLBACK_STYLE: DomainStyle = {
  color: 'text-zinc-600 dark:text-zinc-400',
  bg: 'bg-zinc-50 dark:bg-zinc-900/50',
  icon: '🔧',
  border: 'border-t-zinc-500',
  badgeBorder: 'border-zinc-200/50 dark:border-zinc-800/50',
  checkboxClass: 'peer-checked:bg-zinc-600 peer-checked:border-zinc-600',
};

/**
 * Optional per-domain overrides from config.json.
 * Example:  "DOMAIN_OVERRIDES": { "development": { "icon": "💻" }, "trading": { "icon": "📈" } }
 */
const overrides: Record<string, { icon?: string }> =
  (sharedConfig as Record<string, unknown>).DOMAIN_OVERRIDES as Record<string, { icon?: string }> ?? {};

/**
 * Deterministic hash so the same domain always maps to the same palette entry,
 * regardless of what other domains exist.
 */
function domainHash(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = Math.imul(31, h) + domain.charCodeAt(i);
    h |= 0; // convert to 32-bit int
  }
  return Math.abs(h);
}

/**
 * Returns styling for any domain name.
 *
 * - Icon can be pinned via config.json DOMAIN_OVERRIDES.{domain}.icon
 * - Color palette is assigned automatically via hash (Tailwind-safe)
 * - Unknown / new domains get a style with no code changes required
 */
export function getDomainStyle(domain?: string | null): DomainStyle {
  if (!domain) return FALLBACK_STYLE;
  const key = domain.toLowerCase().trim();
  if (!key) return FALLBACK_STYLE;

  const base = DOMAIN_PALETTE[domainHash(key) % DOMAIN_PALETTE.length];
  const domainOverride = overrides[key];

  if (domainOverride?.icon) {
    return { ...base, icon: domainOverride.icon };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Difficulty styling — same approach: static palette with hash-based fallback
// ---------------------------------------------------------------------------

/**
 * Palette of Tailwind class bundles for difficulty badges.
 * Index 0-2 are the "known" difficulties; the rest serve as fallback for
 * any new difficulty values introduced in SKILL.md without code changes.
 */
const DIFFICULTY_PALETTE: string[] = [
  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
  'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
  'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/50',
  'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/50',
];

/** Well-known difficulties pinned to fixed palette positions for visual consistency. */
const KNOWN_DIFFICULTY: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const DIFFICULTY_FALLBACK = 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

/**
 * Returns Tailwind classes for a difficulty badge.
 * Known values (beginner/intermediate/advanced) always get the same color.
 * Unknown values are automatically assigned from the palette via hash.
 */
export function getDifficultyStyle(difficulty?: string | null): string {
  if (!difficulty) return DIFFICULTY_FALLBACK;
  const key = difficulty.toLowerCase().trim();
  if (!key) return DIFFICULTY_FALLBACK;

  if (key in KNOWN_DIFFICULTY) {
    return DIFFICULTY_PALETTE[KNOWN_DIFFICULTY[key]];
  }
  return DIFFICULTY_PALETTE[domainHash(key) % DIFFICULTY_PALETTE.length];
}
