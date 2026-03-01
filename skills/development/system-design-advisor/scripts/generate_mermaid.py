#!/usr/bin/env python3
"""
Mermaid Diagram Generator (Fallback)
====================================
Generates architecture diagrams as Mermaid markup when the `diagrams` library
is not available. Mermaid can be rendered in Markdown, GitHub, or via
mermaid-cli (mmdc).

This is the fallback option — use generate_diagram.py with the full `diagrams`
library when possible, as it produces richer, cloud-provider-branded diagrams.

Usage:
  python generate_mermaid.py --spec <path-to-spec.mmd> --output <output-dir> [--format png|svg|pdf]
  python generate_mermaid.py --inline "<mermaid markup>" --output <output-dir>

  If mermaid-cli (mmdc) is installed, it renders to an image.
  Otherwise, it saves the .mmd file for the user to render elsewhere.

Examples:
  python generate_mermaid.py --inline "
graph LR
    LB[Load Balancer] --> Web1[Web Server 1]
    LB --> Web2[Web Server 2]
    Web1 --> DB[(PostgreSQL)]
    Web2 --> DB
    Web1 --> Cache[(Redis)]
    Web2 --> Cache
" --output ./out
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


# ─── Common architecture templates ──────────────────────────────────────────

TEMPLATES = {
    "web-service": """graph LR
    Client([Client]) --> LB[Load Balancer]
    LB --> Web1[Web Server]
    LB --> Web2[Web Server]
    Web1 --> DB[(Database)]
    Web2 --> DB
    Web1 --> Cache[(Cache)]
    Web2 --> Cache""",

    "microservices": """graph TB
    Client([Client]) --> GW[API Gateway]
    GW --> Auth[Auth Service]
    GW --> Users[User Service]
    GW --> Orders[Order Service]
    GW --> Notify[Notification Service]
    Users --> UsersDB[(Users DB)]
    Orders --> OrdersDB[(Orders DB)]
    Orders --> MQ{{Message Queue}}
    MQ --> Notify
    Notify --> Email[Email Provider]
    Notify --> Push[Push Service]""",

    "event-driven": """graph LR
    Producer1[Service A] --> Broker{{Event Broker}}
    Producer2[Service B] --> Broker
    Broker --> Consumer1[Consumer 1]
    Broker --> Consumer2[Consumer 2]
    Broker --> Consumer3[Consumer 3]
    Consumer1 --> DB1[(Database)]
    Consumer2 --> DB2[(Search Index)]
    Consumer3 --> DB3[(Analytics)]""",

    "cqrs": """graph TB
    Client([Client]) --> CMD[Command API]
    Client --> QRY[Query API]
    CMD --> WriteDB[(Write Store)]
    WriteDB --> |CDC / Events| Projector[Projector]
    Projector --> ReadDB[(Read Store)]
    QRY --> ReadDB""",

    "rag-pipeline": """graph TB
    Docs[Documents] --> Chunker[Chunker]
    Chunker --> Embedder[Embedding Model]
    Embedder --> VectorDB[(Vector Database)]
    User([User Query]) --> QEmbed[Query Embedder]
    QEmbed --> Search[Similarity Search]
    VectorDB --> Search
    Search --> Context[Context Assembly]
    Context --> LLM[LLM]
    LLM --> Response([Response])""",

    "ci-cd": """graph LR
    Dev[Developer] --> |push| Repo[Git Repository]
    Repo --> |trigger| CI[CI Pipeline]
    CI --> |test| Test[Run Tests]
    Test --> |build| Build[Build Image]
    Build --> |push| Registry[Container Registry]
    Registry --> |deploy| Staging[Staging]
    Staging --> |approve| Prod[Production]""",
}


def list_templates():
    """Print available templates."""
    print("📋 Available diagram templates:\n")
    for name, spec in TEMPLATES.items():
        # Show first line as description
        first_line = spec.strip().split("\n")[0]
        print(f"  {name:20s}  {first_line}")
    print(f"\nUse --template <name> to generate a template diagram.")


def render_mermaid(mermaid_code: str, output_dir: str, fmt: str = "png") -> str:
    """
    Render Mermaid markup to an image file.

    If mmdc (mermaid-cli) is available, renders to the requested format.
    Otherwise, saves as .mmd and .html (self-contained with Mermaid JS CDN).
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    mmd_file = output_path / "diagram.mmd"
    mmd_file.write_text(mermaid_code.strip())

    # Try rendering with mmdc
    if shutil.which("mmdc"):
        out_file = output_path / f"diagram.{fmt}"
        try:
            result = subprocess.run(
                ["mmdc", "-i", str(mmd_file), "-o", str(out_file),
                 "-b", "white", "--scale", "2"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0 and out_file.exists():
                print(f"✅ Rendered diagram: {out_file}")
                return str(out_file)
            else:
                print(f"⚠️  mmdc failed: {result.stderr}")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print("⚠️  mmdc rendering failed, falling back to HTML.")

    # Fallback: create a self-contained HTML file that renders via Mermaid JS
    html_file = output_path / "diagram.html"
    escaped_code = mermaid_code.strip().replace("`", "\\`").replace("${", "\\${")
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Architecture Diagram</title>
    <style>
        body {{
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }}
        .mermaid {{
            max-width: 95vw;
        }}
    </style>
</head>
<body>
    <pre class="mermaid">
{mermaid_code.strip()}
    </pre>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{ startOnLoad: true, theme: 'default' }});
    </script>
</body>
</html>"""
    html_file.write_text(html_content)

    # Also save the raw .mmd file
    print(f"✅ Mermaid file saved: {mmd_file}")
    print(f"✅ HTML viewer saved: {html_file}")
    print("   (Open the HTML file in a browser to see the rendered diagram)")
    return str(html_file)


def main():
    parser = argparse.ArgumentParser(
        description="Generate architecture diagrams using Mermaid syntax"
    )
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument("--spec", help="Path to a .mmd Mermaid file")
    group.add_argument("--inline", help="Inline Mermaid markup")
    group.add_argument("--template", help="Use a built-in template",
                       choices=list(TEMPLATES.keys()))
    parser.add_argument("--output", default=".", help="Output directory")
    parser.add_argument("--format", default="png", choices=["png", "svg", "pdf"],
                        help="Output format (default: png)")
    parser.add_argument("--list-templates", action="store_true",
                        help="List available templates")
    args = parser.parse_args()

    if args.list_templates:
        list_templates()
        return

    # Determine the mermaid code
    if args.template:
        code = TEMPLATES[args.template]
    elif args.spec:
        spec_path = Path(args.spec)
        if not spec_path.exists():
            print(f"❌ File not found: {args.spec}")
            sys.exit(1)
        code = spec_path.read_text()
    elif args.inline:
        code = args.inline
    else:
        parser.print_help()
        print("\nProvide --spec, --inline, or --template.")
        sys.exit(1)

    result = render_mermaid(code, args.output, args.format)
    if result:
        print(f"\n📊 Output: {result}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
