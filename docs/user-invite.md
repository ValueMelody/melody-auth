# User Invite

Allow administrators to invite users to the platform via email, without requiring self-registration.

## How it works
- An admin sends an invitation to a user's email address, optionally assigning roles, an organization, and a locale.
- The invited user receives an email with a link to accept the invitation. The link is valid for 7 days.
- The user clicks the link, sets a password, and their account is activated.
- If the invitation expires or needs to be resent, the admin can reinvite the user to generate a new link.
- If the invitation should be cancelled before acceptance, the admin can revoke it.

Notes:
- An email provider must be configured to send invitation emails.
- Invited users start as inactive and are activated only after accepting the invitation.
- Invitations cannot be sent to organizations with `onlyUseForBrandingOverride` enabled.

## Invite a user

### Using the Admin Panel
- Go to the Users page and click **Invite User**.
- Fill in the email (required) and any optional fields: first name, last name, locale, organization, roles, and redirect URL.
- Submit the form. The invited user will receive an invitation email.

### Calling the S2S API directly
Endpoint: `POST /api/v1/users/invitations`
- Authorization: Bearer S2S token with scope `write_user`
- Body:
  ```json
  {
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "locale": "en",
    "orgSlug": "my-org",
    "roles": ["role-name"],
    "signinUrl": "https://your-app.example.com/callback"
  }
  ```
  Only `email` is required. All other fields are optional.
- Response: `200` — the created user record with `isActive: false` and `isInviting: true`.

## Reinvite a user

Use this to resend the invitation email with a fresh token and a new 7-day expiration. The previous invitation link is invalidated.

### Using the Admin Panel
- Open the pending user's detail page.
- Click **Resend Invite**.
- Optionally update the locale or redirect URL, then confirm.

### Calling the S2S API directly
Endpoint: `POST /api/v1/users/invitations/{authId}`
- Authorization: Bearer S2S token with scope `write_user`
- Body:
  ```json
  {
    "locale": "en",
    "signinUrl": "https://your-app.example.com/callback"
  }
  ```
  Both fields are optional.
- Response: `200` — `{ "success": true }`
- Conditions: the user must be inactive and must have an existing pending invitation.

## Revoke an invitation

Cancels the pending invitation. The user will no longer be able to use the invitation link to activate their account.

### Using the Admin Panel
- Open the pending user's detail page.
- Click **Revoke Invite** and confirm.

### Calling the S2S API directly
Endpoint: `DELETE /api/v1/users/invitations/{authId}`
- Authorization: Bearer S2S token with scope `write_user`
- Response: `204` — no content.
- Conditions: the user must be inactive and must have an existing pending invitation.

## Accepting an invitation (user flow)

When the user clicks the invitation link in their email, they are taken to an acceptance page hosted by the auth server.

1. The server validates the invitation token — it must exist, belong to an inactive user, and not be expired.
2. The user sets a password and submits the form.
3. On success, the account is activated, the email is marked as verified, and the invitation token is cleared.
4. The user can then sign in normally.

If the link has expired, the page shows an expiration message and the user must ask an admin to reinvite them.
