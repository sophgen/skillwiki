import { SearchFilters, Skill } from '../lib/types';
import { getDomainStyle } from '../lib/domains';

interface FilterSidebarProps {
  skills: Skill[];
  domains: string[];
  difficulties: string[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function FilterSidebar({
  skills,
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

  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-sm shadow-zinc-200/50 dark:shadow-soft p-6 lg:p-8 border border-zinc-200/80 dark:border-zinc-800 h-fit sticky top-28 animate-fade-in-up animated-delay-100 overflow-hidden relative transition-colors duration-300">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100">Filters</h2>
        {(filters.domains.length > 0 || filters.difficulties.length > 0) && (
          <button
            onClick={() =>
              onFiltersChange({
                domains: [],
                difficulties: [],
                query: filters.query,
              })
            }
            className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 -m-1"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Domain filter */}
      {domains && domains.length > 0 && (
        <div className="mb-8 relative z-10">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Domain</h3>
          <div className="space-y-3">
            {domains.map((domain) => {
              const count = skills.filter((s) => (s.metadata.domain ?? s.domain) === domain).length;
              const colorClass = getDomainStyle(domain).checkboxClass;
              return (
                <label key={domain} className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                    <input
                      type="checkbox"
                      checked={filters.domains.includes(domain)}
                      onChange={() => handleDomainToggle(domain)}
                      className="peer sr-only"
                    />
                    <div className={`w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 rounded ${colorClass} peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1 transition-all group-hover:border-zinc-400 dark:group-hover:border-zinc-500`}></div>
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors capitalize">{domain}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{count}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Difficulty filter */}
      {difficulties && difficulties.length > 0 && (
        <div className="mb-8 relative z-10">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Difficulty</h3>
          <div className="space-y-3">
            {difficulties.map((difficulty) => {
              const count = skills.filter((s) => s.metadata.difficulty === difficulty).length;
              const colorClass =
                difficulty === 'beginner' ? 'peer-checked:bg-emerald-600 peer-checked:border-emerald-600' :
                  difficulty === 'intermediate' ? 'peer-checked:bg-amber-600 peer-checked:border-amber-600' :
                    difficulty === 'advanced' ? 'peer-checked:bg-emerald-600 peer-checked:border-emerald-600' :
                      'peer-checked:bg-zinc-600 peer-checked:border-zinc-600';
              return (
                <label key={difficulty} className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                    <input
                      type="checkbox"
                      checked={filters.difficulties.includes(difficulty)}
                      onChange={() => handleDifficultyToggle(difficulty)}
                      className="peer sr-only"
                    />
                    <div className={`w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 rounded ${colorClass} peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1 transition-all group-hover:border-zinc-400 dark:group-hover:border-zinc-500`}></div>
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors capitalize">{difficulty}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{count}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Decorative subtle background pattern inside sidebar */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none mask-fade-bottom" />
    </aside>
  );
}
