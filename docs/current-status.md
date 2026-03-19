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
- generated manifest.json
- generated main.web.json
- generated main.android.json
- React web preview
- Bootstrap-style row/column layout
- basic component rendering
- navigation between screens

## Verified behaviors
- compile example DSL successfully
- load compiled main.web.json in web-preview
- render first screen
- navigate between Home and Basket
- display cards, text, list, button

## Not implemented yet
- authoring studio
- bindings expression engine
- device adapters
- Android runtime
- API/service execution
- offline strategy
- governance workflow
- tenant model
- checkout-specific business domain runtime

## Technical debt / cleanup
- improve dev scripts
- add automated tests for preview renderer
- improve asset handling
- improve package build ergonomics
- add watch mode for compiler + preview sync