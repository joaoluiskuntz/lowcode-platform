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

## Current implemented target
- Web preview runtime using React + Bootstrap

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

### apps/compiler-cli
- local compilation entrypoint

### apps/web-preview
- React runtime for compiled IR
- Bootstrap-based layout rendering
- preview/dev visualization
- safe binding resolution for `state.*` dot-path expressions
- declarative action execution for navigation and preview-state updates

## Current end-to-end flow
Author edits DSL → compiler validates and transforms → main.web.json generated → web-preview loads main.web.json → React renderer displays UI

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

## Future major capabilities
- low-code visual authoring studio
- Android renderer
- hardware abstraction layer
- checkout domain model
- deployment workflow
- governance and approvals
- telemetry and analytics