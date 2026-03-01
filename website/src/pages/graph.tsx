import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Header from '../components/Header';
import { getAllSkills } from '../lib/skills';

const SkillGraph = dynamic(() => import('../components/SkillGraph'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-[calc(100vh-80px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    ),
});

interface GraphProps {
    graphData: {
        nodes: any[];
        links: any[];
    }
}

export default function Graph({ graphData }: GraphProps) {
    return (
        <>
            <Head>
                <title>Skill Graph — SkillWiki</title>
                <meta name="description" content="Visualize the relationships between skills" />
            </Head>

            <Header />

            <main className="pt-20 bg-zinc-50 dark:bg-zinc-950 min-h-screen relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-end items-end pb-24 lg:pb-6">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Skills</div>
                        <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Domains</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-500"></span> Tags</div>
                    </div>
                </div>
                <SkillGraph data={graphData} />
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps<GraphProps> = async () => {
    const skills = getAllSkills();

    const nodesMap = new Map();
    const links: any[] = [];

    skills.forEach((skill) => {
        // Add skill node
        nodesMap.set(skill.id, {
            id: skill.id,
            name: skill.metadata.name,
            type: 'skill',
        });

        // Add domain node and link
        const domain = skill.metadata.domain;
        if (domain) {
            if (!nodesMap.has(`domain-${domain}`)) {
                nodesMap.set(`domain-${domain}`, {
                    id: `domain-${domain}`,
                    name: domain,
                    type: 'domain',
                });
            }
            links.push({
                source: skill.id,
                target: `domain-${domain}`,
                value: 1,
            });
        }

        // Add tag nodes and links
        const tags = skill.metadata.tags || [];
        tags.forEach((tag) => {
            const tagId = `tag-${tag.toLowerCase()}`;
            if (!nodesMap.has(tagId)) {
                nodesMap.set(tagId, {
                    id: tagId,
                    name: tag,
                    type: 'tag',
                });
            }
            links.push({
                source: skill.id,
                target: tagId,
                value: 1,
            });
        });
    });

    return {
        props: {
            graphData: {
                nodes: Array.from(nodesMap.values()),
                links,
            },
        },
    };
};
