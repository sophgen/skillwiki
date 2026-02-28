import { useState, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import FilterSidebar from '../components/FilterSidebar';
import SkillGrid from '../components/SkillGrid';
import { Skill, SearchFilters } from '../lib/types';
import { getAllSkills, getUniqueDomains, getUniqueDifficulties } from '../lib/skills';
import { searchSkills, sortSkills } from '../lib/search';

interface HomeProps {
  initialSkills: Skill[];
  domains: string[];
  difficulties: string[];
}

export default function Home({ initialSkills, domains, difficulties }: HomeProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    domains: [],
    difficulties: [],
    query: '',
  });
  const [sortBy, setSortBy] = useState<'recent' | 'rated' | 'popular' | 'alphabetical'>('recent');

  // Filter and sort skills
  const filteredSkills = useMemo(() => {
    let result = searchSkills(initialSkills, filters);
    result = sortSkills(result, sortBy);
    return result;
  }, [filters, sortBy, initialSkills]);

  // Featured skills
  const featuredSkills = initialSkills
    .filter((skill) => skill.metadata.featured)
    .slice(0, 3);

  return (
    <>
      <Head>
        <title>SkillWiki - Agent Skills Marketplace</title>
        <meta name="description" content="Discover and integrate pre-built agent skills" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header onSearch={(query) => setFilters({ ...filters, query })} />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero section */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Agent Skills Marketplace</h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover, learn, and integrate pre-built skills for AI agents across education,
              trading, workflow automation, and more.
            </p>
          </div>
        </section>

        {/* Featured section */}
        {featuredSkills.length > 0 && (
          <section className="bg-white border-b border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {skill.metadata.name}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">
                      {skill.metadata.description}
                    </p>
                    <a
                      href={`/skills/${skill.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Learn more →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Browse section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <FilterSidebar
                domains={domains}
                difficulties={difficulties}
                filters={filters}
                onFiltersChange={setFilters}
              />
              <div className="flex-1">
                <SkillGrid
                  skills={filteredSkills}
                  sortBy={sortBy}
                  onSortChange={(sort) =>
                    setSortBy(sort as 'recent' | 'rated' | 'popular' | 'alphabetical')
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const skills = getAllSkills();
  const domains = getUniqueDomains(skills);
  const difficulties = getUniqueDifficulties(skills);

  return {
    props: {
      initialSkills: skills,
      domains,
      difficulties,
    },
  };
};
