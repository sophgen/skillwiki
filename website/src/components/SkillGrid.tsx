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
