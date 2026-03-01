# Frontend Testing

## Testing Philosophy

Test behavior, not implementation. Your tests should:
- Verify what the user sees and does (not internal state or method calls)
- Survive refactors (changing implementation shouldn't break tests)
- Fail for the right reasons (a failing test should mean broken functionality)

### What to Test
- User interactions (click, type, submit)
- Conditional rendering (loading, error, empty states)
- Form validation and submission
- Data display after fetch
- Accessibility (roles, labels, keyboard navigation)

### What NOT to Test
- Implementation details (state values, method calls, internal hooks)
- Third-party library behavior
- Styling (use visual regression tools for that)
- 1:1 DOM structure (fragile, breaks on refactors)

## React Testing Library

### Basic Component Test

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserCard } from "./user-card";

describe("UserCard", () => {
  const user = { id: "1", name: "Alice", email: "alice@example.com", role: "admin" as const };

  it("displays the user's name and email", () => {
    render(<UserCard user={user} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows admin badge for admin users", () => {
    render(<UserCard user={user} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    render(<UserCard user={user} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith("1");
  });
});
```

### Testing Async Components

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserList } from "./user-list";
import { server } from "@/tests/mocks/server"; // MSW
import { http, HttpResponse } from "msw";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // don't retry in tests
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("UserList", () => {
  it("shows loading state, then users", async () => {
    renderWithProviders(<UserList />);

    // Loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Users appear
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("shows error state on API failure", async () => {
    server.use(
      http.get("/api/users", () => HttpResponse.json(null, { status: 500 }))
    );

    renderWithProviders(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Forms

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./signup-form";

describe("SignupForm", () => {
  it("shows validation errors for invalid input", async () => {
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be/i)).toBeInTheDocument();
    });
  });

  it("submits valid form data", async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "securepass123");
    await user.type(screen.getByLabelText(/confirm password/i), "securepass123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "securepass123",
        confirmPassword: "securepass123",
      });
    });
  });

  it("shows mismatch error when passwords differ", async () => {
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });
});
```

## MSW (Mock Service Worker)

Mock API responses consistently across all tests:

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json({
      users: [
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ],
      total: 2,
      nextCursor: null,
    });
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "3", ...body, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  }),
];

// tests/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
export const server = setupServer(...handlers);

// tests/setup.ts (vitest)
import { server } from "./mocks/server";
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## E2E Testing with Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can sign up and reach the dashboard", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("password123");
    await page.getByRole("button", { name: "Sign up" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome")).toBeVisible();
  });

  test("shows error for duplicate email", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Email").fill("existing@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("password123");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Email already registered")).toBeVisible();
  });
});
```

## Testing Custom Hooks

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));
    expect(result.current).toBe("hello");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "hello" } }
    );

    rerender({ value: "world" });
    expect(result.current).toBe("hello"); // still old value

    vi.advanceTimersByTime(500);
    expect(result.current).toBe("world"); // updated after delay
  });
});
```
