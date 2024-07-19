# S2S API

Melody Auth S2S API provides abilities for server app to manage resources.

## Get Started
Obtain a s2s access_token from /token endpoint by using your clientId, and clientScret as basic auth header. Use this access_token as bearer header to other requests.

- HTTP Method: `POST`
- Content Type: `application/x-www-form-urlencoded`
- URL: `[melody_auth_server_url]/oauth2/v1/token`

### Parameters

| Property | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| ``grant_type`` | 'client_credentials' | true | Indicate we are exchange token using client credentials |
| ``scope`` | 'read_user write_user' | true | Request required scopes |


### Request example

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


## Response example

``` JSON
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzQ1NiIsInNjb3BlIjoicmVhZF91c2VyIHdyaXRlX3VzZXIiLCJpYXQiOjE3MjE0MjE4MTcsImV4cCI6MTcyMTQyNTQxN30.blhriLgm67tkL89tVLdeNN5nl4EUssy6FIfp4kTOlqM",
  "expires_in":3600,
  "expires_on":1721425417,
  "token_type":"Bearer",
  "scope":"read_user write_user"
}
```

## Get Users

- HTTP Method: `GET`
- Content Type: `application/json`
- URL: `[melody_auth_server_url]/api/v1/users`

### Query Parameters

| Property | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| ``includeDisabled`` | 'true' | false | If disabled users should be included. |

### Request example

``` js
fetch('/api/v1/users', {
  method: 'GET',
  headers: {
    'Content-type': 'application/json',
    'Authorization': `bearer ${access_token}`
  },
})
```

## Get User

- HTTP Method: `GET`
- Content Type: `application/json`
- URL: `[melody_auth_server_url]/api/v1/users/:authId`

### Request example

``` js
fetch('/api/v1/users/d638bb77-2883-4bce-ad4c-9fe01319fb86', {
  method: 'GET',
  headers: {
    'Content-type': 'application/json',
    'Authorization': `bearer ${access_token}`
  },
})
```

## Disable User

- HTTP Method: `PUT`
- Content Type: `application/json`
- URL: `[melody_auth_server_url]/api/v1/users/:authId/disable`

### Request example

``` js
fetch('/api/v1/users/d638bb77-2883-4bce-ad4c-9fe01319fb86/disable', {
  method: 'PUT',
  headers: {
    'Content-type': 'application/json',
    'Authorization': `bearer ${access_token}`
  },
})
```

## Enable User

- HTTP Method: `PUT`
- Content Type: `application/json`
- URL: `[melody_auth_server_url]/api/v1/users/:authId/enable`

### Request example

``` js
fetch('/api/v1/users/d638bb77-2883-4bce-ad4c-9fe01319fb86/enable', {
  method: 'PUT',
  headers: {
    'Content-type': 'application/json',
    'Authorization': `bearer ${access_token}`
  },
})
```

## Send Verification Email

- HTTP Method: `POST`
- Content Type: `application/json`
- URL: `[melody_auth_server_url]/api/v1/users/:authId/verify-email`

### Request example

``` js
fetch('/api/v1/users/d638bb77-2883-4bce-ad4c-9fe01319fb86/verify-email', {
  method: 'POST',
  headers: {
    'Content-type': 'application/json',
    'Authorization': `bearer ${access_token}`
  },
})
```
