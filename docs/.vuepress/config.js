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
              { text: 'Admin Panel Setup', link: '/admin-panel-setup.html' },
              { text: 'Email Provider Setup', link: '/email-provider-setup.html' },
              { text: 'SMS Provider Setup', link: '/sms-provider-setup.html' },
              {
                text: 'External Identity Providers',
                children: [
                  { text: 'Social Sign-In Provider Setup', link: '/social-sign-in-provider-setup.html' },
                  { text: 'OIDC SSO Setup', link: '/oidc-sso-setup.html' },
                  { text: 'SAML SSO Setup', link: '/saml-sso-setup.html' },
                ],
              },
            ],
          },
          {
            text: 'Features',
            children: [
              {
                text: 'Main Features',
                children: [
                  { text: 'Authentication', link: '/authentication.md' },
                  { text: 'JWT & JWKS', link: '/jwt-and-jwks.md' },
                  { text: 'Multi-Factor Authentication', link: '/mfa-setup.md' },
                  { text: 'Role-Based Access Control', link: '/rbac.md' },
                  { text: 'Policies', link: '/policies.md' },
                  { text: 'Organizations', link: '/organizations.md' },
                ],
              },
              {
                text: 'Additional Features',
                children: [
                  {
                    text: 'User Attributes',
                    link: '/user-attributes.md',
                  },
                  {
                    text: 'App Banners',
                    link: '/app-banners.md',
                  },
                  {
                    text: 'Organization Groups',
                    link: '/org-groups.md',
                  },
                  {
                    text: 'Impersonation',
                    link: '/impersonation.md',
                  },
                  {
                    text: 'Log Management',
                    link: '/log-management.md',
                  },
                ],
              },
              {
                text: 'Customization',
                children: [
                  {
                    text: 'Auth Server Configuration',
                    link: '/auth-server-configuration.html',
                  },
                  { text: 'Branding', link: '/branding.md' },
                  { text: 'Localization', link: '/localization.md' },
                ],
              }
            ],
          },
          {
            text: 'SDKs',
            children: [
              {
                text: 'Frontend SDKs',
                children: [
                  { text: 'React SDK', link: '/react-sdk.html' },
                  { text: 'Next.js SDK', link: '/nextjs-sdk.html' },
                  { text: 'Angular SDK', link: '/angular-sdk.html' },
                  { text: 'Vue SDK', link: '/vue-sdk.html' },
                  { text: 'Web SDK', link: '/web-sdk.html' },
                ],
              },
              {
                text: 'Backend APIs',
                children: [
                  {
                    text: 'S2S API Setup',
                    link: '/s2s-api.html',
                  },
                  {
                    text: 'S2S API Swagger',
                    link: 'https://auth-server.valuemelody.com/api/v1/swagger',
                  },
                  {
                    text: 'Embedded Auth API Setup',
                    link: '/embedded-auth-api.html',
                  },
                  {
                    text: 'Embedded Auth API Swagger',
                    link: 'https://auth-server.valuemelody.com/api/v1/embedded-swagger',
                  },
                ],
              },
            ]
          },
          {
            text: 'DevOps',
            children: [
              {
                text: 'Deployment Pipelines',
                link: '/deployment-pipelines.html',
              },
              {
                text: 'Rotate JWT Secret',
                link: '/jwt-secret-rotate.html',
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
              { text: '管理面板设置', link: '/zh/admin-panel-setup.html' },
              { text: '邮箱提供商设置', link: '/zh/email-provider-setup.html' },
              { text: '短信提供商设置', link: '/zh/sms-provider-setup.html' },
              {
                text: '外部身份提供商',
                children: [
                  { text: '社交登录提供商设置', link: '/zh/social-sign-in-provider-setup.html' },
                  { text: 'OIDC SSO 设置', link: '/zh/oidc-sso-setup.html' },
                  { text: 'SAML SSO 设置', link: '/zh/saml-sso-setup.html' },
                ],
              },
            ],
          },
          {
            text: '功能',
            children: [
              {
                text: '主要功能',
                children: [
                  { text: '身份认证', link: '/zh/authentication.md' },
                  { text: 'JWT & JWKS', link: '/zh/jwt-and-jwks.md' },
                  { text: '多重认证(MFA)', link: '/zh/mfa-setup.md' },
                  { text: '角色权限控制(RBAC)', link: '/zh/rbac.md' },
                  { text: '策略(policy)', link: '/zh/policies.md' },
                  { text: '组织(organization)', link: '/zh/organizations.md' },
                ],
              },
              {
                text: '其他功能',
                children: [
                  { text: '用户属性', link: '/zh/user-attributes.md' },
                  { text: '应用横幅', link: '/zh/app-banners.md' },
                  { text: '组织分组', link: '/zh/org-groups.md' },
                  { text: '模拟登录', link: '/zh/impersonation.md' },
                  { text: '日志管理', link: '/zh/log-management.md' },
                ],
              },
              {
                text: '定制化',
                children: [
                  { text: '认证服务器配置', link: '/zh/auth-server-configuration.html' },
                  { text: '品牌与主题', link: '/zh/branding.md' },
                  { text: '语言本地化', link: '/zh/localization.md' },
                ],
              },
            ],
          },
          {
            text: 'SDKs',
            children: [
              {
                text: '前端 SDK',
                children: [
                  { text: 'React SDK', link: '/zh/react-sdk.html' },
                  { text: 'Next.js SDK', link: '/zh/nextjs-sdk.html' },
                  { text: 'Angular SDK', link: '/zh/angular-sdk.html' },
                  { text: 'Vue SDK', link: '/zh/vue-sdk.html' },
                  { text: 'Web SDK', link: '/zh/web-sdk.html' },
                ],
              },
              {
                text: '后端 API',
                children: [
                  {
                    text: '服务间认证 API 设置',
                    link: '/zh/s2s-api.html',
                  },
                  {
                    text: '服务间认证 API Swagger',
                    link: 'https://auth-server.valuemelody.com/api/v1/swagger',
                  },
                  {
                    text: '嵌入式认证 API 设置',
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
          {
            text: 'DevOps',
            children: [
              {
                text: '部署流水线',
                link: '/zh/deployment-pipelines.html',
              },
              {
                text: '轮换 JWT 密钥',
                link: '/zh/jwt-secret-rotate.html',
              },
            ],
          },
        ],
      },
    },
  }),

  bundler: viteBundler(),
})
