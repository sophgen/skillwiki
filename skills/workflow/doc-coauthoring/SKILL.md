---
name: doc-coauthoring
description: Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.
license: Complete terms in LICENSE.txt
metadata:
  author: Anthropic
  difficulty: beginner
  rating: "4.3"
  domain: workflow
  use-cases: "documentation-writing, proposal-drafting, technical-spec-creation, decision-doc, collaborative-writing"
  featured: "false"
  tags: "documentation, writing, collaboration, specs, proposals, prd"
---

# Doc Co-Authoring Workflow

This skill provides a structured workflow for guiding users through collaborative document creation. Act as an active guide, walking users through three stages: Context Gathering, Refinement & Structure, and Reader Testing.

## When to Offer This Workflow

**Trigger conditions:**
- User mentions writing documentation: "write a doc", "draft a proposal", "create a spec", "write up"
- User mentions specific doc types: "PRD", "design doc", "decision doc", "RFC"
- User seems to be starting a substantial writing task

**Initial offer:**
Offer the user a structured workflow. Explain the three stages:

1. **Context Gathering**: User provides all relevant context while Claude asks clarifying questions
2. **Refinement & Structure**: Iteratively build each section through brainstorming and editing
3. **Reader Testing**: Test the doc with a fresh Claude (no context) to catch blind spots before others read it

If user declines, work freeform. If user accepts, proceed to Stage 1.

## Stage 1: Context Gathering

**Goal:** Close the gap between what the user knows and what Claude knows, enabling smart guidance later.

### Initial Questions

Ask for meta-context about the document:
1. What type of document is this? (e.g., technical spec, decision doc, proposal)
2. Who's the primary audience?
3. What's the desired impact when someone reads this?
4. Is there a template or specific format to follow?
5. Any other constraints or context to know?

### Info Dumping

Once initial questions are answered, encourage the user to dump all the context they have:
- Background on the project/problem
- Related team discussions or shared documents
- Why alternative solutions aren't being used
- Organizational context (team dynamics, past incidents, politics)
- Timeline pressures or constraints
- Technical architecture or dependencies

**If integrations are available** (e.g., Slack, Teams, Google Drive, SharePoint, or other MCP servers), mention that these can be used to pull in context directly.

**Asking clarifying questions:**

When user signals they've done their initial dump, generate 5-10 numbered questions based on gaps in the context.

**Exit condition:**
Sufficient context has been gathered when questions show understanding — when edge cases and trade-offs can be asked about without needing basics explained.

## Stage 2: Refinement & Structure

**Goal:** Build the document section by section through brainstorming, curation, and iterative refinement.

**For each section:**

#### Step 1: Clarifying Questions
Announce work will begin on the section. Ask 5-10 clarifying questions about what should be included.

#### Step 2: Brainstorming
Brainstorm 5-20 items that might be included, depending on the section's complexity.

#### Step 3: Curation
Ask which points should be kept, removed, or combined.

#### Step 4: Gap Check
Based on what they've selected, ask if there's anything important missing.

#### Step 5: Drafting
Use `str_replace` to replace placeholder text with drafted content.

**Key instruction for user (include when drafting the first section):**
Instead of editing the doc directly, ask them to indicate what to change. For example: "Remove the X bullet - already covered by Y" or "Make the third paragraph more concise".

#### Step 6: Iterative Refinement
Continue iterating until user is satisfied with the section.

### Near Completion

As approaching completion (80%+ of sections done), re-read the entire document and check for:
- Flow and consistency across sections
- Redundancy or contradictions
- Anything that feels like "slop" or generic filler
- Whether every sentence carries weight

## Stage 3: Reader Testing

**Goal:** Test the document with a fresh Claude (no context bleed) to verify it works for readers.

### With Subagents

1. **Predict Reader Questions** - Generate 5-10 questions readers would realistically ask
2. **Test with Sub-Agent** - Invoke a sub-agent with just the document content and the question
3. **Run Additional Checks** - Invoke sub-agent to check for ambiguity, false assumptions, contradictions
4. **Report and Fix** - Loop back to refinement for problematic sections

### Without Subagents

Provide testing instructions for the user to test manually with a fresh Claude conversation.

### Exit Condition

When Reader Claude consistently answers questions correctly and doesn't surface new gaps or ambiguities, the doc is ready.

## Final Review

When Reader Testing passes, recommend they do a final read-through themselves. Suggest double-checking any facts, links, or technical details.

**Final tips:**
- Consider linking this conversation in an appendix so readers can see how the doc was developed
- Use appendices to provide depth without bloating the main doc
- Update the doc as feedback is received from real readers

> **Source**: This skill is sourced from [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring) on GitHub.
