# Role-Based Access Control (RBAC)

Melody Auth provides a built-in Role-Based Access Control (RBAC) system that allows you to manage user permissions through roles. Users can be assigned multiple roles.

## How RBAC Works

The RBAC system contains three major components:

1. **Roles** - Named collections of permissions (e.g., `super_admin`, `support_admin`, `user`)
2. **Users** - Individual accounts that can be assigned one or more roles.
3. **Permissions** - Specific access rights that are checked throughout the system

## Built-in Roles

Melody Auth comes with the following predefined role:

- **`super_admin`** - Has full administrative access to all system features

You can create additional custom roles through the Admin Panel or REST API.

## Role Management

### Via Admin Panel
1. Navigate to the Roles section in the Admin Panel
2. Click "Create Role"
3. Provide a role name and optional description
4. Save the role

### Via S2S REST API
```
GET /api/v1/roles: Get all roles
POST /api/v1/roles: Create a new role
GET /api/v1/roles/{roleId}: Get a role
PUT /api/v1/roles/{roleId}: Update a role
DELETE /api/v1/roles/{roleId}: Delete a role
GET /api/v1/roles/{roleId}/users: Get all users in a role
```

### Role Information in Tokens

When a user authenticates, their assigned roles are included in both:

1. **Access Tokens** - Used for API authorization
2. **ID Tokens** - Used for user identity information

then you can use the `roles` field in the access token and id token to check the user's permissions.
