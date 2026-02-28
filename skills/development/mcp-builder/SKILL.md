---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).
license: Complete terms in LICENSE.txt
metadata:
  author: Anthropic
  difficulty: advanced
  rating: "4.6"
  domain: development
  use-cases: "mcp-server-creation, api-integration, tool-development, llm-tooling"
  featured: "true"
  tags: "mcp, model-context-protocol, api, typescript, python, tools, llm"
---

# MCP Server Development Guide

## Overview

Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks.

**Recommended stack:**
- **Language**: TypeScript (high-quality SDK support and good compatibility in many execution environments. Plus AI models are good at generating TypeScript code, benefiting from its broad usage, static typing and good linting tools)
- **Transport**: Streamable HTTP for remote servers, using stateless JSON (simpler to scale and maintain). stdio for local servers.

## High-Level Workflow

Creating a high-quality MCP server involves four main phases:

### Phase 1: Deep Research and Planning

#### 1.1 Understand Modern MCP Design

- **API Coverage vs. Workflow Tools**: Balance comprehensive API endpoint coverage with specialized workflow tools.
- **Tool Naming and Discoverability**: Use consistent prefixes (e.g., `github_create_issue`, `github_list_repos`) and action-oriented naming.
- **Context Management**: Design tools that return focused, relevant data.
- **Actionable Error Messages**: Error messages should guide agents toward solutions.

#### 1.2 Study MCP Protocol Documentation

Navigate the MCP specification at `https://modelcontextprotocol.io/sitemap.xml`. Key areas:
- Specification overview and architecture
- Transport mechanisms (streamable HTTP, stdio)
- Tool, resource, and prompt definitions

#### 1.3 Study Framework Documentation

**Load framework documentation:**
- **MCP Best Practices**: See `reference/mcp_best_practices.md`
- **TypeScript SDK**: Fetch from `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- **Python SDK**: Fetch from `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`

#### 1.4 Plan Your Implementation

Review the service's API documentation to identify key endpoints, authentication requirements, and data models. Prioritize comprehensive API coverage.

### Phase 2: Implementation

#### 2.1 Set Up Project Structure

- [TypeScript Guide](./reference/node_mcp_server.md) - Project structure, package.json, tsconfig.json
- [Python Guide](./reference/python_mcp_server.md) - Module organization, dependencies

#### 2.2 Implement Core Infrastructure

Create shared utilities:
- API client with authentication
- Error handling helpers
- Response formatting (JSON/Markdown)
- Pagination support

#### 2.3 Implement Tools

For each tool:

**Input Schema**: Use Zod (TypeScript) or Pydantic (Python), include constraints and clear descriptions.

**Output Schema**: Define `outputSchema` where possible for structured data. Use `structuredContent` in tool responses (TypeScript SDK feature).

**Tool Description**: Concise summary of functionality, parameter descriptions, return type schema.

**Implementation:**
- Async/await for I/O operations
- Proper error handling with actionable messages
- Support pagination where applicable
- Return both text content and structured data when using modern SDKs

**Annotations:**
- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

### Phase 3: Review and Test

#### 3.1 Code Quality

Review for: no duplicated code (DRY principle), consistent error handling, full type coverage, clear tool descriptions.

#### 3.2 Build and Test

**TypeScript:**
- Run `npm run build` to verify compilation
- Test with MCP Inspector: `npx @modelcontextprotocol/inspector`

**Python:**
- Verify syntax: `python -m py_compile your_server.py`
- Test with MCP Inspector

### Phase 4: Create Evaluations

Create 10 complex, realistic questions that test whether LLMs can effectively use your MCP server. Each question should be:
- Independent, Read-only, Complex, Realistic, Verifiable, Stable

## Reference Files

Load these resources as needed during development:

- `reference/mcp_best_practices.md` - Universal MCP guidelines
- `reference/node_mcp_server.md` - Complete TypeScript guide
- `reference/python_mcp_server.md` - Complete Python/FastMCP guide
- `reference/evaluation.md` - Complete evaluation creation guide

> **Source**: This skill is sourced from [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/mcp-builder) on GitHub. Reference files are bundled in the full skill download.
