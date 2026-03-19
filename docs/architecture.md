# Architecture Overview

## Goal
Provide a low-code platform for building self-checkout applications that compile to web and Android runtimes.

## Core layers
### 1. DSL
Human-authored application definition. Canonical format: JSON.

### 2. Validator
Ensures structural and semantic correctness.

### 3. IR
Normalized, renderer-agnostic representation.

### 4. Compiler
Transforms valid DSL to IR and generates package artifacts.

### 5. Runtime / Renderer
Consumes IR and executes the application on target platforms.

## Current implemented targets
- Web preview runtime using React + Bootstrap
- Authoring studio foundation using a local compiler service and compiled IR preview

## Planned target
- Android native renderer

## Design principles
- strict schema-first design
- deterministic compilation
- platform independence through IR
- separation between authoring and runtime
- low-code friendliness
- extensibility for components and actions
- no eval or arbitrary code execution in bindings

## Current package responsibilities
### packages/dsl-schema
- schema definition
- DSL types
- example DSL files

### packages/validator
- JSON Schema validation
- semantic validation

### packages/ir
- runtime contract definitions

### packages/compiler
- DSL → IR transformation
- package generation
- stable serialization
- hashing/manifest

### packages/component-metadata
- machine-readable component catalog
- properties and defaults
- authoring-facing bindable property metadata
- event support
- accessibility requirements
- platform support metadata

### apps/compiler-cli
- local compilation entrypoint

### apps/web-preview
- React runtime for compiled IR
- Bootstrap-based layout rendering
- preview/dev visualization
- compiled artifact selection through an index and query parameter
- deterministic preview handling for `callService`

### apps/authoring-studio
- minimal editor foundation for DSL JSON
- metadata-guided authoring hints
- local compiler-backed preview workflow
- renders only compiled IR in the preview panel

## Current end-to-end flow
Author edits DSL → compiler validates and transforms → package artifacts generated → web-preview and authoring-studio load compiled IR → React renderer displays UI

## Binding model
The preview runtime supports a minimal deterministic binding model:
- `state.customerName`
- `state.total`
- `state.itemCount`
- nested dot-path access such as `state.basket.total`

Binding rules:
- only `state.` expressions are supported
- path segments must be simple identifiers
- missing paths fall back safely
- no JavaScript evaluation is allowed

## Preview-safe service behavior
`callService` remains declarative in IR. Preview environments handle it deterministically by:
- logging that a preview stub ran
- optionally storing a mocked result in runtime state
- optionally chaining follow-up actions from payload-defined success actions

## Authoring metadata model
The component metadata catalog formally describes:
- properties
- defaults
- bindability
- event support
- accessibility requirements
- platform support

Authoring-facing bindable property metadata documents which props can resolve from safe bindings and how fallback behavior works.

## Future major capabilities
- deeper structured authoring
- Android renderer
- hardware abstraction layer
- checkout domain model
- deployment workflow
- governance and approvals
- telemetry and analytics