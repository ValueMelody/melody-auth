const fs = require('fs')
const { execSync } = require('child_process')

const NODE_DEPRECATED_PRIVATE_KEY_FILE = 'node_deprecated_jwt_private_key.pem'
const NODE_DEPRECATED_PUBLIC_KEY_FILE = 'node_deprecated_jwt_public_key.pem'

async function cleanSecrets () {
  const argv = process.argv
  const isProd = argv[2] === 'prod'
  const isNode = argv[2] === 'node'

  if (isNode) {
    if (fs.existsSync(NODE_DEPRECATED_PRIVATE_KEY_FILE)) {
      fs.rmSync(NODE_DEPRECATED_PRIVATE_KEY_FILE)
    }

    if (fs.existsSync(NODE_DEPRECATED_PUBLIC_KEY_FILE)) {
      fs.rmSync(NODE_DEPRECATED_PUBLIC_KEY_FILE)
    }

    console.info('Secrets cleaned for node env')
  } else {
    const condition = isProd ? '' : '--local'

    const [hasDeprecatedPublicKey] = JSON.parse(execSync(`wrangler kv key list --prefix=deprecatedJwtPublicSecret --binding=KV ${condition}`).toString())
    const [hasDeprecatedPrivateKey] = JSON.parse(execSync(`wrangler kv key list --prefix=deprecatedJwtPrivateSecret --binding=KV ${condition}`).toString())
    if (hasDeprecatedPublicKey) {
      execSync(`wrangler kv key delete deprecatedJwtPublicSecret --binding=KV ${condition}`)
    }

    if (hasDeprecatedPrivateKey) {
      execSync(`wrangler kv key delete deprecatedJwtPrivateSecret --binding=KV ${condition}`)
    }

    console.info('Secrets cleaned for CF env')
  }
}

cleanSecrets().catch(console.error)
