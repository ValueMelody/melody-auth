import { Context } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { typeConfig } from 'configs'
import { jwtService } from 'services'

const parseToken = async (
  c: Context<typeConfig.Context>, token: string, type: typeConfig.ClientType,
) => {
  if (!token) return false

  const accessTokenBody = await jwtService.getAccessTokenBody(
    c,
    type,
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
      typeConfig.ClientType.SPA,
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
      typeConfig.ClientType.SPA,
    )
    if (!accessTokenBody) return false

    const scopes = accessTokenBody.scope?.split(' ') ?? []
    if (!scopes.includes(typeConfig.Scope.Profile)) return false

    c.set(
      'access_token_body',
      accessTokenBody,
    )

    return true
  },
})

export const s2sReadUser = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    const accessTokenBody = await parseToken(
      c,
      token,
      typeConfig.ClientType.S2S,
    )
    if (!accessTokenBody) return false

    const scopes = accessTokenBody.scope?.split(' ') ?? []
    if (!scopes.includes(typeConfig.Scope.READ_USER)) return false

    c.set(
      'access_token_body',
      accessTokenBody,
    )

    return true
  },
})
