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
1. Generate a New JWT Secret
Run the secret generation script based on your environment:
```
cd server
npm run node:secret:generate # For node env
npm run dev:secret:generate # For Cloudflare local env
npm run prod:secret:generate # For Cloudflare remote env
```
After running these commands, a new pair of JWT secrets will take effect. Your old JWT secret will be marked as deprecated. This means the old secret will no longer be used to sign new tokens, but existing tokens signed with the old secret will still be verified.

2.	Clean the Old Secret
Run the secret clean script whenever you want to stop verifying tokens signed with the old secret:
```
cd server
npm run node:secret:clean # For node env
npm run dev:secret:clean # For Cloudflare local env
npm run prod:secret:clean # For Cloudflare remote env
```
After running these commands, the old secret will be removed, and any tokens signed with the old secret will no longer be valid.
