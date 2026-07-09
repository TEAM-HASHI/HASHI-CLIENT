# Query Mode Decision

Prefer the simplest hook that matches the UI state contract.

## Default Choice

Use `useSuspenseQuery` for page-entry required data when:

- the page cannot render meaningful content without the data
- route-level Suspense fallback is acceptable
- `enabled`, `placeholderData`, and manual loading branches are not needed
- the component does not contain multiple independent suspense queries that would create a waterfall

Use `useQuery` when:

- query execution is conditional
- search, filter, tab, or form state controls fetching
- previous or placeholder data should remain visible
- only part of the screen should show loading or error state
- manual refetch is part of the interaction
- multiple independent queries should start in parallel in one component

Use `useInfiniteQuery` when the UI fetches additional pages after the first render and needs inline next-page state.

Use `useSuspenseInfiniteQuery` only when the first page is route-entry required data and the same Suspense fallback is correct for the initial fetch.

## Caveats

- Suspense query APIs do not support `enabled`, `placeholderData`, or custom `throwOnError`.
- Suspense query data is defined after render resumes; do not add redundant `data ?? []` unless the response field itself is nullable.
- Do not use the same query key for finite and infinite queries.
