import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import { Skill } from '../../lib/types';
import { getSkillByIdSync, getSkillIds, getAllSkills } from '../../lib/skills';

interface SkillDetailProps {
  skill: Skill;
  relatedSkills: Skill[];
}

export default function SkillDetail({ skill, relatedSkills }: SkillDetailProps) {
  const [copied, setCopied] = useState(false);
  const { name, description, author, difficulty, rating, domain, useCases, tags } =
    skill.metadata;

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

      <main className="bg-gray-50 min-h-screen">
        {/* Hero section */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
              ← Back to Skills
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{name}</h1>
            <p className="text-xl text-gray-600 mb-6">{description}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 items-center mb-8">
              {domain && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {domain}
                </span>
              )}
              {difficulty && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  {difficulty}
                </span>
              )}
              {rating && (
                <span className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-700 font-medium">{rating}</span>
                </span>
              )}
              {author && <span className="text-gray-600">by {author}</span>}
            </div>

            {/* Use cases */}
            {useCases && useCases.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Use Cases</h3>
                <ul className="list-disc list-inside space-y-1">
                  {useCases.map((useCase, idx) => (
                    <li key={idx} className="text-gray-700">
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                {copied ? '✓ Copied to Clipboard' : 'Copy Skill'}
              </button>
              <a
                href={`https://github.com/skillwiki/catalog/tree/main/skills/${skill.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Content and sidebar */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Main content */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg p-8 prose prose-sm max-w-none">
                <div className="text-gray-600 whitespace-pre-wrap">
                  {skill.content.substring(0, 500)}...
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Full content available on GitHub or when installed in your agent platform.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="md:col-span-1">
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related skills */}
              {relatedSkills.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Related Skills</h3>
                  <div className="space-y-2">
                    {relatedSkills.slice(0, 3).map((relatedSkill) => (
                      <Link
                        key={relatedSkill.id}
                        href={`/skills/${relatedSkill.id}`}
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {relatedSkill.metadata.name}
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
    revalidate: 3600,
  };
};
