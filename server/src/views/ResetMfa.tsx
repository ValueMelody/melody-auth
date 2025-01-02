import { html } from 'hono/html'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { responseScript } from 'views/scripts'
import Title from 'views/components/Title'
import { identityDto } from 'dtos'

const ResetMfa = ({
  branding, queryDto, locales, redirectUri,
}: {
  branding: Branding;
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  locales: typeConfig.Locale[];
  redirectUri: string;
}) => {
  return (
    <Layout
      branding={branding}
      locale={queryDto.locale}
      locales={locales}
    >
      <section
        id='success-message'
        class='flex-col gap-4 hidden'
      >
        <p class='text-green text-semibold'>{localeConfig.resetMfa.success[queryDto.locale]}</p>
        <a
          class='button-text'
          href={`${redirectUri}`}
        >
          {localeConfig.resetMfa.redirect[queryDto.locale]}
        </a>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.resetMfa.title[queryDto.locale]} />
        <SubmitError />
        <p class='w-text'>{localeConfig.resetMfa.desc[queryDto.locale]}</p>
        <button
          class='button w-full'
          type='button'
          onclick='handleReset()'
        >
          {localeConfig.resetMfa.confirm[queryDto.locale]}
        </button>
      </section>
      {html`
        <script>
          function handleReset () {
            fetch('${routeConfig.IdentityRoute.ResetMfa}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}"
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              document.getElementById('submit-form').classList.add('hidden');
              document.getElementById('success-message').classList.remove('hidden');
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default ResetMfa
