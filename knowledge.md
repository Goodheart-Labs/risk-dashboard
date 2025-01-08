# API Routes

- All API routes should include caching headers with 1-hour cache and stale-while-revalidate:

```typescript
headers: {
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600"
}
```

# Dark Mode

- Uses system preferences via `prefers-color-scheme` media query
- No configuration needed in tailwind.config.ts (default behavior)
- All dark mode styles use Tailwind's `dark:` prefix

## Chart Styling

- Use `currentColor` with opacity for grid lines and axes
- Grid lines: opacity 0.1
- Axis lines: opacity 0.2
- Axis text: opacity 0.65
- Apply same styling to both LineGraph and BarGraph for consistency
