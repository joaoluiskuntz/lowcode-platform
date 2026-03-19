# Low-Code Self-Checkout Platform — AI Context

## Project goal
Build a low-code platform for self-checkout applications.

Authors define applications in a JSON DSL.
The platform validates the DSL, transforms it into an Intermediate Representation (IR), and compiles artifacts for:
- Web
- Android (future)

## Current architecture

### Monorepo structure
- packages/dsl-schema
- packages/validator
- packages/ir
- packages/compiler
- apps/compiler-cli
- apps/web-preview

### Compiler flow
DSL JSON
→ JSON Schema validation
→ semantic validation
→ IR transformation
→ package generation
→ main.web.json
→ main.android.json
→ manifest.json

## DSL
Canonical format is JSON.
Current DSL supports:
- app metadata
- theme
- screens
- row
- column
- text
- button
- image
- input
- card
- list
- events/actions

## Validation
Validation has two layers:
1. structural validation via JSON Schema
2. semantic validation

Semantic validation currently checks:
- duplicate screen ids
- duplicate component ids
- navigate targets exist
- accessibility-critical checks like image alt and button label

## IR
IR is renderer-agnostic.
It normalizes:
- theme defaults
- screen tree
- layout spans
- component props
- events/actions

Main IR concepts:
- AppIr
- ScreenIr
- IrNode
- IrContainerNode
- IrComponentNode
- IrAction

## Compiler
Compiler responsibilities:
- validate DSL
- transform DSL to IR
- generate deterministic output
- package manifest
- produce:
  - main.web.json
  - main.android.json
  - manifest.json

## CLI
apps/compiler-cli compiles a DSL file into build artifacts.

Typical command:
node apps/compiler-cli/dist/index.js packages/dsl-schema/examples/basic-checkout.json build

## Web preview
apps/web-preview is a React + Vite preview runtime.

It:
- loads public/main.web.json
- renders the compiled IR
- uses Bootstrap layout
- supports screen navigation
- supports runtime state storage

Supported components in renderer:
- row
- column
- text
- button
- image
- input
- card
- list

## Runtime
RuntimeContext currently manages:
- app
- currentScreenId
- stateStore
- navigate(screenId)
- setStateValue(key, value)

Action executor currently supports:
- navigate
- setState
- showMessage
- callService (stub only)

## Current status
Implemented and working:
- monorepo setup
- DSL schema
- validator
- IR model
- compiler
- compiler CLI
- web preview app
- screen rendering
- navigation
- basic Bootstrap-based layout rendering

## Known limitations
- no authoring studio yet
- no Android renderer yet
- no real service integration yet
- no hardware/device framework yet
- no schema watch/dev loop yet
- no bindings expression engine yet
- image asset handling is still basic

## Architectural rules
- JSON is the canonical DSL
- IR must remain renderer-agnostic
- renderers must consume IR, never raw DSL
- deterministic builds are required
- keep business logic out of UI components
- keep hardware/device logic isolated behind adapters
- low-code experience should remain Bootstrap-like and simple

## Immediate next priorities
1. improve dev workflow
2. add bindings support
3. add richer action handling
4. add editor/authoring foundation
5. add checkout domain model
6. add Android renderer

## How to continue in new chats
Treat this file as the source of truth for project context.
Use it to continue implementation without re-explaining the whole project.