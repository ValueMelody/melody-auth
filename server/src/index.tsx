import { routeConfig } from 'configs';
import { requestDto } from 'dtos';
import { Hono } from 'hono'
import { oauthService } from 'services';
import { validateUtil } from 'utils';
import Authorize from 'views/Authorize';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get(`${routeConfig.InternelRoute.OAuth}/authorize`, async (c) => {
  const queryDto = new requestDto.GetAuthorizeReqQueryDto(c.req)
  await validateUtil.dto(queryDto)

  await oauthService.verifyApp(queryDto.clientId, queryDto.redirectUri, c.env.DB)

  return c.html(<Authorize queryDto={queryDto} />)
})


export default app
