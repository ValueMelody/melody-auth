import { localeConfig } from "configs";
import { GetAuthorizeReqQueryDto } from "dtos/request"
import Layout from "views/components/Layout";

const Authorize = ({
  queryDto
}: {
  queryDto: GetAuthorizeReqQueryDto;
}) => {
  return (
    <Layout>
      <form method="POST" action="/authorize">
        <section class="flex-col gap-4">
          <section class="flex-col gap-2">
            <label for="email">{localeConfig.AuthorizePage.EmailLabel}</label>
            <input type="email" id="email" name="email" />
          </section>
          <section class="flex-col gap-2">
            <label for="password">{localeConfig.AuthorizePage.PasswordLabel}</label>
            <input type="password" id="password" name="password" />
          </section>
          <input type="hidden" name="responseType" value={queryDto.responseType} />
          <input type="hidden" name="clientId" value={queryDto.clientId} />
          <input type="hidden" name="redirectUri" value={queryDto.redirectUri} />
          <input type="hidden" name="scope" value={queryDto.scope} />
          <input type="hidden" name="state" value={queryDto.state} />
          <button class="button-outline rounded-md" type="submit">
            {localeConfig.AuthorizePage.SubmitBtn}
          </button>
        </section>
      </form>
    </Layout>
  )
}

export default Authorize
