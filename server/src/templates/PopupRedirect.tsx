import { html } from 'hono/html'
import { oauthDto } from 'dtos'

const PopupRedirect = ({
  queryDto, code,
}: {
  queryDto: oauthDto.GetAuthorizeDto;
  code: string;
}) => {
  return (
    <html>
      <body>
        <section>
          <div />
          {html`
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  state: "${queryDto.state}",
                  code: "${code}",
                  locale: "${queryDto.locale}",
                  org: "${queryDto.org ?? ''}",
                  redirectUri: "${queryDto.redirectUri}",
                }, "${queryDto.redirectUri}");
              }
            </script>
          `}
        </section>
      </body>
    </html>
  )
}

export default PopupRedirect
