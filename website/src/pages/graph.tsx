import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState, useCallback } from 'react';
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

export type NodeType = 'skill' | 'domain' | 'reference' | 'script';

export interface GraphNode {
    id: string;
    name: string;
    type: NodeType;
    description?: string;
    connections?: number;
}

export interface GraphLink {
    source: string;
    target: string;
    value: number;
    label?: string;
}

interface GraphProps {
    graphData: {
        nodes: GraphNode[];
        links: GraphLink[];
    };
    stats: {
        skills: number;
        domains: number;
        references: number;
        scripts: number;
        totalNodes: number;
        totalLinks: number;
    };
}

const NODE_TYPE_META: Record<NodeType, { label: string; color: string }> = {
    skill:     { label: 'Skills',     color: 'bg-emerald-500' },
    domain:    { label: 'Domains',    color: 'bg-indigo-500'  },
    reference: { label: 'References', color: 'bg-amber-500'   },
    script:    { label: 'Scripts',    color: 'bg-cyan-500'    },
};

export default function Graph({ graphData, stats }: GraphProps) {
    const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set(Object.keys(NODE_TYPE_META) as NodeType[]));
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [showStats, setShowStats] = useState(true);

    const toggleFilter = useCallback((type: NodeType) => {
        setActiveFilters((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                // Don't allow removing all filters
                if (next.size <= 1) return prev;
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    }, []);

    const filteredData = {
        nodes: graphData.nodes.filter((n) => activeFilters.has(n.type)),
        links: graphData.links.filter((l) => {
            const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
            const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
            const sourceNode = graphData.nodes.find((n) => n.id === sourceId);
            const targetNode = graphData.nodes.find((n) => n.id === targetId);
            return sourceNode && targetNode && activeFilters.has(sourceNode.type) && activeFilters.has(targetNode.type);
        }),
    };

    return (
        <>
            <Head>
                <title>Skill Graph — SkillWiki</title>
                <meta name="description" content="Interactive knowledge graph visualizing skills, domains, tags, and their relationships" />
            </Head>

            <Header />

            <main className="pt-20 bg-zinc-50 dark:bg-zinc-950 min-h-screen relative overflow-hidden transition-colors duration-300">
                {/* Stats bar */}
                {showStats && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                        <div className="flex items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.totalNodes} nodes</span>
                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.totalLinks} connections</span>
                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                            <span>{stats.skills} skills</span>
                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                            <span>{stats.domains} domains</span>
                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                            <span>{stats.references} references</span>
                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                            <span>{stats.scripts} scripts</span>
                            <button onClick={() => setShowStats(false)} className="ml-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">✕</button>
                        </div>
                    </div>
                )}

                {/* Selected node detail panel */}
                {selectedNode && (
                    <div className="absolute top-24 left-6 z-20 pointer-events-auto max-w-xs">
                        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{NODE_TYPE_META[selectedNode.type]?.label}</span>
                                <button onClick={() => setSelectedNode(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm">✕</button>
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">{selectedNode.name}</h3>
                            {selectedNode.description && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-3">{selectedNode.description}</p>
                            )}
                            <div className="text-xs text-zinc-400">
                                {selectedNode.connections} connection{selectedNode.connections !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter controls */}
                <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-end items-end pb-24 lg:pb-6">
                    <div className="pointer-events-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs text-zinc-600 dark:text-zinc-400">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Filter nodes</p>
                        {(Object.entries(NODE_TYPE_META) as [NodeType, typeof NODE_TYPE_META[NodeType]][]).map(([type, meta]) => {
                            const count = graphData.nodes.filter((n) => n.type === type).length;
                            if (count === 0) return null;
                            const isActive = activeFilters.has(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleFilter(type)}
                                    className={`flex items-center gap-2 mb-1.5 w-full text-left transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <span className={`w-3 h-3 rounded-full ${meta.color} ${!isActive && 'grayscale'}`}></span>
                                    <span>{meta.label}</span>
                                    <span className="ml-auto text-[10px] text-zinc-400">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Keyboard hint */}
                <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-600 space-y-0.5">
                        <div>Scroll to zoom · Drag to pan · Click node for details</div>
                    </div>
                </div>

                <SkillGraph data={filteredData} onNodeSelect={setSelectedNode} />
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps<GraphProps> = async () => {
    const skills = getAllSkills();
    const skillsDir = process.env.SKILLS_DIR || path.join(process.cwd(), '..', 'skills');

    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];
    const connectionCount = new Map<string, number>();

    const addConnection = (id: string) => {
        connectionCount.set(id, (connectionCount.get(id) || 0) + 1);
    };

    skills.forEach((skill) => {
        const description = typeof skill.metadata.description === 'string'
            ? skill.metadata.description.slice(0, 200)
            : '';

        // Skill node
        nodesMap.set(skill.id, {
            id: skill.id,
            name: skill.metadata.name,
            type: 'skill',
            description,
        });

        // Domain node + link
        const domain = skill.metadata.domain || skill.domain;
        if (domain) {
            const domainId = `domain-${domain}`;
            if (!nodesMap.has(domainId)) {
                nodesMap.set(domainId, { id: domainId, name: domain, type: 'domain' });
            }
            links.push({ source: skill.id, target: domainId, value: 2, label: 'belongs to' });
            addConnection(skill.id);
            addConnection(domainId);
        }

        // Reference and script nodes from skill directory
        try {
            const skillDir = path.join(skillsDir, skill.id);
            const subDirs: { dir: string; type: NodeType }[] = [
                { dir: 'references', type: 'reference' },
                { dir: 'scripts', type: 'script' },
            ];
            subDirs.forEach(({ dir, type }) => {
                const dirPath = path.join(skillDir, dir);
                if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                    const files = fs.readdirSync(dirPath);
                    files.forEach((file) => {
                        const resId = `${type}-${skill.id}-${file}`;
                        const ext = path.extname(file).slice(1);
                        nodesMap.set(resId, {
                            id: resId,
                            name: file,
                            type,
                            description: `${dir}/${file} (${ext})`,
                        });
                        links.push({ source: skill.id, target: resId, value: 0.5, label: dir });
                        addConnection(skill.id);
                        addConnection(resId);
                    });
                }
            });
        } catch { /* skip if we can't read */ }

    });

    // Set connection counts on nodes
    nodesMap.forEach((node, id) => {
        node.connections = connectionCount.get(id) || 0;
    });

    const nodes = Array.from(nodesMap.values());
    const countByType = (type: NodeType) => nodes.filter((n) => n.type === type).length;

    return {
        props: {
            graphData: { nodes, links },
            stats: {
                skills: countByType('skill'),
                domains: countByType('domain'),
                references: countByType('reference'),
                scripts: countByType('script'),
                totalNodes: nodes.length,
                totalLinks: links.length,
            },
        },
    };
};
