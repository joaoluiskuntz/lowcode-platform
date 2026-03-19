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
- state-driven bindings in the web preview renderer

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
- text and card content can resolve from state bindings
- state survives screen navigation in the preview runtime

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
- expand binding coverage beyond the first safe state-based model