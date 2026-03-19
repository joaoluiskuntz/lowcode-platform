# Task Catalog — Low-Code Self-Checkout Platform

This file is a task selection catalog for continuing implementation with AI assistance.

How to use:
1. Pick one task from this file.
2. Copy its full section into a new chat.
3. Also provide:
- AI_CONTEXT.md
- docs/architecture.md
- docs/current-status.md
- docs/next-steps.md
4. Ask the AI to continue from the current implementation without rewriting the architecture.

---

# Current completed milestone themes
- robust compiler CLI workflow
- validator and compiler contract tests
- safe state bindings
- richer preview actions and examples
- preview artifact selection
- improved Bootstrap-oriented preview styling
- formal component metadata
- authoring studio foundation

---

# Suggested next task candidates

## Task A — Add renderer interaction tests
### Goal
Add focused tests for web-preview rendering and state/action interactions.

### Why this matters
The renderer and authoring preview are now product-critical.

### Expected result
Tests cover:
- screen rendering
- navigation
- state updates
- bindings resolution
- artifact switching

### Constraints
- keep tests contract-focused
- avoid brittle snapshot-only coverage

### Likely files to change
- apps/web-preview/test/*
- apps/authoring-studio/test/*
- package scripts if needed

---

## Task B — Add metadata-driven authoring controls
### Goal
Use the component metadata catalog to power editor hints and property forms.

### Why this matters
The editor currently edits raw JSON only. Metadata should begin driving editor behavior.

### Expected result
- selectable component definitions
- visible property metadata
- defaults and required fields surfaced in the authoring app

### Constraints
- keep metadata independent from runtime code
- do not bypass compiler/IR flow

### Likely files to change
- packages/component-metadata
- apps/authoring-studio
- docs/architecture.md

---

## Task C — Add preview-safe service action behavior
### Goal
Make `callService` predictable in preview and authoring environments.

### Why this matters
Action flows need a clearer preview contract before real backend integration.

### Expected result
- non-breaking preview handling
- clear logging or mocked response strategy
- no hidden business logic inside UI components

### Constraints
- preserve declarative actions
- keep runtime deterministic

### Likely files to change
- apps/web-preview/src/runtime/actions.ts
- apps/authoring-studio/*
- docs/architecture.md

---

## Task D — Start structured authoring beyond raw JSON
### Goal
Introduce a minimal structured editor for app metadata and screen lists.

### Why this matters
The studio foundation exists, but raw JSON alone is not yet a real authoring experience.

### Expected result
- edit app name/id
- inspect screens
- structured surface around the existing raw JSON view
- compile and preview continues to use compiler output

### Constraints
- no drag-and-drop yet
- keep the architecture compiler-first

### Likely files to change
- apps/authoring-studio/*
- packages/component-metadata/*
- docs/next-steps.md