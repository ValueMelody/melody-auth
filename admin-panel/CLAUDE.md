# melody-auth Admin Panel

## API Proxy Routes

When adding a new RTK Query hook in `admin-panel/services/auth/api.ts`, you must also create a corresponding Next.js proxy route under `admin-panel/app/api/v1/...` that forwards the request to the s2s server. Without the proxy route, the hook will have nothing to call.
