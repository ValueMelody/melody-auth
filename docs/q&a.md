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
  client.getSigningKey(
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
