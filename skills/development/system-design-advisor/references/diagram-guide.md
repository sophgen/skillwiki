# Architecture Diagram Generation Guide

## Table of Contents
1. When to Generate Diagrams
2. Using the `diagrams` Library (Primary)
3. Using Mermaid (Fallback)
4. Diagram Best Practices
5. Common Architecture Diagram Templates

---

## 1. When to Generate Diagrams

Generate a diagram when:
- The user asks for an architecture diagram or system design visual
- You're recommending a system architecture and a diagram would clarify it
- The user is preparing for a system design interview and would benefit from seeing the design
- The discussion involves multiple services/components with relationships that are easier to understand visually

Don't generate a diagram when:
- The user asked a simple "X vs Y" comparison question
- The architecture is trivially simple (e.g., single server + database)
- The user explicitly just wants a text explanation

**Always ask the user if they'd like a diagram** when recommending an architecture with 3+ components.

---

## 2. Using the `diagrams` Library (Primary)

The `diagrams` library (https://github.com/mingrammer/diagrams) produces professional, cloud-provider-branded architecture diagrams using Graphviz.

### Setup Check
Before generating, verify dependencies:
```bash
which dot  # Check Graphviz is installed
python3 -c "import diagrams"  # Check diagrams library is installed
```

If not installed:
```bash
# Install Graphviz
apt-get install -y graphviz    # Debian/Ubuntu
brew install graphviz           # macOS

# Install diagrams
pip install diagrams
```

### Generating a Diagram
1. Write the diagram spec as a Python file
2. Run it via the script: `python scripts/generate_diagram.py --spec <file.py> --output <dir>`
3. Or inline: `python scripts/generate_diagram.py --inline "<code>" --output <dir>`

### Diagram Spec Writing Guide

Always use `show=False` and set `filename` explicitly:

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2, ECS, Lambda
from diagrams.aws.database import RDS, ElastiCache, Dynamodb
from diagrams.aws.network import ELB, CloudFront, Route53
from diagrams.aws.integration import SQS, SNS
from diagrams.aws.storage import S3

with Diagram("My Architecture", show=False, filename="architecture", outformat="png", direction="LR"):
    # ... nodes and connections
```

### Key Import Paths

**AWS:**
- `diagrams.aws.compute` — EC2, ECS, EKS, Lambda, Fargate
- `diagrams.aws.database` — RDS, Aurora, Dynamodb, ElastiCache, Redshift
- `diagrams.aws.network` — ELB, ALB, NLB, CloudFront, Route53, APIGateway, VPC
- `diagrams.aws.integration` — SQS, SNS, Kinesis, StepFunctions, EventBridge
- `diagrams.aws.storage` — S3, EBS, EFS
- `diagrams.aws.analytics` — Athena, EMR, Glue, Quicksight
- `diagrams.aws.ml` — Sagemaker, Rekognition, Comprehend
- `diagrams.aws.security` — IAM, Cognito, WAF, KMS

**GCP:**
- `diagrams.gcp.compute` — GCE, GKE, AppEngine, Functions, Run
- `diagrams.gcp.database` — SQL, Spanner, Bigtable, Firestore, Memorystore
- `diagrams.gcp.network` — LoadBalancing, CDN, DNS, VPC
- `diagrams.gcp.analytics` — BigQuery, Dataflow, PubSub, Dataproc

**Azure:**
- `diagrams.azure.compute` — VM, AKS, FunctionApps, ContainerInstances
- `diagrams.azure.database` — SQLDatabases, CosmosDb, CacheForRedis
- `diagrams.azure.network` — LoadBalancer, ApplicationGateway, FrontDoor, CDN

**Kubernetes:**
- `diagrams.k8s.compute` — Pod, Deployment, ReplicaSet, StatefulSet, DaemonSet, Job
- `diagrams.k8s.network` — Ingress, Service
- `diagrams.k8s.storage` — PV, PVC, StorageClass

**On-Premises / Generic:**
- `diagrams.onprem.compute` — Server, Nomad, Docker
- `diagrams.onprem.database` — PostgreSQL, MySQL, MongoDB, Cassandra, Redis, InfluxDB, Neo4J
- `diagrams.onprem.inmemory` — Redis, Memcached
- `diagrams.onprem.queue` — Kafka, RabbitMQ, ActiveMQ, Celery
- `diagrams.onprem.network` — Nginx, HAProxy, Envoy, Istio, Consul
- `diagrams.onprem.monitoring` — Grafana, Prometheus, Datadog
- `diagrams.onprem.ci` — Jenkins, GithubActions, GitlabCI
- `diagrams.onprem.container` — Docker, Containerd
- `diagrams.onprem.client` — Client, User, Users
- `diagrams.generic.compute` — Rack
- `diagrams.generic.database` — SQL
- `diagrams.generic.network` — Firewall, Router, Switch
- `diagrams.programming.language` — Python, Go, Java, JavaScript, Rust, Typescript

**SaaS:**
- `diagrams.saas.cdn` — Cloudflare
- `diagrams.saas.chat` — Slack, Discord, Teams
- `diagrams.saas.identity` — Auth0, Okta
- `diagrams.saas.logging` — Datadog, NewRelic, PaperTrail

### Clusters (Grouping)
Use `Cluster` to group related components:

```python
with Diagram("Clustered Web Service", show=False, filename="clustered"):
    with Cluster("VPC"):
        with Cluster("Public Subnet"):
            lb = ELB("ALB")
        with Cluster("Private Subnet"):
            web_group = [EC2("web1"), EC2("web2"), EC2("web3")]
        with Cluster("Database Subnet"):
            db_primary = RDS("primary")
            db_replica = RDS("replica")

    lb >> web_group >> db_primary
    db_primary - Edge(style="dashed") - db_replica
```

### Edge Styling
```python
from diagrams import Edge

# Labeled edge
node_a >> Edge(label="HTTPS") >> node_b

# Styled edge
node_a >> Edge(color="red", style="dashed", label="failover") >> node_b
```

### Direction
- `direction="LR"` — Left to right (good for data flow / pipelines)
- `direction="TB"` — Top to bottom (good for layered architectures)
- `direction="BT"` — Bottom to top
- `direction="RL"` — Right to left

---

## 3. Using Mermaid (Fallback)

When `diagrams` + Graphviz aren't available, use Mermaid as a fallback. Mermaid produces clean diagrams that render in Markdown, GitHub, and browsers.

### Generating a Mermaid Diagram
```bash
python scripts/generate_mermaid.py --inline "<mermaid code>" --output <dir>
python scripts/generate_mermaid.py --template web-service --output <dir>
python scripts/generate_mermaid.py --list-templates
```

### Built-in Templates
The Mermaid script includes common templates: `web-service`, `microservices`, `event-driven`, `cqrs`, `rag-pipeline`, `ci-cd`. Use these as starting points and customize.

### Mermaid Syntax Quick Reference

**Flow diagram (most common for architecture):**
```
graph LR
    A[Service A] --> B[Service B]
    A --> C[(Database)]
    B --> D{{Message Queue}}
    D --> E[Consumer]
```

**Node shapes:**
- `[text]` — Rectangle (default, services)
- `[(text)]` — Cylinder (databases)
- `([text])` — Rounded (clients/users)
- `{{text}}` — Hexagon (queues/brokers)
- `{text}` — Diamond (decisions)
- `>text]` — Flag
- `((text))` — Circle

**Directions:** `graph LR` (left-right), `graph TB` (top-bottom)

**Subgraphs (for grouping):**
```
graph TB
    subgraph VPC
        subgraph Public
            LB[Load Balancer]
        end
        subgraph Private
            Web[Web Servers]
            DB[(Database)]
        end
    end
    LB --> Web --> DB
```

---

## 4. Diagram Best Practices

### Keep It Clear
- Limit to 10-15 nodes maximum per diagram. More than that and it becomes unreadable.
- For complex systems, create multiple diagrams at different zoom levels (overview → component deep-dive).
- Use clusters/subgraphs to show logical grouping (VPCs, subnets, services teams).

### Use Consistent Node Types
- Services/compute → rectangles
- Databases → cylinders
- Queues/brokers → hexagons or special shapes
- External clients → rounded shapes
- Use the cloud-provider-specific icons when using the `diagrams` library.

### Show Data Flow Direction
- Left-to-right for request/response flow and data pipelines
- Top-to-bottom for layered architectures (client → gateway → services → data)
- Label edges with protocols or data types when it adds clarity (e.g., "gRPC", "events", "SQL")

### Match the Discussion
- The diagram should directly support the architecture being discussed
- Highlight the components relevant to the current decision
- Don't include every possible detail — focus on what matters for the trade-off at hand

---

## 5. Common Architecture Templates (diagrams library)

### Basic Web Service
```python
from diagrams import Diagram, Cluster
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.network import ELB, CloudFront, Route53

with Diagram("Web Service", show=False, filename="web_service", direction="LR"):
    dns = Route53("DNS")
    cdn = CloudFront("CDN")
    lb = ELB("ALB")

    with Cluster("Auto Scaling Group"):
        web = [EC2("web1"), EC2("web2")]

    cache = ElastiCache("Redis")
    db = RDS("PostgreSQL")

    dns >> cdn >> lb >> web >> db
    web >> cache
```

### Microservices with Event Bus
```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import ECS
from diagrams.aws.database import RDS, Dynamodb
from diagrams.aws.integration import SQS, SNS, EventBridge
from diagrams.aws.network import APIGateway

with Diagram("Microservices", show=False, filename="microservices", direction="TB"):
    gw = APIGateway("API Gateway")
    bus = EventBridge("Event Bus")

    with Cluster("User Domain"):
        user_svc = ECS("User Service")
        user_db = RDS("Users DB")
        user_svc >> user_db

    with Cluster("Order Domain"):
        order_svc = ECS("Order Service")
        order_db = Dynamodb("Orders DB")
        order_svc >> order_db

    with Cluster("Notification Domain"):
        notify_svc = ECS("Notification")
        notify_queue = SQS("Notify Queue")
        notify_queue >> notify_svc

    gw >> user_svc
    gw >> order_svc
    order_svc >> Edge(label="OrderCreated") >> bus
    bus >> notify_queue
```

### RAG Pipeline
```python
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.client import Users
from diagrams.aws.ml import Sagemaker
from diagrams.aws.storage import S3

with Diagram("RAG Pipeline", show=False, filename="rag_pipeline", direction="TB"):
    docs = S3("Document Store")
    users = Users("Users")

    with Cluster("Ingestion Pipeline"):
        chunker = Sagemaker("Chunker")
        embedder = Sagemaker("Embedder")

    vectordb = PostgreSQL("pgvector")

    with Cluster("Query Pipeline"):
        q_embed = Sagemaker("Query Embedder")
        retriever = Sagemaker("Retriever")
        llm = Sagemaker("LLM")

    docs >> chunker >> embedder >> vectordb
    users >> q_embed >> retriever
    vectordb >> Edge(label="top-K") >> retriever >> Edge(label="context") >> llm >> users
```

### CQRS + Event Sourcing
```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb, ElastiCache
from diagrams.aws.integration import Kinesis
from diagrams.aws.network import APIGateway

with Diagram("CQRS", show=False, filename="cqrs", direction="LR"):
    gw = APIGateway("API GW")

    with Cluster("Command Side"):
        cmd_handler = Lambda("Command Handler")
        event_store = Kinesis("Event Stream")
        write_db = Dynamodb("Event Store")
        cmd_handler >> event_store >> write_db

    with Cluster("Query Side"):
        projector = Lambda("Projector")
        read_db = ElastiCache("Read Model")
        query_handler = Lambda("Query Handler")
        query_handler >> read_db

    gw >> cmd_handler
    gw >> query_handler
    event_store >> Edge(label="project") >> projector >> read_db
```
