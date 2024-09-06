const fs = require('fs')
const swaggerJsdoc = require('swagger-jsdoc')
const {
  Scope, ScopeDetail, PutScopeReq, PostScopeReq,
} = require('./schemas/scope.cjs')
const {
  Role, PutRoleReq, PostRoleReq,
} = require('./schemas/role.cjs')
const {
  App, AppDetail, PostAppReq, PutAppReq,
} = require('./schemas/app.cjs')
const {
  User, UserDetail, PutUserReq,
  UserConsentedApp,
} = require('./schemas/user.cjs')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Melody Auth S2S API',
      version: '0.0.1',
    },
    components: {
      securitySchemes: {
        oauth2: {
          type: 'oauth2',
          flows: {
            clientCredentials: {
              tokenUrl: '/oauth2/v1/token',
              scopes: {
                read_app: 'Read access to app',
                write_app: 'Write access to app',
                read_user: 'Read access to user',
                write_user: 'Write access to user',
                read_role: 'Read access to role',
                write_role: 'Write access to role',
                read_scope: 'Read access to scope',
                write_scope: 'Write access to scope',
              },
            },
          },
        },
      },
      schemas: {
        Scope,
        ScopeDetail,
        PutScopeReq,
        PostScopeReq,
        Role,
        PutRoleReq,
        PostRoleReq,
        App,
        AppDetail,
        PostAppReq,
        PutAppReq,
        User,
        UserDetail,
        UserConsentedApp,
        PutUserReq,
      },
    },
  },
  apis: [
    './src/routes/scope.tsx',
    './src/routes/role.tsx',
    './src/routes/app.tsx',
    './src/routes/user.tsx',
  ],
}

const swaggerSpec = swaggerJsdoc(options)

fs.writeFileSync(
  './src/scripts/swagger.json',
  JSON.stringify(
    swaggerSpec,
    null,
    2,
  ),
  'utf-8',
)
