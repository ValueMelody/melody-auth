# App Banners

App banners are informational messages that can be displayed on the sign-in page of your applications. They allow you to communicate important information to users before they sign in, such as maintenance notifications, announcements, or warnings.  
![Banners](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/app_banners_sign_in_screen.jpg)

## Overview

The app banner feature enables administrators to create and manage banners that appear on application sign-in pages. Banners support different types (info, warning, error, success) and can be localized for different languages.

## Server Configuration

To enable app banners, you need to set "ENABLE_APP_BANNER" to true in your server/wrangler.toml:

```
ENABLE_APP_BANNER=true
```

When set to `false` or not configured, the app banner feature is disabled, and API requests to banner endpoints will return an error.

## Banner Management

App banners can be managed through the admin panel interface:

1. Navigate to the Apps section in the admin panel
2. Access the Banners management section
3. Create, edit, or delete banners as needed

## S2S API

You can also manage app banners programmatically using the S2S API.

```
GET /api/v1/app-banners: get a list of banners
POST /api/v1/app-banners: create a new banner
GET /api/v1/app-banners/{id}: get a banner by id
PUT /api/v1/app-banners/{id}: update a banner by id
DELETE /api/v1/app-banners/{id}: delete a banner by id
```

## Embedded Auth API

For embedded authentication flows, you can get a list of banners to be displayed for current session by calling:

```
GET /embedded-auth/v1/{sessionId}/app-banners
```

## Banner Visibility

- Banners are only displayed when `isActive` is `true`
- Banners are filtered by the requesting app's ID
- If multiple banners are configured for an app, all active banners are returned

### Localization

- The `locales` object contains translations for different languages
- Use the user's preferred locale to display the appropriate text
- Fall back to the `text` property if no matching locale is found
