import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'
import swaggerSpec from '../scripts/swagger.json'
// import swaggerSpec from '../scripts/swagger.json' with { type: 'json' }
import { otherHandler } from 'handlers'
import { typeConfig } from 'configs'

const otherRoutes = new Hono<typeConfig.Context>()
export default otherRoutes

otherRoutes.get(
  '/info',
  otherHandler.getSystemInfo,
)

otherRoutes.get(
  '/.well-known/openid-configuration',
  otherHandler.getOpenidConfig,
)

otherRoutes.get(
  '/.well-known/jwks.json',
  otherHandler.getJwks,
)

otherRoutes.get(
  '/api/v1/swagger',
  swaggerUI({
    spec: swaggerSpec, url: '/',
  }),
)
