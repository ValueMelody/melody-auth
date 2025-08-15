# User Attributes

User attributes allow you to capture and manage custom data fields for users beyond the standard fields (email, etc.). This feature enables you to collect additional information during sign-up and include it in authentication tokens or user profile data.

## Overview

User attributes provide a flexible way to:
- Collect custom information during user registration
- Include custom data in ID tokens
- Return custom data through the user info endpoint
- Support multiple languages for attribute labels
- Enforce required fields during sign-up

## Configuration

### Enabling User Attributes

To enable the user attributes feature, set the following configuration in your `server/wrangler.toml`:

```toml
[vars]
ENABLE_USER_ATTRIBUTE = true
```

This configuration:
- Enables user attribute management in the admin panel
- Allows user attributes to be included in sign-up forms
- Enables S2S API endpoints for user attribute management

## Managing User Attributes

### Admin Panel Interface

Once enabled, you can manage user attributes through the admin panel:

1. **Navigate to User Attributes**: Access the user attributes section in the admin panel
2. **Create New Attributes**: Click "Create" to add a new user attribute
3. **Configure Properties**: Set up the attribute with the following options:
    - **Name** (Required): Internal identifier for the attribute
    - **Locales**: Multi-language display labels for the attribute
    - **Include in Sign Up Form**: Whether this attribute appears during user registration
    - **Required in Sign Up Form**: Whether users must provide this value during registration
    - **Include in ID Token Body**: Whether this attribute is included in JWT ID token payload
    - **Include in User Info**: Whether this attribute is returned by the user info endpoint
  
![User Attributes](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/user_attributes.jpg)

### S2S API Management

User attributes can be managed programmatically through S2S API endpoints:

```http
GET /api/v1/user-attributes: get all user attributes
GET /api/v1/user-attributes/{id}: get a specific user attribute
POST /api/v1/user-attributes: create a new user attribute
PUT /api/v1/user-attributes/{id}: update an existing user attribute
DELETE /api/v1/user-attributes/{id}: Delete a user attribute
```

## Sign-Up Form Integration

When `includeInSignUpForm` is enabled, user attributes automatically appear in the sign-up form:

- Attributes are displayed as text input fields
- Labels are localized based on the user's selected locale
- Required attributes are marked and validated during form submission
- Attributes are collected alongside standard sign-up data

The appropriate label is displayed based on:
- The user's current locale selection
- Falls back to the attribute `name` if no matching locale is found

## ID Token Integration

When `includeInIdTokenBody` is enabled:

- User attribute values are included in the JWT ID token payload
- Attributes appear as key-value pairs using the attribute name as the key
- Only attributes marked for ID token inclusion are added

## User Info Endpoint

When `includeInUserInfo` is enabled:

- User attributes are returned by the `/userinfo` endpoint
- Attributes appear in the `attributes` object in the response
- Only attributes marked for user info inclusion are returned
