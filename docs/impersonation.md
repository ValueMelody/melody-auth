# Impersonation

Allow privileged admins to act as another user in a specific SPA for support and troubleshooting.

## How it works
- An admin with an allowed role triggers impersonation for a target user and SPA app.
- The server issues a short-lived refresh_token for the target user, attributed to the impersonator.
- The frontend uses this refresh_token to obtain access tokens for the target user session.

Notes:
- Only SPA apps are eligible for impersonation.
- If user consent is required for the app, the target user must have consented; otherwise the request is rejected.

## Server-side role setup
File: `server/src/configs/variable.ts`

- Add any custom roles that can impersonate to `S2sConfig.impersonationRoles`.
- Default is `[Role.SuperAdmin]`.

Example:

```ts
export const S2sConfig = Object.freeze({
  impersonationRoles: [Role.SuperAdmin, Role.SupportAdmin, Role.OrgAdmin],
})
```

Redeploy or restart the auth server after changes.

## Admin Panel access control setup
File: `admin-panel/tools/access.ts`

To let a custom role use the impersonation feature in the Admin Panel:
- Add the role to `AllowedRoles`.
- Add a `RoleAccesses[YourRole]` entry including `Access.Impersonation`. You will likely also want basic read permissions (e.g., `ReadUser`, `ReadApp`).

Example:

```ts
export const AllowedRoles = [
  typeTool.Role.SuperAdmin,
  typeTool.Role.SupportAdmin,
]

export const RoleAccesses = {
  [typeTool.Role.SuperAdmin]: [
    // ...existing accesses
    Access.Impersonation,
  ],
  [typeTool.Role.SupportAdmin]: [
    Access.ReadUser,
    Access.ReadApp,
    Access.Impersonation,
  ],
}
```

Ensure the admin account has the intended role assigned.

## Using the Admin Panel
- Open a user’s detail page and choose Impersonate.
- Select a SPA app. If consent is enforced and missing, you’ll be prompted to collect it first.
- On success, you’ll receive a `refresh_token` and convenience links for each app redirect URI:
  - `https://your-app.example.com/callback?refresh_token=...&refresh_token_expires_on=...&refresh_token_expires_in=...`

Clicking a link opens the app preloaded with the impersonation refresh token.  
![Impersonation](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/impersonation.jpg)

## Frontend handling of impersonation
All Frontend SDKs automatically parse the `refresh_token` query parameters on load and store them.

## Calling the S2S API directly
If you want to generate the impersonation refresh token yourself, you can call the S2S API directly.

Endpoint: `POST /api/v1/users/{authId}/impersonation/{appId}`
- Authorization: Bearer S2S token with scope `root`
- Body: `{ "impersonatorToken": "<admin-spa-access-token>" }`
- Response: `{ refresh_token, refresh_token_expires_in, refresh_token_expires_on }`

Sequence:
1) Obtain an S2S access token via Client Credentials with scope `root`.
2) Use that token to call the endpoint above.
3) Provide the returned `refresh_token` to the target app (via redirect URL parameters).
4) The app can use the refresh token to get access tokens for the target user session.

## Security notes
- Impersonation should be restricted to trusted admin roles only.
- Tokens are short-lived by design. The returned refresh token defaults to about 30 minutes validity.
- Refresh tokens are tagged with `impersonatedBy` internally for traceability.
