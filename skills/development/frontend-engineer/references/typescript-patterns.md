# TypeScript Patterns for Frontend

## Discriminated Unions for State

Model component states explicitly instead of using boolean flags:

```typescript
// ❌ Boolean soup
type DataState = {
  data: User[] | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

// ✅ Discriminated union — each state is explicit and type-safe
type DataState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: User[] };
```

## Discriminated Unions for Props

Use discriminated unions when a component has mutually exclusive prop configurations:

```typescript
// ✅ A button that's either a link or an action — never both
type ButtonProps =
  | { variant: "link"; href: string; onClick?: never }
  | { variant: "action"; onClick: () => void; href?: never };
```

## Generic Components

Write generic components that infer types from usage:

```typescript
// ✅ A generic list component
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
};

function List<T>({ items, renderItem, keyExtractor, emptyMessage }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage ?? "No items"}</p>;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage — T is inferred as User
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

## Strict API Response Typing with Zod

Never trust API responses at runtime — validate them:

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
  createdAt: z.string().datetime(),
});

type User = z.infer<typeof UserSchema>; // derive the type from the schema

const UsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().int().nonnegative(),
  nextCursor: z.string().nullable(),
});

type UsersResponse = z.infer<typeof UsersResponseSchema>;

async function fetchUsers(): Promise<UsersResponse> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  const json = await res.json();
  return UsersResponseSchema.parse(json); // throws ZodError if shape doesn't match
}
```

## Utility Types in Practice

```typescript
// Pick only what a component needs from a larger type
type UserCardProps = Pick<User, "name" | "email" | "avatarUrl">;

// Make all fields optional for a patch/update payload
type UpdateUserPayload = Partial<Pick<User, "name" | "email" | "bio">>;

// Record for maps with known key sets
type FeatureFlags = Record<"darkMode" | "betaFeatures" | "analytics", boolean>;

// Extract specific union members
type AdminRole = Extract<User["role"], "admin" | "superadmin">;

// Exclude specific union members
type NonAdminRole = Exclude<User["role"], "admin" | "superadmin">;
```

## `satisfies` for Type-Safe Object Definitions

```typescript
type Route = {
  path: string;
  label: string;
  icon?: string;
};

// ✅ satisfies checks the type but preserves the literal types for autocomplete
const routes = {
  home: { path: "/", label: "Home", icon: "house" },
  dashboard: { path: "/dashboard", label: "Dashboard" },
  settings: { path: "/settings", label: "Settings", icon: "gear" },
} satisfies Record<string, Route>;

// routes.home.path is typed as "/" (literal), not string
```

## `as const` for Literal Inference

```typescript
// ✅ as const preserves literal types
const SORT_OPTIONS = ["name", "date", "relevance"] as const;
type SortOption = (typeof SORT_OPTIONS)[number]; // "name" | "date" | "relevance"

// Useful for select/dropdown options
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
] as const;
```

## Type Narrowing Patterns

```typescript
// Custom type guard
function isApiError(error: unknown): error is { code: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

// Narrowing with discriminated unions
function renderState(state: DataState) {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorMessage error={state.error} />;  // state.error is available
    case "success":
      return <DataTable data={state.data} />;        // state.data is available
  }
}
```

## Template Literal Types

```typescript
// Type-safe event names
type EventName = `on${Capitalize<"click" | "hover" | "focus" | "blur">}`;
// "onClick" | "onHover" | "onFocus" | "onBlur"

// Type-safe CSS custom property names
type CSSVar = `--${string}`;
function setCSSVar(name: CSSVar, value: string) {
  document.documentElement.style.setProperty(name, value);
}
setCSSVar("--primary-color", "#3b82f6"); // ✅
```

## Avoid These Anti-Patterns

```typescript
// ❌ Don't use `any`
function processData(data: any) { ... }
// ✅ Use `unknown` and narrow
function processData(data: unknown) {
  if (isValidData(data)) { ... }
}

// ❌ Don't use `enum` — they have runtime behavior and don't tree-shake
enum Status { Active, Inactive }
// ✅ Use union types
type Status = "active" | "inactive";

// ❌ Don't use type assertions to silence errors
const user = response as User;
// ✅ Validate at runtime
const user = UserSchema.parse(response);

// ❌ Don't use `!` (non-null assertion) to silence TypeScript
const name = user!.name;
// ✅ Handle the null case
const name = user?.name ?? "Unknown";
```
