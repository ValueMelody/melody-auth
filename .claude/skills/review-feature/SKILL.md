---
name: review-feature
description: >
  Use this skill whenever the user asks for a feature-focused review of the current in-progress
  work, uncommitted changes, staged diff, or worktree. Trigger on requests like "review this
  feature", "review the current diff", "what is missing feature-wise", "is anything missing before
  this ships", or "check the uncommitted changes and only focus on feature behavior". Do not use
  this skill for style, refactoring, performance, or test review.
---

# Review Feature

Review the current uncommitted changes as a feature review.

## Scope

- Focus only on feature completeness and product behavior.
- Ignore tests and test quality completely.
- Ignore style, formatting, naming, refactoring, and performance unless they directly break the feature.

## Step 1: Inspect the current work

1. Run `git status --short`.
2. Review both staged and unstaged diffs.
3. Read the changed files and any nearby code needed to understand the intended behavior.
4. If the user provided extra context, use it to infer the expected feature scope.
5. If there are no uncommitted changes, say so clearly and stop.

## What to look for

- Missing frontend, backend, API, or data wiring
- Missing validation, authorization, persistence, schema, or route updates
- Missing loading, empty, success, or error states that break the feature flow
- Missing translations, generated artifacts, or docs only when they are required for the feature to ship
- Edge cases or regressions that make the feature incomplete for real users

## Response format

- Start with findings only, ordered by severity
- For each finding, explain why it matters for feature behavior and cite file paths with line numbers
- Never mention tests, missing tests, or test quality
- If no feature-level gaps are found, say exactly: `No feature-level gaps found in the current uncommitted changes.`
- Add a short `Open questions` section only if needed
