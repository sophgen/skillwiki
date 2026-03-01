import { Skill } from '../lib/types';
import Link from 'next/link';
import { getDomainStyle, getDifficultyStyle } from '../lib/domains';

interface SkillCardProps {
  skill: Skill;
  style?: React.CSSProperties;
  className?: string;
}

export default function SkillCard({ skill, style, className = '' }: SkillCardProps) {
  const { name: rawName, description, domain, difficulty, author, tags } = skill.metadata;

  // Format slug-like names to human readable
  const name = rawName.includes('-') && !rawName.includes(' ')
    ? rawName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : rawName;

  const dConfig = getDomainStyle(domain);

  return (
    <div
      className={`group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 border-t-4 ${dConfig.border} p-8 flex flex-col h-full hover:shadow-glow shadow-sm shadow-zinc-200/50 dark:shadow-soft hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/10 dark:group-hover:bg-brand-500/20 transition-colors pointer-events-none" />

      {/* Domain badge with icon */}
      {domain && (
        <div className="mb-5 flex items-center">
          <span className={`inline-flex items-center px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 ${dConfig.color} rounded-md text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 shadow-sm gap-1.5`}>
            <span className="text-xs">{dConfig.icon}</span>
            {domain}
          </span>
        </div>
      )}

      {/* Name and description */}
      <Link href={`/skills/${skill.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg -m-1 p-1 mb-2">
        <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
          {name}
        </h3>
      </Link>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">
        {description.substring(0, 120)}{description.length > 120 ? '...' : ''}
      </p>

      {/* Metadata row */}
      <div className="flex items-center justify-between text-sm mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {difficulty && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border ${getDifficultyStyle(difficulty)}`}
            >
              {difficulty.toUpperCase()}
            </span>
          )}
        </div>
        {author && <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-semibold">BY {author.toUpperCase()}</span>}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action - copy full skill from detail page */}
      <div className="flex gap-3 mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800 relative z-10">
        <Link
          href={`/skills/${skill.id}`}
          className="flex-1 px-4 py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl hover:bg-brand-700 dark:hover:bg-brand-600 hover:shadow-glow text-xs font-mono font-bold uppercase tracking-wide transition-all text-center flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
        >
          View Details
        </Link>
        <a
          href={`/skills/${skill.id}.zip`}
          download
          title="Export Agent Skill (.zip)"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 group-hover:border-zinc-300 dark:group-hover:border-zinc-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>
    </div>
  );
}
