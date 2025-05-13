const fs = require('fs')
const swaggerJsdoc = require('swagger-jsdoc')
const {
  PostInitiateReq,
  PostSignInReq,
  TokenExchangeReq,
  AuthRes,
  TokenExchangeRes,
  TokenRefreshReq,
  TokenRefreshRes,
} = require('./schemas/embedded.cjs')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Melody Auth Embedded Auth API',
      version: '0.0.1',
    },
    components: {
      schemas: {
        PostInitiateReq,
        PostSignInReq,
        TokenExchangeReq,
        AuthRes,
        TokenExchangeRes,
        TokenRefreshReq,
        TokenRefreshRes,
      },
    },
  },
  apis: [
    './src/routes/embedded.tsx',
  ],
}

const swaggerSpec = swaggerJsdoc(options)

fs.writeFileSync(
  './src/scripts/embedded-swagger.json',
  JSON.stringify(
    swaggerSpec,
    null,
    2,
  ),
  'utf-8',
)
