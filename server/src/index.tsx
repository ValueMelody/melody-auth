import { uuid } from '@cfworker/uuid';
import { kvConfig, routeConfig } from 'configs';
import { requestDto } from 'dtos';
import { Hono } from 'hono'
import { oauthService } from 'services';
import { cryptoUtil, validateUtil } from 'utils';
import Authorize from 'views/Authorize';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get(`${routeConfig.InternelRoute.OAuth}/authorize`, async (c) => {
  const queryDto = new requestDto.GetAuthorizeReqQueryDto({
    clientId: c.req.query('client_id') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    responseType: c.req.query('response_type') ?? '',
    state: c.req.query('state') ?? '',
    scope: c.req.queries('scope') ?? [],
  })
  await validateUtil.dto(queryDto)

  await oauthService.getAppEntity(c.env.DB, queryDto.clientId, queryDto.redirectUri)

  return c.html(<Authorize queryDto={queryDto} />)
})

app.post(`${routeConfig.InternelRoute.OAuth}/authorize`, async (c) => {
  const reqBody = await c.req.json()
  const bodyDto = new requestDto.PostAuthorizeReqBodyWithPasswordDto(reqBody)
  await validateUtil.dto(bodyDto)

  await oauthService.getAppEntity(c.env.DB, bodyDto.clientId, bodyDto.redirectUri)

  const password = await cryptoUtil.encryptPassword(bodyDto.password)
  const user = await oauthService.getUserEntityByEmailAndPassword(c.env.DB, bodyDto.email, password)

  const code = uuid()
  c.env.KV.put(`${kvConfig.BaseKey.AuthCode}-${code}`, JSON.stringify({
    bodyDto,
    user
  }), { expirationTtl: 30 })

  return c.json({ code, redirectUri: bodyDto.redirectUri, state: bodyDto.state })
})

export default app
