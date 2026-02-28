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
      // For now, copy the markdown content
      const content = `---\nname: ${skill.id}\ndescription: ${description}\n---\n\n${skill.content}`;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const difficultyColors: Record<string, string> = {
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
                difficultyColors[difficulty] || 'bg-gray-100 text-gray-800'
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
