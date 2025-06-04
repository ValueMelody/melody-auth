const { execSync } = require('child_process')

const CRT_FILE = 'sp.crt'
const KEY_FILE = 'sp.key'

async function generateSamlSecret () {
  const argv = process.argv
  const isProd = argv[2] === 'prod'

  const configPath = argv[3] || ''

  const condition = isProd ? (configPath ? `--config ${configPath} --remote` : '--remote') : '--local'

  execSync(`npx wrangler kv key put spCrt --path=${CRT_FILE} --binding=KV ${condition}`)
  execSync(`npx wrangler kv key put spKey --path=${KEY_FILE} --binding=KV ${condition}`)

  console.info('Secrets generated for CF env')
}

generateSamlSecret().catch(console.error)
