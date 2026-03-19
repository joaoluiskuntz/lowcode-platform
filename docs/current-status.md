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
- Bootstrap-style row/column layout
- basic component rendering
- navigation between screens
- one-command preview workflow via `npm run dev:preview`
- automated contract tests for validator and compiler
- safe state binding resolution in the web preview runtime
- declarative preview actions for navigate, setState, showMessage, noop, and unsupported-action logging
- multiple example DSL apps for navigation, state binding, and basket summary flows

## Verified behaviors
- compile example DSL successfully
- compiler CLI compiles JSON files with or without UTF-8 BOM
- valid DSL compiles successfully
- invalid navigation target fails validation
- duplicate component ids fail validation
- repeated compiles produce the same content hash
- load compiled main.web.json in web-preview
- render first screen
- navigate between Home and Basket
- input updates runtime state
- text and card content can resolve from safe `state.*` bindings
- top-level and nested state bindings fall back safely when a path is missing
- setState actions can update preview state before navigation
- unsupported actions do not break preview execution
- multiple example apps can be compiled and loaded into the preview artifact

## Not implemented yet
- authoring studio
- Android runtime
- API/service execution
- offline strategy
- governance workflow
- tenant model
- checkout-specific business domain runtime

## Technical debt / cleanup
- add automated tests for preview renderer
- improve asset handling
- improve package build ergonomics
- add watch mode for compiler + preview sync
- expand binding coverage carefully beyond the initial safe state-based contract