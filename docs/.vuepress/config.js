import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'en-US',

  locales: {
    '/': {
      lang: 'en-US',
    },
    '/zh/': {
      lang: 'zh-CN',
    },
  },

  title: 'Melody Auth',
  description: 'Effortless OAuth and Authentication, Built for Flexibility and Control.',

  theme: defaultTheme({
    logo: 'https://valuemelody.com/logo.svg',
    locales: {
      '/': {
        lang: 'en-US',
        navbar: [
          {
            text: 'Additional Features',
            children: [
              {
                text: 'App Banners',
                link: '/app-banners.md',
              },
            ],
          },
          {
            text: 'API Swaggers',
            children: [
              {
                text: 'S2S API',
                link: 'https://auth-server.valuemelody.com/api/v1/swagger',
              },
              {
                text: 'Embedded Auth API',
                link: 'https://auth-server.valuemelody.com/api/v1/embedded-swagger',
              },
            ],
          },
        ],
      },
      '/zh/': {
        lang: 'zh-CN',
        navbar: [
          {
            text: '其他功能',
            children: [
              {
                text: '应用横幅',
                link: '/zh/app-banners.md',
              },
            ],
          },
          {
            text: 'API 文档',
            children: [
              {
                text: 'S2S API',
                link: 'https://auth-server.valuemelody.com/api/v1/swagger',
              },
              {
                text: 'Embedded Auth API',
                link: 'https://auth-server.valuemelody.com/api/v1/embedded-swagger',
              },
            ],
          },
        ],
      },
    },
  }),

  bundler: viteBundler(),
})
