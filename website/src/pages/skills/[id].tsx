import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import MarkdownIt from 'markdown-it';
import Header from '../../components/Header';
import { Skill } from '../../lib/types';
import { getSkillByIdSync, getSkillIds, getAllSkills } from '../../lib/skills';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

interface SkillDetailProps {
  skill: Skill;
  relatedSkills: Skill[];
}

export default function SkillDetail({ skill, relatedSkills }: SkillDetailProps) {
  const [copied, setCopied] = useState(false);
  const { name: rawName, description, author, difficulty, rating, domain, useCases, tags } = skill.metadata;

  // Format slug-like names to human readable
  const name = rawName.includes('-') && !rawName.includes(' ')
    ? rawName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : rawName;

  const htmlContent = md.render(skill.content);

  const difficultyStyles: Record<string, string> = {
    beginner: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
    intermediate: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    advanced: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
  };

  const domainConfig: Record<string, { color: string, bg: string, border: string }> = {
    automation: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200/50 dark:border-blue-800/50' },
    education: { color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200/50 dark:border-green-800/50' },
    trading: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200/50 dark:border-amber-800/50' },
    development: { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200/50 dark:border-purple-800/50' },
    general: { color: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-zinc-50 dark:bg-zinc-900/50', border: 'border-zinc-200/50 dark:border-zinc-800/50' }
  };

  const getDomainConfig = (d: string) => {
    return domainConfig[d.toLowerCase()] || domainConfig.general;
  };
  const dConfig = domain ? getDomainConfig(domain) : domainConfig.general;

  const handleCopy = async () => {
    try {
      // Create full SKILL.md content
      let content = `---\nname: ${skill.metadata.name}\ndescription: ${skill.metadata.description}\n`;

      if (author) content += `metadata:\n  author: ${author}\n`;
      if (difficulty) content += `  difficulty: ${difficulty}\n`;
      if (rating) content += `  rating: ${rating}\n`;
      if (domain) content += `  domain: ${domain}\n`;

      content += `---\n\n${skill.content}`;

      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <Head>
        <title>{name} - SkillWiki</title>
        <meta name="description" content={description} />
      </Head>

      <Header />

      <main className="bg-zinc-50 dark:bg-zinc-950 min-h-screen pt-20 transition-colors duration-300">
        {/* Background gradient */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand-50 to-zinc-50 dark:from-brand-500/10 dark:to-zinc-950 pointer-events-none" />

        {/* Hero section */}
        <section className="relative z-10 pt-12 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="flex mb-8" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm font-medium">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                    Skills
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    <span className="ml-1 text-zinc-400 dark:text-zinc-500 md:ml-2 capitalize">{domain}</span>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    <span className="ml-1 text-zinc-900 dark:text-zinc-100 font-semibold md:ml-2">{name}</span>
                  </div>
                </li>
              </ol>
            </nav>

            <h1 className="text-4xl lg:text-5xl font-display font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">{name}</h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-3xl leading-relaxed">{description}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 items-center mb-10">
              {domain && (
                <span className={`inline-flex items-center px-3 py-1.5 ${dConfig.bg} ${dConfig.color} border ${dConfig.border} rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm`}>
                  {domain}
                </span>
              )}
              {difficulty && (
                <span className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm ${difficultyStyles[difficulty.toLowerCase()] || difficultyStyles.beginner}`}>
                  {difficulty}
                </span>
              )}
              {rating && (
                <span className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm text-zinc-700 dark:text-zinc-300">
                  <span className="text-yellow-500 mr-1.5 text-sm">★</span>
                  <span>{rating.toFixed(1)} Rating</span>
                </span>
              )}
              {author && (
                <span className="inline-flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg text-xs font-bold tracking-widest shadow-sm">
                  BY <span className="ml-1 text-zinc-900 dark:text-zinc-100">{author.toUpperCase()}</span>
                </span>
              )}
            </div>

            {/* Use cases */}
            {useCases && useCases.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-300 mb-3">Use Cases</h3>
                <ul className="list-disc list-inside space-y-1">
                  {useCases.map((useCase, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-zinc-400">
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleCopy}
                className={`px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 flex items-center gap-2 ${copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 shadow-lg shadow-brand-600/20'
                  }`}
              >
                {copied ? (
                  <>✓ Copied to Clipboard</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy Prompt
                  </>
                )}
              </button>
              <a
                href={`https://github.com/skillwiki/catalog/tree/main/skills/${skill.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 font-bold text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Content and sidebar */}
        <section className="pb-24 relative z-10 w-full mt-[-2rem]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="lg:w-2/3">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft border border-zinc-200/80 dark:border-zinc-800/80 p-8 lg:p-12 prose prose-zinc dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-700 dark:hover:prose-a:text-brand-300 max-w-none prose-pre:bg-zinc-900 prose-pre:shadow-inner prose-img:rounded-xl">
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/3">
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft border border-zinc-200/80 dark:border-zinc-800/80 p-6 mb-8 transition-colors">
                  <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-100 mb-4 text-lg">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors rounded-lg text-xs font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related skills */}
              {relatedSkills.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft border border-zinc-200/80 dark:border-zinc-800/80 p-6 sticky top-28 transition-colors">
                  <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-100 mb-4 text-lg">Related Skills</h3>
                  <div className="space-y-4">
                    {relatedSkills.slice(0, 4).map((relatedSkill) => (
                      <Link
                        key={relatedSkill.id}
                        href={`/skills/${relatedSkill.id}`}
                        className="group block"
                      >
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1 text-sm">{relatedSkill.metadata.name}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{relatedSkill.metadata.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const skillIds = getSkillIds();
  const paths = skillIds.map((id) => ({
    params: { id },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<SkillDetailProps> = async ({ params }) => {
  const skillId = params?.id as string;
  const skill = getSkillByIdSync(skillId);

  if (!skill) {
    return { notFound: true };
  }

  // Get related skills (same domain)
  const allSkills = getAllSkills();
  const relatedSkills = allSkills.filter(
    (s) => s.metadata.domain === skill.metadata.domain && s.id !== skillId
  );

  return {
    props: {
      skill,
      relatedSkills,
    },
  };
};
