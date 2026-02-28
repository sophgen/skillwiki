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
