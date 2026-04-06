---
name: generate-s2s
description: >
  Use this skill whenever the user asks to regenerate the S2S API artifacts, refresh the server
  swagger output, or update the generated admin-panel auth API client from the backend schema and
  routes. Also use this skill proactively whenever the current task changes any S2S generation
  inputs, even if the user did not explicitly ask for regeneration. Relevant changes include
  updates under `server/src/routes/`, `server/src/scripts/schemas/`,
  `server/src/scripts/generate-swagger.cjs`, or `admin-panel/scripts/generateService.ts`. Trigger
  on requests like "generate s2s", "regenerate swagger", "refresh auth api", "update the generated
  s2s client", or "run s2s:generate", and also when those source files were edited as part of the
  work.
---

# Generate S2S

When this skill is triggered, just run the root `s2s:generate` script from the project root and do
nothing else.

If you changed any relevant S2S source files during the current task, invoke this skill before
finishing the task even when the user never mentioned generation explicitly.

Do not trigger this skill for edits that only touch generated outputs like
`server/src/scripts/swagger.json` or `admin-panel/services/auth/api.ts`, or for unrelated admin
panel UI changes.

Do not inspect files, check diffs, summarize changes, or run follow-up commands unless the user explicitly asks for that extra work.

```bash
cd /Users/baozier/Projects/melody-auth && npm run s2s:generate
```

This regenerates the S2S swagger output and `admin-panel/services/auth/api.ts`.
