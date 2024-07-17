import { localeConfig } from 'configs'

const PoweredBy = () => {
  return (
    <a
      href='https://github.com/ValueMelody/melody-auth'
      class='text-sm mt-8'>
      {localeConfig.CommonPage.PoweredBy}
    </a>
  )
}

export default PoweredBy
