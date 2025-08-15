# Organization Groups

Organization Groups allow administrators to organize users within an organization into logical groups for better management and access control. This feature provides a flexible way to categorize users and manage them collectively.

## What are Organization Groups?

Organization Groups are containers that can hold multiple users within the same organization. They serve as a way to:

- Organize users into logical units (e.g., departments, teams, projects)
- Simplify user management by grouping related users together
- Provide better visibility into organizational structure

## Enable Organization Groups
Organization Groups feature is controlled by the `systemConfig.enableOrgGroup` variable in `server/src/configs/variable.ts` file. You also need to set `ENABLE_ORG` to true in `server/wrangler.toml` file to enable org feature first.

## Key Features

### Group Management
- **Create Groups**: Administrators can create named groups within their organization
- **Edit Groups**: Group names can be modified as needed
- **Delete Groups**: Groups can be removed when no longer needed
- **List Groups**: View all groups within an organization

### User Assignment
- **Add Users to Groups**: Assign individual users to one or more groups
- **Remove Users from Groups**: Remove users from specific groups
- **Multiple Group Membership**: Users can belong to multiple groups simultaneously
- **View Group Members**: See all users assigned to a specific group

#### Creating a Group
Groups are created within the context of an organization and must have a unique name within that organization.

#### Assigning Users
Users can be assigned to groups through the admin panel from user details page. The system maintains the relationship through the junction table, allowing for:
- Multiple users per group
- Multiple groups per user  
![User Org Groups](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/user_org_groups.jpg)

#### Group Filtering
In the admin panel, administrators can filter the user list by group to view only users belonging to a specific group.

## Admin Panel Usage

### Managing Groups

1. **Navigate to Organization**: Go to the organization page in the admin panel
2. **View Groups**: Groups are displayed as badges in the organization view
3. **Create New Group**: Click the "Create an org group" button
4. **Edit Group**: Click the edit icon on any group badge
5. **Delete Group**: Click the delete icon on any group badge  
![Org Groups Management](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/org_group_management.jpg)

## S2S API Integration

Organization Groups can be managed through S2S API:
```http
GET /api/v1/org-groups: get all org groups
GET /api/v1/org-groups/{id}/users: get all users in a specific org group
POST /api/v1/org-groups: create a new org group
PUT /api/v1/org-groups/{id}: update an existing org group
DELETE /api/v1/org-groups/{id}: delete an org group
```
