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
- Bootstrap-oriented preview layout and styling improvements
- basic component rendering
- navigation between screens
- one-command preview workflow via `npm run dev:preview`
- automated contract tests for validator and compiler
- safe state binding resolution in the web preview runtime
- declarative preview actions for navigate, setState, showMessage, and unsupported-action logging
- multiple example DSL apps for navigation, state binding, and basket summary flows
- formal component metadata catalog
- authoring studio foundation with DSL loading, editing, compilation, and compiled preview

## Verified behaviors
- compile example DSL successfully
- compiler CLI compiles JSON files with or without UTF-8 BOM
- valid DSL compiles successfully
- invalid navigation target fails validation
- duplicate component ids fail validation
- repeated compiles produce the same content hash
- multiple compiled examples can be selected in the preview app without code edits
- web preview continues to render compiled IR only
- screens render with cleaner spacing, card styling, typography, and responsive column behavior
- component metadata is described in one machine-readable source
- authoring studio can load a DSL file, show raw JSON, compile it through the local compiler service, and preview the compiled result

## Not implemented yet
- visual drag-and-drop authoring
- Android runtime
- API/service execution
- offline strategy
- governance workflow
- tenant model
- checkout-specific business domain runtime

## Technical debt / cleanup
- add automated tests for preview renderer and authoring studio
- improve asset handling
- improve package build ergonomics
- add watch mode for compiler + preview sync
- expand binding coverage carefully beyond the initial safe state-based contract
- extract shared renderer pieces into a dedicated package when editor/runtime reuse grows further