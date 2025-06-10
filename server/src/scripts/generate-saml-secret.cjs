const { execSync } = require('child_process')
const fs = require('fs')

const CRT_FILE = 'saml_sp.crt'
const KEY_FILE = 'saml_sp.key'

const NODE_CRT_FILE = 'node_saml_sp.crt'
const NODE_KEY_FILE = 'node_saml_sp.key'

const cmd = [
  'openssl req',
  '-x509',
  '-newkey rsa:4096',
  '-nodes',
  `-keyout ${KEY_FILE}`,
  `-out ${CRT_FILE}`,
  '-days 730',
  '-subj "/CN=melody-auth SAML signing"',
].join(' ')

async function generateSamlSecret () {
  const argv = process.argv
  const isNode = argv[2] === 'node'

  execSync(cmd)

  if (isNode) {
    fs.copyFileSync(
      CRT_FILE,
      NODE_CRT_FILE,
    )
    fs.copyFileSync(
      KEY_FILE,
      NODE_KEY_FILE,
    )

    console.info('Secrets generated for node env')
  } else {
    execSync(`npx wrangler kv key put samlSpCrt --path=${CRT_FILE} --binding=KV --local`)
    execSync(`npx wrangler kv key put samlSpKey --path=${KEY_FILE} --binding=KV --local`)

    console.info('Secrets generated for CF env')
  }
}

generateSamlSecret().catch(console.error)
