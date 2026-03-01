import { useState, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import FilterSidebar from '../components/FilterSidebar';
import SkillGrid from '../components/SkillGrid';
import { Skill, SearchFilters } from '../lib/types';
import { getAllSkills } from '../lib/skills';
import { searchSkills, sortSkills, getUniqueDomains, getUniqueDifficulties } from '../lib/search';

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
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical'>('default');
  const [showFilters, setShowFilters] = useState(false);

  const filteredSkills = useMemo(() => {
    let result = searchSkills(initialSkills, filters);
    result = sortSkills(result, sortBy);
    return result;
  }, [filters, sortBy, initialSkills]);

  return (
    <>
      <Head>
        <title>SkillWiki — Agent Skills Marketplace</title>
        <meta name="description" content="Discover and integrate pre-built agent skills" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header onSearch={(query) => setFilters({ ...filters, query })} skills={initialSkills} />

      <main className="bg-zinc-50 dark:bg-zinc-950 min-h-screen relative overflow-hidden font-sans transition-colors duration-300">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" style={{ backgroundPosition: 'center top' }} />

        {/* Hero section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-zinc-800 bg-zinc-950 dark:bg-zinc-950">
          {/* Subtle mesh/pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBoOHY4SDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] mix-blend-overlay"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none animate-subtle-pulse">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-600 to-transparent blur-[100px] rounded-full mix-blend-screen" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 mb-8 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-zinc-300 uppercase">SkillWiki Beta is Live</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-6 tracking-tight text-balance mx-auto drop-shadow-sm">
              Supercharge your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-cyan-200">AI Agents</span> Instantly
            </h1>
            <p className="text-lg lg:text-xl text-zinc-400 mb-6 max-w-2xl mx-auto leading-relaxed text-balance">
              Discover, learn, and integrate pre-built skills for AI agents{domains.length > 0 ? ` across ${domains.join(', ')}` : ''}, and more.
            </p>
            {domains.length > 0 ? (
              <p className="text-sm font-semibold text-brand-300 mb-10 tracking-wide uppercase">
                Join {initialSkills.length}+ skills across {domains.length} domains
              </p>
            ) : initialSkills.length > 0 ? (
              <p className="text-sm font-semibold text-brand-300 mb-10 tracking-wide uppercase">
                Join {initialSkills.length}+ skills
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/integrate" className="w-full sm:w-auto px-8 py-3.5 bg-brand-500 text-white rounded-xl font-mono text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
                Start Integrating
              </a>
              <button
                onClick={() => {
                  document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-zinc-300 border border-zinc-700/80 rounded-xl font-mono text-sm shadow-sm hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600/80 transition-all backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 hover:-translate-y-0.5"
              >
                Browse Skills
              </button>
            </div>
          </div>
        </section>

        {/* Browse section */}
        <section id="browse" className="py-24 relative z-10 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="flex flex-col lg:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
                >
                  <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <FilterSidebar
                  skills={initialSkills}
                  domains={domains}
                  difficulties={difficulties}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
              <div className="flex-1 min-w-0">
                <SkillGrid
                  skills={filteredSkills}
                  sortBy={sortBy}
                    onSortChange={(sort) =>
                    setSortBy(sort as 'default' | 'alphabetical')
                  }
                  gridCols="lg:grid-cols-3"
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

  // Strip full content from homepage to reduce static JSON size
  const initialSkills = skills.map(({ content, ...rest }) => ({
    ...rest,
    content: '',
  }));

  return {
    props: {
      initialSkills,
      domains,
      difficulties,
    },
  };
};
