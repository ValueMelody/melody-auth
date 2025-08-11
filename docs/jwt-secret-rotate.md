# How to rotate JWT secret

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

2. Clean the Old Secret:
Run the secret clean script whenever you want to stop verifying tokens signed with the old secret. After running these commands, the old secret will be removed, and any tokens signed with the old secret will no longer be valid.

```
cd server
npm run node:secret:clean # For node env
npm run dev:secret:clean # For Cloudflare local env
npm run prod:secret:clean # For Cloudflare remote env
```


