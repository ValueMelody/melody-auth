# Embedded Auth API

The **Melody Auth Embedded Auth API** enables frontend applications to embed authentication flows directly within the app through a simple set of APIs.

## Get Started
In `server/wrangler.toml`, set `EMBEDDED_AUTH_ORIGINS` to your frontend application’s origin.  
For example:
```
EMBEDDED_AUTH_ORIGINS=['http://localhost:3000']
```
Embedded Auth also respects your broader server configuration, so be sure to disable any unwanted or unsupported features there.

## Detailed Documentation
For more information, see the [Embedded Auth API Swagger](https://auth-server.valuemelody.com/api/v1/embedded-swagger).

## Example
A bare-bones example in React is available here
[embedded-auth-example](https://github.com/ValueMelody/melody-auth-examples/tree/main/embedded-auth)