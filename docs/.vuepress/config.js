import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'en-US',

  title: 'Melody Auth',
  description: 'A turnkey authentication system that can be self-hosted on Cloudflare’s infrastructure.',

  theme: defaultTheme({
    logo: 'https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg',
    navbar: [],
  }),

  bundler: viteBundler(),
})
