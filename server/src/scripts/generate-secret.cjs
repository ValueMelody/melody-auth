const fs = require('fs')
const { execSync } = require('child_process')
const crypto = require('crypto')

function convertArrayBufferToPEM (
  buffer, label,
) {
  const base64String = arrayBufferToBase64(buffer)
  const pemString = `-----BEGIN ${label}-----\n${base64String.match(/.{1,64}/g).join('\n')}\n-----END ${label}-----\n`
  return pemString
}

function arrayBufferToBase64 (buffer) {
  const binaryString = String.fromCharCode.apply(
    null,
    new Uint8Array(buffer),
  )
  return Buffer.from(
    binaryString,
    'binary',
  ).toString('base64')
}

const PRIVATE_KEY_FILE = 'jwt_private_key.pem'
const PUBLIC_KEY_FILE = 'jwt_public_key.pem'
const NODE_PRIVATE_KEY_FILE = 'node_jwt_private_key.pem'
const NODE_PUBLIC_KEY_FILE = 'node_jwt_public_key.pem'
const NODE_DEPRECATED_PRIVATE_KEY_FILE = 'node_deprecated_jwt_private_key.pem'
const NODE_DEPRECATED_PUBLIC_KEY_FILE = 'node_deprecated_jwt_public_key.pem'
const NODE_SESSION_SECRET_FILE = 'node_session_secret'

async function generateRSAKeyPair () {
  const argv = process.argv
  const isProd = argv[2] === 'prod'
  const isNode = argv[2] === 'node'

  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )

  const publicKey = await crypto.subtle.exportKey(
    'spki',
    keyPair.publicKey,
  )
  const pemPublicKey = convertArrayBufferToPEM(
    publicKey,
    'PUBLIC KEY',
  )

  const privateKey = await crypto.subtle.exportKey(
    'pkcs8',
    keyPair.privateKey,
  )
  const pemPrivateKey = convertArrayBufferToPEM(
    privateKey,
    'PRIVATE KEY',
  )

  const sessionSecret = crypto.randomBytes(20).toString('hex')

  if (isNode) {
    const hasSessionSecret = fs.existsSync(NODE_SESSION_SECRET_FILE)
    if (!hasSessionSecret) {
      fs.writeFileSync(
        NODE_SESSION_SECRET_FILE,
        sessionSecret,
      )
    }

    const hasPublicKey = fs.existsSync(NODE_PUBLIC_KEY_FILE)
    const hasPrivateKey = fs.existsSync(NODE_PRIVATE_KEY_FILE)

    if (hasPublicKey && hasPrivateKey) {
      fs.copyFileSync(
        NODE_PUBLIC_KEY_FILE,
        NODE_DEPRECATED_PUBLIC_KEY_FILE,
      )
      fs.copyFileSync(
        NODE_PRIVATE_KEY_FILE,
        NODE_DEPRECATED_PRIVATE_KEY_FILE,
      )
    }

    fs.writeFileSync(
      NODE_PUBLIC_KEY_FILE,
      pemPublicKey,
    )
    fs.writeFileSync(
      NODE_PRIVATE_KEY_FILE,
      pemPrivateKey,
    )

    console.info('Secrets generated for node env')
  } else {
    const condition = isProd ? '' : '--local'

    const [hasSessionSecret] = JSON.parse(execSync(`wrangler kv key list --prefix=sessionSecret --binding=KV ${condition}`).toString())
    if (!hasSessionSecret) {
      execSync(`wrangler kv key put sessionSecret ${sessionSecret} --binding=KV ${condition}`)
    }

    const [hasPublicKey] = JSON.parse(execSync(`wrangler kv key list --prefix=jwtPublicSecret --binding=KV ${condition}`).toString())
    const [hasPrivateKey] = JSON.parse(execSync(`wrangler kv key list --prefix=jwtPrivateSecret --binding=KV ${condition}`).toString())
    if (hasPublicKey && hasPrivateKey) {
      const currentPublicKey = execSync(`wrangler kv key get jwtPublicSecret --binding=KV ${condition}`).toString()
      const currentPrivateKey = execSync(`wrangler kv key get jwtPrivateSecret --binding=KV ${condition}`).toString()

      fs.writeFileSync(
        PUBLIC_KEY_FILE,
        currentPublicKey,
      )
      fs.writeFileSync(
        PRIVATE_KEY_FILE,
        currentPrivateKey,
      )
      execSync(`wrangler kv key put deprecatedJwtPublicSecret --path=${PUBLIC_KEY_FILE} --binding=KV ${condition}`)
      execSync(`wrangler kv key put deprecatedJwtPrivateSecret --path=${PRIVATE_KEY_FILE} --binding=KV ${condition}`)
    }

    fs.writeFileSync(
      PUBLIC_KEY_FILE,
      pemPublicKey,
    )
    fs.writeFileSync(
      PRIVATE_KEY_FILE,
      pemPrivateKey,
    )

    execSync(`wrangler kv key put jwtPublicSecret --path=${PUBLIC_KEY_FILE} --binding=KV ${condition}`)
    execSync(`wrangler kv key put jwtPrivateSecret --path=${PRIVATE_KEY_FILE} --binding=KV ${condition}`)

    console.info('Secrets generated for CF env')
  }
}

generateRSAKeyPair().catch(console.error)
