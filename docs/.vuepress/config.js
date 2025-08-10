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
            text: 'Get Started',
            children: [
              { text: 'Auth Server Setup', link: '/auth-server-setup.html' },
              { text: 'Auth Server Configuration', link: '/auth-server-configuration.html' },
              { text: 'Admin Panel Setup', link: '/admin-panel-setup.html' },
              { text: 'Email Provider Setup', link: '/email-provider-setup.html' },
              { text: 'SMS Provider Setup', link: '/sms-provider-setup.html' },
            ],
          },
          {
            text: 'Identity Providers',
            children: [
              { text: 'Social Sign-In Provider Setup', link: '/social-sign-in-provider-setup.html' },
              { text: 'SAML SSO Setup', link: '/saml-sso-setup.html' },
            ],
          },
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
            text: 'Frontend SDKs',
            children: [
              { text: 'React SDK', link: '/react-sdk.html' },
              { text: 'Angular SDK', link: '/angular-sdk.html' },
              { text: 'Vue SDK', link: '/vue-sdk.html' },
              { text: 'Web SDK', link: '/web-sdk.html' },
            ],
          },
          {
            text: 'Backend APIs',
            children: [
              {
                text: 'S2S API',
                link: '/s2s-api.html',
              },
              {
                text: 'S2S API Swagger',
                link: 'https://auth-server.valuemelody.com/api/v1/swagger',
              },
              {
                text: 'Embedded Auth API',
                link: '/embedded-auth-api.html',
              },
              {
                text: 'Embedded Auth API Swagger',
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
            text: '快速开始',
            children: [
              { text: '认证服务器设置', link: '/zh/auth-server-setup.html' },
              { text: '认证服务器配置', link: '/zh/auth-server-configuration.html' },
              { text: '管理面板设置', link: '/zh/admin-panel-setup.html' },
              { text: '邮箱提供商设置', link: '/zh/email-provider-setup.html' },
              { text: '短信提供商设置', link: '/zh/sms-provider-setup.html' },
            ],
          },
          {
            text: '身份提供商',
            children: [
              { text: '社交登录提供商设置', link: '/zh/social-sign-in-provider-setup.html' },
              { text: 'SAML SSO 设置', link: '/zh/saml-sso-setup.html' },
            ],
          },
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
            text: '前端 SDK',
            children: [
              { text: 'React SDK', link: '/zh/react-sdk.html' },
              { text: 'Angular SDK', link: '/zh/angular-sdk.html' },
              { text: 'Vue SDK', link: '/zh/vue-sdk.html' },
              { text: 'Web SDK', link: '/zh/web-sdk.html' },
            ],
          },
          {
            text: '后端 API',
            children: [
              {
                text: '服务间认证 API',
                link: '/zh/s2s-api.html',
              },
              {
                text: '服务间认证 API Swagger',
                link: 'https://auth-server.valuemelody.com/api/v1/swagger',
              },
              {
                text: '嵌入式认证 API',
                link: '/zh/embedded-auth-api.html',
              },
              {
                text: '嵌入式认证 API Swagger',
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
