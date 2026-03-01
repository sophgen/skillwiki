# Design Patterns Reference

## Table of Contents
1. Creational Patterns
2. Structural Patterns
3. Behavioral Patterns
4. System-Level / Distributed Patterns
5. Data Patterns
6. Resilience Patterns
7. Anti-Patterns to Watch For

---

## 1. Creational Patterns

### Factory / Abstract Factory
**When to use:** When you need to create objects without specifying the exact class, especially when the creation logic is complex or the choice depends on configuration/runtime context.

**System-level application:** Service factories in dependency injection frameworks. API gateway routing where the "factory" decides which backend service handles a request type.

**Watch out for:** Over-engineering simple object creation. If you have one implementation that will never change, a factory adds indirection without value.

### Builder
**When to use:** When constructing complex objects with many optional parameters. Prefer builders over constructors with 8+ parameters.

**System-level application:** Query builders, configuration builders, request pipeline builders. Useful for constructing complex API requests or database queries programmatically.

### Singleton
**When to use:** Rarely. When you genuinely need exactly one instance — connection pools, configuration managers, thread pools.

**Watch out for:** Singletons are essentially global state. They make testing harder and hide dependencies. In distributed systems, "singleton" doesn't exist — you need distributed coordination (leader election, distributed locks) instead.

---

## 2. Structural Patterns

### Adapter
**When to use:** When you need to make incompatible interfaces work together, typically when integrating third-party libraries or legacy systems.

**System-level application:** API adapters between microservices with different data formats. Legacy system integration layers. The anti-corruption layer in Domain-Driven Design is essentially a sophisticated adapter.

### Facade
**When to use:** When you want to provide a simple interface to a complex subsystem.

**System-level application:** API gateways are facades. BFF (Backend for Frontend) layers are facades. Anywhere you aggregate multiple backend calls into a single, client-friendly response.

### Proxy
**When to use:** When you need to control access to an object — for caching, access control, logging, or lazy initialization.

**System-level application:** Reverse proxies (Nginx, HAProxy), API gateways, caching proxies, service meshes (Envoy/Istio sidecar proxies). The sidecar pattern is essentially a proxy.

### Decorator
**When to use:** When you want to add behavior to objects dynamically without modifying their class.

**System-level application:** Middleware chains in web frameworks (authentication → logging → rate limiting → handler). Each middleware "decorates" the handler with additional behavior.

---

## 3. Behavioral Patterns

### Strategy
**When to use:** When you have multiple algorithms for the same task and want to swap them at runtime.

**System-level application:** Payment processing (different strategies for credit card, PayPal, crypto). Notification delivery (email, SMS, push). Pricing calculations (standard, premium, enterprise tiers).

### Observer / Pub-Sub
**When to use:** When changes in one component need to trigger reactions in many others, especially when you want loose coupling.

**System-level application:** Event-driven architectures. Message queues (Kafka, RabbitMQ, SQS). Webhooks. Database change data capture (CDC). This is perhaps the single most important pattern for building scalable, decoupled systems.

**Key decision:** In-process observer (simple, synchronous) vs distributed pub/sub (complex, asynchronous, resilient). Use in-process for single-service events; use message brokers when crossing service boundaries.

### Chain of Responsibility
**When to use:** When a request should be processed by one of several handlers, and the handler isn't known in advance.

**System-level application:** Middleware pipelines, approval workflows, escalation systems, content filtering pipelines (spam → profanity → quality → publish).

### Command
**When to use:** When you want to encapsulate a request as an object, enabling queuing, logging, undo, and replay.

**System-level application:** Task queues, CQRS command side, event sourcing (events are commands that were accepted), undo/redo systems.

---

## 4. System-Level / Distributed Patterns

### CQRS (Command Query Responsibility Segregation)
**What it is:** Separate the read model from the write model. Writes go to an optimized write store; reads come from a denormalized, query-optimized view.

**When to use:**
- Read and write patterns are very different (e.g., writes are complex domain operations, reads are simple lookups)
- Read/write ratio is heavily skewed (90%+ reads)
- You need different scaling strategies for reads vs writes

**When NOT to use:**
- Simple CRUD applications
- When the added complexity isn't justified by the scale
- When strong consistency between reads and writes is required with low latency

**Key trade-off:** Eventual consistency between write and read models. Users may briefly see stale data.

### Event Sourcing
**What it is:** Instead of storing current state, store the sequence of events that led to the current state. Current state is derived by replaying events.

**When to use:**
- Full audit trail is required (finance, healthcare, legal)
- Temporal queries are important ("what was the state at time T?")
- You need to support "undo" or replay
- Complex business domains where state transitions matter

**When NOT to use:**
- Simple CRUD with no audit requirements
- When the event store would grow unmanageably large
- When querying current state must be fast and simple (event sourcing makes reads harder)

**Often paired with CQRS:** Events are the write side; materialized views are the read side.

### Saga Pattern
**What it is:** A sequence of local transactions across services, where each step has a compensating action if a later step fails. Replaces distributed transactions (2PC) which don't scale well.

**Two flavors:**
- **Choreography:** Services listen to events and react independently. Simpler but harder to track the overall flow.
- **Orchestration:** A central saga coordinator directs the steps. Easier to understand and debug but creates a central point of coordination.

**When to use:** Any multi-service operation that needs to be all-or-nothing (e.g., "create order → reserve inventory → charge payment → confirm shipping").

**Key challenge:** Designing effective compensating actions. "Un-charging" a credit card is possible; "un-sending" an email is not.

### Strangler Fig Pattern
**What it is:** Incrementally replace a legacy system by routing new functionality to a new system while keeping the old system running. Over time, the old system shrinks until it can be removed.

**When to use:** Any legacy migration. You almost never want to do a big-bang rewrite.

**Implementation:** Put a routing layer (API gateway, reverse proxy) in front of the legacy system. Route specific endpoints to the new system one by one. The legacy system "dies on the vine."

### Event-Driven Architecture
**What it is:** Services communicate by producing and consuming events rather than making direct calls.

**Benefits:** Loose coupling, natural scalability (consumers scale independently), built-in audit trail.

**Key choices:**
- **Event notification** (lightweight: "Order #123 was created") — consumer fetches details if needed
- **Event-carried state transfer** (heavy: the event contains all the data) — consumer doesn't need to call back
- **Event sourcing** (the events ARE the data) — full history, replay capability

**Message broker selection:** See the decision frameworks reference for Kafka vs RabbitMQ vs SQS vs others.

### API Gateway Pattern
**What it is:** A single entry point for all client requests that routes to appropriate backend services, handling cross-cutting concerns like auth, rate limiting, and logging.

**When to use:** Microservices architectures with multiple client types. Essential when you need to aggregate multiple backend calls into a single response.

**Variants:**
- Simple reverse proxy (Nginx, HAProxy)
- Full API gateway (Kong, AWS API Gateway)
- BFF per client type (mobile BFF, web BFF)

### Sidecar Pattern
**What it is:** Deploy helper processes alongside your main service to handle cross-cutting concerns (logging, monitoring, security, networking).

**When to use:** Service mesh architectures (Istio/Envoy). When you want consistent infrastructure behavior across services written in different languages.

**Trade-off:** Resource overhead per pod/instance, added network hops, operational complexity.

---

## 5. Data Patterns

### Sharding
**Strategies:** Hash-based (even distribution), range-based (sequential access), geography-based (data locality), tenant-based (multi-tenant SaaS).

**Key decisions:** Shard key selection is critical and hard to change later. Choose based on your most common query patterns. Avoid hotspots (e.g., sharding by date puts all current writes on one shard).

### CQRS Read Models / Materialized Views
Pre-compute and store query results. Update them asynchronously when the underlying data changes. Trade storage and consistency lag for query performance.

### Change Data Capture (CDC)
Capture changes from a database's transaction log and publish them as events. Enables real-time data synchronization between services without tight coupling. Tools: Debezium, AWS DMS, etc.

### Outbox Pattern
Write events to an "outbox" table in the same database transaction as the business data. A separate process reads the outbox and publishes to the message broker. Guarantees at-least-once delivery without distributed transactions.

---

## 6. Resilience Patterns

### Circuit Breaker
**What it is:** Track failures to an external dependency. If failures exceed a threshold, "open" the circuit and fail fast (or return a fallback) instead of waiting for timeouts.

**States:** Closed (normal) → Open (failing fast) → Half-Open (testing recovery).

**When to use:** Any call to an external service or database. Essential in microservices architectures.

### Bulkhead
**What it is:** Isolate different parts of the system so a failure in one doesn't consume all resources. Like watertight compartments in a ship.

**Implementation:** Thread pool isolation, connection pool separation, separate service instances for critical vs non-critical traffic.

### Retry with Exponential Backoff + Jitter
**What it is:** On failure, retry after increasing delays with randomization to avoid thundering herd.

**Key:** Always add jitter. Without it, retries from thousands of clients can synchronize and overwhelm the recovering service. Always set a maximum retry count.

### Timeout Pattern
**Rule:** Every external call needs a timeout. No exceptions. The default should be aggressive (2-5 seconds for most calls). A 30-second timeout means 30 seconds of a held thread/connection.

### Rate Limiting
**Algorithms:** Token bucket (smooth, allows bursts), sliding window (precise), fixed window (simple but bursty at boundaries).

**Apply at:** API gateway (global), per-service (protect individual services), per-client (fair usage).

---

## 7. Anti-Patterns to Watch For

### Distributed Monolith
Services that must be deployed together, share a database, or make synchronous calls in long chains. You have the complexity of microservices with none of the benefits.

**Fix:** Either go back to a monolith (seriously, it might be the right call) or properly decouple with events and service-owned data.

### Premature Optimization
Building for 10M users when you have 100. Every optimization has a complexity cost. Optimize when you have data showing a bottleneck, not when you imagine one.

### Golden Hammer
Using one technology for everything because you know it well. PostgreSQL is great, but it's not the best choice for every data access pattern. Be willing to use the right tool for the job.

### Chatty Microservices
Services that make many small calls to each other per request. Each call adds latency, failure risk, and debugging complexity. Batch operations, use events, or reconsider service boundaries.

### Shared Database
Multiple services reading/writing the same database tables. This creates invisible coupling — a schema change for one service breaks others. Each service should own its data.

### Resume-Driven Development
Choosing technologies because they look good on a resume rather than because they solve the problem. Kubernetes, microservices, and event sourcing are powerful — but not every system needs them.
