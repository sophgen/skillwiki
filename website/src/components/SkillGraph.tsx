import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import type { GraphNode, NodeType } from '../pages/graph';

interface GraphData {
    nodes: GraphNode[];
    links: any[];
}

interface SkillGraphProps {
    data: GraphData;
    onNodeSelect?: (node: GraphNode | null) => void;
}

const NODE_COLORS: Record<string, Record<NodeType, string>> = {
    dark: {
        skill: '#10b981',
        domain: '#6366f1',
        reference: '#f59e0b',
        script: '#06b6d4',
    },
    light: {
        skill: '#059669',
        domain: '#4f46e5',
        reference: '#d97706',
        script: '#0891b2',
    },
};

const NODE_SIZES: Record<NodeType, number> = {
    skill: 7,
    domain: 10,
    reference: 4,
    script: 4,
};

export default function SkillGraph({ data, onNodeSelect }: SkillGraphProps) {
    const fgRef = useRef<any>();
    const { theme } = useTheme();
    const [windowDimensions, setWindowDimensions] = useState({ width: 800, height: 600 });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        function handleResize() {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight - 80,
            });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Build adjacency set for highlighting neighbors
    const neighborSet = useMemo(() => {
        const map = new Map<string, Set<string>>();
        data.links.forEach((link: any) => {
            const s = typeof link.source === 'string' ? link.source : link.source?.id;
            const t = typeof link.target === 'string' ? link.target : link.target?.id;
            if (!s || !t) return;
            if (!map.has(s)) map.set(s, new Set());
            if (!map.has(t)) map.set(t, new Set());
            map.get(s)!.add(t);
            map.get(t)!.add(s);
        });
        return map;
    }, [data.links]);

    const isDark = theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const palette = isDark ? NODE_COLORS.dark : NODE_COLORS.light;

    const getNodeColor = useCallback(
        (node: any) => palette[node.type as NodeType] || (isDark ? '#9ca3af' : '#6b7280'),
        [palette, isDark]
    );

    const handleNodeClick = useCallback(
        (node: any) => {
            fgRef.current?.centerAt(node.x, node.y, 800);
            fgRef.current?.zoom(6, 1200);
            onNodeSelect?.(node);
            if (node.type === 'skill') {
                setTimeout(() => router.push(`/skills/${node.id}`), 1500);
            }
        },
        [router, onNodeSelect]
    );

    const handleNodeHover = useCallback(
        (node: any) => {
            setHoveredNode(node ? node.id : null);
            document.body.style.cursor = node ? 'pointer' : '';
        },
        []
    );

    const isHighlighted = useCallback(
        (nodeId: string) => {
            if (!hoveredNode) return true;
            if (nodeId === hoveredNode) return true;
            return neighborSet.get(hoveredNode)?.has(nodeId) ?? false;
        },
        [hoveredNode, neighborSet]
    );

    const drawNode = useCallback(
        (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const size = NODE_SIZES[node.type as NodeType] || 4;
            const highlighted = isHighlighted(node.id);
            const alpha = highlighted ? 1 : 0.15;
            const isHovered = node.id === hoveredNode;
            const color = getNodeColor(node);
            const x = node.x as number;
            const y = node.y as number;

            ctx.globalAlpha = alpha;

            // Glow effect for hovered node
            if (isHovered) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
            }

            ctx.beginPath();
            switch (node.type as NodeType) {
                case 'domain':
                    // Hexagon
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i - Math.PI / 6;
                        const px = x + size * Math.cos(angle);
                        const py = y + size * Math.sin(angle);
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    break;
                case 'skill':
                    // Rounded square
                    const half = size * 0.85;
                    const r = 2;
                    ctx.moveTo(x - half + r, y - half);
                    ctx.arcTo(x + half, y - half, x + half, y + half, r);
                    ctx.arcTo(x + half, y + half, x - half, y + half, r);
                    ctx.arcTo(x - half, y + half, x - half, y - half, r);
                    ctx.arcTo(x - half, y - half, x + half, y - half, r);
                    ctx.closePath();
                    break;
                case 'reference':
                    // Diamond
                    ctx.moveTo(x, y - size);
                    ctx.lineTo(x + size, y);
                    ctx.lineTo(x, y + size);
                    ctx.lineTo(x - size, y);
                    ctx.closePath();
                    break;
                case 'script':
                    // Small square
                    ctx.rect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4);
                    break;
                default:
                    // Circle
                    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
                    break;
            }

            ctx.fillStyle = color;
            ctx.fill();

            // Border for hovered
            if (isHovered) {
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Label
            const showLabel = globalScale > 1.5 || isHovered || node.type === 'domain' || node.type === 'skill';
            if (showLabel) {
                const fontSize = Math.min(14 / globalScale, isHovered ? 14 : 11);
                const fontWeight = node.type === 'domain' || node.type === 'skill' ? 'bold' : 'normal';
                ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = isDark ? `rgba(255,255,255,${highlighted ? 0.9 : 0.15})` : `rgba(0,0,0,${highlighted ? 0.85 : 0.15})`;

                const label = node.name.length > 25 ? node.name.slice(0, 22) + '…' : node.name;
                ctx.fillText(label, x, y + size + 2);
            }

            ctx.globalAlpha = 1;
        },
        [getNodeColor, hoveredNode, isDark, isHighlighted]
    );

    return (
        <div className="w-full h-full cursor-move">
            <ForceGraph2D
                ref={fgRef}
                width={windowDimensions.width}
                height={windowDimensions.height}
                graphData={data}
                nodeLabel={(node: any) => `${node.name}${node.description ? '\n' + node.description : ''}`}
                nodeColor={getNodeColor}
                nodeRelSize={6}
                nodeVal={(node: any) => {
                    const base = NODE_SIZES[node.type as NodeType] || 4;
                    return base * base * 0.5;
                }}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleSpeed={() => 0.004}
                linkColor={(link: any) => {
                    if (!hoveredNode) return isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
                    const s = typeof link.source === 'string' ? link.source : link.source?.id;
                    const t = typeof link.target === 'string' ? link.target : link.target?.id;
                    if (s === hoveredNode || t === hoveredNode) {
                        return isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)';
                    }
                    return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                }}
                linkWidth={(link: any) => {
                    if (!hoveredNode) return 1.2;
                    const s = typeof link.source === 'string' ? link.source : link.source?.id;
                    const t = typeof link.target === 'string' ? link.target : link.target?.id;
                    return (s === hoveredNode || t === hoveredNode) ? 2.5 : 0.5;
                }}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                backgroundColor={isDark ? '#09090b' : '#fafafa'}
                nodeCanvasObject={drawNode}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                warmupTicks={50}
                cooldownTime={3000}
            />
        </div>
    );
}
