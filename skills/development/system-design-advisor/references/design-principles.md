# Design Principles Reference

## Table of Contents
1. SOLID Principles (System-Level Application)
2. Distributed Systems Principles
3. API Design Principles
4. Data Design Principles
5. Operational Principles
6. Cost Optimization Principles

---

## 1. SOLID Principles (System-Level Application)

These principles originate from object-oriented design (the Gang of Four era) but apply powerfully at the system and service level.

### Single Responsibility Principle (SRP)
**At the class level:** A class should have one reason to change.
**At the service level:** A service should own one bounded context. If a change to billing logic requires redeploying your user service, you have a responsibility boundary problem.

**How to identify violations:** If you need to coordinate deployments across multiple teams to ship a feature, or if a service has multiple unrelated data stores, SRP is likely violated.

**Practical application:** When decomposing a monolith, don't split by technical layer (API, business logic, data). Split by business capability (users, orders, payments). Each service owns its data and its behavior.

### Open-Closed Principle (OCP)
**At the system level:** Design systems that can be extended without modifying existing components. This is the core argument for event-driven architectures, plugin systems, and webhook patterns.

**Example:** Instead of adding an `if` branch for every new payment provider, design a payment gateway interface. New providers implement the interface. The core system never changes.

**Anti-pattern:** Feature flags that accumulate indefinitely — they're a sign that OCP isn't being applied and the system grows by modification rather than extension.

### Liskov Substitution Principle (LSP)
**At the system level:** If your system depends on "a cache," you should be able to swap Redis for Memcached without breaking anything upstream. This requires clean abstraction layers.

**Practical impact:** This is why you wrap third-party services behind your own interfaces. Your code should depend on `CacheService`, not `RedisClient`. When you need to migrate, you change one implementation, not fifty callsites.

### Interface Segregation Principle (ISP)
**At the API level:** Don't create one monolithic API that serves mobile, web, internal tools, and partner integrations. Each client has different needs. Consider BFF (Backend for Frontend) patterns or GraphQL to let clients request what they need.

**At the service level:** If service A only needs 2 of the 20 methods service B exposes, that coupling surface is too wide. Consider splitting B's interface or using events instead of direct calls.

### Dependency Inversion Principle (DIP)
**At the system level:** High-level business logic should not depend on infrastructure details. Your order processing logic should not know whether it's writing to PostgreSQL or DynamoDB.

**Implementation:** Use ports-and-adapters (hexagonal architecture). The core domain defines interfaces (ports). Infrastructure provides implementations (adapters). This makes testing trivial and migration possible.

---

## 2. Distributed Systems Principles

### CAP Theorem — and Why It's Often Misunderstood
The CAP theorem states that during a network partition, a distributed system must choose between consistency and availability. The key insight most people miss: **you don't choose once for the entire system.** Different data has different requirements:

- User authentication tokens → favor consistency (stale tokens = security risk)
- Product recommendation scores → favor availability (stale recs are fine)
- Financial transactions → strong consistency is non-negotiable
- Social media likes count → eventual consistency is perfectly acceptable

Design your system to make different CAP trade-offs for different data, not one global choice.

### The Fallacies of Distributed Computing
Every system designer should internalize these. The network is not reliable, latency is not zero, bandwidth is not infinite, the network is not secure, topology does change, there is not one administrator, transport cost is not zero, the network is not homogeneous.

**Practical impact:** Every remote call needs a timeout, a retry strategy, and a fallback. If your system assumes any of these fallacies, it will fail in production.

### Eventual Consistency
Many systems don't need strong consistency everywhere. The question is: "What's the cost of a user seeing stale data for N seconds?" If the answer is "annoying but not catastrophic," eventual consistency buys you massive scalability and availability wins.

**Key patterns for managing eventual consistency:**
- Optimistic UI updates with background sync
- Read-your-own-writes consistency (even if others see stale data, the writer sees their update)
- Conflict resolution strategies (last-write-wins, merge, manual resolution)

---

## 3. API Design Principles

### Design for the Consumer, Not the Implementation
Your API should reflect what clients need to do, not how your database is structured. If clients always need user + recent orders + recommendations together, provide an endpoint that returns all three — don't force three round trips.

### Versioning Strategy
- **URL versioning** (`/v1/users`) — Simple, explicit, works well for public APIs
- **Header versioning** — Cleaner URLs but harder to test/debug
- **No versioning** — Only works with additive-only changes and very disciplined teams

Recommendation: URL versioning for external APIs, additive-only changes for internal APIs with a deprecation policy.

### Idempotency
Every write endpoint should be idempotent or provide an idempotency mechanism. Network retries are inevitable — if `POST /orders` can be retried without creating duplicate orders, your system is resilient. Use idempotency keys.

### Pagination
Never return unbounded lists. Always paginate. Cursor-based pagination is more robust than offset-based for large, changing datasets.

---

## 4. Data Design Principles

### Normalize Until It Hurts, Denormalize Until It Works
Start normalized (3NF). When query performance demands it, denormalize strategically. Don't denormalize preemptively — it creates update anomalies and makes the schema harder to evolve.

### Schema Evolution
Design for schema changes from day one. Use migration tools. Prefer additive changes (new columns, new tables) over destructive ones (dropping columns, renaming). For NoSQL, consider schema versioning in documents.

### Data Locality
Put data close to where it's processed. If a service frequently joins across two tables, those tables belong in the same database. If two services share a table but never join, they should each own their own copy (via events or CDC).

---

## 5. Operational Principles

### Observability Over Monitoring
Monitoring tells you something is wrong. Observability tells you *why*. Invest in structured logging, distributed tracing, and metrics from day one — not after the first outage.

The three pillars: logs (what happened), metrics (how much/how fast), traces (the path through the system). You need all three.

### Fail Fast, Recover Gracefully
Services should fail fast (don't hang for 30 seconds on a dead dependency — timeout in 2 seconds) and recover gracefully (circuit breakers, fallback responses, graceful degradation).

### Immutable Infrastructure
Don't SSH into servers to fix things. Build new images, deploy, route traffic. This makes rollbacks trivial and eliminates configuration drift.

### Blast Radius
Design every change to have a small blast radius. Canary deployments, feature flags, regional rollouts — all techniques to ensure a bad deploy doesn't take down everything at once.

---

## 6. Cost Optimization Principles

### Right-Size First, Optimize Later
Over-provisioning is expensive. Under-provisioning causes outages. Start with reasonable estimates, measure actual usage, then right-size. Auto-scaling is not a substitute for understanding your workload.

### The 80/20 of Cloud Costs
Typically, 80% of cloud spend comes from compute, storage, and data transfer. Focus optimization there first. Don't spend a week optimizing Lambda costs if your RDS instance is 10x oversized.

### Reserved vs On-Demand
If your workload is predictable and stable, reserved instances or committed use discounts save 30-60%. Use on-demand for variable workloads and spot/preemptible for fault-tolerant batch processing.

### Architecture Drives Cost
The biggest cost lever is architecture, not instance size. Switching from synchronous polling to event-driven, adding a CDN, or moving to serverless for bursty workloads can 10x your cost efficiency.
