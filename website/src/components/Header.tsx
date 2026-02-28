import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Skill } from '../lib/types';

interface HeaderProps {
  onSearch?: (query: string) => void;
  skills?: Skill[];
}

export default function Header({ onSearch, skills = [] }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const isHome = router.pathname === '/';
  const isDarkContext = isHome && !scrolled;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const getFilteredSkills = () => {
    if (!query) return [];
    const q = query.toLowerCase();
    return skills.filter(skill =>
      skill.metadata.name.toLowerCase().includes(q) ||
      skill.metadata.domain?.toLowerCase().includes(q) ||
      skill.metadata.tags?.some(tag => tag.toLowerCase().includes(q))
    ).slice(0, 5);
  };

  const filteredSkills = getFilteredSkills();
  const showDropdown = isFocused && query.length > 0 && skills.length > 0;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
        ? 'bg-zinc-50/80 dark:bg-black/50 backdrop-blur-md border-indigo-100/50 dark:border-white/10 shadow-sm dark:shadow-soft py-3'
        : 'bg-transparent border-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20 text-white flex items-center justify-center font-display font-bold text-xl group-hover:shadow-brand-500/40 group-hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wIDBoNHY0SDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className={`text-xl font-display font-bold leading-none tracking-tight transition-colors ${isDarkContext
                ? 'text-white group-hover:text-brand-400'
                : 'text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400'
                }`}>
                SkillWiki
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-500 mt-1">Agent Skills</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-8 group relative hidden md:block" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search skills by name, tag, or domain..."
              value={query}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              className="w-full pl-11 pr-10 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full focus:bg-white dark:focus:bg-zinc-900 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 text-sm font-medium transition-all outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); onSearch?.(''); }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up">
                {filteredSkills.length > 0 ? (
                  <ul className="max-h-80 overflow-y-auto py-2 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {filteredSkills.map((skill) => (
                      <li key={skill.id}>
                        <Link
                          href={`/skills/${skill.id}`}
                          onClick={() => {
                            setIsFocused(false);
                            if (!isHome) setQuery('');
                          }}
                          className="flex flex-col px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors outline-none focus:bg-zinc-50 dark:focus:bg-zinc-800/80"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{skill.metadata.name}</span>
                            {skill.metadata.domain && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                                {skill.metadata.domain}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {skill.metadata.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    No skills found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1 ${router.pathname === '/' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              Home
            </Link>
            <Link
              href="/integrate"
              className={`text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1 ${router.pathname === '/integrate' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              Integration Guide
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            )}

            <a
              href="https://github.com/skillwiki/catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-white/10 px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              <span>GitHub</span>
            </a>
          </nav>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-md absolute w-full left-0 p-4 shadow-lg flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search skills..."
              value={query}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
            />

            {/* Mobile Dropdown */}
            {query && skills.length > 0 && (
              <div className="mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-md overflow-hidden animate-fade-in-up">
                {filteredSkills.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {filteredSkills.map((skill) => (
                      <li key={skill.id}>
                        <Link
                          href={`/skills/${skill.id}`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (!isHome) setQuery('');
                          }}
                          className="flex flex-col px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{skill.metadata.name}</span>
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {skill.metadata.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                    No skills found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-semibold px-2 py-1.5 rounded-lg ${router.pathname === '/' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10' : 'text-zinc-700 dark:text-zinc-300'}`}
          >
            Home
          </Link>
          <Link
            href="/integrate"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-semibold px-2 py-1.5 rounded-lg ${router.pathname === '/integrate' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10' : 'text-zinc-700 dark:text-zinc-300'}`}
          >
            Integration Guide
          </Link>
          <a
            href="https://github.com/skillwiki/catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            GitHub
          </a>
        </div>
      )}
    </header>
  );
}
