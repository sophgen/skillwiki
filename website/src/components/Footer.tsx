import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-16 pb-8 mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-4 inline-flex outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-display font-bold shadow-sm">
                                <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">SkillWiki</h2>
                        </Link>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                            The premier marketplace for discoverable, reusable agent skills. Build better AI agents faster with community-created capabilities.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-widest">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/integrate" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Integration Guide
                                </Link>
                            </li>
                            <li>
                                <a href="https://github.com/sophgen/skillwiki" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Submit a Skill
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-widest">Connect</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://github.com/sophgen/skillwiki" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    agentskills.io Spec
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-4 md:mb-0">
                        &copy; {currentYear} SkillWiki. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        <span>Built for the Agentic Web</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
