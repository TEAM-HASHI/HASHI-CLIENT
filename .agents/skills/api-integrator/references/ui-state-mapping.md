# UI State Mapping

Preserve the published UI and connect existing states deliberately.

## Required States

| State               | Check                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| Initial loading     | Suspense fallback or local skeleton/loading UI is intentional.              |
| Background fetching | Existing content stays visible when appropriate.                            |
| Empty               | Empty data shape maps to the designed empty state.                          |
| Error               | ErrorBoundary or local error state can retry.                               |
| Disabled            | Submit and destructive actions cannot double-fire.                          |
| Success             | Mutation success closes dialogs, navigates, or refreshes data as specified. |

## Rules

- Do not invent new UX copy unless the spec is missing and the page already has a nearby pattern.
- Keep HDS components server-state agnostic.
- Keep page composition responsible for choosing loading, error, empty, and success branches.
- Use named booleans for complex state combinations.
- Update page spec when data dependency or state behavior changes.
