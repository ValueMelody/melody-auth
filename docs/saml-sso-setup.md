# SAML SSO Setup

SAML SSO is currently supported only in the Node.js environment of Melody Auth.

## 1. Enable SAML SSO in `wrangler.toml`
Ensure that SAML SSO as a Service Provider (SP) is enabled in your server/wrangler.toml configuration file:

```toml
ENABLE_SAML_SSO_AS_SP=true
```

## 2. Register a SAML Identity Provider (IdP) via Admin Panel

- Go to admin panel
- Click "Manage SAML"
- Click "Create" button
- Define a unique name for the IDP, and fill in necessary information
- Click "Save" button

## 3. Trigger Login via SAML SSO in the Frontend

Use the loginRedirect function provided by your Melody Auth frontend SDK (e.g., @melody-auth/react) to initiate the login process:

```
  const {
    loginRedirect
  } = useAuth()

  loginRedirect({
    locale: locale || undefined, org: 'default',
    policy: 'saml_sso_[idp_name]' # Replace [idp_name] with the name of the IDP you created in admin panel
  })
```
