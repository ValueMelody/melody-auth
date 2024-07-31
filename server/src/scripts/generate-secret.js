const { exec } = require('child_process')
const fs = require('fs')
const crypto = require('crypto')
const jose = require('node-jose')

const PRIVATE_KEY_FILE = 'jwt_private_key.pem'
const PUBLIC_KEY_FILE = 'jwt_public_key.pem'

async function generateRSAKeyPair () {
  const argv = process.argv
  const isProd = argv[2] === 'prod'

  const keystore = jose.JWK.createKeyStore()
  const key = await keystore.generate(
    'RSA',
    2048,
    {
      alg: 'RS256', use: 'sig',
    },
  )
  const privateKey = key.toPEM(true)
  const publicKey = key.toPEM()

  fs.writeFileSync(
    PRIVATE_KEY_FILE,
    privateKey,
  )
  fs.writeFileSync(
    PUBLIC_KEY_FILE,
    publicKey,
  )

  const sessionSecret = crypto.randomBytes(20).toString('hex')

  exec(
    `
      wrangler kv key put jwtPrivateSecret --path=${PRIVATE_KEY_FILE} --binding=KV ${isProd ? '' : '--local'} \
      && wrangler kv key put jwtPublicSecret --path=${PUBLIC_KEY_FILE} --binding=KV ${isProd ? '' : '--local'} \
      && wrangler kv key put sessionSecret ${sessionSecret} --binding=KV ${isProd ? '' : '--local'}
    `,
    (
      error, stdout, stderr,
    ) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`)
        return
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    },
  )
}

generateRSAKeyPair().catch(console.error)
