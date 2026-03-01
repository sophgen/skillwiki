# AI/ML System Design Reference

## Table of Contents
1. Vector Database Selection
2. RAG Architecture Patterns
3. Model Serving Infrastructure
4. LLM Application Architecture
5. ML Pipeline Design
6. Feature Store Design
7. Cost Optimization for AI Workloads

---

## 1. Vector Database Selection

This is one of the most common "should I use X or Y" questions in AI system design. The answer depends heavily on your scale, existing infrastructure, and operational requirements.

### PostgreSQL + pgvector

**Choose when:**
- You already use PostgreSQL (this is the strongest argument)
- Vector search is one feature among many, not the core workload
- Dataset is under ~5M vectors
- You want to avoid managing another database
- ACID transactions involving both relational and vector data matter
- Hybrid queries (SQL filters + vector similarity) are common

**Strengths:** Operational simplicity (one database to manage), full SQL capabilities, transactional consistency, mature ecosystem, HNSW and IVFFlat index support.

**Limitations:** Not optimized purely for vector operations. At very large scale (10M+ vectors), purpose-built vector databases will outperform on pure similarity search throughput.

**Recommendation:** pgvector is the default choice for most applications. Start here unless you have a specific reason not to.

### ChromaDB

**Choose when:**
- Prototyping and local development
- Small-scale applications (< 1M vectors)
- Python-native workflow with minimal setup
- Embedding + metadata storage in a lightweight package

**Strengths:** Dead simple to get started, good Python API, works well for experiments and small apps.

**Limitations:** Not production-hardened at scale, limited query capabilities compared to Postgres, no ACID guarantees, community is younger.

**Recommendation:** Great for prototyping. Migrate to pgvector or a purpose-built solution before production.

### Pinecone

**Choose when:**
- Fully managed service is a priority (zero operational overhead)
- You need real-time, low-latency vector search at scale
- You don't want to manage infrastructure
- Budget allows for managed service pricing

**Strengths:** Fully managed, auto-scaling, low latency, good developer experience, metadata filtering.

**Limitations:** Vendor lock-in, cost can be significant at scale, less flexibility than self-hosted options.

### Weaviate

**Choose when:**
- You need built-in vectorization (Weaviate can call embedding models automatically)
- Multi-modal search (text, images) is needed
- GraphQL API is preferred
- You want a hybrid search (vector + keyword) out of the box

**Strengths:** Integrated vectorization, good hybrid search, flexible deployment (cloud or self-hosted), active community.

**Limitations:** Operational complexity if self-hosted, newer than some alternatives.

### Milvus / Zilliz

**Choose when:**
- Very large-scale vector search (billions of vectors)
- High throughput vector operations
- Cloud-native deployment on Kubernetes
- You need advanced indexing algorithms

**Strengths:** Designed for massive scale, multiple index types, GPU acceleration, distributed architecture.

**Limitations:** Complex to operate (especially self-hosted), steep learning curve, overkill for small datasets.

### Decision Matrix Summary

| Factor              | pgvector | ChromaDB | Pinecone | Weaviate | Milvus |
|---------------------|----------|----------|----------|----------|--------|
| Simplicity          | High*    | Very High| High     | Medium   | Low    |
| Max Scale           | Medium   | Low      | High     | High     | Very High |
| Operational Burden  | Low*     | Very Low | None     | Medium   | High   |
| Query Flexibility   | Very High| Low      | Medium   | High     | Medium |
| Cost at Scale       | Low      | Low      | High     | Medium   | Medium |
| Production Readiness| High     | Low      | High     | High     | High   |

*If you already run PostgreSQL

---

## 2. RAG Architecture Patterns

### Basic RAG
Document → Chunk → Embed → Store in vector DB → Query: embed question → retrieve top-K → pass to LLM with context.

**Good for:** Simple Q&A over documents, knowledge base search, customer support.

**Limitations:** Retrieval quality is the bottleneck. Poor chunking or irrelevant retrievals lead to poor answers.

### Advanced RAG Techniques

**Chunking strategies:**
- Fixed-size chunks (simple, fast, but can split sentences/ideas)
- Semantic chunking (split by topic/meaning — better quality, more complex)
- Recursive/hierarchical chunking (document → sections → paragraphs)
- Overlapping chunks (windows with overlap to preserve context at boundaries)

**Retrieval improvements:**
- Hybrid search: combine vector similarity with keyword search (BM25) for better recall
- Re-ranking: retrieve top-50, then re-rank with a cross-encoder to get top-5
- Query transformation: rewrite the user query to improve retrieval (HyDE, multi-query)
- Metadata filtering: pre-filter by date, source, category before vector search

**Context optimization:**
- Contextual compression: summarize retrieved chunks before passing to LLM
- Lost in the middle: LLMs attend less to middle context — put important info at start/end
- Citation tracking: map answer sentences back to source chunks for verifiability

### Agentic RAG
The LLM decides what to retrieve and when, using tool calls. Instead of one-shot retrieval, the agent can search, evaluate, search again, and synthesize.

**When to use:** Complex questions that require multi-step reasoning, queries that span multiple document collections, when the agent needs to decide which knowledge base to query.

**Trade-off:** Higher latency and cost (multiple LLM calls), but significantly better quality for complex queries.

### Graph RAG
Combine knowledge graphs with vector retrieval. Entities and relationships are stored in a graph; vector search finds relevant subgraphs.

**When to use:** When relationships between entities matter (research papers, organizational knowledge, compliance documents).

---

## 3. Model Serving Infrastructure

### Real-Time Inference

**Single model, moderate traffic:** Simple API server (FastAPI/Flask) with the model loaded in memory. Scale with load balancer + multiple instances.

**High throughput:** Dedicated serving frameworks — TensorFlow Serving, Triton Inference Server, vLLM (for LLMs). These handle batching, model management, and GPU optimization.

**Multi-model:** Model registry + dynamic loading. Kubernetes + Knative or Seldon for model deployment and scaling.

### Batch Inference
For non-real-time predictions (daily recommendations, nightly scoring).

**Approach:** Spark/Dask for distributed batch processing, or simple scheduled jobs for smaller scales. Store results in a database/cache for serving.

**When to prefer batch over real-time:** When predictions don't need to be fresh, when the same prediction is requested many times, when cost matters more than latency.

### LLM Serving Specifics

**Self-hosted LLMs:**
- vLLM: Best throughput for most open-source models (PagedAttention, continuous batching)
- TGI (Text Generation Inference by HuggingFace): Good alternative, easy setup
- Ollama: Local development and small-scale deployment

**GPU selection:** H100 > A100 > A10G > T4 in capability. Match GPU to model size. 7B parameter models fit on A10G; 70B models need multiple A100s or H100s.

**Cost optimization:** Use spot/preemptible GPUs for batch inference. Reserve GPUs for real-time serving. Consider quantization (4-bit, 8-bit) to reduce GPU requirements.

---

## 4. LLM Application Architecture

### Gateway Pattern
Route all LLM calls through a gateway that handles: model selection, rate limiting, cost tracking, fallback between providers, prompt management, response caching.

**Why:** You will switch models, providers, and configurations frequently. A gateway makes this painless. Tools: LiteLLM, Portkey, custom gateway.

### Prompt Management
Treat prompts as code: version control, testing, staging environments. Separate prompt templates from application logic. A/B test prompts to optimize quality.

### Guardrails Architecture
Input validation → LLM call → Output validation → Response.

**Input guardrails:** PII detection, injection detection, topic filtering.
**Output guardrails:** Hallucination detection, toxicity filtering, format validation, fact-checking against source documents.

### Cost Architecture
LLM costs scale with usage in ways traditional software doesn't.

**Key strategies:**
- Cache common queries (semantic caching — similar questions get cached responses)
- Use smaller models for simple tasks (routing: classify query complexity → route to appropriate model)
- Batch where possible
- Set per-user/per-tenant budgets
- Monitor cost per query, cost per feature, cost per user

---

## 5. ML Pipeline Design

### Training Pipeline
Data collection → Preprocessing → Feature engineering → Training → Evaluation → Model registry → Deployment.

**Key principles:**
- Reproducibility: every run should be reproducible from code + data version
- Versioning: version data, code, models, and configurations together
- Automation: manual training pipelines don't scale

**Tools by complexity:**
- Simple: Jupyter notebooks + MLflow for tracking
- Medium: Airflow/Prefect for orchestration + MLflow for registry
- Large scale: Kubeflow, SageMaker Pipelines, Vertex AI Pipelines

### Monitoring and Drift Detection
Models degrade over time as the world changes.

**Monitor:** Input data distribution (data drift), prediction distribution (concept drift), model performance metrics (accuracy drift), latency and throughput.

**Retraining triggers:** Scheduled (weekly/monthly), performance-based (accuracy drops below threshold), data-based (distribution shift detected).

---

## 6. Feature Store Design

### When You Need a Feature Store
- Multiple models share the same features
- Training-serving skew is a problem (features computed differently in training vs serving)
- Feature computation is expensive and should be cached
- You need point-in-time correct features for training

### Architecture
**Offline store:** Historical features for training (data warehouse: BigQuery, Snowflake, S3/Parquet).
**Online store:** Low-latency features for serving (Redis, DynamoDB).
**Feature computation:** Batch (Spark, SQL) and streaming (Flink, Spark Streaming).

**Tools:** Feast (open source), Tecton (managed), SageMaker Feature Store, Vertex AI Feature Store.

### When You Don't Need a Feature Store
If you have one model, straightforward features, and no training-serving skew issues, a feature store adds complexity without value. Just compute features in your serving pipeline.

---

## 7. Cost Optimization for AI Workloads

### The Cost Hierarchy (optimize in this order)
1. **Do you need AI at all?** — Rules, heuristics, and traditional ML are cheaper than LLMs
2. **Model size** — Use the smallest model that meets quality requirements
3. **Inference optimization** — Quantization, batching, caching
4. **Infrastructure** — Spot instances, right-sizing, auto-scaling
5. **Architecture** — Async processing, tiered models, pre-computation

### Tiered Model Architecture
Route queries to models based on complexity:
- Tier 1 (simple): Rules engine or small model (fast, cheap)
- Tier 2 (moderate): Medium model (Haiku/Sonnet class)
- Tier 3 (complex): Large model (Opus class)

A classifier routes each query to the appropriate tier. 80% of queries might be handled by Tier 1-2.

### Caching Strategies for AI
- **Exact match cache:** Same input → same output (great for repeated queries)
- **Semantic cache:** Similar inputs → cached output (reduces calls for paraphrased questions)
- **Embedding cache:** Cache embeddings to avoid re-computing for known documents
- **Result cache:** Cache final answers for common question patterns
