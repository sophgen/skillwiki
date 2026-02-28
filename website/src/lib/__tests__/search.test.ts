import { searchSkills, sortSkills } from '../search';
import { Skill } from '../types';

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    metadata: {
      name: 'Python Basics',
      description: 'Learn Python',
      domain: 'education',
      difficulty: 'beginner',
      rating: 4.5,
      tags: ['python', 'programming'],
    },
    content: '',
  },
  {
    id: 'skill-2',
    metadata: {
      name: 'Stock Trading',
      description: 'Trade stocks',
      domain: 'trading',
      difficulty: 'advanced',
      rating: 4.8,
      tags: ['stocks', 'finance'],
    },
    content: '',
  },
];

describe('searchSkills', () => {
  test('filters by domain', () => {
    const result = searchSkills(mockSkills, { domains: ['education'], difficulties: [], query: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('skill-1');
  });

  test('filters by difficulty', () => {
    const result = searchSkills(mockSkills, { domains: [], difficulties: ['advanced'], query: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('skill-2');
  });

  test('searches by text', () => {
    const result = searchSkills(mockSkills, { domains: [], difficulties: [], query: 'python' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('skill-1');
  });
});

describe('sortSkills', () => {
  test('sorts by rating', () => {
    const result = sortSkills(mockSkills, 'rated');
    expect(result[0].metadata.rating).toBeGreaterThanOrEqual(result[1].metadata.rating!);
  });

  test('sorts alphabetically', () => {
    const result = sortSkills(mockSkills, 'alphabetical');
    expect(result[0].metadata.name < result[1].metadata.name).toBe(true);
  });
});
