Update the root package.json scripts with:

{
  "scripts": {
    "dev:studio": "npm run dev -w @lowcode/studio",
    "build:studio": "npm run build -w @lowcode/studio",
    "typecheck:studio": "npm run typecheck -w @lowcode/studio"
  }
}
