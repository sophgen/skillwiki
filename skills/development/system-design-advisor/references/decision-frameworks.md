# Decision Frameworks Reference

## Table of Contents
1. Database Selection Framework
2. Message Broker Selection Framework
3. API Style Selection Framework
4. Caching Strategy Framework
5. Architecture Style Selection Framework
6. Compute Platform Selection Framework

---

## 1. Database Selection Framework

### Relational Databases (PostgreSQL, MySQL, SQL Server)

**Choose when:**
- Data has clear relationships and benefits from joins
- ACID transactions are required
- Schema is relatively stable
- Complex queries with aggregations, grouping, filtering
- Team has SQL expertise

**PostgreSQL specifically** is the default recommendation for most applications. It handles JSON (document-like flexibility), full-text search, geospatial data (PostGIS), and even vector similarity search (pgvector) — all in one system. Don't reach for a specialized database until Postgres can't handle your workload.

**Scale limits:** Single Postgres instance can handle millions of rows and thousands of QPS comfortably. Read replicas extend read capacity 5-10x. Beyond that, consider Citus for horizontal sharding or evaluate if you need a distributed SQL database (CockroachDB, YugabyteDB).

### Document Databases (MongoDB, DynamoDB, Firestore)

**Choose when:**
- Data is naturally hierarchical/nested (user profiles with varying fields)
- Schema varies significantly across records
- Read patterns are primarily by primary key or simple filters
- You need horizontal scaling from day one
- Low-latency key-value access is the primary pattern

**MongoDB** — Good for prototyping, flexible schemas, moderate scale. Operational complexity at scale. Consider if you'll outgrow Postgres's JSON support first.

**DynamoDB** — Excellent for predictable, key-based access patterns at massive scale. Terrible for ad-hoc queries. Requires careful data modeling upfront (single-table design). Very cost-effective if access patterns are well-understood.

### Key-Value Stores (Redis, Memcached)

**Choose when:**
- Sub-millisecond latency is required
- Data fits in memory
- Access is by key (or simple secondary indexes in Redis)
- Use cases: caching, session storage, rate limiting, leaderboards, real-time counters

**Redis vs Memcached:** Redis wins for most use cases (data structures, persistence, pub/sub). Memcached only if you need multi-threaded performance for simple key-value caching with no persistence.

### Wide-Column Stores (Cassandra, ScyllaDB, HBase)

**Choose when:**
- Write-heavy workloads at massive scale (100K+ writes/sec)
- High availability across regions is critical
- Data has a time-series or append-heavy pattern
- Acceptable trade-off: limited query flexibility for extreme write throughput

**Watch out for:** Data modeling in Cassandra is query-driven, not entity-driven. You model tables around your queries. If you don't know your queries upfront, this is the wrong choice.

### Graph Databases (Neo4j, Amazon Neptune, ArangoDB)

**Choose when:**
- The core value of your data is in relationships (social networks, recommendation engines, fraud detection, knowledge graphs)
- You need to traverse relationships efficiently (friends-of-friends, shortest path)
- Relationship depth is variable and deep (3+ hops)

**Don't use when:** You can express your queries as simple joins. A 2-level join in SQL is usually faster and simpler than spinning up a graph database.

### Time-Series Databases (TimescaleDB, InfluxDB, QuestDB)

**Choose when:**
- Data is timestamped and append-only (metrics, logs, IoT sensor data)
- Queries are primarily time-range based with aggregations
- Data retention policies are needed (auto-delete old data)
- High write throughput for time-stamped data

**TimescaleDB** is built on Postgres — consider it if you're already using Postgres and want time-series capabilities without a new system.

### Search Engines (Elasticsearch, OpenSearch, Meilisearch, Typesense)

**Choose when:**
- Full-text search with relevance ranking
- Faceted search (filter by category, price range, etc.)
- Log aggregation and analysis (ELK stack)
- Complex text queries across large document collections

**Don't use as your primary database.** Elasticsearch is not ACID-compliant and data loss on failure is a real risk. Use it as a secondary index fed by your primary database.

---

## 2. Message Broker Selection Framework

### Apache Kafka

**Choose when:**
- Event streaming with replay capability
- High throughput (millions of events/sec)
- Multiple consumers need to read the same stream independently
- Event sourcing or log-based architectures
- You need at-least-once or exactly-once semantics

**Trade-offs:** Operational complexity (ZooKeeper/KRaft, partition management, consumer group coordination). Consider managed Kafka (Confluent Cloud, AWS MSK) to reduce ops burden.

### RabbitMQ

**Choose when:**
- Traditional work queue (distribute tasks to workers)
- Complex routing logic (topic exchanges, headers-based routing)
- Message-level acknowledgment and retry matters
- Moderate throughput (tens of thousands/sec is comfortable)
- Team prefers simplicity over Kafka's power

**Trade-offs:** Less suitable for event replay. Messages are consumed and gone (unless you configure persistence carefully).

### Amazon SQS / Google Cloud Pub/Sub

**Choose when:**
- You're on AWS/GCP and want zero operational overhead
- Simple queue or pub/sub patterns
- Serverless architectures (SQS + Lambda is a natural fit)
- You don't need replay or complex stream processing

**Trade-offs:** Vendor lock-in. Less control over partitioning and consumer semantics.

### Redis Streams / Redis Pub/Sub

**Choose when:**
- You already have Redis and need lightweight messaging
- Low-latency pub/sub for real-time features
- Message volume is moderate
- You don't need guaranteed delivery or complex routing

---

## 3. API Style Selection Framework

### REST

**Choose when:**
- Public-facing APIs (widest adoption, easiest to consume)
- Resource-oriented operations (CRUD on entities)
- Caching is important (HTTP caching works natively)
- Simple, well-understood patterns are valued

**Best practices:** Use nouns not verbs, proper HTTP methods, consistent error format, HATEOAS only if you'll actually use it (most don't).

### GraphQL

**Choose when:**
- Multiple client types need different data shapes (mobile vs web)
- Clients frequently over-fetch or under-fetch with REST
- Rapid frontend iteration without backend changes
- Aggregating data from multiple backend services

**Watch out for:** N+1 query problems (use DataLoader), query complexity attacks (require depth/complexity limits), caching is harder than REST. Operational complexity is higher.

### gRPC

**Choose when:**
- Service-to-service communication (internal microservices)
- Low latency and high throughput matter
- Bidirectional streaming is needed
- Strong typing with protocol buffers is valued
- Polyglot services (proto generates clients for any language)

**Not ideal for:** Browser clients (needs gRPC-Web proxy), public APIs (REST/GraphQL have better tooling).

### WebSocket

**Choose when:**
- Real-time bidirectional communication (chat, live updates, collaborative editing)
- Server needs to push updates to clients
- Low-latency updates are more important than request-response simplicity

**Consider SSE (Server-Sent Events)** if you only need server-to-client push — it's simpler than WebSocket and works over HTTP.

---

## 4. Caching Strategy Framework

### Cache-Aside (Lazy Loading)
Application checks cache first; on miss, loads from database and populates cache.
- **Pros:** Only caches what's actually requested; cache failure doesn't break the app
- **Cons:** Initial requests are always slow (cold cache); stale data possible

### Write-Through
Application writes to cache and database simultaneously.
- **Pros:** Cache is always up-to-date
- **Cons:** Write latency increases; cache may contain data that's never read

### Write-Behind (Write-Back)
Application writes to cache; cache asynchronously writes to database.
- **Pros:** Very fast writes; batches database writes
- **Cons:** Data loss risk if cache fails before writing to database

### Read-Through
Cache itself handles loading from the database on miss.
- **Pros:** Application code is simpler
- **Cons:** Requires cache infrastructure that supports this pattern

### Recommended Default
Cache-aside is the safest default. Use write-through when consistency is critical. Use write-behind only when write performance is the bottleneck AND you can tolerate some data loss risk.

### TTL Strategy
- Shorter TTL (seconds to minutes): frequently changing data, user sessions
- Longer TTL (hours to days): reference data, configuration, content
- No TTL: immutable data (versioned assets, historical records)

---

## 5. Architecture Style Selection Framework

### Monolith
**Choose when:** Team is small (<10 engineers), product is early-stage, deployment simplicity matters, domain boundaries aren't clear yet.

**A well-structured monolith** (clear module boundaries, dependency rules, separate packages per domain) can scale further than people think. Pinterest ran a monolith to 100M+ users.

### Modular Monolith
**Choose when:** You want monolith simplicity but microservice-style boundaries. Each module owns its data and exposes a clean interface. Modules can be extracted to services later if needed.

This is often the **best starting architecture** — you get deployment simplicity with clean boundaries.

### Microservices
**Choose when:** Multiple teams need to deploy independently, services have genuinely different scaling needs, different technology stacks are needed per service, the domain is well-understood and boundaries are clear.

**Prerequisites:** CI/CD maturity, container orchestration (Kubernetes or managed equivalent), distributed tracing, service mesh or API gateway, team per service (or per 2-3 services).

**Don't use when:** You're a small team, you're still figuring out domain boundaries, you don't have the operational maturity to manage distributed systems.

### Serverless
**Choose when:** Traffic is bursty and unpredictable, you want to pay per invocation, functions are short-lived and stateless, you want minimal operational overhead.

**Watch out for:** Cold starts (matters for latency-sensitive APIs), vendor lock-in, debugging complexity, cost can exceed instances at sustained high traffic.

### Event-Driven
**Choose when:** Loose coupling between services is important, you need to react to changes across the system, workflows are asynchronous, you want independent scaling of producers and consumers.

**Often combined with microservices.** Event-driven is a communication pattern, not an alternative to microservices.

---

## 6. Compute Platform Selection Framework

### Containers (ECS, EKS, GKE, Cloud Run)
**Default choice** for most production workloads. Portable, well-understood, good ecosystem.

- **ECS/Fargate** — Simpler than Kubernetes, good for AWS-native teams
- **Kubernetes (EKS/GKE)** — Maximum flexibility, but significant operational complexity. Worth it at scale (50+ services) or when you need the ecosystem (Istio, Argo, etc.)
- **Cloud Run** — Container-based serverless. Great middle ground: container portability + serverless scaling.

### Serverless Functions (Lambda, Cloud Functions)
Best for event-driven triggers, glue code, and bursty workloads. Not ideal for long-running processes or latency-sensitive APIs.

### VMs (EC2, Compute Engine)
Still valid for legacy applications, GPU workloads, or when you need full OS control. Prefer containers for new workloads.

### Edge Compute (CloudFlare Workers, Lambda@Edge)
For latency-critical workloads that benefit from running close to users. Static content serving, API routing, personalization, A/B testing at the edge.
