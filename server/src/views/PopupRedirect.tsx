import { html } from 'hono/html'
import { oauthDto } from 'dtos'
import { responseScript } from 'views/scripts'

const PopupRedirect = ({
  queryDto, code,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  code: string;
}) => {
  return (
    <html>
      <body>
        <section>
          <div />
          {html`
            <script>
              var data = {
                state: "${queryDto.state}",
                code: "${code}",
                redirectUri: "${queryDto.redirectUri}",
              }
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale,
      queryDto.org,
    )}
            </script>
          `}
        </section>
      </body>
    </html>
  )
}

export default PopupRedirect
