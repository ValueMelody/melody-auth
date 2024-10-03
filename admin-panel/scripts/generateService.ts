import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: '../../server/src/scripts/swagger.json',
  apiFile: '../services/auth',
  apiImport: 'authApi',
  tag: true,
  outputFile: '../services/auth/api.ts',
  exportName: 'authApi',
  hooks: {
    queries: true, lazyQueries: true, mutations: true,
  },
}

export default config
