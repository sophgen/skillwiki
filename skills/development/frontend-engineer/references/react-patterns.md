# React Patterns

## Component Composition Over Prop Drilling

When components need shared state or configuration, use composition instead of passing props through intermediate layers:

```typescript
// ❌ Prop drilling — every layer passes theme and user
<App theme={theme} user={user}>
  <Layout theme={theme} user={user}>
    <Sidebar theme={theme} user={user}>
      <NavItem theme={theme} user={user} />

// ✅ Composition — children don't need to know about props they don't use
<App>
  <Layout sidebar={<Sidebar><NavItem /></Sidebar>}>
    {children}
  </Layout>
</App>
```

## Compound Components

For complex components with related sub-components that share state:

```typescript
type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab components must be used within <Tabs>");
  return context;
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabContent({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;

// Usage
<Tabs defaultTab="general">
  <Tabs.Trigger value="general">General</Tabs.Trigger>
  <Tabs.Trigger value="security">Security</Tabs.Trigger>
  <Tabs.Content value="general"><GeneralSettings /></Tabs.Content>
  <Tabs.Content value="security"><SecuritySettings /></Tabs.Content>
</Tabs>
```

## Custom Hooks: Extraction Patterns

Extract hooks when logic is reused OR when a component's logic is complex enough to warrant separation:

```typescript
// ✅ Reusable data-fetching hook with proper typing
function useUsers(filters?: UserFilters) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; error: Error }
    | { status: "success"; data: User[] }
  >({ status: "idle" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetchUsers(filters, { signal: controller.signal })
      .then((data) => setState({ status: "success", data }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState({ status: "error", error });
        }
      });

    return () => controller.abort();
  }, [filters]);

  return state;
}

// ✅ Extracted complex logic — keeps the component clean
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## When to Use `useMemo` and `useCallback`

**Don't default to memoizing everything.** Only memoize when:

1. The computation is genuinely expensive (>1ms)
2. The value is passed as a dependency to another hook or a memoized child
3. The value is a reference type passed to `React.memo`-wrapped children

```typescript
// ❌ Unnecessary — filtering a small list is cheap
const filteredItems = useMemo(
  () => items.filter((item) => item.active),
  [items]
);

// ✅ Justified — expensive computation
const sortedAndGroupedData = useMemo(
  () => expensiveGroupAndSort(largeDataset, sortConfig),
  [largeDataset, sortConfig]
);

// ✅ Justified — stable reference needed for useEffect dependency
const fetchData = useCallback(async () => {
  const res = await fetch(`/api/data?q=${query}`);
  return res.json();
}, [query]);

useEffect(() => { fetchData(); }, [fetchData]);
```

## State Management Decision Tree

**Local state (`useState`)**: Component-specific UI state (open/closed, form inputs, hover state).

**URL state (`useSearchParams`, `nuqs`)**: Filters, pagination, tabs — anything the user should be able to bookmark or share.

**Server state (TanStack Query / SWR)**: Data from APIs. Don't store server data in local state — use a purpose-built cache.

**Global client state (Zustand / Jotai)**: Cross-cutting client state that many components need (theme, feature flags, user preferences, shopping cart). Most apps need very little of this.

```typescript
// ✅ URL state for filters — shareable, bookmarkable
import { useSearchParams } from "next/navigation";

function ProductList() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "relevance";
  // ...
}

// ✅ Zustand for lightweight global state
import { create } from "zustand";

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  total: () => number;
};

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
```

## Error Boundaries

```typescript
"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }
      return fallback ?? <p>Something went wrong.</p>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={(error, reset) => (
  <div>
    <p>Error: {error.message}</p>
    <button onClick={reset}>Retry</button>
  </div>
)}>
  <RiskyComponent />
</ErrorBoundary>
```

## Forms: Controlled with react-hook-form + Zod

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SignupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupValues = z.infer<typeof SignupSchema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
  });

  async function onSubmit(data: SignupValues) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Signup failed");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p role="alert">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p role="alert">{errors.confirmPassword.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
```

## Optimistic Updates with `useOptimistic`

```typescript
"use client";

import { useOptimistic } from "react";
import { toggleLike } from "@/app/actions/likes";

export function LikeButton({ postId, initialLiked, initialCount }: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (current, newLiked: boolean) => ({
      liked: newLiked,
      count: current.count + (newLiked ? 1 : -1),
    })
  );

  async function handleToggle() {
    setOptimistic(!optimistic.liked);
    await toggleLike(postId);
  }

  return (
    <form action={handleToggle}>
      <button type="submit">
        {optimistic.liked ? "❤️" : "🤍"} {optimistic.count}
      </button>
    </form>
  );
}
```

## Avoiding Common Re-Render Issues

```typescript
// ❌ Creating objects/arrays inline causes children to re-render
function Parent() {
  return <Child style={{ color: "red" }} items={[1, 2, 3]} />;
  // New object and array reference every render
}

// ✅ Hoist constants outside the component
const STYLE = { color: "red" } as const;
const ITEMS = [1, 2, 3] as const;

function Parent() {
  return <Child style={STYLE} items={ITEMS} />;
}

// ❌ Context provider with inline object — all consumers re-render on every parent render
<AuthContext.Provider value={{ user, login, logout }}>

// ✅ Memoize the context value
const authValue = useMemo(() => ({ user, login, logout }), [user, login, logout]);
<AuthContext.Provider value={authValue}>
```
