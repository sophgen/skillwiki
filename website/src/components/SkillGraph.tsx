import { useCallback, useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';

interface GraphData {
    nodes: any[];
    links: any[];
}

interface SkillGraphProps {
    data: GraphData;
}

export default function SkillGraph({ data }: SkillGraphProps) {
    const fgRef = useRef<any>();
    const { theme } = useTheme();
    const [windowDimensions, setWindowDimensions] = useState({ width: 800, height: 600 });
    const router = useRouter();

    useEffect(() => {
        function handleResize() {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight - 80 // offset for header
            });
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNodeClick = useCallback(
        (node: any) => {
            // Aim at node from outside
            fgRef.current?.centerAt(node.x, node.y, 1000);
            fgRef.current?.zoom(8, 2000);

            if (node.type === 'skill') {
                router.push(`/skills/${node.id}`);
            }
        },
        [router]
    );

    const isDark = theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getThemeColor = useCallback((node: any) => {
        if (node.type === 'skill') return isDark ? '#10b981' : '#059669'; // Emerald
        if (node.type === 'domain') return isDark ? '#6366f1' : '#4f46e5'; // Indigo
        if (node.type === 'tag') return isDark ? '#ec4899' : '#db2777'; // Pink
        return isDark ? '#9ca3af' : '#6b7280';
    }, [isDark]);

    return (
        <div className="w-full h-full cursor-move">
            <ForceGraph2D
                ref={fgRef}
                width={windowDimensions.width}
                height={windowDimensions.height}
                graphData={data}
                nodeLabel="name"
                nodeColor={getThemeColor}
                nodeRelSize={6}
                nodeVal={(node) => (node.type === 'domain' ? 20 : node.type === 'skill' ? 10 : 5)}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={(d) => d.value * 0.001}
                linkColor={() => isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                onNodeClick={handleNodeClick}
                backgroundColor={isDark ? '#09090b' : '#fafafa'}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.type === 'skill' ? 5 : node.type === 'domain' ? 8 : 3, 0, 2 * Math.PI, false);
                    ctx.fillStyle = getThemeColor(node);
                    ctx.fill();

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                    ctx.fillText(label, node.x, node.y + (node.type === 'domain' ? 12 : 8));
                }}
            />
        </div>
    );
}
