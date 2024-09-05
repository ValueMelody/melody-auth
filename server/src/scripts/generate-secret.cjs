const fs = require('fs')
const { exec } = require('child_process')
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
    fs.writeFileSync(
      NODE_PUBLIC_KEY_FILE,
      pemPublicKey,
    )
    fs.writeFileSync(
      NODE_PRIVATE_KEY_FILE,
      pemPrivateKey,
    )
    fs.writeFileSync(
      NODE_SESSION_SECRET_FILE,
      sessionSecret,
    )
    console.info('Secrets generated for node env')
  } else {
    fs.writeFileSync(
      PUBLIC_KEY_FILE,
      pemPublicKey,
    )
    fs.writeFileSync(
      PRIVATE_KEY_FILE,
      pemPrivateKey,
    )
  }

  if (!isNode) {
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
}

generateRSAKeyPair().catch(console.error)
