# Data Fetching & API Integration

## TanStack Query (React Query)

### Basic Query

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define typed fetch functions separately — keeps hooks clean
async function fetchUsers(filters: UserFilters): Promise<UsersResponse> {
  const params = new URLSearchParams(filters as Record<string, string>);
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
}

// Query hook with proper key structure
function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ["users", filters],      // query invalidates when filters change
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,         // data is fresh for 5 minutes
    placeholderData: keepPreviousData, // show old data while new data loads (pagination)
  });
}
```

### Mutations with Optimistic Updates

```typescript
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: UpdateUserPayload }) =>
      fetch(`/api/users/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.updates),
      }).then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json() as Promise<User>;
      }),

    // Optimistic update
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      queryClient.setQueryData<User[]>(["users"], (old) =>
        old?.map((user) => (user.id === id ? { ...user, ...updates } : user))
      );

      return { previousUsers }; // for rollback
    },

    onError: (_err, _vars, context) => {
      // Rollback on error
      queryClient.setQueryData(["users"], context?.previousUsers);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### Infinite Queries (Pagination / Infinite Scroll)

```typescript
function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ["users", "infinite"],
    queryFn: async ({ pageParam }): Promise<UsersResponse> => {
      const res = await fetch(`/api/users?cursor=${pageParam}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

// In component
function UserList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteUsers();

  if (status === "pending") return <Spinner />;
  if (status === "error") return <ErrorMessage />;

  const allUsers = data.pages.flatMap((page) => page.users);

  return (
    <>
      {allUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : "Load more"}
        </button>
      )}
    </>
  );
}
```

### Prefetching

```typescript
// Prefetch on hover for instant navigation
function UserLink({ userId, children }: { userId: string; children: React.ReactNode }) {
  const queryClient = useQueryClient();

  function handleMouseEnter() {
    queryClient.prefetchQuery({
      queryKey: ["user", userId],
      queryFn: () => fetchUser(userId),
      staleTime: 5 * 60 * 1000,
    });
  }

  return (
    <Link href={`/users/${userId}`} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

### Query Key Factory Pattern

```typescript
// Centralize query keys for consistency and easy invalidation
const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Usage
useQuery({ queryKey: userKeys.detail(userId), queryFn: ... });

// Invalidate all user lists
queryClient.invalidateQueries({ queryKey: userKeys.lists() });
```

## Error Handling Strategies

### Typed Error Handling

```typescript
// Define error types for your API
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic fetch wrapper with error typing
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message ?? `Request failed with status ${res.status}`,
      res.status,
      body.code
    );
  }

  return res.json();
}
```

### Retry Logic with TanStack Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (client errors)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3; // retry server errors up to 3 times
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

## Real-Time Data

### Server-Sent Events (SSE)

```typescript
function useSSE<T>(url: string, onMessage: (data: T) => void) {
  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        onMessage(data);
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = () => {
      // EventSource automatically reconnects
      console.warn("SSE connection error — reconnecting...");
    };

    return () => eventSource.close();
  }, [url, onMessage]);
}

// Usage — combine with TanStack Query for the best of both worlds
function useRealtimeNotifications() {
  const queryClient = useQueryClient();

  useSSE<Notification>("/api/notifications/stream", (notification) => {
    // Update the query cache with the new notification
    queryClient.setQueryData<Notification[]>(
      ["notifications"],
      (old) => [notification, ...(old ?? [])]
    );
  });

  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
}
```

### WebSocket with Reconnection

```typescript
function useWebSocket(url: string) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => {
      setStatus("disconnected");
      // Reconnect with exponential backoff
      reconnectTimer.current = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { status, send, ws: wsRef };
}
```

## API Response Validation at the Boundary

Always validate API responses at the boundary between your app and external data:

```typescript
import { z } from "zod";

// Define schemas that mirror your API contract
const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  });

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const UsersResponseSchema = PaginatedResponseSchema(UserSchema);
type UsersResponse = z.infer<typeof UsersResponseSchema>;

// Validate at the fetch layer — the rest of your app trusts the types
async function fetchUsers(page: number): Promise<UsersResponse> {
  const res = await fetch(`/api/users?page=${page}`);
  if (!res.ok) throw new ApiError("Failed to fetch users", res.status);
  const json = await res.json();
  return UsersResponseSchema.parse(json); // runtime validation
}
```
