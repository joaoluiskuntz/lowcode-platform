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


---

---



# Task 08 — Add preview app support for selecting different compiled artifacts

## Goal
Allow the preview app to choose which compiled artifact to load.

## Why this matters
As soon as you have more than one example, hardcoding main.web.json becomes limiting.

## Expected result
Support one of these:
- query parameter like ?app=example-name
- a local selector UI
- a simple index JSON listing available artifacts

## Constraints
- do not bypass compiled outputs
- keep the preview lightweight
- preserve current React runtime structure

## Likely files to change
- apps/web-preview/src/App.tsx
- apps/web-preview/public/*
- optional helper files

## Done when
- multiple compiled examples can be previewed without code edits

---

# Task 09 — Improve styling and layout fidelity in the web renderer

## Goal
Make the rendered output look more production-like using Bootstrap conventions.

## Why this matters
Current rendering proves architecture, but the visual quality is still basic.

## Expected result
Better handling for:
- spacing
- column behavior
- card appearance
- button variants
- typography
- theme defaults

## Constraints
- keep renderer simple
- avoid hardcoding business-specific styling
- remain Bootstrap-oriented

## Likely files to change
- apps/web-preview/src/renderer/*
- apps/web-preview/src/styles/app.css

## Done when
- screens look cleaner and more realistic
- layout behaves predictably on resize

---

# Task 10 — Add a component metadata model

## Goal
Create a formal metadata catalog for components.

## Why this matters
The future authoring studio needs machine-readable component definitions:
- properties
- defaults
- event support
- accessibility requirements
- platform support

## Expected result
A metadata source for:
- text
- button
- image
- input
- card
- list
- row
- column

## Constraints
- do not mix component metadata with runtime rendering code
- preserve renderer independence
- design for future editor use

## Likely files to change
- new package or docs file for component metadata
- docs/architecture.md
- docs/task-catalog.md

## Done when
- components are formally described in one place
- the catalog could be consumed later by an editor

---

# Task 11 — Start the authoring studio foundation

## Goal
Create the first foundation for a future low-code editor.

## Why this matters
The platform is currently compiler-first. The authoring experience is the next major product step.

## Expected result
A minimal authoring studio can:
- load a DSL file
- show raw JSON or a structured editor
- preview the compiled result

## Constraints
- do not attempt full drag-and-drop yet
- keep the first version simple
- continue to treat compiler output as the rendering source of truth

## Likely files to change
- new app under apps/
- docs/architecture.md
- docs/next-steps.md

## Done when
- the authoring app can edit/load a DSL and trigger preview flow

---

# Task 12 — Add checkout domain model definitions

## Goal
Introduce explicit checkout concepts into the platform:
- basket
- item
- price
- tax
- discount
- payment
- receipt

## Why this matters
Until now the platform is generic UI infrastructure. A self-checkout product needs a domain model.

## Expected result
A clear domain model document and optionally typed contracts for runtime state.

## Constraints
- do not hardcode domain logic into generic components
- keep domain concerns separate from rendering concerns

## Likely files to change
- docs/domain or docs/architecture.md
- optional new package for domain contracts

## Done when
- checkout state concepts are documented and typed
- future flows can rely on them

---

# Task 13 — Add service abstraction for backend calls

## Goal
Define how low-code actions call backend services safely.

## Why this matters
A real checkout app needs pricing, tax, inventory, payment, and receipt services.

## Expected result
A simple abstraction for:
- named services
- request payloads
- success/failure outputs
- preview runtime stubs

## Constraints
- no arbitrary code execution
- service contract must stay declarative
- preserve portability between web and Android

## Likely files to change
- packages/dsl-schema
- packages/ir
- compiler transform
- web preview runtime

## Done when
- callService has a concrete contract
- preview can mock service responses

---

# Task 14 — Add renderer parity planning for Android

## Goal
Prepare the project for Android rendering by formalizing renderer contracts.

## Why this matters
The architecture intends to support web and Android from the same IR.

## Expected result
Documentation and types that clarify:
- what IR guarantees
- what renderer responsibilities are
- what must stay platform-neutral

## Constraints
- do not implement Android yet unless explicitly requested
- preserve renderer-agnostic IR

## Likely files to change
- docs/architecture.md
- AI_CONTEXT.md
- maybe packages/ir comments/types

## Done when
- Android work can begin without ambiguity

---

# Task 15 — Add production-quality dev scripts and package ergonomics

## Goal
Improve package scripts and repository ergonomics.

## Why this matters
As the repo grows, developer friction compounds.

## Expected result
Useful scripts like:
- build:core
- compile:example
- preview:prepare
- dev:preview
- test:core

## Constraints
- keep commands understandable
- support Windows first
- avoid fragile shell-only scripts when possible

## Likely files to change
- root package.json
- workspace package.json files
- optional scripts/ directory

## Done when
- common workflows are easy to run
- onboarding is simpler

---

# Prompt-ready task block template

Copy this block and replace the task section with one of the tasks above.

## Template
Act as a very senior software engineer and software architect.

Use these files as the source of truth:
- AI_CONTEXT.md
- docs/architecture.md
- docs/current-status.md
- docs/next-steps.md
- docs/task-catalog.md

I am continuing an existing low-code self-checkout platform.
Do not restart the project and do not rewrite the architecture.

Selected task:
[PASTE ONE FULL TASK SECTION HERE]

Please:
1. analyze the current implementation first
2. explain the exact files to change
3. provide incremental implementation steps
4. preserve compiler → IR → renderer architecture
5. keep the solution technically correct
6. avoid unnecessary rewrites