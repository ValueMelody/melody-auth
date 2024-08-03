# S2S API

Melody Auth S2S API provides capabilities for server applications to manage resources.

## Get Started
To get started, obtain an access_token from the /token endpoint by using your clientId and clientSecret as the Basic Auth header. Use this access_token as a Bearer token in the Authorization header for subsequent requests.

- HTTP Method: `POST`
- Content Type: `application/x-www-form-urlencoded`
- URL: `[melody_auth_server_url]/oauth2/v1/token`

### Token Request Parameters

| Property | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| ``grant_type`` | 'client_credentials' | true | Indicates the use of client credentials to exchange for a token |
| ``scope`` | string | true | Scopes requested (e.g., 'read_user write_user') |


### Token Request example

``` js
const credentials = `${clientId}:${clientSecret}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');

const data = {
  grant_type: 'client_credentials',
  scope: 'read_user write_user',
}
const urlEncodedData = new URLSearchParams(data).toString()

fetch('/oauth2/v1/token', {
  method: 'POST',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded',
    'Authorization': `basic ${encodedCredentials}`
  },
  body: urlEncodedData,
})
```

### Token Response example

``` JSON
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzQ1NiIsInNjb3BlIjoicmVhZF91c2VyIHdyaXRlX3VzZXIiLCJpYXQiOjE3MjE0MjE4MTcsImV4cCI6MTcyMTQyNTQxN30.blhriLgm67tkL89tVLdeNN5nl4EUssy6FIfp4kTOlqM",
  "expires_in":3600,
  "expires_on":1721425417,
  "token_type":"Bearer",
  "scope":"read_user write_user"
}
```

## Detailed Documentation
For more detailed information, please see [Rest API Swagger](https://auth-server.valuemelody.com/api/v1/swagger).
