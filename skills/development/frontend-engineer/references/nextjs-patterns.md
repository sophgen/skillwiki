# Next.js Patterns

## App Router: Server vs Client Component Decision Tree

**Default to Server Components.** Only add `"use client"` when you need:
- Event handlers (onClick, onChange, onSubmit)
- State (useState, useReducer)
- Effects (useEffect, useLayoutEffect)
- Browser-only APIs (window, localStorage, IntersectionObserver)
- Custom hooks that use any of the above
- React Context (providers must be client components)

**Key mental model**: The `"use client"` directive creates a **boundary**. Everything imported into a client component becomes part of the client bundle. Push `"use client"` as deep as possible — wrap only the interactive parts, not entire pages.

```
// ✅ Good: Server page with a small client island
// app/dashboard/page.tsx (Server Component)
import { DashboardStats } from "./dashboard-stats";    // Server
import { ActivityChart } from "./activity-chart";        // Client (has interactivity)

export default async function DashboardPage() {
  const stats = await getStats();  // runs on server, never shipped to client
  return (
    <div>
      <DashboardStats stats={stats} />
      <ActivityChart />
    </div>
  );
}
```

## Data Fetching in App Router

### Server-Side Fetching (preferred)

```typescript
// app/users/page.tsx — Server Component, fetches on the server
async function getUsers(): Promise<User[]> {
  const res = await fetch("https://api.example.com/users", {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}
```

### Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Fast data loads immediately */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      {/* Slow data streams in when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  );
}

// Each component fetches its own data — they stream independently
async function DashboardStats() {
  const stats = await getStats(); // fast query
  return <StatsGrid stats={stats} />;
}

async function RevenueChart() {
  const revenue = await getRevenueData(); // slow query
  return <Chart data={revenue} />;
}
```

### Server Actions

```typescript
// app/actions/user.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.user.update({
    where: { id: getCurrentUserId() },
    data: parsed.data,
  });

  revalidatePath("/profile");
  return { success: true };
}
```

### Using Server Actions with `useActionState`

```typescript
"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/user";

export function ProfileForm({ user }: { user: User }) {
  const [state, action, isPending] = useActionState(updateProfile, null);

  return (
    <form action={action}>
      <input name="name" defaultValue={user.name} />
      {state?.error?.name && <p className="text-red-500">{state.error.name}</p>}

      <textarea name="bio" defaultValue={user.bio ?? ""} />

      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## Parallel Routes

Use parallel routes when multiple independent sections of a page load different data:

```
app/
  @analytics/    → analytics slot
    page.tsx
    loading.tsx
  @activity/     → activity slot
    page.tsx
    loading.tsx
  layout.tsx     → receives both as props
  page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  activity,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  activity: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <main className="col-span-2">{children}</main>
      <aside>
        {analytics}
        {activity}
      </aside>
    </div>
  );
}
```

## Middleware

```typescript
// middleware.ts (root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  // Redirect unauthenticated users
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Add headers
  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

## Route Handlers (API Routes in App Router)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? 1);

  const users = await db.user.findMany({
    skip: (page - 1) * 20,
    take: 20,
  });

  return NextResponse.json({ users, page });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await db.user.create({ data: parsed.data });
  return NextResponse.json(user, { status: 201 });
}
```

## Image & Font Optimization

```typescript
// next/image — always use for images
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority           // above-the-fold images: set priority for LCP
  placeholder="blur" // show blur while loading (requires static import or blurDataURL)
/>

// next/font — eliminates layout shift from font loading
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
});

// In layout.tsx
<body className={`${inter.variable} ${playfair.variable}`}>
```

## Metadata & SEO

```typescript
// app/layout.tsx — static metadata
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "My App", template: "%s | My App" },
  description: "A production Next.js application",
  openGraph: { images: ["/og-image.png"] },
};

// app/blog/[slug]/page.tsx — dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}
```

## Error Handling

```typescript
// app/dashboard/error.tsx — error boundary for the dashboard segment
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/not-found.tsx — custom 404
export default function NotFound() {
  return (
    <div>
      <h1>404 — Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
```

## Pages Router Quick Reference

For projects still on Pages Router:

```typescript
// getServerSideProps — runs on every request (SSR)
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const data = await fetchData(context.params.id);
  if (!data) return { notFound: true };
  return { props: { data } };
};

// getStaticProps + getStaticPaths — build-time generation (SSG)
export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking", // generate on-demand if not pre-built
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const post = await getPost(params.slug);
  return { props: { post }, revalidate: 60 }; // ISR: revalidate every 60s
};
```
