import { Skill } from '../lib/types';
import SkillCard from './SkillCard';

interface SkillGridProps {
  skills: Skill[];
  sortBy?: 'default' | 'rated' | 'popular' | 'alphabetical';
  onSortChange?: (sort: string) => void;
  gridCols?: string;
}

export default function SkillGrid({
  skills,
  sortBy = 'default',
  onSortChange,
  gridCols = 'lg:grid-cols-3',
}: SkillGridProps) {
  return (
    <div className="animate-fade-in-up">
      {/* Sort options */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm shadow-zinc-200/50 dark:shadow-soft transition-colors">
        <h2 className="text-lg font-display font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          All Skills
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 font-sans font-bold">
            {skills.length} RESULTS
          </span>
        </h2>
        <div className="relative group min-w-[180px]">
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="appearance-none w-full pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-sm transition-all"
          >
            <option value="default">Default</option>
            <option value="rated">Highest Rated</option>
            <option value="popular">Most Popular</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      {skills.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed animate-fade-in-up transition-colors">
          <div className="mx-auto mb-6 w-32 h-32 relative flex items-center justify-center opacity-60">
            <svg className="w-full h-full text-zinc-200 dark:text-zinc-800/50 absolute" fill="currentColor" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" />
            </svg>
            <svg className="w-12 h-12 text-zinc-400 dark:text-zinc-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100 mb-2">No skills found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm mb-6">We couldn't find any skills matching your current filters. Try adjusting your search query or clear the filters.</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6`}>
          {skills.map((skill, index) => (
            <div key={skill.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min((index % 12) * 50, 600)}ms` }}>
              <SkillCard skill={skill} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
