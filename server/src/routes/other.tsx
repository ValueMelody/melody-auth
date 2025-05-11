import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'
import s2sSwaggerSpec from '../scripts/swagger.json'
import embeddedSwaggerSpec from '../scripts/embedded-swagger.json'
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
    spec: s2sSwaggerSpec, url: '/',
  }),
)

otherRoutes.get(
  '/api/v1/embedded-swagger',
  swaggerUI({
    spec: embeddedSwaggerSpec, url: '/',
  }),
)
