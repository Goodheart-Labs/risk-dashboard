# API Routes

- All API routes should include caching headers with 1-hour cache and stale-while-revalidate:

```typescript
headers: {
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600"
}
```
