# Common Questions

## How to verify a SPA access token
When verifying a SPA access token that uses the RSA256 algorithm, you can obtain the public key by fetching the JWKS (JSON Web Key Set) from [Your auth server URL]/.well-known/jwks.json. Below is a code example demonstrating how to verify the token using the jwks-rsa library:

```
import { verify } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa' 

// Initialize JWKS client with the URL to fetch keys
const client = jwksClient({ jwksUri: `${process.env.NEXT_PUBLIC_SERVER_URI}/.well-known/jwks.json` })

// Function to retrieve the signing key from the JWKS endpoint
const getKey = (
  header, callback,
) => {
  return client.getSigningKey(
    header.kid,
    (
      err, key,
    ) => {
      if (err) {
        callback(err)
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey
        callback(
          null,
          signingKey,
        )
      }
    },
  )
}

// Function to verify the JWT token
const verifyJwtToken = (token: string) => {
  return new Promise((
    resolve, reject,
  ) => {
    verify(
      token,
      getKey,
      {},
      (
        err, decoded,
      ) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded)
        }
      },
    )
  })
}

// Function to verify the access token from request headers
export const verifyAccessToken = async () => {
  const headersList = headers()
  const authHeader = headersList.get('authorization')
  const accessToken = authHeader?.split(' ')[1]

  if (!accessToken) return false

  const tokenBody = await verifyJwtToken(accessToken)

  if (!tokenBody) return false

  return true
}
```

## How to support a new locale
English (EN) and French (FR) are supported by default in this project. To add support for additional locales, follow these steps:
- Update the server/src/configs/locale.ts file, ensuring that translations for your new locale are provided.
- Update the SUPPORTED_LOCALES environment variable to include your new locale in the array.

## How to rotate JWT secret
To rotate your JWT secret, follow these steps:
1. Generate a New JWT Secret:  
Run the secret generation script based on your environment.  
After running these commands, a new pair of JWT secrets will take effect. Your old JWT secret will be marked as deprecated. This means the old secret will no longer be used to sign new tokens, but existing tokens signed with the old secret will still be verified.
    ```
    cd server
    npm run node:secret:generate # For node env
    npm run dev:secret:generate # For Cloudflare local env
    npm run prod:secret:generate # For Cloudflare remote env
    ```

2.	Clean the Old Secret:  
Run the secret clean script whenever you want to stop verifying tokens signed with the old secret. After running these commands, the old secret will be removed, and any tokens signed with the old secret will no longer be valid.
    ```
    cd server
    npm run node:secret:clean # For node env
    npm run dev:secret:clean # For Cloudflare local env
    npm run prod:secret:clean # For Cloudflare remote env
    ```

## How to setup MFA
- Enforcing specific MFA types: You can set OTP_MFA_IS_REQUIRED, SMS_MFA_IS_REQUIRED, or EMAIL_MFA_IS_REQUIRED to true to enforce those MFA methods as a login requirement.
- Letting users choose one of the supported MFA types: If OTP_MFA_IS_REQUIRED, SMS_MFA_IS_REQUIRED, and EMAIL_MFA_IS_REQUIRED are all set to false, you can set ENFORCE_ONE_MFA_ENROLLMENT to contain the MFA types you want to support. The user will then be required to enroll in one of the selected MFA types.
- You can also use the MFA enrollment functionality provided by the admin panel or the S2S API to customize your MFA enrollment flow.

## How to trigger a different policy
- To trigger a different policy, add policy=[policy] as a query string when redirecting the user to the authorization page.
    ```
      const url = serverUri +
        '/oauth2/v1/authorize?' +
        'response_type=code' +
        '&state=' + state +
        '&client_id=' + clientId +
        '&redirect_uri=' + redirectUri +
        '&code_challenge=' + codeChallenge +
        '&code_challenge_method=S256' +
        '&policy=' + policy +
        '&scope=' + scope +
        '&locale=' + locale
      window.location.href = url
    ```
- When using the React SDK, you can trigger the loginRedirect function with a policy parameter:
    ```
    const { loginRedirect } = useAuth()

    loginRedirect({
      policy: 'change_password',
    })
    ```
- Supported Policies
  -	sign_in_or_sign_up: Default policy.
  -	update_info: Allows users to update their information.
  -	change_password: Allows users to change their password (for password-based users only). Requires ENABLE_PASSWORD_RESET to be set to true in the configuration.
  -	change_email: Allows users to change their email address (for password-based users only). Requires ENABLE_EMAIL_VERIFICATION to be set to true in the configuration.
  -	reset_mfa: Allows users to reset their enrolled MFA (Multi-Factor Authentication) method.
  - manage_passkey: Allows users to manage their passkey. Requires ALLOW_PASSKEY_ENROLLMENT to be set to true in the configuration.

## How to change theme/branding for authorization pages
- You can change the default theme/branding by setting the `DefaultBranding` variable in server/src/configs/variable.ts.
- In case you want to use different theme/branding for different clients
  - set ENABLE_ORG to true in server/wrangler.toml
  - create a new org in the admin panel, with a unique slug
  - update the theme/branding for the org you just created in the admin panel
  - trigger a login redirect to the authorization page with the org=[slug] as query string

## How to allow users with a custom role to perform impersonation
By default, only users with the super_admin role can impersonate other accounts. To let a custom-role user perform impersonation:
- Add the custom role to the impersonationRoles array in server/src/configs/variable.ts. This enables the role to impersonate on the S2S API side.
- Add Access.Impersonation to the allowedAccesses array in admin-panel/tools/access.ts for that role. This grants impersonation permission in the Admin Panel.
