import {
  routeConfig, typeConfig, variableConfig,
} from 'configs'
import {
  useSocialSignIn, View,
} from 'pages/hooks'
import { signIn } from 'pages/tools/locale'
import { AuthorizeParams } from 'pages/tools/param'

export interface DiscordSignInProps {
  discordClientId: string;
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  onSubmitError: (error: string) => void;
  onSwitchView: (view: View) => void;
}

const DiscordSignIn = ({
  discordClientId,
  locale,
  params,
  onSwitchView,
  onSubmitError,
}: DiscordSignInProps) => {
  const { socialSignInState } = useSocialSignIn({
    params,
    locale,
    onSubmitError,
    onSwitchView,
  })

  if (!discordClientId) return null

  return (
    <div className='flex flex-row justify-center'>
      <a
        id='discord-login-btn'
        className='flex flex-row items-center justify-center cursor-pointer w-[240px] h-[40px] bg-[#5865f2] p-[0 8px] gap-2 text-white text-medium font-bold rounded-md'
        href={`https://discord.com/oauth2/authorize?client_id=${discordClientId}&response_type=code&redirect_uri=${window.location.origin}${routeConfig.IdentityRoute.AuthorizeDiscord}&scope=${variableConfig.SocialSignInConfig.DiscordScope}&state=${JSON.stringify(socialSignInState)}`}
      >
        <DiscordLogo className='w-6 h-6' />
        {signIn.discordSignIn[locale]}
      </a>
    </div>
  )
}

export default DiscordSignIn

const DiscordLogo = ({ className }: {
  className: string;
}) => {
  return (
    <svg
      id='Discord-Logo'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 126.644 96'
      className={className}>
      <defs>
        <style>
          {'.cls-1 { fill: #fff; }'}
        </style>
      </defs>
      <path
        id='Discord-Symbol-White'
        className='cls-1'
        d='M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z'/>
    </svg>
  )
}
