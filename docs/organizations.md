# Organizations

Organizations in Melody Auth provide:

- **User Management**: Organize users into separate organizational contexts
- **Registration Control**: Organizations can enable or disable public user registration
- **User Association**: Users can be members of multiple organizations
- **Active Organization**: Users can only be in one active organization at a time
- **Custom Branding**: Each organization can show different visual identity to users  
[Per-Organization Branding](/branding.html#per-organization-branding)
- **Flexible Configuration**: Control whether users join organizations or just see custom branding

## Enabling Organizations

To enable organization features in your Melody Auth instance, set `ENABLE_ORG = true` in `server/wrangler.toml` under `[vars]`.  

## Branding Inheritance

The branding system follows a hierarchy:
1. **Organization-specific settings** (highest priority)
2. **Global default settings** (fallback)

If an organization doesn't specify a particular branding element, it inherits the global default.

## Admin Panel Management

### Creating an Organization

1. Open the Admin Panel and click "Orgs" in the navigation
2. Click "Create an org" button
3. Fill in the required fields:
   - **Name**: Display name (e.g., "Acme Corporation")
   - **Slug**: Unique identifier for URLs (e.g., "acme-corp")
   - **Allow Public Registration**: Enable/disable public user signup
   - **Only Use for Branding Override**: Users see custom branding but don't become members
4. Click "Save" to create the organization

### Managing Organization Users

- View all users in an organization from the organization details page
- Users appear in the list if they have the organization's slug in their user record
- Add users manually if public registration is disabled

### Organization Settings

- Edit organization name, slug, and registration policies
- Configure custom branding (logos, colors, fonts)
- Update legal links (terms of service, privacy policy)

## API Integration

Organizations can be managed programmatically through the S2S API.

### Organization Management Endpoints

```http
GET /api/v1/orgs: Get all organizations
GET /api/v1/orgs/{id}: Get specific organization details
POST /api/v1/orgs: Create new organization
PUT /api/v1/orgs/{id}: Update organization settings
DELETE /api/v1/orgs/{id}: Delete organization
GET /api/v1/orgs/{id}/users: Get all users in an organization
```

### User Orgs Management Endpoints
```http
GET /api/v1/users/{authId}/orgs: Get all organizations for a user
POST /api/v1/users/{authId}/orgs: Update user's organizations
```

### Set user's active organization
```http
PUT /api/v1/users/{authId}: set orgSlug to the org slug of an organization that the user already belongs to
```

## Registration Flow scenarios

### Scenario 1: Open Organization with User Membership
```
allowPublicRegistration: true
onlyUseForBrandingOverride: false
```
**Result**: Users can sign up and automatically become organization members. They appear in the organization's user list and are managed within the organization. The org becomes the user's active organization.

### Scenario 2: Branding-Only (No User Membership)
```
allowPublicRegistration: true
onlyUseForBrandingOverride: true
```
**Result**: Users see organization branding during signup but do not become organization members. They remain as global users.

### Scenario 3: Closed Organization
```
allowPublicRegistration: false
onlyUseForBrandingOverride: false/true (doesn't matter)
```
**Result**: No public registration allowed. Organization administrators must manually add users to the organization.
