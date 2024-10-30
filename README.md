# React-mini-query

This project is a custom implementation of core functionalities from the `tanstack-query` library, including optimized hooks `useQuery` and `useMutation` for efficient data fetching, updating, and caching. Designed with performance in mind, this library includes essential features like `invalidateQueries` and the `keepPreviousData` flag to support smooth pagination without loading states. The library is fully typed in TypeScript, and its API closely matches the original library for ease of use.

## Key Features

- **Optimized `useQuery` and `useMutation` Hooks**: Efficient data fetching, updating, and caching with minimal re-renders and smooth integration with your React components.
- **`invalidateQueries` Support**: Allows selective query invalidation, enabling automatic re-fetching of stale data after a mutation or when dependencies change.
- **Smooth Pagination with `keepPreviousData`**: Allows retaining previous data during paginated queries, preventing loading indicators between page transitions.
- **TypeScript Support**: The library is fully typed, providing a robust development experience and minimizing runtime errors.
- **API Consistency**: The hooks are designed to have an API consistent with `tanstack-query` for easy transition and predictable behavior.
- **Comprehensive Test Coverage**: The core of the project is thoroughly tested using `Vitest`, ensuring high reliability and robustness across various scenarios.

