# Current Status

## Working now
- monorepo structure
- workspace packages
- DSL schema
- schema validation
- semantic validation
- IR transformation
- deterministic compilation
- compiler CLI
- BOM-safe JSON parsing in compiler CLI
- generated manifest.json
- generated main.web.json
- generated main.android.json
- React web preview
- compiled artifact selection in web preview via query parameter and selector
- watch mode for compiler + preview artifact sync via `npm run dev:preview:watch`
- deterministic preview-safe `callService` handling
- richer sample DSL scenarios for navigation, binding, basket summary, and service preview
- renderer interaction tests for screen rendering, state updates, navigation, bindings, artifact switching, and service preview behavior
- authoring studio foundation with compiler-backed preview
- authoring-facing metadata for bindable component props

## Verified behaviors
- multiple compiled examples can be selected in the preview app without code edits
- preview artifacts can be recompiled and resynced automatically while the preview dev server is running
- `callService` preview behavior logs deterministic stub execution, can seed mock state, and can chain success actions
- richer example apps compile successfully
- renderer interaction tests pass for screen rendering, state updates, bindings, navigation, artifact switching, and service preview
- authoring metadata surfaces bindable properties, examples, and fallback behavior without bypassing the compiler

## Not implemented yet
- checkout domain model
- adapter abstraction package
- Android renderer spike
- deeper structured component editing
- production backend integration
- offline strategy
- governance workflow
- tenant model

## Technical debt / cleanup
- add more edge-case tests for invalid bindings and missing artifacts
- improve asset handling
- improve package build ergonomics
- expand structured authoring beyond app metadata
- extract shared renderer pieces into a dedicated package when reuse grows further