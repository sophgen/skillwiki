# Performance & Optimization

## Core Web Vitals

### LCP (Largest Contentful Paint) — Target: < 2.5s
The time it takes for the largest visible element to render.

**Common culprits and fixes:**
- Unoptimized hero images → Use `next/image` with `priority`, serve WebP/AVIF, set explicit dimensions
- Render-blocking resources → Inline critical CSS, defer non-critical JS, use `next/font`
- Slow server response → Use SSG/ISR where possible, add CDN, optimize database queries
- Client-side rendering → Move data fetching to server components, use streaming SSR

### INP (Interaction to Next Paint) — Target: < 200ms
Measures responsiveness — how long between a user interaction and the visual update.

**Common culprits and fixes:**
- Long tasks on main thread → Break into smaller chunks with `scheduler.yield()` or `requestIdleCallback`
- Heavy re-renders → Profile with React DevTools, use `React.memo` where justified, avoid context thrashing
- Synchronous work in event handlers → Defer non-critical updates with `startTransition`
- Large component trees → Code-split with `lazy()` + `Suspense`, virtualize long lists

### CLS (Cumulative Layout Shift) — Target: < 0.1
Measures visual stability — how much the page jumps around during load.

**Common culprits and fixes:**
- Images without dimensions → Always set `width` and `height` (or use `aspect-ratio`)
- Font loading shift → Use `next/font` with `display: swap` and matching fallback metrics
- Dynamic content injection → Reserve space with skeletons/placeholders
- Ads or embeds → Set explicit container dimensions

## Bundle Optimization

### Analyzing the Bundle

```bash
# Next.js built-in analyzer
ANALYZE=true next build

# Or with @next/bundle-analyzer
# next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })({
  // next config
});
```

### Code Splitting Strategies

```typescript
// 1. Route-based splitting (automatic in Next.js)
// Each page/route is its own chunk

// 2. Component-level splitting with dynamic imports
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // skip SSR if component needs browser APIs
});

// 3. Library splitting — import only what you use
// ❌ Imports entire library
import _ from "lodash";
// ✅ Tree-shakeable import
import debounce from "lodash/debounce";

// 4. Conditional loading
const AdminPanel = dynamic(() => import("./admin-panel"));

function Layout({ user }: { user: User }) {
  return (
    <div>
      <MainContent />
      {user.role === "admin" && <AdminPanel />}
    </div>
  );
}
```

### Tree Shaking Tips

- Use named exports (not default exports from barrel files)
- Avoid side effects in modules (`"sideEffects": false` in package.json)
- Use `import type` for type-only imports (prevents bundling runtime code)
- Check if libraries support tree shaking (lodash-es vs lodash)

```typescript
// ✅ Type-only import — stripped at build time
import type { User } from "@/types";

// ✅ Named import from tree-shakeable library
import { format, parseISO } from "date-fns";
```

## Rendering Strategies

### Decision Matrix

| Strategy | Best for | Trade-offs |
|----------|----------|------------|
| **SSG** (Static) | Marketing pages, blogs, docs | Fast but data is stale until rebuild |
| **ISR** (Incremental Static) | Product pages, listings | Good balance; stale-while-revalidate |
| **SSR** (Server-Side) | Dashboards, personalized content | Always fresh but slower TTFB |
| **Streaming SSR** | Complex pages with mixed data speeds | Progressive loading; more complex |
| **CSR** (Client-Side) | Highly interactive SPAs behind auth | No SEO; loading spinner on first visit |

### Streaming SSR Pattern

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      {/* Shell renders immediately */}
      <DashboardHeader />

      {/* Each section streams when its data is ready */}
      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<CardSkeleton />}>
          <RevenueCard />  {/* Fast query — appears first */}
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <AnalyticsCard /> {/* Slow query — streams in later */}
        </Suspense>
      </div>
    </div>
  );
}
```

## Virtualization

For lists with 100+ items, virtualize to render only visible items:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // estimated row height in px
    overscan: 5,            // render 5 extra items above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Image Optimization

```typescript
import Image from "next/image";

// ✅ Above-the-fold hero: priority + eager loading
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  sizes="100vw"
/>

// ✅ Below-the-fold: lazy loading (default)
<Image
  src="/feature.jpg"
  alt="Feature"
  width={600}
  height={400}
  sizes="(max-width: 768px) 100vw, 50vw"  // responsive sizes
  placeholder="blur"
  blurDataURL={blurPlaceholder}             // tiny base64 blur
/>

// ✅ Avatar/thumbnail: fixed size, no need for sizes
<Image
  src={user.avatarUrl}
  alt={user.name}
  width={48}
  height={48}
  className="rounded-full"
/>
```

## Caching Strategies

### HTTP Cache Headers (Next.js Route Handlers)

```typescript
// app/api/products/route.ts
export async function GET() {
  const products = await getProducts();

  return NextResponse.json(products, {
    headers: {
      // Cache for 60s, serve stale for 300s while revalidating
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

### Next.js Fetch Cache

```typescript
// Cached indefinitely (default in App Router)
const data = await fetch("https://api.example.com/data");

// Revalidate every 60 seconds (ISR)
const data = await fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
});

// Never cache (always fresh)
const data = await fetch("https://api.example.com/data", {
  cache: "no-store",
});

// Tag-based revalidation
const data = await fetch("https://api.example.com/products", {
  next: { tags: ["products"] },
});

// Revalidate by tag (in a server action or route handler)
import { revalidateTag } from "next/cache";
revalidateTag("products");
```

### React Query Cache Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000,         // unused data stays in cache for 30 min
      refetchOnWindowFocus: false,     // don't refetch when tab regains focus
      refetchOnReconnect: true,        // refetch when network reconnects
    },
  },
});
```

## Lazy Loading & Prefetching

```typescript
// Prefetch route on hover (Next.js does this automatically for <Link>)
import Link from "next/link";
<Link href="/dashboard" prefetch={true}>Dashboard</Link>

// Manual prefetching with router
import { useRouter } from "next/navigation";
const router = useRouter();
router.prefetch("/dashboard");

// Lazy load component on interaction
const [showModal, setShowModal] = useState(false);
const Modal = dynamic(() => import("./heavy-modal"), { ssr: false });

return (
  <>
    <button onClick={() => setShowModal(true)}>Open</button>
    {showModal && <Modal onClose={() => setShowModal(false)} />}
  </>
);
```

## Measuring Performance

```typescript
// Use Web Vitals API (built into Next.js)
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

// Or custom reporting
// app/web-vitals.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to your analytics
  console.log(metric.name, metric.value);
}
```
