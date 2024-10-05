import {
  Context, Next,
} from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { basicAuth } from 'hono/basic-auth'
import { Scope } from 'shared'
import { typeConfig } from 'configs'
import { jwtService } from 'services'
import { oauthDto } from 'dtos'

const parseToken = async (
  c: Context<typeConfig.Context>, token: string,
) => {
  if (!token) return false

  const accessTokenBody = await jwtService.getAccessTokenBody(
    c,
    token,
  )
  if (!accessTokenBody) return false

  return accessTokenBody
}

export const spa = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    const accessTokenBody = await parseToken(
      c,
      token,
    )
    if (!accessTokenBody) return false

    c.set(
      'access_token_body',
      accessTokenBody,
    )

    return true
  },
})

export const spaProfile = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    const accessTokenBody = await parseToken(
      c,
      token,
    )
    if (!accessTokenBody) return false

    const scopes = accessTokenBody.scope?.split(' ') ?? []
    if (!scopes.includes(Scope.Profile)) return false

    c.set(
      'access_token_body',
      accessTokenBody,
    )

    return true
  },
})

export const spaBasicAuth = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const authGuard = basicAuth({
    verifyUser: (
      username, password, c: Context<typeConfig.Context>,
    ) => {
      if (!username) return false
      c.set(
        'basic_auth_body',
        {
          username, password,
        },
      )
      return true
    },
  })
  return authGuard(
    c,
    next,
  )
}

const s2sScopeGuard = async (
  c: Context<typeConfig.Context>, token: string, scope: Scope,
) => {
  const accessTokenBody = await parseToken(
    c,
    token,
  )
  if (!accessTokenBody) return false

  const scopes = accessTokenBody.scope?.split(' ') ?? []

  if (!scopes.includes(scope) && !scopes.includes(Scope.Root)) return false

  c.set(
    'access_token_body',
    accessTokenBody,
  )

  return true
}

export const s2sRoot = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.Root,
    )
  },
})

export const s2sReadUser = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.ReadUser,
    )
  },
})

export const s2sWriteUser = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.WriteUser,
    )
  },
})

export const s2sReadApp = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.ReadApp,
    )
  },
})

export const s2sWriteApp = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.WriteApp,
    )
  },
})

export const s2sReadRole = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.ReadRole,
    )
  },
})

export const s2sWriteRole = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.WriteRole,
    )
  },
})

export const s2sReadScope = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.ReadScope,
    )
  },
})

export const s2sWriteScope = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    return s2sScopeGuard(
      c,
      token,
      Scope.WriteScope,
    )
  },
})

export const s2sBasicAuth = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const reqBody = await c.req.parseBody()
  const grantType = String(reqBody.grant_type).toLowerCase()
  if (grantType === oauthDto.TokenGrantType.ClientCredentials) {
    const authGuard = basicAuth({
      verifyUser: (
        username, password, c: Context<typeConfig.Context>,
      ) => {
        if (!username || !password) return false
        c.set(
          'basic_auth_body',
          {
            username, password,
          },
        )
        return true
      },
    })
    return authGuard(
      c,
      next,
    )
  } else {
    await next()
  }
}
