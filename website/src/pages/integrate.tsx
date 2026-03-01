import Head from 'next/head';
import Header from '../components/Header';

export default function Integrate() {
  return (
    <>
      <Head>
        <title>Integration Guide - SkillWiki</title>
        <meta name="description" content="How agents can discover and integrate SkillWiki skills" />
      </Head>

      <Header />

      <main className="bg-zinc-50 dark:bg-zinc-950 min-h-screen pt-32 pb-16 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">Integration Guide</h1>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm dark:shadow-soft border border-zinc-200/80 dark:border-zinc-800/80 p-8 md:p-12 space-y-10 transition-colors">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Integrate SkillWiki Catalog
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mb-4">
                Agents can programmatically discover and load skills from the SkillWiki catalog
                by fetching the machine-readable skill metadata.
              </p>
            </section>

            {/* Discovery */}
            <section>
              <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100 mb-4">Step 1: Discover Skills</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Fetch the available skills metadata in XML format:
              </p>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-300 p-5 rounded-xl border border-zinc-800 dark:border-zinc-800/80 shadow-inner overflow-x-auto mb-4 text-sm font-mono">
                <code>
                  {`curl https://skillwiki.ai/available-skills.xml`}
                </code>
              </pre>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4">
                This returns a list of all available skills with metadata including name,
                description, and the location to fetch the full SKILL.md file.
              </p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                XML Metadata Format
              </h3>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-300 p-4 rounded-lg overflow-x-auto border border-zinc-800 dark:border-zinc-800/80">
                <code>
                  {`<?xml version="1.0" encoding="UTF-8"?>
<available_skills>
  <skill>
    <name>python-basics-101</name>
    <description>Learn fundamental Python concepts...</description>
    <location>https://raw.githubusercontent.com/sophgen/skillwiki/main/skills/education/python-basics-101/SKILL.md</location>
  </skill>
  <!-- More skills... -->
</available_skills>`}
                </code>
              </pre>
            </section>

            {/* Load Skills */}
            <section>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Step 2: Load Skills into Agent
              </h3>
              <p className="text-zinc-700 dark:text-zinc-400 mb-4">
                Extract skill metadata and include in your agent prompt. Example for Claude:
              </p>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-300 p-4 rounded-lg overflow-x-auto border border-zinc-800 dark:border-zinc-800/80">
                <code>
                  {`<available_skills>
  <skill>
    <name>python-basics-101</name>
    <description>Learn fundamental Python concepts including variables, loops, and functions.</description>
    <location>https://raw.githubusercontent.com/sophgen/skillwiki/main/skills/education/python-basics-101/SKILL.md</location>
  </skill>
</available_skills>`}
                </code>
              </pre>
            </section>

            {/* Activate */}
            <section>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Step 3: Activate Skills
              </h3>
              <p className="text-zinc-700 dark:text-zinc-400 mb-4">
                When the agent decides to use a skill, fetch the full SKILL.md file:
              </p>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-300 p-4 rounded-lg overflow-x-auto border border-zinc-800 dark:border-zinc-800/80">
                <code>
                  {`curl https://raw.githubusercontent.com/sophgen/skillwiki/main/skills/education/python-basics-101/SKILL.md`}
                </code>
              </pre>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-4">
                The agent loads the full markdown content and can execute any scripts or
                reference materials from the skill directory.
              </p>
            </section>

            {/* CLI Tool */}
            <section>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Using skills-ref CLI
              </h3>
              <p className="text-zinc-700 dark:text-zinc-400 mb-4">
                The agentskills.io project provides a CLI tool for working with skills:
              </p>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-300 p-4 rounded-lg overflow-x-auto border border-zinc-800 dark:border-zinc-800/80">
                <code>
                  {`# Validate a skill directory
skills-ref validate ./my-skill

# Generate XML prompt for agent
skills-ref to-prompt ./my-skill`}
                </code>
              </pre>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-4">
                Learn more at{' '}
                <a
                  href="https://agentskills.io"
                  className="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  agentskills.io
                </a>
              </p>
            </section>

            {/* Specification */}
            <section>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Skill Specification</h3>
              <p className="text-zinc-700 dark:text-zinc-400 mb-4">
                SkillWiki follows the agentskills.io specification. Each skill is a directory
                containing:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-400 mb-4">
                <li>
                  <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">SKILL.md</code> - Required.
                  Contains YAML frontmatter (metadata) and markdown instructions
                </li>
                <li>
                  <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">scripts/</code> - Optional.
                  Executable code files (Python, Bash, JavaScript, etc.)
                </li>
                <li>
                  <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">references/</code> - Optional.
                  Additional documentation and reference materials
                </li>
                <li>
                  <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">assets/</code> - Optional.
                  Templates, images, data files
                </li>
              </ul>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Read the full specification at{' '}
                <a
                  href="https://agentskills.io/specification"
                  className="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  agentskills.io/specification
                </a>
              </p>
            </section>

            {/* Support */}
            <section>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Questions?</h3>
              <p className="text-zinc-700 dark:text-zinc-400">
                Open an issue or discussion on our{' '}
                <a
                  href="https://github.com/sophgen/skillwiki"
                  className="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>
              </p>
            </section>
          </div>
        </div>
      </main >
    </>
  );
}
